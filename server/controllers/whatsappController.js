const MenuItem = require('../models/MenuItem');
const Coupon = require('../models/Coupon');
const Order = require('../models/Order');
const Booking = require('../models/Booking');
const WhatsAppMessage = require('../models/WhatsAppMessage');
const { getGrokReply } = require('../services/grokRestaurantAssistant');
const { sendWhatsAppMessage } = require('../services/twilioWhatsAppService');

// Static menu fallback if MongoDB MenuItem collection is empty
const fallbackMenu = [
  { name: 'Paneer Butter Masala', category: 'North Indian', price: 249, description: 'Creamy tomato gravy with soft paneer cubes', isVeg: true, rating: 4.9, popular: true },
  { name: 'Paneer Tikka', category: 'Starters', price: 229, description: 'Smoky paneer cubes marinated with royal Indian spices', isVeg: true, rating: 4.9, popular: true },
  { name: 'Veg Supreme Pizza', category: 'Pizza', price: 299, description: 'Luxury pizza topped with sweet corn, capsicum, olives, red onions, and mozzarella', isVeg: true, rating: 4.9, popular: true },
  { name: 'Hara Bhara Kebab', category: 'Starters', price: 199, description: 'Crispy spinach and green pea kebabs', isVeg: true, rating: 4.6 },
  { name: 'Veg Spring Roll', category: 'Starters', price: 179, description: 'Crunchy rolls stuffed with vegetables', isVeg: true, rating: 4.4 },
  { name: 'Chole Bhature', category: 'North Indian', price: 169, description: 'Traditional Punjabi style chole bhature', isVeg: true, rating: 4.8, popular: true },
  { name: 'Dal Makhani', category: 'North Indian', price: 199, description: 'Slow cooked black lentils with butter and cream', isVeg: true, rating: 4.8, popular: true },
  { name: 'Masala Chai', category: 'Drinks', price: 49, description: 'Authentic Indian tea with aromatic spices', isVeg: true, rating: 4.7 },
  { name: 'Gulab Jamun', category: 'Desserts', price: 99, description: 'Soft milk-solid balls soaked in sugar syrup', isVeg: true, rating: 4.8 }
];

// Fallback rule-based replies if Grok xAI API fails
const getRuleBasedFallbackReply = (body, context) => {
  const query = body.toLowerCase();
  const isHindi = /dikhao|batao|karni|hai|mera|kya|bhedo|dekhna/i.test(query);

  if (query.includes('menu')) {
    if (isHindi) {
      return `*Royal Bites Menu:*\n` +
             `• Paneer Butter Masala — ₹249\n` +
             `• Paneer Tikka — ₹229\n` +
             `• Veg Supreme Pizza — ₹299\n` +
             `• Chole Bhature — ₹169\n` +
             `• Dal Makhani — ₹199\n` +
             `• Veg Spring Roll — ₹179\n\n` +
             `Pura menu dekhne ke liye hamari website par jayein: https://royal-bites-restro.onrender.com/menu`;
    } else {
      return `*Royal Bites Menu:*\n` +
             `• Paneer Butter Masala — ₹249\n` +
             `• Paneer Tikka — ₹229\n` +
             `• Veg Supreme Pizza — ₹299\n` +
             `• Chole Bhature — ₹169\n` +
             `• Dal Makhani — ₹199\n` +
             `• Veg Spring Roll — ₹179\n\n` +
             `Explore full menu on our website: https://royal-bites-restro.onrender.com/menu`;
    }
  }

  if (query.includes('paneer') && query.includes('price')) {
    return `*Paneer Butter Masala* ka price ₹249 hai aur *Paneer Tikka* ka price ₹229 hai.`;
  }

  if (query.includes('veg')) {
    return `*Veg Dishes:*\n` +
           `• Paneer Butter Masala (₹249)\n` +
           `• Paneer Tikka (₹229)\n` +
           `• Veg Supreme Pizza (₹299)\n` +
           `• Dal Makhani (₹199)\n` +
           `• Chole Bhature (₹169)\n\n` +
           `Hamare menu me saare options vegetarian hain (except select Biryanis).`;
  }

  if (query.includes('offer') || query.includes('coupon') || query.includes('discount')) {
    return `*Royal Bites Offers:*\n` +
           `• Use code *ROYAL10* to get 10% flat discount on orders above ₹500.\n` +
           `• Use code *FREEBAR* to get a free soft drink on orders above ₹1000!`;
  }

  if (query.includes('book') || query.includes('table')) {
    if (isHindi) {
      return `Table book karne ke liye, hamari booking website par jayein:\nhttps://royal-bites-restro.onrender.com/booking\nYahan aap date, time aur number of guests daal kar instant booking kar sakte hain.`;
    } else {
      return `To book a table, please visit our booking page:\nhttps://royal-bites-restro.onrender.com/booking\nYou can select your preferred date, time, and number of guests.`;
    }
  }

  if (query.includes('order') || query.includes('status')) {
    if (context.orders && context.orders.length > 0) {
      const lastOrder = context.orders[0];
      if (isHindi) {
        return `Aapka aakhri order status:\n*Order ID:* ${lastOrder.id}\n*Status:* ${lastOrder.status}\n*Total:* ₹${lastOrder.total}\n\nAap isey yahan track kar sakte hain: https://royal-bites-restro.onrender.com/track-order/${lastOrder.id}`;
      } else {
        return `Your latest order status:\n*Order ID:* ${lastOrder.id}\n*Status:* ${lastOrder.status}\n*Total:* ₹${lastOrder.total}\n\nTrack here: https://royal-bites-restro.onrender.com/track-order/${lastOrder.id}`;
      }
    } else {
      if (isHindi) {
        return `Humein is number se koi active order nahi mila. Kripya aapna 6-digit Order ID share karein.`;
      } else {
        return `We couldn't find any recent orders associated with your number. Please share your Order ID.`;
      }
    }
  }

  if (query.includes('address') || query.includes('location') || query.includes('kahan')) {
    return `*Royal Bites Address:*\nVIP Road, Bhopal, Madhya Pradesh\n\nGoogle Maps Location: https://maps.google.com/?q=VIP+Road+Bhopal`;
  }

  if (query.includes('timing') || query.includes('hour') || query.includes('open') || query.includes('kab')) {
    return `*Royal Bites Timings:*\n` +
           `• Mon – Thu: 12:00 PM – 11:00 PM\n` +
           `• Fri – Sun: 12:00 PM – 12:00 AM\n` +
           `Kitchen closes 30 minutes before closing time.`;
  }

  // Default reply
  if (isHindi) {
    return `Namaste! 🙏 Royal Bites AI Assistant me aapka swagat hai. Main aapki kya sahayata kar sakta hoon?\n\nAap mujhse pooch sakte hain:\n` +
           `• *Menu dikhao* (Menu dekhne ke liye)\n` +
           `• *Offers kya hai* (Offers ke liye)\n` +
           `• *Table booking karni hai* (Booking ke liye)\n` +
           `• *Mera order status kya hai* (Order status ke liye)\n` +
           `• *Address kya hai* (Location ke liye)`;
  } else {
    return `Welcome to Royal Bites AI Assistant! 🙏 How can I assist you today?\n\nYou can ask me about:\n` +
           `• *Menu* (To view our menu)\n` +
           `• *Offers* (To view current coupons)\n` +
           `• *Book table* (To book a table)\n` +
           `• *Order status* (To track your latest order)\n` +
           `• *Address & Timings*`;
  }
};

const handleIncomingMessage = async (req, res) => {
  const { From, To, Body } = req.body;

  if (!From || !Body) {
    console.error('[DEBUG Error] Webhook received missing parameters. Body:', req.body);
    return res.status(400).json({ success: false, error: 'Missing From or Body parameters' });
  }

  console.log('[DEBUG] --- Incoming WhatsApp Webhook Request ---');
  console.log(`[DEBUG] Sender Number (From): ${From}`);
  console.log(`[DEBUG] Recipient Number (To): ${To}`);
  console.log(`[DEBUG] Message Body: "${Body}"`);

  // Send an immediate 200 OK Response to Twilio to prevent timeout
  res.type('text/xml').send('<Response></Response>');

  // 1. Log incoming message in DB (Non-blocking so it doesn't block the reply if DB is disconnected/slow)
  try {
    WhatsAppMessage.create({
      from: From,
      to: To || 'whatsapp:+919691832020',
      body: Body,
      direction: 'inbound'
    }).catch(err => console.error('[DEBUG Error] Async DB logging failed for incoming message:', err.message));
  } catch (dbErr) {
    console.error('[DEBUG Error] Failed to log incoming message to DB:', dbErr.message);
  }

  try {
    // 2. Extract last 10 digits of phone number to query MongoDB context
    const phoneDigits = From.replace(/\D/g, '');
    const last10Digits = phoneDigits.slice(-10);

    // 3. Query context details (with safe catch blocks and maxTimeMS to prevent hang)
    let menuItems = fallbackMenu;
    try {
      const dbMenuItems = await MenuItem.find({ available: true }).maxTimeMS(2000);
      if (dbMenuItems && dbMenuItems.length > 0) {
        menuItems = dbMenuItems;
      }
    } catch (dbErr) {
      console.warn('[DEBUG Warning] Failed to query MenuItem collection. Using local fallback menu. Error:', dbErr.message);
    }

    let coupons = [];
    try {
      coupons = await Coupon.find({ active: true }).maxTimeMS(2000);
    } catch (dbErr) {
      console.warn('[DEBUG Warning] Failed to query Coupon collection. Error:', dbErr.message);
    }

    let orders = [];
    try {
      orders = await Order.find({
        customerPhone: { $regex: last10Digits }
      }).sort({ createdAt: -1 }).limit(5).maxTimeMS(2000);
    } catch (dbErr) {
      console.warn('[DEBUG Warning] Failed to query Order collection. Error:', dbErr.message);
    }

    let bookings = [];
    try {
      bookings = await Booking.find({
        phone: { $regex: last10Digits }
      }).sort({ createdAt: -1 }).limit(5).maxTimeMS(2000);
    } catch (dbErr) {
      console.warn('[DEBUG Warning] Failed to query Booking collection. Error:', dbErr.message);
    }

    const context = {
      menu: menuItems,
      coupons: coupons,
      orders: orders,
      bookings: bookings,
      customerPhone: From
    };

    let reply = '';

    // 4. Request response from Grok xAI API
    try {
      console.log('[DEBUG] Querying Grok xAI API...');
      reply = await getGrokReply(Body, context);
      console.log(`[DEBUG] Generated AI Response: "${reply}"`);
    } catch (grokError) {
      console.error('[DEBUG Error] Grok xAI API call failed:', grokError.message || grokError);
      // Fallback as requested by user
      reply = "Hello from Royal Bites. How can I help you?";
      console.log(`[DEBUG] Using Fallback Reply: "${reply}"`);
    }

    // 5. Send the reply via Twilio WhatsApp API
    try {
      console.log(`[DEBUG] Twilio Send: Attempting message send to ${From}...`);
      const twilioResponse = await sendWhatsAppMessage(From, reply);
      console.log('[DEBUG] Twilio Send Response (Success):', JSON.stringify(twilioResponse));
    } catch (twilioError) {
      console.error('[DEBUG Error] Twilio SDK messages.create call failed. Full Twilio Error:', twilioError);
    }

    // 6. Log outgoing message in DB (Non-blocking)
    try {
      WhatsAppMessage.create({
        from: To || 'whatsapp:+919691832020',
        to: From,
        body: reply,
        direction: 'outbound'
      }).catch(err => console.error('[DEBUG Error] Async DB logging failed for outgoing message:', err.message));
    } catch (dbErr) {
      console.error('[DEBUG Error] Failed to log outgoing message to DB:', dbErr.message);
    }

  } catch (err) {
    console.error('[DEBUG Error] Exception caught in webhook processing:', err.message || err);
  }
};

module.exports = {
  handleIncomingMessage
};
