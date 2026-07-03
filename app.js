const express = require('express');
const path = require('path');
const morgan = require('morgan');
require('dotenv').config();

// Initialize express app
const app = express();

// Database Pool Boot Initialization
const pool = require('./config/database');

// Session configuration
const sessionMiddleware = require('./config/session');
app.use(sessionMiddleware);

// Set View Engine to EJS
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Middleware stack
app.use(morgan('dev')); // HTTP request logger
app.use(express.json()); // Parse JSON requests
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded forms
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files

// Add helpers and variables to EJS rendering context globally
const { formatThaiDate } = require('./helpers/date.helper');
app.use((req, res, next) => {
  res.locals.formatThaiDate = formatThaiDate;
  res.locals.user = req.session.user || null;
  next();
});

// Register Application Routes
const routes = require('./routes');
app.use('/', routes);

// Error Middlewares mapping
const { notFoundHandler, errorHandler } = require('./middlewares/error.middleware');
app.use(notFoundHandler); // 404 handler
app.use(errorHandler); // 500 error handler

// Start the express server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server Check Application is running in ${process.env.NODE_ENV || 'development'} mode on http://localhost:${PORT}`);
});

module.exports = app;
