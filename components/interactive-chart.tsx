"use client"

import React, { useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from "recharts"
import { 
  ArrowLeft, 
  TrendingUp, 
  TrendingDown, 
  BarChart3,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  Info,
  Expand
} from "lucide-react"

interface DrillDownLevel {
  id: string
  title: string
  data: any[]
  type: 'bar' | 'pie' | 'line'
  xAxisKey?: string
  yAxisKey?: string
  valueKey?: string
  nameKey?: string
}

interface InteractiveChartProps {
  title: string
  initialLevel: DrillDownLevel
  drillDownLevels: DrillDownLevel[]
  isLoading: boolean
  height?: string
  priority?: 'hero' | 'important' | 'supporting'
  status?: 'excellent' | 'good' | 'warning' | 'critical'
  onDataPointClick?: (data: any, level: string) => void
  showInsights?: boolean
}

export function InteractiveChart({
  title,
  initialLevel,
  drillDownLevels,
  isLoading,
  height = "h-[400px]",
  priority = 'supporting',
  status = 'good',
  onDataPointClick,
  showInsights = true
}: InteractiveChartProps) {
  const [currentLevel, setCurrentLevel] = useState<DrillDownLevel>(initialLevel)
  const [breadcrumb, setBreadcrumb] = useState<DrillDownLevel[]>([initialLevel])
  const [isExpanded, setIsExpanded] = useState(false)

  // Debug loading state changes
  React.useEffect(() => {
    console.log(`📊 ${title} - Loading state changed to:`, isLoading)
  }, [isLoading, title])

  // Priority-based styling
  const getPriorityStyles = () => {
    switch (priority) {
      case 'hero':
        return {
          card: 'shadow-xl border-l-4',
          header: 'pb-4',
          title: 'text-xl font-bold'
        }
      case 'important':
        return {
          card: 'shadow-lg border-l-2',
          header: 'pb-3',
          title: 'text-lg font-semibold'
        }
      default:
        return {
          card: 'shadow-md',
          header: 'pb-2',
          title: 'text-base font-medium'
        }
    }
  }

  // Status-based colors - Clean white backgrounds
  const getStatusStyles = () => {
    switch (status) {
      case 'excellent':
        return {
          border: 'border-l-emerald-500',
          bg: 'bg-white',
          accent: '#10b981'
        }
      case 'good':
        return {
          border: 'border-l-green-500',
          bg: 'bg-white',
          accent: '#22c55e'
        }
      case 'warning':
        return {
          border: 'border-l-amber-500',
          bg: 'bg-white',
          accent: '#f59e0b'
        }
      case 'critical':
        return {
          border: 'border-l-red-500',
          bg: 'bg-white',
          accent: '#ef4444'
        }
      default:
        return {
          border: '',
          bg: 'bg-white',
          accent: '#3b82f6'
        }
    }
  }

  const priorityStyles = getPriorityStyles()
  const statusStyles = getStatusStyles()

  const cardClasses = [
    priorityStyles.card,
    statusStyles.border,
    statusStyles.bg,
    'transition-all duration-200 hover:shadow-md touch-manipulation border border-gray-200 rounded-xl'
  ].join(' ')

  // Handle drill-down navigation
  const handleDrillDown = useCallback((dataPoint: any) => {
    const nextLevel = drillDownLevels.find(level => 
      level.id === dataPoint.drillDownId || 
      level.id === `${currentLevel.id}_${dataPoint[currentLevel.xAxisKey || 'name']}`
    )
    
    if (nextLevel) {
      setCurrentLevel(nextLevel)
      setBreadcrumb(prev => [...prev, nextLevel])
      onDataPointClick?.(dataPoint, nextLevel.id)
    }
  }, [currentLevel, drillDownLevels, onDataPointClick])

  const handleBreadcrumbClick = useCallback((level: DrillDownLevel, index: number) => {
    setCurrentLevel(level)
    setBreadcrumb(prev => prev.slice(0, index + 1))
  }, [])

  // Generate insights from data
  const generateInsights = (data: any[]) => {
    if (!data || data.length === 0) return []
    
    const insights = []
    const valueKey = currentLevel.valueKey || currentLevel.yAxisKey || 'value'
    const total = data.reduce((sum, item) => sum + (item[valueKey] || 0), 0)
    const avg = total / data.length
    
    // Find highest and lowest performers
    const sorted = [...data].sort((a, b) => (b[valueKey] || 0) - (a[valueKey] || 0))
    const highest = sorted[0]
    const lowest = sorted[sorted.length - 1]
    
    if (highest && lowest && highest !== lowest) {
      const nameKey = currentLevel.nameKey || currentLevel.xAxisKey || 'name'
      insights.push({
        type: 'performance',
        icon: TrendingUp,
        color: 'text-green-600',
        text: `${highest[nameKey]} leads with ${(highest[valueKey] || 0).toLocaleString()}`
      })
      
      if (lowest[valueKey] < avg * 0.5) {
        insights.push({
          type: 'concern',
          icon: TrendingDown,
          color: 'text-amber-600',
          text: `${lowest[nameKey]} needs attention (${(lowest[valueKey] || 0).toLocaleString()})`
        })
      }
    }
    
    // Average insight
    insights.push({
      type: 'average',
      icon: Info,
      color: 'text-blue-600',
      text: `Average: ${avg.toFixed(0).toLocaleString()}`
    })
    
    return insights
  }

  const insights = generateInsights(currentLevel.data)

  // Render chart based on type
  const renderChart = () => {
    const commonProps = {
      width: "100%",
      height: "100%"
    }

    switch (currentLevel.type) {
      case 'bar':
        return (
          <ResponsiveContainer {...commonProps}>
            <BarChart data={currentLevel.data} onClick={handleDrillDown}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey={currentLevel.xAxisKey || 'name'} 
                fontSize={12}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis fontSize={12} />
              <Tooltip 
                formatter={(value, name) => [value?.toLocaleString(), name]}
                labelFormatter={(label) => `${label}`}
              />
              <Bar 
                dataKey={currentLevel.yAxisKey || 'value'} 
                fill={statusStyles.accent}
                cursor="pointer"
                radius={[6, 6, 0, 0]}
                className="hover:opacity-80 transition-all duration-300"
              />
            </BarChart>
          </ResponsiveContainer>
        )
      
      case 'pie':
        const COLORS = ['#60a5fa', '#34d399', '#fbbf24', '#f87171', '#a78bfa', '#fb7185']
        return (
          <ResponsiveContainer {...commonProps}>
            <PieChart>
              <Pie
                data={currentLevel.data}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey={currentLevel.valueKey || 'value'}
                nameKey={currentLevel.nameKey || 'name'}
                onClick={handleDrillDown}
                cursor="pointer"
              >
                {currentLevel.data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[index % COLORS.length]} 
                  />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value, name) => [value?.toLocaleString(), name]}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )
      
      case 'line':
        return (
          <ResponsiveContainer {...commonProps}>
            <LineChart data={currentLevel.data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey={currentLevel.xAxisKey || 'name'}
                fontSize={12}
              />
              <YAxis fontSize={12} />
              <Tooltip 
                formatter={(value, name) => [value?.toLocaleString(), name]}
              />
              <Line 
                type="monotone" 
                dataKey={currentLevel.yAxisKey || 'value'} 
                stroke={statusStyles.accent}
                strokeWidth={2}
                dot={{ fill: statusStyles.accent, strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )
      
      default:
        return <div className="flex items-center justify-center h-full text-gray-500">
          Unsupported chart type
        </div>
    }
  }

  return (
    <Card className={cardClasses}>
      <CardHeader className={priorityStyles.header}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CardTitle className={priorityStyles.title}>
              {title}
            </CardTitle>
            <Badge variant="outline" className="text-xs">
              {currentLevel.type.toUpperCase()}
            </Badge>
          </div>
          <div className="flex items-center space-x-2">
            {currentLevel.type === 'bar' && <BarChart3 className="h-4 w-4 text-gray-500" />}
            {currentLevel.type === 'pie' && <PieChartIcon className="h-4 w-4 text-gray-500" />}
            {currentLevel.type === 'line' && <LineChartIcon className="h-4 w-4 text-gray-500" />}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="min-h-[44px] min-w-[44px] p-1"
            >
              <Expand className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Breadcrumb Navigation */}
        {breadcrumb.length > 1 && (
          <div className="flex items-center space-x-2 mt-2">
            {breadcrumb.map((level, index) => (
              <React.Fragment key={level.id}>
                {index > 0 && <span className="text-gray-400">/</span>}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleBreadcrumbClick(level, index)}
                  className="h-auto p-1 text-xs font-medium"
                  disabled={index === breadcrumb.length - 1}
                >
                  {index === 0 ? (
                    <ArrowLeft className="h-3 w-3 mr-1" />
                  ) : null}
                  {level.title}
                </Button>
              </React.Fragment>
            ))}
          </div>
        )}
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <div className={`${height} p-6`}>
            <div className="space-y-6 w-full">
              {/* Enhanced Chart Type-Specific Skeleton */}
              {currentLevel.type === 'bar' ? (
                <div className="space-y-4">
                  {/* Bar Chart Skeleton */}
                  <div className="grid grid-cols-4 gap-3 items-end h-48">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="space-y-2">
                        <div className={`bg-gradient-to-t from-blue-200 to-blue-100 rounded-t-lg animate-pulse`} 
                             style={{ height: `${60 + (i * 20)}px` }} />
                        <Skeleton className="h-3 w-12 mx-auto" />
                      </div>
                    ))}
                  </div>
                  {/* Axis Labels Skeleton */}
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-3 w-18" />
                    <Skeleton className="h-3 w-14" />
                  </div>
                </div>
              ) : currentLevel.type === 'pie' ? (
                <div className="flex items-center justify-center h-48">
                  {/* Pie Chart Skeleton */}
                  <div className="relative w-32 h-32">
                    <div className="absolute inset-0 rounded-full border-8 border-blue-200 animate-pulse" />
                    <div className="absolute inset-2 rounded-full border-6 border-green-200 animate-pulse" style={{ animationDelay: '0.5s' }} />
                    <div className="absolute inset-4 rounded-full border-4 border-yellow-200 animate-pulse" style={{ animationDelay: '1s' }} />
                    <div className="absolute inset-6 rounded-full border-2 border-red-200 animate-pulse" style={{ animationDelay: '1.5s' }} />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Line Chart Skeleton */}
                  <div className="h-48 relative">
                    <svg className="w-full h-full" viewBox="0 0 400 200">
                      <path 
                        d="M 0 150 Q 100 120 200 100 T 400 80" 
                        stroke="#93c5fd" 
                        strokeWidth="3" 
                        fill="none" 
                        className="animate-pulse"
                      />
                      <path 
                        d="M 0 180 Q 100 160 200 140 T 400 120" 
                        stroke="#86efac" 
                        strokeWidth="2" 
                        fill="none" 
                        className="animate-pulse" 
                        style={{ animationDelay: '0.5s' }}
                      />
                    </svg>
                  </div>
                  <div className="flex justify-between">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-3 w-8" />
                    ))}
                  </div>
                </div>
              )}
              
              {/* Insights Skeleton */}
              <div className="border-t border-gray-200 pt-4 space-y-3">
                <Skeleton className="h-4 w-16" />
                <div className="space-y-2">
                  {[...Array(2)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-3">
                      <Skeleton className="h-4 w-4 rounded-full" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className={height}>
              {currentLevel.data && currentLevel.data.length > 0 ? (
                renderChart()
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-sm text-gray-600">No data available</p>
                </div>
              )}
            </div>
            
            {/* Insights Section */}
            {showInsights && insights.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Insights</h4>
                <div className="space-y-2">
                  {insights.map((insight, index) => (
                    <div key={index} className="flex items-center space-x-2 text-sm">
                      <insight.icon className={`h-4 w-4 ${insight.color}`} />
                      <span className="text-gray-700">{insight.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}