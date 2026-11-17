const express = require('express');
const router = express.Router();
const {
  getAttendanceByDate,
  saveAttendance,
  getAttendanceSummary,
  getStudentAttendanceHistory,
  getAttendanceDates
} = require('../controllers/attendanceController');
const { protect } = require('../middleware/authMiddleware');

// Protect all attendance endpoints with JWT authentication
router.use(protect);

// Date list
router.get('/dates', getAttendanceDates);

// Summary for date
router.get('/summary', getAttendanceSummary);

// Student specific history
router.get('/student/:studentId', getStudentAttendanceHistory);

// Specific date in path param
router.get('/date/:date', getAttendanceByDate);

// General route: GET (query date) and POST (save/update)
router.route('/')
  .get(getAttendanceByDate)
  .post(saveAttendance);

module.exports = router;

