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
// SendPulse Email API Endpoint
// ============================================
// Import SendPulse SMTP API
const SendPulse = require('@sendpulse/smtp-api-v1');

let sendpulse;
const SENDPULSE_API_ID = process.env.SENDPULSE_API_ID || '7fd6ce78ffb534da678d14085e795631';
const SENDPULSE_API_SECRET = process.env.SENDPULSE_API_SECRET || 'ebc54ee9ce66598df879ae76de5067c1';
const FROM_EMAIL = process.env.SENDPULSE_FROM_EMAIL;

// Validate email configuration on startup
if (!SENDPULSE_API_ID || !SENDPULSE_API_SECRET) {
    console.warn('⚠️  WARNING: SendPulse API credentials are not set!');
    console.warn('   Email functionality will not work without valid credentials.');
} else {
    console.log('✅ SendPulse API credentials are configured');
}

if (!FROM_EMAIL) {
    console.warn('⚠️  WARNING: SENDPULSE_FROM_EMAIL environment variable is not set!');
    console.warn('   Using default email address (may not work).');
} else {
    console.log(`✅ SENDPULSE_FROM_EMAIL is configured: ${FROM_EMAIL}`);
}

// Initialize SendPulse only when needed
function getSendPulse() {
    if (!SENDPULSE_API_ID || !SENDPULSE_API_SECRET) {
        console.error('❌ SendPulse API credentials are not set. Cannot initialize SendPulse.');
        return null;
    }
    
    if (!sendpulse) {
        try {
            // Initialize SendPulse instance with API credentials
            sendpulse = new SendPulse(SENDPULSE_API_ID, SENDPULSE_API_SECRET);
            console.log('✅ SendPulse initialized successfully');
        } catch (error) {
            console.error('❌ Failed to initialize SendPulse:', error);
            console.error('   Error details:', error.message);
            console.error('   Stack:', error.stack);
            return null;
        }
    }
    return sendpulse;
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

    // Get SendPulse instance
    const sendpulseInstance = getSendPulse();
    if (!sendpulseInstance) {
      console.error('❌ Failed to get SendPulse instance');
      return res.status(500).json({ 
        success: false, 
        error: 'Email service not available. Please check your SendPulse API configuration.' 
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

    // Send email via SendPulse
    const emailData = {
      from: {
        name: 'Voice Anchors',
        email: FROM_EMAIL
      },
      to: recipients.map(email => ({ email })),
      subject: subject,
      html: html || text || '',
      text: text || html || ''
    };

    try {
      const result = await new Promise((resolve, reject) => {
        sendpulseInstance.smtp.emails.send(emailData, (data, error) => {
          if (error) {
            reject(error);
          } else {
            resolve(data);
          }
        });
      });

      console.log('✅ SendPulse email sent successfully:', result);
    } catch (error) {
      console.error('❌ SendPulse API error:', error);
      
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
    const sendpulseInstance = getSendPulse();
    if (!sendpulseInstance) {
      return res.status(500).json({
        success: false,
        error: 'Email service is not available. Please check your SendPulse API configuration.'
      });
    }

    if (!FROM_EMAIL) {
      return res.status(500).json({
        success: false,
        error: 'SENDPULSE_FROM_EMAIL is not configured.'
      });
    }

    try {
      const emailData = {
        from: {
          name: 'Voice Anchors',
          email: FROM_EMAIL
        },
        to: [{ email: to }],
        subject: testSubject,
        html: testHtml,
        text: testText
      };

      const result = await new Promise((resolve, reject) => {
        sendpulseInstance.smtp.emails.send(emailData, (data, error) => {
          if (error) {
            reject(error);
          } else {
            resolve(data);
          }
        });
      });

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
  if (SENDPULSE_API_ID && SENDPULSE_API_SECRET && FROM_EMAIL) {
    console.log(`✅ SendPulse email service is configured`);
    console.log(`   FROM_EMAIL: ${FROM_EMAIL}`);
  } else {
    console.log(`⚠️  SendPulse email service is NOT fully configured`);
    if (!SENDPULSE_API_ID) console.log(`   ❌ SENDPULSE_API_ID is missing`);
    if (!SENDPULSE_API_SECRET) console.log(`   ❌ SENDPULSE_API_SECRET is missing`);
    if (!FROM_EMAIL) console.log(`   ❌ SENDPULSE_FROM_EMAIL is missing`);
  }
});

