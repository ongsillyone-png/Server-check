const express = require('express');
const path = require('path');
const morgan = require('morgan');
const helmet = require('helmet');
require('dotenv').config();

// Initialize express app
const app = express();

// ============================================================
// Trust Proxy — required when behind Nginx reverse proxy
// Allows Express to read real client IP from X-Forwarded-For
// ============================================================
app.set('trust proxy', 1);

// Database Pool Boot Initialization
const pool = require('./config/database');

// ============================================================
// Security: Helmet — HTTP Security Headers
// HTTPS/HSTS disabled (HTTP-only internal network)
// ============================================================
app.use(helmet({
  // Disable HTTPS-only features (no SSL on this server)
  hsts: false,
  contentSecurityPolicy: false, // Keep disabled: we use CDN (Bootstrap, ECharts) inline
  // Still active protections:
  // - X-Frame-Options: SAMEORIGIN (clickjacking)
  // - X-Content-Type-Options: nosniff (MIME sniffing)
  // - X-XSS-Protection: 0 (handled by browser natively now)
  // - Referrer-Policy: no-referrer
  // - X-DNS-Prefetch-Control: off
}));

// Hide X-Powered-By header
app.disable('x-powered-by');

// ============================================================
// Security: Rate Limiting
// Increased limits: mobile users share IPs via carrier NAT
// ============================================================
const { rateLimiter, sanitizeInput } = require('./middlewares/security.middleware');
app.use(rateLimiter);

// ============================================================
// Logging: HTTP Access Log
// Production: write to file | Development: console
// ============================================================
const { accessLogStream } = require('./config/logger');
if (process.env.NODE_ENV === 'production') {
  app.use(morgan('combined', { stream: accessLogStream }));
} else {
  app.use(morgan('dev'));
}

// Session configuration
const sessionMiddleware = require('./config/session');
app.use(sessionMiddleware);

// Set View Engine to EJS
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Middleware stack
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// ============================================================
// Input Sanitizer — trim + strip null bytes from all inputs
// ============================================================
app.use(sanitizeInput);

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
app.use(errorHandler);   // 500 error handler

// Start the express server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server Check Application is running in ${process.env.NODE_ENV || 'development'} mode on http://localhost:${PORT}`);

  // Initialize Node Cron Job Scheduler
  const { initScheduler } = require('./config/scheduler');
  initScheduler();
});

module.exports = app;
