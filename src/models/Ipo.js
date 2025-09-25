const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Ipo = sequelize.define('Ipo', {
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
  priceMin: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  priceMax: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  lotSize: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('upcoming', 'ongoing', 'closed', 'listed'),
    defaultValue: 'upcoming'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  prospectusUrl: {
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
    { fields: ['startDate'] },
    { fields: ['endDate'] },
    { fields: ['exchange'] }
  ]
});

module.exports = Ipo;