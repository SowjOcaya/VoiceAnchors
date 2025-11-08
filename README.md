# Voice Anchors Website

A community website for Voice Anchors with admin dashboard, member management, and real-time media sharing powered by Supabase.

## Features

- 🔐 **Admin Dashboard** - Create member accounts, upload photos/videos
- 👤 **Member Profiles** - Editable profiles with display name, bio, TikTok link, and profile photo
- 📸 **Media Gallery** - Public activities page showing admin-uploaded content
- 🔄 **Real-Time Updates** - All data synced via Forge database
- 🎨 **Responsive Design** - Modern dark theme with custom background

## Database Setup

This project uses **Supabase** as the database backend. Supabase provides:
- PostgreSQL database with PostgREST API
- File storage for profile pictures and media
- Free tier with generous limits
- Easy integration with Render

### Quick Setup

See `QUICK_START_SUPABASE.md` for a 5-minute setup guide, or `SUPABASE_SETUP.md` for detailed instructions.

## Deployment on Render

### Automatic Supabase Connection

**Yes, the website will automatically connect to Supabase when deployed on Render!**

The Supabase connection is configured via environment variables. Set these in your Render dashboard:
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_ANON_KEY` - Your Supabase anon/public key

### Deployment Steps

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Create Render Web Service**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New" → "Web Service"
   - Connect your GitHub repository
   - Configure:
     - **Name**: `voice-anchors` (or your choice)
     - **Environment**: `Node`
     - **Build Command**: `npm install`
     - **Start Command**: `npm start`
     - **Port**: `3000` (or leave default)

3. **Environment Variables** (Required)
   - Set these in Render dashboard → Environment tab:
     - `SUPABASE_URL` - Your Supabase project URL (e.g., `https://xxxxx.supabase.co`)
     - `SUPABASE_ANON_KEY` - Your Supabase anon/public key

4. **Deploy**
   - Click "Create Web Service"
   - Render will build and deploy automatically
   - Your site will be live at: `https://your-app.onrender.com`

### Important Notes

- ✅ **CORS**: The Express server includes CORS headers to allow browser requests
- ✅ **Supabase Backend**: Publicly accessible PostgreSQL database
- ✅ **Automatic Config Injection**: Supabase credentials are automatically injected into HTML
- ✅ **Real-Time**: All database operations happen directly from the browser

### Database Structure

The website uses these Supabase tables:
- `members` - Member accounts (username, email, password, profile data)
- `media_uploads` - Admin-uploaded photos/videos
- `applications` - Member applications
- `password_resets` - Password reset tokens

Storage buckets:
- `media-uploads` - Public bucket for admin media
- `profile-pictures` - Public bucket for member profile photos

### Local Development

```bash
npm install
npm start
```

Visit `http://localhost:3000`

### Admin Credentials

- Username: `Sowj`
- Password: `Sowjva@rody1122`

## File Structure

```
VoiceAnchors/
├── html/              # HTML pages
├── css/               # Stylesheets
├── js/                # JavaScript files
│   ├── supabase-api.js # Supabase API client (replaces forge-api.js)
│   ├── forge-api.js   # Legacy Forge API client (deprecated)
│   ├── auth.js        # Authentication
│   ├── admin.js       # Admin dashboard
│   ├── member.js      # Member dashboard
│   ├── navigation.js  # Navigation logic
│   └── activities.js  # Activities page
├── database/          # Database schema
│   └── schema.sql     # Supabase database schema
├── images/            # Assets (BG.jpg, icon.jpg)
├── index.js           # Express server
└── package.json       # Dependencies
```

## Troubleshooting

### CORS Errors
If you see CORS errors, ensure:
- The Forge backend allows requests from your Render domain
- The Express server CORS middleware is active

### Database Connection Issues
- Verify your Supabase URL and anon key are set correctly in Render environment variables
- Check that the database schema has been created (run `database/schema.sql` in Supabase SQL Editor)
- Ensure storage buckets exist and are public
- Check browser console for specific error messages

### Media Upload Issues
- Verify storage buckets exist and are public
- Check file size limits
- Ensure proper file types (images/videos)

## Support

For issues or questions, check:
- `SUPABASE_SETUP.md` - Detailed Supabase setup guide
- `QUICK_START_SUPABASE.md` - Quick 5-minute setup
- Supabase documentation: [https://supabase.com/docs](https://supabase.com/docs)
- Render deployment logs
- Browser console for client-side errors



