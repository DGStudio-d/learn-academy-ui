import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { teacherService } from '../services/teacherService';
import type { Program, Quiz, Meeting, User } from '../types/api';

// Export useTeacher for compatibility
export const useTeacher = () => {
  return useQuery({
    queryKey: ['teacher', 'profile'],
    queryFn: () => teacherService.getProfile(),
  });
};

// Teacher dashboard hooks
export const useTeacherDashboardStats = () => {
  return useQuery({
    queryKey: ['teacher', 'dashboard-stats'],
    queryFn: teacherService.getDashboardStats,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Teacher profile hooks
export const useTeacherProfile = () => {
  return useQuery({
    queryKey: ['teacher', 'profile'],
    queryFn: teacherService.getProfile,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useUpdateTeacherProfile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: teacherService.updateProfile,
    onSuccess: (data) => {
      // Update cached profile data
      queryClient.setQueryData(['teacher', 'profile'], data);
      queryClient.setQueryData(['auth', 'user'], data);
    },
    onError: (error) => {
      console.error('Teacher profile update failed:', error);
    },
  });
};

// Teacher languages hooks
export const useTeacherLanguages = () => {
  return useQuery({
    queryKey: ['teacher', 'languages'],
    queryFn: teacherService.getLanguages,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Teacher programs hooks
export const useTeacherPrograms = (page = 1) => {
  return useQuery({
    queryKey: ['teacher', 'programs', page],
    queryFn: () => teacherService.getPrograms(page),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCreateProgram = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: teacherService.createProgram,
    onSuccess: () => {
      // Invalidate programs list
      queryClient.invalidateQueries({ queryKey: ['teacher', 'programs'] });
      queryClient.invalidateQueries({ queryKey: ['teacher', 'dashboard-stats'] });
    },
    onError: (error) => {
      console.error('Program creation failed:', error);
    },
  });
};

export const useUpdateProgram = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ programId, programData }: { programId: number; programData: Partial<Program> }) =>
      teacherService.updateProgram(programId, programData),
    onSuccess: (data, variables) => {
      // Update the specific program in cache
      queryClient.setQueryData(['teacher', 'program', variables.programId], data);
      // Invalidate programs list
      queryClient.invalidateQueries({ queryKey: ['teacher', 'programs'] });
    },
    onError: (error) => {
      console.error('Program update failed:', error);
    },
  });
};

export const useDeleteProgram = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: teacherService.deleteProgram,
    onSuccess: () => {
      // Invalidate programs list
      queryClient.invalidateQueries({ queryKey: ['teacher', 'programs'] });
      queryClient.invalidateQueries({ queryKey: ['teacher', 'dashboard-stats'] });
    },
    onError: (error) => {
      console.error('Program deletion failed:', error);
    },
  });
};

// Teacher quiz hooks
export const useTeacherQuizzes = (page = 1) => {
  return useQuery({
    queryKey: ['teacher', 'quizzes', page],
    queryFn: () => teacherService.getQuizzes(page),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useTeacherQuiz = (quizId: number) => {
  return useQuery({
    queryKey: ['teacher', 'quiz', quizId],
    queryFn: () => teacherService.getQuiz(quizId),
    enabled: !!quizId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useCreateQuiz = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: teacherService.createQuiz,
    onSuccess: () => {
      // Invalidate quizzes list
      queryClient.invalidateQueries({ queryKey: ['teacher', 'quizzes'] });
      queryClient.invalidateQueries({ queryKey: ['teacher', 'dashboard-stats'] });
    },
    onError: (error) => {
      console.error('Quiz creation failed:', error);
    },
  });
};

export const useUpdateQuiz = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ quizId, quizData }: { quizId: number; quizData: Partial<Quiz> }) =>
      teacherService.updateQuiz(quizId, quizData),
    onSuccess: (data, variables) => {
      // Update the specific quiz in cache
      queryClient.setQueryData(['teacher', 'quiz', variables.quizId], data);
      // Invalidate quizzes list
      queryClient.invalidateQueries({ queryKey: ['teacher', 'quizzes'] });
    },
    onError: (error) => {
      console.error('Quiz update failed:', error);
    },
  });
};

export const useDeleteQuiz = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: teacherService.deleteQuiz,
    onSuccess: () => {
      // Invalidate quizzes list
      queryClient.invalidateQueries({ queryKey: ['teacher', 'quizzes'] });
      queryClient.invalidateQueries({ queryKey: ['teacher', 'dashboard-stats'] });
    },
    onError: (error) => {
      console.error('Quiz deletion failed:', error);
    },
  });
};

// Teacher quiz attempts hooks
export const useTeacherQuizAttempts = (quizId?: number, page = 1) => {
  return useQuery({
    queryKey: ['teacher', 'quiz-attempts', quizId, page],
    queryFn: () => teacherService.getQuizAttempts(quizId, page),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Teacher meeting hooks
export const useTeacherMeetings = (page = 1) => {
  return useQuery({
    queryKey: ['teacher', 'meetings', page],
    queryFn: () => teacherService.getMeetings(page),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCreateMeeting = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: teacherService.createMeeting,
    onSuccess: () => {
      // Invalidate meetings list
      queryClient.invalidateQueries({ queryKey: ['teacher', 'meetings'] });
      queryClient.invalidateQueries({ queryKey: ['teacher', 'dashboard-stats'] });
    },
    onError: (error) => {
      console.error('Meeting creation failed:', error);
    },
  });
};

export const useUpdateMeeting = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ meetingId, meetingData }: { meetingId: number; meetingData: Partial<Meeting> }) =>
      teacherService.updateMeeting(meetingId, meetingData),
    onSuccess: (data, variables) => {
      // Update the specific meeting in cache
      queryClient.setQueryData(['teacher', 'meeting', variables.meetingId], data);
      // Invalidate meetings list
      queryClient.invalidateQueries({ queryKey: ['teacher', 'meetings'] });
    },
    onError: (error) => {
      console.error('Meeting update failed:', error);
    },
  });
};

export const useDeleteMeeting = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: teacherService.deleteMeeting,
    onSuccess: () => {
      // Invalidate meetings list
      queryClient.invalidateQueries({ queryKey: ['teacher', 'meetings'] });
      queryClient.invalidateQueries({ queryKey: ['teacher', 'dashboard-stats'] });
    },
    onError: (error) => {
      console.error('Meeting deletion failed:', error);
    },
  });
};

// Student tracking and progress monitoring hooks
export const useTeacherStudents = (programId?: number, page = 1) => {
  return useQuery({
    queryKey: ['teacher', 'students', programId, page],
    queryFn: () => teacherService.getStudents(programId, page),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useStudentProgress = (studentId: number, programId?: number) => {
  return useQuery({
    queryKey: ['teacher', 'student-progress', studentId, programId],
    queryFn: () => teacherService.getStudentProgress(studentId, programId),
    enabled: !!studentId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Content analytics hooks
export const useContentAnalytics = (filters?: {
  program_id?: number;
  language_id?: number;
  date_from?: string;
  date_to?: string;
}) => {
  return useQuery({
    queryKey: ['teacher', 'analytics', filters],
    queryFn: () => teacherService.getContentAnalytics(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Language-specific content filtering hooks
export const useContentByLanguage = (
  languageId: number, 
  contentType: 'programs' | 'quizzes' | 'meetings', 
  page = 1
) => {
  return useQuery({
    queryKey: ['teacher', 'content-by-language', languageId, contentType, page],
    queryFn: () => teacherService.getContentByLanguage(languageId, contentType, page),
    enabled: !!languageId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Meeting student management hooks
export const useAssignStudentsToMeeting = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ meetingId, studentIds }: { meetingId: number; studentIds: number[] }) =>
      teacherService.assignStudentsToMeeting(meetingId, studentIds),
    onSuccess: (_, variables) => {
      // Invalidate meeting attendees and meetings list
      queryClient.invalidateQueries({ queryKey: ['teacher', 'meeting-attendees', variables.meetingId] });
      queryClient.invalidateQueries({ queryKey: ['teacher', 'meetings'] });
    },
    onError: (error) => {
      console.error('Failed to assign students to meeting:', error);
    },
  });
};

export const useRemoveStudentsFromMeeting = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ meetingId, studentIds }: { meetingId: number; studentIds: number[] }) =>
      teacherService.removeStudentsFromMeeting(meetingId, studentIds),
    onSuccess: (_, variables) => {
      // Invalidate meeting attendees and meetings list
      queryClient.invalidateQueries({ queryKey: ['teacher', 'meeting-attendees', variables.meetingId] });
      queryClient.invalidateQueries({ queryKey: ['teacher', 'meetings'] });
    },
    onError: (error) => {
      console.error('Failed to remove students from meeting:', error);
    },
  });
};

export const useMeetingAttendees = (meetingId: number) => {
  return useQuery({
    queryKey: ['teacher', 'meeting-attendees', meetingId],
    queryFn: () => teacherService.getMeetingAttendees(meetingId),
    enabled: !!meetingId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Enhanced meeting management hooks
export const useMeetingAttendanceRecords = (meetingId: number) => {
  return useQuery({
    queryKey: ['teacher', 'meeting-attendance-records', meetingId],
    queryFn: () => teacherService.getMeetingAttendanceRecords(meetingId),
    enabled: !!meetingId,
    staleTime: 1 * 60 * 1000, // 1 minute for real-time tracking
  });
};

export const useStartMeetingRecording = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (meetingId: number) => teacherService.startMeetingRecording(meetingId),
    onSuccess: (_, meetingId) => {
      // Invalidate meeting session data
      queryClient.invalidateQueries({ queryKey: ['teacher', 'meeting-session', meetingId] });
    },
    onError: (error) => {
      console.error('Failed to start meeting recording:', error);
    },
  });
};

export const useStopMeetingRecording = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (meetingId: number) => teacherService.stopMeetingRecording(meetingId),
    onSuccess: (_, meetingId) => {
      // Invalidate meeting session data
      queryClient.invalidateQueries({ queryKey: ['teacher', 'meeting-session', meetingId] });
      queryClient.invalidateQueries({ queryKey: ['teacher', 'meetings'] });
    },
    onError: (error) => {
      console.error('Failed to stop meeting recording:', error);
    },
  });
};

export const useMeetingSession = (meetingId: number) => {
  return useQuery({
    queryKey: ['teacher', 'meeting-session', meetingId],
    queryFn: () => teacherService.getMeetingSession(meetingId),
    enabled: !!meetingId,
    staleTime: 30 * 1000, // 30 seconds for real-time updates
    refetchInterval: 30 * 1000, // Refetch every 30 seconds during active meetings
  });
};

export const useAddMeetingResource = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ meetingId, resourceData }: { 
      meetingId: number; 
      resourceData: {
        name: string;
        description?: string;
        file?: File;
        file_url?: string;
        file_type?: string;
        is_downloadable?: boolean;
      }
    }) => teacherService.addMeetingResource(meetingId, resourceData),
    onSuccess: (_, variables) => {
      // Invalidate meeting data to refresh resources
      queryClient.invalidateQueries({ queryKey: ['teacher', 'meeting', variables.meetingId] });
      queryClient.invalidateQueries({ queryKey: ['teacher', 'meetings'] });
    },
    onError: (error) => {
      console.error('Failed to add meeting resource:', error);
    },
  });
};

export const useRemoveMeetingResource = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ meetingId, resourceId }: { meetingId: number; resourceId: number }) =>
      teacherService.removeMeetingResource(meetingId, resourceId),
    onSuccess: (_, variables) => {
      // Invalidate meeting data to refresh resources
      queryClient.invalidateQueries({ queryKey: ['teacher', 'meeting', variables.meetingId] });
      queryClient.invalidateQueries({ queryKey: ['teacher', 'meetings'] });
    },
    onError: (error) => {
      console.error('Failed to remove meeting resource:', error);
    },
  });
};

export const useSendMeetingNotifications = () => {
  return useMutation({
    mutationFn: ({ meetingId, notificationData }: {
      meetingId: number;
      notificationData: {
        type: 'reminder' | 'started' | 'ended' | 'cancelled' | 'rescheduled';
        message?: string;
        recipient_ids?: number[];
      }
    }) => teacherService.sendMeetingNotifications(meetingId, notificationData),
    onError: (error) => {
      console.error('Failed to send meeting notifications:', error);
    },
  });
};

export const useMeetingNotifications = (meetingId: number) => {
  return useQuery({
    queryKey: ['teacher', 'meeting-notifications', meetingId],
    queryFn: () => teacherService.getMeetingNotifications(meetingId),
    enabled: !!meetingId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useUpdateMeetingReminders = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ meetingId, reminderSettings }: { 
      meetingId: number; 
      reminderSettings: any 
    }) => teacherService.updateMeetingReminders(meetingId, reminderSettings),
    onSuccess: (_, variables) => {
      // Invalidate meeting data
      queryClient.invalidateQueries({ queryKey: ['teacher', 'meeting', variables.meetingId] });
    },
    onError: (error) => {
      console.error('Failed to update meeting reminders:', error);
    },
  });
};

export const useMeetingCalendar = (startDate: string, endDate: string, programId?: number) => {
  return useQuery({
    queryKey: ['teacher', 'meeting-calendar', startDate, endDate, programId],
    queryFn: () => teacherService.getMeetingCalendar(startDate, endDate, programId),
    enabled: !!startDate && !!endDate,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Advanced quiz creation hook
export const useCreateAdvancedQuiz = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: teacherService.createAdvancedQuiz,
    onSuccess: () => {
      // Invalidate quizzes list and analytics
      queryClient.invalidateQueries({ queryKey: ['teacher', 'quizzes'] });
      queryClient.invalidateQueries({ queryKey: ['teacher', 'dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['teacher', 'analytics'] });
    },
    onError: (error) => {
      console.error('Advanced quiz creation failed:', error);
    },
  });
};

// Bulk operations hooks
export const useBulkUpdateQuizzes = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ quizIds, updates }: { quizIds: number[]; updates: Partial<Quiz> }) =>
      teacherService.bulkUpdateQuizzes(quizIds, updates),
    onSuccess: () => {
      // Invalidate all quiz-related queries
      queryClient.invalidateQueries({ queryKey: ['teacher', 'quizzes'] });
      queryClient.invalidateQueries({ queryKey: ['teacher', 'analytics'] });
    },
    onError: (error) => {
      console.error('Bulk quiz update failed:', error);
    },
  });
};

export const useBulkUpdateMeetings = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ meetingIds, updates }: { meetingIds: number[]; updates: Partial<Meeting> }) =>
      teacherService.bulkUpdateMeetings(meetingIds, updates),
    onSuccess: () => {
      // Invalidate all meeting-related queries
      queryClient.invalidateQueries({ queryKey: ['teacher', 'meetings'] });
      queryClient.invalidateQueries({ queryKey: ['teacher', 'analytics'] });
    },
    onError: (error) => {
      console.error('Bulk meeting update failed:', error);
    },
  });
};

// Export functionality hook
export const useExportStudentProgress = () => {
  return useMutation({
    mutationFn: teacherService.exportStudentProgress,
    onError: (error) => {
      console.error('Export student progress failed:', error);
    },
  });
};

// Combined hooks for better UX
export const useTeacherContentManagement = (languageId?: number) => {
  const programs = useContentByLanguage(languageId || 0, 'programs');
  const quizzes = useContentByLanguage(languageId || 0, 'quizzes');
  const meetings = useContentByLanguage(languageId || 0, 'meetings');
  
  return {
    programs,
    quizzes,
    meetings,
    isLoading: programs.isLoading || quizzes.isLoading || meetings.isLoading,
    error: programs.error || quizzes.error || meetings.error,
  };
};

export const useTeacherDashboardData = () => {
  const stats = useTeacherDashboardStats();
  const languages = useTeacherLanguages();
  const programs = useTeacherPrograms();
  const analytics = useContentAnalytics();
  
  return {
    stats,
    languages,
    programs,
    analytics,
    isLoading: stats.isLoading || languages.isLoading || programs.isLoading || analytics.isLoading,
    error: stats.error || languages.error || programs.error || analytics.error,
  };
};

// Additional analytics hooks for teachers
export const useQuizAnalytics = (quizId?: number, options?: {
  time_range?: string;
  include_questions?: boolean;
  include_students?: boolean;
}) => {
  return useQuery({
    queryKey: ['teacher', 'quiz-analytics', quizId, options],
    queryFn: () => teacherService.getQuizAnalytics?.(quizId, options) || Promise.resolve(null),
    enabled: !!quizId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useQuizPerformanceData = (quizId?: number) => {
  return useQuery({
    queryKey: ['teacher', 'quiz-performance', quizId],
    queryFn: () => teacherService.getQuizPerformanceData?.(quizId) || Promise.resolve(null),
    enabled: !!quizId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};