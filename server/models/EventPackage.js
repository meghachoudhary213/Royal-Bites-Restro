const mongoose = require('mongoose');

const eventPackageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    category: {
      type: String,
      required: true,
      enum: ['Wedding', 'Birthday', 'Corporate', 'Conference']
    },
    description: { type: String, required: true },
    capacity: { type: Number, required: true },
    price: { type: Number, required: true },
    image: { type: String, required: true },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('EventPackage', eventPackageSchema);
