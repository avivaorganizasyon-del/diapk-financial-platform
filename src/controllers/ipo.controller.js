const { Ipo, IpoSubscription, User } = require('../models');
const { Op } = require('sequelize');

class IpoController {
  /**
   * Get IPO list with filtering and pagination
   */
  static async list(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        status,
        exchange,
        sortBy = 'startDate',
        sortOrder = 'DESC'
      } = req.query;

      const offset = (page - 1) * limit;
      const whereClause = {};

      // Status filtresi
      if (status) {
        whereClause.status = status;
      }

      // Exchange filtresi
      if (exchange) {
        whereClause.exchange = exchange;
      }

      // Sıralama kontrolü
      const allowedSortFields = ['startDate', 'endDate', 'symbol', 'companyName', 'priceMin', 'priceMax'];
      const orderField = allowedSortFields.includes(sortBy) ? sortBy : 'startDate';
      const orderDirection = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

      const { count, rows } = await Ipo.findAndCountAll({
        where: whereClause,
        include: [{
          model: User,
          as: 'creator',
          attributes: ['firstName', 'lastName']
        }],
        order: [[orderField, orderDirection]],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      res.json({
        ipos: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit)
        }
      });
    } catch (error) {
      console.error('IPO list error:', error);
      res.status(500).json({ error: 'IPO listesi alınırken hata oluştu' });
    }
  }

  /**
   * Get IPO details by ID
   */
  static async get(req, res) {
    try {
      const { id } = req.params;

      const ipo = await Ipo.findByPk(id, {
        include: [{
          model: User,
          as: 'creator',
          attributes: ['firstName', 'lastName']
        }]
      });

      if (!ipo) {
        return res.status(404).json({ error: 'IPO bulunamadı' });
      }

      // Kullanıcının bu IPO'ya başvurusu var mı?
      let userSubscription = null;
      if (req.user) {
        userSubscription = await IpoSubscription.findOne({
          where: {
            userId: req.user.userId,
            ipoId: id
          }
        });
      }

      res.json({
        ipo,
        userSubscription
      });
    } catch (error) {
      console.error('IPO get error:', error);
      res.status(500).json({ error: 'IPO bilgisi alınırken hata oluştu' });
    }
  }

  /**
   * Subscribe to IPO
   */
  static async subscribe(req, res) {
    try {
      const { id } = req.params;
      const { quantity, pricePerShare } = req.body;
      const userId = req.user.userId;

      // IPO kontrolü
      const ipo = await Ipo.findByPk(id);
      if (!ipo) {
        return res.status(404).json({ error: 'IPO bulunamadı' });
      }

      // IPO durumu kontrolü
      if (ipo.status !== 'ongoing') {
        return res.status(400).json({ error: 'Bu IPO için başvuru süresi geçmiş veya henüz başlamamış' });
      }

      // Tarih kontrolü
      const now = new Date();
      if (now < ipo.startDate || now > ipo.endDate) {
        return res.status(400).json({ error: 'IPO başvuru süresi dışında' });
      }

      // Fiyat kontrolü
      if (pricePerShare < ipo.priceMin || pricePerShare > ipo.priceMax) {
        return res.status(400).json({ 
          error: `Fiyat ${ipo.priceMin} - ${ipo.priceMax} TL arasında olmalıdır` 
        });
      }

      // Lot kontrolü
      if (quantity % ipo.lotSize !== 0) {
        return res.status(400).json({ 
          error: `Miktar ${ipo.lotSize} lot katı olmalıdır` 
        });
      }

      // Daha önce başvuru yapılmış mı?
      const existingSubscription = await IpoSubscription.findOne({
        where: { userId, ipoId: id }
      });

      if (existingSubscription) {
        return res.status(400).json({ error: 'Bu IPO için zaten başvuru yapmışsınız' });
      }

      // Toplam tutar hesapla
      const totalAmount = quantity * pricePerShare;

      // Kullanıcının bakiyesini kontrol et
      const { Deposit } = require('../models');
      const approvedDeposits = await Deposit.findAll({
        where: {
          userId,
          status: 'approved'
        }
      });
      
      const totalBalance = approvedDeposits.reduce((sum, deposit) => sum + parseFloat(deposit.amount), 0);
      
      // Kullanıcının mevcut IPO aboneliklerinin toplam tutarını hesapla
      const existingSubscriptions = await IpoSubscription.findAll({
        where: {
          userId,
          status: { [Op.in]: ['pending', 'confirmed'] }
        }
      });
      
      const reservedAmount = existingSubscriptions.reduce((sum, sub) => sum + parseFloat(sub.totalAmount), 0);
      const availableBalance = totalBalance - reservedAmount;
      
      // Bakiye kontrolü
      if (availableBalance < totalAmount) {
        return res.status(400).json({ 
          error: `Yetersiz bakiye. Mevcut bakiye: ${availableBalance.toFixed(2)} TL, Gerekli tutar: ${totalAmount.toFixed(2)} TL` 
        });
      }

      // Başvuru oluştur
      const subscription = await IpoSubscription.create({
        userId,
        ipoId: id,
        quantity,
        pricePerShare,
        totalAmount
      });

      res.status(201).json({
        message: 'IPO başvurusu başarıyla oluşturuldu',
        subscription
      });
    } catch (error) {
      console.error('IPO subscribe error:', error);
      res.status(500).json({ error: 'IPO başvurusu sırasında hata oluştu' });
    }
  }

  /**
   * Get user's IPO subscriptions
   */
  static async mySubscriptions(req, res) {
    try {
      const { page = 1, limit = 10, status } = req.query;
      const offset = (page - 1) * limit;
      const userId = req.user.userId;

      const whereClause = { userId };
      if (status) {
        whereClause.status = status;
      }

      const { count, rows } = await IpoSubscription.findAndCountAll({
        where: whereClause,
        include: [{
          model: Ipo,
          attributes: ['symbol', 'companyName', 'exchange', 'status', 'startDate', 'endDate']
        }],
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      res.json({
        subscriptions: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit)
        }
      });
    } catch (error) {
      console.error('My subscriptions error:', error);
      res.status(500).json({ error: 'IPO başvurularınız alınırken hata oluştu' });
    }
  }

  /**
   * Cancel IPO subscription
   */
  static async cancelSubscription(req, res) {
    try {
      const { subscriptionId } = req.params;
      const userId = req.user.userId;

      const subscription = await IpoSubscription.findOne({
        where: {
          id: subscriptionId,
          userId
        },
        include: [{ model: Ipo }]
      });

      if (!subscription) {
        return res.status(404).json({ error: 'Başvuru bulunamadı' });
      }

      // IPO durumu kontrolü
      if (subscription.Ipo.status !== 'ongoing') {
        return res.status(400).json({ error: 'Bu IPO için iptal süresi geçmiş' });
      }

      // Başvuru durumu kontrolü
      if (subscription.status !== 'pending') {
        return res.status(400).json({ error: 'Bu başvuru iptal edilemez' });
      }

      await subscription.destroy();

      res.json({ message: 'IPO başvurusu başarıyla iptal edildi' });
    } catch (error) {
      console.error('Cancel subscription error:', error);
      res.status(500).json({ error: 'Başvuru iptali sırasında hata oluştu' });
    }
  }

  /**
   * Get active IPOs
   */
  static async active(req, res) {
    try {
      const { limit = 5 } = req.query;

      const ipos = await Ipo.findAll({
        where: {
          status: { [Op.in]: ['ongoing', 'active'] }
        },
        attributes: ['id', 'symbol', 'companyName', 'exchange', 'priceMin', 'priceMax', 'lotSize', 'startDate', 'endDate', 'status', 'description', 'createdAt', 'updatedAt'],
        order: [['endDate', 'ASC']],
        limit: parseInt(limit)
      });

      res.json({ ipos });
    } catch (error) {
      console.error('Active IPOs error:', error);
      res.status(500).json({ error: 'Aktif IPO\'lar alınırken hata oluştu' });
    }
  }

  /**
   * Get upcoming IPOs
   */
  static async upcoming(req, res) {
    try {
      const { limit = 5 } = req.query;

      const ipos = await Ipo.findAll({
        where: {
          status: 'upcoming',
          startDate: { [Op.gt]: new Date() }
        },
        attributes: ['id', 'symbol', 'companyName', 'exchange', 'priceMin', 'priceMax', 'lotSize', 'startDate', 'endDate', 'status', 'description', 'createdAt', 'updatedAt'],
        order: [['startDate', 'ASC']],
        limit: parseInt(limit)
      });

      res.json({ ipos });
    } catch (error) {
      console.error('Upcoming IPOs error:', error);
      res.status(500).json({ error: 'Yaklaşan IPO\'lar alınırken hata oluştu' });
    }
  }
}

module.exports = IpoController;