import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { 
  AlertCircle, 
  CheckCircle, 
  Info, 
  AlertTriangle, 
  Clock, 
  User, 
  BookOpen, 
  Video, 
  Users,
  Settings,
  Check,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  NotificationData, 
  NotificationType, 
  NotificationCategory, 
  NotificationPriority 
} from '@/types/notifications';
import { useNotifications } from '@/contexts/NotificationContext';
import { cn } from '@/lib/utils';

interface NotificationItemProps {
  notification: NotificationData;
  onMarkAsRead: () => void;
  onRemove: () => void;
  compact?: boolean;
}

export const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onMarkAsRead,
  onRemove,
  compact = false,
}) => {
  const { removeNotification } = useNotifications();

  const getTypeIcon = (type: NotificationType) => {
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

  const getCategoryIcon = (category: NotificationCategory) => {
    switch (category) {
      case NotificationCategory.SYSTEM:
        return <Settings className="h-3 w-3" />;
      case NotificationCategory.QUIZ:
        return <BookOpen className="h-3 w-3" />;
      case NotificationCategory.MEETING:
        return <Video className="h-3 w-3" />;
      case NotificationCategory.ENROLLMENT:
        return <Users className="h-3 w-3" />;
      case NotificationCategory.USER:
        return <User className="h-3 w-3" />;
      case NotificationCategory.GENERAL:
      default:
        return <Info className="h-3 w-3" />;
    }
  };

  const getPriorityColor = (priority: NotificationPriority) => {
    switch (priority) {
      case NotificationPriority.CRITICAL:
        return 'border-red-500 bg-red-50 dark:bg-red-950';
      case NotificationPriority.HIGH:
        return 'border-orange-500 bg-orange-50 dark:bg-orange-950';
      case NotificationPriority.MEDIUM:
        return 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950';
      case NotificationPriority.LOW:
      default:
        return 'border-gray-200 bg-gray-50 dark:bg-gray-950';
    }
  };

  const handleRemove = () => {
    removeNotification(notification.id);
    onRemove();
  };

  const timeAgo = formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true });

  return (
    <Card 
      className={cn(
        "transition-all duration-200 hover:shadow-md",
        !notification.read && "ring-2 ring-blue-500/20",
        getPriorityColor(notification.priority),
        compact && "p-2"
      )}
    >
      <CardContent className={cn("p-4", compact && "p-3")}>
        <div className="flex items-start gap-3">
          {/* Type Icon */}
          <div className="flex-shrink-0 mt-0.5">
            {getTypeIcon(notification.type)}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className={cn(
                    "font-medium text-sm",
                    !notification.read && "font-semibold"
                  )}>
                    {notification.title}
                  </h4>
                  
                  {/* Category Badge */}
                  <Badge variant="outline" className="text-xs">
                    <span className="mr-1">{getCategoryIcon(notification.category)}</span>
                    {notification.category}
                  </Badge>

                  {/* Unread Indicator */}
                  {!notification.read && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                  )}
                </div>

                <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                  {notification.message}
                </p>

                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {timeAgo}
                  </div>
                  
                  {notification.priority !== NotificationPriority.LOW && (
                    <Badge 
                      variant={notification.priority === NotificationPriority.CRITICAL ? 'destructive' : 'secondary'}
                      className="text-xs"
                    >
                      {notification.priority}
                    </Badge>
                  )}
                </div>

                {/* Actions */}
                {notification.actions && notification.actions.length > 0 && (
                  <div className="flex gap-2 mt-3">
                    {notification.actions.map((action) => (
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
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1 flex-shrink-0">
                {!notification.read && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={onMarkAsRead}
                    title="Mark as read"
                  >
                    <Check className="h-3 w-3" />
                  </Button>
                )}
                
                {!notification.persistent && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-muted-foreground hover:text-destructive"
                    onClick={handleRemove}
                    title="Remove notification"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};