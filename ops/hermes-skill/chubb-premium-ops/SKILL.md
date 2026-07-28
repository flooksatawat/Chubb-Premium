---
name: chubb-premium-ops
description: Operate the Chubb Premium website from Hermes on the Codex VPS. Use when a Telegram request asks to add or edit Chubb Premium product data, rates, cash values, commissions, UI, calculator logic, tests, GitHub source, builds, or to publish/deploy https://chubb-premium.flooksatawat.chatgpt.site immediately.
---

# Chubb Premium Operations

## Fixed Targets

- Canonical VPS workspace: `/workspaces/Chubb-Premium`
- GitHub: `flooksatawat/Chubb-Premium`, branch `main`
- Production: `https://chubb-premium.flooksatawat.chatgpt.site`
- Sites project: read the opaque `project_id` from `.openai/hosting.json`
- Operator command: `/opt/data/.local/bin/chubb-premium-ops`

Never substitute another repo, branch, Sites project, or URL. Never paste
credentials, tokens, device codes, or raw connector output into Telegram.

## Interpret Telegram Requests

Treat these words as explicit authorization to publish after verification:
`deploy`, `publish`, `ขึ้นเว็บ`, `อัปเดตเว็บ`, `แก้ทันที`, or `ใช้งานจริง`.
Keep the site's existing access mode and do not ask for a second confirmation.

When a request asks only to prepare, preview, check, or summarize, stop after
verification and do not commit, push, or deploy.

Ask one concise question before proceeding when:

- the requested value, product, year, age, gender, or source table is ambiguous;
- the request deletes data or changes access controls;
- the destination is not the fixed Chubb Premium project;
- a required source is behind company VPN and the VPS cannot access it;
- the change touches `apps-script/Code.gs`, which needs a separate Apps Script
  deployment and is not published by GPT Sites.

## Standard Workflow

1. Run `chubb-premium-ops status`. Confirm the fixed workspace, `main`, Sites
   availability, and current repository state are reported.
2. If the workspace is clean, run `chubb-premium-ops sync`. If it is dirty,
   inspect and preserve the existing work before continuing.
3. Read the current implementation and the relevant product/rate data. For the
   data layout, read [references/data-map.md](references/data-map.md).
4. Make the smallest complete edit. Use a JSON parser for JSON changes and
   preserve the existing schema, key order, numeric precision, and encoding.
5. Run `chubb-premium-ops verify`. Completion requires valid JSON, JavaScript
   syntax, exactly `1008/1008` 24TX parity, a successful build, and
   `dist/client/index.html`.
6. Review `git diff --check`, `git diff --stat`, and the full relevant diff.
   Confirm every changed file belongs to the Telegram request and no secret is
   present.
7. For a prepare-only request, report the changed files and verification result,
   then stop.
8. For an explicitly authorized publish request, stage only the reviewed files,
   commit with a concise message, then run `chubb-premium-ops release`.
9. Report the user-visible changes, `1008/1008`, the short commit, and the fixed
   production URL. Do not include connector traces or credentials.

`release` is the only production path. It verifies again, requires a clean
committed `main`, pushes GitHub, pushes the exact same commit to Sites source,
reuses an existing version for the exact commit on retries or saves one new
version, deploys it, and records only a sanitized audit result on the VPS.

## Data And Logic Rules

- Treat `data/product/*.json` as the product-rule source for benefits and
  descriptions.
- Treat `data/rates/*.json` as premium/rider rate tables.
- Treat `data/cv/*.json`, `data/com/*.json`, and `data/MF/*.json` as their
  corresponding structured datasets.
- Keep UI/calculator behavior consistent across `js/ui.js`,
  `js/calculator.js`, and `js/compare.js`.
- For a death-benefit or sum-assured schedule, update every rendering and
  comparison location. Use `$chubb-premium-calculator` for plan-specific
  formulas.
- Keep 24TX death benefit equal to
  `MAX(SA x scheduled percentage, CV, cumulative premium - cumulative cashback)`.
  Do not apply a `1.05` multiplier to the 24TX premium floor.

## Add Or Edit Data

For a structured data request:

1. Identify the exact dataset and existing row/object shape.
2. Validate the supplied source and units. Never infer an insurance rate from a
   nearby row.
3. Add or update only the requested records.
4. Search for duplicate keys, overlapping age bands, missing genders, and
   non-monotonic year schedules where applicable.
5. Run the standard verification workflow.

For a UI or calculator request:

1. Trace every consumer of the changed value.
2. Update single-plan and comparison views together.
3. Add or extend a regression test when behavior changes.
4. Run the standard verification workflow.

## Failure Handling

- On merge divergence, dirty unrelated work, failing tests, invalid data, or a
  failed build: stop before push/deploy and report the exact safe blocker.
- On Sites authentication failure or `project not found`: stop and request
  owner-account login on the VPS. Do not retry with another account.
- On deployment failure after GitHub push: keep the commit, report that GitHub
  succeeded and production did not, and include no raw connector response.
- Never reset, force-push GitHub, discard user changes, or delete production
  data.

## Telegram Examples

Read [references/telegram-commands.md](references/telegram-commands.md) when the
user asks how to phrase Hermes commands or when converting a loose request into
an executable workflow.
