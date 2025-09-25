const bcrypt = require('bcryptjs');
const { generateToken } = require('../config/jwt');
const { User, InviteCode } = require('../models');

class AuthController {
  /**
   * Register new user
   */
  static async register(req, res) {
    try {
      const { email, password, firstName, lastName, phone, inviteCode } = req.body;

      // Davet kodu kontrolü
      const invite = await InviteCode.findOne({
        where: { code: inviteCode, isUsed: false }
      });

      if (!invite) {
        return res.status(400).json({ error: 'Geçersiz veya kullanılmış davet kodu' });
      }

      // Davet kodunun süresi dolmuş mu?
      if (invite.expiresAt && new Date() > invite.expiresAt) {
        return res.status(400).json({ error: 'Davet kodunun süresi dolmuş' });
      }

      // Telefon numarası kontrolü
      const existingUser = await User.findOne({ where: { phone } });
      if (existingUser) {
        return res.status(400).json({ error: 'Bu telefon numarası zaten kullanılıyor' });
      }

      // Kullanıcı oluştur
      const user = await User.create({
        email,
        password,
        firstName,
        lastName,
        phone,
        inviteCodeUsed: inviteCode
      });

      // Davet kodunu kullanılmış olarak işaretle
      await invite.update({
        isUsed: true,
        usedBy: user.id
      });

      // Token oluştur
      const token = generateToken({ userId: user.id, role: user.role });

      res.status(201).json({
        message: 'Kullanıcı başarıyla oluşturuldu',
        token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role
        }
      });
    } catch (error) {
      console.error('Register error:', error);
      res.status(500).json({ error: 'Kayıt işlemi sırasında hata oluştu' });
    }
  }

  /**
   * User login
   */
  static async login(req, res) {
    try {
      const { phone, email, password } = req.body;

      // Kullanıcı kontrolü - email veya phone ile
      const { Op } = require('sequelize');
      const user = await User.findOne({ 
        where: {
          [Op.or]: [
            email ? { email } : null,
            phone ? { phone } : null
          ].filter(Boolean)
        }
      });
      
      if (!user) {
        return res.status(401).json({ error: 'Geçersiz giriş bilgileri' });
      }

      // Aktif kullanıcı kontrolü
        if (!user.isActive) {
          return res.status(401).json({ error: 'Hesabınız devre dışı bırakılmış' });
        }
  
        // Şifre kontrolü
        const isValidPassword = await user.comparePassword(password);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Geçersiz telefon numarası veya şifre' });
      }

      // Token oluştur
      const token = generateToken({ userId: user.id, role: user.role });

      res.json({
        message: 'Giriş başarılı',
        token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Giriş işlemi sırasında hata oluştu' });
    }
  }

  /**
   * Get user profile
   */
  static async getProfile(req, res) {
    try {
      const user = await User.findByPk(req.user.userId, {
        attributes: { exclude: ['password'] }
      });

      if (!user) {
        return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
      }

      res.json({ user });
    } catch (error) {
      console.error('Profile error:', error);
      res.status(500).json({ error: 'Profil bilgisi alınırken hata oluştu' });
    }
  }

  /**
   * Change user password
   */
  static async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.user.userId;

      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
      }

      // Mevcut şifre kontrolü
      const isValidPassword = await user.comparePassword(currentPassword);
      if (!isValidPassword) {
        return res.status(400).json({ error: 'Mevcut şifre yanlış' });
      }

      // Yeni şifre güncelleme
      await user.update({ password: newPassword });

      res.json({ message: 'Şifre başarıyla değiştirildi' });
    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({ error: 'Şifre değiştirme sırasında hata oluştu' });
    }
  }

  /**
   * Refresh JWT token
   */
  static async refreshToken(req, res) {
    try {
      const userId = req.user.userId;

      const user = await User.findByPk(userId, {
        attributes: ['id', 'email', 'firstName', 'lastName', 'role', 'isActive']
      });

      if (!user || !user.isActive) {
        return res.status(401).json({ error: 'Kullanıcı bulunamadı veya aktif değil' });
      }

      // Yeni token oluştur
      const token = generateToken({ userId: user.id, role: user.role });

      res.json({
        message: 'Token yenilendi',
        token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role
        }
      });
    } catch (error) {
      console.error('Refresh token error:', error);
      res.status(500).json({ error: 'Token yenileme sırasında hata oluştu' });
    }
  }

  /**
   * Logout user (client-side token invalidation)
   */
  static async logout(req, res) {
    try {
      const userId = req.user.userId;
      console.log(`User ${userId} logged out at ${new Date().toISOString()}`);

      res.json({ 
        message: 'Başarıyla çıkış yapıldı',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({ error: 'Çıkış yapılırken hata oluştu' });
    }
  }
}

module.exports = AuthController;