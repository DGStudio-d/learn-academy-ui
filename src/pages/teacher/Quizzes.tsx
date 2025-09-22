import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { useAuth } from '@/contexts/AuthContext'
import { 
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Copy,
  Eye,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  BarChart3,
  FileText,
  Settings,
  Save,
  X
} from 'lucide-react'

interface Quiz {
  id: string
  title: string
  description: string
  language: string
  level: 'Beginner' | 'Intermediate' | 'Advanced'
  questions: number
  duration: number // in minutes
  status: 'draft' | 'published' | 'archived'
  attempts: number
  averageScore: number
  createdAt: string
  updatedAt: string
}

interface QuizQuestion {
  id: string
  type: 'multiple-choice' | 'true-false' | 'fill-blank' | 'short-answer'
  question: string
  options?: string[]
  correctAnswer: string | number
  explanation?: string
  points: number
}

interface CreateQuizData {
  title: string
  description: string
  language: string
  level: string
  duration: number
  questions: QuizQuestion[]
  isPublic: boolean
  allowRetakes: boolean
  showCorrectAnswers: boolean
  timeLimit: boolean
}

const TeacherQuizzes: React.FC = () => {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterLanguage, setFilterLanguage] = useState<string>('all')
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null)
  const [showEditDialog, setShowEditDialog] = useState(false)

  // Mock quiz data
  const [quizzes, setQuizzes] = useState<Quiz[]>([
    {
      id: '1',
      title: 'Spanish Grammar Fundamentals',
      description: 'Test your understanding of basic Spanish grammar rules including verb conjugations and sentence structure.',
      language: 'Spanish',
      level: 'Beginner',
      questions: 15,
      duration: 30,
      status: 'published',
      attempts: 24,
      averageScore: 78.5,
      createdAt: '2024-03-01',
      updatedAt: '2024-03-15'
    },
    {
      id: '2',
      title: 'French Conversational Skills',
      description: 'Practice common French phrases and expressions used in everyday conversations.',
      language: 'French',
      level: 'Intermediate',
      questions: 20,
      duration: 45,
      status: 'published',
      attempts: 18,
      averageScore: 82.3,
      createdAt: '2024-02-20',
      updatedAt: '2024-03-10'
    },
    {
      id: '3',
      title: 'Advanced Spanish Literature',
      description: 'Deep dive into Spanish literary works and cultural contexts.',
      language: 'Spanish',
      level: 'Advanced',
      questions: 25,
      duration: 60,
      status: 'draft',
      attempts: 0,
      averageScore: 0,
      createdAt: '2024-03-18',
      updatedAt: '2024-03-18'
    },
    {
      id: '4',
      title: 'Portuguese Pronunciation',
      description: 'Learn correct Portuguese pronunciation patterns and phonetics.',
      language: 'Portuguese',
      level: 'Beginner',
      questions: 12,
      duration: 25,
      status: 'published',
      attempts: 15,
      averageScore: 71.2,
      createdAt: '2024-03-05',
      updatedAt: '2024-03-12'
    }
  ])

  // Create quiz form state
  const [createQuizData, setCreateQuizData] = useState<CreateQuizData>({
    title: '',
    description: '',
    language: '',
    level: '',
    duration: 30,
    questions: [],
    isPublic: true,
    allowRetakes: true,
    showCorrectAnswers: true,
    timeLimit: true
  })

  const [currentQuestion, setCurrentQuestion] = useState<QuizQuestion>({
    id: '',
    type: 'multiple-choice',
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    explanation: '',
    points: 1
  })

  const filteredQuizzes = quizzes.filter(quiz => {
    const matchesSearch = quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quiz.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || quiz.status === filterStatus
    const matchesLanguage = filterLanguage === 'all' || quiz.language === filterLanguage
    
    return matchesSearch && matchesStatus && matchesLanguage
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800'
      case 'draft': return 'bg-yellow-100 text-yellow-800'
      case 'archived': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'published': return <CheckCircle className="h-4 w-4" />
      case 'draft': return <FileText className="h-4 w-4" />
      case 'archived': return <AlertCircle className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Beginner': return 'bg-blue-100 text-blue-800'
      case 'Intermediate': return 'bg-orange-100 text-orange-800'
      case 'Advanced': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const handleCreateQuiz = () => {
    const newQuiz: Quiz = {
      id: Date.now().toString(),
      title: createQuizData.title,
      description: createQuizData.description,
      language: createQuizData.language,
      level: createQuizData.level as any,
      questions: createQuizData.questions.length,
      duration: createQuizData.duration,
      status: 'draft',
      attempts: 0,
      averageScore: 0,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    }

    setQuizzes(prev => [newQuiz, ...prev])
    setShowCreateDialog(false)
    setCreateQuizData({
      title: '',
      description: '',
      language: '',
      level: '',
      duration: 30,
      questions: [],
      isPublic: true,
      allowRetakes: true,
      showCorrectAnswers: true,
      timeLimit: true
    })
  }

  const handleDeleteQuiz = (quizId: string) => {
    setQuizzes(prev => prev.filter(quiz => quiz.id !== quizId))
  }

  const handleDuplicateQuiz = (quiz: Quiz) => {
    const duplicatedQuiz: Quiz = {
      ...quiz,
      id: Date.now().toString(),
      title: `${quiz.title} (Copy)`,
      status: 'draft',
      attempts: 0,
      averageScore: 0,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    }

    setQuizzes(prev => [duplicatedQuiz, ...prev])
  }

  const addQuestion = () => {
    if (currentQuestion.question.trim()) {
      const newQuestion: QuizQuestion = {
        ...currentQuestion,
        id: Date.now().toString()
      }
      setCreateQuizData(prev => ({
        ...prev,
        questions: [...prev.questions, newQuestion]
      }))
      setCurrentQuestion({
        id: '',
        type: 'multiple-choice',
        question: '',
        options: ['', '', '', ''],
        correctAnswer: 0,
        explanation: '',
        points: 1
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Quiz Management</h1>
          <p className="text-muted-foreground">Create and manage quizzes for your students</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Quiz
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6 text-center">
            <FileText className="h-8 w-8 text-primary mx-auto mb-2" />
            <div className="text-2xl font-bold">{quizzes.length}</div>
            <div className="text-sm text-muted-foreground">Total Quizzes</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{quizzes.filter(q => q.status === 'published').length}</div>
            <div className="text-sm text-muted-foreground">Published</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <Users className="h-8 w-8 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{quizzes.reduce((sum, q) => sum + q.attempts, 0)}</div>
            <div className="text-sm text-muted-foreground">Total Attempts</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <BarChart3 className="h-8 w-8 text-orange-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">
              {Math.round(quizzes.filter(q => q.attempts > 0).reduce((sum, q) => sum + q.averageScore, 0) / 
                quizzes.filter(q => q.attempts > 0).length || 0)}%
            </div>
            <div className="text-sm text-muted-foreground">Avg Score</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search quizzes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterLanguage} onValueChange={setFilterLanguage}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Languages</SelectItem>
                <SelectItem value="Spanish">Spanish</SelectItem>
                <SelectItem value="French">French</SelectItem>
                <SelectItem value="Portuguese">Portuguese</SelectItem>
                <SelectItem value="German">German</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Quiz List */}
      <div className="grid gap-4">
        {filteredQuizzes.map((quiz) => (
          <Card key={quiz.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold">{quiz.title}</h3>
                    <Badge className={`${getStatusColor(quiz.status)} border-0`}>
                      {getStatusIcon(quiz.status)}
                      <span className="ml-1 capitalize">{quiz.status}</span>
                    </Badge>
                    <Badge className={`${getLevelColor(quiz.level)} border-0`}>
                      {quiz.level}
                    </Badge>
                    <Badge variant="outline">{quiz.language}</Badge>
                  </div>
                  <p className="text-muted-foreground mb-3">{quiz.description}</p>
                  <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <FileText className="h-4 w-4" />
                      <span>{quiz.questions} questions</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{quiz.duration} min</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="h-4 w-4" />
                      <span>{quiz.attempts} attempts</span>
                    </div>
                    {quiz.attempts > 0 && (
                      <div className="flex items-center space-x-1">
                        <BarChart3 className="h-4 w-4" />
                        <span>{quiz.averageScore.toFixed(1)}% avg</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDuplicateQuiz(quiz)}>
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDeleteQuiz(quiz.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create Quiz Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Quiz</DialogTitle>
            <DialogDescription>
              Create a new quiz for your students to test their knowledge.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Quiz Title</Label>
                <Input
                  id="title"
                  value={createQuizData.title}
                  onChange={(e) => setCreateQuizData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter quiz title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={createQuizData.duration}
                  onChange={(e) => setCreateQuizData(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                  min="5"
                  max="180"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <Select value={createQuizData.language} onValueChange={(value) => 
                  setCreateQuizData(prev => ({ ...prev, language: value }))
                }>
                  <SelectTrigger>
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Spanish">Spanish</SelectItem>
                    <SelectItem value="French">French</SelectItem>
                    <SelectItem value="Portuguese">Portuguese</SelectItem>
                    <SelectItem value="German">German</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="level">Level</Label>
                <Select value={createQuizData.level} onValueChange={(value) => 
                  setCreateQuizData(prev => ({ ...prev, level: value }))
                }>
                  <SelectTrigger>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Beginner">Beginner</SelectItem>
                    <SelectItem value="Intermediate">Intermediate</SelectItem>
                    <SelectItem value="Advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={createQuizData.description}
                onChange={(e) => setCreateQuizData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe what this quiz covers"
                rows={3}
              />
            </div>

            {/* Quiz Settings */}
            <div className="space-y-4">
              <h4 className="font-medium">Quiz Settings</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="isPublic">Public Quiz</Label>
                  <Switch
                    id="isPublic"
                    checked={createQuizData.isPublic}
                    onCheckedChange={(checked) => 
                      setCreateQuizData(prev => ({ ...prev, isPublic: checked }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="allowRetakes">Allow Retakes</Label>
                  <Switch
                    id="allowRetakes"
                    checked={createQuizData.allowRetakes}
                    onCheckedChange={(checked) => 
                      setCreateQuizData(prev => ({ ...prev, allowRetakes: checked }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="showCorrectAnswers">Show Correct Answers</Label>
                  <Switch
                    id="showCorrectAnswers"
                    checked={createQuizData.showCorrectAnswers}
                    onCheckedChange={(checked) => 
                      setCreateQuizData(prev => ({ ...prev, showCorrectAnswers: checked }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="timeLimit">Time Limit</Label>
                  <Switch
                    id="timeLimit"
                    checked={createQuizData.timeLimit}
                    onCheckedChange={(checked) => 
                      setCreateQuizData(prev => ({ ...prev, timeLimit: checked }))
                    }
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Add Questions Section */}
            <div className="space-y-4">
              <h4 className="font-medium">Add Questions</h4>
              
              <div className="space-y-4 p-4 border rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="questionType">Question Type</Label>
                    <Select 
                      value={currentQuestion.type} 
                      onValueChange={(value: any) => 
                        setCurrentQuestion(prev => ({ ...prev, type: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
                        <SelectItem value="true-false">True/False</SelectItem>
                        <SelectItem value="fill-blank">Fill in the Blank</SelectItem>
                        <SelectItem value="short-answer">Short Answer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="points">Points</Label>
                    <Input
                      id="points"
                      type="number"
                      value={currentQuestion.points}
                      onChange={(e) => 
                        setCurrentQuestion(prev => ({ ...prev, points: parseInt(e.target.value) }))
                      }
                      min="1"
                      max="10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="question">Question</Label>
                  <Textarea
                    id="question"
                    value={currentQuestion.question}
                    onChange={(e) => 
                      setCurrentQuestion(prev => ({ ...prev, question: e.target.value }))
                    }
                    placeholder="Enter your question"
                    rows={2}
                  />
                </div>

                {currentQuestion.type === 'multiple-choice' && (
                  <div className="space-y-2">
                    <Label>Answer Options</Label>
                    {currentQuestion.options?.map((option, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Input
                          value={option}
                          onChange={(e) => {
                            const newOptions = [...(currentQuestion.options || [])]
                            newOptions[index] = e.target.value
                            setCurrentQuestion(prev => ({ ...prev, options: newOptions }))
                          }}
                          placeholder={`Option ${index + 1}`}
                        />
                        <input
                          type="radio"
                          name="correctAnswer"
                          checked={currentQuestion.correctAnswer === index}
                          onChange={() => 
                            setCurrentQuestion(prev => ({ ...prev, correctAnswer: index }))
                          }
                        />
                      </div>
                    ))}
                  </div>
                )}

                {currentQuestion.type === 'true-false' && (
                  <div className="space-y-2">
                    <Label>Correct Answer</Label>
                    <Select 
                      value={currentQuestion.correctAnswer as string} 
                      onValueChange={(value) => 
                        setCurrentQuestion(prev => ({ ...prev, correctAnswer: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">True</SelectItem>
                        <SelectItem value="false">False</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="explanation">Explanation (Optional)</Label>
                  <Textarea
                    id="explanation"
                    value={currentQuestion.explanation}
                    onChange={(e) => 
                      setCurrentQuestion(prev => ({ ...prev, explanation: e.target.value }))
                    }
                    placeholder="Explain the correct answer"
                    rows={2}
                  />
                </div>

                <Button onClick={addQuestion} className="w-full">
                  Add Question
                </Button>
              </div>

              {/* Questions List */}
              {createQuizData.questions.length > 0 && (
                <div className="space-y-2">
                  <h5 className="font-medium">Added Questions ({createQuizData.questions.length})</h5>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {createQuizData.questions.map((question, index) => (
                      <div key={question.id} className="p-3 border rounded-lg flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-medium">Q{index + 1}: {question.question}</p>
                          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <Badge variant="outline">{question.type}</Badge>
                            <span>{question.points} pts</span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => 
                            setCreateQuizData(prev => ({
                              ...prev,
                              questions: prev.questions.filter(q => q.id !== question.id)
                            }))
                          }
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleCreateQuiz}
                disabled={!createQuizData.title || !createQuizData.language || createQuizData.questions.length === 0}
              >
                <Save className="h-4 w-4 mr-2" />
                Create Quiz
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default TeacherQuizzes