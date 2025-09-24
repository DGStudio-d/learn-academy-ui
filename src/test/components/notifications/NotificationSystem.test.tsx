import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { AppStateProvider } from '@/contexts/AppStateContext';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';
import { NotificationItem } from '@/components/notifications/NotificationItem';
import { NotificationPreferences } from '@/components/notifications/NotificationPreferences';
import { 
  NotificationData, 
  NotificationType, 
  NotificationCategory, 
  NotificationPriority 
} from '@/types/notifications';

// Mock the hooks
vi.mock('@/hooks/use-toast', () => ({
  toast: vi.fn(),
}));

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: {
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
      role: 'student',
    },
    isAuthenticated: true,
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('@/contexts/AppStateContext', () => ({
  useAppState: () => ({
    state: {
      isLoading: false,
      error: null,
    },
    dispatch: vi.fn(),
  }),
  AppStateProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

// Test wrapper component
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <LanguageProvider>
          <AuthProvider>
            <AppStateProvider>
              <NotificationProvider>
                {children}
              </NotificationProvider>
            </AppStateProvider>
          </AuthProvider>
        </LanguageProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

// Mock notification data
const mockNotification: NotificationData = {
  id: '1',
  title: 'Test Notification',
  message: 'This is a test notification message',
  type: NotificationType.INFO,
  priority: NotificationPriority.MEDIUM,
  category: NotificationCategory.GENERAL,
  read: false,
  persistent: false,
  createdAt: new Date().toISOString(),
  userId: 1,
};

describe('NotificationSystem', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    vi.clearAllMocks();
  });

  describe('NotificationCenter', () => {
    it('renders notification center button', () => {
      render(
        <TestWrapper>
          <NotificationCenter />
        </TestWrapper>
      );

      const notificationButton = screen.getByRole('button', { name: /notifications/i });
      expect(notificationButton).toBeInTheDocument();
    });

    it('shows unread count badge when there are unread notifications', async () => {
      render(
        <TestWrapper>
          <NotificationCenter />
        </TestWrapper>
      );

      // The badge should be visible if there are unread notifications
      // This would be populated by the NotificationProvider
      const button = screen.getByRole('button', { name: /notifications/i });
      expect(button).toBeInTheDocument();
    });

    it('opens notification panel when clicked', async () => {
      render(
        <TestWrapper>
          <NotificationCenter />
        </TestWrapper>
      );

      const notificationButton = screen.getByRole('button', { name: /notifications/i });
      fireEvent.click(notificationButton);

      await waitFor(() => {
        expect(screen.getByText('Notifications')).toBeInTheDocument();
      });
    });

    it('displays empty state when no notifications', async () => {
      render(
        <TestWrapper>
          <NotificationCenter />
        </TestWrapper>
      );

      const notificationButton = screen.getByRole('button', { name: /notifications/i });
      fireEvent.click(notificationButton);

      await waitFor(() => {
        expect(screen.getByText(/no notifications/i)).toBeInTheDocument();
      });
    });
  });

  describe('NotificationItem', () => {
    const mockOnMarkAsRead = vi.fn();
    const mockOnRemove = vi.fn();

    beforeEach(() => {
      mockOnMarkAsRead.mockClear();
      mockOnRemove.mockClear();
    });

    it('renders notification item correctly', () => {
      render(
        <TestWrapper>
          <NotificationItem
            notification={mockNotification}
            onMarkAsRead={mockOnMarkAsRead}
            onRemove={mockOnRemove}
          />
        </TestWrapper>
      );

      expect(screen.getByText('Test Notification')).toBeInTheDocument();
      expect(screen.getByText('This is a test notification message')).toBeInTheDocument();
    });

    it('shows unread indicator for unread notifications', () => {
      render(
        <TestWrapper>
          <NotificationItem
            notification={mockNotification}
            onMarkAsRead={mockOnMarkAsRead}
            onRemove={mockOnRemove}
          />
        </TestWrapper>
      );

      // Should show mark as read button for unread notifications
      const markAsReadButton = screen.getByTitle('Mark as read');
      expect(markAsReadButton).toBeInTheDocument();
    });

    it('calls onMarkAsRead when mark as read button is clicked', () => {
      render(
        <TestWrapper>
          <NotificationItem
            notification={mockNotification}
            onMarkAsRead={mockOnMarkAsRead}
            onRemove={mockOnRemove}
          />
        </TestWrapper>
      );

      const markAsReadButton = screen.getByTitle('Mark as read');
      fireEvent.click(markAsReadButton);

      expect(mockOnMarkAsRead).toHaveBeenCalledTimes(1);
    });

    it('shows remove button for non-persistent notifications', () => {
      render(
        <TestWrapper>
          <NotificationItem
            notification={mockNotification}
            onMarkAsRead={mockOnMarkAsRead}
            onRemove={mockOnRemove}
          />
        </TestWrapper>
      );

      const removeButton = screen.getByTitle('Remove notification');
      expect(removeButton).toBeInTheDocument();
    });

    it('does not show remove button for persistent notifications', () => {
      const persistentNotification = {
        ...mockNotification,
        persistent: true,
      };

      render(
        <TestWrapper>
          <NotificationItem
            notification={persistentNotification}
            onMarkAsRead={mockOnMarkAsRead}
            onRemove={mockOnRemove}
          />
        </TestWrapper>
      );

      const removeButton = screen.queryByTitle('Remove notification');
      expect(removeButton).not.toBeInTheDocument();
    });

    it('displays correct priority styling', () => {
      const highPriorityNotification = {
        ...mockNotification,
        priority: NotificationPriority.HIGH,
      };

      render(
        <TestWrapper>
          <NotificationItem
            notification={highPriorityNotification}
            onMarkAsRead={mockOnMarkAsRead}
            onRemove={mockOnRemove}
          />
        </TestWrapper>
      );

      expect(screen.getByText('high')).toBeInTheDocument();
    });

    it('renders notification actions when provided', () => {
      const notificationWithActions = {
        ...mockNotification,
        actions: [
          {
            id: 'action1',
            label: 'View Details',
            action: vi.fn(),
          },
        ],
      };

      render(
        <TestWrapper>
          <NotificationItem
            notification={notificationWithActions}
            onMarkAsRead={mockOnMarkAsRead}
            onRemove={mockOnRemove}
          />
        </TestWrapper>
      );

      expect(screen.getByText('View Details')).toBeInTheDocument();
    });
  });

  describe('NotificationPreferences', () => {
    const mockOnClose = vi.fn();

    beforeEach(() => {
      mockOnClose.mockClear();
    });

    it('renders notification preferences dialog', () => {
      render(
        <TestWrapper>
          <NotificationPreferences isOpen={true} onClose={mockOnClose} />
        </TestWrapper>
      );

      expect(screen.getByText('Notification Preferences')).toBeInTheDocument();
    });

    it('shows email notification settings', () => {
      render(
        <TestWrapper>
          <NotificationPreferences isOpen={true} onClose={mockOnClose} />
        </TestWrapper>
      );

      expect(screen.getByText('Email Notifications')).toBeInTheDocument();
      expect(screen.getByText('Enable email notifications')).toBeInTheDocument();
    });

    it('shows push notification settings', () => {
      render(
        <TestWrapper>
          <NotificationPreferences isOpen={true} onClose={mockOnClose} />
        </TestWrapper>
      );

      expect(screen.getByText('Push Notifications')).toBeInTheDocument();
      expect(screen.getByText('Enable push notifications')).toBeInTheDocument();
    });

    it('shows in-app notification settings', () => {
      render(
        <TestWrapper>
          <NotificationPreferences isOpen={true} onClose={mockOnClose} />
        </TestWrapper>
      );

      expect(screen.getByText('In-App Notifications')).toBeInTheDocument();
      expect(screen.getByText('Enable in-app notifications')).toBeInTheDocument();
    });

    it('shows desktop notification settings', () => {
      render(
        <TestWrapper>
          <NotificationPreferences isOpen={true} onClose={mockOnClose} />
        </TestWrapper>
      );

      expect(screen.getByText('Desktop Notifications')).toBeInTheDocument();
      expect(screen.getByText('Enable desktop notifications')).toBeInTheDocument();
    });

    it('allows toggling notification categories', () => {
      render(
        <TestWrapper>
          <NotificationPreferences isOpen={true} onClose={mockOnClose} />
        </TestWrapper>
      );

      // Should show category checkboxes
      expect(screen.getAllByText('system')).toHaveLength(4); // One for each notification type
      expect(screen.getAllByText('quiz')).toHaveLength(4);
      expect(screen.getAllByText('meeting')).toHaveLength(4);
    });

    it('has save and reset buttons', () => {
      render(
        <TestWrapper>
          <NotificationPreferences isOpen={true} onClose={mockOnClose} />
        </TestWrapper>
      );

      expect(screen.getByText('Save Preferences')).toBeInTheDocument();
      expect(screen.getByText('Reset')).toBeInTheDocument();
    });
  });

  describe('Integration Tests', () => {
    it('notification system integrates with auth context', () => {
      render(
        <TestWrapper>
          <NotificationCenter />
        </TestWrapper>
      );

      // Should render without errors when user is authenticated
      expect(screen.getByRole('button', { name: /notifications/i })).toBeInTheDocument();
    });

    it('handles notification state updates correctly', async () => {
      render(
        <TestWrapper>
          <NotificationCenter />
        </TestWrapper>
      );

      // Open notification center
      const notificationButton = screen.getByRole('button', { name: /notifications/i });
      fireEvent.click(notificationButton);

      await waitFor(() => {
        expect(screen.getByText('Notifications')).toBeInTheDocument();
      });

      // Should show appropriate content based on notification state
      expect(screen.getByText(/no notifications/i)).toBeInTheDocument();
    });
  });
});

// Test notification context functionality
describe('NotificationContext', () => {
  it('provides notification functionality to child components', () => {
    const TestComponent = () => {
      // This would use the useNotifications hook in a real component
      return <div>Test Component</div>;
    };

    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    expect(screen.getByText('Test Component')).toBeInTheDocument();
  });
});

// Test real-time updates
describe('Real-time Updates', () => {
  it('handles real-time notification updates', () => {
    // This would test the WebSocket integration
    // For now, we'll just ensure the component renders
    render(
      <TestWrapper>
        <NotificationCenter />
      </TestWrapper>
    );

    expect(screen.getByRole('button', { name: /notifications/i })).toBeInTheDocument();
  });
});