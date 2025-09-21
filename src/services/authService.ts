import api from '../lib/api';
import type { 
  ApiResponse, 
  AuthResponse, 
  LoginRequest, 
  RegisterRequest,
  User,
  ApiErrorResponse 
} from '../types/api';
import { setStoredToken, setStoredUser, clearStoredToken } from '../lib/api';
import { ApiErrorHandler } from '../lib/errorHandler';

export const authService = {
  // Login user
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    try {
      const response = await api.post<ApiResponse<AuthResponse>>('/auth/login', credentials);
      
      if (response.data.success && response.data.data) {
        const { token, user } = response.data.data;
        setStoredToken(token);
        setStoredUser(user);
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Login failed');
    } catch (error) {
      const errorDetails = ApiErrorHandler.handleError(error as ApiErrorResponse, {
        customMessage: 'Failed to login'
      });
      throw error;
    }
  },

  // Register user
  register: async (userData: RegisterRequest): Promise<AuthResponse> => {
    try {
      const response = await api.post<ApiResponse<AuthResponse>>('/auth/register', userData);
      
      if (response.data.success && response.data.data) {
        const { token, user } = response.data.data;
        setStoredToken(token);
        setStoredUser(user);
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Registration failed');
    } catch (error) {
      const errorDetails = ApiErrorHandler.handleError(error as ApiErrorResponse, {
        customMessage: 'Failed to register'
      });
      throw error;
    }
  },

  // Logout user
  logout: async (): Promise<void> => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      // Log error but don't throw - logout should always clear local storage
      ApiErrorHandler.handleError(error as ApiErrorResponse, {
        showToast: false,
        customMessage: 'Logout API call failed'
      });
    } finally {
      clearStoredToken();
    }
  },

  // Get current user profile
  getCurrentUser: async (): Promise<User> => {
    try {
      const response = await api.get<ApiResponse<User>>('/auth/me');
      
      if (response.data.success && response.data.data) {
        setStoredUser(response.data.data);
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Failed to get user profile');
    } catch (error) {
      const errorDetails = ApiErrorHandler.handleError(error as ApiErrorResponse, {
        customMessage: 'Failed to get user profile'
      });
      throw error;
    }
  },

  // Update user profile
  updateProfile: async (userData: Partial<User>): Promise<User> => {
    try {
      const response = await api.put<ApiResponse<User>>('/auth/profile', userData);
      
      if (response.data.success && response.data.data) {
        setStoredUser(response.data.data);
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Failed to update profile');
    } catch (error) {
      const errorDetails = ApiErrorHandler.handleError(error as ApiErrorResponse, {
        customMessage: 'Failed to update profile'
      });
      throw error;
    }
  },

  // Change password
  changePassword: async (passwordData: {
    current_password: string;
    password: string;
    password_confirmation: string;
  }): Promise<void> => {
    try {
      const response = await api.put<ApiResponse>('/auth/change-password', passwordData);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to change password');
      }
    } catch (error) {
      const errorDetails = ApiErrorHandler.handleError(error as ApiErrorResponse, {
        customMessage: 'Failed to change password'
      });
      throw error;
    }
  },

  // Request password reset
  requestPasswordReset: async (email: string): Promise<void> => {
    try {
      const response = await api.post<ApiResponse>('/auth/forgot-password', { email });
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to request password reset');
      }
    } catch (error) {
      const errorDetails = ApiErrorHandler.handleError(error as ApiErrorResponse, {
        customMessage: 'Failed to request password reset'
      });
      throw error;
    }
  },

  // Reset password
  resetPassword: async (resetData: {
    token: string;
    email: string;
    password: string;
    password_confirmation: string;
  }): Promise<void> => {
    try {
      const response = await api.post<ApiResponse>('/auth/reset-password', resetData);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to reset password');
      }
    } catch (error) {
      const errorDetails = ApiErrorHandler.handleError(error as ApiErrorResponse, {
        customMessage: 'Failed to reset password'
      });
      throw error;
    }
  },
};