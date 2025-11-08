# Database Fix Instructions

## 🚨 Issues Found and Fixed:

1. **Missing `media_type` column** - Code expects `media_type` but schema had `file_type`
2. **Missing `title` column** - Code expects `title` but schema had `file_name`
3. **Missing `media_url` column** - Code expects `media_url` but schema had `file_url`
4. **Missing `upload_date` column** - Code expects `upload_date` but schema had `uploaded_at`
5. **Missing `application_number` field** - You requested this for tracking applications
6. **Application form dropdown** - Fixed to include "Politician or Celebrity" option

## 📋 Step-by-Step Fix:

### Option 1: Fresh Database (No Existing Data)

If you don't have important data yet, run this:

1. Go to Supabase Dashboard → **SQL Editor**
2. Copy and paste the **ENTIRE** contents of `database/schema_fixed.sql`
3. Click **"Run"**
4. Done! ✅

### Option 2: Existing Database (Keep Your Data)

If you already have data, run these in order:

1. Go to Supabase Dashboard → **SQL Editor**
2. **First**, run `database/schema_fixed.sql` (this creates missing columns safely)
3. **Then**, run `database/migration_fix_existing.sql` (this migrates existing data)
4. Done! ✅

## ✅ What Was Fixed:

### Members Table:
- ✅ `username` - Member username
- ✅ `email` - Email address
- ✅ `password` - Password (hashed)
- ✅ `tiktok_username` - TikTok account username
- ✅ `tiktok_link` - Full TikTok URL (optional)
- ✅ `display_name` - Display name
- ✅ `bio` - Biography
- ✅ `profile_picture_url` - Profile picture

### Media Uploads Table:
- ✅ `title` - Media title (FIXED)
- ✅ `description` - Description
- ✅ `media_url` - Media file URL (FIXED)
- ✅ `media_type` - Type: 'photo' or 'video' (FIXED)
- ✅ `upload_date` - Upload date (FIXED)
- ✅ `file_name` - Original filename
- ✅ `file_size` - File size in bytes

### Applications Table:
- ✅ `application_number` - Auto-generated unique number (NEW!)
  - Format: `APP-YYYYMMDD-0001`
  - Example: `APP-20250115-0001`
- ✅ `email` - Applicant email
- ✅ `tiktok_username` - TikTok username
- ✅ `reason` - Why they want to join
- ✅ `impersonation_choice` - What they want to impersonate
- ✅ `status` - Application status (pending/approved/rejected)
- ✅ `created_at` - When applied
- ✅ `updated_at` - Last update

## 🎯 Application Form Fix:

The dropdown now includes:
- ✅ "Politician or Celebrity" (first option)
- ✅ "Celebrity"
- ✅ "Politician"

The form should now submit correctly!

## 🧪 Test After Fixing:

1. **Test Media Upload:**
   - Go to Admin Dashboard
   - Try uploading a photo/video
   - Should work without "media_type column not found" error

2. **Test Application Form:**
   - Go to Apply page
   - Fill in email and TikTok username
   - Click Apply
   - Fill in reason and select "Politician or Celebrity"
   - Click Submit Application
   - Should work! ✅

3. **Check Database:**
   - Go to Supabase → Table Editor
   - Check `applications` table - should have `application_number` column
   - Check `media_uploads` table - should have `media_type`, `title`, `media_url` columns

## ❓ Troubleshooting:

**If you get errors:**
1. Make sure you ran the SQL scripts in order
2. Check Supabase logs for specific errors
3. Verify all columns exist in Table Editor
4. Clear browser cache and try again

**If application form still doesn't submit:**
1. Open browser console (F12)
2. Check for JavaScript errors
3. Make sure `supabase-api.js` is loaded
4. Verify Supabase credentials are set

## 📝 Notes:

- Application numbers are **auto-generated** - you don't need to set them manually
- The database trigger creates them automatically when a new application is inserted
- Format: `APP-YYYYMMDD-####` (e.g., `APP-20250115-0001`)

