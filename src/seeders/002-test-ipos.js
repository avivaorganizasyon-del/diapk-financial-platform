'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Önce mevcut IPO'ları temizle
    await queryInterface.bulkDelete('Ipos', null, {});
    
    // Gerçek Türk şirketleri ile IPO'lar - farklı durumlar
    const testIpos = [
      {
        symbol: 'AKBNK',
        companyName: 'Akbank T.A.Ş.',
        exchange: 'BIST',
        priceMin: 28.50,
        priceMax: 32.00,
        lotSize: 100,
        startDate: new Date('2024-12-20'),
        endDate: new Date('2024-12-30'),
        description: 'Türkiye\'nin önde gelen özel bankalarından biri. Kurumsal, ticari ve bireysel bankacılık hizmetleri sunmaktadır. Bankacılık sektöründe faaliyet göstermektedir.',
        status: 'ongoing',
        createdBy: 15,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        symbol: 'THYAO',
        companyName: 'Türk Hava Yolları A.O.',
        exchange: 'BIST',
        priceMin: 185.00,
        priceMax: 210.00,
        lotSize: 10,
        startDate: new Date('2025-01-15'),
        endDate: new Date('2025-01-25'),
        description: 'Türkiye\'nin bayrak taşıyıcı havayolu şirketi. Dünya genelinde 300\'den fazla noktaya uçuş gerçekleştirmektedir. Ulaştırma sektöründe faaliyet göstermektedir.',
        status: 'upcoming',
        createdBy: 15,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        symbol: 'GARAN',
        companyName: 'Garanti BBVA',
        exchange: 'BIST',
        priceMin: 95.00,
        priceMax: 105.00,
        lotSize: 50,
        startDate: new Date('2024-11-01'),
        endDate: new Date('2024-11-15'),
        description: 'Türkiye\'nin en büyük özel bankalarından biri. Dijital bankacılık alanında öncü konumdadır. Bankacılık sektöründe faaliyet göstermektedir.',
        status: 'listed',
        createdBy: 15,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        symbol: 'BIMAS',
        companyName: 'BİM Birleşik Mağazalar A.Ş.',
        exchange: 'BIST',
        priceMin: 420.00,
        priceMax: 450.00,
        lotSize: 5,
        startDate: new Date('2024-10-15'),
        endDate: new Date('2024-10-30'),
        description: 'Türkiye\'nin en büyük perakende zincirlerinden biri. Uygun fiyatlı temel gıda ürünleri satışı yapmaktadır. Perakende sektöründe faaliyet göstermektedir.',
        status: 'closed',
        createdBy: 15,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        symbol: 'ASELS',
        companyName: 'Aselsan Elektronik Sanayi ve Ticaret A.Ş.',
        exchange: 'BIST',
        priceMin: 125.00,
        priceMax: 140.00,
        lotSize: 20,
        startDate: new Date('2024-12-25'),
        endDate: new Date('2025-01-10'),
        description: 'Türkiye\'nin savunma sanayii alanındaki en büyük şirketi. Elektronik sistemler ve yazılım geliştirmektedir. Savunma sektöründe faaliyet göstermektedir.',
        status: 'ongoing',
        createdBy: 15,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        symbol: 'ARCLK',
        companyName: 'Arçelik A.Ş.',
        exchange: 'BIST',
        priceMin: 48.00,
        priceMax: 55.00,
        lotSize: 50,
        startDate: new Date('2025-02-01'),
        endDate: new Date('2025-02-15'),
        description: 'Türkiye\'nin en büyük beyaz eşya üreticisi. Avrupa\'da da önemli bir konuma sahiptir. Dayanıklı tüketim sektöründe faaliyet göstermektedir.',
        status: 'upcoming',
        createdBy: 15,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    await queryInterface.bulkInsert('Ipos', testIpos, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Ipos', null, {});
  }
};