const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Deposit = sequelize.define('Deposit', {
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
  amount: {
    type: DataTypes.DECIMAL(18, 2),
    allowNull: false
  },
  currency: {
    type: DataTypes.STRING(3),
    allowNull: false,
    defaultValue: 'TRY'
  },
  method: {
    type: DataTypes.ENUM('bank_transfer', 'credit_card', 'crypto'),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    defaultValue: 'pending'
  },
  transactionId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  receiptUrl: {
    type: DataTypes.STRING,
    allowNull: true
  },
  bankInfo: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Bank account details for bank transfers'
  },
  rejectionReason: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  reviewedBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  reviewedAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  indexes: [
    { fields: ['userId'] },
    { fields: ['status'] },
    { fields: ['method'] },
    { fields: ['currency'] }
  ]
});

module.exports = Deposit;