import { NavLink, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/contexts/AuthContext'
import { useIsMobile } from '@/hooks/use-mobile'
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
  ClipboardList,
  GraduationCap,
  MessageSquare,
  Bell,
  HelpCircle,
  LogOut,
  ChevronDown,
  ChevronRight
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
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarTrigger,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useState } from 'react'

interface SidebarProps {
  userRole?: 'student' | 'teacher' | 'admin'
  className?: string
}

interface MenuItem {
  title: string
  url: string
  icon: any
  badge?: string | number
  subItems?: MenuItem[]
}

export function Sidebar({ userRole, className }: SidebarProps) {
  const { t } = useTranslation()
  const { user, logout } = useAuth()
  const { state } = useSidebar()
  const isMobile = useIsMobile()
  const collapsed = state === 'collapsed'
  const location = useLocation()
  const currentPath = location.pathname
  const [expandedGroups, setExpandedGroups] = useState<string[]>(['main'])

  // Use userRole prop or derive from user context
  const role = userRole || user?.role || 'student'

  const getUserInitials = (name: string) => {
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2)
  }

  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev => 
      prev.includes(groupId) 
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    )
  }

  // Define menu items based on role
  const getMenuItems = (): { [key: string]: MenuItem[] } => {
    switch (role) {
      case 'admin':
        return {
          main: [
            { title: t('nav.dashboard'), url: '/admin/dashboard', icon: Home },
            { title: t('nav.users'), url: '/admin/users', icon: Users, badge: '12' },
            { title: t('nav.programs'), url: '/admin/programs', icon: BookOpen },
            { title: t('nav.languages'), url: '/admin/languages', icon: Globe },
          ],
          management: [
            { title: t('nav.teachers'), url: '/admin/teachers', icon: UserCheck },
            { title: t('nav.enrollments'), url: '/admin/enrollments', icon: GraduationCap, badge: '5' },
            { title: t('nav.reports'), url: '/admin/reports', icon: BarChart3 },
          ],
          system: [
            { title: t('nav.settings'), url: '/admin/settings', icon: Settings },
            { title: t('nav.notifications'), url: '/admin/notifications', icon: Bell },
            { title: t('nav.help'), url: '/admin/help', icon: HelpCircle },
          ]
        }
      
      case 'teacher':
        return {
          main: [
            { title: t('nav.dashboard'), url: '/teacher/dashboard', icon: Home },
            { 
              title: t('nav.content'), 
              url: '/teacher/content', 
              icon: BookOpen,
              subItems: [
                { title: t('nav.quizzes'), url: '/teacher/quizzes', icon: ClipboardList },
                { title: t('nav.meetings'), url: '/teacher/meetings', icon: Calendar },
              ]
            },
            { title: t('nav.students'), url: '/teacher/students', icon: Users },
            { title: t('nav.results'), url: '/teacher/results', icon: Trophy },
          ],
          tools: [
            { title: t('nav.messages'), url: '/teacher/messages', icon: MessageSquare, badge: '3' },
            { title: t('nav.help'), url: '/teacher/help', icon: HelpCircle },
          ]
        }
      
      case 'student':
      default:
        return {
          main: [
            { title: t('nav.dashboard'), url: '/dashboard', icon: Home },
            { title: t('nav.programs'), url: '/student/programs', icon: BookOpen },
            { title: t('nav.quizzes'), url: '/student/quizzes', icon: ClipboardList, badge: '2' },
            { title: t('nav.meetings'), url: '/student/meetings', icon: Video },
          ],
          progress: [
            { title: t('nav.achievements'), url: '/student/achievements', icon: Trophy },
            { title: t('nav.progress'), url: '/student/progress', icon: BarChart3 },
          ],
          support: [
            { title: t('nav.help'), url: '/student/help', icon: HelpCircle },
          ]
        }
    }
  }

  const menuGroups = getMenuItems()

  const isActive = (path: string) => {
    if (path === currentPath) return true
    // Check if current path starts with the menu item path (for sub-routes)
    return currentPath.startsWith(path) && path !== '/'
  }

  const renderMenuItem = (item: MenuItem) => {
    const hasSubItems = item.subItems && item.subItems.length > 0
    const isItemActive = isActive(item.url)
    const isExpanded = expandedGroups.includes(item.url)

    if (hasSubItems) {
      return (
        <Collapsible key={item.title} open={isExpanded} onOpenChange={() => toggleGroup(item.url)}>
          <SidebarMenuItem>
            <CollapsibleTrigger asChild>
              <SidebarMenuButton
                isActive={isItemActive}
                className="w-full justify-between"
                tooltip={collapsed ? item.title : undefined}
              >
                <div className="flex items-center gap-2">
                  <item.icon className="h-4 w-4" />
                  {!collapsed && <span>{item.title}</span>}
                </div>
                {!collapsed && (
                  <ChevronRight className={cn(
                    "h-4 w-4 transition-transform",
                    isExpanded && "rotate-90"
                  )} />
                )}
              </SidebarMenuButton>
            </CollapsibleTrigger>
            {!collapsed && (
              <CollapsibleContent>
                <SidebarMenuSub>
                  {item.subItems?.map((subItem) => (
                    <SidebarMenuSubItem key={subItem.title}>
                      <SidebarMenuSubButton asChild isActive={isActive(subItem.url)}>
                        <NavLink to={subItem.url}>
                          <subItem.icon className="h-4 w-4" />
                          <span>{subItem.title}</span>
                          {subItem.badge && (
                            <Badge variant="secondary" className="ml-auto">
                              {subItem.badge}
                            </Badge>
                          )}
                        </NavLink>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  ))}
                </SidebarMenuSub>
              </CollapsibleContent>
            )}
          </SidebarMenuItem>
        </Collapsible>
      )
    }

    return (
      <SidebarMenuItem key={item.title}>
        <SidebarMenuButton 
          asChild 
          isActive={isItemActive}
          tooltip={collapsed ? item.title : undefined}
        >
          <NavLink 
            to={item.url} 
            className="flex items-center justify-between w-full"
            aria-current={isItemActive ? 'page' : undefined}
          >
            <div className="flex items-center gap-2">
              <item.icon className="h-4 w-4" aria-hidden="true" />
              {!collapsed && <span>{item.title}</span>}
            </div>
            {!collapsed && item.badge && (
              <Badge variant="secondary" aria-label={`${item.badge} notifications`}>
                {item.badge}
              </Badge>
            )}
          </NavLink>
        </SidebarMenuButton>
      </SidebarMenuItem>
    )
  }

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return (
    <SidebarRoot 
      className={cn(className)} 
      variant="sidebar" 
      collapsible="icon"
      role="navigation"
      aria-label={`${role} dashboard navigation`}
    >
      {/* Header */}
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-3 px-2 py-2">
          {!collapsed && (
            <>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary">
                <span className="text-sm font-bold text-primary-foreground">LA</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold">Learn Academy</span>
                <span className="text-xs text-muted-foreground capitalize">
                  {role} Panel
                </span>
              </div>
            </>
          )}
          <SidebarTrigger className="ml-auto" />
        </div>
      </SidebarHeader>

      {/* Content */}
      <SidebarContent>
        {Object.entries(menuGroups).map(([groupKey, items]) => (
          <SidebarGroup key={groupKey}>
            {!collapsed && (
              <SidebarGroupLabel className="capitalize">
                {t(`nav.${groupKey}`) || groupKey}
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu>
                {items.map(renderMenuItem)}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="border-t border-sidebar-border">
        {user && (
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <NavLink to="/profile" className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-gradient-primary text-primary-foreground text-xs">
                      {getUserInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  {!collapsed && (
                    <div className="flex flex-col flex-1 min-w-0">
                      <span className="text-sm font-medium truncate">{user.name}</span>
                      <span className="text-xs text-muted-foreground truncate">{user.email}</span>
                    </div>
                  )}
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton 
                onClick={handleLogout}
                tooltip={collapsed ? t('nav.logout') : undefined}
              >
                <LogOut className="h-4 w-4" />
                {!collapsed && <span>{t('nav.logout')}</span>}
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        )}
      </SidebarFooter>
    </SidebarRoot>
  )
}