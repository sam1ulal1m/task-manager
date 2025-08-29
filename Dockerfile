# Production Dockerfile for Heroku deployment
FROM node:18-alpine

WORKDIR /app

# Install dependencies
RUN apk add --no-cache curl

# Build frontend first
COPY frontend/package*.json ./frontend/
WORKDIR /app/frontend
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Setup backend
WORKDIR /app
COPY backend/package*.json ./backend/
WORKDIR /app/backend
RUN npm ci --only=production
COPY backend/ ./

# Copy production server file
WORKDIR /app
COPY production-server.js ./server.js

# Create symlink to backend node_modules so the production server can access dependencies
RUN ln -sf /app/backend/node_modules /app/node_modules

# Set NODE_PATH so the server can find backend dependencies
ENV NODE_PATH=/app/backend/node_modules

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:$PORT/api/health || exit 1

# Expose the port (Heroku will set PORT env var)
EXPOSE $PORT

# Start the unified server
CMD ["node", "server.js"]
