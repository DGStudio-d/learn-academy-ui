import { NavLink, useLocation } from 'react-router-dom'
import {
  BookOpen,
  Calendar,
  BarChart3,
  Users,
  Settings,
  Home,
  FileText,
  Video,
  User,
  Globe,
  UserCheck,
  Trophy,
  ClipboardList
} from 'lucide-react'
import {
  Sidebar as SidebarRoot,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar'

interface SidebarProps {
  userRole: 'student' | 'teacher' | 'admin'
}

const studentMenuItems = [
  { title: 'Dashboard', url: '/student/dashboard', icon: Home },
  { title: 'Programs', url: '/student/programs', icon: BookOpen },
  { title: 'Quizzes', url: '/student/quizzes', icon: ClipboardList },
  { title: 'Meetings', url: '/student/meetings', icon: Video },
  { title: 'Profile', url: '/student/profile', icon: User },
]

const teacherMenuItems = [
  { title: 'Dashboard', url: '/teacher/dashboard', icon: Home },
  { title: 'Quizzes', url: '/teacher/quizzes', icon: FileText },
  { title: 'Meetings', url: '/teacher/meetings', icon: Calendar },
  { title: 'Results', url: '/teacher/results', icon: Trophy },
  { title: 'Profile', url: '/teacher/profile', icon: User },
]

const adminMenuItems = [
  { title: 'Dashboard', url: '/admin/dashboard', icon: Home },
  { title: 'Users', url: '/admin/users', icon: Users },
  { title: 'Languages', url: '/admin/languages', icon: Globe },
  { title: 'Programs', url: '/admin/programs', icon: BookOpen },
  { title: 'Teachers', url: '/admin/teachers', icon: UserCheck },
  { title: 'Reports', url: '/admin/reports', icon: BarChart3 },
  { title: 'Settings', url: '/admin/settings', icon: Settings },
]

export function Sidebar({ userRole }: SidebarProps) {
  const { state } = useSidebar()
  const collapsed = state === 'collapsed'
  const location = useLocation()
  const currentPath = location.pathname

  const menuItems = {
    student: studentMenuItems,
    teacher: teacherMenuItems,
    admin: adminMenuItems,
  }[userRole]

  const isActive = (path: string) => currentPath === path
  const getNavClass = ({ isActive }: { isActive: boolean }) =>
    isActive 
      ? 'bg-primary text-primary-foreground font-medium' 
      : 'hover:bg-muted/50 text-muted-foreground hover:text-foreground'

  return (
    <SidebarRoot className={collapsed ? 'w-14' : 'w-60'} variant="sidebar" collapsible="icon">
      <SidebarTrigger className="m-2 self-end" />
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className={collapsed ? 'sr-only' : ''}>
            {userRole.charAt(0).toUpperCase() + userRole.slice(1)} Panel
          </SidebarGroupLabel>
          
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end className={getNavClass}>
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </SidebarRoot>
  )
}