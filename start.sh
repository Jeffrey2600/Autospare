#!/usr/bin/env bash
# Mac / Linux launcher — the equivalent of START.bat on Windows.
set -e
cd "$(dirname "$0")"

echo
echo "  ==============================================="
echo "    AutoSpare Parts - Starting the website"
echo "  ==============================================="
echo

if ! command -v node >/dev/null 2>&1; then
  echo "  [X] Node.js is not installed."
  echo
  echo "      Please install it first:"
  echo "        1. Go to  https://nodejs.org"
  echo "        2. Download the \"LTS\" version and install it"
  echo "        3. Then run this file again"
  echo
  exit 1
fi

if [ ! -d "node_modules" ]; then
  echo "  First time setup - this takes a few minutes."
  echo "  Please wait, do not close this window..."
  echo
  npm install
fi

if [ ! -f ".env" ]; then
  npm run setup
fi

echo
echo "  Starting... open http://localhost:3000 in your browser."
echo "  KEEP THIS WINDOW OPEN while using the website."
echo

npm run dev
