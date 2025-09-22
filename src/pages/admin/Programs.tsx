import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { Progress } from "@/components/ui/progress"
import { 
  Plus,
  Search,
  Edit,
  Trash2,
  BookOpen,
  Users,
  Clock,
  Star,
  TrendingUp,
  Eye,
  Save,
  X,
  Globe,
  Play,
  Pause
} from 'lucide-react'

interface Program {
  id: string
  title: string
  description: string
  language: string
  level: 'Beginner' | 'Intermediate' | 'Advanced'
  duration: number // in weeks
  lessonsCount: number
  enrolled: number
  maxStudents: number
  rating: number
  price: number
  status: 'active' | 'draft' | 'archived'
  createdBy: string
  createdAt: string
  thumbnail: string
  tags: string[]
}

interface CreateProgramData {
  title: string
  description: string
  language: string
  level: string
  duration: number
  lessonsCount: number
  maxStudents: number
  price: number
  status: string
  tags: string
  objectives: string
  prerequisites: string
}

const AdminPrograms: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterLanguage, setFilterLanguage] = useState<string>('all')
  const [filterLevel, setFilterLevel] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [editingProgram, setEditingProgram] = useState<Program | null>(null)

  // Mock program data
  const [programs, setPrograms] = useState<Program[]>([
    {
      id: '1',
      title: 'Spanish for Beginners',
      description: 'A comprehensive introduction to Spanish language and culture for absolute beginners.',
      language: 'Spanish',
      level: 'Beginner',
      duration: 12,
      lessonsCount: 48,
      enrolled: 124,
      maxStudents: 150,
      rating: 4.7,
      price: 99,
      status: 'active',
      createdBy: 'Dr. Maria Santos',
      createdAt: '2024-01-15',
      thumbnail: '/api/placeholder/300/200',
      tags: ['grammar', 'vocabulary', 'speaking', 'listening']
    },
    {
      id: '2',
      title: 'Advanced French Conversation',
      description: 'Perfect your French speaking skills with advanced conversation techniques and cultural insights.',
      language: 'French',
      level: 'Advanced',
      duration: 8,
      lessonsCount: 32,
      enrolled: 67,
      maxStudents: 80,
      rating: 4.9,
      price: 149,
      status: 'active',
      createdBy: 'Prof. Jean Dupont',
      createdAt: '2024-02-01',
      thumbnail: '/api/placeholder/300/200',
      tags: ['conversation', 'pronunciation', 'culture', 'fluency']
    },
    {
      id: '3',
      title: 'German Grammar Mastery',
      description: 'Master complex German grammar structures with practical exercises and real-world examples.',
      language: 'German',
      level: 'Intermediate',
      duration: 16,
      lessonsCount: 64,
      enrolled: 89,
      maxStudents: 100,
      rating: 4.5,
      price: 129,
      status: 'active',
      createdBy: 'Dr. Klaus Weber',
      createdAt: '2024-01-20',
      thumbnail: '/api/placeholder/300/200',
      tags: ['grammar', 'cases', 'syntax', 'exercises']
    },
    {
      id: '4',
      title: 'Portuguese for Business',
      description: 'Learn Portuguese specifically for business contexts and professional communication.',
      language: 'Portuguese',
      level: 'Intermediate',
      duration: 10,
      lessonsCount: 40,
      enrolled: 34,
      maxStudents: 60,
      rating: 4.3,
      price: 119,
      status: 'draft',
      createdBy: 'Ana Silva',
      createdAt: '2024-03-01',
      thumbnail: '/api/placeholder/300/200',
      tags: ['business', 'professional', 'communication', 'presentations']
    }
  ])

  const [createProgramData, setCreateProgramData] = useState<CreateProgramData>({
    title: '',
    description: '',
    language: '',
    level: '',
    duration: 8,
    lessonsCount: 24,
    maxStudents: 50,
    price: 99,
    status: 'draft',
    tags: '',
    objectives: '',
    prerequisites: ''
  })

  const filteredPrograms = programs.filter(program => {
    const matchesSearch = program.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         program.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesLanguage = filterLanguage === 'all' || program.language === filterLanguage
    const matchesLevel = filterLevel === 'all' || program.level === filterLevel
    const matchesStatus = filterStatus === 'all' || program.status === filterStatus
    
    return matchesSearch && matchesLanguage && matchesLevel && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'draft': return 'bg-yellow-100 text-yellow-800'
      case 'archived': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
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

  const handleCreateProgram = () => {
    const newProgram: Program = {
      id: Date.now().toString(),
      title: createProgramData.title,
      description: createProgramData.description,
      language: createProgramData.language,
      level: createProgramData.level as any,
      duration: createProgramData.duration,
      lessonsCount: createProgramData.lessonsCount,
      enrolled: 0,
      maxStudents: createProgramData.maxStudents,
      rating: 0,
      price: createProgramData.price,
      status: createProgramData.status as any,
      createdBy: 'Admin',
      createdAt: new Date().toISOString().split('T')[0],
      thumbnail: '/api/placeholder/300/200',
      tags: createProgramData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
    }

    setPrograms(prev => [newProgram, ...prev])
    setShowCreateDialog(false)
    setCreateProgramData({
      title: '',
      description: '',
      language: '',
      level: '',
      duration: 8,
      lessonsCount: 24,
      maxStudents: 50,
      price: 99,
      status: 'draft',
      tags: '',
      objectives: '',
      prerequisites: ''
    })
  }

  const handleToggleStatus = (programId: string) => {
    setPrograms(prev => 
      prev.map(program => 
        program.id === programId 
          ? { ...program, status: program.status === 'active' ? 'draft' : 'active' as any }
          : program
      )
    )
  }

  const handleDeleteProgram = (programId: string) => {
    const program = programs.find(p => p.id === programId)
    if (program && program.enrolled > 0) {
      alert('Cannot delete program with enrolled students')
      return
    }
    setPrograms(prev => prev.filter(program => program.id !== programId))
  }

  const getEnrollmentPercentage = (enrolled: number, maxStudents: number) => {
    return Math.round((enrolled / maxStudents) * 100)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Program Management</h1>
          <p className="text-muted-foreground">Create and manage language learning programs</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Program
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6 text-center">
            <BookOpen className="h-8 w-8 text-primary mx-auto mb-2" />
            <div className="text-2xl font-bold">{programs.length}</div>
            <div className="text-sm text-muted-foreground">Total Programs</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <Play className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{programs.filter(p => p.status === 'active').length}</div>
            <div className="text-sm text-muted-foreground">Active Programs</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <Users className="h-8 w-8 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{programs.reduce((sum, p) => sum + p.enrolled, 0)}</div>
            <div className="text-sm text-muted-foreground">Total Enrollments</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <Star className="h-8 w-8 text-orange-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">
              {(programs.filter(p => p.rating > 0).reduce((sum, p) => sum + p.rating, 0) / 
                programs.filter(p => p.rating > 0).length || 0).toFixed(1)}
            </div>
            <div className="text-sm text-muted-foreground">Average Rating</div>
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
                  placeholder="Search programs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterLanguage} onValueChange={setFilterLanguage}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Languages</SelectItem>
                <SelectItem value="Spanish">Spanish</SelectItem>
                <SelectItem value="French">French</SelectItem>
                <SelectItem value="German">German</SelectItem>
                <SelectItem value="Portuguese">Portuguese</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterLevel} onValueChange={setFilterLevel}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="Beginner">Beginner</SelectItem>
                <SelectItem value="Intermediate">Intermediate</SelectItem>
                <SelectItem value="Advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Programs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPrograms.map((program) => (
          <Card key={program.id} className="hover:shadow-md transition-shadow">
            <div className="aspect-video bg-muted rounded-t-lg relative overflow-hidden">
              <img 
                src={program.thumbnail} 
                alt={program.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 right-2">
                <Badge className={`${getStatusColor(program.status)} border-0`}>
                  {program.status}
                </Badge>
              </div>
            </div>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg mb-1">{program.title}</CardTitle>
                  <div className="flex items-center space-x-2 mb-2">
                    <Badge variant="outline">{program.language}</Badge>
                    <Badge className={`${getLevelColor(program.level)} border-0 text-xs`}>
                      {program.level}
                    </Badge>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-primary">${program.price}</div>
                  {program.rating > 0 && (
                    <div className="flex items-center text-sm">
                      <Star className="h-3 w-3 text-yellow-500 mr-1" />
                      <span>{program.rating.toFixed(1)}</span>
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground line-clamp-2">
                {program.description}
              </p>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="font-medium">{program.duration} weeks</div>
                  <div className="text-muted-foreground">Duration</div>
                </div>
                <div>
                  <div className="font-medium">{program.lessonsCount} lessons</div>
                  <div className="text-muted-foreground">Content</div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Enrollment</span>
                  <span>{program.enrolled}/{program.maxStudents}</span>
                </div>
                <Progress 
                  value={getEnrollmentPercentage(program.enrolled, program.maxStudents)} 
                  className="h-2" 
                />
              </div>

              <div className="flex flex-wrap gap-1">
                {program.tags.slice(0, 3).map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {program.tags.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{program.tags.length - 3}
                  </Badge>
                )}
              </div>

              <div className="text-xs text-muted-foreground">
                Created by {program.createdBy} • {new Date(program.createdAt).toLocaleDateString()}
              </div>

              <div className="flex justify-between items-center pt-2">
                <Switch
                  checked={program.status === 'active'}
                  onCheckedChange={() => handleToggleStatus(program.id)}
                />
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setEditingProgram(program)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleDeleteProgram(program.id)}
                    disabled={program.enrolled > 0}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create Program Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Program</DialogTitle>
            <DialogDescription>
              Create a new language learning program for students.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Program Title</Label>
                <Input
                  id="title"
                  value={createProgramData.title}
                  onChange={(e) => setCreateProgramData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter program title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <Select value={createProgramData.language} onValueChange={(value) => 
                  setCreateProgramData(prev => ({ ...prev, language: value }))
                }>
                  <SelectTrigger>
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Spanish">Spanish</SelectItem>
                    <SelectItem value="French">French</SelectItem>
                    <SelectItem value="German">German</SelectItem>
                    <SelectItem value="Portuguese">Portuguese</SelectItem>
                    <SelectItem value="Italian">Italian</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={createProgramData.description}
                onChange={(e) => setCreateProgramData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe the program content and objectives"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="level">Level</Label>
                <Select value={createProgramData.level} onValueChange={(value) => 
                  setCreateProgramData(prev => ({ ...prev, level: value }))
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
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (weeks)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={createProgramData.duration}
                  onChange={(e) => setCreateProgramData(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                  min="1"
                  max="52"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lessonsCount">Number of Lessons</Label>
                <Input
                  id="lessonsCount"
                  type="number"
                  value={createProgramData.lessonsCount}
                  onChange={(e) => setCreateProgramData(prev => ({ ...prev, lessonsCount: parseInt(e.target.value) }))}
                  min="1"
                  max="200"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="maxStudents">Max Students</Label>
                <Input
                  id="maxStudents"
                  type="number"
                  value={createProgramData.maxStudents}
                  onChange={(e) => setCreateProgramData(prev => ({ ...prev, maxStudents: parseInt(e.target.value) }))}
                  min="1"
                  max="1000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Price ($)</Label>
                <Input
                  id="price"
                  type="number"
                  value={createProgramData.price}
                  onChange={(e) => setCreateProgramData(prev => ({ ...prev, price: parseInt(e.target.value) }))}
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={createProgramData.status} onValueChange={(value) => 
                  setCreateProgramData(prev => ({ ...prev, status: value }))
                }>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input
                id="tags"
                value={createProgramData.tags}
                onChange={(e) => setCreateProgramData(prev => ({ ...prev, tags: e.target.value }))}
                placeholder="e.g., grammar, vocabulary, speaking, listening"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="objectives">Learning Objectives</Label>
              <Textarea
                id="objectives"
                value={createProgramData.objectives}
                onChange={(e) => setCreateProgramData(prev => ({ ...prev, objectives: e.target.value }))}
                placeholder="What will students learn in this program?"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="prerequisites">Prerequisites</Label>
              <Textarea
                id="prerequisites"
                value={createProgramData.prerequisites}
                onChange={(e) => setCreateProgramData(prev => ({ ...prev, prerequisites: e.target.value }))}
                placeholder="What should students know before starting?"
                rows={2}
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleCreateProgram}
                disabled={!createProgramData.title || !createProgramData.language || !createProgramData.level}
              >
                <Save className="h-4 w-4 mr-2" />
                Create Program
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default AdminPrograms