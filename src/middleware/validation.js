const { validationResult } = require('express-validator');

/**
 * Handle validation errors middleware
 * Checks for validation errors and returns them in a standardized format
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      error: 'Doğrulama hatası', 
      details: errors.array().map(error => ({
        field: error.path || error.param,
        message: error.msg,
        value: error.value
      }))
    });
  }
  next();
};

/**
 * Custom validation functions
 */
const customValidations = {
  /**
   * Validate Turkish identity number (TC Kimlik No)
   */
  isTurkishId: (value) => {
    if (!value || value.length !== 11) {
      return false;
    }

    // All digits should be numeric
    if (!/^\d{11}$/.test(value)) {
      return false;
    }

    // First digit cannot be 0
    if (value[0] === '0') {
      return false;
    }

    // TC Kimlik No algorithm
    const digits = value.split('').map(Number);
    
    // Sum of first 10 digits
    const sum = digits.slice(0, 10).reduce((acc, digit) => acc + digit, 0);
    
    // 11th digit should be sum % 10
    if (digits[10] !== sum % 10) {
      return false;
    }

    // Algorithm for 10th digit
    const oddSum = digits[0] + digits[2] + digits[4] + digits[6] + digits[8];
    const evenSum = digits[1] + digits[3] + digits[5] + digits[7];
    const tenthDigit = ((oddSum * 7) - evenSum) % 10;
    
    if (digits[9] !== tenthDigit) {
      return false;
    }

    return true;
  },

  /**
   * Validate international phone number
   */
  isInternationalPhone: (value) => {
    if (!value) return false;
    
    // Remove all non-digit characters except +
    const cleaned = value.replace(/[^\d+]/g, '');
    
    // International phone number validation
    // Should start with + and have 7-15 digits total
    if (cleaned.startsWith('+')) {
      const digits = cleaned.slice(1);
      return /^\d{7,15}$/.test(digits);
    }
    
    // Without + sign, should be 7-15 digits
    return /^\d{7,15}$/.test(cleaned);
  },

  /**
   * Validate strong password
   */
  isStrongPassword: (value) => {
    if (!value || value.length < 8) {
      return false;
    }

    // At least one lowercase, one uppercase, one digit, one special character
    const hasLower = /[a-z]/.test(value);
    const hasUpper = /[A-Z]/.test(value);
    const hasDigit = /\d/.test(value);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(value);

    return hasLower && hasUpper && hasDigit && hasSpecial;
  },

  /**
   * Validate file extension
   */
  isValidFileExtension: (filename, allowedExtensions = []) => {
    if (!filename || !allowedExtensions.length) {
      return false;
    }

    const extension = filename.split('.').pop()?.toLowerCase();
    return allowedExtensions.includes(extension);
  },

  /**
   * Validate date range
   */
  isValidDateRange: (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    return start < end;
  },

  /**
   * Validate IBAN
   */
  isValidIBAN: (iban) => {
    if (!iban) return false;
    
    // Remove spaces and convert to uppercase
    const cleanIban = iban.replace(/\s/g, '').toUpperCase();
    
    // Turkish IBAN should be 26 characters and start with TR
    if (!/^TR\d{24}$/.test(cleanIban)) {
      return false;
    }

    // IBAN checksum validation (simplified)
    const rearranged = cleanIban.slice(4) + cleanIban.slice(0, 4);
    const numericString = rearranged.replace(/[A-Z]/g, (char) => 
      (char.charCodeAt(0) - 55).toString()
    );
    
    // Calculate mod 97
    let remainder = 0;
    for (let i = 0; i < numericString.length; i++) {
      remainder = (remainder * 10 + parseInt(numericString[i])) % 97;
    }
    
    return remainder === 1;
  }
};

/**
 * Sanitization functions
 */
const sanitizers = {
  /**
   * Sanitize Turkish phone number
   */
  sanitizePhone: (phone) => {
    if (!phone) return phone;
    
    // Remove all non-digit characters
    let cleaned = phone.replace(/\D/g, '');
    
    // Add country code if missing
    if (cleaned.length === 10 && cleaned.startsWith('5')) {
      cleaned = '90' + cleaned;
    }
    
    return cleaned;
  },

  /**
   * Sanitize IBAN
   */
  sanitizeIBAN: (iban) => {
    if (!iban) return iban;
    
    return iban.replace(/\s/g, '').toUpperCase();
  },

  /**
   * Sanitize amount (remove currency symbols, convert to number)
   */
  sanitizeAmount: (amount) => {
    if (typeof amount === 'number') return amount;
    if (!amount) return 0;
    
    // Remove currency symbols and spaces
    const cleaned = amount.toString().replace(/[₺$€£,\s]/g, '');
    return parseFloat(cleaned) || 0;
  }
};

module.exports = {
  handleValidationErrors,
  customValidations,
  sanitizers
};