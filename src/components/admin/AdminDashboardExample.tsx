import React, { useState } from 'react';
import {
  useAdminDashboardStats,
  useAdminUsers,
  useCreateUser,
  useBulkUpdateUsers,
  useUserStatistics,
  useExportUsers,
  useImportUsers,
  useSystemStatistics,
} from '../../hooks/useAdmin';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Loader2, Download, Upload, Users, Activity } from 'lucide-react';
import { useToast } from '../../hooks/use-toast';

/**
 * Example component demonstrating comprehensive admin service and hooks usage
 * This component showcases all the implemented admin functionality including:
 * - Dashboard statistics
 * - User management with CRUD operations
 * - Bulk operations
 * - Data import/export
 * - System monitoring
 */
export const AdminDashboardExample: React.FC = () => {
  const { toast } = useToast();
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [userFilters, setUserFilters] = useState({
    role: '',
    search: '',
  });

  // Dashboard statistics
  const {
    data: dashboardStats,
    isLoading: statsLoading,
    error: statsError,
  } = useAdminDashboardStats();

  // User management
  const {
    data: usersData,
    isLoading: usersLoading,
    error: usersError,
  } = useAdminUsers(1, userFilters);

  // User statistics
  const {
    data: userStats,
    isLoading: userStatsLoading,
  } = useUserStatistics({ role: userFilters.role });

  // System statistics
  const {
    data: systemStats,
    isLoading: systemStatsLoading,
  } = useSystemStatistics();

  // Mutations
  const createUserMutation = useCreateUser();
  const bulkUpdateMutation = useBulkUpdateUsers();
  const exportMutation = useExportUsers();
  const importMutation = useImportUsers();

  // Handlers
  const handleCreateUser = () => {
    createUserMutation.mutate({
      name: 'New Test User',
      email: `test${Date.now()}@example.com`,
      password: 'password123',
      role: 'student',
      preferred_language: 'en',
    }, {
      onSuccess: () => {
        toast({
          title: 'Success',
          description: 'User created successfully',
        });
      },
      onError: (error) => {
        toast({
          title: 'Error',
          description: 'Failed to create user',
          variant: 'destructive',
        });
      },
    });
  };

  const handleBulkUpdate = () => {
    if (selectedUsers.length === 0) {
      toast({
        title: 'Warning',
        description: 'Please select users to update',
        variant: 'destructive',
      });
      return;
    }

    bulkUpdateMutation.mutate({
      userIds: selectedUsers,
      updates: { preferred_language: 'es' },
    }, {
      onSuccess: () => {
        toast({
          title: 'Success',
          description: `Updated ${selectedUsers.length} users successfully`,
        });
        setSelectedUsers([]);
      },
      onError: () => {
        toast({
          title: 'Error',
          description: 'Failed to update users',
          variant: 'destructive',
        });
      },
    });
  };

  const handleExport = () => {
    exportMutation.mutate({
      format: 'csv',
      role: userFilters.role || undefined,
    }, {
      onSuccess: (blob) => {
        // Create download link
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `users-export-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        toast({
          title: 'Success',
          description: 'Users exported successfully',
        });
      },
      onError: () => {
        toast({
          title: 'Error',
          description: 'Failed to export users',
          variant: 'destructive',
        });
      },
    });
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    importMutation.mutate(file, {
      onSuccess: (result) => {
        toast({
          title: 'Import Complete',
          description: `Successfully imported ${result.success} users. ${result.errors.length} errors.`,
        });
      },
      onError: () => {
        toast({
          title: 'Error',
          description: 'Failed to import users',
          variant: 'destructive',
        });
      },
    });
  };

  const toggleUserSelection = (userId: number) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  if (statsError || usersError) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-red-600">Error loading admin data. Please try again.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>

      {/* Dashboard Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                dashboardStats?.total_users || 0
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Programs</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                dashboardStats?.total_programs || 0
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Enrollments</CardTitle>
            <Badge variant="secondary" className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                dashboardStats?.pending_enrollments || 0
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium">
              {systemStatsLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Badge
                  variant={
                    systemStats?.system_health === 'healthy'
                      ? 'default'
                      : systemStats?.system_health === 'warning'
                      ? 'secondary'
                      : 'destructive'
                  }
                >
                  {systemStats?.system_health || 'Unknown'}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Statistics */}
      {userStats && (
        <Card>
          <CardHeader>
            <CardTitle>User Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">New Users This Month</p>
                <p className="text-2xl font-bold">{userStats.new_users_this_month}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Users (30 days)</p>
                <p className="text-2xl font-bold">{userStats.active_users_last_30_days}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Users by Role</p>
                <div className="flex gap-2 mt-1">
                  {Object.entries(userStats.users_by_role).map(([role, count]) => (
                    <Badge key={role} variant="outline">
                      {role}: {count}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* User Management */}
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <div className="flex gap-2 flex-wrap">
            <Input
              placeholder="Search users..."
              value={userFilters.search}
              onChange={(e) => setUserFilters(prev => ({ ...prev, search: e.target.value }))}
              className="max-w-xs"
            />
            <select
              value={userFilters.role}
              onChange={(e) => setUserFilters(prev => ({ ...prev, role: e.target.value }))}
              className="px-3 py-2 border rounded-md"
            >
              <option value="">All Roles</option>
              <option value="admin">Admin</option>
              <option value="teacher">Teacher</option>
              <option value="student">Student</option>
            </select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4 flex-wrap">
            <Button
              onClick={handleCreateUser}
              disabled={createUserMutation.isPending}
            >
              {createUserMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Create Test User
            </Button>
            
            <Button
              onClick={handleBulkUpdate}
              disabled={bulkUpdateMutation.isPending || selectedUsers.length === 0}
              variant="outline"
            >
              {bulkUpdateMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Bulk Update ({selectedUsers.length})
            </Button>

            <Button
              onClick={handleExport}
              disabled={exportMutation.isPending}
              variant="outline"
            >
              {exportMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Download className="mr-2 h-4 w-4" />
              )}
              Export Users
            </Button>

            <div className="relative">
              <input
                type="file"
                accept=".csv,.xlsx"
                onChange={handleImport}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={importMutation.isPending}
              />
              <Button variant="outline" disabled={importMutation.isPending}>
                {importMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="mr-2 h-4 w-4" />
                )}
                Import Users
              </Button>
            </div>
          </div>

          {usersLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <div className="space-y-2">
              {usersData?.data?.data?.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={() => toggleUserSelection(user.id)}
                      className="rounded"
                    />
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{user.role}</Badge>
                    <Badge variant="secondary">{user.preferred_language}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};