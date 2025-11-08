# Resend.dev Email Setup Guide

## ✅ Email System Migrated to Resend.dev

Your email system has been successfully migrated from EmailJS to **Resend.dev**!

## 🔑 Your API Key

Your Resend API key is already configured:
- **API Key**: `re_VnYhuscq_Lz9AaSYaWgAEivaXkV9bGG2e`

## 📧 Email Features

The following emails are now powered by Resend:

1. **Application Confirmation** - Sent when user submits application
2. **Application Approval** - Sent when admin approves application
3. **Application Rejection** - Sent when admin rejects application
4. **Password Reset** - Sent when user requests password reset
5. **Welcome Email** - Sent when admin creates new member account

## 🚀 Setup Instructions

### For Local Development:

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Create `.env` file** (if you don't have one):
   ```env
   RESEND_API_KEY=re_VnYhuscq_Lz9AaSYaWgAEivaXkV9bGG2e
   FROM_EMAIL=onboarding@resend.dev
   ```

3. **Start server:**
   ```bash
   npm start
   ```

### For Render Deployment:

1. **Environment Variables** are already set in `render.yaml`:
   - `RESEND_API_KEY` = `re_VnYhuscq_Lz9AaSYaWgAEivaXkV9bGG2e`
   - `FROM_EMAIL` = `onboarding@resend.dev`

2. **Or set manually in Render Dashboard:**
   - Go to your web service → **Environment** tab
   - Add:
     - `RESEND_API_KEY` = `re_VnYhuscq_Lz9AaSYaWgAEivaXkV9bGG2e`
     - `FROM_EMAIL` = `onboarding@resend.dev` (or your verified domain)

3. **Deploy:**
   - Push to GitHub
   - Render will automatically deploy

## 📝 Important Notes

### From Email Address

Currently set to `onboarding@resend.dev` (Resend's default test email).

**To use your own domain:**

1. Go to [Resend Dashboard](https://resend.com/domains)
2. Add and verify your domain
3. Update `FROM_EMAIL` environment variable to your verified email (e.g., `noreply@yourdomain.com`)

### Email Limits (Free Tier)

- **3,000 emails/month** on Resend free tier
- **100 emails/day** sending limit
- Perfect for most small to medium applications

## 🧪 Testing

### Test Email Sending:

1. **Application Confirmation:**
   - Go to Apply page
   - Submit an application
   - Check your email inbox

2. **Password Reset:**
   - Go to Member Login
   - Click "Forgot Password"
   - Enter email and submit
   - Check your email inbox

3. **Admin Functions:**
   - Create a new member (sends welcome email)
   - Approve/Reject application (sends approval/rejection email)

## 🔍 Troubleshooting

### Emails Not Sending?

1. **Check server logs:**
   - Look for error messages in console
   - Check Render logs if deployed

2. **Verify API Key:**
   - Make sure `RESEND_API_KEY` is set correctly
   - Check Resend dashboard for API key status

3. **Check From Email:**
   - Must be verified in Resend
   - Use `onboarding@resend.dev` for testing
   - Use your verified domain email for production

4. **Check Resend Dashboard:**
   - Go to [Resend Dashboard](https://resend.com/emails)
   - Check email logs and delivery status

### Common Errors:

- **"Invalid API key"** - Check your API key in environment variables
- **"From email not verified"** - Verify your domain or use `onboarding@resend.dev`
- **"Rate limit exceeded"** - You've hit the daily limit (100 emails/day on free tier)

## 📚 Resend Documentation

- [Resend Docs](https://resend.com/docs)
- [Resend API Reference](https://resend.com/docs/api-reference)
- [Resend Dashboard](https://resend.com/emails)

## ✨ What Changed

### Removed:
- ❌ EmailJS client-side library
- ❌ EmailJS script tags from HTML files
- ❌ EmailJS configuration

### Added:
- ✅ Resend server-side API endpoint (`/api/send-email`)
- ✅ Beautiful HTML email templates
- ✅ Secure API key handling (server-side only)
- ✅ Better error handling and logging

## 🎉 You're All Set!

Your email system is now powered by Resend.dev and ready to use!

