#!/usr/bin/env bash
# Curry Leaves desktop launcher - thin Electron shell.
#
# The Python backend + shared web UI live in the sibling `curry-leaves-assistant`
# repo. This script makes sure that repo's backend venv is set up (idempotent),
# installs this shell's node deps, then starts Electron (which spawns the backend).
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ASSISTANT_DIR="${CURRY_LEAVES_ASSISTANT_DIR:-$ROOT/../curry-leaves-assistant}"

echo ">> Curry Leaves (desktop)"

if [ ! -d "$ASSISTANT_DIR" ]; then
  echo "x Backend repo not found at $ASSISTANT_DIR" >&2
  echo "  Clone curry-leaves-assistant next to this repo, or set CURRY_LEAVES_ASSISTANT_DIR." >&2
  exit 1
fi

# -- Backend venv (delegated to the assistant repo's setup helpers) ------------
echo ">> ensuring backend venv in $ASSISTANT_DIR..."
(
  cd "$ASSISTANT_DIR"
  ROOT="$ASSISTANT_DIR"
  PKGDIR="$ASSISTANT_DIR/src/curry_leaves_assistant"
  VENV="$ASSISTANT_DIR/.venv"
  KERNEL_CHECKOUT="${CURRY_LEAVES_KERNEL_DIR:-$ASSISTANT_DIR/../curry-leaves-py}"
  MEMORY_CHECKOUT="${CURRY_LEAVES_MEMORY_DIR:-$ASSISTANT_DIR/../curry-leaves-memory}"
  # shellcheck source=/dev/null
  source "$ASSISTANT_DIR/scripts/_setup.sh"
  cl_setup_python
  cl_provider_hint
)

# -- This shell's node deps + Electron launch ----------------------------------
export CURRY_LEAVES_ASSISTANT_DIR="$ASSISTANT_DIR"
cd "$ROOT"
if [ ! -d node_modules ]; then
  echo ">> installing desktop node deps..."
  npm install
fi

# Kill any stale Electron from a prior run.
pkill -f "$ROOT/node_modules/.bin/electron" 2>/dev/null || true

echo ">> starting Curry Leaves..."
exec npm start
