# Supabase Database Setup Guide for Voice Anchors

This guide will help you set up Supabase as your database for the Voice Anchors website on Render.

## Why Supabase?

- ✅ **PostgreSQL Database** - Robust, reliable, and free tier available
- ✅ **PostgREST API** - Same API style as Forge, minimal code changes needed
- ✅ **Storage Included** - Built-in file storage for profile pictures and media
- ✅ **Works Great with Render** - Easy integration, no additional setup needed
- ✅ **Free Tier** - 500MB database, 1GB file storage, 2GB bandwidth/month

## Step 1: Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Click **"Start your project"** or **"Sign in"**
3. Sign up/login with GitHub (recommended)
4. Click **"New Project"**
5. Fill in the details:
   - **Name**: `voice-anchors` (or your choice)
   - **Database Password**: Create a strong password (save it!)
   - **Region**: Choose closest to your users
   - **Pricing Plan**: Free (to start)
6. Click **"Create new project"**
7. Wait 2-3 minutes for the project to be created

## Step 2: Get Your Supabase Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. You'll need these values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon/public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (starts with `eyJ`)
   - **service_role key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (keep this secret!)

## Step 3: Set Up Database Schema

1. In Supabase dashboard, go to **SQL Editor**
2. Click **"New query"**
3. Copy and paste the entire contents of `database/schema.sql`
4. Click **"Run"** (or press Ctrl+Enter)
5. You should see "Success. No rows returned"

## Step 4: Set Up Storage Buckets

1. Go to **Storage** in the Supabase dashboard
2. Click **"Create a new bucket"**
3. Create bucket: `profile-pictures`
   - **Name**: `profile-pictures`
   - **Public bucket**: ✅ Check this
   - Click **"Create bucket"**
4. Create bucket: `media-uploads`
   - **Name**: `media-uploads`
   - **Public bucket**: ✅ Check this
   - Click **"Create bucket"**

### Set Storage Policies

For each bucket (`profile-pictures` and `media-uploads`):

1. Click on the bucket name
2. Go to **Policies** tab
3. Click **"New Policy"** → **"For full customization"**
4. Use these policies:

**For profile-pictures:**
```sql
-- Allow public read access
CREATE POLICY "Public Access" ON storage.objects
FOR SELECT USING (bucket_id = 'profile-pictures');

-- Allow authenticated upload
CREATE POLICY "Authenticated Upload" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'profile-pictures');

-- Allow authenticated update
CREATE POLICY "Authenticated Update" ON storage.objects
FOR UPDATE USING (bucket_id = 'profile-pictures');

-- Allow authenticated delete
CREATE POLICY "Authenticated Delete" ON storage.objects
FOR DELETE USING (bucket_id = 'profile-pictures');
```

**For media-uploads:**
```sql
-- Allow public read access
CREATE POLICY "Public Access" ON storage.objects
FOR SELECT USING (bucket_id = 'media-uploads');

-- Allow authenticated upload
CREATE POLICY "Authenticated Upload" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'media-uploads');

-- Allow authenticated delete
CREATE POLICY "Authenticated Delete" ON storage.objects
FOR DELETE USING (bucket_id = 'media-uploads');
```

## Step 5: Update Your Code

### Option A: Update HTML Files (Recommended)

Add this to your HTML files (before `forge-api.js` or `supabase-api.js`):

```html
<script>
    // Supabase Configuration
    window.SUPABASE_URL = 'https://your-project.supabase.co';
    window.SUPABASE_ANON_KEY = 'your-anon-key-here';
    // Optional: For admin operations, you can use service_role key
    // window.SUPABASE_SERVICE_KEY = 'your-service-role-key-here';
</script>
<script src="/js/supabase-api.js"></script>
```

### Option B: Use Environment Variables (For Render)

Update your `render.yaml`:

```yaml
services:
  - type: web
    name: voice-anchors
    env: node
    buildCommand: npm install
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 3000
      - key: SUPABASE_URL
        value: https://your-project.supabase.co
      - key: SUPABASE_ANON_KEY
        value: your-anon-key-here
```

Then update `index.js` to inject these into HTML:

```javascript
// In index.js, add middleware to inject Supabase config
app.use((req, res, next) => {
    res.locals.supabaseUrl = process.env.SUPABASE_URL || '';
    res.locals.supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';
    next();
});
```

## Step 6: Update HTML Files to Use Supabase

Replace references to `forge-api.js` with `supabase-api.js` in your HTML files:

**Before:**
```html
<script src="/js/forge-api.js"></script>
```

**After:**
```html
<script>
    window.SUPABASE_URL = 'https://your-project.supabase.co';
    window.SUPABASE_ANON_KEY = 'your-anon-key-here';
</script>
<script src="/js/supabase-api.js"></script>
```

## Step 7: Deploy to Render

1. Push your changes to GitHub:
   ```bash
   git add .
   git commit -m "Migrate to Supabase database"
   git push origin main
   ```

2. In Render dashboard:
   - Go to your web service
   - Go to **Environment** tab
   - Add environment variables:
     - `SUPABASE_URL` = `https://your-project.supabase.co`
     - `SUPABASE_ANON_KEY` = `your-anon-key-here`
   - Save changes
   - Render will automatically redeploy

## Step 8: Test Your Setup

1. Visit your deployed site
2. Try creating a member account (admin)
3. Try uploading a profile picture
4. Check Supabase dashboard → **Table Editor** to see your data
5. Check **Storage** to see uploaded files

## Troubleshooting

### Database Connection Issues

- Verify your Supabase URL and keys are correct
- Check browser console for errors
- Ensure RLS policies are set correctly

### Storage Upload Issues

- Verify buckets are created and public
- Check storage policies are set
- Verify file size limits (default is 50MB)

### CORS Issues

- Supabase handles CORS automatically
- If issues persist, check Supabase dashboard → Settings → API → CORS settings

### Authentication Issues

- The current setup uses anon key for all operations
- For production, consider implementing proper authentication with Supabase Auth

## Security Notes

⚠️ **Important**: 
- The `anon` key is safe to expose in client-side code
- The `service_role` key should NEVER be exposed in client-side code
- For production, implement proper user authentication using Supabase Auth

## Next Steps

1. ✅ Database is set up and working
2. ✅ Storage buckets are configured
3. 🔄 Consider implementing Supabase Auth for better security
4. 🔄 Set up email templates for password resets
5. 🔄 Add database backups (automatic on paid plans)

## Support

- Supabase Docs: [https://supabase.com/docs](https://supabase.com/docs)
- Supabase Discord: [https://discord.supabase.com](https://discord.supabase.com)
- Render Docs: [https://render.com/docs](https://render.com/docs)

