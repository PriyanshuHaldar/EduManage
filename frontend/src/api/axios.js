import axios from 'axios';

// Get API base URL from Vite environment variables or fallback to local backend
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request Interceptor: Attach JWT Bearer token if present in localStorage
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('sms_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Standardize error messages & handle 401 session expiration
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // If response is 401 Unauthorized (session expired or invalid token)
    if (error.response?.status === 401) {
      const isAuthRoute = error.config?.url?.includes('/auth/login') || error.config?.url?.includes('/auth/register');
      // If unauthorized on a protected route (not a failed login attempt), clear stored session
      if (!isAuthRoute && localStorage.getItem('sms_token')) {
        localStorage.removeItem('sms_token');
        localStorage.removeItem('sms_user');
        window.dispatchEvent(new Event('sms:session-expired'));
      }
    }

    // Extract server error message if available
    const serverMessage = error.response?.data?.error || error.response?.data?.message;
    const customError = new Error(serverMessage || error.message || 'An unexpected network error occurred');
    customError.status = error.response?.status;
    customError.originalError = error;
    return Promise.reject(customError);
  }
);

export default apiClient;
