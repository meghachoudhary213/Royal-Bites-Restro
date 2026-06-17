import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot } from 'lucide-react';
import { formatMenuForChat, restaurantInfo } from '../data/menu';
import { useNavigate } from 'react-router-dom';

const QUICK_ACTIONS = [
  'Resort Rooms',
  'Spa & Wellness',
  'Banquets & Events',
  'Show menu',
  'Book table / room',
  'View offers',
];

function getBotResponse(input) {
  const msg = input.toLowerCase().trim();

  if (msg.includes('login') || msg.includes('sign in')) {
    return {
      text: `🔐 **How to Login**\n\nClick the **Login** button at the top right of the page. Enter your credentials or use the Google Sign-in demo shortcut to log in instantly.`,
      action: null,
    };
  }

  if (msg.includes('register') || msg.includes('sign up') || msg.includes('create account')) {
    return {
      text: `📝 **How to Register**\n\nClick the **Login** button at the top right, then select **Create Account** at the bottom to fill in your details.`,
      action: null,
    };
  }

  if (msg.includes('room') || msg.includes('suite') || msg.includes('stay') || msg.includes('accommodation')) {
    return {
      text: `🏨 **Luxury Stays at Royal Grand**\n\nWe offer four categories of 5-star accommodations:\n• **Presidential Infinity Suite** (Private pool, sea view, 24/7 butler)\n• **Royal Executive Room** (Club Lounge access, premium workspace)\n• **Deluxe Garden Sanctuary Villa** (Plunge pool, botanic garden)\n• **Superior Oceanfront Room** (Ocean panoramic balcony)\n\nClick below to explore our rooms and check availability!`,
      action: 'rooms',
    };
  }

  if (msg.includes('spa') || msg.includes('massage') || msg.includes('wellness') || msg.includes('therapy')) {
    return {
      text: `💆 **Spa & Wellness Sanctuary**\n\nIndulge in absolute bliss. Our signature therapies include:\n• **Royal Ayurvedic Rejuvenation** (90 mins)\n• **Deep Tissue Harmony Massage** (60 mins)\n• **Himalayan Salt Scrub & Stones** (75 mins)\n• **Luxury Caviar Anti-Aging Facial** (60 mins)\n\nClick below to browse the spa and submit an inquiry!`,
      action: 'spa',
    };
  }

  if (msg.includes('event') || msg.includes('banquet') || msg.includes('wedding') || msg.includes('hall') || msg.includes('meeting')) {
    return {
      text: `🏛️ **Grand Banquets & Venues**\n\nHost your memorable events in our elite settings:\n• **The Grand Empress Ballroom** (Indoor, up to 500 guests)\n• **Royal Pavilion Ocean Lawn** (Outdoor, up to 300 guests)\n• **Majestic Executive Boardroom** (Indoor corporate, up to 25 guests)\n\nClick below to check out details and submit a venue inquiry.`,
      action: 'events',
    };
  }

  if (
    msg.includes('history') ||
    msg.includes('past orders') ||
    msg.includes('my orders') ||
    msg.includes('check my orders')
  ) {
    return {
      text: `📋 **Checking Your Orders**\n\nGo to your Profile dropdown in the top right and select **My Bookings** or check history. You can view your dining orders and table/room reservations.`,
      action: null,
    };
  }

  if (msg.includes('order food') || msg.includes('how to order') || msg.includes('buy')) {
    return {
      text: `🍔 **Dining at Royal Bites Restaurant**\n\n1. Browse our **Royal Bites Menu** page.\n2. Add items to your cart.\n3. Open the **Cart** sidebar.\n4. Click **Proceed to Checkout** to complete your dining order. We deliver to your room or home!`,
      action: 'menu',
    };
  }

  if (msg.includes('payment') || msg.includes('pay') || msg.includes('cod') || msg.includes('upi')) {
    return {
      text: `💳 **Payment Methods**\n\nWe support UPI/Scan QR, Credit/Debit cards, and Cash on Delivery (COD) for our restaurant orders and room deposits.`,
      action: null,
    };
  }

  if (
    msg.includes('offer') ||
    msg.includes('discount') ||
    msg.includes('deal') ||
    msg.includes('promo') ||
    msg.includes('coupon')
  ) {
    return {
      text: `🎁 **Exclusive Resort & Dining Offers** 🎁\n\n• **SUMMER25** — 25% Off suites for 3+ nights stay.\n• **ROYALRETREAT** — Complimentary 3-course dinner at Royal Bites Restaurant during your stay.\n• **SPAWELLNESS** — Free couple massage on Deluxe Villa bookings.\n\nUse these codes when booking or checking out!`,
      action: 'offers',
    };
  }

  if (msg.includes('menu') || msg.includes('show menu') || msg.includes('food') || msg.includes('restaurant') || msg.includes('dine') || msg.includes('dining')) {
    return {
      text: `🍽️ **Royal Bites Restaurant Menu**:\n\n${formatMenuForChat()}\n\nWould you like to book a table or place a food order?`,
      action: 'menu',
    };
  }

  if (msg.includes('book') || msg.includes('table') || msg.includes('reserv') || msg.includes('booking')) {
    return {
      text: 'I\'d love to help you book a suite or reserve a table at Royal Bites. Click below to go to our dual reservation panel.',
      action: 'booking',
    };
  }

  if (
    msg.includes('timing') ||
    msg.includes('hour') ||
    msg.includes('open') ||
    msg.includes('close') ||
    msg.includes('time')
  ) {
    return {
      text: `🕐 **Resort & Dining Hours**\n\n• Resort Front Desk: 24/7\n• Royal Bites Restaurant: ${restaurantInfo.hours.weekdays} (${restaurantInfo.hours.weekend})\n• Spa & Wellness: 8:00 AM - 9:00 PM daily`,
      action: null,
    };
  }

  if (msg.includes('order') && (msg.includes('status') || msg.includes('track'))) {
    return {
      text: 'To check your restaurant order status, click your order tracking link or contact our concierge via WhatsApp with your order ID.',
      action: 'order-status',
    };
  }

  if (msg.includes('whatsapp') || msg.includes('contact') || msg.includes('call')) {
    return {
      text: 'Connect with our resort concierge team instantly on WhatsApp for any special requests!',
      action: 'whatsapp',
    };
  }

  if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey')) {
    return {
      text: `Welcome to Royal Grand Hotel & Resort! 🏨 I'm your virtual concierge. How may I assist you today?\n\nTry asking about: "Resort Rooms", "Spa & Wellness", "Banquets & Events", "Show menu", or "Book table / room".`,
      action: null,
    };
  }

  return {
    text: 'I can help you with:\n• Resort Rooms & Suites\n• Spa & Wellness Sanctuary\n• Banquets & Grand Events\n• Royal Bites Dining Menu\n• Book table / room\n\nWhat would you like to know?',
    action: null,
  };
}

export default function Chatbot({ onWhatsApp }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'bot',
      text: `Hello! Welcome to Royal Grand Hotel & Resort. How can I make your stay royal today?`,
    },
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = (text) => {
    if (!text.trim()) return;

    setMessages((prev) => [...prev, { role: 'user', text }]);
    setInput('');

    setTimeout(() => {
      const response = getBotResponse(text);
      setMessages((prev) => [...prev, { role: 'bot', text: response.text, action: response.action }]);
    }, 600);
  };

  const handleAction = (action) => {
    if (action === 'booking') {
      navigate('/booking');
      setOpen(false);
    } else if (action === 'offers') {
      navigate('/offers');
      setOpen(false);
    } else if (action === 'rooms') {
      navigate('/rooms');
      setOpen(false);
    } else if (action === 'spa') {
      navigate('/spa');
      setOpen(false);
    } else if (action === 'events') {
      navigate('/events');
      setOpen(false);
    } else if (action === 'menu') {
      navigate('/menu');
      setOpen(false);
    } else if (action === 'whatsapp') {
      onWhatsApp();
    }
  };

  const renderMessage = (text) => {
    return text.split('\n').map((line, i) => {
      const formatted = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      return (
        <span key={i}>
          <span dangerouslySetInnerHTML={{ __html: formatted }} />
          {i < text.split('\n').length - 1 && <br />}
        </span>
      );
    });
  };

  return (
    <>
      {open && (
        <div className="fixed bottom-24 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-96 glass-strong rounded-3xl overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom-4">
          <div className="bg-gradient-to-r from-sunset/30 to-gold/20 p-4 flex items-center justify-between border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-navy/50">
                <Bot className="w-5 h-5 text-gold" />
              </div>
              <div>
                <p className="font-semibold text-cream">Royal Concierge</p>
                <p className="text-xs text-cream/50">Always here to help</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Close chat"
            >
              <X className="w-5 h-5 text-cream/70" />
            </button>
          </div>

          <div className="h-80 overflow-y-auto p-4 space-y-4 bg-navy/40">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-r from-sunset to-gold-dark text-navy rounded-br-md'
                      : 'glass text-cream/90 rounded-bl-md'
                  }`}
                >
                  {renderMessage(msg.text)}
                  {msg.action === 'booking' && (
                    <button
                      type="button"
                      onClick={() => handleAction('booking')}
                      className="mt-2 text-xs underline text-gold hover:text-cream block"
                    >
                      Go to booking form →
                    </button>
                  )}
                  {msg.action === 'offers' && (
                    <button
                      type="button"
                      onClick={() => handleAction('offers')}
                      className="mt-2 text-xs underline text-gold hover:text-cream block"
                    >
                      View current offers →
                    </button>
                  )}
                  {msg.action === 'whatsapp' && (
                    <button
                      type="button"
                      onClick={() => handleAction('whatsapp')}
                      className="mt-2 text-xs underline text-green-400 hover:text-green-300 block"
                    >
                      Open WhatsApp →
                    </button>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-3 border-t border-white/10 bg-navy/60">
            <div className="flex flex-wrap gap-2 mb-3">
              {QUICK_ACTIONS.map((action) => (
                <button
                  key={action}
                  type="button"
                  onClick={() => sendMessage(action)}
                  className="text-xs px-3 py-1.5 rounded-full glass hover:bg-white/15 text-cream/80 transition-colors"
                >
                  {action}
                </button>
              ))}
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage(input);
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything..."
                className="flex-1 input-field py-2 text-sm"
              />
              <button
                type="submit"
                className="p-2.5 rounded-xl bg-gradient-to-r from-sunset to-gold text-navy hover:opacity-90 transition-opacity"
                aria-label="Send message"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-4 sm:right-6 z-50 p-4 rounded-full bg-gradient-to-r from-sunset to-gold shadow-lg shadow-sunset/40 hover:scale-110 transition-transform duration-300 group"
        aria-label="Open chatbot"
      >
        {open ? (
          <X className="w-6 h-6 text-navy" />
        ) : (
          <>
            <MessageCircle className="w-6 h-6 text-navy" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-pink rounded-full animate-pulse" />
          </>
        )}
      </button>
    </>
  );
}
