const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

/**
 * Authentication middleware to protect sensitive routes
 * Checks for Bearer token in Authorization header, verifies JWT,
 * and attaches verified admin user to req.user.
 * Never throws uncaught errors or crashes the process.
 */
const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // 1. Check if Authorization header is present and starts with 'Bearer '
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized: No authentication token provided.'
      });
    }

    // 2. Extract token from 'Bearer <token>'
    const token = authHeader.split(' ')[1];
    if (!token || token.trim() === '') {
      return res.status(401).json({
        success: false,
        error: 'Not authorized: No authentication token provided.'
      });
    }

    // 3. Verify JWT token
    let decoded;
    try {
      decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'sms_fallback_secret_key_2026'
      );
    } catch (jwtError) {
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          error: 'Session expired. Please log in again.'
        });
      }
      return res.status(401).json({
        success: false,
        error: 'Not authorized: Invalid authentication token.'
      });
    }

    // 4. Fetch admin user from MongoDB (excluding password)
    const user = await Admin.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized: User account no longer exists.'
      });
    }

    // 5. Attach authenticated user to request and continue to next middleware/handler
    req.user = user;
    return next();
  } catch (error) {
    // Failsafe catch block to prevent unhandled rejections from crashing the server
    return res.status(401).json({
      success: false,
      error: 'Not authorized: Authentication verification failed.'
    });
  }
};

module.exports = { protect };
