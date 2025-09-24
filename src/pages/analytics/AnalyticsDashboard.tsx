import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import {
  BarChart3,
  TrendingUp,
  Users,
  Target,
  Activity,
  Monitor,
  Download,
  Settings,
  RefreshCw
} from 'lucide-react';
import {
  DashboardStatistics,
  ProgressTracker,
  QuizPerformanceAnalytics,
  SystemHealthDashboard
} from '../../components/analytics';
import { useAuth } from '../../hooks/useAuth';

interface AnalyticsDashboardProps {
  className?: string;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ className }) => {
  const { user } = useAuth();
  const [selectedTab, setSelectedTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('30');

  const isAdmin = user?.role === 'admin';
  const isTeacher = user?.role === 'teacher';
  const isStudent = user?.role === 'student';

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Comprehensive insights and performance metrics
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 3 months</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh All
          </Button>
        </div>
      </div>

      {/* Role-based Tab Navigation */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center space-x-2">
            <BarChart3 className="h-4 w-4" />
            <span>Overview</span>
          </TabsTrigger>
          
          {(isStudent || isTeacher) && (
            <TabsTrigger value="progress" className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4" />
              <span>Progress</span>
            </TabsTrigger>
          )}
          
          {(isTeacher || isAdmin) && (
            <TabsTrigger value="performance" className="flex items-center space-x-2">
              <Target className="h-4 w-4" />
              <span>Performance</span>
            </TabsTrigger>
          )}
          
          {isAdmin && (
            <TabsTrigger value="system" className="flex items-center space-x-2">
              <Monitor className="h-4 w-4" />
              <span>System Health</span>
            </TabsTrigger>
          )}
        </TabsList>

        {/* Overview Tab - Available to all roles */}
        <TabsContent value="overview" className="space-y-6">
          <DashboardStatistics />
        </TabsContent>

        {/* Progress Tab - Students and Teachers */}
        {(isStudent || isTeacher) && (
          <TabsContent value="progress" className="space-y-6">
            {isStudent && (
              <ProgressTracker userId={user?.id} />
            )}
            {isTeacher && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Student Progress Overview</CardTitle>
                    <CardDescription>
                      Track your students' learning progress and achievements
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ProgressTracker />
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>
        )}

        {/* Performance Tab - Teachers and Admins */}
        {(isTeacher || isAdmin) && (
          <TabsContent value="performance" className="space-y-6">
            <QuizPerformanceAnalytics />
          </TabsContent>
        )}

        {/* System Health Tab - Admins only */}
        {isAdmin && (
          <TabsContent value="system" className="space-y-6">
            <SystemHealthDashboard />
          </TabsContent>
        )}
      </Tabs>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5" />
            <span>Quick Actions</span>
          </CardTitle>
          <CardDescription>
            Common analytics tasks and reports
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-auto p-4 flex flex-col items-start space-y-2">
              <Download className="h-5 w-5" />
              <div className="text-left">
                <div className="font-medium">Export Data</div>
                <div className="text-sm text-muted-foreground">
                  Download analytics reports
                </div>
              </div>
            </Button>

            {(isTeacher || isAdmin) && (
              <Button variant="outline" className="h-auto p-4 flex flex-col items-start space-y-2">
                <Users className="h-5 w-5" />
                <div className="text-left">
                  <div className="font-medium">Student Reports</div>
                  <div className="text-sm text-muted-foreground">
                    Generate progress reports
                  </div>
                </div>
              </Button>
            )}

            {isAdmin && (
              <Button variant="outline" className="h-auto p-4 flex flex-col items-start space-y-2">
                <Settings className="h-5 w-5" />
                <div className="text-left">
                  <div className="font-medium">Configure Alerts</div>
                  <div className="text-sm text-muted-foreground">
                    Set up monitoring alerts
                  </div>
                </div>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsDashboard;