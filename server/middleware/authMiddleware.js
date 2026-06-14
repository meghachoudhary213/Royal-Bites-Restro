const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Extract token from bearer format
      token = req.headers.authorization.split(' ')[1];

      // Decode and verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'royalbites_jwt_secret_2026');

      // Fetch user and attach to request context, omit password hashes
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Not authorized, user not found' });
      }

      next();
    } catch (error) {
      console.error('JWT Verification Error:', error.message);
      return res.status(401).json({ success: false, message: 'Not authorized, token validation failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    return res.status(403).json({ success: false, message: 'Not authorized, admin privileges required' });
  }
};

module.exports = { protect, adminOnly };
