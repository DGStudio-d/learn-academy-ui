import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { 
  Settings, 
  Globe, 
  Shield, 
  Database, 
  Mail, 
  Bell,
  Save,
  RefreshCw,
  Download,
  Upload,
  Trash2,
  Plus,
  Edit,
  Loader2,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import {
  useAdminSettings,
  useUpdateAdminSettings,
  useSettingsCategories,
  useUpdateSetting,
  useResetSettings,
  useClearCache,
  useGenerateBackup,
  useTranslations,
  useUpdateTranslations
} from '../../hooks/useAdmin';

interface SettingItem {
  key: string;
  label: string;
  description: string;
  type: 'boolean' | 'string' | 'number' | 'select';
  value: any;
  options?: { label: string; value: string }[];
  category: string;
}

export function SystemSettings() {
  const [activeTab, setActiveTab] = useState('general');
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [translationKey, setTranslationKey] = useState('');
  const [translationValue, setTranslationValue] = useState('');
  const [isAddTranslationOpen, setIsAddTranslationOpen] = useState(false);

  const { data: settings, isLoading: settingsLoading } = useAdminSettings();
  const { data: categories } = useSettingsCategories();
  const { data: translations } = useTranslations(selectedLanguage);
  const updateSettingsMutation = useUpdateAdminSettings();
  const updateSettingMutation = useUpdateSetting();
  const resetSettingsMutation = useResetSettings();
  const clearCacheMutation = useClearCache();
  const generateBackupMutation = useGenerateBackup();
  const updateTranslationsMutation = useUpdateTranslations();

  const handleSettingChange = async (key: string, value: any) => {
    try {
      await updateSettingMutation.mutateAsync({ key, value });
      toast.success('Setting updated successfully');
    } catch (error: any) {
      toast.error('Failed to update setting', {
        description: error.message
      });
    }
  };

  const handleBulkSettingsUpdate = async (settingsData: Record<string, any>) => {
    try {
      await updateSettingsMutation.mutateAsync(settingsData);
      toast.success('Settings updated successfully');
    } catch (error: any) {
      toast.error('Failed to update settings', {
        description: error.message
      });
    }
  };

  const handleResetSettings = async () => {
    try {
      await resetSettingsMutation.mutateAsync();
      toast.success('Settings reset to defaults');
      setIsResetDialogOpen(false);
    } catch (error: any) {
      toast.error('Failed to reset settings', {
        description: error.message
      });
    }
  };

  const handleClearCache = async () => {
    try {
      await clearCacheMutation.mutateAsync();
      toast.success('Cache cleared successfully');
    } catch (error: any) {
      toast.error('Failed to clear cache', {
        description: error.message
      });
    }
  };

  const handleGenerateBackup = async () => {
    try {
      const blob = await generateBackupMutation.mutateAsync();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `system-backup-${new Date().toISOString().split('T')[0]}.sql`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Backup generated successfully');
    } catch (error: any) {
      toast.error('Failed to generate backup', {
        description: error.message
      });
    }
  };

  const handleAddTranslation = async () => {
    if (!translationKey.trim() || !translationValue.trim()) {
      toast.error('Please provide both key and value');
      return;
    }

    try {
      const updatedTranslations = {
        ...translations,
        [translationKey.trim()]: translationValue.trim()
      };
      
      await updateTranslationsMutation.mutateAsync({
        locale: selectedLanguage,
        translations: updatedTranslations
      });
      
      toast.success('Translation added successfully');
      setTranslationKey('');
      setTranslationValue('');
      setIsAddTranslationOpen(false);
    } catch (error: any) {
      toast.error('Failed to add translation', {
        description: error.message
      });
    }
  };

  const handleUpdateTranslation = async (key: string, value: string) => {
    try {
      const updatedTranslations = {
        ...translations,
        [key]: value
      };
      
      await updateTranslationsMutation.mutateAsync({
        locale: selectedLanguage,
        translations: updatedTranslations
      });
      
      toast.success('Translation updated successfully');
    } catch (error: any) {
      toast.error('Failed to update translation', {
        description: error.message
      });
    }
  };

  if (settingsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">System Settings</h2>
          <p className="text-muted-foreground">Configure system-wide settings and preferences</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearCache}
            disabled={clearCacheMutation.isPending}
          >
            {clearCacheMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-1" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-1" />
            )}
            Clear Cache
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleGenerateBackup}
            disabled={generateBackupMutation.isPending}
          >
            {generateBackupMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-1" />
            ) : (
              <Download className="h-4 w-4 mr-1" />
            )}
            Backup
          </Button>
          <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <AlertTriangle className="h-4 w-4 mr-1" />
                Reset Settings
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Reset All Settings</DialogTitle>
                <DialogDescription>
                  This will reset all system settings to their default values. This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsResetDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleResetSettings}
                  disabled={resetSettingsMutation.isPending}
                >
                  {resetSettingsMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-1" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 mr-1" />
                  )}
                  Reset Settings
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="guest">Guest Access</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="translations">Translations</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>General Configuration</span>
              </CardTitle>
              <CardDescription>Basic system configuration options</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="site-name">Site Name</Label>
                    <Input
                      id="site-name"
                      value={settings?.site_name || 'Learn Academy'}
                      onChange={(e) => handleSettingChange('site_name', e.target.value)}
                      placeholder="Learn Academy"
                    />
                  </div>
                  <div>
                    <Label htmlFor="site-description">Site Description</Label>
                    <Textarea
                      id="site-description"
                      value={settings?.site_description || ''}
                      onChange={(e) => handleSettingChange('site_description', e.target.value)}
                      placeholder="A comprehensive learning management system"
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="default-language">Default Language</Label>
                    <Select
                      value={settings?.default_language || 'en'}
                      onValueChange={(value) => handleSettingChange('default_language', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="ar">Arabic</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>User Registration</Label>
                      <p className="text-sm text-muted-foreground">Allow new users to register</p>
                    </div>
                    <Switch
                      checked={settings?.allow_registration || false}
                      onCheckedChange={(checked) => handleSettingChange('allow_registration', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Email Verification</Label>
                      <p className="text-sm text-muted-foreground">Require email verification for new accounts</p>
                    </div>
                    <Switch
                      checked={settings?.require_email_verification || false}
                      onCheckedChange={(checked) => handleSettingChange('require_email_verification', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Maintenance Mode</Label>
                      <p className="text-sm text-muted-foreground">Put the site in maintenance mode</p>
                    </div>
                    <Switch
                      checked={settings?.maintenance_mode || false}
                      onCheckedChange={(checked) => handleSettingChange('maintenance_mode', checked)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Guest Access Settings */}
        <TabsContent value="guest" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Guest Access Control</span>
              </CardTitle>
              <CardDescription>Configure what guests can access without an account</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Allow Guest Language Viewing</Label>
                    <p className="text-sm text-muted-foreground">Let visitors browse available languages</p>
                  </div>
                  <Switch
                    checked={settings?.guest_can_access_languages || false}
                    onCheckedChange={(checked) => handleSettingChange('guest_can_access_languages', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Allow Guest Teacher Profiles</Label>
                    <p className="text-sm text-muted-foreground">Show teacher profiles to non-registered users</p>
                  </div>
                  <Switch
                    checked={settings?.guest_can_access_teachers || false}
                    onCheckedChange={(checked) => handleSettingChange('guest_can_access_teachers', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Allow Guest Quiz Attempts</Label>
                    <p className="text-sm text-muted-foreground">Let visitors try sample quizzes</p>
                  </div>
                  <Switch
                    checked={settings?.guest_can_access_quizzes || false}
                    onCheckedChange={(checked) => handleSettingChange('guest_can_access_quizzes', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Allow Guest Program Viewing</Label>
                    <p className="text-sm text-muted-foreground">Show program information to guests</p>
                  </div>
                  <Switch
                    checked={settings?.guest_can_access_programs || false}
                    onCheckedChange={(checked) => handleSettingChange('guest_can_access_programs', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Guest Quiz Limit</Label>
                    <p className="text-sm text-muted-foreground">Maximum quiz attempts per guest session</p>
                  </div>
                  <div className="w-24">
                    <Input
                      type="number"
                      min="0"
                      max="10"
                      value={settings?.guest_quiz_limit || 3}
                      onChange={(e) => handleSettingChange('guest_quiz_limit', parseInt(e.target.value))}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Settings */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="h-5 w-5" />
                <span>Notification Settings</span>
              </CardTitle>
              <CardDescription>Configure system notifications and email settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Email Notifications</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label>Welcome Emails</Label>
                        <p className="text-sm text-muted-foreground">Send welcome email to new users</p>
                      </div>
                      <Switch
                        checked={settings?.send_welcome_email || false}
                        onCheckedChange={(checked) => handleSettingChange('send_welcome_email', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label>Enrollment Notifications</Label>
                        <p className="text-sm text-muted-foreground">Notify users about enrollment status</p>
                      </div>
                      <Switch
                        checked={settings?.send_enrollment_notifications || false}
                        onCheckedChange={(checked) => handleSettingChange('send_enrollment_notifications', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label>Quiz Reminders</Label>
                        <p className="text-sm text-muted-foreground">Send quiz deadline reminders</p>
                      </div>
                      <Switch
                        checked={settings?.send_quiz_reminders || false}
                        onCheckedChange={(checked) => handleSettingChange('send_quiz_reminders', checked)}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-medium">System Notifications</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label>Admin Alerts</Label>
                        <p className="text-sm text-muted-foreground">Notify admins of system events</p>
                      </div>
                      <Switch
                        checked={settings?.send_admin_alerts || false}
                        onCheckedChange={(checked) => handleSettingChange('send_admin_alerts', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label>Error Notifications</Label>
                        <p className="text-sm text-muted-foreground">Send error reports to admins</p>
                      </div>
                      <Switch
                        checked={settings?.send_error_notifications || false}
                        onCheckedChange={(checked) => handleSettingChange('send_error_notifications', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label>Performance Alerts</Label>
                        <p className="text-sm text-muted-foreground">Alert on performance issues</p>
                      </div>
                      <Switch
                        checked={settings?.send_performance_alerts || false}
                        onCheckedChange={(checked) => handleSettingChange('send_performance_alerts', checked)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Translations Management */}
        <TabsContent value="translations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Globe className="h-5 w-5" />
                  <span>Translation Management</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="ar">Arabic</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                    </SelectContent>
                  </Select>
                  <Dialog open={isAddTranslationOpen} onOpenChange={setIsAddTranslationOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <Plus className="h-4 w-4 mr-1" />
                        Add Translation
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add Translation</DialogTitle>
                        <DialogDescription>
                          Add a new translation key and value for {selectedLanguage.toUpperCase()}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div>
                          <Label htmlFor="translation-key">Translation Key</Label>
                          <Input
                            id="translation-key"
                            value={translationKey}
                            onChange={(e) => setTranslationKey(e.target.value)}
                            placeholder="e.g., welcome.message"
                          />
                        </div>
                        <div>
                          <Label htmlFor="translation-value">Translation Value</Label>
                          <Textarea
                            id="translation-value"
                            value={translationValue}
                            onChange={(e) => setTranslationValue(e.target.value)}
                            placeholder="Enter the translated text..."
                            rows={3}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setIsAddTranslationOpen(false);
                            setTranslationKey('');
                            setTranslationValue('');
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleAddTranslation}
                          disabled={updateTranslationsMutation.isPending}
                        >
                          {updateTranslationsMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-1" />
                          ) : (
                            <Plus className="h-4 w-4 mr-1" />
                          )}
                          Add Translation
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardTitle>
              <CardDescription>
                Manage translations for different languages
              </CardDescription>
            </CardHeader>
            <CardContent>
              {translations ? (
                <div className="space-y-4">
                  {Object.entries(translations).map(([key, value]) => (
                    <div key={key} className="grid grid-cols-3 gap-4 items-center p-4 border rounded-lg">
                      <div>
                        <Label className="text-sm font-medium">{key}</Label>
                      </div>
                      <div className="col-span-2">
                        <Textarea
                          value={value as string}
                          onChange={(e) => handleUpdateTranslation(key, e.target.value)}
                          rows={2}
                          className="resize-none"
                        />
                      </div>
                    </div>
                  ))}
                  {Object.keys(translations).length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Globe className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No translations found for {selectedLanguage.toUpperCase()}</p>
                      <p className="text-sm">Add your first translation using the button above</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Maintenance Settings */}
        <TabsContent value="maintenance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Database className="h-5 w-5" />
                <span>System Maintenance</span>
              </CardTitle>
              <CardDescription>System maintenance and optimization tools</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Cache Management</h4>
                  <div className="space-y-3">
                    <Button
                      variant="outline"
                      onClick={handleClearCache}
                      disabled={clearCacheMutation.isPending}
                      className="w-full justify-start"
                    >
                      {clearCacheMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <RefreshCw className="h-4 w-4 mr-2" />
                      )}
                      Clear Application Cache
                    </Button>
                    <p className="text-sm text-muted-foreground">
                      Clear all cached data to improve performance
                    </p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-medium">Data Management</h4>
                  <div className="space-y-3">
                    <Button
                      variant="outline"
                      onClick={handleGenerateBackup}
                      disabled={generateBackupMutation.isPending}
                      className="w-full justify-start"
                    >
                      {generateBackupMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Download className="h-4 w-4 mr-2" />
                      )}
                      Generate System Backup
                    </Button>
                    <p className="text-sm text-muted-foreground">
                      Create a complete backup of system data
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="border-t pt-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Automatic Backups</Label>
                    <p className="text-sm text-muted-foreground">Enable daily automatic backups</p>
                  </div>
                  <Switch
                    checked={settings?.auto_backup_enabled || false}
                    onCheckedChange={(checked) => handleSettingChange('auto_backup_enabled', checked)}
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Debug Mode</Label>
                  <p className="text-sm text-muted-foreground">Enable detailed error logging</p>
                </div>
                <Switch
                  checked={settings?.debug_mode || false}
                  onCheckedChange={(checked) => handleSettingChange('debug_mode', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}