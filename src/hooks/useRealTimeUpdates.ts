import { useEffect, useRef, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { config } from '@/lib/config';
import { 
  RealTimeUpdate, 
  DataUpdateEvent, 
  NotificationCategory, 
  NotificationType, 
  NotificationPriority 
} from '@/types/notifications';

interface UseRealTimeUpdatesOptions {
  enabled?: boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

export const useRealTimeUpdates = (options: UseRealTimeUpdatesOptions = {}) => {
  const {
    enabled = config.features.enableRealTimeUpdates,
    reconnectInterval = 5000,
    maxReconnectAttempts = 5,
  } = options;

  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useAuth();
  const { addNotification, state: notificationState } = useNotifications();
  
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isConnectedRef = useRef(false);

  // Handle incoming real-time updates
  const handleRealTimeUpdate = useCallback((update: RealTimeUpdate) => {
    switch (update.type) {
      case 'notification':
        // Handle new notifications
        if (update.payload && update.payload.notification) {
          const notification = update.payload.notification;
          addNotification({
            title: notification.title,
            message: notification.message,
            type: notification.type || NotificationType.INFO,
            priority: notification.priority || NotificationPriority.MEDIUM,
            category: notification.category || NotificationCategory.GENERAL,
            read: false,
            persistent: notification.persistent || false,
            actions: notification.actions,
            metadata: notification.metadata,
          });
        }
        break;

      case 'data_update':
        // Handle data updates that should trigger query invalidation
        if (update.payload && update.payload.entity) {
          const dataUpdate: DataUpdateEvent = update.payload;
          handleDataUpdate(dataUpdate);
        }
        break;

      case 'user_activity':
        // Handle user activity updates (e.g., user online status)
        if (update.payload) {
          // Invalidate user-related queries
          queryClient.invalidateQueries({ queryKey: ['users'] });
        }
        break;

      default:
        console.warn('Unknown real-time update type:', update.type);
    }
  }, [addNotification, queryClient]);

  // Handle data updates by invalidating relevant queries
  const handleDataUpdate = useCallback((dataUpdate: DataUpdateEvent) => {
    const { entity, action, id, affectedUsers } = dataUpdate;

    // Only process updates relevant to the current user
    if (affectedUsers && user && !affectedUsers.includes(user.id)) {
      return;
    }

    // Invalidate queries based on entity type
    switch (entity) {
      case 'quiz':
        queryClient.invalidateQueries({ queryKey: ['quizzes'] });
        queryClient.invalidateQueries({ queryKey: ['quiz', id] });
        if (action === 'created') {
          addNotification({
            title: 'New Quiz Available',
            message: 'A new quiz has been assigned to you.',
            type: NotificationType.INFO,
            priority: NotificationPriority.MEDIUM,
            category: NotificationCategory.QUIZ,
            read: false,
            persistent: false,
          });
        }
        break;

      case 'meeting':
        queryClient.invalidateQueries({ queryKey: ['meetings'] });
        queryClient.invalidateQueries({ queryKey: ['meeting', id] });
        if (action === 'created') {
          addNotification({
            title: 'New Meeting Scheduled',
            message: 'You have been invited to a new meeting.',
            type: NotificationType.INFO,
            priority: NotificationPriority.HIGH,
            category: NotificationCategory.MEETING,
            read: false,
            persistent: false,
          });
        }
        break;

      case 'enrollment':
        queryClient.invalidateQueries({ queryKey: ['enrollments'] });
        queryClient.invalidateQueries({ queryKey: ['programs'] });
        if (action === 'updated') {
          addNotification({
            title: 'Enrollment Status Updated',
            message: 'Your enrollment status has been updated.',
            type: NotificationType.SUCCESS,
            priority: NotificationPriority.HIGH,
            category: NotificationCategory.ENROLLMENT,
            read: false,
            persistent: false,
          });
        }
        break;

      case 'user':
        queryClient.invalidateQueries({ queryKey: ['users'] });
        queryClient.invalidateQueries({ queryKey: ['user', id] });
        if (user && id === user.id) {
          queryClient.invalidateQueries({ queryKey: ['profile'] });
        }
        break;

      case 'program':
        queryClient.invalidateQueries({ queryKey: ['programs'] });
        queryClient.invalidateQueries({ queryKey: ['program', id] });
        break;

      default:
        // Generic invalidation for unknown entities
        queryClient.invalidateQueries({ queryKey: [entity] });
    }
  }, [queryClient, addNotification, user]);

  // WebSocket connection management
  const connect = useCallback(() => {
    if (!enabled || !isAuthenticated || !user || isConnectedRef.current) {
      return;
    }

    try {
      // In a real implementation, this would be a WebSocket URL
      // For now, we'll simulate with a mock connection
      const wsUrl = `${config.api.baseURL.replace('http', 'ws')}/ws?token=${localStorage.getItem(config.auth.tokenKey)}`;
      
      // Mock WebSocket for demonstration
      // In production, you would use: new WebSocket(wsUrl)
      const mockWs = {
        onopen: null as ((event: Event) => void) | null,
        onmessage: null as ((event: MessageEvent) => void) | null,
        onclose: null as ((event: CloseEvent) => void) | null,
        onerror: null as ((event: Event) => void) | null,
        close: () => {},
        send: (data: string) => {},
      };

      wsRef.current = mockWs as any;

      // Simulate connection events
      setTimeout(() => {
        if (mockWs.onopen) {
          mockWs.onopen(new Event('open'));
        }
      }, 100);

      mockWs.onopen = () => {
        console.log('Real-time connection established');
        isConnectedRef.current = true;
        reconnectAttemptsRef.current = 0;
        
        // Send authentication message
        if (wsRef.current) {
          wsRef.current.send(JSON.stringify({
            type: 'auth',
            token: localStorage.getItem(config.auth.tokenKey),
            userId: user.id,
          }));
        }
      };

      mockWs.onmessage = (event) => {
        try {
          const update: RealTimeUpdate = JSON.parse(event.data);
          handleRealTimeUpdate(update);
        } catch (error) {
          console.error('Failed to parse real-time update:', error);
        }
      };

      mockWs.onclose = () => {
        console.log('Real-time connection closed');
        isConnectedRef.current = false;
        
        // Attempt to reconnect if enabled and within retry limits
        if (enabled && reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current++;
          console.log(`Attempting to reconnect (${reconnectAttemptsRef.current}/${maxReconnectAttempts})`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, reconnectInterval);
        }
      };

      mockWs.onerror = (error) => {
        console.error('Real-time connection error:', error);
        isConnectedRef.current = false;
      };

    } catch (error) {
      console.error('Failed to establish real-time connection:', error);
    }
  }, [enabled, isAuthenticated, user, handleRealTimeUpdate, reconnectInterval, maxReconnectAttempts]);

  // Disconnect WebSocket
  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    isConnectedRef.current = false;
    reconnectAttemptsRef.current = 0;
  }, []);

  // Setup background refetching for critical data
  const setupBackgroundRefetching = useCallback(() => {
    if (!enabled || !notificationState.realTimeEnabled) return;

    // Set up intervals for background refetching
    const intervals: NodeJS.Timeout[] = [];

    // Refetch notifications every 30 seconds
    intervals.push(setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }, 30000));

    // Refetch user data every 5 minutes
    intervals.push(setInterval(() => {
      if (user) {
        queryClient.invalidateQueries({ queryKey: ['user', user.id] });
        queryClient.invalidateQueries({ queryKey: ['profile'] });
      }
    }, 300000));

    // Refetch dashboard data every 2 minutes
    intervals.push(setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    }, 120000));

    return () => {
      intervals.forEach(interval => clearInterval(interval));
    };
  }, [enabled, notificationState.realTimeEnabled, queryClient, user]);

  // Initialize real-time connection
  useEffect(() => {
    if (enabled && isAuthenticated && user && notificationState.realTimeEnabled) {
      connect();
      const cleanup = setupBackgroundRefetching();
      
      return () => {
        disconnect();
        cleanup?.();
      };
    } else {
      disconnect();
    }
  }, [enabled, isAuthenticated, user, notificationState.realTimeEnabled, connect, disconnect, setupBackgroundRefetching]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    isConnected: isConnectedRef.current,
    reconnectAttempts: reconnectAttemptsRef.current,
    maxReconnectAttempts,
    connect,
    disconnect,
  };
};

// Hook for triggering manual data refresh
export const useManualRefresh = () => {
  const queryClient = useQueryClient();

  const refreshAll = useCallback(() => {
    queryClient.invalidateQueries();
  }, [queryClient]);

  const refreshEntity = useCallback((entity: string, id?: string | number) => {
    if (id) {
      queryClient.invalidateQueries({ queryKey: [entity, id] });
    } else {
      queryClient.invalidateQueries({ queryKey: [entity] });
    }
  }, [queryClient]);

  const refreshDashboard = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    queryClient.invalidateQueries({ queryKey: ['stats'] });
    queryClient.invalidateQueries({ queryKey: ['notifications'] });
  }, [queryClient]);

  return {
    refreshAll,
    refreshEntity,
    refreshDashboard,
  };
};