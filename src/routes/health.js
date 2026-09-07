const express = require('express');
const { testConnection } = require('../config/db');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const isConnected = await testConnection();

    res.json({
      success: true,
      status: isConnected ? 'healthy' : 'database_unavailable',
      database: isConnected ? 'connected' : 'disconnected',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      status: 'error',
      message: error.message,
    });
  }
});

module.exports = router;
