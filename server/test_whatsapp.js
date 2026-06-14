require('dotenv').config();
const mongoose = require('mongoose');

// Models
const MenuItem = require('./models/MenuItem');
const Coupon = require('./models/Coupon');
const Order = require('./models/Order');
const Booking = require('./models/Booking');
const WhatsAppMessage = require('./models/WhatsAppMessage');

// Import handler
const { handleIncomingMessage } = require('./controllers/whatsappController');

async function runTest() {
  console.log('[TEST] Connecting to MongoDB...');
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/royal-bites';
    await mongoose.connect(mongoUri);
    console.log('[TEST] Connected to MongoDB.');
  } catch (err) {
    console.error('[TEST Error] MongoDB connection failed:', err.message);
  }

  // Verify Environment Variables
  console.log('\n[TEST] Checking Environment Variables:');
  console.log('TWILIO_ACCOUNT_SID:', process.env.TWILIO_ACCOUNT_SID ? 'PRESENT' : 'MISSING');
  console.log('TWILIO_AUTH_TOKEN:', process.env.TWILIO_AUTH_TOKEN ? 'PRESENT' : 'MISSING');
  console.log('TWILIO_WHATSAPP_NUMBER:', process.env.TWILIO_WHATSAPP_NUMBER || 'MISSING');
  console.log('XAI_API_KEY:', process.env.XAI_API_KEY ? 'PRESENT' : 'MISSING');
  console.log('XAI_MODEL:', process.env.XAI_MODEL || 'MISSING');

  const req = {
    body: {
      From: 'whatsapp:+919691832020',
      To: 'whatsapp:+14155238886',
      Body: 'menu dikhao'
    }
  };

  const res = {
    type: function(type) {
      this._type = type;
      return this;
    },
    send: function(content) {
      this._content = content;
      console.log(`[TEST] Immediate Webhook Response Sent: type="${this._type}" body="${content}"`);
      return this;
    },
    status: function(code) {
      this._status = code;
      return this;
    },
    json: function(obj) {
      this._json = obj;
      console.log('[TEST] Webhook JSON Response Sent:', JSON.stringify(obj));
      return this;
    }
  };

  console.log('\n[TEST] Invoking handleIncomingMessage webhook controller with message "menu dikhao"...');
  try {
    await handleIncomingMessage(req, res);
  } catch (err) {
    console.error('[TEST Error] Exception in handler execution:', err);
  }

  // Wait a few seconds to let async processing finish
  console.log('\n[TEST] Waiting 4 seconds for asynchronous API calls to resolve...');
  await new Promise(resolve => setTimeout(resolve, 4000));

  console.log('[TEST] Closing MongoDB connection...');
  await mongoose.connection.close();
  console.log('[TEST] Finished.');
}

runTest();
