const express = require('express');
const { handleIncomingMessage } = require('../controllers/whatsappController');
const router = express.Router();

// Webhook endpoint for Twilio incoming WhatsApp messages
router.post('/incoming', handleIncomingMessage);

module.exports = router;
