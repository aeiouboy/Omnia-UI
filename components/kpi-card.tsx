"use client"

import React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { TrendingUp, TrendingDown, AlertTriangle } from "lucide-react"

type KpiPriority = 'hero' | 'important' | 'supporting'
type KpiStatus = 'excellent' | 'good' | 'warning' | 'critical'

interface KpiCardProps {
  icon: React.ReactNode
  value: number | string
  change: number
  label: string
  isLoading: boolean
  inverseColor?: boolean
  priority?: KpiPriority
  status?: KpiStatus
  threshold?: {
    excellent?: number
    good?: number
    warning?: number
  }
}

export function KpiCard({ 
  icon, 
  value, 
  change, 
  label, 
  isLoading, 
  inverseColor = false,
  priority = 'supporting',
  status = 'good',
  threshold
}: KpiCardProps) {
  
  // Determine status from value if thresholds provided
  const getStatusFromValue = (val: number | string): KpiStatus => {
    if (!threshold || typeof val !== 'number') return status
    
    if (threshold.excellent && val >= threshold.excellent) return 'excellent'
    if (threshold.good && val >= threshold.good) return 'good'
    if (threshold.warning && val >= threshold.warning) return 'warning'
    return 'critical'
  }

  const actualStatus = threshold && typeof value === 'number' ? getStatusFromValue(value) : status

  const getChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="h-3 w-3" />
    if (change < 0) return <TrendingDown className="h-3 w-3" />
    return null
  }

  const getChangeClass = (change: number, inverse = false) => {
    if (change === 0) return "text-gray-500"
    if (inverse) {
      return change > 0 ? "text-red-500" : "text-green-500"
    }
    return change > 0 ? "text-green-500" : "text-red-500"
  }

  // Priority-based styling
  const getPriorityStyles = () => {
    switch (priority) {
      case 'hero':
        return {
          card: 'shadow-xl border-l-4',
          padding: 'p-8',
          valueText: 'text-4xl font-bold',
          labelText: 'text-base font-medium',
          iconSize: 'h-9 w-9'
        }
      case 'important':
        return {
          card: 'shadow-lg border-l-3',
          padding: 'p-6',
          valueText: 'text-3xl font-bold',
          labelText: 'text-sm font-medium',
          iconSize: 'h-8 w-8'
        }
      default: // supporting
        return {
          card: 'shadow-md',
          padding: 'p-5',
          valueText: 'text-2xl font-bold',
          labelText: 'text-sm font-medium',
          iconSize: 'h-7 w-7'
        }
    }
  }

  // Status-based colors - Clean white backgrounds
  const getStatusStyles = () => {
    switch (actualStatus) {
      case 'excellent':
        return {
          border: 'border-l-emerald-400',
          bg: 'bg-white',
          icon: 'text-emerald-600',
          value: 'text-gray-900'
        }
      case 'good':
        return {
          border: 'border-l-green-400',
          bg: 'bg-white',
          icon: 'text-green-600',
          value: 'text-gray-900'
        }
      case 'warning':
        return {
          border: 'border-l-amber-400',
          bg: 'bg-white',
          icon: 'text-amber-600',
          value: 'text-gray-900'
        }
      case 'critical':
        return {
          border: 'border-l-red-400',
          bg: 'bg-white',
          icon: 'text-red-600',
          value: 'text-gray-900'
        }
      default:
        return {
          border: '',
          bg: 'bg-white',
          icon: 'text-gray-600',
          value: 'text-gray-900'
        }
    }
  }

  const priorityStyles = getPriorityStyles()
  const statusStyles = getStatusStyles()

  // Combine classes based on priority and status
  const cardClasses = [
    priorityStyles.card,
    statusStyles.border,
    statusStyles.bg,
    'transition-all duration-200 hover:shadow-md hover:scale-[1.01] min-h-[130px] rounded-xl border border-gray-200'
  ].join(' ')

  // Clone icon with status-based color and priority-based size
  const styledIcon = React.cloneElement(icon as React.ReactElement, {
    className: `${priorityStyles.iconSize} ${statusStyles.icon}`
  })

  return (
    <Card className={cardClasses}>
      <CardContent className={priorityStyles.padding}>
        {/* Status indicator for critical items */}
        {actualStatus === 'critical' && !isLoading && (
          <div className="flex items-center mb-2">
            <AlertTriangle className="h-4 w-4 text-red-600 mr-1 animate-pulse" />
            <span className="text-xs font-medium text-red-600">CRITICAL</span>
          </div>
        )}
        
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-3 sm:mb-2">
          <div className="flex justify-between items-start mb-2 sm:mb-0">
            {isLoading ? (
              <Skeleton className={`${priorityStyles.iconSize} rounded-md`} />
            ) : (
              styledIcon
            )}
            {!isLoading && change !== 0 && (
              <span
                className={`text-sm sm:text-xs flex items-center sm:hidden ${getChangeClass(change, inverseColor)}`}
              >
                {getChangeIcon(change)}
                {Math.abs(change)}%
              </span>
            )}
          </div>
          {!isLoading && change !== 0 && (
            <span
              className={`text-sm sm:text-xs hidden sm:flex items-center ${getChangeClass(change, inverseColor)}`}
            >
              {getChangeIcon(change)}
              {Math.abs(change)}%
            </span>
          )}
        </div>
        
        <div className={`${priorityStyles.valueText} ${statusStyles.value} mb-2`}>
          {isLoading ? (
            <Skeleton className={`h-8 w-20 ${priority === 'hero' ? 'h-10 w-24' : ''}`} />
          ) : (
            typeof value === 'number' ? value.toLocaleString() : value
          )}
        </div>
        
        <div className={`${priorityStyles.labelText} text-muted-foreground`}>
          {isLoading ? (
            <Skeleton className="h-4 w-24" />
          ) : (
            label
          )}
        </div>

        {/* Performance indicator bar for hero cards */}
        {priority === 'hero' && (
          <div className="mt-3">
            {isLoading ? (
              <Skeleton className="h-2 w-full rounded-full" />
            ) : (
              typeof value === 'number' && threshold && (
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      actualStatus === 'excellent' ? 'bg-emerald-500' :
                      actualStatus === 'good' ? 'bg-green-500' :
                      actualStatus === 'warning' ? 'bg-amber-500' : 'bg-red-500'
                    }`}
                    style={{ 
                      width: `${Math.min(100, Math.max(0, (value / (threshold.excellent || 100)) * 100))}%` 
                    }}
                  />
                </div>
              )
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
