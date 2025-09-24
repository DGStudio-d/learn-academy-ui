import React from 'react';
import { NotificationDemo } from '@/components/notifications/NotificationDemo';

export const NotificationDemoPage: React.FC = () => {
  return (
    <div className="container mx-auto py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">Notification System Demo</h1>
        <p className="text-muted-foreground">
          Test the notification system with different types of notifications
        </p>
      </div>
      <NotificationDemo />
    </div>
  );
};

export default NotificationDemoPage;