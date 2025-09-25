'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // TRX ödeme yöntemi ekle
    const trxPaymentMethod = {
      name: 'TRON (TRX)',
      type: 'crypto',
      description: 'TRON ağı üzerinden TRX ile ödeme',
      details: JSON.stringify({
        walletAddress: 'TQn9Y2khEsLJW1ChVWFMSMeRDow5KcbLSE',
        network: 'TRON',
        symbol: 'TRX',
        confirmations: 12
      }),
      isActive: true,
      isVisible: true,
      sortOrder: 1,
      minAmount: 100.00,
      maxAmount: 100000.00,
      commission: 2.5,
      processingTime: '5-15 dakika',
      instructions: 'TRX transferi yaparken mutlaka doğru ağı (TRON) seçiniz. Yanlış ağ seçimi para kaybına neden olabilir.',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await queryInterface.bulkInsert('PaymentMethods', [trxPaymentMethod], {});
    
    console.log('TRX ödeme yöntemi başarıyla eklendi.');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('PaymentMethods', {
      name: 'TRON (TRX)'
    }, {});
  }
};