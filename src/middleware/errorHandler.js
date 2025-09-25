const fs = require('fs');
const path = require('path');

/**
 * Custom error class for application errors
 */
class AppError extends Error {
  constructor(message, statusCode, code = null) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    this.code = code;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Log error to file
 */
const logError = (error, req = null) => {
  const logDir = path.join(__dirname, '../../logs');
  const logFile = path.join(logDir, 'error.log');

  // Create logs directory if it doesn't exist
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }

  const timestamp = new Date().toISOString();
  const userInfo = req?.user ? `User: ${req.user.userId} (${req.user.email})` : 'User: Anonymous';
  const requestInfo = req ? `${req.method} ${req.originalUrl}` : 'No request info';
  const userAgent = req?.get('User-Agent') || 'Unknown';
  const ip = req?.ip || req?.connection?.remoteAddress || 'Unknown';

  const logEntry = {
    timestamp,
    error: {
      message: error.message,
      stack: error.stack,
      statusCode: error.statusCode,
      code: error.code
    },
    request: {
      method: req?.method,
      url: req?.originalUrl,
      userAgent,
      ip,
      body: req?.body ? JSON.stringify(req.body) : null,
      params: req?.params ? JSON.stringify(req.params) : null,
      query: req?.query ? JSON.stringify(req.query) : null
    },
    user: userInfo
  };

  const logString = JSON.stringify(logEntry, null, 2) + '\n\n';

  fs.appendFile(logFile, logString, (err) => {
    if (err) {
      console.error('Error writing to log file:', err);
    }
  });
};

/**
 * Handle Sequelize errors
 */
const handleSequelizeError = (error) => {
  let message = 'Veritabanı hatası';
  let statusCode = 500;

  switch (error.name) {
    case 'SequelizeValidationError':
      message = 'Doğrulama hatası: ' + error.errors.map(e => e.message).join(', ');
      statusCode = 400;
      break;
    case 'SequelizeUniqueConstraintError':
      const field = error.errors[0]?.path;
      if (field === 'email') {
        message = 'Bu e-posta adresi zaten kullanılıyor';
      } else if (field === 'phone') {
        message = 'Bu telefon numarası zaten kullanılıyor';
      } else if (field === 'identityNumber') {
        message = 'Bu TC kimlik numarası zaten kullanılıyor';
      } else {
        message = 'Bu bilgi zaten kullanılıyor';
      }
      statusCode = 409;
      break;
    case 'SequelizeForeignKeyConstraintError':
      message = 'İlişkili veri bulunamadı';
      statusCode = 400;
      break;
    case 'SequelizeConnectionError':
    case 'SequelizeConnectionRefusedError':
    case 'SequelizeHostNotFoundError':
    case 'SequelizeHostNotReachableError':
      message = 'Veritabanı bağlantı hatası';
      statusCode = 503;
      break;
    case 'SequelizeTimeoutError':
      message = 'Veritabanı zaman aşımı';
      statusCode = 504;
      break;
    default:
      message = 'Veritabanı işlemi başarısız';
      statusCode = 500;
  }

  return new AppError(message, statusCode, error.name);
};

/**
 * Handle JWT errors
 */
const handleJWTError = (error) => {
  let message = 'Kimlik doğrulama hatası';
  
  if (error.name === 'JsonWebTokenError') {
    message = 'Geçersiz token';
  } else if (error.name === 'TokenExpiredError') {
    message = 'Token süresi dolmuş';
  } else if (error.name === 'NotBeforeError') {
    message = 'Token henüz aktif değil';
  }

  return new AppError(message, 401, error.name);
};

/**
 * Handle Multer errors (file upload)
 */
const handleMulterError = (error) => {
  let message = 'Dosya yükleme hatası';
  let statusCode = 400;

  switch (error.code) {
    case 'LIMIT_FILE_SIZE':
      message = 'Dosya boyutu çok büyük';
      break;
    case 'LIMIT_FILE_COUNT':
      message = 'Çok fazla dosya';
      break;
    case 'LIMIT_UNEXPECTED_FILE':
      message = 'Beklenmeyen dosya alanı';
      break;
    case 'MISSING_FIELD_NAME':
      message = 'Dosya alanı adı eksik';
      break;
    default:
      message = error.message || 'Dosya yükleme hatası';
  }

  return new AppError(message, statusCode, error.code);
};

/**
 * Send error response in development
 */
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack
  });
};

/**
 * Send error response in production
 */
const sendErrorProd = (err, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      error: err.message,
      status: err.status,
      ...(err.code && { code: err.code })
    });
  } else {
    // Programming or other unknown error: don't leak error details
    console.error('ERROR 💥', err);
    
    res.status(500).json({
      error: 'Bir şeyler yanlış gitti!',
      status: 'error'
    });
  }
};

/**
 * Global error handling middleware
 */
const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Log error
  logError(err, req);

  let error = { ...err };
  error.message = err.message;

  // Handle specific error types
  if (err.name?.startsWith('Sequelize')) {
    error = handleSequelizeError(err);
  } else if (err.name?.includes('JsonWebToken') || err.name?.includes('Token')) {
    error = handleJWTError(err);
  } else if (err.code?.startsWith('LIMIT_') || err.code === 'MISSING_FIELD_NAME') {
    error = handleMulterError(err);
  }

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(error, res);
  } else {
    sendErrorProd(error, res);
  }
};

/**
 * Catch async errors wrapper
 */
const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

/**
 * Handle unhandled routes
 */
const handleNotFound = (req, res, next) => {
  const err = new AppError(`${req.originalUrl} endpoint'i bulunamadı`, 404);
  next(err);
};

/**
 * Handle uncaught exceptions
 */
process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  logError(err);
  process.exit(1);
});

/**
 * Handle unhandled promise rejections
 */
process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  logError(err);
  process.exit(1);
});

module.exports = {
  AppError,
  globalErrorHandler,
  catchAsync,
  handleNotFound,
  logError
};