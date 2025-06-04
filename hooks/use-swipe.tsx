"use client"

import { useEffect, useRef } from "react"

interface SwipeHandlers {
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onSwipeUp?: () => void
  onSwipeDown?: () => void
}

interface SwipeOptions {
  threshold?: number // Minimum distance for a swipe
  preventDefaultTouchmoveEvent?: boolean
  trackMouse?: boolean
}

export function useSwipe(handlers: SwipeHandlers, options: SwipeOptions = {}) {
  const { threshold = 50, preventDefaultTouchmoveEvent = false, trackMouse = false } = options

  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null)
  const elementRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0]
      touchStartRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now(),
      }
    }

    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchStartRef.current) return

      const touch = e.changedTouches[0]
      const deltaX = touch.clientX - touchStartRef.current.x
      const deltaY = touch.clientY - touchStartRef.current.y
      const deltaTime = Date.now() - touchStartRef.current.time

      // Check if it's a valid swipe (not too slow, and distance is above threshold)
      if (deltaTime > 500) return // Too slow
      if (Math.abs(deltaX) < threshold && Math.abs(deltaY) < threshold) return // Too short

      // Determine swipe direction
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Horizontal swipe
        if (deltaX > 0) {
          handlers.onSwipeRight?.()
        } else {
          handlers.onSwipeLeft?.()
        }
      } else {
        // Vertical swipe
        if (deltaY > 0) {
          handlers.onSwipeDown?.()
        } else {
          handlers.onSwipeUp?.()
        }
      }

      touchStartRef.current = null
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (preventDefaultTouchmoveEvent) {
        e.preventDefault()
      }
    }

    // Mouse events for testing on desktop
    const handleMouseDown = (e: MouseEvent) => {
      if (!trackMouse) return
      touchStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        time: Date.now(),
      }
    }

    const handleMouseUp = (e: MouseEvent) => {
      if (!trackMouse || !touchStartRef.current) return

      const deltaX = e.clientX - touchStartRef.current.x
      const deltaY = e.clientY - touchStartRef.current.y
      const deltaTime = Date.now() - touchStartRef.current.time

      if (deltaTime > 500) return
      if (Math.abs(deltaX) < threshold && Math.abs(deltaY) < threshold) return

      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        if (deltaX > 0) {
          handlers.onSwipeRight?.()
        } else {
          handlers.onSwipeLeft?.()
        }
      } else {
        if (deltaY > 0) {
          handlers.onSwipeDown?.()
        } else {
          handlers.onSwipeUp?.()
        }
      }

      touchStartRef.current = null
    }

    // Add event listeners
    element.addEventListener("touchstart", handleTouchStart, { passive: true })
    element.addEventListener("touchend", handleTouchEnd, { passive: true })
    element.addEventListener("touchmove", handleTouchMove, { passive: !preventDefaultTouchmoveEvent })

    if (trackMouse) {
      element.addEventListener("mousedown", handleMouseDown)
      element.addEventListener("mouseup", handleMouseUp)
    }

    return () => {
      element.removeEventListener("touchstart", handleTouchStart)
      element.removeEventListener("touchend", handleTouchEnd)
      element.removeEventListener("touchmove", handleTouchMove)
      if (trackMouse) {
        element.removeEventListener("mousedown", handleMouseDown)
        element.removeEventListener("mouseup", handleMouseUp)
      }
    }
  }, [handlers, threshold, preventDefaultTouchmoveEvent, trackMouse])

  return elementRef
}
