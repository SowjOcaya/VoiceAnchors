# Email Integration Guide

The Voice Anchors website includes email functionality for:
- Application confirmations
- Application approval/rejection notifications
- Password reset links

## Current Implementation

Currently, email functions are stubbed out and log to the console. To enable actual email sending, integrate one of the following services:

## Option 1: EmailJS (Recommended for Quick Setup)

1. Sign up at [EmailJS](https://www.emailjs.com/)
2. Create an email service
3. Get your Service ID, Template ID, and Public Key
4. Add to `js/email-service.js`:

```javascript
// Install: npm install @emailjs/browser
import emailjs from '@emailjs/browser';

emailjs.init('YOUR_PUBLIC_KEY');

async function sendEmail(templateParams) {
    return emailjs.send('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', templateParams);
}
```

## Option 2: Resend API

1. Sign up at [Resend](https://resend.com/)
2. Get your API key
3. Create an edge function in Forge or use a server endpoint
4. Update email functions to call the API

## Option 3: Forge Edge Function

Create a Forge edge function for email sending:

```javascript
// In Forge edge function
module.exports = async function(request) {
    const { to, subject, body } = await request.json();
    
    // Use a service like Resend, SendGrid, or SMTP
    // Example with fetch to external email API
    
    return new Response(JSON.stringify({ success: true }), {
        headers: { 'Content-Type': 'application/json' }
    });
}
```

Then update `js/application.js` and `js/password-reset.js` to call:
```javascript
await forgeClient.functions.invoke('send-email', {
    body: { to, subject, body }
});
```

## Email Templates Needed

### Application Confirmation
- **To**: Applicant email
- **Subject**: "Voice Anchors Application Received"
- **Body**: "We have received your Voice Anchors application. Please wait for further updates."

### Application Approval
- **To**: Applicant email
- **Subject**: "Voice Anchors Application Approved"
- **Body**: "Congratulations! Your Voice Anchors application has been approved. Please wait for your membership account details via email."

### Application Rejection
- **To**: Applicant email
- **Subject**: "Voice Anchors Application Status"
- **Body**: "Thank you for your interest in Voice Anchors. Unfortunately, your application was not approved at this time."

### Password Reset
- **To**: Member email
- **Subject**: "Voice Anchors - Password Reset"
- **Body**: "Click the link to reset your password: [RESET_LINK]"

## Quick Start with EmailJS

1. Add EmailJS script to HTML:
```html
<script src="https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js"></script>
```

2. Update `js/application.js`:
```javascript
async function sendApplicationConfirmationEmail(email) {
    emailjs.send('service_id', 'template_id', {
        to_email: email,
        message: 'We have received your Voice Anchors application...'
    });
}
```

## Testing

For development, emails are logged to the console. Check browser console to see email content.



