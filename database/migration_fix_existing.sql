-- Migration Script to Fix Existing Database
-- Run this AFTER running schema_fixed.sql if you already have data
-- This script adds missing columns and migrates data

-- Add missing columns to media_uploads table
DO $$ 
BEGIN
    -- Add title column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'media_uploads' AND column_name = 'title') THEN
        ALTER TABLE media_uploads ADD COLUMN title VARCHAR(255);
        -- Migrate file_name to title
        UPDATE media_uploads SET title = file_name WHERE title IS NULL;
        ALTER TABLE media_uploads ALTER COLUMN title SET NOT NULL;
    END IF;

    -- Add media_url column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'media_uploads' AND column_name = 'media_url') THEN
        ALTER TABLE media_uploads ADD COLUMN media_url TEXT;
        -- Migrate file_url to media_url
        UPDATE media_uploads SET media_url = file_url WHERE media_url IS NULL;
        ALTER TABLE media_uploads ALTER COLUMN media_url SET NOT NULL;
    END IF;

    -- Add media_type column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'media_uploads' AND column_name = 'media_type') THEN
        ALTER TABLE media_uploads ADD COLUMN media_type VARCHAR(50);
        -- Migrate file_type to media_type
        UPDATE media_uploads SET media_type = file_type WHERE media_type IS NULL;
        -- Set default based on file extension if still null
        UPDATE media_uploads SET media_type = 'video' 
        WHERE media_type IS NULL AND (file_name LIKE '%.mp4' OR file_name LIKE '%.mov' OR file_name LIKE '%.avi');
        UPDATE media_uploads SET media_type = 'photo' 
        WHERE media_type IS NULL;
        ALTER TABLE media_uploads ALTER COLUMN media_type SET NOT NULL;
    END IF;

    -- Add upload_date column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'media_uploads' AND column_name = 'upload_date') THEN
        ALTER TABLE media_uploads ADD COLUMN upload_date TIMESTAMP WITH TIME ZONE;
        -- Migrate uploaded_at to upload_date
        UPDATE media_uploads SET upload_date = uploaded_at WHERE upload_date IS NULL;
        ALTER TABLE media_uploads ALTER COLUMN upload_date SET DEFAULT NOW();
    END IF;
END $$;

-- Add application_number to applications table
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
            WHERE application_number IS NULL 
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

-- Add tiktok_username to members table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'members' AND column_name = 'tiktok_username') THEN
        ALTER TABLE members ADD COLUMN tiktok_username VARCHAR(255);
        -- Migrate tiktok_link to tiktok_username if possible
        UPDATE members 
        SET tiktok_username = REPLACE(REPLACE(tiktok_link, 'https://www.tiktok.com/@', ''), 'https://tiktok.com/@', '')
        WHERE tiktok_username IS NULL AND tiktok_link IS NOT NULL;
    END IF;
END $$;

-- Create sequence for application numbers if it doesn't exist
CREATE SEQUENCE IF NOT EXISTS application_number_seq START 1;

-- Recreate trigger for application number generation
DROP TRIGGER IF EXISTS generate_app_number ON applications;
CREATE TRIGGER generate_app_number
    BEFORE INSERT ON applications
    FOR EACH ROW
    EXECUTE FUNCTION generate_application_number();

