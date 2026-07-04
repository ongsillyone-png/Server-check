/**
 * Security Middleware - Phase 10
 * - Global rate limiter
 * - Login-specific rate limiter
 * - Input sanitizer (trim + null-byte strip)
 */

const rateLimit = require('express-rate-limit');

// ============================================================
// Global Rate Limiter
// 500 requests per 15 minutes per IP
// (High limit: mobile users may share IPs via carrier NAT)
// ============================================================
const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    error: 'คำขอมากเกินไป กรุณารอสักครู่แล้วลองใหม่อีกครั้ง (Too many requests)'
  },
  skip: (req) => {
    // Skip rate limit for static assets
    return req.path.startsWith('/css') || req.path.startsWith('/js') || req.path.startsWith('/images');
  }
});

// ============================================================
// Login Rate Limiter
// max 20 attempts per 15 minutes per IP
// (Relaxed slightly for mobile NAT but still brute-force resistant)
// ============================================================
const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    error: 'เข้าสู่ระบบล้มเหลวหลายครั้งเกินไป กรุณารอ 15 นาทีแล้วลองใหม่'
  }
});

// ============================================================
// Input Sanitizer Middleware
// Trims all string fields in req.body and req.query
// Strips null bytes to prevent null-byte injection
// ============================================================
const sanitizeInput = (req, res, next) => {
  const sanitize = (obj) => {
    if (!obj || typeof obj !== 'object') return;
    for (const key of Object.keys(obj)) {
      if (typeof obj[key] === 'string') {
        // Trim whitespace
        obj[key] = obj[key].trim();
        // Strip null bytes
        obj[key] = obj[key].replace(/\0/g, '');
      } else if (typeof obj[key] === 'object') {
        sanitize(obj[key]);
      }
    }
  };
  sanitize(req.body);
  sanitize(req.query);
  sanitize(req.params);
  next();
};

module.exports = { rateLimiter, loginRateLimiter, sanitizeInput };
