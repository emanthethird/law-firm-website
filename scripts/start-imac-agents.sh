#!/bin/bash
# Start an always-on Claude Code Remote Control server on this Mac.
# Sessions live on this machine and are drivable from claude.ai/code,
# the Claude mobile app, or any browser. Run: ./scripts/start-imac-agents.sh
set -euo pipefail

REPO_DIR="$(cd "$(dirname "$0")/.." && pwd)"
SESSION_PREFIX="${CLAUDE_AGENTS_PREFIX:-imac}"
TMUX_NAME="agents"

if ! command -v claude >/dev/null 2>&1; then
  echo "Claude Code is not installed. Install it first:"
  echo "  curl -fsSL https://claude.ai/install.sh | bash"
  exit 1
fi

if ! command -v tmux >/dev/null 2>&1; then
  echo "tmux not found — running the server in this window instead."
  echo "Keep this window open. Press Ctrl+C to stop the server."
  cd "$REPO_DIR"
  exec caffeinate -dims claude remote-control \
    --remote-control-session-name-prefix "$SESSION_PREFIX" \
    --spawn worktree
fi

if tmux has-session -t "$TMUX_NAME" 2>/dev/null; then
  echo "Server already running in tmux session '$TMUX_NAME'."
  echo "View it with: tmux attach -t $TMUX_NAME"
  exit 0
fi

tmux new-session -d -s "$TMUX_NAME" \
  "cd '$REPO_DIR' && caffeinate -dims claude remote-control \
    --remote-control-session-name-prefix '$SESSION_PREFIX' \
    --spawn worktree"

echo "Remote Control server started in tmux session '$TMUX_NAME'."
echo
echo "  Watch it / get the QR code:  tmux attach -t $TMUX_NAME   (detach: Ctrl-b then d)"
echo "  Connect from anywhere:       https://claude.ai/code  (sessions named '$SESSION_PREFIX-...')"
echo "  Stop the server:             tmux kill-session -t $TMUX_NAME"
