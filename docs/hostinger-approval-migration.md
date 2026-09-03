# Hostinger approval migration

## Inventory and impact baseline

- Current public site: `https://chubb-premium.flooksatawat.chatgpt.site`
- Current approval backend: Google Apps Script backed by the read-only source Google Sheet.
- Source `users`: 277 unique LINE identities (267 active, 1 inactive, 9 pending).
- Source `admins`: 2 unique LINE identities (2 active).
- The source Sheet is immutable during this migration. No source row is edited or deleted.

## Compatibility contract

The Hostinger API preserves the existing `check`, `request`, `approve`, `reject`, `add`, and `remove` action semantics. Existing active LINE user IDs are imported with their original status, so they do not request access again.

## Cutover and rollback

1. Save protected CSV exports and checksums outside Git.
2. Import into a shadow SQLite volume without deleting target rows.
3. Compare total/status counts and identity/status checksums.
4. Test build, API states, request/approval flow, notifications, TLS, and live UI.
5. Cut over only after parity succeeds.
6. Roll back by restoring the previous Coolify image/SHA and the pre-change SQLite backup, or by routing users back to the unchanged GPT Sites + Apps Script deployment.

The runtime checkpoints SQLite before every mutation and keeps the latest 30 local database backups. Production also requires an external VPS/volume backup and a restore test before cutover.
