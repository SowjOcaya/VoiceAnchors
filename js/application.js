// Application Form Handler - Using Forge API

// Wait for ForgeAPI to be loaded
function waitForForgeAPI(callback) {
    if (window.ForgeAPI) {
        callback();
    } else {
        setTimeout(() => waitForForgeAPI(callback), 100);
    }
}

let applicationData = {
    email: '',
    tiktokUsername: ''
};

document.addEventListener('DOMContentLoaded', function() {
    waitForForgeAPI(() => {
        // Setup initial application form
        const applicationForm = document.getElementById('applicationForm');
        if (applicationForm) {
            applicationForm.addEventListener('submit', handleInitialApplication);
        }
        
        // Setup application details form
        const applicationDetailsForm = document.getElementById('applicationDetailsForm');
        if (applicationDetailsForm) {
            applicationDetailsForm.addEventListener('submit', handleApplicationSubmission);
        }
    });
});

function handleInitialApplication(e) {
    e.preventDefault();
    
    const email = document.getElementById('applicantEmail').value.trim();
    const tiktokUsername = document.getElementById('tiktokUsername').value.trim();
    const errorDiv = document.getElementById('applicationError');
    
    // Validate inputs
    if (!email || !tiktokUsername) {
        if (errorDiv) {
            errorDiv.textContent = 'Please fill in all fields';
            errorDiv.classList.remove('d-none');
        }
        return;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        if (errorDiv) {
            errorDiv.textContent = 'Please enter a valid email address';
            errorDiv.classList.remove('d-none');
        }
        return;
    }
    
    // Store application data
    applicationData.email = email;
    applicationData.tiktokUsername = tiktokUsername;
    
    // Hide error
    if (errorDiv) {
        errorDiv.classList.add('d-none');
    }
    
    // Show application details modal
    const modalElement = document.getElementById('applicationDetailsModal');
    if (modalElement) {
        // Remove any existing modal instances
        const existingModal = bootstrap.Modal.getInstance(modalElement);
        if (existingModal) {
            existingModal.dispose();
        }
        
        // Create and show new modal
        const modal = new bootstrap.Modal(modalElement, {
            backdrop: true,
            keyboard: true,
            focus: true
        });
        
        // Ensure modal is fully initialized before showing
        setTimeout(() => {
            modal.show();
            
            // Focus on first input after modal is shown
            modalElement.addEventListener('shown.bs.modal', function() {
                const firstInput = modalElement.querySelector('#applicationReason');
                if (firstInput) {
                    setTimeout(() => firstInput.focus(), 100);
                }
            }, { once: true });
        }, 50);
    }
}

async function handleApplicationSubmission(e) {
    e.preventDefault();
    
    const reason = document.getElementById('applicationReason').value.trim();
    const impersonationChoice = document.getElementById('impersonationChoice').value;
    const errorDiv = document.getElementById('applicationDetailsError');
    
    // Validate inputs
    if (!reason || !impersonationChoice) {
        if (errorDiv) {
            errorDiv.textContent = 'Please fill in all fields';
            errorDiv.classList.remove('d-none');
        }
        return;
    }
    
    try {
        // Create application in Forge database
        const application = {
            email: applicationData.email,
            tiktok_username: applicationData.tiktokUsername,
            reason: reason,
            impersonation_choice: impersonationChoice,
            status: 'pending'
        };
        
        const { data: createdApplication, error } = await window.ForgeAPI.DB.insert('applications', application);
        
        if (error) {
            throw error;
        }
        
        // Send confirmation email
        await sendApplicationConfirmationEmail(applicationData.email);
        
        // Hide error
        if (errorDiv) {
            errorDiv.classList.add('d-none');
        }
        
        // Close details modal
        const detailsModal = bootstrap.Modal.getInstance(document.getElementById('applicationDetailsModal'));
        if (detailsModal) {
            detailsModal.hide();
        }
        
        // Show success modal
        const successModal = new bootstrap.Modal(document.getElementById('applicationSuccessModal'));
        successModal.show();
        
        // Reset forms
        document.getElementById('applicationForm').reset();
        document.getElementById('applicationDetailsForm').reset();
        applicationData = { email: '', tiktokUsername: '' };
        
    } catch (error) {
        console.error('Error submitting application:', error);
        if (errorDiv) {
            errorDiv.textContent = error.message || 'Error submitting application. Please try again.';
            errorDiv.classList.remove('d-none');
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

