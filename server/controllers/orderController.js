const Order = require('../models/Order');
const Razorpay = require('razorpay');
const crypto = require('crypto');

let razorpay;
try {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_dummyId2026',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummySecret2026'
  });
} catch (err) {
  console.warn('Failed to initialize Razorpay SDK. Placeholder keys or invalid credentials.', err.message);
}

// @desc    Create a new order
// @route   POST /api/orders
// @access  Private
const createOrder = async (req, res) => {
  try {
    const orderData = req.body;
    
    // Auto-associate with the authenticated user's email if available
    if (req.user) {
      orderData.customerEmail = req.user.email;
    }

    const order = await Order.create(orderData);
    res.status(201).json({ success: true, data: order });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Get orders
// @route   GET /api/orders
// @access  Private (Admins see all orders, customers see their own)
const getOrders = async (req, res) => {
  try {
    let orders;
    
    if (req.user && req.user.isAdmin) {
      orders = await Order.find().sort({ createdAt: -1 });
    } else if (req.user) {
      orders = await Order.find({ customerEmail: req.user.email }).sort({ createdAt: -1 });
    } else {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    res.json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update order status
// @route   PATCH /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findOneAndUpdate(
      { id: req.params.id },
      { status },
      { new: true, runValidators: true }
    );

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.json({ success: true, data: order });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete order
// @route   DELETE /api/orders/:id
// @access  Private/Admin
const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findOneAndDelete({ id: req.params.id });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.json({ success: true, message: 'Order deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createRazorpayOrder = async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid order amount.' });
    }

    const options = {
      amount: Math.round(amount * 100),
      currency: 'INR',
      receipt: `rcpt_${Date.now()}`
    };

    if (process.env.RAZORPAY_KEY_ID === 'rzp_test_dummyId2026' || !razorpay) {
      const mockOrder = {
        id: `order_mock_${Math.floor(Math.random() * 900000) + 100000}`,
        entity: 'order',
        amount: options.amount,
        amount_paid: 0,
        amount_due: options.amount,
        currency: 'INR',
        receipt: options.receipt,
        status: 'created',
        attempts: 0,
        notes: [],
        created_at: Math.floor(Date.now() / 1000),
        isMock: true
      };
      return res.status(201).json({ success: true, data: mockOrder, key: process.env.RAZORPAY_KEY_ID || 'rzp_test_dummyId2026' });
    }

    const order = await razorpay.orders.create(options);
    res.status(201).json({ success: true, data: order, key: process.env.RAZORPAY_KEY_ID });
  } catch (error) {
    console.error('Razorpay Order Creation Error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

const verifyRazorpayPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderDetails } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !orderDetails) {
      return res.status(400).json({ success: false, message: 'Missing payment details.' });
    }

    let isSignatureValid = false;

    if (razorpay_order_id.startsWith('order_mock_')) {
      isSignatureValid = true;
    } else {
      const secret = process.env.RAZORPAY_KEY_SECRET || 'dummySecret2026';
      const generated_signature = crypto
        .createHmac('sha256', secret)
        .update(razorpay_order_id + '|' + razorpay_payment_id)
        .digest('hex');

      isSignatureValid = generated_signature === razorpay_signature;
    }

    if (!isSignatureValid) {
      return res.status(400).json({ success: false, message: 'Payment verification failed. Invalid signature.' });
    }

    const newOrderData = {
      ...orderDetails,
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      paymentStatus: 'Paid',
      status: 'Order Received'
    };

    if (req.user) {
      newOrderData.customerEmail = req.user.email;
    }

    const order = await Order.create(newOrderData);
    res.status(201).json({ success: true, data: order });
  } catch (error) {
    console.error('Razorpay Verification Error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createOrder,
  getOrders,
  updateOrderStatus,
  deleteOrder,
  createRazorpayOrder,
  verifyRazorpayPayment
};
