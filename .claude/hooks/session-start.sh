#!/bin/bash
set -euo pipefail

# Only run in remote (Claude Code on the web) environments
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "${CLAUDE_PROJECT_DIR:-$(pwd)}"

# Install npm dependencies if package.json exists
if [ -f "package.json" ]; then
  echo "Installing npm dependencies..."
  npm install
fi

# Start the dev server in the background for the preview panel
echo "Starting dev server on port 5173..."
npm run dev -- --host &
