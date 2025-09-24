import { useState, useCallback, useRef, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from '@/hooks/use-toast'

export interface RetryConfig {
  maxRetries?: number
  baseDelay?: number
  maxDelay?: number
  backoffFactor?: number
  retryCondition?: (error: any, attempt: number) => boolean
  onRetry?: (attempt: number, error: any) => void
  onMaxRetriesReached?: (error: any) => void
}

export interface RetryState {
  attempt: number
  isRetrying: boolean
  nextRetryIn: number
  canRetry: boolean
  error: any
}

// Enhanced retry hook with exponential backoff
export function useRetryMechanism({
  maxRetries = 3,
  baseDelay = 1000,
  maxDelay = 30000,
  backoffFactor = 2,
  retryCondition = (error, attempt) => {
    // Don't retry client errors (4xx) except for specific cases
    if (error?.response?.status >= 400 && error?.response?.status < 500) {
      return error?.response?.status === 408 || error?.response?.status === 429
    }
    return true
  },
  onRetry,
  onMaxRetriesReached
}: RetryConfig = {}) {
  const [retryState, setRetryState] = useState<RetryState>({
    attempt: 0,
    isRetrying: false,
    nextRetryIn: 0,
    canRetry: true,
    error: null
  })

  const timeoutRef = useRef<NodeJS.Timeout>()
  const countdownRef = useRef<NodeJS.Timeout>()

  const calculateDelay = useCallback((attempt: number) => {
    const delay = Math.min(baseDelay * Math.pow(backoffFactor, attempt), maxDelay)
    // Add jitter to prevent thundering herd
    return delay + Math.random() * 1000
  }, [baseDelay, backoffFactor, maxDelay])

  const startCountdown = useCallback((delay: number) => {
    let remaining = Math.ceil(delay / 1000)
    setRetryState(prev => ({ ...prev, nextRetryIn: remaining }))

    const countdown = () => {
      remaining -= 1
      if (remaining > 0) {
        setRetryState(prev => ({ ...prev, nextRetryIn: remaining }))
        countdownRef.current = setTimeout(countdown, 1000)
      } else {
        setRetryState(prev => ({ ...prev, nextRetryIn: 0 }))
      }
    }

    countdownRef.current = setTimeout(countdown, 1000)
  }, [])

  const executeWithRetry = useCallback(async <T>(
    operation: () => Promise<T>,
    customConfig?: Partial<RetryConfig>
  ): Promise<T> => {
    const config = { maxRetries, retryCondition, onRetry, onMaxRetriesReached, ...customConfig }
    let lastError: any

    for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
      try {
        setRetryState(prev => ({ 
          ...prev, 
          attempt, 
          isRetrying: attempt > 0,
          error: null 
        }))

        const result = await operation()
        
        // Success - reset state
        setRetryState({
          attempt: 0,
          isRetrying: false,
          nextRetryIn: 0,
          canRetry: true,
          error: null
        })

        return result
      } catch (error) {
        lastError = error
        
        setRetryState(prev => ({ 
          ...prev, 
          error,
          canRetry: attempt < config.maxRetries && config.retryCondition!(error, attempt)
        }))

        // Check if we should retry
        if (attempt < config.maxRetries && config.retryCondition!(error, attempt)) {
          const delay = calculateDelay(attempt)
          
          config.onRetry?.(attempt + 1, error)
          
          toast({
            title: 'Retrying...',
            description: `Attempt ${attempt + 2} of ${config.maxRetries + 1} in ${Math.ceil(delay / 1000)}s`,
            duration: Math.min(delay, 5000)
          })

          startCountdown(delay)
          
          await new Promise(resolve => {
            timeoutRef.current = setTimeout(resolve, delay)
          })
        } else {
          // Max retries reached or shouldn't retry
          setRetryState(prev => ({ 
            ...prev, 
            isRetrying: false,
            canRetry: false 
          }))

          config.onMaxRetriesReached?.(error)
          break
        }
      }
    }

    throw lastError
  }, [maxRetries, retryCondition, onRetry, onMaxRetriesReached, calculateDelay, startCountdown])

  const manualRetry = useCallback(async <T>(operation: () => Promise<T>) => {
    if (!retryState.canRetry) return

    try {
      setRetryState(prev => ({ ...prev, isRetrying: true }))
      const result = await operation()
      
      setRetryState({
        attempt: 0,
        isRetrying: false,
        nextRetryIn: 0,
        canRetry: true,
        error: null
      })

      return result
    } catch (error) {
      setRetryState(prev => ({ 
        ...prev, 
        isRetrying: false,
        error 
      }))
      throw error
    }
  }, [retryState.canRetry])

  const reset = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    if (countdownRef.current) {
      clearTimeout(countdownRef.current)
    }
    
    setRetryState({
      attempt: 0,
      isRetrying: false,
      nextRetryIn: 0,
      canRetry: true,
      error: null
    })
  }, [])

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      if (countdownRef.current) {
        clearTimeout(countdownRef.current)
      }
    }
  }, [])

  return {
    executeWithRetry,
    manualRetry,
    reset,
    retryState
  }
}

// Enhanced query with retry
export function useQueryWithRetry<T>(
  queryKey: string[],
  queryFn: () => Promise<T>,
  retryConfig?: RetryConfig & {
    enabled?: boolean
    staleTime?: number
    gcTime?: number
  }
) {
  const { executeWithRetry, retryState } = useRetryMechanism(retryConfig)

  const query = useQuery({
    queryKey,
    queryFn: () => executeWithRetry(queryFn),
    enabled: retryConfig?.enabled,
    staleTime: retryConfig?.staleTime,
    gcTime: retryConfig?.gcTime,
    retry: false, // We handle retries manually
    retryOnMount: false,
    refetchOnWindowFocus: false
  })

  return {
    ...query,
    retryState,
    manualRefetch: () => query.refetch()
  }
}

// Enhanced mutation with retry
export function useMutationWithRetry<TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  retryConfig?: RetryConfig & {
    onSuccess?: (data: TData, variables: TVariables) => void
    onError?: (error: any, variables: TVariables) => void
  }
) {
  const { executeWithRetry, retryState, manualRetry } = useRetryMechanism(retryConfig)
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (variables: TVariables) => executeWithRetry(() => mutationFn(variables)),
    onSuccess: retryConfig?.onSuccess,
    onError: retryConfig?.onError,
    retry: false // We handle retries manually
  })

  const mutateWithRetry = useCallback((variables: TVariables) => {
    return mutation.mutate(variables)
  }, [mutation])

  const mutateAsyncWithRetry = useCallback((variables: TVariables) => {
    return mutation.mutateAsync(variables)
  }, [mutation])

  const retryLastOperation = useCallback(() => {
    // This would need to store the last variables used
    // Implementation depends on specific use case
    console.warn('retryLastOperation not implemented - use manualRetry with stored variables')
  }, [])

  return {
    ...mutation,
    mutateWithRetry,
    mutateAsyncWithRetry,
    retryLastOperation,
    retryState
  }
}

// Network-aware retry
export function useNetworkAwareRetry() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [connectionType, setConnectionType] = useState<string>('unknown')

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Detect connection type if available
    if ('connection' in navigator) {
      const connection = (navigator as any).connection
      setConnectionType(connection.effectiveType || 'unknown')
      
      const handleConnectionChange = () => {
        setConnectionType(connection.effectiveType || 'unknown')
      }
      
      connection.addEventListener('change', handleConnectionChange)
      
      return () => {
        window.removeEventListener('online', handleOnline)
        window.removeEventListener('offline', handleOffline)
        connection.removeEventListener('change', handleConnectionChange)
      }
    }

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const getRetryConfig = useCallback((): RetryConfig => {
    if (!isOnline) {
      return {
        maxRetries: 0,
        retryCondition: () => false
      }
    }

    // Adjust retry behavior based on connection quality
    switch (connectionType) {
      case 'slow-2g':
      case '2g':
        return {
          maxRetries: 2,
          baseDelay: 5000,
          maxDelay: 60000,
          backoffFactor: 3
        }
      case '3g':
        return {
          maxRetries: 3,
          baseDelay: 2000,
          maxDelay: 30000,
          backoffFactor: 2
        }
      case '4g':
      default:
        return {
          maxRetries: 3,
          baseDelay: 1000,
          maxDelay: 15000,
          backoffFactor: 2
        }
    }
  }, [isOnline, connectionType])

  return {
    isOnline,
    connectionType,
    getRetryConfig
  }
}

// Bulk retry for multiple operations
export function useBulkRetry<T>() {
  const [operations, setOperations] = useState<Array<{
    id: string
    operation: () => Promise<T>
    status: 'pending' | 'success' | 'error' | 'retrying'
    error?: any
    result?: T
    retryCount: number
  }>>([])

  const addOperation = useCallback((id: string, operation: () => Promise<T>) => {
    setOperations(prev => [...prev, {
      id,
      operation,
      status: 'pending',
      retryCount: 0
    }])
  }, [])

  const executeAll = useCallback(async (retryConfig?: RetryConfig) => {
    const { executeWithRetry } = useRetryMechanism(retryConfig)

    const results = await Promise.allSettled(
      operations.map(async (op) => {
        setOperations(prev => prev.map(o => 
          o.id === op.id ? { ...o, status: 'retrying' as const } : o
        ))

        try {
          const result = await executeWithRetry(op.operation)
          setOperations(prev => prev.map(o => 
            o.id === op.id ? { ...o, status: 'success' as const, result } : o
          ))
          return { id: op.id, result }
        } catch (error) {
          setOperations(prev => prev.map(o => 
            o.id === op.id ? { ...o, status: 'error' as const, error } : o
          ))
          throw { id: op.id, error }
        }
      })
    )

    return results
  }, [operations])

  const retryFailed = useCallback(async (retryConfig?: RetryConfig) => {
    const failedOps = operations.filter(op => op.status === 'error')
    
    if (failedOps.length === 0) return []

    const { executeWithRetry } = useRetryMechanism(retryConfig)

    const results = await Promise.allSettled(
      failedOps.map(async (op) => {
        setOperations(prev => prev.map(o => 
          o.id === op.id ? { ...o, status: 'retrying' as const, retryCount: o.retryCount + 1 } : o
        ))

        try {
          const result = await executeWithRetry(op.operation)
          setOperations(prev => prev.map(o => 
            o.id === op.id ? { ...o, status: 'success' as const, result } : o
          ))
          return { id: op.id, result }
        } catch (error) {
          setOperations(prev => prev.map(o => 
            o.id === op.id ? { ...o, status: 'error' as const, error } : o
          ))
          throw { id: op.id, error }
        }
      })
    )

    return results
  }, [operations])

  const clearOperations = useCallback(() => {
    setOperations([])
  }, [])

  const getStats = useCallback(() => {
    const total = operations.length
    const success = operations.filter(op => op.status === 'success').length
    const error = operations.filter(op => op.status === 'error').length
    const pending = operations.filter(op => op.status === 'pending').length
    const retrying = operations.filter(op => op.status === 'retrying').length

    return { total, success, error, pending, retrying }
  }, [operations])

  return {
    operations,
    addOperation,
    executeAll,
    retryFailed,
    clearOperations,
    getStats
  }
}