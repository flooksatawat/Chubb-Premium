import assert from "node:assert/strict";
import { copyFileSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { AccessStore } from "../lib/access-store.mjs";

test("imports legacy states and preserves active access", () => {
  const dir = mkdtempSync(join(tmpdir(), "chubb-access-"));
  const store = new AccessStore(join(dir, "access.sqlite"));
  const parity = store.importSnapshot({
    users: [
      { line_user_id: "U-active", display_name: "Active", status: "active", added_date: "2026-01-01" },
      { line_user_id: "U-pending", display_name: "Pending", status: "pending", added_date: "2026-01-02" },
      { line_user_id: "U-inactive", display_name: "Inactive", status: "inactive", added_date: "2026-01-03" },
    ],
    admins: [{ line_user_id: "U-admin", display_name: "Admin", status: "active" }],
  });
  assert.deepEqual({ total: parity.users.total, active: parity.users.active, inactive: parity.users.inactive, pending: parity.users.pending }, { total: 3, active: 1, inactive: 1, pending: 1 });
  assert.equal(store.getUser("U-active").status, "active");
  assert.equal(store.requestAccess("U-active", "Renamed").status, "active");
  assert.equal(store.requestAccess("U-inactive", "Retry").status, "pending");
  assert.equal(store.setUserStatus("U-pending", "active", "test").status, "active");
  const backup = store.backup("test");
  assert.ok(backup);
  store.close();
  const restoredPath = join(dir, "restored.sqlite");
  copyFileSync(backup, restoredPath);
  const restored = new AccessStore(restoredPath);
  assert.equal(restored.getUser("U-active").status, "active");
  assert.equal(restored.parity().users.total, 3);
  restored.close();
  rmSync(dir, { recursive: true, force: true });
});

test("rejects duplicate legacy identities", () => {
  const dir = mkdtempSync(join(tmpdir(), "chubb-access-"));
  const store = new AccessStore(join(dir, "access.sqlite"));
  assert.throws(() => store.importSnapshot({ users: [{ line_user_id: "U1" }, { line_user_id: "U1" }], admins: [] }), /duplicate_user_id/);
  store.close();
  rmSync(dir, { recursive: true, force: true });
});
