const apiKey = process.env.XAI_API_KEY;
const modelName = process.env.XAI_MODEL || 'grok-2-mini';

/**
 * Gets a response from the Grok xAI API
 * @param {string} userMessage - User's incoming message
 * @param {object} context - Restaurant and user data context
 */
const getGrokReply = async (userMessage, context) => {
  if (!apiKey) {
    throw new Error('XAI_API_KEY is not defined in environment variables');
  }

  const systemMessage = `
You are the AI Restaurant Assistant for "Royal Bites", a premium luxury restaurant.
Your tone should be warm, polite, and elegant.
Always respond in the same language as the customer's message (e.g. if they ask in Hindi/Hinglish, reply in Hindi/Hinglish).

Here is the current restaurant information:
- Name: Royal Bites
- Tagline: Where Every Bite Reigns Supreme
- Address: VIP Road, Bhopal, Madhya Pradesh
- Hours: Mon – Thu: 12:00 PM – 11:00 PM | Fri – Sun: 12:00 PM – 12:00 AM
- Phone/WhatsApp: +91 9691832020

Here is the active restaurant menu:
${JSON.stringify(context.menu, null, 2)}

Here are the active coupon offers:
${JSON.stringify(context.coupons, null, 2)}

Here are the details of the customer we are communicating with:
- Phone Number: ${context.customerPhone}
- Recent Bookings: ${JSON.stringify(context.bookings, null, 2)}
- Recent Orders: ${JSON.stringify(context.orders, null, 2)}

Guidelines:
1. If the customer asks for the menu, present the categories and dishes with their prices in ₹. Keep it structured, elegant, and easy to read on WhatsApp.
2. If they ask for veg or non-veg dishes, filter the menu for them.
3. If they ask about orders or bookings, reference their recent orders/bookings listed above.
4. If they want to make a booking, explain that they can book a table on the Royal Bites website (https://royal-bites-restro.onrender.com/booking) or ask them to provide Name, Email, Date, Time, and Number of Guests.
5. If they want to check their order, explain that they can track it at: https://royal-bites-restro.onrender.com/track-order/<orderId> using their order ID.
6. Keep answers concise, clear, and perfectly formatted for WhatsApp (use bold text like *this*, line breaks, bullet points).
`;

  try {
    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: modelName,
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: userMessage }
        ],
        temperature: 0.7
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || `xAI API returned status ${response.status}`);
    }

    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error fetching reply from Grok xAI API:', error.message);
    throw error;
  }
};

/**
 * Uses Grok xAI API to format a structured reply naturally
 * @param {string} userMessage - User's original query
 * @param {string} structuredReply - The rule-based structured response
 */
const formatGrokReply = async (userMessage, structuredReply) => {
  if (!apiKey) {
    throw new Error('XAI_API_KEY is not defined in environment variables');
  }

  const systemMessage = `
You are the AI Restaurant Assistant for "Royal Bites".
Your task is to take the structured database response below and format it into a natural, warm, polite, and elegant message in the same language as the customer's message (Hindi, Hinglish, or English).
Make sure to:
1. Retain all exact prices, names, phone numbers, and URLs.
2. Keep the formatting clean and easy to read on WhatsApp (use bullet points and bold text *like this*).
3. Do not add any new facts or dishes not present in the structured response.

Structured Response:
${structuredReply}
`;

  try {
    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: modelName,
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: userMessage }
        ],
        temperature: 0.3
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || `xAI API returned status ${response.status}`);
    }

    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error formatting reply with Grok xAI API:', error.message);
    throw error;
  }
};

module.exports = {
  getGrokReply,
  formatGrokReply
};
