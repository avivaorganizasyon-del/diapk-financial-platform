const { Ipo, IpoSubscription } = require('../models');
const { Op } = require('sequelize');

class IpoStatusUpdater {
  static async updateIpoStatuses() {
    const now = new Date();
    
    try {
      // Başlangıç tarihi geçen IPO'ları 'active' yap
      const startingIpos = await Ipo.update(
        { status: 'active' },
        {
          where: {
            status: 'upcoming',
            startDate: {
              [Op.lte]: now
            }
          }
        }
      );

      // Bitiş tarihi geçen IPO'ları 'closed' yap
      const closingIpos = await Ipo.update(
        { status: 'closed' },
        {
          where: {
            status: 'active',
            endDate: {
              [Op.lt]: now
            }
          }
        }
      );

      // Kapalı IPO'lar için tahsis işlemini başlat
      const closedIpos = await Ipo.findAll({
        where: {
          status: 'closed',
          allocationCompleted: false
        }
      });

      for (const ipo of closedIpos) {
        await this.processIpoAllocation(ipo);
      }

      console.log(`IPO Status Update: ${startingIpos[0]} IPO başlatıldı, ${closingIpos[0]} IPO kapatıldı, ${closedIpos.length} IPO tahsisi işlendi`);
      
      return {
        started: startingIpos[0],
        closed: closingIpos[0],
        allocated: closedIpos.length
      };
    } catch (error) {
      console.error('IPO status update error:', error);
      throw error;
    }
  }

  static async processIpoAllocation(ipo) {
    try {
      // IPO'ya yapılan tüm başvuruları al
      const subscriptions = await IpoSubscription.findAll({
        where: {
          ipoId: ipo.id,
          status: 'confirmed'
        },
        order: [['createdAt', 'ASC']] // İlk gelen ilk alır prensibi
      });

      let remainingShares = ipo.totalShares;
      const allocations = [];

      // Basit tahsis algoritması - İlk gelen ilk alır
      for (const subscription of subscriptions) {
        if (remainingShares <= 0) {
          // Kalan hisse yok, reddedildi olarak işaretle
          await subscription.update({
            status: 'rejected',
            allocationQuantity: 0,
            allocationAmount: 0
          });
          continue;
        }

        const requestedQuantity = subscription.quantity;
        const allocatedQuantity = Math.min(requestedQuantity, remainingShares);
        const allocatedAmount = allocatedQuantity * subscription.pricePerShare;

        await subscription.update({
          status: 'allocated',
          allocationQuantity: allocatedQuantity,
          allocationAmount: allocatedAmount
        });

        remainingShares -= allocatedQuantity;
        allocations.push({
          subscriptionId: subscription.id,
          userId: subscription.userId,
          allocated: allocatedQuantity,
          amount: allocatedAmount
        });
      }

      // IPO tahsis tamamlandı olarak işaretle
      await ipo.update({
        allocationCompleted: true,
        allocatedShares: ipo.totalShares - remainingShares,
        remainingShares: remainingShares
      });

      console.log(`IPO ${ipo.companyName} tahsisi tamamlandı. ${allocations.length} başvuru tahsis edildi.`);
      
      return allocations;
    } catch (error) {
      console.error(`IPO ${ipo.id} tahsis hatası:`, error);
      throw error;
    }
  }

  static async getIpoStatistics() {
    try {
      const stats = await Ipo.findAll({
        attributes: [
          'status',
          [Ipo.sequelize.fn('COUNT', Ipo.sequelize.col('id')), 'count']
        ],
        group: ['status']
      });

      return stats.reduce((acc, stat) => {
        acc[stat.status] = parseInt(stat.dataValues.count);
        return acc;
      }, {});
    } catch (error) {
      console.error('IPO statistics error:', error);
      throw error;
    }
  }
}

module.exports = {
  updateIpoStatuses: () => IpoStatusUpdater.updateIpoStatuses(),
  processIpoAllocation: (ipo) => IpoStatusUpdater.processIpoAllocation(ipo),
  getIpoStatistics: () => IpoStatusUpdater.getIpoStatistics()
};