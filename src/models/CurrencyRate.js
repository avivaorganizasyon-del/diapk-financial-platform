const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const CurrencyRate = sequelize.define('CurrencyRate', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  fromCurrency: {
    type: DataTypes.STRING(3),
    allowNull: false,
    comment: 'Kaynak para birimi (USD, TRY, EUR vb.)'
  },
  toCurrency: {
    type: DataTypes.STRING(3),
    allowNull: false,
    comment: 'Hedef para birimi (USD, TRY, EUR vb.)'
  },
  rate: {
    type: DataTypes.DECIMAL(15, 6),
    allowNull: false,
    comment: 'Döviz kuru oranı'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Kur aktif mi?'
  },
  isManual: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Manuel olarak belirlenen kur mu?'
  },
  lastUpdatedBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Users',
      key: 'id'
    },
    comment: 'Son güncelleyen yönetici'
  }
}, {
  tableName: 'CurrencyRates',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['fromCurrency', 'toCurrency'],
      name: 'currency_pair_unique'
    }
  ]
});

// İlişkiler
CurrencyRate.associate = (models) => {
  CurrencyRate.belongsTo(models.User, {
    foreignKey: 'lastUpdatedBy',
    as: 'updatedByUser'
  });
};

// Kur çevirme fonksiyonu
CurrencyRate.convertCurrency = async (amount, fromCurrency, toCurrency) => {
  if (fromCurrency === toCurrency) {
    return parseFloat(amount);
  }

  const rate = await CurrencyRate.findOne({
    where: {
      fromCurrency,
      toCurrency,
      isActive: true
    }
  });

  if (!rate) {
    throw new Error(`${fromCurrency} -> ${toCurrency} kuru bulunamadı`);
  }

  return parseFloat(amount) * parseFloat(rate.rate);
};

// Mevcut kurları getir
CurrencyRate.getActiveRates = async () => {
  return await CurrencyRate.findAll({
    where: { isActive: true },
    order: [['fromCurrency', 'ASC'], ['toCurrency', 'ASC']]
  });
};

module.exports = CurrencyRate;