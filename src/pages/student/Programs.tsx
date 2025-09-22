import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  BookOpen, 
  Star, 
  Clock, 
  Users, 
  Search,
  Filter,
  Play,
  Lock,
  CheckCircle
} from 'lucide-react'
import { Link } from 'react-router-dom'

interface Program {
  id: number
  title: string
  language: string
  flag: string
  level: 'Beginner' | 'Intermediate' | 'Advanced'
  duration: string
  lessons: number
  students: number
  rating: number
  price: number
  description: string
  teacher: string
  isEnrolled: boolean
  progress?: number
  thumbnail: string
}

const mockPrograms: Program[] = [
  {
    id: 1,
    title: 'Spanish Fundamentals',
    language: 'Spanish',
    flag: '🇪🇸',
    level: 'Beginner',
    duration: '8 weeks',
    lessons: 24,
    students: 1250,
    rating: 4.8,
    price: 99,
    description: 'Master the basics of Spanish with interactive lessons and real-world conversations.',
    teacher: 'María González',
    isEnrolled: true,
    progress: 65,
    thumbnail: '/api/placeholder/300/200'
  },
  {
    id: 2,
    title: 'French Conversation Mastery',
    language: 'French',
    flag: '🇫🇷',
    level: 'Intermediate',
    duration: '10 weeks',
    lessons: 30,
    students: 890,
    rating: 4.7,
    price: 129,
    description: 'Improve your French speaking skills through guided conversation practice.',
    teacher: 'Jean-Pierre Martin',
    isEnrolled: true,
    progress: 40,
    thumbnail: '/api/placeholder/300/200'
  },
  {
    id: 3,
    title: 'Arabic for Beginners',
    language: 'Arabic',
    flag: '🇸🇦',
    level: 'Beginner',
    duration: '12 weeks',
    lessons: 36,
    students: 650,
    rating: 4.9,
    price: 149,
    description: 'Learn Modern Standard Arabic with native speakers and cultural context.',
    teacher: 'Ahmed Al-Rashid',
    isEnrolled: false,
    thumbnail: '/api/placeholder/300/200'
  },
  {
    id: 4,
    title: 'Business English',
    language: 'English',
    flag: '🇺🇸',
    level: 'Advanced',
    duration: '6 weeks',
    lessons: 18,
    students: 2100,
    rating: 4.6,
    price: 199,
    description: 'Professional English for the global workplace and business communications.',
    teacher: 'Sarah Johnson',
    isEnrolled: false,
    thumbnail: '/api/placeholder/300/200'
  },
  {
    id: 5,
    title: 'Italian Essentials',
    language: 'Italian',
    flag: '🇮🇹',
    level: 'Beginner',
    duration: '8 weeks',
    lessons: 20,
    students: 720,
    rating: 4.5,
    price: 89,
    description: 'Discover the beauty of Italian language and culture.',
    teacher: 'Marco Rossi',
    isEnrolled: false,
    thumbnail: '/api/placeholder/300/200'
  }
]

export default function StudentPrograms() {
  const [searchTerm, setSearchTerm] = useState('')
  const [levelFilter, setLevelFilter] = useState<string>('all')
  const [languageFilter, setLanguageFilter] = useState<string>('all')

  const filteredPrograms = mockPrograms.filter(program => {
    const matchesSearch = program.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         program.language.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesLevel = levelFilter === 'all' || program.level === levelFilter
    const matchesLanguage = languageFilter === 'all' || program.language === languageFilter
    
    return matchesSearch && matchesLevel && matchesLanguage
  })

  const enrolledPrograms = filteredPrograms.filter(p => p.isEnrolled)
  const availablePrograms = filteredPrograms.filter(p => !p.isEnrolled)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Language Programs</h1>
        <p className="text-muted-foreground">
          Discover and continue your language learning journey
        </p>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Find Programs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by language or program name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={levelFilter} onValueChange={setLevelFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="All Levels" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="Beginner">Beginner</SelectItem>
                <SelectItem value="Intermediate">Intermediate</SelectItem>
                <SelectItem value="Advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>

            <Select value={languageFilter} onValueChange={setLanguageFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="All Languages" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Languages</SelectItem>
                <SelectItem value="Spanish">Spanish</SelectItem>
                <SelectItem value="French">French</SelectItem>
                <SelectItem value="Arabic">Arabic</SelectItem>
                <SelectItem value="English">English</SelectItem>
                <SelectItem value="Italian">Italian</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Enrolled Programs */}
      {enrolledPrograms.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">My Programs</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrolledPrograms.map((program) => (
              <Card key={program.id} className="overflow-hidden">
                <div className="aspect-video bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                  <span className="text-4xl">{program.flag}</span>
                </div>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{program.title}</CardTitle>
                      <CardDescription>{program.teacher}</CardDescription>
                    </div>
                    <Badge variant="outline">{program.level}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{program.progress}%</span>
                    </div>
                    <Progress value={program.progress} />
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <BookOpen className="h-3 w-3" />
                      {program.lessons} lessons
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {program.duration}
                    </div>
                  </div>

                  <Button className="w-full" asChild>
                    <Link to={`/student/programs/${program.id}`}>
                      <Play className="h-4 w-4 mr-2" />
                      Continue Learning
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Available Programs */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Available Programs</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availablePrograms.map((program) => (
            <Card key={program.id} className="overflow-hidden">
              <div className="aspect-video bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                <span className="text-4xl">{program.flag}</span>
              </div>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{program.title}</CardTitle>
                    <CardDescription>{program.teacher}</CardDescription>
                  </div>
                  <Badge variant="outline">{program.level}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {program.description}
                </p>
                
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <BookOpen className="h-3 w-3" />
                    {program.lessons} lessons
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {program.duration}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">{program.rating}</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Users className="h-3 w-3" />
                      {program.students}
                    </div>
                  </div>
                  <div className="text-lg font-bold">${program.price}</div>
                </div>

                <Button className="w-full" variant="outline">
                  Enroll Now
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {filteredPrograms.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No programs found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search criteria or browse all available programs.
            </p>
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm('')
                setLevelFilter('all')
                setLanguageFilter('all')
              }}
            >
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}