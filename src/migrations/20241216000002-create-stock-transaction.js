'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('StockTransactions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      stockId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Stocks',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      type: {
        type: Sequelize.ENUM('buy', 'sell'),
        allowNull: false
      },
      quantity: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      pricePerShare: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      totalAmount: {
        type: Sequelize.DECIMAL(18, 2),
        allowNull: false
      },
      commission: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 0
      },
      status: {
        type: Sequelize.ENUM('pending', 'completed', 'cancelled', 'failed'),
        defaultValue: 'pending'
      },
      transactionDate: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true
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

    // Add indexes
    await queryInterface.addIndex('StockTransactions', ['userId']);
    await queryInterface.addIndex('StockTransactions', ['stockId']);
    await queryInterface.addIndex('StockTransactions', ['type']);
    await queryInterface.addIndex('StockTransactions', ['status']);
    await queryInterface.addIndex('StockTransactions', ['transactionDate']);
    await queryInterface.addIndex('StockTransactions', ['userId', 'stockId']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('StockTransactions');
  }
};