import { useCallback, useRef, useState } from 'react'

interface UseSwipeTabsOptions {
  tabs: string[]
  activeTab: string
  onTabChange: (tab: string) => void
  threshold?: number
}

export function useSwipeTabs({
  tabs,
  activeTab,
  onTabChange,
  threshold = 50
}: UseSwipeTabsOptions) {
  const [swipeDistance, setSwipeDistance] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  
  const startX = useRef(0)
  const currentX = useRef(0)
  const isDragging = useRef(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const currentTabIndex = tabs.indexOf(activeTab)

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX
    isDragging.current = true
    setIsAnimating(false)
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging.current) return
    
    currentX.current = e.touches[0].clientX
    const deltaX = currentX.current - startX.current
    
    // Limit swipe distance based on available tabs
    const maxSwipeDistance = threshold * 2
    const clampedDistance = Math.max(-maxSwipeDistance, Math.min(maxSwipeDistance, deltaX))
    
    setSwipeDistance(clampedDistance)
  }, [threshold])

  const handleTouchEnd = useCallback(() => {
    isDragging.current = false
    
    if (Math.abs(swipeDistance) >= threshold) {
      const direction = swipeDistance > 0 ? -1 : 1 // Swipe right goes to previous, swipe left goes to next
      const newIndex = currentTabIndex + direction
      
      if (newIndex >= 0 && newIndex < tabs.length) {
        setIsAnimating(true)
        onTabChange(tabs[newIndex])
        
        setTimeout(() => {
          setIsAnimating(false)
        }, 300)
      }
    }
    
    setSwipeDistance(0)
  }, [swipeDistance, threshold, currentTabIndex, tabs, onTabChange])

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    startX.current = e.clientX
    isDragging.current = true
    setIsAnimating(false)
  }, [])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging.current) return
    
    currentX.current = e.clientX
    const deltaX = currentX.current - startX.current
    
    const maxSwipeDistance = threshold * 2
    const clampedDistance = Math.max(-maxSwipeDistance, Math.min(maxSwipeDistance, deltaX))
    
    setSwipeDistance(clampedDistance)
  }, [threshold])

  const handleMouseUp = useCallback(() => {
    isDragging.current = false
    
    if (Math.abs(swipeDistance) >= threshold) {
      const direction = swipeDistance > 0 ? -1 : 1
      const newIndex = currentTabIndex + direction
      
      if (newIndex >= 0 && newIndex < tabs.length) {
        setIsAnimating(true)
        onTabChange(tabs[newIndex])
        
        setTimeout(() => {
          setIsAnimating(false)
        }, 300)
      }
    }
    
    setSwipeDistance(0)
  }, [swipeDistance, threshold, currentTabIndex, tabs, onTabChange])

  const swipeProps = {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
    onMouseDown: handleMouseDown,
    onMouseMove: handleMouseMove,
    onMouseUp: handleMouseUp,
    style: {
      transform: `translateX(${swipeDistance}px)`,
      transition: isAnimating || !isDragging.current ? 'transform 0.3s ease-out' : 'none'
    }
  }

  const swipeIndicator = Math.abs(swipeDistance) > 10 && (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
      <div className={`
        px-4 py-2 rounded-full text-sm font-medium shadow-lg transition-opacity duration-200
        ${swipeDistance > threshold 
          ? 'bg-blue-500 text-white opacity-90' 
          : swipeDistance < -threshold
          ? 'bg-blue-500 text-white opacity-90'
          : 'bg-gray-200 text-gray-600 opacity-60'
        }
      `}>
        {swipeDistance > 0 
          ? currentTabIndex > 0 ? `← ${tabs[currentTabIndex - 1]}` : '← No previous tab'
          : currentTabIndex < tabs.length - 1 ? `${tabs[currentTabIndex + 1]} →` : 'No next tab →'
        }
      </div>
    </div>
  )

  return {
    containerRef,
    swipeProps,
    swipeIndicator,
    isAnimating,
    swipeDistance
  }
}