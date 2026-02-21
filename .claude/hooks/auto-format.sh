#!/bin/bash
# PostToolUse hook: Auto-format files after Edit/Write
# Runs Prettier on supported file types. Always exits 0 (advisory only).
INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | grep -o '"file_path":"[^"]*"' | head -1 | sed 's/"file_path":"//;s/"$//')

if [ -z "$FILE_PATH" ]; then
  exit 0
fi

case "$FILE_PATH" in
  *.ts|*.tsx|*.js|*.jsx|*.json|*.md|*.css)
    npx prettier --write "$FILE_PATH" > /dev/null 2>&1
    ;;
esac

exit 0
