const express = require('express');
const bcryptjs = require('bcryptjs');
const { getPool } = require('../config/db');
const { generateToken } = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');
const { validateEmail, validateString, validateRequired, sanitizeInput } = require('../utils/validators');
const { ValidationError } = require('../utils/errors');

const router = express.Router();

router.post(
  '/register',
  asyncHandler(async (req, res) => {
    const data = sanitizeInput(req.body);
    validateRequired(['name', 'email', 'password'], data);

    const name = validateString(data.name, 'Name', { minLength: 2, maxLength: 100 });
    const email = data.email.toLowerCase();
    
    if (!validateEmail(email)) {
      throw new ValidationError('Invalid email format');
    }

    const password = validateString(data.password, 'Password', { minLength: 6 });

    const pool = getPool();
    if (!pool) {
      throw new Error('Database not connected');
    }

    const [existingUsers] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUsers.length > 0) {
      throw new ValidationError('Email already registered');
    }

    const hashedPassword = await bcryptjs.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password_hash, role, status) VALUES (?, ?, ?, ?, ?)',
      [name, email, hashedPassword, 'user', 'active']
    );

    const token = generateToken({ id: result.insertId, email, role: 'user' });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: result.insertId,
        name,
        email,
        role: 'user',
      },
    });
  })
);

router.post(
  '/login',
  asyncHandler(async (req, res) => {
    const data = sanitizeInput(req.body);
    validateRequired(['email', 'password'], data);

    const email = data.email.toLowerCase();
    if (!validateEmail(email)) {
      throw new ValidationError('Invalid email format');
    }

    const pool = getPool();
    if (!pool) {
      throw new Error('Database not connected');
    }

    const [users] = await pool.query(
      'SELECT id, email, password_hash, role FROM users WHERE email = ? AND status = ?',
      [email, 'active']
    );

    if (users.length === 0) {
      throw new ValidationError('Invalid email or password');
    }

    const user = users[0];
    const isPasswordValid = await bcryptjs.compare(data.password, user.password_hash);

    if (!isPasswordValid) {
      throw new ValidationError('Invalid email or password');
    }

    const token = generateToken({ id: user.id, email: user.email, role: user.role });

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });
  })
);

router.post(
  '/refresh',
  asyncHandler(async (req, res) => {
    const data = sanitizeInput(req.body);
    if (!data.refreshToken) {
      throw new ValidationError('Refresh token required');
    }

    // Note: In production, maintain a refresh token list in the database
    const token = generateToken({ id: data.userId });

    res.json({
      success: true,
      token,
    });
  })
);

module.exports = router;
