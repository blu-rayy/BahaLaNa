#!/bin/bash

# BahaLaNa Startup and Debugging Script
# This script helps start the application and debug common issues

echo "🌊 BahaLaNa - Flood Risk Assessment"
echo "===================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check if a port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
        return 0  # Port is in use
    else
        return 1  # Port is free
    fi
}

# Function to kill process on port
kill_port() {
    echo -e "${YELLOW}Killing process on port $1...${NC}"
    lsof -ti:$1 | xargs kill -9 2>/dev/null || true
    sleep 1
}

echo "📋 Pre-flight Checks"
echo "--------------------"

# Check Node.js
if command -v node &> /dev/null; then
    echo -e "${GREEN}✓${NC} Node.js: $(node --version)"
else
    echo -e "${RED}✗${NC} Node.js not found"
    exit 1
fi

# Check npm
if command -v npm &> /dev/null; then
    echo -e "${GREEN}✓${NC} npm: $(npm --version)"
else
    echo -e "${RED}✗${NC} npm not found"
    exit 1
fi

# Check Python
if command -v python &> /dev/null; then
    echo -e "${GREEN}✓${NC} Python: $(python --version)"
else
    echo -e "${RED}✗${NC} Python not found"
    exit 1
fi

echo ""

# Check ports
echo "🔍 Checking Ports"
echo "----------------"

if check_port 8000; then
    echo -e "${YELLOW}⚠${NC}  Port 8000 (backend) is in use"
    read -p "Kill process and restart? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        kill_port 8000
    fi
else
    echo -e "${GREEN}✓${NC} Port 8000 (backend) is available"
fi

if check_port 5173; then
    echo -e "${YELLOW}⚠${NC}  Port 5173 (frontend) is in use"
    read -p "Kill process and restart? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        kill_port 5173
    fi
else
    echo -e "${GREEN}✓${NC} Port 5173 (frontend) is available"
fi

echo ""

# Check environment files
echo "⚙️  Checking Configuration"
echo "-------------------------"

if [ -f "backend/.env" ]; then
    echo -e "${GREEN}✓${NC} Backend .env exists"
    if grep -q "EARTHDATA_JWT=" backend/.env && [ -n "$(grep "EARTHDATA_JWT=" backend/.env | cut -d'=' -f2)" ]; then
        echo -e "${GREEN}✓${NC} EARTHDATA_JWT is configured"
    else
        echo -e "${RED}✗${NC} EARTHDATA_JWT is not configured in backend/.env"
    fi
else
    echo -e "${YELLOW}⚠${NC}  Backend .env not found"
fi

if [ -f "frontend/.env" ]; then
    echo -e "${GREEN}✓${NC} Frontend .env exists"
    if grep -q "VITE_EARTHDATA_TOKEN=" frontend/.env && [ -n "$(grep "VITE_EARTHDATA_TOKEN=" frontend/.env | cut -d'=' -f2)" ]; then
        TOKEN_VALUE=$(grep "VITE_EARTHDATA_TOKEN=" frontend/.env | cut -d'=' -f2)
        TOKEN_LENGTH=${#TOKEN_VALUE}
        echo -e "${GREEN}✓${NC} VITE_EARTHDATA_TOKEN is configured (length: $TOKEN_LENGTH chars)"
        
        # Check for line breaks in token
        TOKEN_LINES=$(grep "VITE_EARTHDATA_TOKEN=" frontend/.env | wc -l)
        if [ $TOKEN_LINES -gt 1 ]; then
            echo -e "${RED}✗${NC} WARNING: Token appears to be split across multiple lines!"
        fi
    else
        echo -e "${RED}✗${NC} VITE_EARTHDATA_TOKEN is not configured in frontend/.env"
    fi
    
    if grep -q "VITE_API_URL=" frontend/.env; then
        API_URL=$(grep "VITE_API_URL=" frontend/.env | cut -d'=' -f2)
        echo -e "${GREEN}✓${NC} VITE_API_URL: $API_URL"
    fi
else
    echo -e "${YELLOW}⚠${NC}  Frontend .env not found"
fi

echo ""
echo "🚀 Starting Services"
echo "-------------------"

# Start backend
echo -e "${BLUE}Starting backend...${NC}"
cd backend
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000 > ../backend.log 2>&1 &
BACKEND_PID=$!
cd ..

echo -e "${GREEN}✓${NC} Backend started (PID: $BACKEND_PID)"

# Wait for backend to be ready
echo "Waiting for backend to be ready..."
for i in {1..30}; do
    if curl -s http://localhost:8000/api/ > /dev/null 2>&1; then
        echo -e "${GREEN}✓${NC} Backend is responding"
        break
    fi
    sleep 1
    echo -n "."
done
echo ""

# Start frontend
echo -e "${BLUE}Starting frontend...${NC}"
cd frontend
npm run dev > ../frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..

echo -e "${GREEN}✓${NC} Frontend started (PID: $FRONTEND_PID)"

echo ""
echo "✅ Application Started!"
echo "======================="
echo ""
echo -e "${GREEN}Backend:${NC}  http://localhost:8000"
echo -e "          API: http://localhost:8000/api/"
echo -e "          Docs: http://localhost:8000/docs"
echo ""
echo -e "${GREEN}Frontend:${NC} http://localhost:5173"
echo ""
echo -e "${YELLOW}Logs:${NC}"
echo "  Backend:  tail -f backend.log"
echo "  Frontend: tail -f frontend.log"
echo ""
echo -e "${YELLOW}To stop:${NC}"
echo "  kill $BACKEND_PID $FRONTEND_PID"
echo "  or press Ctrl+C and run: pkill -f 'uvicorn\|vite'"
echo ""
echo "🧪 Quick Test:"
echo "  curl http://localhost:8000/api/"
echo ""

# Test backend
echo "Testing backend health..."
HEALTH_RESPONSE=$(curl -s http://localhost:8000/api/)
if echo "$HEALTH_RESPONSE" | grep -q "status"; then
    echo -e "${GREEN}✓${NC} Backend health check passed"
    echo "  Response: $HEALTH_RESPONSE"
else
    echo -e "${RED}✗${NC} Backend health check failed"
fi

echo ""
echo "🎯 Ready to use! Open http://localhost:5173 in your browser"
echo ""
