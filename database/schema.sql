-- Supabase Database Schema for Voice Anchors
-- Run this SQL in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Members table
CREATE TABLE IF NOT EXISTS members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    display_name VARCHAR(255),
    bio TEXT,
    tiktok_link VARCHAR(500),
    profile_picture_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Media uploads table
CREATE TABLE IF NOT EXISTS media_uploads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    file_name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    file_type VARCHAR(50),
    file_size BIGINT,
    description TEXT,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Applications table
CREATE TABLE IF NOT EXISTS applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL,
    tiktok_username VARCHAR(255),
    reason TEXT,
    impersonation_choice VARCHAR(50),
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Password resets table
CREATE TABLE IF NOT EXISTS password_resets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID REFERENCES members(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_members_username ON members(username);
CREATE INDEX IF NOT EXISTS idx_members_email ON members(email);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_password_resets_token ON password_resets(token);
CREATE INDEX IF NOT EXISTS idx_password_resets_member_id ON password_resets(member_id);

-- Enable Row Level Security (RLS)
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE password_resets ENABLE ROW LEVEL SECURITY;

-- RLS Policies for members table
-- Allow public read access (for member profiles)
CREATE POLICY "Allow public read access to members" ON members
    FOR SELECT USING (true);

-- Allow authenticated users to update their own profile
CREATE POLICY "Allow users to update own profile" ON members
    FOR UPDATE USING (true);

-- Allow authenticated users to insert (for admin creating members)
CREATE POLICY "Allow authenticated insert to members" ON members
    FOR INSERT WITH CHECK (true);

-- RLS Policies for media_uploads table
-- Allow public read access
CREATE POLICY "Allow public read access to media_uploads" ON media_uploads
    FOR SELECT USING (true);

-- Allow authenticated users to insert
CREATE POLICY "Allow authenticated insert to media_uploads" ON media_uploads
    FOR INSERT WITH CHECK (true);

-- Allow authenticated users to delete
CREATE POLICY "Allow authenticated delete to media_uploads" ON media_uploads
    FOR DELETE USING (true);

-- RLS Policies for applications table
-- Allow public insert (for submitting applications)
CREATE POLICY "Allow public insert to applications" ON applications
    FOR INSERT WITH CHECK (true);

-- Allow authenticated users to read
CREATE POLICY "Allow authenticated read to applications" ON applications
    FOR SELECT USING (true);

-- Allow authenticated users to update
CREATE POLICY "Allow authenticated update to applications" ON applications
    FOR UPDATE USING (true);

-- RLS Policies for password_resets table
-- Allow public insert
CREATE POLICY "Allow public insert to password_resets" ON password_resets
    FOR INSERT WITH CHECK (true);

-- Allow public read by token
CREATE POLICY "Allow public read password_resets by token" ON password_resets
    FOR SELECT USING (true);

-- Allow public update
CREATE POLICY "Allow public update password_resets" ON password_resets
    FOR UPDATE USING (true);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_members_updated_at BEFORE UPDATE ON members
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_applications_updated_at BEFORE UPDATE ON applications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

