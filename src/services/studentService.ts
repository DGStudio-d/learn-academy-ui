import api from '../lib/api';
import type { 
  ApiResponse, 
  PaginatedResponse,
  Program,
  Quiz,
  QuizAttempt,
  Meeting,
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
    const response = await api.get<PaginatedResponse<Program>>(`/student/programs?page=${page}`);
    
    if (response.data.success) {
      return response.data;
    }
    
    throw new Error('Failed to get available programs');
  },

  // Get enrolled programs
  getEnrolledPrograms: async (page = 1): Promise<PaginatedResponse<Program>> => {
    const response = await api.get<PaginatedResponse<Program>>(`/student/enrolled-programs?page=${page}`);
    
    if (response.data.success) {
      return response.data;
    }
    
    throw new Error('Failed to get enrolled programs');
  },

  // Get available quizzes
  getQuizzes: async (page = 1): Promise<PaginatedResponse<Quiz>> => {
    const response = await api.get<PaginatedResponse<Quiz>>(`/student/quizzes?page=${page}`);
    
    if (response.data.success) {
      return response.data;
    }
    
    throw new Error('Failed to get quizzes');
  },

  // Get quiz details
  getQuiz: async (quizId: number): Promise<Quiz> => {
    const response = await api.get<ApiResponse<Quiz>>(`/student/quizzes/${quizId}`);
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data.message || 'Failed to get quiz');
  },

  // Submit quiz attempt
  submitQuizAttempt: async (quizId: number, answers: Record<string, number>): Promise<QuizAttempt> => {
    const response = await api.post<ApiResponse<QuizAttempt>>(`/student/quizzes/${quizId}/attempt`, {
      answers
    });
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data.message || 'Failed to submit quiz attempt');
  },

  // Get quiz attempts history
  getQuizAttempts: async (page = 1): Promise<PaginatedResponse<QuizAttempt>> => {
    const response = await api.get<PaginatedResponse<QuizAttempt>>(`/student/quiz-attempts?page=${page}`);
    
    if (response.data.success) {
      return response.data;
    }
    
    throw new Error('Failed to get quiz attempts');
  },

  // Get quiz attempt details
  getQuizAttempt: async (attemptId: number): Promise<QuizAttempt> => {
    const response = await api.get<ApiResponse<QuizAttempt>>(`/student/quiz-attempts/${attemptId}`);
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data.message || 'Failed to get quiz attempt');
  },

  // Get available meetings
  getMeetings: async (page = 1): Promise<PaginatedResponse<Meeting>> => {
    const response = await api.get<PaginatedResponse<Meeting>>(`/student/meetings?page=${page}`);
    
    if (response.data.success) {
      return response.data;
    }
    
    throw new Error('Failed to get meetings');
  },

  // Get meeting details
  getMeeting: async (meetingId: number): Promise<Meeting> => {
    const response = await api.get<ApiResponse<Meeting>>(`/student/meetings/${meetingId}`);
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data.message || 'Failed to get meeting');
  },
};