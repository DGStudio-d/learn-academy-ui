import { useAuth } from '../../contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { 
  BookOpen, 
  Clock, 
  Users, 
  Award, 
  Calendar,
  TrendingUp,
  Target,
  Play
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

interface CourseProgress {
  id: number
  name: string
  language: string
  progress: number
  nextLesson: string
  totalLessons: number
  completedLessons: number
}

interface UpcomingMeeting {
  id: number
  title: string
  teacher: string
  time: string
  date: string
  type: 'group' | 'individual'
}

const mockCourseProgress: CourseProgress[] = [
  {
    id: 1,
    name: 'Spanish Fundamentals',
    language: 'Spanish',
    progress: 65,
    nextLesson: 'Past Tense Verbs',
    totalLessons: 20,
    completedLessons: 13
  },
  {
    id: 2,
    name: 'French Conversation',
    language: 'French',
    progress: 40,
    nextLesson: 'Ordering Food',
    totalLessons: 15,
    completedLessons: 6
  }
]

const mockUpcomingMeetings: UpcomingMeeting[] = [
  {
    id: 1,
    title: 'Spanish Conversation Practice',
    teacher: 'María González',
    time: '2:00 PM',
    date: 'Today',
    type: 'group'
  },
  {
    id: 2,
    title: 'French Grammar Review',
    teacher: 'Jean-Pierre Martin',
    time: '4:30 PM',
    date: 'Tomorrow',
    type: 'individual'
  }
]

export default function StudentDashboard() {
  const { user } = useAuth()
  const { t } = useTranslation()

  return (
    <div className="p-6 space-y-8">
      {/* Welcome Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">
          {user?.name ? t('dashboard.welcome', { name: user.name }) : t('dashboard.welcomeDefault')}
        </h1>
        <p className="text-muted-foreground">
          {t('dashboard.continueJourney')}
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-4">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('student.dashboard.activeCourses')}
            </CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">
              {t('student.dashboard.fromLastMonth', { count: 1 })}
            </p>
          </CardContent>
        </Card>

        <Card className="p-4">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('student.dashboard.hoursStudied')}
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold">24.5</div>
            <p className="text-xs text-muted-foreground">
              {t('student.dashboard.fromLastWeek', { count: 2.1 })}
            </p>
          </CardContent>
        </Card>

        <Card className="p-4">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('student.dashboard.streakDays')}
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold">7</div>
            <p className="text-xs text-muted-foreground">
              {t('student.dashboard.keepItUp')}
            </p>
          </CardContent>
        </Card>

        <Card className="p-4">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('student.dashboard.certificates')}
            </CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold">1</div>
            <p className="text-xs text-muted-foreground">
              {t('student.dashboard.completed', { language: 'Spanish', level: 'A1' })}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Course Progress */}
        <Card className="p-6">
          <CardHeader className="px-0 pt-0">
            <CardTitle>{t('student.dashboard.yourCourses')}</CardTitle>
            <CardDescription>
              {t('student.dashboard.continueWhere')}
            </CardDescription>
          </CardHeader>
          <CardContent className="px-0 space-y-4">
            {mockCourseProgress.map((course) => (
              <div key={course.id} className="space-y-3 p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{course.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {t('student.dashboard.lessonsCompleted', { 
                        completed: course.completedLessons, 
                        total: course.totalLessons 
                      })}
                    </p>
                  </div>
                  <Badge variant="outline">{course.language}</Badge>
                </div>
                
                <Progress value={course.progress} className="w-full" />
                
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    {t('student.dashboard.nextLesson', { lesson: course.nextLesson })}
                  </div>
                  <Button size="sm" asChild>
                    <Link to={`/student/programs/${course.id}`}>
                      <Play className="h-3 w-3 mr-1" />
                      {t('student.dashboard.continue')}
                    </Link>
                  </Button>
                </div>
              </div>
            ))}

            <Button variant="outline" className="w-full mt-4" asChild>
              <Link to="/student/programs">
                <BookOpen className="h-4 w-4 mr-2" />
                {t('student.dashboard.viewAllCourses')}
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Upcoming Meetings */}
        <Card className="p-6">
          <CardHeader className="px-0 pt-0">
            <CardTitle>{t('student.dashboard.upcomingSessions')}</CardTitle>
            <CardDescription>
              {t('student.dashboard.scheduledMeetings')}
            </CardDescription>
          </CardHeader>
          <CardContent className="px-0 space-y-4">
            {mockUpcomingMeetings.map((meeting) => (
              <div key={meeting.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <h3 className="font-medium">{meeting.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t('student.dashboard.with', { teacher: meeting.teacher })}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {t('student.dashboard.at', { date: meeting.date, time: meeting.time })}
                  </div>
                </div>
                <div className="text-right space-y-2">
                  <Badge variant={meeting.type === 'group' ? 'default' : 'secondary'}>
                    {t(`student.dashboard.${meeting.type}`)}
                  </Badge>
                  <Button size="sm" variant="outline">
                    {t('student.dashboard.join')}
                  </Button>
                </div>
              </div>
            ))}

            <Button variant="outline" className="w-full mt-4" asChild>
              <Link to="/student/meetings">
                <Users className="h-4 w-4 mr-2" />
                {t('student.dashboard.viewAllSessions')}
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="p-6">
        <CardHeader className="px-0 pt-0">
          <CardTitle>{t('dashboard.quickActions')}</CardTitle>
          <CardDescription>
            {t('dashboard.quickActionsDesc')}
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-auto p-6 flex flex-col items-center gap-3" asChild>
              <Link to="/student/quizzes">
                <Target className="h-6 w-6" />
                <span className="font-medium">{t('student.dashboard.takeQuiz')}</span>
                <span className="text-xs text-muted-foreground text-center">{t('student.dashboard.testKnowledge')}</span>
              </Link>
            </Button>

            <Button variant="outline" className="h-auto p-6 flex flex-col items-center gap-3" asChild>
              <Link to="/student/programs">
                <BookOpen className="h-6 w-6" />
                <span className="font-medium">{t('student.dashboard.browseCourses')}</span>
                <span className="text-xs text-muted-foreground text-center">{t('student.dashboard.findLanguages')}</span>
              </Link>
            </Button>

            <Button variant="outline" className="h-auto p-6 flex flex-col items-center gap-3" asChild>
              <Link to="/student/profile">
                <Award className="h-6 w-6" />
                <span className="font-medium">{t('student.dashboard.viewProgress')}</span>
                <span className="text-xs text-muted-foreground text-center">{t('student.dashboard.trackAchievements')}</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}