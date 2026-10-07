#!/usr/bin/env bash
# Regenerate both outputs from data/research.json.
#
#   ./build.sh              rebuild HTML + deck, push the deck to Google Slides
#   ./build.sh --local      rebuild both, skip the Google Slides upload
#   ./build.sh --verify     rebuild, push, then re-export from Google and check
#   ./build.sh --watch      rebuild locally whenever data/ or src/ changes
#
# Needs python3 with openpyxl for the comparison sheet (pip install openpyxl),
# or set PYTHON= to an interpreter that has it.
set -euo pipefail
cd "$(dirname "$0")"

PY_BIN="${PYTHON:-python3}"

build() {
  node src/validate.js
  node src/build-html.js
  node src/build-deck.js
  "$PY_BIN" src/build-sheet.py
}

publish() {
  node src/publish-slides.js "$@"
  node src/publish-sheet.js
}

case "${1:-}" in
  --local) build ;;
  --watch)
    command -v fswatch >/dev/null 2>&1 || { echo "needs fswatch: brew install fswatch"; exit 1; }
    build
    echo "watching data/ and src/ — ctrl-c to stop"
    fswatch -o data src | while read -r _; do
      echo "--- change detected $(date +%H:%M:%S)"
      build || true
    done
    ;;
  --verify) build; publish --verify ;;
  --force)  build; publish --force ;;
  *)        build; publish ;;
esac
