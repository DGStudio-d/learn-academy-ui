import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import {
  useTeacherStudents,
  useStudentProgress,
  useContentAnalytics,
  useContentByLanguage,
  useAssignStudentsToMeeting,
  useRemoveStudentsFromMeeting,
  useMeetingAttendees,
  useCreateAdvancedQuiz,
  useBulkUpdateQuizzes,
  useBulkUpdateMeetings,
  useExportStudentProgress,
  useTeacherContentManagement,
  useTeacherDashboardData
} from '../../hooks/useTeacher';
import { teacherService } from '../../services/teacherService';

// Mock the teacher service
vi.mock('../../services/teacherService');
const mockedTeacherService = vi.mocked(teacherService);

// Test wrapper with QueryClient
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('useTeacher hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Student Management Hooks', () => {
    it('should fetch teacher students', async () => {
      const mockStudents = {
        success: true,
        data: {
          data: [
            { id: 1, name: 'Student 1', email: 'student1@test.com', role: 'student' as const }
          ],
          current_page: 1,
          per_page: 10,
          total: 1,
          last_page: 1
        }
      };

      mockedTeacherService.getStudents.mockResolvedValueOnce(mockStudents);

      const { result } = renderHook(() => useTeacherStudents(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockedTeacherService.getStudents).toHaveBeenCalledWith(undefined, 1);
      expect(result.current.data).toEqual(mockStudents);
    });

    it('should fetch teacher students with program filter', async () => {
      const programId = 1;
      const mockStudents = {
        success: true,
        data: {
          data: [
            { id: 1, name: 'Student 1', email: 'student1@test.com', role: 'student' as const }
          ],
          current_page: 1,
          per_page: 10,
          total: 1,
          last_page: 1
        }
      };

      mockedTeacherService.getStudents.mockResolvedValueOnce(mockStudents);

      const { result } = renderHook(() => useTeacherStudents(programId), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockedTeacherService.getStudents).toHaveBeenCalledWith(programId, 1);
      expect(result.current.data).toEqual(mockStudents);
    });

    it('should fetch student progress', async () => {
      const studentId = 1;
      const mockProgress = {
        student: { id: 1, name: 'Student 1', email: 'student1@test.com', role: 'student' as const },
        quiz_attempts: [],
        meeting_attendance: [],
        overall_progress: {
          quizzes_completed: 5,
          total_quizzes: 10,
          average_score: 85,
          meetings_attended: 3,
          total_meetings: 5,
          completion_percentage: 60
        }
      };

      mockedTeacherService.getStudentProgress.mockResolvedValueOnce(mockProgress);

      const { result } = renderHook(() => useStudentProgress(studentId), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockedTeacherService.getStudentProgress).toHaveBeenCalledWith(studentId, undefined);
      expect(result.current.data).toEqual(mockProgress);
    });
  });

  describe('Analytics Hooks', () => {
    it('should fetch content analytics', async () => {
      const mockAnalytics = {
        quiz_analytics: {
          total_quizzes: 10,
          total_attempts: 50,
          average_score: 78,
          completion_rate: 85,
          popular_quizzes: []
        },
        meeting_analytics: {
          total_meetings: 5,
          total_attendees: 25,
          average_attendance: 80,
          upcoming_meetings: []
        },
        student_analytics: {
          total_students: 20,
          active_students: 18,
          top_performers: []
        }
      };

      mockedTeacherService.getContentAnalytics.mockResolvedValueOnce(mockAnalytics);

      const { result } = renderHook(() => useContentAnalytics(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockedTeacherService.getContentAnalytics).toHaveBeenCalledWith(undefined);
      expect(result.current.data).toEqual(mockAnalytics);
    });

    it('should fetch content analytics with filters', async () => {
      const filters = { program_id: 1, language_id: 2 };
      const mockAnalytics = {
        quiz_analytics: {
          total_quizzes: 5,
          total_attempts: 25,
          average_score: 82,
          completion_rate: 90,
          popular_quizzes: []
        },
        meeting_analytics: {
          total_meetings: 3,
          total_attendees: 15,
          average_attendance: 85,
          upcoming_meetings: []
        },
        student_analytics: {
          total_students: 10,
          active_students: 9,
          top_performers: []
        }
      };

      mockedTeacherService.getContentAnalytics.mockResolvedValueOnce(mockAnalytics);

      const { result } = renderHook(() => useContentAnalytics(filters), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockedTeacherService.getContentAnalytics).toHaveBeenCalledWith(filters);
      expect(result.current.data).toEqual(mockAnalytics);
    });
  });

  describe('Language-specific Content Hooks', () => {
    it('should fetch content by language', async () => {
      const languageId = 1;
      const contentType = 'programs';
      const mockContent = {
        success: true,
        data: {
          data: [
            { id: 1, name: 'Program 1', language_id: languageId }
          ],
          current_page: 1,
          per_page: 10,
          total: 1,
          last_page: 1
        }
      };

      mockedTeacherService.getContentByLanguage.mockResolvedValueOnce(mockContent);

      const { result } = renderHook(() => useContentByLanguage(languageId, contentType), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockedTeacherService.getContentByLanguage).toHaveBeenCalledWith(languageId, contentType, 1);
      expect(result.current.data).toEqual(mockContent);
    });
  });

  describe('Meeting Management Hooks', () => {
    it('should assign students to meeting', async () => {
      mockedTeacherService.assignStudentsToMeeting.mockResolvedValueOnce();

      const { result } = renderHook(() => useAssignStudentsToMeeting(), {
        wrapper: createWrapper(),
      });

      const meetingId = 1;
      const studentIds = [1, 2, 3];

      result.current.mutate({ meetingId, studentIds });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockedTeacherService.assignStudentsToMeeting).toHaveBeenCalledWith(meetingId, studentIds);
    });

    it('should remove students from meeting', async () => {
      mockedTeacherService.removeStudentsFromMeeting.mockResolvedValueOnce();

      const { result } = renderHook(() => useRemoveStudentsFromMeeting(), {
        wrapper: createWrapper(),
      });

      const meetingId = 1;
      const studentIds = [1, 2];

      result.current.mutate({ meetingId, studentIds });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockedTeacherService.removeStudentsFromMeeting).toHaveBeenCalledWith(meetingId, studentIds);
    });

    it('should fetch meeting attendees', async () => {
      const meetingId = 1;
      const mockAttendees = [
        {
          student: { id: 1, name: 'Student 1', email: 'student1@test.com', role: 'student' as const },
          attended: true,
          attended_at: '2024-01-15T10:00:00Z'
        }
      ];

      mockedTeacherService.getMeetingAttendees.mockResolvedValueOnce(mockAttendees);

      const { result } = renderHook(() => useMeetingAttendees(meetingId), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockedTeacherService.getMeetingAttendees).toHaveBeenCalledWith(meetingId);
      expect(result.current.data).toEqual(mockAttendees);
    });
  });

  describe('Advanced Quiz Hooks', () => {
    it('should create advanced quiz', async () => {
      const mockQuiz = {
        id: 1,
        title: 'Advanced Quiz',
        description: 'A comprehensive quiz',
        program_id: 1,
        language_id: 1
      };

      mockedTeacherService.createAdvancedQuiz.mockResolvedValueOnce(mockQuiz);

      const { result } = renderHook(() => useCreateAdvancedQuiz(), {
        wrapper: createWrapper(),
      });

      const quizData = {
        title: 'Advanced Quiz',
        description: 'A comprehensive quiz',
        program_id: 1,
        language_id: 1,
        questions: [],
        settings: {}
      };

      result.current.mutate(quizData);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockedTeacherService.createAdvancedQuiz).toHaveBeenCalledWith(quizData, expect.any(Object));
    });
  });

  describe('Bulk Operations Hooks', () => {
    it('should bulk update quizzes', async () => {
      mockedTeacherService.bulkUpdateQuizzes.mockResolvedValueOnce();

      const { result } = renderHook(() => useBulkUpdateQuizzes(), {
        wrapper: createWrapper(),
      });

      const quizIds = [1, 2, 3];
      const updates = { is_active: false };

      result.current.mutate({ quizIds, updates });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockedTeacherService.bulkUpdateQuizzes).toHaveBeenCalledWith(quizIds, updates);
    });

    it('should bulk update meetings', async () => {
      mockedTeacherService.bulkUpdateMeetings.mockResolvedValueOnce();

      const { result } = renderHook(() => useBulkUpdateMeetings(), {
        wrapper: createWrapper(),
      });

      const meetingIds = [1, 2];
      const updates = { is_active: true };

      result.current.mutate({ meetingIds, updates });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockedTeacherService.bulkUpdateMeetings).toHaveBeenCalledWith(meetingIds, updates);
    });
  });

  describe('Export Hooks', () => {
    it('should export student progress', async () => {
      const mockExportResult = {
        download_url: 'https://example.com/download/progress.csv'
      };

      mockedTeacherService.exportStudentProgress.mockResolvedValueOnce(mockExportResult);

      const { result } = renderHook(() => useExportStudentProgress(), {
        wrapper: createWrapper(),
      });

      const filters = {
        program_id: 1,
        format: 'csv' as const
      };

      result.current.mutate(filters);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockedTeacherService.exportStudentProgress).toHaveBeenCalledWith(filters, expect.any(Object));
    });
  });

  describe('Combined Hooks', () => {
    it('should use teacher content management hook', async () => {
      const languageId = 1;
      const mockContent = {
        success: true,
        data: {
          data: [],
          current_page: 1,
          per_page: 10,
          total: 0,
          last_page: 1
        }
      };

      mockedTeacherService.getContentByLanguage.mockResolvedValue(mockContent);

      const { result } = renderHook(() => useTeacherContentManagement(languageId), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.programs.isSuccess).toBe(true);
        expect(result.current.quizzes.isSuccess).toBe(true);
        expect(result.current.meetings.isSuccess).toBe(true);
      });

      expect(mockedTeacherService.getContentByLanguage).toHaveBeenCalledWith(languageId, 'programs', 1);
      expect(mockedTeacherService.getContentByLanguage).toHaveBeenCalledWith(languageId, 'quizzes', 1);
      expect(mockedTeacherService.getContentByLanguage).toHaveBeenCalledWith(languageId, 'meetings', 1);
    });

    it('should use teacher dashboard data hook', async () => {
      const mockStats = { total_users: 10 };
      const mockLanguages = [{ id: 1, name: 'English', code: 'en' as const }];
      const mockPrograms = {
        success: true,
        data: {
          data: [],
          current_page: 1,
          per_page: 10,
          total: 0,
          last_page: 1
        }
      };
      const mockAnalytics = {
        quiz_analytics: {
          total_quizzes: 0,
          total_attempts: 0,
          average_score: 0,
          completion_rate: 0,
          popular_quizzes: []
        },
        meeting_analytics: {
          total_meetings: 0,
          total_attendees: 0,
          average_attendance: 0,
          upcoming_meetings: []
        },
        student_analytics: {
          total_students: 0,
          active_students: 0,
          top_performers: []
        }
      };

      mockedTeacherService.getDashboardStats.mockResolvedValue(mockStats);
      mockedTeacherService.getLanguages.mockResolvedValue(mockLanguages);
      mockedTeacherService.getPrograms.mockResolvedValue(mockPrograms);
      mockedTeacherService.getContentAnalytics.mockResolvedValue(mockAnalytics);

      const { result } = renderHook(() => useTeacherDashboardData(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.stats.isSuccess).toBe(true);
        expect(result.current.languages.isSuccess).toBe(true);
        expect(result.current.programs.isSuccess).toBe(true);
        expect(result.current.analytics.isSuccess).toBe(true);
      });

      expect(mockedTeacherService.getDashboardStats).toHaveBeenCalled();
      expect(mockedTeacherService.getLanguages).toHaveBeenCalled();
      expect(mockedTeacherService.getPrograms).toHaveBeenCalled();
      expect(mockedTeacherService.getContentAnalytics).toHaveBeenCalled();
    });
  });
});