const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Favorite = sequelize.define('Favorite', {
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
  symbol: {
    type: DataTypes.STRING,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('stock', 'crypto', 'forex'),
    allowNull: false,
    defaultValue: 'stock'
  }
}, {
  indexes: [
    { fields: ['userId', 'symbol'], unique: true },
    { fields: ['userId'] },
    { fields: ['type'] }
  ]
});

module.exports = Favorite;