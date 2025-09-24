import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Activity, 
  Calendar as CalendarIcon,
  Clock,
  User,
  Eye,
  Edit,
  Trash2,
  Plus,
  Download,
  Filter,
  Search,
  X,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Info,
  Loader2,
  Globe,
  Smartphone,
  Monitor,
  MapPin,
  Shield,
  FileText,
  Settings,
  Users,
  BookOpen
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { useSystemLogs } from '../../hooks/useAdmin';
import type { User as UserType } from '../../types/api';

interface ActivityLog {
  id: string;
  user_id: number;
  user?: UserType;
  action: string;
  description: string;
  category: 'auth' | 'profile' | 'content' | 'system' | 'security';
  severity: 'info' | 'warning' | 'error' | 'success';
  ip_address?: string;
  user_agent?: string;
  device_type?: 'desktop' | 'mobile' | 'tablet';
  location?: string;
  metadata?: Record<string, any>;
  created_at: string;
}

interface ActivityFilters {
  user_id: string;
  category: string;
  severity: string;
  action: string;
  date_from: Date | null;
  date_to: Date | null;
  search: string;
}

interface UserActivityTrackerProps {
  users: UserType[];
  selectedUserId?: number;
  showAllUsers?: boolean;
}

// Mock activity data - in real implementation, this would come from API
const MOCK_ACTIVITIES: ActivityLog[] = [
  {
    id: '1',
    user_id: 1,
    action: 'login',
    description: 'User logged in successfully',
    category: 'auth',
    severity: 'success',
    ip_address: '192.168.1.100',
    user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    device_type: 'desktop',
    location: 'New York, US',
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    user_id: 1,
    action: 'profile_update',
    description: 'Updated profile information',
    category: 'profile',
    severity: 'info',
    ip_address: '192.168.1.100',
    device_type: 'desktop',
    metadata: { fields_changed: ['name', 'phone'] },
    created_at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: '3',
    user_id: 2,
    action: 'quiz_create',
    description: 'Created new quiz "JavaScript Basics"',
    category: 'content',
    severity: 'success',
    ip_address: '192.168.1.101',
    device_type: 'desktop',
    metadata: { quiz_id: 123, quiz_title: 'JavaScript Basics' },
    created_at: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: '4',
    user_id: 1,
    action: 'failed_login',
    description: 'Failed login attempt - incorrect password',
    category: 'security',
    severity: 'warning',
    ip_address: '192.168.1.100',
    device_type: 'mobile',
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
];

export function UserActivityTracker({ 
  users, 
  selectedUserId,
  showAllUsers = true 
}: UserActivityTrackerProps) {
  const [activeTab, setActiveTab] = useState('recent');
  const [activities, setActivities] = useState<ActivityLog[]>(MOCK_ACTIVITIES);
  const [filteredActivities, setFilteredActivities] = useState<ActivityLog[]>(MOCK_ACTIVITIES);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<ActivityFilters>({
    user_id: selectedUserId?.toString() || '',
    category: '',
    severity: '',
    action: '',
    date_from: null,
    date_to: null,
    search: ''
  });

  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = useState(filters.search);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(filters.search);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [filters.search]);

  // Filter activities based on current filters
  useEffect(() => {
    let filtered = activities;

    if (filters.user_id) {
      filtered = filtered.filter(activity => 
        activity.user_id.toString() === filters.user_id
      );
    }

    if (filters.category) {
      filtered = filtered.filter(activity => activity.category === filters.category);
    }

    if (filters.severity) {
      filtered = filtered.filter(activity => activity.severity === filters.severity);
    }

    if (filters.action) {
      filtered = filtered.filter(activity => 
        activity.action.toLowerCase().includes(filters.action.toLowerCase())
      );
    }

    if (debouncedSearch) {
      filtered = filtered.filter(activity => 
        activity.description.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        activity.action.toLowerCase().includes(debouncedSearch.toLowerCase())
      );
    }

    if (filters.date_from) {
      filtered = filtered.filter(activity => 
        new Date(activity.created_at) >= filters.date_from!
      );
    }

    if (filters.date_to) {
      filtered = filtered.filter(activity => 
        new Date(activity.created_at) <= filters.date_to!
      );
    }

    setFilteredActivities(filtered);
  }, [activities, filters, debouncedSearch]);

  const handleFilterChange = (key: keyof ActivityFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({
      user_id: selectedUserId?.toString() || '',
      category: '',
      severity: '',
      action: '',
      date_from: null,
      date_to: null,
      search: ''
    });
    setCurrentPage(1);
  };

  const getActivityIcon = (category: string) => {
    switch (category) {
      case 'auth': return Shield;
      case 'profile': return User;
      case 'content': return BookOpen;
      case 'system': return Settings;
      case 'security': return AlertCircle;
      default: return Activity;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'success': return 'default';
      case 'info': return 'secondary';
      case 'warning': return 'outline';
      case 'error': return 'destructive';
      default: return 'secondary';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'success': return CheckCircle2;
      case 'info': return Info;
      case 'warning': return AlertCircle;
      case 'error': return XCircle;
      default: return Info;
    }
  };

  const getDeviceIcon = (deviceType?: string) => {
    switch (deviceType) {
      case 'mobile': return Smartphone;
      case 'tablet': return Smartphone;
      case 'desktop': return Monitor;
      default: return Globe;
    }
  };

  const getUserById = (userId: number) => {
    return users.find(user => user.id === userId);
  };

  const getActivityStats = () => {
    const total = filteredActivities.length;
    const byCategory = filteredActivities.reduce((acc, activity) => {
      acc[activity.category] = (acc[activity.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const bySeverity = filteredActivities.reduce((acc, activity) => {
      acc[activity.severity] = (acc[activity.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return { total, byCategory, bySeverity };
  };

  const stats = getActivityStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Activity className="h-6 w-6" />
            User Activity Tracker
          </h2>
          <p className="text-muted-foreground">
            Monitor user activities and system audit logs
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Activity className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="text-2xl font-bold">{stats.total}</div>
                <div className="text-sm text-muted-foreground">Total Activities</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <div>
                <div className="text-2xl font-bold">{stats.bySeverity.success || 0}</div>
                <div className="text-sm text-muted-foreground">Successful Actions</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <div>
                <div className="text-2xl font-bold">{stats.bySeverity.warning || 0}</div>
                <div className="text-sm text-muted-foreground">Warnings</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <XCircle className="h-4 w-4 text-red-600" />
              <div>
                <div className="text-2xl font-bold">{stats.bySeverity.error || 0}</div>
                <div className="text-sm text-muted-foreground">Errors</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search activities..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            {showAllUsers && (
              <Select
                value={filters.user_id}
                onValueChange={(value) => handleFilterChange('user_id', value)}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="All Users" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Users</SelectItem>
                  {users.map(user => (
                    <SelectItem key={user.id} value={user.id.toString()}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Advanced Filters */}
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Advanced Filters</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={filters.category}
                  onValueChange={(value) => handleFilterChange('category', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Categories</SelectItem>
                    <SelectItem value="auth">Authentication</SelectItem>
                    <SelectItem value="profile">Profile</SelectItem>
                    <SelectItem value="content">Content</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                    <SelectItem value="security">Security</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Severity</Label>
                <Select
                  value={filters.severity}
                  onValueChange={(value) => handleFilterChange('severity', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Severities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Severities</SelectItem>
                    <SelectItem value="success">Success</SelectItem>
                    <SelectItem value="info">Info</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Date From</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filters.date_from ? format(filters.date_from, 'PPP') : 'Select date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={filters.date_from || undefined}
                      onSelect={(date) => handleFilterChange('date_from', date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>Date To</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filters.date_to ? format(filters.date_to, 'PPP') : 'Select date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={filters.date_to || undefined}
                      onSelect={(date) => handleFilterChange('date_to', date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <Separator />

            <div className="flex justify-between">
              <Button variant="outline" onClick={clearFilters}>
                <X className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="recent">Recent Activity</TabsTrigger>
          <TabsTrigger value="detailed">Detailed View</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
        </TabsList>

        <TabsContent value="recent" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activities</CardTitle>
              <CardDescription>
                Latest user activities and system events
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[600px]">
                <div className="space-y-2 p-4">
                  {filteredActivities.slice(0, 50).map((activity) => {
                    const user = getUserById(activity.user_id);
                    const ActivityIcon = getActivityIcon(activity.category);
                    const SeverityIcon = getSeverityIcon(activity.severity);
                    const DeviceIcon = getDeviceIcon(activity.device_type);

                    return (
                      <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-muted/50">
                        <div className="flex-shrink-0">
                          <div className="relative">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={user?.profile_image} />
                              <AvatarFallback className="text-xs">
                                {user?.name.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div className="absolute -bottom-1 -right-1">
                              <Badge variant={getSeverityColor(activity.severity)} className="h-4 w-4 p-0 flex items-center justify-center">
                                <SeverityIcon className="h-2 w-2" />
                              </Badge>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <ActivityIcon className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium text-sm">{user?.name || 'Unknown User'}</span>
                            <Badge variant="outline" className="text-xs">
                              {activity.category}
                            </Badge>
                          </div>
                          
                          <p className="text-sm text-muted-foreground mt-1">
                            {activity.description}
                          </p>
                          
                          <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                            <div className="flex items-center space-x-1">
                              <Clock className="h-3 w-3" />
                              <span>{formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}</span>
                            </div>
                            
                            {activity.device_type && (
                              <div className="flex items-center space-x-1">
                                <DeviceIcon className="h-3 w-3" />
                                <span>{activity.device_type}</span>
                              </div>
                            )}
                            
                            {activity.location && (
                              <div className="flex items-center space-x-1">
                                <MapPin className="h-3 w-3" />
                                <span>{activity.location}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="detailed" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Detailed Activity Log</CardTitle>
              <CardDescription>
                Comprehensive view of all user activities with technical details
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Device</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredActivities.map((activity) => {
                    const user = getUserById(activity.user_id);
                    const DeviceIcon = getDeviceIcon(activity.device_type);

                    return (
                      <TableRow key={activity.id}>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={user?.profile_image} />
                              <AvatarFallback className="text-xs">
                                {user?.name.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm">{user?.name || 'Unknown'}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium text-sm">{activity.action}</div>
                            <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                              {activity.description}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {activity.category}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getSeverityColor(activity.severity)} className="text-xs">
                            {activity.severity}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <DeviceIcon className="h-3 w-3" />
                            <span className="text-xs">{activity.device_type || 'unknown'}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs font-mono">
                          {activity.ip_address || 'N/A'}
                        </TableCell>
                        <TableCell className="text-xs">
                          {format(new Date(activity.created_at), 'MMM dd, HH:mm')}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Activity Timeline</CardTitle>
              <CardDescription>
                Chronological view of user activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <div className="space-y-4">
                  {filteredActivities.map((activity, index) => {
                    const user = getUserById(activity.user_id);
                    const ActivityIcon = getActivityIcon(activity.category);
                    const isLast = index === filteredActivities.length - 1;

                    return (
                      <div key={activity.id} className="relative">
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0 relative">
                            <div className="w-8 h-8 rounded-full bg-background border-2 border-muted flex items-center justify-center">
                              <ActivityIcon className="h-4 w-4" />
                            </div>
                            {!isLast && (
                              <div className="absolute top-8 left-1/2 transform -translate-x-1/2 w-0.5 h-8 bg-muted" />
                            )}
                          </div>
                          
                          <div className="flex-1 pb-8">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="font-medium text-sm">{user?.name || 'Unknown User'}</span>
                              <Badge variant={getSeverityColor(activity.severity)} className="text-xs">
                                {activity.severity}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {format(new Date(activity.created_at), 'MMM dd, HH:mm')}
                              </span>
                            </div>
                            
                            <p className="text-sm text-muted-foreground mb-2">
                              {activity.description}
                            </p>
                            
                            <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                              <Badge variant="outline" className="text-xs">
                                {activity.category}
                              </Badge>
                              
                              {activity.ip_address && (
                                <span className="font-mono">{activity.ip_address}</span>
                              )}
                              
                              {activity.location && (
                                <div className="flex items-center space-x-1">
                                  <MapPin className="h-3 w-3" />
                                  <span>{activity.location}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}