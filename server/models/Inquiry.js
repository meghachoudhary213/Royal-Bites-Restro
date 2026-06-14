const mongoose = require('mongoose');

const inquirySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, trim: true, default: '' },
    orderType: {
      type: String,
      enum: ['dine-in', 'takeaway', 'delivery', 'catering'],
      default: 'dine-in',
    },
    items: { type: String, required: true },
    message: { type: String, default: '' },
    status: {
      type: String,
      enum: ['new', 'in-progress', 'completed'],
      default: 'new',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Inquiry', inquirySchema);
