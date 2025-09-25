'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('CurrencyRates', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      fromCurrency: {
        type: Sequelize.STRING(3),
        allowNull: false,
        comment: 'Kaynak para birimi (USD, TRY, EUR vb.)'
      },
      toCurrency: {
        type: Sequelize.STRING(3),
        allowNull: false,
        comment: 'Hedef para birimi (USD, TRY, EUR vb.)'
      },
      rate: {
        type: Sequelize.DECIMAL(15, 6),
        allowNull: false,
        comment: 'Döviz kuru oranı'
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        comment: 'Kur aktif mi?'
      },
      isManual: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        comment: 'Manuel olarak belirlenen kur mu?'
      },
      lastUpdatedBy: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Users',
          key: 'id'
        },
        comment: 'Son güncelleyen yönetici'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // Unique constraint - aynı para birimi çifti sadece bir kez olabilir
    await queryInterface.addIndex('CurrencyRates', {
      fields: ['fromCurrency', 'toCurrency'],
      unique: true,
      name: 'currency_pair_unique'
    });

    // Varsayılan kurları ekle
    await queryInterface.bulkInsert('CurrencyRates', [
      {
        fromCurrency: 'USD',
        toCurrency: 'TRY',
        rate: 34.25,
        isActive: true,
        isManual: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        fromCurrency: 'TRY',
        toCurrency: 'USD',
        rate: 0.0292,
        isActive: true,
        isManual: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        fromCurrency: 'USD',
        toCurrency: 'USD',
        rate: 1.0,
        isActive: true,
        isManual: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        fromCurrency: 'TRY',
        toCurrency: 'TRY',
        rate: 1.0,
        isActive: true,
        isManual: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('CurrencyRates');
  }
};