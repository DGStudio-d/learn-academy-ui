import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Bell, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

const NotificationDemo: React.FC = () => {
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
    timestamp: Date;
  }>>([]);

  const addNotification = (type: 'success' | 'error' | 'warning' | 'info') => {
    const messages = {
      success: { title: 'Success!', message: 'Operation completed successfully' },
      error: { title: 'Error!', message: 'Something went wrong' },
      warning: { title: 'Warning!', message: 'Please check your input' },
      info: { title: 'Info', message: 'Here is some information' }
    };

    const newNotification = {
      id: Date.now().toString(),
      type,
      ...messages[type],
      timestamp: new Date()
    };

    setNotifications(prev => [newNotification, ...prev]);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== newNotification.id));
    }, 5000);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error': return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'info': return <Info className="h-4 w-4 text-blue-500" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const getBadgeVariant = (type: string) => {
    switch (type) {
      case 'success': return 'default';
      case 'error': return 'destructive';
      case 'warning': return 'secondary';
      case 'info': return 'outline';
      default: return 'default';
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Notification System Demo</h1>
        <p className="text-muted-foreground">
          Test the notification system with different message types and interactive features.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Controls */}
        <Card>
          <CardHeader>
            <CardTitle>Test Notifications</CardTitle>
            <CardDescription>
              Click the buttons below to trigger different types of notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <Button 
                onClick={() => addNotification('success')}
                variant="default"
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Success
              </Button>
              <Button 
                onClick={() => addNotification('error')}
                variant="destructive"
              >
                <AlertCircle className="h-4 w-4 mr-2" />
                Error
              </Button>
              <Button 
                onClick={() => addNotification('warning')}
                variant="secondary"
                className="bg-yellow-100 hover:bg-yellow-200 text-yellow-800"
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                Warning
              </Button>
              <Button 
                onClick={() => addNotification('info')}
                variant="outline"
              >
                <Info className="h-4 w-4 mr-2" />
                Info
              </Button>
            </div>
            
            <Separator />
            
            <div className="text-sm text-muted-foreground">
              <p>• Notifications auto-dismiss after 5 seconds</p>
              <p>• Different types have different styling</p>
              <p>• Icons and colors match notification types</p>
            </div>
          </CardContent>
        </Card>

        {/* Notification Display */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Live Notifications
              {notifications.length > 0 && (
                <Badge variant="secondary">{notifications.length}</Badge>
              )}
            </CardTitle>
            <CardDescription>
              Active notifications will appear here
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No notifications</p>
                  <p className="text-sm">Click a button above to test</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="flex items-start gap-3 p-3 border rounded-lg bg-card animate-in slide-in-from-top-2 duration-300"
                  >
                    {getIcon(notification.type)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-sm">{notification.title}</p>
                        <Badge variant={getBadgeVariant(notification.type)} className="text-xs">
                          {notification.type}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{notification.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {notification.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Features Overview */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Notification System Features</CardTitle>
          <CardDescription>
            Overview of the implemented notification system capabilities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="text-center p-4 border rounded-lg">
              <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
              <h3 className="font-medium mb-1">Toast Notifications</h3>
              <p className="text-sm text-muted-foreground">Multiple message types with auto-dismiss</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Bell className="h-8 w-8 mx-auto mb-2 text-blue-500" />
              <h3 className="font-medium mb-1">Notification Center</h3>
              <p className="text-sm text-muted-foreground">Centralized notification management</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Info className="h-8 w-8 mx-auto mb-2 text-purple-500" />
              <h3 className="font-medium mb-1">Real-time Updates</h3>
              <p className="text-sm text-muted-foreground">Live data synchronization</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-orange-500" />
              <h3 className="font-medium mb-1">User Preferences</h3>
              <p className="text-sm text-muted-foreground">Customizable notification settings</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationDemo;