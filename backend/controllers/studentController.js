const mongoose = require('mongoose');
const Student = require('../models/Student');

/**
 * @desc    Create a new student
 * @route   POST /api/students
 * @access  Public
 */
const createStudent = async (req, res, next) => {
  try {
    const {
      studentName,
      registrationNumber,
      email,
      phone,
      course,
      semester
    } = req.body;

    // Check required fields explicitly for beginner-friendly client feedback
    if (!studentName || !registrationNumber || !email || !phone || !course || semester === undefined) {
      res.status(400);
      throw new Error('Please provide all required fields: studentName, registrationNumber, email, phone, course, semester');
    }

    // Check if registrationNumber or email already exists
    const existingRegistration = await Student.findOne({
      registrationNumber: registrationNumber.toString().toUpperCase()
    });
    if (existingRegistration) {
      res.status(409);
      throw new Error(`Student with registration number '${registrationNumber}' already exists.`);
    }

    const existingEmail = await Student.findOne({
      email: email.toString().toLowerCase()
    });
    if (existingEmail) {
      res.status(409);
      throw new Error(`Student with email '${email}' already exists.`);
    }

    const student = await Student.create({
      studentName,
      registrationNumber,
      email,
      phone,
      course,
      semester
    });

    res.status(201).json({
      success: true,
      message: 'Student created successfully',
      data: student
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all students
 * @route   GET /api/students
 * @access  Public
 */
const getAllStudents = async (req, res, next) => {
  try {
    const students = await Student.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: students.length,
      data: students
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get a single student by ID
 * @route   GET /api/students/:id
 * @access  Public
 */
const getStudentById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400);
      throw new Error(`Invalid student ID format: '${id}'`);
    }

    const student = await Student.findById(id);

    if (!student) {
      res.status(404);
      throw new Error(`Student not found with ID: '${id}'`);
    }

    res.status(200).json({
      success: true,
      data: student
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a student by ID
 * @route   PUT /api/students/:id
 * @access  Public
 */
const updateStudent = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400);
      throw new Error(`Invalid student ID format: '${id}'`);
    }

    const existingStudent = await Student.findById(id);
    if (!existingStudent) {
      res.status(404);
      throw new Error(`Student not found with ID: '${id}'`);
    }

    // Check for duplicate registrationNumber if changed
    if (req.body.registrationNumber) {
      const regDuplicate = await Student.findOne({
        registrationNumber: req.body.registrationNumber.toString().toUpperCase(),
        _id: { $ne: id }
      });
      if (regDuplicate) {
        res.status(409);
        throw new Error(`Registration number '${req.body.registrationNumber}' is already in use.`);
      }
    }

    // Check for duplicate email if changed
    if (req.body.email) {
      const emailDuplicate = await Student.findOne({
        email: req.body.email.toString().toLowerCase(),
        _id: { $ne: id }
      });
      if (emailDuplicate) {
        res.status(409);
        throw new Error(`Email '${req.body.email}' is already in use.`);
      }
    }

    const updatedStudent = await Student.findByIdAndUpdate(
      id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    res.status(200).json({
      success: true,
      message: 'Student updated successfully',
      data: updatedStudent
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a student by ID
 * @route   DELETE /api/students/:id
 * @access  Public
 */
const deleteStudent = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400);
      throw new Error(`Invalid student ID format: '${id}'`);
    }

    const student = await Student.findByIdAndDelete(id);

    if (!student) {
      res.status(404);
      throw new Error(`Student not found with ID: '${id}'`);
    }

    res.status(200).json({
      success: true,
      message: `Student '${student.studentName}' deleted successfully`,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createStudent,
  getAllStudents,
  getStudentById,
  updateStudent,
  deleteStudent
};

