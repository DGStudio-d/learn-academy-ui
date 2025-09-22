import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Progress } from "@/components/ui/progress"
import { 
  Search,
  Filter,
  Eye,
  Edit,
  Ban,
  CheckCircle,
  XCircle,
  Users,
  GraduationCap,
  Star,
  Clock,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Award,
  Languages,
  BookOpen,
  DollarSign
} from 'lucide-react'

interface Teacher {
  id: string
  name: string
  email: string
  phone: string
  location: string
  status: 'active' | 'pending' | 'suspended' | 'rejected'
  specializations: string[]
  languages: string[]
  experience: number // years
  rating: number
  totalStudents: number
  totalEarnings: number
  joinedAt: string
  lastActive: string
  bio: string
  qualifications: string[]
  hourlyRate: number
  coursesCreated: number
}

interface TeacherApplication {
  id: string
  name: string
  email: string
  phone: string
  location: string
  specializations: string[]
  languages: string[]
  experience: number
  qualifications: string[]
  bio: string
  cv: string
  appliedAt: string
  status: 'pending' | 'approved' | 'rejected'
}

const AdminTeachers: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterLanguage, setFilterLanguage] = useState<string>('all')
  const [filterSpecialization, setFilterSpecialization] = useState<string>('all')
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [activeTab, setActiveTab] = useState<'active' | 'applications'>('active')

  // Mock teacher data
  const [teachers, setTeachers] = useState<Teacher[]>([
    {
      id: '1',
      name: 'Dr. Maria Santos',
      email: 'maria.santos@email.com',
      phone: '+34 612 345 678',
      location: 'Barcelona, Spain',
      status: 'active',
      specializations: ['Spanish Grammar', 'Conversation', 'Business Spanish'],
      languages: ['Spanish', 'English', 'Catalan'],
      experience: 10,
      rating: 4.9,
      totalStudents: 145,
      totalEarnings: 28750,
      joinedAt: '2023-01-15',
      lastActive: '2024-03-20T10:30:00Z',
      bio: 'Experienced Spanish teacher with a PhD in Hispanic Linguistics.',
      qualifications: ['PhD in Hispanic Linguistics', 'DELE Examiner Certificate'],
      hourlyRate: 45,
      coursesCreated: 8
    },
    {
      id: '2',
      name: 'Prof. Jean Dupont',
      email: 'jean.dupont@email.com',
      phone: '+33 6 12 34 56 78',
      location: 'Paris, France',
      status: 'active',
      specializations: ['French Literature', 'Advanced Grammar', 'Pronunciation'],
      languages: ['French', 'English', 'Italian'],
      experience: 15,
      rating: 4.8,
      totalStudents: 98,
      totalEarnings: 22400,
      joinedAt: '2023-02-01',
      lastActive: '2024-03-19T16:45:00Z',
      bio: 'Professor of French Literature with extensive teaching experience.',
      qualifications: ['Master in French Literature', 'DELF/DALF Examiner'],
      hourlyRate: 50,
      coursesCreated: 6
    },
    {
      id: '3',
      name: 'Dr. Klaus Weber',
      email: 'klaus.weber@email.com',
      phone: '+49 30 12345678',
      location: 'Berlin, Germany',
      status: 'active',
      specializations: ['German Grammar', 'Technical German', 'TestDaF Prep'],
      languages: ['German', 'English', 'Dutch'],
      experience: 12,
      rating: 4.7,
      totalStudents: 76,
      totalEarnings: 19200,
      joinedAt: '2023-03-10',
      lastActive: '2024-03-20T09:15:00Z',
      bio: 'German language specialist with focus on technical and business German.',
      qualifications: ['PhD in German Linguistics', 'TestDaF Examiner'],
      hourlyRate: 42,
      coursesCreated: 5
    },
    {
      id: '4',
      name: 'Ana Silva',
      email: 'ana.silva@email.com',
      phone: '+351 912 345 678',
      location: 'Lisbon, Portugal',
      status: 'pending',
      specializations: ['Portuguese Conversation', 'Brazilian Portuguese'],
      languages: ['Portuguese', 'Spanish', 'English'],
      experience: 6,
      rating: 4.5,
      totalStudents: 34,
      totalEarnings: 8500,
      joinedAt: '2024-03-01',
      lastActive: '2024-03-19T14:20:00Z',
      bio: 'Native Portuguese speaker specializing in conversational skills.',
      qualifications: ['Master in Portuguese Studies', 'CAPLE Certificate'],
      hourlyRate: 35,
      coursesCreated: 3
    }
  ])

  const [applications, setApplications] = useState<TeacherApplication[]>([
    {
      id: '1',
      name: 'Roberto Martinez',
      email: 'roberto.martinez@email.com',
      phone: '+52 55 1234 5678',
      location: 'Mexico City, Mexico',
      specializations: ['Mexican Spanish', 'Culture Studies'],
      languages: ['Spanish', 'English', 'Nahuatl'],
      experience: 8,
      qualifications: ['Master in Hispanic Studies', 'TESOL Certificate'],
      bio: 'Mexican Spanish teacher with expertise in cultural context and regional variations.',
      cv: 'roberto_martinez_cv.pdf',
      appliedAt: '2024-03-18',
      status: 'pending'
    },
    {
      id: '2',
      name: 'Sophie Laurent',
      email: 'sophie.laurent@email.com',
      phone: '+33 6 98 76 54 32',
      location: 'Lyon, France',
      specializations: ['French for Business', 'Pronunciation'],
      languages: ['French', 'English', 'German'],
      experience: 5,
      qualifications: ['Master in Applied Linguistics', 'FLE Certificate'],
      bio: 'Business French specialist with corporate training experience.',
      cv: 'sophie_laurent_cv.pdf',
      appliedAt: '2024-03-17',
      status: 'pending'
    }
  ])

  const filteredTeachers = teachers.filter(teacher => {
    const matchesSearch = teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         teacher.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || teacher.status === filterStatus
    const matchesLanguage = filterLanguage === 'all' || 
                           teacher.languages.some(lang => lang === filterLanguage)
    const matchesSpecialization = filterSpecialization === 'all' || 
                                 teacher.specializations.some(spec => 
                                   spec.toLowerCase().includes(filterSpecialization.toLowerCase()))
    
    return matchesSearch && matchesStatus && matchesLanguage && matchesSpecialization
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'suspended': return 'bg-red-100 text-red-800'
      case 'rejected': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'pending': return <Clock className="h-4 w-4 text-yellow-500" />
      case 'suspended': return <Ban className="h-4 w-4 text-red-500" />
      case 'rejected': return <XCircle className="h-4 w-4 text-gray-500" />
      default: return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const handleApproveApplication = (applicationId: string) => {
    const application = applications.find(app => app.id === applicationId)
    if (!application) return

    const newTeacher: Teacher = {
      id: Date.now().toString(),
      name: application.name,
      email: application.email,
      phone: application.phone,
      location: application.location,
      status: 'active',
      specializations: application.specializations,
      languages: application.languages,
      experience: application.experience,
      rating: 0,
      totalStudents: 0,
      totalEarnings: 0,
      joinedAt: new Date().toISOString().split('T')[0],
      lastActive: new Date().toISOString(),
      bio: application.bio,
      qualifications: application.qualifications,
      hourlyRate: 35,
      coursesCreated: 0
    }

    setTeachers(prev => [newTeacher, ...prev])
    setApplications(prev => prev.filter(app => app.id !== applicationId))
  }

  const handleRejectApplication = (applicationId: string) => {
    setApplications(prev => 
      prev.map(app => 
        app.id === applicationId 
          ? { ...app, status: 'rejected' as const }
          : app
      )
    )
  }

  const handleSuspendTeacher = (teacherId: string) => {
    setTeachers(prev => 
      prev.map(teacher => 
        teacher.id === teacherId 
          ? { ...teacher, status: teacher.status === 'suspended' ? 'active' : 'suspended' as any }
          : teacher
      )
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString([], { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Teacher Management</h1>
          <p className="text-muted-foreground">Manage teachers and review applications</p>
        </div>
        <div className="flex items-center space-x-2">
          {applications.filter(app => app.status === 'pending').length > 0 && (
            <Badge variant="destructive">
              {applications.filter(app => app.status === 'pending').length} pending
            </Badge>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6 text-center">
            <Users className="h-8 w-8 text-primary mx-auto mb-2" />
            <div className="text-2xl font-bold">{teachers.length}</div>
            <div className="text-sm text-muted-foreground">Total Teachers</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{teachers.filter(t => t.status === 'active').length}</div>
            <div className="text-sm text-muted-foreground">Active Teachers</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <Clock className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{applications.filter(app => app.status === 'pending').length}</div>
            <div className="text-sm text-muted-foreground">Pending Applications</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <Star className="h-8 w-8 text-orange-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">
              {(teachers.filter(t => t.rating > 0).reduce((sum, t) => sum + t.rating, 0) / 
                teachers.filter(t => t.rating > 0).length || 0).toFixed(1)}
            </div>
            <div className="text-sm text-muted-foreground">Average Rating</div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab as any} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="active">
            Active Teachers ({teachers.filter(t => t.status === 'active').length})
          </TabsTrigger>
          <TabsTrigger value="applications">
            Applications ({applications.filter(app => app.status === 'pending').length})
          </TabsTrigger>
        </TabsList>

        {/* Active Teachers Tab */}
        <TabsContent value="active" className="space-y-4">
          {/* Filters and Search */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Search teachers..."
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
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
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
                    <SelectItem value="German">German</SelectItem>
                    <SelectItem value="Portuguese">Portuguese</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Teachers List */}
          <div className="grid gap-4">
            {filteredTeachers.map((teacher) => (
              <Card key={teacher.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <GraduationCap className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold">{teacher.name}</h3>
                          <Badge className={`${getStatusColor(teacher.status)} border-0`}>
                            {getStatusIcon(teacher.status)}
                            <span className="ml-1 capitalize">{teacher.status}</span>
                          </Badge>
                          {teacher.rating > 0 && (
                            <div className="flex items-center text-sm">
                              <Star className="h-4 w-4 text-yellow-500 mr-1" />
                              <span>{teacher.rating.toFixed(1)}</span>
                            </div>
                          )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <Mail className="h-4 w-4" />
                            <span>{teacher.email}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-4 w-4" />
                            <span>{teacher.location}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Users className="h-4 w-4" />
                            <span>{teacher.totalStudents} students</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <DollarSign className="h-4 w-4" />
                            <span>{formatCurrency(teacher.totalEarnings)}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4 mt-2">
                          <div className="flex flex-wrap gap-1">
                            {teacher.languages.slice(0, 3).map((lang, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {lang}
                              </Badge>
                            ))}
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {teacher.specializations.slice(0, 2).map((spec, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {spec}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedTeacher(teacher)
                          setShowDetailsDialog(true)
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSuspendTeacher(teacher.id)}
                        className={teacher.status === 'suspended' ? 'text-green-600' : 'text-red-600'}
                      >
                        {teacher.status === 'suspended' ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <Ban className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Applications Tab */}
        <TabsContent value="applications" className="space-y-4">
          <div className="grid gap-4">
            {applications.filter(app => app.status === 'pending').map((application) => (
              <Card key={application.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold">{application.name}</h3>
                        <Badge variant="outline">{application.experience} years exp</Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground mb-3">
                        <div className="flex items-center space-x-1">
                          <Mail className="h-4 w-4" />
                          <span>{application.email}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-4 w-4" />
                          <span>{application.location}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Phone className="h-4 w-4" />
                          <span>{application.phone}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>Applied {formatDate(application.appliedAt)}</span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {application.bio}
                      </p>
                      <div className="flex items-center space-x-4">
                        <div className="flex flex-wrap gap-1">
                          <span className="text-xs font-medium">Languages:</span>
                          {application.languages.map((lang, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {lang}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex flex-wrap gap-1">
                          <span className="text-xs font-medium">Specializations:</span>
                          {application.specializations.slice(0, 2).map((spec, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {spec}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRejectApplication(application.id)}
                        className="text-red-600"
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleApproveApplication(application.id)}
                        className="text-green-600"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Teacher Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Teacher Details</DialogTitle>
            <DialogDescription>
              Comprehensive information about {selectedTeacher?.name}
            </DialogDescription>
          </DialogHeader>
          {selectedTeacher && (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Contact Information</h4>
                  <div className="space-y-1 text-sm">
                    <div><strong>Email:</strong> {selectedTeacher.email}</div>
                    <div><strong>Phone:</strong> {selectedTeacher.phone}</div>
                    <div><strong>Location:</strong> {selectedTeacher.location}</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Professional Info</h4>
                  <div className="space-y-1 text-sm">
                    <div><strong>Experience:</strong> {selectedTeacher.experience} years</div>
                    <div><strong>Hourly Rate:</strong> ${selectedTeacher.hourlyRate}</div>
                    <div><strong>Joined:</strong> {formatDate(selectedTeacher.joinedAt)}</div>
                  </div>
                </div>
              </div>

              {/* Performance Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600">{selectedTeacher.totalStudents}</div>
                  <div className="text-sm text-muted-foreground">Students</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">{formatCurrency(selectedTeacher.totalEarnings)}</div>
                  <div className="text-sm text-muted-foreground">Earnings</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-orange-600">{selectedTeacher.coursesCreated}</div>
                  <div className="text-sm text-muted-foreground">Courses</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">{selectedTeacher.rating.toFixed(1)}</div>
                  <div className="text-sm text-muted-foreground">Rating</div>
                </div>
              </div>

              {/* Bio */}
              <div>
                <h4 className="font-medium mb-2">Biography</h4>
                <p className="text-sm text-muted-foreground">{selectedTeacher.bio}</p>
              </div>

              {/* Languages & Specializations */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Languages</h4>
                  <div className="flex flex-wrap gap-1">
                    {selectedTeacher.languages.map((lang, index) => (
                      <Badge key={index} variant="outline">
                        {lang}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Specializations</h4>
                  <div className="flex flex-wrap gap-1">
                    {selectedTeacher.specializations.map((spec, index) => (
                      <Badge key={index} variant="secondary">
                        {spec}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* Qualifications */}
              <div>
                <h4 className="font-medium mb-2">Qualifications</h4>
                <div className="space-y-1">
                  {selectedTeacher.qualifications.map((qual, index) => (
                    <div key={index} className="flex items-center space-x-2 text-sm">
                      <Award className="h-4 w-4 text-primary" />
                      <span>{qual}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default AdminTeachers