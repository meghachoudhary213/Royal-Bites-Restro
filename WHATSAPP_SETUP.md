# Royal Bites — WhatsApp AI Automation Setup Guide

This guide details the setup required for Twilio WhatsApp Sandbox and Grok xAI API integration.

---

## ⚙️ Environment Configuration

Ensure the following variables are configured in your server environment (in `server/.env` for local development or in the Render dashboard for production):

```env
# Twilio credentials
TWILIO_ACCOUNT_SID=your_twilio_account_sid_here
TWILIO_AUTH_TOKEN=your_twilio_auth_token_here
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886

# Grok xAI credentials
XAI_API_KEY=your_grok_xai_api_key_here
XAI_MODEL=grok-beta
```

---

## 📲 Twilio WhatsApp Sandbox Setup

To test the integration using the Twilio WhatsApp Sandbox:

1. Sign up or log in to [Twilio Console](https://console.twilio.com/).
2. Navigate to **Messaging** > **Try it out** > **Send a WhatsApp message**.
3. Follow the instructions to join the sandbox by sending the sandbox keyword (e.g., `join word-word`) to the Twilio sandbox phone number (typically `+1 415 523 8886`).
4. Keep the sandbox window open. Under **Sandbox settings**:
   * Locate the field: **When a message comes in** (Webhook URL).
   * Enter your Render backend endpoint:
     `https://royal-bites-restro-backend.onrender.com/api/whatsapp/incoming`
   * Select method: **POST**.
   * Click **Save** to save the sandbox configuration.

---

## 🤖 xAI Grok API Setup

To obtain your xAI Grok API credentials:

1. Go to [xAI Console](https://console.x.ai/).
2. Create an account, verify details, and create an API Key.
3. Keep the key safe and set it as `XAI_API_KEY`.
4. The model name defaults to `grok-beta`.

---

## 🧪 Testing Queries

Send these sample messages to the Twilio sandbox number from your WhatsApp client:
- `menu dikhao` (should return list of Indian/Continental dishes in Hinglish/Hindi)
- `paneer tikka price` (should return pricing of Paneer Tikka in ₹)
- `veg dishes batao` (filters and returns only veg items)
- `offers kya hai` (shows active coupon details like `ROYAL10`)
- `table booking karni hai` (replies with table booking instructions and a link to the booking page)
- `mera order status kya hai` (checks MongoDB for orders matching your phone number and shows its status)
- `address kya hai` (shows Royal Bites Bhopal location details)
- `timing kya hai` (shows restaurant opening hours)
