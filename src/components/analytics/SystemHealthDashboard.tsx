import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  Activity,
  Server,
  Database,
  Wifi,
  HardDrive,
  Cpu,
  MemoryStick,
  Clock,
  Users,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Loader2,
  Zap,
  Globe,
  Shield,
  Monitor,
  AlertCircle,
  Download,
  Settings
} from 'lucide-react';
import { useSystemHealth, useSystemMetrics, useSystemLogs } from '../../hooks/useAdmin';
import { toast } from '../ui/use-toast';

interface SystemHealthDashboardProps {
  className?: string;
}

interface SystemMetrics {
  timestamp: string;
  cpu_usage: number;
  memory_usage: number;
  disk_usage: number;
  network_io: number;
  active_users: number;
  response_time: number;
  error_rate: number;
}

interface HealthStatus {
  component: string;
  status: 'healthy' | 'warning' | 'critical' | 'offline';
  message: string;
  last_check: string;
  uptime: number;
  response_time?: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export const SystemHealthDashboard: React.FC<SystemHealthDashboardProps> = ({ className }) => {
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30000); // 30 seconds
  const [selectedTimeRange, setSelectedTimeRange] = useState('1h');

  const { data: healthData, isLoading: healthLoading, refetch: refetchHealth } = useSystemHealth();
  const { data: metricsData, isLoading: metricsLoading } = useSystemMetrics({
    timeRange: selectedTimeRange,
    interval: '5m'
  });
  const { data: logsData } = useSystemLogs({
    level: 'error',
    limit: 20
  });

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      refetchHealth();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, refetchHealth]);

  // Mock comprehensive system data
  const mockHealthStatuses: HealthStatus[] = [
    {
      component: 'Web Server',
      status: 'healthy',
      message: 'All systems operational',
      last_check: new Date().toISOString(),
      uptime: 99.98,
      response_time: 45
    },
    {
      component: 'Database',
      status: 'healthy',
      message: 'Connection pool healthy',
      last_check: new Date().toISOString(),
      uptime: 99.95,
      response_time: 12
    },
    {
      component: 'Cache Server',
      status: 'warning',
      message: 'High memory usage detected',
      last_check: new Date().toISOString(),
      uptime: 99.87,
      response_time: 8
    },
    {
      component: 'File Storage',
      status: 'healthy',
      message: 'Storage capacity normal',
      last_check: new Date().toISOString(),
      uptime: 99.99,
      response_time: 23
    },
    {
      component: 'Email Service',
      status: 'critical',
      message: 'SMTP connection failed',
      last_check: new Date().toISOString(),
      uptime: 95.23,
      response_time: 0
    }
  ];

  const mockMetricsData: SystemMetrics[] = [
    { timestamp: '2024-01-01T00:00:00Z', cpu_usage: 45, memory_usage: 62, disk_usage: 78, network_io: 1.2, active_users: 156, response_time: 45, error_rate: 0.1 },
    { timestamp: '2024-01-01T00:05:00Z', cpu_usage: 52, memory_usage: 65, disk_usage: 78, network_io: 1.8, active_users: 189, response_time: 52, error_rate: 0.2 },
    { timestamp: '2024-01-01T00:10:00Z', cpu_usage: 48, memory_usage: 68, disk_usage: 79, network_io: 1.5, active_users: 203, response_time: 48, error_rate: 0.1 },
    { timestamp: '2024-01-01T00:15:00Z', cpu_usage: 55, memory_usage: 71, disk_usage: 79, network_io: 2.1, active_users: 234, response_time: 58, error_rate: 0.3 },
    { timestamp: '2024-01-01T00:20:00Z', cpu_usage: 61, memory_usage: 74, disk_usage: 80, network_io: 2.4, active_users: 267, response_time: 62, error_rate: 0.2 },
    { timestamp: '2024-01-01T00:25:00Z', cpu_usage: 58, memory_usage: 72, disk_usage: 80, network_io: 2.0, active_users: 245, response_time: 55, error_rate: 0.1 },
    { timestamp: '2024-01-01T00:30:00Z', cpu_usage: 53, memory_usage: 69, disk_usage: 81, network_io: 1.7, active_users: 221, response_time: 49, error_rate: 0.1 }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600 bg-green-100 border-green-200';
      case 'warning':
        return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'critical':
        return 'text-red-600 bg-red-100 border-red-200';
      case 'offline':
        return 'text-gray-600 bg-gray-100 border-gray-200';
      default:
        return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'critical':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'offline':
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const formatUptime = (uptime: number) => {
    return `${uptime.toFixed(2)}%`;
  };

  const formatBytes = (bytes: number) => {
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const handleExportMetrics = async () => {
    try {
      const csvData = generateMetricsCSV();
      const blob = new Blob([csvData], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `system-metrics-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Success",
        description: "System metrics exported successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export metrics",
        variant: "destructive",
      });
    }
  };

  const generateMetricsCSV = () => {
    const headers = ['Timestamp', 'CPU Usage', 'Memory Usage', 'Disk Usage', 'Active Users', 'Response Time', 'Error Rate'];
    const rows = mockMetricsData.map(metric => 
      [metric.timestamp, metric.cpu_usage, metric.memory_usage, metric.disk_usage, metric.active_users, metric.response_time, metric.error_rate].join(',')
    );
    return [headers.join(','), ...rows].join('\n');
  };

  if (healthLoading && !healthData) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">System Health Dashboard</h2>
          <p className="text-muted-foreground">Real-time monitoring and performance analytics</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${autoRefresh ? 'animate-spin' : ''}`} />
            {autoRefresh ? 'Auto Refresh On' : 'Auto Refresh Off'}
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportMetrics}>
            <Download className="h-4 w-4 mr-1" />
            Export
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetchHealth()}
            disabled={healthLoading}
          >
            {healthLoading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-1" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-1" />
            )}
            Refresh
          </Button>
        </div>
      </div>

      {/* System Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {mockHealthStatuses.map((status) => (
          <Card key={status.component} className={`border-2 ${getStatusColor(status.status)}`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                {getStatusIcon(status.status)}
                <Badge className={getStatusColor(status.status)}>
                  {status.status}
                </Badge>
              </div>
              <h3 className="font-semibold text-sm">{status.component}</h3>
              <p className="text-xs text-muted-foreground mb-2">{status.message}</p>
              <div className="text-xs">
                <div>Uptime: {formatUptime(status.uptime)}</div>
                {status.response_time && (
                  <div>Response: {status.response_time}ms</div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Critical Alerts */}
      {mockHealthStatuses.some(s => s.status === 'critical') && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-800">Critical System Issues Detected</AlertTitle>
          <AlertDescription className="text-red-700">
            {mockHealthStatuses.filter(s => s.status === 'critical').length} critical issue(s) require immediate attention.
            Check the Email Service configuration.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="network">Network</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* System Load */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5" />
                  <span>System Load</span>
                </CardTitle>
                <CardDescription>Real-time system resource utilization</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={mockMetricsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="timestamp" tickFormatter={(value) => new Date(value).toLocaleTimeString()} />
                    <YAxis />
                    <Tooltip labelFormatter={(value) => new Date(value).toLocaleString()} />
                    <Legend />
                    <Line type="monotone" dataKey="cpu_usage" stroke="#8884d8" strokeWidth={2} name="CPU %" />
                    <Line type="monotone" dataKey="memory_usage" stroke="#82ca9d" strokeWidth={2} name="Memory %" />
                    <Line type="monotone" dataKey="disk_usage" stroke="#ffc658" strokeWidth={2} name="Disk %" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Active Users */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>User Activity</span>
                </CardTitle>
                <CardDescription>Active users and session metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={mockMetricsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="timestamp" tickFormatter={(value) => new Date(value).toLocaleTimeString()} />
                    <YAxis />
                    <Tooltip labelFormatter={(value) => new Date(value).toLocaleString()} />
                    <Area type="monotone" dataKey="active_users" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Cpu className="h-5 w-5 text-blue-500" />
                  <div>
                    <div className="text-2xl font-bold">58%</div>
                    <div className="text-sm text-muted-foreground">CPU Usage</div>
                  </div>
                </div>
                <Progress value={58} className="mt-2 h-2" />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <MemoryStick className="h-5 w-5 text-green-500" />
                  <div>
                    <div className="text-2xl font-bold">72%</div>
                    <div className="text-sm text-muted-foreground">Memory Usage</div>
                  </div>
                </div>
                <Progress value={72} className="mt-2 h-2" />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <HardDrive className="h-5 w-5 text-purple-500" />
                  <div>
                    <div className="text-2xl font-bold">81%</div>
                    <div className="text-sm text-muted-foreground">Disk Usage</div>
                  </div>
                </div>
                <Progress value={81} className="mt-2 h-2" />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  <div>
                    <div className="text-2xl font-bold">55ms</div>
                    <div className="text-sm text-muted-foreground">Avg Response</div>
                  </div>
                </div>
                <div className="mt-2 flex items-center text-sm">
                  <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                  <span className="text-green-600">5ms faster</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Response Time Trends */}
            <Card>
              <CardHeader>
                <CardTitle>Response Time Trends</CardTitle>
                <CardDescription>API response time over the last hour</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={mockMetricsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="timestamp" tickFormatter={(value) => new Date(value).toLocaleTimeString()} />
                    <YAxis />
                    <Tooltip labelFormatter={(value) => new Date(value).toLocaleString()} />
                    <Line type="monotone" dataKey="response_time" stroke="#8884d8" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Error Rate */}
            <Card>
              <CardHeader>
                <CardTitle>Error Rate</CardTitle>
                <CardDescription>System error rate percentage</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={mockMetricsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="timestamp" tickFormatter={(value) => new Date(value).toLocaleTimeString()} />
                    <YAxis />
                    <Tooltip labelFormatter={(value) => new Date(value).toLocaleString()} />
                    <Area type="monotone" dataKey="error_rate" stroke="#ff7300" fill="#ff7300" fillOpacity={0.6} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Performance Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Benchmarks</CardTitle>
              <CardDescription>Current performance vs targets</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">API Response Time</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm">55ms</span>
                    <Badge className="bg-green-100 text-green-800">Target: &lt;100ms</Badge>
                  </div>
                </div>
                <Progress value={45} className="h-2" />

                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Database Query Time</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm">12ms</span>
                    <Badge className="bg-green-100 text-green-800">Target: &lt;50ms</Badge>
                  </div>
                </div>
                <Progress value={24} className="h-2" />

                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Error Rate</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm">0.15%</span>
                    <Badge className="bg-green-100 text-green-800">Target: &lt;1%</Badge>
                  </div>
                </div>
                <Progress value={15} className="h-2" />

                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Uptime</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm">99.98%</span>
                    <Badge className="bg-green-100 text-green-800">Target: &gt;99.9%</Badge>
                  </div>
                </div>
                <Progress value={99.98} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resources" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Resource Usage Over Time */}
            <Card>
              <CardHeader>
                <CardTitle>Resource Usage Trends</CardTitle>
                <CardDescription>CPU, Memory, and Disk usage over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={mockMetricsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="timestamp" tickFormatter={(value) => new Date(value).toLocaleTimeString()} />
                    <YAxis />
                    <Tooltip labelFormatter={(value) => new Date(value).toLocaleString()} />
                    <Area type="monotone" dataKey="cpu_usage" stackId="1" stroke="#8884d8" fill="#8884d8" />
                    <Area type="monotone" dataKey="memory_usage" stackId="2" stroke="#82ca9d" fill="#82ca9d" />
                    <Area type="monotone" dataKey="disk_usage" stackId="3" stroke="#ffc658" fill="#ffc658" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Current Resource Allocation */}
            <Card>
              <CardHeader>
                <CardTitle>Current Resource Allocation</CardTitle>
                <CardDescription>Real-time resource distribution</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center space-x-2">
                        <Cpu className="h-4 w-4 text-blue-500" />
                        <span className="text-sm font-medium">CPU Cores (8 total)</span>
                      </div>
                      <span className="text-sm">58% (4.6 cores)</span>
                    </div>
                    <Progress value={58} className="h-3" />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center space-x-2">
                        <MemoryStick className="h-4 w-4 text-green-500" />
                        <span className="text-sm font-medium">Memory (32 GB)</span>
                      </div>
                      <span className="text-sm">72% (23.0 GB)</span>
                    </div>
                    <Progress value={72} className="h-3" />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center space-x-2">
                        <HardDrive className="h-4 w-4 text-purple-500" />
                        <span className="text-sm font-medium">Storage (500 GB)</span>
                      </div>
                      <span className="text-sm">81% (405 GB)</span>
                    </div>
                    <Progress value={81} className="h-3" />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center space-x-2">
                        <Wifi className="h-4 w-4 text-orange-500" />
                        <span className="text-sm font-medium">Network I/O</span>
                      </div>
                      <span className="text-sm">2.0 MB/s</span>
                    </div>
                    <Progress value={40} className="h-3" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="network" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Network Traffic */}
            <Card>
              <CardHeader>
                <CardTitle>Network Traffic</CardTitle>
                <CardDescription>Incoming and outgoing network activity</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={mockMetricsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="timestamp" tickFormatter={(value) => new Date(value).toLocaleTimeString()} />
                    <YAxis />
                    <Tooltip labelFormatter={(value) => new Date(value).toLocaleString()} />
                    <Area type="monotone" dataKey="network_io" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Connection Status */}
            <Card>
              <CardHeader>
                <CardTitle>Connection Status</CardTitle>
                <CardDescription>External service connectivity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <div>
                        <div className="font-medium">CDN</div>
                        <div className="text-sm text-muted-foreground">Content delivery network</div>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Online</Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <div>
                        <div className="font-medium">External APIs</div>
                        <div className="text-sm text-muted-foreground">Third-party integrations</div>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Online</Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <AlertTriangle className="h-5 w-5 text-yellow-500" />
                      <div>
                        <div className="font-medium">Email Gateway</div>
                        <div className="text-sm text-muted-foreground">SMTP service</div>
                      </div>
                    </div>
                    <Badge className="bg-yellow-100 text-yellow-800">Degraded</Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <div>
                        <div className="font-medium">Monitoring</div>
                        <div className="text-sm text-muted-foreground">Health check services</div>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Online</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="logs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Monitor className="h-5 w-5" />
                <span>System Logs</span>
              </CardTitle>
              <CardDescription>Recent system events and error logs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { level: 'error', message: 'SMTP connection timeout', timestamp: '2024-01-01T12:30:00Z', component: 'Email Service' },
                  { level: 'warning', message: 'High memory usage detected', timestamp: '2024-01-01T12:25:00Z', component: 'Cache Server' },
                  { level: 'info', message: 'Database backup completed successfully', timestamp: '2024-01-01T12:00:00Z', component: 'Database' },
                  { level: 'error', message: 'Failed to process payment webhook', timestamp: '2024-01-01T11:45:00Z', component: 'Payment Service' },
                  { level: 'warning', message: 'Disk usage above 80%', timestamp: '2024-01-01T11:30:00Z', component: 'File Storage' }
                ].map((log, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 border rounded-lg">
                    {getStatusIcon(log.level)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <Badge className={getStatusColor(log.level)}>
                          {log.level.toUpperCase()}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {new Date(log.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm mt-1">{log.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">{log.component}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SystemHealthDashboard;