const jwt = require('jsonwebtoken');
const { User } = require('../models');

/**
 * Authentication middleware
 * Verifies JWT token and attaches user info to request
 */
const auth = async (req, res, next) => {
    try {
      const token = req.header('Authorization')?.replace('Bearer ', '');
      
      if (!token) {
        return res.status(401).json({ error: 'Erişim reddedildi. Token gereklidir.' });
      }

      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Get user from database to ensure they still exist and are active
        const user = await User.findByPk(decoded.userId, {
          attributes: ['id', 'email', 'firstName', 'lastName', 'role', 'isActive']
        });

        if (!user) {
          return res.status(401).json({ error: 'Geçersiz token. Kullanıcı bulunamadı.' });
        }

        if (!user.isActive) {
          return res.status(401).json({ error: 'Hesabınız deaktif edilmiştir.' });
        }

        req.user = {
          userId: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role
        };
        
        next();
      } catch (jwtError) {
        return res.status(401).json({ error: 'Geçersiz token.' });
      }
    } catch (error) {
      console.error('Auth middleware error:', error);
      res.status(500).json({ error: 'Kimlik doğrulama hatası' });
    }
};

/**
 * Role-based authorization middleware
 * Requires specific role(s) to access the route
 */
const authorize = (roles = []) => {
  // Ensure roles is an array
  if (typeof roles === 'string') {
    roles = [roles];
  }

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Kimlik doğrulama gereklidir' });
    }

    if (roles.length && !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Bu işlem için yetkiniz bulunmamaktadır' });
    }

    next();
  };
};

/**
 * Admin authorization middleware
 * Shorthand for authorize(['admin'])
 */
const adminAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Erişim reddedildi. Token gereklidir.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await User.findByPk(decoded.userId, {
      attributes: ['id', 'email', 'firstName', 'lastName', 'role', 'isActive']
    });

    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'Geçersiz token veya hesap deaktif.' });
    }

    if (user.role !== 'admin') {
      return res.status(403).json({ error: 'Bu işlem için admin yetkisi gereklidir.' });
    }

    req.user = {
      userId: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role
    };
    
    next();
  } catch (error) {
    console.error('Admin auth error:', error);
    res.status(401).json({ error: 'Geçersiz token.' });
  }
};

/**
 * Optional authentication middleware
 * Attaches user info if token is present, but doesn't require it
 */
const optionalAuth = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return next();
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.userId, {
      attributes: ['id', 'email', 'firstName', 'lastName', 'role', 'isActive']
    });

    if (user && user.isActive) {
      req.user = {
        userId: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      };
    }
  } catch (error) {
    // Ignore token errors for optional auth
  }
  
  next();
};

module.exports = {
  auth,
  authorize,
  adminAuth,
  optionalAuth
};