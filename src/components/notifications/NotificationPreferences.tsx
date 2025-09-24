import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Mail, 
  Smartphone, 
  Monitor, 
  Bell, 
  Volume2,
  Save,
  RotateCcw
} from 'lucide-react';
import { useNotifications } from '@/contexts/NotificationContext';
import { 
  NotificationCategory, 
  NotificationPreferences as NotificationPreferencesType 
} from '@/types/notifications';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface NotificationPreferencesProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationPreferences: React.FC<NotificationPreferencesProps> = ({
  isOpen,
  onClose,
}) => {
  const { state, updatePreferences } = useNotifications();
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<NotificationPreferencesType | null>(null);
  const [loading, setLoading] = useState(false);

  // Initialize preferences from context
  useEffect(() => {
    if (state.preferences) {
      setPreferences({ ...state.preferences });
    } else if (user) {
      // Set default preferences if none exist
      const defaultPreferences: NotificationPreferencesType = {
        userId: user.id,
        email: {
          enabled: true,
          categories: [NotificationCategory.SYSTEM, NotificationCategory.ENROLLMENT],
          frequency: 'immediate',
        },
        push: {
          enabled: true,
          categories: [NotificationCategory.QUIZ, NotificationCategory.MEETING],
        },
        inApp: {
          enabled: true,
          categories: Object.values(NotificationCategory),
          showToasts: true,
          autoMarkAsRead: false,
          soundEnabled: true,
        },
        desktop: {
          enabled: false,
          categories: [NotificationCategory.SYSTEM],
        },
      };
      setPreferences(defaultPreferences);
    }
  }, [state.preferences, user]);

  const handleSave = async () => {
    if (!preferences) return;

    setLoading(true);
    try {
      await updatePreferences(preferences);
      toast({
        title: 'Preferences Updated',
        description: 'Your notification preferences have been saved successfully.',
      });
      onClose();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update notification preferences. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    if (state.preferences) {
      setPreferences({ ...state.preferences });
    }
  };

  const updateEmailPreferences = (updates: Partial<NotificationPreferencesType['email']>) => {
    if (!preferences) return;
    setPreferences({
      ...preferences,
      email: { ...preferences.email, ...updates },
    });
  };

  const updatePushPreferences = (updates: Partial<NotificationPreferencesType['push']>) => {
    if (!preferences) return;
    setPreferences({
      ...preferences,
      push: { ...preferences.push, ...updates },
    });
  };

  const updateInAppPreferences = (updates: Partial<NotificationPreferencesType['inApp']>) => {
    if (!preferences) return;
    setPreferences({
      ...preferences,
      inApp: { ...preferences.inApp, ...updates },
    });
  };

  const updateDesktopPreferences = (updates: Partial<NotificationPreferencesType['desktop']>) => {
    if (!preferences) return;
    setPreferences({
      ...preferences,
      desktop: { ...preferences.desktop, ...updates },
    });
  };

  const toggleCategory = (
    type: 'email' | 'push' | 'inApp' | 'desktop',
    category: NotificationCategory
  ) => {
    if (!preferences) return;

    const currentCategories = preferences[type].categories;
    const isEnabled = currentCategories.includes(category);
    
    const newCategories = isEnabled
      ? currentCategories.filter(c => c !== category)
      : [...currentCategories, category];

    switch (type) {
      case 'email':
        updateEmailPreferences({ categories: newCategories });
        break;
      case 'push':
        updatePushPreferences({ categories: newCategories });
        break;
      case 'inApp':
        updateInAppPreferences({ categories: newCategories });
        break;
      case 'desktop':
        updateDesktopPreferences({ categories: newCategories });
        break;
    }
  };

  if (!preferences) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Preferences
          </DialogTitle>
          <DialogDescription>
            Customize how and when you receive notifications
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-6">
            {/* Email Notifications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Mail className="h-5 w-5" />
                  Email Notifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="email-enabled">Enable email notifications</Label>
                  <Switch
                    id="email-enabled"
                    checked={preferences.email.enabled}
                    onCheckedChange={(enabled) => updateEmailPreferences({ enabled })}
                  />
                </div>

                {preferences.email.enabled && (
                  <>
                    <div className="space-y-2">
                      <Label>Frequency</Label>
                      <Select
                        value={preferences.email.frequency}
                        onValueChange={(frequency: 'immediate' | 'daily' | 'weekly') =>
                          updateEmailPreferences({ frequency })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="immediate">Immediate</SelectItem>
                          <SelectItem value="daily">Daily digest</SelectItem>
                          <SelectItem value="weekly">Weekly digest</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Categories</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {Object.values(NotificationCategory).map((category) => (
                          <div key={category} className="flex items-center space-x-2">
                            <Checkbox
                              id={`email-${category}`}
                              checked={preferences.email.categories.includes(category)}
                              onCheckedChange={() => toggleCategory('email', category)}
                            />
                            <Label htmlFor={`email-${category}`} className="text-sm capitalize">
                              {category}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Push Notifications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Smartphone className="h-5 w-5" />
                  Push Notifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="push-enabled">Enable push notifications</Label>
                  <Switch
                    id="push-enabled"
                    checked={preferences.push.enabled}
                    onCheckedChange={(enabled) => updatePushPreferences({ enabled })}
                  />
                </div>

                {preferences.push.enabled && (
                  <div className="space-y-2">
                    <Label>Categories</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.values(NotificationCategory).map((category) => (
                        <div key={category} className="flex items-center space-x-2">
                          <Checkbox
                            id={`push-${category}`}
                            checked={preferences.push.categories.includes(category)}
                            onCheckedChange={() => toggleCategory('push', category)}
                          />
                          <Label htmlFor={`push-${category}`} className="text-sm capitalize">
                            {category}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* In-App Notifications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Bell className="h-5 w-5" />
                  In-App Notifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="inapp-enabled">Enable in-app notifications</Label>
                  <Switch
                    id="inapp-enabled"
                    checked={preferences.inApp.enabled}
                    onCheckedChange={(enabled) => updateInAppPreferences({ enabled })}
                  />
                </div>

                {preferences.inApp.enabled && (
                  <>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="show-toasts">Show toast notifications</Label>
                      <Switch
                        id="show-toasts"
                        checked={preferences.inApp.showToasts}
                        onCheckedChange={(showToasts) => updateInAppPreferences({ showToasts })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="auto-mark-read">Auto-mark as read</Label>
                      <Switch
                        id="auto-mark-read"
                        checked={preferences.inApp.autoMarkAsRead}
                        onCheckedChange={(autoMarkAsRead) => updateInAppPreferences({ autoMarkAsRead })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="sound-enabled" className="flex items-center gap-2">
                        <Volume2 className="h-4 w-4" />
                        Sound notifications
                      </Label>
                      <Switch
                        id="sound-enabled"
                        checked={preferences.inApp.soundEnabled}
                        onCheckedChange={(soundEnabled) => updateInAppPreferences({ soundEnabled })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Categories</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {Object.values(NotificationCategory).map((category) => (
                          <div key={category} className="flex items-center space-x-2">
                            <Checkbox
                              id={`inapp-${category}`}
                              checked={preferences.inApp.categories.includes(category)}
                              onCheckedChange={() => toggleCategory('inApp', category)}
                            />
                            <Label htmlFor={`inapp-${category}`} className="text-sm capitalize">
                              {category}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Desktop Notifications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Monitor className="h-5 w-5" />
                  Desktop Notifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="desktop-enabled">Enable desktop notifications</Label>
                  <Switch
                    id="desktop-enabled"
                    checked={preferences.desktop.enabled}
                    onCheckedChange={(enabled) => updateDesktopPreferences({ enabled })}
                  />
                </div>

                {preferences.desktop.enabled && (
                  <div className="space-y-2">
                    <Label>Categories</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.values(NotificationCategory).map((category) => (
                        <div key={category} className="flex items-center space-x-2">
                          <Checkbox
                            id={`desktop-${category}`}
                            checked={preferences.desktop.categories.includes(category)}
                            onCheckedChange={() => toggleCategory('desktop', category)}
                          />
                          <Label htmlFor={`desktop-${category}`} className="text-sm capitalize">
                            {category}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </ScrollArea>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={handleReset} disabled={loading}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Saving...' : 'Save Preferences'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};