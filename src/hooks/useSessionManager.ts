import { useEffect, useCallback, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { AuthSecurityManager } from '../lib/authSecurity';
import { getStoredToken } from '../lib/api';
import { toast } from '@/hooks/use-toast';

// Session management hook
export const useSessionManager = () => {
  const { isAuthenticated, logout, refreshSession } = useAuth();
  const [sessionWarningShown, setSessionWarningShown] = useState(false);
  const [isSessionExpiring, setIsSessionExpiring] = useState(false);

  // Check token expiry and refresh if needed
  const checkTokenStatus = useCallback(async () => {
    if (!isAuthenticated) return;

    const token = getStoredToken();
    if (!token) {
      await logout();
      return;
    }

    // Check if token is still valid
    if (!AuthSecurityManager.isTokenValid(token)) {
      await logout();
      toast({
        title: 'Session Expired',
        description: 'Your session has expired. Please log in again.',
        variant: 'destructive',
      });
      return;
    }

    // Check if token needs refresh
    if (AuthSecurityManager.shouldRefreshToken(token)) {
      if (!sessionWarningShown) {
        setIsSessionExpiring(true);
        setSessionWarningShown(true);
        toast({
          title: 'Session Expiring Soon',
          description: 'Your session will expire in 5 minutes. Activity will extend your session.',
          duration: 10000,
        });
      }

      try {
        await refreshSession();
        setIsSessionExpiring(false);
        setSessionWarningShown(false);
      } catch (error) {
        console.error('Failed to refresh session:', error);
        await logout();
      }
    }
  }, [isAuthenticated, logout, refreshSession, sessionWarningShown]);

  // Reset session warning when user activity is detected
  const handleUserActivity = useCallback(() => {
    if (sessionWarningShown) {
      setSessionWarningShown(false);
      setIsSessionExpiring(false);
    }
  }, [sessionWarningShown]);

  useEffect(() => {
    if (!isAuthenticated) return;

    // Check token status immediately
    checkTokenStatus();

    // Set up periodic token checks
    const tokenCheckInterval = setInterval(checkTokenStatus, 60000); // Check every minute

    // Listen for user activity
    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    activityEvents.forEach(event => {
      document.addEventListener(event, handleUserActivity, { passive: true });
    });

    // Listen for window focus/blur events
    const handleFocus = () => {
      checkTokenStatus();
    };
    
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkTokenStatus();
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(tokenCheckInterval);
      activityEvents.forEach(event => {
        document.removeEventListener(event, handleUserActivity);
      });
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isAuthenticated, checkTokenStatus, handleUserActivity]);

  return {
    isSessionExpiring,
    checkTokenStatus,
    refreshSession,
  };
};

// Password strength hook
export const usePasswordStrength = (password: string) => {
  const [strength, setStrength] = useState({
    isValid: false,
    score: 0,
    feedback: [] as string[],
  });

  useEffect(() => {
    if (password) {
      const validation = AuthSecurityManager.validatePasswordStrength(password);
      setStrength(validation);
    } else {
      setStrength({ isValid: false, score: 0, feedback: [] });
    }
  }, [password]);

  return strength;
};

// Account security hook
export const useAccountSecurity = () => {
  const checkAccountLockout = (email: string) => {
    return {
      isLocked: AuthSecurityManager.isAccountLocked(email),
      remainingTime: AuthSecurityManager.getRemainingLockoutTime(email),
      failedAttempts: AuthSecurityManager.getFailedAttempts(email),
    };
  };

  const clearLockout = (email: string) => {
    AuthSecurityManager.clearFailedAttempts(email);
  };

  const getDeviceFingerprint = () => {
    return AuthSecurityManager.getDeviceFingerprint();
  };

  return {
    checkAccountLockout,
    clearLockout,
    getDeviceFingerprint,
  };
};