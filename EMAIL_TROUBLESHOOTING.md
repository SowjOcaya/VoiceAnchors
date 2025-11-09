# Email Troubleshooting Guide

## Common Issues and Solutions

### 1. Email Configuration Check

First, verify your environment variables are set correctly in Render:

- ✅ `RESEND_API_KEY` - Your Resend API key (should start with `re_`)
- ✅ `FROM_EMAIL` - Your verified sender email (e.g., `voice-anchors@resend.dev`)

### 2. Verify Environment Variables in Render

1. Go to your Render dashboard
2. Select your service
3. Go to "Environment" tab
4. Verify both `RESEND_API_KEY` and `FROM_EMAIL` are set
5. Make sure there are no extra spaces or quotes

### 3. Check Server Logs

After deploying, check your Render logs for:
- ✅ `RESEND_API_KEY is configured`
- ✅ `FROM_EMAIL is configured: voice-anchors@resend.dev`
- ✅ `Resend initialized successfully`

If you see warnings, the environment variables are not set correctly.

### 4. Test Email Endpoint

You can test the email service using the test endpoint:

```bash
curl -X POST https://your-app.onrender.com/api/test-email \
  -H "Content-Type: application/json" \
  -d '{"to": "your-email@example.com"}'
```

Or use a tool like Postman to send a POST request to `/api/test-email` with:
```json
{
  "to": "your-email@example.com"
}
```

### 5. Common Resend Issues

#### Issue: "Domain not verified"
**Solution:** 
- Go to Resend dashboard → Domains
- Verify your domain is added and verified
- If using `@resend.dev`, make sure it's available for your account

#### Issue: "Invalid API key"
**Solution:**
- Verify your API key in Resend dashboard → API Keys
- Make sure you're using the correct key
- Regenerate the key if needed

#### Issue: "Email not received"
**Possible causes:**
1. **Check spam folder** - Emails might be going to spam
2. **Email address typo** - Verify the recipient email is correct
3. **Rate limiting** - Resend has rate limits on free tier
4. **Domain reputation** - New domains might have delivery issues

### 6. Verify Email in Resend Dashboard

1. Go to Resend dashboard → Emails
2. Check if emails are being sent
3. Look for any error messages
4. Check delivery status

### 7. Debug Steps

1. **Check server startup logs:**
   - Look for email configuration status messages
   - Verify environment variables are loaded

2. **Test with curl/Postman:**
   ```bash
   POST /api/test-email
   Body: {"to": "test@example.com"}
   ```

3. **Check browser console:**
   - Open browser DevTools
   - Check Network tab for `/api/send-email` requests
   - Look for error responses

4. **Check Render logs:**
   - Go to Render dashboard → Logs
   - Look for email-related error messages
   - Check for API errors from Resend

### 8. Email Format Issues

If emails are sent but formatting is wrong:
- Check HTML template in `js/email-service.js`
- Verify email client supports HTML emails
- Check if plain text version is working

### 9. Rate Limiting

Resend free tier has limits:
- 100 emails per day
- 3,000 emails per month

If you hit the limit, you'll need to upgrade or wait until the next period.

### 10. Still Not Working?

If emails still don't work after checking all above:

1. **Verify Resend account:**
   - Make sure your Resend account is active
   - Check if there are any account restrictions

2. **Check API response:**
   - Look at server logs for Resend API responses
   - Check for specific error messages

3. **Contact Support:**
   - Resend support: support@resend.com
   - Check Resend documentation: https://resend.com/docs

## Quick Test Checklist

- [ ] Environment variables set in Render
- [ ] `RESEND_API_KEY` is valid and active
- [ ] `FROM_EMAIL` is verified in Resend
- [ ] Domain is verified (if using custom domain)
- [ ] Server logs show email service configured
- [ ] Test email endpoint works
- [ ] Check spam folder
- [ ] Verify recipient email is correct
- [ ] Check Resend dashboard for sent emails
- [ ] Check rate limits

## Expected Server Logs (Success)

```
✅ RESEND_API_KEY is configured
✅ FROM_EMAIL is configured: voice-anchors@resend.dev
✅ Resend initialized successfully
📧 Attempting to send email to: user@example.com
   From: voice-anchors@resend.dev
   Subject: Welcome to Voice Anchors!
   Type: welcome
✅ Email sent successfully to user@example.com (welcome)
   Email ID: abc123...
```

## Expected Server Logs (Error)

```
❌ RESEND_API_KEY is not set. Cannot initialize Resend.
```

or

```
❌ Resend API error: {
  "message": "Invalid API key",
  "statusCode": 401
}
```

