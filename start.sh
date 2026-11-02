#!/usr/bin/env bash

# ==============================================================================
# MedCompare — Combined Server & Client Launcher
# Starts both the Express backend (:5001) and Vite frontend (:3000)
# Cleanly terminates all child processes when pressing Ctrl+C.
# ==============================================================================

set -e

# Colors for terminal output
CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SERVER_DIR="$ROOT_DIR/server"
CLIENT_DIR="$ROOT_DIR/client"

echo -e "${CYAN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║                🚀 MedCompare Dev Server                    ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════════════════╝${NC}"

# Check for existing processes on ports 5001 and 3000
check_port() {
  local port=$1
  local pid
  pid=$(lsof -ti :"$port" 2>/dev/null || true)
  if [ -n "$pid" ]; then
    echo -e "${YELLOW}⚠️  Port $port is currently in use by PID $pid. Stopping it...${NC}"
    kill -9 $pid 2>/dev/null || true
    sleep 0.5
  fi
}

check_port 5001
check_port 3000

# Cleanup handler on exit or Ctrl+C
cleanup() {
  echo -e "\n${YELLOW}🛑 Shutting down MedCompare services...${NC}"
  if [ -n "$SERVER_PID" ]; then
    kill -TERM "$SERVER_PID" 2>/dev/null || true
  fi
  if [ -n "$CLIENT_PID" ]; then
    kill -TERM "$CLIENT_PID" 2>/dev/null || true
  fi
  wait 2>/dev/null || true
  echo -e "${GREEN}✓ All services stopped cleanly.${NC}"
  exit 0
}

trap cleanup SIGINT SIGTERM EXIT

# 1. Start Server
echo -e "${GREEN}▶ Starting Backend Server on http://localhost:5001...${NC}"
(
  cd "$SERVER_DIR"
  npm run dev
) &
SERVER_PID=$!

# Wait briefly for server initialization
sleep 1

# 2. Start Client
echo -e "${GREEN}▶ Starting Vite Frontend on http://localhost:3000...${NC}"
(
  cd "$CLIENT_DIR"
  npm run dev
) &
CLIENT_PID=$!

echo -e "${CYAN}────────────────────────────────────────────────────────────${NC}"
echo -e "${GREEN}✓ Both services are up and running!${NC}"
echo -e "  • Frontend:  ${CYAN}http://localhost:3000${NC}"
echo -e "  • Backend:   ${CYAN}http://localhost:5001${NC}"
echo -e "  • API Proxy: ${CYAN}http://localhost:3000/api -> :5001${NC}"
echo -e "${YELLOW}Press [Ctrl+C] to stop both services.${NC}"
echo -e "${CYAN}────────────────────────────────────────────────────────────${NC}\n"

# Wait for background processes
wait "$SERVER_PID" "$CLIENT_PID"
