import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from '@/contexts/AuthContext'
import { 
  Users, 
  BookOpen, 
  GraduationCap,
  TrendingUp,
  TrendingDown,
  Activity,
  DollarSign,
  UserCheck,
  UserX,
  AlertTriangle,
  CheckCircle,
  Clock,
  Globe,
  BarChart3,
  PieChart,
  Plus,
  ChevronRight,
  Eye,
  Settings,
  Shield,
  Database
} from 'lucide-react'
import { Link } from 'react-router-dom'

interface AdminStats {
  totalUsers: number
  totalTeachers: number
  totalStudents: number
  activeUsers: number
  totalCourses: number
  totalLanguages: number
  monthlyRevenue: number
  completionRate: number
  averageRating: number
  supportTickets: number
}

interface UserActivity {
  id: string
  type: 'registration' | 'course_completion' | 'teacher_approval' | 'payment' | 'support_ticket'
  description: string
  user: string
  time: string
  status: 'success' | 'pending' | 'failed'
}

interface SystemMetric {
  name: string
  value: number
  change: number
  trend: 'up' | 'down' | 'neutral'
  color: string
}

interface LanguageStats {
  language: string
  students: number
  teachers: number
  courses: number
  completion: number
}

const AdminDashboard: React.FC = () => {
  const { user } = useAuth()
  
  // Mock data
  const [stats] = useState<AdminStats>({
    totalUsers: 1247,
    totalTeachers: 89,
    totalStudents: 1158,
    activeUsers: 892,
    totalCourses: 156,
    totalLanguages: 8,
    monthlyRevenue: 45670,
    completionRate: 78.5,
    averageRating: 4.6,
    supportTickets: 23
  })

  const [userActivity] = useState<UserActivity[]>([
    {
      id: '1',
      type: 'registration',
      description: 'New student registered',
      user: 'Maria Garcia',
      time: '5 minutes ago',
      status: 'success'
    },
    {
      id: '2',
      type: 'teacher_approval',
      description: 'Teacher application approved',
      user: 'John Peterson',
      time: '15 minutes ago',
      status: 'success'
    },
    {
      id: '3',
      type: 'course_completion',
      description: 'Course completed',
      user: 'Emma Johnson',
      time: '1 hour ago',
      status: 'success'
    },
    {
      id: '4',
      type: 'payment',
      description: 'Payment processed',
      user: 'Ahmed Hassan',
      time: '2 hours ago',
      status: 'success'
    },
    {
      id: '5',
      type: 'support_ticket',
      description: 'Support ticket created',
      user: 'Sophie Chen',
      time: '3 hours ago',
      status: 'pending'
    }
  ])

  const [systemMetrics] = useState<SystemMetric[]>([
    { name: 'Server Response Time', value: 245, change: -12, trend: 'up', color: 'green' },
    { name: 'Database Queries/sec', value: 1284, change: 5, trend: 'up', color: 'blue' },
    { name: 'Active Connections', value: 456, change: 23, trend: 'up', color: 'orange' },
    { name: 'Error Rate', value: 0.02, change: -0.01, trend: 'up', color: 'red' },
    { name: 'Cache Hit Rate', value: 94.5, change: 2.1, trend: 'up', color: 'purple' },
    { name: 'Storage Usage', value: 67.8, change: 1.5, trend: 'down', color: 'yellow' }
  ])

  const [languageStats] = useState<LanguageStats[]>([
    { language: 'Spanish', students: 324, teachers: 28, courses: 45, completion: 82 },
    { language: 'French', students: 267, teachers: 22, courses: 38, completion: 79 },
    { language: 'German', students: 198, teachers: 18, courses: 29, completion: 75 },
    { language: 'Portuguese', students: 145, teachers: 12, courses: 22, completion: 81 },
    { language: 'Italian', students: 112, teachers: 9, courses: 16, completion: 77 },
    { language: 'Japanese', students: 89, teachers: 8, courses: 14, completion: 73 }
  ])

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'registration': return <UserCheck className="h-4 w-4 text-green-500" />
      case 'course_completion': return <GraduationCap className="h-4 w-4 text-blue-500" />
      case 'teacher_approval': return <Shield className="h-4 w-4 text-purple-500" />
      case 'payment': return <DollarSign className="h-4 w-4 text-green-500" />
      case 'support_ticket': return <AlertTriangle className="h-4 w-4 text-orange-500" />
      default: return <Activity className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600'
      case 'pending': return 'text-yellow-600'
      case 'failed': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const StatCard = ({ icon: Icon, title, value, subtitle, trend, change }: {
    icon: any
    title: string
    value: string | number
    subtitle?: string
    trend?: 'up' | 'down' | 'neutral'
    change?: string
  }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="flex items-baseline space-x-2">
              <p className="text-2xl font-bold">{value}</p>
              {trend && change && (
                <div className={`flex items-center text-xs ${
                  trend === 'up' ? 'text-green-500' : trend === 'down' ? 'text-red-500' : 'text-muted-foreground'
                }`}>
                  {trend === 'up' ? <TrendingUp className="h-3 w-3 mr-1" /> : 
                   trend === 'down' ? <TrendingDown className="h-3 w-3 mr-1" /> : null}
                  <span>{change}</span>
                </div>
              )}
            </div>
            {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
          </div>
          <Icon className="h-8 w-8 text-primary" />
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Monitor and manage your learning platform</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" asChild>
            <Link to="/admin/settings">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Link>
          </Button>
          <Button asChild>
            <Link to="/admin/reports">
              <BarChart3 className="h-4 w-4 mr-2" />
              View Reports
            </Link>
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Users}
          title="Total Users"
          value={stats.totalUsers.toLocaleString()}
          trend="up"
          change="+12%"
          subtitle="Last 30 days"
        />
        <StatCard
          icon={GraduationCap}
          title="Active Courses"
          value={stats.totalCourses}
          trend="up"
          change="+8%"
          subtitle={`${stats.totalLanguages} languages`}
        />
        <StatCard
          icon={DollarSign}
          title="Monthly Revenue"
          value={`$${stats.monthlyRevenue.toLocaleString()}`}
          trend="up"
          change="+15%"
          subtitle="This month"
        />
        <StatCard
          icon={Activity}
          title="Platform Health"
          value={`${Math.round((stats.activeUsers / stats.totalUsers) * 100)}%`}
          trend="up"
          change="+3%"
          subtitle={`${stats.activeUsers} active users`}
        />
      </div>

      {/* Main Dashboard Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Charts and Stats */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common administrative tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button className="justify-start h-auto p-4" variant="outline" asChild>
                  <Link to="/admin/teachers">
                    <div className="flex flex-col items-center space-y-2">
                      <Users className="h-6 w-6" />
                      <div className="text-center">
                        <div className="font-medium">Manage Teachers</div>
                        <div className="text-xs text-muted-foreground">{stats.totalTeachers} teachers</div>
                      </div>
                    </div>
                  </Link>
                </Button>
                <Button className="justify-start h-auto p-4" variant="outline" asChild>
                  <Link to="/admin/programs">
                    <div className="flex flex-col items-center space-y-2">
                      <BookOpen className="h-6 w-6" />
                      <div className="text-center">
                        <div className="font-medium">Manage Programs</div>
                        <div className="text-xs text-muted-foreground">{stats.totalCourses} courses</div>
                      </div>
                    </div>
                  </Link>
                </Button>
                <Button className="justify-start h-auto p-4" variant="outline" asChild>
                  <Link to="/admin/languages">
                    <div className="flex flex-col items-center space-y-2">
                      <Globe className="h-6 w-6" />
                      <div className="text-center">
                        <div className="font-medium">Manage Languages</div>
                        <div className="text-xs text-muted-foreground">{stats.totalLanguages} languages</div>
                      </div>
                    </div>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Language Statistics */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Language Distribution</CardTitle>
                <CardDescription>Student enrollment by language</CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link to="/admin/languages">
                  View All
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {languageStats.slice(0, 5).map((lang) => (
                  <div key={lang.language} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-3">
                        <div className="font-medium">{lang.language}</div>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span>{lang.students} students</span>
                          <span>{lang.teachers} teachers</span>
                          <span>{lang.courses} courses</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{lang.completion}%</div>
                        <div className="text-xs text-muted-foreground">completion</div>
                      </div>
                    </div>
                    <Progress value={lang.completion} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* System Performance */}
          <Card>
            <CardHeader>
              <CardTitle>System Performance</CardTitle>
              <CardDescription>Real-time platform metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {systemMetrics.map((metric) => (
                  <div key={metric.name} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium text-sm">{metric.name}</h4>
                      <div className={`flex items-center text-xs ${
                        metric.trend === 'up' ? 'text-green-500' : 
                        metric.trend === 'down' ? 'text-red-500' : 'text-muted-foreground'
                      }`}>
                        {metric.trend === 'up' ? <TrendingUp className="h-3 w-3 mr-1" /> : 
                         metric.trend === 'down' ? <TrendingDown className="h-3 w-3 mr-1" /> : null}
                        <span>{metric.change > 0 ? '+' : ''}{metric.change}</span>
                      </div>
                    </div>
                    <div className="text-lg font-bold">
                      {metric.name.includes('Rate') || metric.name.includes('Usage') ? 
                        `${metric.value}%` : 
                        metric.name.includes('Time') ? 
                          `${metric.value}ms` : 
                          metric.value.toLocaleString()
                      }
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Activity and Alerts */}
        <div className="space-y-6">
          {/* System Status */}
          <Card>
            <CardHeader>
              <CardTitle>System Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Database</span>
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-800">Healthy</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">API Services</span>
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-800">Online</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Video Platform</span>
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-800">Connected</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm">Support Queue</span>
                </div>
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">{stats.supportTickets} pending</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest platform events</CardDescription>
              </div>
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {userActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className="mt-1">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium">{activity.description}</p>
                      <div className="flex items-center space-x-2">
                        <p className="text-xs text-muted-foreground">{activity.user}</p>
                        <span className="text-xs text-muted-foreground">•</span>
                        <p className="text-xs text-muted-foreground">{activity.time}</p>
                      </div>
                    </div>
                    <div className={`text-xs ${getStatusColor(activity.status)}`}>
                      {activity.status}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Teacher Approval Rate</span>
                <span className="font-medium">94%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Student Satisfaction</span>
                <span className="font-medium">{stats.averageRating}/5.0</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Course Completion</span>
                <span className="font-medium">{stats.completionRate}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Platform Uptime</span>
                <span className="font-medium text-green-600">99.9%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Active Sessions</span>
                <span className="font-medium">234</span>
              </div>
            </CardContent>
          </Card>

          {/* Administrative Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Admin Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full justify-start" variant="outline" asChild>
                <Link to="/admin/reports">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Generate Reports
                </Link>
              </Button>
              <Button className="w-full justify-start" variant="outline" asChild>
                <Link to="/admin/settings">
                  <Settings className="h-4 w-4 mr-2" />
                  System Settings
                </Link>
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Database className="h-4 w-4 mr-2" />
                Backup Data
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Shield className="h-4 w-4 mr-2" />
                Security Audit
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard