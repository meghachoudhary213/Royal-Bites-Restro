const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  id: { type: String, unique: true },
  orderId: { type: String, required: true },
  customerName: { type: String, required: true },
  customerEmail: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  date: { type: String, required: true },
  dishName: { type: String, default: '' },
  items: [{ type: String }],
  featured: { type: Boolean, default: false },
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  }
}, {
  timestamps: true
});

ReviewSchema.pre('validate', function(next) {
  if (!this.id) {
    this.id = `REV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  }
  if (typeof next === 'function') {
    next();
  }
});

module.exports = mongoose.model('Review', ReviewSchema);
