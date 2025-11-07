// Member Dashboard Functionality - Using Forge API

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
        // Load member data
        loadMemberData();
        
        // Setup change password form
        const changePasswordForm = document.getElementById('changePasswordForm');
        if (changePasswordForm) {
            changePasswordForm.addEventListener('submit', handleChangePassword);
        }
        
        // Setup edit profile form
        const editProfileForm = document.getElementById('editProfileForm');
        if (editProfileForm) {
            editProfileForm.addEventListener('submit', handleEditProfile);
        }
        
        // Setup profile picture preview
        const profilePictureInput = document.getElementById('profilePicture');
        if (profilePictureInput) {
            profilePictureInput.addEventListener('change', handleProfilePictureChange);
        }
    });
});

async function loadMemberData() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    
    if (!currentUser || !currentUser.id) {
        window.location.href = 'MemberLogin.html';
        return;
    }
    
    try {
        // Fetch latest member data from Forge
        const { data: members, error } = await window.ForgeAPI.DB.select('members', {
            filters: { id: currentUser.id }
        });
        
        if (error) {
            throw error;
        }
        
        const member = members && members.length > 0 ? members[0] : currentUser;
        
        // Update display name in header
        const memberDisplayName = document.getElementById('memberDisplayName');
        if (memberDisplayName) {
            memberDisplayName.textContent = member.display_name || member.username;
        }
        
        // Load profile data into form
        const displayNameInput = document.getElementById('displayName');
        const bioInput = document.getElementById('bio');
        const tiktokLinkInput = document.getElementById('tiktokLink');
        const profilePicturePreview = document.getElementById('profilePicturePreview');
        
        if (displayNameInput) {
            displayNameInput.value = member.display_name || member.username;
        }
        
        if (bioInput) {
            bioInput.value = member.bio || '';
        }
        
        if (tiktokLinkInput) {
            tiktokLinkInput.value = member.tiktok_link || '';
        }
        
        if (profilePicturePreview) {
            if (member.profile_picture_url) {
                profilePicturePreview.src = member.profile_picture_url;
            } else {
                profilePicturePreview.src = 'https://via.placeholder.com/150';
            }
        }
        
        // Update current user in localStorage
        localStorage.setItem('currentUser', JSON.stringify(member));
    } catch (error) {
        console.error('Error loading member data:', error);
        // Fallback to localStorage data
        const memberDisplayName = document.getElementById('memberDisplayName');
        if (memberDisplayName) {
            memberDisplayName.textContent = currentUser.display_name || currentUser.username;
        }
    }
}

async function handleChangePassword(e) {
    e.preventDefault();
    
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    const successDiv = document.getElementById('changePasswordSuccess');
    const errorDiv = document.getElementById('changePasswordError');
    const changePasswordForm = document.getElementById('changePasswordForm');
    
    // Get current user
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    if (!currentUser || !currentUser.id) {
        window.location.href = 'MemberLogin.html';
        return;
    }
    
    // Validate current password
    if (currentPassword !== currentUser.password) {
        if (errorDiv) {
            errorDiv.textContent = 'Current password is incorrect';
            errorDiv.classList.remove('d-none');
            if (successDiv) successDiv.classList.add('d-none');
        }
        return;
    }
    
    // Validate new password
    if (newPassword.length < 6) {
        if (errorDiv) {
            errorDiv.textContent = 'New password must be at least 6 characters long';
            errorDiv.classList.remove('d-none');
            if (successDiv) successDiv.classList.add('d-none');
        }
        return;
    }
    
    // Validate password confirmation
    if (newPassword !== confirmPassword) {
        if (errorDiv) {
            errorDiv.textContent = 'New passwords do not match';
            errorDiv.classList.remove('d-none');
            if (successDiv) successDiv.classList.add('d-none');
        }
        return;
    }
    
    try {
        // Update password in Forge database
        const { data: updatedMember, error } = await window.ForgeAPI.DB.update(
            'members',
            { id: currentUser.id },
            { password: newPassword }
        );
        
        if (error) {
            throw error;
        }
        
        // Update current user session
        currentUser.password = newPassword;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        // Show success message
        if (successDiv) {
            successDiv.textContent = 'Password changed successfully!';
            successDiv.classList.remove('d-none');
            if (errorDiv) errorDiv.classList.add('d-none');
        }
        
        // Reset form
        if (changePasswordForm) changePasswordForm.reset();
    } catch (error) {
        console.error('Error changing password:', error);
        if (errorDiv) {
            errorDiv.textContent = error.message || 'Error changing password. Please try again.';
            errorDiv.classList.remove('d-none');
            if (successDiv) successDiv.classList.add('d-none');
        }
    }
}

async function handleEditProfile(e) {
    e.preventDefault();
    
    const displayName = document.getElementById('displayName').value.trim();
    const bio = document.getElementById('bio').value.trim();
    const tiktokLink = document.getElementById('tiktokLink').value.trim();
    
    const successDiv = document.getElementById('editProfileSuccess');
    const errorDiv = document.getElementById('editProfileError');
    
    // Get current user
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    if (!currentUser || !currentUser.id) {
        window.location.href = 'MemberLogin.html';
        return;
    }
    
    // Validate display name
    if (!displayName) {
        if (errorDiv) {
            errorDiv.textContent = 'Display name is required';
            errorDiv.classList.remove('d-none');
            if (successDiv) successDiv.classList.add('d-none');
        }
        return;
    }
    
    try {
        const profilePictureInput = document.getElementById('profilePicture');
        let profilePictureUrl = currentUser.profile_picture_url || '';
        
        // Handle profile picture upload if provided
        if (profilePictureInput && profilePictureInput.files.length > 0) {
            const file = profilePictureInput.files[0];
            
            // Upload to Forge storage
            const fileName = `profile-${currentUser.id}-${Date.now()}.${file.name.split('.').pop()}`;
            const bucket = 'profile-pictures';
            
            const { data: uploadData, error: uploadError } = await window.ForgeAPI.Storage.upload(
                bucket,
                fileName,
                file
            );
            
            if (uploadError) {
                throw uploadError;
            }
            
            profilePictureUrl = uploadData.url;
        }
        
        // Update member profile in Forge database
        const updates = {
            display_name: displayName,
            bio: bio,
            tiktok_link: tiktokLink,
            profile_picture_url: profilePictureUrl
        };
        
        const { data: updatedMember, error } = await window.ForgeAPI.DB.update(
            'members',
            { id: currentUser.id },
            updates
        );
        
        if (error) {
            throw error;
        }
        
        // Update current user session
        Object.assign(currentUser, updates);
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        // Update display
        loadMemberData();
        
        // Show success message
        if (successDiv) {
            successDiv.textContent = 'Profile updated successfully!';
            successDiv.classList.remove('d-none');
            if (errorDiv) errorDiv.classList.add('d-none');
        }
    } catch (error) {
        console.error('Error updating profile:', error);
        if (errorDiv) {
            errorDiv.textContent = error.message || 'Error updating profile. Please try again.';
            errorDiv.classList.remove('d-none');
            if (successDiv) successDiv.classList.add('d-none');
        }
    }
}

function handleProfilePictureChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    const preview = document.getElementById('profilePicturePreview');
    
    reader.onload = function(e) {
        if (preview) {
            preview.src = e.target.result;
        }
    };
    
    reader.readAsDataURL(file);
}
