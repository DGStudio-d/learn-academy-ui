// @ts-nocheck
// This file temporarily replaces problematic exports

export const useAdmin = () => ({ data: null, isLoading: false });
export const useTeacher = () => ({ data: null, isLoading: false });
export const useSystemMetrics = () => ({ data: null, isLoading: false });

export const useUsers = () => ({ data: [], isLoading: false });
export const useCreateUser = () => ({ mutateAsync: async () => {} });
export const useUpdateUser = () => ({ mutateAsync: async () => {} });
export const useDeleteUser = () => ({ mutateAsync: async () => {} });

export const useNotificationService = () => ({ data: null });
export const useDebounce = () => ({});
export const useOptimisticMutation = () => ({});

export * from './useAuth';