// Admin Dashboard Functionality - Using Forge API

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
        // Setup create member form
        const createMemberForm = document.getElementById('createMemberForm');
        if (createMemberForm) {
            createMemberForm.addEventListener('submit', handleCreateMember);
        }
        
        // Setup upload media form
        const uploadMediaForm = document.getElementById('uploadMediaForm');
        if (uploadMediaForm) {
            uploadMediaForm.addEventListener('submit', handleUploadMedia);
        }
        
        // Load and display all members
        loadMembers();
        
        // Setup media tab click handler
        const mediaTab = document.getElementById('mediaTab');
        if (mediaTab) {
            mediaTab.addEventListener('shown.bs.tab', function() {
                loadMediaUploads();
            });
        }
        
        // Load media if Media tab is active on page load
        const activeTab = document.querySelector('.nav-link.active');
        if (activeTab && activeTab.id === 'mediaTab') {
            loadMediaUploads();
        }
    });
});

async function handleCreateMember(e) {
    e.preventDefault();
    
    const username = document.getElementById('memberUsername').value.trim();
    const password = document.getElementById('memberPassword').value;
    const email = document.getElementById('memberEmail').value.trim();
    
    const successDiv = document.getElementById('createMemberSuccess');
    const errorDiv = document.getElementById('createMemberError');
    const createMemberForm = document.getElementById('createMemberForm');
    
    // Validate inputs
    if (!username || !password || !email) {
        if (errorDiv) {
            errorDiv.textContent = 'All fields are required';
            errorDiv.classList.remove('d-none');
            if (successDiv) successDiv.classList.add('d-none');
        }
        return;
    }
    
    try {
        // Check if username already exists
        const { data: existingMembers } = await window.ForgeAPI.DB.select('members', {
            filters: { username: username }
        });
        
        if (existingMembers && existingMembers.length > 0) {
            if (errorDiv) {
                errorDiv.textContent = 'Username already exists';
                errorDiv.classList.remove('d-none');
                if (successDiv) successDiv.classList.add('d-none');
            }
            return;
        }
        
        // Check if email already exists
        const { data: existingEmails } = await window.ForgeAPI.DB.select('members', {
            filters: { email: email }
        });
        
        if (existingEmails && existingEmails.length > 0) {
            if (errorDiv) {
                errorDiv.textContent = 'Email already exists';
                errorDiv.classList.remove('d-none');
                if (successDiv) successDiv.classList.add('d-none');
            }
            return;
        }
        
        // Create new member in Forge database
        const newMember = {
            username: username,
            password: password,
            email: email,
            display_name: username,
            bio: '',
            profile_picture_url: '',
            tiktok_link: ''
        };
        
        const { data: createdMember, error } = await window.ForgeAPI.DB.insert('members', newMember);
        
        if (error) {
            throw error;
        }
        
        // Send welcome email (simulated)
        sendWelcomeEmail(newMember);
        
        // Show success message
        if (successDiv) {
            successDiv.textContent = `Member "${username}" created successfully! Welcome email sent.`;
            successDiv.classList.remove('d-none');
            if (errorDiv) errorDiv.classList.add('d-none');
        }
        
        // Reset form
        if (createMemberForm) createMemberForm.reset();
        
        // Reload members table
        loadMembers();
    } catch (error) {
        console.error('Error creating member:', error);
        if (errorDiv) {
            errorDiv.textContent = error.message || 'Error creating member. Please try again.';
            errorDiv.classList.remove('d-none');
            if (successDiv) successDiv.classList.add('d-none');
        }
    }
}

function sendWelcomeEmail(member) {
    // Simulate email sending
    const emailContent = {
        to: member.email,
        from: 'voiceanchors@domain.com',
        subject: 'Welcome to Voice Anchors Community',
        body: `
Dear ${member.username},

Welcome to Voice Anchors Community!

Your account has been created successfully. Here are your login credentials:

Username: ${member.username}
Password: ${member.password}

Please keep these credentials safe and change your password after your first login.

We're excited to have you as part of our community!

Best regards,
Voice Anchors Community
        `
    };
    
    // In a real application, this would send an actual email
    // For now, we'll just log it to console
    console.log('Welcome Email Sent:', emailContent);
    
    // Store email in localStorage for demonstration
    const emails = JSON.parse(localStorage.getItem('sentEmails') || '[]');
    emails.push({
        ...emailContent,
        sentAt: new Date().toISOString()
    });
    localStorage.setItem('sentEmails', JSON.stringify(emails));
}

async function loadMembers() {
    const tableBody = document.getElementById('membersTableBody');
    const noMembersMessage = document.getElementById('noMembersMessage');
    
    if (!tableBody) return;
    
    try {
        const { data: members, error } = await window.ForgeAPI.DB.select('members', {
            order: 'created_at.desc'
        });
        
        if (error) {
            throw error;
        }
        
        // Clear existing rows
        tableBody.innerHTML = '';
        
        if (!members || members.length === 0) {
            if (noMembersMessage) {
                noMembersMessage.style.display = 'block';
            }
            return;
        }
        
        if (noMembersMessage) {
            noMembersMessage.style.display = 'none';
        }
        
        // Populate table
        members.forEach(member => {
            const row = document.createElement('tr');
            const dateCreated = member.created_at 
                ? new Date(member.created_at).toLocaleDateString() 
                : 'N/A';
            
            row.innerHTML = `
                <td>${member.username}</td>
                <td>${member.email}</td>
                <td>${member.display_name || member.username}</td>
                <td>${dateCreated}</td>
                <td>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteMember('${member.id}')">
                        <i class="fas fa-trash me-1"></i>Delete
                    </button>
                </td>
            `;
            
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error('Error loading members:', error);
        if (noMembersMessage) {
            noMembersMessage.style.display = 'block';
            noMembersMessage.innerHTML = '<p class="text-danger">Error loading members. Please refresh the page.</p>';
        }
    }
}

async function deleteMember(memberId) {
    if (!confirm('Are you sure you want to delete this member?')) {
        return;
    }
    
    try {
        const { error } = await window.ForgeAPI.DB.delete('members', { id: memberId });
        
        if (error) {
            throw error;
        }
        
        // Reload table
        loadMembers();
    } catch (error) {
        console.error('Error deleting member:', error);
        alert('Error deleting member. Please try again.');
    }
}

// Make deleteMember available globally
window.deleteMember = deleteMember;

// Media Upload Functions
async function handleUploadMedia(e) {
    e.preventDefault();
    
    const title = document.getElementById('mediaTitle').value.trim();
    const description = document.getElementById('mediaDescription').value.trim();
    const mediaFile = document.getElementById('mediaFile').files[0];
    
    const successDiv = document.getElementById('uploadMediaSuccess');
    const errorDiv = document.getElementById('uploadMediaError');
    const uploadMediaForm = document.getElementById('uploadMediaForm');
    
    // Validate inputs
    if (!title || !mediaFile) {
        if (errorDiv) {
            errorDiv.textContent = 'Title and file are required';
            errorDiv.classList.remove('d-none');
            if (successDiv) successDiv.classList.add('d-none');
        }
        return;
    }
    
    // Determine media type
    const isVideo = mediaFile.type.startsWith('video/');
    const isImage = mediaFile.type.startsWith('image/');
    
    if (!isVideo && !isImage) {
        if (errorDiv) {
            errorDiv.textContent = 'Please upload a photo or video file';
            errorDiv.classList.remove('d-none');
            if (successDiv) successDiv.classList.add('d-none');
        }
        return;
    }
    
    try {
        // Upload file to Forge storage
        const fileName = `${Date.now()}-${mediaFile.name}`;
        const bucket = 'media-uploads';
        
        const { data: uploadData, error: uploadError } = await window.ForgeAPI.Storage.upload(
            bucket,
            fileName,
            mediaFile
        );
        
        if (uploadError) {
            throw uploadError;
        }
        
        // Create media upload record in database
        const mediaData = {
            title: title,
            description: description || '',
            media_url: uploadData.url,
            media_type: isVideo ? 'video' : 'photo'
        };
        
        const { data: createdMedia, error: dbError } = await window.ForgeAPI.DB.insert('media_uploads', mediaData);
        
        if (dbError) {
            throw dbError;
        }
        
        // Show success message
        if (successDiv) {
            successDiv.textContent = 'Media uploaded successfully!';
            successDiv.classList.remove('d-none');
            if (errorDiv) errorDiv.classList.add('d-none');
        }
        
        // Reset form
        if (uploadMediaForm) uploadMediaForm.reset();
        
        // Reload media uploads
        loadMediaUploads();
    } catch (error) {
        console.error('Error uploading media:', error);
        if (errorDiv) {
            errorDiv.textContent = error.message || 'Error uploading media. Please try again.';
            errorDiv.classList.remove('d-none');
            if (successDiv) successDiv.classList.add('d-none');
        }
    }
}

async function loadMediaUploads() {
    const mediaContainer = document.getElementById('mediaUploadsContainer');
    if (!mediaContainer) return;
    
    try {
        const { data: uploads, error } = await window.ForgeAPI.DB.select('media_uploads', {
            order: 'upload_date.desc'
        });
        
        if (error) {
            throw error;
        }
        
        if (!uploads || uploads.length === 0) {
            mediaContainer.innerHTML = '<p class="text-muted text-center">No media uploads yet.</p>';
            return;
        }
        
        // Display media uploads
        mediaContainer.innerHTML = uploads.map(upload => {
            const uploadDate = upload.upload_date 
                ? new Date(upload.upload_date).toLocaleDateString() 
                : 'N/A';
            
            const mediaElement = upload.media_type === 'video'
                ? `<video controls class="w-100" style="max-height: 300px;"><source src="${upload.media_url}" type="video/mp4"></video>`
                : `<img src="${upload.media_url}" alt="${upload.title}" class="w-100" style="max-height: 300px; object-fit: cover;">`;
            
            return `
                <div class="card-custom mb-3">
                    <div class="card-body-custom">
                        ${mediaElement}
                        <h5 class="mt-3 text-light">${upload.title}</h5>
                        ${upload.description ? `<p class="text-muted">${upload.description}</p>` : ''}
                        <p class="text-muted small mb-0">Uploaded: ${uploadDate}</p>
                        <button class="btn btn-sm btn-outline-danger mt-2" onclick="deleteMediaUpload('${upload.id}')">
                            <i class="fas fa-trash me-1"></i>Delete
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    } catch (error) {
        console.error('Error loading media uploads:', error);
        mediaContainer.innerHTML = '<p class="text-danger text-center">Error loading media uploads. Please refresh the page.</p>';
    }
}

async function deleteMediaUpload(mediaId) {
    if (!confirm('Are you sure you want to delete this media?')) {
        return;
    }
    
    try {
        const { error } = await window.ForgeAPI.DB.delete('media_uploads', { id: mediaId });
        
        if (error) {
            throw error;
        }
        
        // Reload media uploads
        loadMediaUploads();
    } catch (error) {
        console.error('Error deleting media:', error);
        alert('Error deleting media. Please try again.');
    }
}

// Make deleteMediaUpload available globally
window.deleteMediaUpload = deleteMediaUpload;

