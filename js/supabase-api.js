// Supabase API Client - Compatible with Forge API interface
// This uses Supabase's PostgREST API which is compatible with the existing code

// Supabase configuration - can be overridden via window.SUPABASE_CONFIG
const SUPABASE_CONFIG = (typeof window !== 'undefined' && window.SUPABASE_CONFIG) 
    ? window.SUPABASE_CONFIG 
    : {
        url: window.SUPABASE_URL || '',
        anonKey: window.SUPABASE_ANON_KEY || ''
    };

// Get Supabase URL and anon key from environment or window
const SUPABASE_URL = SUPABASE_CONFIG.url || (typeof window !== 'undefined' ? window.SUPABASE_URL : '');
const SUPABASE_ANON_KEY = SUPABASE_CONFIG.anonKey || (typeof window !== 'undefined' ? window.SUPABASE_ANON_KEY : '');

// Admin credentials (stored in client-side for demo - in production, use server-side auth)
const ADMIN_CREDENTIALS = {
    username: 'Sowj',
    password: 'Sowjva@rody1122'
};

// Get stored session from localStorage
function getStoredSession() {
    const session = localStorage.getItem('supabase_session');
    return session ? JSON.parse(session) : null;
}

// Store session in localStorage
function storeSession(session) {
    if (session) {
        localStorage.setItem('supabase_session', JSON.stringify(session));
        if (session.accessToken) {
            localStorage.setItem('supabase_token', session.accessToken);
        }
    } else {
        localStorage.removeItem('supabase_session');
        localStorage.removeItem('supabase_token');
    }
}

// Make authenticated API request to Supabase PostgREST
async function supabaseRequest(endpoint, options = {}) {
    const session = getStoredSession();
    const headers = {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Prefer': 'return=representation',
        ...options.headers
    };
    
    // Use service role key for admin operations if available, otherwise use anon key
    const authKey = (typeof window !== 'undefined' && window.SUPABASE_SERVICE_KEY) 
        ? window.SUPABASE_SERVICE_KEY 
        : SUPABASE_ANON_KEY;
    
    if (session && session.accessToken) {
        headers['Authorization'] = `Bearer ${session.accessToken}`;
    } else {
        headers['Authorization'] = `Bearer ${authKey}`;
    }
    
    const response = await fetch(`${SUPABASE_URL}/rest/v1${endpoint}`, {
        ...options,
        headers
    });
    
    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Request failed' }));
        throw new Error(error.message || error.hint || `Request failed: ${response.status}`);
    }
    
    // Handle empty responses
    if (response.status === 204 || response.headers.get('content-length') === '0') {
        return null;
    }
    
    const text = await response.text();
    return text ? JSON.parse(text) : null;
}

// Database operations using PostgREST syntax (compatible with Forge API)
const supabaseDB = {
    async select(table, options = {}) {
        let url = `/${table}`;
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
            const data = await supabaseRequest(url);
            return { data: data || [], error: null };
        } catch (error) {
            return { data: null, error };
        }
    },
    
    async insert(table, records) {
        const recordsArray = Array.isArray(records) ? records : [records];
        try {
            const data = await supabaseRequest(`/${table}`, {
                method: 'POST',
                body: JSON.stringify(recordsArray)
            });
            return { 
                data: Array.isArray(records) ? data : (data && data[0] ? data[0] : data), 
                error: null 
            };
        } catch (error) {
            return { data: null, error };
        }
    },
    
    async update(table, filters, updates) {
        let url = `/${table}`;
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
            const data = await supabaseRequest(url, {
                method: 'PATCH',
                body: JSON.stringify(updates)
            });
            return { data, error: null };
        } catch (error) {
            return { data: null, error };
        }
    },
    
    async delete(table, filters) {
        let url = `/${table}`;
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
            await supabaseRequest(url, { method: 'DELETE' });
            return { data: null, error: null };
        } catch (error) {
            return { data: null, error };
        }
    }
};

// Storage operations using Supabase Storage
const supabaseStorage = {
    async upload(bucket, fileName, file) {
        try {
            const session = getStoredSession();
            const token = session?.accessToken || SUPABASE_ANON_KEY;
            
            // Upload to Supabase Storage using the correct endpoint
            const response = await fetch(
                `${SUPABASE_URL}/storage/v1/object/${bucket}/${encodeURIComponent(fileName)}`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'apikey': SUPABASE_ANON_KEY,
                        'Content-Type': file.type || 'application/octet-stream',
                        'x-upsert': 'true' // Allow overwriting existing files
                    },
                    body: file
                }
            );
            
            // Read response text once (can only be read once)
            const responseText = await response.text().catch(() => '');
            
            if (!response.ok) {
                let errorMessage = 'Upload failed';
                try {
                    if (responseText) {
                        const errorData = JSON.parse(responseText);
                        errorMessage = errorData.message || errorData.error || errorMessage;
                    } else {
                        errorMessage = `Upload failed with status ${response.status}`;
                    }
                } catch (e) {
                    // If response is not JSON, use text or default message
                    errorMessage = responseText || `Upload failed with status ${response.status}`;
                }
                throw new Error(errorMessage);
            }
            
            // Try to parse response as JSON, but handle empty responses
            let result = {};
            try {
                if (responseText) {
                    result = JSON.parse(responseText);
                }
            } catch (e) {
                // Response might be empty, which is fine for Supabase Storage
                console.log('Storage upload response was empty or not JSON, continuing...');
            }
            
            // Get public URL - Supabase returns the path, construct full URL
            const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${encodeURIComponent(fileName)}`;
            
            // Verify the URL is valid
            if (!publicUrl || !publicUrl.includes('http')) {
                throw new Error('Failed to generate valid public URL for uploaded file');
            }
            
            return {
                data: {
                    url: publicUrl,
                    key: fileName,
                    path: result.Key || result.path || fileName
                },
                error: null
            };
        } catch (error) {
            console.error('Storage upload error:', error);
            return { 
                data: null, 
                error: error instanceof Error ? error : new Error(String(error))
            };
        }
    },
    
    async getPublicUrl(bucket, fileName) {
        return `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${encodeURIComponent(fileName)}`;
    }
};

// Export for use in other scripts (maintains compatibility with ForgeAPI)
window.ForgeAPI = {
    DB: supabaseDB,
    Storage: supabaseStorage,
    ADMIN_CREDENTIALS,
    storeSession,
    getStoredSession,
    clearSession: () => storeSession(null),
    FORGE_BASE_URL: SUPABASE_URL // For compatibility
};

// Also export as SupabaseAPI for clarity
window.SupabaseAPI = window.ForgeAPI;

