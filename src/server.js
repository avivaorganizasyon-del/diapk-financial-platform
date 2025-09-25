require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const path = require('path');
const { sequelize } = require('./models');
const routes = require('./routes');
const { globalErrorHandler, handleNotFound } = require('./middleware/errorHandler');
// const { generalLimiter } = require('./middleware/rateLimiter'); // Rate limiting kaldırıldı
const JobScheduler = require('./jobs');

const app = express();
const PORT = process.env.PORT || 3000;

// Trust proxy (for rate limiting behind reverse proxy)
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"]
    }
  },
  crossOriginEmbedderPolicy: false
}));

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      process.env.FRONTEND_URL || 'http://localhost:3000',
      'http://localhost:3001',
      'https://diapk.com',
      'https://www.diapk.com',
      'https://diaglobale.com',
      'https://www.diaglobale.com',
      'https://api.diaglobale.com',
      'http://diaglobale.com',
      'http://www.diaglobale.com'
    ];
    
    console.log('CORS Check - Origin:', origin);
    console.log('CORS Check - Allowed Origins:', allowedOrigins);
    
    // Allow requests with no origin (mobile apps, etc.)
    if (!origin) {
      console.log('CORS: No origin, allowing request');
      return callback(null, true);
    }
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      console.log('CORS: Origin allowed');
      callback(null, true);
    } else {
      console.log('CORS: Origin not allowed, rejecting');
      callback(new Error('CORS policy violation'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));

// Debug middleware - sadece development'ta
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.originalUrl}`);
    next();
  });
}

// Rate limiting (geçici olarak devre dışı - development için)
// app.use('/api', generalLimiter);

// Body parsing middleware
app.use(express.json({ 
  limit: process.env.JSON_LIMIT || '10mb',
  type: ['application/json', 'application/json; charset=utf-8'],
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ 
  extended: true, 
  limit: process.env.URL_LIMIT || '10mb' 
}));

// Static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads'), {
  maxAge: '1d',
  etag: true
}));

// Serve frontend static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../public')));
}

// API Routes
app.use('/api', routes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    memory: process.memoryUsage(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// API documentation endpoint
app.get('/api-docs', (req, res) => {
  res.json({
    title: 'DIAPK API Documentation',
    version: '1.0.0',
    description: 'Digital Investment and Public Offering Platform API',
    baseUrl: `${req.protocol}://${req.get('host')}/api`,
    endpoints: {
      auth: '/api/auth - Authentication endpoints',
      admin: '/api/admin - Admin management',
      stocks: '/api/stocks - Stock market data',
      ipos: '/api/ipos - IPO management',
      user: '/api/user - User operations'
    }
  });
});

// Serve frontend app in production
if (process.env.NODE_ENV === 'production') {
  // Serve static files from frontend/dist
  app.use(express.static(path.join(__dirname, '../frontend/dist'), {
    maxAge: '1y',
    etag: true,
    lastModified: true
  }));
  
  // Catch all handler for SPA routing
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
  });
}

// 404 handler for API routes
app.use('/api/*', handleNotFound);

// Global error handling middleware
app.use(globalErrorHandler);

// Database connection and server start
const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
    
    app.listen(PORT, async () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
      if (process.env.NODE_ENV === 'production') {
        console.log(`🌐 Frontend URL: http://localhost:${PORT}`);
      }
      
      // Initialize cron jobs
      try {
        JobScheduler.init();
      } catch (error) {
        console.error('❌ Cron jobs başlatılırken hata:', error.message);
        console.error('❌ Cron jobs stack:', error.stack);
      }
    });
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;