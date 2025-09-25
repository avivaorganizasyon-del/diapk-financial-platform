const express = require('express');
const router = express.Router();
const IpoController = require('../controllers/ipo.controller');
const { auth } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');
const { catchAsync } = require('../middleware/errorHandler');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      error: 'Validation failed', 
      details: errors.array() 
    });
  }
  next();
};

// Public routes

/**
 * @route   GET /api/ipos
 * @desc    Get IPO list with filtering and pagination
 * @access  Public
 * @params  page, limit, status, exchange, sortBy, sortOrder
 */
router.get('/', catchAsync(IpoController.list));

/**
 * @route   GET /api/ipos/active
 * @desc    Get active IPOs (for homepage)
 * @access  Public
 * @params  limit
 */
router.get('/active', catchAsync(IpoController.active));

/**
 * @route   GET /api/ipos/upcoming
 * @desc    Get upcoming IPOs
 * @access  Public
 * @params  limit
 */
router.get('/upcoming', catchAsync(IpoController.upcoming));

/**
 * @route   GET /api/ipos/:id
 * @desc    Get single IPO details
 * @access  Public (but shows user subscription if authenticated)
 */
router.get('/:id', (req, res, next) => {
  // Optional authentication - if token exists, verify it
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (token) {
    return auth()(req, res, next);
  }
  next();
}, catchAsync(IpoController.get));

/**
 * @route   POST /api/ipos/:id/subscribe
 * @desc    Subscribe to IPO
 * @access  Private
 * @params  quantity, pricePerShare
 */
router.post('/:id/subscribe',
  auth,
  [
    body('quantity')
      .isInt({ min: 1 })
      .withMessage('Miktar 1\'den büyük bir tam sayı olmalıdır'),
    body('pricePerShare')
      .isFloat({ min: 0.01 })
      .withMessage('Hisse başına fiyat 0.01\'den büyük olmalıdır')
  ],
  handleValidationErrors,
  catchAsync(IpoController.subscribe)
);

/**
 * @route   GET /api/ipos/my/subscriptions
 * @desc    Get user's IPO subscriptions
 * @access  Private
 */
router.get('/my/subscriptions', auth, catchAsync(IpoController.mySubscriptions));

/**
 * @route   DELETE /api/ipos/subscriptions/:subscriptionId
 * @desc    Cancel IPO subscription
 * @access  Private
 */
router.delete('/subscriptions/:subscriptionId', auth, catchAsync(IpoController.cancelSubscription));

module.exports = router;