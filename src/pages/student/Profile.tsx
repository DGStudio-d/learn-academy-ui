import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
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
  Trophy,
  Clock,
  BookOpen,
  Star,
  Save,
  Shield,
  Bell,
  Eye,
  Users
} from 'lucide-react'

interface ProfileStats {
  coursesCompleted: number
  totalStudyHours: number
  currentStreak: number
  averageScore: number
  certificates: number
  rank: string
}

interface NotificationSettings {
  emailNotifications: boolean
  pushNotifications: boolean
  weeklyProgress: boolean
  courseUpdates: boolean
  meetingReminders: boolean
}

interface PrivacySettings {
  profileVisibility: 'public' | 'friends' | 'private'
  showProgress: boolean
  showAchievements: boolean
  allowMessages: boolean
}

const StudentProfile: React.FC = () => {
  const { user } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [activeTab, setActiveTab] = useState<'profile' | 'stats' | 'settings'>('profile')
  
  // Mock profile data
  const [profileData, setProfileData] = useState({
    name: user?.name || 'John Doe',
    email: user?.email || 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    bio: 'Passionate language learner exploring multiple languages and cultures.',
    location: 'New York, USA',
    timezone: 'UTC-5',
    preferredLanguage: 'English',
    learningGoals: 'Achieve fluency in Spanish and French by the end of the year.',
    interests: ['Travel', 'Culture', 'Business Communication', 'Literature'],
    profileImage: '/api/placeholder/150/150'
  })

  const [stats] = useState<ProfileStats>({
    coursesCompleted: 8,
    totalStudyHours: 245,
    currentStreak: 12,
    averageScore: 87.5,
    certificates: 3,
    rank: 'Advanced Learner'
  })

  const [notifications, setNotifications] = useState<NotificationSettings>({
    emailNotifications: true,
    pushNotifications: true,
    weeklyProgress: true,
    courseUpdates: false,
    meetingReminders: true
  })

  const [privacy, setPrivacy] = useState<PrivacySettings>({
    profileVisibility: 'public',
    showProgress: true,
    showAchievements: true,
    allowMessages: true
  })

  const [achievements] = useState([
    { id: 1, title: 'First Course Completed', description: 'Complete your first language course', earned: true, date: '2024-01-15' },
    { id: 2, title: 'Week Warrior', description: 'Study for 7 consecutive days', earned: true, date: '2024-02-01' },
    { id: 3, title: 'Quiz Master', description: 'Score 90%+ on 10 quizzes', earned: true, date: '2024-02-20' },
    { id: 4, title: 'Social Learner', description: 'Join 5 study sessions', earned: false, date: null },
    { id: 5, title: 'Language Expert', description: 'Complete advanced level course', earned: false, date: null }
  ])

  const handleSaveProfile = () => {
    // Here you would typically send the data to the API
    console.log('Saving profile:', profileData)
    setIsEditing(false)
    // Show success toast
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
          <h1 className="text-3xl font-bold">Profile</h1>
          <p className="text-muted-foreground">Manage your account settings and learning preferences</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-4 border-b">
        {[
          { key: 'profile', label: 'Profile', icon: User },
          { key: 'stats', label: 'Statistics', icon: Trophy },
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
                <p className="text-muted-foreground">{stats.rank}</p>
                <Badge variant="secondary" className="mt-2">
                  {stats.certificates} Certificates
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Profile Details */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your personal details and preferences</CardDescription>
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
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={profileData.bio}
                  onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                  disabled={!isEditing}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="goals">Learning Goals</Label>
                <Textarea
                  id="goals"
                  value={profileData.learningGoals}
                  onChange={(e) => setProfileData(prev => ({ ...prev, learningGoals: e.target.value }))}
                  disabled={!isEditing}
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label>Interests</Label>
                <div className="flex flex-wrap gap-2">
                  {profileData.interests.map((interest, index) => (
                    <Badge key={index} variant="outline">{interest}</Badge>
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
      )}

      {/* Statistics Tab */}
      {activeTab === 'stats' && (
        <div className="space-y-6">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon={BookOpen}
              title="Courses Completed"
              value={stats.coursesCompleted}
            />
            <StatCard
              icon={Clock}
              title="Study Hours"
              value={stats.totalStudyHours}
            />
            <StatCard
              icon={Star}
              title="Current Streak"
              value={`${stats.currentStreak} days`}
            />
            <StatCard
              icon={Trophy}
              title="Average Score"
              value={`${stats.averageScore}%`}
            />
          </div>

          {/* Progress and Achievements */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Learning Progress */}
            <Card>
              <CardHeader>
                <CardTitle>Learning Progress</CardTitle>
                <CardDescription>Your progress across different languages</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { language: 'Spanish', progress: 85, level: 'Intermediate' },
                  { language: 'French', progress: 65, level: 'Elementary' },
                  { language: 'German', progress: 30, level: 'Beginner' }
                ].map((course) => (
                  <div key={course.language} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{course.language}</span>
                      <span className="text-muted-foreground">{course.level}</span>
                    </div>
                    <Progress value={course.progress} className="h-2" />
                    <div className="text-xs text-muted-foreground text-right">
                      {course.progress}% complete
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Achievements */}
            <Card>
              <CardHeader>
                <CardTitle>Achievements</CardTitle>
                <CardDescription>Your learning milestones and badges</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {achievements.map((achievement) => (
                  <div key={achievement.id} className="flex items-start space-x-3">
                    <div className={`p-2 rounded-full ${
                      achievement.earned ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                    }`}>
                      <Trophy className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <h4 className={`font-medium ${!achievement.earned && 'text-muted-foreground'}`}>
                        {achievement.title}
                      </h4>
                      <p className="text-sm text-muted-foreground">{achievement.description}</p>
                      {achievement.earned && achievement.date && (
                        <p className="text-xs text-primary">Earned on {achievement.date}</p>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
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
              {Object.entries(notifications).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="capitalize">
                      {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                    </Label>
                  </div>
                  <Switch
                    checked={value}
                    onCheckedChange={(checked) =>
                      setNotifications(prev => ({ ...prev, [key]: checked }))
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
                <span>Privacy</span>
              </CardTitle>
              <CardDescription>Control your privacy and visibility settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="visibility">Profile Visibility</Label>
                <Select
                  value={privacy.profileVisibility}
                  onValueChange={(value: any) =>
                    setPrivacy(prev => ({ ...prev, profileVisibility: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">
                      <div className="flex items-center space-x-2">
                        <Globe className="h-4 w-4" />
                        <span>Public</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="friends">
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4" />
                        <span>Friends Only</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="private">
                      <div className="flex items-center space-x-2">
                        <Eye className="h-4 w-4" />
                        <span>Private</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              {['showProgress', 'showAchievements', 'allowMessages'].map((key) => (
                <div key={key} className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="capitalize">
                      {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                    </Label>
                  </div>
                  <Switch
                    checked={privacy[key as keyof PrivacySettings] as boolean}
                    onCheckedChange={(checked) =>
                      setPrivacy(prev => ({ ...prev, [key]: checked }))
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

export default StudentProfile