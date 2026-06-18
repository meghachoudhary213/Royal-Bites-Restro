const mongoose = require('mongoose');

const eventBookingSchema = new mongoose.Schema(
  {
    bookingId: { type: String, required: true, unique: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    guestName: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    eventType: { type: String, required: true },
    package: { type: String, required: true },
    eventDate: { type: String, required: true }, // YYYY-MM-DD
    guestCount: { type: Number, required: true },
    specialRequirements: { type: String, default: '' },
    totalAmount: { type: Number, required: true },
    status: {
      type: String,
      required: true,
      enum: ['Pending', 'Confirmed', 'Rejected', 'Completed', 'Cancelled'],
      default: 'Pending'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('EventBooking', eventBookingSchema);
