const express = require('express');
const router = express.Router();
// const { generalLimiter } = require('../middleware/rateLimiter'); // Rate limiting kaldırıldı

// Import route modules
const authRoutes = require('./auth.routes');
const adminRoutes = require('./admin.routes');
const stockRoutes = require('./stock.routes');
const ipoRoutes = require('./ipo.routes');
const userRoutes = require('./user.routes');
const supportRoutes = require('./support.routes');

// Apply general rate limiting to all API routes - KALDIRILDI
// router.use(generalLimiter);

// Mount routes
router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/user', userRoutes);
router.use('/stocks', stockRoutes);
router.use('/ipos', ipoRoutes);
router.use('/support', supportRoutes);

// API health endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'DiAgLoBaLe API is running',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// API info endpoint
router.get('/', (req, res) => {
  res.json({
    message: 'DIAPK API v1.0',
    version: '1.0.0',
    status: 'active',
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: '/api/auth - Authentication endpoints',
      admin: '/api/admin - Admin management endpoints',
      stocks: '/api/stocks - Stock market data endpoints',
      ipos: '/api/ipos - IPO management endpoints',
      user: '/api/user - User profile and operations',
      support: '/api/support - Support ticket management',
      health: '/api/health - Health check endpoint'
    },
    documentation: 'https://api.diapk.com/docs'
  });
});

module.exports = router;