#!/bin/bash

# ViSecure Development Server Starter
echo "🚀 Starting ViSecure development servers..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check if both directories exist
if [ ! -d "frontend" ] || [ ! -d "backend" ]; then
    echo "Error: Please run this script from the ViSecure root directory"
    exit 1
fi

# Function to start backend
start_backend() {
    print_status "Starting backend server..."
    cd backend
    npm run dev &
    BACKEND_PID=$!
    cd ..
    print_success "Backend started (PID: $BACKEND_PID)"
}

# Function to start frontend
start_frontend() {
    print_status "Starting frontend server..."
    cd frontend
    npm run dev &
    FRONTEND_PID=$!
    cd ..
    print_success "Frontend started (PID: $FRONTEND_PID)"
}

# Start both servers
start_backend
sleep 3  # Give backend time to start
start_frontend

print_success "✨ Both servers are starting..."
print_status ""
print_status "Frontend: http://localhost:3000"
print_status "Backend:  http://localhost:5001"
print_status "Health:   http://localhost:5001/health"
print_status ""
print_warning "Press Ctrl+C to stop both servers"

# Function to cleanup on exit
cleanup() {
    print_status "Stopping servers..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    print_success "Servers stopped"
    exit 0
}

# Trap Ctrl+C and cleanup
trap cleanup SIGINT

# Wait for both processes
wait
