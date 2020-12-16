#!/bin/bash
export ${WATCH_DIR:=$PWD}
tmux new -s 'watch' \; \
    setenv WATCH_DIR $WATCH_DIR \; \
    send-keys -t 1 "export WATCH_DIR="$WATCH_DIR C-m \; \
    split-window -h \; \
    split-window -v \; \
    send-keys -t 1 'cd $WATCH_DIR' C-m \; \
    send-keys -t 2 'cd $WATCH_DIR' C-m \; \
    send-keys -t 3 'node ~/Git/njw/micro-server/server.js -s -h '$WATCH_DIR \;
