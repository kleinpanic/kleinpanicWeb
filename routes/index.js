const express = require('express');
const router = express.Router();
const path = require('path');

// Function to detect curl requests
function isCurl(req) {
  const userAgent = req.headers['user-agent'];
  return userAgent && userAgent.includes('curl');
}

// Serve index.html for browser requests or plain text for curl
router.get('/', (req, res) => {
  if (isCurl(req)) {
    res.type('text/plain');
    res.send(`
 _  ___      _       _____            _      
| |/ / |    (_)     |  __ \\          (_)     
| ' /| | ___ _ _ __ | |__) |_ _ _ __  _  ___ 
|  < | |/ _ \\ | '_ \\|  ___/ _\` | '_ \\| |/ __|
| . \\| |  __/ | | | | |  | (_| | | | | | (__ 
|_|\\_\\_|\\___|_|_| |_|_|   \\__,_|_| |_|_|\\___|

My Awesome Website

Source: https://github.com/your-username/your-repo

+ ------------------------- + -------------------------------------- + -------------------- +
| TITLE                     | DESCRIPTION                            | VIDEO                |
+ ------------------------- + -------------------------------------- + -------------------- +
|                           |                                        |                      |
|                           |                                        |                      |
|                           |                                        |                      |
|                           |                                        |                      |
+ ------------------------- + -------------------------------------- + -------------------- +

last updated: ${new Date().toUTCString()}
    `);
  } else {
    // Render HTML for normal browser requests
    res.sendFile(path.join(__dirname, '../views/index.html'));
  }
});

module.exports = router;
