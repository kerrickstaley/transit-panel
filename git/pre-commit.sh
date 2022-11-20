#!/bin/bash
set -Eeuo pipefail
cd "$(git rev-parse --show-toplevel)"
json5 scheduleData.json5 > scheduleData.json
browserify main.js -o bundle.js
git add bundle.js
