const session = require('express-session');
require('dotenv').config();

// Session middleware configuration
const sessionConfig = {
  secret: process.env.SESSION_SECRET || 'hospital_server_check_secret_key_2026',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: parseInt(process.env.SESSION_LIFETIME || '86400000'), // Default 24 hours
    secure: process.env.NODE_ENV === 'production', // Use secure cookies in production (HTTPS)
    httpOnly: true,
    sameSite: 'lax'
  }
};

module.exports = session(sessionConfig);
