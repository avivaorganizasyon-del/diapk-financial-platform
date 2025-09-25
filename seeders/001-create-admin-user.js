'use strict';
const bcrypt = require('bcryptjs');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create admin user for production
    await queryInterface.bulkInsert('Users', [
      {
        email: 'admin@diaglobale.com',
        password: await bcrypt.hash('DiAgLoBaLe2024!Admin', 10),
        firstName: 'Admin',
        lastName: 'DiAgLoBaLe',
        phone: '+905551234567',
        role: 'admin',
        isActive: true,
        balance: 0.00,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});

    // Create initial invite codes for production
    await queryInterface.bulkInsert('InviteCodes', [
      {
        code: 'WELCOME2024',
        isUsed: false,
        usedBy: null,
        createdBy: 1, // Admin user ID
        description: 'İlk kullanıcılar için davet kodu',
        expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'BETA2024',
        isUsed: false,
        usedBy: null,
        createdBy: 1,
        description: 'Beta test kullanıcıları için',
        expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'LAUNCH2024',
        isUsed: false,
        usedBy: null,
        createdBy: 1,
        description: 'Lansman kullanıcıları için',
        expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});

    // Create production payment methods
    await queryInterface.bulkInsert('PaymentMethods', [
      {
        name: 'Banka Havalesi',
        type: 'bank_transfer',
        isActive: true,
        config: JSON.stringify({
          bankName: 'Türkiye İş Bankası',
          accountName: 'DiAgLoBaLe Finansal Teknolojiler',
          accountNumber: 'XXXX-XXXX-XXXX-XXXX',
          iban: 'TR00 0000 0000 0000 0000 0000 00',
          description: 'Banka havalesi ile para yatırma'
        }),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'EFT',
        type: 'eft',
        isActive: true,
        config: JSON.stringify({
          bankName: 'Türkiye İş Bankası',
          accountName: 'DiAgLoBaLe Finansal Teknolojiler',
          accountNumber: 'XXXX-XXXX-XXXX-XXXX',
          iban: 'TR00 0000 0000 0000 0000 0000 00',
          description: 'EFT ile para yatırma'
        }),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});

    // Create system announcements
    await queryInterface.bulkInsert('Announcements', [
      {
        title: 'DiAgLoBaLe Platformuna Hoş Geldiniz!',
        content: 'DiAgLoBaLe finansal platform artık hizmetinizde. Güvenli yatırım deneyimi için platformumuzu kullanabilirsiniz.',
        isActive: true,
        publishDate: new Date(),
        createdBy: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'KYC Doğrulama Süreci',
        content: 'Hesabınızı doğrulamak için KYC sürecini tamamlamanız gerekmektedir. Profil bölümünden belgelerinizi yükleyebilirsiniz.',
        isActive: true,
        publishDate: new Date(),
        createdBy: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    // Remove all seeded data
    await queryInterface.bulkDelete('Announcements', null, {});
    await queryInterface.bulkDelete('PaymentMethods', null, {});
    await queryInterface.bulkDelete('InviteCodes', null, {});
    await queryInterface.bulkDelete('Users', null, {});
  }
};