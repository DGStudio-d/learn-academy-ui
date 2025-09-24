import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Loader2
} from 'lucide-react';
import {
  useSystemHealth,
  useSystemStatistics,
  useSystemLogs
} from '../../hooks/useAdmin';

interface HealthMetric {
  name: string;
  value: number;
  unit: string;
  status: 'healthy' | 'warning' | 'critical';
  threshold: { warning: number; critical: number };
}

export function SystemHealth() {
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30000); // 30 seconds

  const { data: healthData, isLoading: healthLoading, refetch: refetchHealth } = useSystemHealth();
  const { data: statsData, isLoading: statsLoading } = useSystemStatistics();
  const { data: logsData, isLoading: logsLoading } = useSystemLogs({
    level: 'error',
    limit: 10
  });

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      refetchHealth();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, refetchHealth]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'online':
      case 'good':
        return 'text-green-600 bg-green-100';
      case 'warning':
      case 'slow':
        return 'text-yellow-600 bg-yellow-100';
      case 'critical':
      case 'offline':
      case 'error':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'online':
      case 'good':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning':
      case 'slow':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'critical':
      case 'offline':
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  };

  const formatBytes = (bytes: number) => {
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  if (healthLoading && !healthData) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">System Health</h2>
          <p className="text-muted-foreground">Monitor system performance and health metrics</p>
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Server className="h-5 w-5 text-primary" />
              <div>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(healthData?.server_status || 'unknown')}
                  <span className="font-medium">Server</span>
                </div>
                <Badge className={getStatusColor(healthData?.server_status || 'unknown')}>
                  {healthData?.server_status || 'Unknown'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Database className="h-5 w-5 text-primary" />
              <div>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(healthData?.database_status || 'unknown')}
                  <span className="font-medium">Database</span>
                </div>
                <Badge className={getStatusColor(healthData?.database_status || 'unknown')}>
                  {healthData?.database_status || 'Unknown'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Wifi className="h-5 w-5 text-primary" />
              <div>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(healthData?.api_status || 'unknown')}
                  <span className="font-medium">API</span>
                </div>
                <Badge className={getStatusColor(healthData?.api_status || 'unknown')}>
                  {healthData?.response_time ? `${healthData.response_time}ms` : 'Unknown'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-primary" />
              <div>
                <div className="text-2xl font-bold">{statsData?.active_sessions || 0}</div>
                <div className="text-sm text-muted-foreground">Active Sessions</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="metrics" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="metrics">Performance Metrics</TabsTrigger>
          <TabsTrigger value="resources">Resource Usage</TabsTrigger>
          <TabsTrigger value="logs">System Logs</TabsTrigger>
          <TabsTrigger value="statistics">Statistics</TabsTrigger>
        </TabsList>

        {/* Performance Metrics */}
        <TabsContent value="metrics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5" />
                  <span>Response Times</span>
                </CardTitle>
                <CardDescription>API response performance metrics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Average Response Time</span>
                    <span className="font-medium">{healthData?.avg_response_time || 0}ms</span>
                  </div>
                  <Progress value={Math.min((healthData?.avg_response_time || 0) / 10, 100)} />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Database Query Time</span>
                    <span className="font-medium">{healthData?.db_query_time || 0}ms</span>
                  </div>
                  <Progress value={Math.min((healthData?.db_query_time || 0) / 5, 100)} />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Cache Hit Rate</span>
                    <span className="font-medium">{healthData?.cache_hit_rate || 0}%</span>
                  </div>
                  <Progress value={healthData?.cache_hit_rate || 0} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="h-5 w-5" />
                  <span>System Uptime</span>
                </CardTitle>
                <CardDescription>Server availability and uptime statistics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">
                    {healthData?.uptime_percentage || 0}%
                  </div>
                  <div className="text-sm text-muted-foreground">Uptime (30 days)</div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Current Uptime</span>
                    <span className="font-medium">
                      {formatUptime(healthData?.current_uptime || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Last Restart</span>
                    <span className="font-medium">
                      {healthData?.last_restart ? new Date(healthData.last_restart).toLocaleDateString() : 'Unknown'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Resource Usage */}
        <TabsContent value="resources" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Cpu className="h-5 w-5" />
                  <span>CPU & Memory</span>
                </CardTitle>
                <CardDescription>System resource utilization</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">CPU Usage</span>
                    <span className="font-medium">{healthData?.cpu_usage || 0}%</span>
                  </div>
                  <Progress 
                    value={healthData?.cpu_usage || 0} 
                    className={healthData?.cpu_usage > 80 ? 'bg-red-100' : healthData?.cpu_usage > 60 ? 'bg-yellow-100' : 'bg-green-100'}
                  />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Memory Usage</span>
                    <span className="font-medium">{healthData?.memory_usage || 0}%</span>
                  </div>
                  <Progress 
                    value={healthData?.memory_usage || 0}
                    className={healthData?.memory_usage > 80 ? 'bg-red-100' : healthData?.memory_usage > 60 ? 'bg-yellow-100' : 'bg-green-100'}
                  />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Memory Used</span>
                    <span className="font-medium">
                      {formatBytes(healthData?.memory_used || 0)} / {formatBytes(healthData?.memory_total || 0)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <HardDrive className="h-5 w-5" />
                  <span>Storage</span>
                </CardTitle>
                <CardDescription>Disk space and storage metrics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Disk Usage</span>
                    <span className="font-medium">{healthData?.disk_usage || 0}%</span>
                  </div>
                  <Progress 
                    value={healthData?.disk_usage || 0}
                    className={healthData?.disk_usage > 90 ? 'bg-red-100' : healthData?.disk_usage > 75 ? 'bg-yellow-100' : 'bg-green-100'}
                  />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Used Space</span>
                    <span className="font-medium">
                      {formatBytes(healthData?.disk_used || 0)} / {formatBytes(healthData?.disk_total || 0)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Available Space</span>
                    <span className="font-medium">
                      {formatBytes((healthData?.disk_total || 0) - (healthData?.disk_used || 0))}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* System Logs */}
        <TabsContent value="logs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5" />
                <span>Recent Error Logs</span>
              </CardTitle>
              <CardDescription>Latest system errors and warnings</CardDescription>
            </CardHeader>
            <CardContent>
              {logsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : logsData && logsData.length > 0 ? (
                <div className="space-y-3">
                  {logsData.map((log, index) => (
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
                        <p className="text-sm mt-1 break-words">{log.message}</p>
                        {log.context && (
                          <pre className="text-xs text-muted-foreground mt-2 bg-muted p-2 rounded overflow-x-auto">
                            {JSON.stringify(log.context, null, 2)}
                          </pre>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                  <p>No recent errors found</p>
                  <p className="text-sm">System is running smoothly</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Statistics */}
        <TabsContent value="statistics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5" />
                  <span>Daily Metrics</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">API Requests</span>
                    <span className="font-medium">{statsData?.daily_requests || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">User Logins</span>
                    <span className="font-medium">{statsData?.daily_logins || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Quiz Attempts</span>
                    <span className="font-medium">{statsData?.daily_quiz_attempts || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Errors</span>
                    <span className="font-medium text-red-600">{statsData?.daily_errors || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>User Activity</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Active Users</span>
                    <span className="font-medium">{statsData?.active_users || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Online Now</span>
                    <span className="font-medium">{statsData?.online_users || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Peak Concurrent</span>
                    <span className="font-medium">{statsData?.peak_concurrent || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Avg Session Time</span>
                    <span className="font-medium">{statsData?.avg_session_time || 0}min</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Database className="h-5 w-5" />
                  <span>Database Stats</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Total Queries</span>
                    <span className="font-medium">{statsData?.total_queries || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Slow Queries</span>
                    <span className="font-medium text-yellow-600">{statsData?.slow_queries || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">DB Size</span>
                    <span className="font-medium">{formatBytes(statsData?.database_size || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Connections</span>
                    <span className="font-medium">{statsData?.db_connections || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}