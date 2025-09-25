require('dotenv').config();

module.exports = {
  development: {
    storage: './database.sqlite',
    dialect: 'sqlite',
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  },
  test: {
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME + '_test' || 'diapk_test',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    timezone: '+03:00',
    logging: false
  },
  production: {
    storage: process.env.DB_STORAGE || './database.sqlite',
    dialect: process.env.DB_DIALECT || 'sqlite',
    logging: false,
    pool: {
      max: 10,
      min: 2,
      acquire: 30000,
      idle: 10000
    },
    // MySQL configuration (if needed)
    ...(process.env.DB_DIALECT === 'mysql' && {
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 3306,
      timezone: '+03:00'
    })
  }
};