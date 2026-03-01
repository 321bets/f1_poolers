#!/bin/sh

# Start API server in background
cd /app/server
./node_modules/.bin/tsx src/index.ts &

# Wait for API to start
sleep 3

# Start nginx in foreground
nginx -g 'daemon off;'
