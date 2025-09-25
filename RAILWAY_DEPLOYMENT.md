# Railway Deployment Guide for DIAPK Financial Platform

## 🚀 Quick Deployment Steps

### 1. GitHub Repository
- **Repository URL**: `https://github.com/avivaorganizasyon-del/diapk-financial-platform.git`
- **Branch**: `main`
- **Root Directory**: `/` (monorepo structure)

### 2. Build Configuration
Railway will automatically detect the configuration from `railway.json`:

```json
{
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm run install:all && npm run build"
  },
  "deploy": {
    "startCommand": "npm start",
    "healthcheckPath": "/health"
  }
}
```

### 3. Environment Variables (Required)

#### Core Variables (Must Set in Railway Dashboard)
```bash
# JWT Security
JWT_SECRET=your-super-secure-jwt-secret-key-here-change-this-in-production

# External API Keys (Optional but recommended)
STOCK_API_KEY=your-stock-api-key-here
CURRENCY_API_KEY=your-currency-api-key-here
VITE_NEWS_API_KEY=your-news-api-key-here
VITE_MARKETAUX_API_KEY=your-marketaux-api-key-here
```

#### Auto-Configured Variables (Railway handles these)
```bash
NODE_ENV=production
PORT=${{RAILWAY_PUBLIC_DOMAIN_PORT}}
DB_DIALECT=sqlite
DB_STORAGE=./database.sqlite
CORS_ORIGIN=https://${{RAILWAY_PUBLIC_DOMAIN}}
FRONTEND_URL=https://${{RAILWAY_PUBLIC_DOMAIN}}
SOCKET_CORS_ORIGIN=https://${{RAILWAY_PUBLIC_DOMAIN}}
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
MAX_FILE_SIZE=5242880
VITE_API_BASE_URL=https://${{RAILWAY_PUBLIC_DOMAIN}}/api
VITE_WS_URL=wss://${{RAILWAY_PUBLIC_DOMAIN}}
VITE_NODE_ENV=production
VITE_APP_NAME=DIAPK Financial Platform
VITE_APP_VERSION=1.0.0
```

### 4. Database Configuration
- **Default**: SQLite (file-based, no external database needed)
- **File Location**: `./database.sqlite` (persistent storage)
- **Migrations**: Auto-run on startup
- **Seeders**: Auto-run for initial data

### 5. Features Included
- ✅ Full-stack React + Node.js application
- ✅ SQLite database (no external DB required)
- ✅ JWT authentication
- ✅ Real-time WebSocket support
- ✅ File upload capabilities
- ✅ Rate limiting
- ✅ CORS configuration
- ✅ PWA support
- ✅ Health check endpoint (`/health`)

### 6. Post-Deployment Checklist
1. ✅ Application starts successfully
2. ✅ Health check responds at `/health`
3. ✅ Frontend loads correctly
4. ✅ API endpoints work (`/api/*`)
5. ✅ WebSocket connections establish
6. ✅ Database migrations complete
7. ✅ File uploads work (if needed)

### 7. Monitoring & Logs
- **Health Check**: `https://your-app.railway.app/health`
- **API Documentation**: `https://your-app.railway.app/api-docs`
- **Logs**: Available in Railway dashboard

### 8. Scaling & Performance
- **Instance Type**: Hobby plan recommended for start
- **Memory**: 512MB minimum
- **CPU**: Shared CPU sufficient
- **Storage**: Persistent for SQLite database

### 9. Security Features
- ✅ Helmet.js security headers
- ✅ CORS protection
- ✅ Rate limiting
- ✅ JWT token authentication
- ✅ Input validation
- ✅ File upload restrictions

### 10. Troubleshooting
If deployment fails:
1. Check build logs in Railway dashboard
2. Verify all required environment variables are set
3. Ensure `JWT_SECRET` is properly configured
4. Check health endpoint after deployment

---

## 📋 Manual Environment Variables Setup

Copy these to Railway dashboard environment variables section:

```
JWT_SECRET=your-super-secure-jwt-secret-key-here-change-this-in-production
STOCK_API_KEY=your-stock-api-key-here
CURRENCY_API_KEY=your-currency-api-key-here
VITE_NEWS_API_KEY=your-news-api-key-here
VITE_MARKETAUX_API_KEY=your-marketaux-api-key-here
```

All other variables are automatically configured via `railway.json`.

---

**Ready for deployment! 🚀**