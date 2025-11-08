// Members Page - Display All Member Profiles with Realtime Updates

// Wait for ForgeAPI to be loaded
function waitForForgeAPI(callback) {
    if (window.ForgeAPI) {
        callback();
    } else {
        setTimeout(() => waitForForgeAPI(callback), 100);
    }
}

let membersUpdateInterval = null;

document.addEventListener('DOMContentLoaded', function() {
    waitForForgeAPI(() => {
        loadMembers();
        
        // Set up realtime updates - refresh every 5 seconds
        membersUpdateInterval = setInterval(() => {
            loadMembers();
        }, 5000);
    });
});

// Clean up interval when page is unloaded
window.addEventListener('beforeunload', function() {
    if (membersUpdateInterval) {
        clearInterval(membersUpdateInterval);
    }
});

async function loadMembers() {
    const container = document.querySelector('.content-placeholder');
    if (!container) return;
    
    try {
        // Show loading state
        const currentContent = container.innerHTML;
        if (!currentContent.includes('membersGrid')) {
            container.innerHTML = `
                <div class="text-center py-5">
                    <i class="fas fa-spinner fa-spin fa-3x text-muted mb-4"></i>
                    <p class="text-light">Loading members...</p>
                </div>
            `;
        }
        
        const { data: members, error } = await window.ForgeAPI.DB.select('members', {
            order: 'created_at.desc'
        });
        
        if (error) {
            console.error('Database error:', error);
            throw error;
        }
        
        console.log('Loaded members:', members?.length || 0, 'members');
        
        if (!members || members.length === 0) {
            container.innerHTML = `
                <div class="text-center py-5">
                    <i class="fas fa-user-friends fa-5x text-muted mb-4"></i>
                    <p class="text-light lead">No members yet.</p>
                    <p class="text-muted">Check back soon for member profiles!</p>
                </div>
            `;
            return;
        }
        
        // Filter members that have at least display_name or bio (or show all)
        const membersToShow = members.filter(member => 
            member.display_name || member.bio || member.tiktok_link || member.tiktok_username
        );
        
        // If no members with profiles, show all members
        const membersToDisplay = membersToShow.length > 0 ? membersToShow : members;
        
        // Display members in a grid
        container.innerHTML = `
            <div class="row" id="membersGrid">
                ${membersToDisplay.map(member => {
                    const displayName = member.display_name || member.username || 'Member';
                    const bio = member.bio || 'No bio available.';
                    const tiktokUsername = member.tiktok_username || '';
                    const tiktokLink = member.tiktok_link || '';
                    const tiktokUrl = tiktokLink 
                        ? (tiktokLink.startsWith('http') ? tiktokLink : `https://www.tiktok.com/@${tiktokLink.replace(/^@+/, '')}`)
                        : (tiktokUsername ? `https://www.tiktok.com/@${tiktokUsername.replace(/^@+/, '')}` : '');
                    const profilePicture = member.profile_picture_url || 'https://via.placeholder.com/200?text=No+Photo';
                    const joinDate = member.created_at 
                        ? new Date(member.created_at).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                        })
                        : 'N/A';
                    
                    return `
                        <div class="col-lg-4 col-md-6 mb-4">
                            <div class="card-custom h-100">
                                <div class="card-body-custom text-center">
                                    <img src="${profilePicture}" 
                                         alt="${displayName}" 
                                         class="rounded-circle mb-3" 
                                         style="width: 150px; height: 150px; object-fit: cover; border: 3px solid var(--border-dark);"
                                         onerror="this.src='https://via.placeholder.com/200?text=No+Photo'">
                                    <h4 class="text-light mb-2">${displayName}</h4>
                                    <p class="text-muted mb-3">@${member.username || 'username'}</p>
                                    <p class="text-light mb-3" style="min-height: 60px;">${bio}</p>
                                    ${tiktokUrl ? `
                                        <a href="${tiktokUrl}" 
                                           target="_blank" 
                                           rel="noopener noreferrer"
                                           class="btn btn-outline-primary btn-sm mb-2">
                                            <i class="fab fa-tiktok me-1"></i>TikTok
                                        </a>
                                    ` : ''}
                                    <p class="text-muted small mb-0">
                                        <i class="fas fa-calendar me-1"></i>Joined ${joinDate}
                                    </p>
                                </div>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    } catch (error) {
        console.error('Error loading members:', error);
        container.innerHTML = `
            <div class="text-center py-5">
                <i class="fas fa-exclamation-triangle fa-3x text-danger mb-4"></i>
                <p class="text-danger">Error loading members. Please refresh the page.</p>
                <p class="text-muted small">${error.message || 'Unknown error'}</p>
                <button class="btn btn-primary-custom mt-3" onclick="location.reload()">
                    <i class="fas fa-sync-alt me-2"></i>Refresh Page
                </button>
            </div>
        `;
    }
}

