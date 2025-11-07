# EmailJS Template Setup for Voice Anchors

## Recommended: Create a Custom Template

Instead of using a pre-made template, **create a new custom template** that will work for all email types (application confirmation, approval, rejection, password reset).

## Step-by-Step Template Creation

### 1. In EmailJS Dashboard
- Click **"Create Template"** (blue button in the dialog)
- Or go to **Email Templates** → **Create New Template**

### 2. Template Settings

**Template Name:** `Voice Anchors Emails` (or any name you prefer)

**Subject Line:**
```
{{subject}}
```

**Email Content (HTML or Plain Text):**

**Option A: Simple Text Template (Recommended)**
```
Hello {{to_name}},

{{message}}

Best regards,
{{from_name}}

---
Voice Anchors Community
Reply to: {{reply_to}}
```

**Option B: HTML Template (More Styled)**
```html
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #1a1a1a; color: #c0c0c0; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #f9f9f9; }
        .footer { text-align: center; padding: 20px; color: #888; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>Voice Anchors</h2>
        </div>
        <div class="content">
            <p>Hello {{to_name}},</p>
            <p>{{message}}</p>
            <p>Best regards,<br>{{from_name}}</p>
        </div>
        <div class="footer">
            <p>Voice Anchors Community</p>
            <p>Reply to: {{reply_to}}</p>
        </div>
    </div>
</body>
</html>
```

### 3. Template Variables to Use

Make sure your template includes these variables (they're automatically provided):
- `{{to_email}}` - Recipient's email address
- `{{to_name}}` - Recipient's name (extracted from email)
- `{{from_name}}` - "Voice Anchors"
- `{{subject}}` - Email subject line
- `{{message}}` - Email message body
- `{{reply_to}}` - Reply-to email (sowjeocaya@gmail.com)
- `{{reset_link}}` - For password reset emails only

### 4. Save and Get Template ID

1. Click **Save** or **Create Template**
2. You'll see the template in your list
3. Click on it to view details
4. Copy the **Template ID** (looks like `template_xxxxx` or `template_abc123`)

### 5. Update Your Code

Update `js/email-service.js` line 8:
```javascript
templateId: 'template_xxxxx'  // Paste your actual template ID here
```

## Alternative: Use "Contact Us" Template

If you want to use the pre-made "Contact Us" template:
1. Click on **"Contact Us"** in the template list
2. Click **"Use Template"** or **"Edit"**
3. Modify it to use the variables above
4. Save and get the Template ID

## Testing

After creating the template:
1. Update `js/email-service.js` with your Template ID
2. Submit a test application
3. Check browser console for "✅ Email sent successfully"
4. Check your Gmail sent folder

## Template Variables Reference

The code automatically sends these variables:
- `to_email`: User's email
- `to_name`: Name extracted from email
- `from_name`: "Voice Anchors"
- `subject`: Email subject
- `message`: Email body content
- `reply_to`: "sowjeocaya@gmail.com"
- `reset_link`: Password reset URL (for password reset emails only)

