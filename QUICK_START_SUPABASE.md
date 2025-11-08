# Quick Start: Supabase Setup for Voice Anchors

## 🚀 Quick Setup (5 minutes)

### Step 1: Create Supabase Account
1. Go to [https://supabase.com](https://supabase.com)
2. Sign up with GitHub
3. Click **"New Project"**
4. Fill in:
   - **Name**: `voice-anchors`
   - **Database Password**: (save this!)
   - **Region**: Choose closest
5. Click **"Create new project"**
6. Wait 2-3 minutes

### Step 2: Get Your Keys
1. In Supabase dashboard → **Settings** → **API**
2. Copy these values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon public key** (starts with `eyJ`)

### Step 3: Set Up Database
1. Go to **SQL Editor** in Supabase
2. Click **"New query"**
3. Copy ALL content from `database/schema.sql`
4. Paste and click **"Run"**
5. You should see "Success. No rows returned"

### Step 4: Create Storage Buckets
1. Go to **Storage** in Supabase
2. Create bucket: `profile-pictures` (✅ Public)
3. Create bucket: `media-uploads` (✅ Public)

### Step 5: Deploy to Render
1. Push to GitHub:
   ```bash
   git add .
   git commit -m "Add Supabase database support"
   git push origin main
   ```

2. In Render dashboard:
   - Go to your web service
   - Go to **Environment** tab
   - Add these variables:
     - `SUPABASE_URL` = `https://your-project.supabase.co`
     - `SUPABASE_ANON_KEY` = `your-anon-key-here`
   - Save and redeploy

### Step 6: Test
1. Visit your deployed site
2. Try creating a member (admin login)
3. Check Supabase → **Table Editor** to see data

## ✅ Done!

Your website now uses Supabase instead of Forge!

## 📚 Need More Help?

See `SUPABASE_SETUP.md` for detailed instructions.

