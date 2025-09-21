import { useEffect, useState } from 'react'
import { usePerformanceOptimization, useWebVitals, useMemoryMonitor } from '../../hooks/usePerformanceOptimization'

interface PerformanceStats {
  renderTime: number
  memoryUsage: { used: number; total: number; limit: number } | null
  coreWebVitals: Record<string, number>
}

export function PerformanceMonitor() {
  const [stats, setStats] = useState<PerformanceStats>({
    renderTime: 0,
    memoryUsage: null,
    coreWebVitals: {}
  })
  const [isVisible, setIsVisible] = useState(false)
  
  const { renderCount } = usePerformanceOptimization()
  const { getMemoryUsage } = useMemoryMonitor()
  
  // Only show in development
  useEffect(() => {
    setIsVisible(process.env.NODE_ENV === 'development')
  }, [])

  // Update stats periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        memoryUsage: getMemoryUsage(),
        renderTime: performance.now()
      }))
    }, 5000)

    return () => clearInterval(interval)
  }, [getMemoryUsage])

  // Initialize web vitals monitoring
  useWebVitals()

  if (!isVisible) return null

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg text-xs font-mono z-50 max-w-xs">
      <div className="font-bold mb-2">Performance Monitor</div>
      
      <div className="space-y-1">
        <div>Renders: {renderCount}</div>
        
        {stats.memoryUsage && (
          <div>
            Memory: {stats.memoryUsage.used}MB / {stats.memoryUsage.total}MB
          </div>
        )}
        
        <div>
          Network: {navigator.onLine ? 'Online' : 'Offline'}
        </div>
        
        <div>
          Connection: {(navigator as any).connection?.effectiveType || 'unknown'}
        </div>
      </div>
      
      <button
        onClick={() => setIsVisible(false)}
        className="mt-2 text-gray-400 hover:text-white"
      >
        Hide
      </button>
    </div>
  )
}