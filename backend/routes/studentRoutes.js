const express = require('express');
const router = express.Router();
const {
  createStudent,
  getAllStudents,
  getStudentById,
  updateStudent,
  deleteStudent
} = require('../controllers/studentController');
const { protect } = require('../middleware/authMiddleware');

// Protect all student CRUD endpoints with JWT authentication
router.use(protect);

// Routes for /api/students
router.route('/')
  .post(createStudent)
  .get(getAllStudents);

// Routes for /api/students/:id
router.route('/:id')
  .get(getStudentById)
  .put(updateStudent)
  .delete(deleteStudent);

module.exports = router;
