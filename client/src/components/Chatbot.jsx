import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot } from 'lucide-react';
import { formatMenuForChat, restaurantInfo } from '../data/menu';
import { useNavigate } from 'react-router-dom';

const QUICK_ACTIONS = [
  'Show menu',
  'View offers',
  'Book table',
  'Restaurant timing',
  'Order status',
  'Contact on WhatsApp',
];

function getBotResponse(input) {
  const msg = input.toLowerCase().trim();

  if (msg.includes('login') || msg.includes('sign in')) {
    return {
      text: `🔐 **How to Login**\n\nClick the **Login** button at the top right of the page. Enter your email/mobile and password, or use the **Sign in with Google (Demo)** shortcut to log in instantly.`,
      action: null,
    };
  }

  if (msg.includes('register') || msg.includes('sign up') || msg.includes('create account')) {
    return {
      text: `📝 **How to Register**\n\nClick the **Login** button at the top right of the page, then select **Create Account** at the bottom. Provide your name, mobile, email, password, and address to register.`,
      action: null,
    };
  }

  if (
    msg.includes('history') ||
    msg.includes('past orders') ||
    msg.includes('my orders') ||
    msg.includes('check my orders')
  ) {
    return {
      text: `📋 **Checking Your Orders**\n\nOnce logged in, click your name dropdown in the top right corner and select **My Orders**. You can view order statuses (Preparing/Delivered) and use the **Reorder** button to cart items again.`,
      action: null,
    };
  }

  if (msg.includes('order food') || msg.includes('how to order') || msg.includes('buy')) {
    return {
      text: `🍔 **How to Order Food**\n\n1. Browse our **Signature Menu**.\n2. Tap the **+** icon to add items to your cart, or click cards for details.\n3. Open the **Cart** (bag icon on the top right).\n4. Click **Checkout on WhatsApp** to verify your address and complete the order!`,
      action: null,
    };
  }

  if (msg.includes('payment') || msg.includes('pay') || msg.includes('cod') || msg.includes('upi')) {
    return {
      text: `💳 **Payment Options**\n\nWe support three major payment methods for your convenience during checkout:\n• **UPI / Scan QR** (Instant & secure)\n• **Cash on Delivery (COD)** (Pay when food arrives)\n• **Credit/Debit Cards** (All major cards accepted)`,
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
      text: `🎁 **Royal Bites Exclusive Offers** 🎁\n\n• **ROYAL20** — Flat 20% Off on your first table booking.\n• **FAMILY799** — Special Family Combo starting at just ₹799.\n• **FREEGIFT** — Free delicious dessert on orders above ₹999.\n\nUse these codes when booking a table or checking out!`,
      action: 'offers',
    };
  }

  if (msg.includes('menu') || msg.includes('show menu') || msg.includes('food')) {
    return {
      text: `Here's our signature menu:\n\n${formatMenuForChat()}\n\nWould you like to book a table or place an order inquiry?`,
      action: 'menu',
    };
  }

  if (msg.includes('book') || msg.includes('table') || msg.includes('reserv')) {
    return {
      text: 'I\'d love to help you reserve a table! Scroll to our "Book Your Table" section or click below to go there directly.',
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
      text: `🕐 **Royal Bites Hours**\n\n${restaurantInfo.hours.weekdays}\n${restaurantInfo.hours.weekend}\n\n_${restaurantInfo.hours.kitchen}_`,
      action: 'timing',
    };
  }

  if (msg.includes('order') && (msg.includes('status') || msg.includes('track'))) {
    return {
      text: 'To check your order status, please provide your inquiry email or phone number to our team via WhatsApp. Orders are typically confirmed within 30 minutes during service hours.',
      action: 'order-status',
    };
  }

  if (msg.includes('whatsapp') || msg.includes('contact') || msg.includes('call')) {
    return {
      text: 'Connect with us instantly on WhatsApp! Click the green button below or use the floating WhatsApp icon.',
      action: 'whatsapp',
    };
  }

  if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey')) {
    return {
      text: `Welcome to ${restaurantInfo.name}! 👑 I'm your virtual concierge. How may I assist you today?\n\nTry: "Show menu", "Book table", "Restaurant timing", "Order status", or "Contact on WhatsApp".`,
      action: null,
    };
  }

  return {
    text: 'I can help you with:\n• Show menu\n• Book table\n• Restaurant timing\n• Order status\n• Contact on WhatsApp\n\nWhat would you like to know?',
    action: null,
  };
}

export default function Chatbot({ onWhatsApp }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'bot',
      text: `Hello! Welcome to ${restaurantInfo.name}. How can I make your evening royal today?`,
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
      if (window.location.pathname !== '/') {
        navigate('/');
        setTimeout(() => {
          document.querySelector('#offers')?.scrollIntoView({ behavior: 'smooth' });
        }, 300);
      } else {
        document.querySelector('#offers')?.scrollIntoView({ behavior: 'smooth' });
      }
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
