import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
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
  EyeOff
} from 'lucide-react';

const adminStats = [
  { label: 'Total Users', value: '2,847', icon: Users },
  { label: 'Active Programs', value: '24', icon: BookOpen },
  { label: 'Languages', value: '6', icon: Globe },
  { label: 'Teachers', value: '42', icon: UserCheck },
];

const recentUsers = [
  { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Student', joined: '2024-01-10', status: 'Active' },
  { id: 2, name: 'Sarah Wilson', email: 'sarah@example.com', role: 'Teacher', joined: '2024-01-09', status: 'Active' },
  { id: 3, name: 'Mike Chen', email: 'mike@example.com', role: 'Student', joined: '2024-01-08', status: 'Pending' },
];

const languages = [
  { id: 1, name: 'English', students: 1250, teachers: 8, levels: 4, programs: 12 },
  { id: 2, name: 'Spanish', students: 890, teachers: 6, levels: 4, programs: 10 },
  { id: 3, name: 'Arabic', students: 650, teachers: 5, levels: 3, programs: 8 },
];

export function AdminDashboard() {
  const [guestSettings, setGuestSettings] = useState({
    allowGuestLanguages: true,
    allowGuestTeachers: true,
    allowGuestQuizzes: false,
  });

  return (
    <div className="container py-8 space-y-8">
      {/* Welcome Section */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage users, content, and system settings</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {adminStats.map((stat, index) => (
          <Card key={stat.label} className="animate-scale-in" style={{ animationDelay: `${index * 0.1}s` }}>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <stat.icon className="h-5 w-5 text-primary" />
                <div>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
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
                {recentUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-semibold">{user.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {user.email} • {user.role}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant={user.status === 'Active' ? 'default' : 'secondary'}>
                        {user.status}
                      </Badge>
                      <div className="text-sm text-muted-foreground mt-1">{user.joined}</div>
                    </div>
                  </div>
                ))}
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
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Input placeholder="Search users..." className="flex-1" />
                  <Button variant="outline">Filter</Button>
                </div>
                
                <div className="space-y-2">
                  {recentUsers.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-primary">
                          <Users className="h-5 w-5 text-primary-foreground" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{user.name}</h3>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <Badge variant="outline">{user.role}</Badge>
                        <Badge variant={user.status === 'Active' ? 'default' : 'secondary'}>
                          {user.status}
                        </Badge>
                        <Button size="sm" variant="outline">Edit</Button>
                        <Button size="sm" variant="destructive">Suspend</Button>
                      </div>
                    </div>
                  ))}
                </div>
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
              <div className="space-y-4">
                {languages.map((language) => (
                  <div key={language.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-primary">
                        <Globe className="h-5 w-5 text-primary-foreground" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{language.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {language.students} students • {language.teachers} teachers
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-sm text-muted-foreground">
                        {language.levels} levels • {language.programs} programs
                      </div>
                      <Button size="sm" variant="outline">Edit</Button>
                      <Button size="sm">View Programs</Button>
                    </div>
                  </div>
                ))}
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
                  checked={guestSettings.allowGuestLanguages}
                  onCheckedChange={(checked) =>
                    setGuestSettings(prev => ({ ...prev, allowGuestLanguages: checked }))
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="font-medium">Allow Guest Teacher Profiles</Label>
                  <p className="text-sm text-muted-foreground">Show teacher profiles to non-registered users</p>
                </div>
                <Switch
                  checked={guestSettings.allowGuestTeachers}
                  onCheckedChange={(checked) =>
                    setGuestSettings(prev => ({ ...prev, allowGuestTeachers: checked }))
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="font-medium">Allow Guest Quiz Attempts</Label>
                  <p className="text-sm text-muted-foreground">Let visitors try sample quizzes</p>
                </div>
                <Switch
                  checked={guestSettings.allowGuestQuizzes}
                  onCheckedChange={(checked) =>
                    setGuestSettings(prev => ({ ...prev, allowGuestQuizzes: checked }))
                  }
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>System Configuration</CardTitle>
              <CardDescription>General platform settings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Settings className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Advanced Settings Coming Soon</h3>
                <p className="text-muted-foreground">Email settings, notifications, integrations, and more.</p>
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
                <h3 className="text-lg font-semibold mb-2">Detailed Analytics Coming Soon</h3>
                <p className="text-muted-foreground">Enrollment stats, quiz participation, revenue reports, and more.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}