import { toast } from '@/hooks/use-toast';
import { config } from './config';

// Notification types
export enum NotificationType {
  SUCCESS = 'success',
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info',
}

// Notification priorities
export enum NotificationPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export interface NotificationOptions {
  title: string;
  message: string;
  type: NotificationType;
  priority?: NotificationPriority;
  duration?: number;
  persistent?: boolean;
  actions?: Array<{
    label: string;
    action: () => void;
  }>;
  data?: any;
}

export class NotificationManager {
  private static instance: NotificationManager;
  private notifications: Map<string, NotificationOptions> = new Map();
  private listeners: Set<(notification: NotificationOptions) => void> = new Set();

  static getInstance(): NotificationManager {
    if (!NotificationManager.instance) {
      NotificationManager.instance = new NotificationManager();
    }
    return NotificationManager.instance;
  }

  // Show notification
  show(options: NotificationOptions): string {
    const id = this.generateId();
    this.notifications.set(id, options);

    // Show toast notification
    this.showToast(options);

    // Notify listeners
    this.listeners.forEach(listener => listener(options));

    // Auto-remove non-persistent notifications
    if (!options.persistent) {
      const duration = options.duration || this.getDefaultDuration(options.type);
      setTimeout(() => {
        this.remove(id);
      }, duration);
    }

    return id;
  }

  // Remove notification
  remove(id: string): void {
    this.notifications.delete(id);
  }

  // Clear all notifications
  clear(): void {
    this.notifications.clear();
  }

  // Get all notifications
  getAll(): NotificationOptions[] {
    return Array.from(this.notifications.values());
  }

  // Subscribe to notifications
  subscribe(listener: (notification: NotificationOptions) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  // Show success notification
  success(title: string, message: string, options?: Partial<NotificationOptions>): string {
    return this.show({
      title,
      message,
      type: NotificationType.SUCCESS,
      ...options,
    });
  }

  // Show error notification
  error(title: string, message: string, options?: Partial<NotificationOptions>): string {
    return this.show({
      title,
      message,
      type: NotificationType.ERROR,
      priority: NotificationPriority.HIGH,
      ...options,
    });
  }

  // Show warning notification
  warning(title: string, message: string, options?: Partial<NotificationOptions>): string {
    return this.show({
      title,
      message,
      type: NotificationType.WARNING,
      priority: NotificationPriority.MEDIUM,
      ...options,
    });
  }

  // Show info notification
  info(title: string, message: string, options?: Partial<NotificationOptions>): string {
    return this.show({
      title,
      message,
      type: NotificationType.INFO,
      ...options,
    });
  }

  private showToast(options: NotificationOptions): void {
    const variant = this.getToastVariant(options.type);
    const duration = options.persistent ? 0 : (options.duration || this.getDefaultDuration(options.type));

    toast({
      title: options.title,
      description: options.message,
      variant,
      duration,
    });
  }

  private getToastVariant(type: NotificationType): 'default' | 'destructive' {
    switch (type) {
      case NotificationType.ERROR:
        return 'destructive';
      default:
        return 'default';
    }
  }

  private getDefaultDuration(type: NotificationType): number {
    switch (type) {
      case NotificationType.SUCCESS:
        return 3000;
      case NotificationType.INFO:
        return 4000;
      case NotificationType.WARNING:
        return 5000;
      case NotificationType.ERROR:
        return 6000;
      default:
        return 4000;
    }
  }

  private generateId(): string {
    return `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Global notification manager instance
export const notifications = NotificationManager.getInstance();

// Convenience functions
export const showSuccess = (title: string, message: string, options?: Partial<NotificationOptions>) =>
  notifications.success(title, message, options);

export const showError = (title: string, message: string, options?: Partial<NotificationOptions>) =>
  notifications.error(title, message, options);

export const showWarning = (title: string, message: string, options?: Partial<NotificationOptions>) =>
  notifications.warning(title, message, options);

export const showInfo = (title: string, message: string, options?: Partial<NotificationOptions>) =>
  notifications.info(title, message, options);

// API event listeners for automatic notifications
export const setupApiNotifications = (): void => {
  // Listen for API success events
  window.addEventListener('api:success', (event: any) => {
    const { message, data } = event.detail;
    showSuccess('Success', message);
  });

  // Listen for API error events
  window.addEventListener('api:error', (event: any) => {
    const { userMessage, severity } = event.detail;
    if (severity === 'critical') {
      showError('Critical Error', userMessage, { persistent: true });
    } else if (severity === 'high') {
      showError('Error', userMessage);
    } else if (severity === 'medium') {
      showWarning('Warning', userMessage);
    } else {
      showInfo('Notice', userMessage);
    }
  });

  // Listen for auth events
  window.addEventListener('auth:logout', () => {
    showInfo('Session Expired', 'Please log in again to continue.');
  });

  // Listen for network events
  window.addEventListener('online', () => {
    showSuccess('Connection Restored', 'You are back online.');
  });

  window.addEventListener('offline', () => {
    showWarning('Connection Lost', 'You are currently offline. Some features may not work.');
  });
};

// Initialize API notifications if enabled
if (config.features.enableRealTimeUpdates) {
  setupApiNotifications();
}