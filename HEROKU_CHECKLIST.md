# Heroku Container Deployment Checklist

## ✅ Pre-Deployment Checklist

### Files Created/Updated:
- [ ] `Dockerfile` - Production container configuration
- [ ] `heroku.yml` - Heroku container deployment configuration  
- [ ] `.dockerignore` - Docker build optimization
- [ ] `deploy-heroku.sh` - Automated deployment script
- [ ] `start-production.sh` - Production startup script
- [ ] `DEPLOYMENT.md` - Comprehensive deployment guide

### Prerequisites:
- [ ] Heroku CLI installed ([Download](https://devcenter.heroku.com/articles/heroku-cli))
- [ ] Docker installed ([Download](https://docs.docker.com/get-docker/))
- [ ] Heroku account created ([Sign up](https://heroku.com))
- [ ] Git repository initialized

## 🚀 Deployment Steps

### Option 1: Automated Deployment (Recommended)
```bash
# Make script executable
chmod +x deploy-heroku.sh

# Run deployment script
./deploy-heroku.sh your-app-name
```

### Option 2: Manual Deployment
```bash
# 1. Login to services
heroku login
heroku container:login

# 2. Create app
heroku create your-app-name
heroku stack:set container -a your-app-name

# 3. Set up database
# Option A: Use your own MongoDB URI (recommended)
heroku config:set MONGODB_URI="your-mongodb-connection-string" -a your-app-name

# Option B: Add Atlas addon (if available)
# heroku addons:create mongodb-atlas:cluster0 -a your-app-name

# 4. Set environment variables
heroku config:set NODE_ENV=production -a your-app-name
heroku config:set JWT_SECRET="$(openssl rand -base64 32)" -a your-app-name
heroku config:set JWT_EXPIRE=30d -a your-app-name
heroku config:set FRONTEND_URL=https://your-app-name.herokuapp.com -a your-app-name
heroku config:set CLIENT_URL=https://your-app-name.herokuapp.com -a your-app-name

# 5. Deploy container
heroku container:push web -a your-app-name
heroku container:release web -a your-app-name
```

## 🔧 Environment Variables

### Required:
- `NODE_ENV=production`
- `MONGODB_URI` (auto-set by addon)
- `JWT_SECRET` (generated automatically)
- `JWT_EXPIRE=30d`
- `FRONTEND_URL=https://your-app-name.herokuapp.com`
- `CLIENT_URL=https://your-app-name.herokuapp.com`

### Optional (Email Features):
- `EMAIL_SERVICE=gmail`
- `EMAIL_HOST=smtp.gmail.com`
- `EMAIL_PORT=587`
- `EMAIL_USER=your-email@gmail.com`
- `EMAIL_PASS=your-app-password`

## 📧 Email Configuration (Optional)

### Gmail Setup:
1. Enable 2FA on your Google account
2. Go to [App Passwords](https://myaccount.google.com/apppasswords)
3. Generate an app password
4. Use the app password in `EMAIL_PASS`

### Commands:
```bash
heroku config:set EMAIL_SERVICE=gmail -a your-app-name
heroku config:set EMAIL_USER=your-email@gmail.com -a your-app-name
heroku config:set EMAIL_PASS=your-16-char-app-password -a your-app-name
```

## ✅ Post-Deployment Verification

### 1. Check App Status
```bash
heroku ps -a your-app-name
heroku logs --tail -a your-app-name
```

### 2. Test Application
- [ ] Visit `https://your-app-name.herokuapp.com`
- [ ] Register a new account
- [ ] Login successfully
- [ ] Create a board
- [ ] Create lists and cards
- [ ] Test drag and drop
- [ ] Test team creation (if applicable)

### 3. Test API Health
```bash
curl https://your-app-name.herokuapp.com/api/health
```

Should return:
```json
{
  "success": true,
  "message": "Task Manager API is running",
  "timestamp": "2025-08-30T..."
}
```

## 🐛 Troubleshooting

### Common Issues:

#### Build Failures
```bash
# View build logs
heroku logs --tail -a your-app-name

# Rebuild with verbose output
heroku container:push web -a your-app-name --verbose
```

#### App Crashes
```bash
# Check logs
heroku logs --tail -a your-app-name

# Restart app
heroku restart -a your-app-name
```

#### Database Issues
```bash
# Check addon status
heroku addons:info mongodb-atlas -a your-app-name

# View config
heroku config -a your-app-name
```

#### 502/503 Errors
- App is likely still starting up
- Check logs for errors
- Wait 1-2 minutes and try again

## 🔄 Updates

To deploy updates:
```bash
# Make your changes
git add .
git commit -m "Update description"

# Deploy to Heroku
heroku container:push web -a your-app-name
heroku container:release web -a your-app-name
```

## 📊 Monitoring

### Useful Commands:
```bash
# App information
heroku apps:info your-app-name

# Real-time logs
heroku logs --tail -a your-app-name

# Open in browser
heroku open -a your-app-name

# Dashboard
# Visit: https://dashboard.heroku.com/apps/your-app-name
```

## 💰 Cost Considerations

- **Free Tier**: 550-1000 dyno hours/month
- **Hobby**: $7/month for always-on
- **MongoDB Atlas**: Free tier (512MB)
- Sleep after 30 minutes of inactivity (Free tier)

## 🎯 Final Notes

1. Your app will be available at: `https://your-app-name.herokuapp.com`
2. Free tier apps sleep after 30 minutes of inactivity
3. First request after sleep may take 10-30 seconds
4. Consider upgrading to Hobby tier for production use
5. Monitor your app regularly through Heroku dashboard

## 📞 Support

- [Heroku Dev Center](https://devcenter.heroku.com/)
- [Heroku Status](https://status.heroku.com/)
- [MongoDB Atlas Support](https://www.mongodb.com/cloud/atlas)

---

**Ready to deploy? Run `./deploy-heroku.sh your-app-name` to get started! 🚀**
