#!/bin/bash

# Production start script for the unified server
# This script sets up and starts the production server

echo "🚀 Starting Task Manager in production mode..."

# Set production environment
export NODE_ENV=production

# Check if required environment variables are set
if [ -z "$MONGODB_URI" ] && [ -z "$DATABASE_URL" ]; then
    echo "❌ Error: MONGODB_URI or DATABASE_URL environment variable is required"
    exit 1
fi

if [ -z "$JWT_SECRET" ]; then
    echo "⚠️  Warning: JWT_SECRET not set, generating a temporary one"
    export JWT_SECRET=$(openssl rand -base64 32)
fi

# Set default values
export PORT=${PORT:-5000}
export JWT_EXPIRE=${JWT_EXPIRE:-30d}
export FRONTEND_URL=${FRONTEND_URL:-http://localhost:$PORT}
export CLIENT_URL=${CLIENT_URL:-$FRONTEND_URL}

echo "📊 Configuration:"
echo "   PORT: $PORT"
echo "   NODE_ENV: $NODE_ENV"
echo "   DATABASE: ${MONGODB_URI:-$DATABASE_URL}"
echo "   FRONTEND_URL: $FRONTEND_URL"

# Start the unified server
echo "🎯 Starting unified server..."
node server.js
