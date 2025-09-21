import { useEffect, useCallback, useMemo, useRef } from 'react'
import { useLocation } from 'react-router-dom'

// Performance optimization hooks
export function usePerformanceOptimization() {
  const location = useLocation()
  const renderCount = useRef(0)
  const startTime = useRef(performance.now())

  // Track component renders
  useEffect(() => {
    renderCount.current += 1
    const endTime = performance.now()
    const renderTime = endTime - startTime.current
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`Page ${location.pathname} rendered ${renderCount.current} times in ${renderTime}ms`)
    }
    
    startTime.current = endTime
  })

  // Debounced function creator
  const createDebouncedFunction = useCallback(<T extends (...args: any[]) => any>(
    func: T,
    delay: number
  ): T => {
    let timeoutId: NodeJS.Timeout
    
    return ((...args: Parameters<T>) => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => func(...args), delay)
    }) as T
  }, [])

  // Throttled function creator
  const createThrottledFunction = useCallback(<T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): T => {
    let inThrottle: boolean
    
    return ((...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args)
        inThrottle = true
        setTimeout(() => inThrottle = false, limit)
      }
    }) as T
  }, [])

  // Memoized calculations
  const memoizedCalculation = useCallback(<T>(
    calculation: () => T,
    dependencies: any[]
  ): T => {
    return useMemo(calculation, dependencies)
  }, [])

  return {
    createDebouncedFunction,
    createThrottledFunction,
    memoizedCalculation,
    renderCount: renderCount.current
  }
}

// Web Vitals monitoring
export function useWebVitals() {
  useEffect(() => {
    // Track Core Web Vitals
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const metricName = entry.name
        const value = entry.startTime || (entry as any).value
        
        // Log metrics in development
        if (process.env.NODE_ENV === 'development') {
          console.log(`${metricName}: ${value}`)
        }
        
        // Send to analytics in production
        if (process.env.NODE_ENV === 'production') {
          // analytics.track('web_vital', { metric: metricName, value })
        }
      }
    })

    // Observe different types of performance entries
    try {
      observer.observe({ entryTypes: ['measure', 'paint', 'largest-contentful-paint'] })
    } catch (error) {
      console.warn('Performance observer not supported:', error)
    }

    return () => observer.disconnect()
  }, [])
}

// Resource preloading
export function useResourcePreloader() {
  const preloadImage = useCallback((src: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve()
      img.onerror = reject
      img.src = src
    })
  }, [])

  const preloadScript = useCallback((src: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.onload = () => resolve()
      script.onerror = reject
      script.src = src
      document.head.appendChild(script)
    })
  }, [])

  const preloadCSS = useCallback((href: string): void => {
    const link = document.createElement('link')
    link.rel = 'prefetch'
    link.href = href
    document.head.appendChild(link)
  }, [])

  return {
    preloadImage,
    preloadScript,
    preloadCSS
  }
}

// Memory usage monitoring
export function useMemoryMonitor() {
  const getMemoryUsage = useCallback(() => {
    if ('memory' in performance) {
      const memory = (performance as any).memory
      return {
        used: Math.round(memory.usedJSHeapSize / 1048576), // MB
        total: Math.round(memory.totalJSHeapSize / 1048576), // MB
        limit: Math.round(memory.jsHeapSizeLimit / 1048576) // MB
      }
    }
    return null
  }, [])

  const logMemoryUsage = useCallback(() => {
    const usage = getMemoryUsage()
    if (usage && process.env.NODE_ENV === 'development') {
      console.log(`Memory Usage: ${usage.used}MB / ${usage.total}MB (limit: ${usage.limit}MB)`)
    }
  }, [getMemoryUsage])

  // Log memory usage every 30 seconds in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const interval = setInterval(logMemoryUsage, 30000)
      return () => clearInterval(interval)
    }
  }, [logMemoryUsage])

  return {
    getMemoryUsage,
    logMemoryUsage
  }
}

// Bundle analysis utilities
export function useBundleAnalysis() {
  const trackChunkLoad = useCallback((chunkName: string) => {
    const startTime = performance.now()
    
    return () => {
      const loadTime = performance.now() - startTime
      console.log(`Chunk ${chunkName} loaded in ${loadTime}ms`)
    }
  }, [])

  const analyzeBundleSize = useCallback(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Bundle analysis available with: npm run build -- --analyze')
    }
  }, [])

  return {
    trackChunkLoad,
    analyzeBundleSize
  }
}

// Virtual scrolling utilities
export function useVirtualScrolling<T>(
  items: T[],
  itemHeight: number,
  containerHeight: number
) {
  const visibleItemsCount = Math.ceil(containerHeight / itemHeight)
  const bufferSize = Math.min(5, Math.floor(visibleItemsCount / 2))
  
  const getVisibleItems = useCallback((scrollTop: number) => {
    const startIndex = Math.floor(scrollTop / itemHeight)
    const endIndex = Math.min(
      startIndex + visibleItemsCount + bufferSize,
      items.length
    )
    const actualStartIndex = Math.max(0, startIndex - bufferSize)
    
    return {
      startIndex: actualStartIndex,
      endIndex,
      visibleItems: items.slice(actualStartIndex, endIndex),
      offsetY: actualStartIndex * itemHeight,
      totalHeight: items.length * itemHeight
    }
  }, [items, itemHeight, visibleItemsCount, bufferSize])

  return {
    getVisibleItems,
    totalHeight: items.length * itemHeight
  }
}

// Image lazy loading
export function useLazyImage(src: string, options: IntersectionObserverInit = {}) {
  const imgRef = useRef<HTMLImageElement>(null)
  const isLoaded = useRef(false)

  useEffect(() => {
    const imgElement = imgRef.current
    if (!imgElement || isLoaded.current) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          imgElement.src = src
          isLoaded.current = true
          observer.unobserve(imgElement)
        }
      },
      {
        rootMargin: '50px',
        threshold: 0.1,
        ...options
      }
    )

    observer.observe(imgElement)

    return () => {
      observer.disconnect()
    }
  }, [src, options])

  return imgRef
}