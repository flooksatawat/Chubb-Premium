#!/usr/bin/env bash
set -euo pipefail

readonly REPO="${CHUBB_PREMIUM_REPO:-/workspaces/Chubb-Premium}"
readonly SITE_URL="https://chubb-premium.flooksatawat.chatgpt.site"
readonly CODEX_BIN="${CODEX_BIN:-/opt/data/.local/bin/codex}"
readonly SKILL_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
readonly RESULT_EXTRACTOR="$SKILL_DIR/scripts/extract-codex-result.mjs"
readonly LOG_DIR="${CHUBB_OPS_LOG_DIR:-/opt/data/logs/chubb-premium-ops}"
readonly SITES_PACKAGER="/opt/data/.codex/plugins/cache/openai-bundled-sites/sites/0.1.31/scripts/package-site.sh"
RELEASE_RAW_OUTPUT=""

cleanup() {
  if [[ -n "$RELEASE_RAW_OUTPUT" ]]; then
    rm -f "$RELEASE_RAW_OUTPUT"
  fi
}
trap cleanup EXIT

fail() {
  printf 'ERROR: %s\n' "$*" >&2
  exit 1
}

require_repo() {
  [[ -d "$REPO/.git" ]] || fail "Chubb Premium workspace not found: $REPO"
  [[ -f "$REPO/.openai/hosting.json" ]] || fail "Sites metadata is missing"
  [[ "$(git -C "$REPO" branch --show-current)" == "main" ]] ||
    fail "Chubb Premium must be on branch main"

  node -e '
    const fs = require("node:fs");
    const p = process.argv[1];
    const value = JSON.parse(fs.readFileSync(p, "utf8"));
    if (typeof value.project_id !== "string" || !value.project_id.startsWith("appgprj_")) {
      process.exit(1);
    }
  ' "$REPO/.openai/hosting.json" || fail "Invalid Sites project metadata"
}

working_tree_is_clean() {
  [[ -z "$(git -C "$REPO" status --porcelain=v1 --untracked-files=all)" ]]
}

secret_scan() {
  local matches
  matches="$(
    git -C "$REPO" grep -I -n -E \
      'BEGIN (RSA|OPENSSH|EC) PRIVATE KEY|sk-proj-[A-Za-z0-9_-]{20,}|ghp_[A-Za-z0-9]{20,}|xox[baprs]-[A-Za-z0-9-]{20,}' \
      -- . ':!package-lock.json' 2>/dev/null || true
  )"
  [[ -z "$matches" ]] || fail "A tracked file appears to contain a secret"
}

validate_json() {
  node - "$REPO/data" <<'NODE'
const { readdirSync, readFileSync } = require("node:fs");
const { join } = require("node:path");

let count = 0;
function walk(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      walk(path);
    } else if (entry.isFile() && entry.name.endsWith(".json")) {
      const text = readFileSync(path, "utf8").replace(/^\uFEFF/, "");
      JSON.parse(text);
      count += 1;
    }
  }
}

walk(process.argv[2]);
console.log(`JSON files valid: ${count}`);
NODE
}

verify() {
  require_repo
  secret_scan
  git -C "$REPO" diff --check

  while IFS= read -r file; do
    node --check "$file"
  done < <(
    find "$REPO/js" "$REPO/scripts" "$REPO/tests" -type f \
      \( -name '*.js' -o -name '*.mjs' -o -name '*.cjs' \) -print
  )

  validate_json

  local test_output
  test_output="$(cd "$REPO" && npm test 2>&1)"
  printf '%s\n' "$test_output"
  grep -Eq '"?cases"?:[[:space:]]*1008' <<<"$test_output" ||
    fail "24TX test did not run all 1008 cases"
  grep -Eq '"?exact_matches"?:[[:space:]]*1008' <<<"$test_output" ||
    fail "24TX test did not pass 1008/1008"
  grep -Eq '"?exact_mismatches"?:[[:space:]]*0' <<<"$test_output" ||
    fail "24TX test reported a mismatch"

  (cd "$REPO" && npm run build)
  [[ -f "$REPO/dist/client/index.html" ]] ||
    fail "dist/client/index.html was not generated"
  [[ -f "$REPO/dist/server/index.js" ]] ||
    fail "dist/server/index.js was not generated"
  [[ -f "$REPO/dist/.openai/hosting.json" ]] ||
    fail "dist/.openai/hosting.json was not generated"

  printf 'VERIFY_OK cases=1008 exact_matches=1008 build=dist/client\n'
}

sync_repo() {
  require_repo
  working_tree_is_clean || fail "Workspace has uncommitted work; inspect it before sync"
  git -C "$REPO" fetch origin main
  git -C "$REPO" merge --ff-only origin/main
  printf 'SYNC_OK commit=%s\n' "$(git -C "$REPO" rev-parse --short HEAD)"
}

status() {
  require_repo
  local clean="no"
  working_tree_is_clean && clean="yes"
  printf 'repo=%s\n' "$REPO"
  printf 'branch=main\n'
  printf 'commit=%s\n' "$(git -C "$REPO" rev-parse --short HEAD)"
  printf 'clean=%s\n' "$clean"
  printf 'sites_plugin=%s\n' "$(
    [[ -f "$SITES_PACKAGER" ]] && printf 'ready' || printf 'missing'
  )"
  printf 'production=%s\n' "$SITE_URL"
}

release() {
  require_repo
  verify
  working_tree_is_clean ||
    fail "Commit the reviewed changes before release"
  [[ -x "$CODEX_BIN" ]] || fail "Codex CLI is unavailable"
  [[ -f "$SITES_PACKAGER" ]] || fail "Sites plugin is unavailable"

  git -C "$REPO" fetch origin main
  git -C "$REPO" merge-base --is-ancestor origin/main HEAD ||
    fail "Local main diverged from origin/main"

  local head origin_head
  head="$(git -C "$REPO" rev-parse HEAD)"
  origin_head="$(git -C "$REPO" rev-parse origin/main)"
  if [[ "$head" != "$origin_head" ]]; then
    git -C "$REPO" push origin main
  fi

  origin_head="$(
    git -C "$REPO" ls-remote origin refs/heads/main | cut -f1
  )"
  [[ "$head" == "$origin_head" ]] ||
    fail "GitHub main does not match the release commit"

  umask 077
  mkdir -p "$LOG_DIR"

  local safe_result prompt
  RELEASE_RAW_OUTPUT=$(
    mktemp "${TMPDIR:-/tmp}/chubb-premium-sites.XXXXXX"
  )

  prompt=$(
    cat <<EOF
The user explicitly authorized an immediate production deployment of the
existing public Chubb Premium site. Keep the current access mode and make no
access-control changes.

Use the installed Sites hosting skill and Sites connector. Work only in
$REPO and only with the project_id already stored in .openai/hosting.json.
The exact validated GitHub main commit is $head.

Perform this release:
1. Confirm the clean workspace HEAD is exactly $head.
2. Obtain a short-lived Sites source write credential. Never persist or print it.
3. Push the exact commit $head to the Sites source main branch using per-command
   authentication. If the Sites source branch differs, fetch it first and use a
   force-with-lease tied to its observed head; never force-push GitHub.
4. Package the already-built site with $SITES_PACKAGER.
5. Save exactly one new Sites version using commit_sha $head and that archive.
6. Deploy that saved version immediately with the existing public access mode.
   The Telegram request gives explicit publication approval, so do not
   ask for a second confirmation.
7. Poll until the deployment succeeds or fails. Do not open a browser.

Your final message must contain only this JSON shape and no other keys:
{"status":"succeeded","deployed_url":"$SITE_URL","version":INTEGER,"commit_sha":"$head"}
Never include credentials, tokens, connector traces, IDs other than the commit,
or raw tool output in the final message.
EOF
  )

  if ! HOME=/opt/data "$CODEX_BIN" \
    --dangerously-bypass-approvals-and-sandbox \
    -C "$REPO" exec --json "$prompt" >"$RELEASE_RAW_OUTPUT" 2>&1; then
    fail "Sites deployment failed; raw connector output was withheld"
  fi

  safe_result="$(
    node "$RESULT_EXTRACTOR" "$RELEASE_RAW_OUTPUT" "$head" "$SITE_URL"
  )" || fail "Sites deployment did not return a verified safe result"

  rm -f "$RELEASE_RAW_OUTPUT"
  RELEASE_RAW_OUTPUT=""
  printf '%s commit=%s result=%s\n' \
    "$(date -u +"%Y-%m-%dT%H:%M:%SZ")" "$head" "$safe_result" \
    >>"$LOG_DIR/releases.log"
  printf '%s\n' "$safe_result"
}

case "${1:-status}" in
  status)
    status
    ;;
  sync)
    sync_repo
    ;;
  verify)
    verify
    ;;
  release)
    release
    ;;
  *)
    fail "usage: chubb-premium-ops [status|sync|verify|release]"
    ;;
esac
