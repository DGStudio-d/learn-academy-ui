import React, { useState } from 'react';
import { 
  useTeacherLanguages, 
  useTeacherContentManagement, 
  useContentAnalytics,
  useTeacherStudents,
  useStudentProgress 
} from '../../hooks/useTeacher';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Loader2, Users, BookOpen, Calendar, TrendingUp } from 'lucide-react';

/**
 * Enhanced Teacher Content Management Component
 * Demonstrates the new teacher service functionality including:
 * - Language-specific content filtering
 * - Student tracking and progress monitoring
 * - Content analytics
 */
export const TeacherContentManagement: React.FC = () => {
  const [selectedLanguageId, setSelectedLanguageId] = useState<number | undefined>();
  const [selectedStudentId, setSelectedStudentId] = useState<number | undefined>();

  // Fetch teacher's assigned languages
  const { data: languages, isLoading: languagesLoading } = useTeacherLanguages();

  // Fetch content by selected language
  const { 
    programs, 
    quizzes, 
    meetings, 
    isLoading: contentLoading 
  } = useTeacherContentManagement(selectedLanguageId);

  // Fetch analytics
  const { data: analytics, isLoading: analyticsLoading } = useContentAnalytics({
    language_id: selectedLanguageId
  });

  // Fetch students
  const { data: studentsData, isLoading: studentsLoading } = useTeacherStudents();

  // Fetch selected student progress
  const { data: studentProgress, isLoading: progressLoading } = useStudentProgress(
    selectedStudentId || 0,
    undefined
  );

  if (languagesLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading teacher data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Content Management</h1>
        
        {/* Language Filter */}
        <div className="flex items-center space-x-2">
          <label htmlFor="language-select" className="text-sm font-medium">
            Filter by Language:
          </label>
          <Select
            value={selectedLanguageId?.toString() || ''}
            onValueChange={(value) => setSelectedLanguageId(value ? parseInt(value) : undefined)}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All Languages" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Languages</SelectItem>
              {languages?.map((language) => (
                <SelectItem key={language.id} value={language.id.toString()}>
                  {language.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          {analyticsLoading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {analytics?.student_analytics.total_students || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {analytics?.student_analytics.active_students || 0} active
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Quizzes</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {analytics?.quiz_analytics.total_quizzes || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {analytics?.quiz_analytics.total_attempts || 0} attempts
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Meetings</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {analytics?.meeting_analytics.total_meetings || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {analytics?.meeting_analytics.average_attendance || 0}% avg attendance
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg Score</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {analytics?.quiz_analytics.average_score || 0}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {analytics?.quiz_analytics.completion_rate || 0}% completion
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Content Tab */}
        <TabsContent value="content" className="space-y-4">
          {contentLoading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Programs */}
              <Card>
                <CardHeader>
                  <CardTitle>Programs</CardTitle>
                  <CardDescription>
                    {selectedLanguageId ? 'Filtered by selected language' : 'All programs'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {programs.data?.data.data.map((program) => (
                      <div key={program.id} className="flex items-center justify-between p-2 border rounded">
                        <span className="font-medium">{program.name}</span>
                        <Badge variant={program.is_active ? 'default' : 'secondary'}>
                          {program.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    ))}
                    {programs.data?.data.data.length === 0 && (
                      <p className="text-muted-foreground text-center py-4">
                        No programs found
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Quizzes */}
              <Card>
                <CardHeader>
                  <CardTitle>Quizzes</CardTitle>
                  <CardDescription>
                    {selectedLanguageId ? 'Filtered by selected language' : 'All quizzes'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {quizzes.data?.data.data.map((quiz) => (
                      <div key={quiz.id} className="flex items-center justify-between p-2 border rounded">
                        <span className="font-medium">{quiz.title}</span>
                        <Badge variant={quiz.is_active ? 'default' : 'secondary'}>
                          {quiz.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    ))}
                    {quizzes.data?.data.data.length === 0 && (
                      <p className="text-muted-foreground text-center py-4">
                        No quizzes found
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Meetings */}
              <Card>
                <CardHeader>
                  <CardTitle>Meetings</CardTitle>
                  <CardDescription>
                    {selectedLanguageId ? 'Filtered by selected language' : 'All meetings'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {meetings.data?.data.data.map((meeting) => (
                      <div key={meeting.id} className="flex items-center justify-between p-2 border rounded">
                        <span className="font-medium">{meeting.title}</span>
                        <Badge variant={meeting.is_active ? 'default' : 'secondary'}>
                          {meeting.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    ))}
                    {meetings.data?.data.data.length === 0 && (
                      <p className="text-muted-foreground text-center py-4">
                        No meetings found
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Students Tab */}
        <TabsContent value="students" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Students List */}
            <Card>
              <CardHeader>
                <CardTitle>Students</CardTitle>
                <CardDescription>Select a student to view their progress</CardDescription>
              </CardHeader>
              <CardContent>
                {studentsLoading ? (
                  <div className="flex items-center justify-center p-4">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                ) : (
                  <div className="space-y-2">
                    {studentsData?.data.data.map((student) => (
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
                )}
              </CardContent>
            </Card>

            {/* Student Progress */}
            <Card>
              <CardHeader>
                <CardTitle>Student Progress</CardTitle>
                <CardDescription>
                  {selectedStudentId ? 'Progress details for selected student' : 'Select a student to view progress'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {progressLoading ? (
                  <div className="flex items-center justify-center p-4">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                ) : selectedStudentId && studentProgress ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold">
                          {studentProgress.overall_progress.quizzes_completed}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          of {studentProgress.overall_progress.total_quizzes} quizzes
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">
                          {studentProgress.overall_progress.average_score}%
                        </div>
                        <div className="text-sm text-muted-foreground">
                          average score
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold">
                          {studentProgress.overall_progress.meetings_attended}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          of {studentProgress.overall_progress.total_meetings} meetings
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">
                          {studentProgress.overall_progress.completion_percentage}%
                        </div>
                        <div className="text-sm text-muted-foreground">
                          completion
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    Select a student to view their progress
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          {analyticsLoading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : analytics ? (
            <div className="space-y-6">
              {/* Top Performers */}
              <Card>
                <CardHeader>
                  <CardTitle>Top Performing Students</CardTitle>
                  <CardDescription>Students with highest average scores</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {analytics.student_analytics.top_performers.map((performer, index) => (
                      <div key={performer.student.id} className="flex items-center justify-between p-2 border rounded">
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">#{index + 1}</Badge>
                          <span className="font-medium">{performer.student.name}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">{performer.average_score}%</div>
                          <div className="text-sm text-muted-foreground">
                            {performer.quizzes_completed} quizzes
                          </div>
                        </div>
                      </div>
                    ))}
                    {analytics.student_analytics.top_performers.length === 0 && (
                      <p className="text-muted-foreground text-center py-4">
                        No performance data available
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Popular Quizzes */}
              <Card>
                <CardHeader>
                  <CardTitle>Popular Quizzes</CardTitle>
                  <CardDescription>Quizzes with most attempts</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {analytics.quiz_analytics.popular_quizzes.map((quiz, index) => (
                      <div key={quiz.quiz.id} className="flex items-center justify-between p-2 border rounded">
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">#{index + 1}</Badge>
                          <span className="font-medium">{quiz.quiz.title}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">{quiz.attempts_count} attempts</div>
                          <div className="text-sm text-muted-foreground">
                            {quiz.average_score}% avg score
                          </div>
                        </div>
                      </div>
                    ))}
                    {analytics.quiz_analytics.popular_quizzes.length === 0 && (
                      <p className="text-muted-foreground text-center py-4">
                        No quiz data available
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">
              No analytics data available
            </p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TeacherContentManagement;