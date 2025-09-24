import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PerformanceMonitor } from '@/utils/performance';
import { usePerformanceOptimization } from '@/hooks/usePerformanceOptimization';

interface PerformanceMetric {
  name: string;
  values: number[];
  avg: number;
  min: number;
  max: number;
  count: number;
}

export function PerformanceDashboard() {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [memoryUsage, setMemoryUsage] = useState<{
    used: number;
    total: number;
    limit: number;
  } | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const { getPerformanceMetrics } = usePerformanceOptimization();

  // Only show in development
  useEffect(() => {
    setIsVisible(process.env.NODE_ENV === 'development');
  }, []);

  // Update metrics periodically
  useEffect(() => {
    if (!isVisible) return;

    const updateMetrics = () => {
      const performanceMetrics = getPerformanceMetrics();
      setMetrics(performanceMetrics);

      // Get memory usage if available
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        setMemoryUsage({
          used: Math.round(memory.usedJSHeapSize / 1048576),
          total: Math.round(memory.totalJSHeapSize / 1048576),
          limit: Math.round(memory.jsHeapSizeLimit / 1048576),
        });
      }
    };

    updateMetrics();
    const interval = setInterval(updateMetrics, 5000);

    return () => clearInterval(interval);
  }, [isVisible, getPerformanceMetrics]);

  const clearMetrics = () => {
    const monitor = PerformanceMonitor.getInstance();
    monitor.sendMetrics(); // Send before clearing
    setMetrics([]);
  };

  const getMetricColor = (metricName: string, value: number) => {
    if (metricName.includes('load_time') || metricName.includes('render_time')) {
      if (value < 100) return 'bg-green-500';
      if (value < 500) return 'bg-yellow-500';
      return 'bg-red-500';
    }
    
    if (metricName.includes('lcp')) {
      if (value < 2500) return 'bg-green-500';
      if (value < 4000) return 'bg-yellow-500';
      return 'bg-red-500';
    }
    
    if (metricName.includes('fid')) {
      if (value < 100) return 'bg-green-500';
      if (value < 300) return 'bg-yellow-500';
      return 'bg-red-500';
    }
    
    if (metricName.includes('cls')) {
      if (value < 0.1) return 'bg-green-500';
      if (value < 0.25) return 'bg-yellow-500';
      return 'bg-red-500';
    }
    
    return 'bg-blue-500';
  };

  const getMemoryColor = (percentage: number) => {
    if (percentage < 60) return 'bg-green-500';
    if (percentage < 80) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 max-h-96 overflow-hidden">
      <Card className="bg-white/95 backdrop-blur-sm border shadow-lg">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Performance Monitor</CardTitle>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={clearMetrics}
                className="text-xs"
              >
                Clear
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsVisible(false)}
                className="text-xs"
              >
                ×
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-3">
          <Tabs defaultValue="metrics" className="w-full">
            <TabsList className="grid w-full grid-cols-3 text-xs">
              <TabsTrigger value="metrics">Metrics</TabsTrigger>
              <TabsTrigger value="memory">Memory</TabsTrigger>
              <TabsTrigger value="vitals">Web Vitals</TabsTrigger>
            </TabsList>
            
            <TabsContent value="metrics" className="mt-3 space-y-2 max-h-64 overflow-y-auto">
              {metrics.length === 0 ? (
                <p className="text-xs text-gray-500">No metrics available</p>
              ) : (
                metrics.slice(0, 10).map((metric) => (
                  <div key={metric.name} className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-medium truncate">
                        {metric.name.replace(/_/g, ' ')}
                      </span>
                      <Badge
                        variant="secondary"
                        className={`text-xs ${getMetricColor(metric.name, metric.avg)}`}
                      >
                        {metric.avg.toFixed(1)}ms
                      </Badge>
                    </div>
                    <div className="text-xs text-gray-500 flex justify-between">
                      <span>Min: {metric.min.toFixed(1)}</span>
                      <span>Max: {metric.max.toFixed(1)}</span>
                      <span>Count: {metric.count}</span>
                    </div>
                  </div>
                ))
              )}
            </TabsContent>
            
            <TabsContent value="memory" className="mt-3 space-y-3">
              {memoryUsage ? (
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span>Heap Usage</span>
                      <span>{memoryUsage.used}MB / {memoryUsage.total}MB</span>
                    </div>
                    <Progress
                      value={(memoryUsage.used / memoryUsage.total) * 100}
                      className="h-2"
                    />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span>Memory Limit</span>
                      <span>{memoryUsage.limit}MB</span>
                    </div>
                    <Progress
                      value={(memoryUsage.total / memoryUsage.limit) * 100}
                      className="h-2"
                    />
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="text-center">
                      <div className="font-medium">{memoryUsage.used}MB</div>
                      <div className="text-gray-500">Used</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium">{memoryUsage.total}MB</div>
                      <div className="text-gray-500">Total</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium">{memoryUsage.limit}MB</div>
                      <div className="text-gray-500">Limit</div>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-gray-500">Memory info not available</p>
              )}
            </TabsContent>
            
            <TabsContent value="vitals" className="mt-3 space-y-2">
              {(() => {
                const webVitals = metrics.filter(m => 
                  m.name.includes('lcp') || 
                  m.name.includes('fid') || 
                  m.name.includes('cls')
                );
                
                return webVitals.length === 0 ? (
                  <p className="text-xs text-gray-500">No Web Vitals data</p>
                ) : (
                  webVitals.map((vital) => (
                    <div key={vital.name} className="flex justify-between items-center">
                      <span className="text-xs font-medium">
                        {vital.name.toUpperCase()}
                      </span>
                      <Badge
                        variant="secondary"
                        className={`text-xs ${getMetricColor(vital.name, vital.avg)}`}
                      >
                        {vital.name.includes('cls') 
                          ? vital.avg.toFixed(3)
                          : `${vital.avg.toFixed(0)}ms`
                        }
                      </Badge>
                    </div>
                  ))
                );
              })()}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

// Performance toggle button for easy access
export function PerformanceToggle() {
  const [showDashboard, setShowDashboard] = useState(false);

  if (process.env.NODE_ENV !== 'development') return null;

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowDashboard(!showDashboard)}
        className="fixed bottom-4 left-4 z-50 text-xs"
      >
        📊 Perf
      </Button>
      
      {showDashboard && <PerformanceDashboard />}
    </>
  );
}