const EventPackage = require('../models/EventPackage');
const EventBooking = require('../models/EventBooking');

// @desc    Get all active event packages
// @route   GET /api/events/packages
// @access  Public
const getEventPackages = async (req, res) => {
  try {
    const packages = await EventPackage.find({ isActive: true });
    res.status(200).json({ success: true, data: packages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a new event/banquet booking
// @route   POST /api/events/bookings
// @access  Public
const createEventBooking = async (req, res) => {
  try {
    const {
      guestName,
      phone,
      email,
      eventType,
      package: packageName,
      eventDate,
      guestCount,
      specialRequirements
    } = req.body;

    if (!guestName || !phone || !email || !eventType || !packageName || !eventDate || !guestCount) {
      return res.status(400).json({ success: false, message: 'All required booking fields must be filled.' });
    }

    // Validate that event date is not in the past (using local date components to avoid UTC timezone shift)
    const dateParts = eventDate.split('-');
    if (dateParts.length !== 3) {
      return res.status(400).json({ success: false, message: 'Invalid date format. Expected YYYY-MM-DD.' });
    }
    const bookingYear = parseInt(dateParts[0], 10);
    const bookingMonth = parseInt(dateParts[1], 10);
    const bookingDay = parseInt(dateParts[2], 10);

    const today = new Date();
    const todayYear = today.getFullYear();
    const todayMonth = today.getMonth() + 1;
    const todayDay = today.getDate();

    if (
      bookingYear < todayYear ||
      (bookingYear === todayYear && bookingMonth < todayMonth) ||
      (bookingYear === todayYear && bookingMonth === todayMonth && bookingDay < todayDay)
    ) {
      return res.status(400).json({ success: false, message: 'Cannot book event dates in the past.' });
    }

    // Retrieve package to get price and capacity check
    const packageDetails = await EventPackage.findOne({ name: packageName });
    if (!packageDetails) {
      return res.status(404).json({ success: false, message: `Event package '${packageName}' not found.` });
    }

    // Capacity validation
    if (Number(guestCount) > packageDetails.capacity) {
      return res.status(400).json({
        success: false,
        message: `Guest count (${guestCount}) exceeds the maximum capacity of ${packageDetails.capacity} for this package.`
      });
    }

    // Generate Unique Booking ID: EVT-YYYYMMDD-XXXX
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const rand = Math.floor(1000 + Math.random() * 9000);
    const bookingId = `EVT-${dateStr}-${rand}`;

    const newBooking = new EventBooking({
      bookingId,
      user: req.user ? req.user._id : null,
      guestName,
      phone,
      email,
      eventType,
      package: packageName,
      eventDate,
      guestCount: Number(guestCount),
      specialRequirements: specialRequirements || '',
      status: 'Pending',
      totalAmount: packageDetails.price
    });

    await newBooking.save();

    res.status(201).json({ success: true, data: newBooking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all event bookings (Admin gets all, User gets their matching email list)
// @route   GET /api/events/bookings
// @access  Private
const getEventBookings = async (req, res) => {
  try {
    let bookings;
    if (req.user && req.user.isAdmin) {
      bookings = await EventBooking.find({}).sort({ createdAt: -1 });
    } else if (req.user) {
      bookings = await EventBooking.find({ email: req.user.email }).sort({ createdAt: -1 });
    } else {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    res.status(200).json({ success: true, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get logged in user's event bookings
// @route   GET /api/events/bookings/my-bookings
// @access  Private
const getMyEventBookings = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }
    const bookings = await EventBooking.find({ email: req.user.email }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update event booking status
// @route   PATCH /api/events/bookings/:id/status
// @access  Private
const updateEventBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ success: false, message: 'Status is required' });
    }

    const booking = await EventBooking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Event booking not found' });
    }

    booking.status = status;
    await booking.save();

    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete an event booking
// @route   DELETE /api/events/bookings/:id
// @access  Private/Admin
const deleteEventBooking = async (req, res) => {
  try {
    const booking = await EventBooking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Event booking not found' });
    }

    await EventBooking.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Event booking deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getEventPackages,
  createEventBooking,
  getEventBookings,
  getMyEventBookings,
  updateEventBookingStatus,
  deleteEventBooking
};
