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
// Import Resend - Handle Resend v3.2.0 import
let ResendClass;
try {
    // Try named export first (most common in v3)
    const resendModule = require('resend');
    
    // Check what we got
    if (resendModule.Resend && typeof resendModule.Resend === 'function') {
        ResendClass = resendModule.Resend;
    } else if (typeof resendModule === 'function') {
        // Module itself is the class
        ResendClass = resendModule;
    } else if (resendModule.default && typeof resendModule.default === 'function') {
        // Default export
        ResendClass = resendModule.default;
    } else {
        throw new Error('Resend constructor not found. Module structure: ' + JSON.stringify(Object.keys(resendModule || {})));
    }
} catch (error) {
    console.error('❌ Failed to import Resend module:', error.message);
    // Don't throw - let the getResend function handle it
}

let resend;
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL;

// Validate email configuration on startup
if (!RESEND_API_KEY) {
    console.warn('⚠️  WARNING: RESEND_API_KEY environment variable is not set!');
    console.warn('   Email functionality will not work without a valid API key.');
} else {
    console.log('✅ RESEND_API_KEY is configured');
}

if (!FROM_EMAIL) {
    console.warn('⚠️  WARNING: FROM_EMAIL environment variable is not set!');
    console.warn('   Using default email address (may not work).');
} else {
    console.log(`✅ FROM_EMAIL is configured: ${FROM_EMAIL}`);
}

// Initialize Resend only when needed
function getResend() {
    if (!RESEND_API_KEY) {
        console.error('❌ RESEND_API_KEY is not set. Cannot initialize Resend.');
        return null;
    }
    
    if (!ResendClass) {
        console.error('❌ Resend class could not be loaded. Check if resend package is installed.');
        return null;
    }
    
    if (!resend) {
        try {
            // Initialize Resend instance with API key
            resend = new ResendClass(RESEND_API_KEY);
            console.log('✅ Resend initialized successfully');
        } catch (error) {
            console.error('❌ Failed to initialize Resend:', error);
            console.error('   Error details:', error.message);
            console.error('   Stack:', error.stack);
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
      console.error('❌ Missing required fields:', { to: !!to, subject: !!subject });
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: to, subject' 
      });
    }

    // Validate email configuration
    if (!RESEND_API_KEY) {
      console.error('❌ RESEND_API_KEY is not configured');
      return res.status(500).json({ 
        success: false, 
        error: 'Email service is not configured. Please set RESEND_API_KEY environment variable.' 
      });
    }

    if (!FROM_EMAIL) {
      console.error('❌ FROM_EMAIL is not configured');
      return res.status(500).json({ 
        success: false, 
        error: 'Email service is not configured. Please set FROM_EMAIL environment variable.' 
      });
    }

    // Get Resend instance
    const resendInstance = getResend();
    if (!resendInstance) {
      console.error('❌ Failed to get Resend instance');
      return res.status(500).json({ 
        success: false, 
        error: 'Email service not available. Please check your RESEND_API_KEY configuration.' 
      });
    }

    // Validate email address format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const recipients = Array.isArray(to) ? to : [to];
    for (const email of recipients) {
      if (!emailRegex.test(email)) {
        console.error(`❌ Invalid email address: ${email}`);
        return res.status(400).json({ 
          success: false, 
          error: `Invalid email address: ${email}` 
        });
      }
    }

    console.log(`📧 Attempting to send email to: ${recipients.join(', ')}`);
    console.log(`   From: ${FROM_EMAIL}`);
    console.log(`   Subject: ${subject}`);
    console.log(`   Type: ${type || 'general'}`);

    // Send email via Resend
    const { data, error } = await resendInstance.emails.send({
      from: FROM_EMAIL,
      to: recipients,
      subject: subject,
      html: html || text || '',
      text: text || html || ''
    });

    if (error) {
      console.error('❌ Resend API error:', JSON.stringify(error, null, 2));
      console.error('   Error details:', error);
      
      // Provide more helpful error messages
      let errorMessage = 'Failed to send email';
      if (error.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else if (error.name) {
        errorMessage = `${error.name}: ${error.message || 'Unknown error'}`;
      }
      
      return res.status(500).json({ 
        success: false, 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }

    console.log(`✅ Email sent successfully to ${recipients.join(', ')} (${type || 'general'})`);
    console.log(`   Email ID: ${data?.id || 'N/A'}`);
    
    res.json({ 
      success: true, 
      id: data?.id,
      message: 'Email sent successfully',
      to: recipients
    });

  } catch (error) {
    console.error('❌ Error sending email:', error);
    console.error('   Stack:', error.stack);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Test email endpoint (for debugging)
app.post('/api/test-email', async (req, res) => {
  try {
    const { to } = req.body;
    
    if (!to) {
      return res.status(400).json({
        success: false,
        error: 'Email address is required'
      });
    }

    const testSubject = 'Test Email from Voice Anchors';
    const testHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Test Email</h1>
          </div>
          <div class="content">
            <p>Hello,</p>
            <p>This is a test email from <strong>Voice Anchors</strong>.</p>
            <p>If you received this email, your email configuration is working correctly!</p>
            <p>Timestamp: ${new Date().toISOString()}</p>
            <p>Best regards,<br>The Voice Anchors Team</p>
          </div>
        </div>
      </body>
      </html>
    `;
    const testText = 'This is a test email from Voice Anchors. If you received this email, your email configuration is working correctly!';

    // Use the same email sending logic
    const resendInstance = getResend();
    if (!resendInstance) {
      return res.status(500).json({
        success: false,
        error: 'Email service is not available. Please check your RESEND_API_KEY configuration.'
      });
    }

    if (!FROM_EMAIL) {
      return res.status(500).json({
        success: false,
        error: 'FROM_EMAIL is not configured.'
      });
    }

    const { data, error } = await resendInstance.emails.send({
      from: FROM_EMAIL,
      to: to,
      subject: testSubject,
      html: testHtml,
      text: testText
    });

    if (error) {
      return res.status(500).json({
        success: false,
        error: error.message || 'Failed to send test email',
        details: error
      });
    }

    res.json({
      success: true,
      message: 'Test email sent successfully',
      emailId: data?.id,
      to: to
    });

  } catch (error) {
    console.error('Error sending test email:', error);
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
  console.log(`📧 Email test endpoint: http://localhost:${PORT}/api/test-email`);
  
  // Log email configuration status
  if (RESEND_API_KEY && FROM_EMAIL) {
    console.log(`✅ Email service is configured`);
    console.log(`   FROM_EMAIL: ${FROM_EMAIL}`);
  } else {
    console.log(`⚠️  Email service is NOT fully configured`);
    if (!RESEND_API_KEY) console.log(`   ❌ RESEND_API_KEY is missing`);
    if (!FROM_EMAIL) console.log(`   ❌ FROM_EMAIL is missing`);
  }
});

