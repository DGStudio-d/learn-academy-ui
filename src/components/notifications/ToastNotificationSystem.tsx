import React, { useEffect } from 'react';
import { useNotifications } from '@/contexts/NotificationContext';
import { toast } from '@/hooks/use-toast';
import { 
  CheckCircle, 
  AlertCircle, 
  AlertTriangle, 
  Info,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NotificationType } from '@/types/notifications';

export const ToastNotificationSystem: React.FC = () => {
  const { state } = useNotifications();

  // Listen for new notifications and show toasts
  useEffect(() => {
    // Get the most recent notification
    const latestNotification = state.notifications[0];
    
    if (latestNotification && !latestNotification.read && state.preferences?.inApp.showToasts) {
      const getIcon = (type: NotificationType) => {
        switch (type) {
          case NotificationType.SUCCESS:
            return <CheckCircle className="h-4 w-4 text-green-500" />;
          case NotificationType.ERROR:
            return <AlertCircle className="h-4 w-4 text-red-500" />;
          case NotificationType.WARNING:
            return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
          case NotificationType.INFO:
          default:
            return <Info className="h-4 w-4 text-blue-500" />;
        }
      };

      const getVariant = (type: NotificationType): 'default' | 'destructive' => {
        return type === NotificationType.ERROR ? 'destructive' : 'default';
      };

      // Show toast with custom content
      toast({
        title: (
          <div className="flex items-center gap-2">
            {getIcon(latestNotification.type)}
            <span>{latestNotification.title}</span>
          </div>
        ),
        description: latestNotification.message,
        variant: getVariant(latestNotification.type),
        duration: latestNotification.persistent ? 0 : undefined,
        action: latestNotification.actions && latestNotification.actions.length > 0 ? (
          <div className="flex gap-2">
            {latestNotification.actions.slice(0, 2).map((action) => (
              <Button
                key={action.id}
                variant={action.variant || 'outline'}
                size="sm"
                onClick={action.action}
                className="text-xs"
              >
                {action.label}
              </Button>
            ))}
          </div>
        ) : undefined,
      });
    }
  }, [state.notifications, state.preferences?.inApp.showToasts]);

  // This component doesn't render anything visible
  return null;
};