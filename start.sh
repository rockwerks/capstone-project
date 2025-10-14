#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}Location Scheduler - Google OAuth Setup${NC}"
echo "========================================"
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  .env file not found!${NC}"
    echo "Creating .env from .env.example..."
    cp .env.example .env
    echo -e "${RED}❌ Please update .env with your Google OAuth credentials${NC}"
    echo "   Follow the instructions in GOOGLE_OAUTH_SETUP.md"
    echo ""
    exit 1
fi

# Check if Google credentials are set
if grep -q "your-google-client-id-here" .env; then
    echo -e "${RED}❌ Google OAuth credentials not configured!${NC}"
    echo "   Please update GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env"
    echo "   Follow the instructions in GOOGLE_OAUTH_SETUP.md"
    echo ""
    exit 1
fi

echo -e "${GREEN}✓ Environment variables configured${NC}"
echo ""

# Check if node_modules exists
if [ ! -d node_modules ]; then
    echo -e "${YELLOW}Installing dependencies...${NC}"
    npm install
    echo -e "${GREEN}✓ Dependencies installed${NC}"
    echo ""
fi

echo -e "${GREEN}Starting servers...${NC}"
echo ""
echo "Backend will run on: http://localhost:8080"
echo "Frontend will run on: http://localhost:3000"
echo ""
echo -e "${YELLOW}Opening two terminals:${NC}"
echo "  Terminal 1: Backend (Express + Passport)"
echo "  Terminal 2: Frontend (React)"
echo ""

# For macOS, open new terminal windows
if [[ "$OSTYPE" == "darwin"* ]]; then
    osascript -e 'tell app "Terminal" to do script "cd '"$(pwd)"' && npm run start:server"'
    sleep 2
    osascript -e 'tell app "Terminal" to do script "cd '"$(pwd)"' && npm start"'
else
    # For Linux/other systems, run in background
    echo "Starting backend server..."
    npm run start:server &
    BACKEND_PID=$!
    
    sleep 2
    
    echo "Starting frontend server..."
    npm start &
    FRONTEND_PID=$!
    
    echo ""
    echo -e "${GREEN}✓ Servers started${NC}"
    echo "Backend PID: $BACKEND_PID"
    echo "Frontend PID: $FRONTEND_PID"
    echo ""
    echo "To stop servers, run:"
    echo "  kill $BACKEND_PID $FRONTEND_PID"
fi

echo ""
echo -e "${GREEN}🚀 Setup complete!${NC}"
echo "Visit http://localhost:3000 to test Google OAuth login"
