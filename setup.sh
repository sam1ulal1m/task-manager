#!/bin/bash

# Task Manager Development Setup Script

echo "🚀 Setting up Task Manager development environment..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js version 16 or higher."
    exit 1
fi

# Check if MongoDB is installed
if ! command -v mongod &> /dev/null; then
    echo "⚠️  MongoDB is not installed. Please install MongoDB or use Docker."
    echo "You can run: docker run -d -p 27017:27017 --name mongodb mongo:latest"
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm run install:all

# Create environment files if they don't exist
if [ ! -f backend/.env ]; then
    echo "🔧 Creating backend .env file..."
    cp backend/.env.example backend/.env
    echo "✅ Please update backend/.env with your configuration"
fi

if [ ! -f frontend/.env ]; then
    echo "🔧 Creating frontend .env file..."
    echo "VITE_API_URL=http://localhost:5000/api" > frontend/.env
    echo "VITE_APP_NAME=Task Manager" >> frontend/.env
    echo "VITE_SOCKET_URL=http://localhost:5000" >> frontend/.env
    echo "✅ Frontend .env file created"
fi

echo "✨ Setup complete! You can now run:"
echo "  npm run dev        - Start both backend and frontend"
echo "  npm run dev:backend - Start only backend"
echo "  npm run dev:frontend - Start only frontend"
echo "  npm test           - Run all tests"
echo "  npm run docker:up  - Run with Docker"

echo ""
echo "📖 Make sure to:"
echo "  1. Start MongoDB (mongod) or use Docker"
echo "  2. Update .env files with your configuration"
echo "  3. Visit http://localhost:3000 for the frontend"
echo "  4. API will be available at http://localhost:5000"
