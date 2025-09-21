import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { getStoredUser, getStoredToken, clearStoredToken, setStoredUser, setStoredToken } from '../lib/api';
import { authService } from '../services/authService';
import type { User } from '../types/api';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  lastActivity: number;
  sessionTimeout?: number;
}

interface AuthContextType extends AuthState {
  login: (user: User, token: string) => void;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
  checkAuthStatus: () => Promise<boolean>;
  refreshSession: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string | string[]) => boolean;
  extendSession: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Session timeout in milliseconds (30 minutes)
const SESSION_TIMEOUT = 30 * 60 * 1000;
// Activity check interval (5 minutes)
const ACTIVITY_CHECK_INTERVAL = 5 * 60 * 1000;

// Role-based permissions mapping
const ROLE_PERMISSIONS = {
  admin: [
    'user.create', 'user.read', 'user.update', 'user.delete',
    'program.create', 'program.read', 'program.update', 'program.delete',
    'quiz.create', 'quiz.read', 'quiz.update', 'quiz.delete',
    'meeting.create', 'meeting.read', 'meeting.update', 'meeting.delete',
    'language.create', 'language.read', 'language.update', 'language.delete',
    'enrollment.approve', 'enrollment.reject',
    'settings.read', 'settings.update',
    'reports.read'
  ],
  teacher: [
    'program.create', 'program.read', 'program.update',
    'quiz.create', 'quiz.read', 'quiz.update', 'quiz.delete',
    'meeting.create', 'meeting.read', 'meeting.update', 'meeting.delete',
    'student.read', 'enrollment.read',
    'profile.read', 'profile.update'
  ],
  student: [
    'program.read', 'quiz.read', 'meeting.read',
    'enrollment.create', 'enrollment.read',
    'profile.read', 'profile.update'
  ]
} as const;

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    lastActivity: Date.now(),
    sessionTimeout: SESSION_TIMEOUT
  });

  // Update user activity timestamp
  const extendSession = useCallback(() => {
    setAuthState(prev => ({
      ...prev,
      lastActivity: Date.now()
    }));
  }, []);

  // Check if user session is still valid
  const isSessionValid = useCallback(() => {
    const now = Date.now();
    return (now - authState.lastActivity) < SESSION_TIMEOUT;
  }, [authState.lastActivity]);

  // Initialize auth state from stored data
  const initializeAuth = useCallback(async () => {
    try {
      const storedUser = getStoredUser();
      const storedToken = getStoredToken();
      
      if (storedUser && storedToken) {
        // Verify token is still valid with server
        try {
          const currentUser = await authService.getCurrentUser();
          setAuthState({
            user: currentUser,
            isAuthenticated: true,
            isLoading: false,
            lastActivity: Date.now(),
            sessionTimeout: SESSION_TIMEOUT
          });
        } catch (error) {
          // Token is invalid, clear stored data
          clearStoredToken();
          setAuthState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            lastActivity: Date.now(),
            sessionTimeout: SESSION_TIMEOUT
          });
        }
      } else {
        setAuthState(prev => ({
          ...prev,
          isLoading: false
        }));
      }
    } catch (error) {
      console.error('Error initializing auth state:', error);
      clearStoredToken();
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        lastActivity: Date.now(),
        sessionTimeout: SESSION_TIMEOUT
      });
    }
  }, []);

  // Check auth status and refresh if needed
  const checkAuthStatus = useCallback(async (): Promise<boolean> => {
    if (!authState.isAuthenticated || !authState.user) {
      return false;
    }

    if (!isSessionValid()) {
      await logout();
      return false;
    }

    try {
      const currentUser = await authService.getCurrentUser();
      setAuthState(prev => ({
        ...prev,
        user: currentUser,
        lastActivity: Date.now()
      }));
      return true;
    } catch (error) {
      await logout();
      return false;
    }
  }, [authState.isAuthenticated, authState.user, isSessionValid]);

  // Refresh session without full re-authentication
  const refreshSession = useCallback(async () => {
    if (authState.isAuthenticated && authState.user) {
      try {
        const currentUser = await authService.getCurrentUser();
        setAuthState(prev => ({
          ...prev,
          user: currentUser,
          lastActivity: Date.now()
        }));
      } catch (error) {
        console.error('Session refresh failed:', error);
        await logout();
      }
    }
  }, [authState.isAuthenticated, authState.user]);

  // Login function
  const login = useCallback((userData: User, token: string) => {
    setStoredToken(token);
    setStoredUser(userData);
    setAuthState({
      user: userData,
      isAuthenticated: true,
      isLoading: false,
      lastActivity: Date.now(),
      sessionTimeout: SESSION_TIMEOUT
    });
    
    // Dispatch login event
    window.dispatchEvent(new CustomEvent('auth:login', {
      detail: { user: userData }
    }));
  }, []);

  // Logout function
  const logout = useCallback(async () => {
    try {
      // Call API logout endpoint
      await authService.logout();
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      // Always clear local state
      clearStoredToken();
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        lastActivity: Date.now(),
        sessionTimeout: SESSION_TIMEOUT
      });
      
      // Dispatch logout event
      window.dispatchEvent(new CustomEvent('auth:logout'));
    }
  }, []);

  // Update user function
  const updateUser = useCallback((userData: User) => {
    setStoredUser(userData);
    setAuthState(prev => ({
      ...prev,
      user: userData,
      lastActivity: Date.now()
    }));
    
    // Dispatch user update event
    window.dispatchEvent(new CustomEvent('auth:userUpdate', {
      detail: { user: userData }
    }));
  }, []);

  // Check if user has specific permission
  const hasPermission = useCallback((permission: string): boolean => {
    if (!authState.user) return false;
    
    const userRole = authState.user.role;
    const rolePermissions = ROLE_PERMISSIONS[userRole as keyof typeof ROLE_PERMISSIONS];
    
    return rolePermissions?.includes(permission as any) || false;
  }, [authState.user]);

  // Check if user has specific role(s)
  const hasRole = useCallback((role: string | string[]): boolean => {
    if (!authState.user) return false;
    
    const userRole = authState.user.role;
    
    if (Array.isArray(role)) {
      return role.includes(userRole);
    }
    
    return userRole === role;
  }, [authState.user]);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  useEffect(() => {
    // Set up session monitoring
    const sessionCheckInterval = setInterval(() => {
      if (authState.isAuthenticated && !isSessionValid()) {
        logout();
      }
    }, ACTIVITY_CHECK_INTERVAL);

    // Listen for auth events
    const handleLogout = () => {
      setAuthState(prev => ({
        ...prev,
        user: null,
        isAuthenticated: false
      }));
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && authState.isAuthenticated) {
        checkAuthStatus();
      }
    };

    // Set up event listeners
    window.addEventListener('auth:logout', handleLogout);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Track user activity for session management
    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    const handleActivity = () => {
      if (authState.isAuthenticated) {
        extendSession();
      }
    };
    
    activityEvents.forEach(event => {
      document.addEventListener(event, handleActivity, { passive: true });
    });

    return () => {
      clearInterval(sessionCheckInterval);
      window.removeEventListener('auth:logout', handleLogout);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      
      activityEvents.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
    };
  }, [authState.isAuthenticated, isSessionValid, logout, checkAuthStatus, extendSession]);

  const value: AuthContextType = {
    ...authState,
    login,
    logout,
    updateUser,
    checkAuthStatus,
    refreshSession,
    hasPermission,
    hasRole,
    extendSession,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};