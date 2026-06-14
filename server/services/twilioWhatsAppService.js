const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioNumber = process.env.TWILIO_WHATSAPP_NUMBER;

/**
 * Sends a WhatsApp message using Twilio API
 * @param {string} to - Recipient phone number (e.g. 'whatsapp:+919876543210')
 * @param {string} body - The message content
 */
const sendWhatsAppMessage = async (to, body) => {
  if (!accountSid || !authToken || !twilioNumber) {
    throw new Error('Twilio environment variables are missing (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_NUMBER)');
  }

  // Ensure 'whatsapp:' prefix
  const formattedTo = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;
  const formattedFrom = twilioNumber.startsWith('whatsapp:') ? twilioNumber : `whatsapp:${twilioNumber}`;

  const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
  const authHeader = 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64');

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        From: formattedFrom,
        To: formattedTo,
        Body: body
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `Twilio REST API error status ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('Failed to send WhatsApp message via Twilio:', error.message);
    throw error;
  }
};

module.exports = {
  sendWhatsAppMessage
};
