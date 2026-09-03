import { createHmac, timingSafeEqual } from "node:crypto";
import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize, resolve } from "node:path";
import { AccessStore } from "./lib/access-store.mjs";

const port = Number(process.env.PORT || 3000);
const publicDirectory = resolve(process.env.PUBLIC_DIR || "dist/client");
const databasePath = process.env.CHUBB_ACCESS_DB || "/data/chubb-access.sqlite";
const publicUrl = String(process.env.CHUBB_PUBLIC_URL || "").replace(/\/$/, "");
const approvalSecret = String(process.env.CHUBB_APPROVAL_SECRET || "");
const adminKey = String(process.env.CHUBB_ADMIN_KEY || "");
const migrationToken = String(process.env.CHUBB_MIGRATION_TOKEN || "");
const telegramToken = String(process.env.TELEGRAM_BOT_TOKEN || "");
const telegramChatId = String(process.env.TELEGRAM_CHAT_ID || "");
const lineToken = String(process.env.LINE_CHANNEL_ACCESS_TOKEN || "");
const store = new AccessStore(databasePath);
store.backup("startup");

const mime = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".json": "application/json; charset=utf-8", ".png": "image/png", ".ico": "image/x-icon", ".webmanifest": "application/manifest+json", ".pdf": "application/pdf", ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" };

function json(response, status, body) {
  response.writeHead(status, { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", "x-content-type-options": "nosniff" });
  response.end(JSON.stringify(body));
}

function safeEqual(left, right) {
  const a = Buffer.from(String(left));
  const b = Buffer.from(String(right));
  return a.length === b.length && timingSafeEqual(a, b);
}

function signature(userId, action, expires) {
  return createHmac("sha256", approvalSecret).update(`${userId}\n${action}\n${expires}`).digest("hex");
}

function signedActionUrl(userId, action) {
  const expires = Math.floor(Date.now() / 1000) + 86400;
  const sig = signature(userId, action, expires);
  return `${publicUrl}/api/access?action=${action}&userId=${encodeURIComponent(userId)}&expires=${expires}&sig=${sig}`;
}

function validApproval(url) {
  if (!approvalSecret) return false;
  const userId = url.searchParams.get("userId") || "";
  const action = url.searchParams.get("action") || "";
  const expires = Number(url.searchParams.get("expires") || 0);
  const supplied = url.searchParams.get("sig") || "";
  return expires >= Math.floor(Date.now() / 1000) && safeEqual(supplied, signature(userId, action, expires));
}

async function telegram(text, replyMarkup) {
  if (!telegramToken || !telegramChatId) return { ok: false, skipped: true };
  const response = await fetch(`https://api.telegram.org/bot${telegramToken}/sendMessage`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ chat_id: telegramChatId, text, reply_markup: replyMarkup, disable_web_page_preview: true }) });
  return { ok: response.ok, statusCode: response.status };
}

async function notifyAdmin(user) {
  const keyboard = approvalSecret && publicUrl ? { inline_keyboard: [[{ text: "✅ อนุมัติ", url: signedActionUrl(user.lineUserId, "approve") }, { text: "❌ ปฏิเสธ", url: signedActionUrl(user.lineUserId, "reject") }]] } : undefined;
  return telegram(`คำขอใช้งานใหม่ — Chubb Premium\nชื่อ: ${user.displayName || "ไม่ทราบชื่อ"}\nเวลา: ${new Date().toLocaleString("th-TH", { timeZone: "Asia/Bangkok" })}`, keyboard);
}

async function notifyAuthorizedAccess(user, source, device) {
  return telegram(`มีผู้เข้าใช้งาน — Chubb Premium\nชื่อ: ${user.displayName || "ไม่ทราบชื่อ"}\nเวลา: ${new Date().toLocaleString("th-TH", { timeZone: "Asia/Bangkok" })}\nช่องทาง: ${String(source || "-").slice(0, 80)}\nอุปกรณ์: ${String(device || "-").slice(0, 80)}`);
}

async function notifyUser(userId, message) {
  if (!lineToken) return { ok: false, skipped: true };
  const response = await fetch("https://api.line.me/v2/bot/message/push", { method: "POST", headers: { authorization: `Bearer ${lineToken}`, "content-type": "application/json" }, body: JSON.stringify({ to: userId, messages: [{ type: "text", text: message }] }) });
  return { ok: response.ok, statusCode: response.status };
}

async function bodyJson(request) {
  let raw = "";
  for await (const chunk of request) {
    raw += chunk;
    if (raw.length > 2_000_000) throw new Error("body_too_large");
  }
  return raw ? JSON.parse(raw) : {};
}

async function accessApi(request, response, url) {
  const input = request.method === "POST" ? await bodyJson(request) : Object.fromEntries(url.searchParams);
  const action = String(input.action || "check");
  const userId = String(input.userId || "").trim();
  if (action === "check") {
    const user = store.getUser(userId);
    let accessNotification;
    if (user?.status === "active" && String(input.notifyAccess || "") === "1") {
      accessNotification = store.shouldNotifyAccess(userId) ? (await notifyAuthorizedAccess(user, input.source, input.device)).ok ? "sent" : "failed" : "deduplicated";
    }
    return json(response, 200, user ? { ok: true, authorized: user.status === "active", status: user.status, displayName: user.displayName, ...(accessNotification ? { accessNotification } : {}) } : { ok: true, authorized: false, status: userId ? "not_found" : "no_id" });
  }
  if (action === "request") {
    const user = store.requestAccess(userId, input.displayName);
    if (user.status === "active") return json(response, 200, { ok: true, status: "active", authorized: true });
    const delivery = await notifyAdmin(user);
    return json(response, 200, { ok: true, status: "pending", authorized: false, adminNotification: { sent: delivery.ok ? 1 : 0, failed: delivery.ok ? 0 : 1 } });
  }
  if (action === "approve" || action === "reject") {
    if (!validApproval(url)) return json(response, 403, { ok: false, error: "unauthorized" });
    const user = store.setUserStatus(userId, action === "approve" ? "active" : "inactive", "signed-link");
    if (!user) return json(response, 404, { ok: false, error: "not_found" });
    await notifyUser(userId, action === "approve" ? "✅ คำขอของคุณได้รับการอนุมัติแล้ว กลับไปที่แอปเพื่อเข้าใช้งานได้เลยครับ" : "❌ ขออภัย คำขอของคุณถูกปฏิเสธ หากมีข้อสงสัยกรุณาติดต่อผู้ดูแลระบบ");
    response.writeHead(200, { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" });
    return response.end("<!doctype html><meta charset=utf-8><title>Chubb Premium</title><body style='font-family:sans-serif;text-align:center;padding:40px'><h2>✅ ดำเนินการสำเร็จ</h2></body>");
  }
  if (action === "add" || action === "remove") {
    if (!adminKey || !safeEqual(input.key || "", adminKey)) return json(response, 403, { ok: false, error: "unauthorized" });
    const user = action === "add" ? store.addUser(userId, input.displayName, "admin-api") : store.setUserStatus(userId, "inactive", "admin-api");
    return json(response, user ? 200 : 404, user ? { ok: true, action: action === "add" ? "updated" : "deactivated" } : { ok: false, reason: "not_found" });
  }
  return json(response, 400, { ok: false, error: "unknown_action" });
}

async function adminApi(request, response, url) {
  const supplied = String(request.headers.authorization || "").replace(/^Bearer\s+/i, "");
  if (!migrationToken || !safeEqual(supplied, migrationToken)) return json(response, 403, { ok: false, error: "unauthorized" });
  if (url.pathname === "/api/admin/parity" && request.method === "GET") return json(response, 200, { ok: true, ...store.parity() });
  if (url.pathname === "/api/admin/import" && request.method === "POST") {
    const snapshot = await bodyJson(request);
    return json(response, 200, { ok: true, ...store.importSnapshot(snapshot, "migration-api") });
  }
  return json(response, 404, { ok: false, error: "not_found" });
}

function staticFile(request, response, url) {
  const requested = url.pathname === "/" ? "/index.html" : url.pathname;
  const file = normalize(join(publicDirectory, decodeURIComponent(requested)));
  if (!file.startsWith(`${publicDirectory}/`) || !existsSync(file) || !statSync(file).isFile()) return json(response, 404, { ok: false, error: "not_found" });
  response.writeHead(200, { "content-type": mime[extname(file).toLowerCase()] || "application/octet-stream", "x-content-type-options": "nosniff" });
  if (request.method === "HEAD") return response.end();
  createReadStream(file).pipe(response);
}

const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url || "/", `http://${request.headers.host || "localhost"}`);
    if (url.pathname === "/api/health") return json(response, 200, { status: "ok", database: "ok" });
    if (url.pathname === "/api/access") return await accessApi(request, response, url);
    if (url.pathname.startsWith("/api/admin/")) return await adminApi(request, response, url);
    return staticFile(request, response, url);
  } catch (error) {
    console.error("request_failed", error instanceof Error ? error.message : "unknown");
    return json(response, 500, { ok: false, error: "internal_error" });
  }
});

server.listen(port, "0.0.0.0", () => console.log(`chubb-premium listening on ${port}`));

function shutdown() {
  server.close(() => { store.backup("shutdown"); store.close(); process.exit(0); });
}
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
