import { api } from '@/lib/api';
import { 
  NotificationData, 
  NotificationPreferences, 
  NotificationFilter,
  NotificationStats,
  NotificationType,
  NotificationCategory,
  NotificationPriority
} from '@/types/notifications';

export interface CreateNotificationRequest {
  title: string;
  message: string;
  type: NotificationType;
  priority: NotificationPriority;
  category: NotificationCategory;
  persistent?: boolean;
  userId?: number;
  metadata?: Record<string, any>;
}

export interface NotificationResponse {
  data: NotificationData[];
  meta: {
    total: number;
    page: number;
    per_page: number;
    last_page: number;
  };
}

class NotificationService {
  // Get user notifications
  async getNotifications(params?: {
    page?: number;
    per_page?: number;
    filter?: NotificationFilter;
  }): Promise<NotificationResponse> {
    try {
      const response = await api.get('/notifications', { params });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      throw error;
    }
  }

  // Get notification statistics
  async getNotificationStats(): Promise<NotificationStats> {
    try {
      const response = await api.get('/notifications/stats');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch notification stats:', error);
      throw error;
    }
  }

  // Mark notification as read
  async markAsRead(notificationId: string): Promise<void> {
    try {
      await api.patch(`/notifications/${notificationId}/read`);
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      throw error;
    }
  }

  // Mark multiple notifications as read
  async markMultipleAsRead(notificationIds: string[]): Promise<void> {
    try {
      await api.patch('/notifications/mark-read', {
        notification_ids: notificationIds,
      });
    } catch (error) {
      console.error('Failed to mark notifications as read:', error);
      throw error;
    }
  }

  // Mark all notifications as read
  async markAllAsRead(): Promise<void> {
    try {
      await api.patch('/notifications/mark-all-read');
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      throw error;
    }
  }

  // Delete notification
  async deleteNotification(notificationId: string): Promise<void> {
    try {
      await api.delete(`/notifications/${notificationId}`);
    } catch (error) {
      console.error('Failed to delete notification:', error);
      throw error;
    }
  }

  // Clear all notifications
  async clearAllNotifications(): Promise<void> {
    try {
      await api.delete('/notifications');
    } catch (error) {
      console.error('Failed to clear all notifications:', error);
      throw error;
    }
  }

  // Get user notification preferences
  async getPreferences(): Promise<NotificationPreferences> {
    try {
      const response = await api.get('/notifications/preferences');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch notification preferences:', error);
      throw error;
    }
  }

  // Update user notification preferences
  async updatePreferences(preferences: Partial<NotificationPreferences>): Promise<NotificationPreferences> {
    try {
      const response = await api.patch('/notifications/preferences', preferences);
      return response.data;
    } catch (error) {
      console.error('Failed to update notification preferences:', error);
      throw error;
    }
  }

  // Create notification (admin only)
  async createNotification(notification: CreateNotificationRequest): Promise<NotificationData> {
    try {
      const response = await api.post('/notifications', notification);
      return response.data;
    } catch (error) {
      console.error('Failed to create notification:', error);
      throw error;
    }
  }

  // Send bulk notifications (admin only)
  async sendBulkNotifications(
    userIds: number[],
    notification: Omit<CreateNotificationRequest, 'userId'>
  ): Promise<void> {
    try {
      await api.post('/notifications/bulk', {
        user_ids: userIds,
        ...notification,
      });
    } catch (error) {
      console.error('Failed to send bulk notifications:', error);
      throw error;
    }
  }

  // Get notification templates (admin only)
  async getTemplates(): Promise<any[]> {
    try {
      const response = await api.get('/notifications/templates');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch notification templates:', error);
      throw error;
    }
  }

  // Test notification delivery
  async testNotification(type: 'email' | 'push' | 'sms'): Promise<void> {
    try {
      await api.post('/notifications/test', { type });
    } catch (error) {
      console.error('Failed to send test notification:', error);
      throw error;
    }
  }
}

export const notificationService = new NotificationService();

// Utility functions for common notification scenarios
export const createQuizNotification = (quizTitle: string, userId?: number) => {
  return notificationService.createNotification({
    title: 'New Quiz Available',
    message: `A new quiz "${quizTitle}" has been assigned to you.`,
    type: NotificationType.INFO,
    priority: NotificationPriority.MEDIUM,
    category: NotificationCategory.QUIZ,
    persistent: false,
    userId,
  });
};

export const createMeetingNotification = (meetingTitle: string, scheduledAt: string, userId?: number) => {
  return notificationService.createNotification({
    title: 'Meeting Scheduled',
    message: `You have been invited to "${meetingTitle}" scheduled for ${new Date(scheduledAt).toLocaleString()}.`,
    type: NotificationType.INFO,
    priority: NotificationPriority.HIGH,
    category: NotificationCategory.MEETING,
    persistent: false,
    userId,
    metadata: { meetingTitle, scheduledAt },
  });
};

export const createEnrollmentNotification = (programName: string, status: 'approved' | 'rejected', userId?: number) => {
  return notificationService.createNotification({
    title: 'Enrollment Status Updated',
    message: `Your enrollment in "${programName}" has been ${status}.`,
    type: status === 'approved' ? NotificationType.SUCCESS : NotificationType.WARNING,
    priority: NotificationPriority.HIGH,
    category: NotificationCategory.ENROLLMENT,
    persistent: false,
    userId,
    metadata: { programName, status },
  });
};

export const createSystemNotification = (title: string, message: string, priority: NotificationPriority = NotificationPriority.MEDIUM) => {
  return notificationService.createNotification({
    title,
    message,
    type: NotificationType.INFO,
    priority,
    category: NotificationCategory.SYSTEM,
    persistent: priority === NotificationPriority.CRITICAL,
  });
};