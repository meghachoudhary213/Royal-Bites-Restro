const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema(
  {
    roomNumber: { type: String, required: true, unique: true },
    roomType: {
      type: String,
      required: true,
      enum: ['Deluxe Room', 'Executive Room', 'Premium Suite', 'Presidential Suite']
    },
    status: {
      type: String,
      required: true,
      enum: ['Available', 'Reserved', 'Occupied', 'Maintenance', 'Cleaning'],
      default: 'Available'
    },
    price: { type: Number, required: true },
    bed: { type: String, required: true },
    capacity: { type: String, required: true },
    size: { type: String, required: true },
    image: { type: String, required: true },
    description: { type: String, required: true },
    amenities: [{ type: String }]
  },
  { timestamps: true }
);

module.exports = mongoose.model('Room', roomSchema);
