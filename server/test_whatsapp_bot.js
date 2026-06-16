const mongoose = require('mongoose');
const connectDB = require('./config/db');
const { handleIncomingMessage } = require('./controllers/whatsappController');

// Helper to extract reply from TwiML XML Response
const extractReply = (twiml) => {
  if (twiml === '<Response></Response>') return '(Empty Response / Ignored)';
  const match = twiml.match(/<!\[CDATA\[([\s\S]*?)\]\]>/);
  return match ? match[1] : twiml;
};

// Mock request-response helper
const sendTestMessage = async (fromPhone, messageText, messageSid) => {
  return new Promise((resolve) => {
    const req = {
      body: {
        From: fromPhone,
        To: 'whatsapp:+14155238886',
        Body: messageText,
        MessageSid: messageSid || `SM${Math.floor(100000 + Math.random() * 900000)}`
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

  // Deduplication Verification
  console.log('\nTest Case: [deduplication test - message 1]');
  const testSid = 'SM999999';
  console.log(`Input: "hi" (From: whatsapp:+919876543210, MessageSid: ${testSid})`);
  const reply1 = await sendTestMessage('whatsapp:+919876543210', 'hi', testSid);
  console.log(`Reply:\n==================================\n${reply1}\n==================================`);

  console.log('\nTest Case: [deduplication test - message 2 (same MessageSid)]');
  console.log(`Input: "hi" (From: whatsapp:+919876543210, MessageSid: ${testSid})`);
  const reply2 = await sendTestMessage('whatsapp:+919876543210', 'hi', testSid);
  console.log(`Reply:\n==================================\n${reply2}\n==================================`);

  console.log('\n--- TESTS COMPLETED ---');

  console.log('Disconnecting from database...');
  await mongoose.connection.close();
};

runTests().catch(err => {
  console.error('Test run failed:', err);
  mongoose.connection.close();
});
