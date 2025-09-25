# 🏦 DIAPK Financial Platform

Comprehensive Financial Platform with KYC, Deposits, IPO, Stock Quotes, Chat and Admin Panel

## 🚀 Features

- **👤 User Management**: Registration, Login, KYC verification
- **💰 Financial Operations**: Deposits, withdrawals, balance management
- **📈 Stock Market**: Real-time stock quotes, BIST100 data
- **🎯 IPO Management**: IPO subscriptions and management
- **💬 Live Chat**: Real-time communication system
- **👨‍💼 Admin Panel**: Comprehensive admin dashboard
- **📱 Responsive Design**: Mobile-first approach
- **🔒 Security**: JWT authentication, rate limiting

## 🛠️ Tech Stack

### Backend
- **Node.js** with Express.js
- **SQLite** database with Sequelize ORM
- **JWT** authentication
- **Socket.IO** for real-time features
- **Cron jobs** for automated tasks

### Frontend
- **React** with TypeScript
- **Vite** build tool
- **Material-UI** components
- **Redux Toolkit** state management
- **PWA** support

## 📦 Installation

### Prerequisites
- Node.js >= 20.0.0
- npm >= 10.0.0

### Quick Start

1. **Clone the repository**
```bash
git clone <repository-url>
cd diapk-financial-platform
```

2. **Install dependencies**
```bash
npm run install:all
```

3. **Build frontend**
```bash
npm run build
```

4. **Start the application**
```bash
npm start
```

The application will be available at `http://localhost:3000`

## 🚀 Deployment

### Render.com (Recommended)
1. Upload project to Render.com
2. Render will automatically detect `render.yaml`
3. Deploy with one click

### Railway
1. Connect your GitHub repository
2. Railway will use `railway.json` configuration
3. Deploy automatically

### Heroku
```bash
heroku create your-app-name
git push heroku main
```

## 📁 Project Structure

```
├── src/                    # Backend source code
│   ├── controllers/        # Route controllers
│   ├── models/            # Database models
│   ├── routes/            # API routes
│   ├── middleware/        # Custom middleware
│   ├── jobs/              # Cron jobs
│   └── server.js          # Main server file
├── frontend/              # Frontend React application
│   ├── src/               # Frontend source code
│   ├── public/            # Static assets
│   └── dist/              # Built frontend
├── migrations/            # Database migrations
├── seeders/              # Database seeders
├── render.yaml           # Render.com configuration
├── railway.json          # Railway configuration
└── Procfile              # Heroku configuration
```

## 🔧 Environment Variables

```env
NODE_ENV=production
PORT=3000
JWT_SECRET=your-secret-key
DB_DIALECT=sqlite
DB_STORAGE=database.sqlite
CORS_ORIGIN=your-domain
FRONTEND_URL=your-domain
```

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Stocks
- `GET /api/stocks` - Get all stocks
- `GET /api/stocks/:id` - Get stock details
- `GET /api/stocks/:id/quotes` - Get stock quotes

### IPO
- `GET /api/ipos` - Get all IPOs
- `POST /api/ipos/:id/subscribe` - Subscribe to IPO

### Admin
- `GET /api/admin/users` - Get all users
- `GET /api/admin/stats` - Get platform statistics

## 🔒 Security Features

- JWT token authentication
- Rate limiting
- CORS protection
- Helmet security headers
- Input validation
- SQL injection protection

## 📱 PWA Features

- Offline support
- Push notifications
- App-like experience
- Service worker caching

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support, email support@diapk.com or join our Slack channel.

## 🚀 Live Demo

- **Production**: [Your deployed URL]
- **Admin Panel**: [Your deployed URL]/admin
- **API Documentation**: [Your deployed URL]/api

---

Made with ❤️ by DIAPK Team