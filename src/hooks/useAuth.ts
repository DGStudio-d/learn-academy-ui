import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authService } from '../services/authService';
import { useAuth } from '../contexts/AuthContext';
import { AuthSecurityManager } from '../lib/authSecurity';
import type { LoginRequest, RegisterRequest, User } from '../types/api';
import { toast } from '@/hooks/use-toast';
import { getStoredUser } from '../lib/api';

// Auth hooks with enhanced security
export const useLogin = () => {
  const queryClient = useQueryClient();
  const { login: authLogin } = useAuth();
  
  return useMutation({
    mutationFn: async (credentials: LoginRequest) => {
      // Check for account lockout
      if (AuthSecurityManager.isAccountLocked(credentials.email)) {
        const remainingTime = AuthSecurityManager.getRemainingLockoutTime(credentials.email);
        const minutes = Math.ceil(remainingTime / (60 * 1000));
        throw new Error(`Account locked. Try again in ${minutes} minutes.`);
      }

      try {
        const result = await authService.login(credentials);
        
        // Clear failed attempts on successful login
        AuthSecurityManager.clearFailedAttempts(credentials.email);
        
        return result;
      } catch (error) {
        // Track failed attempt
        AuthSecurityManager.trackFailedAttempt(credentials.email);
        throw error;
      }
    },
    onSuccess: (data) => {
      // Update auth context with both user and token
      authLogin(data.user, data.token);
      
      // Update query cache with user data
      queryClient.setQueryData(['auth', 'user'], data.user);
      
      // Invalidate and refetch any queries that depend on auth state
      queryClient.invalidateQueries({ queryKey: ['auth'] });
      
      toast({
        title: 'Welcome back!',
        description: `Logged in as ${data.user.name}`,
      });
    },
    onError: (error: any) => {
      console.error('Login failed:', error);
      toast({
        title: 'Login failed',
        description: error.message || 'Invalid credentials',
        variant: 'destructive',
      });
    },
  });
};

export const useRegister = () => {
  const queryClient = useQueryClient();
  const { login: authLogin } = useAuth();
  
  return useMutation({
    mutationFn: async (userData: RegisterRequest) => {
      // Validate password strength
      const passwordValidation = AuthSecurityManager.validatePasswordStrength(userData.password);
      if (!passwordValidation.isValid) {
        throw new Error(`Password requirements not met: ${passwordValidation.feedback.join(', ')}`);
      }
      
      return await authService.register(userData);
    },
    onSuccess: (data) => {
      // Update auth context with both user and token
      authLogin(data.user, data.token);
      
      // Update query cache with user data
      queryClient.setQueryData(['auth', 'user'], data.user);
      
      // Invalidate and refetch any queries that depend on auth state
      queryClient.invalidateQueries({ queryKey: ['auth'] });
      
      toast({
        title: 'Registration successful!',
        description: `Welcome to Learn Academy, ${data.user.name}!`,
      });
    },
    onError: (error: any) => {
      console.error('Registration failed:', error);
      toast({
        title: 'Registration failed',
        description: error.message || 'Please check your information and try again',
        variant: 'destructive',
      });
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();
  const { logout: authLogout } = useAuth();
  
  return useMutation({
    mutationFn: async () => {
      await authLogout();
    },
    onSuccess: () => {
      // Clear all cached data on logout
      queryClient.clear();
      
      toast({
        title: 'Logged out',
        description: 'You have been successfully logged out',
      });
    },
    onError: (error: any) => {
      console.error('Logout failed:', error);
      // Still clear cache even if API call fails
      queryClient.clear();
    },
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: authService.updateProfile,
    onSuccess: (data) => {
      // Update cached user data
      queryClient.setQueryData(['auth', 'user'], data);
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['auth', 'user'] });
    },
    onError: (error) => {
      console.error('Profile update failed:', error);
    },
  });
};

export const useChangePassword = () => {
  return useMutation({
    mutationFn: authService.changePassword,
    onError: (error) => {
      console.error('Password change failed:', error);
    },
  });
};

export const useRequestPasswordReset = () => {
  return useMutation({
    mutationFn: authService.requestPasswordReset,
    onError: (error) => {
      console.error('Password reset request failed:', error);
    },
  });
};

export const useResetPassword = () => {
  return useMutation({
    mutationFn: authService.resetPassword,
    onError: (error) => {
      console.error('Password reset failed:', error);
    },
  });
};

// Auth state helper
export const useAuthUser = (): User | null => {
  return getStoredUser();
};

export const useIsAuthenticated = (): boolean => {
  const user = useAuthUser();
  return !!user;
};

export const useUserRole = (): string | null => {
  const user = useAuthUser();
  return user?.role || null;
};