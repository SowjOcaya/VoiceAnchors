// Navigation and Page Transitions

document.addEventListener('DOMContentLoaded', function() {
    // Highlight active page in navigation
    highlightActivePage();
    
    // Add smooth page transitions
    setupPageTransitions();
    
    // Update navigation based on authentication
    updateNavigationAuth();
});

function highlightActivePage() {
    const currentPage = window.location.pathname.split('/').pop() || 'MainBoard.html';
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href && href.includes(currentPage)) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

function setupPageTransitions() {
    const links = document.querySelectorAll('a[href$=".html"]');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            // Don't prevent default for dropdown items or external links
            if (this.getAttribute('href').startsWith('#') || 
                this.getAttribute('href').startsWith('http')) {
                return;
            }
            
            // Show loading overlay
            showLoadingOverlay();
            
            // Small delay to show loading animation
            setTimeout(() => {
                // Navigation will happen naturally
            }, 300);
        });
    });
}

function showLoadingOverlay() {
    // Remove existing overlay if any
    const existing = document.querySelector('.loading-overlay');
    if (existing) {
        existing.remove();
    }
    
    // Create loading overlay
    const overlay = document.createElement('div');
    overlay.className = 'loading-overlay';
    overlay.innerHTML = '<div class="loading-spinner"></div>';
    document.body.appendChild(overlay);
    
    // Remove overlay after page loads
    window.addEventListener('load', function() {
        setTimeout(() => {
            overlay.style.opacity = '0';
            overlay.style.transition = 'opacity 0.3s ease-out';
            setTimeout(() => {
                overlay.remove();
            }, 300);
        }, 200);
    });
}

function updateNavigationAuth() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    const isAdmin = localStorage.getItem('isAdmin') === 'true';
    const logoutLink = document.getElementById('logoutLink');
    const memberLoginLink = document.getElementById('memberLoginLink');
    const adminLoginLink = document.getElementById('adminLoginLink');
    const adminDashboardLink = document.getElementById('adminDashboardLink');
    
    // Find or create admin dashboard link in navigation
    let adminLink = adminDashboardLink;
    if (!adminLink) {
        // Try to find the navigation list
        const navList = document.querySelector('.navbar-nav');
        if (navList && isAdmin && currentUser) {
            // Check if link already exists
            const existingLink = navList.querySelector('a[href="AdminDashboard.html"]');
            if (!existingLink) {
                // Create admin dashboard link
                const listItem = document.createElement('li');
                listItem.className = 'nav-item';
                listItem.innerHTML = `
                    <a class="nav-link" href="AdminDashboard.html" id="adminDashboardLink">
                        <i class="fas fa-tachometer-alt me-1"></i>Admin Dashboard
                    </a>
                `;
                // Insert before the Account dropdown
                const accountItem = navList.querySelector('.dropdown');
                if (accountItem) {
                    navList.insertBefore(listItem, accountItem);
                } else {
                    navList.appendChild(listItem);
                }
                adminLink = document.getElementById('adminDashboardLink');
            } else {
                adminLink = existingLink;
            }
        }
    }
    
    if (currentUser) {
        if (logoutLink) logoutLink.style.display = 'block';
        if (memberLoginLink) memberLoginLink.style.display = 'none';
        if (adminLoginLink) adminLoginLink.style.display = 'none';
        
        // Show admin dashboard link if admin is logged in
        if (isAdmin && adminLink) {
            adminLink.style.display = 'block';
        } else if (adminLink) {
            adminLink.style.display = 'none';
        }
    } else {
        if (logoutLink) logoutLink.style.display = 'none';
        if (memberLoginLink) memberLoginLink.style.display = 'block';
        if (adminLoginLink) adminLoginLink.style.display = 'block';
        if (adminLink) adminLink.style.display = 'none';
    }
}

// Setup logout functionality
document.addEventListener('DOMContentLoaded', function() {
    const logoutLink = document.getElementById('logoutLink');
    if (logoutLink) {
        logoutLink.addEventListener('click', function(e) {
            e.preventDefault();
            localStorage.removeItem('currentUser');
            localStorage.removeItem('isAdmin');
            if (window.ForgeAPI) {
                window.ForgeAPI.clearSession();
            }
            window.location.href = 'MainBoard.html';
        });
    }
    
    // Update navigation on page load
    updateNavigationAuth();
});

