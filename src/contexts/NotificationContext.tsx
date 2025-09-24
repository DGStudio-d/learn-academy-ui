import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { useAppState } from './AppStateContext';
import { 
  NotificationData, 
  NotificationPreferences, 
  NotificationFilter,
  NotificationStats,
  NotificationType,
  NotificationPriority,
  NotificationCategory,
  RealTimeUpdate
} from '../types/notifications';
import { notifications as notificationManager } from '../lib/notifications';

interface NotificationState {
  notifications: NotificationData[];
  preferences: NotificationPreferences | null;
  stats: NotificationStats;
  filter: NotificationFilter;
  loading: boolean;
  error: string | null;
  realTimeEnabled: boolean;
}

type NotificationAction =
  | { type: 'SET_NOTIFICATIONS'; payload: NotificationData[] }
  | { type: 'ADD_NOTIFICATION'; payload: NotificationData }
  | { type: 'UPDATE_NOTIFICATION'; payload: { id: string; updates: Partial<NotificationData> } }
  | { type: 'REMOVE_NOTIFICATION'; payload: string }
  | { type: 'MARK_AS_READ'; payload: string | string[] }
  | { type: 'MARK_ALL_AS_READ' }
  | { type: 'CLEAR_ALL_NOTIFICATIONS' }
  | { type: 'SET_PREFERENCES'; payload: NotificationPreferences }
  | { type: 'SET_FILTER'; payload: NotificationFilter }
  | { type: 'SET_STATS'; payload: NotificationStats }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_REAL_TIME_ENABLED'; payload: boolean };

const initialState: NotificationState = {
  notifications: [],
  preferences: null,
  stats: {
    total: 0,
    unread: 0,
    byType: {
      [NotificationType.SUCCESS]: 0,
      [NotificationType.ERROR]: 0,
      [NotificationType.WARNING]: 0,
      [NotificationType.INFO]: 0,
    },
    byCategory: {
      [NotificationCategory.SYSTEM]: 0,
      [NotificationCategory.QUIZ]: 0,
      [NotificationCategory.MEETING]: 0,
      [NotificationCategory.ENROLLMENT]: 0,
      [NotificationCategory.USER]: 0,
      [NotificationCategory.GENERAL]: 0,
    },
    byPriority: {
      [NotificationPriority.LOW]: 0,
      [NotificationPriority.MEDIUM]: 0,
      [NotificationPriority.HIGH]: 0,
      [NotificationPriority.CRITICAL]: 0,
    },
  },
  filter: {},
  loading: false,
  error: null,
  realTimeEnabled: true,
};

function notificationReducer(state: NotificationState, action: NotificationAction): NotificationState {
  switch (action.type) {
    case 'SET_NOTIFICATIONS':
      return {
        ...state,
        notifications: action.payload,
        stats: calculateStats(action.payload),
      };

    case 'ADD_NOTIFICATION':
      const newNotifications = [action.payload, ...state.notifications];
      return {
        ...state,
        notifications: newNotifications,
        stats: calculateStats(newNotifications),
      };

    case 'UPDATE_NOTIFICATION':
      const updatedNotifications = state.notifications.map(notification =>
        notification.id === action.payload.id
          ? { ...notification, ...action.payload.updates }
          : notification
      );
      return {
        ...state,
        notifications: updatedNotifications,
        stats: calculateStats(updatedNotifications),
      };

    case 'REMOVE_NOTIFICATION':
      const filteredNotifications = state.notifications.filter(n => n.id !== action.payload);
      return {
        ...state,
        notifications: filteredNotifications,
        stats: calculateStats(filteredNotifications),
      };

    case 'MARK_AS_READ':
      const ids = Array.isArray(action.payload) ? action.payload : [action.payload];
      const markedNotifications = state.notifications.map(notification =>
        ids.includes(notification.id)
          ? { ...notification, read: true, readAt: new Date().toISOString() }
          : notification
      );
      return {
        ...state,
        notifications: markedNotifications,
        stats: calculateStats(markedNotifications),
      };

    case 'MARK_ALL_AS_READ':
      const allReadNotifications = state.notifications.map(notification => ({
        ...notification,
        read: true,
        readAt: new Date().toISOString(),
      }));
      return {
        ...state,
        notifications: allReadNotifications,
        stats: calculateStats(allReadNotifications),
      };

    case 'CLEAR_ALL_NOTIFICATIONS':
      return {
        ...state,
        notifications: [],
        stats: calculateStats([]),
      };

    case 'SET_PREFERENCES':
      return {
        ...state,
        preferences: action.payload,
      };

    case 'SET_FILTER':
      return {
        ...state,
        filter: action.payload,
      };

    case 'SET_STATS':
      return {
        ...state,
        stats: action.payload,
      };

    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
      };

    case 'SET_REAL_TIME_ENABLED':
      return {
        ...state,
        realTimeEnabled: action.payload,
      };

    default:
      return state;
  }
}

function calculateStats(notifications: NotificationData[]): NotificationStats {
  const stats: NotificationStats = {
    total: notifications.length,
    unread: notifications.filter(n => !n.read).length,
    byType: {
      [NotificationType.SUCCESS]: 0,
      [NotificationType.ERROR]: 0,
      [NotificationType.WARNING]: 0,
      [NotificationType.INFO]: 0,
    },
    byCategory: {
      [NotificationCategory.SYSTEM]: 0,
      [NotificationCategory.QUIZ]: 0,
      [NotificationCategory.MEETING]: 0,
      [NotificationCategory.ENROLLMENT]: 0,
      [NotificationCategory.USER]: 0,
      [NotificationCategory.GENERAL]: 0,
    },
    byPriority: {
      [NotificationPriority.LOW]: 0,
      [NotificationPriority.MEDIUM]: 0,
      [NotificationPriority.HIGH]: 0,
      [NotificationPriority.CRITICAL]: 0,
    },
  };

  notifications.forEach(notification => {
    stats.byType[notification.type]++;
    stats.byCategory[notification.category]++;
    stats.byPriority[notification.priority]++;
  });

  return stats;
}

interface NotificationContextType {
  state: NotificationState;
  dispatch: React.Dispatch<NotificationAction>;
  
  // Notification management
  addNotification: (notification: Omit<NotificationData, 'id' | 'createdAt'>) => string;
  removeNotification: (id: string) => void;
  markAsRead: (id: string | string[]) => void;
  markAllAsRead: () => void;
  clearAllNotifications: () => void;
  
  // Preferences
  updatePreferences: (preferences: Partial<NotificationPreferences>) => Promise<void>;
  
  // Filtering
  setFilter: (filter: NotificationFilter) => void;
  getFilteredNotifications: () => NotificationData[];
  
  // Real-time
  enableRealTime: () => void;
  disableRealTime: () => void;
  
  // Convenience methods
  showSuccess: (title: string, message: string, options?: any) => string;
  showError: (title: string, message: string, options?: any) => string;
  showWarning: (title: string, message: string, options?: any) => string;
  showInfo: (title: string, message: string, options?: any) => string;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(notificationReducer, initialState);
  const { user } = useAuth();
  const { state: appState } = useAppState();

  // Generate unique notification ID
  const generateId = (): string => {
    return `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  // Add notification
  const addNotification = (notification: Omit<NotificationData, 'id' | 'createdAt'>): string => {
    const id = generateId();
    const newNotification: NotificationData = {
      ...notification,
      id,
      createdAt: new Date().toISOString(),
      userId: user?.id,
    };

    dispatch({ type: 'ADD_NOTIFICATION', payload: newNotification });

    // Show toast if preferences allow
    if (state.preferences?.inApp.showToasts !== false) {
      notificationManager.show({
        title: notification.title,
        message: notification.message,
        type: notification.type,
        priority: notification.priority,
        persistent: notification.persistent,
        actions: notification.actions?.map(action => ({
          label: action.label,
          action: action.action,
        })),
      });
    }

    // Auto-remove non-persistent notifications
    if (!notification.persistent) {
      const duration = getDurationByPriority(notification.priority);
      setTimeout(() => {
        removeNotification(id);
      }, duration);
    }

    return id;
  };

  // Remove notification
  const removeNotification = (id: string) => {
    dispatch({ type: 'REMOVE_NOTIFICATION', payload: id });
  };

  // Mark as read
  const markAsRead = (id: string | string[]) => {
    dispatch({ type: 'MARK_AS_READ', payload: id });
  };

  // Mark all as read
  const markAllAsRead = () => {
    dispatch({ type: 'MARK_ALL_AS_READ' });
  };

  // Clear all notifications
  const clearAllNotifications = () => {
    dispatch({ type: 'CLEAR_ALL_NOTIFICATIONS' });
  };

  // Update preferences
  const updatePreferences = async (preferences: Partial<NotificationPreferences>) => {
    if (!user) return;

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Here you would make an API call to update preferences
      // For now, we'll just update the local state
      const updatedPreferences = {
        ...state.preferences,
        ...preferences,
      } as NotificationPreferences;

      dispatch({ type: 'SET_PREFERENCES', payload: updatedPreferences });
      
      // Persist to localStorage
      localStorage.setItem(
        `notification_preferences_${user.id}`,
        JSON.stringify(updatedPreferences)
      );
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update notification preferences' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Set filter
  const setFilter = (filter: NotificationFilter) => {
    dispatch({ type: 'SET_FILTER', payload: filter });
  };

  // Get filtered notifications
  const getFilteredNotifications = (): NotificationData[] => {
    let filtered = [...state.notifications];

    if (state.filter.type) {
      filtered = filtered.filter(n => n.type === state.filter.type);
    }

    if (state.filter.category) {
      filtered = filtered.filter(n => n.category === state.filter.category);
    }

    if (state.filter.priority) {
      filtered = filtered.filter(n => n.priority === state.filter.priority);
    }

    if (state.filter.read !== undefined) {
      filtered = filtered.filter(n => n.read === state.filter.read);
    }

    if (state.filter.dateFrom) {
      filtered = filtered.filter(n => n.createdAt >= state.filter.dateFrom!);
    }

    if (state.filter.dateTo) {
      filtered = filtered.filter(n => n.createdAt <= state.filter.dateTo!);
    }

    return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  };

  // Real-time controls
  const enableRealTime = () => {
    dispatch({ type: 'SET_REAL_TIME_ENABLED', payload: true });
  };

  const disableRealTime = () => {
    dispatch({ type: 'SET_REAL_TIME_ENABLED', payload: false });
  };

  // Convenience methods
  const showSuccess = (title: string, message: string, options: any = {}) => {
    return addNotification({
      title,
      message,
      type: NotificationType.SUCCESS,
      priority: NotificationPriority.MEDIUM,
      category: NotificationCategory.GENERAL,
      read: false,
      persistent: false,
      ...options,
    });
  };

  const showError = (title: string, message: string, options: any = {}) => {
    return addNotification({
      title,
      message,
      type: NotificationType.ERROR,
      priority: NotificationPriority.HIGH,
      category: NotificationCategory.SYSTEM,
      read: false,
      persistent: true,
      ...options,
    });
  };

  const showWarning = (title: string, message: string, options: any = {}) => {
    return addNotification({
      title,
      message,
      type: NotificationType.WARNING,
      priority: NotificationPriority.MEDIUM,
      category: NotificationCategory.GENERAL,
      read: false,
      persistent: false,
      ...options,
    });
  };

  const showInfo = (title: string, message: string, options: any = {}) => {
    return addNotification({
      title,
      message,
      type: NotificationType.INFO,
      priority: NotificationPriority.LOW,
      category: NotificationCategory.GENERAL,
      read: false,
      persistent: false,
      ...options,
    });
  };

  // Load user preferences on mount
  useEffect(() => {
    if (user) {
      const savedPreferences = localStorage.getItem(`notification_preferences_${user.id}`);
      if (savedPreferences) {
        try {
          const preferences = JSON.parse(savedPreferences);
          dispatch({ type: 'SET_PREFERENCES', payload: preferences });
        } catch (error) {
          console.error('Failed to load notification preferences:', error);
        }
      } else {
        // Set default preferences
        const defaultPreferences: NotificationPreferences = {
          userId: user.id,
          email: {
            enabled: true,
            categories: [NotificationCategory.SYSTEM, NotificationCategory.ENROLLMENT],
            frequency: 'immediate',
          },
          push: {
            enabled: true,
            categories: [NotificationCategory.QUIZ, NotificationCategory.MEETING],
          },
          inApp: {
            enabled: true,
            categories: Object.values(NotificationCategory),
            showToasts: true,
            autoMarkAsRead: false,
            soundEnabled: true,
          },
          desktop: {
            enabled: false,
            categories: [NotificationCategory.SYSTEM],
          },
        };
        dispatch({ type: 'SET_PREFERENCES', payload: defaultPreferences });
      }
    }
  }, [user]);

  // Real-time updates setup
  useEffect(() => {
    if (!state.realTimeEnabled || !user) return;

    // Set up real-time connection (WebSocket, Server-Sent Events, etc.)
    // For now, we'll simulate with periodic polling
    const interval = setInterval(() => {
      // This would be replaced with actual real-time updates
      // fetchLatestNotifications();
    }, 30000); // Poll every 30 seconds

    return () => clearInterval(interval);
  }, [state.realTimeEnabled, user]);

  // Helper function to get duration by priority
  const getDurationByPriority = (priority: NotificationPriority): number => {
    switch (priority) {
      case NotificationPriority.LOW:
        return 3000;
      case NotificationPriority.MEDIUM:
        return 5000;
      case NotificationPriority.HIGH:
        return 8000;
      case NotificationPriority.CRITICAL:
        return 0; // Never auto-remove
      default:
        return 5000;
    }
  };

  const value: NotificationContextType = {
    state,
    dispatch,
    addNotification,
    removeNotification,
    markAsRead,
    markAllAsRead,
    clearAllNotifications,
    updatePreferences,
    setFilter,
    getFilteredNotifications,
    enableRealTime,
    disableRealTime,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};