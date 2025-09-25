const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const IpoSubscription = sequelize.define('IpoSubscription', {
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
  ipoId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Ipos',
      key: 'id'
    }
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
  status: {
    type: DataTypes.ENUM('pending', 'confirmed', 'allocated', 'rejected'),
    defaultValue: 'pending'
  },
  allocationQuantity: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0
  },
  allocationAmount: {
    type: DataTypes.DECIMAL(18, 2),
    allowNull: true,
    defaultValue: 0
  }
}, {
  indexes: [
    { fields: ['userId', 'ipoId'], unique: true },
    { fields: ['userId'] },
    { fields: ['ipoId'] },
    { fields: ['status'] }
  ]
});

module.exports = IpoSubscription;