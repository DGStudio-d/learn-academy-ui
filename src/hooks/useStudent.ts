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
    mutationFn: studentService.requestEnrollment,
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