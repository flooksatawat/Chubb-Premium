import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { spawn } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import test from "node:test";
import { AccessStore } from "../lib/access-store.mjs";

test("serves the legacy-compatible access contract", async (context) => {
  const dir = mkdtempSync(join(tmpdir(), "chubb-api-"));
  const database = join(dir, "access.sqlite");
  const store = new AccessStore(database);
  store.importSnapshot({ users: [{ line_user_id: "U-active", display_name: "Active", status: "active" }], admins: [] });
  store.close();
  const port = 32000 + Math.floor(Math.random() * 1000);
  const secret = "test-approval-secret";
  const child = spawn(process.execPath, [resolve("server.mjs")], { env: { ...process.env, PORT: String(port), PUBLIC_DIR: resolve("dist/client"), CHUBB_ACCESS_DB: database, CHUBB_PUBLIC_URL: `http://127.0.0.1:${port}`, CHUBB_APPROVAL_SECRET: secret, CHUBB_ADMIN_KEY: "test-admin", CHUBB_MIGRATION_TOKEN: "test-migration" }, stdio: ["ignore", "pipe", "pipe"] });
  context.after(() => { child.kill("SIGTERM"); rmSync(dir, { recursive: true, force: true }); });
  await new Promise((resolveReady, reject) => {
    const timer = setTimeout(() => reject(new Error("server_start_timeout")), 5000);
    child.stdout.on("data", (chunk) => { if (String(chunk).includes("listening")) { clearTimeout(timer); resolveReady(); } });
    child.once("exit", (code) => reject(new Error(`server_exited_${code}`)));
  });
  const base = `http://127.0.0.1:${port}`;
  assert.equal((await (await fetch(`${base}/api/health`)).json()).status, "ok");
  const active = await (await fetch(`${base}/api/access?action=check&userId=U-active`)).json();
  assert.equal(active.authorized, true);
  const request = await (await fetch(`${base}/api/access?action=request&userId=U-new&displayName=New`)).json();
  assert.equal(request.status, "pending");
  const expires = Math.floor(Date.now() / 1000) + 300;
  const sig = createHmac("sha256", secret).update(`U-new\napprove\n${expires}`).digest("hex");
  assert.equal((await fetch(`${base}/api/access?action=approve&userId=U-new&expires=${expires}&sig=${sig}`)).status, 200);
  const approved = await (await fetch(`${base}/api/access?action=check&userId=U-new`)).json();
  assert.equal(approved.authorized, true);
  assert.equal((await fetch(`${base}/api/access`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "remove", userId: "U-new", key: "wrong" }) })).status, 403);
  const parity = await (await fetch(`${base}/api/admin/parity`, { headers: { authorization: "Bearer test-migration" } })).json();
  assert.equal(parity.users.total, 2);
});
