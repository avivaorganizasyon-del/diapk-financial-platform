const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Stock = sequelize.define('Stock', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  symbol: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  companyName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  exchange: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'BIST'
  },
  currentPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  openPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  highPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  lowPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  previousClose: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  volume: {
    type: DataTypes.BIGINT,
    allowNull: true,
    defaultValue: 0
  },
  marketCap: {
    type: DataTypes.BIGINT,
    allowNull: true
  },
  sector: {
    type: DataTypes.STRING,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('active', 'suspended', 'delisted'),
    defaultValue: 'active'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  website: {
    type: DataTypes.STRING,
    allowNull: true
  },
  createdBy: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  }
}, {
  indexes: [
    { fields: ['symbol'], unique: true },
    { fields: ['status'] },
    { fields: ['exchange'] },
    { fields: ['sector'] },
    { fields: ['currentPrice'] }
  ]
});

module.exports = Stock;