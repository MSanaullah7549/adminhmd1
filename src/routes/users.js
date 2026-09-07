const express = require('express');
const { getPool } = require('../config/db');
const asyncHandler = require('../middleware/asyncHandler');
const { authenticateToken, authorize } = require('../middleware/auth');
const { validateEmail, validateString, validateRequired, validateEnum, sanitizeInput } = require('../utils/validators');
const { NotFoundError, ValidationError } = require('../utils/errors');

const router = express.Router();

router.get(
  '/',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const pool = getPool();
    if (!pool) {
      throw new Error('Database not connected');
    }

    const limit = Math.min(parseInt(req.query.limit) || 10, 100);
    const offset = parseInt(req.query.offset) || 0;

    const [rows] = await pool.query(
      'SELECT id, name, email, role, status, created_at FROM users ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [limit, offset]
    );

    const [countResult] = await pool.query('SELECT COUNT(*) as total FROM users');
    const total = countResult[0].total;

    res.json({
      success: true,
      data: rows,
      pagination: { limit, offset, total },
    });
  })
);

router.get(
  '/:id',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const pool = getPool();
    const [rows] = await pool.query(
      'SELECT id, name, email, role, status, created_at FROM users WHERE id = ?',
      [req.params.id]
    );

    if (!rows.length) {
      throw new NotFoundError('User not found');
    }

    res.json({ success: true, data: rows[0] });
  })
);

router.post(
  '/',
  authenticateToken,
  authorize('admin'),
  asyncHandler(async (req, res) => {
    const data = sanitizeInput(req.body);
    validateRequired(['name', 'email'], data);

    const name = validateString(data.name, 'Name', { minLength: 2, maxLength: 100 });
    const email = data.email.toLowerCase();

    if (!validateEmail(email)) {
      throw new ValidationError('Invalid email format');
    }

    const role = data.role ? validateEnum(data.role, 'Role', ['user', 'admin', 'moderator']) : 'user';
    const status = data.status ? validateEnum(data.status, 'Status', ['active', 'inactive', 'suspended']) : 'active';

    const pool = getPool();
    const [existingUsers] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUsers.length > 0) {
      throw new ValidationError('Email already exists');
    }

    const [result] = await pool.query(
      'INSERT INTO users (name, email, role, status) VALUES (?, ?, ?, ?)',
      [name, email, role, status]
    );

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: { id: result.insertId, name, email, role, status },
    });
  })
);

router.put(
  '/:id',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const userId = parseInt(req.params.id);
    const data = sanitizeInput(req.body);

    if (req.user.role !== 'admin' && req.user.id !== userId) {
      throw new Error('Insufficient permissions');
    }

    const pool = getPool();
    const [existingUsers] = await pool.query('SELECT id FROM users WHERE id = ?', [userId]);
    if (!existingUsers.length) {
      throw new NotFoundError('User not found');
    }

    const updates = [];
    const values = [];

    if (data.name) {
      updates.push('name = ?');
      values.push(validateString(data.name, 'Name', { minLength: 2, maxLength: 100 }));
    }

    if (data.email) {
      const email = data.email.toLowerCase();
      if (!validateEmail(email)) {
        throw new ValidationError('Invalid email format');
      }
      updates.push('email = ?');
      values.push(email);
    }

    if (data.role) {
      updates.push('role = ?');
      values.push(validateEnum(data.role, 'Role', ['user', 'admin', 'moderator']));
    }

    if (data.status) {
      updates.push('status = ?');
      values.push(validateEnum(data.status, 'Status', ['active', 'inactive', 'suspended']));
    }

    if (updates.length === 0) {
      throw new ValidationError('No fields to update');
    }

    values.push(userId);
    const [result] = await pool.query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    res.json({ success: true, message: 'User updated successfully' });
  })
);

router.delete(
  '/:id',
  authenticateToken,
  authorize('admin'),
  asyncHandler(async (req, res) => {
    const pool = getPool();
    const [result] = await pool.query('DELETE FROM users WHERE id = ?', [req.params.id]);

    if (result.affectedRows === 0) {
      throw new NotFoundError('User not found');
    }

    res.json({ success: true, message: 'User deleted successfully' });
  })
);

module.exports = router;
