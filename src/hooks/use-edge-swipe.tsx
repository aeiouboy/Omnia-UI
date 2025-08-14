"use client"

import { useEffect } from "react"

interface EdgeSwipeOptions {
  onSwipeFromLeftEdge?: () => void
  onSwipeFromRightEdge?: () => void
  edgeThreshold?: number // Distance from edge to trigger
  swipeThreshold?: number // Minimum swipe distance
}

export function useEdgeSwipe(options: EdgeSwipeOptions) {
  const { onSwipeFromLeftEdge, onSwipeFromRightEdge, edgeThreshold = 20, swipeThreshold = 50 } = options

  useEffect(() => {
    let touchStart: { x: number; y: number; time: number } | null = null

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0]
      const { clientX, clientY } = touch
      const { innerWidth } = window

      // Check if touch started near the edges
      const isLeftEdge = clientX <= edgeThreshold
      const isRightEdge = clientX >= innerWidth - edgeThreshold

      if (isLeftEdge || isRightEdge) {
        touchStart = {
          x: clientX,
          y: clientY,
          time: Date.now(),
        }
      }
    }

    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchStart) return

      const touch = e.changedTouches[0]
      const deltaX = touch.clientX - touchStart.x
      const deltaY = touch.clientY - touchStart.y
      const deltaTime = Date.now() - touchStart.time

      // Check if it's a valid swipe
      if (deltaTime > 500) return // Too slow
      if (Math.abs(deltaX) < swipeThreshold) return // Too short
      if (Math.abs(deltaY) > Math.abs(deltaX)) return // More vertical than horizontal

      // Determine swipe direction and edge
      const isFromLeftEdge = touchStart.x <= edgeThreshold
      const isFromRightEdge = touchStart.x >= window.innerWidth - edgeThreshold

      if (isFromLeftEdge && deltaX > 0) {
        // Swipe right from left edge
        onSwipeFromLeftEdge?.()
      } else if (isFromRightEdge && deltaX < 0) {
        // Swipe left from right edge
        onSwipeFromRightEdge?.()
      }

      touchStart = null
    }

    const handleTouchMove = (e: TouchEvent) => {
      // Prevent default to avoid page scrolling during swipe
      if (touchStart) {
        e.preventDefault()
      }
    }

    // Add event listeners to document to catch edge swipes
    document.addEventListener("touchstart", handleTouchStart, { passive: true })
    document.addEventListener("touchend", handleTouchEnd, { passive: true })
    document.addEventListener("touchmove", handleTouchMove, { passive: false })

    return () => {
      document.removeEventListener("touchstart", handleTouchStart)
      document.removeEventListener("touchend", handleTouchEnd)
      document.removeEventListener("touchmove", handleTouchMove)
    }
  }, [onSwipeFromLeftEdge, onSwipeFromRightEdge, edgeThreshold, swipeThreshold])
}
