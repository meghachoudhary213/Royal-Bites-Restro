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
  const queryWords = queryLower.split(/\s+/).filter(w => w.length > 2);
  const normalizedQueryWords = queryWords.map(normalizeWord);

  for (const item of menu) {
    const itemWords = item.name.toLowerCase().split(/\s+/).filter(w => w.length > 2);
    const normalizedItemWords = itemWords.map(normalizeWord);
    
    for (const nq of normalizedQueryWords) {
      for (const ni of normalizedItemWords) {
        if (nq === ni) return item; // exact normalized match
        const dist = getLevenshteinDistance(nq, ni);
        if (dist <= 1) return item; // 1 character spelling error tolerance
      }
    }
  }

  return null;
};

// Fallback rule-based replies
const getRuleBasedFallbackReply = (body, context, fromNumber) => {
  const query = body.toLowerCase().trim();
  
  // Business contact number formatted from config or fallback
  const contactNo = process.env.WHATSAPP_NUMBER ? `+91 ${process.env.WHATSAPP_NUMBER}` : '+91 9691832020';

  // 1. Session flow processing if an order session is in progress
  const session = whatsappSessions.get(fromNumber);
  if (session) {
    if (/cancel|abort|stop|hatao|band karo/i.test(query)) {
      whatsappSessions.delete(fromNumber);
      return `Aapka order cancel kar diya hai. Kuch aur order karna chahein toh bataiye!`;
    }

    if (session.step === 'waiting_for_quantity') {
      const qty = parseInt(body.replace(/\D/g, ''), 10);
      if (isNaN(qty) || qty <= 0) {
        return `Kripya quantity numbers me batayein (jaise: 1, 2, 3). Kitni plate/pcs chahiye?`;
      }
      session.quantity = qty;
      session.step = 'waiting_for_address';
      return `Theek hai, ${qty} quantity set ho gayi. Kripya apna home delivery address bhejein.`;
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

      session.finalOrder = newOrder;
      return `✅ *Order Confirmed!*\n\n` +
             `*Order ID:* ${rawOrderId}\n` +
             `*Item:* ${session.dishName}\n` +
             `*Qty:* ${session.quantity}\n` +
             `*Total Amount:* ₹${total.toFixed(2)} (Cash/UPI on delivery)\n` +
             `*Est. Time:* 30-40 mins\n\n` +
             `Hum aapka order jaldi hi deliver kar denge! Thank you! 🍽️`;
    }
  }

  // 2. Strict order status tracking (Do not ask for Order ID unless user explicitly wants order tracking/status)
  const isTrackingQuery = /track|status|kaha|kahan|check|detail/i.test(query) && /order/i.test(query);
  const wantsTracking = isTrackingQuery || /^(track|status|tracking|order id|mera order kaha)$/i.test(query) || (query.includes('order') && (query.includes('status') || query.includes('track') || query.includes('kaha') || query.includes('kahan') || query.includes('check')));

  if (wantsTracking) {
    if (context.orders && context.orders.length > 0) {
      const lastOrder = context.orders[0];
      return `Aapka aakhri order status:\n\n` +
             `*Order ID:* ${lastOrder.id}\n` +
             `*Status:* ${lastOrder.status}\n` +
             `*Total:* ₹${lastOrder.total}\n\n` +
             `Aap isey yahan bhi track kar sakte hain: https://royal-bites-restro.onrender.com/track-order/${lastOrder.id}`;
    } else {
      return `Humein aapke number se koi recent order nahi mila. Apne order ko track karne ke liye kripya 6-digit Order ID bhejein.`;
    }
  }

  // 3. Table Booking
  if (/table|booking|book|seat|reserve|reservation/i.test(query)) {
    return `🍽️ *Table Booking:*\n` +
           `Haan, Royal Bites me table booking available hai!\n` +
           `Aap website par directly book kar sakte hain: https://royal-bites-restro.onrender.com/booking\n\n` +
           `Ya fir mujhe apna *Naam, Date, Time, aur Guests ki sankhya* bataiye, main book kar dunga!`;
  }

  // 4. Recommendations / Specials / Best food queries
  const isRecommendQuery = /best|recommend|suggest|accha|achha|special|popular|swad|tasty/i.test(query);
  if (isRecommendQuery) {
    if (/pizza|piza|pijja|pija/i.test(query)) {
      return `🍕 *Best Pizza Recommendation:*\n` +
             `Humara *Veg Supreme Pizza* (₹299) sabse popular aur delicious hai! Classic cheese chahte hain toh *Margherita Pizza* (₹249) try karein.`;
    }
    if (/burger|burgur|burgar/i.test(query)) {
      return `🍔 *Best Burger Recommendation:*\n` +
             `*Royal Double Cheese Burger* (₹179) double cheese patty ke sath custom favorites me se ek hai!`;
    }
    if (/paneer|panir/i.test(query)) {
      return `🧀 *Paneer Special:*\n` +
             `Aap humara creamy *Paneer Butter Masala* (₹249) try karein, ye humara customer choice signature dish hai!`;
    }
    if (/lassi|drink|bev|chai|tea/i.test(query)) {
      return `🥤 *Drinks Specials:*\n` +
             `Refreshing *Mango Lassi* (₹119) ya clay-pot style *Sweet Lassi* (₹99) best selling drinks hain!`;
    }
    if (/sweet|dessert|mithai|halwa|rasmalai/i.test(query)) {
      return `🍰 *Desserts Recommendations:*\n` +
             `Aap saffron-milk flavored *Rasmalai* (₹119) ya ghee-rich *Moong Dal Halwa* (₹149) try karein, ekdum lajawab taste hai!`;
    }
    return `🍽️ *Royal Bites Recommendations:*\n` +
           `• *Starters:* Paneer Tikka (₹229) & Hara Bhara Kebab (₹199)\n` +
           `• *Main Course:* Paneer Butter Masala (₹249) & Dal Makhani (₹199)\n` +
           `• *Pizza:* Veg Supreme Pizza (₹299)\n` +
           `• *Dessert:* Rasmalai (₹119)`;
  }

  // 5. Food Order request check (Separate from tracking)
  const matchedItem = findMenuItem(query, context.menu);
  const isOrderingQuery = /order|chahiye|chahye|buy|mangwana|mangao|bhejo|lele/i.test(query);

  if (isOrderingQuery) {
    if (matchedItem) {
      const newSession = {
        step: 'waiting_for_quantity',
        dishName: matchedItem.name,
        price: matchedItem.price
      };
      whatsappSessions.set(fromNumber, newSession);
      return `Aapne *${matchedItem.name}* select kiya hai. Iski kitni quantity chahiye?`;
    } else {
      return `Aap kya order karna chahte hain? Humare menu me Pizza, Burger, Paneer Tikka, Biryani aur bahot kuch hai. Kripya dish ka naam likh kar order karein (e.g., *order pizza*).`;
    }
  }

  // 6. Dish price / details check
  if (matchedItem) {
    return `*${matchedItem.name}* ka price ₹${matchedItem.price} hai.\n` +
           `*Description:* ${matchedItem.description || 'No description available'}.\n\n` +
           `Isey order karne ke liye likhein: "order ${matchedItem.name.toLowerCase()}"`;
  }

  // 7. Restaurant Address check
  if (/address|location|kaha|kahan|map|direction|rasta|road|place|bhopal|located|pata/i.test(query)) {
    return `📍 *Royal Bites Location:*\n` +
           `VIP Road, Bhopal, Madhya Pradesh.\n\n` +
           `Google Maps Direction Link: https://maps.google.com/?q=VIP+Road+Bhopal`;
  }

  // 8. Timings check
  if (/timing|hour|time|open|close|kab|samay|khulta|band/i.test(query)) {
    return `⏰ *Royal Bites Timings:*\n` +
           `• Monday – Thursday: 12:00 PM – 11:00 PM\n` +
           `• Friday – Sunday: 12:00 PM – 12:00 AM\n\n` +
           `Kitchen closing hours se 30 mins pehle close ho jata hai.`;
  }

  // 9. Delivery check
  if (/delivery|deliver|ghar|home|charge/i.test(query)) {
    return `🛵 *Home Delivery:*\n` +
           `Haan ji, home delivery available hai! ₹500 se upar ke orders par free delivery hai. Isse kam ke orders par ₹40 delivery charge apply hota hai.`;
  }

  // 10. Payment check
  if (/payment|upi|cash|cod|card|pay|gp|phonepe|paytm|wallet/i.test(query)) {
    return `💳 *Payment Options:*\n` +
           `Hum Google Pay, PhonePe, Paytm, BHIM UPI, Credit/Debit Cards, aur Cash on Delivery (COD) accept karte hain! Haan, UPI chalega.`;
  }

  // 11. Offers check
  if (/offer|coupon|discount|code|sasta|choot|sale|coupons|offers/i.test(query)) {
    let reply = `🎁 *Royal Bites Active Offers* 🎁\n\n`;
    if (context.coupons && context.coupons.length > 0) {
      context.coupons.forEach(c => {
        reply += `• *${c.code}* - ${c.description || `${c.discountValue}% off`}\n`;
      });
    } else {
      reply += `• *ROYAL20* - Get 20% off on first table booking.\n` +
               `• *WELCOME100* - ₹100 flat discount on orders above ₹499.\n` +
               `• *FREEGIFT* - Free dessert on orders above ₹999.\n`;
    }
    return reply;
  }

  // 12. Menu inquiry
  if (/menu|list|khana|dish|dishes|catalog|item/i.test(query)) {
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
    reply += `Type dish name for price/details, or say "order [dish name]" to place an order.`;
    return reply;
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
      if (/menu|list|khana|dish|dishes|catalog|item/i.test(qLower)) detectedIntent = 'Menu';
      else if (/best|recommend|suggest|accha|achha|special|popular/i.test(qLower)) detectedIntent = 'Recommendations';
      else if (/table|booking|book|seat|reserve|reservation/i.test(qLower)) detectedIntent = 'Table Booking';
      else if (/track|status|kaha|kahan|check|id/i.test(qLower) && /order/i.test(qLower)) detectedIntent = 'Order Status Tracking';
      else if (/order|chahiye|chahye|buy|mangwana|mangao|bhejo|lele/i.test(qLower)) detectedIntent = 'Order Food Flow';
      else if (matchedItem) detectedIntent = 'Price / Details';
      else if (/address|location|kaha|kahan|map|direction|rasta|road|place|bhopal|located/i.test(qLower)) detectedIntent = 'Restaurant Address';
      else if (/timing|hour|time|open|close|kab|samay|khulta|band/i.test(qLower)) detectedIntent = 'Timing / Hours';
      else if (/delivery|deliver|ghar|home|charge/i.test(qLower)) detectedIntent = 'Delivery';
      else if (/payment|upi|cash|cod|card|pay/i.test(qLower)) detectedIntent = 'Payment Options';
      else if (/offer|coupon|discount|code|sasta|choot|sale|coupons|offers/i.test(qLower)) detectedIntent = 'Offers & Coupons';
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
