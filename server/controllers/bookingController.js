const Booking = require('../models/Booking');

const createBooking = async (req, res) => {
  try {
    const bookingData = { ...req.body };
    if (bookingData.email) {
      bookingData.email = bookingData.email.toLowerCase();
    }
    const booking = await Booking.create(bookingData);
    res.status(201).json({ success: true, data: booking });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const getBookings = async (req, res) => {
  try {
    let bookings;
    if (req.user && req.user.isAdmin) {
      bookings = await Booking.find().sort({ createdAt: -1 });
    } else if (req.user) {
      bookings = await Booking.find({ email: req.user.email.toLowerCase() }).sort({ createdAt: -1 });
    } else {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }
    res.json({ success: true, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getBookingById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!/^[0-9a-fA-F]{24}$/.test(id)) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    
    // Check authorization: Admin can see any booking, user can only see their own
    if (req.user.isAdmin || (booking.email && booking.email.toLowerCase() === req.user.email.toLowerCase())) {
      return res.json({ success: true, data: booking });
    }
    
    return res.status(403).json({ success: false, message: 'Not authorized to view this booking' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    if (!/^[0-9a-fA-F]{24}$/.test(id)) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    const { status } = req.body;
    const booking = await Booking.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    res.json({ success: true, data: booking });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const deleteBooking = async (req, res) => {
  try {
    const { id } = req.params;
    if (!/^[0-9a-fA-F]{24}$/.test(id)) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    const booking = await Booking.findByIdAndDelete(id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    res.json({ success: true, message: 'Booking deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createBooking,
  getBookings,
  getBookingById,
  updateBookingStatus,
  deleteBooking
};
