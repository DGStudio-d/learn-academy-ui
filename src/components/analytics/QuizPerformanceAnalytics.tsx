import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Progress } from '../ui/progress';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter,
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import {
  Target,
  TrendingUp,
  TrendingDown,
  Clock,
  Users,
  Award,
  AlertTriangle,
  CheckCircle,
  XCircle,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  Download,
  Filter,
  Eye,
  Brain,
  Zap,
  Loader2
} from 'lucide-react';
import { useQuizAnalytics, useQuizPerformanceData } from '../../hooks/useTeacher';
import { toast } from '../ui/use-toast';

interface QuizPerformanceAnalyticsProps {
  quizId?: number;
  programId?: number;
  className?: string;
}

interface QuizAnalyticsData {
  quiz_overview: {
    total_attempts: number;
    unique_students: number;
    average_score: number;
    completion_rate: number;
    average_time: number;
    difficulty_rating: number;
  };
  score_distribution: Array<{
    range: string;
    count: number;
    percentage: number;
  }>;
  time_analysis: Array<{
    time_range: string;
    count: number;
    avg_score: number;
  }>;
  question_analysis: Array<{
    question_id: number;
    question_text: string;
    correct_rate: number;
    avg_time: number;
    difficulty: 'easy' | 'medium' | 'hard';
    common_mistakes: string[];
  }>;
  performance_trends: Array<{
    date: string;
    attempts: number;
    avg_score: number;
    completion_rate: number;
  }>;
  student_performance: Array<{
    student_id: number;
    student_name: string;
    attempts: number;
    best_score: number;
    avg_score: number;
    improvement: number;
    time_spent: number;
  }>;
  comparative_analysis: {
    vs_program_average: number;
    vs_difficulty_peers: number;
    ranking_percentile: number;
  };
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export const QuizPerformanceAnalytics: React.FC<QuizPerformanceAnalyticsProps> = ({
  quizId,
  programId,
  className
}) => {
  const [selectedQuiz, setSelectedQuiz] = useState<number | undefined>(quizId);
  const [timeRange, setTimeRange] = useState('30');
  const [analysisType, setAnalysisType] = useState<'overview' | 'detailed' | 'comparative'>('overview');

  const { data: analyticsData, isLoading } = useQuizAnalytics(selectedQuiz, {
    time_range: timeRange,
    include_questions: true,
    include_students: true
  });

  // Mock comprehensive analytics data
  const mockAnalyticsData: QuizAnalyticsData = {
    quiz_overview: {
      total_attempts: 156,
      unique_students: 89,
      average_score: 78.5,
      completion_rate: 92.3,
      average_time: 18.5, // minutes
      difficulty_rating: 3.2 // out of 5
    },
    score_distribution: [
      { range: '90-100%', count: 25, percentage: 16.0 },
      { range: '80-89%', count: 45, percentage: 28.8 },
      { range: '70-79%', count: 38, percentage: 24.4 },
      { range: '60-69%', count: 28, percentage: 17.9 },
      { range: '50-59%', count: 15, percentage: 9.6 },
      { range: '<50%', count: 5, percentage: 3.2 }
    ],
    time_analysis: [
      { time_range: '<10 min', count: 12, avg_score: 65.2 },
      { time_range: '10-15 min', count: 34, avg_score: 72.8 },
      { time_range: '15-20 min', count: 58, avg_score: 81.3 },
      { time_range: '20-25 min', count: 35, avg_score: 84.7 },
      { time_range: '25-30 min', count: 12, avg_score: 79.1 },
      { time_range: '>30 min', count: 5, avg_score: 68.4 }
    ],
    question_analysis: [
      {
        question_id: 1,
        question_text: 'What is the correct form of the verb "to be" in this sentence?',
        correct_rate: 85.2,
        avg_time: 45, // seconds
        difficulty: 'easy',
        common_mistakes: ['Using "is" instead of "are"', 'Confusion with past tense']
      },
      {
        question_id: 2,
        question_text: 'Choose the correct preposition for this context.',
        correct_rate: 67.8,
        avg_time: 62,
        difficulty: 'medium',
        common_mistakes: ['Mixing "in" and "on"', 'Literal translation from native language']
      },
      {
        question_id: 3,
        question_text: 'Identify the subjunctive mood in the following sentence.',
        correct_rate: 42.1,
        avg_time: 89,
        difficulty: 'hard',
        common_mistakes: ['Confusing with conditional', 'Not recognizing subjunctive structure']
      }
    ],
    performance_trends: [
      { date: '2024-01-01', attempts: 12, avg_score: 75.2, completion_rate: 88.5 },
      { date: '2024-01-02', attempts: 18, avg_score: 77.8, completion_rate: 91.2 },
      { date: '2024-01-03', attempts: 15, avg_score: 79.1, completion_rate: 93.1 },
      { date: '2024-01-04', attempts: 22, avg_score: 78.9, completion_rate: 94.2 },
      { date: '2024-01-05', attempts: 19, avg_score: 80.3, completion_rate: 95.1 },
      { date: '2024-01-06', attempts: 25, avg_score: 81.2, completion_rate: 92.8 },
      { date: '2024-01-07', attempts: 21, avg_score: 79.7, completion_rate: 91.5 }
    ],
    student_performance: [
      {
        student_id: 1,
        student_name: 'Alice Johnson',
        attempts: 3,
        best_score: 95,
        avg_score: 89.3,
        improvement: 12.5,
        time_spent: 52
      },
      {
        student_id: 2,
        student_name: 'Bob Smith',
        attempts: 2,
        best_score: 87,
        avg_score: 82.5,
        improvement: 8.2,
        time_spent: 38
      },
      {
        student_id: 3,
        student_name: 'Carol Davis',
        attempts: 4,
        best_score: 78,
        avg_score: 71.8,
        improvement: -2.1,
        time_spent: 67
      }
    ],
    comparative_analysis: {
      vs_program_average: 5.2, // +5.2% above program average
      vs_difficulty_peers: -2.1, // -2.1% below similar difficulty quizzes
      ranking_percentile: 68.5 // 68.5th percentile
    }
  };

  const data = analyticsData || mockAnalyticsData;

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'hard': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    if (score >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const handleExportAnalytics = async () => {
    try {
      // Mock export functionality
      const csvData = generateAnalyticsCSV();
      const blob = new Blob([csvData], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `quiz-analytics-${selectedQuiz}-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Success",
        description: "Analytics data exported successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export analytics data",
        variant: "destructive",
      });
    }
  };

  const generateAnalyticsCSV = () => {
    const headers = ['Student', 'Attempts', 'Best Score', 'Average Score', 'Improvement', 'Time Spent'];
    const rows = data.student_performance.map(student => 
      [student.student_name, student.attempts, student.best_score, student.avg_score, student.improvement, student.time_spent].join(',')
    );
    return [headers.join(','), ...rows].join('\n');
  };

  if (isLoading) {
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
          <h2 className="text-2xl font-bold">Quiz Performance Analytics</h2>
          <p className="text-muted-foreground">Detailed insights into quiz performance and student learning</p>
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
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleExportAnalytics}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{data.quiz_overview.total_attempts}</div>
            <div className="text-sm text-muted-foreground">Total Attempts</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{data.quiz_overview.unique_students}</div>
            <div className="text-sm text-muted-foreground">Unique Students</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className={`text-2xl font-bold ${getPerformanceColor(data.quiz_overview.average_score)}`}>
              {data.quiz_overview.average_score}%
            </div>
            <div className="text-sm text-muted-foreground">Average Score</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{data.quiz_overview.completion_rate}%</div>
            <div className="text-sm text-muted-foreground">Completion Rate</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{data.quiz_overview.average_time}m</div>
            <div className="text-sm text-muted-foreground">Avg Time</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center space-x-1">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className={`w-3 h-3 rounded-full ${
                    i < Math.floor(data.quiz_overview.difficulty_rating) ? 'bg-yellow-400' : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
            <div className="text-sm text-muted-foreground">Difficulty</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="distribution">Distribution</TabsTrigger>
          <TabsTrigger value="questions">Questions</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Performance Trends */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Trends</CardTitle>
                <CardDescription>Score and completion trends over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={data.performance_trends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="avg_score" stroke="#8884d8" strokeWidth={2} />
                    <Line type="monotone" dataKey="completion_rate" stroke="#82ca9d" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Score Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Score Distribution</CardTitle>
                <CardDescription>How students performed on this quiz</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.score_distribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="range" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Comparative Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Comparative Analysis</CardTitle>
              <CardDescription>How this quiz compares to others</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">
                    +{data.comparative_analysis.vs_program_average}%
                  </div>
                  <div className="text-sm text-muted-foreground">vs Program Average</div>
                  <div className="mt-2">
                    <TrendingUp className="h-5 w-5 text-green-600 mx-auto" />
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-3xl font-bold text-red-600">
                    {data.comparative_analysis.vs_difficulty_peers}%
                  </div>
                  <div className="text-sm text-muted-foreground">vs Similar Difficulty</div>
                  <div className="mt-2">
                    <TrendingDown className="h-5 w-5 text-red-600 mx-auto" />
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">
                    {data.comparative_analysis.ranking_percentile}th
                  </div>
                  <div className="text-sm text-muted-foreground">Percentile Ranking</div>
                  <div className="mt-2">
                    <Award className="h-5 w-5 text-blue-600 mx-auto" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="distribution" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Score Distribution Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Score Distribution</CardTitle>
                <CardDescription>Percentage breakdown of student scores</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={data.score_distribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ range, percentage }) => `${range}: ${percentage}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {data.score_distribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Time vs Score Analysis */}
            <Card>
              <CardHeader>
                <CardTitle>Time vs Score Analysis</CardTitle>
                <CardDescription>Relationship between time spent and performance</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.time_analysis}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time_range" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="avg_score" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="questions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Question-by-Question Analysis</CardTitle>
              <CardDescription>Detailed breakdown of each question's performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {data.question_analysis.map((question, index) => (
                  <div key={question.question_id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge variant="outline">Question {index + 1}</Badge>
                          <Badge className={getDifficultyColor(question.difficulty)}>
                            {question.difficulty}
                          </Badge>
                        </div>
                        <p className="text-sm font-medium mb-2">{question.question_text}</p>
                      </div>
                      <div className="text-right">
                        <div className={`text-lg font-bold ${getPerformanceColor(question.correct_rate)}`}>
                          {question.correct_rate}%
                        </div>
                        <div className="text-xs text-muted-foreground">Correct Rate</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm">Success Rate</span>
                          <span className="text-sm font-medium">{question.correct_rate}%</span>
                        </div>
                        <Progress value={question.correct_rate} className="h-2" />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm">Average Time</span>
                          <span className="text-sm font-medium">{question.avg_time}s</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${Math.min((question.avg_time / 120) * 100, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {question.common_mistakes.length > 0 && (
                      <div className="mt-3">
                        <h4 className="text-sm font-medium mb-2 flex items-center">
                          <AlertTriangle className="h-4 w-4 text-yellow-500 mr-1" />
                          Common Mistakes
                        </h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          {question.common_mistakes.map((mistake, idx) => (
                            <li key={idx} className="flex items-start">
                              <span className="text-red-500 mr-2">•</span>
                              {mistake}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="students" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Student Performance</CardTitle>
              <CardDescription>Individual student analysis and progress</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.student_performance.map((student) => (
                  <div key={student.student_id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {student.student_name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-semibold">{student.student_name}</h3>
                        <p className="text-sm text-muted-foreground">{student.attempts} attempts</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-6">
                      <div className="text-center">
                        <div className={`text-lg font-bold ${getPerformanceColor(student.best_score)}`}>
                          {student.best_score}%
                        </div>
                        <div className="text-xs text-muted-foreground">Best Score</div>
                      </div>

                      <div className="text-center">
                        <div className={`text-lg font-bold ${getPerformanceColor(student.avg_score)}`}>
                          {student.avg_score}%
                        </div>
                        <div className="text-xs text-muted-foreground">Average</div>
                      </div>

                      <div className="text-center">
                        <div className={`text-lg font-bold flex items-center ${
                          student.improvement >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {student.improvement >= 0 ? (
                            <TrendingUp className="h-4 w-4 mr-1" />
                          ) : (
                            <TrendingDown className="h-4 w-4 mr-1" />
                          )}
                          {Math.abs(student.improvement)}%
                        </div>
                        <div className="text-xs text-muted-foreground">Improvement</div>
                      </div>

                      <div className="text-center">
                        <div className="text-lg font-bold text-purple-600">{student.time_spent}m</div>
                        <div className="text-xs text-muted-foreground">Time Spent</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Key Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Brain className="h-5 w-5 mr-2" />
                  Key Insights
                </CardTitle>
                <CardDescription>AI-powered analysis of quiz performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <div className="font-medium text-green-800">Strong Performance</div>
                      <div className="text-sm text-green-600">
                        Students who spent 15-20 minutes achieved the highest average scores (81.3%)
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div>
                      <div className="font-medium text-yellow-800">Areas for Improvement</div>
                      <div className="text-sm text-yellow-600">
                        Question 3 has a low success rate (42.1%) - consider reviewing subjunctive mood concepts
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                    <Zap className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <div className="font-medium text-blue-800">Optimization Opportunity</div>
                      <div className="text-sm text-blue-600">
                        Students rushing through (&lt;10 min) show 20% lower scores - encourage thorough reading
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="h-5 w-5 mr-2" />
                  Recommendations
                </CardTitle>
                <CardDescription>Actionable suggestions for improvement</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border-l-4 border-blue-500 pl-4">
                    <h4 className="font-medium">Content Review</h4>
                    <p className="text-sm text-muted-foreground">
                      Focus on subjunctive mood concepts in upcoming lessons. Consider additional practice exercises.
                    </p>
                  </div>

                  <div className="border-l-4 border-green-500 pl-4">
                    <h4 className="font-medium">Time Management</h4>
                    <p className="text-sm text-muted-foreground">
                      Encourage students to spend 15-20 minutes on quizzes for optimal performance.
                    </p>
                  </div>

                  <div className="border-l-4 border-purple-500 pl-4">
                    <h4 className="font-medium">Question Design</h4>
                    <p className="text-sm text-muted-foreground">
                      Consider breaking down complex questions into smaller, more manageable parts.
                    </p>
                  </div>

                  <div className="border-l-4 border-orange-500 pl-4">
                    <h4 className="font-medium">Student Support</h4>
                    <p className="text-sm text-muted-foreground">
                      Provide additional support for students showing declining performance trends.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default QuizPerformanceAnalytics;