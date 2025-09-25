const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Kyc = sequelize.define('Kyc', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  identityNumber: {
    type: DataTypes.STRING(11),
    allowNull: false
  },
  dateOfBirth: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  documentType: {
    type: DataTypes.ENUM('identity_card', 'passport', 'driving_license'),
    allowNull: false
  },
  documentNumber: {
    type: DataTypes.STRING,
    allowNull: false
  },
  documentFrontUrl: {
    type: DataTypes.STRING,
    allowNull: true
  },
  documentBackUrl: {
    type: DataTypes.STRING,
    allowNull: true
  },
  selfieUrl: {
    type: DataTypes.STRING,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    defaultValue: 'pending'
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
    { fields: ['userId'], unique: true },
    { fields: ['status'] },
    { fields: ['identityNumber'] }
  ]
});

module.exports = Kyc;