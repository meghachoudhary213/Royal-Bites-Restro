const twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioNumber = process.env.TWILIO_WHATSAPP_NUMBER;

let client = null;
if (accountSid && authToken) {
  client = twilio(accountSid, authToken);
}

/**
 * Sends a WhatsApp message using official Twilio SDK
 * @param {string} to - Recipient phone number (e.g. 'whatsapp:+919876543210')
 * @param {string} body - The message content
 */
const sendWhatsAppMessage = async (to, body) => {
  if (!accountSid || !authToken || !twilioNumber) {
    const errorMsg = 'Twilio environment variables are missing. Required: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_NUMBER';
    console.error(errorMsg);
    throw new Error(errorMsg);
  }

  if (!client) {
    client = twilio(accountSid, authToken);
  }

  // Ensure 'whatsapp:' prefix is present
  const formattedTo = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;
  const formattedFrom = twilioNumber.startsWith('whatsapp:') ? twilioNumber : `whatsapp:${twilioNumber}`;

  try {
    console.log(`[Twilio SDK] Attempting message creation. From: ${formattedFrom}, To: ${formattedTo}`);
    
    const messageResponse = await client.messages.create({
      body: body,
      from: formattedFrom,
      to: formattedTo
    });
    
    console.log(`[Twilio SDK] Message sent successfully. Message SID: ${messageResponse.sid}`);
    return messageResponse;
  } catch (error) {
    console.error('[Twilio SDK Error] Detailed Twilio error stack trace:', error);
    throw error;
  }
};

module.exports = {
  sendWhatsAppMessage
};
