import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { useLanguage } from './LanguageContext';
import type { User, DashboardStats, Notification } from '../types/api';

// Application State Types
export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  notifications: {
    email: boolean;
    push: boolean;
    desktop: boolean;
    marketing: boolean;
  };
  ui: {
    sidebarCollapsed: boolean;
    compactMode: boolean;
    animationsEnabled: boolean;
  };
  accessibility: {
    reducedMotion: boolean;
    highContrast: boolean;
    fontSize: 'small' | 'medium' | 'large';
  };
}

export interface CacheState {
  dashboardStats: {
    admin?: DashboardStats;
    teacher?: DashboardStats;
    student?: DashboardStats;
    lastUpdated?: number;
  };
  recentActivity: any[];
  notifications: Notification[];
}

export interface AppState {
  // User state
  currentUser: User | null;
  isAuthenticated: boolean;
  
  // App settings
  settings: AppSettings;
  
  // UI state
  ui: {
    loading: boolean;
    sidebarOpen: boolean;
    theme: 'light' | 'dark' | 'system';
    language: string;
    isRTL: boolean;
  };
  
  // Cache
  cache: CacheState;
  
  // Network state
  network: {
    isOnline: boolean;
    isSlowConnection: boolean;
  };
  
  // Error state
  errors: {
    global: string | null;
    api: { [key: string]: string };
  };
}

// Action Types
export type AppAction =
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_SIDEBAR_OPEN'; payload: boolean }
  | { type: 'SET_THEME'; payload: 'light' | 'dark' | 'system' }
  | { type: 'SET_LANGUAGE'; payload: { language: string; isRTL: boolean } }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<AppSettings> }
  | { type: 'SET_CACHE'; payload: { key: keyof CacheState; data: any } }
  | { type: 'CLEAR_CACHE'; payload?: keyof CacheState }
  | { type: 'SET_NETWORK_STATE'; payload: { isOnline: boolean; isSlowConnection?: boolean } }
  | { type: 'SET_ERROR'; payload: { key: string; error: string | null } }
  | { type: 'CLEAR_ERRORS' }
  | { type: 'HYDRATE_STATE'; payload: Partial<AppState> };

// Default Settings
const defaultSettings: AppSettings = {
  theme: 'system',
  notifications: {
    email: true,
    push: true,
    desktop: false,
    marketing: false,
  },
  ui: {
    sidebarCollapsed: false,
    compactMode: false,
    animationsEnabled: true,
  },
  accessibility: {
    reducedMotion: false,
    highContrast: false,
    fontSize: 'medium',
  },
};

// Initial State
const initialState: AppState = {
  currentUser: null,
  isAuthenticated: false,
  settings: defaultSettings,
  ui: {
    loading: false,
    sidebarOpen: true,
    theme: 'system',
    language: 'en',
    isRTL: false,
  },
  cache: {
    dashboardStats: {},
    recentActivity: [],
    notifications: [],
  },
  network: {
    isOnline: navigator.onLine,
    isSlowConnection: false,
  },
  errors: {
    global: null,
    api: {},
  },
};

// Reducer
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_USER':
      return {
        ...state,
        currentUser: action.payload,
        isAuthenticated: !!action.payload,
      };
      
    case 'SET_LOADING':
      return {
        ...state,
        ui: { ...state.ui, loading: action.payload },
      };
      
    case 'SET_SIDEBAR_OPEN':
      return {
        ...state,
        ui: { ...state.ui, sidebarOpen: action.payload },
      };
      
    case 'SET_THEME':
      return {
        ...state,
        ui: { ...state.ui, theme: action.payload },
        settings: { ...state.settings, theme: action.payload },
      };
      
    case 'SET_LANGUAGE':
      return {
        ...state,
        ui: {
          ...state.ui,
          language: action.payload.language,
          isRTL: action.payload.isRTL,
        },
      };
      
    case 'UPDATE_SETTINGS':
      return {
        ...state,
        settings: { ...state.settings, ...action.payload },
      };
      
    case 'SET_CACHE':
      return {
        ...state,
        cache: {
          ...state.cache,
          [action.payload.key]: action.payload.data,
        },
      };
      
    case 'CLEAR_CACHE':
      if (action.payload) {
        return {
          ...state,
          cache: {
            ...state.cache,
            [action.payload]: action.payload === 'dashboardStats' ? {} : [],
          },
        };
      }
      return {
        ...state,
        cache: {
          dashboardStats: {},
          recentActivity: [],
          notifications: [],
        },
      };
      
    case 'SET_NETWORK_STATE':
      return {
        ...state,
        network: {
          ...state.network,
          ...action.payload,
        },
      };
      
    case 'SET_ERROR':
      return {
        ...state,
        errors: {
          ...state.errors,
          api: {
            ...state.errors.api,
            [action.payload.key]: action.payload.error,
          },
        },
      };
      
    case 'CLEAR_ERRORS':
      return {
        ...state,
        errors: {
          global: null,
          api: {},
        },
      };
      
    case 'HYDRATE_STATE':
      return {
        ...state,
        ...action.payload,
      };
      
    default:
      return state;
  }
}

// Context
interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  // Helper functions
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setSidebarOpen: (open: boolean) => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  updateSettings: (settings: Partial<AppSettings>) => void;
  setCache: (key: keyof CacheState, data: any) => void;
  clearCache: (key?: keyof CacheState) => void;
  setError: (key: string, error: string | null) => void;
  clearErrors: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Custom hook
export const useAppState = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }
  return context;
};

// Provider Props
interface AppStateProviderProps {
  children: ReactNode;
}

// Local storage keys
const STORAGE_KEYS = {
  SETTINGS: 'learn_academy_settings',
  UI_STATE: 'learn_academy_ui_state',
  CACHE: 'learn_academy_cache',
} as const;

// Provider
export const AppStateProvider: React.FC<AppStateProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const { user, isAuthenticated } = useAuth();
  const { currentLanguage, isRTL } = useLanguage();

  // Sync with auth context
  useEffect(() => {
    dispatch({ type: 'SET_USER', payload: user });
  }, [user, isAuthenticated]);

  // Sync with language context
  useEffect(() => {
    dispatch({ 
      type: 'SET_LANGUAGE', 
      payload: { language: currentLanguage, isRTL } 
    });
  }, [currentLanguage, isRTL]);

  // Load persisted state on mount
  useEffect(() => {
    try {
      // Load settings
      const savedSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        dispatch({ type: 'UPDATE_SETTINGS', payload: settings });
      }

      // Load UI state
      const savedUIState = localStorage.getItem(STORAGE_KEYS.UI_STATE);
      if (savedUIState) {
        const uiState = JSON.parse(savedUIState);
        dispatch({ 
          type: 'HYDRATE_STATE', 
          payload: { ui: { ...state.ui, ...uiState } } 
        });
      }

      // Load cache (with expiry check)
      const savedCache = localStorage.getItem(STORAGE_KEYS.CACHE);
      if (savedCache) {
        const cacheData = JSON.parse(savedCache);
        // Check if cache is still valid (e.g., less than 1 hour old)
        const cacheAge = Date.now() - (cacheData.timestamp || 0);
        if (cacheAge < 60 * 60 * 1000) { // 1 hour
          dispatch({ 
            type: 'HYDRATE_STATE', 
            payload: { cache: cacheData.data } 
          });
        }
      }
    } catch (error) {
      console.error('Failed to load persisted state:', error);
    }
  }, []);

  // Persist settings changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(state.settings));
    } catch (error) {
      console.error('Failed to persist settings:', error);
    }
  }, [state.settings]);

  // Persist UI state changes
  useEffect(() => {
    try {
      const uiStateToPersist = {
        sidebarOpen: state.ui.sidebarOpen,
        theme: state.ui.theme,
      };
      localStorage.setItem(STORAGE_KEYS.UI_STATE, JSON.stringify(uiStateToPersist));
    } catch (error) {
      console.error('Failed to persist UI state:', error);
    }
  }, [state.ui.sidebarOpen, state.ui.theme]);

  // Persist cache with timestamp
  useEffect(() => {
    try {
      const cacheWithTimestamp = {
        timestamp: Date.now(),
        data: state.cache,
      };
      localStorage.setItem(STORAGE_KEYS.CACHE, JSON.stringify(cacheWithTimestamp));
    } catch (error) {
      console.error('Failed to persist cache:', error);
    }
  }, [state.cache]);

  // Network state monitoring
  useEffect(() => {
    const handleOnline = () => {
      dispatch({ type: 'SET_NETWORK_STATE', payload: { isOnline: true } });
    };

    const handleOffline = () => {
      dispatch({ type: 'SET_NETWORK_STATE', payload: { isOnline: false } });
    };

    // Monitor connection speed
    const checkConnectionSpeed = () => {
      if ('connection' in navigator) {
        const connection = (navigator as any).connection;
        const isSlowConnection = connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g';
        dispatch({ 
          type: 'SET_NETWORK_STATE', 
          payload: { isOnline: navigator.onLine, isSlowConnection } 
        });
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Check connection speed periodically
    checkConnectionSpeed();
    const connectionInterval = setInterval(checkConnectionSpeed, 30000); // Every 30 seconds

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(connectionInterval);
    };
  }, []);

  // Helper functions
  const setUser = (user: User | null) => {
    dispatch({ type: 'SET_USER', payload: user });
  };

  const setLoading = (loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  };

  const setSidebarOpen = (open: boolean) => {
    dispatch({ type: 'SET_SIDEBAR_OPEN', payload: open });
  };

  const setTheme = (theme: 'light' | 'dark' | 'system') => {
    dispatch({ type: 'SET_THEME', payload: theme });
    
    // Apply theme to document
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'light') {
      root.classList.remove('dark');
    } else {
      // System theme
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  };

  const updateSettings = (settings: Partial<AppSettings>) => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: settings });
  };

  const setCache = (key: keyof CacheState, data: any) => {
    dispatch({ type: 'SET_CACHE', payload: { key, data } });
  };

  const clearCache = (key?: keyof CacheState) => {
    dispatch({ type: 'CLEAR_CACHE', payload: key });
  };

  const setError = (key: string, error: string | null) => {
    dispatch({ type: 'SET_ERROR', payload: { key, error } });
  };

  const clearErrors = () => {
    dispatch({ type: 'CLEAR_ERRORS' });
  };

  const value: AppContextType = {
    state,
    dispatch,
    setUser,
    setLoading,
    setSidebarOpen,
    setTheme,
    updateSettings,
    setCache,
    clearCache,
    setError,
    clearErrors,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};