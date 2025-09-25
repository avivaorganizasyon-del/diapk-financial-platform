const { sequelize, IpoSubscription } = require('./models');

async function clearIpoSubscriptions() {
    try {
        console.log('🗑️ IPO subscription verilerini temizleniyor...');
        
        // Tüm IPO subscription'larını sil
        await IpoSubscription.destroy({
            where: {},
            truncate: true
        });
        
        console.log('✅ IPO subscription verileri temizlendi');
        
    } catch (error) {
        console.error('❌ Hata:', error);
    } finally {
        await sequelize.close();
    }
}

clearIpoSubscriptions();