const express = require('express');
const {
  getSpaServices,
  createSpaBooking,
  getSpaBookings,
  getMySpaBookings,
  updateSpaBookingStatus,
  deleteSpaBooking
} = require('../controllers/spaController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

const router = express.Router();

// Allow optional auth for public spa booking requests
const optionalProtect = (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    return protect(req, res, next);
  }
  next();
};

router.get('/services', getSpaServices);
router.post('/bookings', optionalProtect, createSpaBooking);
router.get('/bookings', protect, getSpaBookings);
router.get('/bookings/my-bookings', protect, getMySpaBookings);
router.patch('/bookings/:id/status', protect, updateSpaBookingStatus);
router.delete('/bookings/:id', protect, adminOnly, deleteSpaBooking);

module.exports = router;
