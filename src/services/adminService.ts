import api from '../lib/api';
import type { 
  ApiResponse, 
  PaginatedResponse,
  User,
  Program,
  Quiz,
  Meeting,
  Language,
  Enrollment,
  AdminSettings,
  DashboardStats,
  ApiErrorResponse
} from '../types/api';
import { ApiErrorHandler } from '../lib/errorHandler';

export const adminService = {
  // Get admin dashboard statistics
  getDashboardStats: async (): Promise<DashboardStats> => {
    try {
      const response = await api.get<ApiResponse<DashboardStats>>('/admin/dashboard-stats');
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Failed to get dashboard stats');
    } catch (error) {
      const errorDetails = ApiErrorHandler.handleError(error as ApiErrorResponse, {
        customMessage: 'Failed to get dashboard stats'
      });
      throw error;
    }
  },

  // User Management
  getUsers: async (page = 1, filters?: {
    role?: string;
    search?: string;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
  }): Promise<PaginatedResponse<User>> => {
    try {
      const params = new URLSearchParams({ page: page.toString() });
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value) params.append(key, value);
        });
      }
      
      const response = await api.get<PaginatedResponse<User>>(`/admin/users?${params}`);
      
      if (response.data.success) {
        return response.data;
      }
      
      throw new Error('Failed to get users');
    } catch (error) {
      const errorDetails = ApiErrorHandler.handleError(error as ApiErrorResponse, {
        customMessage: 'Failed to get users'
      });
      throw error;
    }
  },

  // Create user
  createUser: async (userData: {
    name: string;
    email: string;
    password: string;
    role: 'admin' | 'teacher' | 'student';
    phone?: string;
    preferred_language?: 'ar' | 'en' | 'es';
  }): Promise<User> => {
    try {
      const response = await api.post<ApiResponse<User>>('/admin/users', userData);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Failed to create user');
    } catch (error) {
      const errorDetails = ApiErrorHandler.handleError(error as ApiErrorResponse, {
        customMessage: 'Failed to create user'
      });
      throw error;
    }
  },

  // Get user details
  getUser: async (userId: number): Promise<User> => {
    try {
      const response = await api.get<ApiResponse<User>>(`/admin/users/${userId}`);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Failed to get user');
    } catch (error) {
      const errorDetails = ApiErrorHandler.handleError(error as ApiErrorResponse, {
        customMessage: 'Failed to get user'
      });
      throw error;
    }
  },

  // Update user
  updateUser: async (userId: number, userData: Partial<User>): Promise<User> => {
    try {
      const response = await api.put<ApiResponse<User>>(`/admin/users/${userId}`, userData);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Failed to update user');
    } catch (error) {
      const errorDetails = ApiErrorHandler.handleError(error as ApiErrorResponse, {
        customMessage: 'Failed to update user'
      });
      throw error;
    }
  },

  // Delete user
  deleteUser: async (userId: number): Promise<void> => {
    try {
      const response = await api.delete<ApiResponse>(`/admin/users/${userId}`);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to delete user');
      }
    } catch (error) {
      const errorDetails = ApiErrorHandler.handleError(error as ApiErrorResponse, {
        customMessage: 'Failed to delete user'
      });
      throw error;
    }
  },

  // Program Management
  getPrograms: async (page = 1): Promise<PaginatedResponse<Program>> => {
    try {
      const response = await api.get<PaginatedResponse<Program>>(`/admin/programs?page=${page}`);
      
      if (response.data.success) {
        return response.data;
      }
      
      throw new Error('Failed to get programs');
    } catch (error) {
      const errorDetails = ApiErrorHandler.handleError(error as ApiErrorResponse, {
        customMessage: 'Failed to get programs'
      });
      throw error;
    }
  },

  // Create program
  createProgram: async (programData: {
    name: string;
    description?: string;
    language_id: number;
    teacher_id?: number;
  }): Promise<Program> => {
    try {
      const response = await api.post<ApiResponse<Program>>('/admin/programs', programData);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Failed to create program');
    } catch (error) {
      const errorDetails = ApiErrorHandler.handleError(error as ApiErrorResponse, {
        customMessage: 'Failed to create program'
      });
      throw error;
    }
  },

  // Update program
  updateProgram: async (programId: number, programData: Partial<Program>): Promise<Program> => {
    const response = await api.put<ApiResponse<Program>>(`/admin/programs/${programId}`, programData);
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data.message || 'Failed to update program');
  },

  // Delete program
  deleteProgram: async (programId: number): Promise<void> => {
    const response = await api.delete<ApiResponse>(`/admin/programs/${programId}`);
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to delete program');
    }
  },

  // Language Management
  getLanguages: async (): Promise<Language[]> => {
    const response = await api.get<ApiResponse<Language[]>>('/admin/languages');
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data.message || 'Failed to get languages');
  },

  // Create language
  createLanguage: async (languageData: {
    name: string;
    code: 'ar' | 'en' | 'es';
  }): Promise<Language> => {
    const response = await api.post<ApiResponse<Language>>('/admin/languages', languageData);
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data.message || 'Failed to create language');
  },

  // Update language
  updateLanguage: async (languageId: number, languageData: Partial<Language>): Promise<Language> => {
    const response = await api.put<ApiResponse<Language>>(`/admin/languages/${languageId}`, languageData);
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data.message || 'Failed to update language');
  },

  // Delete language
  deleteLanguage: async (languageId: number): Promise<void> => {
    const response = await api.delete<ApiResponse>(`/admin/languages/${languageId}`);
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to delete language');
    }
  },

  // Enrollment Management
  getEnrollments: async (page = 1, status?: string): Promise<PaginatedResponse<Enrollment>> => {
    const params = new URLSearchParams({ page: page.toString() });
    if (status) params.append('status', status);
    
    const response = await api.get<PaginatedResponse<Enrollment>>(`/admin/enrollments?${params}`);
    
    if (response.data.success) {
      return response.data;
    }
    
    throw new Error('Failed to get enrollments');
  },

  // Update enrollment status
  updateEnrollmentStatus: async (enrollmentId: number, status: 'approved' | 'rejected'): Promise<Enrollment> => {
    const response = await api.put<ApiResponse<Enrollment>>(`/admin/enrollments/${enrollmentId}`, { status });
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data.message || 'Failed to update enrollment status');
  },

  // Bulk enrollment operations
  bulkEnrollmentAction: async (enrollmentIds: number[], action: 'approve' | 'reject'): Promise<void> => {
    const response = await api.post<ApiResponse>('/admin/enrollments/bulk-action', {
      enrollment_ids: enrollmentIds,
      action
    });
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to perform bulk action');
    }
  },

  // Grant language access to teacher
  grantLanguageAccess: async (teacherId: number, languageIds: number[]): Promise<void> => {
    const response = await api.post<ApiResponse>('/admin/grant-language-access', {
      teacher_id: teacherId,
      language_ids: languageIds
    });
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to grant language access');
    }
  },

  // Bulk grant access
  bulkGrantAccess: async (teacherIds: number[], languageIds: number[]): Promise<void> => {
    const response = await api.post<ApiResponse>('/admin/bulk-grant-access', {
      teacher_ids: teacherIds,
      language_ids: languageIds
    });
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to bulk grant access');
    }
  },

  // Settings Management
  getSettings: async (): Promise<AdminSettings> => {
    const response = await api.get<ApiResponse<AdminSettings>>('/admin/settings');
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data.message || 'Failed to get settings');
  },

  // Update settings
  updateSettings: async (settings: Partial<AdminSettings>): Promise<AdminSettings> => {
    const response = await api.put<ApiResponse<AdminSettings>>('/admin/settings', settings);
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data.message || 'Failed to update settings');
  },

  // System Management
  getSystemHealth: async (): Promise<any> => {
    const response = await api.get<ApiResponse>('/health');
    
    if (response.data.success) {
      return response.data;
    }
    
    throw new Error('Failed to get system health');
  },

  // Translation Management
  getTranslations: async (locale: string): Promise<Record<string, string>> => {
    const response = await api.get<ApiResponse<Record<string, string>>>(`/translations/${locale}`);
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data.message || 'Failed to get translations');
  },

  // Update translations
  updateTranslations: async (locale: string, translations: Record<string, string>): Promise<void> => {
    const response = await api.put<ApiResponse>(`/translations/${locale}`, { translations });
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to update translations');
    }
  },
};