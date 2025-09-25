const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const StockTransaction = sequelize.define('StockTransaction', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  stockId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Stocks',
      key: 'id'
    }
  },
  type: {
    type: DataTypes.ENUM('buy', 'sell'),
    allowNull: false
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  pricePerShare: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  totalAmount: {
    type: DataTypes.DECIMAL(18, 2),
    allowNull: false
  },
  commission: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: 0
  },
  status: {
    type: DataTypes.ENUM('pending', 'completed', 'cancelled', 'failed'),
    defaultValue: 'pending'
  },
  transactionDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  indexes: [
    { fields: ['userId'] },
    { fields: ['stockId'] },
    { fields: ['type'] },
    { fields: ['status'] },
    { fields: ['transactionDate'] },
    { fields: ['userId', 'stockId'] }
  ]
});

module.exports = StockTransaction;