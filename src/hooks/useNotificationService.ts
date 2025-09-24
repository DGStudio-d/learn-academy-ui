import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationService } from '@/services/notificationService';
import { useNotifications } from '@/contexts/NotificationContext';
import { 
  NotificationFilter, 
  NotificationPreferences,
  CreateNotificationRequest 
} from '@/types/notifications';
import { toast } from '@/hooks/use-toast';

// Query keys
export const notificationKeys = {
  all: ['notifications'] as const,
  lists: () => [...notificationKeys.all, 'list'] as const,
  list: (filter?: NotificationFilter) => [...notificationKeys.lists(), filter] as const,
  stats: () => [...notificationKeys.all, 'stats'] as const,
  preferences: () => [...notificationKeys.all, 'preferences'] as const,
  templates: () => [...notificationKeys.all, 'templates'] as const,
};

// Hook for fetching notifications
export const useNotificationsList = (params?: {
  page?: number;
  per_page?: number;
  filter?: NotificationFilter;
}) => {
  return useQuery({
    queryKey: notificationKeys.list(params?.filter),
    queryFn: () => notificationService.getNotifications(params),
    staleTime: 30000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook for fetching notification statistics
export const useNotificationStats = () => {
  return useQuery({
    queryKey: notificationKeys.stats(),
    queryFn: () => notificationService.getNotificationStats(),
    staleTime: 60000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook for fetching notification preferences
export const useNotificationPreferences = () => {
  return useQuery({
    queryKey: notificationKeys.preferences(),
    queryFn: () => notificationService.getPreferences(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Hook for marking notification as read
export const useMarkAsRead = () => {
  const queryClient = useQueryClient();
  const { markAsRead } = useNotifications();

  return useMutation({
    mutationFn: (notificationId: string) => notificationService.markAsRead(notificationId),
    onSuccess: (_, notificationId) => {
      // Update local state
      markAsRead(notificationId);
      
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: notificationKeys.lists() });
      queryClient.invalidateQueries({ queryKey: notificationKeys.stats() });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to mark notification as read.',
        variant: 'destructive',
      });
      console.error('Failed to mark notification as read:', error);
    },
  });
};

// Hook for marking multiple notifications as read
export const useMarkMultipleAsRead = () => {
  const queryClient = useQueryClient();
  const { markAsRead } = useNotifications();

  return useMutation({
    mutationFn: (notificationIds: string[]) => notificationService.markMultipleAsRead(notificationIds),
    onSuccess: (_, notificationIds) => {
      // Update local state
      markAsRead(notificationIds);
      
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: notificationKeys.lists() });
      queryClient.invalidateQueries({ queryKey: notificationKeys.stats() });
      
      toast({
        title: 'Success',
        description: `${notificationIds.length} notifications marked as read.`,
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to mark notifications as read.',
        variant: 'destructive',
      });
      console.error('Failed to mark notifications as read:', error);
    },
  });
};

// Hook for marking all notifications as read
export const useMarkAllAsRead = () => {
  const queryClient = useQueryClient();
  const { markAllAsRead } = useNotifications();

  return useMutation({
    mutationFn: () => notificationService.markAllAsRead(),
    onSuccess: () => {
      // Update local state
      markAllAsRead();
      
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: notificationKeys.lists() });
      queryClient.invalidateQueries({ queryKey: notificationKeys.stats() });
      
      toast({
        title: 'Success',
        description: 'All notifications marked as read.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to mark all notifications as read.',
        variant: 'destructive',
      });
      console.error('Failed to mark all notifications as read:', error);
    },
  });
};

// Hook for deleting notification
export const useDeleteNotification = () => {
  const queryClient = useQueryClient();
  const { removeNotification } = useNotifications();

  return useMutation({
    mutationFn: (notificationId: string) => notificationService.deleteNotification(notificationId),
    onSuccess: (_, notificationId) => {
      // Update local state
      removeNotification(notificationId);
      
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: notificationKeys.lists() });
      queryClient.invalidateQueries({ queryKey: notificationKeys.stats() });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to delete notification.',
        variant: 'destructive',
      });
      console.error('Failed to delete notification:', error);
    },
  });
};

// Hook for clearing all notifications
export const useClearAllNotifications = () => {
  const queryClient = useQueryClient();
  const { clearAllNotifications } = useNotifications();

  return useMutation({
    mutationFn: () => notificationService.clearAllNotifications(),
    onSuccess: () => {
      // Update local state
      clearAllNotifications();
      
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: notificationKeys.lists() });
      queryClient.invalidateQueries({ queryKey: notificationKeys.stats() });
      
      toast({
        title: 'Success',
        description: 'All notifications cleared.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to clear notifications.',
        variant: 'destructive',
      });
      console.error('Failed to clear notifications:', error);
    },
  });
};

// Hook for updating notification preferences
export const useUpdateNotificationPreferences = () => {
  const queryClient = useQueryClient();
  const { updatePreferences } = useNotifications();

  return useMutation({
    mutationFn: (preferences: Partial<NotificationPreferences>) => 
      notificationService.updatePreferences(preferences),
    onSuccess: (updatedPreferences) => {
      // Update local state
      updatePreferences(updatedPreferences);
      
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: notificationKeys.preferences() });
      
      toast({
        title: 'Success',
        description: 'Notification preferences updated successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to update notification preferences.',
        variant: 'destructive',
      });
      console.error('Failed to update notification preferences:', error);
    },
  });
};

// Hook for creating notification (admin only)
export const useCreateNotification = () => {
  const queryClient = useQueryClient();
  const { addNotification } = useNotifications();

  return useMutation({
    mutationFn: (notification: CreateNotificationRequest) => 
      notificationService.createNotification(notification),
    onSuccess: (createdNotification) => {
      // Add to local state if it's for the current user
      addNotification({
        title: createdNotification.title,
        message: createdNotification.message,
        type: createdNotification.type,
        priority: createdNotification.priority,
        category: createdNotification.category,
        read: false,
        persistent: createdNotification.persistent,
        actions: createdNotification.actions,
        metadata: createdNotification.metadata,
      });
      
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: notificationKeys.lists() });
      queryClient.invalidateQueries({ queryKey: notificationKeys.stats() });
      
      toast({
        title: 'Success',
        description: 'Notification created successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to create notification.',
        variant: 'destructive',
      });
      console.error('Failed to create notification:', error);
    },
  });
};

// Hook for sending bulk notifications (admin only)
export const useSendBulkNotifications = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 
      userIds, 
      notification 
    }: { 
      userIds: number[]; 
      notification: Omit<CreateNotificationRequest, 'userId'> 
    }) => notificationService.sendBulkNotifications(userIds, notification),
    onSuccess: (_, { userIds }) => {
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: notificationKeys.lists() });
      queryClient.invalidateQueries({ queryKey: notificationKeys.stats() });
      
      toast({
        title: 'Success',
        description: `Notification sent to ${userIds.length} users.`,
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to send bulk notifications.',
        variant: 'destructive',
      });
      console.error('Failed to send bulk notifications:', error);
    },
  });
};

// Hook for fetching notification templates (admin only)
export const useNotificationTemplates = () => {
  return useQuery({
    queryKey: notificationKeys.templates(),
    queryFn: () => notificationService.getTemplates(),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
};

// Hook for testing notification delivery
export const useTestNotification = () => {
  return useMutation({
    mutationFn: (type: 'email' | 'push' | 'sms') => notificationService.testNotification(type),
    onSuccess: (_, type) => {
      toast({
        title: 'Test Sent',
        description: `Test ${type} notification sent successfully.`,
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to send test notification.',
        variant: 'destructive',
      });
      console.error('Failed to send test notification:', error);
    },
  });
};