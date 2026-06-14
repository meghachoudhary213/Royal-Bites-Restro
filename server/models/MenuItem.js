const mongoose = require('mongoose');

const MenuItemSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  category: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  price: { type: Number, required: true },
  image: { type: String, default: '/menu/paneer-tikka.jpg' },
  tag: { type: String, default: '' },
  rating: { type: Number, default: 4.8 },
  isVeg: { type: Boolean, default: true },
  available: { type: Boolean, default: true },
  popular: { type: Boolean, default: false }
}, {
  timestamps: true
});

module.exports = mongoose.model('MenuItem', MenuItemSchema);
