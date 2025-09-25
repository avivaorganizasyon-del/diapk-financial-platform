const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');
const { Op } = require('sequelize');
const TicketStore = require('../data/ticketStore');

// Validation middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};

/**
 * @route   GET /api/support/tickets
 * @desc    Get user's support tickets
 * @access  Public (temporarily for debugging)
 */
router.get('/tickets', async (req, res) => {
  try {
    // Get all tickets for debugging (normally would filter by user)
    const allTickets = TicketStore.getTickets();
    
    res.json({
      success: true,
      data: allTickets
    });
  } catch (error) {
    console.error('Get tickets error:', error);
    res.status(500).json({ error: 'Destek talepleri alınırken hata oluştu' });
  }
});

/**
 * @route   POST /api/support/tickets
 * @desc    Create a new support ticket
 * @access  Private
 */
router.post('/tickets',
  [
    auth,
    body('subject')
      .notEmpty()
      .withMessage('Konu gereklidir')
      .isLength({ max: 200 })
      .withMessage('Konu en fazla 200 karakter olabilir'),
    body('category')
      .isIn(['general', 'account', 'deposit', 'kyc', 'trading', 'technical', 'complaint'])
      .withMessage('Geçerli bir kategori seçiniz'),
    body('priority')
      .isIn(['low', 'medium', 'high', 'urgent'])
      .withMessage('Geçerli bir öncelik seçiniz'),
    body('message')
      .notEmpty()
      .withMessage('Mesaj gereklidir')
      .isLength({ max: 2000 })
      .withMessage('Mesaj en fazla 2000 karakter olabilir')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { subject, category, priority, message } = req.body;
      const userId = req.user.userId;
      
      // Create new ticket data
      const ticketData = {
        userId,
        subject,
        category,
        priority,
        status: 'open',
        user: {
          firstName: req.user.firstName || 'User',
          lastName: req.user.lastName || 'Name',
          email: req.user.email
        }
      };
      
      // Create ticket using store
      const newTicket = TicketStore.createTicket(ticketData);
      
      // Add initial message
      const initialMessage = {
        id: Date.now(),
        ticketId: newTicket.id,
        senderId: userId,
        senderType: 'user',
        message,
        createdAt: new Date().toISOString(),
        sender: {
          firstName: req.user.firstName || 'User',
          lastName: req.user.lastName || 'Name',
          email: req.user.email,
          role: 'user'
        }
      };
      
      TicketStore.addMessage(newTicket.id, initialMessage);
      
      res.status(201).json({
        success: true,
        message: 'Destek talebi başarıyla oluşturuldu',
        data: newTicket
      });
    } catch (error) {
      console.error('Create ticket error:', error);
      res.status(500).json({ error: 'Destek talebi oluşturulurken hata oluştu' });
    }
  }
);

/**
 * @route   POST /api/support/tickets/:ticketId/messages
 * @desc    Add message to support ticket
 * @access  Private
 */
router.post('/tickets/:ticketId/messages',
  [
    auth,
    body('message')
      .notEmpty()
      .withMessage('Mesaj gereklidir')
      .isLength({ max: 2000 })
      .withMessage('Mesaj en fazla 2000 karakter olabilir')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { ticketId } = req.params;
      const { message } = req.body;
      const userId = req.user.userId;
      
      // Find ticket
      const ticket = TicketStore.getTicketById(ticketId);
      
      if (!ticket || ticket.userId !== userId) {
        return res.status(404).json({ error: 'Destek talebi bulunamadı' });
      }
      
      // Add new message
      const newMessage = {
        id: Date.now(),
        ticketId: parseInt(ticketId),
        senderId: userId,
        senderType: 'user',
        message,
        createdAt: new Date().toISOString(),
        sender: {
          firstName: req.user.firstName || 'User',
          lastName: req.user.lastName || 'Name',
          email: req.user.email,
          role: 'user'
        }
      };
      
      TicketStore.addMessage(ticketId, newMessage);
      
      res.json({
        success: true,
        message: 'Mesaj başarıyla gönderildi',
        data: newMessage
      });
    } catch (error) {
      console.error('Send message error:', error);
      res.status(500).json({ error: 'Mesaj gönderilirken hata oluştu' });
    }
  }
);

/**
 * @route   GET /api/support/tickets/:ticketId
 * @desc    Get specific support ticket
 * @access  Private
 */
router.get('/tickets/:ticketId', auth, async (req, res) => {
  try {
    const { ticketId } = req.params;
    const userId = req.user.userId;
    
    // Find ticket
    const ticket = TicketStore.getTicketById(ticketId);
    
    if (!ticket || ticket.userId !== userId) {
      return res.status(404).json({ error: 'Destek talebi bulunamadı' });
    }
    
    res.json({
      success: true,
      data: ticket
    });
  } catch (error) {
    console.error('Get ticket error:', error);
    res.status(500).json({ error: 'Destek talebi alınırken hata oluştu' });
  }
});

module.exports = router;