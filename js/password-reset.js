// Password Reset Functionality - Using Forge API

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
        // Setup forgot password link
        const forgotPasswordLink = document.getElementById('forgotPasswordLink');
        if (forgotPasswordLink) {
            forgotPasswordLink.addEventListener('click', function(e) {
                e.preventDefault();
                const modal = new bootstrap.Modal(document.getElementById('forgotPasswordModal'));
                modal.show();
            });
        }
        
        // Setup forgot password form
        const forgotPasswordForm = document.getElementById('forgotPasswordForm');
        if (forgotPasswordForm) {
            forgotPasswordForm.addEventListener('submit', handleForgotPassword);
        }
        
        // Setup reset password form
        const resetPasswordForm = document.getElementById('resetPasswordForm');
        if (resetPasswordForm) {
            resetPasswordForm.addEventListener('submit', handleResetPassword);
        }
        
        // Check for reset token in URL
        checkResetToken();
    });
});

function checkResetToken() {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    
    if (token) {
        // Show reset password modal
        document.getElementById('resetToken').value = token;
        const modal = new bootstrap.Modal(document.getElementById('resetPasswordModal'));
        modal.show();
        
        // Clean URL
        window.history.replaceState({}, document.title, window.location.pathname);
    }
}

async function handleForgotPassword(e) {
    e.preventDefault();
    
    const email = document.getElementById('resetEmail').value.trim();
    const successDiv = document.getElementById('forgotPasswordSuccess');
    const errorDiv = document.getElementById('forgotPasswordError');
    
    if (!email) {
        if (errorDiv) {
            errorDiv.textContent = 'Please enter your email address';
            errorDiv.classList.remove('d-none');
            if (successDiv) successDiv.classList.add('d-none');
        }
        return;
    }
    
    try {
        // Check if member exists with this email
        const { data: members, error: searchError } = await window.ForgeAPI.DB.select('members', {
            filters: { email: email }
        });
        
        if (searchError) {
            throw searchError;
        }
        
        if (!members || members.length === 0) {
            if (errorDiv) {
                errorDiv.textContent = 'No account found with this email address';
                errorDiv.classList.remove('d-none');
                if (successDiv) successDiv.classList.add('d-none');
            }
            return;
        }
        
        const member = members[0];
        
        // Generate reset token
        const token = generateResetToken();
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24); // Token expires in 24 hours
        
        // Create password reset record
        const resetRecord = {
            member_id: member.id,
            email: email,
            token: token,
            expires_at: expiresAt.toISOString(),
            used: false
        };
        
        const { data: createdReset, error: resetError } = await window.ForgeAPI.DB.insert('password_resets', resetRecord);
        
        if (resetError) {
            throw resetError;
        }
        
        // Send reset email with link
        await sendPasswordResetEmail(email, token);
        
        // Show success message
        if (successDiv) {
            successDiv.textContent = 'Password reset link has been sent to your email. Please check your inbox.';
            successDiv.classList.remove('d-none');
            if (errorDiv) errorDiv.classList.add('d-none');
        }
        
        // Reset form
        document.getElementById('forgotPasswordForm').reset();
        
    } catch (error) {
        console.error('Error processing password reset:', error);
        if (errorDiv) {
            errorDiv.textContent = error.message || 'Error processing request. Please try again.';
            errorDiv.classList.remove('d-none');
            if (successDiv) successDiv.classList.add('d-none');
        }
    }
}

async function handleResetPassword(e) {
    e.preventDefault();
    
    const token = document.getElementById('resetToken').value;
    const newPassword = document.getElementById('newPasswordReset').value;
    const confirmPassword = document.getElementById('confirmPasswordReset').value;
    const successDiv = document.getElementById('resetPasswordSuccess');
    const errorDiv = document.getElementById('resetPasswordError');
    
    // Validate passwords
    if (newPassword.length < 6) {
        if (errorDiv) {
            errorDiv.textContent = 'Password must be at least 6 characters long';
            errorDiv.classList.remove('d-none');
            if (successDiv) successDiv.classList.add('d-none');
        }
        return;
    }
    
    if (newPassword !== confirmPassword) {
        if (errorDiv) {
            errorDiv.textContent = 'Passwords do not match';
            errorDiv.classList.remove('d-none');
            if (successDiv) successDiv.classList.add('d-none');
        }
        return;
    }
    
    try {
        // Find reset record
        const { data: resetRecords, error: searchError } = await window.ForgeAPI.DB.select('password_resets', {
            filters: { token: token }
        });
        
        if (searchError) {
            throw searchError;
        }
        
        if (!resetRecords || resetRecords.length === 0) {
            if (errorDiv) {
                errorDiv.textContent = 'Invalid or expired reset token';
                errorDiv.classList.remove('d-none');
                if (successDiv) successDiv.classList.add('d-none');
            }
            return;
        }
        
        const resetRecord = resetRecords[0];
        
        // Check if token is used or expired
        if (resetRecord.used) {
            if (errorDiv) {
                errorDiv.textContent = 'This reset link has already been used';
                errorDiv.classList.remove('d-none');
                if (successDiv) successDiv.classList.add('d-none');
            }
            return;
        }
        
        const expiresAt = new Date(resetRecord.expires_at);
        if (expiresAt < new Date()) {
            if (errorDiv) {
                errorDiv.textContent = 'This reset link has expired. Please request a new one.';
                errorDiv.classList.remove('d-none');
                if (successDiv) successDiv.classList.add('d-none');
            }
            return;
        }
        
        // Update member password
        const { error: updateError } = await window.ForgeAPI.DB.update(
            'members',
            { id: resetRecord.member_id },
            { password: newPassword }
        );
        
        if (updateError) {
            throw updateError;
        }
        
        // Mark reset token as used
        await window.ForgeAPI.DB.update(
            'password_resets',
            { id: resetRecord.id },
            { used: true }
        );
        
        // Show success message
        if (successDiv) {
            successDiv.textContent = 'Password reset successfully! You can now login with your new password.';
            successDiv.classList.remove('d-none');
            if (errorDiv) errorDiv.classList.add('d-none');
        }
        
        // Redirect to login after 2 seconds
        setTimeout(() => {
            const modal = bootstrap.Modal.getInstance(document.getElementById('resetPasswordModal'));
            if (modal) {
                modal.hide();
            }
            window.location.href = 'MemberLogin.html';
        }, 2000);
        
    } catch (error) {
        console.error('Error resetting password:', error);
        if (errorDiv) {
            errorDiv.textContent = error.message || 'Error resetting password. Please try again.';
            errorDiv.classList.remove('d-none');
            if (successDiv) successDiv.classList.add('d-none');
        }
    }
}

function generateResetToken() {
    // Generate a secure random token
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

async function sendPasswordResetEmail(email, token) {
    // Get current domain for reset link
    const resetUrl = `${window.location.origin}${window.location.pathname}?token=${token}`;
    
    if (window.EmailService && window.EmailService.isConfigured()) {
        await window.EmailService.sendPasswordReset(email, resetUrl);
    } else {
        // Fallback: log to console
        const emailContent = {
            to: email,
            from: 'noreply@voiceanchors.com',
            subject: 'Voice Anchors - Password Reset',
            body: `You requested a password reset for your Voice Anchors account. Click the link below to reset your password:\n\n${resetUrl}\n\nThis link will expire in 24 hours.\n\nIf you did not request this reset, please ignore this email.`
        };
        console.log('📧 Password reset email to send:', emailContent);
        console.log('💡 To enable email sending, configure EmailJS in js/email-service.js');
    }
}

