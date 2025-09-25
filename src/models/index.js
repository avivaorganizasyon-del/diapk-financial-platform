const sequelize = require('../config/db');

// Import all models
const User = require('./User');
const InviteCode = require('./InviteCode');
const Kyc = require('./Kyc');
const Deposit = require('./Deposit');
const Favorite = require('./Favorite');
const ChatMessage = require('./ChatMessage');
const Announcement = require('./Announcement');
const Ipo = require('./Ipo');
const IpoSubscription = require('./IpoSubscription');
const StockQuote = require('./StockQuote');
const Stock = require('./Stock');
const Portfolio = require('./Portfolio');
const StockTransaction = require('./StockTransaction');
const CronLog = require('./CronLog');
const PaymentMethod = require('./PaymentMethod');
const CurrencyRate = require('./CurrencyRate');

// Define associations
// User associations
User.hasMany(InviteCode, { foreignKey: 'createdBy', as: 'createdInviteCodes' });
User.hasMany(InviteCode, { foreignKey: 'usedBy', as: 'usedInviteCode' });
User.hasOne(Kyc, { foreignKey: 'userId' });
User.hasMany(Deposit, { foreignKey: 'userId' });
User.hasMany(Deposit, { foreignKey: 'reviewedBy', as: 'reviewedDeposits' });
User.hasMany(Favorite, { foreignKey: 'userId' });
User.hasMany(ChatMessage, { foreignKey: 'senderId', as: 'sentMessages' });
User.hasMany(ChatMessage, { foreignKey: 'receiverId', as: 'receivedMessages' });
User.hasMany(Announcement, { foreignKey: 'createdBy' });
User.hasMany(Ipo, { foreignKey: 'createdBy' });
User.hasMany(IpoSubscription, { foreignKey: 'userId' });
User.hasMany(Stock, { foreignKey: 'createdBy' });
User.hasMany(Portfolio, { foreignKey: 'userId' });
User.hasMany(StockTransaction, { foreignKey: 'userId' });

// InviteCode associations
InviteCode.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
InviteCode.belongsTo(User, { foreignKey: 'usedBy', as: 'user' });

// Kyc associations
Kyc.belongsTo(User, { foreignKey: 'userId' });
Kyc.belongsTo(User, { foreignKey: 'reviewedBy', as: 'reviewer' });

// Deposit associations
Deposit.belongsTo(User, { foreignKey: 'userId' });
Deposit.belongsTo(User, { foreignKey: 'reviewedBy', as: 'reviewer' });

// Favorite associations
Favorite.belongsTo(User, { foreignKey: 'userId' });

// ChatMessage associations
ChatMessage.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });
ChatMessage.belongsTo(User, { foreignKey: 'receiverId', as: 'receiver' });

// Announcement associations
Announcement.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });

// Ipo associations
Ipo.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
Ipo.hasMany(IpoSubscription, { foreignKey: 'ipoId' });

// IpoSubscription associations
IpoSubscription.belongsTo(User, { foreignKey: 'userId' });
IpoSubscription.belongsTo(Ipo, { foreignKey: 'ipoId' });

// Stock associations
Stock.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
Stock.hasMany(Portfolio, { foreignKey: 'stockId' });
Stock.hasMany(StockTransaction, { foreignKey: 'stockId' });

// Portfolio associations
Portfolio.belongsTo(User, { foreignKey: 'userId' });
Portfolio.belongsTo(Stock, { foreignKey: 'stockId' });

// StockTransaction associations
StockTransaction.belongsTo(User, { foreignKey: 'userId' });
StockTransaction.belongsTo(Stock, { foreignKey: 'stockId' });

module.exports = {
  sequelize,
  User,
  InviteCode,
  Kyc,
  Deposit,
  Favorite,
  ChatMessage,
  Announcement,
  Ipo,
  IpoSubscription,
  StockQuote,
  Stock,
  Portfolio,
  StockTransaction,
  CronLog,
  PaymentMethod,
  CurrencyRate
};