#!/bin/bash

# Financial Document Analyzer - Backend Startup Script
# Usage: ./start.sh [options]
#
# Options:
#   --prod      Run in production mode (no reload, no debug)
#   --port PORT Set custom port (default: 8000)
#   --help      Show this help message

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Default settings
MODE="development"
PORT=8000
RELOAD="--reload"

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --prod)
            MODE="production"
            RELOAD=""
            shift
            ;;
        --port)
            PORT="$2"
            shift 2
            ;;
        --help)
            echo "Financial Document Analyzer - Backend Startup Script"
            echo ""
            echo "Usage: ./start.sh [options]"
            echo ""
            echo "Options:"
            echo "  --prod      Run in production mode (no reload, no debug)"
            echo "  --port PORT Set custom port (default: 8000)"
            echo "  --help      Show this help message"
            echo ""
            exit 0
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  Financial Document Analyzer - Backend Server${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo -e "${RED}✗ Virtual environment not found!${NC}"
    echo -e "${YELLOW}  Creating virtual environment...${NC}"
    python3 -m venv venv
    echo -e "${GREEN}✓ Virtual environment created${NC}"
fi

# Activate virtual environment
echo -e "${YELLOW}→ Activating virtual environment...${NC}"
source venv/bin/activate

# Check if dependencies are installed
echo -e "${YELLOW}→ Checking dependencies...${NC}"
if ! python -c "import fastapi" 2>/dev/null; then
    echo -e "${YELLOW}  Installing dependencies...${NC}"
    pip install -q -r requirements.txt
    echo -e "${GREEN}✓ Dependencies installed${NC}"
else
    echo -e "${GREEN}✓ Dependencies OK${NC}"
fi

# Display configuration
echo ""
echo -e "${BLUE}Configuration:${NC}"
echo -e "  Mode: ${GREEN}${MODE}${NC}"
echo -e "  Port: ${GREEN}${PORT}${NC}"
echo -e "  Reload: ${GREEN}$([ -n "$RELOAD" ] && echo "Enabled" || echo "Disabled")${NC}"
echo ""

# Check MongoDB (optional)
if command -v mongod &> /dev/null; then
    if pgrep -x "mongod" > /dev/null; then
        echo -e "${GREEN}✓ MongoDB is running${NC}"
    else
        echo -e "${YELLOW}⚠ MongoDB is not running (backend will start but some features may not work)${NC}"
        echo -e "${YELLOW}  To start MongoDB: brew services start mongodb-community${NC}"
    fi
else
    echo -e "${YELLOW}⚠ MongoDB not installed (optional, but recommended)${NC}"
fi

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}🚀 Starting server on http://localhost:${PORT}${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${YELLOW}Access points:${NC}"
echo -e "  • API Root:    ${GREEN}http://localhost:${PORT}${NC}"
echo -e "  • Swagger UI:  ${GREEN}http://localhost:${PORT}/docs${NC}"
echo -e "  • ReDoc:       ${GREEN}http://localhost:${PORT}/redoc${NC}"
echo -e "  • Health:      ${GREEN}http://localhost:${PORT}/health${NC}"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop the server${NC}"
echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""

# Start the server
uvicorn app.main:app --host 0.0.0.0 --port ${PORT} ${RELOAD}
