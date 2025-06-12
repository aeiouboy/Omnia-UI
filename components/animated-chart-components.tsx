"use client"

import React, { useState, useEffect, useRef, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { 
  Play,
  Pause,
  RotateCcw,
  Settings,
  Eye,
  EyeOff,
  Zap,
  Activity,
  TrendingUp
} from "lucide-react"
import { 
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ComposedChart
} from "recharts"

interface AnimationConfig {
  enabled: boolean
  duration: number
  delay: number
  easing: 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'linear'
  stagger: boolean
  infinite: boolean
}

interface AnimatedChartProps {
  data: any[]
  title: string
  type: 'line' | 'bar' | 'area' | 'pie' | 'composed'
  animationConfig?: Partial<AnimationConfig>
  height?: string
  enableInteractions?: boolean
  showLegend?: boolean
  colorScheme?: string[]
  onAnimationComplete?: () => void
}

interface CountUpProps {
  end: number
  duration?: number
  prefix?: string
  suffix?: string
  decimals?: number
  onComplete?: () => void
}

interface ProgressBarProps {
  value: number
  max?: number
  duration?: number
  color?: string
  showValue?: boolean
  animated?: boolean
  gradient?: boolean
}

// Default animation configurations
const DEFAULT_ANIMATION: AnimationConfig = {
  enabled: true,
  duration: 1500,
  delay: 0,
  easing: 'ease-out',
  stagger: true,
  infinite: false
}

const ANIMATION_PRESETS = {
  subtle: { duration: 800, easing: 'ease-out' as const, stagger: false },
  smooth: { duration: 1200, easing: 'ease-in-out' as const, stagger: true },
  energetic: { duration: 600, easing: 'ease' as const, stagger: true },
  elegant: { duration: 2000, easing: 'ease-out' as const, stagger: true }
}

const COLOR_SCHEMES = {
  default: ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"],
  ocean: ["#0891b2", "#0284c7", "#2563eb", "#7c3aed", "#a855f7", "#c026d3"],
  sunset: ["#f97316", "#ea580c", "#dc2626", "#be123c", "#9333ea", "#7c3aed"],
  forest: ["#059669", "#0d9488", "#0891b2", "#2563eb", "#7c3aed", "#9333ea"]
}

// Count up animation hook
function useCountUp({ end, duration = 2000, decimals = 0 }: {
  end: number
  duration?: number
  decimals?: number
}) {
  const [count, setCount] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  
  useEffect(() => {
    let startTime: number
    let animationFrame: number
    
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = (timestamp - startTime) / duration
      
      if (progress < 1) {
        const easeOutProgress = 1 - Math.pow(1 - progress, 3)
        setCount(end * easeOutProgress)
        animationFrame = requestAnimationFrame(animate)
      } else {
        setCount(end)
        setIsComplete(true)
      }
    }
    
    animationFrame = requestAnimationFrame(animate)
    
    return () => cancelAnimationFrame(animationFrame)
  }, [end, duration])
  
  const formattedValue = useMemo(() => {
    return count.toFixed(decimals)
  }, [count, decimals])
  
  return { value: formattedValue, isComplete }
}

// Animated Counter Component
export function AnimatedCounter({ 
  end, 
  duration = 2000, 
  prefix = '', 
  suffix = '', 
  decimals = 0,
  onComplete 
}: CountUpProps) {
  const { value, isComplete } = useCountUp({ end, duration, decimals })
  
  useEffect(() => {
    if (isComplete && onComplete) {
      onComplete()
    }
  }, [isComplete, onComplete])
  
  return (
    <span className="font-bold text-2xl">
      {prefix}{value}{suffix}
    </span>
  )
}

// Animated Progress Bar Component
export function AnimatedProgressBar({ 
  value, 
  max = 100, 
  duration = 1000,
  color = "bg-blue-500",
  showValue = true,
  animated = true,
  gradient = false
}: ProgressBarProps) {
  const [animatedValue, setAnimatedValue] = useState(0)
  const percentage = Math.min((value / max) * 100, 100)
  
  useEffect(() => {
    if (!animated) {
      setAnimatedValue(percentage)
      return
    }
    
    let startTime: number
    let animationFrame: number
    
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      
      const easeOutProgress = 1 - Math.pow(1 - progress, 3)
      setAnimatedValue(percentage * easeOutProgress)
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate)
      }
    }
    
    animationFrame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationFrame)
  }, [percentage, duration, animated])
  
  const progressBarClass = gradient 
    ? "bg-gradient-to-r from-blue-400 to-blue-600" 
    : color
    
  return (
    <div className="w-full space-y-2">
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div
          className={`h-full ${progressBarClass} rounded-full transition-all duration-300 ease-out`}
          style={{ 
            width: `${animatedValue}%`,
            transform: `translateX(${animated ? '0%' : '-100%'})`,
            animation: animated ? `slideIn ${duration}ms ease-out` : 'none'
          }}
        />
      </div>
      {showValue && (
        <div className="flex justify-between text-sm text-gray-600">
          <span>{Math.round(animatedValue)}%</span>
          <span>{value}/{max}</span>
        </div>
      )}
      <style jsx>{`
        @keyframes slideIn {
          from { transform: translateX(-100%); }
          to { transform: translateX(0%); }
        }
      `}</style>
    </div>
  )
}

// Animated Chart Component
export function AnimatedChart({
  data,
  title,
  type,
  animationConfig = {},
  height = "h-80",
  enableInteractions = true,
  showLegend = true,
  colorScheme = COLOR_SCHEMES.default,
  onAnimationComplete
}: AnimatedChartProps) {
  const [isPlaying, setIsPlaying] = useState(true)
  const [animationEnabled, setAnimationEnabled] = useState(true)
  const [currentPreset, setCurrentPreset] = useState<keyof typeof ANIMATION_PRESETS>('smooth')
  
  const config: AnimationConfig = {
    ...DEFAULT_ANIMATION,
    ...ANIMATION_PRESETS[currentPreset],
    ...animationConfig
  }
  
  // Animation state management
  const [animatedData, setAnimatedData] = useState<any[]>([])
  const animationRef = useRef<number>()
  const [animationProgress, setAnimationProgress] = useState(0)
  
  // Data animation effect
  useEffect(() => {
    if (!config.enabled || !isPlaying) {
      setAnimatedData(data)
      return
    }
    
    let startTime: number
    const duration = config.duration
    
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const elapsed = timestamp - startTime
      const progress = Math.min(elapsed / duration, 1)
      
      // Easing function
      let easedProgress = progress
      switch (config.easing) {
        case 'ease-in':
          easedProgress = progress * progress
          break
        case 'ease-out':
          easedProgress = 1 - Math.pow(1 - progress, 2)
          break
        case 'ease-in-out':
          easedProgress = progress < 0.5 
            ? 2 * progress * progress 
            : 1 - Math.pow(-2 * progress + 2, 2) / 2
          break
      }
      
      setAnimationProgress(easedProgress)
      
      // Animate data points
      if (config.stagger) {
        const staggerDelay = 0.1
        const animatedPoints = data.map((point, index) => {
          const pointProgress = Math.max(0, Math.min(1, (easedProgress - index * staggerDelay) / (1 - index * staggerDelay)))
          
          if (type === 'pie') {
            return {
              ...point,
              value: point.value * pointProgress
            }
          }
          
          // For other chart types, animate numeric values
          const animatedPoint = { ...point }
          Object.keys(point).forEach(key => {
            if (typeof point[key] === 'number' && key !== 'x' && key !== 'date') {
              animatedPoint[key] = point[key] * pointProgress
            }
          })
          return animatedPoint
        })
        setAnimatedData(animatedPoints)
      } else {
        // Animate all data uniformly
        const animatedPoints = data.map(point => {
          if (type === 'pie') {
            return {
              ...point,
              value: point.value * easedProgress
            }
          }
          
          const animatedPoint = { ...point }
          Object.keys(point).forEach(key => {
            if (typeof point[key] === 'number' && key !== 'x' && key !== 'date') {
              animatedPoint[key] = point[key] * easedProgress
            }
          })
          return animatedPoint
        })
        setAnimatedData(animatedPoints)
      }
      
      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate)
      } else {
        onAnimationComplete?.()
      }
    }
    
    animationRef.current = requestAnimationFrame(animate)
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [data, config, isPlaying, type])
  
  // Chart rendering with animations
  const renderAnimatedChart = () => {
    const commonProps = {
      data: animatedData,
      margin: { top: 5, right: 30, left: 20, bottom: 5 }
    }
    
    const animBegin = config.enabled ? config.delay : 0
    const animDuration = config.enabled ? config.duration : 0
    
    switch (type) {
      case 'line':
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip 
              animationDuration={200}
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: 'none',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            />
            {showLegend && <Legend />}
            {Object.keys(animatedData[0] || {})
              .filter(key => key !== 'name' && typeof (animatedData[0] || {})[key] === 'number')
              .map((key, index) => (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={colorScheme[index % colorScheme.length]}
                  strokeWidth={3}
                  dot={{ r: 6, strokeWidth: 2 }}
                  activeDot={{ r: 8, strokeWidth: 2 }}
                  animationBegin={animBegin}
                  animationDuration={animDuration}
                  animationEasing={config.easing}
                />
              ))}
          </LineChart>
        )
        
      case 'bar':
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip 
              animationDuration={200}
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: 'none',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            />
            {showLegend && <Legend />}
            {Object.keys(animatedData[0] || {})
              .filter(key => key !== 'name' && typeof (animatedData[0] || {})[key] === 'number')
              .map((key, index) => (
                <Bar
                  key={key}
                  dataKey={key}
                  fill={colorScheme[index % colorScheme.length]}
                  animationBegin={animBegin + (config.stagger ? index * 100 : 0)}
                  animationDuration={animDuration}
                  animationEasing={config.easing}
                  radius={[4, 4, 0, 0]}
                />
              ))}
          </BarChart>
        )
        
      case 'area':
        return (
          <AreaChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip 
              animationDuration={200}
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: 'none',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            />
            {showLegend && <Legend />}
            {Object.keys(animatedData[0] || {})
              .filter(key => key !== 'name' && typeof (animatedData[0] || {})[key] === 'number')
              .map((key, index) => (
                <Area
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={colorScheme[index % colorScheme.length]}
                  fill={colorScheme[index % colorScheme.length]}
                  fillOpacity={0.3}
                  animationBegin={animBegin}
                  animationDuration={animDuration}
                  animationEasing={config.easing}
                />
              ))}
          </AreaChart>
        )
        
      case 'pie':
        return (
          <PieChart>
            <Pie
              data={animatedData}
              cx="50%"
              cy="50%"
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
              nameKey="name"
              animationBegin={animBegin}
              animationDuration={animDuration}
              animationEasing={config.easing}
            >
              {animatedData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={colorScheme[index % colorScheme.length]} 
                />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: any) => [value.toLocaleString(), 'Value']}
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: 'none',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            />
            {showLegend && <Legend />}
          </PieChart>
        )
        
      default:
        return <div>Unsupported chart type</div>
    }
  }
  
  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5" />
            <span>{title}</span>
            {config.enabled && (
              <Badge variant="outline" className="ml-2">
                <Zap className="h-3 w-3 mr-1" />
                Animated
              </Badge>
            )}
          </CardTitle>
          
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-2">
              <Switch
                checked={animationEnabled}
                onCheckedChange={setAnimationEnabled}
                size="sm"
              />
              <span className="text-sm text-gray-600">
                {animationEnabled ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              </span>
            </div>
            
            {config.enabled && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsPlaying(!isPlaying)}
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
            )}
            
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {config.enabled && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>Animation Progress</span>
              <span>{Math.round(animationProgress * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1">
              <div
                className="bg-blue-500 h-1 rounded-full transition-all duration-100"
                style={{ width: `${animationProgress * 100}%` }}
              />
            </div>
          </div>
        )}
      </CardHeader>
      
      <CardContent>
        <div className={`${height} w-full`}>
          <ResponsiveContainer width="100%" height="100%">
            {renderAnimatedChart()}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

// Floating Action Animations
export function FloatingMetric({ 
  value, 
  label, 
  icon: Icon, 
  trend = 'neutral',
  delay = 0 
}: {
  value: string | number
  label: string
  icon: React.ComponentType<any>
  trend?: 'up' | 'down' | 'neutral'
  delay?: number
}) {
  const [isVisible, setIsVisible] = useState(false)
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, delay)
    
    return () => clearTimeout(timer)
  }, [delay])
  
  const trendColors = {
    up: 'text-green-600 bg-green-50 border-green-200',
    down: 'text-red-600 bg-red-50 border-red-200',
    neutral: 'text-blue-600 bg-blue-50 border-blue-200'
  }
  
  return (
    <div
      className={`
        transform transition-all duration-700 ease-out
        ${isVisible 
          ? 'translate-y-0 opacity-100 scale-100' 
          : 'translate-y-4 opacity-0 scale-95'
        }
      `}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <Card className={`${trendColors[trend]} border-2 hover:shadow-lg transition-shadow duration-300`}>
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-white bg-opacity-50">
              <Icon className="h-6 w-6" />
            </div>
            <div>
              <div className="text-2xl font-bold">{value}</div>
              <div className="text-sm opacity-75">{label}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Pulse Animation Component
export function PulseIndicator({ 
  active = true, 
  size = 'md',
  color = 'blue' 
}: {
  active?: boolean
  size?: 'sm' | 'md' | 'lg'
  color?: 'blue' | 'green' | 'red' | 'yellow'
}) {
  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  }
  
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    red: 'bg-red-500',
    yellow: 'bg-yellow-500'
  }
  
  return (
    <div className="relative">
      <div className={`${sizeClasses[size]} ${colorClasses[color]} rounded-full`} />
      {active && (
        <div 
          className={`
            absolute inset-0 ${sizeClasses[size]} ${colorClasses[color]} 
            rounded-full animate-ping opacity-75
          `} 
        />
      )}
    </div>
  )
}

// Export all components
export {
  ANIMATION_PRESETS,
  COLOR_SCHEMES,
  DEFAULT_ANIMATION
}