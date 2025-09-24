import { describe, it, expect, vi, beforeEach } from 'vitest';
import { adminService } from '../../services/adminService';
import api from '../../lib/api';
import type { User, Program, DashboardStats } from '../../types/api';

// Mock the API module
vi.mock('../../lib/api');
const mockedApi = vi.mocked(api);

describe('AdminService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getDashboardStats', () => {
    it('should fetch dashboard statistics successfully', async () => {
      const mockStats: DashboardStats = {
        total_users: 100,
        total_programs: 10,
        total_quizzes: 50,
        pending_enrollments: 5,
      };

      mockedApi.get.mockResolvedValue({
        data: {
          success: true,
          data: mockStats,
        },
      });

      const result = await adminService.getDashboardStats();

      expect(mockedApi.get).toHaveBeenCalledWith('/admin/dashboard-stats');
      expect(result).toEqual(mockStats);
    });

    it('should throw error when API call fails', async () => {
      mockedApi.get.mockRejectedValue(new Error('Network error'));

      await expect(adminService.getDashboardStats()).rejects.toThrow();
    });
  });

  describe('getUsers', () => {
    it('should fetch users with pagination', async () => {
      const mockUsers = [
        { id: 1, name: 'John Doe', email: 'john@example.com', role: 'student' as const },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'teacher' as const },
      ];

      const mockResponse = {
        data: {
          success: true,
          data: {
            data: mockUsers,
            current_page: 1,
            per_page: 15,
            total: 2,
            last_page: 1,
          },
        },
      };

      mockedApi.get.mockResolvedValue(mockResponse);

      const result = await adminService.getUsers(1, { role: 'student' });

      expect(mockedApi.get).toHaveBeenCalledWith('/admin/users?page=1&role=student');
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('createUser', () => {
    it('should create a new user successfully', async () => {
      const userData = {
        name: 'New User',
        email: 'newuser@example.com',
        password: 'password123',
        role: 'student' as const,
      };

      const mockUser: User = {
        id: 3,
        name: 'New User',
        email: 'newuser@example.com',
        role: 'student',
        preferred_language: 'en',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      mockedApi.post.mockResolvedValue({
        data: {
          success: true,
          data: mockUser,
        },
      });

      const result = await adminService.createUser(userData);

      expect(mockedApi.post).toHaveBeenCalledWith('/admin/users', userData);
      expect(result).toEqual(mockUser);
    });
  });

  describe('bulkUpdateUsers', () => {
    it('should update multiple users successfully', async () => {
      const userIds = [1, 2, 3];
      const updates = { preferred_language: 'es' as const };

      mockedApi.post.mockResolvedValue({
        data: {
          success: true,
        },
      });

      await adminService.bulkUpdateUsers(userIds, updates);

      expect(mockedApi.post).toHaveBeenCalledWith('/admin/users/bulk-update', {
        user_ids: userIds,
        updates,
      });
    });
  });

  describe('getUserStatistics', () => {
    it('should fetch user statistics successfully', async () => {
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

      mockedApi.get.mockResolvedValue({
        data: {
          success: true,
          data: mockStats,
        },
      });

      const result = await adminService.getUserStatistics({ role: 'student' });

      expect(mockedApi.get).toHaveBeenCalledWith('/admin/statistics/users?role=student');
      expect(result).toEqual(mockStats);
    });
  });

  describe('exportUsers', () => {
    it('should export users data as blob', async () => {
      const mockBlob = new Blob(['csv data'], { type: 'text/csv' });

      mockedApi.get.mockResolvedValue({
        data: mockBlob,
      });

      const result = await adminService.exportUsers({ format: 'csv', role: 'student' });

      expect(mockedApi.get).toHaveBeenCalledWith('/admin/users/export?format=csv&role=student', {
        responseType: 'blob',
      });
      expect(result).toEqual(mockBlob);
    });
  });

  describe('importUsers', () => {
    it('should import users from file successfully', async () => {
      const mockFile = new File(['csv content'], 'users.csv', { type: 'text/csv' });
      const mockResult = {
        success: 5,
        errors: [],
      };

      mockedApi.post.mockResolvedValue({
        data: {
          success: true,
          data: mockResult,
        },
      });

      const result = await adminService.importUsers(mockFile);

      expect(mockedApi.post).toHaveBeenCalledWith(
        '/admin/users/import',
        expect.any(FormData),
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      expect(result).toEqual(mockResult);
    });
  });
});