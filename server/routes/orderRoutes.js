const express = require('express');
const { 
  createOrder, 
  getOrders, 
  updateOrderStatus, 
  deleteOrder,
  createRazorpayOrder,
  verifyRazorpayPayment
} = require('../controllers/orderController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, createOrder);
router.get('/', protect, getOrders);
router.patch('/:id/status', protect, adminOnly, updateOrderStatus);
router.delete('/:id', protect, adminOnly, deleteOrder);

// Razorpay Payment Endpoints
router.post('/razorpay', protect, createRazorpayOrder);
router.post('/razorpay/verify', protect, verifyRazorpayPayment);

module.exports = router;
