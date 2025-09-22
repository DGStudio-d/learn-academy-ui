import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useAuth } from '@/contexts/AuthContext'
import { 
  Search,
  Filter,
  Download,
  Eye,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  Star,
  FileText,
  Calendar,
  User,
  Award,
  AlertTriangle,
  Target
} from 'lucide-react'

interface StudentResult {
  id: string
  studentName: string
  studentEmail: string
  quizTitle: string
  quizId: string
  score: number
  maxScore: number
  percentage: number
  timeSpent: number // in minutes
  attempts: number
  status: 'completed' | 'in-progress' | 'not-started'
  submittedAt: string
  grade: 'A' | 'B' | 'C' | 'D' | 'F'
}

interface QuizStats {
  quizId: string
  quizTitle: string
  totalAttempts: number
  averageScore: number
  highestScore: number
  lowestScore: number
  completionRate: number
  averageTime: number
}

interface ClassPerformance {
  classId: string
  className: string
  language: string
  totalStudents: number
  activeStudents: number
  averageProgress: number
  averageGrade: number
  upcomingDeadlines: number
}

const TeacherResults: React.FC = () => {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterQuiz, setFilterQuiz] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterGrade, setFilterGrade] = useState<string>('all')
  const [selectedStudent, setSelectedStudent] = useState<StudentResult | null>(null)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)

  // Mock data
  const [studentResults, setStudentResults] = useState<StudentResult[]>([
    {
      id: '1',
      studentName: 'Maria Rodriguez',
      studentEmail: 'maria.rodriguez@email.com',
      quizTitle: 'Spanish Grammar Fundamentals',
      quizId: 'quiz-1',
      score: 14,
      maxScore: 15,
      percentage: 93.3,
      timeSpent: 25,
      attempts: 1,
      status: 'completed',
      submittedAt: '2024-03-19T14:30:00Z',
      grade: 'A'
    },
    {
      id: '2',
      studentName: 'John Smith',
      studentEmail: 'john.smith@email.com',
      quizTitle: 'French Conversational Skills',
      quizId: 'quiz-2',
      score: 16,
      maxScore: 20,
      percentage: 80.0,
      timeSpent: 42,
      attempts: 2,
      status: 'completed',
      submittedAt: '2024-03-19T16:15:00Z',
      grade: 'B'
    },
    {
      id: '3',
      studentName: 'Emma Johnson',
      studentEmail: 'emma.johnson@email.com',
      quizTitle: 'Portuguese Pronunciation',
      quizId: 'quiz-3',
      score: 8,
      maxScore: 12,
      percentage: 66.7,
      timeSpent: 20,
      attempts: 1,
      status: 'completed',
      submittedAt: '2024-03-19T10:45:00Z',
      grade: 'C'
    },
    {
      id: '4',
      studentName: 'Ahmed Hassan',
      studentEmail: 'ahmed.hassan@email.com',
      quizTitle: 'Spanish Grammar Fundamentals',
      quizId: 'quiz-1',
      score: 12,
      maxScore: 15,
      percentage: 80.0,
      timeSpent: 28,
      attempts: 1,
      status: 'completed',
      submittedAt: '2024-03-18T11:20:00Z',
      grade: 'B'
    },
    {
      id: '5',
      studentName: 'Sophie Chen',
      studentEmail: 'sophie.chen@email.com',
      quizTitle: 'French Conversational Skills',
      quizId: 'quiz-2',
      score: 0,
      maxScore: 20,
      percentage: 0,
      timeSpent: 0,
      attempts: 0,
      status: 'not-started',
      submittedAt: '',
      grade: 'F'
    }
  ])

  const [quizStats] = useState<QuizStats[]>([
    {
      quizId: 'quiz-1',
      quizTitle: 'Spanish Grammar Fundamentals',
      totalAttempts: 24,
      averageScore: 78.5,
      highestScore: 93.3,
      lowestScore: 60.0,
      completionRate: 92.3,
      averageTime: 26.5
    },
    {
      quizId: 'quiz-2',
      quizTitle: 'French Conversational Skills',
      totalAttempts: 18,
      averageScore: 82.3,
      highestScore: 95.0,
      lowestScore: 65.0,
      completionRate: 88.9,
      averageTime: 41.2
    },
    {
      quizId: 'quiz-3',
      quizTitle: 'Portuguese Pronunciation',
      totalAttempts: 15,
      averageScore: 71.2,
      highestScore: 91.7,
      lowestScore: 50.0,
      completionRate: 93.8,
      averageTime: 22.8
    }
  ])

  const [classPerformance] = useState<ClassPerformance[]>([
    {
      classId: 'class-1',
      className: 'Spanish Advanced Conversation',
      language: 'Spanish',
      totalStudents: 12,
      activeStudents: 11,
      averageProgress: 85,
      averageGrade: 87.5,
      upcomingDeadlines: 2
    },
    {
      classId: 'class-2',
      className: 'French Intermediate Grammar',
      language: 'French',
      totalStudents: 15,
      activeStudents: 13,
      averageProgress: 72,
      averageGrade: 79.2,
      upcomingDeadlines: 1
    },
    {
      classId: 'class-3',
      className: 'Portuguese Basics',
      language: 'Portuguese',
      totalStudents: 8,
      activeStudents: 7,
      averageProgress: 65,
      averageGrade: 74.8,
      upcomingDeadlines: 3
    }
  ])

  const filteredResults = studentResults.filter(result => {
    const matchesSearch = result.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         result.quizTitle.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesQuiz = filterQuiz === 'all' || result.quizId === filterQuiz
    const matchesStatus = filterStatus === 'all' || result.status === filterStatus
    const matchesGrade = filterGrade === 'all' || result.grade === filterGrade
    
    return matchesSearch && matchesQuiz && matchesStatus && matchesGrade
  })

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A': return 'bg-green-100 text-green-800'
      case 'B': return 'bg-blue-100 text-blue-800'
      case 'C': return 'bg-yellow-100 text-yellow-800'
      case 'D': return 'bg-orange-100 text-orange-800'
      case 'F': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'in-progress': return <Clock className="h-4 w-4 text-yellow-500" />
      case 'not-started': return <XCircle className="h-4 w-4 text-red-500" />
      default: return <FileText className="h-4 w-4 text-gray-500" />
    }
  }

  const getPerformanceColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600'
    if (percentage >= 80) return 'text-blue-600'
    if (percentage >= 70) return 'text-yellow-600'
    if (percentage >= 60) return 'text-orange-600'
    return 'text-red-600'
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not submitted'
    return new Date(dateString).toLocaleDateString([], { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  const StatCard = ({ icon: Icon, title, value, subtitle, trend }: {
    icon: any
    title: string
    value: string | number
    subtitle?: string
    trend?: 'up' | 'down' | 'neutral'
  }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="flex items-baseline space-x-2">
              <p className="text-2xl font-bold">{value}</p>
              {trend && (
                <span className={`text-xs ${
                  trend === 'up' ? 'text-green-500' : trend === 'down' ? 'text-red-500' : 'text-muted-foreground'
                }`}>
                  {trend === 'up' ? <TrendingUp className="h-3 w-3" /> : 
                   trend === 'down' ? <TrendingDown className="h-3 w-3" /> : null}
                </span>
              )}
            </div>
            {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
          </div>
          <Icon className="h-8 w-8 text-primary" />
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Results & Analytics</h1>
          <p className="text-muted-foreground">Track student performance and quiz analytics</p>
        </div>
        <Button>
          <Download className="h-4 w-4 mr-2" />
          Export Results
        </Button>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Users}
          title="Total Students"
          value={studentResults.length}
          trend="up"
        />
        <StatCard
          icon={FileText}
          title="Quiz Submissions"
          value={studentResults.filter(r => r.status === 'completed').length}
          trend="up"
        />
        <StatCard
          icon={BarChart3}
          title="Average Score"
          value={`${Math.round(studentResults.filter(r => r.status === 'completed').reduce((sum, r) => sum + r.percentage, 0) / 
            studentResults.filter(r => r.status === 'completed').length || 0)}%`}
          trend="neutral"
        />
        <StatCard
          icon={Target}
          title="Completion Rate"
          value={`${Math.round((studentResults.filter(r => r.status === 'completed').length / studentResults.length) * 100)}%`}
          trend="up"
        />
      </div>

      <Tabs defaultValue="individual" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="individual">Individual Results</TabsTrigger>
          <TabsTrigger value="quiz-analytics">Quiz Analytics</TabsTrigger>
          <TabsTrigger value="class-performance">Class Performance</TabsTrigger>
        </TabsList>

        {/* Individual Results Tab */}
        <TabsContent value="individual" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Search students or quizzes..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={filterQuiz} onValueChange={setFilterQuiz}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="All Quizzes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Quizzes</SelectItem>
                    {quizStats.map((quiz) => (
                      <SelectItem key={quiz.quizId} value={quiz.quizId}>
                        {quiz.quizTitle}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="not-started">Not Started</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterGrade} onValueChange={setFilterGrade}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Grade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Grades</SelectItem>
                    <SelectItem value="A">A</SelectItem>
                    <SelectItem value="B">B</SelectItem>
                    <SelectItem value="C">C</SelectItem>
                    <SelectItem value="D">D</SelectItem>
                    <SelectItem value="F">F</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Results Table */}
          <Card>
            <CardHeader>
              <CardTitle>Student Results</CardTitle>
              <CardDescription>Individual student performance on quizzes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredResults.map((result) => (
                  <div key={result.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(result.status)}
                        <div>
                          <h4 className="font-medium">{result.studentName}</h4>
                          <p className="text-sm text-muted-foreground">{result.studentEmail}</p>
                        </div>
                      </div>
                      <div className="hidden md:block">
                        <p className="font-medium">{result.quizTitle}</p>
                        <p className="text-sm text-muted-foreground">
                          {result.status === 'completed' && `Submitted: ${formatDate(result.submittedAt)}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      {result.status === 'completed' && (
                        <>
                          <div className="text-right">
                            <div className={`text-lg font-bold ${getPerformanceColor(result.percentage)}`}>
                              {result.percentage.toFixed(1)}%
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {result.score}/{result.maxScore}
                            </div>
                          </div>
                          <Badge className={`${getGradeColor(result.grade)} border-0`}>
                            {result.grade}
                          </Badge>
                          <div className="text-sm text-muted-foreground">
                            <div>{result.timeSpent}m</div>
                            <div>{result.attempts} attempt{result.attempts !== 1 ? 's' : ''}</div>
                          </div>
                        </>
                      )}
                      {result.status === 'not-started' && (
                        <Badge variant="outline" className="text-red-600 border-red-200">
                          Not Started
                        </Badge>
                      )}
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setSelectedStudent(result)
                          setShowDetailsDialog(true)
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Quiz Analytics Tab */}
        <TabsContent value="quiz-analytics" className="space-y-4">
          <div className="grid gap-4">
            {quizStats.map((quiz) => (
              <Card key={quiz.quizId}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{quiz.quizTitle}</span>
                    <Badge variant="outline">{quiz.totalAttempts} attempts</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{quiz.averageScore.toFixed(1)}%</div>
                      <div className="text-sm text-muted-foreground">Average Score</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{quiz.highestScore.toFixed(1)}%</div>
                      <div className="text-sm text-muted-foreground">Highest Score</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">{quiz.lowestScore.toFixed(1)}%</div>
                      <div className="text-sm text-muted-foreground">Lowest Score</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{quiz.averageTime.toFixed(1)}m</div>
                      <div className="text-sm text-muted-foreground">Avg Time</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Completion Rate</span>
                      <span>{quiz.completionRate.toFixed(1)}%</span>
                    </div>
                    <Progress value={quiz.completionRate} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Class Performance Tab */}
        <TabsContent value="class-performance" className="space-y-4">
          <div className="grid gap-4">
            {classPerformance.map((classItem) => (
              <Card key={classItem.classId}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div>
                      <span>{classItem.className}</span>
                      <Badge variant="outline" className="ml-2">{classItem.language}</Badge>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-muted-foreground">
                        {classItem.activeStudents}/{classItem.totalStudents} active
                      </span>
                      {classItem.upcomingDeadlines > 0 && (
                        <Badge variant="destructive" className="text-xs">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          {classItem.upcomingDeadlines} deadlines
                        </Badge>
                      )}
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Average Progress</div>
                      <div className="flex items-center space-x-2">
                        <Progress value={classItem.averageProgress} className="flex-1 h-2" />
                        <span className="text-sm font-medium">{classItem.averageProgress}%</span>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{classItem.averageGrade.toFixed(1)}%</div>
                      <div className="text-sm text-muted-foreground">Class Average</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{classItem.totalStudents}</div>
                      <div className="text-sm text-muted-foreground">Total Students</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Student Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Student Result Details</DialogTitle>
            <DialogDescription>
              Detailed performance information for {selectedStudent?.studentName}
            </DialogDescription>
          </DialogHeader>
          {selectedStudent && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Student Information</h4>
                  <div className="space-y-1 text-sm">
                    <div><strong>Name:</strong> {selectedStudent.studentName}</div>
                    <div><strong>Email:</strong> {selectedStudent.studentEmail}</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Quiz Information</h4>
                  <div className="space-y-1 text-sm">
                    <div><strong>Quiz:</strong> {selectedStudent.quizTitle}</div>
                    <div><strong>Submitted:</strong> {formatDate(selectedStudent.submittedAt)}</div>
                  </div>
                </div>
              </div>
              
              {selectedStudent.status === 'completed' && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-primary">{selectedStudent.percentage.toFixed(1)}%</div>
                      <div className="text-sm text-muted-foreground">Final Score</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{selectedStudent.score}/{selectedStudent.maxScore}</div>
                      <div className="text-sm text-muted-foreground">Points</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-blue-600">{selectedStudent.timeSpent}m</div>
                      <div className="text-sm text-muted-foreground">Time Spent</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-600">{selectedStudent.attempts}</div>
                      <div className="text-sm text-muted-foreground">Attempts</div>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <Badge className={`${getGradeColor(selectedStudent.grade)} border-0 text-lg px-4 py-2`}>
                      Grade: {selectedStudent.grade}
                    </Badge>
                  </div>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default TeacherResults