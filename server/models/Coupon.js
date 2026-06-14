const mongoose = require('mongoose');

const CouponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true, trim: true },
  description: { type: String, required: true },
  discountType: { type: String, enum: ['percentage', 'flat', 'gift'], required: true },
  discountValue: { type: Number, required: true },
  minimumOrderAmount: { type: Number, default: 0 },
  maximumDiscount: { type: Number, default: 0 },
  expiryDate: { type: String, required: true },
  usageLimit: { type: Number, default: 50 },
  usageCount: { type: Number, default: 0 },
  active: { type: Boolean, default: true }
}, {
  timestamps: true
});

module.exports = mongoose.model('Coupon', CouponSchema);
