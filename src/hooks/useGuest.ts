import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { guestService } from '../services/guestService';

// Fallback data for when API is not available
const FALLBACK_LANGUAGES = [
  { id: 1, name: 'English', code: 'en', is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 2, name: 'Arabic', code: 'ar', is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 3, name: 'Spanish', code: 'es', is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
];

const FALLBACK_TEACHERS = [
  {
    id: 1,
    name: 'Sarah Johnson',
    email: 'sarah@example.com',
    role: 'teacher' as const,
    phone: '+1234567890',
    preferred_language: 'en' as const,
    profile_image: 'https://images.unsplash.com/photo-1494790108755-2616b332c913?w=150&h=150&fit=crop&crop=face',
    email_verified_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 2,
    name: 'Ahmed Al-Rashid',
    email: 'ahmed@example.com',
    role: 'teacher' as const,
    phone: '+1234567891',
    preferred_language: 'ar' as const,
    profile_image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    email_verified_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 3,
    name: 'Maria Rodriguez',
    email: 'maria@example.com',
    role: 'teacher' as const,
    phone: '+1234567892',
    preferred_language: 'es' as const,
    profile_image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    email_verified_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const FALLBACK_SETTINGS = {
  guest_can_access_languages: true,
  guest_can_access_teachers: true,
  guest_can_access_quizzes: false,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

// Guest settings hooks
export const useGuestSettings = () => {
  return useQuery({
    queryKey: ['guest', 'settings'],
    queryFn: async () => {
      try {
        return await guestService.getGuestSettings();
      } catch (error) {
        console.warn('Guest settings API not available, using fallback data:', error);
        return FALLBACK_SETTINGS;
      }
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: false, // Don't retry on failure for guest access
  });
};

// Guest languages hooks
export const useGuestLanguages = () => {
  return useQuery({
    queryKey: ['guest', 'languages'],
    queryFn: async () => {
      try {
        return await guestService.getLanguages();
      } catch (error) {
        console.warn('Guest languages API not available, using fallback data:', error);
        return FALLBACK_LANGUAGES;
      }
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: false,
  });
};

// Guest teachers hooks
export const useGuestTeachers = () => {
  return useQuery({
    queryKey: ['guest', 'teachers'],
    queryFn: async () => {
      try {
        return await guestService.getTeachers();
      } catch (error) {
        console.warn('Guest teachers API not available, using fallback data:', error);
        return FALLBACK_TEACHERS;
      }
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: false,
  });
};

export const useGuestTeacher = (teacherId: number) => {
  return useQuery({
    queryKey: ['guest', 'teacher', teacherId],
    queryFn: async () => {
      try {
        return await guestService.getTeacher(teacherId);
      } catch (error) {
        console.warn('Guest teacher API not available, using fallback data:', error);
        // Return a fallback teacher based on ID
        return FALLBACK_TEACHERS.find(t => t.id === teacherId) || FALLBACK_TEACHERS[0];
      }
    },
    enabled: !!teacherId,
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: false,
  });
};

// Guest quiz hooks
export const useGuestQuizzes = () => {
  return useQuery({
    queryKey: ['guest', 'quizzes'],
    queryFn: async () => {
      try {
        return await guestService.getQuizzes();
      } catch (error) {
        console.warn('Guest quizzes API not available, returning empty array:', error);
        return [];
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
  });
};

export const useGuestQuiz = (quizId: number) => {
  return useQuery({
    queryKey: ['guest', 'quiz', quizId],
    queryFn: () => guestService.getQuiz(quizId),
    enabled: !!quizId,
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: false,
  });
};

export const useSubmitGuestQuizAttempt = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ quizId, attemptData }: { 
      quizId: number; 
      attemptData: {
        guest_name: string;
        guest_email?: string;
        answers: Record<string, number>;
      }
    }) => guestService.submitQuizAttempt(quizId, attemptData),
    onSuccess: (data) => {
      // Cache the quiz attempt result
      queryClient.setQueryData(['guest', 'quiz-attempt', data.id], data);
    },
    onError: (error) => {
      console.error('Guest quiz attempt submission failed:', error);
    },
  });
};

export const useGuestQuizAttempt = (attemptId: number) => {
  return useQuery({
    queryKey: ['guest', 'quiz-attempt', attemptId],
    queryFn: () => guestService.getQuizAttempt(attemptId),
    enabled: !!attemptId,
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: false,
  });
};

// Legacy guest quiz hooks for compatibility
export const useStartGuestQuiz = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ quizId, guestName, guestEmail }: { 
      quizId: number; 
      guestName: string; 
      guestEmail?: string;
    }) => guestService.startGuestQuiz(quizId, guestName, guestEmail),
    onSuccess: (data) => {
      // Cache the quiz data
      queryClient.setQueryData(['guest', 'quiz', data.quiz.id], data.quiz);
    },
    onError: (error) => {
      console.error('Start guest quiz failed:', error);
    },
  });
};

export const useSubmitGuestQuiz = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ quizId, attemptData }: { 
      quizId: number; 
      attemptData: {
        guest_name: string;
        guest_email?: string;
        answers: Record<string, number>;
      }
    }) => guestService.submitGuestQuiz(quizId, attemptData),
    onSuccess: (data) => {
      // Cache the quiz attempt result
      queryClient.setQueryData(['guest', 'quiz-result', data.id], data);
    },
    onError: (error) => {
      console.error('Submit guest quiz failed:', error);
    },
  });
};

export const useGuestQuizResult = (attemptId: number) => {
  return useQuery({
    queryKey: ['guest', 'quiz-result', attemptId],
    queryFn: () => guestService.getGuestQuizResult(attemptId),
    enabled: !!attemptId,
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: false,
  });
};