import React from 'react'
import { Loader2, Wifi, WifiOff, AlertCircle, CheckCircle, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

// Base loading spinner with enhanced features
export interface LoadingSpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  text?: string
  subtext?: string
  showProgress?: boolean
  progress?: number
  variant?: 'default' | 'dots' | 'pulse' | 'bounce'
}

const sizeVariants = {
  xs: 'h-3 w-3',
  sm: 'h-4 w-4',
  md: 'h-6 w-6', 
  lg: 'h-8 w-8',
  xl: 'h-12 w-12'
}

export function EnhancedLoadingSpinner({ 
  size = 'md', 
  className,
  text,
  subtext,
  showProgress = false,
  progress = 0,
  variant = 'default'
}: LoadingSpinnerProps) {
  const renderSpinner = () => {
    switch (variant) {
      case 'dots':
        return (
          <div className="flex space-x-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={cn(
                  'rounded-full bg-primary animate-pulse',
                  sizeVariants[size]
                )}
                style={{
                  animationDelay: `${i * 0.2}s`,
                  animationDuration: '1s'
                }}
              />
            ))}
          </div>
        )
      
      case 'pulse':
        return (
          <div className={cn(
            'rounded-full bg-primary animate-pulse',
            sizeVariants[size]
          )} />
        )
      
      case 'bounce':
        return (
          <div className={cn(
            'rounded-full bg-primary animate-bounce',
            sizeVariants[size]
          )} />
        )
      
      default:
        return (
          <Loader2 className={cn(
            'animate-spin text-primary',
            sizeVariants[size]
          )} />
        )
    }
  }

  return (
    <div className={cn(
      'flex flex-col items-center justify-center gap-3',
      className
    )}>
      {renderSpinner()}
      
      {text && (
        <div className="text-center space-y-1">
          <p className="text-sm font-medium text-foreground animate-pulse">
            {text}
          </p>
          {subtext && (
            <p className="text-xs text-muted-foreground">
              {subtext}
            </p>
          )}
        </div>
      )}
      
      {showProgress && (
        <div className="w-full max-w-xs space-y-1">
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-center text-muted-foreground">
            {Math.round(progress)}%
          </p>
        </div>
      )}
    </div>
  )
}

// Full page loading overlay
export interface LoadingOverlayProps {
  isVisible: boolean
  text?: string
  subtext?: string
  progress?: number
  showProgress?: boolean
  backdrop?: boolean
  onCancel?: () => void
}

export function LoadingOverlay({
  isVisible,
  text = 'Loading...',
  subtext,
  progress,
  showProgress = false,
  backdrop = true,
  onCancel
}: LoadingOverlayProps) {
  if (!isVisible) return null

  return (
    <div className={cn(
      'fixed inset-0 z-50 flex items-center justify-center',
      backdrop && 'bg-background/80 backdrop-blur-sm'
    )}>
      <Card className="w-full max-w-sm mx-4">
        <CardContent className="pt-6">
          <EnhancedLoadingSpinner
            size="lg"
            text={text}
            subtext={subtext}
            showProgress={showProgress}
            progress={progress}
          />
          {onCancel && (
            <div className="mt-4 text-center">
              <Button variant="outline" size="sm" onClick={onCancel}>
                Cancel
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// Inline loading state for components
export interface InlineLoadingProps {
  isLoading: boolean
  error?: string | null
  retry?: () => void
  children: React.ReactNode
  loadingComponent?: React.ReactNode
  errorComponent?: React.ReactNode
  emptyComponent?: React.ReactNode
  isEmpty?: boolean
  className?: string
}

export function InlineLoading({
  isLoading,
  error,
  retry,
  children,
  loadingComponent,
  errorComponent,
  emptyComponent,
  isEmpty = false,
  className
}: InlineLoadingProps) {
  if (isLoading) {
    return (
      <div className={cn('flex items-center justify-center p-8', className)}>
        {loadingComponent || (
          <EnhancedLoadingSpinner 
            text="Loading..." 
            variant="dots"
          />
        )}
      </div>
    )
  }

  if (error) {
    return (
      <div className={cn('flex flex-col items-center justify-center p-8 text-center', className)}>
        {errorComponent || (
          <>
            <AlertCircle className="h-8 w-8 text-destructive mb-3" />
            <p className="text-sm font-medium text-destructive mb-2">
              Something went wrong
            </p>
            <p className="text-xs text-muted-foreground mb-4">
              {error}
            </p>
            {retry && (
              <Button variant="outline" size="sm" onClick={retry}>
                Try Again
              </Button>
            )}
          </>
        )}
      </div>
    )
  }

  if (isEmpty) {
    return (
      <div className={cn('flex flex-col items-center justify-center p-8 text-center', className)}>
        {emptyComponent || (
          <>
            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center mb-3">
              <span className="text-xs text-muted-foreground">?</span>
            </div>
            <p className="text-sm font-medium text-muted-foreground">
              No data available
            </p>
          </>
        )}
      </div>
    )
  }

  return <>{children}</>
}

// Network status indicator
export interface NetworkStatusProps {
  isOnline: boolean
  isSlowConnection?: boolean
  className?: string
}

export function NetworkStatus({ 
  isOnline, 
  isSlowConnection = false,
  className 
}: NetworkStatusProps) {
  if (isOnline && !isSlowConnection) return null

  return (
    <div className={cn(
      'flex items-center gap-2 px-3 py-2 text-xs rounded-md',
      !isOnline 
        ? 'bg-destructive/10 text-destructive border border-destructive/20' 
        : 'bg-warning/10 text-warning border border-warning/20',
      className
    )}>
      {isOnline ? (
        <>
          <Wifi className="h-3 w-3" />
          <span>Slow connection detected</span>
        </>
      ) : (
        <>
          <WifiOff className="h-3 w-3" />
          <span>No internet connection</span>
        </>
      )}
    </div>
  )
}

// Operation status indicator
export interface OperationStatusProps {
  status: 'idle' | 'loading' | 'success' | 'error'
  message?: string
  className?: string
}

export function OperationStatus({ 
  status, 
  message,
  className 
}: OperationStatusProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'loading':
        return {
          icon: <Loader2 className="h-3 w-3 animate-spin" />,
          color: 'text-primary',
          bg: 'bg-primary/10'
        }
      case 'success':
        return {
          icon: <CheckCircle className="h-3 w-3" />,
          color: 'text-green-600',
          bg: 'bg-green-50'
        }
      case 'error':
        return {
          icon: <AlertCircle className="h-3 w-3" />,
          color: 'text-destructive',
          bg: 'bg-destructive/10'
        }
      default:
        return {
          icon: <Clock className="h-3 w-3" />,
          color: 'text-muted-foreground',
          bg: 'bg-muted'
        }
    }
  }

  if (status === 'idle') return null

  const config = getStatusConfig()

  return (
    <div className={cn(
      'flex items-center gap-2 px-2 py-1 rounded text-xs',
      config.color,
      config.bg,
      className
    )}>
      {config.icon}
      {message && <span>{message}</span>}
    </div>
  )
}

// Progressive loading for images
export interface ProgressiveImageProps {
  src: string
  alt: string
  placeholder?: string
  className?: string
  onLoad?: () => void
  onError?: () => void
}

export function ProgressiveImage({
  src,
  alt,
  placeholder,
  className,
  onLoad,
  onError
}: ProgressiveImageProps) {
  const [isLoading, setIsLoading] = React.useState(true)
  const [hasError, setHasError] = React.useState(false)
  const [imageSrc, setImageSrc] = React.useState(placeholder || '')

  React.useEffect(() => {
    const img = new Image()
    img.onload = () => {
      setImageSrc(src)
      setIsLoading(false)
      onLoad?.()
    }
    img.onerror = () => {
      setHasError(true)
      setIsLoading(false)
      onError?.()
    }
    img.src = src
  }, [src, onLoad, onError])

  if (hasError) {
    return (
      <div className={cn(
        'flex items-center justify-center bg-muted text-muted-foreground',
        className
      )}>
        <AlertCircle className="h-6 w-6" />
      </div>
    )
  }

  return (
    <div className={cn('relative', className)}>
      <img
        src={imageSrc}
        alt={alt}
        className={cn(
          'transition-opacity duration-300',
          isLoading ? 'opacity-50' : 'opacity-100',
          className
        )}
      />
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <EnhancedLoadingSpinner size="sm" variant="pulse" />
        </div>
      )}
    </div>
  )
}

// Lazy loading wrapper
export interface LazyLoadProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  threshold?: number
  rootMargin?: string
}

export function LazyLoad({
  children,
  fallback,
  threshold = 0.1,
  rootMargin = '50px'
}: LazyLoadProps) {
  const [isVisible, setIsVisible] = React.useState(false)
  const ref = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold, rootMargin }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [threshold, rootMargin])

  return (
    <div ref={ref}>
      {isVisible ? children : (fallback || <EnhancedLoadingSpinner />)}
    </div>
  )
}