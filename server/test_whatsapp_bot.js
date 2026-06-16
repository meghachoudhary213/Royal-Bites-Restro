const mongoose = require('mongoose');
const connectDB = require('./config/db');
const { handleIncomingMessage } = require('./controllers/whatsappController');

// Helper to extract reply from TwiML XML Response
const extractReply = (twiml) => {
  const match = twiml.match(/<!\[CDATA\[([\s\S]*?)\]\]>/);
  return match ? match[1] : twiml;
};

// Mock request-response helper
const sendTestMessage = async (fromPhone, messageText) => {
  return new Promise((resolve) => {
    const req = {
      body: {
        From: fromPhone,
        To: 'whatsapp:+14155238886',
        Body: messageText
      }
    };
    const res = {
      type: function(t) {
        return this;
      },
      status: function(s) {
        return this;
      },
      send: function(content) {
        resolve(extractReply(content));
      }
    };
    handleIncomingMessage(req, res);
  });
};

const runTests = async () => {
  console.log('Connecting to database...');
  await connectDB();

  const testCases = [
    { name: 'hi', input: 'hi', phone: 'whatsapp:+919876543210' },
    { name: 'address query', input: 'restaurant ka address kya hai', phone: 'whatsapp:+919876543210' },
    { name: 'timing query', input: 'timing kya hai', phone: 'whatsapp:+919876543210' },
    { name: 'payment query', input: 'upi chalega kya', phone: 'whatsapp:+919876543210' },
    { name: 'delivery query', input: 'delivery hai kya', phone: 'whatsapp:+919876543210' },
    { name: 'menu query', input: 'menu', phone: 'whatsapp:+919876543210' },
    { name: 'item details (masala chai price)', input: 'masala chai price', phone: 'whatsapp:+919876543210' },
    { name: 'new order start (pizza)', input: 'mujhe pizza order karna hai', phone: 'whatsapp:+919876543211' },
    { name: 'order session quantity (2)', input: '2', phone: 'whatsapp:+919876543211' },
    { name: 'order session address', input: '12 VIP Road, Bhopal', phone: 'whatsapp:+919876543211' },
    { name: 'track order', input: 'track order', phone: 'whatsapp:+919876543210' }
  ];

  console.log('\n--- STARTING WHATSAPP BOT TESTS ---');
  for (const tc of testCases) {
    console.log(`\nTest Case: [${tc.name}]`);
    console.log(`Input: "${tc.input}" (From: ${tc.phone})`);
    
    const reply = await sendTestMessage(tc.phone, tc.input);
    
    console.log(`Reply:\n==================================\n${reply}\n==================================`);
  }
  console.log('\n--- TESTS COMPLETED ---');

  console.log('Disconnecting from database...');
  await mongoose.connection.close();
};

runTests().catch(err => {
  console.error('Test run failed:', err);
  mongoose.connection.close();
});
