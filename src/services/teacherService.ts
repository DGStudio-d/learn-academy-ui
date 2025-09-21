import api from '../lib/api';
import type { 
  ApiResponse, 
  PaginatedResponse,
  Program,
  Quiz,
  QuizAttempt,
  Meeting,
  User,
  DashboardStats,
  Language,
  ApiErrorResponse
} from '../types/api';
import { ApiErrorHandler } from '../lib/errorHandler';

export const teacherService = {
  // Get teacher dashboard statistics
  getDashboardStats: async (): Promise<DashboardStats> => {
    try {
      const response = await api.get<ApiResponse<DashboardStats>>('/teacher/dashboard-stats');
      
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

  // Get teacher profile
  getProfile: async (): Promise<User> => {
    try {
      const response = await api.get<ApiResponse<User>>('/teacher/profile');
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Failed to get teacher profile');
    } catch (error) {
      const errorDetails = ApiErrorHandler.handleError(error as ApiErrorResponse, {
        customMessage: 'Failed to get teacher profile'
      });
      throw error;
    }
  },

  // Update teacher profile
  updateProfile: async (profileData: Partial<User>): Promise<User> => {
    const response = await api.put<ApiResponse<User>>('/teacher/profile', profileData);
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data.message || 'Failed to update profile');
  },

  // Get teacher's assigned languages
  getLanguages: async (): Promise<Language[]> => {
    const response = await api.get<ApiResponse<Language[]>>('/teacher/languages');
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data.message || 'Failed to get languages');
  },

  // Get teacher's programs
  getPrograms: async (page = 1): Promise<PaginatedResponse<Program>> => {
    const response = await api.get<PaginatedResponse<Program>>(`/teacher/programs?page=${page}`);
    
    if (response.data.success) {
      return response.data;
    }
    
    throw new Error('Failed to get programs');
  },

  // Create a new program
  createProgram: async (programData: {
    name: string;
    description?: string;
    language_id: number;
  }): Promise<Program> => {
    const response = await api.post<ApiResponse<Program>>('/teacher/programs', programData);
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data.message || 'Failed to create program');
  },

  // Update program
  updateProgram: async (programId: number, programData: Partial<Program>): Promise<Program> => {
    const response = await api.put<ApiResponse<Program>>(`/teacher/programs/${programId}`, programData);
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data.message || 'Failed to update program');
  },

  // Delete program
  deleteProgram: async (programId: number): Promise<void> => {
    const response = await api.delete<ApiResponse>(`/teacher/programs/${programId}`);
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to delete program');
    }
  },

  // Get teacher's quizzes
  getQuizzes: async (page = 1): Promise<PaginatedResponse<Quiz>> => {
    const response = await api.get<PaginatedResponse<Quiz>>(`/teacher/quizzes?page=${page}`);
    
    if (response.data.success) {
      return response.data;
    }
    
    throw new Error('Failed to get quizzes');
  },

  // Create a new quiz
  createQuiz: async (quizData: {
    title: string;
    description?: string;
    program_id: number;
    language_id: number;
    questions: Array<{
      question: string;
      answers: string[];
      correct_answer: number;
      explanation?: string;
    }>;
    time_limit?: number;
    max_attempts?: number;
    guest_can_access?: boolean;
  }): Promise<Quiz> => {
    const response = await api.post<ApiResponse<Quiz>>('/teacher/quizzes', quizData);
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data.message || 'Failed to create quiz');
  },

  // Get quiz details
  getQuiz: async (quizId: number): Promise<Quiz> => {
    const response = await api.get<ApiResponse<Quiz>>(`/teacher/quizzes/${quizId}`);
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data.message || 'Failed to get quiz');
  },

  // Update quiz
  updateQuiz: async (quizId: number, quizData: Partial<Quiz>): Promise<Quiz> => {
    const response = await api.put<ApiResponse<Quiz>>(`/teacher/quizzes/${quizId}`, quizData);
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data.message || 'Failed to update quiz');
  },

  // Delete quiz
  deleteQuiz: async (quizId: number): Promise<void> => {
    const response = await api.delete<ApiResponse>(`/teacher/quizzes/${quizId}`);
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to delete quiz');
    }
  },

  // Get quiz attempts for teacher's quizzes
  getQuizAttempts: async (quizId?: number, page = 1): Promise<PaginatedResponse<QuizAttempt>> => {
    const url = quizId 
      ? `/teacher/quiz-attempts?quiz_id=${quizId}&page=${page}`
      : `/teacher/quiz-attempts?page=${page}`;
      
    const response = await api.get<PaginatedResponse<QuizAttempt>>(url);
    
    if (response.data.success) {
      return response.data;
    }
    
    throw new Error('Failed to get quiz attempts');
  },

  // Get teacher's meetings
  getMeetings: async (page = 1): Promise<PaginatedResponse<Meeting>> => {
    const response = await api.get<PaginatedResponse<Meeting>>(`/teacher/meetings?page=${page}`);
    
    if (response.data.success) {
      return response.data;
    }
    
    throw new Error('Failed to get meetings');
  },

  // Create a new meeting
  createMeeting: async (meetingData: {
    title: string;
    description?: string;
    program_id: number;
    meeting_url: string;
    scheduled_at: string;
    duration?: number;
  }): Promise<Meeting> => {
    const response = await api.post<ApiResponse<Meeting>>('/teacher/meetings', meetingData);
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data.message || 'Failed to create meeting');
  },

  // Update meeting
  updateMeeting: async (meetingId: number, meetingData: Partial<Meeting>): Promise<Meeting> => {
    const response = await api.put<ApiResponse<Meeting>>(`/teacher/meetings/${meetingId}`, meetingData);
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data.message || 'Failed to update meeting');
  },

  // Delete meeting
  deleteMeeting: async (meetingId: number): Promise<void> => {
    const response = await api.delete<ApiResponse>(`/teacher/meetings/${meetingId}`);
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to delete meeting');
    }
  },
};