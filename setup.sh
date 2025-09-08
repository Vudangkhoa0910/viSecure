#!/bin/bash

# ViSecure Development Setup Script
echo "🚀 Setting up ViSecure development environment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

print_success "Node.js $(node -v) is installed"

# Check if MongoDB is running
if ! pgrep -x "mongod" > /dev/null; then
    print_warning "MongoDB is not running. Please start MongoDB service."
    print_status "macOS: brew services start mongodb/brew/mongodb-community"
    print_status "Ubuntu: sudo systemctl start mongodb"
    print_status "Windows: Start MongoDB service from Services panel"
fi

# Setup Frontend
print_status "Setting up frontend..."
cd frontend

if [ ! -f "package.json" ]; then
    print_error "Frontend package.json not found!"
    exit 1
fi

print_status "Installing frontend dependencies..."
npm install

if [ $? -eq 0 ]; then
    print_success "Frontend dependencies installed"
else
    print_error "Failed to install frontend dependencies"
    exit 1
fi

# Create frontend .env if it doesn't exist
if [ ! -f ".env" ]; then
    print_status "Creating frontend .env file..."
    cat > .env << EOF
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=ViSecure
EOF
    print_success "Frontend .env created"
fi

cd ..

# Setup Backend
print_status "Setting up backend..."
cd backend

if [ ! -f "package.json" ]; then
    print_error "Backend package.json not found!"
    exit 1
fi

print_status "Installing backend dependencies..."
npm install

if [ $? -eq 0 ]; then
    print_success "Backend dependencies installed"
else
    print_error "Failed to install backend dependencies"
    exit 1
fi

# Create backend .env if it doesn't exist
if [ ! -f ".env" ]; then
    print_status "Creating backend .env file..."
    cp .env.example .env
    print_success "Backend .env created from template"
    print_warning "Please edit visecure-backend/.env with your configuration"
fi

cd ..

print_success "✨ ViSecure setup completed!"
print_status ""
print_status "Next steps:"
print_status "1. Edit backend/.env with your MongoDB URI and API keys"
print_status "2. Start the backend: cd backend && npm run dev"
print_status "3. Start the frontend: cd frontend && npm run dev"
print_status ""
print_status "Frontend will be available at: http://localhost:3000"
print_status "Backend will be available at: http://localhost:5000"
print_status "Health check: http://localhost:5000/health"
