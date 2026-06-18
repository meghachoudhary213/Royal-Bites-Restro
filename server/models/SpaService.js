const mongoose = require('mongoose');

const spaServiceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    category: { type: String, required: true, trim: true },
    duration: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String, default: '' },
    image: { type: String, default: '' },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('SpaService', spaServiceSchema);
