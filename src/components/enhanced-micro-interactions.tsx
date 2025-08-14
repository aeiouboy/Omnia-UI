"use client"

import React from "react"
import { cn } from "@/lib/utils"

interface InteractiveCardProps {
  children: React.ReactNode
  className?: string
  hoverScale?: boolean
  hoverGlow?: boolean
  rippleEffect?: boolean
  onClick?: () => void
}

export function InteractiveCard({
  children,
  className,
  hoverScale = true,
  hoverGlow = true,
  rippleEffect = false,
  onClick
}: InteractiveCardProps) {
  const [ripples, setRipples] = React.useState<{ x: number; y: number; id: number }[]>([])

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (rippleEffect) {
      const rect = e.currentTarget.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      const id = Date.now()

      setRipples(prev => [...prev, { x, y, id }])

      // Remove ripple after animation
      setTimeout(() => {
        setRipples(prev => prev.filter(ripple => ripple.id !== id))
      }, 600)
    }

    onClick?.()
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden transition-all duration-300 cursor-pointer",
        hoverScale && "hover:scale-[1.02] active:scale-[0.98]",
        hoverGlow && "hover:shadow-2xl hover:shadow-blue-500/10",
        "focus:ring-2 focus:ring-blue-500/20 focus:outline-none",
        className
      )}
      onClick={handleClick}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && onClick) {
          e.preventDefault()
          onClick()
        }
      }}
    >
      {children}
      
      {/* Ripple effects */}
      {rippleEffect && ripples.map(ripple => (
        <span
          key={ripple.id}
          className="absolute rounded-full bg-blue-400/30 animate-ping pointer-events-none"
          style={{
            left: ripple.x - 10,
            top: ripple.y - 10,
            width: 20,
            height: 20,
            animationDuration: '600ms'
          }}
        />
      ))}
    </div>
  )
}

interface PulseIndicatorProps {
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function PulseIndicator({ 
  color = 'blue', 
  size = 'md', 
  className 
}: PulseIndicatorProps) {
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500',
    purple: 'bg-purple-500'
  }

  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  }

  return (
    <div className={cn("relative inline-block", className)}>
      <div 
        className={cn(
          "rounded-full animate-pulse",
          colorClasses[color],
          sizeClasses[size]
        )}
      />
      <div 
        className={cn(
          "absolute inset-0 rounded-full animate-ping opacity-75",
          colorClasses[color],
          sizeClasses[size]
        )}
      />
    </div>
  )
}

interface FloatingActionButtonProps {
  icon: React.ReactNode
  onClick: () => void
  label: string
  color?: 'primary' | 'success' | 'warning' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
}

export function FloatingActionButton({
  icon,
  onClick,
  label,
  color = 'primary',
  size = 'md',
  position = 'bottom-right'
}: FloatingActionButtonProps) {
  const colorClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/25',
    success: 'bg-green-600 hover:bg-green-700 text-white shadow-green-500/25',
    warning: 'bg-yellow-600 hover:bg-yellow-700 text-white shadow-yellow-500/25',
    danger: 'bg-red-600 hover:bg-red-700 text-white shadow-red-500/25'
  }

  const sizeClasses = {
    sm: 'w-12 h-12 text-sm',
    md: 'w-14 h-14 text-base',
    lg: 'w-16 h-16 text-lg'
  }

  const positionClasses = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'top-right': 'top-6 right-6',
    'top-left': 'top-6 left-6'
  }

  return (
    <button
      onClick={onClick}
      aria-label={label}
      className={cn(
        "fixed z-50 rounded-full shadow-lg transition-all duration-300",
        "hover:scale-110 active:scale-95 focus:ring-4 focus:ring-offset-2 focus:outline-none",
        "group relative overflow-hidden backdrop-blur-sm",
        colorClasses[color],
        sizeClasses[size],
        positionClasses[position]
      )}
    >
      <div className="flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
        {icon}
      </div>
      
      {/* Tooltip */}
      <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 px-3 py-1 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none">
        {label}
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-gray-900" />
      </div>
    </button>
  )
}

interface ProgressiveImageProps {
  src: string
  alt: string
  className?: string
  placeholder?: string
}

export function ProgressiveImage({ 
  src, 
  alt, 
  className, 
  placeholder = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect width='100' height='100' fill='%23f3f4f6'/%3E%3C/svg%3E" 
}: ProgressiveImageProps) {
  const [isLoaded, setIsLoaded] = React.useState(false)
  const [error, setError] = React.useState(false)

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {/* Placeholder */}
      <img
        src={placeholder}
        alt=""
        className={cn(
          "absolute inset-0 w-full h-full object-cover transition-opacity duration-500",
          isLoaded ? "opacity-0" : "opacity-100"
        )}
      />
      
      {/* Actual image */}
      <img
        src={src}
        alt={alt}
        onLoad={() => setIsLoaded(true)}
        onError={() => setError(true)}
        className={cn(
          "w-full h-full object-cover transition-all duration-500",
          isLoaded ? "opacity-100 scale-100" : "opacity-0 scale-105",
          error && "hidden"
        )}
      />
      
      {/* Loading shimmer */}
      {!isLoaded && !error && (
        <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse" />
      )}
    </div>
  )
}

interface AnimatedCounterProps {
  value: number
  duration?: number
  formatValue?: (value: number) => string
  className?: string
}

export function AnimatedCounter({ 
  value, 
  duration = 2000, 
  formatValue = (v) => v.toLocaleString(),
  className 
}: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = React.useState(0)
  const [isVisible, setIsVisible] = React.useState(false)
  const ref = React.useRef<HTMLSpanElement>(null)

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [isVisible])

  React.useEffect(() => {
    if (!isVisible) return

    const startTime = Date.now()
    const startValue = displayValue

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      
      // Easing function (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3)
      
      const currentValue = Math.floor(startValue + (value - startValue) * easeOut)
      setDisplayValue(currentValue)

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    requestAnimationFrame(animate)
  }, [value, duration, isVisible, displayValue])

  return (
    <span ref={ref} className={className}>
      {formatValue(displayValue)}
    </span>
  )
}
