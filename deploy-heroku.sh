#!/bin/bash

# Task Manager - Heroku Container Deployment Script
# This script helps deploy the Task Manager application to Heroku using containers

set -e  # Exit on any error

echo "🚀 Task Manager - Heroku Container Deployment"
echo "=============================================="

# Check if Heroku CLI is installed
if ! command -v heroku &> /dev/null; then
    echo "❌ Heroku CLI is not installed. Please install it first:"
    echo "   https://devcenter.heroku.com/articles/heroku-cli"
    exit 1
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install it first:"
    echo "   https://docs.docker.com/get-docker/"
    exit 1
fi

# Get app name from user
if [ -z "$1" ]; then
    echo "📝 Please provide your Heroku app name:"
    read -p "App name: " APP_NAME
else
    APP_NAME=$1
fi

echo "🔧 Deploying to Heroku app: $APP_NAME"

# Login to Heroku (if not already logged in)
echo "🔐 Checking Heroku authentication..."
if ! heroku auth:whoami &> /dev/null; then
    echo "Please login to Heroku:"
    heroku login
fi

# Login to Heroku Container Registry
echo "🐳 Logging into Heroku Container Registry..."
heroku container:login

# Check if app exists, create if it doesn't
echo "🏗️  Checking if app exists..."
if ! heroku apps:info $APP_NAME &> /dev/null; then
    echo "📦 Creating new Heroku app: $APP_NAME"
    heroku create $APP_NAME
else
    echo "✅ App $APP_NAME already exists"
fi

# Set the stack to container
echo "📋 Setting stack to container..."
heroku stack:set container -a $APP_NAME

# Get MongoDB URI from user
echo "🍃 Setting up MongoDB..."
echo "Please provide your MongoDB URI"
echo "Format: mongodb+srv://username:password@cluster.mongodb.net/database-name"
echo "Note: Your input will be hidden for security"
read -s -p "MongoDB URI: " MONGODB_URI
echo  # New line after hidden input

if [ -z "$MONGODB_URI" ]; then
    echo "❌ MongoDB URI is required"
    exit 1
fi

echo "✅ MongoDB URI provided"

# Set environment variables
echo "🔧 Setting environment variables..."

# Set the MongoDB URI
heroku config:set MONGODB_URI="$MONGODB_URI" -a $APP_NAME

# You'll need to set these variables - uncomment and modify as needed
heroku config:set NODE_ENV=production -a $APP_NAME
heroku config:set JWT_SECRET="$(openssl rand -base64 32)" -a $APP_NAME
heroku config:set JWT_EXPIRE=30d -a $APP_NAME

# Email configuration (optional - update with your email service)
# heroku config:set EMAIL_SERVICE=gmail -a $APP_NAME
# heroku config:set EMAIL_HOST=smtp.gmail.com -a $APP_NAME
# heroku config:set EMAIL_PORT=587 -a $APP_NAME
# heroku config:set EMAIL_USER=your-email@gmail.com -a $APP_NAME
# heroku config:set EMAIL_PASS=your-app-password -a $APP_NAME

# Frontend URL
# Frontend URL
heroku config:set FRONTEND_URL=https://$APP_NAME.herokuapp.com -a $APP_NAME
heroku config:set CLIENT_URL=https://$APP_NAME.herokuapp.com -a $APP_NAME

# Optional email configuration
echo ""
echo "📧 Email Configuration (Optional)"
echo "Would you like to configure email for forgot password feature? (y/n)"
read -p "Configure email: " CONFIGURE_EMAIL

if [ "$CONFIGURE_EMAIL" = "y" ] || [ "$CONFIGURE_EMAIL" = "Y" ]; then
    echo "Email service (gmail/outlook/yahoo):"
    read -p "Email service: " EMAIL_SERVICE
    echo "Email address:"
    read -p "Email: " EMAIL_USER
    echo "Email password/app password (hidden):"
    read -s -p "Password: " EMAIL_PASS
    echo  # New line
    
    heroku config:set EMAIL_SERVICE="$EMAIL_SERVICE" -a $APP_NAME
    heroku config:set EMAIL_USER="$EMAIL_USER" -a $APP_NAME
    heroku config:set EMAIL_PASS="$EMAIL_PASS" -a $APP_NAME
    
    # Set email host and port based on service
    case "$EMAIL_SERVICE" in
        gmail)
            heroku config:set EMAIL_HOST=smtp.gmail.com -a $APP_NAME
            heroku config:set EMAIL_PORT=587 -a $APP_NAME
            ;;
        outlook)
            heroku config:set EMAIL_HOST=smtp-mail.outlook.com -a $APP_NAME
            heroku config:set EMAIL_PORT=587 -a $APP_NAME
            ;;
        yahoo)
            heroku config:set EMAIL_HOST=smtp.mail.yahoo.com -a $APP_NAME
            heroku config:set EMAIL_PORT=587 -a $APP_NAME
            ;;
    esac
    
    echo "✅ Email configuration set"
else
    echo "⏭️  Skipping email configuration"
fi

echo "🔨 Building and pushing container..."

# Build and push the container
heroku container:push web -a $APP_NAME

echo "🚀 Releasing the container..."

# Release the container
heroku container:release web -a $APP_NAME

echo "✅ Deployment completed!"
echo ""
echo "🌐 Your app is available at: https://$APP_NAME.herokuapp.com"
echo "📊 View logs with: heroku logs --tail -a $APP_NAME"
echo "⚙️  Manage your app: https://dashboard.heroku.com/apps/$APP_NAME"
echo "🔧 View config: heroku config -a $APP_NAME"
echo ""
echo "⏳ Note: It may take a few minutes for the app to start up completely."
echo "   Check the logs if you encounter any issues."
echo ""
echo "🔧 To update environment variables later:"
echo "   heroku config:set VARIABLE_NAME=value -a $APP_NAME"
