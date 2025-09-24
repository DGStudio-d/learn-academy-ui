import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { 
  Shield, 
  Users, 
  Settings, 
  BookOpen, 
  GraduationCap,
  Eye,
  Edit,
  Trash2,
  Plus,
  Minus,
  Check,
  X,
  AlertTriangle,
  Info,
  Loader2,
  Crown,
  UserCheck,
  UserX
} from 'lucide-react';
import { useUpdateUser, useBulkUpdateUsers } from '../../hooks/useAdmin';
import type { User } from '../../types/api';

interface Permission {
  id: string;
  name: string;
  description: string;
  category: 'users' | 'content' | 'system' | 'reports';
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  color: 'default' | 'secondary' | 'destructive' | 'outline';
  icon: React.ComponentType<{ className?: string }>;
}

interface UserRoleManagerProps {
  users: User[];
  onUsersUpdate?: (users: User[]) => void;
  showBulkActions?: boolean;
}

const PERMISSIONS: Permission[] = [
  // User Management
  { id: 'users.view', name: 'View Users', description: 'View user profiles and information', category: 'users' },
  { id: 'users.create', name: 'Create Users', description: 'Create new user accounts', category: 'users' },
  { id: 'users.edit', name: 'Edit Users', description: 'Edit user profiles and information', category: 'users' },
  { id: 'users.delete', name: 'Delete Users', description: 'Delete user accounts', category: 'users' },
  { id: 'users.roles', name: 'Manage Roles', description: 'Assign and modify user roles', category: 'users' },
  
  // Content Management
  { id: 'content.view', name: 'View Content', description: 'View programs, quizzes, and meetings', category: 'content' },
  { id: 'content.create', name: 'Create Content', description: 'Create programs, quizzes, and meetings', category: 'content' },
  { id: 'content.edit', name: 'Edit Content', description: 'Edit programs, quizzes, and meetings', category: 'content' },
  { id: 'content.delete', name: 'Delete Content', description: 'Delete programs, quizzes, and meetings', category: 'content' },
  { id: 'content.publish', name: 'Publish Content', description: 'Publish and unpublish content', category: 'content' },
  
  // System Management
  { id: 'system.settings', name: 'System Settings', description: 'Manage system configuration', category: 'system' },
  { id: 'system.translations', name: 'Manage Translations', description: 'Manage language translations', category: 'system' },
  { id: 'system.backup', name: 'System Backup', description: 'Create and restore system backups', category: 'system' },
  { id: 'system.logs', name: 'View Logs', description: 'View system logs and audit trails', category: 'system' },
  
  // Reports
  { id: 'reports.view', name: 'View Reports', description: 'View system reports and analytics', category: 'reports' },
  { id: 'reports.export', name: 'Export Reports', description: 'Export reports and data', category: 'reports' },
  { id: 'reports.advanced', name: 'Advanced Reports', description: 'Access advanced reporting features', category: 'reports' },
];

const ROLES: Role[] = [
  {
    id: 'admin',
    name: 'Administrator',
    description: 'Full system access with all permissions',
    permissions: PERMISSIONS.map(p => p.id),
    color: 'destructive',
    icon: Crown
  },
  {
    id: 'teacher',
    name: 'Teacher',
    description: 'Content creation and student management',
    permissions: [
      'users.view', 'content.view', 'content.create', 'content.edit', 
      'content.publish', 'reports.view', 'reports.export'
    ],
    color: 'default',
    icon: GraduationCap
  },
  {
    id: 'student',
    name: 'Student',
    description: 'Access to learning content and activities',
    permissions: ['content.view'],
    color: 'secondary',
    icon: BookOpen
  }
];

export function UserRoleManager({ 
  users, 
  onUsersUpdate,
  showBulkActions = true 
}: UserRoleManagerProps) {
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [isPermissionDialogOpen, setIsPermissionDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [bulkRole, setBulkRole] = useState<string>('');
  const [customPermissions, setCustomPermissions] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('roles');

  const updateUserMutation = useUpdateUser();
  const bulkUpdateMutation = useBulkUpdateUsers();

  const getRoleInfo = (role: string) => {
    return ROLES.find(r => r.id === role) || ROLES[2]; // Default to student
  };

  const getUserPermissions = (user: User): string[] => {
    const role = getRoleInfo(user.role);
    return role.permissions;
  };

  const hasPermission = (user: User, permission: string): boolean => {
    const userPermissions = getUserPermissions(user);
    return userPermissions.includes(permission);
  };

  const handleRoleChange = async (user: User, newRole: string) => {
    try {
      await updateUserMutation.mutateAsync({
        userId: user.id,
        userData: { role: newRole as 'admin' | 'teacher' | 'student' }
      });
      
      toast.success(`${user.name}'s role updated to ${getRoleInfo(newRole).name}`);
      
      // Update local state if callback provided
      if (onUsersUpdate) {
        const updatedUsers = users.map(u => 
          u.id === user.id ? { ...u, role: newRole as 'admin' | 'teacher' | 'student' } : u
        );
        onUsersUpdate(updatedUsers);
      }
    } catch (error: any) {
      toast.error('Failed to update user role', {
        description: error.message
      });
    }
  };

  const handleBulkRoleChange = async () => {
    if (selectedUsers.length === 0 || !bulkRole) {
      toast.error('Please select users and a role');
      return;
    }

    try {
      await bulkUpdateMutation.mutateAsync({
        userIds: selectedUsers,
        updates: { role: bulkRole as 'admin' | 'teacher' | 'student' }
      });
      
      toast.success(`Updated ${selectedUsers.length} users to ${getRoleInfo(bulkRole).name}`);
      setSelectedUsers([]);
      setBulkRole('');
      setIsRoleDialogOpen(false);
      
      // Update local state if callback provided
      if (onUsersUpdate) {
        const updatedUsers = users.map(u => 
          selectedUsers.includes(u.id) 
            ? { ...u, role: bulkRole as 'admin' | 'teacher' | 'student' } 
            : u
        );
        onUsersUpdate(updatedUsers);
      }
    } catch (error: any) {
      toast.error('Failed to update user roles', {
        description: error.message
      });
    }
  };

  const toggleUserSelection = (userId: number) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const toggleAllUsers = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map(user => user.id));
    }
  };

  const openPermissionDialog = (user: User) => {
    setSelectedUser(user);
    setCustomPermissions(getUserPermissions(user));
    setIsPermissionDialogOpen(true);
  };

  const togglePermission = (permissionId: string) => {
    setCustomPermissions(prev => 
      prev.includes(permissionId)
        ? prev.filter(p => p !== permissionId)
        : [...prev, permissionId]
    );
  };

  const getPermissionsByCategory = (category: string) => {
    return PERMISSIONS.filter(p => p.category === category);
  };

  const getCategoryPermissionCount = (category: string, permissions: string[]) => {
    const categoryPermissions = getPermissionsByCategory(category);
    const userCategoryPermissions = permissions.filter(p => 
      categoryPermissions.some(cp => cp.id === p)
    );
    return `${userCategoryPermissions.length}/${categoryPermissions.length}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6" />
            Role & Permission Management
          </h2>
          <p className="text-muted-foreground">
            Manage user roles and permissions across the system
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="roles">User Roles</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
          <TabsTrigger value="overview">Role Overview</TabsTrigger>
        </TabsList>

        <TabsContent value="roles" className="space-y-6">
          {/* Bulk Actions */}
          {showBulkActions && selectedUsers.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {selectedUsers.length} user(s) selected
                  </span>
                  <div className="flex items-center space-x-2">
                    <Select value={bulkRole} onValueChange={setBulkRole}>
                      <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        {ROLES.map(role => (
                          <SelectItem key={role.id} value={role.id}>
                            <div className="flex items-center space-x-2">
                              <role.icon className="h-4 w-4" />
                              <span>{role.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      onClick={() => setIsRoleDialogOpen(true)}
                      disabled={!bulkRole}
                      size="sm"
                    >
                      Update Roles
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Users Table */}
          <Card>
            <CardHeader>
              <CardTitle>Users & Roles</CardTitle>
              <CardDescription>
                Manage individual user roles and permissions
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    {showBulkActions && (
                      <TableHead className="w-12">
                        <Checkbox
                          checked={selectedUsers.length === users.length}
                          onCheckedChange={toggleAllUsers}
                        />
                      </TableHead>
                    )}
                    <TableHead>User</TableHead>
                    <TableHead>Current Role</TableHead>
                    <TableHead>Permissions</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => {
                    const roleInfo = getRoleInfo(user.role);
                    const userPermissions = getUserPermissions(user);
                    
                    return (
                      <TableRow key={user.id}>
                        {showBulkActions && (
                          <TableCell>
                            <Checkbox
                              checked={selectedUsers.includes(user.id)}
                              onCheckedChange={() => toggleUserSelection(user.id)}
                            />
                          </TableCell>
                        )}
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={user.profile_image} />
                              <AvatarFallback>
                                {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{user.name}</div>
                              <div className="text-sm text-muted-foreground">{user.email}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <roleInfo.icon className="h-4 w-4" />
                            <Badge variant={roleInfo.color}>
                              {roleInfo.name}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{userPermissions.length} permissions</div>
                            <div className="text-muted-foreground">
                              {['users', 'content', 'system', 'reports'].map(category => (
                                <span key={category} className="mr-2">
                                  {category}: {getCategoryPermissionCount(category, userPermissions)}
                                </span>
                              ))}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.is_active ? 'default' : 'secondary'}>
                            {user.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Select
                              value={user.role}
                              onValueChange={(value) => handleRoleChange(user, value)}
                            >
                              <SelectTrigger className="w-[120px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {ROLES.map(role => (
                                  <SelectItem key={role.id} value={role.id}>
                                    <div className="flex items-center space-x-2">
                                      <role.icon className="h-4 w-4" />
                                      <span>{role.name}</span>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openPermissionDialog(user)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="permissions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Permission Categories</CardTitle>
              <CardDescription>
                Overview of all available permissions in the system
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {['users', 'content', 'system', 'reports'].map(category => (
                <div key={category} className="space-y-3">
                  <h3 className="text-lg font-medium capitalize">{category} Management</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {getPermissionsByCategory(category).map(permission => (
                      <Card key={permission.id} className="p-3">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <div className="font-medium text-sm">{permission.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {permission.description}
                            </div>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {permission.id}
                          </Badge>
                        </div>
                      </Card>
                    ))}
                  </div>
                  <Separator />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {ROLES.map(role => (
              <Card key={role.id}>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <role.icon className="h-5 w-5" />
                    <span>{role.name}</span>
                    <Badge variant={role.color} className="ml-auto">
                      {users.filter(u => u.role === role.id).length} users
                    </Badge>
                  </CardTitle>
                  <CardDescription>{role.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Permissions ({role.permissions.length})</div>
                    <div className="space-y-1">
                      {['users', 'content', 'system', 'reports'].map(category => {
                        const categoryPermissions = getPermissionsByCategory(category);
                        const rolePermissions = role.permissions.filter(p => 
                          categoryPermissions.some(cp => cp.id === p)
                        );
                        
                        return (
                          <div key={category} className="flex justify-between text-sm">
                            <span className="capitalize">{category}:</span>
                            <span className="text-muted-foreground">
                              {rolePermissions.length}/{categoryPermissions.length}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Recent Users</div>
                    <div className="space-y-1">
                      {users
                        .filter(u => u.role === role.id)
                        .slice(0, 3)
                        .map(user => (
                          <div key={user.id} className="flex items-center space-x-2 text-sm">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={user.profile_image} />
                              <AvatarFallback className="text-xs">
                                {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span className="truncate">{user.name}</span>
                          </div>
                        ))}
                      {users.filter(u => u.role === role.id).length > 3 && (
                        <div className="text-xs text-muted-foreground">
                          +{users.filter(u => u.role === role.id).length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Bulk Role Change Dialog */}
      <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Bulk Role Change</DialogTitle>
            <DialogDescription>
              You are about to change the role of {selectedUsers.length} user(s) to{' '}
              <strong>{getRoleInfo(bulkRole).name}</strong>.
            </DialogDescription>
          </DialogHeader>
          
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              This action will update user permissions immediately. Users may lose or gain 
              access to certain features based on their new role.
            </AlertDescription>
          </Alert>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRoleDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleBulkRoleChange}
              disabled={bulkUpdateMutation.isPending}
            >
              {bulkUpdateMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Updating...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Confirm Changes
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Permission Details Dialog */}
      <Dialog open={isPermissionDialogOpen} onOpenChange={setIsPermissionDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>Permissions for {selectedUser?.name}</span>
            </DialogTitle>
            <DialogDescription>
              View and understand the permissions granted to this user based on their role.
            </DialogDescription>
          </DialogHeader>
          
          {selectedUser && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Badge variant={getRoleInfo(selectedUser.role).color}>
                  {getRoleInfo(selectedUser.role).name}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {customPermissions.length} permissions granted
                </span>
              </div>

              <Separator />

              <div className="space-y-4 max-h-96 overflow-y-auto">
                {['users', 'content', 'system', 'reports'].map(category => (
                  <div key={category} className="space-y-2">
                    <h4 className="font-medium capitalize">{category} Management</h4>
                    <div className="space-y-1">
                      {getPermissionsByCategory(category).map(permission => (
                        <div 
                          key={permission.id} 
                          className="flex items-center justify-between p-2 rounded border"
                        >
                          <div className="space-y-1">
                            <div className="text-sm font-medium">{permission.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {permission.description}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {customPermissions.includes(permission.id) ? (
                              <Badge variant="default" className="text-xs">
                                <Check className="h-3 w-3 mr-1" />
                                Granted
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="text-xs">
                                <X className="h-3 w-3 mr-1" />
                                Denied
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPermissionDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}