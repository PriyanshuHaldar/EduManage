import apiClient from './axios';

/**
 * Authentication & Admin Profile API Service
 */
export const authService = {
  /**
   * Log in an admin user with email and password
   */
  async login({ email, password }) {
    const response = await apiClient.post('/auth/login', {
      email,
      password,
    });
    return response.data;
  },

  /**
   * Register a new admin account
   */
  async register({ fullName, email, password, confirmPassword, adminInviteCode }) {
    const payload = {
      fullName,
      email,
      password,
      confirmPassword,
    };
    if (adminInviteCode && adminInviteCode.trim() !== '') {
      payload.adminInviteCode = adminInviteCode.trim();
    }

    const response = await apiClient.post('/auth/register', payload);
    return response.data;
  },

  /**
   * Retrieve currently authenticated admin profile
   */
  async getMe() {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },

  /**
   * Update logged-in admin's profile information
   */
  async updateProfile(profileData) {
    const response = await apiClient.put('/auth/profile', profileData);
    return response.data;
  },

  /**
   * Change logged-in admin's password
   */
  async changePassword({ currentPassword, newPassword, confirmNewPassword }) {
    const response = await apiClient.put('/auth/change-password', {
      currentPassword,
      newPassword,
      confirmNewPassword,
    });
    return response.data;
  },

  /**
   * Notify server of logout
   */
  async logout() {
    try {
      await apiClient.post('/auth/logout');
    } catch (err) {
      // Ignore network errors during logout
    }
  },
};

export default authService;
