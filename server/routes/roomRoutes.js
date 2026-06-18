const express = require('express');
const { getRooms, updateRoomStatus } = require('../controllers/roomController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', getRooms);
router.patch('/:id/status', protect, adminOnly, updateRoomStatus);

module.exports = router;
