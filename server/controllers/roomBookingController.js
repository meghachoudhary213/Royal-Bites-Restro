const RoomBooking = require('../models/RoomBooking');
const Room = require('../models/Room');

// Helper to check room availability and assign first free physical room
const findAvailableRoom = async (roomType, checkIn, checkOut) => {
  // Find all physical rooms of that type that are not in Maintenance or Cleaning
  const rooms = await Room.find({
    roomType,
    status: { $nin: ['Maintenance', 'Cleaning'] }
  });

  if (!rooms || rooms.length === 0) {
    return { available: false, message: `No active rooms of type '${roomType}' available.` };
  }

  // Find all active room bookings that overlap with requested dates
  // Overlap condition: booking.checkIn < checkOut AND booking.checkOut > checkIn
  const overlappingBookings = await RoomBooking.find({
    roomType,
    status: { $in: ['Pending', 'Confirmed', 'CheckedIn'] },
    $and: [
      { checkIn: { $lt: checkOut } },
      { checkOut: { $gt: checkIn } }
    ]
  });

  const bookedRoomIds = overlappingBookings
    .map(b => b.room ? b.room.toString() : null)
    .filter(Boolean);

  // Filter out the rooms that are already booked
  const availableRooms = rooms.filter(r => !bookedRoomIds.includes(r._id.toString()));

  if (availableRooms.length === 0) {
    return { 
      available: false, 
      message: `No availability for ${roomType} between ${checkIn} and ${checkOut}.` 
    };
  }

  return { available: true, room: availableRooms[0] };
};

// @desc    Create a new room reservation
// @route   POST /api/room-bookings
// @access  Public
const createRoomBooking = async (req, res) => {
  try {
    const { 
      roomType, guestName, phone, email, checkIn, checkOut, guests, specialRequests 
    } = req.body;

    if (!roomType || !guestName || !phone || !email || !checkIn || !checkOut || !guests) {
      return res.status(400).json({ success: false, message: 'All booking fields are required.' });
    }

    // Parse dates to calculate total days
    const date1 = new Date(checkIn);
    const date2 = new Date(checkOut);
    const diffTime = Math.abs(date2 - date1);
    const diffDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

    // Verify room type configuration in default rooms data to get correct price and metadata
    const roomInfo = await Room.findOne({ roomType });
    if (!roomInfo) {
      return res.status(404).json({ success: false, message: `Room type ${roomType} not configured.` });
    }

    // Validate availability
    const availResult = await findAvailableRoom(roomType, checkIn, checkOut);
    if (!availResult.available) {
      return res.status(409).json({ success: false, message: availResult.message });
    }

    const assignedRoom = availResult.room;
    const roomPrice = roomInfo.price;
    const totalPrice = roomPrice * diffDays;

    // Generate Unique Booking ID: RGB-YYYYMMDD-XXXX
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const rand = Math.floor(1000 + Math.random() * 9000);
    const bookingId = `RGB-${dateStr}-${rand}`;

    const newBooking = new RoomBooking({
      bookingId,
      user: req.user ? req.user._id : null,
      room: assignedRoom._id,
      roomType,
      guestName,
      phone,
      email,
      checkIn,
      checkOut,
      guests,
      specialRequests: specialRequests || '',
      totalPrice,
      roomPrice,
      image: roomInfo.image,
      roomName: roomInfo.roomType,
      status: 'Pending'
    });

    await newBooking.save();

    res.status(201).json({ success: true, data: newBooking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all room reservations (Admin gets all, User gets their matching email list)
// @route   GET /api/room-bookings
// @access  Private
const getRoomBookings = async (req, res) => {
  try {
    let bookings;
    if (req.user && req.user.isAdmin) {
      bookings = await RoomBooking.find({}).populate('room').sort({ createdAt: -1 });
    } else if (req.user) {
      bookings = await RoomBooking.find({ email: req.user.email }).populate('room').sort({ createdAt: -1 });
    } else {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    res.status(200).json({ success: true, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get logged in user's room reservations
// @route   GET /api/room-bookings/my-bookings
// @access  Private
const getMyRoomBookings = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }
    const bookings = await RoomBooking.find({ email: req.user.email }).populate('room').sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update room reservation status & trigger dynamic room status changes
// @route   PATCH /api/room-bookings/:id/status
// @access  Private/Admin
const updateRoomBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ success: false, message: 'Status is required' });
    }

    const booking = await RoomBooking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Reservation not found' });
    }

    booking.status = status;
    await booking.save();

    // Trigger physical Room status changes dynamically
    if (booking.room) {
      const room = await Room.findById(booking.room);
      if (room) {
        if (status === 'CheckedIn') {
          room.status = 'Occupied';
          await room.save();
        } else if (status === 'CheckedOut') {
          room.status = 'Cleaning'; // Marked as cleaning, admin can set it back to Available later
          await room.save();
        } else if (status === 'Confirmed') {
          room.status = 'Reserved';
          await room.save();
        } else if (status === 'Cancelled' || status === 'Rejected') {
          room.status = 'Available';
          await room.save();
        }
      }
    }

    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createRoomBooking,
  getRoomBookings,
  getMyRoomBookings,
  updateRoomBookingStatus
};
