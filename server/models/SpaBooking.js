const mongoose = require('mongoose');

const spaBookingSchema = new mongoose.Schema(
  {
    appointmentId: { type: String, required: true, unique: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    guestName: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    service: { type: String, required: true },
    appointmentDate: { type: String, required: true }, // YYYY-MM-DD
    appointmentTime: { type: String, required: true }, // HH:MM
    therapistPreference: { type: String, default: 'None' }, // None, Male, Female
    specialRequests: { type: String, default: '' },
    status: {
      type: String,
      required: true,
      enum: ['Pending', 'Confirmed', 'Rejected', 'Rescheduled', 'Completed', 'Cancelled'],
      default: 'Pending'
    },
    totalAmount: { type: Number, required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('SpaBooking', spaBookingSchema);
