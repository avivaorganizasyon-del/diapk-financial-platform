const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const AuthController = require('../controllers/auth.controller');

const { auth } = require('../middleware/auth');
const { handleValidationErrors, customValidations } = require('../middleware/validation');
// const { authLimiter, adminLimiter, registerLimiter, passwordResetLimiter } = require('../middleware/rateLimiter'); // Rate limiting kaldırıldı
const { catchAsync } = require('../middleware/errorHandler');

// Validation arrays
const registerValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Geçerli bir e-posta adresi giriniz'),
  body('password')
    .custom(customValidations.isStrongPassword)
    .withMessage('Şifre en az 8 karakter olmalı ve büyük harf, küçük harf, rakam ve özel karakter içermelidir'),
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Ad 2-50 karakter arasında olmalıdır'),
  body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Soyad 2-50 karakter arasında olmalıdır'),
  body('phone')
    .custom(customValidations.isInternationalPhone)
    .withMessage('Geçerli bir telefon numarası giriniz'),
  body('inviteCode')
    .notEmpty()
    .isLength({ min: 8, max: 12 })
    .withMessage('Geçerli bir davet kodu giriniz')
];

const loginValidation = [
  body('password')
    .notEmpty()
    .withMessage('Şifre gereklidir'),
  // Email veya phone gerekli
  body().custom((value, { req }) => {
    if (!req.body.email && !req.body.phone) {
      throw new Error('Email veya telefon numarası gereklidir');
    }
    if (req.body.email && !req.body.email.includes('@')) {
      throw new Error('Geçerli bir email adresi giriniz');
    }
    return true;
  })
];

const changePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Mevcut şifre gereklidir'),
  body('newPassword')
    .custom(customValidations.isStrongPassword)
    .withMessage('Yeni şifre en az 8 karakter olmalı ve büyük harf, küçük harf, rakam ve özel karakter içermelidir')
];

// Routes

/**
 * @route   POST /api/auth/register
 * @desc    Register new user
 * @access  Public
 */
router.post('/register', 
  // registerLimiter, // Rate limiting kaldırıldı
  registerValidation,
  handleValidationErrors,
  catchAsync(AuthController.register)
);

/**
 * @route   POST /api/auth/admin/login
 * @desc    Admin login with higher rate limit
 * @access  Public
 */
router.post('/admin/login',
  // adminLimiter, // Rate limiting kaldırıldı
  loginValidation,
  handleValidationErrors,
  catchAsync(AuthController.login)
);

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login',
  // authLimiter, // Rate limiting kaldırıldı
  loginValidation,
  handleValidationErrors,
  catchAsync(AuthController.login)
);

/**
 * @route   GET /api/auth/profile
 * @desc    Get user profile
 * @access  Private
 */
router.get('/profile',
  auth,
  catchAsync(AuthController.getProfile)
);

/**
 * @route   PUT /api/auth/change-password
 * @desc    Change user password
 * @access  Private
 */
router.put('/change-password',
  auth,
  // passwordResetLimiter, // Rate limiting kaldırıldı
  changePasswordValidation,
  handleValidationErrors,
  catchAsync(AuthController.changePassword)
);

/**
 * @route   POST /api/auth/refresh-token
 * @desc    Refresh JWT token
 * @access  Private
 */
router.post('/refresh-token',
  auth,
  catchAsync(AuthController.refreshToken)
);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 * @access  Private
 */
router.post('/logout',
  auth,
  catchAsync(AuthController.logout)
);

module.exports = router;