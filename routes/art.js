const express = require('express');
const router = express.Router();
const path = require('path');

// Route to serve the art page
router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../views/art.html'));
});

module.exports = router;
