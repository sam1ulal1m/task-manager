#!/bin/bash

# Docker Local Development Helper Script for Task Manager

echo "🐳 Task Manager Local Docker Helper"
echo "====================================="

case "$1" in
    "start")
        echo "🚀 Starting Task Manager container..."
        docker compose up -d
        echo "✅ Container started! Application available at http://localhost:3000"
        echo "📊 Health check: http://localhost:3000/api/health"
        ;;
    "stop")
        echo "🛑 Stopping Task Manager container..."
        docker compose down
        echo "✅ Container stopped!"
        ;;
    "restart")
        echo "🔄 Restarting Task Manager container..."
        docker compose down
        docker compose up -d
        echo "✅ Container restarted! Application available at http://localhost:3000"
        ;;
    "logs")
        echo "📋 Showing container logs..."
        docker compose logs -f --tail=50
        ;;
    "build")
        echo "🔨 Rebuilding Task Manager container..."
        docker compose build --no-cache
        echo "✅ Container rebuilt!"
        ;;
    "rebuild")
        echo "🔨 Rebuilding and starting Task Manager container..."
        docker compose down
        docker compose build --no-cache
        docker compose up -d
        echo "✅ Container rebuilt and started! Application available at http://localhost:3000"
        ;;
    "status")
        echo "📊 Container status:"
        docker compose ps
        echo ""
        echo "🔍 Health check:"
        curl -s http://localhost:3000/api/health | jq . 2>/dev/null || curl -s http://localhost:3000/api/health
        ;;
    "shell")
        echo "🐚 Opening shell in container..."
        docker compose exec taskmanager sh
        ;;
    *)
        echo "Usage: $0 {start|stop|restart|logs|build|rebuild|status|shell}"
        echo ""
        echo "Commands:"
        echo "  start    - Start the container in background"
        echo "  stop     - Stop the container"
        echo "  restart  - Restart the container"
        echo "  logs     - Show and follow container logs"
        echo "  build    - Rebuild the container image"
        echo "  rebuild  - Rebuild and restart the container"
        echo "  status   - Show container status and health"
        echo "  shell    - Open shell in running container"
        exit 1
        ;;
esac
