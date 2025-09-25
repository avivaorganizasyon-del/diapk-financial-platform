const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const AdminController = require('../controllers/admin.controller');

const { adminAuth } = require('../middleware/auth');
const { handleValidationErrors, customValidations } = require('../middleware/validation');
// const { adminLimiter, strictLimiter } = require('../middleware/rateLimiter'); // Rate limiting kaldırıldı
const { catchAsync } = require('../middleware/errorHandler');

// All admin routes require admin authentication - rate limiting kaldırıldı
// router.use(adminLimiter);
router.use(adminAuth);

// Invite Code Management

/**
 * @route   POST /api/admin/invite-codes
 * @desc    Create invite code
 * @access  Private (Admin)
 */
router.post('/invite-codes',
  [
    body('count')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Kod sayısı 1-100 arasında olmalıdır'),
    body('expiresAt')
      .optional()
      .isISO8601()
      .withMessage('Geçerli bir tarih giriniz'),
    body('description')
      .optional()
      .isLength({ max: 255 })
      .withMessage('Açıklama en fazla 255 karakter olabilir')
  ],
  handleValidationErrors,
  catchAsync(AdminController.createInviteCode)
);

/**
 * @route   GET /api/admin/invite-codes
 * @desc    List invite codes
 * @access  Private (Admin)
 */
router.get('/invite-codes',
  catchAsync(AdminController.getInviteCodes)
);

// User Management

/**
 * @route   POST /api/admin/users
 * @desc    Create new user
 * @access  Private (Admin)
 */
router.post('/users',
  // strictLimiter, // Rate limiting kaldırıldı
  [
    body('email')
      .isEmail()
      .withMessage('Geçerli bir email adresi giriniz'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Şifre en az 6 karakter olmalıdır'),
    body('firstName')
      .notEmpty()
      .withMessage('Ad gereklidir')
      .isLength({ max: 50 })
      .withMessage('Ad en fazla 50 karakter olabilir'),
    body('lastName')
      .notEmpty()
      .withMessage('Soyad gereklidir')
      .isLength({ max: 50 })
      .withMessage('Soyad en fazla 50 karakter olabilir'),
    body('phone')
      .optional()
      .isMobilePhone('tr-TR')
      .withMessage('Geçerli bir telefon numarası giriniz'),
    body('role')
      .optional()
      .isIn(['user', 'admin'])
      .withMessage('Rol user veya admin olmalıdır'),
    body('inviteCode')
      .notEmpty()
      .withMessage('Davet kodu gereklidir')
      .isLength({ min: 12, max: 12 })
      .withMessage('Davet kodu 12 karakter olmalıdır')
  ],
  handleValidationErrors,
  catchAsync(AdminController.createUser)
);

/**
 * @route   GET /api/admin/users
 * @desc    List users
 * @access  Private (Admin)
 */
router.get('/users',
  catchAsync(AdminController.getUsers)
);

/**
 * @route   PUT /api/admin/users/:userId
 * @desc    Update user
 * @access  Private (Admin)
 */
router.put('/users/:userId',
  // strictLimiter, // Rate limiting kaldırıldı
  [
    body('email')
      .optional()
      .isEmail()
      .withMessage('Geçerli bir email adresi giriniz'),
    body('firstName')
      .optional()
      .isLength({ max: 50 })
      .withMessage('Ad en fazla 50 karakter olabilir'),
    body('lastName')
      .optional()
      .isLength({ max: 50 })
      .withMessage('Soyad en fazla 50 karakter olabilir'),
    body('phone')
      .optional()
      .isMobilePhone('tr-TR')
      .withMessage('Geçerli bir telefon numarası giriniz'),
    body('role')
      .optional()
      .isIn(['user', 'admin'])
      .withMessage('Rol user veya admin olmalıdır')
  ],
  handleValidationErrors,
  catchAsync(AdminController.updateUser)
);

/**
 * @route   PUT /api/admin/users/:userId/status
 * @desc    Update user status
 * @access  Private (Admin)
 */
router.put('/users/:userId/status',
  // strictLimiter, // Rate limiting kaldırıldı
  [
    body('isActive')
      .isBoolean()
      .withMessage('Durum boolean değer olmalıdır'),
    body('reason')
      .optional()
      .isLength({ min: 10, max: 500 })
      .withMessage('Sebep 10-500 karakter arasında olmalıdır')
  ],
  handleValidationErrors,
  catchAsync(AdminController.updateUserStatus)
);

// KYC Management

/**
 * @route   GET /api/admin/kyc
 * @desc    Get all KYC applications
 * @access  Private (Admin)
 */
router.get('/kyc', catchAsync(AdminController.getKycApplications));

/**
 * @route   PUT /api/admin/kyc/:kycId/review
 * @desc    Review KYC application
 * @access  Private (Admin)
 */
router.put('/kyc/:kycId/review',
  [
    body('status')
      .isIn(['approved', 'rejected'])
      .withMessage('Status approved veya rejected olmalıdır'),
    body('rejectionReason')
      .if(body('status').equals('rejected'))
      .notEmpty()
      .withMessage('Red nedeni gereklidir')
  ],
  handleValidationErrors,
  catchAsync(AdminController.reviewKyc)
);

// Deposit Management

/**
 * @route   GET /api/admin/deposits
 * @desc    Get all deposits
 * @access  Private (Admin)
 */
router.get('/deposits', catchAsync(AdminController.getDeposits));

/**
 * @route   PUT /api/admin/deposits/:depositId/review
 * @desc    Review deposit
 * @access  Private (Admin)
 */
router.put('/deposits/:depositId/review',
  [
    body('status')
      .isIn(['approved', 'rejected'])
      .withMessage('Status approved veya rejected olmalıdır'),
    body('rejectionReason')
      .if(body('status').equals('rejected'))
      .notEmpty()
      .withMessage('Red nedeni gereklidir')
  ],
  handleValidationErrors,
  catchAsync(AdminController.reviewDeposit)
);

/**
 * @route   POST /api/admin/deposits/manual
 * @desc    Create manual deposit
 * @access  Private (Admin)
 */
router.post('/deposits/manual',
  [
    body('userId')
      .isInt({ min: 1 })
      .withMessage('Geçerli bir kullanıcı ID giriniz'),
    body('amount')
      .isFloat({ min: 0.01 })
      .withMessage('Tutar 0.01\'den büyük olmalıdır'),
    body('method')
      .optional()
      .isLength({ max: 50 })
      .withMessage('Yöntem en fazla 50 karakter olabilir'),
    body('description')
      .optional()
      .isLength({ max: 500 })
      .withMessage('Açıklama en fazla 500 karakter olabilir'),
    body('transactionId')
      .optional()
      .isLength({ max: 100 })
      .withMessage('İşlem ID en fazla 100 karakter olabilir')
  ],
  handleValidationErrors,
  catchAsync(AdminController.createManualDeposit)
);

// IPO Management

/**
 * @route   POST /api/admin/ipos
 * @desc    Create a new IPO
 * @access  Admin
 */
router.post('/ipos',
  [
    body('symbol')
      .notEmpty()
      .withMessage('Sembol gereklidir')
      .isLength({ max: 10 })
      .withMessage('Sembol en fazla 10 karakter olabilir'),
    body('companyName')
      .notEmpty()
      .withMessage('Şirket adı gereklidir'),
    body('exchange')
      .optional()
      .isIn(['BIST', 'NASDAQ', 'NYSE'])
      .withMessage('Geçerli bir borsa seçiniz'),
    body('priceMin')
      .isFloat({ min: 0 })
      .withMessage('Minimum fiyat 0\'dan büyük olmalıdır'),
    body('priceMax')
      .isFloat({ min: 0 })
      .withMessage('Maksimum fiyat 0\'dan büyük olmalıdır'),
    body('lotSize')
      .isInt({ min: 1 })
      .withMessage('Lot büyüklüğü 1\'den büyük olmalıdır'),
    body('startDate')
      .isISO8601()
      .withMessage('Geçerli bir başlangıç tarihi giriniz'),
    body('endDate')
      .isISO8601()
      .withMessage('Geçerli bir bitiş tarihi giriniz')
  ],
  handleValidationErrors,
  catchAsync(AdminController.createIpo)
);
// Payment Methods Management
/**
 * @route   GET /api/admin/payment-methods
 * @desc    Get all payment methods
 * @access  Private (Admin)
 */
router.get('/payment-methods', catchAsync(AdminController.getPaymentMethods));

/**
 * @route   POST /api/admin/payment-methods
 * @desc    Create payment method
 * @access  Private (Admin)
 */
router.post('/payment-methods',
  [
    body('name')
      .notEmpty()
      .withMessage('Ödeme yöntemi adı gereklidir')
      .isLength({ max: 100 })
      .withMessage('Ödeme yöntemi adı en fazla 100 karakter olabilir'),
    body('type')
      .isIn(['bank_transfer', 'eft', 'cash', 'credit_card', 'crypto', 'other'])
      .withMessage('Geçerli bir ödeme yöntemi tipi seçiniz'),
    body('description')
      .optional()
      .isLength({ max: 1000 })
      .withMessage('Açıklama en fazla 1000 karakter olabilir'),
    body('minAmount')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Minimum tutar 0\'dan büyük olmalıdır'),
    body('maxAmount')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Maksimum tutar 0\'dan büyük olmalıdır'),
    body('commission')
      .optional()
      .isFloat({ min: 0, max: 100 })
      .withMessage('Komisyon 0-100 arasında olmalıdır'),
    body('sortOrder')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Sıralama 0\'dan büyük olmalıdır')
  ],
  handleValidationErrors,
  catchAsync(AdminController.createPaymentMethod)
);

/**
 * @route   PUT /api/admin/payment-methods/:id
 * @desc    Update payment method
 * @access  Private (Admin)
 */
router.put('/payment-methods/:id',
  [
    body('name')
      .notEmpty()
      .withMessage('Ödeme yöntemi adı gereklidir')
      .isLength({ max: 100 })
      .withMessage('Ödeme yöntemi adı en fazla 100 karakter olabilir'),
    body('type')
      .isIn(['bank_transfer', 'eft', 'cash', 'credit_card', 'crypto', 'other'])
      .withMessage('Geçerli bir ödeme yöntemi tipi seçiniz')
  ],
  handleValidationErrors,
  catchAsync(AdminController.updatePaymentMethod)
);

/**
 * @route   DELETE /api/admin/payment-methods/:id
 * @desc    Delete payment method
 * @access  Private (Admin)
 */
router.delete('/payment-methods/:id', catchAsync(AdminController.deletePaymentMethod));

/**
 * @route   PATCH /api/admin/payment-methods/:id/toggle
 * @desc    Toggle payment method status
 * @access  Private (Admin)
 */
router.patch('/payment-methods/:id/toggle',
  [
    body('field')
      .isIn(['isActive', 'isVisible'])
      .withMessage('Geçerli bir alan seçiniz'),
    body('value')
      .isBoolean()
      .withMessage('Değer boolean olmalıdır')
  ],
  handleValidationErrors,
  catchAsync(AdminController.togglePaymentMethodStatus)
);

// IPO Management
/**
 * @route   GET /api/admin/ipos
 * @desc    Get all IPOs
 * @access  Private (Admin)
 */
router.get('/ipos', catchAsync(AdminController.getIpos));

/**
 * @route   PUT /api/admin/ipos/:ipoId
 * @desc    Update IPO
 * @access  Private (Admin)
 */
router.put('/ipos/:ipoId', catchAsync(AdminController.updateIpo));

/**
 * @route   DELETE /api/admin/ipos/:ipoId
 * @desc    Delete IPO
 * @access  Private (Admin)
 */
router.delete('/ipos/:ipoId', catchAsync(AdminController.deleteIpo));

// Stock Management

/**
 * @route   POST /api/admin/stocks
 * @desc    Create stock
 * @access  Private (Admin)
 */
router.post('/stocks',
  [
    body('symbol')
      .notEmpty()
      .withMessage('Sembol gereklidir')
      .isLength({ max: 10 })
      .withMessage('Sembol en fazla 10 karakter olabilir'),
    body('companyName')
      .notEmpty()
      .withMessage('Şirket adı gereklidir'),
    body('exchange')
      .optional()
      .isIn(['BIST', 'NASDAQ', 'NYSE'])
      .withMessage('Geçerli bir borsa seçiniz'),
    body('currentPrice')
      .isFloat({ min: 0 })
      .withMessage('Güncel fiyat 0\'dan büyük olmalıdır'),
    body('openPrice')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Açılış fiyatı 0\'dan büyük olmalıdır'),
    body('highPrice')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('En yüksek fiyat 0\'dan büyük olmalıdır'),
    body('lowPrice')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('En düşük fiyat 0\'dan büyük olmalıdır'),
    body('previousClose')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Önceki kapanış 0\'dan büyük olmalıdır'),
    body('volume')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Hacim 0\'dan büyük olmalıdır'),
    body('marketCap')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Piyasa değeri 0\'dan büyük olmalıdır'),
    body('sector')
      .optional()
      .isLength({ max: 100 })
      .withMessage('Sektör en fazla 100 karakter olabilir')
  ],
  handleValidationErrors,
  catchAsync(AdminController.createStock)
);

/**
 * @route   GET /api/admin/stocks
 * @desc    List stocks
 * @access  Private (Admin)
 */
router.get('/stocks', catchAsync(AdminController.getStocks));

/**
 * @route   PUT /api/admin/stocks/:stockId
 * @desc    Update stock
 * @access  Private (Admin)
 */
router.put('/stocks/:stockId', catchAsync(AdminController.updateStock));

/**
 * @route   DELETE /api/admin/stocks/:stockId
 * @desc    Delete stock
 * @access  Private (Admin)
 */
router.delete('/stocks/:stockId', catchAsync(AdminController.deleteStock));

// Announcement Management

/**
 * @route   POST /api/admin/announcements
 * @desc    Create a new announcement
 * @access  Admin
 */
router.post('/announcements',
  [
    body('title')
      .notEmpty()
      .withMessage('Başlık gereklidir')
      .isLength({ max: 200 })
      .withMessage('Başlık en fazla 200 karakter olabilir'),
    body('content')
      .notEmpty()
      .withMessage('İçerik gereklidir'),
    body('publishDate')
      .optional()
      .isISO8601()
      .withMessage('Geçerli bir yayın tarihi giriniz')
  ],
  handleValidationErrors,
  catchAsync(AdminController.createAnnouncement)
);

/**
 * @route   GET /api/admin/announcements
 * @desc    Get all announcements
 * @access  Private (Admin)
 */
router.get('/announcements', catchAsync(AdminController.getAnnouncements));

/**
 * @route   PUT /api/admin/announcements/:announcementId
 * @desc    Update announcement
 * @access  Private (Admin)
 */
router.put('/announcements/:announcementId', catchAsync(AdminController.updateAnnouncement));

/**
 * @route   DELETE /api/admin/announcements/:announcementId
 * @desc    Delete announcement
 * @access  Private (Admin)
 */
router.delete('/announcements/:announcementId', catchAsync(AdminController.deleteAnnouncement));

// Reports

/**
 * @route   GET /api/admin/reports
 * @desc    Get reports data
 * @access  Private (Admin)
 */
router.get('/reports', catchAsync(AdminController.getReports));

/**
 * @route   GET /api/admin/reports/export
 * @desc    Export reports
 * @access  Private (Admin)
 */
router.get('/reports/export', catchAsync(AdminController.exportReport));

// Support Management

/**
 * @route   GET /api/admin/support/tickets
 * @desc    Get support tickets
 * @access  Private (Admin)
 */
router.get('/support/tickets', catchAsync(AdminController.getSupportTickets));

/**
 * @route   GET /api/admin/support/tickets/:ticketId
 * @desc    Get support ticket by ID
 * @access  Private (Admin)
 */
router.get('/support/tickets/:ticketId', catchAsync(AdminController.getTicketById));

/**
 * @route   PUT /api/admin/support/tickets/:ticketId/status
 * @desc    Update ticket status
 * @access  Private (Admin)
 */
router.put('/support/tickets/:ticketId/status',
  [
    body('status')
      .isIn(['open', 'in_progress', 'resolved', 'closed'])
      .withMessage('Status geçerli bir değer olmalıdır'),
    body('adminNote')
      .optional()
      .isLength({ max: 500 })
      .withMessage('Admin notu en fazla 500 karakter olabilir')
  ],
  handleValidationErrors,
  catchAsync(AdminController.updateTicketStatus)
);

/**
 * @route   POST /api/admin/support/tickets/:ticketId/messages
 * @desc    Send admin message to ticket
 * @access  Private (Admin)
 */
router.post('/support/tickets/:ticketId/messages',
  [
    body('message')
      .notEmpty()
      .withMessage('Mesaj gereklidir')
      .isLength({ max: 2000 })
      .withMessage('Mesaj en fazla 2000 karakter olabilir')
  ],
  handleValidationErrors,
  catchAsync(AdminController.sendAdminMessage)
);

// Dashboard Stats

/**
 * @route   GET /api/admin/dashboard/stats
 * @desc    Get dashboard statistics
 * @access  Private (Admin)
 */
router.get('/dashboard/stats', catchAsync(AdminController.getDashboardStats));

// Currency Management

/**
 * @route   GET /api/admin/currency-rates
 * @desc    Get all currency rates
 * @access  Private (Admin)
 */
router.get('/currency-rates', catchAsync(AdminController.getCurrencyRates));

/**
 * @route   PUT /api/admin/currency-rates
 * @desc    Update currency rate
 * @access  Private (Admin)
 */
router.put('/currency-rates',
  [
    body('fromCurrency')
      .notEmpty()
      .withMessage('Kaynak para birimi gereklidir')
      .isLength({ min: 3, max: 3 })
      .withMessage('Para birimi 3 karakter olmalıdır'),
    body('toCurrency')
      .notEmpty()
      .withMessage('Hedef para birimi gereklidir')
      .isLength({ min: 3, max: 3 })
      .withMessage('Para birimi 3 karakter olmalıdır'),
    body('rate')
      .isFloat({ min: 0.000001 })
      .withMessage('Kur değeri 0\'dan büyük olmalıdır')
  ],
  handleValidationErrors,
  catchAsync(AdminController.updateCurrencyRate)
);

/**
 * @route   GET /api/admin/convert-currency
 * @desc    Convert currency
 * @access  Private (Admin)
 */
router.get('/convert-currency', catchAsync(AdminController.convertCurrency));

module.exports = router;