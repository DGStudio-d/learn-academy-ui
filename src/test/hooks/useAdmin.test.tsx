import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import {
  useAdminDashboardStats,
  useAdminUsers,
  useCreateUser,
  useBulkUpdateUsers,
  useUserStatistics,
} from '../../hooks/useAdmin';
import { adminService } from '../../services/adminService';

// Mock the admin service
vi.mock('../../services/adminService');
const mockedAdminService = vi.mocked(adminService);

// Test wrapper with QueryClient
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useAdmin hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useAdminDashboardStats', () => {
    it('should fetch dashboard statistics', async () => {
      const mockStats = {
        total_users: 100,
        total_programs: 10,
        pending_enrollments: 5,
      };

      mockedAdminService.getDashboardStats.mockResolvedValue(mockStats);

      const { result } = renderHook(() => useAdminDashboardStats(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockStats);
      expect(mockedAdminService.getDashboardStats).toHaveBeenCalledTimes(1);
    });

    it('should handle error when fetching dashboard stats', async () => {
      mockedAdminService.getDashboardStats.mockRejectedValue(new Error('API Error'));

      const { result } = renderHook(() => useAdminDashboardStats(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeInstanceOf(Error);
    });
  });

  describe('useAdminUsers', () => {
    it('should fetch users with pagination', async () => {
      const mockUsersResponse = {
        success: true,
        data: {
          data: [
            { id: 1, name: 'John Doe', email: 'john@example.com', role: 'student' },
            { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'teacher' },
          ],
          current_page: 1,
          per_page: 15,
          total: 2,
          last_page: 1,
        },
      };

      mockedAdminService.getUsers.mockResolvedValue(mockUsersResponse);

      const { result } = renderHook(() => useAdminUsers(1, { role: 'student' }), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockUsersResponse);
      expect(mockedAdminService.getUsers).toHaveBeenCalledWith(1, { role: 'student' });
    });
  });

  describe('useCreateUser', () => {
    it('should create a new user', async () => {
      const mockUser = {
        id: 3,
        name: 'New User',
        email: 'newuser@example.com',
        role: 'student' as const,
        preferred_language: 'en' as const,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      mockedAdminService.createUser.mockResolvedValue(mockUser);

      const { result } = renderHook(() => useCreateUser(), {
        wrapper: createWrapper(),
      });

      const userData = {
        name: 'New User',
        email: 'newuser@example.com',
        password: 'password123',
        role: 'student' as const,
      };

      result.current.mutate(userData);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockUser);
      expect(mockedAdminService.createUser).toHaveBeenCalledTimes(1);
    });
  });

  describe('useBulkUpdateUsers', () => {
    it('should update multiple users', async () => {
      mockedAdminService.bulkUpdateUsers.mockResolvedValue();

      const { result } = renderHook(() => useBulkUpdateUsers(), {
        wrapper: createWrapper(),
      });

      const updateData = {
        userIds: [1, 2, 3],
        updates: { preferred_language: 'es' as const },
      };

      result.current.mutate(updateData);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockedAdminService.bulkUpdateUsers).toHaveBeenCalledTimes(1);
    });
  });

  describe('useUserStatistics', () => {
    it('should fetch user statistics', async () => {
      const mockStats = {
        total_users: 100,
        new_users_this_month: 10,
        active_users_last_30_days: 80,
        users_by_role: { student: 70, teacher: 25, admin: 5 },
        users_by_language: { en: 50, es: 30, ar: 20 },
        registration_trend: [
          { date: '2024-01-01', count: 5 },
          { date: '2024-01-02', count: 3 },
        ],
      };

      mockedAdminService.getUserStatistics.mockResolvedValue(mockStats);

      const filters = { role: 'student' };
      const { result } = renderHook(() => useUserStatistics(filters), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockStats);
      expect(mockedAdminService.getUserStatistics).toHaveBeenCalledWith(filters);
    });
  });
});