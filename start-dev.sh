#!/bin/bash

echo "🚀 Starting Location Scheduler Development Environment..."
echo ""

# Kill any existing processes
echo "🧹 Cleaning up any existing processes..."
pkill -9 node 2>/dev/null
sleep 2

# Start backend server
echo "⚙️  Starting backend server on port 8080..."
npm run start:server > backend.log 2>&1 &
BACKEND_PID=$!
echo "   Backend PID: $BACKEND_PID"

# Wait for backend to be ready
sleep 3

# Start frontend server
echo "⚛️  Starting React app on port 3001..."
PORT=3001 npm start > frontend.log 2>&1 &
FRONTEND_PID=$!
echo "   Frontend PID: $FRONTEND_PID"

# Wait for frontend to compile
echo ""
echo "⏳ Waiting for servers to start..."
sleep 10

# Check if both are running
echo ""
echo "📊 Server Status:"
if lsof -i :8080 -i :3001 | grep -q LISTEN; then
    echo "✅ Servers are running!"
    echo ""
    echo "🌐 Access your app at: http://localhost:3001"
    echo "🔧 Backend API at: http://localhost:8080"
    echo ""
    echo "📋 View logs:"
    echo "   Backend:  tail -f backend.log"
    echo "   Frontend: tail -f frontend.log"
    echo ""
    echo "🛑 To stop servers: pkill -9 node"
else
    echo "❌ Something went wrong. Check the logs:"
    echo "   Backend:  cat backend.log"
    echo "   Frontend: cat frontend.log"
fi
