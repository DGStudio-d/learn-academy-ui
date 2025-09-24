import React, { Component, ErrorInfo, ReactNode } from 'react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, RefreshCw, Home, Bug, Copy, CheckCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { toast } from '@/hooks/use-toast'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  level?: 'page' | 'component' | 'critical'
  resetKeys?: Array<string | number>
  resetOnPropsChange?: boolean
  isolate?: boolean
}

interface State {
  hasError: boolean
  error?: Error
  errorInfo?: ErrorInfo
  retryCount: number
  errorId: string
}

export class ErrorBoundary extends Component<Props, State> {
  private retryTimeoutId: NodeJS.Timeout | null = null
  private maxRetries = 3
  private retryDelay = 1000

  public state: State = {
    hasError: false,
    retryCount: 0,
    errorId: ''
  }

  public static getDerivedStateFromError(error: Error): State {
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    return { 
      hasError: true, 
      error,
      retryCount: 0,
      errorId
    }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    
    this.setState({
      error,
      errorInfo
    })

    // Call optional error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }

    // Send error to monitoring service
    this.reportError(error, errorInfo)
  }

  public componentDidUpdate(prevProps: Props) {
    const { resetKeys, resetOnPropsChange } = this.props
    const { hasError } = this.state

    if (hasError && prevProps.resetKeys !== resetKeys) {
      if (resetKeys?.some((key, idx) => prevProps.resetKeys?.[idx] !== key)) {
        this.resetErrorBoundary()
      }
    }

    if (hasError && resetOnPropsChange && prevProps.children !== this.props.children) {
      this.resetErrorBoundary()
    }
  }

  public componentWillUnmount() {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId)
    }
  }

  private reportError = (error: Error, errorInfo: ErrorInfo) => {
    const errorReport = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      errorId: this.state.errorId,
      level: this.props.level || 'component',
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      userId: localStorage.getItem('user_id') || 'anonymous'
    }

    // Send to monitoring service in production
    if (process.env.NODE_ENV === 'production') {
      // analytics.track('error_boundary_triggered', errorReport)
      console.error('Error Report:', errorReport)
    }

    // Dispatch custom event for global error handling
    window.dispatchEvent(new CustomEvent('error:boundary', {
      detail: errorReport
    }))
  }

  private resetErrorBoundary = () => {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId)
    }
    this.setState({ 
      hasError: false, 
      error: undefined, 
      errorInfo: undefined,
      retryCount: 0
    })
  }

  private handleRetry = () => {
    const { retryCount } = this.state
    
    if (retryCount >= this.maxRetries) {
      toast({
        title: 'Maximum retries reached',
        description: 'Please reload the page or contact support if the problem persists.',
        variant: 'destructive'
      })
      return
    }

    this.setState({ retryCount: retryCount + 1 })
    
    // Add delay before retry to prevent rapid retries
    this.retryTimeoutId = setTimeout(() => {
      this.resetErrorBoundary()
    }, this.retryDelay * (retryCount + 1))

    toast({
      title: 'Retrying...',
      description: `Attempt ${retryCount + 1} of ${this.maxRetries}`,
      duration: 2000
    })
  }

  private handleReload = () => {
    window.location.reload()
  }

  private copyErrorDetails = async () => {
    const errorDetails = {
      error: this.state.error?.message,
      stack: this.state.error?.stack,
      errorId: this.state.errorId,
      timestamp: new Date().toISOString()
    }

    try {
      await navigator.clipboard.writeText(JSON.stringify(errorDetails, null, 2))
      toast({
        title: 'Error details copied',
        description: 'Error information has been copied to clipboard',
        duration: 2000
      })
    } catch (err) {
      console.error('Failed to copy error details:', err)
    }
  }

  public render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback
      }

      const { level = 'component', isolate = false } = this.props
      const { retryCount, errorId } = this.state
      const canRetry = retryCount < this.maxRetries

      // Component-level error (smaller, inline error)
      if (level === 'component') {
        return (
          <div className={`p-4 border border-destructive/20 rounded-lg bg-destructive/5 ${isolate ? 'min-h-[200px] flex items-center justify-center' : ''}`}>
            <div className="text-center space-y-3">
              <div className="flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-destructive mr-2" />
                <span className="text-sm font-medium text-destructive">Component Error</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {this.state.error?.message || 'This component encountered an error'}
              </p>
              <div className="flex gap-2 justify-center">
                {canRetry && (
                  <Button size="sm" variant="outline" onClick={this.handleRetry}>
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Retry ({this.maxRetries - retryCount} left)
                  </Button>
                )}
                {process.env.NODE_ENV === 'development' && (
                  <Button size="sm" variant="ghost" onClick={this.copyErrorDetails}>
                    <Bug className="h-3 w-3 mr-1" />
                    Debug
                  </Button>
                )}
              </div>
            </div>
          </div>
        )
      }

      // Page-level or critical error (full screen)
      const isFullScreen = level === 'page' || level === 'critical'
      
      return (
        <div className={`${isFullScreen ? 'min-h-screen' : 'min-h-[400px]'} bg-background flex items-center justify-center p-4`}>
          <Card className="w-full max-w-lg">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
              <CardTitle className="text-xl">
                {level === 'critical' ? 'Critical Error' : 'Something went wrong'}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Error ID: {errorId}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Error Details</AlertTitle>
                <AlertDescription className="mt-2">
                  {this.state.error?.message || 'An unexpected error occurred'}
                </AlertDescription>
              </Alert>

              {/* Retry information */}
              {retryCount > 0 && (
                <Alert>
                  <RefreshCw className="h-4 w-4" />
                  <AlertTitle>Retry Attempts</AlertTitle>
                  <AlertDescription>
                    Attempted {retryCount} of {this.maxRetries} retries
                  </AlertDescription>
                </Alert>
              )}

              {/* Development-only error details */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="text-xs">
                  <summary className="cursor-pointer font-medium text-muted-foreground">
                    Stack Trace (Development)
                  </summary>
                  <pre className="mt-2 whitespace-pre-wrap bg-muted p-2 rounded text-xs overflow-auto max-h-32">
                    {this.state.error.stack}
                  </pre>
                  {this.state.errorInfo && (
                    <pre className="mt-2 whitespace-pre-wrap bg-muted p-2 rounded text-xs overflow-auto max-h-32">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  )}
                </details>
              )}

              <div className="flex flex-col sm:flex-row gap-3">
                {canRetry && (
                  <Button onClick={this.handleRetry} className="flex-1">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Try Again ({this.maxRetries - retryCount} left)
                  </Button>
                )}
                <Button variant="outline" onClick={this.handleReload} className="flex-1">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reload Page
                </Button>
              </div>

              <div className="flex justify-center gap-2">
                <Button variant="ghost" onClick={this.copyErrorDetails}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Error Details
                </Button>
                {isFullScreen && (
                  <Button variant="ghost" asChild>
                    <Link to="/">
                      <Home className="h-4 w-4 mr-2" />
                      Go Home
                    </Link>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}

// Hook version for functional components
export function useErrorBoundary() {
  return (error: Error) => {
    throw error
  }
}

// Specialized error boundaries for different contexts
export function AsyncErrorBoundary({ children, ...props }: Props) {
  return (
    <ErrorBoundary
      level="component"
      isolate
      onError={(error, errorInfo) => {
        console.error('Async operation failed:', error, errorInfo)
      }}
      {...props}
    >
      {children}
    </ErrorBoundary>
  )
}

export function CriticalErrorBoundary({ children, ...props }: Props) {
  return (
    <ErrorBoundary
      level="critical"
      resetOnPropsChange={false}
      onError={(error, errorInfo) => {
        console.error('Critical error occurred:', error, errorInfo)
        // Could send to error reporting service immediately
      }}
      {...props}
    >
      {children}
    </ErrorBoundary>
  )
}

export function ComponentErrorBoundary({ children, ...props }: Props) {
  return (
    <ErrorBoundary
      level="component"
      resetOnPropsChange
      {...props}
    >
      {children}
    </ErrorBoundary>
  )
}