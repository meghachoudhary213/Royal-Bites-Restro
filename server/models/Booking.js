const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    guests: { type: Number, required: true, min: 1, max: 20 },
    occasion: { type: String, default: 'Dining' },
    specialRequests: { type: String, default: '' },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'seated', 'completed', 'cancelled'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Booking', bookingSchema);
