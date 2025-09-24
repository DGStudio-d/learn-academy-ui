import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNotifications } from '@/contexts/NotificationContext';
import { 
  NotificationType, 
  NotificationCategory, 
  NotificationPriority 
} from '@/types/notifications';

export const NotificationDemo: React.FC = () => {
  const { showSuccess, showError, showWarning, showInfo, addNotification } = useNotifications();

  const handleShowSuccess = () => {
    showSuccess(
      'Success!', 
      'This is a success notification message.',
      { category: NotificationCategory.GENERAL }
    );
  };

  const handleShowError = () => {
    showError(
      'Error!', 
      'This is an error notification message.',
      { category: NotificationCategory.SYSTEM }
    );
  };

  const handleShowWarning = () => {
    showWarning(
      'Warning!', 
      'This is a warning notification message.',
      { category: NotificationCategory.GENERAL }
    );
  };

  const handleShowInfo = () => {
    showInfo(
      'Information', 
      'This is an info notification message.',
      { category: NotificationCategory.GENERAL }
    );
  };

  const handleShowQuizNotification = () => {
    addNotification({
      title: 'New Quiz Available',
      message: 'A new quiz "React Fundamentals" has been assigned to you.',
      type: NotificationType.INFO,
      priority: NotificationPriority.MEDIUM,
      category: NotificationCategory.QUIZ,
      read: false,
      persistent: false,
      actions: [
        {
          id: 'take-quiz',
          label: 'Take Quiz',
          action: () => alert('Taking quiz...'),
          variant: 'default',
        },
        {
          id: 'view-later',
          label: 'Later',
          action: () => alert('Marked for later...'),
          variant: 'outline',
        },
      ],
    });
  };

  const handleShowMeetingNotification = () => {
    addNotification({
      title: 'Meeting Reminder',
      message: 'Your meeting "Weekly Standup" starts in 15 minutes.',
      type: NotificationType.WARNING,
      priority: NotificationPriority.HIGH,
      category: NotificationCategory.MEETING,
      read: false,
      persistent: true,
      actions: [
        {
          id: 'join-meeting',
          label: 'Join Now',
          action: () => alert('Joining meeting...'),
          variant: 'default',
        },
      ],
    });
  };

  const handleShowCriticalNotification = () => {
    addNotification({
      title: 'System Maintenance',
      message: 'The system will undergo maintenance in 30 minutes. Please save your work.',
      type: NotificationType.ERROR,
      priority: NotificationPriority.CRITICAL,
      category: NotificationCategory.SYSTEM,
      read: false,
      persistent: true,
    });
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Notification System Demo</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Button onClick={handleShowSuccess} variant="default">
            Show Success
          </Button>
          <Button onClick={handleShowError} variant="destructive">
            Show Error
          </Button>
          <Button onClick={handleShowWarning} variant="outline">
            Show Warning
          </Button>
          <Button onClick={handleShowInfo} variant="secondary">
            Show Info
          </Button>
        </div>
        
        <div className="border-t pt-4">
          <h3 className="text-lg font-medium mb-3">Contextual Notifications</h3>
          <div className="grid grid-cols-1 gap-2">
            <Button onClick={handleShowQuizNotification} variant="outline">
              Quiz Notification (with actions)
            </Button>
            <Button onClick={handleShowMeetingNotification} variant="outline">
              Meeting Notification (persistent)
            </Button>
            <Button onClick={handleShowCriticalNotification} variant="destructive">
              Critical System Notification
            </Button>
          </div>
        </div>

        <div className="border-t pt-4 text-sm text-muted-foreground">
          <p>
            Click the notification bell in the header to view all notifications.
            Try different notification types to see how they appear in the notification center.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};