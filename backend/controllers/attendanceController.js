const mongoose = require('mongoose');
const Attendance = require('../models/Attendance');
const Student = require('../models/Student');

/**
 * Helper to validate and normalize date format (YYYY-MM-DD)
 */
const parseDateString = (input) => {
  if (!input) {
    const today = new Date();
    return today.toISOString().slice(0, 10);
  }
  const str = String(input).trim();
  const match = str.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) {
    throw new Error('Invalid date format. Expected YYYY-MM-DD.');
  }
  return str;
};

/**
 * Helper to normalize attendance status to Title Case
 */
const normalizeStatus = (status) => {
  if (!status) return 'Present';
  const s = String(status).trim().toLowerCase();
  if (s === 'present') return 'Present';
  if (s === 'absent') return 'Absent';
  if (s === 'late') return 'Late';
  if (s === 'leave') return 'Leave';
  return 'Present';
};

/**
 * @desc    Get attendance records for a specific date
 * @route   GET /api/attendance?date=YYYY-MM-DD
 * @access  Private (Admin)
 */
const getAttendanceByDate = async (req, res) => {
  try {
    const dateQuery = req.query.date || req.params.date;
    const dateString = parseDateString(dateQuery);

    const records = await Attendance.find({ dateString })
      .populate('student', 'studentName registrationNumber course semester email phone')
      .sort({ createdAt: 1 });

    // Filter out records whose student was deleted
    const validRecords = records.filter((r) => r.student != null);

    const summary = {
      total: validRecords.length,
      present: validRecords.filter((r) => r.status === 'Present').length,
      absent: validRecords.filter((r) => r.status === 'Absent').length,
      late: validRecords.filter((r) => r.status === 'Late').length,
      leave: validRecords.filter((r) => r.status === 'Leave').length,
    };

    summary.rate = summary.total > 0
      ? Math.round(((summary.present + summary.late * 0.5) / summary.total) * 100)
      : 0;

    return res.status(200).json({
      success: true,
      date: dateString,
      summary,
      count: validRecords.length,
      data: validRecords
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      error: error.message || 'Failed to retrieve attendance records'
    });
  }
};

/**
 * @desc    Save or update attendance records for a specific date (Bulk Upsert)
 * @route   POST /api/attendance
 * @access  Private (Admin)
 */
const saveAttendance = async (req, res) => {
  try {
    const { date, records } = req.body;

    const dateString = parseDateString(date);
    const [year, month, day] = dateString.split('-').map(Number);
    const utcDate = new Date(Date.UTC(year, month - 1, day));

    // Handle single record upsert if provided as single object
    const recordsList = Array.isArray(records)
      ? records
      : (req.body.studentId ? [req.body] : []);

    if (!recordsList.length) {
      return res.status(400).json({
        success: false,
        error: 'Please provide attendance records to save'
      });
    }

    // Validate that student IDs are valid Mongo ObjectIds
    const bulkOps = [];
    for (const item of recordsList) {
      const studentId = item.studentId || item.student;
      if (!studentId || !mongoose.Types.ObjectId.isValid(studentId)) {
        continue;
      }

      const status = normalizeStatus(item.status);
      const remarks = item.remarks ? String(item.remarks).trim() : '';

      bulkOps.push({
        updateOne: {
          filter: { student: studentId, dateString },
          update: {
            $set: {
              student: studentId,
              date: utcDate,
              dateString,
              status,
              remarks,
              ...(req.user?._id ? { markedBy: req.user._id } : {})
            }
          },
          upsert: true
        }
      });
    }

    if (!bulkOps.length) {
      return res.status(400).json({
        success: false,
        error: 'No valid student attendance entries provided'
      });
    }

    // Execute atomic bulk upsert
    await Attendance.bulkWrite(bulkOps, { ordered: false });

    // Fetch refreshed records for response
    const savedRecords = await Attendance.find({ dateString })
      .populate('student', 'studentName registrationNumber course semester email phone');

    const validRecords = savedRecords.filter((r) => r.student != null);

    const summary = {
      total: validRecords.length,
      present: validRecords.filter((r) => r.status === 'Present').length,
      absent: validRecords.filter((r) => r.status === 'Absent').length,
      late: validRecords.filter((r) => r.status === 'Late').length,
      leave: validRecords.filter((r) => r.status === 'Leave').length,
    };

    summary.rate = summary.total > 0
      ? Math.round(((summary.present + summary.late * 0.5) / summary.total) * 100)
      : 0;

    return res.status(200).json({
      success: true,
      message: `Attendance successfully saved for ${dateString}`,
      date: dateString,
      summary,
      count: validRecords.length,
      data: validRecords
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to save attendance records'
    });
  }
};

/**
 * @desc    Get attendance summary for a specific date
 * @route   GET /api/attendance/summary?date=YYYY-MM-DD
 * @access  Private (Admin)
 */
const getAttendanceSummary = async (req, res) => {
  try {
    const dateQuery = req.query.date || req.params.date;
    const dateString = parseDateString(dateQuery);

    const records = await Attendance.find({ dateString });
    const total = records.length;
    const present = records.filter((r) => r.status === 'Present').length;
    const absent = records.filter((r) => r.status === 'Absent').length;
    const late = records.filter((r) => r.status === 'Late').length;
    const leave = records.filter((r) => r.status === 'Leave').length;
    const rate = total > 0 ? Math.round(((present + late * 0.5) / total) * 100) : 0;

    return res.status(200).json({
      success: true,
      date: dateString,
      summary: {
        total,
        present,
        absent,
        late,
        leave,
        rate
      }
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      error: error.message || 'Failed to calculate attendance summary'
    });
  }
};

/**
 * @desc    Get complete attendance history for an individual student
 * @route   GET /api/attendance/student/:studentId
 * @access  Private (Admin)
 */
const getStudentAttendanceHistory = async (req, res) => {
  try {
    const { studentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid student ID format'
      });
    }

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        error: 'Student record not found'
      });
    }

    const history = await Attendance.find({ student: studentId })
      .sort({ date: -1, dateString: -1 });

    const totalSessions = history.length;
    const present = history.filter((r) => r.status === 'Present').length;
    const absent = history.filter((r) => r.status === 'Absent').length;
    const late = history.filter((r) => r.status === 'Late').length;
    const leave = history.filter((r) => r.status === 'Leave').length;
    const rate = totalSessions > 0
      ? Math.round(((present + late * 0.5) / totalSessions) * 100)
      : 0;

    return res.status(200).json({
      success: true,
      student: {
        _id: student._id,
        studentName: student.studentName,
        registrationNumber: student.registrationNumber,
        course: student.course,
        semester: student.semester,
        email: student.email,
        phone: student.phone
      },
      stats: {
        totalSessions,
        present,
        absent,
        late,
        leave,
        rate
      },
      count: history.length,
      data: history
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to retrieve student attendance history'
    });
  }
};

/**
 * @desc    Get list of distinct dates with recorded attendance
 * @route   GET /api/attendance/dates
 * @access  Private (Admin)
 */
const getAttendanceDates = async (req, res) => {
  try {
    const dates = await Attendance.distinct('dateString');
    dates.sort((a, b) => b.localeCompare(a)); // Descending chronological

    return res.status(200).json({
      success: true,
      count: dates.length,
      data: dates
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to retrieve attendance dates'
    });
  }
};

module.exports = {
  getAttendanceByDate,
  saveAttendance,
  getAttendanceSummary,
  getStudentAttendanceHistory,
  getAttendanceDates
};

