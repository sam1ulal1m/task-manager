#!/bin/bash

# Quick redeploy script for updates
set -e

APP_NAME=${1:-very-important-taskboard}

echo "🔄 Redeploying $APP_NAME with fixes..."

# Login to container registry
heroku container:login

# Build and push the updated container
echo "🔨 Building and pushing updated container..."
heroku container:push web -a $APP_NAME

# Release the container
echo "🚀 Releasing updated container..."
heroku container:release web -a $APP_NAME

echo "✅ Redeploy completed!"
echo "📊 View logs: heroku logs --tail -a $APP_NAME"
echo "🌐 App URL: https://$APP_NAME.herokuapp.com"
