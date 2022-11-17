#!/bin/bash
set -Eeuo pipefail
cd "$(git rev-parse --show-toplevel)"
# Add pre-commit hook to re-build bundle.js each commit
( cd .git/hooks && ln -s ../../git/pre-commit.sh pre-commit )
# Configure Git to ignore bundle.js changes in output of git diff
# See https://stackoverflow.com/a/10421385/785404
git config diff.nodiff.command /usr/bin/true
