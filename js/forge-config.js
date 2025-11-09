// Forge Client Configuration
import { createClient } from '@insforge/sdk';

// Forge backend URL
const FORGE_BASE_URL = 'https://zcmr4dam.us-east.insforge.app';

// Create and export Forge client instance
export const forgeClient = createClient({ baseUrl: FORGE_BASE_URL });

// Admin credentials (stored in client-side for demo - in production, use server-side auth)
export const ADMIN_CREDENTIALS = {
    username: 'Sowj',
    password: 'Sowjva@rody1122'
};




