const { User, Deposit, Kyc, Ipo, Stock, StockQuote, PaymentMethod } = require('./models');
const bcrypt = require('bcryptjs');

async function updateSystemData() {
  try {
    console.log('🔄 Sistem verilerini güncelleniyor...');
    
    // 1. Kullanıcı verilerini güncelle
    console.log('\n👥 Kullanıcı verileri güncelleniyor...');
    const users = await User.findAll();
    console.log(`Toplam ${users.length} kullanıcı bulundu`);
    
    const userUpdates = {
      2: { firstName: 'Ahmet', lastName: 'Yılmaz', phone: '+905321234567', email: 'ahmet.yilmaz@gmail.com' },
      3: { firstName: 'Fatma', lastName: 'Kaya', phone: '+905439876543', email: 'fatma.kaya@hotmail.com' },
      4: { firstName: 'Mehmet', lastName: 'Öztürk', phone: '+905551122334', email: 'mehmet.ozturk@yahoo.com' },
      5: { firstName: 'Ayşe', lastName: 'Demir', phone: '+905367788990', email: 'ayse.demir@outlook.com' },
      6: { firstName: 'Mustafa', lastName: 'Çelik', phone: '+905445566778', email: 'mustafa.celik@gmail.com' }
    };
    
    // Admin kullanıcısını oluştur veya güncelle
        let adminUser = await User.findOne({ where: { email: 'admin@diapk.com' } });
        if (!adminUser) {
      adminUser = await User.create({
        firstName: 'Admin',
        lastName: 'Yönetici',
        email: 'admin@diapk.com',
        phone: '+90 555 000 0001',
        password: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
        isVerified: true,
        role: 'admin',
        balance: 50000.00
      });
      console.log('✅ Admin kullanıcısı oluşturuldu');
    } else {
      await adminUser.update({
        firstName: 'Admin',
        lastName: 'Yönetici',
        email: 'admin@diapk.com',
        phone: '+90 555 000 0001',
        isVerified: true,
        role: 'admin',
        balance: 50000.00
      });
      console.log('✅ Admin kullanıcısı güncellendi');
    }

    const adminId = adminUser.id;

    for (let user of users) {
      if (user.id === 1) {
        // Admin zaten yukarıda işlendi
        continue;
      } else if (userUpdates[user.id]) {
        await user.update(userUpdates[user.id]);
        console.log(`✅ Kullanıcı ${user.id} (${userUpdates[user.id].firstName} ${userUpdates[user.id].lastName}) güncellendi`);
      }
    }
    
    // 2. Kullanıcı bakiyelerini güncelle
    console.log('\n💰 Kullanıcı bakiyeleri kontrol ediliyor...');
    for (let user of users) {
      if (user.id > 1) { // Admin hariç
        const existingDeposit = await Deposit.findOne({
          where: { userId: user.id, status: 'approved' }
        });
        
        if (!existingDeposit) {
          await Deposit.create({
            userId: user.id,
            amount: 1000.00,
            currency: 'USD',
            method: 'bank_transfer',
            status: 'approved',
            transactionId: `INIT_${user.id}_${Date.now()}`,
            bankInfo: JSON.stringify({
              bankName: 'Türkiye İş Bankası',
              accountNumber: '1234567890',
              iban: 'TR330006100519786457841326',
              description: 'İlk yatırım - Hoş geldin bonusu'
            }),
            reviewedBy: adminId,
            reviewedAt: new Date()
          });
          console.log(`✅ Kullanıcı ${user.id} için 1000 USD bakiye eklendi`);
        } else {
          console.log(`ℹ️  Kullanıcı ${user.id} zaten bakiyesi var (${existingDeposit.amount} ${existingDeposit.currency})`);
        }
      }
    }
    
    // 3. KYC verilerini güncelle
    console.log('\n📋 KYC verileri kontrol ediliyor...');
    const kycApplications = await Kyc.findAll();
    console.log(`Toplam ${kycApplications.length} KYC başvurusu bulundu`);
    
    for (let kyc of kycApplications) {
      if (kyc.status !== 'approved') {
        await kyc.update({
          status: 'approved',
          reviewedBy: adminId,
          reviewedAt: new Date(),
          comments: 'Sistem güncellemesi ile otomatik onaylandı'
        });
        console.log(`✅ KYC ${kyc.id} onaylandı`);
      }
    }
    
    // 4. IPO verilerini kontrol et
    console.log('\n🏢 IPO verileri kontrol ediliyor...');
    const ipos = await Ipo.findAll();
    console.log(`Toplam ${ipos.length} IPO bulundu`);
    
    if (ipos.length === 0) {
      console.log('⚠️  IPO verisi bulunamadı. Seeder çalıştırılması gerekiyor.');
    } else {
      ipos.forEach(ipo => {
        console.log(`📊 IPO: ${ipo.companyName} - ${ipo.status}`);
      });
    }
    
    // 5. Hisse senedi verilerini kontrol et
    console.log('\n📈 Hisse senedi verileri kontrol ediliyor...');
    const stocks = await Stock.findAll();
    console.log(`Toplam ${stocks.length} hisse senedi bulundu`);
    
    if (stocks.length === 0) {
      console.log('⚠️  Hisse senedi verisi bulunamadı. Seeder çalıştırılması gerekiyor.');
    } else {
      const quotes = await StockQuote.findAll({ limit: 5 });
      console.log(`📊 ${quotes.length} hisse senedi fiyatı bulundu`);
      quotes.forEach(quote => {
        console.log(`📈 ${quote.symbol}: $${quote.price} (${quote.changePercent > 0 ? '+' : ''}${quote.changePercent}%)`);
      });
    }
    
    // 6. Ödeme yöntemlerini kontrol et
    console.log('\n💳 Ödeme yöntemleri kontrol ediliyor...');
    const paymentMethods = await PaymentMethod.findAll();
    console.log(`Toplam ${paymentMethods.length} ödeme yöntemi bulundu`);
    
    paymentMethods.forEach(method => {
      console.log(`💳 ${method.name} (${method.type}) - ${method.isActive ? 'Aktif' : 'Pasif'}`);
    });
    
    console.log('\n✅ Sistem verileri başarıyla güncellendi!');
    console.log('\n📊 ÖZET:');
    console.log(`👥 Kullanıcılar: ${users.length}`);
    console.log(`📋 KYC Başvuruları: ${kycApplications.length}`);
    console.log(`🏢 IPO'lar: ${ipos.length}`);
    console.log(`📈 Hisse Senetleri: ${stocks.length}`);
    console.log(`💳 Ödeme Yöntemleri: ${paymentMethods.length}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Hata:', error);
    process.exit(1);
  }
}

updateSystemData();