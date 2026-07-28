---
name: chubb-premium-calculator
description: Edit and verify the Chubb Premium insurance calculator, including sum assured, death benefits, premium rates, cash value, cashback, and comparison output. Use together with chubb-premium-ops for VPS verification and production deployment.
---

# Chubb Premium Calculator

Use this skill for calculator logic in `/workspaces/Chubb-Premium`. Use
`$chubb-premium-ops` for the complete edit, test, GitHub, and Sites release
workflow.

## Product Source

Read `data/product/` before changing plan logic. Product JSON contains benefit
schedules, cash-flow schedules, discount tiers, and descriptions. Relevant
reference files remain:

- `references/24tx-schedule.md`
- `references/24tx-excel-verification.md`

## Three-Location Rule

When a sum-assured or death-benefit schedule changes, update all three:

| File | Function/block | Value |
| --- | --- | --- |
| `js/ui.js` | `_computePlanRows()` | `effectiveSA` |
| `js/ui.js` | `generatePolicyTableData()` | `deathBenefit` |
| `js/compare.js` | `saAtYear()` | comparison return |

Missing one location makes the single-plan and comparison views disagree.

## 24TX Rule

Use:

```text
MAX(SA x scheduled percentage, CV, cumulative premium - cumulative cashback)
```

The 24TX premium floor uses cumulative premium directly. Do not multiply it by
`1.05`. The binding value changes across the policy term, so verify the full
`MAX()` result instead of only the SA percentage schedule.

## Verification And Release

Run:

```bash
/opt/data/.local/bin/chubb-premium-ops verify
```

Completion requires JavaScript syntax, valid JSON, exact 24TX parity
`1008/1008`, and a successful build to `dist/client/`.

For a Telegram request that explicitly says deploy/publish/ขึ้นเว็บ/แก้ทันที,
review and commit the exact files, then run:

```bash
/opt/data/.local/bin/chubb-premium-ops release
```

The Sites connector and owner ChatGPT account are configured on the Codex VPS.
Do not use `hermes-codex-deploy`; it publishes a different Hostinger test site.
Never print raw Sites connector output or credentials.
