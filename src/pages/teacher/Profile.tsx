import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { useAuth } from '@/contexts/AuthContext'
import { 
  User, 
  Mail, 
  Phone, 
  Globe, 
  Camera, 
  Settings,
  Award,
  Clock,
  BookOpen,
  Star,
  Save,
  Shield,
  Bell,
  Languages,
  GraduationCap,
  Calendar,
  MapPin,
  Link as LinkIcon
} from 'lucide-react'

interface TeacherStats {
  totalStudents: number
  coursesCreated: number
  totalTeachingHours: number
  averageRating: number
  certificates: number
  yearsExperience: number
}

interface Qualification {
  id: string
  degree: string
  institution: string
  year: string
  field: string
}

interface LanguageSkill {
  language: string
  level: 'Native' | 'Fluent' | 'Advanced' | 'Intermediate' | 'Basic'
  certified: boolean
}

interface Availability {
  day: string
  enabled: boolean
  startTime: string
  endTime: string
}

const TeacherProfile: React.FC = () => {
  const { user } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [activeTab, setActiveTab] = useState<'profile' | 'qualifications' | 'availability' | 'settings'>('profile')
  
  // Profile data
  const [profileData, setProfileData] = useState({
    name: user?.name || 'Dr. Sarah Johnson',
    email: user?.email || 'sarah.johnson@example.com',
    phone: '+1 (555) 123-4567',
    bio: 'Experienced language educator with 10+ years of teaching Spanish, French, and Portuguese. Passionate about helping students achieve fluency through immersive and practical learning methods.',
    location: 'Barcelona, Spain',
    timezone: 'UTC+1',
    specializations: ['Spanish', 'French', 'Portuguese', 'Business Communication'],
    teachingStyle: 'Interactive and conversation-focused',
    profileImage: '/api/placeholder/150/150',
    website: 'https://www.sarahjohnson-languages.com',
    linkedin: 'https://linkedin.com/in/sarah-johnson-languages',
    hourlyRate: '$45',
    aboutTeaching: 'I believe in creating a supportive and engaging environment where students feel comfortable making mistakes and learning from them. My classes focus on practical communication skills and cultural understanding.',
    studentGoals: 'I help students achieve fluency through personalized learning paths, focusing on their specific goals whether for business, travel, or personal enrichment.'
  })

  // Teacher statistics
  const [stats] = useState<TeacherStats>({
    totalStudents: 127,
    coursesCreated: 24,
    totalTeachingHours: 2450,
    averageRating: 4.8,
    certificates: 8,
    yearsExperience: 12
  })

  // Qualifications
  const [qualifications, setQualifications] = useState<Qualification[]>([
    {
      id: '1',
      degree: 'Master of Arts in Applied Linguistics',
      institution: 'University of Barcelona',
      year: '2012',
      field: 'Spanish Linguistics'
    },
    {
      id: '2',
      degree: 'Bachelor of Arts in Modern Languages',
      institution: 'Universidad Complutense Madrid',
      year: '2010',
      field: 'Spanish and French Literature'
    },
    {
      id: '3',
      degree: 'DELE Examiner Certification',
      institution: 'Instituto Cervantes',
      year: '2015',
      field: 'Spanish Language Assessment'
    }
  ])

  // Language skills
  const [languageSkills] = useState<LanguageSkill[]>([
    { language: 'Spanish', level: 'Native', certified: true },
    { language: 'French', level: 'Fluent', certified: true },
    { language: 'Portuguese', level: 'Advanced', certified: true },
    { language: 'English', level: 'Fluent', certified: true },
    { language: 'Catalan', level: 'Native', certified: false }
  ])

  // Availability schedule
  const [availability, setAvailability] = useState<Availability[]>([
    { day: 'Monday', enabled: true, startTime: '09:00', endTime: '17:00' },
    { day: 'Tuesday', enabled: true, startTime: '09:00', endTime: '17:00' },
    { day: 'Wednesday', enabled: true, startTime: '09:00', endTime: '17:00' },
    { day: 'Thursday', enabled: true, startTime: '09:00', endTime: '17:00' },
    { day: 'Friday', enabled: true, startTime: '09:00', endTime: '15:00' },
    { day: 'Saturday', enabled: false, startTime: '10:00', endTime: '14:00' },
    { day: 'Sunday', enabled: false, startTime: '10:00', endTime: '14:00' }
  ])

  // Settings
  const [settings, setSettings] = useState({
    emailNotifications: true,
    studentMessages: true,
    bookingNotifications: true,
    weeklyReports: true,
    marketingEmails: false,
    profileVisible: true,
    showRating: true,
    showExperience: true,
    allowInstantBooking: false
  })

  const handleSaveProfile = () => {
    console.log('Saving profile:', profileData)
    setIsEditing(false)
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setProfileData(prev => ({
          ...prev,
          profileImage: e.target?.result as string
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const updateAvailability = (index: number, field: keyof Availability, value: any) => {
    setAvailability(prev => 
      prev.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    )
  }

  const StatCard = ({ icon: Icon, title, value, subtitle }: {
    icon: any
    title: string
    value: string | number
    subtitle?: string
  }) => (
    <Card className="text-center">
      <CardContent className="pt-6">
        <Icon className="h-8 w-8 text-primary mx-auto mb-2" />
        <div className="text-2xl font-bold">{value}</div>
        <div className="text-sm text-muted-foreground">{title}</div>
        {subtitle && <div className="text-xs text-muted-foreground mt-1">{subtitle}</div>}
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Teacher Profile</h1>
          <p className="text-muted-foreground">Manage your teaching profile and preferences</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-4 border-b">
        {[
          { key: 'profile', label: 'Profile', icon: User },
          { key: 'qualifications', label: 'Qualifications', icon: GraduationCap },
          { key: 'availability', label: 'Availability', icon: Calendar },
          { key: 'settings', label: 'Settings', icon: Settings }
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key as any)}
            className={`flex items-center space-x-2 px-4 py-2 border-b-2 transition-colors ${
              activeTab === key
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Icon className="h-4 w-4" />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon={BookOpen}
              title="Total Students"
              value={stats.totalStudents}
            />
            <StatCard
              icon={Clock}
              title="Teaching Hours"
              value={stats.totalTeachingHours}
            />
            <StatCard
              icon={Star}
              title="Average Rating"
              value={`${stats.averageRating}/5`}
            />
            <StatCard
              icon={Award}
              title="Years Experience"
              value={stats.yearsExperience}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Picture and Basic Info */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Profile Picture
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditing(!isEditing)}
                  >
                    {isEditing ? 'Cancel' : 'Edit'}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <div className="relative inline-block">
                  <img
                    src={profileData.profileImage}
                    alt="Profile"
                    className="w-32 h-32 rounded-full mx-auto object-cover border-4 border-background shadow-lg"
                  />
                  {isEditing && (
                    <label className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-2 cursor-pointer hover:bg-primary/90">
                      <Camera className="h-4 w-4" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-semibold">{profileData.name}</h3>
                  <p className="text-muted-foreground">Language Teacher</p>
                  <Badge variant="secondary" className="mt-2">
                    {stats.yearsExperience} Years Experience
                  </Badge>
                </div>
                <div className="flex justify-center space-x-2">
                  <Badge variant="outline">{profileData.hourlyRate}/hour</Badge>
                  <Badge variant="outline">★ {stats.averageRating}</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Profile Details */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Professional Information</CardTitle>
                <CardDescription>Update your professional details and teaching information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={profileData.name}
                      onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={profileData.phone}
                      onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={profileData.location}
                      onChange={(e) => setProfileData(prev => ({ ...prev, location: e.target.value }))}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      value={profileData.website}
                      onChange={(e) => setProfileData(prev => ({ ...prev, website: e.target.value }))}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hourlyRate">Hourly Rate</Label>
                    <Input
                      id="hourlyRate"
                      value={profileData.hourlyRate}
                      onChange={(e) => setProfileData(prev => ({ ...prev, hourlyRate: e.target.value }))}
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Professional Bio</Label>
                  <Textarea
                    id="bio"
                    value={profileData.bio}
                    onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                    disabled={!isEditing}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="aboutTeaching">About Your Teaching</Label>
                  <Textarea
                    id="aboutTeaching"
                    value={profileData.aboutTeaching}
                    onChange={(e) => setProfileData(prev => ({ ...prev, aboutTeaching: e.target.value }))}
                    disabled={!isEditing}
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Specializations</Label>
                  <div className="flex flex-wrap gap-2">
                    {profileData.specializations.map((spec, index) => (
                      <Badge key={index} variant="outline">{spec}</Badge>
                    ))}
                  </div>
                </div>

                {isEditing && (
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSaveProfile}>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Qualifications Tab */}
      {activeTab === 'qualifications' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Education & Certifications */}
          <Card>
            <CardHeader>
              <CardTitle>Education & Certifications</CardTitle>
              <CardDescription>Your academic qualifications and certifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {qualifications.map((qual) => (
                <div key={qual.id} className="p-4 border rounded-lg space-y-2">
                  <h4 className="font-medium">{qual.degree}</h4>
                  <p className="text-sm text-muted-foreground">{qual.institution}</p>
                  <div className="flex justify-between items-center">
                    <Badge variant="outline">{qual.field}</Badge>
                    <span className="text-sm text-muted-foreground">{qual.year}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Language Skills */}
          <Card>
            <CardHeader>
              <CardTitle>Language Skills</CardTitle>
              <CardDescription>Languages you can teach and your proficiency levels</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {languageSkills.map((skill, index) => (
                <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Languages className="h-5 w-5 text-primary" />
                    <div>
                      <h4 className="font-medium">{skill.language}</h4>
                      <p className="text-sm text-muted-foreground">{skill.level}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {skill.certified && (
                      <Badge variant="secondary" className="text-xs">
                        <Award className="h-3 w-3 mr-1" />
                        Certified
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Availability Tab */}
      {activeTab === 'availability' && (
        <Card>
          <CardHeader>
            <CardTitle>Teaching Availability</CardTitle>
            <CardDescription>Set your available hours for teaching sessions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {availability.map((schedule, index) => (
                <div key={schedule.day} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <Switch
                      checked={schedule.enabled}
                      onCheckedChange={(checked) => updateAvailability(index, 'enabled', checked)}
                    />
                    <div className="min-w-[100px]">
                      <Label className="font-medium">{schedule.day}</Label>
                    </div>
                  </div>
                  {schedule.enabled && (
                    <div className="flex items-center space-x-2">
                      <Input
                        type="time"
                        value={schedule.startTime}
                        onChange={(e) => updateAvailability(index, 'startTime', e.target.value)}
                        className="w-32"
                      />
                      <span className="text-muted-foreground">to</span>
                      <Input
                        type="time"
                        value={schedule.endTime}
                        onChange={(e) => updateAvailability(index, 'endTime', e.target.value)}
                        className="w-32"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-6 flex justify-end">
              <Button>
                <Save className="h-4 w-4 mr-2" />
                Save Availability
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="h-5 w-5" />
                <span>Notifications</span>
              </CardTitle>
              <CardDescription>Configure your notification preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(settings).filter(([key]) => key.includes('Notifications') || key.includes('Messages') || key.includes('Reports') || key.includes('Emails')).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="capitalize">
                      {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                    </Label>
                  </div>
                  <Switch
                    checked={value}
                    onCheckedChange={(checked) =>
                      setSettings(prev => ({ ...prev, [key]: checked }))
                    }
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Privacy Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Privacy & Visibility</span>
              </CardTitle>
              <CardDescription>Control your profile visibility and privacy settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(settings).filter(([key]) => !key.includes('Notifications') && !key.includes('Messages') && !key.includes('Reports') && !key.includes('Emails')).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="capitalize">
                      {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                    </Label>
                  </div>
                  <Switch
                    checked={value}
                    onCheckedChange={(checked) =>
                      setSettings(prev => ({ ...prev, [key]: checked }))
                    }
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

export default TeacherProfile