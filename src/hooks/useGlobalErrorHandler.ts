import { useEffect, useCallback } from 'react'
import { toast } from '@/hooks/use-toast'
import { ApiErrorHandler } from '@/lib/errorHandler'

export interface GlobalErrorConfig {
  enableConsoleLogging?: boolean
  enableToastNotifications?: boolean
  enableErrorReporting?: boolean
  reportingEndpoint?: string
  maxErrorsPerMinute?: number
}

export function useGlobalErrorHandler(config: GlobalErrorConfig = {}) {
  const {
    enableConsoleLogging = true,
    enableToastNotifications = true,
    enableErrorReporting = false,
    reportingEndpoint,
    maxErrorsPerMinute = 10
  } = config

  const errorCounts = new Map<string, number>()
  const errorTimestamps = new Map<string, number[]>()

  const shouldThrottleError = useCallback((errorKey: string) => {
    const now = Date.now()
    const timestamps = errorTimestamps.get(errorKey) || []
    
    // Remove timestamps older than 1 minute
    const recentTimestamps = timestamps.filter(ts => now - ts < 60000)
    
    if (recentTimestamps.length >= maxErrorsPerMinute) {
      return true
    }

    // Update timestamps
    recentTimestamps.push(now)
    errorTimestamps.set(errorKey, recentTimestamps)
    
    return false
  }, [maxErrorsPerMinute])

  const reportError = useCallback(async (errorDetails: any) => {
    if (!enableErrorReporting || !reportingEndpoint) return

    try {
      await fetch(reportingEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...errorDetails,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          url: window.location.href,
          userId: localStorage.getItem('user_id') || 'anonymous'
        })
      })
    } catch (err) {
      console.error('Failed to report error:', err)
    }
  }, [enableErrorReporting, reportingEndpoint])

  const handleGlobalError = useCallback((event: ErrorEvent) => {
    const errorKey = `${event.filename}:${event.lineno}:${event.colno}`
    
    if (shouldThrottleError(errorKey)) {
      return
    }

    const errorDetails = {
      type: 'javascript_error',
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      stack: event.error?.stack,
      errorKey
    }

    if (enableConsoleLogging) {
      console.error('Global JavaScript Error:', errorDetails)
    }

    if (enableToastNotifications) {
      toast({
        title: 'Application Error',
        description: 'An unexpected error occurred. Please refresh the page if problems persist.',
        variant: 'destructive',
        duration: 5000
      })
    }

    reportError(errorDetails)
  }, [shouldThrottleError, enableConsoleLogging, enableToastNotifications, reportError])

  const handleUnhandledRejection = useCallback((event: PromiseRejectionEvent) => {
    const errorKey = `promise_rejection_${event.reason?.message || 'unknown'}`
    
    if (shouldThrottleError(errorKey)) {
      return
    }

    const errorDetails = {
      type: 'unhandled_promise_rejection',
      reason: event.reason,
      message: event.reason?.message || 'Unhandled promise rejection',
      stack: event.reason?.stack,
      errorKey
    }

    if (enableConsoleLogging) {
      console.error('Unhandled Promise Rejection:', errorDetails)
    }

    if (enableToastNotifications) {
      toast({
        title: 'Network Error',
        description: 'A network request failed. Please check your connection and try again.',
        variant: 'destructive',
        duration: 5000
      })
    }

    reportError(errorDetails)
  }, [shouldThrottleError, enableConsoleLogging, enableToastNotifications, reportError])

  const handleApiError = useCallback((event: CustomEvent) => {
    const errorDetails = event.detail
    const errorKey = `api_error_${errorDetails.statusCode}_${errorDetails.category}`
    
    if (shouldThrottleError(errorKey)) {
      return
    }

    if (enableConsoleLogging) {
      console.error('API Error:', errorDetails)
    }

    // API errors are already handled by ApiErrorHandler with toasts
    // Just report them if reporting is enabled
    reportError({
      type: 'api_error',
      ...errorDetails,
      errorKey
    })
  }, [shouldThrottleError, enableConsoleLogging, reportError])

  const handleErrorBoundary = useCallback((event: CustomEvent) => {
    const errorDetails = event.detail
    const errorKey = `boundary_error_${errorDetails.level}_${errorDetails.errorId}`
    
    if (shouldThrottleError(errorKey)) {
      return
    }

    if (enableConsoleLogging) {
      console.error('Error Boundary Triggered:', errorDetails)
    }

    reportError({
      type: 'error_boundary',
      ...errorDetails,
      errorKey
    })
  }, [shouldThrottleError, enableConsoleLogging, reportError])

  const handleChunkLoadError = useCallback((event: Event) => {
    const errorKey = 'chunk_load_error'
    
    if (shouldThrottleError(errorKey)) {
      return
    }

    const errorDetails = {
      type: 'chunk_load_error',
      message: 'Failed to load application chunk',
      target: (event.target as any)?.src || 'unknown',
      errorKey
    }

    if (enableConsoleLogging) {
      console.error('Chunk Load Error:', errorDetails)
    }

    if (enableToastNotifications) {
      toast({
        title: 'Loading Error',
        description: 'Failed to load part of the application. Please refresh the page.',
        variant: 'destructive',
        duration: 0, // Don't auto-dismiss
        action: {
          altText: 'Refresh',
          onClick: () => window.location.reload()
        }
      })
    }

    reportError(errorDetails)
  }, [shouldThrottleError, enableConsoleLogging, enableToastNotifications, reportError])

  useEffect(() => {
    // Global JavaScript errors
    window.addEventListener('error', handleGlobalError)
    
    // Unhandled promise rejections
    window.addEventListener('unhandledrejection', handleUnhandledRejection)
    
    // Custom API errors
    window.addEventListener('api:error', handleApiError as EventListener)
    
    // Error boundary events
    window.addEventListener('error:boundary', handleErrorBoundary as EventListener)

    // Chunk loading errors (for code splitting)
    window.addEventListener('error', (event) => {
      if (event.target !== window && (event.target as any)?.tagName === 'SCRIPT') {
        handleChunkLoadError(event)
      }
    }, true)

    return () => {
      window.removeEventListener('error', handleGlobalError)
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
      window.removeEventListener('api:error', handleApiError as EventListener)
      window.removeEventListener('error:boundary', handleErrorBoundary as EventListener)
    }
  }, [
    handleGlobalError,
    handleUnhandledRejection,
    handleApiError,
    handleErrorBoundary,
    handleChunkLoadError
  ])

  const clearErrorCounts = useCallback(() => {
    errorCounts.clear()
    errorTimestamps.clear()
  }, [])

  const getErrorStats = useCallback(() => {
    const stats = {
      totalErrors: 0,
      errorsByType: {} as Record<string, number>,
      recentErrors: 0
    }

    const now = Date.now()
    
    errorTimestamps.forEach((timestamps, errorKey) => {
      const recentTimestamps = timestamps.filter(ts => now - ts < 60000)
      stats.totalErrors += timestamps.length
      stats.recentErrors += recentTimestamps.length
      
      const errorType = errorKey.split('_')[0] || 'unknown'
      stats.errorsByType[errorType] = (stats.errorsByType[errorType] || 0) + timestamps.length
    })

    return stats
  }, [])

  return {
    clearErrorCounts,
    getErrorStats,
    reportError
  }
}