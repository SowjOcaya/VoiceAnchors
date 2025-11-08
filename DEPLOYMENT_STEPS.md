# Deployment Steps - Supabase Setup

## ✅ You've Already Done:
- Created Supabase project
- Set up database schema
- Created storage buckets

## 🔧 What You Need to Do Now:

### For Local Testing:

1. **Create a `.env` file** in the root directory:
   ```bash
   SUPABASE_URL=https://anbpagrsopkxzvilwesz.supabase.co
   SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFuYnBhZ3Jzb3BreHp2aWx3ZXN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2MTczMDUsImV4cCI6MjA3ODE5MzMwNX0.ltQoVunLvt-MmYcmiDFWlXDidHbjHpK6RzvsFVi4Mxc
   ```

2. **Install dependencies** (if you haven't):
   ```bash
   npm install
   ```

3. **Run locally**:
   ```bash
   npm start
   ```

4. **Test**: Visit `http://localhost:3000` and check browser console for any errors

### For Render Deployment:

1. **Push your code to GitHub**:
   ```bash
   git add .
   git commit -m "Add Supabase database support"
   git push origin main
   ```

2. **In Render Dashboard**:
   - Go to your web service
   - Click on **"Environment"** tab
   - Click **"Add Environment Variable"**
   - Add these two variables:
     
     **Variable 1:**
     - Key: `SUPABASE_URL`
     - Value: `https://anbpagrsopkxzvilwesz.supabase.co`
     - Click **"Save"**
     
     **Variable 2:**
     - Key: `SUPABASE_ANON_KEY`
     - Value: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFuYnBhZ3Jzb3BreHp2aWx3ZXN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2MTczMDUsImV4cCI6MjA3ODE5MzMwNX0.ltQoVunLvt-MmYcmiDFWlXDidHbjHpK6RzvsFVi4Mxc`
     - Click **"Save"**

3. **Redeploy**:
   - Render will automatically redeploy when you save environment variables
   - Or click **"Manual Deploy"** → **"Deploy latest commit"**

4. **Test your deployed site**:
   - Visit your Render URL
   - Try logging in as admin
   - Check browser console (F12) for any errors

## 🎉 That's It!

The code is already set up to:
- ✅ Automatically inject Supabase config into HTML files
- ✅ Replace `forge-api.js` with `supabase-api.js`
- ✅ Use environment variables from Render

**You don't need to manually edit any HTML files!** The `index.js` server does this automatically.

## 🔍 Verify It's Working:

1. Open your website
2. Open browser console (F12)
3. Type: `window.SUPABASE_URL`
4. You should see: `"https://anbpagrsopkxzvilwesz.supabase.co"`

If you see that, it's working! 🎉

## ❌ Troubleshooting:

**If you see errors:**
- Check that environment variables are set correctly in Render
- Verify your Supabase project is active
- Check browser console for specific error messages
- Make sure storage buckets are public in Supabase

