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
  ApiErrorResponse,
  UserStatistics,
  EnrollmentStatistics,
  SystemStatistics,
  ProgramDetails,
  EnrollmentDetails,
  SettingsCategory,
  SystemLog,
  ImportResult,
  BackupResult
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

  // Bulk user operations
  bulkUpdateUsers: async (userIds: number[], updates: Partial<User>): Promise<void> => {
    try {
      const response = await api.post<ApiResponse>('/admin/users/bulk-update', {
        user_ids: userIds,
        updates
      });
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to bulk update users');
      }
    } catch (error) {
      const errorDetails = ApiErrorHandler.handleError(error as ApiErrorResponse, {
        customMessage: 'Failed to bulk update users'
      });
      throw error;
    }
  },

  // Bulk delete users
  bulkDeleteUsers: async (userIds: number[]): Promise<void> => {
    try {
      const response = await api.post<ApiResponse>('/admin/users/bulk-delete', {
        user_ids: userIds
      });
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to bulk delete users');
      }
    } catch (error) {
      const errorDetails = ApiErrorHandler.handleError(error as ApiErrorResponse, {
        customMessage: 'Failed to bulk delete users'
      });
      throw error;
    }
  },

  // Bulk create users
  bulkCreateUsers: async (usersData: Array<{
    name: string;
    email: string;
    password: string;
    role: 'admin' | 'teacher' | 'student';
    phone?: string;
    preferred_language?: 'ar' | 'en' | 'es';
  }>): Promise<User[]> => {
    try {
      const response = await api.post<ApiResponse<User[]>>('/admin/users/bulk-create', {
        users: usersData
      });
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Failed to bulk create users');
    } catch (error) {
      const errorDetails = ApiErrorHandler.handleError(error as ApiErrorResponse, {
        customMessage: 'Failed to bulk create users'
      });
      throw error;
    }
  },

  // Export users data
  exportUsers: async (filters?: {
    role?: string;
    search?: string;
    format?: 'csv' | 'excel';
  }): Promise<Blob> => {
    try {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value) params.append(key, value);
        });
      }
      
      const response = await api.get(`/admin/users/export?${params}`, {
        responseType: 'blob'
      });
      
      return response.data;
    } catch (error) {
      const errorDetails = ApiErrorHandler.handleError(error as ApiErrorResponse, {
        customMessage: 'Failed to export users'
      });
      throw error;
    }
  },

  // Import users from file
  importUsers: async (file: File): Promise<ImportResult> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await api.post<ApiResponse<ImportResult>>('/admin/users/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Failed to import users');
    } catch (error) {
      const errorDetails = ApiErrorHandler.handleError(error as ApiErrorResponse, {
        customMessage: 'Failed to import users'
      });
      throw error;
    }
  },

  // Advanced user statistics
  getUserStatistics: async (filters?: {
    date_from?: string;
    date_to?: string;
    role?: string;
  }): Promise<UserStatistics> => {
    try {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value) params.append(key, value);
        });
      }
      
      const response = await api.get<ApiResponse<any>>(`/admin/statistics/users?${params}`);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Failed to get user statistics');
    } catch (error) {
      const errorDetails = ApiErrorHandler.handleError(error as ApiErrorResponse, {
        customMessage: 'Failed to get user statistics'
      });
      throw error;
    }
  },

  // Enrollment statistics
  getEnrollmentStatistics: async (filters?: {
    date_from?: string;
    date_to?: string;
    program_id?: number;
  }): Promise<EnrollmentStatistics> => {
    try {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value) params.append(key, value.toString());
        });
      }
      
      const response = await api.get<ApiResponse<any>>(`/admin/statistics/enrollments?${params}`);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Failed to get enrollment statistics');
    } catch (error) {
      const errorDetails = ApiErrorHandler.handleError(error as ApiErrorResponse, {
        customMessage: 'Failed to get enrollment statistics'
      });
      throw error;
    }
  },

  // System statistics
  getSystemStatistics: async (): Promise<SystemStatistics> => {
    try {
      const response = await api.get<ApiResponse<any>>('/admin/statistics/system');
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Failed to get system statistics');
    } catch (error) {
      const errorDetails = ApiErrorHandler.handleError(error as ApiErrorResponse, {
        customMessage: 'Failed to get system statistics'
      });
      throw error;
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

  // Advanced program management
  getProgramDetails: async (programId: number): Promise<ProgramDetails> => {
    try {
      const response = await api.get<ApiResponse<any>>(`/admin/programs/${programId}/details`);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Failed to get program details');
    } catch (error) {
      const errorDetails = ApiErrorHandler.handleError(error as ApiErrorResponse, {
        customMessage: 'Failed to get program details'
      });
      throw error;
    }
  },

  // Bulk program operations
  bulkUpdatePrograms: async (programIds: number[], updates: Partial<Program>): Promise<void> => {
    try {
      const response = await api.post<ApiResponse>('/admin/programs/bulk-update', {
        program_ids: programIds,
        updates
      });
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to bulk update programs');
      }
    } catch (error) {
      const errorDetails = ApiErrorHandler.handleError(error as ApiErrorResponse, {
        customMessage: 'Failed to bulk update programs'
      });
      throw error;
    }
  },

  // Bulk delete programs
  bulkDeletePrograms: async (programIds: number[]): Promise<void> => {
    try {
      const response = await api.post<ApiResponse>('/admin/programs/bulk-delete', {
        program_ids: programIds
      });
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to bulk delete programs');
      }
    } catch (error) {
      const errorDetails = ApiErrorHandler.handleError(error as ApiErrorResponse, {
        customMessage: 'Failed to bulk delete programs'
      });
      throw error;
    }
  },

  // Advanced enrollment management
  getEnrollmentDetails: async (enrollmentId: number): Promise<EnrollmentDetails> => {
    try {
      const response = await api.get<ApiResponse<any>>(`/admin/enrollments/${enrollmentId}/details`);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Failed to get enrollment details');
    } catch (error) {
      const errorDetails = ApiErrorHandler.handleError(error as ApiErrorResponse, {
        customMessage: 'Failed to get enrollment details'
      });
      throw error;
    }
  },

  // Bulk enrollment operations with notes
  bulkEnrollmentActionWithNotes: async (
    enrollmentIds: number[], 
    action: 'approve' | 'reject',
    notes?: string
  ): Promise<void> => {
    try {
      const response = await api.post<ApiResponse>('/admin/enrollments/bulk-action-with-notes', {
        enrollment_ids: enrollmentIds,
        action,
        notes
      });
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to perform bulk action');
      }
    } catch (error) {
      const errorDetails = ApiErrorHandler.handleError(error as ApiErrorResponse, {
        customMessage: 'Failed to perform bulk enrollment action'
      });
      throw error;
    }
  },

  // Advanced settings management
  getSettingsCategories: async (): Promise<SettingsCategory[]> => {
    try {
      const response = await api.get<ApiResponse<any>>('/admin/settings/categories');
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Failed to get settings categories');
    } catch (error) {
      const errorDetails = ApiErrorHandler.handleError(error as ApiErrorResponse, {
        customMessage: 'Failed to get settings categories'
      });
      throw error;
    }
  },

  // Update specific setting
  updateSetting: async (key: string, value: any): Promise<void> => {
    try {
      const response = await api.put<ApiResponse>(`/admin/settings/${key}`, { value });
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to update setting');
      }
    } catch (error) {
      const errorDetails = ApiErrorHandler.handleError(error as ApiErrorResponse, {
        customMessage: 'Failed to update setting'
      });
      throw error;
    }
  },

  // Reset settings to default
  resetSettings: async (category?: string): Promise<void> => {
    try {
      const url = category ? `/admin/settings/reset/${category}` : '/admin/settings/reset';
      const response = await api.post<ApiResponse>(url);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to reset settings');
      }
    } catch (error) {
      const errorDetails = ApiErrorHandler.handleError(error as ApiErrorResponse, {
        customMessage: 'Failed to reset settings'
      });
      throw error;
    }
  },

  // System maintenance operations
  clearCache: async (cacheType?: 'all' | 'translations' | 'users' | 'programs'): Promise<void> => {
    try {
      const response = await api.post<ApiResponse>('/admin/maintenance/clear-cache', {
        cache_type: cacheType || 'all'
      });
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to clear cache');
      }
    } catch (error) {
      const errorDetails = ApiErrorHandler.handleError(error as ApiErrorResponse, {
        customMessage: 'Failed to clear cache'
      });
      throw error;
    }
  },

  // Generate system backup
  generateBackup: async (): Promise<BackupResult> => {
    try {
      const response = await api.post<ApiResponse<BackupResult>>('/admin/maintenance/backup');
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Failed to generate backup');
    } catch (error) {
      const errorDetails = ApiErrorHandler.handleError(error as ApiErrorResponse, {
        customMessage: 'Failed to generate backup'
      });
      throw error;
    }
  },

  // Get system logs
  getSystemLogs: async (filters?: {
    level?: 'error' | 'warning' | 'info' | 'debug';
    date_from?: string;
    date_to?: string;
    limit?: number;
  }): Promise<SystemLog[]> => {
    try {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value) params.append(key, value.toString());
        });
      }
      
      const response = await api.get<ApiResponse<SystemLog[]>>(`/admin/logs?${params}`);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Failed to get system logs');
    } catch (error) {
      const errorDetails = ApiErrorHandler.handleError(error as ApiErrorResponse, {
        customMessage: 'Failed to get system logs'
      });
      throw error;
    }
  },
};