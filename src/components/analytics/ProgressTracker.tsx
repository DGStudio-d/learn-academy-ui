import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Award,
  Target,
  Clock,
  BookOpen,
  CheckCircle,
  XCircle,
  Calendar,
  Activity,
  Star,
  Trophy,
  Zap,
  Users,
  BarChart3,
  Loader2
} from 'lucide-react';
import { useStudentProgress, useUserProgressTracking } from '../../hooks/useStudent';

interface ProgressTrackerProps {
  userId?: number;
  programId?: number;
  className?: string;
}

interface ProgressData {
  overall_progress: {
    completion_percentage: number;
    average_score: number;
    quizzes_completed: number;
    total_quizzes: number;
    meetings_attended: number;
    total_meetings: number;
    time_spent: number; // in minutes
    streak_days: number;
    level: number;
    experience_points: number;
  };
  weekly_progress: Array<{
    week: string;
    completion: number;
    score: number;
    time_spent: number;
  }>;
  skill_progress: Array<{
    skill: string;
    level: number;
    progress: number;
    total_exercises: number;
    completed_exercises: number;
  }>;
  achievements: Array<{
    id: number;
    title: string;
    description: string;
    icon: string;
    earned_at: string;
    category: 'quiz' | 'attendance' | 'streak' | 'score';
  }>;
  milestones: Array<{
    id: number;
    title: string;
    description: string;
    target_value: number;
    current_value: number;
    completed: boolean;
    reward_points: number;
  }>;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export const ProgressTracker: React.FC<ProgressTrackerProps> = ({ 
  userId, 
  programId, 
  className 
}) => {
  const [selectedTimeRange, setSelectedTimeRange] = useState('30');
  
  const { data: progressData, isLoading } = useStudentProgress(userId || 0, programId);
  const { data: trackingData } = useUserProgressTracking(userId);

  // Mock data for demonstration
  const mockProgressData: ProgressData = {
    overall_progress: {
      completion_percentage: 75,
      average_score: 85,
      quizzes_completed: 12,
      total_quizzes: 16,
      meetings_attended: 8,
      total_meetings: 10,
      time_spent: 1440, // 24 hours
      streak_days: 7,
      level: 5,
      experience_points: 2450
    },
    weekly_progress: [
      { week: 'Week 1', completion: 20, score: 78, time_spent: 180 },
      { week: 'Week 2', completion: 35, score: 82, time_spent: 240 },
      { week: 'Week 3', completion: 50, score: 85, time_spent: 300 },
      { week: 'Week 4', completion: 65, score: 88, time_spent: 360 },
      { week: 'Week 5', completion: 75, score: 85, time_spent: 360 },
    ],
    skill_progress: [
      { skill: 'Grammar', level: 4, progress: 80, total_exercises: 25, completed_exercises: 20 },
      { skill: 'Vocabulary', level: 5, progress: 90, total_exercises: 30, completed_exercises: 27 },
      { skill: 'Listening', level: 3, progress: 60, total_exercises: 20, completed_exercises: 12 },
      { skill: 'Speaking', level: 3, progress: 55, total_exercises: 18, completed_exercises: 10 },
      { skill: 'Reading', level: 4, progress: 75, total_exercises: 22, completed_exercises: 16 },
    ],
    achievements: [
      {
        id: 1,
        title: 'Quiz Master',
        description: 'Complete 10 quizzes with 80%+ score',
        icon: '🏆',
        earned_at: '2024-01-15',
        category: 'quiz'
      },
      {
        id: 2,
        title: 'Perfect Attendance',
        description: 'Attend all meetings for a week',
        icon: '📅',
        earned_at: '2024-01-10',
        category: 'attendance'
      },
      {
        id: 3,
        title: 'Learning Streak',
        description: 'Study for 7 consecutive days',
        icon: '🔥',
        earned_at: '2024-01-20',
        category: 'streak'
      }
    ],
    milestones: [
      {
        id: 1,
        title: 'Complete 15 Quizzes',
        description: 'Finish 15 quizzes to unlock advanced content',
        target_value: 15,
        current_value: 12,
        completed: false,
        reward_points: 500
      },
      {
        id: 2,
        title: 'Achieve 90% Average',
        description: 'Maintain 90% average score across all quizzes',
        target_value: 90,
        current_value: 85,
        completed: false,
        reward_points: 750
      },
      {
        id: 3,
        title: 'Study 30 Hours',
        description: 'Accumulate 30 hours of study time',
        target_value: 1800, // 30 hours in minutes
        current_value: 1440, // 24 hours
        completed: false,
        reward_points: 300
      }
    ]
  };

  const data = progressData || mockProgressData;

  const getSkillColor = (level: number) => {
    if (level >= 5) return 'text-purple-600 bg-purple-100';
    if (level >= 4) return 'text-blue-600 bg-blue-100';
    if (level >= 3) return 'text-green-600 bg-green-100';
    if (level >= 2) return 'text-yellow-600 bg-yellow-100';
    return 'text-gray-600 bg-gray-100';
  };

  const getLevelProgress = (xp: number) => {
    const baseXP = 1000;
    const currentLevel = Math.floor(xp / baseXP) + 1;
    const progressInLevel = (xp % baseXP) / baseXP * 100;
    return { level: currentLevel, progress: progressInLevel };
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
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
      {/* Header with Level and XP */}
      <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16 border-2 border-white">
                <AvatarFallback className="bg-white text-blue-600 text-xl font-bold">
                  {data.overall_progress.level}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-2xl font-bold">Level {data.overall_progress.level}</h2>
                <p className="text-blue-100">{data.overall_progress.experience_points} XP</p>
                <div className="mt-2">
                  <Progress 
                    value={getLevelProgress(data.overall_progress.experience_points).progress} 
                    className="w-48 h-2 bg-blue-400"
                  />
                  <p className="text-xs text-blue-100 mt-1">
                    {Math.round(getLevelProgress(data.overall_progress.experience_points).progress)}% to next level
                  </p>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center space-x-2 mb-2">
                <Zap className="h-5 w-5" />
                <span className="text-lg font-bold">{data.overall_progress.streak_days} day streak</span>
              </div>
              <Badge className="bg-white text-blue-600">
                {data.overall_progress.completion_percentage}% Complete
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {data.overall_progress.average_score}%
            </div>
            <div className="text-sm text-muted-foreground">Average Score</div>
            <div className="flex items-center justify-center mt-2">
              <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
              <span className="text-xs text-green-600">+3% this week</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {data.overall_progress.quizzes_completed}/{data.overall_progress.total_quizzes}
            </div>
            <div className="text-sm text-muted-foreground">Quizzes Completed</div>
            <Progress 
              value={(data.overall_progress.quizzes_completed / data.overall_progress.total_quizzes) * 100} 
              className="mt-2 h-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {formatTime(data.overall_progress.time_spent)}
            </div>
            <div className="text-sm text-muted-foreground">Time Studied</div>
            <div className="flex items-center justify-center mt-2">
              <Clock className="h-4 w-4 text-purple-600 mr-1" />
              <span className="text-xs text-purple-600">6h this week</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">
              {data.overall_progress.meetings_attended}/{data.overall_progress.total_meetings}
            </div>
            <div className="text-sm text-muted-foreground">Meetings Attended</div>
            <Progress 
              value={(data.overall_progress.meetings_attended / data.overall_progress.total_meetings) * 100} 
              className="mt-2 h-2"
            />
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="progress" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="skills">Skills</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="milestones">Milestones</TabsTrigger>
        </TabsList>

        <TabsContent value="progress" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Weekly Progress Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Weekly Progress</CardTitle>
                <CardDescription>Your learning progress over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={data.weekly_progress}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis />
                    <Tooltip />
                    <Area 
                      type="monotone" 
                      dataKey="completion" 
                      stroke="#8884d8" 
                      fill="#8884d8" 
                      fillOpacity={0.6} 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Score Trend */}
            <Card>
              <CardHeader>
                <CardTitle>Score Trend</CardTitle>
                <CardDescription>Your quiz scores over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={data.weekly_progress}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="score" 
                      stroke="#82ca9d" 
                      strokeWidth={3}
                      dot={{ fill: '#82ca9d', strokeWidth: 2, r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Study Time Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Study Time Distribution</CardTitle>
              <CardDescription>How you spend your study time each week</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={data.weekly_progress}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip formatter={(value) => [formatTime(value as number), 'Study Time']} />
                  <Area 
                    type="monotone" 
                    dataKey="time_spent" 
                    stroke="#ffc658" 
                    fill="#ffc658" 
                    fillOpacity={0.6} 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="skills" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Skills Progress */}
            <Card>
              <CardHeader>
                <CardTitle>Skill Levels</CardTitle>
                <CardDescription>Your progress in different skill areas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.skill_progress.map((skill, index) => (
                    <div key={skill.skill} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{skill.skill}</span>
                          <Badge className={getSkillColor(skill.level)}>
                            Level {skill.level}
                          </Badge>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {skill.completed_exercises}/{skill.total_exercises}
                        </span>
                      </div>
                      <Progress value={skill.progress} className="h-2" />
                      <div className="text-xs text-muted-foreground">
                        {skill.progress}% complete
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Skills Radar Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Skills Overview</CardTitle>
                <CardDescription>Visual representation of your skill levels</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RadialBarChart cx="50%" cy="50%" innerRadius="10%" outerRadius="80%" data={data.skill_progress}>
                    <RadialBar 
                      minAngle={15} 
                      label={{ position: 'insideStart', fill: '#fff' }} 
                      background 
                      clockWise 
                      dataKey="progress" 
                    />
                    <Legend iconSize={18} layout="vertical" verticalAlign="middle" align="right" />
                    <Tooltip />
                  </RadialBarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.achievements.map((achievement) => (
              <Card key={achievement.id} className="relative overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <div className="text-3xl">{achievement.icon}</div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{achievement.title}</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        {achievement.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline">
                          {achievement.category}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(achievement.earned_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="absolute top-2 right-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="milestones" className="space-y-4">
          <div className="space-y-4">
            {data.milestones.map((milestone) => (
              <Card key={milestone.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${milestone.completed ? 'bg-green-100' : 'bg-gray-100'}`}>
                        {milestone.completed ? (
                          <Trophy className="h-5 w-5 text-green-600" />
                        ) : (
                          <Target className="h-5 w-5 text-gray-600" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold">{milestone.title}</h3>
                        <p className="text-sm text-muted-foreground">{milestone.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={milestone.completed ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                        {milestone.reward_points} XP
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{milestone.current_value}/{milestone.target_value}</span>
                    </div>
                    <Progress 
                      value={(milestone.current_value / milestone.target_value) * 100} 
                      className="h-2"
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProgressTracker;