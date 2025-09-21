import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { teacherService } from '../services/teacherService';
import type { Program, Quiz, Meeting } from '../types/api';

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