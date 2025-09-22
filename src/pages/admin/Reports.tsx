import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Search,
  Filter,
  Download,
  Eye,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Clock,
  DollarSign,
  BookOpen,
  Calendar,
  FileText,
  PieChart,
  Activity
} from 'lucide-react'

interface ReportData {
  period: string
  totalUsers: number
  newRegistrations: number
  totalRevenue: number
  courseCompletions: number
  activeTeachers: number
  averageRating: number
  supportTickets: number
  platformUptime: number
}

interface UserMetrics {
  date: string
  totalUsers: number
  activeUsers: number
  newSignups: number
  churnRate: number
}

interface RevenueMetrics {
  date: string
  revenue: number
  subscriptions: number
  averageOrderValue: number
  refunds: number
}

interface CourseMetrics {
  courseId: string
  courseName: string
  language: string
  enrollments: number
  completions: number
  averageRating: number
  revenue: number
}

const AdminReports: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('30days')
  const [selectedMetric, setSelectedMetric] = useState('overview')
  const [activeTab, setActiveTab] = useState('overview')

  // Mock report data
  const [reportData] = useState<ReportData>({
    period: 'Last 30 Days',
    totalUsers: 1247,
    newRegistrations: 186,
    totalRevenue: 45670,
    courseCompletions: 342,
    activeTeachers: 89,
    averageRating: 4.6,
    supportTickets: 23,
    platformUptime: 99.9
  })

  const [userMetrics] = useState<UserMetrics[]>([
    { date: '2024-03-01', totalUsers: 1180, activeUsers: 856, newSignups: 12, churnRate: 2.1 },
    { date: '2024-03-07', totalUsers: 1198, activeUsers: 874, newSignups: 18, churnRate: 1.8 },
    { date: '2024-03-14', totalUsers: 1223, activeUsers: 901, newSignups: 25, churnRate: 1.5 },
    { date: '2024-03-21', totalUsers: 1247, activeUsers: 923, newSignups: 24, churnRate: 1.7 }
  ])

  const [revenueMetrics] = useState<RevenueMetrics[]>([
    { date: '2024-03-01', revenue: 8430, subscriptions: 67, averageOrderValue: 125.82, refunds: 340 },
    { date: '2024-03-07', revenue: 9250, subscriptions: 73, averageOrderValue: 126.71, refunds: 180 },
    { date: '2024-03-14', revenue: 12100, subscriptions: 94, averageOrderValue: 128.72, refunds: 220 },
    { date: '2024-03-21', revenue: 15890, subscriptions: 118, averageOrderValue: 134.66, refunds: 150 }
  ])

  const [courseMetrics] = useState<CourseMetrics[]>([
    {
      courseId: '1',
      courseName: 'Spanish for Beginners',
      language: 'Spanish',
      enrollments: 124,
      completions: 89,
      averageRating: 4.7,
      revenue: 12276
    },
    {
      courseId: '2',
      courseName: 'Advanced French Conversation',
      language: 'French',
      enrollments: 67,
      completions: 52,
      averageRating: 4.9,
      revenue: 9983
    },
    {
      courseId: '3',
      courseName: 'German Grammar Mastery',
      language: 'German',
      enrollments: 89,
      completions: 64,
      averageRating: 4.5,
      revenue: 11481
    },
    {
      courseId: '4',
      courseName: 'Portuguese for Business',
      language: 'Portuguese',
      enrollments: 34,
      completions: 28,
      averageRating: 4.3,
      revenue: 4046
    }
  ])

  const [topLanguages] = useState([
    { language: 'Spanish', students: 324, revenue: 28450, growth: 12.5 },
    { language: 'French', students: 267, revenue: 23890, growth: 8.3 },
    { language: 'German', students: 198, revenue: 18340, growth: 15.2 },
    { language: 'Portuguese', students: 145, revenue: 12680, growth: 6.7 },
    { language: 'Italian', students: 112, revenue: 9850, growth: 22.1 }
  ])

  const [teacherPerformance] = useState([
    { name: 'Dr. Maria Santos', students: 45, rating: 4.9, revenue: 6750, courses: 3 },
    { name: 'Prof. Jean Dupont', students: 38, rating: 4.8, revenue: 5700, courses: 2 },
    { name: 'Dr. Klaus Weber', students: 41, rating: 4.7, revenue: 6150, courses: 2 },
    { name: 'Ana Silva', students: 28, rating: 4.6, revenue: 4200, courses: 2 },
    { name: 'Marco Rossi', students: 33, rating: 4.5, revenue: 4950, courses: 3 }
  ])

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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString([], { 
      month: 'short', 
      day: 'numeric' 
    })
  }

  const getCompletionRate = (completions: number, enrollments: number) => {
    return Math.round((completions / enrollments) * 100)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics & Reports</h1>
          <p className="text-muted-foreground">Comprehensive platform analytics and insights</p>
        </div>
        <div className="flex space-x-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 Days</SelectItem>
              <SelectItem value="30days">Last 30 Days</SelectItem>
              <SelectItem value="90days">Last 90 Days</SelectItem>
              <SelectItem value="1year">Last Year</SelectItem>
            </SelectContent>
          </Select>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Users}
          title="Total Users"
          value={reportData.totalUsers.toLocaleString()}
          trend="up"
          change="+17.2%"
          subtitle={`${reportData.newRegistrations} new this period`}
        />
        <StatCard
          icon={DollarSign}
          title="Revenue"
          value={formatCurrency(reportData.totalRevenue)}
          trend="up"
          change="+23.4%"
          subtitle={reportData.period}
        />
        <StatCard
          icon={BookOpen}
          title="Course Completions"
          value={reportData.courseCompletions}
          trend="up"
          change="+12.8%"
          subtitle="This period"
        />
        <StatCard
          icon={Activity}
          title="Platform Uptime"
          value={`${reportData.platformUptime}%`}
          trend="neutral"
          change="0.1%"
          subtitle="Last 30 days"
        />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="teachers">Teachers</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Popular Languages */}
            <Card>
              <CardHeader>
                <CardTitle>Popular Languages</CardTitle>
                <CardDescription>Top performing languages by enrollment</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topLanguages.map((lang, index) => (
                    <div key={lang.language} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="text-sm font-medium w-4">#{index + 1}</div>
                        <div>
                          <div className="font-medium">{lang.language}</div>
                          <div className="text-sm text-muted-foreground">{lang.students} students</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{formatCurrency(lang.revenue)}</div>
                        <div className={`text-xs ${lang.growth > 0 ? 'text-green-500' : 'text-red-500'}`}>
                          +{lang.growth}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Platform Health</CardTitle>
                <CardDescription>Key platform metrics at a glance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Active Teachers</span>
                  <span className="font-medium">{reportData.activeTeachers}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Average Rating</span>
                  <span className="font-medium">{reportData.averageRating}/5.0</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Support Tickets</span>
                  <span className="font-medium">{reportData.supportTickets} pending</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Completion Rate</span>
                  <span className="font-medium">78.3%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">User Satisfaction</span>
                  <span className="font-medium text-green-600">94.2%</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>User Growth Trends</CardTitle>
                <CardDescription>User registration and activity over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {userMetrics.map((metric) => (
                    <div key={metric.date} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{formatDate(metric.date)}</div>
                        <div className="text-sm text-muted-foreground">
                          {metric.newSignups} new signups
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{metric.totalUsers.toLocaleString()}</div>
                        <div className="text-sm text-muted-foreground">
                          {metric.activeUsers} active
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>User Statistics</CardTitle>
                <CardDescription>Detailed user metrics breakdown</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Student to Teacher Ratio</span>
                  <span className="font-medium">13:1</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Average Session Duration</span>
                  <span className="font-medium">45 min</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Daily Active Users</span>
                  <span className="font-medium">68%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Monthly Churn Rate</span>
                  <span className="font-medium">1.8%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">User Retention (30d)</span>
                  <span className="font-medium text-green-600">87.3%</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Revenue Tab */}
        <TabsContent value="revenue" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Trends</CardTitle>
                <CardDescription>Revenue growth over selected period</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {revenueMetrics.map((metric) => (
                    <div key={metric.date} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{formatDate(metric.date)}</div>
                        <div className="text-sm text-muted-foreground">
                          {metric.subscriptions} subscriptions
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{formatCurrency(metric.revenue)}</div>
                        <div className="text-sm text-muted-foreground">
                          AOV: {formatCurrency(metric.averageOrderValue)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue Breakdown</CardTitle>
                <CardDescription>Revenue sources and metrics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Total Revenue</span>
                  <span className="font-medium">{formatCurrency(reportData.totalRevenue)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Subscription Revenue</span>
                  <span className="font-medium">{formatCurrency(reportData.totalRevenue * 0.85)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">One-time Purchases</span>
                  <span className="font-medium">{formatCurrency(reportData.totalRevenue * 0.15)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Refunds</span>
                  <span className="font-medium text-red-600">-{formatCurrency(890)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Net Revenue</span>
                  <span className="font-medium text-green-600">{formatCurrency(reportData.totalRevenue - 890)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Courses Tab */}
        <TabsContent value="courses" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Course Performance</CardTitle>
              <CardDescription>Detailed metrics for each course</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {courseMetrics.map((course) => (
                  <div key={course.courseId} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-medium">{course.courseName}</h4>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">{course.language}</Badge>
                          <span className="text-sm text-muted-foreground">
                            {getCompletionRate(course.completions, course.enrollments)}% completion
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{formatCurrency(course.revenue)}</div>
                        <div className="text-sm text-muted-foreground">Revenue</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-4 text-center">
                      <div>
                        <div className="text-lg font-bold text-blue-600">{course.enrollments}</div>
                        <div className="text-xs text-muted-foreground">Enrollments</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-green-600">{course.completions}</div>
                        <div className="text-xs text-muted-foreground">Completions</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-orange-600">{course.averageRating.toFixed(1)}</div>
                        <div className="text-xs text-muted-foreground">Rating</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-purple-600">
                          {Math.round((course.revenue / course.enrollments))}
                        </div>
                        <div className="text-xs text-muted-foreground">$/Student</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Teachers Tab */}
        <TabsContent value="teachers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Teacher Performance</CardTitle>
              <CardDescription>Top performing teachers by various metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {teacherPerformance.map((teacher, index) => (
                  <div key={teacher.name} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="text-sm font-medium w-6">#{index + 1}</div>
                      <div>
                        <h4 className="font-medium">{teacher.name}</h4>
                        <div className="text-sm text-muted-foreground">
                          {teacher.students} students • {teacher.courses} courses
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-6 text-sm">
                      <div className="text-center">
                        <div className="font-medium">{teacher.rating.toFixed(1)}</div>
                        <div className="text-muted-foreground">Rating</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium">{formatCurrency(teacher.revenue)}</div>
                        <div className="text-muted-foreground">Revenue</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium">
                          {Math.round(teacher.revenue / teacher.students)}
                        </div>
                        <div className="text-muted-foreground">$/Student</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default AdminReports