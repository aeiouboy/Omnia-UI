import { useCallback, useRef, useState } from 'react'

interface SwipeAction {
  id: string
  label: string
  icon: React.ReactNode
  className?: string
  onAction: () => void
}

interface UseSwipeActionsOptions {
  actions: SwipeAction[]
  threshold?: number
  resetDelay?: number
}

export function useSwipeActions({
  actions,
  threshold = 80,
  resetDelay = 2000
}: UseSwipeActionsOptions) {
  const [swipeDistance, setSwipeDistance] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [activeAction, setActiveAction] = useState<SwipeAction | null>(null)
  
  const startX = useRef(0)
  const currentX = useRef(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX
    isDragging.current = true
    setIsAnimating(false)
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging.current) return
    
    currentX.current = e.touches[0].clientX
    const deltaX = currentX.current - startX.current
    
    // Only allow left swipe (negative deltaX)
    if (deltaX < 0) {
      const distance = Math.min(Math.abs(deltaX), threshold * 2)
      setSwipeDistance(distance)
      
      // Determine which action is active based on swipe distance
      const actionIndex = Math.floor(distance / threshold)
      if (actionIndex < actions.length && distance >= threshold) {
        setActiveAction(actions[actionIndex])
      } else {
        setActiveAction(null)
      }
    }
  }, [actions, threshold])

  const handleTouchEnd = useCallback(() => {
    isDragging.current = false
    
    if (swipeDistance >= threshold && activeAction) {
      setIsAnimating(true)
      activeAction.onAction()
      
      // Reset after action
      setTimeout(() => {
        setSwipeDistance(0)
        setActiveAction(null)
        setIsAnimating(false)
      }, resetDelay)
    } else {
      // Snap back if threshold not met
      setSwipeDistance(0)
      setActiveAction(null)
    }
  }, [swipeDistance, threshold, activeAction, resetDelay])

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    startX.current = e.clientX
    isDragging.current = true
    setIsAnimating(false)
  }, [])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging.current) return
    
    currentX.current = e.clientX
    const deltaX = currentX.current - startX.current
    
    if (deltaX < 0) {
      const distance = Math.min(Math.abs(deltaX), threshold * 2)
      setSwipeDistance(distance)
      
      const actionIndex = Math.floor(distance / threshold)
      if (actionIndex < actions.length && distance >= threshold) {
        setActiveAction(actions[actionIndex])
      } else {
        setActiveAction(null)
      }
    }
  }, [actions, threshold])

  const handleMouseUp = useCallback(() => {
    isDragging.current = false
    
    if (swipeDistance >= threshold && activeAction) {
      setIsAnimating(true)
      activeAction.onAction()
      
      setTimeout(() => {
        setSwipeDistance(0)
        setActiveAction(null)
        setIsAnimating(false)
      }, resetDelay)
    } else {
      setSwipeDistance(0)
      setActiveAction(null)
    }
  }, [swipeDistance, threshold, activeAction, resetDelay])

  const swipeProps = {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
    onMouseDown: handleMouseDown,
    onMouseMove: handleMouseMove,
    onMouseUp: handleMouseUp,
    style: {
      transform: `translateX(-${swipeDistance}px)`,
      transition: isAnimating || !isDragging.current ? 'transform 0.2s ease-out' : 'none'
    }
  }

  const actionsOverlay = swipeDistance > 0 && (
    <div 
      className="absolute inset-y-0 right-0 flex items-center"
      style={{ width: Math.min(swipeDistance, threshold * actions.length) }}
    >
      {actions.map((action, index) => {
        const actionWidth = threshold
        const actionLeft = index * actionWidth
        const isVisible = swipeDistance > actionLeft
        const isActive = activeAction?.id === action.id
        
        return (
          <div
            key={action.id}
            className={`absolute inset-y-0 flex items-center justify-center transition-opacity duration-200 ${
              action.className || 'bg-red-500 text-white'
            } ${isActive ? 'bg-opacity-100' : 'bg-opacity-80'}`}
            style={{
              left: actionLeft,
              width: actionWidth,
              opacity: isVisible ? 1 : 0
            }}
          >
            <div className="flex flex-col items-center space-y-1">
              {action.icon}
              <span className="text-xs font-medium">{action.label}</span>
            </div>
          </div>
        )
      })}
    </div>
  )

  return {
    containerRef,
    swipeProps,
    actionsOverlay,
    isAnimating,
    swipeDistance,
    activeAction
  }
}
