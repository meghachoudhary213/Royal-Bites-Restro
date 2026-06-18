const SpaService = require('../models/SpaService');
const SpaBooking = require('../models/SpaBooking');

// @desc    Get all active spa services
// @route   GET /api/spa/services
// @access  Public
const getSpaServices = async (req, res) => {
  try {
    const services = await SpaService.find({ isActive: true });
    res.status(200).json({ success: true, data: services });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a new spa appointment booking
// @route   POST /api/spa/bookings
// @access  Public
const createSpaBooking = async (req, res) => {
  try {
    const {
      guestName,
      phone,
      email,
      service,
      appointmentDate,
      appointmentTime,
      therapistPreference,
      specialRequests
    } = req.body;

    if (!guestName || !phone || !email || !service || !appointmentDate || !appointmentTime) {
      return res.status(400).json({ success: false, message: 'All required booking fields must be filled.' });
    }

    // Validate that appointment date is not in the past (using local date components to avoid UTC timezone shift)
    const dateParts = appointmentDate.split('-');
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
      return res.status(400).json({ success: false, message: 'Cannot book appointments in the past.' });
    }

    // Retrieve service to get the correct price
    const serviceDetails = await SpaService.findOne({ name: service });
    if (!serviceDetails) {
      return res.status(404).json({ success: false, message: `Spa service '${service}' not found.` });
    }

    // Generate Unique Appointment ID: SPA-YYYYMMDD-XXXX
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const rand = Math.floor(1000 + Math.random() * 9000);
    const appointmentId = `SPA-${dateStr}-${rand}`;

    const newBooking = new SpaBooking({
      appointmentId,
      user: req.user ? req.user._id : null,
      guestName,
      phone,
      email,
      service,
      appointmentDate,
      appointmentTime,
      therapistPreference: therapistPreference || 'None',
      specialRequests: specialRequests || '',
      status: 'Pending',
      totalAmount: serviceDetails.price
    });

    await newBooking.save();

    res.status(201).json({ success: true, data: newBooking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all spa appointments (Admin gets all, User gets their matching email list)
// @route   GET /api/spa/bookings
// @access  Private
const getSpaBookings = async (req, res) => {
  try {
    let bookings;
    if (req.user && req.user.isAdmin) {
      bookings = await SpaBooking.find({}).sort({ createdAt: -1 });
    } else if (req.user) {
      bookings = await SpaBooking.find({ email: req.user.email }).sort({ createdAt: -1 });
    } else {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    res.status(200).json({ success: true, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get logged in user's spa appointments
// @route   GET /api/spa/bookings/my-bookings
// @access  Private
const getMySpaBookings = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }
    const bookings = await SpaBooking.find({ email: req.user.email }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update spa appointment status (and date/time if rescheduled)
// @route   PATCH /api/spa/bookings/:id/status
// @access  Private
const updateSpaBookingStatus = async (req, res) => {
  try {
    const { status, appointmentDate, appointmentTime } = req.body;
    if (!status) {
      return res.status(400).json({ success: false, message: 'Status is required' });
    }

    const booking = await SpaBooking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Spa appointment not found' });
    }

    booking.status = status;

    if (status === 'Rescheduled') {
      if (appointmentDate) {
        // Validate date (using local date components to avoid UTC timezone shift)
        const dateParts = appointmentDate.split('-');
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
          return res.status(400).json({ success: false, message: 'Cannot reschedule appointments to a past date.' });
        }
        booking.appointmentDate = appointmentDate;
      }
      if (appointmentTime) {
        booking.appointmentTime = appointmentTime;
      }
    }

    await booking.save();

    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a spa appointment
// @route   DELETE /api/spa/bookings/:id
// @access  Private/Admin
const deleteSpaBooking = async (req, res) => {
  try {
    const booking = await SpaBooking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Spa appointment not found' });
    }

    await SpaBooking.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Spa appointment deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getSpaServices,
  createSpaBooking,
  getSpaBookings,
  getMySpaBookings,
  updateSpaBookingStatus,
  deleteSpaBooking
};
