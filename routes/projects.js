const express = require('express');
const router = express.Router();
const axios = require('axios');
const path = require('path');

// Route for /projects page
router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../views/projects.html'));
});

// Route for fetching GitHub projects dynamically via JavaScript
router.get('/fetch', async (req, res) => {
  const page = req.query.page || 1;
  const per_page = req.query.per_page || 100; // Maximum is 100 items per page

  try {
    // Fetch user's GitHub repositories with pagination
    const response = await axios.get(`https://api.github.com/users/kleinpanic/repos`, {
      params: {
        page,
        per_page,
      },
    });

    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Unable to fetch GitHub repositories.' });
  }
});

module.exports = router;
