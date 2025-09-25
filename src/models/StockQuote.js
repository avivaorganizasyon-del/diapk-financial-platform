const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const StockQuote = sequelize.define('StockQuote', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  symbol: {
    type: DataTypes.STRING,
    allowNull: false
  },
  exchange: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'BIST'
  },
  price: {
    type: DataTypes.DECIMAL(18, 4),
    allowNull: false
  },
  changePercent: {
    type: DataTypes.DECIMAL(8, 4),
    allowNull: true
  },
  changeAmount: {
    type: DataTypes.DECIMAL(18, 4),
    allowNull: true
  },
  volume: {
    type: DataTypes.BIGINT,
    allowNull: true
  },
  high: {
    type: DataTypes.DECIMAL(18, 4),
    allowNull: true
  },
  low: {
    type: DataTypes.DECIMAL(18, 4),
    allowNull: true
  },
  open: {
    type: DataTypes.DECIMAL(18, 4),
    allowNull: true
  },
  previousClose: {
    type: DataTypes.DECIMAL(18, 4),
    allowNull: true
  },
  marketCap: {
    type: DataTypes.BIGINT,
    allowNull: true
  },
  lastUpdated: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  indexes: [
    { fields: ['symbol', 'exchange'], unique: true },
    { fields: ['symbol'] },
    { fields: ['exchange'] },
    { fields: ['lastUpdated'] }
  ]
});

module.exports = StockQuote;