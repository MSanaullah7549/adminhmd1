const { ValidationError } = require('./errors');

function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validateRequired(fields, data) {
  const missing = fields.filter((field) => !data[field] || data[field].toString().trim() === '');
  if (missing.length > 0) {
    throw new ValidationError(`Missing required fields: ${missing.join(', ')}`);
  }
}

function validateString(value, fieldName, options = {}) {
  if (typeof value !== 'string') {
    throw new ValidationError(`${fieldName} must be a string`);
  }

  const trimmed = value.trim();

  if (options.minLength && trimmed.length < options.minLength) {
    throw new ValidationError(`${fieldName} must be at least ${options.minLength} characters`);
  }

  if (options.maxLength && trimmed.length > options.maxLength) {
    throw new ValidationError(`${fieldName} must be at most ${options.maxLength} characters`);
  }

  return trimmed;
}

function validateEnum(value, fieldName, allowedValues) {
  if (!allowedValues.includes(value)) {
    throw new ValidationError(
      `${fieldName} must be one of: ${allowedValues.join(', ')}`
    );
  }
  return value;
}

function sanitizeInput(data) {
  const sanitized = {};
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string') {
      sanitized[key] = value.trim().replace(/[<>]/g, '');
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

module.exports = {
  validateEmail,
  validateRequired,
  validateString,
  validateEnum,
  sanitizeInput,
};
