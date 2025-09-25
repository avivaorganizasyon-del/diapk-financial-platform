const express = require('express');
const router = express.Router();
const StockController = require('../controllers/stock.controller');
const { auth } = require('../middleware/auth');

// Public routes - no authentication required

/**
 * @route   GET /api/stocks
 * @desc    Get stock list with filtering and pagination
 * @access  Public
 * @params  page, limit, exchange, search, sortBy, sortOrder
 */
router.get('/', StockController.list);

/**
 * @route   GET /api/stocks/search
 * @desc    Search stocks (for autocomplete)
 * @access  Public
 * @params  q (query), limit, exchange
 */
router.get('/search', StockController.search);

/**
 * @route   GET /api/stocks/popular
 * @desc    Get popular stocks (highest volume)
 * @access  Public
 * @params  limit, exchange
 */
router.get('/popular', StockController.popular);

/**
 * @route   GET /api/stocks/gainers
 * @desc    Get top gaining stocks
 * @access  Public
 * @params  limit, exchange
 */
router.get('/gainers', StockController.gainers);

/**
 * @route   GET /api/stocks/losers
 * @desc    Get top losing stocks
 * @access  Public
 * @params  limit, exchange
 */
router.get('/losers', StockController.losers);

/**
 * @route   GET /api/stocks/market-summary
 * @desc    Get market summary statistics
 * @access  Public
 * @params  exchange
 */
router.get('/market-summary', StockController.marketSummary);

// Protected routes - authentication required

/**
 * @route   GET /api/stocks/portfolio/user
 * @desc    Get user's stock portfolio
 * @access  Private
 */
router.get('/portfolio/user', auth, StockController.getUserPortfolio);

/**
 * @route   POST /api/stocks/buy
 * @desc    Buy stocks
 * @access  Private
 * @body    stockId, quantity, pricePerShare
 */
router.post('/buy', auth, StockController.buyStock);

/**
 * @route   GET /api/stocks/transactions/user
 * @desc    Get user's stock transactions
 * @access  Private
 * @params  page, limit, type, stockId
 */
router.get('/transactions/user', auth, StockController.getUserTransactions);

/**
 * @route   GET /api/stocks/:symbol
 * @desc    Get specific stock data
 * @access  Public
 * @params  symbol
 */
router.get('/:symbol', StockController.get);

module.exports = router;