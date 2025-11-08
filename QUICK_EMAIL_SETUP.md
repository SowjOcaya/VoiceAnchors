# Quick Email Setup - Almost Ready! 🚀

## ✅ What's Already Configured

- ✅ **Service ID**: `service_li9xyks` (Gmail)
- ✅ **Public Key**: `MEBdI_7dQFvHdtmW2`
- ✅ **Connected Email**: `sowjeocaya@gmail.com`
- ✅ **EmailJS Script**: Loaded on all pages

## ⏳ One Step Remaining

You just need to **create an email template** in EmailJS and add the Template ID.

### Steps:

1. Go to [EmailJS Dashboard](https://dashboard.emailjs.com/)
2. Click **Email Templates** in the sidebar
3. Click **Create New Template**
4. Name it: "Voice Anchors Emails" (or any name you prefer)
5. In the template editor, use these variables:

**Template Content:**
```
Subject: {{subject}}

Hello {{to_name}},

{{message}}

Best regards,
{{from_name}}

Reply to: {{reply_to}}
```

6. **Save** the template
7. Copy the **Template ID** (it will look like `template_xxxxx`)
8. Update `js/email-service.js` line 8:
   ```javascript
   templateId: 'template_xxxxx'  // Paste your template ID here
   ```

## That's It! 🎉

Once you add the Template ID, all emails will work:
- ✅ Application confirmations
- ✅ Approval emails
- ✅ Rejection emails  
- ✅ Password reset emails

All emails will be sent from: **sowjeocaya@gmail.com**

## Testing

After adding the Template ID:
1. Submit a test application
2. Check browser console - should show "✅ Email sent successfully"
3. Check your Gmail sent folder to verify emails are being sent



