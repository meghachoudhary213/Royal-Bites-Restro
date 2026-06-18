const express = require('express');
const { 
  createRoomBooking, 
  getRoomBookings, 
  getMyRoomBookings, 
  updateRoomBookingStatus 
} = require('../controllers/roomBookingController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

const router = express.Router();

// Allow optional auth for public room reservation requests
const optionalProtect = (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    return protect(req, res, next);
  }
  next();
};

router.post('/', optionalProtect, createRoomBooking);
router.get('/', protect, getRoomBookings);
router.get('/my-bookings', protect, getMyRoomBookings);
router.patch('/:id/status', protect, adminOnly, updateRoomBookingStatus);

module.exports = router;
