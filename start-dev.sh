#!/bin/bash

# BahaLaNa Development Server Startup Script
# Starts both backend and frontend

echo "🌊 Starting BahaLaNa Development Servers..."
echo ""

# Check if backend dependencies are installed
echo "📦 Checking backend dependencies..."
cd /workspaces/BahaLaNa/backend
if ! python -c "import fastapi" 2>/dev/null; then
    echo "⚠️  Backend dependencies not found. Installing..."
    pip install -r requirements.txt
    pip install -r requirements-ml.txt
fi

# Check if frontend dependencies are installed
echo "📦 Checking frontend dependencies..."
cd /workspaces/BahaLaNa/frontend
if [ ! -d "node_modules" ]; then
    echo "⚠️  Frontend dependencies not found. Installing..."
    npm install
fi

echo ""
echo "🚀 Starting servers..."
echo ""

# Start backend in background
echo "🔧 Starting backend on http://localhost:8000..."
cd /workspaces/BahaLaNa/backend
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000 > /tmp/backend.log 2>&1 &
BACKEND_PID=$!
echo "   Backend PID: $BACKEND_PID"

# Wait for backend to start
sleep 3

# Check if backend is running
if curl -s http://localhost:8000/api/ > /dev/null 2>&1; then
    echo "   ✅ Backend is running"
else
    echo "   ❌ Backend failed to start. Check /tmp/backend.log"
    exit 1
fi

echo ""
echo "🎨 Starting frontend on http://localhost:5173..."
cd /workspaces/BahaLaNa/frontend

# Start frontend (this will block)
npm run dev

# When frontend stops, kill backend
echo ""
echo "🛑 Stopping servers..."
kill $BACKEND_PID 2>/dev/null
echo "✅ Servers stopped"
