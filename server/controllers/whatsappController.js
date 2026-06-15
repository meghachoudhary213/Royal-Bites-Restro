const MenuItem = require('../models/MenuItem');
const Coupon = require('../models/Coupon');
const Order = require('../models/Order');
const Booking = require('../models/Booking');
const WhatsAppMessage = require('../models/WhatsAppMessage');
const { getGrokReply, formatGrokReply } = require('../services/grokRestaurantAssistant');
const { sendWhatsAppMessage } = require('../services/twilioWhatsAppService');

// In-memory session store for WhatsApp orders
const whatsappSessions = new Map();

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

// Helper to find menu item using robust matching for Hinglish inputs
const findMenuItem = (query, menu) => {
  const queryLower = query.toLowerCase();
  
  // 1. Direct matching
  let matched = menu.find(item => queryLower.includes(item.name.toLowerCase()));
  if (matched) return matched;
  
  // 2. Fuzzy/word matching for Hinglish inputs
  matched = menu.find(item => {
    const nameLower = item.name.toLowerCase();
    
    // Check key dishes specifically
    if (nameLower.includes('margherita') && (queryLower.includes('margrita') || queryLower.includes('margerita') || queryLower.includes('margarita'))) {
      return true;
    }
    if (nameLower.includes('paneer tikka') && (queryLower.includes('paneer') || queryLower.includes('panir')) && (queryLower.includes('tikka') || queryLower.includes('tika'))) {
      return true;
    }
    if (nameLower.includes('veg supreme') && queryLower.includes('supreme') && queryLower.includes('pizza')) {
      return true;
    }
    if (nameLower.includes('chole bhature') && (queryLower.includes('chole') || queryLower.includes('bhature'))) {
      return true;
    }
    if (nameLower.includes('dal makhani') && (queryLower.includes('dal') || queryLower.includes('makhani'))) {
      return true;
    }
    
    const nameParts = nameLower.split(/\s+/).filter(p => p.length > 2);
    // Check if query contains any unique word of the item
    const uniqueWordMatch = nameParts.some(part => {
      const isCommon = ['veg', 'dry', 'special', 'royal', 'butter', 'masala', 'pizza', 'burger', 'roll', 'soda', 'sweet', 'fresh', 'lime'].includes(part);
      if (isCommon) return false;
      return queryLower.includes(part);
    });
    
    if (uniqueWordMatch) return true;
    return false;
  });

  return matched;
};

// Fallback rule-based replies
const getRuleBasedFallbackReply = (body, context, fromNumber) => {
  const query = body.toLowerCase().trim();
  const isHindi = /dikhao|batao|karni|hai|mera|kya|bhedo|dekhna/i.test(query);

  // 1. Session flow processing if an order session is in progress
  const session = whatsappSessions.get(fromNumber);
  if (session) {
    if (query.includes('cancel') || query.includes('abort') || query.includes('stop') || query.includes('hatao')) {
      whatsappSessions.delete(fromNumber);
      return `Order cancel kar diya hai. Aap fir se new order start kar sakte hain.`;
    }

    if (session.step === 'waiting_for_quantity') {
      const qty = parseInt(body.replace(/\D/g, ''), 10);
      if (isNaN(qty) || qty <= 0) {
        return `Kripya ek valid quantity (number) bataiye. Jaise: 1, 2, 3.`;
      }
      session.quantity = qty;
      session.step = 'waiting_for_address';
      return `${session.dishName} ki quantity ${qty} set ho gayi hai. Delivery address kya hai? Kripya apna pura address likh kar bhejein.`;
    }

    if (session.step === 'waiting_for_address') {
      session.address = body;
      const rawOrderId = Math.floor(100000 + Math.random() * 900000).toString();
      const orderId = `RB-${rawOrderId}`;
      const subtotal = session.price * session.quantity;
      const gst = Math.round(subtotal * 0.05 * 100) / 100;
      const deliveryCharge = subtotal >= 500 ? 0 : 40;
      const total = subtotal + gst + deliveryCharge;
      const currentDate = new Date().toISOString().split('T')[0];

      const newOrder = {
        id: orderId,
        date: currentDate,
        customerName: 'WhatsApp Guest',
        customerPhone: fromNumber,
        customerEmail: 'whatsapp@royalbites.in',
        items: [{
          name: session.dishName,
          price: session.price,
          quantity: session.quantity
        }],
        subtotal,
        discount: 0,
        coupon: 'None',
        hasGift: false,
        gst,
        deliveryCharge,
        total,
        orderType: 'Delivery',
        paymentMethod: 'COD',
        specialInstructions: 'Ordered via WhatsApp AI Assistant',
        estimatedTime: '30-40 mins',
        status: 'Order Received',
        paymentStatus: 'Pending'
      };

      // We return the response text directly, saving happens in the main handler
      session.finalOrder = newOrder;
      whatsappSessions.delete(fromNumber);
      return `✅ *Order Confirmed!*\n` +
             `Order ID: ${rawOrderId}\n` +
             `Item: ${session.dishName}\n` +
             `Qty: ${session.quantity}\n` +
             `Total: ₹${total.toFixed(2)}\n` +
             `Payment: Cash/UPI on delivery\n` +
             `Estimated time: 30-40 mins`;
    }
  }

  // 2. Specific intent checking for new request
  const isTrackingQuery = /track|status|kaha|kahan|id|check/i.test(query);
  const hasOrderKeyword = query.includes('order');
  const wantsTracking = isTrackingQuery || (hasOrderKeyword && (query.includes('status') || query.includes('track') || query.includes('kaha') || query.includes('kahan') || query.includes('check')));

  if (wantsTracking) {
    if (context.orders && context.orders.length > 0) {
      const lastOrder = context.orders[0];
      return `Aapka aakhri order status:\n*Order ID:* ${lastOrder.id}\n*Status:* ${lastOrder.status}\n*Total:* ₹${lastOrder.total}\n\nAap isey yahan track kar sakte hain: https://royal-bites-restro.onrender.com/track-order/${lastOrder.id}`;
    } else {
      return `Humein aapke number se koi recent order nahi mila. Kripya apna 6-digit Order ID share karein.`;
    }
  }

  // 3. New Order Flow start request
  const isOrderingQuery = /order|chahiye|chahye|buy|mangwana|mangao|bhejo|lele/i.test(query);
  const matchedItem = findMenuItem(query, context.menu);

  if (matchedItem && isOrderingQuery) {
    const newSession = {
      step: 'waiting_for_quantity',
      dishName: matchedItem.name,
      price: matchedItem.price
    };
    whatsappSessions.set(fromNumber, newSession);
    return `${matchedItem.name} ki kitni quantity chahiye?`;
  }

  // 4. Dish details query
  if (matchedItem) {
    return `*${matchedItem.name}* ka price ₹${matchedItem.price} hai.\nDescription: ${matchedItem.description || 'No description available'}.\n\nAap "order ${matchedItem.name.toLowerCase()}" bol kar order bhi kar sakte hain!`;
  }

  // 5. Menu query
  if (query.includes('menu') || query.includes('list') || query.includes('dishes') || query.includes('khana')) {
    const isVegQuery = query.includes('veg') && !query.includes('non');
    const isNonVegQuery = query.includes('non');

    let itemsToDisplay = context.menu;
    if (isVegQuery) {
      itemsToDisplay = context.menu.filter(i => i.isVeg !== false);
    } else if (isNonVegQuery) {
      itemsToDisplay = context.menu.filter(i => i.isVeg === false);
    }

    if (itemsToDisplay.length === 0) {
      return `Sorry, humare menu me abhi koi non-veg item nahi hai.`;
    }

    const menuByCategory = {};
    itemsToDisplay.forEach(item => {
      const cat = item.category || 'Other';
      if (!menuByCategory[cat]) menuByCategory[cat] = [];
      menuByCategory[cat].push(item);
    });

    let reply = `🍽️ *Royal Bites ${isVegQuery ? 'Veg ' : isNonVegQuery ? 'Non-Veg ' : ''}Menu*\n\n`;
    for (const [cat, items] of Object.entries(menuByCategory)) {
      reply += `*${cat}:*\n`;
      items.forEach(i => {
        reply += `• ${i.name} - ₹${i.price}\n`;
      });
      reply += `\n`;
    }
    reply += `Type dish name for price/details.`;
    return reply;
  }

  // 6. Veg filter
  if (query.includes('veg') && !query.includes('non')) {
    const vegItems = context.menu.filter(i => i.isVeg !== false);
    let reply = `Here are popular veg dishes:\n`;
    vegItems.slice(0, 5).forEach(i => {
      reply += `• ${i.name} - ₹${i.price}\n`;
    });
    return reply;
  }

  // 7. Offers & Coupons
  if (query.includes('offer') || query.includes('coupon') || query.includes('discount') || query.includes('code')) {
    let reply = `🎁 *Royal Bites Offers & Coupons* 🎁\n\n`;
    if (context.coupons && context.coupons.length > 0) {
      context.coupons.forEach(c => {
        reply += `• *${c.code}* - ${c.description || `${c.discountValue}% off`}\n`;
      });
    } else {
      reply += `• *ROYAL20* - 20% off on first table booking.\n• *FREEGIFT* - Free dessert on orders above ₹999.\n`;
    }
    return reply;
  }

  // 8. Address
  if (query.includes('address') || query.includes('location') || query.includes('kahan') || query.includes('bhopal') || query.includes('map')) {
    return `📍 *Royal Bites Address:*\nVIP Road, Bhopal, Madhya Pradesh\n\nGoogle Maps Location: https://maps.google.com/?q=VIP+Road+Bhopal`;
  }

  // 9. Timings
  if (query.includes('timing') || query.includes('hour') || query.includes('open') || query.includes('close') || query.includes('kab') || query.includes('samay')) {
    return `*Royal Bites Timings:*\n` +
           `• Mon – Thu: 12:00 PM – 11:00 PM\n` +
           `• Fri – Sun: 12:00 PM – 12:00 AM\n\n` +
           `Kitchen closes 30 minutes before closing time.`;
  }

  // 10. Suggestions if user wants to order but dish not found in menu
  if (isOrderingQuery) {
    const cleanQuery = query.replace(/order|chahiye|chahye|buy|mangwana|mangao|bhejo|lele/g, '').trim();
    const queryWords = cleanQuery.split(/\s+/).filter(w => w.length > 2);
    const suggestions = context.menu.filter(item => {
      const nameLower = item.name.toLowerCase();
      return queryWords.some(word => nameLower.includes(word));
    });

    if (suggestions.length > 0) {
      let suggestText = `Sorry, humein wo dish nahi mili. Kya aap inme se kuch try karna chahenge?\n\n`;
      suggestions.forEach(s => {
        suggestText += `• *${s.name}* - ₹${s.price}\n`;
      });
      suggestText += `\nOrder karne ke liye likhein: *order [dish name]*`;
      return suggestText;
    } else {
      const popularDishes = context.menu.filter(i => i.popular).slice(0, 3);
      let suggestText = `Sorry, humein wo dish nahi mili. Hamari popular dishes hain:\n\n`;
      popularDishes.forEach(s => {
        suggestText += `• *${s.name}* - ₹${s.price}\n`;
      });
      suggestText += `\nExplore full menu: https://royal-bites-restro.onrender.com/menu`;
      return suggestText;
    }
  }

  return null; // No rule matched
};

// Default welcome fallback if Grok fails and no rule matched
const getDefaultFallbackReply = (body) => {
  const query = body.toLowerCase().trim();
  const isHindi = /namaste|helo|hi|kya|batao/i.test(query);
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

  // 1. Log incoming message in DB (Non-blocking)
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

    // 4. Determine intent and rule-based reply
    let ruleBasedReply = getRuleBasedFallbackReply(Body, context, From);
    let detectedIntent = 'General inquiry / No rule matched';
    
    // Check if session exists to trace intent
    const session = whatsappSessions.get(From);

    if (session) {
      if (session.step === 'waiting_for_quantity') {
        detectedIntent = 'Order Flow - Waiting for Quantity';
      } else if (session.step === 'waiting_for_address') {
        detectedIntent = 'Order Flow - Waiting for Address';
      }
    }

    if (ruleBasedReply && !session) {
      const qLower = Body.toLowerCase();
      if (qLower.includes('menu')) detectedIntent = 'Menu List';
      else if (qLower.includes('price') || qLower.includes('rate')) detectedIntent = 'Price Check';
      else if (qLower.includes('veg') && !qLower.includes('non')) detectedIntent = 'Veg Filter';
      else if (qLower.includes('non')) detectedIntent = 'Non-Veg Filter';
      else if (qLower.includes('offer') || qLower.includes('coupon')) detectedIntent = 'Offers & Coupons';
      else if (qLower.includes('address') || qLower.includes('location')) detectedIntent = 'Address / Location';
      else if (qLower.includes('timing')) detectedIntent = 'Timing / Hours';
      else if (qLower.includes('book') || qLower.includes('table')) detectedIntent = 'Table Booking';
      else if (qLower.includes('order') || qLower.includes('status')) detectedIntent = 'Order Status';
    }

    // Save order in MongoDB if finalOrder is attached to session (Order Flow Completed)
    if (session && session.finalOrder) {
      try {
        await Order.create(session.finalOrder);
        console.log(`[DEBUG] WhatsApp order saved in MongoDB: ${session.finalOrder.id}`);
        whatsappSessions.delete(From);
        detectedIntent = 'Order Flow - Confirmed & Saved';
      } catch (dbErr) {
        console.error('[DEBUG Error] Failed to save WhatsApp order in MongoDB:', dbErr.message);
      }
    }

    let reply = '';
    let grokResponse = 'N/A';
    let fallbackReason = 'None';

    if (ruleBasedReply) {
      // Rule-based matched. Try to use Grok only for natural language formatting.
      try {
        console.log(`[DEBUG] Rule-based reply found. Requesting Grok natural language formatting...`);
        grokResponse = await formatGrokReply(Body, ruleBasedReply);
        reply = grokResponse;
      } catch (grokError) {
        fallbackReason = `Grok formatting failed: ${grokError.message || grokError}. Reverting to raw structured response.`;
        console.warn(`[DEBUG Warning] ${fallbackReason}`);
        reply = ruleBasedReply;
      }
    } else {
      // General question. Ask Grok normally.
      try {
        console.log(`[DEBUG] Querying Grok xAI API normally for: "${Body}"...`);
        grokResponse = await getGrokReply(Body, context);
        reply = grokResponse;
      } catch (grokError) {
        fallbackReason = `Grok normal chat failed: ${grokError.message || grokError}. Using default welcome menu.`;
        console.warn(`[DEBUG Warning] ${fallbackReason}`);
        reply = getDefaultFallbackReply(Body);
      }
    }

    // Print all detailed logs as requested by the user
    console.log('------------------------------------------');
    console.log(`[DEBUG LOG] Incoming message body: "${Body}"`);
    console.log(`[DEBUG LOG] Detected intent: "${detectedIntent}"`);
    console.log(`[DEBUG LOG] Selected menu data count: ${context.menu.length}`);
    console.log(`[DEBUG LOG] Grok API response: "${grokResponse}"`);
    console.log(`[DEBUG LOG] Fallback reason: "${fallbackReason}"`);
    console.log(`[DEBUG LOG] Final reply sent: "${reply}"`);
    console.log('------------------------------------------');

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
  handleIncomingMessage,
  getRuleBasedFallbackReply
};
