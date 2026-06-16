const mongoose = require('mongoose');

const OrderItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true }
});

const OrderSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  date: { type: String, required: true },
  customerName: { type: String, required: true },
  customerPhone: { type: String, required: true },
  customerEmail: { type: String, required: true },
  address: { type: String, default: '' },
  landmark: { type: String, default: '' },
  city: { type: String, default: '' },
  pincode: { type: String, default: '' },
  items: [OrderItemSchema],
  subtotal: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  coupon: { type: String, default: 'None' },
  hasGift: { type: Boolean, default: false },
  gst: { type: Number, required: true },
  deliveryCharge: { type: Number, required: true },
  total: { type: Number, required: true },
  orderType: { type: String, enum: ['Delivery', 'Pickup', 'Dine In'], required: true },
  paymentMethod: { type: String, required: true },
  specialInstructions: { type: String, default: '' },
  estimatedTime: { type: String, default: '' },
  status: { 
    type: String, 
    enum: ['Order Received', 'Preparing', 'Ready', 'Out For Delivery', 'Delivered', 'Cancelled'],
    default: 'Order Received'
  },
  razorpayOrderId: { type: String, default: '' },
  razorpayPaymentId: { type: String, default: '' },
  razorpaySignature: { type: String, default: '' },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Paid', 'Failed'],
    default: 'Pending'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Order', OrderSchema);
