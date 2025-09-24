import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Checkbox } from '../ui/checkbox';
import { Separator } from '../ui/separator';
import { 
  Bell, 
  Clock, 
  Mail, 
  MessageSquare, 
  Settings, 
  Save,
  AlertCircle,
  CheckCircle,
  X
} from 'lucide-react';
import { useUpdateMeetingNotificationPreferences } from '../../hooks/useStudent';
import { toast } from '../ui/use-toast';

interface MeetingNotificationSystemProps {
  userRole: 'student' | 'teacher' | 'admin';
  initialPreferences?: {
    email_reminders: boolean;
    sms_reminders?: boolean;
    reminder_times: number[];
    custom_message?: string;
  };
}

export const MeetingNotificationSystem: React.FC<MeetingNotificationSystemProps> = ({
  userRole,
  initialPreferences
}) => {
  const [preferences, setPreferences] = useState({
    email_reminders: initialPreferences?.email_reminders ?? true,
    sms_reminders: initialPreferences?.sms_reminders ?? false,
    reminder_times: initialPreferences?.reminder_times ?? [15, 60, 1440],
    custom_message: initialPreferences?.custom_message ?? '',
  });

  const [hasChanges, setHasChanges] = useState(false);
  const updatePreferencesMutation = useUpdateMeetingNotificationPreferences();

  // Track changes
  useEffect(() => {
    const hasChanged = JSON.stringify(preferences) !== JSON.stringify(initialPreferences);
    setHasChanges(hasChanged);
  }, [preferences, initialPreferences]);

  const handleSavePreferences = async () => {
    try {
      await updatePreferencesMutation.mutateAsync(preferences);
      setHasChanges(false);
      toast({
        title: "Preferences Saved",
        description: "Your notification preferences have been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save notification preferences. Please try again.",
        variant: "destructive",
      });
    }
  };

  const toggleReminderTime = (minutes: number) => {
    setPreferences(prev => ({
      ...prev,
      reminder_times: prev.reminder_times.includes(minutes)
        ? prev.reminder_times.filter(t => t !== minutes)
        : [...prev.reminder_times, minutes].sort((a, b) => a - b)
    }));
  };

  const reminderOptions = [
    { value: 5, label: '5 minutes before' },
    { value: 15, label: '15 minutes before' },
    { value: 30, label: '30 minutes before' },
    { value: 60, label: '1 hour before' },
    { value: 120, label: '2 hours before' },
    { value: 1440, label: '1 day before' },
    { value: 2880, label: '2 days before' },
    { value: 10080, label: '1 week before' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center">
            <Bell className="h-6 w-6 mr-2" />
            Meeting Notifications
          </h2>
          <p className="text-muted-foreground">
            Configure how and when you receive meeting reminders
          </p>
        </div>
        {hasChanges && (
          <Button 
            onClick={handleSavePreferences}
            disabled={updatePreferencesMutation.isPending}
          >
            <Save className="h-4 w-4 mr-2" />
            {updatePreferencesMutation.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Notification Methods */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="h-5 w-5 mr-2" />
              Notification Methods
            </CardTitle>
            <CardDescription>
              Choose how you want to receive meeting notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-blue-500" />
                <Label htmlFor="email-notifications">Email Notifications</Label>
              </div>
              <Switch
                id="email-notifications"
                checked={preferences.email_reminders}
                onCheckedChange={(checked) => 
                  setPreferences(prev => ({ ...prev, email_reminders: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <MessageSquare className="h-4 w-4 text-green-500" />
                <Label htmlFor="sms-notifications">SMS Notifications</Label>
              </div>
              <Switch
                id="sms-notifications"
                checked={preferences.sms_reminders}
                onCheckedChange={(checked) => 
                  setPreferences(prev => ({ ...prev, sms_reminders: checked }))
                }
              />
            </div>

            {!preferences.email_reminders && !preferences.sms_reminders && (
              <div className="flex items-center space-x-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <p className="text-sm text-yellow-800">
                  You won't receive any meeting reminders with both methods disabled.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Reminder Timing */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              Reminder Timing
            </CardTitle>
            <CardDescription>
              Select when you want to receive reminders before meetings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-2">
              {reminderOptions.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <Checkbox
                    checked={preferences.reminder_times.includes(option.value)}
                    onCheckedChange={() => toggleReminderTime(option.value)}
                    disabled={!preferences.email_reminders && !preferences.sms_reminders}
                  />
                  <Label className={
                    !preferences.email_reminders && !preferences.sms_reminders 
                      ? 'text-muted-foreground' 
                      : ''
                  }>
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>

            {preferences.reminder_times.length === 0 && (preferences.email_reminders || preferences.sms_reminders) && (
              <div className="flex items-center space-x-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <p className="text-sm text-blue-800">
                  Select at least one reminder time to receive notifications.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Custom Message */}
      <Card>
        <CardHeader>
          <CardTitle>Custom Reminder Message</CardTitle>
          <CardDescription>
            Add a personal message to include in your meeting reminders (optional)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={preferences.custom_message}
            onChange={(e) => 
              setPreferences(prev => ({ ...prev, custom_message: e.target.value }))
            }
            placeholder="Add a custom message to include in your reminders..."
            rows={3}
            maxLength={500}
          />
          <div className="flex justify-between items-center text-sm text-muted-foreground">
            <span>This message will be added to all your meeting reminders</span>
            <span>{preferences.custom_message.length}/500</span>
          </div>
        </CardContent>
      </Card>

      {/* Preview */}
      {(preferences.email_reminders || preferences.sms_reminders) && preferences.reminder_times.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
              Notification Preview
            </CardTitle>
            <CardDescription>
              Here's what your notification settings will do
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-muted rounded-lg space-y-2">
              <h4 className="font-medium">You will receive notifications:</h4>
              <ul className="space-y-1 text-sm">
                {preferences.email_reminders && (
                  <li className="flex items-center space-x-2">
                    <Mail className="h-3 w-3 text-blue-500" />
                    <span>Via email</span>
                  </li>
                )}
                {preferences.sms_reminders && (
                  <li className="flex items-center space-x-2">
                    <MessageSquare className="h-3 w-3 text-green-500" />
                    <span>Via SMS</span>
                  </li>
                )}
              </ul>
              
              <Separator />
              
              <div>
                <h5 className="font-medium text-sm mb-1">Reminder schedule:</h5>
                <div className="flex flex-wrap gap-1">
                  {preferences.reminder_times
                    .sort((a, b) => a - b)
                    .map((minutes) => {
                      const option = reminderOptions.find(opt => opt.value === minutes);
                      return (
                        <Badge key={minutes} variant="secondary" className="text-xs">
                          {option?.label || `${minutes} minutes before`}
                        </Badge>
                      );
                    })}
                </div>
              </div>

              {preferences.custom_message && (
                <>
                  <Separator />
                  <div>
                    <h5 className="font-medium text-sm mb-1">Custom message:</h5>
                    <p className="text-sm text-muted-foreground italic">
                      "{preferences.custom_message}"
                    </p>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Save Button (mobile) */}
      {hasChanges && (
        <div className="lg:hidden">
          <Button 
            onClick={handleSavePreferences}
            disabled={updatePreferencesMutation.isPending}
            className="w-full"
          >
            <Save className="h-4 w-4 mr-2" />
            {updatePreferencesMutation.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      )}
    </div>
  );
};

export default MeetingNotificationSystem;