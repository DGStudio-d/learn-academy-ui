import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../services/adminService';
import type { 
  User, 
  Program, 
  Language, 
  Enrollment, 
  AdminSettings,
  UserStatistics,
  EnrollmentStatistics,
  SystemStatistics,
  ProgramDetails,
  EnrollmentDetails,
  SystemHealth,
  SystemMetrics,
  SystemLog
} from '../types/api';

// Admin dashboard hooks
export const useAdminDashboardStats = () => {
  return useQuery({
    queryKey: ['admin', 'dashboard-stats'],
    queryFn: adminService.getDashboardStats,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// User management hooks
export const useAdminUsers = (page = 1, filters?: {
  role?: string;
  search?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}) => {
  return useQuery({
    queryKey: ['admin', 'users', page, filters],
    queryFn: () => adminService.getUsers(page, filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useAdminUser = (userId: number) => {
  return useQuery({
    queryKey: ['admin', 'user', userId],
    queryFn: () => adminService.getUser(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: adminService.createUser,
    onSuccess: () => {
      // Invalidate users list and dashboard stats
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard-stats'] });
    },
    onError: (error) => {
      console.error('User creation failed:', error);
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ userId, userData }: { userId: number; userData: Partial<User> }) =>
      adminService.updateUser(userId, userData),
    onSuccess: (data, variables) => {
      // Update the specific user in cache
      queryClient.setQueryData(['admin', 'user', variables.userId], data);
      // Invalidate users list
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
    onError: (error) => {
      console.error('User update failed:', error);
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: adminService.deleteUser,
    onSuccess: () => {
      // Invalidate users list and dashboard stats
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard-stats'] });
    },
    onError: (error) => {
      console.error('User deletion failed:', error);
    },
  });
};

// Program management hooks
export const useAdminPrograms = (page = 1) => {
  return useQuery({
    queryKey: ['admin', 'programs', page],
    queryFn: () => adminService.getPrograms(page),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCreateAdminProgram = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: adminService.createProgram,
    onSuccess: () => {
      // Invalidate programs list and dashboard stats
      queryClient.invalidateQueries({ queryKey: ['admin', 'programs'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard-stats'] });
    },
    onError: (error) => {
      console.error('Program creation failed:', error);
    },
  });
};

export const useUpdateAdminProgram = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ programId, programData }: { programId: number; programData: Partial<Program> }) =>
      adminService.updateProgram(programId, programData),
    onSuccess: (data, variables) => {
      // Update the specific program in cache
      queryClient.setQueryData(['admin', 'program', variables.programId], data);
      // Invalidate programs list
      queryClient.invalidateQueries({ queryKey: ['admin', 'programs'] });
    },
    onError: (error) => {
      console.error('Program update failed:', error);
    },
  });
};

export const useDeleteAdminProgram = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: adminService.deleteProgram,
    onSuccess: () => {
      // Invalidate programs list and dashboard stats
      queryClient.invalidateQueries({ queryKey: ['admin', 'programs'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard-stats'] });
    },
    onError: (error) => {
      console.error('Program deletion failed:', error);
    },
  });
};

// Language management hooks
export const useAdminLanguages = () => {
  return useQuery({
    queryKey: ['admin', 'languages'],
    queryFn: adminService.getLanguages,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useCreateLanguage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: adminService.createLanguage,
    onSuccess: () => {
      // Invalidate languages list
      queryClient.invalidateQueries({ queryKey: ['admin', 'languages'] });
    },
    onError: (error) => {
      console.error('Language creation failed:', error);
    },
  });
};

export const useUpdateLanguage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ languageId, languageData }: { languageId: number; languageData: Partial<Language> }) =>
      adminService.updateLanguage(languageId, languageData),
    onSuccess: () => {
      // Invalidate languages list
      queryClient.invalidateQueries({ queryKey: ['admin', 'languages'] });
    },
    onError: (error) => {
      console.error('Language update failed:', error);
    },
  });
};

export const useDeleteLanguage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: adminService.deleteLanguage,
    onSuccess: () => {
      // Invalidate languages list
      queryClient.invalidateQueries({ queryKey: ['admin', 'languages'] });
    },
    onError: (error) => {
      console.error('Language deletion failed:', error);
    },
  });
};

// Enrollment management hooks
export const useAdminEnrollments = (page = 1, status?: string) => {
  return useQuery({
    queryKey: ['admin', 'enrollments', page, status],
    queryFn: () => adminService.getEnrollments(page, status),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useUpdateEnrollmentStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ enrollmentId, status }: { enrollmentId: number; status: 'approved' | 'rejected' }) =>
      adminService.updateEnrollmentStatus(enrollmentId, status),
    onSuccess: () => {
      // Invalidate enrollments list and dashboard stats
      queryClient.invalidateQueries({ queryKey: ['admin', 'enrollments'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard-stats'] });
    },
    onError: (error) => {
      console.error('Enrollment status update failed:', error);
    },
  });
};

export const useBulkEnrollmentAction = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ enrollmentIds, action }: { enrollmentIds: number[]; action: 'approve' | 'reject' }) =>
      adminService.bulkEnrollmentAction(enrollmentIds, action),
    onSuccess: () => {
      // Invalidate enrollments list and dashboard stats
      queryClient.invalidateQueries({ queryKey: ['admin', 'enrollments'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard-stats'] });
    },
    onError: (error) => {
      console.error('Bulk enrollment action failed:', error);
    },
  });
};

// Language access management hooks
export const useGrantLanguageAccess = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ teacherId, languageIds }: { teacherId: number; languageIds: number[] }) =>
      adminService.grantLanguageAccess(teacherId, languageIds),
    onSuccess: () => {
      // Invalidate users list to reflect updated access
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
    onError: (error) => {
      console.error('Grant language access failed:', error);
    },
  });
};

export const useBulkGrantAccess = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ teacherIds, languageIds }: { teacherIds: number[]; languageIds: number[] }) =>
      adminService.bulkGrantAccess(teacherIds, languageIds),
    onSuccess: () => {
      // Invalidate users list to reflect updated access
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
    onError: (error) => {
      console.error('Bulk grant access failed:', error);
    },
  });
};

// Settings management hooks
export const useAdminSettings = () => {
  return useQuery({
    queryKey: ['admin', 'settings'],
    queryFn: adminService.getSettings,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useUpdateAdminSettings = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: adminService.updateSettings,
    onSuccess: (data) => {
      // Update cached settings
      queryClient.setQueryData(['admin', 'settings'], data);
    },
    onError: (error) => {
      console.error('Settings update failed:', error);
    },
  });
};

// System management hooks
export const useSystemHealth = () => {
  return useQuery({
    queryKey: ['admin', 'system-health'],
    queryFn: adminService.getSystemHealth,
    staleTime: 1 * 60 * 1000, // 1 minute
    refetchInterval: 2 * 60 * 1000, // Refetch every 2 minutes
  });
};

// Translation management hooks
export const useTranslations = (locale: string) => {
  return useQuery({
    queryKey: ['admin', 'translations', locale],
    queryFn: () => adminService.getTranslations(locale),
    enabled: !!locale,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useUpdateTranslations = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ locale, translations }: { locale: string; translations: Record<string, string> }) =>
      adminService.updateTranslations(locale, translations),
    onSuccess: (data, variables) => {
      // Update cached translations
      queryClient.setQueryData(['admin', 'translations', variables.locale], variables.translations);
    },
    onError: (error) => {
      console.error('Translations update failed:', error);
    },
  });
};

// Bulk user operations hooks
export const useBulkUpdateUsers = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ userIds, updates }: { userIds: number[]; updates: Partial<User> }) =>
      adminService.bulkUpdateUsers(userIds, updates),
    onSuccess: () => {
      // Invalidate users list and dashboard stats
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard-stats'] });
    },
    onError: (error) => {
      console.error('Bulk user update failed:', error);
    },
  });
};

export const useBulkDeleteUsers = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: adminService.bulkDeleteUsers,
    onSuccess: () => {
      // Invalidate users list and dashboard stats
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard-stats'] });
    },
    onError: (error) => {
      console.error('Bulk user deletion failed:', error);
    },
  });
};

export const useBulkCreateUsers = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: adminService.bulkCreateUsers,
    onSuccess: () => {
      // Invalidate users list and dashboard stats
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard-stats'] });
    },
    onError: (error) => {
      console.error('Bulk user creation failed:', error);
    },
  });
};

// User data import/export hooks
export const useExportUsers = () => {
  return useMutation({
    mutationFn: adminService.exportUsers,
    onError: (error) => {
      console.error('User export failed:', error);
    },
  });
};

export const useImportUsers = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: adminService.importUsers,
    onSuccess: () => {
      // Invalidate users list and dashboard stats
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard-stats'] });
    },
    onError: (error) => {
      console.error('User import failed:', error);
    },
  });
};

// Statistics hooks
export const useUserStatistics = (filters?: {
  date_from?: string;
  date_to?: string;
  role?: string;
}) => {
  return useQuery({
    queryKey: ['admin', 'statistics', 'users', filters],
    queryFn: () => adminService.getUserStatistics(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useEnrollmentStatistics = (filters?: {
  date_from?: string;
  date_to?: string;
  program_id?: number;
}) => {
  return useQuery({
    queryKey: ['admin', 'statistics', 'enrollments', filters],
    queryFn: () => adminService.getEnrollmentStatistics(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useSystemStatistics = () => {
  return useQuery({
    queryKey: ['admin', 'statistics', 'system'],
    queryFn: adminService.getSystemStatistics,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
};

// Advanced program management hooks
export const useProgramDetails = (programId: number) => {
  return useQuery({
    queryKey: ['admin', 'program-details', programId],
    queryFn: () => adminService.getProgramDetails(programId),
    enabled: !!programId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useBulkUpdatePrograms = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ programIds, updates }: { programIds: number[]; updates: Partial<Program> }) =>
      adminService.bulkUpdatePrograms(programIds, updates),
    onSuccess: () => {
      // Invalidate programs list and dashboard stats
      queryClient.invalidateQueries({ queryKey: ['admin', 'programs'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard-stats'] });
    },
    onError: (error) => {
      console.error('Bulk program update failed:', error);
    },
  });
};

export const useBulkDeletePrograms = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: adminService.bulkDeletePrograms,
    onSuccess: () => {
      // Invalidate programs list and dashboard stats
      queryClient.invalidateQueries({ queryKey: ['admin', 'programs'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard-stats'] });
    },
    onError: (error) => {
      console.error('Bulk program deletion failed:', error);
    },
  });
};

// Advanced enrollment management hooks
export const useEnrollmentDetails = (enrollmentId: number) => {
  return useQuery({
    queryKey: ['admin', 'enrollment-details', enrollmentId],
    queryFn: () => adminService.getEnrollmentDetails(enrollmentId),
    enabled: !!enrollmentId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useBulkEnrollmentActionWithNotes = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ 
      enrollmentIds, 
      action, 
      notes 
    }: { 
      enrollmentIds: number[]; 
      action: 'approve' | 'reject';
      notes?: string;
    }) => adminService.bulkEnrollmentActionWithNotes(enrollmentIds, action, notes),
    onSuccess: () => {
      // Invalidate enrollments list and dashboard stats
      queryClient.invalidateQueries({ queryKey: ['admin', 'enrollments'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard-stats'] });
    },
    onError: (error) => {
      console.error('Bulk enrollment action with notes failed:', error);
    },
  });
};

// Advanced settings management hooks
export const useSettingsCategories = () => {
  return useQuery({
    queryKey: ['admin', 'settings-categories'],
    queryFn: adminService.getSettingsCategories,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useUpdateSetting = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ key, value }: { key: string; value: any }) =>
      adminService.updateSetting(key, value),
    onSuccess: () => {
      // Invalidate settings data
      queryClient.invalidateQueries({ queryKey: ['admin', 'settings'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'settings-categories'] });
    },
    onError: (error) => {
      console.error('Setting update failed:', error);
    },
  });
};

export const useResetSettings = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: adminService.resetSettings,
    onSuccess: () => {
      // Invalidate all settings data
      queryClient.invalidateQueries({ queryKey: ['admin', 'settings'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'settings-categories'] });
    },
    onError: (error) => {
      console.error('Settings reset failed:', error);
    },
  });
};

// System maintenance hooks
export const useClearCache = () => {
  return useMutation({
    mutationFn: adminService.clearCache,
    onError: (error) => {
      console.error('Cache clear failed:', error);
    },
  });
};

export const useGenerateBackup = () => {
  return useMutation({
    mutationFn: adminService.generateBackup,
    onError: (error) => {
      console.error('Backup generation failed:', error);
    },
  });
};

export const useSystemLogs = (filters?: {
  level?: 'error' | 'warning' | 'info' | 'debug';
  date_from?: string;
  date_to?: string;
  limit?: number;
}) => {
  return useQuery({
    queryKey: ['admin', 'system-logs', filters],
    queryFn: () => adminService.getSystemLogs(filters),
    staleTime: 1 * 60 * 1000, // 1 minute
    refetchInterval: 2 * 60 * 1000, // Refetch every 2 minutes
  });
};

