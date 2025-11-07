// Forge API Client - Direct REST API calls (works without bundling)
// This uses fetch to interact with Forge's REST API

// Forge base URL - can be overridden via window.FORGE_BASE_URL if needed
// For Render deployment, this will work automatically as long as the Forge backend is accessible
const FORGE_BASE_URL = (typeof window !== 'undefined' && window.FORGE_BASE_URL) 
    ? window.FORGE_BASE_URL 
    : 'https://zcmr4dam.us-east.insforge.app';
const ADMIN_CREDENTIALS = {
    username: 'Sowj',
    password: 'Sowjva@rody1122'
};

// Get stored session from localStorage
function getStoredSession() {
    const session = localStorage.getItem('forge_session');
    return session ? JSON.parse(session) : null;
}

// Store session in localStorage
function storeSession(session) {
    if (session) {
        localStorage.setItem('forge_session', JSON.stringify(session));
        if (session.accessToken) {
            localStorage.setItem('forge_token', session.accessToken);
        }
    } else {
        localStorage.removeItem('forge_session');
        localStorage.removeItem('forge_token');
    }
}

// Make authenticated API request
async function forgeRequest(endpoint, options = {}) {
    const session = getStoredSession();
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };
    
    if (session && session.accessToken) {
        headers['Authorization'] = `Bearer ${session.accessToken}`;
    }
    
    const response = await fetch(`${FORGE_BASE_URL}${endpoint}`, {
        ...options,
        headers
    });
    
    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Request failed' }));
        throw new Error(error.message || `Request failed: ${response.status}`);
    }
    
    return response.json();
}

// Database operations using PostgREST syntax
const forgeDB = {
    async select(table, options = {}) {
        let url = `/api/database/${table}`;
        const params = new URLSearchParams();
        
        // Handle select columns
        if (options.select) {
            params.append('select', options.select);
        }
        
        // Handle filters (eq, neq, gt, gte, lt, lte, like, ilike, in, is)
        if (options.filters) {
            Object.entries(options.filters).forEach(([key, value]) => {
                if (typeof value === 'object' && value.operator) {
                    params.append(key, `${value.operator}.${value.value}`);
                } else {
                    params.append(key, `eq.${value}`);
                }
            });
        }
        
        // Handle ordering
        if (options.order) {
            params.append('order', options.order);
        }
        
        // Handle limit
        if (options.limit) {
            params.append('limit', options.limit);
        }
        
        if (params.toString()) {
            url += `?${params.toString()}`;
        }
        
        try {
            const data = await forgeRequest(url);
            return { data, error: null };
        } catch (error) {
            return { data: null, error };
        }
    },
    
    async insert(table, records) {
        const recordsArray = Array.isArray(records) ? records : [records];
        try {
            const data = await forgeRequest(`/api/database/${table}`, {
                method: 'POST',
                body: JSON.stringify(recordsArray)
            });
            return { 
                data: Array.isArray(records) ? data : (data[0] || data), 
                error: null 
            };
        } catch (error) {
            return { data: null, error };
        }
    },
    
    async update(table, filters, updates) {
        let url = `/api/database/${table}`;
        const params = new URLSearchParams();
        
        if (filters) {
            Object.entries(filters).forEach(([key, value]) => {
                params.append(key, `eq.${value}`);
            });
        }
        
        if (params.toString()) {
            url += `?${params.toString()}`;
        }
        
        try {
            const data = await forgeRequest(url, {
                method: 'PATCH',
                body: JSON.stringify(updates)
            });
            return { data, error: null };
        } catch (error) {
            return { data: null, error };
        }
    },
    
    async delete(table, filters) {
        let url = `/api/database/${table}`;
        const params = new URLSearchParams();
        
        if (filters) {
            Object.entries(filters).forEach(([key, value]) => {
                params.append(key, `eq.${value}`);
            });
        }
        
        if (params.toString()) {
            url += `?${params.toString()}`;
        }
        
        try {
            await forgeRequest(url, { method: 'DELETE' });
            return { data: null, error: null };
        } catch (error) {
            return { data: null, error };
        }
    }
};

// Storage operations
const forgeStorage = {
    async upload(bucket, fileName, file) {
        const formData = new FormData();
        formData.append('file', file);
        
        const session = getStoredSession();
        const headers = {};
        if (session && session.accessToken) {
            headers['Authorization'] = `Bearer ${session.accessToken}`;
        }
        
        try {
            const response = await fetch(
                `${FORGE_BASE_URL}/api/storage/buckets/${bucket}/objects/${encodeURIComponent(fileName)}`,
                {
                    method: 'POST',
                    headers,
                    body: formData
                }
            );
            
            if (!response.ok) {
                const error = await response.json().catch(() => ({ message: 'Upload failed' }));
                throw new Error(error.message || 'Upload failed');
            }
            
            const data = await response.json();
            const url = `${FORGE_BASE_URL}/api/storage/buckets/${bucket}/objects/${encodeURIComponent(data.key || fileName)}`;
            
            return {
                data: {
                    url: url,
                    key: data.key || fileName
                },
                error: null
            };
        } catch (error) {
            return { data: null, error };
        }
    }
};

// Export for use in other scripts
window.ForgeAPI = {
    DB: forgeDB,
    Storage: forgeStorage,
    ADMIN_CREDENTIALS,
    storeSession,
    getStoredSession,
    clearSession: () => storeSession(null),
    FORGE_BASE_URL
};
