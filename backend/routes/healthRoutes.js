const express = require('express');
const router = express.Router();

/**
 * @desc    Health check endpoint
 * @route   GET /api/health
 * @access  Public
 */
router.get('/', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Student Management System API is healthy and running',
    timestamp: new Date().toISOString(),
    uptime: `${process.uptime().toFixed(2)}s`
  });
});

module.exports = router;

