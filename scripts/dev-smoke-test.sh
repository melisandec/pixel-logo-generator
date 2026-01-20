#!/usr/bin/env bash
set -euo pipefail

# dev-smoke-test.sh
# Starts the Next dev server with a timeout, runs smoke tests against
# /api/dev/farcaster-test (GET, POST, DELETE) and then kills the server.

ROOT_DIR=$(cd "$(dirname "$0")/.." && pwd)
LOGFILE="/tmp/pixel-logo-dev.log"
PORT=3000
TIMEOUT_SECS=90

echo "Starting dev server (timeout ${TIMEOUT_SECS}s). Logs: ${LOGFILE}"
cd "$ROOT_DIR"

# Start dev server in background
npm run dev >"$LOGFILE" 2>&1 &
DEV_PID=$!
echo "Dev PID: $DEV_PID"

# Ensure we kill the dev server on exit
cleanup() {
  echo "Cleaning up..."
  if kill -0 "$DEV_PID" 2>/dev/null; then
    kill "$DEV_PID" || true
    wait "$DEV_PID" 2>/dev/null || true
  fi
}
trap cleanup EXIT

# wait for server to respond (health check)
END=$((SECONDS + 45))
until curl -sf "http://localhost:${PORT}/api/dev/farcaster-test?username=userA" -o /dev/null; do
  if [ $SECONDS -gt $END ]; then
    echo "Server did not start within 45s. Dumping log tail:" >&2
    tail -n 200 "$LOGFILE" >&2 || true
    exit 1
  fi
  sleep 1
done

echo "Server up — running API smoke tests"

echo "1) GET initial state"
curl -sS "http://localhost:${PORT}/api/dev/farcaster-test?username=userA" | jq || true

echo "2) POST grant COMMON"
curl -sS -X POST "http://localhost:${PORT}/api/dev/farcaster-test" -H 'Content-Type: application/json' -d '{"username":"userA","rarity":"COMMON"}' | jq || true

echo "3) GET after COMMON"
curl -sS "http://localhost:${PORT}/api/dev/farcaster-test?username=userA" | jq || true

echo "4) POST grant RARE"
curl -sS -X POST "http://localhost:${PORT}/api/dev/farcaster-test" -H 'Content-Type: application/json' -d '{"username":"userA","rarity":"RARE"}' | jq || true

echo "5) POST grant EPIC"
curl -sS -X POST "http://localhost:${PORT}/api/dev/farcaster-test" -H 'Content-Type: application/json' -d '{"username":"userA","rarity":"EPIC"}' | jq || true

echo "6) POST grant LEGENDARY"
curl -sS -X POST "http://localhost:${PORT}/api/dev/farcaster-test" -H 'Content-Type: application/json' -d '{"username":"userA","rarity":"LEGENDARY"}' | jq || true

echo "7) GET after all rarities (should show master unlocked)"
curl -sS "http://localhost:${PORT}/api/dev/farcaster-test?username=userA" | jq || true

echo "8) DELETE reset progress"
curl -sS -X DELETE "http://localhost:${PORT}/api/dev/farcaster-test" -H 'Content-Type: application/json' -d '{"username":"userA"}' | jq || true

echo "9) GET after reset (should be clean)"
curl -sS "http://localhost:${PORT}/api/dev/farcaster-test?username=userA" | jq || true

echo "Smoke tests completed"

exit 0
