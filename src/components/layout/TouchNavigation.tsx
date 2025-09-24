import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useIsMobile } from '@/hooks/use-mobile'
import { cn } from '@/lib/utils'
import { 
  Home, 
  BookOpen, 
  Users, 
  Settings, 
  User,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

interface TouchNavigationProps {
  className?: string
  showOnDesktop?: boolean
}

interface SwipeState {
  startX: number
  startY: number
  currentX: number
  currentY: number
  isDragging: boolean
  direction: 'left' | 'right' | 'up' | 'down' | null
}

export function TouchNavigation({ className, showOnDesktop = false }: TouchNavigationProps) {
  const [swipeState, setSwipeState] = useState<SwipeState>({
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    isDragging: false,
    direction: null,
  })
  const [showSwipeHint, setShowSwipeHint] = useState(false)
  
  const { user, isAuthenticated } = useAuth()
  const isMobile = useIsMobile()
  const navigate = useNavigate()
  const location = useLocation()
  const containerRef = useRef<HTMLDivElement>(null)

  // Don't render if not mobile and showOnDesktop is false
  if (!isMobile && !showOnDesktop) {
    return null
  }

  // Show swipe hint on first visit
  useEffect(() => {
    const hasSeenHint = localStorage.getItem('touch-nav-hint-seen')
    if (!hasSeenHint && isMobile) {
      setShowSwipeHint(true)
      const timer = setTimeout(() => {
        setShowSwipeHint(false)
        localStorage.setItem('touch-nav-hint-seen', 'true')
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [isMobile])

  // Get navigation routes based on user role
  const getNavigationRoutes = useCallback(() => {
    if (!isAuthenticated || !user) {
      return [
        { path: '/', icon: Home, label: 'Home' },
        { path: '/languages', icon: BookOpen, label: 'Languages' },
        { path: '/teachers', icon: Users, label: 'Teachers' },
        { path: '/programs', icon: BookOpen, label: 'Programs' },
      ]
    }

    switch (user.role) {
      case 'admin':
        return [
          { path: '/admin/dashboard', icon: Home, label: 'Dashboard' },
          { path: '/admin/users', icon: Users, label: 'Users' },
          { path: '/admin/programs', icon: BookOpen, label: 'Programs' },
          { path: '/admin/settings', icon: Settings, label: 'Settings' },
        ]
      
      case 'teacher':
        return [
          { path: '/teacher/dashboard', icon: Home, label: 'Dashboard' },
          { path: '/teacher/quizzes', icon: BookOpen, label: 'Quizzes' },
          { path: '/teacher/students', icon: Users, label: 'Students' },
          { path: '/teacher/profile', icon: User, label: 'Profile' },
        ]
      
      case 'student':
      default:
        return [
          { path: '/dashboard', icon: Home, label: 'Dashboard' },
          { path: '/student/programs', icon: BookOpen, label: 'Programs' },
          { path: '/student/quizzes', icon: BookOpen, label: 'Quizzes' },
          { path: '/student/profile', icon: User, label: 'Profile' },
        ]
    }
  }, [isAuthenticated, user])

  const routes = getNavigationRoutes()
  const currentIndex = routes.findIndex(route => route.path === location.pathname)

  // Touch event handlers
  const handleTouchStart = useCallback((e: TouchEvent) => {
    const touch = e.touches[0]
    setSwipeState({
      startX: touch.clientX,
      startY: touch.clientY,
      currentX: touch.clientX,
      currentY: touch.clientY,
      isDragging: true,
      direction: null,
    })
  }, [])

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!swipeState.isDragging) return

    const touch = e.touches[0]
    const deltaX = touch.clientX - swipeState.startX
    const deltaY = touch.clientY - swipeState.startY

    // Determine swipe direction
    let direction: SwipeState['direction'] = null
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      direction = deltaX > 0 ? 'right' : 'left'
    } else {
      direction = deltaY > 0 ? 'down' : 'up'
    }

    setSwipeState(prev => ({
      ...prev,
      currentX: touch.clientX,
      currentY: touch.clientY,
      direction,
    }))

    // Prevent default scrolling for horizontal swipes
    if (Math.abs(deltaX) > 20 && Math.abs(deltaX) > Math.abs(deltaY)) {
      e.preventDefault()
    }
  }, [swipeState.isDragging, swipeState.startX, swipeState.startY])

  const handleTouchEnd = useCallback(() => {
    if (!swipeState.isDragging) return

    const deltaX = swipeState.currentX - swipeState.startX
    const deltaY = swipeState.currentY - swipeState.startY
    const minSwipeDistance = 50

    // Handle horizontal swipes for navigation
    if (Math.abs(deltaX) > minSwipeDistance && Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX > 0 && currentIndex > 0) {
        // Swipe right - go to previous route
        navigate(routes[currentIndex - 1].path)
      } else if (deltaX < 0 && currentIndex < routes.length - 1) {
        // Swipe left - go to next route
        navigate(routes[currentIndex + 1].path)
      }
    }

    setSwipeState({
      startX: 0,
      startY: 0,
      currentX: 0,
      currentY: 0,
      isDragging: false,
      direction: null,
    })
  }, [swipeState, currentIndex, routes, navigate])

  // Add touch event listeners
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    container.addEventListener('touchstart', handleTouchStart, { passive: false })
    container.addEventListener('touchmove', handleTouchMove, { passive: false })
    container.addEventListener('touchend', handleTouchEnd, { passive: true })

    return () => {
      container.removeEventListener('touchstart', handleTouchStart)
      container.removeEventListener('touchmove', handleTouchMove)
      container.removeEventListener('touchend', handleTouchEnd)
    }
  }, [handleTouchStart, handleTouchMove, handleTouchEnd])

  const canSwipeLeft = currentIndex < routes.length - 1
  const canSwipeRight = currentIndex > 0

  return (
    <div
      ref={containerRef}
      className={cn(
        'fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur border-t border-border',
        'safe-area-inset-bottom',
        className
      )}
    >
      {/* Swipe Hint */}
      {showSwipeHint && (
        <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium animate-bounce">
          Swipe left or right to navigate
        </div>
      )}

      {/* Navigation Indicators */}
      <div className="flex items-center justify-between px-4 py-2">
        {/* Previous Route Indicator */}
        <div className={cn(
          'flex items-center gap-2 text-sm',
          canSwipeRight ? 'text-muted-foreground' : 'text-muted-foreground/50'
        )}>
          <ChevronLeft className="h-4 w-4" />
          {canSwipeRight && (
            <span className="hidden sm:inline">
              {routes[currentIndex - 1]?.label}
            </span>
          )}
        </div>

        {/* Current Route */}
        <div className="flex items-center gap-2 text-sm font-medium">
          {routes[currentIndex] && (
            <>
              {React.createElement(routes[currentIndex].icon, { className: "h-4 w-4" })}
              <span>{routes[currentIndex].label}</span>
            </>
          )}
        </div>

        {/* Next Route Indicator */}
        <div className={cn(
          'flex items-center gap-2 text-sm',
          canSwipeLeft ? 'text-muted-foreground' : 'text-muted-foreground/50'
        )}>
          {canSwipeLeft && (
            <span className="hidden sm:inline">
              {routes[currentIndex + 1]?.label}
            </span>
          )}
          <ChevronRight className="h-4 w-4" />
        </div>
      </div>

      {/* Route Dots */}
      <div className="flex justify-center gap-2 pb-2">
        {routes.map((route, index) => (
          <button
            key={route.path}
            onClick={() => navigate(route.path)}
            className={cn(
              'w-2 h-2 rounded-full transition-colors',
              index === currentIndex 
                ? 'bg-primary' 
                : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
            )}
            aria-label={`Navigate to ${route.label}`}
          />
        ))}
      </div>

      {/* Swipe Progress Indicator */}
      {swipeState.isDragging && Math.abs(swipeState.currentX - swipeState.startX) > 20 && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-muted">
          <div
            className={cn(
              'h-full transition-all duration-150',
              swipeState.direction === 'left' ? 'bg-primary' : 'bg-secondary'
            )}
            style={{
              width: `${Math.min(100, (Math.abs(swipeState.currentX - swipeState.startX) / 100) * 100)}%`,
              marginLeft: swipeState.direction === 'right' ? 'auto' : '0',
            }}
          />
        </div>
      )}
    </div>
  )
}