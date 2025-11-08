// Admin Applications Management - Using Forge API

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
        // Load applications when Applications tab is clicked
        const applicationsTab = document.getElementById('applicationsTab');
        if (applicationsTab) {
            applicationsTab.addEventListener('shown.bs.tab', function() {
                loadApplications();
            });
        }
        
        // Load applications on page load if tab is active
        const activeTab = document.querySelector('.nav-link.active');
        if (activeTab && activeTab.id === 'applicationsTab') {
            loadApplications();
        }
        
        // Refresh applications every 30 seconds for real-time updates
        setInterval(() => {
            const applicationsTabPane = document.getElementById('applicationsSection');
            if (applicationsTabPane && applicationsTabPane.classList.contains('active')) {
                loadApplications();
            }
        }, 30000);
    });
});

async function loadApplications() {
    const container = document.getElementById('applicationsContainer');
    const badge = document.getElementById('pendingApplicationsBadge');
    
    if (!container) return;
    
    try {
        const { data: applications, error } = await window.ForgeAPI.DB.select('applications', {
            order: 'created_at.desc'
        });
        
        if (error) {
            throw error;
        }
        
        if (!applications || applications.length === 0) {
            container.innerHTML = '<p class="text-muted text-center">No applications yet.</p>';
            if (badge) badge.style.display = 'none';
            return;
        }
        
        // Count pending applications
        const pendingCount = applications.filter(app => app.status === 'pending').length;
        if (badge) {
            if (pendingCount > 0) {
                badge.textContent = pendingCount;
                badge.style.display = 'inline-block';
            } else {
                badge.style.display = 'none';
            }
        }
        
        // Group applications by status
        const pending = applications.filter(app => app.status === 'pending');
        const approved = applications.filter(app => app.status === 'approved');
        const rejected = applications.filter(app => app.status === 'rejected');
        
        let html = '';
        
        // Pending Applications
        if (pending.length > 0) {
            html += '<h5 class="text-light mb-3"><i class="fas fa-clock me-2"></i>Pending Applications</h5>';
            html += pending.map(app => createApplicationCard(app)).join('');
        }
        
        // Approved Applications
        if (approved.length > 0) {
            html += '<h5 class="text-light mb-3 mt-4"><i class="fas fa-check-circle me-2 text-success"></i>Approved Applications</h5>';
            html += approved.map(app => createApplicationCard(app)).join('');
        }
        
        // Rejected Applications
        if (rejected.length > 0) {
            html += '<h5 class="text-light mb-3 mt-4"><i class="fas fa-times-circle me-2 text-danger"></i>Rejected Applications</h5>';
            html += rejected.map(app => createApplicationCard(app)).join('');
        }
        
        container.innerHTML = html;
        
    } catch (error) {
        console.error('Error loading applications:', error);
        container.innerHTML = '<p class="text-danger text-center">Error loading applications. Please refresh the page.</p>';
    }
}

function createApplicationCard(application) {
    const createdDate = application.created_at 
        ? new Date(application.created_at).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
        : 'N/A';
    
    const statusBadge = application.status === 'pending' 
        ? '<span class="badge bg-warning">Pending</span>'
        : application.status === 'approved'
        ? '<span class="badge bg-success">Approved</span>'
        : '<span class="badge bg-danger">Rejected</span>';
    
    const actionButtons = application.status === 'pending' 
        ? `
            <button class="btn btn-sm btn-success me-2" onclick="approveApplication('${application.id}', '${application.email}')">
                <i class="fas fa-check me-1"></i>Approve
            </button>
            <button class="btn btn-sm btn-danger" onclick="rejectApplication('${application.id}', '${application.email}')">
                <i class="fas fa-times me-1"></i>Reject
            </button>
        `
        : '<span class="text-muted">No actions available</span>';
    
    return `
        <div class="card-custom mb-3">
            <div class="card-body-custom">
                <div class="d-flex justify-content-between align-items-start mb-3">
                    <div>
                        <h5 class="text-light mb-1">${application.email}</h5>
                        <p class="text-muted mb-0">
                            <i class="fab fa-tiktok me-1"></i>TikTok: @${application.tiktok_username}
                        </p>
                    </div>
                    ${statusBadge}
                </div>
                <div class="mb-3">
                    <strong class="text-light">Reason for joining:</strong>
                    <p class="text-muted mt-1">${application.reason}</p>
                </div>
                <div class="mb-3">
                    <strong class="text-light">Impersonation choice:</strong>
                    <p class="text-muted mt-1">${application.impersonation_choice}</p>
                </div>
                <div class="d-flex justify-content-between align-items-center">
                    <small class="text-muted">
                        <i class="fas fa-calendar me-1"></i>Applied: ${createdDate}
                    </small>
                    <div>
                        ${actionButtons}
                    </div>
                </div>
            </div>
        </div>
    `;
}

async function approveApplication(applicationId, email) {
    if (!confirm('Are you sure you want to approve this application?')) {
        return;
    }
    
    try {
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
        const adminUsername = currentUser ? currentUser.username : 'Admin';
        
        // Update application status
        const { error } = await window.ForgeAPI.DB.update(
            'applications',
            { id: applicationId },
            {
                status: 'approved',
                reviewed_by: adminUsername,
                reviewed_at: new Date().toISOString()
            }
        );
        
        if (error) {
            throw error;
        }
        
        // Send approval email
        if (window.sendApprovalEmail) {
            await window.sendApprovalEmail(email);
        }
        
        // Reload applications
        loadApplications();
        
        // Show success message
        alert('Application approved! Approval email sent to applicant.');
        
    } catch (error) {
        console.error('Error approving application:', error);
        alert('Error approving application. Please try again.');
    }
}

async function rejectApplication(applicationId, email) {
    if (!confirm('Are you sure you want to reject this application?')) {
        return;
    }
    
    try {
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
        const adminUsername = currentUser ? currentUser.username : 'Admin';
        
        // Update application status
        const { error } = await window.ForgeAPI.DB.update(
            'applications',
            { id: applicationId },
            {
                status: 'rejected',
                reviewed_by: adminUsername,
                reviewed_at: new Date().toISOString()
            }
        );
        
        if (error) {
            throw error;
        }
        
        // Send rejection email
        if (window.sendRejectionEmail) {
            await window.sendRejectionEmail(email);
        }
        
        // Reload applications
        loadApplications();
        
        // Show success message
        alert('Application rejected. Rejection email sent to applicant.');
        
    } catch (error) {
        console.error('Error rejecting application:', error);
        alert('Error rejecting application. Please try again.');
    }
}

// Make functions available globally
window.approveApplication = approveApplication;
window.rejectApplication = rejectApplication;



