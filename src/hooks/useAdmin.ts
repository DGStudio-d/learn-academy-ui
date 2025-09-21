import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../services/adminService';
import type { User, Program, Language, Enrollment, AdminSettings } from '../types/api';

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