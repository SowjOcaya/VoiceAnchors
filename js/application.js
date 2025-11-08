// Application Form Handler - Using Forge API

// Wait for ForgeAPI to be loaded
function waitForForgeAPI(callback) {
    if (window.ForgeAPI) {
        callback();
    } else {
        setTimeout(() => waitForForgeAPI(callback), 100);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    waitForForgeAPI(() => {
        // Setup application form
        const applicationForm = document.getElementById('applicationForm');
        if (applicationForm) {
            applicationForm.addEventListener('submit', handleApplicationSubmission);
        }
    });
});

async function handleApplicationSubmission(e) {
    e.preventDefault();
    
    const email = document.getElementById('applicantEmail').value.trim();
    const tiktokUsername = document.getElementById('tiktokUsername').value.trim();
    const errorDiv = document.getElementById('applicationError');
    const successDiv = document.getElementById('applicationSuccess');
    const submitBtn = document.getElementById('submitApplicationBtn');
    
    // Validate inputs
    if (!email || !tiktokUsername) {
        if (errorDiv) {
            errorDiv.textContent = 'Please fill in all fields';
            errorDiv.classList.remove('d-none');
            if (successDiv) successDiv.classList.add('d-none');
        }
        return;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        if (errorDiv) {
            errorDiv.textContent = 'Please enter a valid email address';
            errorDiv.classList.remove('d-none');
            if (successDiv) successDiv.classList.add('d-none');
        }
        return;
    }
    
    // Clean TikTok username (remove @ if present)
    const cleanTiktokUsername = tiktokUsername.replace(/^@+/, '');
    
    // Disable submit button to prevent double submission
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Submitting...';
    }
    
    // Hide previous messages
    if (errorDiv) errorDiv.classList.add('d-none');
    if (successDiv) successDiv.classList.add('d-none');
    
    try {
        // Create application in database
        const application = {
            email: email,
            tiktok_username: cleanTiktokUsername,
            status: 'pending'
        };
        
        const { data: createdApplication, error } = await window.ForgeAPI.DB.insert('applications', application);
        
        if (error) {
            throw error;
        }
        
        // Send confirmation email
        await sendApplicationConfirmationEmail(email);
        
        // Show success message
        if (successDiv) {
            successDiv.textContent = 'Application submitted successfully! Please check your email for updates.';
            successDiv.classList.remove('d-none');
            if (errorDiv) errorDiv.classList.add('d-none');
        }
        
        // Reset form
        document.getElementById('applicationForm').reset();
        
        // Show success modal
        const successModalElement = document.getElementById('applicationSuccessModal');
        if (successModalElement) {
            const successModal = new bootstrap.Modal(successModalElement);
            successModal.show();
        }
        
    } catch (error) {
        console.error('Error submitting application:', error);
        if (errorDiv) {
            errorDiv.textContent = error.message || 'Error submitting application. Please try again.';
            errorDiv.classList.remove('d-none');
            if (successDiv) successDiv.classList.add('d-none');
        }
    } finally {
        // Re-enable submit button
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-paper-plane me-2"></i>Submit Application';
        }
    }
}

// Email service - uses EmailService if available, otherwise logs to console
async function sendApplicationConfirmationEmail(email) {
    if (window.EmailService && window.EmailService.isConfigured()) {
        await window.EmailService.sendApplicationConfirmation(email);
    } else {
        // Fallback: log to console
        const emailContent = {
            to: email,
            from: 'noreply@voiceanchors.com',
            subject: 'Voice Anchors Application Received',
            body: 'We have received your Voice Anchors application. Please wait for further updates.'
        };
        console.log('📧 Email to send:', emailContent);
        console.log('💡 To enable email sending, configure EmailJS in js/email-service.js');
    }
}

// Export for use in admin panel
window.sendApprovalEmail = async function(email) {
    if (window.EmailService && window.EmailService.isConfigured()) {
        await window.EmailService.sendApproval(email);
    } else {
        const emailContent = {
            to: email,
            from: 'noreply@voiceanchors.com',
            subject: 'Voice Anchors Application Approved',
            body: 'Congratulations! Your Voice Anchors application has been approved. Please wait for your membership account details via email.'
        };
        console.log('📧 Approval email to send:', emailContent);
    }
};

window.sendRejectionEmail = async function(email) {
    if (window.EmailService && window.EmailService.isConfigured()) {
        await window.EmailService.sendRejection(email);
    } else {
        const emailContent = {
            to: email,
            from: 'noreply@voiceanchors.com',
            subject: 'Voice Anchors Application Status',
            body: 'Thank you for your interest in Voice Anchors. Unfortunately, your application was not approved at this time.'
        };
        console.log('📧 Rejection email to send:', emailContent);
    }
};

