#!/bin/bash
# One-time: seed the private-equity repo and migrate PE research out of this repo.
# Run on a machine with your GitHub credentials (iMac/MacBook):
#   ./scripts/setup-private-equity.sh
set -euo pipefail

PE_REPO_URL="${PE_REPO_URL:-https://github.com/emanthethird/private-equity.git}"
LAW_REPO_DIR="$(cd "$(dirname "$0")/.." && pwd)"
PE_DIR="$(dirname "$LAW_REPO_DIR")/private-equity"
RESEARCH_BRANCH="claude/pay-per-qualified-intro-research-vwfgtn"
RESEARCH_FILE="research/pay-per-qualified-intro-viability.md"

if [ ! -d "$PE_DIR/.git" ]; then
  git clone "$PE_REPO_URL" "$PE_DIR"
fi
cd "$PE_DIR"
git checkout -B main 2>/dev/null || git branch -M main

mkdir -p research outreach deals notes scripts

if [ ! -f README.md ] || ! grep -q "Private Equity" README.md 2>/dev/null; then
  cat > README.md <<'EOF'
# Private Equity

Deal origination, outreach, and research — kept separate from the law firm website.

| Folder | What goes here |
|---|---|
| `research/` | Market and model research (viability studies, pricing, competitors) |
| `outreach/` | Campaigns, sequences, mailbox/newsletter assets |
| `deals/` | Per-deal folders: targets, notes, diligence |
| `notes/` | Everything that doesn't fit above |
| `scripts/` | Automation, including the iMac agent server |

Start PE Claude Code sessions from THIS repo so work lands here, not in the website repo.
EOF
fi

for d in research outreach deals notes; do
  touch "$d/.gitkeep"
done

# Migrate the research file from the law-firm repo's branch
cd "$LAW_REPO_DIR"
git fetch origin "$RESEARCH_BRANCH" --quiet
git show "origin/$RESEARCH_BRANCH:$RESEARCH_FILE" > "$PE_DIR/$RESEARCH_FILE"

# PE flavor of the agent server script
sed -e 's/CLAUDE_AGENTS_PREFIX:-imac/CLAUDE_AGENTS_PREFIX:-imac-pe/' \
    -e 's/TMUX_NAME="agents"/TMUX_NAME="pe-agents"/' \
    "$LAW_REPO_DIR/scripts/start-imac-agents.sh" > "$PE_DIR/scripts/start-imac-agents.sh"
chmod +x "$PE_DIR/scripts/start-imac-agents.sh"

cd "$PE_DIR"
git add -A
if git diff --cached --quiet; then
  echo "Nothing new to commit — repo already seeded."
else
  git commit -m "Seed repo structure; migrate pay-per-qualified-intro research from law-firm-website"
  git push -u origin main
fi

echo
echo "Done. private-equity repo is at: $PE_DIR"
echo "To serve PE agent sessions from the iMac:  cd $PE_DIR && ./scripts/start-imac-agents.sh"
