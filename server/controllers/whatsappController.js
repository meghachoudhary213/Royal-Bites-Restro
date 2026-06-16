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

// Helper to normalize Hinglish spelling variations
const normalizeWord = (word) => {
  return word
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]/g, '') // remove special chars
    .replace(/ph/g, 'f')
    .replace(/sh/g, 's')
    .replace(/ch/g, 'c')
    .replace(/ee/g, 'i')
    .replace(/oo/g, 'u')
    .replace(/y/g, 'i')
    .replace(/aa/g, 'a')
    .replace(/bh/g, 'b')
    .replace(/dh/g, 'd')
    .replace(/kh/g, 'k')
    .replace(/th/g, 't')
    .replace(/jh/g, 'j')
    .replace(/gh/g, 'g')
    .replace(/pp/g, 'p')
    .replace(/tt/g, 't')
    .replace(/zz/g, 'z')
    .replace(/jj/g, 'j')
    .replace(/dd/g, 'd')
    .replace(/nn/g, 'n')
    .replace(/rr/g, 'r')
    .replace(/mm/g, 'm')
    .replace(/ll/g, 'l');
};

// Simple Levenshtein distance helper for spelling tolerance
const getLevenshteinDistance = (a, b) => {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  const matrix = [];
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          Math.min(
            matrix[i][j - 1] + 1, // insertion
            matrix[i - 1][j] + 1  // deletion
          )
        );
      }
    }
  }
  return matrix[b.length][a.length];
};

// Common Hinglish/Hindi/English stop words to ignore in fuzzy menu matching
const STOP_WORDS = new Set([
  'hai', 'kya', 'bhi', 'aur', 'toh', 'sath', 'ko', 'se', 'ke', 'ka', 'ki', 
  'main', 'mera', 'apna', 'mujhe', 'karna', 'karni', 'batao', 'dikhao', 'bhedo',
  'dekhna', 'kahan', 'kaha', 'padega', 'bhopal', 'road', 'vip', 'timing', 'samay',
  'kab', 'open', 'close', 'delivery', 'payment', 'upi', 'cash', 'cod', 'card', 
  'table', 'booking', 'book', 'seat', 'reserve', 'reservation', 'offer', 'coupon', 
  'discount', 'code', 'sasta', 'track', 'status', 'order', 'please', 'the', 'and'
]);

// Helper to find menu item using robust matching for Hinglish inputs
const findMenuItem = (query, menu) => {
  const queryLower = query.toLowerCase().trim();
  
  // 1. Direct matching on full item name
  let matched = menu.find(item => queryLower.includes(item.name.toLowerCase()));
  if (matched) return matched;
  
  // 2. Keyword & synonym-based category routing (handles common Hinglish spellings)
  if (/pizza|piza|pijja|pija/i.test(queryLower)) {
    if (/supreme|suprime/i.test(queryLower)) return menu.find(i => i.name === 'Veg Supreme Pizza');
    if (/margherita|margrita|margarita|margerita|classic/i.test(queryLower)) return menu.find(i => i.name === 'Margherita Pizza');
    if (/capsicum|capcicum/i.test(queryLower)) return menu.find(i => i.name === 'Capsicum Pizza');
    return menu.find(i => i.name === 'Veg Supreme Pizza'); // default pizza
  }
  if (/burger|burgur|burgar/i.test(queryLower)) {
    if (/double|cheese|chese/i.test(queryLower)) return menu.find(i => i.name === 'Royal Double Cheese Burger');
    return menu.find(i => i.name === 'Crispy Veg Burger');
  }
  if (/lassi|lasi/i.test(queryLower)) {
    if (/mango|aam/i.test(queryLower)) return menu.find(i => i.name === 'Mango Lassi');
    return menu.find(i => i.name === 'Sweet Lassi');
  }
  if (/dosa|dhosa|dose/i.test(queryLower)) {
    if (/mysore|misore/i.test(queryLower)) return menu.find(i => i.name === 'Mysore Dosa');
    if (/rava|rawa|onion|pyaaj|pyaj/i.test(queryLower)) return menu.find(i => i.name === 'Rava Onion Dosa');
    return menu.find(i => i.name === 'Masala Dosa');
  }
  if (/biryani|biriyani|briyani/i.test(queryLower)) {
    if (/paneer|panir/i.test(queryLower)) return menu.find(i => i.name === 'Paneer Tikka Biryani');
    if (/chicken|ciken/i.test(queryLower)) return menu.find(i => i.name === 'Chicken Biryani');
    if (/egg|anda/i.test(queryLower)) return menu.find(i => i.name === 'Egg Biryani');
    return menu.find(i => i.name === 'Veg Biryani');
  }
  if (/paneer|panir/i.test(queryLower)) {
    if (/tikka|tika/i.test(queryLower)) return menu.find(i => i.name === 'Paneer Tikka');
    if (/butter|masala/i.test(queryLower)) return menu.find(i => i.name === 'Paneer Butter Masala');
    if (/kadhai|kadai/i.test(queryLower)) return menu.find(i => i.name === 'Kadhai Paneer');
    return menu.find(i => i.name === 'Paneer Butter Masala');
  }
  if (/naan|nan/i.test(queryLower)) {
    if (/garlic/i.test(queryLower)) return menu.find(i => i.name === 'Garlic Naan');
    return menu.find(i => i.name === 'Butter Naan');
  }
  if (/roti|tandoori/i.test(queryLower) && !/chaap|soya/i.test(queryLower)) {
    return menu.find(i => i.name === 'Tandoori Roti');
  }
  if (/paratha|parantha|lacha|lachha/i.test(queryLower)) {
    return menu.find(i => i.name === 'Lachha Paratha');
  }
  if (/noodel|noodle|nudel|noodels|hakka/i.test(queryLower)) {
    return menu.find(i => i.name === 'Hakka Noodles');
  }
  if (/manchurian|manchuryan/i.test(queryLower)) {
    return menu.find(i => i.name === 'Veg Manchurian');
  }
  if (/chilli|chili/i.test(queryLower) && /paneer/i.test(queryLower)) {
    return menu.find(i => i.name === 'Chilli Paneer Dry');
  }
  if (/pav|pao|bhaji/i.test(queryLower)) {
    return menu.find(i => i.name === 'Special Pav Bhaji');
  }
  if (/pani.*puri|panipuri|golgappa|golgappe|puchka/i.test(queryLower)) {
    return menu.find(i => i.name === 'Dilli Wali Pani Puri');
  }
  if (/gulab|jamun/i.test(queryLower)) {
    return menu.find(i => i.name === 'Gulab Jamun');
  }
  if (/rasmalai|ras.*malai/i.test(queryLower)) {
    return menu.find(i => i.name === 'Rasmalai');
  }
  if (/kulfi|kesar|pista/i.test(queryLower)) {
    return menu.find(i => i.name === 'Kesar Pista Kulfi');
  }
  if (/halwa|halva|moong/i.test(queryLower)) {
    return menu.find(i => i.name === 'Moong Dal Halwa');
  }
  if (/spring/i.test(queryLower)) {
    return menu.find(i => i.name === 'Veg Spring Roll');
  }
  if (/sholay|sholey|dahi/i.test(queryLower)) {
    return menu.find(i => i.name === 'Dahi Ke Sholay');
  }
  if (/chaap|chap|soya/i.test(queryLower)) {
    return menu.find(i => i.name === 'Tandoori Soya Chaap');
  }
  if (/kebab|kabab/i.test(queryLower)) {
    return menu.find(i => i.name === 'Hara Bhara Kebab');
  }
  if (/dal|daal/i.test(queryLower) && /makhani|makhni/i.test(queryLower)) {
    return menu.find(i => i.name === 'Dal Makhani');
  }
  if (/chole|chola|bhatura|bhature/i.test(queryLower)) {
    return menu.find(i => i.name === 'Chole Bhature');
  }
  if (/soda|lime/i.test(queryLower)) {
    return menu.find(i => i.name === 'Fresh Lime Soda');
  }
  if (/chai|tea/i.test(queryLower)) {
    return menu.find(i => i.name === 'Masala Chai');
  }

  // 3. Fallback token-level fuzzy match (using Levenshtein on normalized tokens)
  const queryWords = queryLower.split(/\s+/).filter(w => w.length > 2 && !STOP_WORDS.has(w));
  const normalizedQueryWords = queryWords.map(normalizeWord);

  for (const item of menu) {
    const itemWords = item.name.toLowerCase().split(/\s+/).filter(w => w.length > 2);
    const normalizedItemWords = itemWords.map(normalizeWord);
    
    for (const nq of normalizedQueryWords) {
      for (const ni of normalizedItemWords) {
        if (nq === ni) return item; // exact normalized match
        // Only allow fuzzy match for words longer than 3 characters
        if (nq.length > 3 && ni.length > 3) {
          const dist = getLevenshteinDistance(nq, ni);
          if (dist <= 1) return item; // 1 character spelling error tolerance
        }
      }
    }
  }

  return null;
};

// Removed duplicate helper functions

const handleIncomingMessage = async (req, res) => {
  const From = req.body.From;
  const To = req.body.To;
  const Body = req.body.Body;

  let reply = '';
  let detectedIntent = 'fallback';
  let matchedItemName = 'None';

  try {
    if (!From || Body === undefined) {
      console.error('[Error] Webhook received missing parameters. Body:', req.body);
      const twiml = `<Response><Message><![CDATA[Error: Missing From or Body parameters.]]></Message></Response>`;
      return res.type('text/xml').status(400).send(twiml);
    }

    const incomingText = Body || "";
    const msg = incomingText.toLowerCase().trim();

    // 1. Log incoming message in DB (Non-blocking)
    try {
      WhatsAppMessage.create({
        from: From,
        to: To || 'whatsapp:+919691832020',
        body: incomingText,
        direction: 'inbound'
      }).catch(err => console.error('[Error] Async DB logging failed for incoming message:', err.message));
    } catch (dbErr) {
      console.error('[Error] Failed to log incoming message to DB:', dbErr.message);
    }

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
      console.warn('[Warning] Failed to query MenuItem collection. Using local fallback menu. Error:', dbErr.message);
    }

    let coupons = [];
    try {
      coupons = await Coupon.find({ active: true }).maxTimeMS(2000);
    } catch (dbErr) {
      console.warn('[Warning] Failed to query Coupon collection. Error:', dbErr.message);
    }

    let orders = [];
    try {
      orders = await Order.find({
        customerPhone: { $regex: last10Digits }
      }).sort({ createdAt: -1 }).limit(5).maxTimeMS(2000);
    } catch (dbErr) {
      console.warn('[Warning] Failed to query Order collection. Error:', dbErr.message);
    }

    const matchedItem = findMenuItem(msg, menuItems);
    if (matchedItem) {
      matchedItemName = matchedItem.name;
    }

    // Strict priority checks:
    const session = whatsappSessions.get(From);

    if (session) {
      if (/cancel|abort|stop|hatao|band/i.test(msg)) {
        whatsappSessions.delete(From);
        reply = `Aapka order cancel kar diya hai. Kuch aur order karna chahein toh bataiye!`;
        detectedIntent = 'cancel_order';
      } else if (session.step === 'waiting_for_quantity') {
        const qty = parseInt(msg.replace(/\D/g, ''), 10);
        if (isNaN(qty) || qty <= 0) {
          reply = `Kripya quantity numbers me batayein (jaise: 1, 2, 3). Kitni plate/pcs chahiye?`;
        } else {
          session.quantity = qty;
          session.step = 'waiting_for_address';
          reply = `Theek hai, ${qty} quantity set ho gayi. Kripya apna home delivery address bhejein.`;
        }
        detectedIntent = 'order_quantity';
      } else if (session.step === 'waiting_for_address') {
        session.address = incomingText; // Keep original casing
        
        const orderId = `RB-${Math.floor(100000 + Math.random() * 900000)}`;
        const subtotal = session.price * session.quantity;
        const gst = Math.round(subtotal * 0.05 * 100) / 100;
        const deliveryCharge = subtotal >= 500 ? 0 : 40;
        const total = subtotal + gst + deliveryCharge;
        
        // Save order to MongoDB
        try {
          await Order.create({
            id: orderId,
            date: new Date().toISOString().split('T')[0],
            customerName: 'WhatsApp Guest',
            customerPhone: From,
            customerEmail: 'whatsapp@royalbites.in',
            address: session.address,
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
          });
          
          reply = `✅ *Order Confirmed!*\n\n` +
                  `*Order ID:* ${orderId}\n` +
                  `*Item:* ${session.dishName}\n` +
                  `*Qty:* ${session.quantity}\n` +
                  `*Total Amount:* ₹${total.toFixed(2)} (Cash/UPI on delivery)\n` +
                  `*Est. Time:* 30-40 mins\n\n` +
                  `Hum aapka order jaldi hi deliver kar denge! Thank you! 🍽️`;
          
          whatsappSessions.delete(From);
          detectedIntent = 'order_confirmed';
        } catch (err) {
          console.error('Error saving order from WhatsApp webhook:', err);
          reply = `Order save karne me koi issue aaya. Kripya fir se try karein.`;
          whatsappSessions.delete(From);
          detectedIntent = 'order_failed';
        }
      }
    }
    // a) greetings: hi, hello, hey, namaste
    else if (/\b(hi|hello|hey|namaste)\b/i.test(msg)) {
      reply = `Hello! Welcome to Royal Bites. 🙏 How can I assist you today? You can ask for menu, address, timing, delivery, or check order status.`;
      detectedIntent = 'greetings';
    }
    // b) address/location
    else if (/\b(address|location|located|kaha|kahan|pata|map|direction|road|place)\b/i.test(msg)) {
      reply = `📍 Royal Bites ka address: VIP Road, Bhopal.`;
      detectedIntent = 'address';
    }
    // c) timing/open/close
    else if (/\b(timing|open|close|time|hour|hours|kab|samay|khulta|band)\b/i.test(msg)) {
      reply = `⏰ Royal Bites Timings:\n• Monday – Thursday: 12:00 PM – 11:00 PM\n• Friday – Sunday: 12:00 PM – 12:00 AM`;
      detectedIntent = 'timing';
    }
    // d) payment/upi/cash/card
    else if (/\b(payment|upi|cash|cod|card|pay|gp|phonepe|paytm)\b/i.test(msg)) {
      reply = `💳 Payment Options:\nWe accept Google Pay, PhonePe, Paytm, BHIM UPI, Credit/Debit Cards, and Cash on Delivery (COD).`;
      detectedIntent = 'payment';
    }
    // e) delivery
    else if (/\b(delivery|deliver|ghar|home|charge)\b/i.test(msg)) {
      reply = `🛵 Home Delivery:\nWe provide home delivery. Free delivery on orders above ₹500, else ₹40 delivery charge applies.`;
      detectedIntent = 'delivery';
    }
    // f) booking/table
    else if (/\b(table|booking|book|seat|reserve|reservation)\b/i.test(msg)) {
      reply = `🍽️ Table Booking:\nYou can book a table online at: https://royal-bites-restro.onrender.com/booking or share your Name, Date, Time, and Guests here.`;
      detectedIntent = 'booking';
    }
    // g) track/status/order id
    else if (/\b(track|status|detail|check|order\s*id|orderid)\b/i.test(msg) || /\b\d{5,6}\b/.test(msg) || /rb-\d{5,6}/i.test(msg)) {
      const orderIdMatch = msg.match(/\b\d{5,6}\b/) || msg.match(/rb-\d{5,6}/i);
      let orderId = orderIdMatch ? orderIdMatch[0] : null;
      if (orderId && !orderId.startsWith('RB-')) {
        orderId = `RB-${orderId}`;
      }

      if (orderId) {
        try {
          const order = await Order.findOne({ id: { $regex: new RegExp(orderId, 'i') } });
          if (order) {
            reply = `📋 Order Status for ${order.id}:\nStatus: ${order.status}\nTotal: ₹${order.total}\nEstimated Time: ${order.estimatedTime}`;
          } else {
            reply = `Humein order ID ${orderId} nahi mila. Kripya sahi order ID batayein.`;
          }
        } catch (err) {
          reply = `Order check karne me error aayi. Kripya thodi der baad try karein.`;
        }
      } else {
        if (orders && orders.length > 0) {
          const lastOrder = orders[0];
          reply = `📋 Aapka aakhri order status:\nOrder ID: ${lastOrder.id}\nStatus: ${lastOrder.status}\nTotal: ₹${lastOrder.total}\nTrack Link: https://royal-bites-restro.onrender.com/track-order/${lastOrder.id}`;
        } else {
          reply = `Humein aapke number se koi recent order nahi mila. Apne order ko track karne ke liye kripya 6-digit Order ID bhejein (e.g. track 123456).`;
        }
      }
      detectedIntent = 'track_order';
    }
    // h) menu
    else if (/\b(menu|list|khana|dish|dishes|catalog)\b/i.test(msg)) {
      let menuReply = `🍽️ Royal Bites Menu:\n\n`;
      const menuByCategory = {};
      menuItems.forEach(item => {
        const cat = item.category || 'Other';
        if (!menuByCategory[cat]) menuByCategory[cat] = [];
        menuByCategory[cat].push(item);
      });
      for (const [cat, items] of Object.entries(menuByCategory)) {
        menuReply += `*${cat}:*\n`;
        items.forEach(i => {
          menuReply += `• ${i.name} - ₹${i.price}\n`;
        });
        menuReply += `\n`;
      }
      menuReply += `Type dish name for price/details, or say "order [dish name]" to place an order.`;
      reply = menuReply;
      detectedIntent = 'menu';
    }
    // j) new order (priority over details only if order keywords are present)
    else if (/\b(order|chahiye|chahye|buy|mangwana|mangao|bhejo|lele)\b/i.test(msg)) {
      if (matchedItem) {
        const newSession = {
          step: 'waiting_for_quantity',
          dishName: matchedItem.name,
          price: matchedItem.price
        };
        whatsappSessions.set(From, newSession);
        reply = `Aapne *${matchedItem.name}* select kiya hai. Iski kitni quantity chahiye?`;
      } else {
        reply = `Aap kya order karna chahte hain? Humare menu me Pizza, Burger, Paneer Tikka, Biryani aur bahot kuch hai. Kripya dish ka naam likh kar order karein (e.g., *order pizza*).`;
      }
      detectedIntent = 'new_order';
    }
    // i) menu item price/details (no order keywords)
    else if (matchedItem) {
      reply = `*${matchedItem.name}* ka price ₹${matchedItem.price} hai.\nDescription: ${matchedItem.description || 'No description available'}.\n\nIsey order karne ke liye likhein: "order ${matchedItem.name.toLowerCase()}"`;
      detectedIntent = 'price_details';
    }
    // k) fallback
    else {
      reply = `Welcome to Royal Bites! 🙏 How can I assist you today?\n\nYou can ask me about:\n` +
             `• *Menu* (To view our menu)\n` +
             `• *Offers* (To view current coupons)\n` +
             `• *Book table* (To book a table)\n` +
             `• *Order status* (To track your latest order)\n` +
             `• *Address & Timings*`;
      detectedIntent = 'fallback';
    }

    console.log('Incoming:', incomingText);
    console.log('From:', From);
    console.log('Detected intent:', detectedIntent);
    console.log('Matched item:', matchedItemName);
    console.log('Reply:', reply);

    // Send TwiML response synchronously
    res.type('text/xml').send(`<Response><Message><![CDATA[${reply}]]></Message></Response>`);

    // Send backup copy via Twilio REST API asynchronously if API keys are valid (optional)
    if (process.env.TWILIO_ACCOUNT_SID && !process.env.TWILIO_ACCOUNT_SID.startsWith('ACXXXX')) {
      try {
        await sendWhatsAppMessage(From, reply);
      } catch (twilioErr) {
        console.warn('[Warning] Optional async REST API fallback send failed (likely placeholder credentials).');
      }
    }

    // Log outgoing message in DB (Non-blocking)
    try {
      WhatsAppMessage.create({
        from: To || 'whatsapp:+919691832020',
        to: From,
        body: reply,
        direction: 'outbound'
      }).catch(err => console.error('[Error] Async DB logging failed for outgoing message:', err.message));
    } catch (dbErr) {
      console.error('[Error] Failed to log outgoing message to DB:', dbErr.message);
    }

  } catch (err) {
    console.error('[Error] Exception caught in webhook processing:', err.message || err);
    
    // Return safe fallback message in TwiML format to prevent Twilio webhook timeout
    const fallbackText = `Welcome to Royal Bites! 🙏 How can I assist you today?\n\nYou can ask me about:\n• *Menu* (To view our menu)\n• *Offers* (To view current coupons)\n• *Book table* (To book a table)\n• *Order status* (To track your latest order)\n• *Address & Timings*`;
    const twiml = `<Response><Message><![CDATA[${fallbackText}]]></Message></Response>`;
    try {
      if (!res.headersSent) {
        res.type('text/xml').send(twiml);
      }
    } catch (sendErr) {
      console.error('[Error] Failed to send fallback TwiML reply after main exception:', sendErr.message);
    }
  }
};

const getRuleBasedFallbackReply = () => null;

module.exports = {
  handleIncomingMessage,
  getRuleBasedFallbackReply
};
