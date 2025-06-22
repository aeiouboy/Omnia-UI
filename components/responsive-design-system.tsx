"use client"

import React, { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { 
  Smartphone,
  Tablet,
  Monitor,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Grid,
  List,
  Maximize,
  Minimize,
  Settings,
  Eye,
  MoreVertical,
  Filter,
  Search,
  Bell,
  User
} from "lucide-react"

interface BreakpointConfig {
  name: string
  minWidth: number
  maxWidth?: number
  columns: number
  gutters: number
  margins: number
  typography: {
    scale: number
    lineHeight: number
  }
}

interface ResponsiveLayoutProps {
  children: React.ReactNode
  breakpoint?: string
  showBreakpointIndicator?: boolean
  enableFluidTypography?: boolean
  enableTouchOptimization?: boolean
}

interface MobileOptimizedCardProps {
  title: string
  value: string | number
  change?: number
  icon?: React.ComponentType<any>
  priority?: 'high' | 'medium' | 'low'
  isLoading?: boolean
  onClick?: () => void
}

interface AdaptiveGridProps {
  children: React.ReactNode
  minItemWidth?: number
  gap?: number
  className?: string
}

interface TouchOptimizedControlsProps {
  onRefresh?: () => void
  onFilter?: () => void
  onShare?: () => void
  onSettings?: () => void
}

// Responsive breakpoint system
const BREAKPOINTS: Record<string, BreakpointConfig> = {
  xs: {
    name: 'Extra Small',
    minWidth: 0,
    maxWidth: 575,
    columns: 1,
    gutters: 16,
    margins: 16,
    typography: { scale: 0.875, lineHeight: 1.4 }
  },
  sm: {
    name: 'Small',
    minWidth: 576,
    maxWidth: 767,
    columns: 2,
    gutters: 20,
    margins: 20,
    typography: { scale: 0.9, lineHeight: 1.45 }
  },
  md: {
    name: 'Medium',
    minWidth: 768,
    maxWidth: 991,
    columns: 3,
    gutters: 24,
    margins: 24,
    typography: { scale: 1, lineHeight: 1.5 }
  },
  lg: {
    name: 'Large',
    minWidth: 992,
    maxWidth: 1199,
    columns: 4,
    gutters: 28,
    margins: 28,
    typography: { scale: 1.1, lineHeight: 1.55 }
  },
  xl: {
    name: 'Extra Large',
    minWidth: 1200,
    columns: 6,
    gutters: 32,
    margins: 32,
    typography: { scale: 1.2, lineHeight: 1.6 }
  }
}

// Custom hook for responsive behavior
function useResponsive() {
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 })
  const [currentBreakpoint, setCurrentBreakpoint] = useState('md')
  const [isMobile, setIsMobile] = useState(false)
  const [isTablet, setIsTablet] = useState(false)
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait')

  useEffect(() => {
    function updateSize() {
      const width = window.innerWidth
      const height = window.innerHeight
      
      setWindowSize({ width, height })
      setOrientation(height > width ? 'portrait' : 'landscape')
      setIsMobile(width < 768)
      setIsTablet(width >= 768 && width < 1024)

      // Determine current breakpoint
      let breakpoint = 'xl'
      for (const [key, config] of Object.entries(BREAKPOINTS)) {
        if (width >= config.minWidth && (!config.maxWidth || width <= config.maxWidth)) {
          breakpoint = key
          break
        }
      }
      setCurrentBreakpoint(breakpoint)
    }

    updateSize()
    window.addEventListener('resize', updateSize)
    
    return () => window.removeEventListener('resize', updateSize)
  }, [])

  return {
    windowSize,
    currentBreakpoint,
    breakpointConfig: BREAKPOINTS[currentBreakpoint],
    isMobile,
    isTablet,
    isDesktop: !isMobile && !isTablet,
    orientation,
    isPortrait: orientation === 'portrait',
    isLandscape: orientation === 'landscape'
  }
}

// Mobile-optimized card component
export function MobileOptimizedCard({
  title,
  value,
  change,
  icon: Icon,
  priority = 'medium',
  isLoading = false,
  onClick
}: MobileOptimizedCardProps) {
  const { isMobile } = useResponsive()
  
  const priorityStyles = {
    high: 'border-l-red-500 bg-red-50',
    medium: 'border-l-blue-500 bg-blue-50',
    low: 'border-l-gray-500 bg-gray-50'
  }

  if (isLoading) {
    return (
      <Card className={`border-l-4 ${priorityStyles[priority]} animate-pulse`}>
        <CardContent className={`p-${isMobile ? '4' : '6'}`}>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            {change !== undefined && <div className="h-3 bg-gray-200 rounded w-1/4"></div>}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card 
      className={`
        border-l-4 ${priorityStyles[priority]} 
        ${onClick ? 'cursor-pointer hover:shadow-md' : ''} 
        transition-all duration-200
        ${isMobile ? 'min-h-[88px]' : 'min-h-[120px]'}
      `}
      onClick={onClick}
    >
      <CardContent className={`p-${isMobile ? '4' : '6'}`}>
        <div className="flex items-center justify-between">
          <div className="space-y-1 flex-1 min-w-0">
            <p className={`
              font-medium text-gray-600 truncate
              ${isMobile ? 'text-sm' : 'text-base'}
            `}>
              {title}
            </p>
            <p className={`
              font-bold text-gray-900
              ${isMobile ? 'text-xl' : 'text-2xl'}
            `}>
              {value}
            </p>
            {change !== undefined && (
              <p className={`
                ${change > 0 ? 'text-green-600' : change < 0 ? 'text-red-600' : 'text-gray-600'}
                ${isMobile ? 'text-xs' : 'text-sm'}
              `}>
                {change > 0 ? '+' : ''}{change}%
              </p>
            )}
          </div>
          {Icon && (
            <div className={`
              flex-shrink-0 ml-3
              ${isMobile ? 'w-8 h-8' : 'w-10 h-10'}
            `}>
              <Icon className={`${isMobile ? 'h-5 w-5' : 'h-6 w-6'} text-gray-600`} />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Adaptive grid system
export function AdaptiveGrid({ 
  children, 
  minItemWidth = 300, 
  gap = 20,
  className = '' 
}: AdaptiveGridProps) {
  const { windowSize } = useResponsive()
  
  const gridColumns = useMemo(() => {
    if (windowSize.width === 0) return 1 // SSR safety
    return Math.max(1, Math.floor((windowSize.width - gap) / (minItemWidth + gap)))
  }, [windowSize.width, minItemWidth, gap])

  return (
    <div 
      className={`grid ${className}`}
      style={{
        gridTemplateColumns: `repeat(${gridColumns}, minmax(0, 1fr))`,
        gap: `${gap}px`
      }}
    >
      {children}
    </div>
  )
}

// Touch-optimized controls
export function TouchOptimizedControls({
  onRefresh,
  onFilter,
  onShare,
  onSettings
}: TouchOptimizedControlsProps) {
  const { isMobile } = useResponsive()
  
  const buttonSize = isMobile ? 'h-12 w-12' : 'h-10 w-10'
  const iconSize = isMobile ? 'h-6 w-6' : 'h-5 w-5'

  if (isMobile) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Sheet>
          <SheetTrigger asChild>
            <Button 
              size="lg" 
              className="rounded-full shadow-lg h-14 w-14"
            >
              <MoreVertical className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-auto">
            <SheetHeader>
              <SheetTitle>Quick Actions</SheetTitle>
              <SheetDescription>
                Choose an action to perform on the dashboard
              </SheetDescription>
            </SheetHeader>
            <div className="grid grid-cols-2 gap-4 mt-6 pb-6">
              {onRefresh && (
                <Button variant="outline" size="lg" onClick={onRefresh} className="h-16">
                  <div className="flex flex-col items-center space-y-1">
                    <Search className="h-5 w-5" />
                    <span className="text-xs">Refresh</span>
                  </div>
                </Button>
              )}
              {onFilter && (
                <Button variant="outline" size="lg" onClick={onFilter} className="h-16">
                  <div className="flex flex-col items-center space-y-1">
                    <Filter className="h-5 w-5" />
                    <span className="text-xs">Filter</span>
                  </div>
                </Button>
              )}
              {onShare && (
                <Button variant="outline" size="lg" onClick={onShare} className="h-16">
                  <div className="flex flex-col items-center space-y-1">
                    <Bell className="h-5 w-5" />
                    <span className="text-xs">Share</span>
                  </div>
                </Button>
              )}
              {onSettings && (
                <Button variant="outline" size="lg" onClick={onSettings} className="h-16">
                  <div className="flex flex-col items-center space-y-1">
                    <Settings className="h-5 w-5" />
                    <span className="text-xs">Settings</span>
                  </div>
                </Button>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    )
  }

  return (
    <div className="flex items-center space-x-2">
      {onRefresh && (
        <Button variant="outline" size="sm" onClick={onRefresh} className={buttonSize}>
          <Search className={iconSize} />
        </Button>
      )}
      {onFilter && (
        <Button variant="outline" size="sm" onClick={onFilter} className={buttonSize}>
          <Filter className={iconSize} />
        </Button>
      )}
      {onShare && (
        <Button variant="outline" size="sm" onClick={onShare} className={buttonSize}>
          <Bell className={iconSize} />
        </Button>
      )}
      {onSettings && (
        <Button variant="outline" size="sm" onClick={onSettings} className={buttonSize}>
          <Settings className={iconSize} />
        </Button>
      )}
    </div>
  )
}

// Responsive layout wrapper
export function ResponsiveLayout({
  children,
  breakpoint,
  showBreakpointIndicator = false,
  enableFluidTypography = true,
  enableTouchOptimization = true
}: ResponsiveLayoutProps) {
  const { 
    currentBreakpoint, 
    breakpointConfig, 
    isMobile, 
    windowSize 
  } = useResponsive()
  
  const activeBreakpoint = breakpoint || currentBreakpoint
  const config = BREAKPOINTS[activeBreakpoint] || breakpointConfig

  useEffect(() => {
    if (enableFluidTypography) {
      document.documentElement.style.setProperty(
        '--font-scale', 
        config.typography.scale.toString()
      )
      document.documentElement.style.setProperty(
        '--line-height', 
        config.typography.lineHeight.toString()
      )
    }
  }, [config, enableFluidTypography])

  useEffect(() => {
    if (enableTouchOptimization && isMobile) {
      document.documentElement.classList.add('touch-device')
      // Add iOS-specific classes
      if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
        document.documentElement.classList.add('ios-device')
      }
      // Add Android-specific classes
      if (/Android/.test(navigator.userAgent)) {
        document.documentElement.classList.add('android-device')
      }
    } else {
      document.documentElement.classList.remove('touch-device', 'ios-device', 'android-device')
    }
  }, [isMobile, enableTouchOptimization])

  return (
    <div 
      className="min-h-screen bg-gray-50"
      style={{
        '--container-margins': `${config.margins}px`,
        '--grid-gutters': `${config.gutters}px`,
        '--grid-columns': config.columns.toString()
      } as React.CSSProperties}
    >
      {showBreakpointIndicator && (
        <div className="fixed top-4 left-4 z-50">
          <Badge variant="outline" className="bg-white shadow">
            {config.name} ({windowSize.width}px)
          </Badge>
        </div>
      )}
      
      <div 
        className="container mx-auto"
        style={{
          paddingLeft: `${config.margins}px`,
          paddingRight: `${config.margins}px`
        }}
      >
        {children}
      </div>
      
      <style jsx global>{`
        .touch-device {
          /* Enhanced touch targets */
          --min-touch-target: 44px;
        }
        
        .touch-device button,
        .touch-device [role="button"],
        .touch-device input,
        .touch-device select {
          min-height: var(--min-touch-target);
          min-width: var(--min-touch-target);
        }
        
        .ios-device {
          /* iOS-specific optimizations */
          -webkit-overflow-scrolling: touch;
        }
        
        .android-device {
          /* Android-specific optimizations */
          touch-action: manipulation;
        }
        
        @media (max-width: 768px) {
          .container {
            padding-left: 16px !important;
            padding-right: 16px !important;
          }
        }
      `}</style>
    </div>
  )
}

// Mobile navigation component
export function MobileNavigation({ 
  isOpen, 
  onClose, 
  children 
}: { 
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode 
}) {
  const { isMobile } = useResponsive()

  if (!isMobile) {
    return <nav className="hidden lg:block">{children}</nav>
  }

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="left" className="w-80 p-0">
        <SheetHeader className="p-6 border-b">
          <SheetTitle>Navigation</SheetTitle>
        </SheetHeader>
        <div className="p-6">
          {children}
        </div>
      </SheetContent>
    </Sheet>
  )
}

// Responsive tabs component
export function ResponsiveTabs({ 
  tabs, 
  defaultValue,
  onValueChange 
}: {
  tabs: Array<{ value: string; label: string; content: React.ReactNode }>
  defaultValue?: string
  onValueChange?: (value: string) => void
}) {
  const { isMobile } = useResponsive()
  const [activeTab, setActiveTab] = useState(defaultValue || tabs[0]?.value)
  
  const handleTabChange = (value: string) => {
    setActiveTab(value)
    onValueChange?.(value)
  }

  if (isMobile) {
    return (
      <div className="space-y-4">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="w-full justify-between">
              <span>{tabs.find(tab => tab.value === activeTab)?.label}</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-auto">
            <SheetHeader>
              <SheetTitle>Select Tab</SheetTitle>
            </SheetHeader>
            <div className="space-y-2 mt-6 pb-6">
              {tabs.map(tab => (
                <Button
                  key={tab.value}
                  variant={activeTab === tab.value ? "default" : "ghost"}
                  className="w-full justify-start h-12"
                  onClick={() => {
                    handleTabChange(tab.value)
                  }}
                >
                  {tab.label}
                </Button>
              ))}
            </div>
          </SheetContent>
        </Sheet>
        
        <div className="mt-4">
          {tabs.find(tab => tab.value === activeTab)?.content}
        </div>
      </div>
    )
  }

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange}>
      <TabsList className="grid w-full grid-cols-auto">
        {tabs.map(tab => (
          <TabsTrigger key={tab.value} value={tab.value}>
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {tabs.map(tab => (
        <TabsContent key={tab.value} value={tab.value}>
          {tab.content}
        </TabsContent>
      ))}
    </Tabs>
  )
}

// Responsive grid component
export function ResponsiveGrid({ 
  children,
  minCardWidth = 300,
  gap = 20
}: {
  children: React.ReactNode
  minCardWidth?: number
  gap?: number
}) {
  const { isMobile, isTablet } = useResponsive()
  
  const getGridColumns = () => {
    if (isMobile) return 1
    if (isTablet) return 2
    return 'auto-fit'
  }

  return (
    <div 
      className="grid"
      style={{
        gridTemplateColumns: getGridColumns() === 'auto-fit' 
          ? `repeat(auto-fit, minmax(${minCardWidth}px, 1fr))`
          : `repeat(${getGridColumns()}, 1fr)`,
        gap: `${gap}px`
      }}
    >
      {children}
    </div>
  )
}

// Breakpoint utility component
export function BreakpointDebugger() {
  const { currentBreakpoint, windowSize, isMobile, isTablet } = useResponsive()
  
  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <div className="fixed bottom-4 left-4 bg-black text-white px-3 py-2 rounded text-xs font-mono z-50">
      <div>{currentBreakpoint}: {windowSize.width}x{windowSize.height}</div>
      <div>
        {isMobile && 'Mobile'} 
        {isTablet && 'Tablet'} 
        {!isMobile && !isTablet && 'Desktop'}
      </div>
    </div>
  )
}

export {
  BREAKPOINTS,
  useResponsive
}
