import api from '../lib/api';
import type { 
  ApiResponse, 
  PaginatedResponse,
  Program,
  Quiz,
  QuizAttempt,
  Meeting,
  MeetingResource,
  MeetingAttendanceRecord,
  Enrollment,
  User,
  DashboardStats,
  ApiErrorResponse
} from '../types/api';
import { ApiErrorHandler } from '../lib/errorHandler';

export const studentService = {
  // Get student dashboard statistics
  getDashboardStats: async (): Promise<DashboardStats> => {
    try {
      const response = await api.get<ApiResponse<DashboardStats>>('/student/dashboard-stats');
      
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

  // Get student enrollments
  getEnrollments: async (page = 1): Promise<PaginatedResponse<Enrollment>> => {
    try {
      const response = await api.get<PaginatedResponse<Enrollment>>(`/student/enrollments?page=${page}`);
      
      if (response.data.success) {
        return response.data;
      }
      
      throw new Error('Failed to get enrollments');
    } catch (error) {
      const errorDetails = ApiErrorHandler.handleError(error as ApiErrorResponse, {
        customMessage: 'Failed to get enrollments'
      });
      throw error;
    }
  },

  // Request enrollment in a program
  requestEnrollment: async (programId: number): Promise<Enrollment> => {
    try {
      const response = await api.post<ApiResponse<Enrollment>>('/student/enrollments', {
        program_id: programId
      });
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Failed to request enrollment');
    } catch (error) {
      const errorDetails = ApiErrorHandler.handleError(error as ApiErrorResponse, {
        customMessage: 'Failed to request enrollment'
      });
      throw error;
    }
  },

  // Get available programs (for enrollment)
  getAvailablePrograms: async (page = 1): Promise<PaginatedResponse<Program>> => {
    try {
      const response = await api.get<PaginatedResponse<Program>>(`/student/programs?page=${page}`);
      
      if (response.data.success) {
        return response.data;
      }
      
      throw new Error('Failed to get available programs');
    } catch (error) {
      const errorDetails = ApiErrorHandler.handleError(error as ApiErrorResponse, {
        customMessage: 'Failed to get available programs'
      });
      throw error;
    }
  },

  // Get enrolled programs
  getEnrolledPrograms: async (page = 1): Promise<PaginatedResponse<Program>> => {
    try {
      const response = await api.get<PaginatedResponse<Program>>(`/student/enrolled-programs?page=${page}`);
      
      if (response.data.success) {
        return response.data;
      }
      
      throw new Error('Failed to get enrolled programs');
    } catch (error) {
      const errorDetails = ApiErrorHandler.handleError(error as ApiErrorResponse, {
        customMessage: 'Failed to get enrolled programs'
      });
      throw error;
    }
  },

  // Get available quizzes
  getQuizzes: async (page = 1): Promise<PaginatedResponse<Quiz>> => {
    try {
      const response = await api.get<PaginatedResponse<Quiz>>(`/student/quizzes?page=${page}`);
      
      if (response.data.success) {
        return response.data;
      }
      
      throw new Error('Failed to get quizzes');
    } catch (error) {
      const errorDetails = ApiErrorHandler.handleError(error as ApiErrorResponse, {
        customMessage: 'Failed to get quizzes'
      });
      throw error;
    }
  },

  // Get quiz details
  getQuiz: async (quizId: number): Promise<Quiz> => {
    try {
      const response = await api.get<ApiResponse<Quiz>>(`/student/quizzes/${quizId}`);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Failed to get quiz');
    } catch (error) {
      const errorDetails = ApiErrorHandler.handleError(error as ApiErrorResponse, {
        customMessage: 'Failed to get quiz'
      });
      throw error;
    }
  },

  // Submit quiz attempt
  submitQuizAttempt: async (quizId: number, answers: Record<string, number>): Promise<QuizAttempt> => {
    try {
      const response = await api.post<ApiResponse<QuizAttempt>>(`/student/quizzes/${quizId}/attempt`, {
        answers
      });
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Failed to submit quiz attempt');
    } catch (error) {
      const errorDetails = ApiErrorHandler.handleError(error as ApiErrorResponse, {
        customMessage: 'Failed to submit quiz attempt'
      });
      throw error;
    }
  },

  // Get quiz attempts history
  getQuizAttempts: async (page = 1): Promise<PaginatedResponse<QuizAttempt>> => {
    try {
      const response = await api.get<PaginatedResponse<QuizAttempt>>(`/student/quiz-attempts?page=${page}`);
      
      if (response.data.success) {
        return response.data;
      }
      
      throw new Error('Failed to get quiz attempts');
    } catch (error) {
      const errorDetails = ApiErrorHandler.handleError(error as ApiErrorResponse, {
        customMessage: 'Failed to get quiz attempts'
      });
      throw error;
    }
  },

  // Get quiz attempt details
  getQuizAttempt: async (attemptId: number): Promise<QuizAttempt> => {
    try {
      const response = await api.get<ApiResponse<QuizAttempt>>(`/student/quiz-attempts/${attemptId}`);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Failed to get quiz attempt');
    } catch (error) {
      const errorDetails = ApiErrorHandler.handleError(error as ApiErrorResponse, {
        customMessage: 'Failed to get quiz attempt'
      });
      throw error;
    }
  },

  // Get available meetings
  getMeetings: async (page = 1): Promise<PaginatedResponse<Meeting>> => {
    try {
      const response = await api.get<PaginatedResponse<Meeting>>(`/student/meetings?page=${page}`);
      
      if (response.data.success) {
        return response.data;
      }
      
      throw new Error('Failed to get meetings');
    } catch (error) {
      const errorDetails = ApiErrorHandler.handleError(error as ApiErrorResponse, {
        customMessage: 'Failed to get meetings'
      });
      throw error;
    }
  },

  // Get meeting details
  getMeeting: async (meetingId: number): Promise<Meeting> => {
    try {
      const response = await api.get<ApiResponse<Meeting>>(`/student/meetings/${meetingId}`);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Failed to get meeting');
    } catch (error) {
      const errorDetails = ApiErrorHandler.handleError(error as ApiErrorResponse, {
        customMessage: 'Failed to get meeting details'
      });
      throw error;
    }
  },

  // Get upcoming meetings
  getUpcomingMeetings: async (limit?: number, daysAhead?: number): Promise<PaginatedResponse<Meeting>> => {
    try {
      const params = new URLSearchParams();
      if (limit) params.append('limit', limit.toString());
      if (daysAhead) params.append('days_ahead', daysAhead.toString());
      
      const response = await api.get<PaginatedResponse<Meeting>>(`/student/meetings/upcoming?${params.toString()}`);
      
      if (response.data.success) {
        return response.data;
      }
      
      throw new Error('Failed to get upcoming meetings');
    } catch (error) {
      const errorDetails = ApiErrorHandler.handleError(error as ApiErrorResponse, {
        customMessage: 'Failed to get upcoming meetings'
      });
      throw error;
    }
  },

  // Join meeting (record attendance)
  joinMeeting: async (meetingId: number): Promise<{ session_id: string; join_url: string }> => {
    try {
      const response = await api.post<ApiResponse<{ session_id: string; join_url: string }>>(`/student/meetings/${meetingId}/join`);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Failed to join meeting');
    } catch (error) {
      const errorDetails = ApiErrorHandler.handleError(error as ApiErrorResponse, {
        customMessage: 'Failed to join meeting'
      });
      throw error;
    }
  },

  // Leave meeting (record attendance end)
  leaveMeeting: async (meetingId: number, sessionId: string): Promise<void> => {
    try {
      const response = await api.post<ApiResponse>(`/student/meetings/${meetingId}/leave`, {
        session_id: sessionId
      });
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to leave meeting');
      }
    } catch (error) {
      const errorDetails = ApiErrorHandler.handleError(error as ApiErrorResponse, {
        customMessage: 'Failed to leave meeting'
      });
      throw error;
    }
  },

  // Get meeting resources
  getMeetingResources: async (meetingId: number): Promise<MeetingResource[]> => {
    try {
      const response = await api.get<ApiResponse<MeetingResource[]>>(`/student/meetings/${meetingId}/resources`);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Failed to get meeting resources');
    } catch (error) {
      const errorDetails = ApiErrorHandler.handleError(error as ApiErrorResponse, {
        customMessage: 'Failed to get meeting resources'
      });
      throw error;
    }
  },

  // Download meeting resource
  downloadMeetingResource: async (meetingId: number, resourceId: number): Promise<{ download_url: string }> => {
    try {
      const response = await api.get<ApiResponse<{ download_url: string }>>(`/student/meetings/${meetingId}/resources/${resourceId}/download`);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Failed to download meeting resource');
    } catch (error) {
      const errorDetails = ApiErrorHandler.handleError(error as ApiErrorResponse, {
        customMessage: 'Failed to download meeting resource'
      });
      throw error;
    }
  },

  // Get student's meeting attendance history
  getMeetingAttendanceHistory: async (page = 1): Promise<PaginatedResponse<MeetingAttendanceRecord>> => {
    try {
      const response = await api.get<PaginatedResponse<MeetingAttendanceRecord>>(`/student/meetings/attendance-history?page=${page}`);
      
      if (response.data.success) {
        return response.data;
      }
      
      throw new Error('Failed to get meeting attendance history');
    } catch (error) {
      const errorDetails = ApiErrorHandler.handleError(error as ApiErrorResponse, {
        customMessage: 'Failed to get meeting attendance history'
      });
      throw error;
    }
  },

  // Update meeting notification preferences
  updateMeetingNotificationPreferences: async (preferences: {
    email_reminders: boolean;
    sms_reminders?: boolean;
    reminder_times: number[];
  }): Promise<void> => {
    try {
      const response = await api.put<ApiResponse>('/student/meetings/notification-preferences', preferences);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to update notification preferences');
      }
    } catch (error) {
      const errorDetails = ApiErrorHandler.handleError(error as ApiErrorResponse, {
        customMessage: 'Failed to update notification preferences'
      });
      throw error;
    }
  },

  // Start quiz attempt (for real-time progress tracking)
  startQuizAttempt: async (quizId: number): Promise<{ attemptId: number; startTime: string }> => {
    try {
      const response = await api.post<ApiResponse<{ attemptId: number; startTime: string }>>(`/student/quizzes/${quizId}/start`, {});
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Failed to start quiz attempt');
    } catch (error) {
      const errorDetails = ApiErrorHandler.handleError(error as ApiErrorResponse, {
        customMessage: 'Failed to start quiz attempt'
      });
      throw error;
    }
  },

  // Save quiz progress (for auto-save functionality)
  saveQuizProgress: async (quizId: number, attemptId: number, answers: Record<string, number>, timeSpent: number): Promise<void> => {
    try {
      const response = await api.put<ApiResponse<void>>(`/student/quizzes/${quizId}/attempts/${attemptId}/progress`, {
        answers,
        time_spent: timeSpent
      });
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to save quiz progress');
      }
    } catch (error) {
      const errorDetails = ApiErrorHandler.handleError(error as ApiErrorResponse, {
        customMessage: 'Failed to save quiz progress'
      });
      throw error;
    }
  },

  // Get quiz attempt results with detailed breakdown
  getQuizAttemptResults: async (quizId: number, attemptId: number): Promise<QuizAttempt & { 
    question_results: Array<{
      question_id: number;
      question: string;
      student_answer: string;
      correct_answer: string;
      is_correct: boolean;
      explanation?: string;
    }>;
    performance_summary: {
      total_time: number;
      average_time_per_question: number;
      accuracy_percentage: number;
      passing_score: number;
      passed: boolean;
    };
  }> => {
    try {
      const response = await api.get<ApiResponse<QuizAttempt & { 
        question_results: Array<{
          question_id: number;
          question: string;
          student_answer: string;
          correct_answer: string;
          is_correct: boolean;
          explanation?: string;
        }>;
        performance_summary: {
          total_time: number;
          average_time_per_question: number;
          accuracy_percentage: number;
          passing_score: number;
          passed: boolean;
        };
      }>>(`/student/quizzes/${quizId}/attempts/${attemptId}/results`);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Failed to get quiz attempt results');
    } catch (error) {
      const errorDetails = ApiErrorHandler.handleError(error as ApiErrorResponse, {
        customMessage: 'Failed to get quiz attempt results'
      });
      throw error;
    }
  },

  // Get all quiz attempts for a specific quiz
  getQuizAttemptHistory: async (quizId: number): Promise<PaginatedResponse<QuizAttempt>> => {
    try {
      const response = await api.get<PaginatedResponse<QuizAttempt>>(`/student/quizzes/${quizId}/attempts/my`);
      
      if (response.data.success) {
        return response.data;
      }
      
      throw new Error('Failed to get quiz attempt history');
    } catch (error) {
      const errorDetails = ApiErrorHandler.handleError(error as ApiErrorResponse, {
        customMessage: 'Failed to get quiz attempt history'
      });
      throw error;
    }
  },

  // Get all quiz attempts across all quizzes
  getAllQuizAttempts: async (page = 1): Promise<PaginatedResponse<QuizAttempt>> => {
    try {
      const response = await api.get<PaginatedResponse<QuizAttempt>>(`/student/quizzes/attempts/my?page=${page}`);
      
      if (response.data.success) {
        return response.data;
      }
      
      throw new Error('Failed to get all quiz attempts');
    } catch (error) {
      const errorDetails = ApiErrorHandler.handleError(error as ApiErrorResponse, {
        customMessage: 'Failed to get all quiz attempts'
      });
      throw error;
    }
  },

  // Get student progress summary
  getProgressSummary: async (): Promise<{
    overall_progress: {
      total_quizzes_available: number;
      quizzes_completed: number;
      total_meetings_available: number;
      meetings_attended: number;
      average_quiz_score: number;
      completion_percentage: number;
    };
    recent_activity: Array<{
      type: 'quiz_attempt' | 'meeting_attendance';
      title: string;
      date: string;
      score?: number;
      status: string;
    }>;
    achievements: Array<{
      id: number;
      title: string;
      description: string;
      earned_at: string;
      badge_icon?: string;
    }>;
  }> => {
    try {
      const response = await api.get<ApiResponse<{
        overall_progress: {
          total_quizzes_available: number;
          quizzes_completed: number;
          total_meetings_available: number;
          meetings_attended: number;
          average_quiz_score: number;
          completion_percentage: number;
        };
        recent_activity: Array<{
          type: 'quiz_attempt' | 'meeting_attendance';
          title: string;
          date: string;
          score?: number;
          status: string;
        }>;
        achievements: Array<{
          id: number;
          title: string;
          description: string;
          earned_at: string;
          badge_icon?: string;
        }>;
      }>>('/student/progress/summary');
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Failed to get progress summary');
    } catch (error) {
      const errorDetails = ApiErrorHandler.handleError(error as ApiErrorResponse, {
        customMessage: 'Failed to get progress summary'
      });
      throw error;
    }
  },

  // Update student profile
  updateProfile: async (profileData: {
    name?: string;
    phone?: string;
    preferred_language?: 'ar' | 'en' | 'es';
    profile_image?: File;
  }): Promise<User> => {
    try {
      const formData = new FormData();
      
      if (profileData.name) formData.append('name', profileData.name);
      if (profileData.phone) formData.append('phone', profileData.phone);
      if (profileData.preferred_language) formData.append('preferred_language', profileData.preferred_language);
      if (profileData.profile_image) formData.append('profile_image', profileData.profile_image);
      
      const response = await api.post<ApiResponse<User>>('/student/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Failed to update profile');
    } catch (error) {
      const errorDetails = ApiErrorHandler.handleError(error as ApiErrorResponse, {
        customMessage: 'Failed to update profile'
      });
      throw error;
    }
  },

  // Cancel enrollment request
  cancelEnrollmentRequest: async (enrollmentId: number): Promise<void> => {
    try {
      const response = await api.delete<ApiResponse<void>>(`/student/enrollments/${enrollmentId}`);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to cancel enrollment request');
      }
    } catch (error) {
      const errorDetails = ApiErrorHandler.handleError(error as ApiErrorResponse, {
        customMessage: 'Failed to cancel enrollment request'
      });
      throw error;
    }
  },
};