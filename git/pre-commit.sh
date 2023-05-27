#!/bin/bash
# This script builds bundle.js as well as scheduleData.json and config.json. It first copies the index into a temp dir
# so that uncommitted changes and untracked files don't affect the build.
set -Eeuo pipefail
project_root="$(git rev-parse --show-toplevel)"
tmp_dir="$(mktemp -d)"
# echo "$project_root $tmp_dir"
trap "rm -rf $tmp_dir" 0 1 2 3 15
GIT_WORK_TREE="$tmp_dir" git checkout-index --force --all
ln -s "$project_root"/node_modules "$tmp_dir"
cd "$tmp_dir"
json5 config.json5 > config.json
json5 scheduleData.json5 > scheduleData.json
browserify main.js -o "$project_root"/bundle.js
cp config.json "$project_root"
cp scheduleData.json "$project_root"
cd "$project_root"
git add config.json
git add scheduleData.json
git add bundle.js
