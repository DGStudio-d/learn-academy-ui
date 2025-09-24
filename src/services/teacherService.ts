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
  ApiErrorResponse,
  StudentProgress,
  ContentAnalytics,
  MeetingAttendance,
  MeetingAttendanceRecord,
  MeetingSession,
  MeetingParticipant,
  MeetingNotification,
  MeetingResource,
  RecurringPattern,
  ReminderSettings,
  AdvancedQuestion,
  QuizSettings,
  StudentProgressExportFilters
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

  // Create a new meeting with enhanced features
  createMeeting: async (meetingData: {
    title: string;
    description?: string;
    program_id: number;
    meeting_url: string;
    scheduled_at: string;
    duration?: number;
    recurring_pattern?: RecurringPattern;
    attendance_tracking_enabled?: boolean;
    notifications_enabled?: boolean;
    reminder_settings?: ReminderSettings;
    resources?: Array<{
      name: string;
      description?: string;
      file_url?: string;
      file_type?: string;
      is_downloadable?: boolean;
    }>;
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

  // Student tracking and progress monitoring
  getStudents: async (programId?: number, page = 1): Promise<PaginatedResponse<User>> => {
    try {
      const url = programId 
        ? `/teacher/students?program_id=${programId}&page=${page}`
        : `/teacher/students?page=${page}`;
        
      const response = await api.get<PaginatedResponse<User>>(url);
      
      if (response.data.success) {
        return response.data;
      }
      
      throw new Error('Failed to get students');
    } catch (error) {
      const errorDetails = ApiErrorHandler.handleError(error as ApiErrorResponse, {
        customMessage: 'Failed to get students'
      });
      throw error;
    }
  },

  // Get student progress for a specific student
  getStudentProgress: async (studentId: number, programId?: number): Promise<StudentProgress> => {
    try {
      const url = programId 
        ? `/teacher/students/${studentId}/progress?program_id=${programId}`
        : `/teacher/students/${studentId}/progress`;
        
      const response = await api.get<ApiResponse<any>>(url);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Failed to get student progress');
    } catch (error) {
      const errorDetails = ApiErrorHandler.handleError(error as ApiErrorResponse, {
        customMessage: 'Failed to get student progress'
      });
      throw error;
    }
  },

  // Get analytics for teacher's content
  getContentAnalytics: async (filters?: {
    program_id?: number;
    language_id?: number;
    date_from?: string;
    date_to?: string;
  }): Promise<ContentAnalytics> => {
    try {
      const params = new URLSearchParams();
      if (filters?.program_id) params.append('program_id', filters.program_id.toString());
      if (filters?.language_id) params.append('language_id', filters.language_id.toString());
      if (filters?.date_from) params.append('date_from', filters.date_from);
      if (filters?.date_to) params.append('date_to', filters.date_to);
      
      const response = await api.get<ApiResponse<any>>(`/teacher/analytics?${params.toString()}`);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Failed to get content analytics');
    } catch (error) {
      const errorDetails = ApiErrorHandler.handleError(error as ApiErrorResponse, {
        customMessage: 'Failed to get content analytics'
      });
      throw error;
    }
  },

  // Language-specific content filtering
  getContentByLanguage: async (languageId: number, contentType: 'programs' | 'quizzes' | 'meetings', page = 1): Promise<PaginatedResponse<Program | Quiz | Meeting>> => {
    try {
      const response = await api.get<PaginatedResponse<any>>(`/teacher/${contentType}?language_id=${languageId}&page=${page}`);
      
      if (response.data.success) {
        return response.data;
      }
      
      throw new Error(`Failed to get ${contentType} by language`);
    } catch (error) {
      const errorDetails = ApiErrorHandler.handleError(error as ApiErrorResponse, {
        customMessage: `Failed to get ${contentType} by language`
      });
      throw error;
    }
  },

  // Assign students to meetings
  assignStudentsToMeeting: async (meetingId: number, studentIds: number[]): Promise<void> => {
    try {
      const response = await api.post<ApiResponse>(`/teacher/meetings/${meetingId}/assign-students`, {
        student_ids: studentIds
      });
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to assign students to meeting');
      }
    } catch (error) {
      const errorDetails = ApiErrorHandler.handleError(error as ApiErrorResponse, {
        customMessage: 'Failed to assign students to meeting'
      });
      throw error;
    }
  },

  // Remove students from meeting
  removeStudentsFromMeeting: async (meetingId: number, studentIds: number[]): Promise<void> => {
    try {
      const response = await api.post<ApiResponse>(`/teacher/meetings/${meetingId}/remove-students`, {
        student_ids: studentIds
      });
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to remove students from meeting');
      }
    } catch (error) {
      const errorDetails = ApiErrorHandler.handleError(error as ApiErrorResponse, {
        customMessage: 'Failed to remove students from meeting'
      });
      throw error;
    }
  },

  // Get meeting attendees (legacy)
  getMeetingAttendees: async (meetingId: number): Promise<MeetingAttendance[]> => {
    try {
      const response = await api.get<ApiResponse<any>>(`/teacher/meetings/${meetingId}/attendees`);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Failed to get meeting attendees');
    } catch (error) {
      const errorDetails = ApiErrorHandler.handleError(error as ApiErrorResponse, {
        customMessage: 'Failed to get meeting attendees'
      });
      throw error;
    }
  },

  // Enhanced meeting attendance tracking
  getMeetingAttendanceRecords: async (meetingId: number): Promise<MeetingAttendanceRecord[]> => {
    try {
      const response = await api.get<ApiResponse<MeetingAttendanceRecord[]>>(`/teacher/meetings/${meetingId}/attendance-records`);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Failed to get meeting attendance records');
    } catch (error) {
      const errorDetails = ApiErrorHandler.handleError(error as ApiErrorResponse, {
        customMessage: 'Failed to get meeting attendance records'
      });
      throw error;
    }
  },

  // Start meeting recording
  startMeetingRecording: async (meetingId: number): Promise<{ recording_id: string; recording_url: string }> => {
    try {
      const response = await api.post<ApiResponse<{ recording_id: string; recording_url: string }>>(`/teacher/meetings/${meetingId}/start-recording`);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Failed to start meeting recording');
    } catch (error) {
      const errorDetails = ApiErrorHandler.handleError(error as ApiErrorResponse, {
        customMessage: 'Failed to start meeting recording'
      });
      throw error;
    }
  },

  // Stop meeting recording
  stopMeetingRecording: async (meetingId: number): Promise<{ recording_url: string; duration: number }> => {
    try {
      const response = await api.post<ApiResponse<{ recording_url: string; duration: number }>>(`/teacher/meetings/${meetingId}/stop-recording`);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Failed to stop meeting recording');
    } catch (error) {
      const errorDetails = ApiErrorHandler.handleError(error as ApiErrorResponse, {
        customMessage: 'Failed to stop meeting recording'
      });
      throw error;
    }
  },

  // Get meeting session data
  getMeetingSession: async (meetingId: number): Promise<MeetingSession> => {
    try {
      const response = await api.get<ApiResponse<MeetingSession>>(`/teacher/meetings/${meetingId}/session`);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Failed to get meeting session');
    } catch (error) {
      const errorDetails = ApiErrorHandler.handleError(error as ApiErrorResponse, {
        customMessage: 'Failed to get meeting session'
      });
      throw error;
    }
  },

  // Add meeting resources
  addMeetingResource: async (meetingId: number, resourceData: {
    name: string;
    description?: string;
    file?: File;
    file_url?: string;
    file_type?: string;
    is_downloadable?: boolean;
  }): Promise<MeetingResource> => {
    try {
      const formData = new FormData();
      formData.append('name', resourceData.name);
      if (resourceData.description) formData.append('description', resourceData.description);
      if (resourceData.file) formData.append('file', resourceData.file);
      if (resourceData.file_url) formData.append('file_url', resourceData.file_url);
      if (resourceData.file_type) formData.append('file_type', resourceData.file_type);
      if (resourceData.is_downloadable !== undefined) formData.append('is_downloadable', resourceData.is_downloadable.toString());

      const response = await api.post<ApiResponse<MeetingResource>>(`/teacher/meetings/${meetingId}/resources`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Failed to add meeting resource');
    } catch (error) {
      const errorDetails = ApiErrorHandler.handleError(error as ApiErrorResponse, {
        customMessage: 'Failed to add meeting resource'
      });
      throw error;
    }
  },

  // Remove meeting resource
  removeMeetingResource: async (meetingId: number, resourceId: number): Promise<void> => {
    try {
      const response = await api.delete<ApiResponse>(`/teacher/meetings/${meetingId}/resources/${resourceId}`);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to remove meeting resource');
      }
    } catch (error) {
      const errorDetails = ApiErrorHandler.handleError(error as ApiErrorResponse, {
        customMessage: 'Failed to remove meeting resource'
      });
      throw error;
    }
  },

  // Send meeting notifications
  sendMeetingNotifications: async (meetingId: number, notificationData: {
    type: 'reminder' | 'started' | 'ended' | 'cancelled' | 'rescheduled';
    message?: string;
    recipient_ids?: number[]; // If not provided, sends to all attendees
  }): Promise<void> => {
    try {
      const response = await api.post<ApiResponse>(`/teacher/meetings/${meetingId}/notifications`, notificationData);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to send meeting notifications');
      }
    } catch (error) {
      const errorDetails = ApiErrorHandler.handleError(error as ApiErrorResponse, {
        customMessage: 'Failed to send meeting notifications'
      });
      throw error;
    }
  },

  // Get meeting notifications
  getMeetingNotifications: async (meetingId: number): Promise<MeetingNotification[]> => {
    try {
      const response = await api.get<ApiResponse<MeetingNotification[]>>(`/teacher/meetings/${meetingId}/notifications`);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Failed to get meeting notifications');
    } catch (error) {
      const errorDetails = ApiErrorHandler.handleError(error as ApiErrorResponse, {
        customMessage: 'Failed to get meeting notifications'
      });
      throw error;
    }
  },

  // Update meeting reminder settings
  updateMeetingReminders: async (meetingId: number, reminderSettings: ReminderSettings): Promise<void> => {
    try {
      const response = await api.put<ApiResponse>(`/teacher/meetings/${meetingId}/reminders`, reminderSettings);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to update meeting reminders');
      }
    } catch (error) {
      const errorDetails = ApiErrorHandler.handleError(error as ApiErrorResponse, {
        customMessage: 'Failed to update meeting reminders'
      });
      throw error;
    }
  },

  // Get meeting calendar view data
  getMeetingCalendar: async (startDate: string, endDate: string, programId?: number): Promise<Meeting[]> => {
    try {
      const params = new URLSearchParams();
      params.append('start_date', startDate);
      params.append('end_date', endDate);
      if (programId) params.append('program_id', programId.toString());

      const response = await api.get<ApiResponse<Meeting[]>>(`/teacher/meetings/calendar?${params.toString()}`);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Failed to get meeting calendar');
    } catch (error) {
      const errorDetails = ApiErrorHandler.handleError(error as ApiErrorResponse, {
        customMessage: 'Failed to get meeting calendar'
      });
      throw error;
    }
  },

  // Enhanced quiz creation with advanced settings
  createAdvancedQuiz: async (quizData: {
    title: string;
    description?: string;
    program_id: number;
    language_id: number;
    questions: AdvancedQuestion[];
    settings: QuizSettings;
  }): Promise<Quiz> => {
    try {
      const response = await api.post<ApiResponse<Quiz>>('/teacher/quizzes/advanced', quizData);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Failed to create advanced quiz');
    } catch (error) {
      const errorDetails = ApiErrorHandler.handleError(error as ApiErrorResponse, {
        customMessage: 'Failed to create advanced quiz'
      });
      throw error;
    }
  },

  // Bulk operations for content management
  bulkUpdateQuizzes: async (quizIds: number[], updates: Partial<Quiz>): Promise<void> => {
    try {
      const response = await api.put<ApiResponse>('/teacher/quizzes/bulk-update', {
        quiz_ids: quizIds,
        updates
      });
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to bulk update quizzes');
      }
    } catch (error) {
      const errorDetails = ApiErrorHandler.handleError(error as ApiErrorResponse, {
        customMessage: 'Failed to bulk update quizzes'
      });
      throw error;
    }
  },

  bulkUpdateMeetings: async (meetingIds: number[], updates: Partial<Meeting>): Promise<void> => {
    try {
      const response = await api.put<ApiResponse>('/teacher/meetings/bulk-update', {
        meeting_ids: meetingIds,
        updates
      });
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to bulk update meetings');
      }
    } catch (error) {
      const errorDetails = ApiErrorHandler.handleError(error as ApiErrorResponse, {
        customMessage: 'Failed to bulk update meetings'
      });
      throw error;
    }
  },

  // Export student progress data
  exportStudentProgress: async (filters?: StudentProgressExportFilters): Promise<{ download_url: string }> => {
    try {
      const response = await api.post<ApiResponse<{ download_url: string }>>('/teacher/export/student-progress', filters);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Failed to export student progress');
    } catch (error) {
      const errorDetails = ApiErrorHandler.handleError(error as ApiErrorResponse, {
        customMessage: 'Failed to export student progress'
      });
      throw error;
    }
  },
};