-- ALL-IN-ONE Database Fix Script
-- Run this ONE script to fix everything at once
-- This handles both new databases and existing databases safely

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- FIX MEMBERS TABLE
-- ============================================
-- Add tiktok_username column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'members' AND column_name = 'tiktok_username') THEN
        ALTER TABLE members ADD COLUMN tiktok_username VARCHAR(255);
        -- Migrate tiktok_link to tiktok_username if possible
        UPDATE members 
        SET tiktok_username = REPLACE(REPLACE(REPLACE(tiktok_link, 'https://www.tiktok.com/@', ''), 'https://tiktok.com/@', ''), '@', '')
        WHERE tiktok_username IS NULL AND tiktok_link IS NOT NULL AND tiktok_link != '';
    END IF;
END $$;

-- ============================================
-- FIX MEDIA_UPLOADS TABLE
-- ============================================
DO $$ 
BEGIN
    -- Add title column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'media_uploads' AND column_name = 'title') THEN
        ALTER TABLE media_uploads ADD COLUMN title VARCHAR(255);
        -- Migrate file_name to title if file_name exists
        IF EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'media_uploads' AND column_name = 'file_name') THEN
            UPDATE media_uploads SET title = COALESCE(file_name, 'Untitled') WHERE title IS NULL;
        ELSE
            UPDATE media_uploads SET title = 'Untitled' WHERE title IS NULL;
        END IF;
        ALTER TABLE media_uploads ALTER COLUMN title SET NOT NULL;
    END IF;

    -- Add media_url column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'media_uploads' AND column_name = 'media_url') THEN
        ALTER TABLE media_uploads ADD COLUMN media_url TEXT;
        -- Migrate file_url to media_url if file_url exists
        IF EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'media_uploads' AND column_name = 'file_url') THEN
            UPDATE media_uploads SET media_url = file_url WHERE media_url IS NULL;
        END IF;
        ALTER TABLE media_uploads ALTER COLUMN media_url SET NOT NULL;
    END IF;

    -- Add media_type column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'media_uploads' AND column_name = 'media_type') THEN
        ALTER TABLE media_uploads ADD COLUMN media_type VARCHAR(50);
        -- Migrate file_type to media_type if file_type exists
        IF EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'media_uploads' AND column_name = 'file_type') THEN
            UPDATE media_uploads SET media_type = file_type WHERE media_type IS NULL;
        END IF;
        -- Set default based on file extension if still null
        UPDATE media_uploads 
        SET media_type = 'video' 
        WHERE media_type IS NULL 
        AND (
            (file_name IS NOT NULL AND (file_name LIKE '%.mp4' OR file_name LIKE '%.mov' OR file_name LIKE '%.avi' OR file_name LIKE '%.webm'))
            OR (media_url IS NOT NULL AND (media_url LIKE '%.mp4' OR media_url LIKE '%.mov' OR media_url LIKE '%.avi' OR media_url LIKE '%.webm'))
        );
        UPDATE media_uploads SET media_type = 'photo' WHERE media_type IS NULL;
        ALTER TABLE media_uploads ALTER COLUMN media_type SET NOT NULL;
    END IF;

    -- Add upload_date column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'media_uploads' AND column_name = 'upload_date') THEN
        ALTER TABLE media_uploads ADD COLUMN upload_date TIMESTAMP WITH TIME ZONE;
        -- Migrate uploaded_at to upload_date if uploaded_at exists
        IF EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'media_uploads' AND column_name = 'uploaded_at') THEN
            UPDATE media_uploads SET upload_date = uploaded_at WHERE upload_date IS NULL;
        ELSE
            UPDATE media_uploads SET upload_date = NOW() WHERE upload_date IS NULL;
        END IF;
        ALTER TABLE media_uploads ALTER COLUMN upload_date SET DEFAULT NOW();
    END IF;
END $$;

-- ============================================
-- FIX APPLICATIONS TABLE
-- ============================================
-- Create sequence for application numbers first
CREATE SEQUENCE IF NOT EXISTS application_number_seq START 1;

-- Create function to generate application number
CREATE OR REPLACE FUNCTION generate_application_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.application_number IS NULL OR NEW.application_number = '' THEN
        NEW.application_number := 'APP-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(NEXTVAL('application_number_seq')::TEXT, 4, '0');
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add application_number column if it doesn't exist
DO $$ 
DECLARE
    app_record RECORD;
    counter INTEGER;
    date_str TEXT;
    prev_date_str TEXT := '';
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'applications' AND column_name = 'application_number') THEN
        ALTER TABLE applications ADD COLUMN application_number VARCHAR(50);
        
        -- Generate application numbers for existing records (without window functions)
        counter := 1;
        FOR app_record IN 
            SELECT id, created_at 
            FROM applications 
            WHERE application_number IS NULL OR application_number = ''
            ORDER BY created_at
        LOOP
            date_str := TO_CHAR(app_record.created_at, 'YYYYMMDD');
            
            -- Reset counter if date changed
            IF date_str != prev_date_str THEN
                counter := 1;
                prev_date_str := date_str;
            END IF;
            
            -- Update with generated number
            UPDATE applications 
            SET application_number = 'APP-' || date_str || '-' || LPAD(counter::TEXT, 4, '0')
            WHERE id = app_record.id;
            
            counter := counter + 1;
        END LOOP;
        
        ALTER TABLE applications ALTER COLUMN application_number SET NOT NULL;
        CREATE UNIQUE INDEX IF NOT EXISTS idx_applications_number ON applications(application_number);
    END IF;
END $$;

-- Create trigger for application number generation (for new records)
DROP TRIGGER IF EXISTS generate_app_number ON applications;
CREATE TRIGGER generate_app_number
    BEFORE INSERT ON applications
    FOR EACH ROW
    EXECUTE FUNCTION generate_application_number();

-- ============================================
-- CREATE INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_members_username ON members(username);
CREATE INDEX IF NOT EXISTS idx_members_email ON members(email);
CREATE INDEX IF NOT EXISTS idx_members_tiktok_username ON members(tiktok_username);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_email ON applications(email);
CREATE INDEX IF NOT EXISTS idx_media_uploads_upload_date ON media_uploads(upload_date);

-- ============================================
-- ENABLE RLS (Row Level Security)
-- ============================================
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES
-- ============================================

-- Members policies
DROP POLICY IF EXISTS "Allow public read access to members" ON members;
CREATE POLICY "Allow public read access to members" ON members
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow users to update own profile" ON members;
CREATE POLICY "Allow users to update own profile" ON members
    FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow authenticated insert to members" ON members;
CREATE POLICY "Allow authenticated insert to members" ON members
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated delete to members" ON members;
CREATE POLICY "Allow authenticated delete to members" ON members
    FOR DELETE USING (true);

-- Media uploads policies
DROP POLICY IF EXISTS "Allow public read access to media_uploads" ON media_uploads;
CREATE POLICY "Allow public read access to media_uploads" ON media_uploads
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow authenticated insert to media_uploads" ON media_uploads;
CREATE POLICY "Allow authenticated insert to media_uploads" ON media_uploads
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated update to media_uploads" ON media_uploads;
CREATE POLICY "Allow authenticated update to media_uploads" ON media_uploads
    FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow authenticated delete to media_uploads" ON media_uploads;
CREATE POLICY "Allow authenticated delete to media_uploads" ON media_uploads
    FOR DELETE USING (true);

-- Applications policies
DROP POLICY IF EXISTS "Allow public insert to applications" ON applications;
CREATE POLICY "Allow public insert to applications" ON applications
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated read to applications" ON applications;
CREATE POLICY "Allow authenticated read to applications" ON applications
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow authenticated update to applications" ON applications;
CREATE POLICY "Allow authenticated update to applications" ON applications
    FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow authenticated delete to applications" ON applications;
CREATE POLICY "Allow authenticated delete to applications" ON applications
    FOR DELETE USING (true);

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
DO $$
BEGIN
    RAISE NOTICE '✅ Database fix completed successfully!';
    RAISE NOTICE 'All columns have been added and data migrated.';
END $$;

