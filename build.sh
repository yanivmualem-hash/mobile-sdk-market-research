#!/usr/bin/env bash
# Regenerate both outputs from data/research.json.
#
#   ./build.sh              rebuild HTML + deck, push the deck to Google Slides
#   ./build.sh --local      rebuild both, skip the Google Slides upload
#   ./build.sh --verify     rebuild, push, then re-export from Google and check
#   ./build.sh --watch      rebuild locally whenever data/ or src/ changes
set -euo pipefail
cd "$(dirname "$0")"

build() {
  node src/validate.js
  node src/build-html.js
  node src/build-deck.js
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
  --verify) build; node src/publish-slides.js --verify ;;
  --force)  build; node src/publish-slides.js --force ;;
  *)        build; node src/publish-slides.js ;;
esac
