import { useLocation, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/contexts/AuthContext'
import { ChevronRight, Home } from 'lucide-react'
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { cn } from '@/lib/utils'

interface BreadcrumbNavProps {
  className?: string
  showHome?: boolean
  maxItems?: number
}

interface BreadcrumbSegment {
  label: string
  href?: string
  isCurrentPage?: boolean
}

export function BreadcrumbNav({ 
  className, 
  showHome = true, 
  maxItems = 5 
}: BreadcrumbNavProps) {
  const location = useLocation()
  const { t } = useTranslation()
  const { user } = useAuth()

  // Route label mappings
  const routeLabels: Record<string, string> = {
    // Public routes
    '': t('nav.home'),
    'languages': t('nav.languages'),
    'teachers': t('nav.teachers'),
    'programs': t('nav.programs'),
    'quizzes': t('nav.quizzes'),
    'about': t('nav.about'),
    'contact': t('nav.contact'),
    'login': t('nav.login'),
    'register': t('nav.register'),
    'profile': t('nav.profile'),
    
    // Admin routes
    'admin': t('nav.admin'),
    'dashboard': t('nav.dashboard'),
    'users': t('nav.users'),
    'settings': t('nav.settings'),
    'reports': t('nav.reports'),
    'enrollments': t('nav.enrollments'),
    'notifications': t('nav.notifications'),
    'help': t('nav.help'),
    
    // Teacher routes
    'teacher': t('nav.teacher'),
    'content': t('nav.content'),
    'students': t('nav.students'),
    'meetings': t('nav.meetings'),
    'results': t('nav.results'),
    'messages': t('nav.messages'),
    
    // Student routes
    'student': t('nav.student'),
    'achievements': t('nav.achievements'),
    'progress': t('nav.progress'),
    
    // Common
    'quiz': t('nav.quiz'),
    'meeting': t('nav.meeting'),
    'program': t('nav.program'),
    'user': t('nav.user'),
    'language': t('nav.language'),
  }

  // Get role-specific home route
  const getHomeRoute = () => {
    if (!user) return '/'
    
    switch (user.role) {
      case 'admin':
        return '/admin/dashboard'
      case 'teacher':
        return '/teacher/dashboard'
      case 'student':
        return '/dashboard'
      default:
        return '/'
    }
  }

  // Generate breadcrumb segments from current path
  const generateBreadcrumbs = (): BreadcrumbSegment[] => {
    const pathSegments = location.pathname.split('/').filter(Boolean)
    const breadcrumbs: BreadcrumbSegment[] = []

    // Add home breadcrumb if requested
    if (showHome && pathSegments.length > 0) {
      breadcrumbs.push({
        label: t('nav.home'),
        href: getHomeRoute(),
      })
    }

    // Build breadcrumbs from path segments
    let currentPath = ''
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`
      const isLast = index === pathSegments.length - 1
      
      // Get label for segment
      let label = routeLabels[segment] || segment

      // Handle dynamic segments (IDs, etc.)
      if (/^\d+$/.test(segment)) {
        // This is likely an ID, use the previous segment's context
        const prevSegment = pathSegments[index - 1]
        if (prevSegment) {
          label = `${routeLabels[prevSegment] || prevSegment} #${segment}`
        } else {
          label = `#${segment}`
        }
      }

      // Capitalize first letter if no translation found
      if (label === segment) {
        label = segment.charAt(0).toUpperCase() + segment.slice(1)
      }

      breadcrumbs.push({
        label,
        href: isLast ? undefined : currentPath,
        isCurrentPage: isLast,
      })
    })

    // Limit breadcrumbs if maxItems is set
    if (breadcrumbs.length > maxItems) {
      const start = breadcrumbs.slice(0, 1) // Keep home
      const end = breadcrumbs.slice(-2) // Keep last 2 items
      return [
        ...start,
        { label: '...', href: undefined },
        ...end,
      ]
    }

    return breadcrumbs
  }

  const breadcrumbs = generateBreadcrumbs()

  // Don't render if we're on the home page and only have one item
  if (breadcrumbs.length <= 1 && location.pathname === getHomeRoute()) {
    return null
  }

  return (
    <Breadcrumb className={cn('mb-4', className)}>
      <BreadcrumbList>
        {breadcrumbs.map((crumb, index) => (
          <div key={index} className="flex items-center">
            <BreadcrumbItem>
              {crumb.href ? (
                <BreadcrumbLink asChild>
                  <Link 
                    to={crumb.href}
                    className="flex items-center gap-1 hover:text-foreground transition-colors"
                  >
                    {index === 0 && showHome && (
                      <Home className="h-4 w-4" />
                    )}
                    <span>{crumb.label}</span>
                  </Link>
                </BreadcrumbLink>
              ) : crumb.label === '...' ? (
                <span className="text-muted-foreground">...</span>
              ) : (
                <BreadcrumbPage className="flex items-center gap-1">
                  {index === 0 && showHome && (
                    <Home className="h-4 w-4" />
                  )}
                  <span>{crumb.label}</span>
                </BreadcrumbPage>
              )}
            </BreadcrumbItem>
            
            {index < breadcrumbs.length - 1 && (
              <BreadcrumbSeparator>
                <ChevronRight className="h-4 w-4" />
              </BreadcrumbSeparator>
            )}
          </div>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  )
}