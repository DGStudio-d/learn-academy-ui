import api from '../lib/api';
import type { 
  ApiResponse, 
  Language,
  User,
  Quiz,
  QuizAttempt,
  AdminSettings,
  ApiErrorResponse
} from '../types/api';
import { ApiErrorHandler } from '../lib/errorHandler';

export const guestService = {
  // Get admin settings to check guest access permissions
  getGuestSettings: async (): Promise<AdminSettings> => {
    try {
      const response = await api.get<ApiResponse<AdminSettings>>('/guest/settings');
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Failed to get guest settings');
    } catch (error) {
      const errorDetails = ApiErrorHandler.handleError(error as ApiErrorResponse, {
        customMessage: 'Failed to get guest settings'
      });
      throw error;
    }
  },

  // Get public languages (if guest access is enabled)
  getLanguages: async (): Promise<Language[]> => {
    try {
      const response = await api.get<ApiResponse<Language[]>>('/guest/languages');
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Failed to get languages');
    } catch (error) {
      const errorDetails = ApiErrorHandler.handleError(error as ApiErrorResponse, {
        customMessage: 'Failed to get languages'
      });
      throw error;
    }
  },

  // Get public teachers (if guest access is enabled)
  getTeachers: async (): Promise<User[]> => {
    const response = await api.get<ApiResponse<User[]>>('/guest/teachers');
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data.message || 'Failed to get teachers');
  },

  // Get teacher details (if guest access is enabled)
  getTeacher: async (teacherId: number): Promise<User> => {
    const response = await api.get<ApiResponse<User>>(`/guest/teachers/${teacherId}`);
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data.message || 'Failed to get teacher');
  },

  // Get public quizzes (if guest access is enabled)
  getQuizzes: async (): Promise<Quiz[]> => {
    const response = await api.get<ApiResponse<Quiz[]>>('/guest/quizzes');
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data.message || 'Failed to get quizzes');
  },

  // Get quiz details for guests
  getQuiz: async (quizId: number): Promise<Quiz> => {
    const response = await api.get<ApiResponse<Quiz>>(`/guest/quizzes/${quizId}`);
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data.message || 'Failed to get quiz');
  },

  // Submit guest quiz attempt
  submitQuizAttempt: async (quizId: number, attemptData: {
    guest_name: string;
    guest_email?: string;
    answers: Record<string, number>;
  }): Promise<QuizAttempt> => {
    const response = await api.post<ApiResponse<QuizAttempt>>(`/guest/quizzes/${quizId}/attempt`, attemptData);
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data.message || 'Failed to submit quiz attempt');
  },

  // Get quiz attempt result (for guests)
  getQuizAttempt: async (attemptId: number): Promise<QuizAttempt> => {
    const response = await api.get<ApiResponse<QuizAttempt>>(`/guest/quiz-attempts/${attemptId}`);
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data.message || 'Failed to get quiz attempt');
  },

  // Legacy endpoints for compatibility
  
  // Legacy: Start guest quiz
  startGuestQuiz: async (quizId: number, guestName: string, guestEmail?: string): Promise<{
    attempt_id: number;
    quiz: Quiz;
  }> => {
    const response = await api.post<ApiResponse<{
      attempt_id: number;
      quiz: Quiz;
    }>>(`/guest/quiz/${quizId}/start`, {
      guest_name: guestName,
      guest_email: guestEmail
    });
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data.message || 'Failed to start guest quiz');
  },

  // Legacy: Submit guest quiz
  submitGuestQuiz: async (quizId: number, attemptData: {
    guest_name: string;
    guest_email?: string;
    answers: Record<string, number>;
  }): Promise<QuizAttempt> => {
    const response = await api.post<ApiResponse<QuizAttempt>>(`/guest/quiz/${quizId}/submit`, attemptData);
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data.message || 'Failed to submit guest quiz');
  },

  // Legacy: Get guest quiz result
  getGuestQuizResult: async (attemptId: number): Promise<QuizAttempt> => {
    const response = await api.get<ApiResponse<QuizAttempt>>(`/guest/quiz-result/${attemptId}`);
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data.message || 'Failed to get quiz result');
  },
};