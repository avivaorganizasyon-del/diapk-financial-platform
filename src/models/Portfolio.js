const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Portfolio = sequelize.define('Portfolio', {
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
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  averagePrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0
  },
  totalCost: {
    type: DataTypes.DECIMAL(18, 2),
    allowNull: false,
    defaultValue: 0
  },
  lastTransactionDate: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  indexes: [
    { fields: ['userId', 'stockId'], unique: true },
    { fields: ['userId'] },
    { fields: ['stockId'] }
  ]
});

module.exports = Portfolio;