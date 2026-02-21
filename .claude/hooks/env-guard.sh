#!/bin/bash
# PreToolUse hook: Block editing .env files
INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | grep -o '"file_path":"[^"]*"' | head -1 | sed 's/"file_path":"//;s/"$//')

if [ -z "$FILE_PATH" ]; then
  exit 0
fi

if echo "$FILE_PATH" | grep -qE '\.env($|\.)'; then
  echo "BLOCKED: Do not edit .env files via Claude Code. Environment variables should be managed through your deployment platform or manually." >&2
  exit 2
fi

exit 0
