import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { 
  Users, 
  BookOpen, 
  Settings, 
  Plus,
  Shield,
  BarChart3,
  Globe,
  UserCheck,
  FileText,
  Eye,
  EyeOff,
  Loader2
} from 'lucide-react';
import {
  useAdminDashboardStats,
  useAdminUsers,
  useAdminLanguages,
  useAdminSettings,
  useUpdateAdminSettings
} from '../../hooks/useAdmin';
import { useAuth } from '../../contexts/AuthContext';
import { DashboardLayout } from '../../components/layout/DashboardLayout';

export function AdminDashboard() {
  const { user } = useAuth();
  const { data: stats, isLoading: statsLoading } = useAdminDashboardStats();
  const { data: usersData, isLoading: usersLoading } = useAdminUsers(1, { sort_by: 'created_at', sort_order: 'desc' });
  const { data: languages, isLoading: languagesLoading } = useAdminLanguages();
  const { data: settings, isLoading: settingsLoading } = useAdminSettings();
  const updateSettingsMutation = useUpdateAdminSettings();

  const handleSettingChange = async (setting: string, value: boolean) => {
    try {
      await updateSettingsMutation.mutateAsync({
        [setting]: value
      });
      toast.success('Settings updated successfully');
    } catch (error: any) {
      toast.error('Failed to update settings', {
        description: error.message
      });
    }
  };
  
  if (statsLoading) {
    return (
      <div className="container py-8 flex items-center justify-center min-h-[400px]">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading admin dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout userRole="admin">
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage users, content, and system settings</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="animate-scale-in">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-primary" />
                <div>
                  <div className="text-2xl font-bold">{stats?.total_users || 0}</div>
                  <div className="text-sm text-muted-foreground">Total Users</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="animate-scale-in" style={{ animationDelay: '0.1s' }}>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <BookOpen className="h-5 w-5 text-primary" />
                <div>
                  <div className="text-2xl font-bold">{stats?.total_programs || 0}</div>
                  <div className="text-sm text-muted-foreground">Active Programs</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="animate-scale-in" style={{ animationDelay: '0.2s' }}>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Globe className="h-5 w-5 text-primary" />
                <div>
                  <div className="text-2xl font-bold">{languages?.length || 0}</div>
                  <div className="text-sm text-muted-foreground">Languages</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="animate-scale-in" style={{ animationDelay: '0.3s' }}>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <UserCheck className="h-5 w-5 text-primary" />
                <div>
                  <div className="text-2xl font-bold">{stats?.active_teachers || 0}</div>
                  <div className="text-sm text-muted-foreground">Teachers</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="languages">Languages</TabsTrigger>
            <TabsTrigger value="teachers">Teachers</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Recent Users */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Users</CardTitle>
                  <CardDescription>Latest user registrations</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {usersLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                  ) : usersData?.data?.data && usersData.data.data.length > 0 ? (
                    usersData.data.data.slice(0, 5).map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h3 className="font-semibold">{user.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {user.email} • {user.role}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge variant="default">
                            Active
                          </Badge>
                          <div className="text-sm text-muted-foreground mt-1">
                            {new Date(user.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No users found</p>
                      <p className="text-sm">Users will appear here as they register</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* System Health */}
              <Card>
                <CardHeader>
                  <CardTitle>System Health</CardTitle>
                  <CardDescription>Platform performance metrics</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span>Server Status</span>
                      <Badge className="bg-green-100 text-green-800">Online</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Database</span>
                      <Badge className="bg-green-100 text-green-800">Healthy</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>API Response</span>
                      <Badge className="bg-green-100 text-green-800">Fast</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Active Sessions</span>
                      <span className="font-semibold">1,247</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Daily Logins</span>
                      <span className="font-semibold">892</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Keep remaining tabs content the same */}
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  User Management
                  <Button size="sm" className="btn-hero">
                    <Plus className="h-4 w-4 mr-1" />
                    Add User
                  </Button>
                </CardTitle>
                <CardDescription>Manage user accounts and permissions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">User Management</h3>
                  <p className="text-muted-foreground">Create and manage user accounts with role-based permissions.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="languages" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Language Management
                  <Button size="sm" className="btn-hero">
                    <Plus className="h-4 w-4 mr-1" />
                    Add Language
                  </Button>
                </CardTitle>
                <CardDescription>Manage available languages and their programs</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Globe className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Language Management</h3>
                  <p className="text-muted-foreground">Add and configure languages for your platform.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="teachers" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Teacher Management
                  <Button size="sm" className="btn-hero">
                    <Plus className="h-4 w-4 mr-1" />
                    Add Teacher
                  </Button>
                </CardTitle>
                <CardDescription>Manage teacher accounts and assignments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <UserCheck className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Teacher Management</h3>
                  <p className="text-muted-foreground">Create teacher accounts, assign languages, and manage profiles.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Guest Access Settings</CardTitle>
                <CardDescription>Control what guests can access without an account</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="font-medium">Allow Guest Language Viewing</Label>
                    <p className="text-sm text-muted-foreground">Let visitors browse available languages</p>
                  </div>
                  <Switch
                    checked={settings?.guest_can_access_languages || false}
                    onCheckedChange={(checked) => handleSettingChange('guest_can_access_languages', checked)}
                    disabled={updateSettingsMutation.isPending}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="font-medium">Allow Guest Teacher Profiles</Label>
                    <p className="text-sm text-muted-foreground">Show teacher profiles to non-registered users</p>
                  </div>
                  <Switch
                    checked={settings?.guest_can_access_teachers || false}
                    onCheckedChange={(checked) => handleSettingChange('guest_can_access_teachers', checked)}
                    disabled={updateSettingsMutation.isPending}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="font-medium">Allow Guest Quiz Attempts</Label>
                    <p className="text-sm text-muted-foreground">Let visitors try sample quizzes</p>
                  </div>
                  <Switch
                    checked={settings?.guest_can_access_quizzes || false}
                    onCheckedChange={(checked) => handleSettingChange('guest_can_access_quizzes', checked)}
                    disabled={updateSettingsMutation.isPending}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports">
            <Card>
              <CardHeader>
                <CardTitle>Analytics & Reports</CardTitle>
                <CardDescription>Platform usage and performance insights</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Reports Coming Soon</h3>
                  <p className="text-muted-foreground">Advanced analytics and reporting features are under development.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}