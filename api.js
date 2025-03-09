// api.js
const express = require('express');
const router = express.Router();

router.get('/ip', (req, res) => {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  res.json({ ip });
});

module.exports = router;
