const { StockQuote, Stock, Portfolio, StockTransaction, User } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('../config/db');

class StockController {
  /**
   * Get stock list with filtering and pagination
   */
  static async list(req, res) {
    try {
      const {
        page = 1,
        limit = 20,
        exchange,
        search,
        status,
        sortBy = 'symbol',
        sortOrder = 'ASC'
      } = req.query;

      const offset = (page - 1) * limit;
      const whereClause = {};

      // Exchange filtresi
      if (exchange) {
        whereClause.exchange = exchange;
      }

      // Status filtresi
      if (status) {
        whereClause.status = status;
      }

      // Arama filtresi
      if (search) {
        whereClause.symbol = {
          [Op.like]: `%${search.toUpperCase()}%`
        };
      }

      // Sıralama kontrolü
      const allowedSortFields = ['symbol', 'price', 'changePercent', 'volume', 'lastUpdated'];
      const orderField = allowedSortFields.includes(sortBy) ? sortBy : 'symbol';
      const orderDirection = sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

      const { count, rows } = await Stock.findAndCountAll({
        where: whereClause,
        order: [[orderField, orderDirection]],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      // Decimal değerleri number'a dönüştür
      const formattedStocks = rows.map(stock => ({
        ...stock.toJSON(),
        price: parseFloat(stock.price) || 0,
        changePercent: parseFloat(stock.changePercent) || 0,
        changeAmount: parseFloat(stock.changeAmount) || 0,
        volume: parseInt(stock.volume) || 0,
        high: parseFloat(stock.high) || 0,
        low: parseFloat(stock.low) || 0,
        open: parseFloat(stock.open) || 0,
        previousClose: parseFloat(stock.previousClose) || 0
      }));

      res.json({
        stocks: formattedStocks,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit)
        }
      });
    } catch (error) {
      console.error('Stock list error:', error);
      res.status(500).json({ error: 'Hisse senetleri alınırken hata oluştu' });
    }
  }

  /**
   * Get stock details by symbol
   */
  static async get(req, res) {
    try {
      const { symbol } = req.params;
      const { exchange = 'BIST' } = req.query;

      const stock = await StockQuote.findOne({
        where: {
          symbol: symbol.toUpperCase(),
          exchange
        }
      });

      if (!stock) {
        return res.status(404).json({ error: 'Hisse senedi bulunamadı' });
      }

      // Decimal değerleri number'a dönüştür
      const formattedStock = {
        ...stock.toJSON(),
        price: parseFloat(stock.price) || 0,
        changePercent: parseFloat(stock.changePercent) || 0,
        changeAmount: parseFloat(stock.changeAmount) || 0,
        volume: parseInt(stock.volume) || 0,
        high: parseFloat(stock.high) || 0,
        low: parseFloat(stock.low) || 0,
        open: parseFloat(stock.open) || 0,
        previousClose: parseFloat(stock.previousClose) || 0
      };

      res.json({ stock: formattedStock });
    } catch (error) {
      console.error('Stock get error:', error);
      res.status(500).json({ error: 'Hisse senedi bilgisi alınırken hata oluştu' });
    }
  }

  /**
   * Get popular stocks
   */
  static async popular(req, res) {
    try {
      const { limit = 10, exchange } = req.query;
      const whereClause = {};

      if (exchange) {
        whereClause.exchange = exchange;
      }

      const stocks = await StockQuote.findAll({
        where: {
          ...whereClause,
          volume: {
            [Op.not]: null
          }
        },
        order: [['volume', 'DESC']],
        limit: parseInt(limit)
      });

      // Decimal değerleri number'a dönüştür
      const formattedStocks = stocks.map(stock => ({
        ...stock.toJSON(),
        price: parseFloat(stock.price) || 0,
        changePercent: parseFloat(stock.changePercent) || 0,
        changeAmount: parseFloat(stock.changeAmount) || 0,
        volume: parseInt(stock.volume) || 0,
        high: parseFloat(stock.high) || 0,
        low: parseFloat(stock.low) || 0,
        open: parseFloat(stock.open) || 0,
        previousClose: parseFloat(stock.previousClose) || 0
      }));

      res.json({ stocks: formattedStocks });
    } catch (error) {
      console.error('Popular stocks error:', error);
      res.status(500).json({ error: 'Popüler hisseler alınırken hata oluştu' });
    }
  }

  /**
   * Get top gainers
   */
  static async gainers(req, res) {
    try {
      const { limit = 10, exchange } = req.query;
      const whereClause = {};

      if (exchange) {
        whereClause.exchange = exchange;
      }

      const stocks = await StockQuote.findAll({
        where: {
          ...whereClause,
          changePercent: {
            [Op.gt]: 0
          }
        },
        order: [['changePercent', 'DESC']],
        limit: parseInt(limit)
      });

      // Decimal değerleri number'a dönüştür
      const formattedStocks = stocks.map(stock => ({
        ...stock.toJSON(),
        price: parseFloat(stock.price) || 0,
        changePercent: parseFloat(stock.changePercent) || 0,
        changeAmount: parseFloat(stock.changeAmount) || 0,
        volume: parseInt(stock.volume) || 0,
        high: parseFloat(stock.high) || 0,
        low: parseFloat(stock.low) || 0,
        open: parseFloat(stock.open) || 0,
        previousClose: parseFloat(stock.previousClose) || 0
      }));

      res.json({ stocks: formattedStocks });
    } catch (error) {
      console.error('Gainers error:', error);
      res.status(500).json({ error: 'Yükselen hisseler alınırken hata oluştu' });
    }
  }

  /**
   * Get top losers
   */
  static async losers(req, res) {
    try {
      const { limit = 10, exchange } = req.query;
      const whereClause = {};

      if (exchange) {
        whereClause.exchange = exchange;
      }

      const stocks = await StockQuote.findAll({
        where: {
          ...whereClause,
          changePercent: {
            [Op.lt]: 0
          }
        },
        order: [['changePercent', 'ASC']],
        limit: parseInt(limit)
      });

      // Decimal değerleri number'a dönüştür
      const formattedStocks = stocks.map(stock => ({
        ...stock.toJSON(),
        price: parseFloat(stock.price) || 0,
        changePercent: parseFloat(stock.changePercent) || 0,
        changeAmount: parseFloat(stock.changeAmount) || 0,
        volume: parseInt(stock.volume) || 0,
        high: parseFloat(stock.high) || 0,
        low: parseFloat(stock.low) || 0,
        open: parseFloat(stock.open) || 0,
        previousClose: parseFloat(stock.previousClose) || 0
      }));

      res.json({ stocks: formattedStocks });
    } catch (error) {
      console.error('Losers error:', error);
      res.status(500).json({ error: 'Düşen hisseler alınırken hata oluştu' });
    }
  }

  /**
   * Get market summary
   */
  static async marketSummary(req, res) {
    try {
      const { exchange = 'BIST' } = req.query;

      const [totalStocks, gainers, losers, unchanged] = await Promise.all([
        StockQuote.count({ where: { exchange } }),
        StockQuote.count({
          where: {
            exchange,
            changePercent: { [Op.gt]: 0 }
          }
        }),
        StockQuote.count({
          where: {
            exchange,
            changePercent: { [Op.lt]: 0 }
          }
        }),
        StockQuote.count({
          where: {
            exchange,
            changePercent: 0
          }
        })
      ]);

      res.json({
        summary: {
          exchange,
          totalStocks,
          gainers,
          losers,
          unchanged,
          lastUpdated: new Date()
        }
      });
    } catch (error) {
      console.error('Market summary error:', error);
      res.status(500).json({ error: 'Borsa özeti alınırken hata oluştu' });
    }
  }

  /**
   * Search stocks
   */
  static async search(req, res) {
    try {
      const { q, limit = 10, exchange } = req.query;

      if (!q || q.length < 2) {
        return res.json({ stocks: [] });
      }

      const whereClause = {
        symbol: {
          [Op.like]: `%${q.toUpperCase()}%`
        }
      };

      if (exchange) {
        whereClause.exchange = exchange;
      }

      const stocks = await StockQuote.findAll({
        where: whereClause,
        attributes: ['symbol', 'exchange', 'price', 'changePercent'],
        order: [['symbol', 'ASC']],
        limit: parseInt(limit)
      });

      // Decimal değerleri number'a dönüştür
      const formattedStocks = stocks.map(stock => ({
        ...stock.toJSON(),
        price: parseFloat(stock.price) || 0,
        changePercent: parseFloat(stock.changePercent) || 0
      }));

      res.json({ stocks: formattedStocks });
    } catch (error) {
      console.error('Stock search error:', error);
      res.status(500).json({ error: 'Hisse arama sırasında hata oluştu' });
    }
  }

  /**
   * Get user portfolio
   */
  static async getUserPortfolio(req, res) {
    try {
      const userId = req.user.userId;

      const portfolio = await Portfolio.findAll({
        where: { userId },
        include: [
          {
            model: Stock,
            attributes: ['id', 'symbol', 'companyName', 'currentPrice']
          }
        ],
        order: [['lastTransactionDate', 'DESC']]
      });

      // Calculate total portfolio value
      let totalValue = 0;
      let totalCost = 0;
      const portfolioWithValues = portfolio.map(item => {
        const currentValue = item.quantity * (item.Stock?.currentPrice || 0);
        const gainLoss = currentValue - item.totalCost;
        const gainLossPercent = item.totalCost > 0 ? (gainLoss / item.totalCost) * 100 : 0;
        
        totalValue += currentValue;
        totalCost += parseFloat(item.totalCost);
        
        return {
          ...item.toJSON(),
          currentValue,
          gainLoss,
          gainLossPercent
        };
      });

      const totalGainLoss = totalValue - totalCost;
      const totalGainLossPercent = totalCost > 0 ? (totalGainLoss / totalCost) * 100 : 0;

      res.json({
        success: true,
        data: {
          portfolio: portfolioWithValues,
          summary: {
            totalValue,
            totalCost,
            totalGainLoss,
            totalGainLossPercent,
            totalStocks: portfolio.length
          }
        }
      });
    } catch (error) {
      console.error('Error fetching user portfolio:', error);
      res.status(500).json({
        success: false,
        message: 'Portföy bilgileri alınırken hata oluştu'
      });
    }
  }

  /**
   * Buy stock
   */
  static async buyStock(req, res) {
    const transaction = await sequelize.transaction();
    
    try {
      const userId = req.user.userId;
      const { stockId, quantity, pricePerShare } = req.body;

      // Validate input
      if (!stockId || !quantity || !pricePerShare || quantity <= 0 || pricePerShare <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Geçersiz işlem bilgileri'
        });
      }

      // Check if stock exists
      const stock = await Stock.findByPk(stockId);
      if (!stock) {
        return res.status(404).json({
          success: false,
          message: 'Hisse senedi bulunamadı'
        });
      }

      const totalAmount = quantity * pricePerShare;
      const commission = totalAmount * 0.001; // 0.1% commission
      const totalCost = totalAmount + commission;

      // Check user balance
      const user = await User.findByPk(userId);
      if (user.balance < totalCost) {
        return res.status(400).json({
          success: false,
          message: 'Yetersiz bakiye'
        });
      }

      // Create transaction record
      const stockTransaction = await StockTransaction.create({
        userId,
        stockId,
        type: 'buy',
        quantity,
        pricePerShare,
        totalAmount,
        commission,
        status: 'completed'
      }, { transaction });

      // Update user balance
      await user.update({
        balance: user.balance - totalCost
      }, { transaction });

      // Update or create portfolio entry
      const [portfolioItem, created] = await Portfolio.findOrCreate({
        where: { userId, stockId },
        defaults: {
          quantity: 0,
          averagePrice: 0,
          totalCost: 0
        },
        transaction
      });

      // Calculate new average price and update portfolio
      const newTotalQuantity = portfolioItem.quantity + quantity;
      const newTotalCost = parseFloat(portfolioItem.totalCost) + totalAmount;
      const newAveragePrice = newTotalCost / newTotalQuantity;

      await portfolioItem.update({
        quantity: newTotalQuantity,
        averagePrice: newAveragePrice,
        totalCost: newTotalCost,
        lastTransactionDate: new Date()
      }, { transaction });

      await transaction.commit();

      res.json({
        success: true,
        message: 'Hisse senedi başarıyla satın alındı',
        data: {
          transaction: stockTransaction,
          portfolio: portfolioItem
        }
      });
    } catch (error) {
      await transaction.rollback();
      console.error('Error buying stock:', error);
      res.status(500).json({
        success: false,
        message: 'Hisse senedi alımında hata oluştu'
      });
    }
  }

  /**
   * Get user transactions
   */
  static async getUserTransactions(req, res) {
    try {
      const userId = req.user.userId;
      const { page = 1, limit = 20, type, stockId } = req.query;

      const whereClause = { userId };
      if (type) whereClause.type = type;
      if (stockId) whereClause.stockId = stockId;

      const transactions = await StockTransaction.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: Stock,
            attributes: ['id', 'symbol', 'companyName']
          }
        ],
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset: (parseInt(page) - 1) * parseInt(limit)
      });

      res.json({
        success: true,
        data: {
          transactions: transactions.rows,
          pagination: {
            total: transactions.count,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(transactions.count / parseInt(limit))
          }
        }
      });
    } catch (error) {
      console.error('Error fetching user transactions:', error);
      res.status(500).json({
        success: false,
        message: 'İşlem geçmişi alınırken hata oluştu'
      });
    }
  }
}

module.exports = StockController;