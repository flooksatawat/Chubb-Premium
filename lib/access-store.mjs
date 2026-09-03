import Database from "better-sqlite3";
import { createHash, randomUUID } from "node:crypto";
import { copyFileSync, existsSync, mkdirSync, readdirSync, rmSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

const allowedStatuses = new Set(["active", "inactive", "pending"]);

function clean(value) {
  return String(value ?? "").trim();
}

function statusOf(value) {
  const status = clean(value).toLowerCase();
  return allowedStatuses.has(status) ? status : "pending";
}

function checksum(rows) {
  return createHash("sha256")
    .update(rows.map((row) => `${row.lineUserId}\u0000${row.status}`).sort().join("\n"))
    .digest("hex");
}

export class AccessStore {
  constructor(filename, options = {}) {
    this.filename = resolve(filename);
    this.backupDirectory = resolve(options.backupDirectory ?? join(dirname(this.filename), "backups"));
    mkdirSync(dirname(this.filename), { recursive: true, mode: 0o700 });
    mkdirSync(this.backupDirectory, { recursive: true, mode: 0o700 });
    this.db = new Database(this.filename);
    this.db.pragma("journal_mode = WAL");
    this.db.pragma("foreign_keys = ON");
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        line_user_id TEXT PRIMARY KEY,
        display_name TEXT NOT NULL DEFAULT '',
        status TEXT NOT NULL CHECK (status IN ('active','inactive','pending')),
        added_date TEXT NOT NULL DEFAULT '',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS admins (
        line_user_id TEXT PRIMARY KEY,
        display_name TEXT NOT NULL DEFAULT '',
        status TEXT NOT NULL CHECK (status IN ('active','inactive','pending')),
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS audit_log (
        id TEXT PRIMARY KEY,
        action TEXT NOT NULL,
        subject_id TEXT NOT NULL DEFAULT '',
        actor TEXT NOT NULL DEFAULT '',
        detail TEXT NOT NULL DEFAULT '{}',
        created_at TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS access_notifications (
        line_user_id TEXT PRIMARY KEY,
        notified_at INTEGER NOT NULL
      );
    `);
  }

  close() {
    this.db.close();
  }

  backup(label = "manual") {
    if (!existsSync(this.filename)) return null;
    this.db.pragma("wal_checkpoint(TRUNCATE)");
    const safeLabel = clean(label).replace(/[^a-z0-9_-]/gi, "-").slice(0, 40) || "backup";
    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    const destination = join(this.backupDirectory, `${stamp}-${safeLabel}.sqlite`);
    copyFileSync(this.filename, destination, 0);
    const files = readdirSync(this.backupDirectory).filter((name) => name.endsWith(".sqlite")).sort().reverse();
    for (const stale of files.slice(30)) rmSync(join(this.backupDirectory, stale));
    return destination;
  }

  importSnapshot(snapshot, actor = "migration") {
    const users = (snapshot.users ?? []).map((row) => ({
      lineUserId: clean(row.line_user_id ?? row.lineUserId),
      displayName: clean(row.display_name ?? row.displayName),
      status: statusOf(row.status),
      addedDate: clean(row.added_date ?? row.addedDate),
    })).filter((row) => row.lineUserId);
    const admins = (snapshot.admins ?? []).map((row) => ({
      lineUserId: clean(row.line_user_id ?? row.lineUserId),
      displayName: clean(row.display_name ?? row.displayName),
      status: statusOf(row.status),
    })).filter((row) => row.lineUserId);
    if (new Set(users.map((row) => row.lineUserId)).size !== users.length) throw new Error("duplicate_user_id");
    if (new Set(admins.map((row) => row.lineUserId)).size !== admins.length) throw new Error("duplicate_admin_id");
    this.backup("before-import");
    const now = new Date().toISOString();
    const upsertUser = this.db.prepare(`
      INSERT INTO users (line_user_id, display_name, status, added_date, created_at, updated_at)
      VALUES (@lineUserId, @displayName, @status, @addedDate, @now, @now)
      ON CONFLICT(line_user_id) DO UPDATE SET
        display_name=excluded.display_name, status=excluded.status,
        added_date=excluded.added_date, updated_at=excluded.updated_at
    `);
    const upsertAdmin = this.db.prepare(`
      INSERT INTO admins (line_user_id, display_name, status, created_at, updated_at)
      VALUES (@lineUserId, @displayName, @status, @now, @now)
      ON CONFLICT(line_user_id) DO UPDATE SET
        display_name=excluded.display_name, status=excluded.status, updated_at=excluded.updated_at
    `);
    this.db.transaction(() => {
      for (const row of users) upsertUser.run({ ...row, now });
      for (const row of admins) upsertAdmin.run({ ...row, now });
      this.audit("access.imported", "", actor, { users: users.length, admins: admins.length });
    })();
    return this.parity();
  }

  parity() {
    const users = this.db.prepare("SELECT line_user_id AS lineUserId, status FROM users ORDER BY line_user_id").all();
    const admins = this.db.prepare("SELECT line_user_id AS lineUserId, status FROM admins ORDER BY line_user_id").all();
    const count = (rows, status) => rows.filter((row) => row.status === status).length;
    return {
      users: { total: users.length, active: count(users, "active"), inactive: count(users, "inactive"), pending: count(users, "pending"), checksum: checksum(users) },
      admins: { total: admins.length, active: count(admins, "active"), inactive: count(admins, "inactive"), pending: count(admins, "pending"), checksum: checksum(admins) },
    };
  }

  getUser(lineUserId) {
    return this.db.prepare("SELECT line_user_id AS lineUserId, display_name AS displayName, status FROM users WHERE line_user_id=?").get(clean(lineUserId)) ?? null;
  }

  requestAccess(lineUserId, displayName) {
    const id = clean(lineUserId);
    if (!id) throw new Error("no_user_id");
    const current = this.getUser(id);
    if (current?.status === "active") return current;
    this.backup("before-request");
    const now = new Date().toISOString();
    this.db.prepare(`
      INSERT INTO users (line_user_id, display_name, status, added_date, created_at, updated_at)
      VALUES (?, ?, 'pending', ?, ?, ?)
      ON CONFLICT(line_user_id) DO UPDATE SET
        display_name=CASE WHEN excluded.display_name='' THEN users.display_name ELSE excluded.display_name END,
        status='pending', updated_at=excluded.updated_at
    `).run(id, clean(displayName), now.slice(0, 10), now, now);
    this.audit("access.requested", id, `user:${id}`, {});
    return this.getUser(id);
  }

  setUserStatus(lineUserId, status, actor) {
    const id = clean(lineUserId);
    if (!id) throw new Error("no_user_id");
    const nextStatus = statusOf(status);
    if (!this.getUser(id)) return null;
    this.backup(`before-${nextStatus}`);
    this.db.prepare("UPDATE users SET status=?, updated_at=? WHERE line_user_id=?").run(nextStatus, new Date().toISOString(), id);
    this.audit(`access.${nextStatus}`, id, actor, {});
    return this.getUser(id);
  }

  shouldNotifyAccess(lineUserId, ttlSeconds = 1800) {
    const id = clean(lineUserId);
    const now = Math.floor(Date.now() / 1000);
    const last = this.db.prepare("SELECT notified_at AS notifiedAt FROM access_notifications WHERE line_user_id=?").get(id);
    if (last && now - last.notifiedAt < ttlSeconds) return false;
    this.db.prepare(`
      INSERT INTO access_notifications (line_user_id, notified_at) VALUES (?, ?)
      ON CONFLICT(line_user_id) DO UPDATE SET notified_at=excluded.notified_at
    `).run(id, now);
    return true;
  }

  addUser(lineUserId, displayName, actor) {
    const id = clean(lineUserId);
    if (!id) throw new Error("no_user_id");
    this.backup("before-add");
    const now = new Date().toISOString();
    this.db.prepare(`
      INSERT INTO users (line_user_id, display_name, status, added_date, created_at, updated_at)
      VALUES (?, ?, 'active', ?, ?, ?)
      ON CONFLICT(line_user_id) DO UPDATE SET display_name=excluded.display_name, status='active', updated_at=excluded.updated_at
    `).run(id, clean(displayName), now.slice(0, 10), now, now);
    this.audit("access.active", id, actor, { source: "admin_add" });
    return this.getUser(id);
  }

  audit(action, subjectId, actor, detail) {
    this.db.prepare("INSERT INTO audit_log (id, action, subject_id, actor, detail, created_at) VALUES (?, ?, ?, ?, ?, ?)")
      .run(randomUUID(), action, clean(subjectId), clean(actor), JSON.stringify(detail ?? {}), new Date().toISOString());
  }
}
