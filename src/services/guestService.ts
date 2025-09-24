import api from '../lib/api';
import type { 
  ApiResponse, 
  Language,
  User,
  Quiz,
  QuizAttempt,
  AdminSettings,
  ApiErrorResponse,
  Program,
  PaginatedResponse
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
      // Return fallback settings instead of throwing error
      console.warn('Guest settings API not available, using fallback');
      return {
        guest_can_access_languages: true,
        guest_can_access_teachers: true,  
        guest_can_access_programs: true,
        guest_can_access_quizzes: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as AdminSettings;
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
    try {
      const response = await api.get<ApiResponse<User[]>>('/guest/teachers');
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Failed to get teachers');
    } catch (error) {
      const errorDetails = ApiErrorHandler.handleError(error as ApiErrorResponse, {
        customMessage: 'Failed to get teachers'
      });
      throw error;
    }
  },

  // Get teacher details (if guest access is enabled)
  getTeacher: async (teacherId: number): Promise<User> => {
    try {
      const response = await api.get<ApiResponse<User>>(`/guest/teachers/${teacherId}`);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Failed to get teacher');
    } catch (error) {
      const errorDetails = ApiErrorHandler.handleError(error as ApiErrorResponse, {
        customMessage: 'Failed to get teacher'
      });
      throw error;
    }
  },

  // Get public quizzes (if guest access is enabled)
  getQuizzes: async (): Promise<Quiz[]> => {
    try {
      const response = await api.get<ApiResponse<Quiz[]>>('/guest/quizzes');
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Failed to get quizzes');
    } catch (error) {
      const errorDetails = ApiErrorHandler.handleError(error as ApiErrorResponse, {
        customMessage: 'Failed to get quizzes'
      });
      throw error;
    }
  },

  // Get quiz details for guests
  getQuiz: async (quizId: number): Promise<Quiz> => {
    try {
      const response = await api.get<ApiResponse<Quiz>>(`/guest/quizzes/${quizId}`);
      
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

  // Submit guest quiz attempt
  submitQuizAttempt: async (quizId: number, attemptData: {
    guest_name: string;
    guest_email?: string;
    answers: Record<string, number>;
  }): Promise<QuizAttempt> => {
    try {
      const response = await api.post<ApiResponse<QuizAttempt>>(`/guest/quizzes/${quizId}/attempt`, attemptData);
      
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

  // Get quiz attempt result (for guests)
  getQuizAttempt: async (attemptId: number): Promise<QuizAttempt> => {
    try {
      const response = await api.get<ApiResponse<QuizAttempt>>(`/guest/quiz-attempts/${attemptId}`);
      
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

  // Get public programs (if guest access is enabled)
  getPrograms: async (): Promise<Program[]> => {
    try {
      const response = await api.get<ApiResponse<Program[]>>('/guest/programs');
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Failed to get programs');
    } catch (error) {
      const errorDetails = ApiErrorHandler.handleError(error as ApiErrorResponse, {
        customMessage: 'Failed to get programs'
      });
      throw error;
    }
  },

  // Get program details (if guest access is enabled)
  getProgram: async (programId: number): Promise<Program> => {
    try {
      const response = await api.get<ApiResponse<Program>>(`/guest/programs/${programId}`);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Failed to get program');
    } catch (error) {
      const errorDetails = ApiErrorHandler.handleError(error as ApiErrorResponse, {
        customMessage: 'Failed to get program'
      });
      throw error;
    }
  },

  // Get public quizzes by program (if guest access is enabled)
  getQuizzesByProgram: async (programId: number): Promise<Quiz[]> => {
    try {
      const response = await api.get<ApiResponse<Quiz[]>>(`/guest/programs/${programId}/quizzes`);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Failed to get program quizzes');
    } catch (error) {
      const errorDetails = ApiErrorHandler.handleError(error as ApiErrorResponse, {
        customMessage: 'Failed to get program quizzes'
      });
      throw error;
    }
  },

  // Get public quizzes by language (if guest access is enabled)
  getQuizzesByLanguage: async (languageId: number): Promise<Quiz[]> => {
    try {
      const response = await api.get<ApiResponse<Quiz[]>>(`/guest/languages/${languageId}/quizzes`);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Failed to get language quizzes');
    } catch (error) {
      const errorDetails = ApiErrorHandler.handleError(error as ApiErrorResponse, {
        customMessage: 'Failed to get language quizzes'
      });
      throw error;
    }
  },

  // Check if guest can access specific content type
  canAccessContent: async (contentType: 'languages' | 'teachers' | 'programs' | 'quizzes'): Promise<boolean> => {
    try {
      const settings = await guestService.getGuestSettings();
      
      switch (contentType) {
        case 'languages':
          return settings.guest_can_access_languages ?? true;
        case 'teachers':
          return settings.guest_can_access_teachers ?? true;
        case 'programs':
          return settings.guest_can_access_programs ?? false;
        case 'quizzes':
          return settings.guest_can_access_quizzes ?? false;
        default:
          return false;
      }
    } catch (error) {
      // If we can't get settings, allow basic access to languages and teachers
      return contentType === 'languages' || contentType === 'teachers';
    }
  },

  // Legacy endpoints for compatibility
  
  // Legacy: Start guest quiz
  startGuestQuiz: async (quizId: number, guestName: string, guestEmail?: string): Promise<{
    attempt_id: number;
    quiz: Quiz;
  }> => {
    try {
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
    } catch (error) {
      const errorDetails = ApiErrorHandler.handleError(error as ApiErrorResponse, {
        customMessage: 'Failed to start guest quiz'
      });
      throw error;
    }
  },

  // Legacy: Submit guest quiz
  submitGuestQuiz: async (quizId: number, attemptData: {
    guest_name: string;
    guest_email?: string;
    answers: Record<string, number>;
  }): Promise<QuizAttempt> => {
    try {
      const response = await api.post<ApiResponse<QuizAttempt>>(`/guest/quiz/${quizId}/submit`, attemptData);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Failed to submit guest quiz');
    } catch (error) {
      const errorDetails = ApiErrorHandler.handleError(error as ApiErrorResponse, {
        customMessage: 'Failed to submit guest quiz'
      });
      throw error;
    }
  },

  // Legacy: Get guest quiz result
  getGuestQuizResult: async (attemptId: number): Promise<QuizAttempt> => {
    try {
      const response = await api.get<ApiResponse<QuizAttempt>>(`/guest/quiz-result/${attemptId}`);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Failed to get quiz result');
    } catch (error) {
      const errorDetails = ApiErrorHandler.handleError(error as ApiErrorResponse, {
        customMessage: 'Failed to get quiz result'
      });
      throw error;
    }
  },
};