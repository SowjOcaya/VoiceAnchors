// Load environment variables from .env file (for local development)
require('dotenv').config();

const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;

// CORS Middleware - Allow requests from any origin (needed for Render deployment)
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/js', express.static(path.join(__dirname, 'js')));
app.use('/images', express.static(path.join(__dirname, 'images')));

// Supabase configuration from environment variables
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || '';

// Function to inject Supabase config into HTML
function injectSupabaseConfig(htmlContent) {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
        return htmlContent;
    }
    
    const supabaseScript = `
    <!-- Supabase Configuration -->
    <script>
        window.SUPABASE_URL = '${SUPABASE_URL}';
        window.SUPABASE_ANON_KEY = '${SUPABASE_ANON_KEY}';
    </script>`;
    
    // Replace forge-api.js with supabase-api.js and inject config
    let modified = htmlContent
        .replace(/<script[^>]*src=["']\/js\/forge-api\.js["'][^>]*><\/script>/gi, 
            supabaseScript + '\n    <script src="/js/supabase-api.js"></script>')
        .replace(/<script[^>]*src=["']js\/forge-api\.js["'][^>]*><\/script>/gi, 
            supabaseScript + '\n    <script src="/js/supabase-api.js"></script>');
    
    return modified;
}

// Serve HTML files with Supabase config injection
app.get('*.html', (req, res) => {
    const filePath = path.join(__dirname, 'html', path.basename(req.path));
    
    if (fs.existsSync(filePath)) {
        let htmlContent = fs.readFileSync(filePath, 'utf8');
        htmlContent = injectSupabaseConfig(htmlContent);
        res.send(htmlContent);
    } else {
        res.status(404).send('File not found');
    }
});

// Serve other static files
app.use(express.static(path.join(__dirname, 'html')));

// Default route - serve MainBoard.html with Supabase config
app.get('/', (req, res) => {
  const filePath = path.join(__dirname, 'html', 'MainBoard.html');
  if (fs.existsSync(filePath)) {
    let htmlContent = fs.readFileSync(filePath, 'utf8');
    htmlContent = injectSupabaseConfig(htmlContent);
    res.send(htmlContent);
  } else {
    res.status(404).send('MainBoard.html not found');
  }
});

// Health check route
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// ============================================
// Resend Email API Endpoint
// ============================================
// Lazy load Resend to avoid React Email dependencies if not needed
let Resend, resend;
const RESEND_API_KEY = process.env.RESEND_API_KEY || 're_VnYhuscq_Lz9AaSYaWgAEivaXkV9bGG2e';
const FROM_EMAIL = process.env.FROM_EMAIL || 'voiceanchors@resend.com'; // Change this to your verified domain

// Initialize Resend only when needed
function getResend() {
    if (!resend) {
        try {
            Resend = require('resend');
            resend = new Resend(RESEND_API_KEY);
        } catch (error) {
            console.error('Failed to initialize Resend:', error);
            return null;
        }
    }
    return resend;
}

// Email sending endpoint
app.post('/api/send-email', async (req, res) => {
  try {
    const { to, subject, html, text, type } = req.body;

    // Validate required fields
    if (!to || !subject) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: to, subject' 
      });
    }

    // Get Resend instance
    const resendInstance = getResend();
    if (!resendInstance) {
      return res.status(500).json({ 
        success: false, 
        error: 'Email service not available' 
      });
    }

    // Send email via Resend
    const { data, error } = await resendInstance.emails.send({
      from: FROM_EMAIL,
      to: Array.isArray(to) ? to : [to],
      subject: subject,
      html: html || text || '',
      text: text || html || ''
    });

    if (error) {
      console.error('Resend API error:', error);
      return res.status(500).json({ 
        success: false, 
        error: error.message || 'Failed to send email' 
      });
    }

    console.log(`✅ Email sent successfully to ${to} (${type || 'general'})`);
    res.json({ 
      success: true, 
      id: data?.id,
      message: 'Email sent successfully' 
    });

  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Internal server error' 
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`📝 Health check available at http://localhost:${PORT}/health`);
  console.log(`🌐 Website available at http://localhost:${PORT}`);
});

