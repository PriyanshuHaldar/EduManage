import apiClient from './axios';

/**
 * Student API Service for handling CRUD operations with backend
 */
export const studentService = {
  /**
   * Fetch all student records
   */
  async getAllStudents() {
    const response = await apiClient.get('/students');
    return response.data; // { success: true, count: N, data: [...] }
  },

  /**
   * Fetch a single student by MongoDB ID
   */
  async getStudentById(id) {
    const response = await apiClient.get(`/students/${id}`);
    return response.data; // { success: true, data: {...} }
  },

  /**
   * Create a new student record
   */
  async createStudent(studentData) {
    const response = await apiClient.post('/students', studentData);
    return response.data; // { success: true, message: '...', data: {...} }
  },

  /**
   * Update an existing student record
   */
  async updateStudent(id, studentData) {
    const response = await apiClient.put(`/students/${id}`, studentData);
    return response.data; // { success: true, message: '...', data: {...} }
  },

  /**
   * Delete a student by ID
   */
  async deleteStudent(id) {
    const response = await apiClient.delete(`/students/${id}`);
    return response.data; // { success: true, message: '...' }
  },

  /**
   * Health check endpoint to verify backend connectivity
   */
  async checkHealth() {
    const response = await apiClient.get('/health');
    return response.data; // { status: 'OK', uptime: '...' }
  },
};

