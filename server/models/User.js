const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const SavedAddressSchema = new mongoose.Schema({
  label: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  pincode: { type: String, required: true }
});

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },
  address: { type: String, default: '' },
  registrationDate: { type: String, default: () => new Date().toISOString().split('T')[0] },
  savedAddresses: [SavedAddressSchema],
  favouriteDishes: [{ type: String }],
  isAdmin: { type: Boolean, default: false }
}, {
  timestamps: true
});

// Hash password before saving to db
UserSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
