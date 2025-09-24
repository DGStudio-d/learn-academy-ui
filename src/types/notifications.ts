// Notification System Types

export interface NotificationData {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  priority: NotificationPriority;
  category: NotificationCategory;
  read: boolean;
  persistent: boolean;
  actions?: NotificationAction[];
  metadata?: Record<string, any>;
  userId?: number;
  createdAt: string;
  readAt?: string;
  expiresAt?: string;
}

export enum NotificationType {
  SUCCESS = 'success',
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info',
}

export enum NotificationPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum NotificationCategory {
  SYSTEM = 'system',
  QUIZ = 'quiz',
  MEETING = 'meeting',
  ENROLLMENT = 'enrollment',
  USER = 'user',
  GENERAL = 'general',
}

export interface NotificationAction {
  id: string;
  label: string;
  action: () => void | Promise<void>;
  variant?: 'default' | 'destructive' | 'outline';
}

export interface NotificationPreferences {
  userId: number;
  email: {
    enabled: boolean;
    categories: NotificationCategory[];
    frequency: 'immediate' | 'daily' | 'weekly';
  };
  push: {
    enabled: boolean;
    categories: NotificationCategory[];
  };
  inApp: {
    enabled: boolean;
    categories: NotificationCategory[];
    showToasts: boolean;
    autoMarkAsRead: boolean;
    soundEnabled: boolean;
  };
  desktop: {
    enabled: boolean;
    categories: NotificationCategory[];
  };
}

export interface NotificationFilter {
  type?: NotificationType;
  category?: NotificationCategory;
  priority?: NotificationPriority;
  read?: boolean;
  dateFrom?: string;
  dateTo?: string;
}

export interface NotificationStats {
  total: number;
  unread: number;
  byType: Record<NotificationType, number>;
  byCategory: Record<NotificationCategory, number>;
  byPriority: Record<NotificationPriority, number>;
}

export interface RealTimeUpdate {
  type: 'notification' | 'data_update' | 'user_activity';
  payload: any;
  timestamp: string;
  userId?: number;
}

export interface DataUpdateEvent {
  entity: string; // 'quiz', 'meeting', 'enrollment', etc.
  action: 'created' | 'updated' | 'deleted';
  id: string | number;
  data?: any;
  affectedUsers?: number[];
}