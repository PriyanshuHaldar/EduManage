const jwt = require('jsonwebtoken');

/**
 * Generate a signed JWT token for user authentication
 * @param {string} id - The Admin document _id
 * @returns {string} Signed JWT token
 */
const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'sms_fallback_secret_key_2026',
    {
      expiresIn: process.env.JWT_EXPIRE || '30d'
    }
  );
};

module.exports = generateToken;

