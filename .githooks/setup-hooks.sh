#!/bin/sh
# AgentDevFlow git hooks setup (Unix / macOS / Linux / Git Bash) — REQ-0136-008.
#
# Enables Delta Guard (pre-commit) and Impact Guard (pre-push) by pointing
# git's core.hooksPath at the repo-local .githooks directory. Idempotent.
#
# Usage:
#   ./setup-hooks.sh               # enable (default)
#   ./setup-hooks.sh disable
#   ./setup-hooks.sh status
#
# This script only touches core.hooksPath; it does not modify hook contents.

set -u

repo_root=$(git rev-parse --show-toplevel 2>/dev/null)
if [ -z "$repo_root" ]; then
  echo "setup-hooks: could not determine git repo root" >&2
  exit 1
fi

action=${1:-enable}

case "$action" in
  status)
    current=$(git config core.hooksPath 2>/dev/null | tr -d '[:space:]')
    if [ "$current" = ".githooks" ]; then
      echo "hooks: ENABLED (core.hooksPath=.githooks)"
    elif [ -n "$current" ]; then
      echo "hooks: custom core.hooksPath='$current' (not the default .githooks)"
    else
      echo "hooks: DISABLED (using git default .git/hooks)"
    fi
    ;;
  disable)
    git config --unset core.hooksPath 2>/dev/null || true
    echo "hooks: DISABLED (core.hooksPath unset; git will use .git/hooks)"
    ;;
  enable)
    if [ ! -f "$repo_root/.githooks/pre-commit" ]; then
      echo "setup-hooks: pre-commit hook not found at $repo_root/.githooks" >&2
      exit 1
    fi
    git config core.hooksPath .githooks
    echo "hooks: ENABLED (core.hooksPath=.githooks)"
    echo "  - pre-commit  : Delta Guard (REQ-0136-004)"
    echo "  - pre-push    : Impact Guard (REQ-0136-005)"
    echo "Bypass a single commit/push with: DEVFLOW_SKIP_HOOKS=1"
    ;;
  *)
    echo "usage: $0 [enable|disable|status]" >&2
    exit 2
    ;;
esac
