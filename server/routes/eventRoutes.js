const express = require('express');
const {
  getEventPackages,
  createEventBooking,
  getEventBookings,
  getMyEventBookings,
  updateEventBookingStatus,
  deleteEventBooking
} = require('../controllers/eventController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

const router = express.Router();

// Allow optional auth for public event booking requests
const optionalProtect = (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    return protect(req, res, next);
  }
  next();
};

router.get('/packages', getEventPackages);
router.post('/bookings', optionalProtect, createEventBooking);
router.get('/bookings', protect, getEventBookings);
router.get('/bookings/my-bookings', protect, getMyEventBookings);
router.patch('/bookings/:id/status', protect, updateEventBookingStatus);
router.delete('/bookings/:id', protect, adminOnly, deleteEventBooking);

module.exports = router;
