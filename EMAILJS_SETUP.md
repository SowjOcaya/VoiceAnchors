# EmailJS Setup Guide for Voice Anchors

## Current Configuration

✅ **Service ID**: `service_li9xyks` (Gmail service)  
✅ **Connected Email**: `sowjeocaya@gmail.com`  
⏳ **Template ID**: Need to create in EmailJS dashboard  
⏳ **Public Key**: Need to get from EmailJS Account settings

## Quick Setup Steps

### 1. Get Your Public Key

1. Go to [EmailJS Dashboard](https://dashboard.emailjs.com/)
2. Click on **Account** (top right)
3. Go to **General** tab
4. Copy your **Public Key**
5. Update `js/email-service.js`:
   ```javascript
   publicKey: 'your_public_key_here'
   ```

### 2. Create Email Templates

You need to create templates in EmailJS for each email type:

#### Template 1: Application Confirmation
1. Go to **Email Templates** in EmailJS dashboard
2. Click **Create New Template**
3. Name: "Application Confirmation"
4. Template variables to use:
   - `{{to_email}}` - Recipient email
   - `{{to_name}}` - Recipient name
   - `{{from_name}}` - Voice Anchors
   - `{{subject}}` - Email subject
   - `{{message}}` - Email message body
   - `{{reply_to}}` - Reply-to email

5. Copy the **Template ID** and update `js/email-service.js`:
   ```javascript
   templateId: 'your_template_id_here'
   ```

#### Template 2: Application Approval
- Same process, name it "Application Approval"
- Use same template variables

#### Template 3: Application Rejection
- Same process, name it "Application Rejection"
- Use same template variables

#### Template 4: Password Reset
- Same process, name it "Password Reset"
- Use template variables including `{{reset_link}}`

### 3. Template Example

Here's a sample template HTML you can use:

```html
Subject: {{subject}}

Hello {{to_name}},

{{message}}

Best regards,
{{from_name}}

Reply to: {{reply_to}}
```

### 4. Test Email Sending

After configuring:
1. Submit a test application
2. Check browser console for email sending status
3. Check your Gmail inbox (sowjeocaya@gmail.com) for sent emails

## Current Status

- ✅ EmailJS script loaded
- ✅ Gmail service connected
- ⏳ Waiting for Template ID and Public Key configuration

## Notes

- All emails will be sent from: `sowjeocaya@gmail.com`
- 500 emails per day limit (Gmail free tier)
- Emails are sent in real-time when actions occur
- Check browser console for email sending logs

