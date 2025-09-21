import { useCallback, useEffect, useRef } from 'react'
import type React from 'react'

// Performance monitoring utilities
export class PerformanceMonitor {
  private static instance: PerformanceMonitor
  private metrics: Map<string, number[]> = new Map()
  private observers: Map<string, PerformanceObserver> = new Map()

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor()
    }
    return PerformanceMonitor.instance
  }

  // Track page load performance
  trackPageLoad(pageName: string) {
    if (!performance || !performance.getEntriesByType) return

    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    if (navigation) {
      this.recordMetric(`${pageName}_load_time`, navigation.loadEventEnd - navigation.fetchStart)
      this.recordMetric(`${pageName}_dom_content_loaded`, navigation.domContentLoadedEventEnd - navigation.fetchStart)
      this.recordMetric(`${pageName}_first_contentful_paint`, this.getFirstContentfulPaint())
    }
  }

  // Track component render time
  trackComponentRender(componentName: string, renderTime: number) {
    this.recordMetric(`${componentName}_render_time`, renderTime)
  }

  // Track API response times
  trackApiCall(endpoint: string, duration: number, success: boolean) {
    this.recordMetric(`api_${endpoint}_duration`, duration)
    this.recordMetric(`api_${endpoint}_success`, success ? 1 : 0)
  }

  // Track user interactions
  trackUserInteraction(action: string, duration?: number) {
    this.recordMetric(`user_${action}`, duration || Date.now())
  }

  private recordMetric(name: string, value: number) {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, [])
    }
    this.metrics.get(name)!.push(value)
    
    // Keep only last 100 measurements
    const values = this.metrics.get(name)!
    if (values.length > 100) {
      values.shift()
    }
  }

  private getFirstContentfulPaint(): number {
    if (!performance.getEntriesByType) return 0
    
    const paintEntries = performance.getEntriesByType('paint')
    const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint')
    return fcpEntry ? fcpEntry.startTime : 0
  }

  // Get performance metrics
  getMetrics(metricName?: string) {
    if (metricName) {
      const values = this.metrics.get(metricName) || []
      return {
        name: metricName,
        values,
        avg: values.reduce((a, b) => a + b, 0) / values.length || 0,
        min: Math.min(...values) || 0,
        max: Math.max(...values) || 0,
        count: values.length
      }
    }
    
    return Array.from(this.metrics.entries()).map(([name, values]) => ({
      name,
      values,
      avg: values.reduce((a, b) => a + b, 0) / values.length || 0,
      min: Math.min(...values) || 0,
      max: Math.max(...values) || 0,
      count: values.length
    }))
  }

  // Monitor Core Web Vitals
  observeWebVitals() {
    // Largest Contentful Paint
    this.observePerformanceEntry('largest-contentful-paint', (entry) => {
      this.recordMetric('lcp', entry.startTime)
    })

    // First Input Delay
    this.observePerformanceEntry('first-input', (entry) => {
      this.recordMetric('fid', entry.processingStart - entry.startTime)
    })

    // Cumulative Layout Shift
    this.observePerformanceEntry('layout-shift', (entry) => {
      if (!entry.hadRecentInput) {
        this.recordMetric('cls', entry.value)
      }
    })
  }

  private observePerformanceEntry(entryType: string, callback: (entry: any) => void) {
    if (!window.PerformanceObserver) return

    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          callback(entry)
        }
      })
      
      observer.observe({ entryTypes: [entryType] })
      this.observers.set(entryType, observer)
    } catch (error) {
      console.warn(`Could not observe ${entryType}:`, error)
    }
  }

  // Send metrics to analytics
  sendMetrics() {
    const metrics = this.getMetrics()
    
    // Here you would send to your analytics service
    console.log('Performance Metrics:', metrics)
    
    // Example: Send to analytics
    // analytics.track('performance_metrics', { metrics })
  }

  // Cleanup observers
  disconnect() {
    this.observers.forEach(observer => observer.disconnect())
    this.observers.clear()
  }
}

// React hooks for performance monitoring
export function usePerformanceMonitor() {
  const monitor = PerformanceMonitor.getInstance()
  
  const trackRender = useCallback((componentName: string) => {
    const startTime = performance.now()
    
    return () => {
      const endTime = performance.now()
      monitor.trackComponentRender(componentName, endTime - startTime)
    }
  }, [monitor])

  const trackPageLoad = useCallback((pageName: string) => {
    useEffect(() => {
      monitor.trackPageLoad(pageName)
    }, [pageName])
  }, [monitor])

  const trackApiCall = useCallback((endpoint: string, promise: Promise<any>) => {
    const startTime = performance.now()
    
    return promise
      .then(result => {
        monitor.trackApiCall(endpoint, performance.now() - startTime, true)
        return result
      })
      .catch(error => {
        monitor.trackApiCall(endpoint, performance.now() - startTime, false)
        throw error
      })
  }, [monitor])

  return {
    trackRender,
    trackPageLoad,
    trackApiCall,
    trackUserInteraction: monitor.trackUserInteraction.bind(monitor),
    getMetrics: monitor.getMetrics.bind(monitor),
    sendMetrics: monitor.sendMetrics.bind(monitor)
  }
}

// Higher-order component for performance tracking
export function withPerformanceTracking<T extends object>(
  WrappedComponent: React.ComponentType<T>,
  componentName: string
) {
  return function PerformanceTrackedComponent(props: T) {
    const { trackRender } = usePerformanceMonitor()
    const endTracking = useRef<(() => void) | null>(null)

    useEffect(() => {
      endTracking.current = trackRender(componentName)
      
      return () => {
        if (endTracking.current) {
          endTracking.current()
        }
      }
    }, [trackRender])

    return <WrappedComponent {...props} />
  }
}

// Bundle size monitoring
export const BundleAnalyzer = {
  logBundleSize() {
    if (process.env.NODE_ENV === 'development') {
      // Log bundle information in development
      console.log('Bundle analysis available at build time')
    }
  },

  trackChunkLoad(chunkName: string) {
    const monitor = PerformanceMonitor.getInstance()
    monitor.trackUserInteraction(`chunk_load_${chunkName}`)
  }
}