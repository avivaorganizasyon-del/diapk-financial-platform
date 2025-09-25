const { User, InviteCode, Kyc, Deposit, Ipo, Announcement, Stock, PaymentMethod, CurrencyRate } = require('../models');
const TicketStore = require('../data/ticketStore');
const { v4: uuidv4 } = require('uuid');
const { Op } = require('sequelize');

class AdminController {
  /**
   * Create invite code
   */
  static async createInviteCode(req, res) {
    try {
      const { expiresAt } = req.body;
      const createdBy = req.user.userId;

      // Eşsiz kod oluştur
      const code = uuidv4().replace(/-/g, '').substring(0, 12).toUpperCase();

      const inviteCode = await InviteCode.create({
        code,
        createdBy,
        expiresAt: expiresAt ? new Date(expiresAt) : null
      });

      res.status(201).json({
        message: 'Davet kodu başarıyla oluşturuldu',
        inviteCode: {
          id: inviteCode.id,
          code: inviteCode.code,
          expiresAt: inviteCode.expiresAt,
          createdAt: inviteCode.createdAt
        }
      });
    } catch (error) {
      console.error('Create invite code error:', error);
      res.status(500).json({ error: 'Davet kodu oluşturulurken hata oluştu' });
    }
  }

  /**
   * Get invite codes list
   */
  static async getInviteCodes(req, res) {
    try {
      const { page = 1, limit = 10, status } = req.query;
      const offset = (page - 1) * limit;

      const whereClause = {};
      if (status === 'used') whereClause.isUsed = true;
      if (status === 'unused') whereClause.isUsed = false;

      const { count, rows } = await InviteCode.findAndCountAll({
        where: whereClause,
        include: [
          { model: User, as: 'creator', attributes: ['firstName', 'lastName'] },
          { model: User, as: 'user', attributes: ['firstName', 'lastName', 'email'] }
        ],
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      res.json({
        inviteCodes: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit)
        }
      });
    } catch (error) {
      console.error('Get invite codes error:', error);
      res.status(500).json({ error: 'Davet kodları alınırken hata oluştu' });
    }
  }

  /**
   * Get users list
   */
  static async getUsers(req, res) {
    try {
      const { page = 1, limit = 10, search, role } = req.query;
      const offset = (page - 1) * limit;

      const whereClause = {};
      if (search) {
        whereClause[Op.or] = [
          { firstName: { [Op.like]: `%${search}%` } },
          { lastName: { [Op.like]: `%${search}%` } },
          { email: { [Op.like]: `%${search}%` } }
        ];
      }
      if (role) whereClause.role = role;

      const { count, rows } = await User.findAndCountAll({
        where: whereClause,
        attributes: { exclude: ['password'] },
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      res.json({
        users: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit)
        }
      });
    } catch (error) {
      console.error('Get users error:', error);
      res.status(500).json({ error: 'Kullanıcılar alınırken hata oluştu' });
    }
  }

  /**
   * Create user
   */
  static async createUser(req, res) {
    try {
      const { email, password, firstName, lastName, phone, role = 'user', inviteCode } = req.body;

      // Davet kodu kontrolü
      if (!inviteCode) {
        return res.status(400).json({ error: 'Davet kodu gereklidir' });
      }

      const invite = await InviteCode.findOne({ 
        where: { 
          code: inviteCode,
          isUsed: false,
          [Op.or]: [
            { expiresAt: null },
            { expiresAt: { [Op.gt]: new Date() } }
          ]
        } 
      });

      if (!invite) {
        return res.status(400).json({ error: 'Geçersiz veya süresi dolmuş davet kodu' });
      }

      // Email kontrolü
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ error: 'Bu email adresi zaten kullanılıyor' });
      }

      // Kullanıcı oluştur
      const user = await User.create({
        email,
        password,
        firstName,
        lastName,
        phone,
        role,
        isActive: true
      });

      // Davet kodunu kullanılmış olarak işaretle
      await invite.update({
        isUsed: true,
        usedBy: user.id
      });

      res.status(201).json({
        message: 'Kullanıcı başarıyla oluşturuldu',
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
          role: user.role,
          isActive: user.isActive,
          createdAt: user.createdAt
        }
      });
    } catch (error) {
      console.error('Create user error:', error);
      res.status(500).json({ error: 'Kullanıcı oluşturulurken hata oluştu' });
    }
  }

  /**
   * Update user
   */
  static async updateUser(req, res) {
    try {
      const { userId } = req.params;
      const { email, firstName, lastName, phone, role } = req.body;

      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
      }

      // Email değiştiriliyorsa kontrol et
      if (email && email !== user.email) {
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
          return res.status(400).json({ error: 'Bu email adresi zaten kullanılıyor' });
        }
      }

      await user.update({
        email: email || user.email,
        firstName: firstName || user.firstName,
        lastName: lastName || user.lastName,
        phone: phone || user.phone,
        role: role || user.role
      });

      res.json({
        message: 'Kullanıcı başarıyla güncellendi',
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
          role: user.role,
          isActive: user.isActive,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      });
    } catch (error) {
      console.error('Update user error:', error);
      res.status(500).json({ error: 'Kullanıcı güncellenirken hata oluştu' });
    }
  }

  /**
   * Update user status
   */
  static async updateUserStatus(req, res) {
    try {
      const { userId } = req.params;
      const { isActive } = req.body;

      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
      }

      await user.update({ isActive });

      res.json({
        message: 'Kullanıcı durumu güncellendi',
        user: {
          id: user.id,
          email: user.email,
          isActive: user.isActive
        }
      });
    } catch (error) {
      console.error('Update user status error:', error);
      res.status(500).json({ error: 'Kullanıcı durumu güncellenirken hata oluştu' });
    }
  }

  /**
   * Get KYC applications
   */
  static async getKycApplications(req, res) {
    try {
      const { page = 1, limit = 10, status } = req.query;
      const offset = (page - 1) * limit;

      const whereClause = {};
      if (status) whereClause.status = status;

      const { count, rows } = await Kyc.findAndCountAll({
        where: whereClause,
        include: [{ model: User, attributes: ['firstName', 'lastName', 'email', 'phone'] }],
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      // Transform data to match frontend expectations
      const transformedKycs = rows.map(kyc => ({
        id: kyc.id,
        userId: kyc.userId,
        status: kyc.status,
        documentType: kyc.documentType,
        documentNumber: kyc.documentNumber,
        frontImage: kyc.documentFrontUrl,
        backImage: kyc.documentBackUrl,
        selfieImage: kyc.selfieUrl,
        rejectionReason: kyc.rejectionReason,
        createdAt: kyc.createdAt,
        updatedAt: kyc.updatedAt,
        user: kyc.User
      }));

      res.json({
        kycs: transformedKycs,
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      });
    } catch (error) {
      console.error('Get KYC applications error:', error);
      res.status(500).json({ error: 'KYC başvuruları alınırken hata oluştu' });
    }
  }

  /**
   * Review KYC application
   */
  static async reviewKyc(req, res) {
    try {
      const { kycId } = req.params;
      const { status, rejectionReason } = req.body;
      const reviewedBy = req.user.userId;

      const kyc = await Kyc.findByPk(kycId);
      if (!kyc) {
        return res.status(404).json({ error: 'KYC başvurusu bulunamadı' });
      }

      await kyc.update({
        status,
        rejectionReason: status === 'rejected' ? rejectionReason : null,
        reviewedBy,
        reviewedAt: new Date()
      });

      res.json({
        message: 'KYC başvurusu güncellendi',
        kyc
      });
    } catch (error) {
      console.error('Review KYC error:', error);
      res.status(500).json({ error: 'KYC incelemesi sırasında hata oluştu' });
    }
  }

  /**
   * Get deposits list
   */
  static async getDeposits(req, res) {
    try {
      const { page = 1, limit = 10, status } = req.query;
      const offset = (page - 1) * limit;

      const whereClause = {};
      if (status) whereClause.status = status;

      const { count, rows } = await Deposit.findAndCountAll({
        where: whereClause,
        include: [{ model: User, attributes: ['firstName', 'lastName', 'email'] }],
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
      res.status(500).json({ error: 'Para yatırma işlemleri alınırken hata oluştu' });
    }
  }

  /**
   * Review deposit
   */
  static async reviewDeposit(req, res) {
    try {
      const { depositId } = req.params;
      const { status, rejectionReason } = req.body;
      const reviewedBy = req.user.userId;

      const deposit = await Deposit.findByPk(depositId);
      if (!deposit) {
        return res.status(404).json({ error: 'Para yatırma işlemi bulunamadı' });
      }

      await deposit.update({
        status,
        rejectionReason: status === 'rejected' ? rejectionReason : null,
        reviewedBy,
        reviewedAt: new Date()
      });

      res.json({
        message: 'Para yatırma işlemi güncellendi',
        deposit
      });
    } catch (error) {
      console.error('Review deposit error:', error);
      res.status(500).json({ error: 'Para yatırma incelemesi sırasında hata oluştu' });
    }
  }

  /**
   * Create manual deposit
   */
  static async createManualDeposit(req, res) {
    try {
      const { userId, amount, method, description, transactionId } = req.body;
      const reviewedBy = req.user.userId;

      // Check if user exists
      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
      }

      // Create manual deposit with approved status
      const deposit = await Deposit.create({
        userId,
        amount,
        currency: 'USD',
        method: method || 'manual_payment',
        status: 'approved',
        transactionId: transactionId || `MANUAL_${Date.now()}`,
        bankInfo: {
          description: description || 'Manuel ödeme - Admin tarafından eklendi',
          addedBy: reviewedBy
        },
        reviewedBy,
        reviewedAt: new Date()
      });

      res.status(201).json({
        message: 'Manuel ödeme başarıyla oluşturuldu',
        deposit
      });
    } catch (error) {
      console.error('Create manual deposit error:', error);
      res.status(500).json({ error: 'Manuel ödeme oluşturulurken hata oluştu' });
    }
  }

  /**
   * Create IPO
   */
  static async createIpo(req, res) {
    try {
      const {
        symbol,
        companyName,
        exchange = 'BIST',
        priceMin,
        priceMax,
        lotSize,
        startDate,
        endDate,
        description
      } = req.body;

      const ipo = await Ipo.create({
        symbol,
        companyName,
        exchange,
        priceMin,
        priceMax,
        lotSize,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        description,
        status: 'upcoming',
        createdBy: req.user.userId
      });

      res.status(201).json({
        message: 'IPO başarıyla oluşturuldu',
        ipo
      });
    } catch (error) {
      console.error('Create IPO error:', error);
      res.status(500).json({ error: 'IPO oluşturulurken hata oluştu' });
    }
  }

  /**
   * Get IPOs list
   */
  static async getIpos(req, res) {
    try {
      const { page = 1, limit = 10, status } = req.query;
      const offset = (page - 1) * limit;

      const whereClause = {};
      if (status) whereClause.status = status;

      const { count, rows } = await Ipo.findAndCountAll({
        where: whereClause,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['createdAt', 'DESC']]
      });

      res.json({
        ipos: rows,
        total: count,
        page: parseInt(page),
        totalPages: Math.ceil(count / limit)
      });
    } catch (error) {
      console.error('Get IPOs error:', error);
      res.status(500).json({ error: 'IPO listesi alınırken hata oluştu' });
    }
  }

  /**
   * Update IPO
   */
  static async updateIpo(req, res) {
    try {
      const { ipoId } = req.params;
      const updateData = req.body;

      const ipo = await Ipo.findByPk(ipoId);
      if (!ipo) {
        return res.status(404).json({ error: 'IPO bulunamadı' });
      }

      await ipo.update(updateData);

      res.json({
        message: 'IPO başarıyla güncellendi',
        ipo
      });
    } catch (error) {
      console.error('Update IPO error:', error);
      res.status(500).json({ error: 'IPO güncellenirken hata oluştu' });
    }
  }

  /**
   * Delete IPO
   */
  static async deleteIpo(req, res) {
    try {
      const { ipoId } = req.params;

      const ipo = await Ipo.findByPk(ipoId);
      if (!ipo) {
        return res.status(404).json({ error: 'IPO bulunamadı' });
      }

      await ipo.destroy();

      res.json({ message: 'IPO başarıyla silindi' });
    } catch (error) {
      console.error('Delete IPO error:', error);
      res.status(500).json({ error: 'IPO silinirken hata oluştu' });
    }
  }

  /**
   * Create announcement
   */
  static async createAnnouncement(req, res) {
    try {
      const { title, content, publishDate } = req.body;
      const createdBy = req.user.userId;

      const announcement = await Announcement.create({
        title,
        content,
        publishDate: publishDate ? new Date(publishDate) : new Date(),
        createdBy
      });

      res.status(201).json({
        message: 'Duyuru başarıyla oluşturuldu',
        announcement
      });
    } catch (error) {
      console.error('Create announcement error:', error);
      res.status(500).json({ error: 'Duyuru oluşturulurken hata oluştu' });
    }
  }

  /**
   * Get announcements list
   */
  static async getAnnouncements(req, res) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;

      const { count, rows } = await Announcement.findAndCountAll({
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['createdAt', 'DESC']]
      });

      res.json({
        announcements: rows,
        total: count,
        page: parseInt(page),
        totalPages: Math.ceil(count / limit)
      });
    } catch (error) {
      console.error('Get announcements error:', error);
      res.status(500).json({ error: 'Duyuru listesi alınırken hata oluştu' });
    }
  }

  /**
   * Update announcement
   */
  static async updateAnnouncement(req, res) {
    try {
      const { announcementId } = req.params;
      const updateData = req.body;

      const announcement = await Announcement.findByPk(announcementId);
      if (!announcement) {
        return res.status(404).json({ error: 'Duyuru bulunamadı' });
      }

      await announcement.update(updateData);

      res.json({
        message: 'Duyuru başarıyla güncellendi',
        announcement
      });
    } catch (error) {
      console.error('Update announcement error:', error);
      res.status(500).json({ error: 'Duyuru güncellenirken hata oluştu' });
    }
  }

  /**
   * Delete announcement
   */
  static async deleteAnnouncement(req, res) {
    try {
      const { announcementId } = req.params;

      const announcement = await Announcement.findByPk(announcementId);
      if (!announcement) {
        return res.status(404).json({ error: 'Duyuru bulunamadı' });
      }

      await announcement.destroy();

      res.json({ message: 'Duyuru başarıyla silindi' });
    } catch (error) {
      console.error('Delete announcement error:', error);
      res.status(500).json({ error: 'Duyuru silinirken hata oluştu' });
    }
  }

  /**
   * Get dashboard statistics
   */
  static async getDashboardStats(req, res) {
    try {
      const [totalUsers, activeUsers, pendingKyc, totalDeposits, pendingDeposits, totalIpos, activeIpos, totalStocks, activeStocks] = await Promise.all([
        User.count(),
        User.count({ where: { isActive: true } }),
        Kyc.count({ where: { status: 'pending' } }),
        Deposit.count(),
        Deposit.count({ where: { status: 'pending' } }),
        Ipo.count(),
        Ipo.count({ where: { status: 'ongoing' } }),
        Stock.count(),
        Stock.count({ where: { status: 'active' } })
      ]);

      // Calculate system health based on pending items
      let systemHealth = 'good';
      const totalPending = pendingKyc + pendingDeposits;
      if (totalPending > 50) {
        systemHealth = 'critical';
      } else if (totalPending > 20) {
        systemHealth = 'warning';
      }

      res.json({
        totalUsers,
        activeUsers,
        pendingKyc,
        totalIpos,
        activeIpos,
        totalDeposits,
        pendingDeposits,
        totalStocks,
        activeStocks,
        systemHealth
      });
    } catch (error) {
      console.error('Get dashboard stats error:', error);
      res.status(500).json({ error: 'Dashboard istatistikleri alınırken hata oluştu' });
    }
  }

  /**
   * Get payment methods
   */
  static async getPaymentMethods(req, res) {
    try {
      const paymentMethods = await PaymentMethod.findAll({
        order: [['sortOrder', 'ASC'], ['createdAt', 'DESC']]
      });
      
      res.json(paymentMethods);
    } catch (error) {
      console.error('Get payment methods error:', error);
      res.status(500).json({ error: 'Ödeme yöntemleri alınırken hata oluştu' });
    }
  }

  /**
   * Create payment method
   */
  static async createPaymentMethod(req, res) {
    try {
      const {
        name,
        type,
        description,
        details,
        isActive = true,
        isVisible = true,
        sortOrder = 0,
        minAmount,
        maxAmount,
        commission = 0,
        processingTime,
        instructions
      } = req.body;

      const paymentMethod = await PaymentMethod.create({
        name,
        type,
        description,
        details,
        isActive,
        isVisible,
        sortOrder,
        minAmount,
        maxAmount,
        commission,
        processingTime,
        instructions
      });

      res.status(201).json({
        message: 'Ödeme yöntemi başarıyla oluşturuldu',
        paymentMethod
      });
    } catch (error) {
      console.error('Create payment method error:', error);
      res.status(500).json({ error: 'Ödeme yöntemi oluşturulurken hata oluştu' });
    }
  }

  /**
   * Update payment method
   */
  static async updatePaymentMethod(req, res) {
    try {
      const { id } = req.params;
      const {
        name,
        type,
        description,
        details,
        isActive,
        isVisible,
        sortOrder,
        minAmount,
        maxAmount,
        commission,
        processingTime,
        instructions
      } = req.body;

      const paymentMethod = await PaymentMethod.findByPk(id);
      if (!paymentMethod) {
        return res.status(404).json({ error: 'Ödeme yöntemi bulunamadı' });
      }

      await paymentMethod.update({
        name,
        type,
        description,
        details,
        isActive,
        isVisible,
        sortOrder,
        minAmount,
        maxAmount,
        commission,
        processingTime,
        instructions
      });

      res.json({
        message: 'Ödeme yöntemi başarıyla güncellendi',
        paymentMethod
      });
    } catch (error) {
      console.error('Update payment method error:', error);
      res.status(500).json({ error: 'Ödeme yöntemi güncellenirken hata oluştu' });
    }
  }

  /**
   * Delete payment method
   */
  static async deletePaymentMethod(req, res) {
    try {
      const { id } = req.params;

      const paymentMethod = await PaymentMethod.findByPk(id);
      if (!paymentMethod) {
        return res.status(404).json({ error: 'Ödeme yöntemi bulunamadı' });
      }

      await paymentMethod.destroy();

      res.json({ message: 'Ödeme yöntemi başarıyla silindi' });
    } catch (error) {
      console.error('Delete payment method error:', error);
      res.status(500).json({ error: 'Ödeme yöntemi silinirken hata oluştu' });
    }
  }

  /**
   * Toggle payment method status
   */
  static async togglePaymentMethodStatus(req, res) {
    try {
      const { id } = req.params;
      const { field, value } = req.body; // field: 'isActive' or 'isVisible'

      const paymentMethod = await PaymentMethod.findByPk(id);
      if (!paymentMethod) {
        return res.status(404).json({ error: 'Ödeme yöntemi bulunamadı' });
      }

      if (!['isActive', 'isVisible'].includes(field)) {
        return res.status(400).json({ error: 'Geçersiz alan' });
      }

      await paymentMethod.update({ [field]: value });

      res.json({
        message: 'Ödeme yöntemi durumu güncellendi',
        paymentMethod
      });
    } catch (error) {
      console.error('Toggle payment method status error:', error);
      res.status(500).json({ error: 'Ödeme yöntemi durumu güncellenirken hata oluştu' });
    }
  }

  /**
   * Get reports
   */
  static async getReports(req, res) {
    try {
      const { type, startDate, endDate } = req.query;

      let data = {};

      if (type === 'users' || !type) {
        const userStats = await User.findAll({
          attributes: [
            [User.sequelize.fn('DATE', User.sequelize.col('createdAt')), 'date'],
            [User.sequelize.fn('COUNT', User.sequelize.col('id')), 'count']
          ],
          where: startDate && endDate ? {
            createdAt: {
              [Op.between]: [new Date(startDate), new Date(endDate)]
            }
          } : {},
          group: [User.sequelize.fn('DATE', User.sequelize.col('createdAt'))],
          order: [[User.sequelize.fn('DATE', User.sequelize.col('createdAt')), 'ASC']]
        });
        data.users = userStats;
      }

      if (type === 'deposits' || !type) {
        const depositStats = await Deposit.findAll({
          attributes: [
            [Deposit.sequelize.fn('DATE', Deposit.sequelize.col('createdAt')), 'date'],
            [Deposit.sequelize.fn('COUNT', Deposit.sequelize.col('id')), 'count'],
            [Deposit.sequelize.fn('SUM', Deposit.sequelize.col('amount')), 'total']
          ],
          where: startDate && endDate ? {
            createdAt: {
              [Op.between]: [new Date(startDate), new Date(endDate)]
            }
          } : {},
          group: [Deposit.sequelize.fn('DATE', Deposit.sequelize.col('createdAt'))],
          order: [[Deposit.sequelize.fn('DATE', Deposit.sequelize.col('createdAt')), 'ASC']]
        });
        data.deposits = depositStats;
      }

      res.json({ data });
    } catch (error) {
      console.error('Get reports error:', error);
      res.status(500).json({ error: 'Raporlar alınırken hata oluştu' });
    }
  }

  /**
   * Export report
   */
  static async exportReport(req, res) {
    try {
      const { type, format = 'csv', startDate, endDate } = req.query;

      let data = [];
      let filename = '';
      let headers = [];

      switch (type) {
        case 'users':
          data = await User.findAll({
            attributes: ['id', 'email', 'firstName', 'lastName', 'createdAt', 'isActive'],
            where: startDate && endDate ? {
              createdAt: {
                [Op.between]: [new Date(startDate), new Date(endDate)]
              }
            } : {},
            raw: true
          });
          headers = ['ID', 'Email', 'Ad', 'Soyad', 'Kayıt Tarihi', 'Aktif'];
          filename = `users_${new Date().toISOString().split('T')[0]}`;
          break;

        case 'deposits':
          data = await Deposit.findAll({
            include: [{
              model: User,
              attributes: ['email', 'firstName', 'lastName']
            }],
            where: startDate && endDate ? {
              createdAt: {
                [Op.between]: [new Date(startDate), new Date(endDate)]
              }
            } : {},
            raw: true,
            nest: true
          });
          headers = ['ID', 'Kullanıcı', 'Miktar', 'Durum', 'Tarih'];
          filename = `deposits_${new Date().toISOString().split('T')[0]}`;
          break;

        case 'kyc':
          data = await Kyc.findAll({
            include: [{
              model: User,
              attributes: ['email', 'firstName', 'lastName']
            }],
            where: startDate && endDate ? {
              createdAt: {
                [Op.between]: [new Date(startDate), new Date(endDate)]
              }
            } : {},
            raw: true,
            nest: true
          });
          headers = ['ID', 'Kullanıcı', 'Durum', 'Tarih'];
          filename = `kyc_${new Date().toISOString().split('T')[0]}`;
          break;

        default:
          return res.status(400).json({ error: 'Geçersiz rapor tipi' });
      }

      if (format === 'csv') {
        // CSV formatında export
        let csv = headers.join(',') + '\n';
        data.forEach(row => {
          const values = Object.values(row).map(val => 
            typeof val === 'string' && val.includes(',') ? `"${val}"` : val
          );
          csv += values.join(',') + '\n';
        });

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=${filename}.csv`);
        res.send(csv);
      } else {
        // JSON formatında export
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename=${filename}.json`);
        res.json(data);
      }
    } catch (error) {
      console.error('Export report error:', error);
      res.status(500).json({ error: 'Rapor dışa aktarılırken hata oluştu' });
    }
  }

  /**
   * Get all support tickets for admin
   */
  static async getSupportTickets(req, res) {
    try {
      const { page = 1, limit = 20, status, category, priority } = req.query;
      const offset = (page - 1) * limit;

      // Use shared ticket store data
       // In a real implementation, this would be a database query

      // Filter tickets based on query parameters
      let filteredTickets = TicketStore.getTickets();
      if (status) {
        filteredTickets = filteredTickets.filter(ticket => ticket.status === status);
      }
      if (category) {
        filteredTickets = filteredTickets.filter(ticket => ticket.category === category);
      }
      if (priority) {
        filteredTickets = filteredTickets.filter(ticket => ticket.priority === priority);
      }

      // Pagination
      const total = filteredTickets.length;
      const paginatedTickets = filteredTickets.slice(offset, offset + parseInt(limit));

      res.json({
        success: true,
        data: paginatedTickets,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Get support tickets error:', error);
      res.status(500).json({ error: 'Destek talepleri alınırken hata oluştu' });
    }
  }

  /**
   * Get support ticket by ID
   */
  static async getTicketById(req, res) {
    try {
      const { ticketId } = req.params;
      const ticket = TicketStore.getTicketById(parseInt(ticketId));
      
      if (!ticket) {
        return res.status(404).json({ error: 'Destek talebi bulunamadı' });
      }

      res.json({
        success: true,
        data: ticket
      });
    } catch (error) {
      console.error('Get ticket by ID error:', error);
      res.status(500).json({ error: 'Destek talebi alınırken hata oluştu' });
    }
  }

  /**
   * Update support ticket status
   */
  static async updateTicketStatus(req, res) {
    try {
      const { ticketId } = req.params;
      const { status, adminNote } = req.body;

      // Find and update ticket
      const ticket = TicketStore.updateTicketStatus(ticketId, status);
      if (!ticket) {
        return res.status(404).json({ error: 'Destek talebi bulunamadı' });
      }

      res.json({
        success: true,
        message: 'Destek talebi durumu başarıyla güncellendi',
        data: ticket
      });
    } catch (error) {
      console.error('Update ticket status error:', error);
      res.status(500).json({ error: 'Destek talebi durumu güncellenirken hata oluştu' });
    }
  }

  /**
   * Send admin message to support ticket
   */
  static async sendAdminMessage(req, res) {
    try {
      const { ticketId } = req.params;
      const { message } = req.body;
      const adminId = req.user.userId;

      // Find the ticket
      const ticket = TicketStore.getTicketById(ticketId);
      if (!ticket) {
        return res.status(404).json({ error: 'Destek talebi bulunamadı' });
      }

      // Create new admin message
      const newMessage = {
        id: Date.now(),
        ticketId: parseInt(ticketId),
        senderId: adminId,
        senderType: 'admin',
        message,
        createdAt: new Date().toISOString(),
        sender: {
          firstName: req.user.firstName || 'Admin',
          lastName: req.user.lastName || 'Support',
          email: req.user.email,
          role: 'admin'
        }
      };

      // Add message to ticket using store
      const addedMessage = TicketStore.addMessage(ticketId, newMessage);
      if (!addedMessage) {
        return res.status(500).json({ error: 'Mesaj eklenirken hata oluştu' });
      }

      res.json({
        success: true,
        message: 'Admin mesajı başarıyla gönderildi',
        data: newMessage
      });
    } catch (error) {
      console.error('Send admin message error:', error);
      res.status(500).json({ error: 'Admin mesajı gönderilirken hata oluştu' });
    }
  }

  /**
   * Create stock
   */
  static async createStock(req, res) {
    try {
      const {
        symbol,
        companyName,
        exchange = 'BIST',
        currentPrice,
        openPrice,
        highPrice,
        lowPrice,
        previousClose,
        volume,
        marketCap,
        sector,
        description,
        website
      } = req.body;

      const stock = await Stock.create({
        symbol,
        companyName,
        exchange,
        currentPrice,
        openPrice,
        highPrice,
        lowPrice,
        previousClose,
        volume,
        marketCap,
        sector,
        description,
        website,
        status: 'active',
        createdBy: req.user.userId
      });

      res.status(201).json({
        message: 'Hisse senedi başarıyla oluşturuldu',
        stock
      });
    } catch (error) {
      console.error('Create stock error:', error);
      res.status(500).json({ error: 'Hisse senedi oluşturulurken hata oluştu' });
    }
  }

  /**
   * Get stocks list
   */
  static async getStocks(req, res) {
    try {
      const { page = 1, limit = 10, status, exchange, sector } = req.query;
      const offset = (page - 1) * limit;

      const whereClause = {};
      if (status) whereClause.status = status;
      if (exchange) whereClause.exchange = exchange;
      if (sector) whereClause.sector = sector;

      const { count, rows } = await Stock.findAndCountAll({
        where: whereClause,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['createdAt', 'DESC']]
      });

      res.json({
        stocks: rows,
        total: count,
        page: parseInt(page),
        totalPages: Math.ceil(count / limit)
      });
    } catch (error) {
      console.error('Get stocks error:', error);
      res.status(500).json({ error: 'Hisse senedi listesi alınırken hata oluştu' });
    }
  }

  /**
   * Update stock
   */
  static async updateStock(req, res) {
    try {
      const { stockId } = req.params;
      const updateData = req.body;

      const stock = await Stock.findByPk(stockId);
      if (!stock) {
        return res.status(404).json({ error: 'Hisse senedi bulunamadı' });
      }

      await stock.update(updateData);

      res.json({
        message: 'Hisse senedi başarıyla güncellendi',
        stock
      });
    } catch (error) {
      console.error('Update stock error:', error);
      res.status(500).json({ error: 'Hisse senedi güncellenirken hata oluştu' });
    }
  }

  /**
   * Delete stock
   */
  static async deleteStock(req, res) {
    try {
      const { id } = req.params;

      const stock = await Stock.findByPk(id);
      if (!stock) {
        return res.status(404).json({ error: 'Hisse senedi bulunamadı' });
      }

      await stock.destroy();

      res.json({ message: 'Hisse senedi başarıyla silindi' });
    } catch (error) {
      console.error('Delete stock error:', error);
      res.status(500).json({ error: 'Hisse senedi silinirken hata oluştu' });
    }
  }

  /**
   * Get currency rates
   */
  static async getCurrencyRates(req, res) {
    try {
      const rates = await CurrencyRate.getActiveRates();
      res.json({ rates });
    } catch (error) {
      console.error('Get currency rates error:', error);
      res.status(500).json({ error: 'Kurlar getirilirken hata oluştu' });
    }
  }

  /**
   * Update currency rate
   */
  static async updateCurrencyRate(req, res) {
    try {
      const { fromCurrency, toCurrency, rate } = req.body;
      const lastUpdatedBy = req.user.userId;

      if (!fromCurrency || !toCurrency || !rate) {
        return res.status(400).json({ error: 'Tüm alanlar gereklidir' });
      }

      if (rate <= 0) {
        return res.status(400).json({ error: 'Kur değeri 0\'dan büyük olmalıdır' });
      }

      const [currencyRate, created] = await CurrencyRate.findOrCreate({
        where: { fromCurrency, toCurrency },
        defaults: {
          fromCurrency,
          toCurrency,
          rate,
          isActive: true,
          isManual: true,
          lastUpdatedBy
        }
      });

      if (!created) {
        await currencyRate.update({
          rate,
          lastUpdatedBy,
          updatedAt: new Date()
        });
      }

      res.json({
        message: created ? 'Kur başarıyla oluşturuldu' : 'Kur başarıyla güncellendi',
        rate: currencyRate
      });
    } catch (error) {
      console.error('Update currency rate error:', error);
      res.status(500).json({ error: 'Kur güncellenirken hata oluştu' });
    }
  }

  /**
   * Convert currency
   */
  static async convertCurrency(req, res) {
    try {
      const { amount, fromCurrency, toCurrency } = req.query;

      if (!amount || !fromCurrency || !toCurrency) {
        return res.status(400).json({ error: 'Tüm parametreler gereklidir' });
      }

      const convertedAmount = await CurrencyRate.convertCurrency(
        parseFloat(amount),
        fromCurrency,
        toCurrency
      );

      res.json({
        originalAmount: parseFloat(amount),
        fromCurrency,
        toCurrency,
        convertedAmount,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Convert currency error:', error);
      res.status(500).json({ error: error.message || 'Kur çevirme hatası' });
    }
  }
}

module.exports = AdminController;