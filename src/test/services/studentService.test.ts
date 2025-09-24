import { describe, it, expect, vi, beforeEach } from 'vitest';
import { studentService } from '../../services/studentService';
import api from '../../lib/api';
import { ApiErrorHandler } from '../../lib/errorHandler';

// Mock the API and error handler
vi.mock('../../lib/api');
vi.mock('../../lib/errorHandler');

const mockApi = vi.mocked(api);
const mockErrorHandler = vi.mocked(ApiErrorHandler);

describe('StudentService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Dashboard and Stats', () => {
    it('should get dashboard stats successfully', async () => {
      const mockStats = {
        total_quizzes: 10,
        completed_quizzes: 5,
        average_score: 85,
        upcoming_meetings: 3,
      };

      mockApi.get.mockResolvedValue({
        data: {
          success: true,
          data: mockStats,
        },
      });

      const result = await studentService.getDashboardStats();
      
      expect(mockApi.get).toHaveBeenCalledWith('/student/dashboard-stats');
      expect(result).toEqual(mockStats);
    });

    it('should handle dashboard stats error', async () => {
      const mockError = new Error('Network error');
      mockApi.get.mockRejectedValue(mockError);
      mockErrorHandler.handleError.mockReturnValue({});

      await expect(studentService.getDashboardStats()).rejects.toThrow('Network error');
      expect(mockErrorHandler.handleError).toHaveBeenCalledWith(mockError, {
        customMessage: 'Failed to get dashboard stats'
      });
    });
  });

  describe('Enrollment Management', () => {
    it('should get enrollments successfully', async () => {
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

      mockApi.get.mockResolvedValue({ data: mockEnrollments });

      const result = await studentService.getEnrollments(1);
      
      expect(mockApi.get).toHaveBeenCalledWith('/student/enrollments?page=1');
      expect(result).toEqual(mockEnrollments);
    });

    it('should request enrollment successfully', async () => {
      const mockEnrollment = {
        id: 1,
        program_id: 5,
        status: 'pending',
      };

      mockApi.post.mockResolvedValue({
        data: {
          success: true,
          data: mockEnrollment,
        },
      });

      const result = await studentService.requestEnrollment(5);
      
      expect(mockApi.post).toHaveBeenCalledWith('/student/enrollments', {
        program_id: 5
      });
      expect(result).toEqual(mockEnrollment);
    });

    it('should cancel enrollment request successfully', async () => {
      mockApi.delete.mockResolvedValue({
        data: { success: true },
      });

      await studentService.cancelEnrollmentRequest(1);
      
      expect(mockApi.delete).toHaveBeenCalledWith('/student/enrollments/1');
    });
  });

  describe('Quiz Management', () => {
    it('should get available quizzes successfully', async () => {
      const mockQuizzes = {
        success: true,
        data: {
          data: [
            { id: 1, title: 'Quiz 1', program_id: 1 },
            { id: 2, title: 'Quiz 2', program_id: 1 },
          ],
          current_page: 1,
          total: 2,
        },
      };

      mockApi.get.mockResolvedValue({ data: mockQuizzes });

      const result = await studentService.getQuizzes(1);
      
      expect(mockApi.get).toHaveBeenCalledWith('/student/quizzes?page=1');
      expect(result).toEqual(mockQuizzes);
    });

    it('should start quiz attempt successfully', async () => {
      const mockAttemptStart = {
        attemptId: 123,
        startTime: '2024-01-15T10:30:00Z',
      };

      mockApi.post.mockResolvedValue({
        data: {
          success: true,
          data: mockAttemptStart,
        },
      });

      const result = await studentService.startQuizAttempt(1);
      
      expect(mockApi.post).toHaveBeenCalledWith('/student/quizzes/1/start', {});
      expect(result).toEqual(mockAttemptStart);
    });

    it('should save quiz progress successfully', async () => {
      mockApi.put.mockResolvedValue({
        data: { success: true },
      });

      const answers = { '1': 0, '2': 1 };
      await studentService.saveQuizProgress(1, 123, answers, 300);
      
      expect(mockApi.put).toHaveBeenCalledWith('/student/quizzes/1/attempts/123/progress', {
        answers,
        time_spent: 300
      });
    });

    it('should submit quiz attempt successfully', async () => {
      const mockAttempt = {
        id: 123,
        quiz_id: 1,
        score: 85,
        total_questions: 10,
        correct_answers: 8,
      };

      mockApi.post.mockResolvedValue({
        data: {
          success: true,
          data: mockAttempt,
        },
      });

      const answers = { '1': 0, '2': 1, '3': 2 };
      const result = await studentService.submitQuizAttempt(1, answers);
      
      expect(mockApi.post).toHaveBeenCalledWith('/student/quizzes/1/attempt', {
        answers
      });
      expect(result).toEqual(mockAttempt);
    });

    it('should get quiz attempt results successfully', async () => {
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

      mockApi.get.mockResolvedValue({
        data: {
          success: true,
          data: mockResults,
        },
      });

      const result = await studentService.getQuizAttemptResults(1, 123);
      
      expect(mockApi.get).toHaveBeenCalledWith('/student/quizzes/1/attempts/123/results');
      expect(result).toEqual(mockResults);
    });
  });

  describe('Meeting Management', () => {
    it('should get meetings successfully', async () => {
      const mockMeetings = {
        success: true,
        data: {
          data: [
            { id: 1, title: 'Meeting 1', scheduled_at: '2024-01-20T10:00:00Z' },
            { id: 2, title: 'Meeting 2', scheduled_at: '2024-01-21T14:00:00Z' },
          ],
          current_page: 1,
          total: 2,
        },
      };

      mockApi.get.mockResolvedValue({ data: mockMeetings });

      const result = await studentService.getMeetings(1);
      
      expect(mockApi.get).toHaveBeenCalledWith('/student/meetings?page=1');
      expect(result).toEqual(mockMeetings);
    });

    it('should get upcoming meetings with parameters', async () => {
      const mockMeetings = {
        success: true,
        data: {
          data: [
            { id: 1, title: 'Meeting 1', scheduled_at: '2024-01-20T10:00:00Z' },
          ],
          current_page: 1,
          total: 1,
        },
      };

      mockApi.get.mockResolvedValue({ data: mockMeetings });

      const result = await studentService.getUpcomingMeetings(5, 7);
      
      expect(mockApi.get).toHaveBeenCalledWith('/student/meetings/upcoming?limit=5&days_ahead=7');
      expect(result).toEqual(mockMeetings);
    });

    it('should get meeting details successfully', async () => {
      const mockMeeting = {
        id: 1,
        title: 'Meeting 1',
        scheduled_at: '2024-01-20T10:00:00Z',
        meeting_url: 'https://meet.example.com/room1',
      };

      mockApi.get.mockResolvedValue({
        data: {
          success: true,
          data: mockMeeting,
        },
      });

      const result = await studentService.getMeeting(1);
      
      expect(mockApi.get).toHaveBeenCalledWith('/student/meetings/1');
      expect(result).toEqual(mockMeeting);
    });
  });

  describe('Progress Tracking', () => {
    it('should get progress summary successfully', async () => {
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
            type: 'quiz_attempt',
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

      mockApi.get.mockResolvedValue({
        data: {
          success: true,
          data: mockProgress,
        },
      });

      const result = await studentService.getProgressSummary();
      
      expect(mockApi.get).toHaveBeenCalledWith('/student/progress/summary');
      expect(result).toEqual(mockProgress);
    });

    it('should get all quiz attempts successfully', async () => {
      const mockAttempts = {
        success: true,
        data: {
          data: [
            { id: 1, quiz_id: 1, score: 85, completed_at: '2024-01-15T10:30:00Z' },
            { id: 2, quiz_id: 2, score: 92, completed_at: '2024-01-14T14:20:00Z' },
          ],
          current_page: 1,
          total: 2,
        },
      };

      mockApi.get.mockResolvedValue({ data: mockAttempts });

      const result = await studentService.getAllQuizAttempts(1);
      
      expect(mockApi.get).toHaveBeenCalledWith('/student/quizzes/attempts/my?page=1');
      expect(result).toEqual(mockAttempts);
    });
  });

  describe('Profile Management', () => {
    it('should update profile successfully', async () => {
      const mockUser = {
        id: 1,
        name: 'Updated Name',
        email: 'student@example.com',
        phone: '+1-234-567-8900',
        preferred_language: 'en' as const,
      };

      mockApi.post.mockResolvedValue({
        data: {
          success: true,
          data: mockUser,
        },
      });

      const profileData = {
        name: 'Updated Name',
        phone: '+1-234-567-8900',
        preferred_language: 'en' as const,
      };

      const result = await studentService.updateProfile(profileData);
      
      expect(mockApi.post).toHaveBeenCalledWith('/student/profile', expect.any(FormData), {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      expect(result).toEqual(mockUser);
    });

    it('should update profile with image successfully', async () => {
      const mockUser = {
        id: 1,
        name: 'Updated Name',
        email: 'student@example.com',
        profile_image: 'https://example.com/image.jpg',
      };

      mockApi.post.mockResolvedValue({
        data: {
          success: true,
          data: mockUser,
        },
      });

      const mockFile = new File(['image data'], 'profile.jpg', { type: 'image/jpeg' });
      const profileData = {
        name: 'Updated Name',
        profile_image: mockFile,
      };

      const result = await studentService.updateProfile(profileData);
      
      expect(mockApi.post).toHaveBeenCalledWith('/student/profile', expect.any(FormData), {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      expect(result).toEqual(mockUser);
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors with custom messages', async () => {
      const mockError = {
        response: {
          status: 404,
          data: {
            success: false,
            message: 'Quiz not found',
          },
        },
      };

      mockApi.get.mockRejectedValue(mockError);
      mockErrorHandler.handleError.mockReturnValue({});

      await expect(studentService.getQuiz(999)).rejects.toThrow();
      expect(mockErrorHandler.handleError).toHaveBeenCalledWith(mockError, {
        customMessage: 'Failed to get quiz'
      });
    });

    it('should handle network errors gracefully', async () => {
      const networkError = new Error('Network Error');
      mockApi.get.mockRejectedValue(networkError);
      mockErrorHandler.handleError.mockReturnValue({});

      await expect(studentService.getDashboardStats()).rejects.toThrow('Network Error');
      expect(mockErrorHandler.handleError).toHaveBeenCalledWith(networkError, {
        customMessage: 'Failed to get dashboard stats'
      });
    });
  });
});