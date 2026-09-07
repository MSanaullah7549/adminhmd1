const express = require('express');
const path = require('path');
const cors = require('cors');
const dotenv = require('dotenv');
const { connectWithRetry, testConnection } = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const userRoutes = require('./routes/users');
const authRoutes = require('./routes/auth');
const healthRoutes = require('./routes/health');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: process.env.CORS_ORIGIN || ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
}));
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Serve static files at the correct URL prefixes
app.use('/html', express.static(path.join(__dirname, '../html')));
app.use('/assets', express.static(path.join(__dirname, '../assets')));

app.get('/', (req, res) => {
  res.redirect('/html/login-api.html');
});

app.get('/api', (req, res) => {
  res.json({
    message: 'adminHMD backend is running',
    status: 'ok',
    version: '1.0.0',
  });
});

app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

app.all('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

app.use(errorHandler);

async function startServer() {
  try {
    await connectWithRetry();
    await testConnection();
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  startServer();
}

module.exports = app;
module.exports.startServer = startServer;
