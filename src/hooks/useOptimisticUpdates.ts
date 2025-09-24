import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState, useCallback, useRef } from 'react'
import { toast } from '@/hooks/use-toast'

export interface OptimisticUpdateConfig<TData, TVariables> {
  mutationFn: (variables: TVariables) => Promise<TData>
  queryKey: string[]
  optimisticUpdate?: (oldData: any, variables: TVariables) => any
  onSuccess?: (data: TData, variables: TVariables) => void
  onError?: (error: any, variables: TVariables, context: any) => void
  successMessage?: string
  errorMessage?: string
  rollbackDelay?: number
  enableOptimistic?: boolean
}

export function useOptimisticMutation<TData, TVariables>({
  mutationFn,
  queryKey,
  optimisticUpdate,
  onSuccess,
  onError,
  successMessage,
  errorMessage,
  rollbackDelay = 0,
  enableOptimistic = true
}: OptimisticUpdateConfig<TData, TVariables>) {
  const queryClient = useQueryClient()
  const [isOptimistic, setIsOptimistic] = useState(false)
  const rollbackTimeoutRef = useRef<NodeJS.Timeout>()

  const mutation = useMutation({
    mutationFn,
    onMutate: async (variables) => {
      if (!enableOptimistic || !optimisticUpdate) {
        return { previousData: null }
      }

      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey })

      // Snapshot previous value
      const previousData = queryClient.getQueryData(queryKey)

      // Optimistically update
      queryClient.setQueryData(queryKey, (old: any) => 
        optimisticUpdate(old, variables)
      )

      setIsOptimistic(true)

      // Show optimistic feedback
      if (successMessage) {
        toast({
          title: 'Updating...',
          description: successMessage,
          duration: 2000
        })
      }

      return { previousData }
    },
    onSuccess: (data, variables, context) => {
      setIsOptimistic(false)
      
      // Clear any pending rollback
      if (rollbackTimeoutRef.current) {
        clearTimeout(rollbackTimeoutRef.current)
      }

      // Invalidate and refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey })
      
      if (successMessage) {
        toast({
          title: 'Success',
          description: successMessage,
          duration: 3000
        })
      }

      onSuccess?.(data, variables)
    },
    onError: (error, variables, context) => {
      setIsOptimistic(false)

      // Rollback optimistic update
      if (context?.previousData !== null) {
        if (rollbackDelay > 0) {
          rollbackTimeoutRef.current = setTimeout(() => {
            queryClient.setQueryData(queryKey, context.previousData)
          }, rollbackDelay)
        } else {
          queryClient.setQueryData(queryKey, context.previousData)
        }
      }

      const message = errorMessage || 'Operation failed. Please try again.'
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
        duration: 5000
      })

      onError?.(error, variables, context)
    }
  })

  const mutateOptimistic = useCallback((variables: TVariables) => {
    mutation.mutate(variables)
  }, [mutation])

  const mutateOptimisticAsync = useCallback((variables: TVariables) => {
    return mutation.mutateAsync(variables)
  }, [mutation])

  return {
    ...mutation,
    mutateOptimistic,
    mutateOptimisticAsync,
    isOptimistic
  }
}

// Batch optimistic updates
export function useBatchOptimisticUpdates<TData, TVariables>({
  mutationFn,
  queryKeys,
  batchSize = 5,
  delay = 100
}: {
  mutationFn: (variables: TVariables[]) => Promise<TData[]>
  queryKeys: string[][]
  batchSize?: number
  delay?: number
}) {
  const queryClient = useQueryClient()
  const [queue, setQueue] = useState<TVariables[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout>()

  const processBatch = useCallback(async () => {
    if (queue.length === 0 || isProcessing) return

    setIsProcessing(true)
    const batch = queue.slice(0, batchSize)
    setQueue(prev => prev.slice(batchSize))

    try {
      await mutationFn(batch)
      
      // Invalidate all related queries
      queryKeys.forEach(queryKey => {
        queryClient.invalidateQueries({ queryKey })
      })

      toast({
        title: 'Batch update completed',
        description: `Successfully updated ${batch.length} items`,
        duration: 3000
      })
    } catch (error) {
      toast({
        title: 'Batch update failed',
        description: 'Some updates may not have been saved',
        variant: 'destructive',
        duration: 5000
      })
    } finally {
      setIsProcessing(false)
      
      // Process remaining items
      if (queue.length > batchSize) {
        timeoutRef.current = setTimeout(processBatch, delay)
      }
    }
  }, [queue, isProcessing, batchSize, mutationFn, queryKeys, queryClient, delay])

  const addToBatch = useCallback((variables: TVariables) => {
    setQueue(prev => [...prev, variables])
    
    // Clear existing timeout and set new one
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    
    timeoutRef.current = setTimeout(processBatch, delay)
  }, [processBatch, delay])

  const flushBatch = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    processBatch()
  }, [processBatch])

  return {
    addToBatch,
    flushBatch,
    queueSize: queue.length,
    isProcessing
  }
}

// Optimistic list operations
export function useOptimisticList<T extends { id: string | number }>({
  queryKey,
  getItemId = (item: T) => item.id
}: {
  queryKey: string[]
  getItemId?: (item: T) => string | number
}) {
  const queryClient = useQueryClient()

  const addOptimistic = useCallback((newItem: T) => {
    queryClient.setQueryData(queryKey, (old: T[] = []) => {
      return [newItem, ...old]
    })
  }, [queryClient, queryKey])

  const updateOptimistic = useCallback((id: string | number, updates: Partial<T>) => {
    queryClient.setQueryData(queryKey, (old: T[] = []) => {
      return old.map(item => 
        getItemId(item) === id ? { ...item, ...updates } : item
      )
    })
  }, [queryClient, queryKey, getItemId])

  const removeOptimistic = useCallback((id: string | number) => {
    queryClient.setQueryData(queryKey, (old: T[] = []) => {
      return old.filter(item => getItemId(item) !== id)
    })
  }, [queryClient, queryKey, getItemId])

  const reorderOptimistic = useCallback((fromIndex: number, toIndex: number) => {
    queryClient.setQueryData(queryKey, (old: T[] = []) => {
      const newList = [...old]
      const [removed] = newList.splice(fromIndex, 1)
      newList.splice(toIndex, 0, removed)
      return newList
    })
  }, [queryClient, queryKey])

  return {
    addOptimistic,
    updateOptimistic,
    removeOptimistic,
    reorderOptimistic
  }
}

// Optimistic form state
export function useOptimisticForm<T>({
  initialData,
  onSubmit,
  queryKey,
  optimisticUpdate
}: {
  initialData: T
  onSubmit: (data: T) => Promise<T>
  queryKey: string[]
  optimisticUpdate?: (oldData: any, newData: T) => any
}) {
  const [formData, setFormData] = useState<T>(initialData)
  const [isDirty, setIsDirty] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const optimisticMutation = useOptimisticMutation({
    mutationFn: onSubmit,
    queryKey,
    optimisticUpdate,
    successMessage: 'Changes saved successfully',
    errorMessage: 'Failed to save changes'
  })

  const updateField = useCallback(<K extends keyof T>(
    field: K, 
    value: T[K]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setIsDirty(true)
  }, [])

  const handleSubmit = useCallback(async () => {
    if (!isDirty) return

    setIsSubmitting(true)
    try {
      await optimisticMutation.mutateOptimisticAsync(formData)
      setIsDirty(false)
    } finally {
      setIsSubmitting(false)
    }
  }, [formData, isDirty, optimisticMutation])

  const reset = useCallback(() => {
    setFormData(initialData)
    setIsDirty(false)
  }, [initialData])

  return {
    formData,
    updateField,
    handleSubmit,
    reset,
    isDirty,
    isSubmitting: isSubmitting || optimisticMutation.isPending,
    isOptimistic: optimisticMutation.isOptimistic
  }
}