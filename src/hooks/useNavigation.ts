import { useState, useEffect, useCallback } from 'react'
import { useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useIsMobile } from './use-mobile'

interface NavigationState {
  isMobileMenuOpen: boolean
  isSidebarCollapsed: boolean
  activeRoute: string
  breadcrumbs: BreadcrumbItem[]
}

interface BreadcrumbItem {
  label: string
  href?: string
  isActive?: boolean
}

interface UseNavigationReturn extends NavigationState {
  toggleMobileMenu: () => void
  closeMobileMenu: () => void
  toggleSidebar: () => void
  setSidebarCollapsed: (collapsed: boolean) => void
  getNavigationItems: () => NavigationItem[]
  isRouteActive: (route: string) => boolean
}

interface NavigationItem {
  label: string
  href: string
  icon?: any
  badge?: string | number
  children?: NavigationItem[]
  roles?: string[]
}

export function useNavigation(): UseNavigationReturn {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const location = useLocation()
  const { user, isAuthenticated } = useAuth()
  const isMobile = useIsMobile()

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [location.pathname])

  // Auto-collapse sidebar on mobile
  useEffect(() => {
    if (isMobile) {
      setIsSidebarCollapsed(true)
    }
  }, [isMobile])

  // Handle escape key for mobile menu
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileMenuOpen) {
        setIsMobileMenuOpen(false)
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isMobileMenuOpen])

  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(prev => !prev)
  }, [])

  const closeMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false)
  }, [])

  const toggleSidebar = useCallback(() => {
    setIsSidebarCollapsed(prev => !prev)
  }, [])

  const setSidebarCollapsed = useCallback((collapsed: boolean) => {
    setIsSidebarCollapsed(collapsed)
  }, [])

  const isRouteActive = useCallback((route: string) => {
    if (route === location.pathname) return true
    if (route !== '/' && location.pathname.startsWith(route)) return true
    return false
  }, [location.pathname])

  // Generate navigation items based on user role
  const getNavigationItems = useCallback((): NavigationItem[] => {
    if (!isAuthenticated || !user) {
      return [
        { label: 'Home', href: '/' },
        { label: 'Languages', href: '/languages' },
        { label: 'Teachers', href: '/teachers' },
        { label: 'Programs', href: '/programs' },
        { label: 'Quizzes', href: '/quizzes' },
        { label: 'About', href: '/about' },
      ]
    }

    const baseItems = [
      { label: 'Profile', href: '/profile', roles: ['admin', 'teacher', 'student'] },
    ]

    switch (user.role) {
      case 'admin':
        return [
          { label: 'Dashboard', href: '/admin/dashboard' },
          { label: 'Users', href: '/admin/users', badge: '12' },
          { label: 'Programs', href: '/admin/programs' },
          { label: 'Languages', href: '/admin/languages' },
          { label: 'Teachers', href: '/admin/teachers' },
          { label: 'Enrollments', href: '/admin/enrollments', badge: '5' },
          { label: 'Reports', href: '/admin/reports' },
          { label: 'Settings', href: '/admin/settings' },
          ...baseItems,
        ]

      case 'teacher':
        return [
          { label: 'Dashboard', href: '/teacher/dashboard' },
          {
            label: 'Content',
            href: '/teacher/content',
            children: [
              { label: 'Quizzes', href: '/teacher/quizzes' },
              { label: 'Meetings', href: '/teacher/meetings' },
            ]
          },
          { label: 'Students', href: '/teacher/students' },
          { label: 'Results', href: '/teacher/results' },
          { label: 'Messages', href: '/teacher/messages', badge: '3' },
          ...baseItems,
        ]

      case 'student':
      default:
        return [
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Programs', href: '/student/programs' },
          { label: 'Quizzes', href: '/student/quizzes', badge: '2' },
          { label: 'Meetings', href: '/student/meetings' },
          { label: 'Achievements', href: '/student/achievements' },
          { label: 'Progress', href: '/student/progress' },
          ...baseItems,
        ]
    }
  }, [isAuthenticated, user])

  // Generate breadcrumbs from current path
  const generateBreadcrumbs = useCallback((): BreadcrumbItem[] => {
    const pathSegments = location.pathname.split('/').filter(Boolean)
    const breadcrumbs: BreadcrumbItem[] = []

    // Add home if not on home page
    if (pathSegments.length > 0) {
      const homeRoute = user?.role === 'admin' ? '/admin/dashboard' 
        : user?.role === 'teacher' ? '/teacher/dashboard'
        : user?.role === 'student' ? '/dashboard'
        : '/'
      
      breadcrumbs.push({
        label: 'Home',
        href: homeRoute,
      })
    }

    // Build breadcrumbs from path segments
    let currentPath = ''
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`
      const isLast = index === pathSegments.length - 1

      // Convert segment to readable label
      let label = segment.charAt(0).toUpperCase() + segment.slice(1)
      
      // Handle special cases
      if (segment === 'admin' || segment === 'teacher' || segment === 'student') {
        label = `${label} Panel`
      }

      breadcrumbs.push({
        label,
        href: isLast ? undefined : currentPath,
        isActive: isLast,
      })
    })

    return breadcrumbs
  }, [location.pathname, user])

  return {
    isMobileMenuOpen,
    isSidebarCollapsed,
    activeRoute: location.pathname,
    breadcrumbs: generateBreadcrumbs(),
    toggleMobileMenu,
    closeMobileMenu,
    toggleSidebar,
    setSidebarCollapsed,
    getNavigationItems,
    isRouteActive,
  }
}