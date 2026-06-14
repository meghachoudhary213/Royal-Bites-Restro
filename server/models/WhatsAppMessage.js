const mongoose = require('mongoose');

const WhatsAppMessageSchema = new mongoose.Schema({
  from: { type: String, required: true }, // e.g. 'whatsapp:+919691832020'
  to: { type: String, required: true }, // e.g. 'whatsapp:+14155238886'
  body: { type: String, required: true },
  direction: { type: String, enum: ['inbound', 'outbound'], required: true },
  timestamp: { type: Date, default: Date.now }
}, {
  timestamps: true
});

module.exports = mongoose.model('WhatsAppMessage', WhatsAppMessageSchema);
