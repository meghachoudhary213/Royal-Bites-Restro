const express = require('express');
const { 
  createBooking, 
  getBookings, 
  getBookingById,
  updateBookingStatus, 
  deleteBooking 
} = require('../controllers/bookingController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', createBooking);
router.get('/', protect, getBookings);
router.get('/:id', protect, getBookingById);
router.patch('/:id/status', protect, adminOnly, updateBookingStatus);
router.delete('/:id', protect, adminOnly, deleteBooking);

module.exports = router;
