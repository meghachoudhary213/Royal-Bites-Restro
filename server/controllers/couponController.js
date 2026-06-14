const Coupon = require('../models/Coupon');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// @desc    Create a coupon
// @route   POST /api/coupons
// @access  Private (Admin only)
const createCoupon = async (req, res) => {
  try {
    const {
      code,
      description,
      discountType,
      discountValue,
      minimumOrderAmount,
      maximumDiscount,
      expiryDate,
      usageLimit
    } = req.body;

    if (!code || !description || !discountType || discountValue === undefined || !expiryDate) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields.' });
    }

    const uppercaseCode = code.trim().toUpperCase();
    const existingCoupon = await Coupon.findOne({ code: uppercaseCode });
    if (existingCoupon) {
      return res.status(400).json({ success: false, message: 'Coupon code already exists.' });
    }

    const coupon = await Coupon.create({
      code: uppercaseCode,
      description,
      discountType,
      discountValue: Number(discountValue),
      minimumOrderAmount: Number(minimumOrderAmount || 0),
      maximumDiscount: Number(maximumDiscount || 0),
      expiryDate,
      usageLimit: Number(usageLimit || 50),
      usageCount: 0,
      active: true
    });

    res.status(201).json({ success: true, data: coupon });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Get all coupons
// @route   GET /api/coupons
// @access  Public (Role filtered)
const getCoupons = async (req, res) => {
  try {
    let query = {};
    let isAdmin = false;

    // Optional admin authorization check
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'royalbites_jwt_secret_2026');
        const user = await User.findById(decoded.id);
        if (user && user.isAdmin) {
          isAdmin = true;
        }
      } catch (err) {
        // Token verification failed, treat as public user
      }
    }

    if (!isAdmin) {
      // Regular customers only see active coupons
      query.active = true;
      const today = new Date().toISOString().split('T')[0];
      query.expiryDate = { $gte: today };
    }

    const coupons = await Coupon.find(query).sort({ createdAt: -1 });
    res.json({ success: true, data: coupons });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get coupon by ID or Code
// @route   GET /api/coupons/:id
// @access  Public
const getCouponById = async (req, res) => {
  try {
    const param = req.params.id;
    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(param);
    
    let coupon = null;
    if (isValidObjectId) {
      coupon = await Coupon.findById(param);
    }
    if (!coupon) {
      coupon = await Coupon.findOne({ code: param.toUpperCase() });
    }

    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Coupon not found.' });
    }

    res.json({ success: true, data: coupon });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a coupon
// @route   PATCH /api/coupons/:id
// @access  Private (Admin only, or authenticated user for incrementing usage count during checkout)
const updateCoupon = async (req, res) => {
  try {
    const param = req.params.id;
    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(param);
    
    let coupon = null;
    if (isValidObjectId) {
      coupon = await Coupon.findById(param);
    }
    if (!coupon) {
      coupon = await Coupon.findOne({ code: param.toUpperCase() });
    }

    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Coupon not found.' });
    }

    const {
      description,
      discountType,
      discountValue,
      minimumOrderAmount,
      maximumDiscount,
      expiryDate,
      usageLimit,
      usageCount,
      active
    } = req.body;

    // Check authorization: Admin can update anything.
    // Non-admin can only increment usageCount (checkout flow).
    const isAdmin = req.user && req.user.isAdmin;
    
    if (isAdmin) {
      if (description !== undefined) coupon.description = description;
      if (discountType !== undefined) coupon.discountType = discountType;
      if (discountValue !== undefined) coupon.discountValue = Number(discountValue);
      if (minimumOrderAmount !== undefined) coupon.minimumOrderAmount = Number(minimumOrderAmount);
      if (maximumDiscount !== undefined) coupon.maximumDiscount = Number(maximumDiscount);
      if (expiryDate !== undefined) coupon.expiryDate = expiryDate;
      if (usageLimit !== undefined) coupon.usageLimit = Number(usageLimit);
      if (usageCount !== undefined) coupon.usageCount = Number(usageCount);
      if (active !== undefined) coupon.active = active;
    } else {
      // Non-admin (customer completing checkout) is only allowed to increment usageCount.
      if (usageCount !== undefined) {
        coupon.usageCount = Number(usageCount);
      } else {
        return res.status(403).json({ success: false, message: 'Not authorized to modify coupon configuration.' });
      }
    }

    await coupon.save();
    res.json({ success: true, data: coupon });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete a coupon
// @route   DELETE /api/coupons/:id
// @access  Private (Admin only)
const deleteCoupon = async (req, res) => {
  try {
    const param = req.params.id;
    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(param);
    
    let coupon = null;
    if (isValidObjectId) {
      coupon = await Coupon.findById(param);
    }
    if (!coupon) {
      coupon = await Coupon.findOne({ code: param.toUpperCase() });
    }

    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Coupon not found.' });
    }

    await Coupon.deleteOne({ _id: coupon._id });
    res.json({ success: true, message: 'Coupon deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Validate a coupon
// @route   POST /api/coupons/validate
// @access  Public
const validateCoupon = async (req, res) => {
  try {
    const { couponCode, orderAmount } = req.body;
    if (!couponCode || orderAmount === undefined) {
      return res.status(400).json({ success: false, message: 'couponCode and orderAmount are required.' });
    }

    const code = couponCode.trim().toUpperCase();
    const coupon = await Coupon.findOne({ code });

    if (!coupon) {
      return res.status(200).json({
        valid: false,
        discountAmount: 0,
        finalAmount: Number(orderAmount),
        message: 'Invalid coupon code.'
      });
    }

    if (!coupon.active) {
      return res.status(200).json({
        valid: false,
        discountAmount: 0,
        finalAmount: Number(orderAmount),
        message: 'This coupon is currently inactive.'
      });
    }

    const today = new Date().toISOString().split('T')[0];
    if (coupon.expiryDate && today > coupon.expiryDate) {
      return res.status(200).json({
        valid: false,
        discountAmount: 0,
        finalAmount: Number(orderAmount),
        message: 'This coupon has expired.'
      });
    }

    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      return res.status(200).json({
        valid: false,
        discountAmount: 0,
        finalAmount: Number(orderAmount),
        message: 'This coupon usage limit has been exceeded.'
      });
    }

    const amount = Number(orderAmount);
    if (amount < coupon.minimumOrderAmount) {
      return res.status(200).json({
        valid: false,
        discountAmount: 0,
        finalAmount: amount,
        message: `Min. spend of ₹${coupon.minimumOrderAmount} required.`
      });
    }

    // Calculate discount
    let discountAmount = 0;
    if (coupon.discountType === 'percentage') {
      discountAmount = amount * (coupon.discountValue / 100);
      if (coupon.maximumDiscount && discountAmount > coupon.maximumDiscount) {
        discountAmount = coupon.maximumDiscount;
      }
    } else if (coupon.discountType === 'flat') {
      discountAmount = coupon.discountValue;
    }

    discountAmount = Math.round(discountAmount * 100) / 100;
    const finalAmount = Math.max(0, amount - discountAmount);

    return res.json({
      valid: true,
      discountAmount,
      finalAmount,
      message: `Coupon "${coupon.code}" applied successfully!`
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createCoupon,
  getCoupons,
  getCouponById,
  updateCoupon,
  deleteCoupon,
  validateCoupon
};
