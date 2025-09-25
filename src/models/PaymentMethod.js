const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const PaymentMethod = sequelize.define('PaymentMethod', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: 'Ödeme yöntemi adı (örn: Banka Havalesi, EFT)'
  },
  type: {
    type: DataTypes.ENUM('bank_transfer', 'eft', 'cash', 'credit_card', 'crypto', 'other'),
    allowNull: false,
    comment: 'Ödeme yöntemi tipi'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Ödeme yöntemi açıklaması'
  },
  details: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Ödeme yöntemi detayları (banka bilgileri, adres vb.)'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Ödeme yöntemi aktif mi?'
  },
  isVisible: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Kullanıcılara görünür mü?'
  },
  sortOrder: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Sıralama düzeni'
  },
  minAmount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: true,
    comment: 'Minimum işlem tutarı'
  },
  maxAmount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: true,
    comment: 'Maksimum işlem tutarı'
  },
  commission: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0,
    comment: 'Komisyon oranı (%)'
  },
  processingTime: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'İşlem süresi (örn: 1-2 iş günü)'
  },
  instructions: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Kullanıcı talimatları'
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'payment_methods',
  timestamps: true,
  indexes: [
    {
      fields: ['type']
    },
    {
      fields: ['isActive']
    },
    {
      fields: ['isVisible']
    },
    {
      fields: ['sortOrder']
    }
  ]
});

module.exports = PaymentMethod;