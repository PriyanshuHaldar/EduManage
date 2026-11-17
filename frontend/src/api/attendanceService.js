import apiClient from './axios';

/**
 * Attendance API Service for managing date-wise attendance records
 */
export const attendanceService = {
  /**
   * Fetch attendance records for a specific date (YYYY-MM-DD)
   */
  async getAttendanceByDate(dateString) {
    const response = await apiClient.get('/attendance', {
      params: { date: dateString }
    });
    return response.data; // { success: true, date: '...', summary: {...}, count: N, data: [...] }
  },

  /**
   * Save or update attendance records for a specific date
   * payload: { date: 'YYYY-MM-DD', records: [{ studentId, status, remarks }] }
   */
  async saveAttendance(dateString, records) {
    const response = await apiClient.post('/attendance', {
      date: dateString,
      records
    });
    return response.data; // { success: true, message: '...', summary: {...}, data: [...] }
  },

  /**
   * Fetch complete attendance history for an individual student
   */
  async getStudentHistory(studentId) {
    const response = await apiClient.get(`/attendance/student/${studentId}`);
    return response.data; // { success: true, student: {...}, stats: {...}, data: [...] }
  },

  /**
   * Fetch attendance summary statistics for a date
   */
  async getAttendanceSummary(dateString) {
    const response = await apiClient.get('/attendance/summary', {
      params: { date: dateString }
    });
    return response.data; // { success: true, date: '...', summary: {...} }
  },

  /**
   * Fetch distinct dates with recorded attendance
   */
  async getAttendanceDates() {
    const response = await apiClient.get('/attendance/dates');
    return response.data; // { success: true, data: ['2026-11-18', '2026-11-17', ...] }
  }
};

export default attendanceService;

