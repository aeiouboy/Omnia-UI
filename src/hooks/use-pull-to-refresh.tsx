import { useCallback, useRef, useState, useEffect } from 'react'

interface UsePullToRefreshOptions {
  onRefresh: () => Promise<void> | void
  threshold?: number
  resistance?: number
  refreshTimeout?: number
}

export function usePullToRefresh({
  onRefresh,
  threshold = 80,
  resistance = 2.5,
  refreshTimeout = 2000
}: UsePullToRefreshOptions) {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [pullDistance, setPullDistance] = useState(0)
  const [isPulling, setIsPulling] = useState(false)
  
  const startY = useRef(0)
  const currentY = useRef(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (!containerRef.current) return
    
    const scrollTop = containerRef.current.scrollTop
    if (scrollTop === 0) {
      startY.current = e.touches[0].clientY
      setIsPulling(true)
    }
  }, [])

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isPulling || isRefreshing) return
    
    currentY.current = e.touches[0].clientY
    const deltaY = currentY.current - startY.current
    
    if (deltaY > 0) {
      e.preventDefault()
      const distance = Math.min(deltaY / resistance, threshold * 1.5)
      setPullDistance(distance)
    }
  }, [isPulling, isRefreshing, resistance, threshold])

  const handleTouchEnd = useCallback(async () => {
    if (!isPulling) return
    
    setIsPulling(false)
    
    if (pullDistance >= threshold && !isRefreshing) {
      setIsRefreshing(true)
      try {
        await onRefresh()
      } catch (error) {
        console.error('Pull to refresh error:', error)
      } finally {
        setTimeout(() => {
          setIsRefreshing(false)
        }, refreshTimeout)
      }
    }
    
    setPullDistance(0)
  }, [isPulling, pullDistance, threshold, isRefreshing, onRefresh, refreshTimeout])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    container.addEventListener('touchstart', handleTouchStart, { passive: false })
    container.addEventListener('touchmove', handleTouchMove, { passive: false })
    container.addEventListener('touchend', handleTouchEnd)

    return () => {
      container.removeEventListener('touchstart', handleTouchStart)
      container.removeEventListener('touchmove', handleTouchMove)
      container.removeEventListener('touchend', handleTouchEnd)
    }
  }, [handleTouchStart, handleTouchMove, handleTouchEnd])

  const pullToRefreshIndicator = pullDistance > 0 && (
    <div 
      className="absolute top-0 left-0 right-0 flex items-center justify-center bg-blue-50 transition-all duration-200 ease-out z-10"
      style={{ 
        height: Math.min(pullDistance, threshold * 1.2),
        opacity: Math.min(pullDistance / threshold, 1)
      }}
    >
      <div className="flex items-center space-x-2 text-blue-600">
        {isRefreshing ? (
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
        ) : pullDistance >= threshold ? (
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        ) : (
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        )}
        <span className="text-sm font-medium">
          {isRefreshing ? 'Refreshing...' : pullDistance >= threshold ? 'Release to refresh' : 'Pull to refresh'}
        </span>
      </div>
    </div>
  )

  return {
    containerRef,
    isRefreshing,
    pullToRefreshIndicator,
    pullDistance
  }
}
