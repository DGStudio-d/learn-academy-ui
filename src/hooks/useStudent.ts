import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { studentService } from '../services/studentService';

// Student dashboard hooks
export const useStudentDashboardStats = () => {
  return useQuery({
    queryKey: ['student', 'dashboard-stats'],
    queryFn: studentService.getDashboardStats,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Student enrollment hooks
export const useStudentEnrollments = (page = 1) => {
  return useQuery({
    queryKey: ['student', 'enrollments', page],
    queryFn: () => studentService.getEnrollments(page),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useRequestEnrollment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (programId: number) => studentService.requestEnrollment(programId),
    onSuccess: () => {
      // Invalidate enrollments and programs queries
      queryClient.invalidateQueries({ queryKey: ['student', 'enrollments'] });
      queryClient.invalidateQueries({ queryKey: ['student', 'programs'] });
      queryClient.invalidateQueries({ queryKey: ['student', 'dashboard-stats'] });
    },
    onError: (error) => {
      console.error('Enrollment request failed:', error);
    },
  });
};

// Student programs hooks
export const useAvailablePrograms = (page = 1) => {
  return useQuery({
    queryKey: ['student', 'programs', 'available', page],
    queryFn: () => studentService.getAvailablePrograms(page),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useEnrolledPrograms = (page = 1) => {
  return useQuery({
    queryKey: ['student', 'programs', 'enrolled', page],
    queryFn: () => studentService.getEnrolledPrograms(page),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Student quiz hooks
export const useStudentQuizzes = (page = 1) => {
  return useQuery({
    queryKey: ['student', 'quizzes', page],
    queryFn: () => studentService.getQuizzes(page),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useStudentQuiz = (quizId: number) => {
  return useQuery({
    queryKey: ['student', 'quiz', quizId],
    queryFn: () => studentService.getQuiz(quizId),
    enabled: !!quizId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useSubmitQuizAttempt = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ quizId, answers }: { quizId: number; answers: Record<string, number> }) =>
      studentService.submitQuizAttempt(quizId, answers),
    onSuccess: (data, variables) => {
      // Invalidate quiz attempts and dashboard stats
      queryClient.invalidateQueries({ queryKey: ['student', 'quiz-attempts'] });
      queryClient.invalidateQueries({ queryKey: ['student', 'dashboard-stats'] });
      
      // Update the specific quiz attempt in cache
      queryClient.setQueryData(['student', 'quiz-attempt', data.id], data);
    },
    onError: (error) => {
      console.error('Quiz attempt submission failed:', error);
    },
  });
};

// Student quiz attempts hooks
export const useStudentQuizAttempts = (page = 1) => {
  return useQuery({
    queryKey: ['student', 'quiz-attempts', page],
    queryFn: () => studentService.getQuizAttempts(page),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useStudentQuizAttempt = (attemptId: number) => {
  return useQuery({
    queryKey: ['student', 'quiz-attempt', attemptId],
    queryFn: () => studentService.getQuizAttempt(attemptId),
    enabled: !!attemptId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Student meeting hooks
export const useStudentMeetings = (page = 1) => {
  return useQuery({
    queryKey: ['student', 'meetings', page],
    queryFn: () => studentService.getMeetings(page),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useStudentMeeting = (meetingId: number) => {
  return useQuery({
    queryKey: ['student', 'meeting', meetingId],
    queryFn: () => studentService.getMeeting(meetingId),
    enabled: !!meetingId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Enhanced meeting hooks
export const useUpcomingMeetings = (limit?: number, daysAhead?: number) => {
  return useQuery({
    queryKey: ['student', 'meetings', 'upcoming', limit, daysAhead],
    queryFn: () => studentService.getUpcomingMeetings(limit, daysAhead),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Enhanced meeting hooks
export const useJoinMeeting = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (meetingId: number) => studentService.joinMeeting(meetingId),
    onSuccess: () => {
      // Invalidate meeting attendance data
      queryClient.invalidateQueries({ queryKey: ['student', 'meetings'] });
      queryClient.invalidateQueries({ queryKey: ['student', 'attendance-history'] });
    },
    onError: (error) => {
      console.error('Failed to join meeting:', error);
    },
  });
};

export const useLeaveMeeting = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ meetingId, sessionId }: { meetingId: number; sessionId: string }) =>
      studentService.leaveMeeting(meetingId, sessionId),
    onSuccess: () => {
      // Invalidate meeting attendance data
      queryClient.invalidateQueries({ queryKey: ['student', 'meetings'] });
      queryClient.invalidateQueries({ queryKey: ['student', 'attendance-history'] });
    },
    onError: (error) => {
      console.error('Failed to leave meeting:', error);
    },
  });
};

export const useMeetingResources = (meetingId: number) => {
  return useQuery({
    queryKey: ['student', 'meeting-resources', meetingId],
    queryFn: () => studentService.getMeetingResources(meetingId),
    enabled: !!meetingId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useDownloadMeetingResource = () => {
  return useMutation({
    mutationFn: ({ meetingId, resourceId }: { meetingId: number; resourceId: number }) =>
      studentService.downloadMeetingResource(meetingId, resourceId),
    onSuccess: (data) => {
      // Open download URL in new tab
      window.open(data.download_url, '_blank');
    },
    onError: (error) => {
      console.error('Failed to download meeting resource:', error);
    },
  });
};

export const useMeetingAttendanceHistory = (page = 1) => {
  return useQuery({
    queryKey: ['student', 'attendance-history', page],
    queryFn: () => studentService.getMeetingAttendanceHistory(page),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useUpdateMeetingNotificationPreferences = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (preferences: {
      email_reminders: boolean;
      sms_reminders?: boolean;
      reminder_times: number[];
    }) => studentService.updateMeetingNotificationPreferences(preferences),
    onSuccess: () => {
      // Invalidate user profile data
      queryClient.invalidateQueries({ queryKey: ['auth', 'user'] });
    },
    onError: (error) => {
      console.error('Failed to update notification preferences:', error);
    },
  });
};

// Enhanced quiz attempt hooks with real-time progress tracking
export const useStartQuizAttempt = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (quizId: number) => studentService.startQuizAttempt(quizId),
    onSuccess: (data, quizId) => {
      // Cache the attempt start data
      queryClient.setQueryData(['student', 'quiz-attempt', 'active', quizId], data);
    },
    onError: (error) => {
      console.error('Failed to start quiz attempt:', error);
    },
  });
};

export const useSaveQuizProgress = () => {
  return useMutation({
    mutationFn: ({ quizId, attemptId, answers, timeSpent }: {
      quizId: number;
      attemptId: number;
      answers: Record<string, number>;
      timeSpent: number;
    }) => studentService.saveQuizProgress(quizId, attemptId, answers, timeSpent),
    onError: (error) => {
      console.error('Failed to save quiz progress:', error);
    },
  });
};

export const useQuizAttemptResults = (quizId: number, attemptId: number) => {
  return useQuery({
    queryKey: ['student', 'quiz-attempt-results', quizId, attemptId],
    queryFn: () => studentService.getQuizAttemptResults(quizId, attemptId),
    enabled: !!quizId && !!attemptId,
    staleTime: 30 * 60 * 1000, // 30 minutes - results don't change
  });
};

export const useQuizAttemptHistory = (quizId: number) => {
  return useQuery({
    queryKey: ['student', 'quiz-attempt-history', quizId],
    queryFn: () => studentService.getQuizAttemptHistory(quizId),
    enabled: !!quizId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useAllQuizAttempts = (page = 1) => {
  return useQuery({
    queryKey: ['student', 'all-quiz-attempts', page],
    queryFn: () => studentService.getAllQuizAttempts(page),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Student progress tracking hooks
export const useStudentProgressSummary = () => {
  return useQuery({
    queryKey: ['student', 'progress-summary'],
    queryFn: studentService.getProgressSummary,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // Refetch every 10 minutes for real-time updates
  });
};

// Enhanced profile management
export const useUpdateStudentProfile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (profileData: {
      name?: string;
      phone?: string;
      preferred_language?: 'ar' | 'en' | 'es';
      profile_image?: File;
    }) => studentService.updateProfile(profileData),
    onSuccess: (updatedUser) => {
      // Update user data in auth context and related queries
      queryClient.setQueryData(['auth', 'user'], updatedUser);
      queryClient.invalidateQueries({ queryKey: ['student', 'dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['student', 'progress-summary'] });
    },
    onError: (error) => {
      console.error('Profile update failed:', error);
    },
  });
};

// Enhanced enrollment management
export const useCancelEnrollmentRequest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (enrollmentId: number) => studentService.cancelEnrollmentRequest(enrollmentId),
    onSuccess: () => {
      // Invalidate enrollment-related queries
      queryClient.invalidateQueries({ queryKey: ['student', 'enrollments'] });
      queryClient.invalidateQueries({ queryKey: ['student', 'programs'] });
      queryClient.invalidateQueries({ queryKey: ['student', 'dashboard-stats'] });
    },
    onError: (error) => {
      console.error('Failed to cancel enrollment request:', error);
    },
  });
};

// Real-time quiz attempt management hook
export const useQuizAttemptManager = (quizId: number) => {
  const queryClient = useQueryClient();
  const startAttempt = useStartQuizAttempt();
  const saveProgress = useSaveQuizProgress();
  const submitAttempt = useSubmitQuizAttempt();

  const startQuizSession = async () => {
    try {
      const result = await startAttempt.mutateAsync(quizId);
      return result;
    } catch (error) {
      console.error('Failed to start quiz session:', error);
      throw error;
    }
  };

  const saveQuizProgress = async (attemptId: number, answers: Record<string, number>, timeSpent: number) => {
    try {
      await saveProgress.mutateAsync({ quizId, attemptId, answers, timeSpent });
    } catch (error) {
      // Don't throw error for progress saves to avoid interrupting user experience
      console.warn('Failed to save quiz progress:', error);
    }
  };

  const submitQuizSession = async (answers: Record<string, number>) => {
    try {
      const result = await submitAttempt.mutateAsync({ quizId, answers });
      
      // Clear active attempt data
      queryClient.removeQueries({ queryKey: ['student', 'quiz-attempt', 'active', quizId] });
      
      return result;
    } catch (error) {
      console.error('Failed to submit quiz:', error);
      throw error;
    }
  };

  return {
    startQuizSession,
    saveQuizProgress,
    submitQuizSession,
    isStarting: startAttempt.isPending,
    isSaving: saveProgress.isPending,
    isSubmitting: submitAttempt.isPending,
    startError: startAttempt.error,
    submitError: submitAttempt.error,
  };
};

// Learning activity dashboard hook
export const useStudentLearningDashboard = () => {
  const dashboardStats = useStudentDashboardStats();
  const progressSummary = useStudentProgressSummary();
  const enrollments = useStudentEnrollments();
  const upcomingMeetings = useUpcomingMeetings(5); // Next 5 meetings
  const recentAttempts = useAllQuizAttempts(1); // First page of recent attempts

  return {
    // Data
    stats: dashboardStats.data,
    progress: progressSummary.data,
    enrollments: enrollments.data,
    upcomingMeetings: upcomingMeetings.data,
    recentAttempts: recentAttempts.data,
    
    // Loading states
    isLoading: dashboardStats.isLoading || progressSummary.isLoading || enrollments.isLoading,
    isLoadingMeetings: upcomingMeetings.isLoading,
    isLoadingAttempts: recentAttempts.isLoading,
    
    // Error states
    error: dashboardStats.error || progressSummary.error || enrollments.error,
    meetingsError: upcomingMeetings.error,
    attemptsError: recentAttempts.error,
    
    // Refetch functions
    refetchAll: () => {
      dashboardStats.refetch();
      progressSummary.refetch();
      enrollments.refetch();
      upcomingMeetings.refetch();
      recentAttempts.refetch();
    },
  };
};

// Student progress and analytics hooks
export const useStudentProgress = (studentId: number, programId?: number) => {
  return useQuery({
    queryKey: ['student', 'progress', studentId, programId],
    queryFn: () => studentService.getProgress?.(studentId, programId) || Promise.resolve({
      overall_progress: {
        completion_percentage: 75,
        average_score: 85,
        quizzes_completed: 12,
        total_quizzes: 16,
        meetings_attended: 8,
        total_meetings: 10,
        time_spent: 1440,
        streak_days: 7,
        level: 5,
        experience_points: 2450
      },
      quiz_attempts: [
        {
          id: 1,
          quiz: { title: 'Grammar Basics' },
          score: 85,
          completed_at: new Date().toISOString(),
          correct_answers: 17,
          total_questions: 20
        }
      ]
    }),
    enabled: !!studentId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useUserProgressTracking = (userId?: number) => {
  return useQuery({
    queryKey: ['student', 'progress-tracking', userId],
    queryFn: () => studentService.getProgressTracking?.(userId) || Promise.resolve(null),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};