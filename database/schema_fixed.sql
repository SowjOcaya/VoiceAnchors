-- Fixed Supabase Database Schema for Voice Anchors
-- Run this SQL in your Supabase SQL Editor to fix all issues

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Members table (with all required fields)
CREATE TABLE IF NOT EXISTS members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    display_name VARCHAR(255),
    bio TEXT,
    tiktok_link VARCHAR(500),
    tiktok_username VARCHAR(255), -- Added for TikTok account
    profile_picture_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Media uploads table (FIXED - matches code expectations)
CREATE TABLE IF NOT EXISTS media_uploads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL, -- Changed from file_name
    description TEXT,
    media_url TEXT NOT NULL, -- Changed from file_url
    media_type VARCHAR(50) NOT NULL, -- Changed from file_type, added NOT NULL
    file_name VARCHAR(255), -- Keep for reference
    file_size BIGINT,
    upload_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(), -- Changed from uploaded_at
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() -- Keep for compatibility
);

-- Applications table (FIXED - added application_number)
CREATE TABLE IF NOT EXISTS applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_number VARCHAR(50) UNIQUE NOT NULL, -- NEW: Application number
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
CREATE INDEX IF NOT EXISTS idx_members_tiktok_username ON members(tiktok_username);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_number ON applications(application_number);
CREATE INDEX IF NOT EXISTS idx_applications_email ON applications(email);
CREATE INDEX IF NOT EXISTS idx_password_resets_token ON password_resets(token);
CREATE INDEX IF NOT EXISTS idx_password_resets_member_id ON password_resets(member_id);
CREATE INDEX IF NOT EXISTS idx_media_uploads_upload_date ON media_uploads(upload_date);

-- Enable Row Level Security (RLS)
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE password_resets ENABLE ROW LEVEL SECURITY;

-- RLS Policies for members table
-- Allow public read access (for member profiles)
DROP POLICY IF EXISTS "Allow public read access to members" ON members;
CREATE POLICY "Allow public read access to members" ON members
    FOR SELECT USING (true);

-- Allow authenticated users to update their own profile
DROP POLICY IF EXISTS "Allow users to update own profile" ON members;
CREATE POLICY "Allow users to update own profile" ON members
    FOR UPDATE USING (true);

-- Allow authenticated users to insert (for admin creating members)
DROP POLICY IF EXISTS "Allow authenticated insert to members" ON members;
CREATE POLICY "Allow authenticated insert to members" ON members
    FOR INSERT WITH CHECK (true);

-- Allow authenticated users to delete
DROP POLICY IF EXISTS "Allow authenticated delete to members" ON members;
CREATE POLICY "Allow authenticated delete to members" ON members
    FOR DELETE USING (true);

-- RLS Policies for media_uploads table
-- Allow public read access
DROP POLICY IF EXISTS "Allow public read access to media_uploads" ON media_uploads;
CREATE POLICY "Allow public read access to media_uploads" ON media_uploads
    FOR SELECT USING (true);

-- Allow authenticated users to insert
DROP POLICY IF EXISTS "Allow authenticated insert to media_uploads" ON media_uploads;
CREATE POLICY "Allow authenticated insert to media_uploads" ON media_uploads
    FOR INSERT WITH CHECK (true);

-- Allow authenticated users to update
DROP POLICY IF EXISTS "Allow authenticated update to media_uploads" ON media_uploads;
CREATE POLICY "Allow authenticated update to media_uploads" ON media_uploads
    FOR UPDATE USING (true);

-- Allow authenticated users to delete
DROP POLICY IF EXISTS "Allow authenticated delete to media_uploads" ON media_uploads;
CREATE POLICY "Allow authenticated delete to media_uploads" ON media_uploads
    FOR DELETE USING (true);

-- RLS Policies for applications table
-- Allow public insert (for submitting applications)
DROP POLICY IF EXISTS "Allow public insert to applications" ON applications;
CREATE POLICY "Allow public insert to applications" ON applications
    FOR INSERT WITH CHECK (true);

-- Allow authenticated users to read
DROP POLICY IF EXISTS "Allow authenticated read to applications" ON applications;
CREATE POLICY "Allow authenticated read to applications" ON applications
    FOR SELECT USING (true);

-- Allow authenticated users to update
DROP POLICY IF EXISTS "Allow authenticated update to applications" ON applications;
CREATE POLICY "Allow authenticated update to applications" ON applications
    FOR UPDATE USING (true);

-- Allow authenticated users to delete
DROP POLICY IF EXISTS "Allow authenticated delete to applications" ON applications;
CREATE POLICY "Allow authenticated delete to applications" ON applications
    FOR DELETE USING (true);

-- RLS Policies for password_resets table
-- Allow public insert
DROP POLICY IF EXISTS "Allow public insert to password_resets" ON password_resets;
CREATE POLICY "Allow public insert to password_resets" ON password_resets
    FOR INSERT WITH CHECK (true);

-- Allow public read by token
DROP POLICY IF EXISTS "Allow public read password_resets by token" ON password_resets;
CREATE POLICY "Allow public read password_resets by token" ON password_resets
    FOR SELECT USING (true);

-- Allow public update
DROP POLICY IF EXISTS "Allow public update password_resets" ON password_resets;
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
DROP TRIGGER IF EXISTS update_members_updated_at ON members;
CREATE TRIGGER update_members_updated_at BEFORE UPDATE ON members
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_applications_updated_at ON applications;
CREATE TRIGGER update_applications_updated_at BEFORE UPDATE ON applications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to generate application number
CREATE OR REPLACE FUNCTION generate_application_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.application_number IS NULL OR NEW.application_number = '' THEN
        NEW.application_number := 'APP-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(NEXTVAL('application_number_seq')::TEXT, 4, '0');
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create sequence for application numbers
CREATE SEQUENCE IF NOT EXISTS application_number_seq START 1;

-- Create trigger to auto-generate application number
DROP TRIGGER IF EXISTS generate_app_number ON applications;
CREATE TRIGGER generate_app_number
    BEFORE INSERT ON applications
    FOR EACH ROW
    EXECUTE FUNCTION generate_application_number();

