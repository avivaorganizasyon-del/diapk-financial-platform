const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const CronLog = sequelize.define('CronLog', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  jobName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('success', 'error'),
    allowNull: false
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  executionTime: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Execution time in milliseconds'
  }
}, {
  indexes: [
    { fields: ['jobName'] },
    { fields: ['status'] },
    { fields: ['createdAt'] }
  ]
});

module.exports = CronLog;