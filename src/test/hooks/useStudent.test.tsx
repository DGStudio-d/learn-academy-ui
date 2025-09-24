import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import {
  useStudentDashboardStats,
  useStudentEnrollments,
  useRequestEnrollment,
  useStudentQuizzes,
  useSubmitQuizAttempt,
  useStartQuizAttempt,
  useSaveQuizProgress,
  useQuizAttemptResults,
  useStudentProgressSummary,
  useUpdateStudentProfile,
  useQuizAttemptManager,
  useStudentLearningDashboard,
} from '../../hooks/useStudent';
import { studentService } from '../../services/studentService';

// Mock the student service
vi.mock('../../services/studentService');

const mockStudentService = vi.mocked(studentService);

// Create a wrapper for React Query
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

describe('useStudent hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useStudentDashboardStats', () => {
    it('should fetch dashboard stats successfully', async () => {
      const mockStats = {
        total_quizzes: 10,
        completed_quizzes: 5,
        average_score: 85,
        upcoming_meetings: 3,
      };

      mockStudentService.getDashboardStats.mockResolvedValue(mockStats);

      const { result } = renderHook(() => useStudentDashboardStats(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockStats);
      expect(mockStudentService.getDashboardStats).toHaveBeenCalledOnce();
    });

    it('should handle dashboard stats error', async () => {
      const mockError = new Error('Failed to fetch stats');
      mockStudentService.getDashboardStats.mockRejectedValue(mockError);

      const { result } = renderHook(() => useStudentDashboardStats(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toEqual(mockError);
    });
  });

  describe('useStudentEnrollments', () => {
    it('should fetch enrollments successfully', async () => {
      const mockEnrollments = {
        success: true,
        data: {
          data: [
            { id: 1, program_id: 1, status: 'approved' },
            { id: 2, program_id: 2, status: 'pending' },
          ],
          current_page: 1,
          total: 2,
        },
      };

      mockStudentService.getEnrollments.mockResolvedValue(mockEnrollments);

      const { result } = renderHook(() => useStudentEnrollments(1), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockEnrollments);
      expect(mockStudentService.getEnrollments).toHaveBeenCalledWith(1);
    });
  });

  describe('useRequestEnrollment', () => {
    it('should request enrollment successfully', async () => {
      const mockEnrollment = {
        id: 1,
        program_id: 5,
        status: 'pending',
      };

      mockStudentService.requestEnrollment.mockResolvedValue(mockEnrollment);

      const { result } = renderHook(() => useRequestEnrollment(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        result.current.mutate(5);
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockEnrollment);
      expect(mockStudentService.requestEnrollment).toHaveBeenCalledWith(5);
    });
  });

  describe('useStartQuizAttempt', () => {
    it('should start quiz attempt successfully', async () => {
      const mockAttemptStart = {
        attemptId: 123,
        startTime: '2024-01-15T10:30:00Z',
      };

      mockStudentService.startQuizAttempt.mockResolvedValue(mockAttemptStart);

      const { result } = renderHook(() => useStartQuizAttempt(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        result.current.mutate(1);
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockAttemptStart);
      expect(mockStudentService.startQuizAttempt).toHaveBeenCalledWith(1);
    });
  });

  describe('useSaveQuizProgress', () => {
    it('should save quiz progress successfully', async () => {
      mockStudentService.saveQuizProgress.mockResolvedValue();

      const { result } = renderHook(() => useSaveQuizProgress(), {
        wrapper: createWrapper(),
      });

      const progressData = {
        quizId: 1,
        attemptId: 123,
        answers: { '1': 0, '2': 1 },
        timeSpent: 300,
      };

      await waitFor(() => {
        result.current.mutate(progressData);
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockStudentService.saveQuizProgress).toHaveBeenCalledWith(
        1, 123, { '1': 0, '2': 1 }, 300
      );
    });
  });

  describe('useSubmitQuizAttempt', () => {
    it('should submit quiz attempt successfully', async () => {
      const mockAttempt = {
        id: 123,
        quiz_id: 1,
        score: 85,
        total_questions: 10,
        correct_answers: 8,
      };

      mockStudentService.submitQuizAttempt.mockResolvedValue(mockAttempt);

      const { result } = renderHook(() => useSubmitQuizAttempt(), {
        wrapper: createWrapper(),
      });

      const submitData = {
        quizId: 1,
        answers: { '1': 0, '2': 1, '3': 2 },
      };

      await waitFor(() => {
        result.current.mutate(submitData);
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockAttempt);
      expect(mockStudentService.submitQuizAttempt).toHaveBeenCalledWith(1, submitData.answers);
    });
  });

  describe('useQuizAttemptResults', () => {
    it('should fetch quiz attempt results successfully', async () => {
      const mockResults = {
        id: 123,
        quiz_id: 1,
        score: 85,
        question_results: [
          {
            question_id: 1,
            question: 'What is 2+2?',
            student_answer: '4',
            correct_answer: '4',
            is_correct: true,
          },
        ],
        performance_summary: {
          total_time: 300,
          average_time_per_question: 30,
          accuracy_percentage: 85,
          passing_score: 70,
          passed: true,
        },
      };

      mockStudentService.getQuizAttemptResults.mockResolvedValue(mockResults);

      const { result } = renderHook(() => useQuizAttemptResults(1, 123), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockResults);
      expect(mockStudentService.getQuizAttemptResults).toHaveBeenCalledWith(1, 123);
    });

    it('should not fetch when quizId or attemptId is missing', () => {
      const { result } = renderHook(() => useQuizAttemptResults(0, 123), {
        wrapper: createWrapper(),
      });

      expect(result.current.fetchStatus).toBe('idle');
      expect(mockStudentService.getQuizAttemptResults).not.toHaveBeenCalled();
    });
  });

  describe('useStudentProgressSummary', () => {
    it('should fetch progress summary successfully', async () => {
      const mockProgress = {
        overall_progress: {
          total_quizzes_available: 20,
          quizzes_completed: 15,
          total_meetings_available: 10,
          meetings_attended: 8,
          average_quiz_score: 87.5,
          completion_percentage: 75,
        },
        recent_activity: [
          {
            type: 'quiz_attempt' as const,
            title: 'Math Quiz 1',
            date: '2024-01-15T10:30:00Z',
            score: 90,
            status: 'completed',
          },
        ],
        achievements: [
          {
            id: 1,
            title: 'First Quiz Completed',
            description: 'Completed your first quiz',
            earned_at: '2024-01-10T09:00:00Z',
          },
        ],
      };

      mockStudentService.getProgressSummary.mockResolvedValue(mockProgress);

      const { result } = renderHook(() => useStudentProgressSummary(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockProgress);
      expect(mockStudentService.getProgressSummary).toHaveBeenCalledOnce();
    });
  });

  describe('useUpdateStudentProfile', () => {
    it('should update profile successfully', async () => {
      const mockUser = {
        id: 1,
        name: 'Updated Name',
        email: 'student@example.com',
        role: 'student' as const,
        phone: '+1-234-567-8900',
        preferred_language: 'en' as const,
        is_active: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-15T10:30:00Z',
      };

      mockStudentService.updateProfile.mockResolvedValue(mockUser);

      const { result } = renderHook(() => useUpdateStudentProfile(), {
        wrapper: createWrapper(),
      });

      const profileData = {
        name: 'Updated Name',
        phone: '+1-234-567-8900',
        preferred_language: 'en' as const,
      };

      await waitFor(() => {
        result.current.mutate(profileData);
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockUser);
      expect(mockStudentService.updateProfile).toHaveBeenCalledWith(profileData);
    });
  });

  describe('useQuizAttemptManager', () => {
    it('should manage quiz attempt lifecycle', async () => {
      const mockAttemptStart = {
        attemptId: 123,
        startTime: '2024-01-15T10:30:00Z',
      };

      const mockAttemptResult = {
        id: 123,
        quiz_id: 1,
        score: 85,
        total_questions: 10,
        correct_answers: 8,
      };

      mockStudentService.startQuizAttempt.mockResolvedValue(mockAttemptStart);
      mockStudentService.saveQuizProgress.mockResolvedValue();
      mockStudentService.submitQuizAttempt.mockResolvedValue(mockAttemptResult);

      const { result } = renderHook(() => useQuizAttemptManager(1), {
        wrapper: createWrapper(),
      });

      // Test starting quiz session
      let startResult;
      await waitFor(async () => {
        startResult = await result.current.startQuizSession();
      });

      expect(startResult).toEqual(mockAttemptStart);
      expect(mockStudentService.startQuizAttempt).toHaveBeenCalledWith(1);

      // Test saving progress
      await waitFor(async () => {
        await result.current.saveQuizProgress(123, { '1': 0, '2': 1 }, 300);
      });

      expect(mockStudentService.saveQuizProgress).toHaveBeenCalledWith(1, 123, { '1': 0, '2': 1 }, 300);

      // Test submitting quiz
      let submitResult;
      await waitFor(async () => {
        submitResult = await result.current.submitQuizSession({ '1': 0, '2': 1, '3': 2 });
      });

      expect(submitResult).toEqual(mockAttemptResult);
      expect(mockStudentService.submitQuizAttempt).toHaveBeenCalledWith(1, { '1': 0, '2': 1, '3': 2 });
    });

    it('should handle errors gracefully', async () => {
      const mockError = new Error('Quiz submission failed');
      mockStudentService.submitQuizAttempt.mockRejectedValue(mockError);

      const { result } = renderHook(() => useQuizAttemptManager(1), {
        wrapper: createWrapper(),
      });

      await expect(
        result.current.submitQuizSession({ '1': 0, '2': 1 })
      ).rejects.toThrow('Quiz submission failed');
    });
  });

  describe('useStudentLearningDashboard', () => {
    it('should aggregate all dashboard data successfully', async () => {
      const mockStats = { total_quizzes: 10, completed_quizzes: 5 };
      const mockProgress = {
        overall_progress: {
          total_quizzes_available: 20,
          quizzes_completed: 15,
          total_meetings_available: 10,
          meetings_attended: 8,
          average_quiz_score: 87.5,
          completion_percentage: 75,
        },
        recent_activity: [],
        achievements: [],
      };
      const mockEnrollments = {
        success: true,
        data: { data: [], current_page: 1, total: 0 },
      };
      const mockMeetings = {
        success: true,
        data: { data: [], current_page: 1, total: 0 },
      };
      const mockAttempts = {
        success: true,
        data: { data: [], current_page: 1, total: 0 },
      };

      mockStudentService.getDashboardStats.mockResolvedValue(mockStats);
      mockStudentService.getProgressSummary.mockResolvedValue(mockProgress);
      mockStudentService.getEnrollments.mockResolvedValue(mockEnrollments);
      mockStudentService.getUpcomingMeetings.mockResolvedValue(mockMeetings);
      mockStudentService.getAllQuizAttempts.mockResolvedValue(mockAttempts);

      const { result } = renderHook(() => useStudentLearningDashboard(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.stats).toEqual(mockStats);
      expect(result.current.progress).toEqual(mockProgress);
      expect(result.current.enrollments).toEqual(mockEnrollments);
      expect(result.current.upcomingMeetings).toEqual(mockMeetings);
      expect(result.current.recentAttempts).toEqual(mockAttempts);
    });

    it('should handle loading states correctly', () => {
      mockStudentService.getDashboardStats.mockImplementation(() => new Promise(() => {}));
      mockStudentService.getProgressSummary.mockImplementation(() => new Promise(() => {}));
      mockStudentService.getEnrollments.mockImplementation(() => new Promise(() => {}));

      const { result } = renderHook(() => useStudentLearningDashboard(), {
        wrapper: createWrapper(),
      });

      expect(result.current.isLoading).toBe(true);
    });

    it('should handle errors correctly', async () => {
      const mockError = new Error('Dashboard error');
      mockStudentService.getDashboardStats.mockRejectedValue(mockError);
      mockStudentService.getProgressSummary.mockResolvedValue({
        overall_progress: {
          total_quizzes_available: 0,
          quizzes_completed: 0,
          total_meetings_available: 0,
          meetings_attended: 0,
          average_quiz_score: 0,
          completion_percentage: 0,
        },
        recent_activity: [],
        achievements: [],
      });
      mockStudentService.getEnrollments.mockResolvedValue({
        success: true,
        data: { data: [], current_page: 1, total: 0 },
      });

      const { result } = renderHook(() => useStudentLearningDashboard(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.error).toEqual(mockError);
      });
    });
  });
});