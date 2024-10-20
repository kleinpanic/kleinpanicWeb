const express = require('express');
const router = express.Router();
const path = require('path');

// Serve about.html
router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../views/about.html'));
});

module.exports = router;