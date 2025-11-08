// Activities Page - Display Media Uploads with Realtime Updates

// Wait for ForgeAPI to be loaded
function waitForForgeAPI(callback) {
    if (window.ForgeAPI) {
        callback();
    } else {
        setTimeout(() => waitForForgeAPI(callback), 100);
    }
}

let activitiesUpdateInterval = null;

document.addEventListener('DOMContentLoaded', function() {
    waitForForgeAPI(() => {
        loadActivities();
        
        // Set up realtime updates - refresh every 5 seconds
        activitiesUpdateInterval = setInterval(() => {
            loadActivities();
        }, 5000);
    });
});

// Clean up interval when page is unloaded
window.addEventListener('beforeunload', function() {
    if (activitiesUpdateInterval) {
        clearInterval(activitiesUpdateInterval);
    }
});

async function loadActivities() {
    const container = document.getElementById('activitiesContainer');
    if (!container) return;
    
    try {
        // Show loading state only if container is empty
        const currentContent = container.innerHTML.trim();
        if (!currentContent || currentContent.includes('No activities')) {
            container.innerHTML = `
                <div class="col-12">
                    <div class="content-placeholder">
                        <div class="text-center py-5">
                            <i class="fas fa-spinner fa-spin fa-3x text-muted mb-4"></i>
                            <p class="text-light">Loading activities...</p>
                        </div>
                    </div>
                </div>
            `;
        }
        
        const { data: uploads, error } = await window.ForgeAPI.DB.select('media_uploads', {
            order: 'upload_date.desc,uploaded_at.desc'
        });
        
        if (error) {
            console.error('Database error:', error);
            throw error;
        }
        
        console.log('Loaded activities:', uploads?.length || 0, 'uploads');
        
        if (!uploads || uploads.length === 0) {
            container.innerHTML = `
                <div class="col-12">
                    <div class="content-placeholder">
                        <div class="text-center py-5">
                            <i class="fas fa-calendar-check fa-5x text-muted mb-4"></i>
                            <p class="text-light lead">No activities yet.</p>
                            <p class="text-muted">Check back soon for community updates!</p>
                        </div>
                    </div>
                </div>
            `;
            return;
        }
        
        // Display media uploads in a grid
        container.innerHTML = uploads.map(upload => {
            const uploadDate = upload.upload_date || upload.uploaded_at;
            const formattedDate = uploadDate
                ? new Date(uploadDate).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                })
                : 'N/A';
            
            const mediaElement = upload.media_type === 'video'
                ? `<div class="ratio ratio-16x9 mb-3">
                    <video controls class="w-100" style="border-radius: 10px;">
                        <source src="${upload.media_url}" type="video/mp4">
                        Your browser does not support the video tag.
                    </video>
                   </div>`
                : `<img src="${upload.media_url}" 
                         alt="${upload.title || 'Activity'}" 
                         class="w-100 mb-3" 
                         style="border-radius: 10px; max-height: 500px; object-fit: cover;"
                         onerror="this.src='https://via.placeholder.com/500?text=Image+Not+Available'">`;
            
            return `
                <div class="col-lg-4 col-md-6 mb-4">
                    <div class="card-custom h-100">
                        <div class="card-body-custom">
                            ${mediaElement}
                            <h5 class="text-light mb-2">${upload.title || 'Untitled'}</h5>
                            ${upload.description ? `<p class="text-muted mb-3">${upload.description}</p>` : ''}
                            <p class="text-muted small mb-0">
                                <i class="fas fa-calendar me-1"></i>${formattedDate}
                            </p>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    } catch (error) {
        console.error('Error loading activities:', error);
        container.innerHTML = `
            <div class="col-12">
                <div class="content-placeholder">
                    <div class="text-center py-5">
                        <i class="fas fa-exclamation-triangle fa-3x text-danger mb-4"></i>
                        <p class="text-danger">Error loading activities. Please refresh the page.</p>
                        <p class="text-muted small">${error.message || 'Unknown error'}</p>
                        <button class="btn btn-primary-custom mt-3" onclick="location.reload()">
                            <i class="fas fa-sync-alt me-2"></i>Refresh Page
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
}



