/**
 * Logger configuration - Phase 10
 * Writes HTTP access logs and error logs to files.
 * Uses built-in Node.js fs — no extra packages required.
 */

const fs = require('fs');
const path = require('path');

// Ensure logs directory exists
const logsDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

/**
 * Get today's date string for log file naming: YYYY-MM-DD
 */
function getTodayStr() {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Get a writable stream for the given log type (access/error)
 * Creates a new file per day: e.g., logs/2026-07-04-access.log
 */
function getLogStream(type = 'access') {
  const filename = `${getTodayStr()}-${type}.log`;
  return fs.createWriteStream(path.join(logsDir, filename), { flags: 'a' });
}

/**
 * Access log stream (used by morgan in app.js)
 */
const accessLogStream = getLogStream('access');

/**
 * Write an error entry to the error log file.
 * @param {Error|string} err
 * @param {import('express').Request} [req]
 */
function logError(err, req = null) {
  const timestamp = new Date().toISOString();
  const ip = req ? (req.ip || req.connection?.remoteAddress || '-') : '-';
  const method = req ? req.method : '-';
  const url = req ? req.originalUrl : '-';
  const message = err instanceof Error ? err.message : String(err);
  const stack = err instanceof Error ? err.stack : '';

  const entry = `[${timestamp}] ERROR ip=${ip} ${method} ${url}\n  Message: ${message}\n  ${stack ? 'Stack: ' + stack : ''}\n\n`;

  const errorStream = getLogStream('error');
  errorStream.write(entry, () => errorStream.end());
}

module.exports = { accessLogStream, logError };
