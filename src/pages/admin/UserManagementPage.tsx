import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
  Users, 
  Search, 
  Shield, 
  Activity,
  Plus,
  Settings,
  Download,
  Upload,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';
import { UserProfileEditor, UserSearch, UserRoleManager, UserActivityTracker } from '../../components/user';
import { useAdminUsers, useUpdateUser, useDeleteUser, useBulkUpdateUsers, useBulkDeleteUsers } from '../../hooks/useAdmin';
import type { User } from '../../types/api';

export function UserManagementPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const [isViewMode, setIsViewMode] = useState(false);

  // Fetch users data
  const { data: usersData, isLoading, error } = useAdminUsers(1, {
    sort_by: 'created_at',
    sort_order: 'desc'
  });
  
  const users = usersData?.data?.data || [];
  const updateUserMutation = useUpdateUser();
  const deleteUserMutation = useDeleteUser();
  const bulkUpdateMutation = useBulkUpdateUsers();
  const bulkDeleteMutation = useBulkDeleteUsers();

  const handleUserSelect = (user: User) => {
    setSelectedUser(user);
    setIsViewMode(true);
    setIsProfileDialogOpen(true);
  };

  const handleUserEdit = (user: User) => {
    setSelectedUser(user);
    setIsViewMode(false);
    setIsProfileDialogOpen(true);
  };

  const handleUserDelete = async (user: User) => {
    if (!confirm(`Are you sure you want to delete ${user.name}?`)) return;
    
    try {
      await deleteUserMutation.mutateAsync(user.id);
      toast.success(`${user.name} has been deleted`);
    } catch (error: any) {
      toast.error('Failed to delete user', {
        description: error.message
      });
    }
  };

  const handleProfileSave = async (userData: Partial<User>) => {
    if (!selectedUser) return;
    
    try {
      await updateUserMutation.mutateAsync({
        userId: selectedUser.id,
        userData
      });
      setIsProfileDialogOpen(false);
      setSelectedUser(null);
    } catch (error: any) {
      throw error; // Let the component handle the error
    }
  };

  const handleBulkAction = async (userIds: number[], action: string) => {
    try {
      switch (action) {
        case 'activate':
          await bulkUpdateMutation.mutateAsync({
            userIds,
            updates: { is_active: true }
          });
          toast.success(`Activated ${userIds.length} users`);
          break;
        case 'deactivate':
          await bulkUpdateMutation.mutateAsync({
            userIds,
            updates: { is_active: false }
          });
          toast.success(`Deactivated ${userIds.length} users`);
          break;
        case 'delete':
          if (confirm(`Are you sure you want to delete ${userIds.length} users?`)) {
            await bulkDeleteMutation.mutateAsync(userIds);
            toast.success(`Deleted ${userIds.length} users`);
          }
          break;
        case 'export':
          // Handle export logic here
          toast.success(`Exported ${userIds.length} users`);
          break;
        default:
          toast.error('Unknown action');
      }
    } catch (error: any) {
      toast.error(`Failed to ${action} users`, {
        description: error.message
      });
    }
  };

  const getUserStats = () => {
    const total = users.length;
    const active = users.filter(u => u.is_active).length;
    const byRole = users.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return { total, active, byRole };
  };

  const stats = getUserStats();

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-red-600">
              <p>Error loading users: {error.message}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground">
            Comprehensive user management, roles, and activity tracking
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button size="sm" className="btn-hero">
            <Plus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="text-2xl font-bold">{stats.total}</div>
                <div className="text-sm text-muted-foreground">Total Users</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Activity className="h-4 w-4 text-green-600" />
              <div>
                <div className="text-2xl font-bold">{stats.active}</div>
                <div className="text-sm text-muted-foreground">Active Users</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Shield className="h-4 w-4 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">{stats.byRole.admin || 0}</div>
                <div className="text-sm text-muted-foreground">Administrators</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-purple-600" />
              <div>
                <div className="text-2xl font-bold">{stats.byRole.teacher || 0}</div>
                <div className="text-sm text-muted-foreground">Teachers</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="search">Advanced Search</TabsTrigger>
          <TabsTrigger value="roles">Roles & Permissions</TabsTrigger>
          <TabsTrigger value="activity">Activity Tracking</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Overview</CardTitle>
              <CardDescription>
                Quick overview of all users in the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UserSearch
                users={users}
                onUserSelect={handleUserSelect}
                onUserEdit={handleUserEdit}
                onUserDelete={handleUserDelete}
                onBulkAction={handleBulkAction}
                showActions={true}
                selectable={true}
                maxResults={20}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="search" className="space-y-6">
          <UserSearch
            users={users}
            onUserSelect={handleUserSelect}
            onUserEdit={handleUserEdit}
            onUserDelete={handleUserDelete}
            onBulkAction={handleBulkAction}
            showActions={true}
            selectable={true}
          />
        </TabsContent>

        <TabsContent value="roles" className="space-y-6">
          <UserRoleManager
            users={users}
            showBulkActions={true}
          />
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <UserActivityTracker
            users={users}
            showAllUsers={true}
          />
        </TabsContent>
      </Tabs>

      {/* User Profile Dialog */}
      <Dialog open={isProfileDialogOpen} onOpenChange={setIsProfileDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isViewMode ? 'View User Profile' : 'Edit User Profile'}
            </DialogTitle>
            <DialogDescription>
              {isViewMode 
                ? 'View user information and activity'
                : 'Update user information and settings'
              }
            </DialogDescription>
          </DialogHeader>
          
          {selectedUser && (
            <div className="space-y-6">
              {isViewMode ? (
                <div className="space-y-4">
                  {/* User Info Display */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>{selectedUser.name}</span>
                        <div className="flex items-center space-x-2">
                          <Badge variant={selectedUser.is_active ? 'default' : 'secondary'}>
                            {selectedUser.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                          <Badge variant={
                            selectedUser.role === 'admin' ? 'destructive' :
                            selectedUser.role === 'teacher' ? 'default' : 'secondary'
                          }>
                            {selectedUser.role}
                          </Badge>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium">Email</label>
                          <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium">Phone</label>
                          <p className="text-sm text-muted-foreground">{selectedUser.phone || 'Not provided'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium">Language</label>
                          <p className="text-sm text-muted-foreground">{selectedUser.preferred_language}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium">Created</label>
                          <p className="text-sm text-muted-foreground">
                            {new Date(selectedUser.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2 pt-4">
                        <Button
                          onClick={() => setIsViewMode(false)}
                          size="sm"
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Profile
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setIsProfileDialogOpen(false)}
                          size="sm"
                        >
                          Close
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* User Activity */}
                  <UserActivityTracker
                    users={[selectedUser]}
                    selectedUserId={selectedUser.id}
                    showAllUsers={false}
                  />
                </div>
              ) : (
                <UserProfileEditor
                  user={selectedUser}
                  onSave={handleProfileSave}
                  onCancel={() => setIsProfileDialogOpen(false)}
                  isLoading={updateUserMutation.isPending}
                  canEditRole={true}
                  canEditStatus={true}
                />
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}