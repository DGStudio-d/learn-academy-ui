import React from 'react';
import { 
  TrendingUp, 
  Search, 
  Clock, 
  Users, 
  BarChart3,
  Eye,
  Filter,
  Download
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';
import { searchService } from '@/services/searchService';
import { cn } from '@/lib/utils';

interface SearchAnalyticsProps {
  className?: string;
  timeRange?: '7d' | '30d' | '90d' | '1y';
  onTimeRangeChange?: (range: '7d' | '30d' | '90d' | '1y') => void;
}

interface SearchAnalyticsData {
  overview: {
    total_searches: number;
    unique_users: number;
    avg_results_per_search: number;
    avg_search_time: number;
    popular_content_types: Array<{
      type: string;
      count: number;
      percentage: number;
    }>;
  };
  popular_queries: Array<{
    query: string;
    count: number;
    avg_results: number;
    success_rate: number;
  }>;
  search_trends: Array<{
    date: string;
    searches: number;
    unique_users: number;
  }>;
  content_performance: Array<{
    content_type: string;
    searches: number;
    avg_results: number;
    click_through_rate: number;
  }>;
  user_behavior: {
    avg_session_searches: number;
    bounce_rate: number;
    refinement_rate: number;
    export_rate: number;
  };
}

export const SearchAnalytics: React.FC<SearchAnalyticsProps> = ({
  className,
  timeRange = '30d',
  onTimeRangeChange
}) => {
  const [selectedTimeRange, setSelectedTimeRange] = React.useState(timeRange);

  // Fetch search analytics data
  const { data: analyticsData, isLoading, error } = useQuery({
    queryKey: ['search-analytics', selectedTimeRange],
    queryFn: async () => {
      // This would be replaced with actual API call
      const mockData: SearchAnalyticsData = {
        overview: {
          total_searches: 12543,
          unique_users: 1847,
          avg_results_per_search: 23.4,
          avg_search_time: 1.8,
          popular_content_types: [
            { type: 'users', count: 4521, percentage: 36 },
            { type: 'quizzes', count: 3876, percentage: 31 },
            { type: 'programs', count: 2654, percentage: 21 },
            { type: 'meetings', count: 1492, percentage: 12 }
          ]
        },
        popular_queries: [
          { query: 'javascript', count: 234, avg_results: 45, success_rate: 89 },
          { query: 'beginner', count: 198, avg_results: 67, success_rate: 92 },
          { query: 'english', count: 176, avg_results: 34, success_rate: 78 },
          { query: 'quiz', count: 154, avg_results: 23, success_rate: 85 },
          { query: 'meeting', count: 132, avg_results: 12, success_rate: 76 }
        ],
        search_trends: [
          { date: '2024-01-01', searches: 423, unique_users: 89 },
          { date: '2024-01-02', searches: 456, unique_users: 92 },
          { date: '2024-01-03', searches: 389, unique_users: 78 },
          { date: '2024-01-04', searches: 512, unique_users: 105 },
          { date: '2024-01-05', searches: 478, unique_users: 98 }
        ],
        content_performance: [
          { content_type: 'users', searches: 4521, avg_results: 28.4, click_through_rate: 67 },
          { content_type: 'quizzes', searches: 3876, avg_results: 15.2, click_through_rate: 73 },
          { content_type: 'programs', searches: 2654, avg_results: 12.8, click_through_rate: 81 },
          { content_type: 'meetings', searches: 1492, avg_results: 8.3, click_through_rate: 59 }
        ],
        user_behavior: {
          avg_session_searches: 3.2,
          bounce_rate: 24,
          refinement_rate: 42,
          export_rate: 8
        }
      };
      return mockData;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const handleTimeRangeChange = (range: string) => {
    const newRange = range as '7d' | '30d' | '90d' | '1y';
    setSelectedTimeRange(newRange);
    onTimeRangeChange?.(newRange);
  };

  if (isLoading) {
    return (
      <div className={cn("space-y-4", className)}>
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-muted rounded w-1/4"></div>
                <div className="h-8 bg-muted rounded w-1/2"></div>
                <div className="h-3 bg-muted rounded w-3/4"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error || !analyticsData) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Failed to load search analytics</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Search Analytics</h2>
          <p className="text-muted-foreground">
            Insights into search behavior and performance
          </p>
        </div>
        
        <Select value={selectedTimeRange} onValueChange={handleTimeRangeChange}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
            <SelectItem value="1y">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Searches</CardTitle>
            <Search className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analyticsData.overview.total_searches.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              +12% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analyticsData.overview.unique_users.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              +8% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Results</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analyticsData.overview.avg_results_per_search}
            </div>
            <p className="text-xs text-muted-foreground">
              per search query
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Search Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analyticsData.overview.avg_search_time}s
            </div>
            <p className="text-xs text-muted-foreground">
              response time
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="popular" className="space-y-4">
        <TabsList>
          <TabsTrigger value="popular">Popular Queries</TabsTrigger>
          <TabsTrigger value="content">Content Performance</TabsTrigger>
          <TabsTrigger value="behavior">User Behavior</TabsTrigger>
        </TabsList>

        <TabsContent value="popular" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Popular Queries */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Most Searched Terms
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {analyticsData.popular_queries.map((query, index) => (
                  <div key={query.query} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="w-6 h-6 p-0 flex items-center justify-center text-xs">
                        {index + 1}
                      </Badge>
                      <div>
                        <div className="font-medium">{query.query}</div>
                        <div className="text-xs text-muted-foreground">
                          {query.count} searches • {query.avg_results} avg results
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{query.success_rate}%</div>
                      <div className="text-xs text-muted-foreground">success</div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Content Type Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Content Type Distribution
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {analyticsData.overview.popular_content_types.map((type) => (
                  <div key={type.type} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="capitalize font-medium">{type.type}</span>
                      <span className="text-sm text-muted-foreground">
                        {type.count.toLocaleString()} ({type.percentage}%)
                      </span>
                    </div>
                    <Progress value={type.percentage} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="content" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Content Performance Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.content_performance.map((content) => (
                  <div key={content.content_type} className="grid grid-cols-4 gap-4 p-4 border rounded-lg">
                    <div>
                      <div className="font-medium capitalize">{content.content_type}</div>
                      <div className="text-sm text-muted-foreground">Content Type</div>
                    </div>
                    <div>
                      <div className="font-medium">{content.searches.toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground">Searches</div>
                    </div>
                    <div>
                      <div className="font-medium">{content.avg_results}</div>
                      <div className="text-sm text-muted-foreground">Avg Results</div>
                    </div>
                    <div>
                      <div className="font-medium">{content.click_through_rate}%</div>
                      <div className="text-sm text-muted-foreground">Click Rate</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="behavior" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  User Engagement
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Avg Searches per Session</span>
                  <span className="font-medium">{analyticsData.user_behavior.avg_session_searches}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Bounce Rate</span>
                  <span className="font-medium">{analyticsData.user_behavior.bounce_rate}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Search Refinement Rate</span>
                  <span className="font-medium">{analyticsData.user_behavior.refinement_rate}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Export Rate</span>
                  <span className="font-medium">{analyticsData.user_behavior.export_rate}%</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Search Quality Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span>Zero Results Rate</span>
                    <span className="font-medium">8%</span>
                  </div>
                  <Progress value={8} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span>Query Success Rate</span>
                    <span className="font-medium">84%</span>
                  </div>
                  <Progress value={84} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span>User Satisfaction</span>
                    <span className="font-medium">76%</span>
                  </div>
                  <Progress value={76} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Export Analytics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export Analytics Data
            </span>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Download detailed analytics data for further analysis and reporting.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};