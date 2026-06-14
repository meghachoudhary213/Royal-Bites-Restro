require('dotenv').config();
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');
try {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (err) {
  console.warn('DNS setServers failed:', err.message);
}
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Route imports
const authRoutes = require('./routes/authRoutes');
const orderRoutes = require('./routes/orderRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const couponRoutes = require('./routes/couponRoutes');
const menuRoutes = require('./routes/menuRoutes');
const inquiryRoutes = require('./routes/inquiries');
const whatsappRoutes = require('./routes/whatsappRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5000',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (
      origin.startsWith('http://localhost:') ||
      origin.startsWith('http://127.0.0.1:') ||
      allowedOrigins.includes(origin) ||
      allowedOrigins.includes('*') ||
      process.env.FRONTEND_URL === '*'
    ) {
      return callback(null, true);
    }
    if (origin.endsWith('.onrender.com')) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API health endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    message: 'Royal Bites API is running',
    whatsapp: process.env.WHATSAPP_NUMBER || '9691832020',
  });
});

// Route Mounts
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/inquiries', inquiryRoutes);
app.use('/api/whatsapp', whatsappRoutes);

app.listen(PORT, () => {
  console.log(`Royal Bites server running on port ${PORT}`);
});
