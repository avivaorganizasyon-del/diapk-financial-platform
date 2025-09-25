'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('payment_methods', [
      {
        name: 'Banka Havalesi',
        type: 'bank_transfer',
        description: 'Türkiye Cumhuriyet Merkez Bankası üzerinden banka havalesi ile para yatırma',
        details: JSON.stringify({
          bankName: 'Türkiye İş Bankası',
          accountName: 'DIAPK Yatırım A.Ş.',
          accountNumber: '1234567890',
          iban: 'TR12 0006 4000 0011 2345 6789 01',
          swiftCode: 'ISBKTRIS'
        }),
        isActive: true,
        isVisible: true,
        sortOrder: 1,
        minAmount: 100.00,
        maxAmount: 50000.00,
        commission: 0.00,
        processingTime: '1-2 iş günü',
        instructions: 'Havale yaparken açıklama kısmına kullanıcı adınızı yazınız.',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'EFT',
        type: 'eft',
        description: 'Elektronik Fon Transferi ile hızlı para yatırma',
        details: JSON.stringify({
          bankName: 'Türkiye İş Bankası',
          accountName: 'DIAPK Yatırım A.Ş.',
          accountNumber: '1234567890',
          iban: 'TR12 0006 4000 0011 2345 6789 01'
        }),
        isActive: true,
        isVisible: true,
        sortOrder: 2,
        minAmount: 50.00,
        maxAmount: 25000.00,
        commission: 0.50,
        processingTime: 'Anında',
        instructions: 'EFT yaparken açıklama kısmına kullanıcı adınızı yazınız.',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Bitcoin (BTC)',
        type: 'crypto',
        description: 'Bitcoin ile kripto para yatırma işlemi',
        details: JSON.stringify({
          walletAddress: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
          network: 'Bitcoin',
          minConfirmations: 3,
          qrCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
        }),
        isActive: true,
        isVisible: true,
        sortOrder: 3,
        minAmount: 0.001,
        maxAmount: 10.00,
        commission: 0.00,
        processingTime: '30-60 dakika',
        instructions: 'Bitcoin gönderirken yukarıdaki cüzdan adresini kullanınız. İşlem onaylandıktan sonra bakiyeniz güncellenecektir.',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Ethereum (ETH)',
        type: 'crypto',
        description: 'Ethereum ile kripto para yatırma işlemi',
        details: JSON.stringify({
          walletAddress: '0x742d35Cc6634C0532925a3b8D4C9db96590b5c8e',
          network: 'Ethereum',
          minConfirmations: 12,
          qrCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
        }),
        isActive: true,
        isVisible: true,
        sortOrder: 4,
        minAmount: 0.01,
        maxAmount: 100.00,
        commission: 0.00,
        processingTime: '15-30 dakika',
        instructions: 'Ethereum gönderirken yukarıdaki cüzdan adresini kullanınız. Sadece Ethereum mainnet kullanınız.',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Tether (USDT)',
        type: 'crypto',
        description: 'USDT ile kripto para yatırma işlemi',
        details: JSON.stringify({
          walletAddress: 'TQn9Y2khEsLJW1ChVWFMSMeRDow5oNDMnt',
          network: 'TRC20 (Tron)',
          minConfirmations: 19,
          qrCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
        }),
        isActive: true,
        isVisible: true,
        sortOrder: 5,
        minAmount: 10.00,
        maxAmount: 10000.00,
        commission: 0.00,
        processingTime: '5-15 dakika',
        instructions: 'USDT gönderirken TRC20 ağını kullanınız. Yanlış ağ seçimi para kaybına neden olabilir.',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('payment_methods', null, {});
  }
};