import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/contexts/AuthContext'
import { useIsMobile } from '@/hooks/use-mobile'
import {
  Menu,
  X,
  Home,
  BookOpen,
  Users,
  Settings,
  User,
  LogOut,
  Bell,
  Search,
  ChevronRight,
  ChevronDown,
} from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { cn } from '@/lib/utils'

interface MobileNavProps {
  className?: string
}

interface NavItem {
  title: string
  href: string
  icon: any
  badge?: string | number
  children?: NavItem[]
}

export function MobileNav({ className }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedItems, setExpandedItems] = useState<string[]>([])
  const { t } = useTranslation()
  const { user, isAuthenticated, logout } = useAuth()
  const isMobile = useIsMobile()
  const location = useLocation()
  const navigate = useNavigate()

  // Close menu when route changes
  useEffect(() => {
    setIsOpen(false)
  }, [location.pathname])

  // Don't render on desktop
  if (!isMobile) {
    return null
  }

  const getUserInitials = (name: string) => {
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2)
  }

  const toggleExpanded = (title: string) => {
    setExpandedItems(prev =>
      prev.includes(title)
        ? prev.filter(item => item !== title)
        : [...prev, title]
    )
  }

  // Get navigation items based on user role
  const getNavItems = (): NavItem[] => {
    if (!isAuthenticated || !user) {
      return [
        { title: t('nav.home'), href: '/', icon: Home },
        { title: t('nav.languages'), href: '/languages', icon: BookOpen },
        { title: t('nav.teachers'), href: '/teachers', icon: Users },
        { title: t('nav.programs'), href: '/programs', icon: BookOpen },
        { title: t('nav.quizzes'), href: '/quizzes', icon: BookOpen },
        { title: t('nav.about'), href: '/about', icon: BookOpen },
      ]
    }

    switch (user.role) {
      case 'admin':
        return [
          { title: t('nav.dashboard'), href: '/admin/dashboard', icon: Home },
          {
            title: t('nav.management'),
            href: '#',
            icon: Settings,
            children: [
              { title: t('nav.users'), href: '/admin/users', icon: Users, badge: '12' },
              { title: t('nav.programs'), href: '/admin/programs', icon: BookOpen },
              { title: t('nav.languages'), href: '/admin/languages', icon: BookOpen },
              { title: t('nav.teachers'), href: '/admin/teachers', icon: Users },
              { title: t('nav.enrollments'), href: '/admin/enrollments', icon: BookOpen, badge: '5' },
            ]
          },
          { title: t('nav.reports'), href: '/admin/reports', icon: BookOpen },
          { title: t('nav.settings'), href: '/admin/settings', icon: Settings },
          { title: t('nav.notifications'), href: '/admin/notifications', icon: Bell },
        ]

      case 'teacher':
        return [
          { title: t('nav.dashboard'), href: '/teacher/dashboard', icon: Home },
          {
            title: t('nav.content'),
            href: '#',
            icon: BookOpen,
            children: [
              { title: t('nav.quizzes'), href: '/teacher/quizzes', icon: BookOpen },
              { title: t('nav.meetings'), href: '/teacher/meetings', icon: BookOpen },
            ]
          },
          { title: t('nav.students'), href: '/teacher/students', icon: Users },
          { title: t('nav.results'), href: '/teacher/results', icon: BookOpen },
          { title: t('nav.messages'), href: '/teacher/messages', icon: BookOpen, badge: '3' },
        ]

      case 'student':
      default:
        return [
          { title: t('nav.dashboard'), href: '/dashboard', icon: Home },
          { title: t('nav.programs'), href: '/student/programs', icon: BookOpen },
          { title: t('nav.quizzes'), href: '/student/quizzes', icon: BookOpen, badge: '2' },
          { title: t('nav.meetings'), href: '/student/meetings', icon: BookOpen },
          { title: t('nav.achievements'), href: '/student/achievements', icon: BookOpen },
          { title: t('nav.progress'), href: '/student/progress', icon: BookOpen },
        ]
    }
  }

  const navItems = getNavItems()

  // Filter items based on search query
  const filteredItems = navItems.filter(item => {
    if (!searchQuery) return true
    
    const matchesTitle = item.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesChildren = item.children?.some(child =>
      child.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
    
    return matchesTitle || matchesChildren
  })

  const handleLogout = async () => {
    try {
      await logout()
      setIsOpen(false)
      navigate('/login')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const isActive = (href: string) => {
    if (href === '#') return false
    return location.pathname === href || location.pathname.startsWith(href + '/')
  }

  const renderNavItem = (item: NavItem, level = 0) => {
    const hasChildren = item.children && item.children.length > 0
    const isExpanded = expandedItems.includes(item.title)
    const itemIsActive = isActive(item.href)

    if (hasChildren) {
      return (
        <Collapsible key={item.title} open={isExpanded} onOpenChange={() => toggleExpanded(item.title)}>
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                'w-full justify-between h-12 px-4',
                level > 0 && 'ml-4 w-[calc(100%-1rem)]',
                itemIsActive && 'bg-primary/10 text-primary'
              )}
            >
              <div className="flex items-center gap-3">
                <item.icon className="h-5 w-5" />
                <span className="font-medium">{item.title}</span>
                {item.badge && (
                  <Badge variant="secondary" className="ml-auto">
                    {item.badge}
                  </Badge>
                )}
              </div>
              <ChevronDown className={cn(
                'h-4 w-4 transition-transform',
                isExpanded && 'rotate-180'
              )} />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-1">
            {item.children?.map(child => renderNavItem(child, level + 1))}
          </CollapsibleContent>
        </Collapsible>
      )
    }

    return (
      <Button
        key={item.title}
        variant="ghost"
        asChild
        className={cn(
          'w-full justify-start h-12 px-4',
          level > 0 && 'ml-4 w-[calc(100%-1rem)]',
          itemIsActive && 'bg-primary/10 text-primary font-medium'
        )}
      >
        <Link to={item.href} className="flex items-center gap-3">
          <item.icon className="h-5 w-5" />
          <span>{item.title}</span>
          {item.badge && (
            <Badge variant="secondary" className="ml-auto">
              {item.badge}
            </Badge>
          )}
          {level === 0 && <ChevronRight className="h-4 w-4 ml-auto" />}
        </Link>
      </Button>
    )
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn('lg:hidden', className)}
          aria-label="Open navigation menu"
        >
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      
      <SheetContent side="left" className="w-[300px] p-0">
        <div className="flex flex-col h-full">
          {/* Header */}
          <SheetHeader className="p-6 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-primary">
                <span className="text-lg font-bold text-primary-foreground">LA</span>
              </div>
              <div className="flex flex-col">
                <SheetTitle className="text-left">Learn Academy</SheetTitle>
                {user && (
                  <span className="text-sm text-muted-foreground capitalize">
                    {user.role} Panel
                  </span>
                )}
              </div>
            </div>
          </SheetHeader>

          {/* Search */}
          <div className="px-6 pb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('nav.search')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Navigation */}
          <ScrollArea className="flex-1 px-6">
            <div className="space-y-1 pb-4">
              {filteredItems.map(item => renderNavItem(item))}
            </div>
          </ScrollArea>

          {/* User Section */}
          {isAuthenticated && user && (
            <>
              <Separator />
              <div className="p-6 space-y-4">
                {/* User Info */}
                <Button variant="ghost" asChild className="w-full justify-start h-auto p-3">
                  <Link to="/profile" className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-gradient-primary text-primary-foreground">
                        {getUserInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col items-start">
                      <span className="font-medium">{user.name}</span>
                      <span className="text-sm text-muted-foreground">{user.email}</span>
                    </div>
                  </Link>
                </Button>

                {/* Quick Actions */}
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" asChild className="flex-1">
                    <Link to="/profile">
                      <User className="h-4 w-4 mr-2" />
                      {t('nav.profile')}
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleLogout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    {t('nav.logout')}
                  </Button>
                </div>
              </div>
            </>
          )}

          {/* Auth Buttons for Guests */}
          {!isAuthenticated && (
            <>
              <Separator />
              <div className="p-6 space-y-3">
                <Button asChild className="w-full">
                  <Link to="/login">{t('nav.login')}</Link>
                </Button>
                <Button variant="outline" asChild className="w-full">
                  <Link to="/register">{t('nav.register')}</Link>
                </Button>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}