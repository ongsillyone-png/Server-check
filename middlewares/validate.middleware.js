/**
 * Server-side Input Validation Middleware - Phase 10
 * Provides reusable validation helpers for controllers.
 */

/**
 * Returns validation errors for required fields.
 * @param {Object} body - req.body or req.query
 * @param {string[]} fields - field names to check
 * @returns {string[]} array of error messages
 */
const validateNotEmpty = (body, fields) => {
  const errors = [];
  for (const field of fields) {
    const val = body[field];
    if (val === undefined || val === null || String(val).trim() === '') {
      errors.push(`ช่อง "${field}" ไม่สามารถเว้นว่างได้`);
    }
  }
  return errors;
};

/**
 * Returns error if a field exceeds max character length.
 * @param {string} value
 * @param {string} fieldLabel
 * @param {number} max
 * @returns {string|null}
 */
const validateMaxLength = (value, fieldLabel, max) => {
  if (value && String(value).length > max) {
    return `ช่อง "${fieldLabel}" ต้องมีความยาวไม่เกิน ${max} ตัวอักษร`;
  }
  return null;
};

/**
 * Returns error if a numeric value is outside of range.
 * @param {*} value
 * @param {string} fieldLabel
 * @param {number} min
 * @param {number} max
 * @returns {string|null}
 */
const validateNumericRange = (value, fieldLabel, min, max) => {
  const num = Number(value);
  if (isNaN(num)) {
    return `ช่อง "${fieldLabel}" ต้องเป็นตัวเลข`;
  }
  if (num < min || num > max) {
    return `ช่อง "${fieldLabel}" ต้องอยู่ระหว่าง ${min} ถึง ${max}`;
  }
  return null;
};

/**
 * Returns error if value is not a valid email format.
 * @param {string} value
 * @param {string} fieldLabel
 * @returns {string|null}
 */
const validateEmail = (value, fieldLabel) => {
  if (!value) return null;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(value)) {
    return `ช่อง "${fieldLabel}" รูปแบบอีเมลไม่ถูกต้อง`;
  }
  return null;
};

/**
 * Sends a structured validation error response.
 * - For API routes: sends JSON { error, errors }
 * - For web routes: redirect back with flash-like query param (or render)
 *
 * @param {Object} res - Express response
 * @param {string[]} errors - Array of error messages
 * @param {boolean} isApi - true if this is an API route
 */
const sendValidationError = (res, errors, isApi = false) => {
  if (isApi) {
    return res.status(422).json({
      error: 'ข้อมูลไม่ถูกต้อง',
      errors
    });
  }
  // For web: re-render or redirect back with error
  return res.status(422).send(
    `<script>
      Swal.fire({ icon: 'error', title: 'ข้อมูลไม่ถูกต้อง', html: '${errors.join('<br>')}' });
      history.back();
    </script>`
  );
};

module.exports = {
  validateNotEmpty,
  validateMaxLength,
  validateNumericRange,
  validateEmail,
  sendValidationError
};
