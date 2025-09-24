import { lazy, ComponentType } from 'react'

// Enhanced lazy loading with preloading capability
export function lazyWithPreload<T extends ComponentType<any>>(
  factory: () => Promise<{ default: T }>
) {
  const LazyComponent = lazy(factory)
  
  // Add preload function to the component
  ;(LazyComponent as any).preload = factory
  
  return LazyComponent as typeof LazyComponent & { preload: () => Promise<{ default: T }> }
}

// Preload critical routes
export const preloadCriticalRoutes = () => {
  // Preload login and dashboard immediately
  const loginPromise = import('../pages/auth/Login')
  const dashboardPromise = import('../pages/Dashboard')
  
  return Promise.all([loginPromise, dashboardPromise])
}

// Enhanced route-based preloading
export const routePreloader = {
  // Preload routes based on user role
  preloadForRole(role: 'student' | 'teacher' | 'admin') {
    const preloadPromises: Promise<any>[] = []
    
    switch (role) {
      case 'student':
        preloadPromises.push(
          import('../pages/dashboard/StudentDashboard'),
          import('../pages/Programs'),
          import('../pages/QuizAttempt'),
          import('../pages/Profile')
        )
        break
        
      case 'teacher':
        preloadPromises.push(
          import('../pages/dashboard/TeacherDashboard'),
          import('../pages/Profile'),
          import('../pages/MeetingRoom')
        )
        break
        
      case 'admin':
        preloadPromises.push(
          import('../pages/dashboard/AdminDashboard'),
          import('../pages/Languages'),
          import('../pages/Programs'),
          import('../pages/Teachers')
        )
        break
    }
    
    return Promise.all(preloadPromises)
  },

  // Preload on hover/focus with enhanced mapping
  preloadOnHover(routeName: string) {
    const routeMap: Record<string, () => Promise<any>> = {
      // Dashboard routes
      'student-dashboard': () => import('../pages/dashboard/StudentDashboard'),
      'teacher-dashboard': () => import('../pages/dashboard/TeacherDashboard'),
      'admin-dashboard': () => import('../pages/dashboard/AdminDashboard'),
      
      // Public routes
      'languages': () => import('../pages/Languages'),
      'teachers': () => import('../pages/Teachers'),
      'programs': () => import('../pages/Programs'),
      'about': () => import('../pages/About'),
      'contact': () => import('../pages/Contact'),
      
      // Auth routes
      'login': () => import('../pages/auth/Login'),
      'register': () => import('../pages/auth/Register'),
      
      // Protected routes
      'profile': () => import('../pages/Profile'),
      'quiz-attempt': () => import('../pages/QuizAttempt'),
      'meeting-room': () => import('../pages/MeetingRoom'),
      
      // Guest routes
      'guest-quizzes': () => import('../pages/GuestQuizzes'),
    }
    
    const preloader = routeMap[routeName]
    if (preloader) {
      return preloader()
    }
  },

  // Preload critical routes immediately
  preloadCritical() {
    return Promise.all([
      import('../pages/Landing'),
      import('../pages/auth/Login'),
      import('../pages/NotFound')
    ])
  },

  // Smart preloading based on user behavior
  smartPreload(currentPath: string, userRole?: string) {
    const preloadPromises: Promise<any>[] = []

    // Preload likely next routes based on current path
    if (currentPath === '/') {
      preloadPromises.push(
        import('../pages/auth/Login'),
        import('../pages/Languages'),
        import('../pages/Programs')
      )
    } else if (currentPath === '/login' && userRole) {
      // Preload dashboard based on role
      switch (userRole) {
        case 'student':
          preloadPromises.push(import('../pages/dashboard/StudentDashboard'))
          break
        case 'teacher':
          preloadPromises.push(import('../pages/dashboard/TeacherDashboard'))
          break
        case 'admin':
          preloadPromises.push(import('../pages/dashboard/AdminDashboard'))
          break
      }
    } else if (currentPath.includes('/dashboard')) {
      // Preload common dashboard-related routes
      preloadPromises.push(
        import('../pages/Profile'),
        import('../pages/Programs')
      )
    }

    return Promise.all(preloadPromises)
  }
}

// Image lazy loading utility
export class ImagePreloader {
  private static cache = new Set<string>()
  
  static preload(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.cache.has(src)) {
        resolve()
        return
      }
      
      const img = new Image()
      img.onload = () => {
        this.cache.add(src)
        resolve()
      }
      img.onerror = reject
      img.src = src
    })
  }
  
  static preloadMultiple(sources: string[]): Promise<void[]> {
    return Promise.all(sources.map(src => this.preload(src)))
  }
}

// Resource prefetching
export const resourcePrefetcher = {
  // Prefetch critical API endpoints
  prefetchCriticalData() {
    // These would be actual API calls in a real app
    const prefetchPromises = [
      // User profile data
      fetch('/api/user/profile', { method: 'HEAD' }),
      // Dashboard stats
      fetch('/api/dashboard/stats', { method: 'HEAD' }),
      // Notifications
      fetch('/api/notifications', { method: 'HEAD' })
    ].map(p => p.catch(() => {})) // Silently handle errors
    
    return Promise.all(prefetchPromises)
  },

  // Prefetch fonts
  prefetchFonts() {
    const fonts = [
      'Inter-Regular.woff2',
      'Inter-Medium.woff2',
      'Inter-SemiBold.woff2'
    ]
    
    fonts.forEach(font => {
      const link = document.createElement('link')
      link.rel = 'prefetch'
      link.href = `/fonts/${font}`
      document.head.appendChild(link)
    })
  },

  // Prefetch critical CSS
  prefetchCriticalCSS() {
    const link = document.createElement('link')
    link.rel = 'prefetch'
    link.href = '/css/critical.css'
    document.head.appendChild(link)
  }
}

// Intersection Observer for lazy loading
export class LazyLoader {
  private observer: IntersectionObserver
  private elements = new Map<Element, () => void>()
  
  constructor(options: IntersectionObserverInit = {}) {
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const callback = this.elements.get(entry.target)
          if (callback) {
            callback()
            this.unobserve(entry.target)
          }
        }
      })
    }, {
      rootMargin: '50px',
      threshold: 0.1,
      ...options
    })
  }
  
  observe(element: Element, callback: () => void) {
    this.elements.set(element, callback)
    this.observer.observe(element)
  }
  
  unobserve(element: Element) {
    this.elements.delete(element)
    this.observer.unobserve(element)
  }
  
  disconnect() {
    this.observer.disconnect()
    this.elements.clear()
  }
}

// Memory management utilities
export const memoryManager = {
  // Clear unnecessary caches
  clearCaches() {
    // Clear React Query cache for old data
    const queryClient = (window as any).__REACT_QUERY_CLIENT__
    if (queryClient) {
      queryClient.clear()
    }
    
    // Clear image cache
    ImagePreloader['cache'].clear()
  },

  // Monitor memory usage
  getMemoryUsage() {
    if ('memory' in performance) {
      return {
        used: Math.round((performance as any).memory.usedJSHeapSize / 1048576),
        total: Math.round((performance as any).memory.totalJSHeapSize / 1048576),
        limit: Math.round((performance as any).memory.jsHeapSizeLimit / 1048576)
      }
    }
    return null
  },

  // Trigger garbage collection in development
  forceGC() {
    if (process.env.NODE_ENV === 'development' && 'gc' in window) {
      ;(window as any).gc()
    }
  }
}