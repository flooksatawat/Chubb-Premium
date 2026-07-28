#!/usr/bin/env bash
set -euo pipefail

readonly REPO="/workspaces/Chubb-Premium"
readonly SOURCE="$REPO/ops/hermes-skill/chubb-premium-ops"
readonly TARGET_ROOT="/opt/data/skills/productivity"
readonly TARGET="$TARGET_ROOT/chubb-premium-ops"
readonly CALCULATOR_OVERRIDE="$REPO/ops/hermes-skill-overrides/chubb-premium-calculator/SKILL.md"
readonly CALCULATOR_TARGET="$TARGET_ROOT/chubb-premium-calculator/SKILL.md"
readonly BIN_DIR="/opt/data/.local/bin"
readonly LOG_DIR="/opt/data/logs/chubb-premium-ops"
readonly RUNTIME_UID="$(stat -c %u /opt/data)"
readonly RUNTIME_GID="$(stat -c %g /opt/data)"

[[ -f "$SOURCE/SKILL.md" ]] || {
  printf 'Missing skill source: %s\n' "$SOURCE" >&2
  exit 1
}
[[ -f "$CALCULATOR_OVERRIDE" ]] || {
  printf 'Missing calculator skill override\n' >&2
  exit 1
}

mkdir -p "$TARGET" "$(dirname "$CALCULATOR_TARGET")" "$BIN_DIR" "$LOG_DIR"
cp -R "$SOURCE/." "$TARGET/"
cp "$CALCULATOR_OVERRIDE" "$CALCULATOR_TARGET"
chmod +x "$TARGET/scripts/chubb-premium-ops.sh"
ln -sfn "$TARGET/scripts/chubb-premium-ops.sh" "$BIN_DIR/chubb-premium-ops"
chown -R "$RUNTIME_UID:$RUNTIME_GID" "$TARGET" "$LOG_DIR"
chown "$RUNTIME_UID:$RUNTIME_GID" "$CALCULATOR_TARGET"
chown -h "$RUNTIME_UID:$RUNTIME_GID" "$BIN_DIR/chubb-premium-ops"
chown -R "$RUNTIME_UID:$RUNTIME_GID" /opt/data/.codex

for build_path in "$REPO/public" "$REPO/dist"; do
  if [[ -e "$build_path" ]]; then
    chown -R "$RUNTIME_UID:$RUNTIME_GID" "$build_path"
    chmod -R u+rwX,g+rwX,o-rwx "$build_path"
  fi
done

cmp -s "$SOURCE/SKILL.md" "$TARGET/SKILL.md"
cmp -s "$CALCULATOR_OVERRIDE" "$CALCULATOR_TARGET"

printf 'Hermes skill installed: %s\n' "$TARGET"
printf 'Operator installed: %s/chubb-premium-ops\n' "$BIN_DIR"
