# DIAPK Financial Platform

Modern, güvenli ve kullanıcı dostu finansal platform. React + Node.js ile geliştirilmiş full-stack uygulama.

## 🚀 Özellikler

- **💰 Mevduat Yönetimi**: Güvenli para yatırma ve çekme işlemleri
- **📈 Hisse Senedi Takibi**: Gerçek zamanlı borsa verileri
- **🎯 IPO Yatırımları**: Halka arz fırsatları
- **👤 KYC Sistemi**: Kimlik doğrulama ve güvenlik
- **💬 Canlı Destek**: Real-time chat sistemi
- **📱 PWA Desteği**: Mobil uygulama deneyimi
- **🔐 JWT Authentication**: Güvenli oturum yönetimi

## 🛠️ Teknolojiler

### Backend
- Node.js + Express.js
- SQLite/MySQL Database
- Sequelize ORM
- Socket.io (Real-time)
- JWT Authentication
- Rate Limiting & Security

### Frontend
- React 18 + TypeScript
- Material-UI (MUI)
- Redux Toolkit
- Vite Build Tool
- PWA Support

## 🚀 Railway Deployment

Bu proje Railway.app için optimize edilmiştir.

### Hızlı Deployment
1. Bu repository'yi fork edin
2. Railway hesabınızı GitHub ile bağlayın
3. Yeni proje oluşturun ve bu repository'yi seçin
4. Environment variables ekleyin (aşağıda detaylar)
5. Deploy edin!

### Gerekli Environment Variables
```bash
JWT_SECRET=your-super-secure-jwt-secret-key-here
```

### Opsiyonel API Keys
```bash
STOCK_API_KEY=your-stock-api-key
CURRENCY_API_KEY=your-currency-api-key
VITE_NEWS_API_KEY=your-news-api-key
VITE_MARKETAUX_API_KEY=your-marketaux-api-key
```

## 📋 Özellikler

- ✅ Otomatik database migration
- ✅ SQLite (harici DB gerekmez)
- ✅ Health check endpoint (`/health`)
- ✅ Production-ready konfigürasyon
- ✅ CORS ve güvenlik ayarları
- ✅ Rate limiting
- ✅ File upload desteği

## 🔧 Local Development

```bash
# Dependencies yükle
npm run install:all

# Development server başlat
npm run dev

# Production build
npm run build

# Production server
npm start
```

## 📚 API Documentation

Deployment sonrası `/api-docs` endpoint'inden API dokümantasyonuna erişebilirsiniz.

## 🏥 Health Check

`/health` endpoint'i uygulama durumunu kontrol etmek için kullanılır.

## 📄 License

MIT License - Detaylar için [LICENSE](LICENSE) dosyasına bakın.

---

**Railway.app ile hızlı ve kolay deployment! 🚀**