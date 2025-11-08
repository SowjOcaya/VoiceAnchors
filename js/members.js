// Members Page - Display All Member Profiles

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
        loadMembers();
        
        // Refresh members every 10 seconds for real-time updates
        setInterval(loadMembers, 10000);
    });
});

async function loadMembers() {
    const container = document.querySelector('.content-placeholder');
    if (!container) return;
    
    try {
        const { data: members, error } = await window.ForgeAPI.DB.select('members', {
            order: 'created_at.desc'
        });
        
        if (error) {
            throw error;
        }
        
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
        
        // Display members in a grid
        container.innerHTML = `
            <div class="row" id="membersGrid">
                ${members.map(member => {
                    const displayName = member.display_name || member.username;
                    const bio = member.bio || 'No bio available.';
                    const tiktokLink = member.tiktok_link || member.tiktok_username || '';
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
                                         style="width: 150px; height: 150px; object-fit: cover; border: 3px solid var(--border-dark);">
                                    <h4 class="text-light mb-2">${displayName}</h4>
                                    <p class="text-muted mb-3">@${member.username}</p>
                                    <p class="text-light mb-3" style="min-height: 60px;">${bio}</p>
                                    ${tiktokLink ? `
                                        <a href="${tiktokLink.startsWith('http') ? tiktokLink : 'https://www.tiktok.com/@' + tiktokLink.replace('@', '')}" 
                                           target="_blank" 
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
                <p class="text-danger">Error loading members. Please refresh the page.</p>
                <button class="btn btn-primary-custom mt-3" onclick="location.reload()">
                    <i class="fas fa-sync-alt me-2"></i>Refresh Page
                </button>
            </div>
        `;
    }
}

