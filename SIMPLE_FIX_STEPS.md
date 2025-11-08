# Simple Fix Steps - Run This ONE Script

## 🚨 The Problem:
- Error: "column tiktok_username does not exist"
- Error: "window functions are not allowed in UPDATE QUERY"

## ✅ The Solution:

I've created a **single, all-in-one fix script** that handles everything safely.

### Step 1: Run the Fix Script

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Click **"New query"**
3. Open the file: `database/FIX_ALL_AT_ONCE.sql`
4. Copy **ALL** the SQL code
5. Paste into Supabase SQL Editor
6. Click **"Run"** (or press Ctrl+Enter)
7. ✅ Done!

### What This Script Does:

✅ Adds `tiktok_username` to members table  
✅ Adds `title` to media_uploads table  
✅ Adds `media_url` to media_uploads table  
✅ Adds `media_type` to media_uploads table  
✅ Adds `upload_date` to media_uploads table  
✅ Adds `application_number` to applications table  
✅ Migrates existing data safely  
✅ Creates all indexes  
✅ Sets up RLS policies  
✅ Creates triggers for auto-generating application numbers  

### Step 2: Test

1. **Test Media Upload:**
   - Go to Admin Dashboard
   - Upload a photo/video
   - Should work! ✅

2. **Test Application Form:**
   - Go to Apply page
   - Fill form and submit
   - Should work! ✅

3. **Check Database:**
   - Go to Supabase → Table Editor
   - Check `members` table - should have `tiktok_username`
   - Check `media_uploads` table - should have all new columns
   - Check `applications` table - should have `application_number`

## 🎉 That's It!

The script is **safe** - it checks if columns exist before adding them, so you can run it multiple times without issues.

## ❓ Still Getting Errors?

1. Make sure you copied the **ENTIRE** script
2. Check for any error messages in Supabase
3. Try refreshing the page and running again
4. The script is idempotent (safe to run multiple times)

