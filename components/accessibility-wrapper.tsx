"use client"

import React, { useEffect } from "react"
import { useKeyboardNavigation, announceToScreenReader, SkipLink } from "@/hooks/use-keyboard-navigation"

interface AccessibilityWrapperProps {
  children: React.ReactNode
  pageTitle: string
  onEscape?: () => void
  trapFocus?: boolean
  className?: string
}

export function AccessibilityWrapper({ 
  children, 
  pageTitle, 
  onEscape,
  trapFocus = false,
  className = ""
}: AccessibilityWrapperProps) {
  const { containerRef, focusFirstElement, saveFocus, restoreFocus } = useKeyboardNavigation({
    onEscape,
    trapFocus,
    onArrowKeys: (direction) => {
      // Handle arrow key navigation for dashboard cards
      if (direction === 'down' || direction === 'up') {
        const cards = document.querySelectorAll('[data-focusable-card]')
        const currentIndex = Array.from(cards).findIndex(card => 
          card.contains(document.activeElement)
        )
        
        if (currentIndex !== -1) {
          let nextIndex: number
          if (direction === 'down') {
            nextIndex = currentIndex + 1 < cards.length ? currentIndex + 1 : 0
          } else {
            nextIndex = currentIndex - 1 >= 0 ? currentIndex - 1 : cards.length - 1
          }
          
          const nextCard = cards[nextIndex] as HTMLElement
          const focusableElement = nextCard.querySelector('button, [tabindex="0"], a') as HTMLElement
          focusableElement?.focus()
        }
      }
    }
  })

  // Announce page changes to screen readers
  useEffect(() => {
    const timeout = setTimeout(() => {
      announceToScreenReader(`${pageTitle} page loaded`, "polite")
    }, 100)

    return () => clearTimeout(timeout)
  }, [pageTitle])

  // Handle focus management for modals/dialogs
  useEffect(() => {
    if (trapFocus) {
      saveFocus()
      focusFirstElement()
      
      return () => {
        restoreFocus()
      }
    }
  }, [trapFocus, saveFocus, focusFirstElement, restoreFocus])

  return (
    <div 
      ref={containerRef}
      className={className}
      role="main"
      aria-label={pageTitle}
    >
      {/* Skip Links */}
      <SkipLink href="#main-content">Skip to main content</SkipLink>
      <SkipLink href="#navigation">Skip to navigation</SkipLink>
      
      {/* Page Header for Screen Readers */}
      <h1 className="sr-only">{pageTitle}</h1>
      
      {/* Main Content */}
      <div id="main-content" tabIndex={-1}>
        {children}
      </div>
      
      {/* Live Region for Dynamic Announcements */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        id="live-region"
      />
      
      {/* Assertive Live Region for Important Announcements */}
      <div
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
        id="assertive-live-region"
      />
    </div>
  )
}

// Enhanced Card component with accessibility features
interface AccessibleCardProps {
  children: React.ReactNode
  title: string
  description?: string
  onClick?: () => void
  isSelected?: boolean
  isLoading?: boolean
  className?: string
}

export function AccessibleCard({
  children,
  title,
  description,
  onClick,
  isSelected = false,
  isLoading = false,
  className = ""
}: AccessibleCardProps) {
  const cardProps = onClick ? {
    role: "button",
    tabIndex: 0,
    onClick,
    onKeyDown: (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        onClick()
      }
    },
    "aria-pressed": isSelected,
    "data-focusable-card": true
  } : {
    "data-focusable-card": true
  }

  return (
    <div
      className={`
        ${className}
        ${onClick ? 'cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2' : ''}
        ${isSelected ? 'ring-2 ring-blue-500' : ''}
        transition-all duration-200
      `}
      aria-label={title}
      aria-describedby={description ? `${title}-description` : undefined}
      aria-busy={isLoading}
      {...cardProps}
    >
      {/* Hidden title for screen readers */}
      <h2 className="sr-only">{title}</h2>
      
      {/* Hidden description for screen readers */}
      {description && (
        <p className="sr-only" id={`${title}-description`}>
          {description}
        </p>
      )}
      
      {/* Loading state announcement */}
      {isLoading && (
        <span className="sr-only">Loading {title} data</span>
      )}
      
      {children}
    </div>
  )
}

// Enhanced Button component with accessibility features
interface AccessibleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'destructive'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  loadingText?: string
  announceOnClick?: string
}

export function AccessibleButton({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  loadingText = "Loading",
  announceOnClick,
  onClick,
  disabled,
  className = "",
  ...props
}: AccessibleButtonProps) {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (announceOnClick) {
      announceToScreenReader(announceOnClick, "polite")
    }
    onClick?.(e)
  }

  const baseClasses = "min-h-[44px] min-w-[44px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200"
  
  const variantClasses = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300",
    secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200 disabled:bg-gray-50",
    destructive: "bg-red-600 text-white hover:bg-red-700 disabled:bg-gray-300"
  }

  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg"
  }

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      disabled={disabled || isLoading}
      onClick={handleClick}
      aria-busy={isLoading}
      aria-describedby={isLoading ? `${props.id}-loading` : undefined}
      {...props}
    >
      {isLoading ? (
        <>
          <span aria-hidden="true" className="animate-spin mr-2">⟳</span>
          {loadingText}
          <span className="sr-only">Please wait, {loadingText.toLowerCase()}</span>
        </>
      ) : (
        children
      )}
    </button>
  )
}

// Enhanced Table component with accessibility features
interface AccessibleTableProps {
  children: React.ReactNode
  caption: string
  className?: string
}

export function AccessibleTable({ children, caption, className = "" }: AccessibleTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className={`w-full ${className}`} role="table">
        <caption className="sr-only">{caption}</caption>
        {children}
      </table>
    </div>
  )
}

// Enhanced Form component with accessibility features
interface AccessibleFormProps {
  children: React.ReactNode
  onSubmit: (e: React.FormEvent) => void
  title: string
  description?: string
  className?: string
}

export function AccessibleForm({ 
  children, 
  onSubmit, 
  title, 
  description, 
  className = "" 
}: AccessibleFormProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    announceToScreenReader("Form submitted", "assertive")
    onSubmit(e)
  }

  return (
    <form 
      onSubmit={handleSubmit}
      className={className}
      role="form"
      aria-labelledby="form-title"
      aria-describedby={description ? "form-description" : undefined}
    >
      <h2 id="form-title" className="sr-only">{title}</h2>
      {description && (
        <p id="form-description" className="sr-only">{description}</p>
      )}
      {children}
    </form>
  )
}