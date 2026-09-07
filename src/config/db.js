const mysql = require('mysql2/promise');

let pool = null;

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'adminhmd',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

async function connectWithRetry(retries = 10, delayMs = 3000) {
  if (pool) {
    return pool;
  }

  try {
    pool = mysql.createPool(dbConfig);
    await pool.query('SELECT 1');
    console.log('MySQL connected successfully.');
    return pool;
  } catch (error) {
    console.error(`MySQL connection failed (${retries} retries left):`, error.message);

    if (retries > 0) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
      return connectWithRetry(retries - 1, delayMs);
    }

    throw error;
  }
}

async function testConnection() {
  try {
    if (!pool) {
      return false;
    }

    await pool.query('SELECT 1');
    return true;
  } catch (error) {
    console.error('Database health check failed:', error.message);
    return false;
  }
}

function getPool() {
  return pool;
}

module.exports = {
  connectWithRetry,
  getPool,
  testConnection,
  dbConfig,
};
