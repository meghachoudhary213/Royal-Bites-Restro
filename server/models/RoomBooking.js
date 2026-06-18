const mongoose = require('mongoose');

const roomBookingSchema = new mongoose.Schema(
  {
    bookingId: { type: String, required: true, unique: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room' },
    roomType: {
      type: String,
      required: true,
      enum: ['Deluxe Room', 'Executive Room', 'Premium Suite', 'Presidential Suite']
    },
    guestName: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    checkIn: { type: String, required: true },  // YYYY-MM-DD
    checkOut: { type: String, required: true }, // YYYY-MM-DD
    guests: { type: Number, required: true },
    specialRequests: { type: String, default: '' },
    status: {
      type: String,
      required: true,
      enum: ['Pending', 'Confirmed', 'CheckedIn', 'CheckedOut', 'Cancelled', 'Rejected'],
      default: 'Pending'
    },
    totalPrice: { type: Number, required: true },
    roomPrice: { type: Number, required: true },
    image: { type: String },
    roomName: { type: String }
  },
  { timestamps: true }
);

module.exports = mongoose.model('RoomBooking', roomBookingSchema);
