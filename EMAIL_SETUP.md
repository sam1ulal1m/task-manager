# Email Configuration Guide

This guide explains how to configure email for the password reset feature in the Task Manager application.

## Email Providers Supported

- **Gmail** (Recommended)
- **Outlook/Hotmail**
- **Yahoo**
- **Custom SMTP**

## Gmail Setup (Recommended)

### Step 1: Enable 2-Factor Authentication
1. Go to your [Google Account settings](https://myaccount.google.com/)
2. Click on "Security" in the left sidebar
3. Enable "2-Step Verification" if not already enabled

### Step 2: Generate App Password
1. Go to [App passwords](https://myaccount.google.com/apppasswords)
2. Select "Mail" as the app
3. Select "Other (Custom name)" as the device
4. Enter "Task Manager" as the name
5. Click "Generate"
6. Copy the 16-character password (save it securely)

### Step 3: Configure Environment Variables
Add these to your `.env` file:

```bash
EMAIL_PROVIDER=gmail
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_16_character_app_password
EMAIL_FROM=TaskManager <noreply@taskmanager.com>
```

## Outlook/Hotmail Setup

### Step 1: Configure Environment Variables
Add these to your `.env` file:

```bash
EMAIL_PROVIDER=outlook
EMAIL_USER=your_email@outlook.com
EMAIL_PASS=your_password
EMAIL_FROM=TaskManager <noreply@taskmanager.com>
```

Note: You may need to enable "Less secure app access" in your Microsoft account settings.

## Yahoo Setup

### Step 1: Generate App Password
1. Go to [Yahoo Account Security](https://login.yahoo.com/account/security)
2. Click "Generate app password"
3. Select "Other App" and enter "Task Manager"
4. Copy the generated password

### Step 2: Configure Environment Variables
Add these to your `.env` file:

```bash
EMAIL_PROVIDER=yahoo
EMAIL_USER=your_email@yahoo.com
EMAIL_PASS=your_app_password
EMAIL_FROM=TaskManager <noreply@taskmanager.com>
```

## Custom SMTP Setup

For other email providers, use the custom SMTP configuration:

```bash
EMAIL_PROVIDER=custom
EMAIL_HOST=smtp.your-provider.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your_email@domain.com
EMAIL_PASS=your_password
EMAIL_FROM=TaskManager <noreply@taskmanager.com>
```

## Testing the Configuration

1. Restart your backend server after updating the `.env` file
2. Try the forgot password feature from the frontend
3. Check the server console for any email sending errors
4. Check your email for the password reset message

## Troubleshooting

### Common Issues

1. **"Authentication failed"**
   - Make sure you're using an app password (not your regular password) for Gmail/Yahoo
   - Verify your email credentials are correct

2. **"Connection timeout"**
   - Check your internet connection
   - Verify the SMTP host and port settings

3. **"Less secure app access"**
   - For some providers, you may need to enable "Less secure app access"
   - Consider using app passwords instead

### Development Mode

If no email credentials are provided, the system will:
- Use Ethereal Email for testing (emails won't be actually sent)
- Log a message in the console indicating test mode

### Production Considerations

1. Use environment variables for all sensitive information
2. Never commit email credentials to version control
3. Consider using dedicated email services like SendGrid, Mailgun, or AWS SES for production
4. Set up proper SPF, DKIM, and DMARC records for your domain

## Security Notes

- App passwords are more secure than regular passwords
- Always use HTTPS in production
- Consider implementing rate limiting for password reset requests
- Email tokens expire in 10 minutes for security

## Support

If you encounter issues:
1. Check the server console for detailed error messages
2. Verify your email provider's SMTP settings
3. Test with a simple email first before using in the application
