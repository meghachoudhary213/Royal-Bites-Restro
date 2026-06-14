const express = require('express');

const router = express.Router();

router.post('/login', (req, res) => {
  const { password } = req.body;
  const adminPassword = process.env.ADMIN_PASSWORD || 'royalbites2026';

  if (password === adminPassword) {
    return res.json({ success: true, token: adminPassword });
  }

  res.status(401).json({ success: false, message: 'Invalid credentials' });
});

module.exports = router;
