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

// Route-based preloading
export const routePreloader = {
  // Preload routes based on user role
  preloadForRole(role: 'student' | 'teacher' | 'admin') {
    const preloadPromises: Promise<any>[] = []
    
    switch (role) {
      case 'student':
        preloadPromises.push(
          import('../pages/student/Dashboard'),
          import('../pages/student/Programs'),
          import('../pages/student/Quizzes')
        )
        break
        
      case 'teacher':
        preloadPromises.push(
          import('../pages/teacher/Dashboard'),
          import('../pages/teacher/Profile'),
          import('../pages/teacher/Quizzes')
        )
        break
        
      case 'admin':
        preloadPromises.push(
          import('../pages/admin/Dashboard'),
          import('../pages/admin/Languages'),
          import('../pages/admin/Programs')
        )
        break
    }
    
    return Promise.all(preloadPromises)
  },

  // Preload on hover/focus
  preloadOnHover(routeName: string) {
    const routeMap: Record<string, () => Promise<any>> = {
      'student-programs': () => import('../pages/student/Programs'),
      'student-quizzes': () => import('../pages/student/Quizzes'),
      'student-meetings': () => import('../pages/student/Meetings'),
      'teacher-quizzes': () => import('../pages/teacher/Quizzes'),
      'teacher-results': () => import('../pages/teacher/Results'),
      'admin-languages': () => import('../pages/admin/Languages'),
      'admin-programs': () => import('../pages/admin/Programs'),
      'admin-settings': () => import('../pages/admin/Settings')
    }
    
    const preloader = routeMap[routeName]
    if (preloader) {
      return preloader()
    }
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