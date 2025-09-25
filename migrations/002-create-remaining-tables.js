'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create Favorites table
    await queryInterface.createTable('Favorites', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        }
      },
      symbol: {
        type: Sequelize.STRING,
        allowNull: false
      },
      type: {
        type: Sequelize.ENUM('stock', 'crypto', 'forex'),
        allowNull: false,
        defaultValue: 'stock'
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });

    // Create ChatMessages table
    await queryInterface.createTable('ChatMessages', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      senderId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        }
      },
      receiverId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Users',
          key: 'id'
        }
      },
      message: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      messageType: {
        type: Sequelize.ENUM('text', 'file', 'image'),
        defaultValue: 'text'
      },
      fileUrl: {
        type: Sequelize.STRING,
        allowNull: true
      },
      isRead: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      roomId: {
        type: Sequelize.STRING,
        allowNull: true
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });

    // Create Announcements table
    await queryInterface.createTable('Announcements', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false
      },
      content: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      publishDate: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      createdBy: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        }
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });

    // Create Ipos table
    await queryInterface.createTable('Ipos', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      symbol: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      companyName: {
        type: Sequelize.STRING,
        allowNull: false
      },
      exchange: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'BIST'
      },
      priceMin: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      priceMax: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      lotSize: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1
      },
      startDate: {
        type: Sequelize.DATE,
        allowNull: false
      },
      endDate: {
        type: Sequelize.DATE,
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('upcoming', 'ongoing', 'closed', 'listed'),
        defaultValue: 'upcoming'
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      prospectusUrl: {
        type: Sequelize.STRING,
        allowNull: true
      },
      createdBy: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        }
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });

    // Create IpoSubscriptions table
    await queryInterface.createTable('IpoSubscriptions', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        }
      },
      ipoId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Ipos',
          key: 'id'
        }
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
      status: {
        type: Sequelize.ENUM('pending', 'confirmed', 'allocated', 'rejected'),
        defaultValue: 'pending'
      },
      allocationQuantity: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0
      },
      allocationAmount: {
        type: Sequelize.DECIMAL(18, 2),
        allowNull: true,
        defaultValue: 0
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });

    // Create Stocks table
    await queryInterface.createTable('Stocks', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      symbol: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      companyName: {
        type: Sequelize.STRING,
        allowNull: false
      },
      exchange: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'BIST'
      },
      currentPrice: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      openPrice: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      },
      highPrice: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      },
      lowPrice: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      },
      previousClose: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      },
      volume: {
        type: Sequelize.BIGINT,
        allowNull: true,
        defaultValue: 0
      },
      marketCap: {
        type: Sequelize.BIGINT,
        allowNull: true
      },
      sector: {
        type: Sequelize.STRING,
        allowNull: true
      },
      status: {
        type: Sequelize.ENUM('active', 'suspended', 'delisted'),
        defaultValue: 'active'
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      website: {
        type: Sequelize.STRING,
        allowNull: true
      },
      createdBy: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        }
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });

    // Create StockQuotes table
    await queryInterface.createTable('StockQuotes', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      symbol: {
        type: Sequelize.STRING,
        allowNull: false
      },
      exchange: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'BIST'
      },
      price: {
        type: Sequelize.DECIMAL(18, 4),
        allowNull: false
      },
      changePercent: {
        type: Sequelize.DECIMAL(8, 4),
        allowNull: true
      },
      changeAmount: {
        type: Sequelize.DECIMAL(18, 4),
        allowNull: true
      },
      volume: {
        type: Sequelize.BIGINT,
        allowNull: true
      },
      high: {
        type: Sequelize.DECIMAL(18, 4),
        allowNull: true
      },
      low: {
        type: Sequelize.DECIMAL(18, 4),
        allowNull: true
      },
      open: {
        type: Sequelize.DECIMAL(18, 4),
        allowNull: true
      },
      previousClose: {
        type: Sequelize.DECIMAL(18, 4),
        allowNull: true
      },
      marketCap: {
        type: Sequelize.BIGINT,
        allowNull: true
      },
      lastUpdated: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });

    // Create CronLogs table
    await queryInterface.createTable('CronLogs', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      jobName: {
        type: Sequelize.STRING,
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('success', 'error'),
        allowNull: false
      },
      message: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      executionTime: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('CronLogs');
    await queryInterface.dropTable('StockQuotes');
    await queryInterface.dropTable('Stocks');
    await queryInterface.dropTable('IpoSubscriptions');
    await queryInterface.dropTable('Ipos');
    await queryInterface.dropTable('Announcements');
    await queryInterface.dropTable('ChatMessages');
    await queryInterface.dropTable('Favorites');
  }
};