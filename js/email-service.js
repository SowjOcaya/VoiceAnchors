// Email Service - Using Resend.dev
// All emails are sent via server endpoint to keep API key secure

const EMAIL_CONFIG = {
    apiEndpoint: '/api/send-email',
    fromName: 'Voice Anchors',
    fromEmail: 'voice-anchors@resend.dev' // This will be set by server
};

// Check if email service is available
function isEmailServiceAvailable() {
    return typeof fetch !== 'undefined';
}

// Send email via Resend API (through server endpoint)
async function sendEmail(to, subject, html, text, type = 'general') {
    if (!isEmailServiceAvailable()) {
        console.warn('📧 Email service not available (fetch not supported)');
        return { success: false, message: 'Email service not available' };
    }

    try {
        const response = await fetch(EMAIL_CONFIG.apiEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                to,
                subject,
                html,
                text,
                type
            })
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
            const errorMsg = result.error || 'Failed to send email';
            console.error('❌ Email API error:', errorMsg);
            console.error('   Response:', result);
            throw new Error(errorMsg);
        }

        console.log('✅ Email sent successfully:', result);
        return result;
    } catch (error) {
        console.error('❌ Error sending email:', error);
        // If it's a network error, provide helpful message
        if (error.message.includes('fetch') || error.message.includes('Network')) {
            return { 
                success: false, 
                error: 'Network error: Could not reach email server. Please check your connection and try again.' 
            };
        }
        return { success: false, error: error.message || 'Failed to send email' };
    }
}

// Send application confirmation email
async function sendApplicationConfirmationEmail(email) {
    const subject = 'Voice Anchors Application Received';
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🎉 Application Received!</h1>
                </div>
                <div class="content">
                    <p>Hello,</p>
                    <p>Thank you for applying to join <strong>Voice Anchors</strong>!</p>
                    <p>We have received your application and our team will review it shortly. You will receive an update via email once the review is complete.</p>
                    <p>Please be patient as we carefully review each application.</p>
                    <p>Best regards,<br>The Voice Anchors Team</p>
                </div>
            </div>
        </body>
        </html>
    `;
    const text = `Thank you for applying to join Voice Anchors! We have received your application and our team will review it shortly. You will receive an update via email once the review is complete.`;

    return await sendEmail(email, subject, html, text, 'application_confirmation');
}

// Send approval email
async function sendApprovalEmail(email, username = null, password = null) {
    const subject = '🎉 Voice Anchors Application Approved!';
    const loginInfo = username && password 
        ? `<p><strong>Your login credentials:</strong></p>
           <p>Username: <code>${username}</code><br>
           Password: <code>${password}</code></p>
           <p>Please log in and change your password after your first login.</p>`
        : '<p>Your membership account details will be sent to you shortly.</p>';

    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                .credentials { background: #fff; padding: 20px; border-left: 4px solid #11998e; margin: 20px 0; }
                code { background: #f4f4f4; padding: 2px 6px; border-radius: 3px; font-family: monospace; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🎉 Congratulations!</h1>
                </div>
                <div class="content">
                    <p>Hello,</p>
                    <p>Great news! Your <strong>Voice Anchors</strong> application has been <strong>approved</strong>!</p>
                    ${loginInfo}
                    <p>Welcome to the Voice Anchors community! We're excited to have you on board.</p>
                    <p>Best regards,<br>The Voice Anchors Team</p>
                </div>
            </div>
        </body>
        </html>
    `;
    const text = `Congratulations! Your Voice Anchors application has been approved! ${username && password ? `Your login credentials: Username: ${username}, Password: ${password}` : 'Your membership account details will be sent to you shortly.'}`;

    return await sendEmail(email, subject, html, text, 'application_approval');
}

// Send rejection email
async function sendRejectionEmail(email) {
    const subject = 'Voice Anchors Application Status';
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Application Status Update</h1>
                </div>
                <div class="content">
                    <p>Hello,</p>
                    <p>Thank you for your interest in joining <strong>Voice Anchors</strong>.</p>
                    <p>After careful consideration, we regret to inform you that your application was not approved at this time.</p>
                    <p>We appreciate you taking the time to apply, and we encourage you to apply again in the future.</p>
                    <p>Best regards,<br>The Voice Anchors Team</p>
                </div>
            </div>
        </body>
        </html>
    `;
    const text = `Thank you for your interest in joining Voice Anchors. After careful consideration, we regret to inform you that your application was not approved at this time. We appreciate you taking the time to apply, and we encourage you to apply again in the future.`;

    return await sendEmail(email, subject, html, text, 'application_rejection');
}

// Send password reset email
async function sendPasswordResetEmail(email, resetLink) {
    const subject = 'Voice Anchors - Password Reset Request';
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🔐 Password Reset</h1>
                </div>
                <div class="content">
                    <p>Hello,</p>
                    <p>You requested a password reset for your <strong>Voice Anchors</strong> account.</p>
                    <p>Click the button below to reset your password:</p>
                    <p style="text-align: center;">
                        <a href="${resetLink}" class="button">Reset Password</a>
                    </p>
                    <p>Or copy and paste this link into your browser:</p>
                    <p style="word-break: break-all; color: #667eea;">${resetLink}</p>
                    <div class="warning">
                        <strong>⚠️ Important:</strong> This link will expire in 24 hours. If you did not request this password reset, please ignore this email.
                    </div>
                    <p>Best regards,<br>The Voice Anchors Team</p>
                </div>
            </div>
        </body>
        </html>
    `;
    const text = `You requested a password reset for your Voice Anchors account. Click the link below to reset your password:\n\n${resetLink}\n\nThis link will expire in 24 hours. If you did not request this reset, please ignore this email.`;

    return await sendEmail(email, subject, html, text, 'password_reset');
}

// Send welcome email (for new members)
async function sendWelcomeEmail(email, username, password) {
    const subject = 'Welcome to Voice Anchors!';
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                .credentials { background: #fff; padding: 20px; border-left: 4px solid #667eea; margin: 20px 0; }
                code { background: #f4f4f4; padding: 2px 6px; border-radius: 3px; font-family: monospace; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>👋 Welcome to Voice Anchors!</h1>
                </div>
                <div class="content">
                    <p>Hello,</p>
                    <p>Welcome to <strong>Voice Anchors</strong>! Your account has been created successfully.</p>
                    <div class="credentials">
                        <p><strong>Your login credentials:</strong></p>
                        <p>Username: <code>${username}</code><br>
                        Password: <code>${password}</code></p>
                    </div>
                    <p><strong>Please log in and change your password after your first login for security.</strong></p>
                    <p>We're excited to have you as part of our community!</p>
                    <p>Best regards,<br>The Voice Anchors Team</p>
                </div>
            </div>
        </body>
        </html>
    `;
    const text = `Welcome to Voice Anchors! Your account has been created. Username: ${username}, Password: ${password}. Please log in and change your password after your first login.`;

    return await sendEmail(email, subject, html, text, 'welcome');
}

// Export functions
window.EmailService = {
    sendApplicationConfirmation: sendApplicationConfirmationEmail,
    sendApproval: sendApprovalEmail,
    sendRejection: sendRejectionEmail,
    sendPasswordReset: sendPasswordResetEmail,
    sendWelcome: sendWelcomeEmail,
    isConfigured: () => isEmailServiceAvailable()
};
