const express = require('express');
const { 
  createCoupon,
  getCoupons,
  getCouponById,
  updateCoupon,
  deleteCoupon,
  validateCoupon
} = require('../controllers/couponController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, adminOnly, createCoupon);
router.get('/', getCoupons);
router.post('/validate', validateCoupon);
router.get('/:id', getCouponById);
router.patch('/:id', protect, updateCoupon);
router.delete('/:id', protect, adminOnly, deleteCoupon);

module.exports = router;
