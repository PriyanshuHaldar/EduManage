import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../api/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('sms_token') || null);
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('sms_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState(true);

  // Validate session on app initialization
  const refreshProfile = useCallback(async () => {
    const storedToken = localStorage.getItem('sms_token');
    if (!storedToken) {
      setIsLoading(false);
      return null;
    }

    try {
      const response = await authService.getMe();
      if (response.success && response.data) {
        setUser(response.data);
        localStorage.setItem('sms_user', JSON.stringify(response.data));
        return response.data;
      }
    } catch (err) {
      localStorage.removeItem('sms_token');
      localStorage.removeItem('sms_user');
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
    return null;
  }, []);

  useEffect(() => {
    refreshProfile();

    // Listen for custom session-expired event from Axios interceptor
    const handleSessionExpired = () => {
      setToken(null);
      setUser(null);
    };

    window.addEventListener('sms:session-expired', handleSessionExpired);
    return () => {
      window.removeEventListener('sms:session-expired', handleSessionExpired);
    };
  }, [refreshProfile]);

  // Login action
  const login = useCallback(async (email, password, rememberMe = false) => {
    const response = await authService.login({ email, password });
    if (response.success && response.data?.token) {
      const { token: receivedToken, ...userData } = response.data;

      localStorage.setItem('sms_token', receivedToken);
      localStorage.setItem('sms_user', JSON.stringify(userData));

      setToken(receivedToken);
      setUser(userData);
      return response;
    }
    throw new Error('Authentication failed: Missing token in response.');
  }, []);

  // Register action
  const register = useCallback(async (registerData) => {
    const response = await authService.register(registerData);
    if (response.success && response.data?.token) {
      const { token: receivedToken, ...userData } = response.data;

      localStorage.setItem('sms_token', receivedToken);
      localStorage.setItem('sms_user', JSON.stringify(userData));

      setToken(receivedToken);
      setUser(userData);
      return response;
    }
    return response;
  }, []);

  // Update user state locally & in localStorage
  const updateUser = useCallback((updatedUserData) => {
    setUser((prev) => {
      const merged = { ...prev, ...updatedUserData };
      localStorage.setItem('sms_user', JSON.stringify(merged));
      return merged;
    });
  }, []);

  // Logout action
  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {}
    localStorage.removeItem('sms_token');
    localStorage.removeItem('sms_user');
    setToken(null);
    setUser(null);
  }, []);

  const value = {
    user,
    token,
    isAuthenticated: Boolean(token && user),
    isLoading,
    login,
    register,
    updateUser,
    refreshProfile,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
