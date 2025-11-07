// Forge Client - Using SDK via import
// This file should be loaded as a module (type="module")

import { createClient } from '@insforge/sdk';

const FORGE_BASE_URL = 'https://zcmr4dam.us-east.insforge.app';

// Create Forge client instance
export const forgeClient = createClient({ baseUrl: FORGE_BASE_URL });

// Admin credentials
export const ADMIN_CREDENTIALS = {
    username: 'Sowj',
    password: 'Sowjva@rody1122'
};

// Helper to get members from database
export async function getMembers() {
    const { data, error } = await forgeClient.database
        .from('members')
        .select('*')
        .order('created_at', { ascending: false });
    return { data, error };
}

// Helper to create member
export async function createMember(memberData) {
    const { data, error } = await forgeClient.database
        .from('members')
        .insert([memberData])
        .select()
        .single();
    return { data, error };
}

// Helper to update member
export async function updateMember(memberId, updates) {
    const { data, error } = await forgeClient.database
        .from('members')
        .update(updates)
        .eq('id', memberId)
        .select()
        .single();
    return { data, error };
}

// Helper to delete member
export async function deleteMember(memberId) {
    const { data, error } = await forgeClient.database
        .from('members')
        .delete()
        .eq('id', memberId);
    return { data, error };
}

// Helper to get media uploads
export async function getMediaUploads() {
    const { data, error } = await forgeClient.database
        .from('media_uploads')
        .select('*')
        .order('upload_date', { ascending: false });
    return { data, error };
}

// Helper to create media upload
export async function createMediaUpload(mediaData) {
    const { data, error } = await forgeClient.database
        .from('media_uploads')
        .insert([mediaData])
        .select()
        .single();
    return { data, error };
}

// Helper to delete media upload
export async function deleteMediaUpload(mediaId) {
    const { data, error } = await forgeClient.database
        .from('media_uploads')
        .delete()
        .eq('id', mediaId);
    return { data, error };
}

// Helper to upload file to storage
export async function uploadFile(bucket, fileName, file) {
    const { data, error } = await forgeClient.storage
        .from(bucket)
        .upload(fileName, file);
    return { data, error };
}

