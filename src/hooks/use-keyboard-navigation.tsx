"use client"

import { useEffect, useCallback, useRef } from "react"

interface KeyboardNavigationConfig {
  containerId?: string
  focusableSelector?: string
  onEscape?: () => void
  onEnter?: () => void
  onTab?: (direction: 'forward' | 'backward') => void
  onArrowKeys?: (direction: 'up' | 'down' | 'left' | 'right') => void
  trapFocus?: boolean
}

const defaultFocusableSelector = `
  button:not([disabled]),
  [href],
  input:not([disabled]),
  select:not([disabled]),
  textarea:not([disabled]),
  [tabindex]:not([tabindex="-1"]):not([disabled]),
  [contenteditable]:not([contenteditable="false"])
`

export function useKeyboardNavigation(config: KeyboardNavigationConfig = {}) {
  const {
    containerId,
    focusableSelector = defaultFocusableSelector,
    onEscape,
    onEnter,
    onTab,
    onArrowKeys,
    trapFocus = false
  } = config

  const containerRef = useRef<HTMLDivElement | null>(null)
  const lastFocusedElement = useRef<HTMLElement | null>(null)

  // Get all focusable elements within container
  const getFocusableElements = useCallback((): HTMLElement[] => {
    const container = containerId 
      ? document.getElementById(containerId)
      : containerRef.current
    
    if (!container) return []

    const elements = container.querySelectorAll(focusableSelector)
    return Array.from(elements).filter((el): el is HTMLElement => {
      return el instanceof HTMLElement && 
             !el.hasAttribute('disabled') &&
             !el.hasAttribute('aria-hidden') &&
             el.offsetParent !== null // Visible element check
    })
  }, [containerId, focusableSelector])

  // Focus first focusable element
  const focusFirstElement = useCallback(() => {
    const focusableElements = getFocusableElements()
    if (focusableElements.length > 0) {
      focusableElements[0].focus()
    }
  }, [getFocusableElements])

  // Focus last focusable element
  const focusLastElement = useCallback(() => {
    const focusableElements = getFocusableElements()
    if (focusableElements.length > 0) {
      focusableElements[focusableElements.length - 1].focus()
    }
  }, [getFocusableElements])

  // Move focus to next/previous element
  const moveFocus = useCallback((direction: 'next' | 'previous') => {
    const focusableElements = getFocusableElements()
    if (focusableElements.length === 0) return

    const currentIndex = focusableElements.indexOf(document.activeElement as HTMLElement)
    let nextIndex: number

    if (direction === 'next') {
      nextIndex = currentIndex === focusableElements.length - 1 ? 0 : currentIndex + 1
    } else {
      nextIndex = currentIndex === 0 ? focusableElements.length - 1 : currentIndex - 1
    }

    focusableElements[nextIndex]?.focus()
  }, [getFocusableElements])

  // Handle keyboard events
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const { key, shiftKey, ctrlKey, metaKey } = event

    // Skip if modifier keys are pressed (except Shift for Tab)
    if ((ctrlKey || metaKey) && key !== 'Tab') return

    switch (key) {
      case 'Escape':
        if (onEscape) {
          event.preventDefault()
          onEscape()
        }
        break

      case 'Enter':
        if (onEnter && document.activeElement) {
          event.preventDefault()
          onEnter()
        }
        break

      case 'Tab':
        if (trapFocus) {
          const focusableElements = getFocusableElements()
          if (focusableElements.length > 0) {
            const firstElement = focusableElements[0]
            const lastElement = focusableElements[focusableElements.length - 1]

            if (shiftKey && document.activeElement === firstElement) {
              event.preventDefault()
              lastElement.focus()
            } else if (!shiftKey && document.activeElement === lastElement) {
              event.preventDefault()
              firstElement.focus()
            }
          }
        }
        
        if (onTab) {
          onTab(shiftKey ? 'backward' : 'forward')
        }
        break

      case 'ArrowUp':
      case 'ArrowDown':
      case 'ArrowLeft':
      case 'ArrowRight':
        if (onArrowKeys) {
          event.preventDefault()
          const direction = key.replace('Arrow', '').toLowerCase() as 'up' | 'down' | 'left' | 'right'
          onArrowKeys(direction)
        }
        break

      default:
        break
    }
  }, [onEscape, onEnter, onTab, onArrowKeys, trapFocus, getFocusableElements])

  // Set up keyboard event listener
  useEffect(() => {
    const container = containerId
      ? document.getElementById(containerId)
      : containerRef.current || document

    if (container) {
      container.addEventListener('keydown', handleKeyDown as EventListener)
      return () => container.removeEventListener('keydown', handleKeyDown as EventListener)
    }
  }, [containerId, handleKeyDown])

  // Store last focused element before focus trap
  const saveFocus = useCallback(() => {
    lastFocusedElement.current = document.activeElement as HTMLElement
  }, [])

  // Restore focus to last focused element
  const restoreFocus = useCallback(() => {
    if (lastFocusedElement.current) {
      lastFocusedElement.current.focus()
      lastFocusedElement.current = null
    }
  }, [])

  return {
    containerRef,
    focusFirstElement,
    focusLastElement,
    moveFocus,
    getFocusableElements,
    saveFocus,
    restoreFocus
  }
}

// Screen reader announcements
export function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite') {
  const announcement = document.createElement('div')
  announcement.setAttribute('aria-live', priority)
  announcement.setAttribute('aria-atomic', 'true')
  announcement.className = 'sr-only'
  announcement.textContent = message

  document.body.appendChild(announcement)

  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcement)
  }, 1000)
}

// Skip link component for keyboard navigation
export function SkipLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-md focus:shadow-lg"
      onFocus={(e) => {
        // Announce skip link activation to screen readers
        announceToScreenReader("Skip link activated", "assertive")
      }}
    >
      {children}
    </a>
  )
}
