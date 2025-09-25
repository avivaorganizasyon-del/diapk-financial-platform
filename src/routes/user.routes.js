const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { User, Kyc, Deposit, Favorite, Announcement, PaymentMethod } = require('../models');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const { Op } = require('sequelize');

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

// File upload configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/kyc/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.FILE_SIZE_LIMIT) || 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Sadece JPEG, JPG, PNG ve PDF dosyaları yüklenebilir'));
    }
  }
});

// All routes require authentication
router.use(auth);

// Profile Management

/**
 * @route   PUT /api/user/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put('/profile',
  [
    body('firstName')
      .optional()
      .trim()
      .isLength({ min: 2 })
      .withMessage('Ad en az 2 karakter olmalıdır'),
    body('lastName')
      .optional()
      .trim()
      .isLength({ min: 2 })
      .withMessage('Soyad en az 2 karakter olmalıdır'),
    body('phone')
      .optional()
      .isMobilePhone('tr-TR')
      .withMessage('Geçerli bir telefon numarası giriniz')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { firstName, lastName, phone } = req.body;
      const userId = req.user.userId;

      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
      }

      await user.update({
        firstName: firstName || user.firstName,
        lastName: lastName || user.lastName,
        phone: phone || user.phone
      });

      res.json({
        message: 'Profil başarıyla güncellendi',
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone
        }
      });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({ error: 'Profil güncellenirken hata oluştu' });
    }
  }
);

// KYC Management

/**
 * @route   POST /api/user/kyc
 * @desc    Submit KYC application
 * @access  Private
 */
router.post('/kyc',
  upload.fields([
    { name: 'documentFront', maxCount: 1 },
    { name: 'documentBack', maxCount: 1 },
    { name: 'selfie', maxCount: 1 }
  ]),
  [
    body('identityNumber')
      .isLength({ min: 11, max: 11 })
      .withMessage('TC Kimlik No 11 haneli olmalıdır'),
    body('dateOfBirth')
      .isISO8601()
      .withMessage('Geçerli bir doğum tarihi giriniz'),
    body('address')
      .notEmpty()
      .withMessage('Adres gereklidir'),
    body('documentType')
      .isIn(['identity_card', 'passport', 'driving_license'])
      .withMessage('Geçerli bir belge türü seçiniz'),
    body('documentNumber')
      .notEmpty()
      .withMessage('Belge numarası gereklidir')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const {
        identityNumber,
        dateOfBirth,
        address,
        documentType,
        documentNumber
      } = req.body;
      const userId = req.user.userId;

      // Check if KYC already exists
      const existingKyc = await Kyc.findOne({ where: { userId } });
      if (existingKyc) {
        return res.status(400).json({ error: 'KYC başvurusu zaten mevcut' });
      }

      // Check required files
      if (!req.files?.documentFront || !req.files?.selfie) {
        return res.status(400).json({ error: 'Belge ön yüzü ve selfie fotoğrafı gereklidir' });
      }

      const kyc = await Kyc.create({
        userId,
        identityNumber,
        dateOfBirth: new Date(dateOfBirth),
        address,
        documentType,
        documentNumber,
        documentFrontUrl: req.files.documentFront[0].path,
        documentBackUrl: req.files.documentBack?.[0]?.path || null,
        selfieUrl: req.files.selfie[0].path
      });

      res.status(201).json({
        message: 'KYC başvurusu başarıyla gönderildi',
        kyc: {
          id: kyc.id,
          status: kyc.status,
          createdAt: kyc.createdAt
        }
      });
    } catch (error) {
      console.error('KYC submission error:', error);
      res.status(500).json({ error: 'KYC başvurusu sırasında hata oluştu' });
    }
  }
);

/**
 * @route   GET /api/user/kyc
 * @desc    Get user's KYC status
 * @access  Private
 */
router.get('/kyc', async (req, res) => {
  try {
    const userId = req.user.userId;

    const kyc = await Kyc.findOne({ where: { userId } });
    
    res.json({ kyc });
  } catch (error) {
    console.error('Get KYC error:', error);
    res.status(500).json({ error: 'KYC bilgisi alınırken hata oluştu' });
  }
});

// Deposit Management

/**
 * @route   POST /api/user/deposits
 * @desc    Create deposit request
 * @access  Private
 */
router.post('/deposits',
  upload.single('receipt'),
  async (req, res) => {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ error: 'Yetkilendirme hatası' });
    }
    try {
        const { amount, method, transactionId, bankName, accountNumber, notes } = req.body;
        const userId = req.user.userId;

        // Basit validation - manuel onay için
        if (!amount || parseFloat(amount) <= 0) {
          return res.status(400).json({ error: 'Geçerli bir tutar giriniz' });
        }

        if (parseFloat(amount) < 10) {
          return res.status(400).json({ error: 'Minimum yatırım tutarı 10 TL\'dir' });
        }

        if (!transactionId || !transactionId.trim()) {
          return res.status(400).json({ error: 'İşlem ID gereklidir' });
        }

        if (!bankName || !bankName.trim()) {
          return res.status(400).json({ error: 'Banka adı gereklidir' });
        }

        if (!accountNumber || !accountNumber.trim()) {
          return res.status(400).json({ error: 'Hesap numarası gereklidir' });
        }

        // Banka bilgilerini JSON olarak sakla
        const bankInfo = {
          bankName: bankName || '',
          accountNumber: accountNumber || ''
        };

        const deposit = await Deposit.create({
          userId,
          amount: parseFloat(amount),
          currency: 'TRY',
          method: method || 'manual',
          transactionId,
          receiptUrl: req.file?.path || null,
          bankInfo,
          notes: notes || null,
          status: 'pending' // Manuel onay için pending status
        });

      res.status(201).json({
        message: 'Para yatırma talebi başarıyla oluşturuldu',
        deposit: {
          id: deposit.id,
          amount: deposit.amount,
          currency: deposit.currency,
          method: deposit.method,
          status: deposit.status,
          createdAt: deposit.createdAt
        }
      });
    } catch (error) {
        console.error('Deposit creation error:', error);
        res.status(500).json({ error: 'Para yatırma talebi oluşturulurken hata oluştu' });
    }
  }
);

/**
 * @route   GET /api/user/deposits
 * @desc    Get user's deposit history
 * @access  Private
 */
router.get('/deposits', async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;
    const userId = req.user.userId;

    const whereClause = { userId };
    if (status) {
      whereClause.status = status;
    }

    const { count, rows } = await Deposit.findAndCountAll({
      where: whereClause,
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      deposits: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Get deposits error:', error);
    res.status(500).json({ error: 'Para yatırma geçmişi alınırken hata oluştu' });
  }
});

/**
 * @route   GET /api/user/balance
 * @desc    Get user's current balance
 * @access  Private
 */
router.get('/balance', async (req, res) => {
  try {
    const userId = req.user.userId;
    const { IpoSubscription } = require('../models');
    
    // Onaylanmış depozitleri al
    const approvedDeposits = await Deposit.findAll({
      where: {
        userId,
        status: 'approved'
      }
    });
    
    const totalBalance = approvedDeposits.reduce((sum, deposit) => sum + parseFloat(deposit.amount), 0);
    
    // Mevcut IPO aboneliklerinin toplam tutarını hesapla
    const existingSubscriptions = await IpoSubscription.findAll({
      where: {
        userId,
        status: { [Op.in]: ['pending', 'confirmed'] }
      }
    });
    
    const reservedAmount = existingSubscriptions.reduce((sum, sub) => sum + parseFloat(sub.totalAmount), 0);
    const availableBalance = totalBalance - reservedAmount;
    
    res.json({
      totalBalance,
      reservedAmount,
      availableBalance
    });
  } catch (error) {
    console.error('Get balance error:', error);
    res.status(500).json({ error: 'Bakiye bilgisi alınırken hata oluştu' });
  }
});

// Favorites Management

/**
 * @route   POST /api/user/favorites
 * @desc    Add stock to favorites
 * @access  Private
 */
router.post('/favorites',
  [
    body('symbol')
      .notEmpty()
      .withMessage('Sembol gereklidir'),
    body('type')
      .optional()
      .isIn(['stock', 'crypto', 'forex'])
      .withMessage('Geçerli bir tür seçiniz')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { symbol, type = 'stock' } = req.body;
      const userId = req.user.userId;

      // Check if already in favorites
      const existing = await Favorite.findOne({
        where: { userId, symbol: symbol.toUpperCase() }
      });

      if (existing) {
        return res.status(400).json({ error: 'Bu sembol zaten favorilerinizde' });
      }

      const favorite = await Favorite.create({
        userId,
        symbol: symbol.toUpperCase(),
        type
      });

      res.status(201).json({
        message: 'Favorilere eklendi',
        favorite
      });
    } catch (error) {
      console.error('Add favorite error:', error);
      res.status(500).json({ error: 'Favorilere eklenirken hata oluştu' });
    }
  }
);

/**
 * @route   GET /api/user/favorites
 * @desc    Get user's favorites
 * @access  Private
 */
router.get('/favorites', async (req, res) => {
  try {
    const { type } = req.query;
    const userId = req.user.userId;

    const whereClause = { userId };
    if (type) {
      whereClause.type = type;
    }

    const favorites = await Favorite.findAll({
      where: whereClause,
      order: [['createdAt', 'DESC']]
    });

    res.json({ favorites });
  } catch (error) {
    console.error('Get favorites error:', error);
    res.status(500).json({ error: 'Favoriler alınırken hata oluştu' });
  }
});

/**
 * @route   DELETE /api/user/favorites/:favoriteId
 * @desc    Remove from favorites
 * @access  Private
 */
router.delete('/favorites/:favoriteId', async (req, res) => {
  try {
    const { favoriteId } = req.params;
    const userId = req.user.userId;

    const favorite = await Favorite.findOne({
      where: { id: favoriteId, userId }
    });

    if (!favorite) {
      return res.status(404).json({ error: 'Favori bulunamadı' });
    }

    await favorite.destroy();

    res.json({ message: 'Favorilerden kaldırıldı' });
  } catch (error) {
    console.error('Remove favorite error:', error);
    res.status(500).json({ error: 'Favorilerden kaldırılırken hata oluştu' });
  }
});

// Payment Methods

/**
 * @route   GET /api/user/payment-methods
 * @desc    Get available payment methods for users
 * @access  Private
 */
router.get('/payment-methods', async (req, res) => {
  try {
    // Get payment methods from database that are both active and visible to users
    const paymentMethods = await PaymentMethod.findAll({
      where: {
        isActive: true,
        isVisible: true
      },
      order: [['sortOrder', 'ASC'], ['createdAt', 'DESC']]
    });

    res.json({
      paymentMethods
    });
  } catch (error) {
    console.error('Get payment methods error:', error);
    res.status(500).json({ error: 'Ödeme yöntemleri alınırken hata oluştu' });
  }
});

// Announcements

/**
 * @route   GET /api/user/announcements
 * @desc    Get active announcements
 * @access  Private
 */
router.get('/announcements', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const { count, rows } = await Announcement.findAndCountAll({
      where: {
        isActive: true,
        publishDate: { [Op.lte]: new Date() }
      },
      order: [['publishDate', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      announcements: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Get announcements error:', error);
    res.status(500).json({ error: 'Duyurular alınırken hata oluştu' });
  }
});

module.exports = router;