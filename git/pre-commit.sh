#!/bin/bash
set -Eeuo pipefail
cd "$(git rev-parse --show-toplevel)"
git status --porcelain | egrep '^ M ' > /dev/null && { echo 'unstashed changes'; exit 1; }
json5 config.json5 > config.json
git add config.json
json5 scheduleData.json5 > scheduleData.json
git add scheduleData.json
browserify main.js -o bundle.js
git add bundle.js
