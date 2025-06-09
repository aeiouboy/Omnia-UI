import React from 'react'
import { useSwipeActions } from '@/hooks/use-swipe-actions'

interface SwipeAction {
  id: string
  label: string
  icon: React.ReactNode
  className?: string
  onAction: () => void
}

interface SwipeableListItemProps {
  children: React.ReactNode
  actions: SwipeAction[]
  className?: string
  threshold?: number
}

export function SwipeableListItem({
  children,
  actions,
  className = '',
  threshold = 80
}: SwipeableListItemProps) {
  const { containerRef, swipeProps, actionsOverlay } = useSwipeActions({
    actions,
    threshold
  })

  return (
    <div 
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
    >
      <div 
        className="w-full bg-white select-none"
        {...swipeProps}
      >
        {children}
      </div>
      {actionsOverlay}
    </div>
  )
}

export type { SwipeAction }