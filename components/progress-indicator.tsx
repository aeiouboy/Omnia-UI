"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  Clock, 
  Activity, 
  Database, 
  CheckCircle, 
  AlertCircle, 
  XCircle,
  Pause,
  Play,
  RefreshCw,
  Download
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { PaginationProgress, LoadingMessage } from '@/hooks/use-loading-state'

export interface ProgressIndicatorProps {
  progress?: PaginationProgress | null
  messages?: LoadingMessage[]
  isActive?: boolean
  onPause?: () => void
  onResume?: () => void
  onCancel?: () => void
  onRetry?: () => void
  onDownloadLogs?: () => void
  showControls?: boolean
  showMessages?: boolean
  showDetailedMetrics?: boolean
  className?: string
}

export function ProgressIndicator({
  progress,
  messages = [],
  isActive = false,
  onPause,
  onResume,
  onCancel,
  onRetry,
  onDownloadLogs,
  showControls = true,
  showMessages = true,
  showDetailedMetrics = true,
  className
}: ProgressIndicatorProps) {
  const [currentTime, setCurrentTime] = useState<string>('')
  const [isAnimating, setIsAnimating] = useState(false)

  // Update current time every second
  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(new Date().toLocaleTimeString())
    }
    
    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  // Animate progress bar updates
  useEffect(() => {
    if (progress?.completionPercentage !== undefined) {
      setIsAnimating(true)
      const timer = setTimeout(() => setIsAnimating(false), 300)
      return () => clearTimeout(timer)
    }
  }, [progress?.completionPercentage])

  if (!progress && messages.length === 0) {
    return null
  }

  const getProgressColor = (percentage?: number): string => {
    if (!percentage) return 'bg-gray-200'
    if (percentage < 25) return 'bg-blue-500'
    if (percentage < 50) return 'bg-indigo-500'
    if (percentage < 75) return 'bg-purple-500'
    if (percentage < 95) return 'bg-green-500'
    return 'bg-emerald-500'
  }

  const getStatusIcon = () => {
    if (!progress) return <Activity className="h-4 w-4 text-gray-500" />
    
    if (progress.completionPercentage === 100) {
      return <CheckCircle className="h-4 w-4 text-green-500" />
    }
    
    if (isActive) {
      return <Activity className="h-4 w-4 text-blue-500 animate-pulse" />
    }
    
    return <Pause className="h-4 w-4 text-yellow-500" />
  }

  const getStatusText = (): string => {
    if (!progress) return 'Preparing...'
    
    if (progress.completionPercentage === 100) {
      return 'Completed'
    }
    
    if (isActive) {
      return 'Processing...'
    }
    
    return 'Paused'
  }

  const formatTime = (ms: number): string => {
    const seconds = Math.ceil(ms / 1000)
    if (seconds < 60) return `${seconds}s`
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds}s`
  }

  const formatSpeed = (): string => {
    if (!progress || !progress.averagePageTime) return 'Calculating...'
    
    const pagesPerSecond = 1000 / progress.averagePageTime
    if (pagesPerSecond >= 1) {
      return `${pagesPerSecond.toFixed(1)} pages/sec`
    } else {
      return `${(progress.averagePageTime / 1000).toFixed(1)}s/page`
    }
  }

  const getRecentMessages = () => {
    return messages.slice(-5).reverse() // Show last 5 messages, most recent first
  }

  const getMessageIcon = (type: LoadingMessage['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-3 w-3 text-green-500" />
      case 'warning':
        return <AlertCircle className="h-3 w-3 text-yellow-500" />
      case 'error':
        return <XCircle className="h-3 w-3 text-red-500" />
      case 'info':
      default:
        return <Activity className="h-3 w-3 text-blue-500" />
    }
  }

  const formatElapsedTime = (): string => {
    if (!progress) return '0s'
    const elapsed = Date.now() - progress.startTime
    return formatTime(elapsed)
  }

  return (
    <Card className={cn("w-full max-w-2xl mx-auto", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            {getStatusIcon()}
            <span>Data Fetching Progress</span>
            <Badge variant={isActive ? "default" : "secondary"}>
              {getStatusText()}
            </Badge>
          </CardTitle>
          <div className="text-sm text-muted-foreground">
            {currentTime}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Main Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="font-medium">
              {progress?.completionPercentage !== undefined 
                ? `${progress.completionPercentage.toFixed(1)}% Complete`
                : 'Initializing...'
              }
            </span>
            {progress && (
              <span className="text-muted-foreground">
                Page {progress.currentPage}
                {progress.totalPages && ` of ${progress.totalPages}`}
              </span>
            )}
          </div>
          
          <div className="relative">
            <Progress 
              value={progress?.completionPercentage || 0} 
              className={cn(
                "h-3 transition-all duration-300 ease-out",
                isAnimating && "animate-pulse"
              )}
            />
            {progress?.completionPercentage !== undefined && (
              <div 
                className={cn(
                  "absolute top-0 left-0 h-3 rounded-full transition-all duration-300",
                  getProgressColor(progress.completionPercentage),
                  "opacity-75"
                )}
                style={{ 
                  width: `${Math.min(progress.completionPercentage, 100)}%` 
                }}
              />
            )}
          </div>
        </div>

        {/* Detailed Metrics */}
        {showDetailedMetrics && progress && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-muted/30 rounded-lg">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mb-1">
                <Database className="h-3 w-3" />
                Orders
              </div>
              <div className="font-semibold">
                {progress.fetchedOrders.toLocaleString()}
                {progress.estimatedTotal && (
                  <span className="text-xs text-muted-foreground ml-1">
                    / {progress.estimatedTotal.toLocaleString()}
                  </span>
                )}
              </div>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mb-1">
                <Activity className="h-3 w-3" />
                Speed
              </div>
              <div className="font-semibold text-sm">
                {formatSpeed()}
              </div>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mb-1">
                <Clock className="h-3 w-3" />
                Elapsed
              </div>
              <div className="font-semibold text-sm">
                {formatElapsedTime()}
              </div>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mb-1">
                <Clock className="h-3 w-3" />
                Remaining
              </div>
              <div className="font-semibold text-sm">
                {progress.remainingTime ? formatTime(progress.remainingTime) : 'Unknown'}
              </div>
            </div>
          </div>
        )}

        {/* Control Buttons */}
        {showControls && (
          <div className="flex justify-center gap-2">
            {isActive ? (
              <Button
                variant="outline"
                size="sm"
                onClick={onPause}
                disabled={!onPause}
                className="flex items-center gap-2"
              >
                <Pause className="h-4 w-4" />
                Pause
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={onResume}
                disabled={!onResume}
                className="flex items-center gap-2"
              >
                <Play className="h-4 w-4" />
                Resume
              </Button>
            )}
            
            <Button
              variant="outline"
              size="sm"
              onClick={onRetry}
              disabled={!onRetry}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Retry
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={onCancel}
              disabled={!onCancel}
              className="flex items-center gap-2"
            >
              <XCircle className="h-4 w-4" />
              Cancel
            </Button>
            
            {onDownloadLogs && (
              <Button
                variant="outline"
                size="sm"
                onClick={onDownloadLogs}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Logs
              </Button>
            )}
          </div>
        )}

        {/* Recent Messages */}
        {showMessages && messages.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">Recent Activity</h4>
            <div className="max-h-32 overflow-y-auto space-y-1 p-3 bg-muted/20 rounded-lg">
              {getRecentMessages().map((message, index) => (
                <div 
                  key={`${message.timestamp}-${index}`} 
                  className="flex items-start gap-2 text-xs"
                >
                  {getMessageIcon(message.type)}
                  <div className="flex-1 min-w-0">
                    <span className="text-foreground">{message.message}</span>
                    <span className="text-muted-foreground ml-2">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

/**
 * Skeleton loader for ProgressIndicator when no data is available
 */
export function ProgressIndicatorSkeleton({ className }: { className?: string }) {
  return (
    <Card className={cn("w-full max-w-2xl mx-auto", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 rounded-full" />
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          <Skeleton className="h-4 w-16" />
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Progress Bar Skeleton */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-20" />
          </div>
          <Skeleton className="h-3 w-full rounded-full" />
        </div>

        {/* Metrics Skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-muted/30 rounded-lg">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="text-center space-y-2">
              <Skeleton className="h-4 w-16 mx-auto" />
              <Skeleton className="h-5 w-12 mx-auto" />
            </div>
          ))}
        </div>

        {/* Controls Skeleton */}
        <div className="flex justify-center gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-20" />
          ))}
        </div>

        {/* Messages Skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <div className="p-3 bg-muted/20 rounded-lg space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-2">
                <Skeleton className="h-3 w-3 rounded-full" />
                <Skeleton className="h-3 flex-1" />
                <Skeleton className="h-3 w-16" />
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default ProgressIndicator
