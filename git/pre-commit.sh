#!/bin/bash
cd "$(git rev-parse --show-toplevel)"
browserify main.js -o bundle.js
git add bundle.js
