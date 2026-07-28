# Chubb Premium VPS Operations

The canonical working copy is `/workspaces/Chubb-Premium` on the Codex VPS.
Use the `chubb-premium-ops` skill for every data, calculator, UI, build, GitHub,
or GPT Sites change.

Before completing a change, run:

```bash
/opt/data/.local/bin/chubb-premium-ops verify
```

For an explicitly authorized production request, review and commit the exact
files, then run:

```bash
/opt/data/.local/bin/chubb-premium-ops release
```

Do not use `hermes-codex-deploy`; it targets a different Hostinger test site.
Never print or persist Sites credentials, OpenAI tokens, or Telegram tokens.
