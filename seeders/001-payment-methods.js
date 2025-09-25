'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('payment_methods', [
      {
        name: 'Banka Havalesi',
        type: 'bank_transfer',
        description: 'Türkiye Cumhuriyet Merkez Bankası üzerinden banka havalesi ile para yatırma',
        details: JSON.stringify({
          bankName: 'DIAGLOBALE BANKA BILGILERI',
          accountName: 'DIAGLOBALE LTD ŞTİ',
          accountNumber: 'PRODUCTION_ACCOUNT_NUMBER',
          iban: 'PRODUCTION_IBAN_NUMBER',
          swiftCode: 'PRODUCTION_SWIFT',
          branchName: 'PRODUCTION_BRANCH',
          branchCode: 'PRODUCTION_CODE'
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
          bankName: 'DIAGLOBALE BANKA BILGILERI',
          accountName: 'DIAGLOBALE LTD ŞTİ',
          accountNumber: 'PRODUCTION_ACCOUNT_NUMBER',
          iban: 'PRODUCTION_IBAN_NUMBER',
          branchName: 'PRODUCTION_BRANCH',
          branchCode: 'PRODUCTION_CODE'
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
          walletAddress: 'BITCOIN_WALLET_ADDRESS_PLACEHOLDER',
          network: 'Bitcoin Mainnet',
          minConfirmations: 6,
          qrCode: 'QR_CODE_PLACEHOLDER',
          networkFee: 'Dinamik (ağ yoğunluğuna göre)'
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
          walletAddress: '0x8ba1f109551bD432803012645Hac136c22C177ec',
          network: 'Ethereum Mainnet (ERC-20)',
          minConfirmations: 12,
          qrCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
          gasLimit: '21000',
          networkFee: 'Dinamik (gas fiyatına göre)'
        })
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
          walletAddress: 'TLPuV2GX2gcQmY7Lx1DjyEjrwlX4A9gTQK',
          network: 'TRC20 (Tron Network)',
          minConfirmations: 20,
          qrCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
          contractAddress: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',
          networkFee: '1 TRX (sabit)'
        })
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