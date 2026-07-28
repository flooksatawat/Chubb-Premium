#!/usr/bin/env bash
set -euo pipefail

readonly REPO="/workspaces/Chubb-Premium"
readonly SOURCE="$REPO/ops/hermes-skill/chubb-premium-ops"
readonly TARGET_ROOT="/opt/data/skills/productivity"
readonly TARGET="$TARGET_ROOT/chubb-premium-ops"
readonly CALCULATOR_OVERRIDE="$REPO/ops/hermes-skill-overrides/chubb-premium-calculator/SKILL.md"
readonly CALCULATOR_TARGET="$TARGET_ROOT/chubb-premium-calculator/SKILL.md"
readonly BIN_DIR="/opt/data/.local/bin"

[[ -f "$SOURCE/SKILL.md" ]] || {
  printf 'Missing skill source: %s\n' "$SOURCE" >&2
  exit 1
}
[[ -f "$CALCULATOR_OVERRIDE" ]] || {
  printf 'Missing calculator skill override\n' >&2
  exit 1
}

mkdir -p "$TARGET" "$(dirname "$CALCULATOR_TARGET")" "$BIN_DIR"
cp -R "$SOURCE/." "$TARGET/"
cp "$CALCULATOR_OVERRIDE" "$CALCULATOR_TARGET"
chmod +x "$TARGET/scripts/chubb-premium-ops.sh"
ln -sfn "$TARGET/scripts/chubb-premium-ops.sh" "$BIN_DIR/chubb-premium-ops"

cmp -s "$SOURCE/SKILL.md" "$TARGET/SKILL.md"
cmp -s "$CALCULATOR_OVERRIDE" "$CALCULATOR_TARGET"

printf 'Hermes skill installed: %s\n' "$TARGET"
printf 'Operator installed: %s/chubb-premium-ops\n' "$BIN_DIR"
