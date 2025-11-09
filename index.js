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
// SendPulse Email SMTP Configuration
// ============================================
// Import nodemailer for SMTP email sending
const nodemailer = require('nodemailer');

const SMTP_CONFIG = {
  host: process.env.SMTP_HOST || 'smtp-pulse.net',
  port: process.env.SMTP_PORT || 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER || '7fd6ce78ffb534da678d14085e795631',
    pass: process.env.SMTP_PASSWORD || 'ebc54ee9ce66598df879ae76de5067c1'
  }
};
const FROM_EMAIL = process.env.SMTP_FROM_EMAIL;

// Validate email configuration on startup (SMTP)
if (!SMTP_CONFIG.auth.user || !SMTP_CONFIG.auth.pass) {
  console.warn('⚠️  WARNING: SMTP credentials are not set! Email functionality may not work.');
} else {
  console.log('✅ SMTP credentials are configured');
}

if (!FROM_EMAIL) {
  console.warn('⚠️  WARNING: SMTP_FROM_EMAIL environment variable is not set!');
  console.warn('   Using default email address (may not work).');
} else {
  console.log(`✅ SMTP_FROM_EMAIL is configured: ${FROM_EMAIL}`);
}

// Create transporter for sending emails
function createTransporter() {
    try {
        const transporter = nodemailer.createTransport(SMTP_CONFIG);
        console.log('✅ SMTP transporter created successfully');
        return transporter;
    } catch (error) {
        console.error('❌ Failed to create SMTP transporter:', error);
        console.error('   Error details:', error.message);
        console.error('   Stack:', error.stack);
        return null;
    }
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

    // Validate email configuration (SMTP)
    if (!SMTP_CONFIG.auth.user || !SMTP_CONFIG.auth.pass) {
      console.error('❌ SMTP credentials (SMTP_USER/SMTP_PASSWORD) are not configured');
      return res.status(500).json({ 
        success: false, 
        error: 'Email service is not configured. Please set SMTP_USER and SMTP_PASSWORD environment variables.' 
      });
    }

    if (!FROM_EMAIL) {
      console.error('❌ SMTP_FROM_EMAIL is not configured');
      return res.status(500).json({ 
        success: false, 
        error: 'Email service is not configured. Please set SMTP_FROM_EMAIL environment variable.' 
      });
    }

    // Create SMTP transporter
    const transporter = createTransporter();
    if (!transporter) {
      console.error('❌ Failed to create SMTP transporter');
      return res.status(500).json({ 
        success: false, 
        error: 'Email service not available. Please check your SMTP configuration.' 
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

    // Prepare email data
    const mailOptions = {
      from: {
        name: 'Voice Anchors',
        address: FROM_EMAIL
      },
      to: recipients.join(', '),
      subject: subject,
      html: html || text || '',
      text: text || html || ''
    };

    try {
      // Send email via SMTP
      const result = await transporter.sendMail(mailOptions);

      console.log(`✅ Email sent successfully to ${recipients.join(', ')} (${type || 'general'})`);
      console.log('   Message ID:', result.messageId || result.response || 'N/A');

      return res.json({
        success: true,
        id: result.messageId || result.response,
        message: 'Email sent successfully',
        to: recipients
      });
    } catch (error) {
      console.error('❌ SMTP send error:', error);
      let errorMessage = 'Failed to send email';
      if (error && error.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      return res.status(500).json({
        success: false,
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }

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

    // Create SMTP transporter
    const transporter = createTransporter();
    if (!transporter) {
      return res.status(500).json({
        success: false,
        error: 'Email service is not available. Please check your SMTP configuration.'
      });
    }

    if (!FROM_EMAIL) {
      return res.status(500).json({
        success: false,
        error: 'SMTP_FROM_EMAIL is not configured.'
      });
    }

    try {
      const mailOptions = {
        from: {
          name: 'Voice Anchors',
          address: FROM_EMAIL
        },
        to: to,
        subject: testSubject,
        html: testHtml,
        text: testText
      };

      const result = await transporter.sendMail(mailOptions);

      res.json({
        success: true,
        message: 'Test email sent successfully',
        to: to
      });
    } catch (error) {
      console.error('Error sending test email:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Internal server error'
      });
    }

    // response already sent inside try/catch above

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
  const smtpUser = SMTP_CONFIG.auth.user;
  const smtpPass = SMTP_CONFIG.auth.pass;
  if (smtpUser && smtpPass && FROM_EMAIL) {
    console.log(`✅ SMTP email service is configured`);
    console.log(`   Host: ${SMTP_CONFIG.host}`);
    console.log(`   Port: ${SMTP_CONFIG.port}`);
    console.log(`   FROM_EMAIL: ${FROM_EMAIL}`);
  } else {
    console.log(`⚠️  SMTP email service is NOT fully configured`);
    if (!smtpUser) console.log(`   ❌ SMTP_USER is missing`);
    if (!smtpPass) console.log(`   ❌ SMTP_PASSWORD is missing`);
    if (!FROM_EMAIL) console.log(`   ❌ SMTP_FROM_EMAIL is missing`);
  }
});

