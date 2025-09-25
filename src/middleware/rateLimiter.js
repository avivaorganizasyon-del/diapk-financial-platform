const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const Redis = require('ioredis');

// Redis client for rate limiting (optional, falls back to memory store)
let redisClient;
try {
  if (process.env.REDIS_URL) {
    redisClient = new Redis(process.env.REDIS_URL);
  }
} catch (error) {
  console.warn('Redis not available for rate limiting, using memory store');
}

/**
 * Create rate limiter with custom options
 */
const createRateLimiter = (options = {}) => {
  const defaultOptions = {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: {
      error: 'Çok fazla istek gönderdiniz. Lütfen daha sonra tekrar deneyin.',
      retryAfter: Math.ceil(options.windowMs / 1000) || 900
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    handler: (req, res) => {
      res.status(429).json({
        error: 'Çok fazla istek gönderdiniz. Lütfen daha sonra tekrar deneyin.',
        retryAfter: Math.ceil(options.windowMs / 1000) || 900
      });
    },
    ...options
  };

  // Use Redis store if available
  if (redisClient) {
    defaultOptions.store = new RedisStore({
      sendCommand: (...args) => redisClient.call(...args),
    });
  }

  return rateLimit(defaultOptions);
};

/**
 * General API rate limiter
 * 100 requests per 15 minutes
 */
const generalLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: {
    error: 'Çok fazla API isteği. 15 dakika sonra tekrar deneyin.',
    retryAfter: 900
  }
});

/**
 * Authentication rate limiter
 * 5 login attempts per 15 minutes
 */
const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: {
    error: 'Çok fazla giriş denemesi. 15 dakika sonra tekrar deneyin.',
    retryAfter: 900
  },
  skipSuccessfulRequests: true // Don't count successful requests
});

/**
 * Registration rate limiter
 * 3 registration attempts per hour
 */
const registerLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  message: {
    error: 'Çok fazla kayıt denemesi. 1 saat sonra tekrar deneyin.',
    retryAfter: 3600
  }
});

/**
 * Password reset rate limiter
 * 3 attempts per hour
 */
const passwordResetLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  message: {
    error: 'Çok fazla şifre sıfırlama denemesi. 1 saat sonra tekrar deneyin.',
    retryAfter: 3600
  }
});

/**
 * File upload rate limiter
 * 10 uploads per hour
 */
const uploadLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  message: {
    error: 'Çok fazla dosya yükleme denemesi. 1 saat sonra tekrar deneyin.',
    retryAfter: 3600
  }
});

/**
 * IPO subscription rate limiter
 * 50 requests per minute (to prevent spam during IPO launches)
 */
const ipoLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 50,
  message: {
    error: 'Çok fazla IPO işlemi. 1 dakika sonra tekrar deneyin.',
    retryAfter: 60
  }
});

/**
 * Search rate limiter
 * 100 searches per minute
 */
const searchLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 100,
  message: {
    error: 'Çok fazla arama isteği. 1 dakika sonra tekrar deneyin.',
    retryAfter: 60
  }
});

/**
 * Admin operations rate limiter
 * 500 requests per 15 minutes
 */
const adminLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500,
  message: {
    error: 'Çok fazla admin işlemi. 15 dakika sonra tekrar deneyin.',
    retryAfter: 900
  }
});

/**
 * Strict rate limiter for sensitive operations
 * 50 requests per hour
 */
const strictLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50,
  message: {
    error: 'Çok fazla hassas işlem denemesi. 1 saat sonra tekrar deneyin.',
    retryAfter: 3600
  }
});

/**
 * Custom rate limiter for specific routes
 */
const customLimiter = (windowMs, max, message) => {
  return createRateLimiter({
    windowMs,
    max,
    message: {
      error: message || 'Çok fazla istek. Lütfen daha sonra tekrar deneyin.',
      retryAfter: Math.ceil(windowMs / 1000)
    }
  });
};

module.exports = {
  createRateLimiter,
  generalLimiter,
  authLimiter,
  registerLimiter,
  passwordResetLimiter,
  uploadLimiter,
  ipoLimiter,
  searchLimiter,
  adminLimiter,
  strictLimiter,
  customLimiter
};