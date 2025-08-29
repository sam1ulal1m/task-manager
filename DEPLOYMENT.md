# Heroku Container Deployment Guide

This guide will help you deploy the Task Manager application to Heroku using Docker containers.

## Prerequisites

1. **Heroku CLI** - Install from [https://devcenter.heroku.com/articles/heroku-cli](https://devcenter.heroku.com/articles/heroku-cli)
2. **Docker** - Install from [https://docs.docker.com/get-docker/](https://docs.docker.com/get-docker/)
3. **Git** - For version control
4. **Heroku Account** - Sign up at [https://heroku.com](https://heroku.com)

## Quick Deployment (Automated)

The easiest way to deploy is using the provided deployment script:

```bash
# Make the script executable (if not already)
chmod +x deploy-heroku.sh

# Run the deployment script
./deploy-heroku.sh your-app-name

# Or run without app name (it will ask you)
./deploy-heroku.sh
```

## Manual Deployment Steps

If you prefer to deploy manually, follow these steps:

### 1. Login to Heroku and Container Registry

```bash
# Login to Heroku
heroku login

# Login to Heroku Container Registry
heroku container:login
```

### 2. Create Heroku App

```bash
# Create a new Heroku app (replace 'your-app-name' with your desired name)
heroku create your-app-name

# Set the stack to container
heroku stack:set container -a your-app-name
```

### 3. Set Up MongoDB

You have two options for MongoDB:

#### Option A: Use Your Own MongoDB URI (Recommended)
```bash
# Set your MongoDB URI directly
heroku config:set MONGODB_URI="your-mongodb-connection-string" -a your-app-name
```

#### Option B: MongoDB Atlas Addon (if available)
```bash
# Add MongoDB Atlas addon (free tier) - only if available in your region
heroku addons:create mongodb-atlas:cluster0 -a your-app-name

# Wait for the database to be ready (check with)
heroku addons:info mongodb-atlas -a your-app-name
```

**Note**: The automated deployment script will prompt you for your MongoDB URI.

### 4. Set Environment Variables

```bash
# Required environment variables
heroku config:set NODE_ENV=production -a your-app-name
heroku config:set JWT_SECRET="$(openssl rand -base64 32)" -a your-app-name
heroku config:set JWT_EXPIRE=30d -a your-app-name
heroku config:set FRONTEND_URL=https://your-app-name.herokuapp.com -a your-app-name
heroku config:set CLIENT_URL=https://your-app-name.herokuapp.com -a your-app-name

# Optional: Email configuration for forgot password feature
heroku config:set EMAIL_SERVICE=gmail -a your-app-name
heroku config:set EMAIL_HOST=smtp.gmail.com -a your-app-name
heroku config:set EMAIL_PORT=587 -a your-app-name
heroku config:set EMAIL_USER=your-email@gmail.com -a your-app-name
heroku config:set EMAIL_PASS=your-app-password -a your-app-name
```

### 5. Build and Deploy

```bash
# Build and push the container
heroku container:push web -a your-app-name

# Release the container
heroku container:release web -a your-app-name
```

### 6. Monitor Deployment

```bash
# View logs
heroku logs --tail -a your-app-name

# Check app status
heroku ps -a your-app-name

# Open the app in browser
heroku open -a your-app-name
```

## Environment Variables Reference

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `NODE_ENV` | Environment mode | Yes | `production` |
| `MONGODB_URI` | MongoDB connection string | Yes | Auto-set by addon or manual |
| `JWT_SECRET` | JWT signing secret | Yes | Random string |
| `JWT_EXPIRE` | JWT expiration time | Yes | `30d` |
| `FRONTEND_URL` | Frontend URL | Yes | `https://your-app.herokuapp.com` |
| `CLIENT_URL` | Client URL (same as frontend) | Yes | `https://your-app.herokuapp.com` |
| `EMAIL_SERVICE` | Email service provider | No | `gmail`, `outlook`, `yahoo` |
| `EMAIL_HOST` | SMTP host | No | `smtp.gmail.com` |
| `EMAIL_PORT` | SMTP port | No | `587` |
| `EMAIL_USER` | Email username | No | `your-email@gmail.com` |
| `EMAIL_PASS` | Email password/app password | No | Your app password |

## Email Configuration (Optional)

To enable the forgot password feature, configure email settings:

### Gmail Setup
1. Enable 2-factor authentication
2. Create an app password: [Google App Passwords](https://myaccount.google.com/apppasswords)
3. Use the app password in `EMAIL_PASS`

### Other Email Providers
- **Outlook**: Use `smtp-mail.outlook.com` on port `587`
- **Yahoo**: Use `smtp.mail.yahoo.com` on port `587`
- **Custom SMTP**: Use your provider's settings

## Troubleshooting

### Common Issues

1. **Build Failures**
   ```bash
   # Check build logs
   heroku logs --tail -a your-app-name
   
   # Rebuild the container
   heroku container:push web -a your-app-name --verbose
   ```

2. **Database Connection Issues**
   ```bash
   # Check if MongoDB addon is ready
   heroku addons:info mongodb-atlas -a your-app-name
   
   # Check environment variables
   heroku config -a your-app-name
   ```

3. **Application Crashes**
   ```bash
   # View detailed logs
   heroku logs --tail -a your-app-name
   
   # Restart the app
   heroku restart -a your-app-name
   ```

4. **502/503 Errors**
   - Usually indicates the app is still starting up
   - Check logs for any errors
   - Ensure the PORT environment variable is being used correctly

### Performance Optimization

1. **Enable HTTP/2**
   ```bash
   heroku labs:enable http-session-affinity -a your-app-name
   ```

2. **Scale Dynos** (Paid plans)
   ```bash
   heroku ps:scale web=2 -a your-app-name
   ```

## Updating the Application

To deploy updates:

```bash
# Make your changes to the code
git add .
git commit -m "Your changes"

# Push to Heroku
heroku container:push web -a your-app-name
heroku container:release web -a your-app-name
```

## Useful Commands

```bash
# View app info
heroku apps:info your-app-name

# View environment variables
heroku config -a your-app-name

# Set environment variable
heroku config:set VARIABLE_NAME=value -a your-app-name

# Remove environment variable
heroku config:unset VARIABLE_NAME -a your-app-name

# View logs
heroku logs --tail -a your-app-name

# Open app in browser
heroku open -a your-app-name

# Access Heroku dashboard
# https://dashboard.heroku.com/apps/your-app-name
```

## Monitoring and Maintenance

1. **Health Checks**: The app includes built-in health checks at `/api/health`
2. **Logs**: Monitor application logs regularly
3. **Database**: Monitor MongoDB usage in your Atlas dashboard
4. **Performance**: Use Heroku metrics or third-party monitoring tools

## Cost Considerations

- **Free Tier**: Limited to 550-1000 dyno hours per month
- **Hobby Tier**: $7/month for always-on apps
- **Database**: MongoDB Atlas has a free tier (512MB)
- **Add-ons**: Check pricing for additional services

Your deployed app will be available at: `https://your-app-name.herokuapp.com`
