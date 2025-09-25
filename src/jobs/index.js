const cron = require('node-cron');
const { updateIpoStatuses } = require('./ipoStatusUpdater');
const { updateStockQuotes } = require('./stockQuoteUpdater');
const { CronLog } = require('../models');

class JobScheduler {
  static init() {
    console.log('🕐 Cron jobs başlatılıyor...');

    // IPO durumlarını güncelle - Her gün 09:00'da
    cron.schedule('0 9 * * *', async () => {
      await JobScheduler.runJob('ipo-status-update', updateIpoStatuses);
    }, {
      scheduled: true,
      timezone: 'Europe/Istanbul'
    });

    // Hisse senedi fiyatlarını güncelle - Pazartesi-Cuma 09:30-18:00 arası her 5 dakikada
    cron.schedule('*/5 9-18 * * 1-5', async () => {
      await JobScheduler.runJob('stock-quotes-update', updateStockQuotes);
    }, {
      scheduled: true,
      timezone: 'Europe/Istanbul'
    });

    // Hisse senedi fiyatlarını güncelle - Hafta sonu için günde bir kez
    cron.schedule('0 12 * * 0,6', async () => {
      await JobScheduler.runJob('stock-quotes-weekend-update', updateStockQuotes);
    }, {
      scheduled: true,
      timezone: 'Europe/Istanbul'
    });

    console.log('✅ Cron jobs başarıyla başlatıldı');
  }

  static async runJob(jobName, jobFunction) {
    const startTime = Date.now();
    
    try {
      console.log(`🔄 ${jobName} başlatılıyor...`);
      
      await jobFunction();
      
      const executionTime = Date.now() - startTime;
      
      await CronLog.create({
        jobName,
        status: 'success',
        message: `Job başarıyla tamamlandı`,
        executionTime
      });
      
      console.log(`✅ ${jobName} tamamlandı (${executionTime}ms)`);
    } catch (error) {
      const executionTime = Date.now() - startTime;
      
      await CronLog.create({
        jobName,
        status: 'error',
        message: error.message,
        executionTime
      });
      
      console.error(`❌ ${jobName} hatası:`, error.message);
    }
  }

  static async getJobLogs(limit = 50) {
    return await CronLog.findAll({
      order: [['createdAt', 'DESC']],
      limit
    });
  }
}

module.exports = JobScheduler;