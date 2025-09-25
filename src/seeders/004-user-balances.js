'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Tüm kullanıcıları al
    const users = await queryInterface.sequelize.query(
      'SELECT id FROM Users',
      { type: Sequelize.QueryTypes.SELECT }
    );

    // Her kullanıcı için bakiye güncelle
    for (const user of users) {
      await queryInterface.sequelize.query(
        'UPDATE Users SET balance = 10000.00, currency = "USD" WHERE id = :userId',
        {
          replacements: { userId: user.id },
          type: Sequelize.QueryTypes.UPDATE
        }
      );
    }

    console.log(`${users.length} kullanıcının bakiyesi 10000 USD olarak güncellendi.`);
  },

  down: async (queryInterface, Sequelize) => {
    // Rollback - tüm kullanıcı bakiyelerini sıfırla
    await queryInterface.sequelize.query(
      'UPDATE Users SET balance = 0.00',
      { type: Sequelize.QueryTypes.UPDATE }
    );
  }
};