const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const xssClean = require('xss-clean');
const mongoSanitize = require('express-mongo-sanitize');
const cookieParser = require('cookie-parser');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 8080; // Port 80 for HTTP

// Set security HTTP headers using Helmet
app.use(helmet());

// Rate limiting to prevent DoS attacks
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later',
});
app.use(limiter);

// Enable CORS for external API calls
app.use(cors());

// Sanitize data to prevent NoSQL injection and XSS attacks
app.use(mongoSanitize());
app.use(xssClean());

// Body parser to read data into req.body
app.use(express.json({ limit: '10kb' }));

// Cookie-parser middleware
app.use(cookieParser());

// Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views')); // Set the views directory

// Function to detect w3m requests
function isW3M(req) {
  const userAgent = req.headers['user-agent'];
  return userAgent && userAgent.toLowerCase().includes('w3m');
}

// Function to detect Lynx
function isLynx(req) {
  const userAgent = req.headers['user-agent'];
  return userAgent && userAgent.toLowerCase().includes('lynx');
}

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Function to detect curl requests
function isCurl(req) {
  const userAgent = req.headers['user-agent'];
  return userAgent && userAgent.includes('curl');
}

// Serve the install.sh script dynamically based on query parameter repo_id
app.get('/install.sh', (req, res) => {
    const repoId = req.query.repo_id;

    if (!repoId) {
        return res.status(400).send('Error: No repo_id provided.');
    }

    // Path to the install.sh script
    const scriptPath = path.join(__dirname, 'public/scripts/install.sh');

    // Make sure the file exists
    if (!fs.existsSync(scriptPath)) {
        return res.status(404).send('Error: install.sh not found.');
    }

    // Read the install.sh script and send it as a response with the correct content type
    res.setHeader('Content-Type', 'application/x-sh');
    fs.createReadStream(scriptPath).pipe(res);
});

// In-house IP address retrieval API
app.get('/ip', (req, res) => {
  //const userIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  const userIp = (req.headers['x-forwarded-for'] || req.connection.remoteAddress).split(',')[0].trim();

  // If request is made using curl, send a plain text response
  if (isCurl(req)) {
    res.setHeader('Content-Type', 'text/plain');
    res.send(`Public IP: ${userIp}\n`);
  } else {
    // request is made on browser, send simple HTML response
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" href="/style.css">
        <title>Public IP</title>
        <style>
          body {
            font-family: 'Courier New', Courier, monospace;
            background-color: #000;
            color: #fff;
            margin: 0;
            padding: 20px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
          }

          .ip-container {
            background-color: rgba(255, 255, 255, 0.05);
            border-radius: 10px;
            padding: 20px;
            text-align: center;
            width: fit-content;
            box-shadow: 0 6px 12px rgba(255, 255, 255, 0.2);
            transition: transform 0.3s ease, box-shadow 0.3s ease;
            cursor: pointer;
            margin: 20px 0;
          }

          .ip-container:hover {
            transform: scale(1.05);
            box-shadow: 0 8px 16px rgba(255, 255, 255, 0.3);
          }

          .ip-container p {
            font-size: 24px;
            color: #ff4081;
          }

          a {
            text-decoration: none;
            color: inherit;
          }
        </style>
      </head>
      <body>
        <!-- Clickable container that redirects to the homepage -->
        <a href="/">
          <div class="ip-container">
            <p>Public IP: ${userIp}</p>
          </div>
        </a>
      </body>
      </html>
    `);
  }
});

// Function to get the gradient title from logo.txt
function getGradientTitle() {
  const logoPath = path.join(__dirname, 'public', 'logo.txt'); // Ensure this points to where your file is located
  
  try {
    // Read the logo file containing pre-colored ANSI text
    const logo = fs.readFileSync(logoPath, 'utf8');
    return logo;
  } catch (error) {
    console.error('Error reading logo.txt:', error);
    return ''; // Return empty string if the file cannot be read
  }
}

function getDescription() {
  //return `\nx1b[90mKleinPanic\nLinux Projects and Utilities.\nhttps://kleinpanic.com\n\nGitHub: https://github.com/kleinpanic\x1b[0m`;
    return `
\x1b[90mKleinPanic\x1b[0m
\x1b[90mLinux Projs and Utils.\x1b[0m
\x1b[34mhttps://kleinpanic.com\x1b[0m

\x1b[90mGitHub:\x1b[0m \x1b[34mhttps://github.com/kleinpanic\x1b[0m
`;
}

// Function to color each table row
function getColoredTableRow(name, description, installCommand) {
  const nameColor = '\x1b[38;5;36m'; // Green for project name
  const descriptionColor = '\x1b[38;5;33m'; // Blue for description
  const installCommandColor = '\x1b[38;5;135m'; // Cyan for install command
  const resetColor = '\x1b[0m'; // Reset color

  return `| ${nameColor}${name}${resetColor} | ${descriptionColor}${description}${resetColor} | ${installCommandColor}${installCommand}${resetColor} |`;
}

const axios = require('axios');

// Serve the curl-specific route
app.get('/', async (req, res) => {
  if (isCurl(req)) {
    try {
      //const response = await axios.get('https://api.github.com/users/kleinpanic/repos');
      const response = await axios.get('https://api.github.com/users/kleinpanic/repos', {
        params: {
          per_page: 100, // Request up to 100 repositories
        }
      });
      const repos = response.data;

      // Function to truncate text with "..." if needed
      function truncateText(text, maxLength) {
        return text.length > maxLength ? text.slice(0, maxLength - 3) + '...' : text;
      }

      // Function to pad text for alignment
      function padText(text, length) {
        return text.padEnd(length, ' ');
      }
      
      // Combine title and description lines
      const titleLines = getGradientTitle().split('\n');
      const descriptionLines = getDescription().split('\n');

      // Combine title and description side by side line by line
      let combinedTitleDescription = '';
      for (let i = 0; i < titleLines.length || i < descriptionLines.length; i++) {
        const titleLine = titleLines[i] || '';  // Handle empty title lines
        const descriptionLine = descriptionLines[i] || ''; // Handle empty description lines
        combinedTitleDescription += `${titleLine}   ${descriptionLine}\n`; // Combine them
      }

      // Create the table headers with grey borders
      let tableHeader = `\x1b[90m+ ------------------------- + -------------------------------------- + ---------------------- +
| PROJECT NAME              | DESCRIPTION                            | INSTALL COMMAND        |
+ ------------------------- + -------------------------------------- + ---------------------- +\x1b[0m`;

      // Format the project list into the table rows with color
      const tableRows = repos.map((repo, index) => {
        const name = padText(truncateText(repo.name || 'Unknown', 25), 25);
        const description = padText(truncateText(repo.description || 'No description', 38), 38);

        // Add extra whitespace for the first 9 install commands
        const installCommand = index < 9
          ? padText(`/install.sh?repo_id=${index + 1} `, 20) // Adding a space at the end for alignment
          : padText(`/install.sh?repo_id=${index + 1}`, 20);

        return getColoredTableRow(name, description, installCommand);
      }).join('\n');

      // Create the table footer with last updated
      const tableFooter = `\x1b[90m+ ------------------------- + -------------------------------------- + ---------------------- +
Last updated: ${new Date().toUTCString()}\n\x1b[0m`; // Newline added at the end

      // Combine everything together
      const output = `
${combinedTitleDescription}
${tableHeader}
${tableRows}
${tableFooter}`;

      res.setHeader('Content-Type', 'text/plain');
      res.send(output);
    } catch (error) {
      res.status(500).send('Error fetching projects from GitHub.\n');
    }
  } else if (isW3M(req)) {
    res.sendFile(path.join(__dirname, 'views', 'w3m-index.html'));  // Serve w3m-specific index
  } else if (isLynx(req)) {
    res.sendFile(path.join(__dirname, 'views', 'lynx-index.html'));  // Serve Lynx-specific index
  } else {
    // Serve index.html for browser requests
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
  }
});


// Serve projects page with different views for w3m
app.get('/projects', (req, res) => {
  if (isW3M(req)) {
    res.sendFile(path.join(__dirname, 'views', 'w3m-projects.html'));  // Serve w3m-friendly HTML
  } else {
    res.sendFile(path.join(__dirname, 'views', 'projects.html'));      // Serve normal HTML for other browsers
  }
});


// Routes
const indexRoute = require('./routes/index');
const aboutRoute = require('./routes/about');
const projectsRoute = require('./routes/projects');
const blogRoute = require('./routes/blog');
const contactRoute = require('./routes/contact'); 
const monitorRoute = require('./routes/monitor'); 
const artRoute = require('./routes/art');

app.use('/', indexRoute);
app.use('/about', aboutRoute);
app.use('/projects', projectsRoute);
app.use('/blog', blogRoute);
app.use('/contact', contactRoute);
app.use('/monitor', monitorRoute); 
app.use('/art', artRoute);

// Error handling middleware for CSRF errors - ADD LATER AFTER FIXING PUBLIC JS ISSUES
app.use((err, req, res, next) => {
  if (err.code === 'EBADCSRFTOKEN') {
    res.status(403).send('Form tampered with.');
  } else {
    next(err);
  }
});

// Start the server on port 80
app.listen(port, () => {
  console.log(`Server running on http://kleinpanic.com`);
});
