# Voice Anchors Website

A community website for Voice Anchors with admin dashboard, member management, and real-time media sharing powered by Forge.

## Features

- 🔐 **Admin Dashboard** - Create member accounts, upload photos/videos
- 👤 **Member Profiles** - Editable profiles with display name, bio, TikTok link, and profile photo
- 📸 **Media Gallery** - Public activities page showing admin-uploaded content
- 🔄 **Real-Time Updates** - All data synced via Forge database
- 🎨 **Responsive Design** - Modern dark theme with custom background

## Deployment on Render

### Automatic Forge Connection

**Yes, the website will automatically connect to Forge when deployed on Render!**

The Forge connection is client-side (browser-based), so it works from any domain. The website connects directly to your Forge backend at:
- `https://zcmr4dam.us-east.insforge.app`

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

3. **Environment Variables** (Optional)
   - If you need to change the Forge URL, you can set:
     - `FORGE_BASE_URL` (currently hardcoded, but can be made configurable)

4. **Deploy**
   - Click "Create Web Service"
   - Render will build and deploy automatically
   - Your site will be live at: `https://your-app.onrender.com`

### Important Notes

- ✅ **CORS**: The Express server includes CORS headers to allow browser requests
- ✅ **Forge Backend**: Must be publicly accessible (which it is)
- ✅ **No Backend Changes Needed**: The Forge connection is entirely client-side
- ✅ **Real-Time**: All database operations happen directly from the browser

### Database Structure

The website uses these Forge tables:
- `members` - Member accounts (username, email, password, profile data)
- `media_uploads` - Admin-uploaded photos/videos

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
│   ├── forge-api.js   # Forge API client
│   ├── auth.js        # Authentication
│   ├── admin.js       # Admin dashboard
│   ├── member.js      # Member dashboard
│   ├── navigation.js  # Navigation logic
│   └── activities.js  # Activities page
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
- Verify the Forge backend URL is correct
- Check that the Forge backend is publicly accessible
- Ensure database tables exist (created via MCP tools)

### Media Upload Issues
- Verify storage buckets exist and are public
- Check file size limits
- Ensure proper file types (images/videos)

## Support

For issues or questions, check:
- Forge documentation
- Render deployment logs
- Browser console for client-side errors

