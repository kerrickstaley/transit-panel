#!/bin/bash
set -Eeuo pipefail
echo '#### Copying code to tmpdir ####'
tmpdir="$(mktemp -d)"
trap "rm -rf $tmpdir" 0 1 2 3 15
project_root="$(git rev-parse --show-toplevel)"
head_commit="$(git rev-parse --short HEAD)"
GIT_WORK_TREE="$tmpdir" git reset --hard HEAD
cd "$tmpdir"
ln -s "$project_root/node_modules" .
echo '#### Building ####'
npm run build
echo '#### Pushing changes to built branch ####'
git clone "$project_root" --single-branch --branch=built built-clone
cd built-clone
git rm -r *
cp -r ../build/* .
git add *
git commit -m "Build site from $head_commit"
git push
