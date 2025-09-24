import React, { useState } from 'react';
import { Bell, Check, CheckCheck, Filter, Settings, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu';
import { 
  Sheet, 
  SheetContent, 
  SheetDescription, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from '@/components/ui/sheet';
import { useNotifications } from '@/contexts/NotificationContext';
import { NotificationItem } from './NotificationItem';
import { NotificationFilters } from './NotificationFilters';
import { NotificationPreferences } from './NotificationPreferences';
import { NotificationType, NotificationCategory, NotificationPriority } from '@/types/notifications';
import { cn } from '@/lib/utils';

interface NotificationCenterProps {
  className?: string;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ className }) => {
  const {
    state,
    markAsRead,
    markAllAsRead,
    clearAllNotifications,
    setFilter,
    getFilteredNotifications,
  } = useNotifications();

  const [isOpen, setIsOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  const filteredNotifications = getFilteredNotifications();
  const unreadCount = state.stats.unread;

  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };

  const handleClearAll = () => {
    clearAllNotifications();
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    
    switch (tab) {
      case 'unread':
        setFilter({ read: false });
        break;
      case 'system':
        setFilter({ category: NotificationCategory.SYSTEM });
        break;
      case 'quiz':
        setFilter({ category: NotificationCategory.QUIZ });
        break;
      case 'meeting':
        setFilter({ category: NotificationCategory.MEETING });
        break;
      default:
        setFilter({});
    }
  };

  const getTabCount = (tab: string): number => {
    switch (tab) {
      case 'unread':
        return state.stats.unread;
      case 'system':
        return state.stats.byCategory[NotificationCategory.SYSTEM];
      case 'quiz':
        return state.stats.byCategory[NotificationCategory.QUIZ];
      case 'meeting':
        return state.stats.byCategory[NotificationCategory.MEETING];
      default:
        return state.stats.total;
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn("relative", className)}
          aria-label={`Notifications (${unreadCount} unread)`}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>

      <SheetContent className="w-full sm:w-[480px] p-0">
        <SheetHeader className="p-6 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <SheetTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notifications
                {unreadCount > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {unreadCount} new
                  </Badge>
                )}
              </SheetTitle>
              <SheetDescription>
                Stay updated with your latest activities
              </SheetDescription>
            </div>

            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Settings className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuItem onClick={handleMarkAllAsRead} disabled={unreadCount === 0}>
                    <CheckCheck className="h-4 w-4 mr-2" />
                    Mark all as read
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShowFilters(!showFilters)}>
                    <Filter className="h-4 w-4 mr-2" />
                    {showFilters ? 'Hide filters' : 'Show filters'}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setShowPreferences(true)}>
                    <Settings className="h-4 w-4 mr-2" />
                    Preferences
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={handleClearAll} 
                    disabled={state.stats.total === 0}
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear all
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </SheetHeader>

        {showFilters && (
          <div className="px-6 pb-4">
            <NotificationFilters onFilterChange={setFilter} />
          </div>
        )}

        <Separator />

        <div className="flex-1 flex flex-col">
          <Tabs value={activeTab} onValueChange={handleTabChange} className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-5 mx-6 mt-4">
              <TabsTrigger value="all" className="text-xs">
                All
                {getTabCount('all') > 0 && (
                  <Badge variant="secondary" className="ml-1 text-xs">
                    {getTabCount('all')}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="unread" className="text-xs">
                Unread
                {getTabCount('unread') > 0 && (
                  <Badge variant="destructive" className="ml-1 text-xs">
                    {getTabCount('unread')}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="system" className="text-xs">
                System
                {getTabCount('system') > 0 && (
                  <Badge variant="secondary" className="ml-1 text-xs">
                    {getTabCount('system')}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="quiz" className="text-xs">
                Quiz
                {getTabCount('quiz') > 0 && (
                  <Badge variant="secondary" className="ml-1 text-xs">
                    {getTabCount('quiz')}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="meeting" className="text-xs">
                Meeting
                {getTabCount('meeting') > 0 && (
                  <Badge variant="secondary" className="ml-1 text-xs">
                    {getTabCount('meeting')}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="flex-1 mt-4">
              <ScrollArea className="h-[calc(100vh-280px)]">
                <div className="px-6 space-y-2">
                  {filteredNotifications.length === 0 ? (
                    <div className="text-center py-12">
                      <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium text-muted-foreground mb-2">
                        No notifications
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {activeTab === 'unread' 
                          ? "You're all caught up! No unread notifications."
                          : "You don't have any notifications yet."
                        }
                      </p>
                    </div>
                  ) : (
                    filteredNotifications.map((notification) => (
                      <NotificationItem
                        key={notification.id}
                        notification={notification}
                        onMarkAsRead={() => markAsRead(notification.id)}
                        onRemove={() => {/* Remove functionality handled in NotificationItem */}}
                      />
                    ))
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>

      {/* Notification Preferences Modal */}
      {showPreferences && (
        <NotificationPreferences
          isOpen={showPreferences}
          onClose={() => setShowPreferences(false)}
        />
      )}
    </Sheet>
  );
};