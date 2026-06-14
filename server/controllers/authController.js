const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Helper to sign JWTs
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'royalbites_jwt_secret_2026', {
    expiresIn: '30d'
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({ success: false, message: 'Please enter all required fields' });
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    // Auto-promote admin@royalbites.com to admin
    const isAdmin = email.toLowerCase() === 'admin@royalbites.com';

    const user = await User.create({
      name,
      email,
      phone,
      password,
      isAdmin
    });

    if (user) {
      res.status(201).json({
        success: true,
        token: generateToken(user._id),
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          address: user.address,
          registrationDate: user.registrationDate,
          savedAddresses: user.savedAddresses,
          favouriteDishes: user.favouriteDishes,
          isAdmin: user.isAdmin
        }
      });
    } else {
      res.status(400).json({ success: false, message: 'Invalid user data' });
    }
  } catch (error) {
    console.error('Registration Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Admin login compatibility (password-only payload from Vite frontend)
    if (!email && password) {
      const adminPassword = process.env.ADMIN_PASSWORD || 'royalbites2026';
      if (password === adminPassword) {
        let adminUser = await User.findOne({ email: 'admin@royalbites.com' });
        if (!adminUser) {
          adminUser = await User.create({
            name: 'Royal Bites Admin',
            email: 'admin@royalbites.com',
            phone: '0000000000',
            password: adminPassword,
            isAdmin: true
          });
        }
        return res.json({
          success: true,
          token: generateToken(adminUser._id),
          user: {
            _id: adminUser._id,
            name: adminUser.name,
            email: adminUser.email,
            phone: adminUser.phone,
            isAdmin: adminUser.isAdmin
          }
        });
      }
      return res.status(401).json({ success: false, message: 'Invalid admin credentials' });
    }

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please enter email and password' });
    }

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        success: true,
        token: generateToken(user._id),
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          address: user.address,
          registrationDate: user.registrationDate,
          savedAddresses: user.savedAddresses,
          favouriteDishes: user.favouriteDishes,
          isAdmin: user.isAdmin
        }
      });
    } else {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('Login Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      res.json({
        success: true,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          address: user.address,
          registrationDate: user.registrationDate,
          savedAddresses: user.savedAddresses,
          favouriteDishes: user.favouriteDishes,
          isAdmin: user.isAdmin
        }
      });
    } else {
      res.status(404).json({ success: false, message: 'User not found' });
    }
  } catch (error) {
    console.error('Profile Retrieval Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile
};
