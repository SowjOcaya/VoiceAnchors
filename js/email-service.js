// Email Service - Using EmailJS with Gmail Service
// Service ID: service_li9xyks
// Connected Gmail: sowjeocaya@gmail.com

// EmailJS Configuration
const EMAILJS_CONFIG = {
    serviceId: 'service_li9xyks',  // Your Gmail service ID
    templateId: 'Ytemplate_82fqa7j', // Replace with your EmailJS template ID (create in EmailJS dashboard)
    publicKey: 'MEBdI_7dQFvHdtmW2'    // Your EmailJS public key
};

// Check if EmailJS is loaded
function isEmailJSLoaded() {
    return typeof emailjs !== 'undefined';
}

// Initialize EmailJS (call this after EmailJS script loads)
function initEmailJS() {
    if (isEmailJSLoaded() && EMAILJS_CONFIG.publicKey && EMAILJS_CONFIG.publicKey !== 'YOUR_PUBLIC_KEY') {
        try {
            emailjs.init(EMAILJS_CONFIG.publicKey);
            console.log('✅ EmailJS initialized successfully with Gmail service');
            return true;
        } catch (error) {
            console.error('Error initializing EmailJS:', error);
            return false;
        }
    }
    return false;
}

// Auto-initialize when EmailJS loads
if (typeof window !== 'undefined') {
    // Wait for EmailJS to load, then initialize
    function waitForEmailJS() {
        if (isEmailJSLoaded()) {
            initEmailJS();
        } else {
            setTimeout(waitForEmailJS, 100);
        }
    }
    
    // Start waiting when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', waitForEmailJS);
    } else {
        waitForEmailJS();
    }
}

// Send application confirmation email
async function sendApplicationConfirmationEmail(email) {
    if (!isEmailJSLoaded() || EMAILJS_CONFIG.publicKey === 'YOUR_PUBLIC_KEY' || EMAILJS_CONFIG.templateId === 'YOUR_TEMPLATE_ID') {
        // Fallback: log to console
        console.log('📧 EmailJS not fully configured. Email would be sent to:', email);
        console.log('Subject: Voice Anchors Application Received');
        console.log('Body: We have received your Voice Anchors application. Please wait for further updates.');
        console.log('💡 Configure templateId and publicKey in js/email-service.js');
        return { success: false, message: 'EmailJS not configured' };
    }
    
    try {
        // EmailJS template variables (adjust based on your EmailJS template)
        const templateParams = {
            to_email: email,
            to_name: email.split('@')[0], // Extract name from email
            from_name: 'Voice Anchors',
            subject: 'Voice Anchors Application Received',
            message: 'We have received your Voice Anchors application. Please wait for further updates.',
            reply_to: 'sowjeocaya@gmail.com'
        };
        
        const response = await emailjs.send(
            EMAILJS_CONFIG.serviceId,
            EMAILJS_CONFIG.templateId,
            templateParams
        );
        console.log('✅ Application confirmation email sent successfully:', response);
        return { success: true, response };
    } catch (error) {
        console.error('❌ Error sending application confirmation email:', error);
        return { success: false, error };
    }
}

// Send approval email
async function sendApprovalEmail(email) {
    if (!isEmailJSLoaded() || EMAILJS_CONFIG.publicKey === 'YOUR_PUBLIC_KEY' || EMAILJS_CONFIG.templateId === 'YOUR_TEMPLATE_ID') {
        console.log('📧 EmailJS not fully configured. Approval email would be sent to:', email);
        return { success: false, message: 'EmailJS not configured' };
    }
    
    try {
        const templateParams = {
            to_email: email,
            to_name: email.split('@')[0],
            from_name: 'Voice Anchors',
            subject: 'Voice Anchors Application Approved',
            message: 'Congratulations! Your Voice Anchors application has been approved. Please wait for your membership account details via email.',
            reply_to: 'sowjeocaya@gmail.com'
        };
        
        const response = await emailjs.send(
            EMAILJS_CONFIG.serviceId,
            EMAILJS_CONFIG.templateId,
            templateParams
        );
        console.log('✅ Approval email sent successfully:', response);
        return { success: true, response };
    } catch (error) {
        console.error('❌ Error sending approval email:', error);
        return { success: false, error };
    }
}

// Send rejection email
async function sendRejectionEmail(email) {
    if (!isEmailJSLoaded() || EMAILJS_CONFIG.publicKey === 'YOUR_PUBLIC_KEY' || EMAILJS_CONFIG.templateId === 'YOUR_TEMPLATE_ID') {
        console.log('📧 EmailJS not fully configured. Rejection email would be sent to:', email);
        return { success: false, message: 'EmailJS not configured' };
    }
    
    try {
        const templateParams = {
            to_email: email,
            to_name: email.split('@')[0],
            from_name: 'Voice Anchors',
            subject: 'Voice Anchors Application Status',
            message: 'Thank you for your interest in Voice Anchors. Unfortunately, your application was not approved at this time.',
            reply_to: 'sowjeocaya@gmail.com'
        };
        
        const response = await emailjs.send(
            EMAILJS_CONFIG.serviceId,
            EMAILJS_CONFIG.templateId,
            templateParams
        );
        console.log('✅ Rejection email sent successfully:', response);
        return { success: true, response };
    } catch (error) {
        console.error('❌ Error sending rejection email:', error);
        return { success: false, error };
    }
}

// Send password reset email
async function sendPasswordResetEmail(email, resetLink) {
    if (!isEmailJSLoaded() || EMAILJS_CONFIG.publicKey === 'YOUR_PUBLIC_KEY' || EMAILJS_CONFIG.templateId === 'YOUR_TEMPLATE_ID') {
        console.log('📧 EmailJS not fully configured. Password reset email would be sent to:', email);
        console.log('Reset link:', resetLink);
        return { success: false, message: 'EmailJS not configured' };
    }
    
    try {
        const templateParams = {
            to_email: email,
            to_name: email.split('@')[0],
            from_name: 'Voice Anchors',
            subject: 'Voice Anchors - Password Reset',
            message: `You requested a password reset for your Voice Anchors account. Click the link below to reset your password:\n\n${resetLink}\n\nThis link will expire in 24 hours.\n\nIf you did not request this reset, please ignore this email.`,
            reset_link: resetLink,
            reply_to: 'sowjeocaya@gmail.com'
        };
        
        const response = await emailjs.send(
            EMAILJS_CONFIG.serviceId,
            EMAILJS_CONFIG.templateId,
            templateParams
        );
        console.log('✅ Password reset email sent successfully:', response);
        return { success: true, response };
    } catch (error) {
        console.error('❌ Error sending password reset email:', error);
        return { success: false, error };
    }
}

// Export functions
window.EmailService = {
    init: initEmailJS,
    sendApplicationConfirmation: sendApplicationConfirmationEmail,
    sendApproval: sendApprovalEmail,
    sendRejection: sendRejectionEmail,
    sendPasswordReset: sendPasswordResetEmail,
    isConfigured: () => isEmailJSLoaded() && 
                       EMAILJS_CONFIG.publicKey !== 'MEBdI_7dQFvHdtmW2' && 
                       EMAILJS_CONFIG.templateId !== 'template_82fqa7j'
};

