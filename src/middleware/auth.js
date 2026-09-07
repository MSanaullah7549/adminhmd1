const jwt = require('jsonwebtoken');
const { UnauthorizedError } = require('../utils/errors');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new UnauthorizedError('Invalid or expired token');
  }
}

function extractToken(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnauthorizedError('No token provided');
  }
  return authHeader.slice(7);
}

function authenticateToken(req, res, next) {
  try {
    const token = extractToken(req);
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    next(error);
  }
}

function authorize(...allowedRoles) {
  return (req, res, next) => {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Not authenticated');
      }
      if (!allowedRoles.includes(req.user.role)) {
        throw new Error('Insufficient permissions');
      }
      next();
    } catch (error) {
      next(error);
    }
  };
}

module.exports = {
  generateToken,
  verifyToken,
  extractToken,
  authenticateToken,
  authorize,
  JWT_SECRET,
};
