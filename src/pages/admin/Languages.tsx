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
import { 
  Plus,
  Search,
  Edit,
  Trash2,
  Globe,
  Users,
  BookOpen,
  TrendingUp,
  TrendingDown,
  Flag,
  Save,
  X
} from 'lucide-react'

interface Language {
  id: string
  name: string
  code: string
  nativeName: string
  flag: string
  isActive: boolean
  totalStudents: number
  totalTeachers: number
  totalCourses: number
  difficulty: 'Easy' | 'Medium' | 'Hard'
  popularity: number
  createdAt: string
}

interface CreateLanguageData {
  name: string
  code: string
  nativeName: string
  flag: string
  difficulty: string
  description: string
  isActive: boolean
}

const AdminLanguages: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all')
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [editingLanguage, setEditingLanguage] = useState<Language | null>(null)

  // Mock language data
  const [languages, setLanguages] = useState<Language[]>([
    {
      id: '1',
      name: 'Spanish',
      code: 'es',
      nativeName: 'Español',
      flag: '🇪🇸',
      isActive: true,
      totalStudents: 324,
      totalTeachers: 28,
      totalCourses: 45,
      difficulty: 'Medium',
      popularity: 95,
      createdAt: '2023-01-15'
    },
    {
      id: '2',
      name: 'French',
      code: 'fr',
      nativeName: 'Français',
      flag: '🇫🇷',
      isActive: true,
      totalStudents: 267,
      totalTeachers: 22,
      totalCourses: 38,
      difficulty: 'Medium',
      popularity: 87,
      createdAt: '2023-01-20'
    },
    {
      id: '3',
      name: 'German',
      code: 'de',
      nativeName: 'Deutsch',
      flag: '🇩🇪',
      isActive: true,
      totalStudents: 198,
      totalTeachers: 18,
      totalCourses: 29,
      difficulty: 'Hard',
      popularity: 78,
      createdAt: '2023-02-10'
    },
    {
      id: '4',
      name: 'Portuguese',
      code: 'pt',
      nativeName: 'Português',
      flag: '🇵🇹',
      isActive: true,
      totalStudents: 145,
      totalTeachers: 12,
      totalCourses: 22,
      difficulty: 'Medium',
      popularity: 72,
      createdAt: '2023-02-25'
    },
    {
      id: '5',
      name: 'Italian',
      code: 'it',
      nativeName: 'Italiano',
      flag: '🇮🇹',
      isActive: true,
      totalStudents: 112,
      totalTeachers: 9,
      totalCourses: 16,
      difficulty: 'Medium',
      popularity: 68,
      createdAt: '2023-03-01'
    },
    {
      id: '6',
      name: 'Japanese',
      code: 'ja',
      nativeName: '日本語',
      flag: '🇯🇵',
      isActive: false,
      totalStudents: 89,
      totalTeachers: 8,
      totalCourses: 14,
      difficulty: 'Hard',
      popularity: 65,
      createdAt: '2023-03-10'
    }
  ])

  const [createLanguageData, setCreateLanguageData] = useState<CreateLanguageData>({
    name: '',
    code: '',
    nativeName: '',
    flag: '',
    difficulty: '',
    description: '',
    isActive: true
  })

  const filteredLanguages = languages.filter(lang => {
    const matchesSearch = lang.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lang.nativeName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' ? lang.isActive : !lang.isActive)
    const matchesDifficulty = filterDifficulty === 'all' || 
                             lang.difficulty.toLowerCase() === filterDifficulty.toLowerCase()
    
    return matchesSearch && matchesStatus && matchesDifficulty
  })

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-800'
      case 'Medium': return 'bg-yellow-100 text-yellow-800'
      case 'Hard': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const handleCreateLanguage = () => {
    const newLanguage: Language = {
      id: Date.now().toString(),
      name: createLanguageData.name,
      code: createLanguageData.code,
      nativeName: createLanguageData.nativeName,
      flag: createLanguageData.flag,
      difficulty: createLanguageData.difficulty as any,
      isActive: createLanguageData.isActive,
      totalStudents: 0,
      totalTeachers: 0,
      totalCourses: 0,
      popularity: 0,
      createdAt: new Date().toISOString().split('T')[0]
    }

    setLanguages(prev => [newLanguage, ...prev])
    setShowCreateDialog(false)
    setCreateLanguageData({
      name: '',
      code: '',
      nativeName: '',
      flag: '',
      difficulty: '',
      description: '',
      isActive: true
    })
  }

  const handleToggleStatus = (languageId: string) => {
    setLanguages(prev => 
      prev.map(lang => 
        lang.id === languageId ? { ...lang, isActive: !lang.isActive } : lang
      )
    )
  }

  const handleDeleteLanguage = (languageId: string) => {
    setLanguages(prev => prev.filter(lang => lang.id !== languageId))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Language Management</h1>
          <p className="text-muted-foreground">Manage available languages and their settings</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Language
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6 text-center">
            <Globe className="h-8 w-8 text-primary mx-auto mb-2" />
            <div className="text-2xl font-bold">{languages.length}</div>
            <div className="text-sm text-muted-foreground">Total Languages</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <Flag className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{languages.filter(l => l.isActive).length}</div>
            <div className="text-sm text-muted-foreground">Active Languages</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <Users className="h-8 w-8 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{languages.reduce((sum, l) => sum + l.totalStudents, 0)}</div>
            <div className="text-sm text-muted-foreground">Total Students</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <BookOpen className="h-8 w-8 text-orange-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{languages.reduce((sum, l) => sum + l.totalCourses, 0)}</div>
            <div className="text-sm text-muted-foreground">Total Courses</div>
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
                  placeholder="Search languages..."
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
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterDifficulty} onValueChange={setFilterDifficulty}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Languages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredLanguages.map((language) => (
          <Card key={language.id} className={`hover:shadow-md transition-shadow ${
            !language.isActive ? 'opacity-60' : ''
          }`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-3xl">{language.flag}</span>
                  <div>
                    <CardTitle className="text-lg">{language.name}</CardTitle>
                    <CardDescription>{language.nativeName}</CardDescription>
                  </div>
                </div>
                <Switch
                  checked={language.isActive}
                  onCheckedChange={() => handleToggleStatus(language.id)}
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Badge className={`${getDifficultyColor(language.difficulty)} border-0`}>
                  {language.difficulty}
                </Badge>
                <Badge variant="outline">
                  {language.code.toUpperCase()}
                </Badge>
              </div>

              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-lg font-bold text-blue-600">{language.totalStudents}</div>
                  <div className="text-xs text-muted-foreground">Students</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-green-600">{language.totalTeachers}</div>
                  <div className="text-xs text-muted-foreground">Teachers</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-orange-600">{language.totalCourses}</div>
                  <div className="text-xs text-muted-foreground">Courses</div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Popularity</span>
                  <span>{language.popularity}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${language.popularity}%` }}
                  ></div>
                </div>
              </div>

              <div className="flex justify-between items-center pt-2">
                <span className="text-xs text-muted-foreground">
                  Added {new Date(language.createdAt).toLocaleDateString()}
                </span>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={() => setEditingLanguage(language)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleDeleteLanguage(language.id)}
                    disabled={language.totalStudents > 0}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create Language Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add New Language</DialogTitle>
            <DialogDescription>
              Add a new language to the platform for students to learn.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Language Name</Label>
                <Input
                  id="name"
                  value={createLanguageData.name}
                  onChange={(e) => setCreateLanguageData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Spanish"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="code">Language Code</Label>
                <Input
                  id="code"
                  value={createLanguageData.code}
                  onChange={(e) => setCreateLanguageData(prev => ({ ...prev, code: e.target.value }))}
                  placeholder="e.g., es"
                  maxLength={2}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nativeName">Native Name</Label>
                <Input
                  id="nativeName"
                  value={createLanguageData.nativeName}
                  onChange={(e) => setCreateLanguageData(prev => ({ ...prev, nativeName: e.target.value }))}
                  placeholder="e.g., Español"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="flag">Flag Emoji</Label>
                <Input
                  id="flag"
                  value={createLanguageData.flag}
                  onChange={(e) => setCreateLanguageData(prev => ({ ...prev, flag: e.target.value }))}
                  placeholder="e.g., 🇪🇸"
                  maxLength={2}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="difficulty">Difficulty Level</Label>
              <Select value={createLanguageData.difficulty} onValueChange={(value) => 
                setCreateLanguageData(prev => ({ ...prev, difficulty: value }))
              }>
                <SelectTrigger>
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Easy">Easy</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={createLanguageData.description}
                onChange={(e) => setCreateLanguageData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description of the language"
                rows={3}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="isActive">Active Language</Label>
              <Switch
                id="isActive"
                checked={createLanguageData.isActive}
                onCheckedChange={(checked) => 
                  setCreateLanguageData(prev => ({ ...prev, isActive: checked }))
                }
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleCreateLanguage}
                disabled={!createLanguageData.name || !createLanguageData.code || !createLanguageData.nativeName}
              >
                <Save className="h-4 w-4 mr-2" />
                Add Language
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default AdminLanguages