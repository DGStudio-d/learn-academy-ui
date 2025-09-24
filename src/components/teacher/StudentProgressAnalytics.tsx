import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Progress } from '../ui/progress';
import { 
  Users, 
  TrendingUp, 
  TrendingDown, 
  Award, 
  Clock, 
  BookOpen,
  Calendar,
  Download,
  Filter,
  Search,
  BarChart3,
  PieChart,
  Activity,
  Target,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import {
  useTeacherStudents,
  useStudentProgress,
  useContentAnalytics,
  useTeacherPrograms,
  useExportStudentProgress
} from '../../hooks/useTeacher';
import { toast } from '../ui/use-toast';
import { format } from 'date-fns';

interface StudentProgressAnalyticsProps {
  programId?: number;
}

export const StudentProgressAnalytics: React.FC<StudentProgressAnalyticsProps> = ({ programId }) => {
  const [selectedProgramId, setSelectedProgramId] = useState<number | undefined>(programId);
  const [selectedStudentId, setSelectedStudentId] = useState<number | undefined>();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'progress' | 'score' | 'activity'>('progress');
  const [filterBy, setFilterBy] = useState<'all' | 'active' | 'struggling' | 'excellent'>('all');

  const { data: programs } = useTeacherPrograms();
  const { data: studentsData } = useTeacherStudents(selectedProgramId);
  const { data: selectedStudentProgress } = useStudentProgress(
    selectedStudentId || 0,
    selectedProgramId
  );
  const { data: analytics } = useContentAnalytics({
    program_id: selectedProgramId,
  });
  const exportMutation = useExportStudentProgress();

  const students = studentsData?.data.data || [];

  const filteredAndSortedStudents = students
    .filter(student => {
      if (searchTerm && !student.name.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      // Mock progress data for filtering (in real app, this would come from API)
      const mockProgress = Math.random() * 100;
      const mockScore = Math.random() * 100;
      
      switch (filterBy) {
        case 'struggling':
          return mockProgress < 50 || mockScore < 60;
        case 'excellent':
          return mockProgress > 80 && mockScore > 85;
        case 'active':
          return mockProgress > 0;
        default:
          return true;
      }
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'progress':
          // Mock sorting by progress
          return Math.random() - 0.5;
        case 'score':
          // Mock sorting by score
          return Math.random() - 0.5;
        case 'activity':
          // Mock sorting by activity
          return Math.random() - 0.5;
        default:
          return 0;
      }
    });

  const handleExportProgress = async () => {
    try {
      const result = await exportMutation.mutateAsync({
        program_id: selectedProgramId,
        format: 'excel',
      });
      
      // Open download URL
      window.open(result.download_url, '_blank');
      
      toast({
        title: "Success",
        description: "Student progress report exported successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export progress report",
        variant: "destructive",
      });
    }
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPerformanceLevel = (score: number) => {
    if (score >= 90) return { label: 'Excellent', color: 'bg-green-500' };
    if (score >= 80) return { label: 'Good', color: 'bg-blue-500' };
    if (score >= 70) return { label: 'Average', color: 'bg-yellow-500' };
    if (score >= 60) return { label: 'Below Average', color: 'bg-orange-500' };
    return { label: 'Needs Improvement', color: 'bg-red-500' };
  };

  // Mock data for demonstration
  const mockStudentData = (student: any) => ({
    ...student,
    progress: Math.floor(Math.random() * 100),
    averageScore: Math.floor(Math.random() * 100),
    quizzesCompleted: Math.floor(Math.random() * 20),
    totalQuizzes: 20,
    meetingsAttended: Math.floor(Math.random() * 10),
    totalMeetings: 10,
    lastActivity: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
    timeSpent: Math.floor(Math.random() * 50) + 10, // hours
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Student Progress Analytics</h2>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={handleExportProgress}
            disabled={exportMutation.isPending}
          >
            <Download className="h-4 w-4 mr-2" />
            {exportMutation.isPending ? 'Exporting...' : 'Export Report'}
          </Button>
        </div>
      </div>

      {/* Filters and Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Program</Label>
              <Select
                value={selectedProgramId?.toString() || ''}
                onValueChange={(value) => setSelectedProgramId(value ? parseInt(value) : undefined)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Programs" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Programs</SelectItem>
                  {programs?.data.data.map((program) => (
                    <SelectItem key={program.id} value={program.id.toString()}>
                      {program.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Search Students</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Sort By</Label>
              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="progress">Progress</SelectItem>
                  <SelectItem value="score">Average Score</SelectItem>
                  <SelectItem value="activity">Last Activity</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Filter By Performance</Label>
              <Select value={filterBy} onValueChange={(value: any) => setFilterBy(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Students</SelectItem>
                  <SelectItem value="excellent">Excellent (&gt;85%)</SelectItem>
                  <SelectItem value="active">Active Students</SelectItem>
                  <SelectItem value="struggling">Struggling (&lt;60%)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="students">Student List</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="individual">Individual Progress</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{students.length}</div>
                <p className="text-xs text-muted-foreground">
                  {Math.floor(students.length * 0.8)} active this week
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Progress</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">73%</div>
                <p className="text-xs text-muted-foreground">
                  +5% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Score</CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">82%</div>
                <p className="text-xs text-muted-foreground">
                  Above target (75%)
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">68%</div>
                <p className="text-xs text-muted-foreground">
                  Quiz completion rate
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Performance Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Distribution</CardTitle>
                <CardDescription>Student performance levels</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { level: 'Excellent (90-100%)', count: Math.floor(students.length * 0.2), color: 'bg-green-500' },
                    { level: 'Good (80-89%)', count: Math.floor(students.length * 0.3), color: 'bg-blue-500' },
                    { level: 'Average (70-79%)', count: Math.floor(students.length * 0.3), color: 'bg-yellow-500' },
                    { level: 'Below Average (60-69%)', count: Math.floor(students.length * 0.15), color: 'bg-orange-500' },
                    { level: 'Needs Improvement (<60%)', count: Math.floor(students.length * 0.05), color: 'bg-red-500' },
                  ].map((item, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className={`w-4 h-4 rounded ${item.color}`} />
                      <div className="flex-1">
                        <div className="flex justify-between text-sm">
                          <span>{item.level}</span>
                          <span>{item.count} students</span>
                        </div>
                        <Progress 
                          value={(item.count / students.length) * 100} 
                          className="h-2 mt-1"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Student engagement trends</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <div>
                        <p className="font-medium">Quiz Completions</p>
                        <p className="text-sm text-muted-foreground">Last 7 days</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">47</div>
                      <div className="text-sm text-green-600">+12%</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-5 w-5 text-blue-500" />
                      <div>
                        <p className="font-medium">Meeting Attendance</p>
                        <p className="text-sm text-muted-foreground">This week</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">89%</div>
                      <div className="text-sm text-blue-600">+3%</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center space-x-3">
                      <Clock className="h-5 w-5 text-orange-500" />
                      <div>
                        <p className="font-medium">Study Time</p>
                        <p className="text-sm text-muted-foreground">Average per student</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">4.2h</div>
                      <div className="text-sm text-orange-600">-8%</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="students" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Student Progress List</CardTitle>
              <CardDescription>
                Showing {filteredAndSortedStudents.length} of {students.length} students
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredAndSortedStudents.map((student) => {
                  const studentData = mockStudentData(student);
                  const performance = getPerformanceLevel(studentData.averageScore);
                  
                  return (
                    <div
                      key={student.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted cursor-pointer"
                      onClick={() => setSelectedStudentId(student.id)}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                            {student.name.charAt(0)}
                          </div>
                        </div>
                        <div>
                          <h3 className="font-semibold">{student.name}</h3>
                          <p className="text-sm text-muted-foreground">{student.email}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-6">
                        <div className="text-center">
                          <div className="text-sm font-medium">Progress</div>
                          <div className={`text-lg font-bold ${getProgressColor(studentData.progress)}`}>
                            {studentData.progress}%
                          </div>
                        </div>

                        <div className="text-center">
                          <div className="text-sm font-medium">Avg Score</div>
                          <div className={`text-lg font-bold ${getProgressColor(studentData.averageScore)}`}>
                            {studentData.averageScore}%
                          </div>
                        </div>

                        <div className="text-center">
                          <div className="text-sm font-medium">Quizzes</div>
                          <div className="text-lg font-bold">
                            {studentData.quizzesCompleted}/{studentData.totalQuizzes}
                          </div>
                        </div>

                        <div className="text-center">
                          <div className="text-sm font-medium">Last Active</div>
                          <div className="text-sm text-muted-foreground">
                            {format(studentData.lastActivity, 'MMM dd')}
                          </div>
                        </div>

                        <Badge className={performance.color}>
                          {performance.label}
                        </Badge>
                      </div>
                    </div>
                  );
                })}

                {filteredAndSortedStudents.length === 0 && (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Students Found</h3>
                    <p className="text-muted-foreground">
                      Try adjusting your filters or search criteria.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Quiz Performance Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center py-8">
                    <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                      Quiz performance chart would be displayed here
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="h-5 w-5 mr-2" />
                  Engagement Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Daily Active Students</span>
                    <span className="text-sm text-muted-foreground">78%</span>
                  </div>
                  <Progress value={78} className="h-2" />

                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Weekly Retention</span>
                    <span className="text-sm text-muted-foreground">85%</span>
                  </div>
                  <Progress value={85} className="h-2" />

                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Assignment Completion</span>
                    <span className="text-sm text-muted-foreground">72%</span>
                  </div>
                  <Progress value={72} className="h-2" />

                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Meeting Attendance</span>
                    <span className="text-sm text-muted-foreground">89%</span>
                  </div>
                  <Progress value={89} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Performers and Struggling Students */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="h-5 w-5 mr-2 text-yellow-500" />
                  Top Performers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {students.slice(0, 5).map((student, index) => {
                    const mockScore = 95 - index * 3;
                    return (
                      <div key={student.id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Badge variant="outline">#{index + 1}</Badge>
                          <span className="font-medium">{student.name}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-green-600">{mockScore}%</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertCircle className="h-5 w-5 mr-2 text-red-500" />
                  Students Needing Attention
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {students.slice(0, 5).map((student, index) => {
                    const mockScore = 45 + index * 5;
                    return (
                      <div key={student.id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <XCircle className="h-4 w-4 text-red-500" />
                          <span className="font-medium">{student.name}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-red-600">{mockScore}%</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="individual" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Select Student</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {students.map((student) => (
                    <Button
                      key={student.id}
                      variant={selectedStudentId === student.id ? 'default' : 'outline'}
                      className="w-full justify-start"
                      onClick={() => setSelectedStudentId(student.id)}
                    >
                      {student.name}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="lg:col-span-2">
              {selectedStudentId ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Individual Progress Report</CardTitle>
                    <CardDescription>
                      Detailed progress for {students.find(s => s.id === selectedStudentId)?.name}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {selectedStudentProgress ? (
                      <div className="space-y-6">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">
                              {selectedStudentProgress.overall_progress.completion_percentage}%
                            </div>
                            <div className="text-sm text-muted-foreground">Overall Progress</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">
                              {selectedStudentProgress.overall_progress.average_score}%
                            </div>
                            <div className="text-sm text-muted-foreground">Average Score</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold">
                              {selectedStudentProgress.overall_progress.quizzes_completed}
                            </div>
                            <div className="text-sm text-muted-foreground">Quizzes Completed</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold">
                              {selectedStudentProgress.overall_progress.meetings_attended}
                            </div>
                            <div className="text-sm text-muted-foreground">Meetings Attended</div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <h4 className="font-semibold">Recent Quiz Attempts</h4>
                          {selectedStudentProgress.quiz_attempts.slice(0, 5).map((attempt, index) => (
                            <div key={index} className="flex items-center justify-between p-3 border rounded">
                              <div>
                                <p className="font-medium">{attempt.quiz?.title}</p>
                                <p className="text-sm text-muted-foreground">
                                  {format(new Date(attempt.completed_at), 'MMM dd, yyyy')}
                                </p>
                              </div>
                              <div className="text-right">
                                <div className={`font-bold ${getProgressColor(attempt.score)}`}>
                                  {attempt.score}%
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {attempt.correct_answers}/{attempt.total_questions}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">Loading student progress...</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="text-center py-12">
                    <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Select a Student</h3>
                    <p className="text-muted-foreground">
                      Choose a student from the list to view their detailed progress report.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StudentProgressAnalytics;