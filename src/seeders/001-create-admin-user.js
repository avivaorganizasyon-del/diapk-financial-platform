'use strict';
const bcrypt = require('bcryptjs');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Hash the admin password
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    // Insert admin user
    await queryInterface.bulkInsert('Users', [
        {
          email: 'admin@diapk.com',
          password: await bcrypt.hash('admin123', 10),
          firstName: 'Admin',
          lastName: 'User',
          role: 'admin',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ], {});

    // Create some invite codes for testing
    await queryInterface.bulkInsert('InviteCodes', [
      {
        code: 'ADMIN001',
        isUsed: false,
        usedBy: null,
        createdBy: 1, // Admin user ID
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'ADMIN002',
        isUsed: false,
        usedBy: null,
        createdBy: 1,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'ADMIN003',
        isUsed: false,
        usedBy: null,
        createdBy: 1,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});

    // Create some sample IPOs
    await queryInterface.bulkInsert('Ipos', [
      {
        symbol: 'TECH01',
        companyName: 'TechCorp A.Ş.',
        exchange: 'BIST',
        priceMin: 10.50,
        priceMax: 12.00,
        lotSize: 100,
        totalShares: 1000000,
        availableShares: 1000000,
        startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        endDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 21 days from now
        status: 'upcoming',
        description: 'Teknoloji sektöründe faaliyet gösteren şirket halka arzı',
        prospectusUrl: null,
        createdBy: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        symbol: 'ENERGY01',
        companyName: 'EnerjiCorp A.Ş.',
        exchange: 'BIST',
        priceMin: 25.00,
        priceMax: 30.00,
        lotSize: 50,
        totalShares: 500000,
        availableShares: 500000,
        startDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago (active)
        endDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
        status: 'active',
        description: 'Enerji sektöründe faaliyet gösteren şirket halka arzı',
        prospectusUrl: null,
        createdBy: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        symbol: 'FINANCE01',
        companyName: 'FinansCorp A.Ş.',
        exchange: 'BIST',
        priceMin: 15.75,
        priceMax: 18.25,
        lotSize: 100,
        totalShares: 750000,
        availableShares: 750000,
        startDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        endDate: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000), // 28 days from now
        status: 'upcoming',
        description: 'Finans sektöründe faaliyet gösteren şirket halka arzı',
        prospectusUrl: null,
        createdBy: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});

    // Create some test users with realistic data
    const testUserPassword = await bcrypt.hash('user123', 10);
    await queryInterface.bulkInsert('Users', [
      {
        email: 'ahmet.yilmaz@gmail.com',
        password: testUserPassword,
        firstName: 'Ahmet',
        lastName: 'Yılmaz',
        phone: '+905321234567',
        role: 'user',
        isActive: true,
        inviteCodeUsed: 'ADMIN001',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        email: 'fatma.kaya@hotmail.com',
        password: testUserPassword,
        firstName: 'Fatma',
        lastName: 'Kaya',
        phone: '+905439876543',
        role: 'user',
        isActive: true,
        inviteCodeUsed: 'ADMIN002',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        email: 'mehmet.ozturk@yahoo.com',
        password: testUserPassword,
        firstName: 'Mehmet',
        lastName: 'Öztürk',
        phone: '+905551122334',
        role: 'user',
        isActive: true,
        inviteCodeUsed: 'ADMIN003',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        email: 'ayse.demir@outlook.com',
        password: testUserPassword,
        firstName: 'Ayşe',
        lastName: 'Demir',
        phone: '+905367788990',
        role: 'user',
        isActive: true,
        inviteCodeUsed: 'ADMIN001',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        email: 'mustafa.celik@gmail.com',
        password: testUserPassword,
        firstName: 'Mustafa',
        lastName: 'Çelik',
        phone: '+905445566778',
        role: 'user',
        isActive: true,
        inviteCodeUsed: 'ADMIN002',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});

    // Create some sample KYC applications with realistic data
    await queryInterface.bulkInsert('Kycs', [
      {
        userId: 2, // ahmet.yilmaz@gmail.com
        identityNumber: '11223344556',
        dateOfBirth: new Date('1985-03-15'),
        address: 'Atatürk Mahallesi, Cumhuriyet Caddesi No:45/7, Kadıköy, İstanbul',
        documentType: 'identity_card',
        documentNumber: 'E12345678',
        documentFrontUrl: '/uploads/kyc/front1.jpg',
        documentBackUrl: '/uploads/kyc/back1.jpg',
        selfieUrl: '/uploads/kyc/selfie1.jpg',
        status: 'approved',
        rejectionReason: null,
        reviewedBy: 1,
        reviewedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        userId: 3, // fatma.kaya@hotmail.com
        identityNumber: '22334455667',
        dateOfBirth: new Date('1990-07-22'),
        address: 'Yenişehir Mahallesi, Kızılay Caddesi No:123/4, Çankaya, Ankara',
        documentType: 'identity_card',
        documentNumber: 'A87654321',
        documentFrontUrl: '/uploads/kyc/front2.jpg',
        documentBackUrl: '/uploads/kyc/back2.jpg',
        selfieUrl: '/uploads/kyc/selfie2.jpg',
        status: 'approved',
        rejectionReason: null,
        reviewedBy: 1,
        reviewedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        userId: 4, // mehmet.ozturk@yahoo.com
        identityNumber: '33445566778',
        dateOfBirth: new Date('1988-12-10'),
        address: 'Konak Mahallesi, Alsancak Caddesi No:67/2, Konak, İzmir',
        documentType: 'identity_card',
        documentNumber: 'I11223344',
        documentFrontUrl: '/uploads/kyc/front3.jpg',
        documentBackUrl: '/uploads/kyc/back3.jpg',
        selfieUrl: '/uploads/kyc/selfie3.jpg',
        status: 'approved',
        rejectionReason: null,
        reviewedBy: 1,
        reviewedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});

    // Create initial deposits for all users (1000 USD each)
    await queryInterface.bulkInsert('Deposits', [
      {
        userId: 2, // ahmet.yilmaz@gmail.com
        amount: 1000.00,
        currency: 'USD',
        method: 'bank_transfer',
        status: 'approved',
        transactionId: 'INIT_001',
        receiptUrl: '/uploads/deposits/receipt1.jpg',
        bankInfo: JSON.stringify({
          bankName: 'Türkiye İş Bankası',
          accountNumber: '1234567890',
          iban: 'TR330006100519786457841326',
          description: 'İlk yatırım - Hoş geldin bonusu'
        }),
        rejectionReason: null,
        reviewedBy: 1, // Admin
        reviewedAt: new Date(),
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        updatedAt: new Date()
      },
      {
        userId: 3, // fatma.kaya@hotmail.com
        amount: 1000.00,
        currency: 'USD',
        method: 'bank_transfer',
        status: 'approved',
        transactionId: 'INIT_002',
        receiptUrl: '/uploads/deposits/receipt2.jpg',
        bankInfo: JSON.stringify({
          bankName: 'Garanti BBVA',
          accountNumber: '9876543210',
          iban: 'TR640062000190000006672315',
          description: 'İlk yatırım - Hoş geldin bonusu'
        }),
        rejectionReason: null,
        reviewedBy: 1, // Admin
        reviewedAt: new Date(),
        createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), // 6 days ago
        updatedAt: new Date()
      },
      {
        userId: 4, // mehmet.ozturk@yahoo.com
        amount: 1000.00,
        currency: 'USD',
        method: 'bank_transfer',
        status: 'approved',
        transactionId: 'INIT_003',
        receiptUrl: '/uploads/deposits/receipt3.jpg',
        bankInfo: JSON.stringify({
          bankName: 'Yapı Kredi Bankası',
          accountNumber: '5555666677',
          iban: 'TR560067010000000044772200',
          description: 'İlk yatırım - Hoş geldin bonusu'
        }),
        rejectionReason: null,
        reviewedBy: 1, // Admin
        reviewedAt: new Date(),
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        updatedAt: new Date()
      },
      {
        userId: 5, // ayse.demir@outlook.com
        amount: 1000.00,
        currency: 'USD',
        method: 'bank_transfer',
        status: 'approved',
        transactionId: 'INIT_004',
        receiptUrl: '/uploads/deposits/receipt4.jpg',
        bankInfo: JSON.stringify({
          bankName: 'Akbank',
          accountNumber: '1111222233',
          iban: 'TR460004600123456789012345',
          description: 'İlk yatırım - Hoş geldin bonusu'
        }),
        rejectionReason: null,
        reviewedBy: 1, // Admin
        reviewedAt: new Date(),
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
        updatedAt: new Date()
      },
      {
        userId: 6, // mustafa.celik@gmail.com
        amount: 1000.00,
        currency: 'USD',
        method: 'bank_transfer',
        status: 'approved',
        transactionId: 'INIT_005',
        receiptUrl: '/uploads/deposits/receipt5.jpg',
        bankInfo: JSON.stringify({
          bankName: 'Ziraat Bankası',
          accountNumber: '7777888899',
          iban: 'TR320001000123456789012345',
          description: 'İlk yatırım - Hoş geldin bonusu'
        }),
        rejectionReason: null,
        reviewedBy: 1, // Admin
        reviewedAt: new Date(),
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        updatedAt: new Date()
      }
    ], {});

    console.log('✅ Admin user and sample data created successfully!');
    console.log('📧 Admin Email: admin@diapk.com');
    console.log('🔑 Admin Password: admin123');
    console.log('👥 Test Users:');
    console.log('   - ahmet.yilmaz@gmail.com (Ahmet Yılmaz) - 1000 USD');
    console.log('   - fatma.kaya@hotmail.com (Fatma Kaya) - 1000 USD');
    console.log('   - mehmet.ozturk@yahoo.com (Mehmet Öztürk) - 1000 USD');
    console.log('   - ayse.demir@outlook.com (Ayşe Demir) - 1000 USD');
    console.log('   - mustafa.celik@gmail.com (Mustafa Çelik) - 1000 USD');
    console.log('🔑 All test users password: user123');
    console.log('💰 Each user has 1000 USD initial balance');
  },

  down: async (queryInterface, Sequelize) => {
    // Remove all seeded data
    await queryInterface.bulkDelete('Deposits', null, {});
    await queryInterface.bulkDelete('Kycs', null, {});
    await queryInterface.bulkDelete('Ipos', null, {});
    await queryInterface.bulkDelete('InviteCodes', null, {});
    await queryInterface.bulkDelete('Users', null, {});
  }
};