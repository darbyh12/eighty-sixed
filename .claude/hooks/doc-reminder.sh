#!/bin/bash
# Stop hook: Remind about documentation updates based on changed files

CHANGED=$(git diff --name-only HEAD~5 2>/dev/null || echo "")

REMINDERS=""

if echo "$CHANGED" | grep -q "src/hooks/"; then
  REMINDERS="${REMINDERS}\n- Hooks changed: Check if CLAUDE.md architecture section needs updating"
fi

if echo "$CHANGED" | grep -q "index.css\|tailwind"; then
  REMINDERS="${REMINDERS}\n- Styling changed: Update docs/STYLE_GUIDE.md with new tokens or conventions"
fi

if echo "$CHANGED" | grep -q "\.test\.\|test/setup"; then
  REMINDERS="${REMINDERS}\n- Tests changed: Check if docs/TESTING_STRATEGY.md needs new patterns documented"
fi

if echo "$CHANGED" | grep -q "src/lib/"; then
  REMINDERS="${REMINDERS}\n- Library code changed: Check if docs/PATTERNS.md needs new patterns documented"
fi

if echo "$CHANGED" | grep -q "src/pages/"; then
  REMINDERS="${REMINDERS}\n- Pages changed: Check if docs/STYLE_GUIDE.md component patterns need updating"
fi

if [ -n "$REMINDERS" ]; then
  echo -e "Documentation update reminders based on changed files:${REMINDERS}"
else
  echo "Before ending: Did you discover anything worth adding to CLAUDE.md?"
fi
