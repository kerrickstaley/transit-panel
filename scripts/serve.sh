#!/bin/bash
python3 -m http.server &
server_pid=$?
kill_server() {
  kill $server_pid
}
trap kill_server EXIT
node_modules/watchify/bin/cmd.js main.js -o bundle.js
