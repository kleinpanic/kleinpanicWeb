const express = require('express');
const router = express.Router();
const path = require('path');
const nodemailer = require('nodemailer');
const rateLimit = require('express-rate-limit');
const fs = require('fs');
require('dotenv').config(); // Load environment variables

// Define the log file path
const logFilePath = path.join(__dirname, '../stderr.log');

// Helper function to log errors to stderr.log
function logError(message) {
  const logMessage = `${new Date().toISOString()} - ${message}\n`;
  fs.appendFile(logFilePath, logMessage, (err) => {
    if (err) {
      console.error('Error writing to stderr.log:', err);
    }
  });
}

// Nodemailer setup using environment variables
const transporter = nodemailer.createTransport({
  service: 'gmail', // Use your email service (like Gmail, Outlook, etc.)
  auth: {
    user: process.env.EMAIL_USER, // Fetch email from environment variable
    pass: process.env.EMAIL_PASSWORD // Fetch password from environment variable
  }
});

// Rate limiter to allow only one submission per 24 hours per IP
const contactFormLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 1, // Limit each IP to 1 request per window
  message: 'You have already submitted a message. Please try again after 24 hours.'
});

// Route to serve the contact page
router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../views/contact.html'));
});

// Route to handle form submissions
router.post('/submit-contact-form', contactFormLimiter, (req, res) => {
  const { name, email, message } = req.body;

  // Backend validation for the form fields
  if (!name || !email || !message) {
    logError('Form submission failed: Missing fields.');
    return res.status(400).json({ success: false, message: 'All fields are required.' });
  }

  // Check if environment variables are set
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    logError('Error: EMAIL_USER or EMAIL_PASSWORD environment variables not set.');
    return res.status(500).json({ success: false, message: 'Server configuration error: Environment variables not set.' });
  }

  // Email options for sending the message
  const mailOptions = {
    from: email, // Sender's email
    to: process.env.EMAIL_USER, // Your email where you'll receive messages
    subject: `New Contact Form Submission from ${name}`,
    text: `You have received a new message from ${name} (${email}):\n\n${message}`
  };

  // Send the email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      logError(`Error sending email: ${error.message}`);
      return res.status(500).json({ success: false, message: 'Error sending email.' });
    }
    logError(`Email sent successfully: ${info.response}`);
    res.json({ success: true, message: 'Your message has been sent successfully.' });
  });
});

module.exports = router;