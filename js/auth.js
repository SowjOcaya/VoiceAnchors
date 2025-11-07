// Authentication System - Using Forge API

// Wait for ForgeAPI to be loaded
function waitForForgeAPI(callback) {
    if (window.ForgeAPI) {
        callback();
    } else {
        setTimeout(() => waitForForgeAPI(callback), 100);
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    waitForForgeAPI(() => {
        // Setup admin login
        const adminLoginForm = document.getElementById('adminLoginForm');
        if (adminLoginForm) {
            adminLoginForm.addEventListener('submit', handleAdminLogin);
        }
        
        // Setup member login
        const memberLoginForm = document.getElementById('memberLoginForm');
        if (memberLoginForm) {
            memberLoginForm.addEventListener('submit', handleMemberLogin);
        }
        
        // Check authentication for protected pages
        checkAuth();
        
        // Setup login links
        setupLoginLinks();
    });
});

async function handleAdminLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('adminUsername').value;
    const password = document.getElementById('adminPassword').value;
    const errorDiv = document.getElementById('adminLoginError');
    
    if (username === window.ForgeAPI.ADMIN_CREDENTIALS.username && 
        password === window.ForgeAPI.ADMIN_CREDENTIALS.password) {
        // Successful admin login
        localStorage.setItem('isAdmin', 'true');
        localStorage.setItem('currentUser', JSON.stringify({ username, type: 'admin' }));
        window.location.href = 'AdminDashboard.html';
    } else {
        // Show error
        if (errorDiv) {
            errorDiv.textContent = 'Invalid username or password';
            errorDiv.classList.remove('d-none');
        }
    }
}

async function handleMemberLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('memberLoginUsername').value;
    const password = document.getElementById('memberLoginPassword').value;
    const errorDiv = document.getElementById('memberLoginError');
    
    try {
        // Query members from Forge database
        const { data: members, error } = await window.ForgeAPI.DB.select('members');
        
        if (error) {
            throw error;
        }
        
        const member = (members || []).find(m => m.username === username && m.password === password);
        
        if (member) {
            // Successful login
            localStorage.setItem('isAdmin', 'false');
            localStorage.setItem('currentUser', JSON.stringify(member));
            window.location.href = 'MemberDashboard.html';
        } else {
            // Show error
            if (errorDiv) {
                errorDiv.textContent = 'Invalid username or password';
                errorDiv.classList.remove('d-none');
            }
        }
    } catch (error) {
        console.error('Login error:', error);
        if (errorDiv) {
            errorDiv.textContent = 'Error connecting to server. Please try again.';
            errorDiv.classList.remove('d-none');
        }
    }
}

function checkAuth() {
    const currentPage = window.location.pathname.split('/').pop();
    const isAdmin = localStorage.getItem('isAdmin') === 'true';
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    
    // Protect admin dashboard
    if (currentPage === 'AdminDashboard.html') {
        if (!isAdmin || !currentUser) {
            window.location.href = 'AdminLogin.html';
            return;
        }
    }
    
    // Protect member dashboard
    if (currentPage === 'MemberDashboard.html') {
        if (isAdmin || !currentUser) {
            window.location.href = 'MemberLogin.html';
            return;
        }
    }
}

function setupLoginLinks() {
    const memberLoginLink = document.getElementById('memberLoginLink');
    const adminLoginLink = document.getElementById('adminLoginLink');
    
    if (memberLoginLink) {
        memberLoginLink.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = 'MemberLogin.html';
        });
    }
    
    if (adminLoginLink) {
        adminLoginLink.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = 'AdminLogin.html';
        });
    }
}

// Logout functionality
function logout() {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('isAdmin');
    if (window.ForgeAPI) {
        window.ForgeAPI.clearSession();
    }
    window.location.href = 'MainBoard.html';
}

// Setup logout buttons
document.addEventListener('DOMContentLoaded', function() {
    const adminLogoutBtn = document.getElementById('adminLogoutBtn');
    const memberLogoutBtn = document.getElementById('memberLogoutBtn');
    
    if (adminLogoutBtn) {
        adminLogoutBtn.addEventListener('click', logout);
    }
    
    if (memberLogoutBtn) {
        memberLogoutBtn.addEventListener('click', logout);
    }
});

