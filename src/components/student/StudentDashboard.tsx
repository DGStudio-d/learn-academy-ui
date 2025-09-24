import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Skeleton } from '../ui/skeleton';
import { useStudentLearningDashboard } from '../../hooks/useStudent';
import { Calendar, BookOpen, Trophy, Clock, Users, TrendingUp } from 'lucide-react';

export const StudentDashboard: React.FC = () => {
  const {
    stats,
    progress,
    enrollments,
    upcomingMeetings,
    recentAttempts,
    isLoading,
    isLoadingMeetings,
    isLoadingAttempts,
    error,
    refetchAll,
  } = useStudentLearningDashboard();

  if (error) {
    return (
      <div className="p-6">
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800">Error Loading Dashboard</CardTitle>
            <CardDescription className="text-red-600">
              Failed to load dashboard data. Please try again.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={refetchAll} variant="outline">
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Student Dashboard</h1>
          <p className="text-muted-foreground">
            Track your learning progress and upcoming activities
          </p>
        </div>
        <Button onClick={refetchAll} variant="outline" size="sm">
          Refresh
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Quizzes</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{stats?.total_quizzes || 0}</div>
            )}
            <p className="text-xs text-muted-foreground">
              Available in your programs
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{stats?.completed_quizzes || 0}</div>
            )}
            <p className="text-xs text-muted-foreground">
              Quizzes completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">
                {progress?.overall_progress.average_quiz_score?.toFixed(1) || '0'}%
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Across all quizzes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Meetings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingMeetings ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">
                {upcomingMeetings?.data?.data?.length || 0}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Scheduled this week
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Progress Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Learning Progress</CardTitle>
            <CardDescription>
              Your overall completion across all enrolled programs
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Overall Completion</span>
                    <span className="font-medium">
                      {progress?.overall_progress.completion_percentage || 0}%
                    </span>
                  </div>
                  <Progress 
                    value={progress?.overall_progress.completion_percentage || 0} 
                    className="h-2"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="font-medium">Quizzes</div>
                    <div className="text-muted-foreground">
                      {progress?.overall_progress.quizzes_completed || 0} / {progress?.overall_progress.total_quizzes_available || 0}
                    </div>
                  </div>
                  <div>
                    <div className="font-medium">Meetings</div>
                    <div className="text-muted-foreground">
                      {progress?.overall_progress.meetings_attended || 0} / {progress?.overall_progress.total_meetings_available || 0}
                    </div>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Your latest quiz attempts and meeting attendance
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-3">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="space-y-1 flex-1">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {progress?.recent_activity?.slice(0, 5).map((activity, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      {activity.type === 'quiz_attempt' ? (
                        <BookOpen className="h-4 w-4 text-blue-500" />
                      ) : (
                        <Users className="h-4 w-4 text-green-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {activity.title}
                      </p>
                      <div className="flex items-center space-x-2">
                        <p className="text-xs text-muted-foreground">
                          {new Date(activity.date).toLocaleDateString()}
                        </p>
                        {activity.score && (
                          <Badge variant="secondary" className="text-xs">
                            {activity.score}%
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                )) || (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No recent activity
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Enrollments */}
      <Card>
        <CardHeader>
          <CardTitle>My Enrollments</CardTitle>
          <CardDescription>
            Programs you are enrolled in or have requested to join
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <Skeleton className="h-6 w-20" />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {enrollments?.data?.data?.map((enrollment) => (
                <div key={enrollment.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{enrollment.program?.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {enrollment.program?.description}
                    </p>
                  </div>
                  <Badge 
                    variant={
                      enrollment.status === 'approved' ? 'default' :
                      enrollment.status === 'pending' ? 'secondary' : 'destructive'
                    }
                  >
                    {enrollment.status}
                  </Badge>
                </div>
              )) || (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No enrollments found
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Achievements */}
      {progress?.achievements && progress.achievements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Achievements</CardTitle>
            <CardDescription>
              Badges and milestones you've earned
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {progress.achievements.map((achievement) => (
                <div key={achievement.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                  <div className="flex-shrink-0">
                    <Trophy className="h-6 w-6 text-yellow-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm">{achievement.title}</h4>
                    <p className="text-xs text-muted-foreground">
                      {achievement.description}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Earned {new Date(achievement.earned_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};