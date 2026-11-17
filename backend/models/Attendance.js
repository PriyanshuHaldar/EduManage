const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student reference is required']
    },
    date: {
      type: Date,
      required: [true, 'Attendance date is required']
    },
    dateString: {
      type: String,
      required: [true, 'Attendance date string (YYYY-MM-DD) is required'],
      trim: true,
      match: [/^\d{4}-\d{2}-\d{2}$/, 'Please provide a valid date string in YYYY-MM-DD format']
    },
    status: {
      type: String,
      required: [true, 'Attendance status is required'],
      enum: {
        values: ['Present', 'Absent', 'Late', 'Leave'],
        message: 'Status must be Present, Absent, Late, or Leave'
      },
      default: 'Present'
    },
    remarks: {
      type: String,
      trim: true,
      maxlength: [250, 'Remarks cannot exceed 250 characters'],
      default: ''
    },
    markedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin'
    }
  },
  {
    timestamps: true
  }
);

// Compound unique index: Prevent duplicate attendance records for the same student on the same date
attendanceSchema.index({ student: 1, dateString: 1 }, { unique: true });

// Query optimization index for date-wise lookups
attendanceSchema.index({ dateString: 1 });

// Query optimization index for student history lookups
attendanceSchema.index({ student: 1, date: -1 });

module.exports = mongoose.model('Attendance', attendanceSchema);

