"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Clock, 
  Database, 
  Activity, 
  Download, 
  RefreshCw, 
  Share, 
  ChevronDown,
  ChevronUp,
  TrendingUp,
  TrendingDown,
  Zap,
  AlertCircle,
  FileText,
  Copy
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { LoadingMessage, PaginationProgress } from '@/hooks/use-loading-state'
import type { LogEntry } from '@/lib/logging-service'

export interface FetchSummaryData {
  // Core metrics
  totalOrders: number
  totalPages: number
  successfulPages: number
  failedPages: number
  totalTime: number
  
  // Performance metrics
  averagePageTime: number
  fastestPage?: number
  slowestPage?: number
  successRate: number
  
  // Data quality
  duplicatesRemoved?: number
  invalidOrdersFiltered?: number
  dateRangeViolations?: number
  
  // Error details
  errors: Array<{
    page: number
    error: string
    timestamp: number
    retryCount: number
  }>
  
  // Memory and performance
  memoryUsage?: {
    peak: string
    average: string
    memoryPerOrder: string
  }
  
  // Cache information
  cacheStatus?: 'hit' | 'miss' | 'updated' | 'disabled'
  cacheAge?: number
  
  // Completion status
  completionReason: 'completed' | 'timeout' | 'memory_limit' | 'error_limit' | 'user_cancelled'
  isPartialData: boolean
}

export interface FetchSummaryProps {
  data: FetchSummaryData
  logs?: LogEntry[]
  messages?: LoadingMessage[]
  onRetry?: () => void
  onRetryFailedPages?: (pages: number[]) => void
  onExportLogs?: () => void
  onShareSummary?: () => void
  onDismiss?: () => void
  showDetailedMetrics?: boolean
  showErrorRecovery?: boolean
  showExportOptions?: boolean
  className?: string
}

export function FetchSummary({
  data,
  logs = [],
  messages = [],
  onRetry,
  onRetryFailedPages,
  onExportLogs,
  onShareSummary,
  onDismiss,
  showDetailedMetrics = true,
  showErrorRecovery = true,
  showExportOptions = true,
  className
}: FetchSummaryProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showErrors, setShowErrors] = useState(false)
  const [showLogs, setShowLogs] = useState(false)
  const [copiedToClipboard, setCopiedToClipboard] = useState(false)

  // Get completion status details
  const getCompletionStatus = () => {
    const { completionReason, isPartialData, successRate } = data
    
    if (completionReason === 'completed' && !isPartialData && successRate === 100) {
      return {
        icon: <CheckCircle className="h-5 w-5 text-green-500" />,
        title: 'Fetch Completed Successfully',
        variant: 'success' as const,
        description: 'All data has been successfully retrieved with no issues.'
      }
    }
    
    if (completionReason === 'completed' && (isPartialData || successRate < 100)) {
      return {
        icon: <AlertTriangle className="h-5 w-5 text-yellow-500" />,
        title: 'Fetch Completed with Issues',
        variant: 'warning' as const,
        description: `Retrieved ${data.totalOrders} orders but encountered ${data.failedPages} failed pages.`
      }
    }
    
    switch (completionReason) {
      case 'timeout':
        return {
          icon: <Clock className="h-5 w-5 text-red-500" />,
          title: 'Fetch Timed Out',
          variant: 'destructive' as const,
          description: 'Operation exceeded time limit. Partial data may be available.'
        }
      case 'memory_limit':
        return {
          icon: <AlertCircle className="h-5 w-5 text-yellow-500" />,
          title: 'Memory Limit Reached',
          variant: 'warning' as const,
          description: 'Stopped to prevent memory issues. Data successfully retrieved up to limit.'
        }
      case 'error_limit':
        return {
          icon: <XCircle className="h-5 w-5 text-red-500" />,
          title: 'Too Many Errors',
          variant: 'destructive' as const,
          description: 'Stopped due to consecutive failures. Check network connection.'
        }
      case 'user_cancelled':
        return {
          icon: <XCircle className="h-5 w-5 text-gray-500" />,
          title: 'Fetch Cancelled',
          variant: 'secondary' as const,
          description: 'Operation was cancelled by user. Partial data may be available.'
        }
      default:
        return {
          icon: <AlertTriangle className="h-5 w-5 text-gray-500" />,
          title: 'Fetch Status Unknown',
          variant: 'secondary' as const,
          description: 'Unable to determine completion status.'
        }
    }
  }

  const status = getCompletionStatus()

  const formatTime = (ms: number): string => {
    if (ms < 1000) return `${ms}ms`
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return `${minutes}m ${seconds}s`
  }

  const formatNumber = (num: number): string => {
    return num.toLocaleString()
  }

  const getPerformanceRating = (): { rating: string; color: string; icon: JSX.Element } => {
    const avgTimePerPage = data.averagePageTime
    
    if (avgTimePerPage < 1000) {
      return {
        rating: 'Excellent',
        color: 'text-green-500',
        icon: <TrendingUp className="h-4 w-4 text-green-500" />
      }
    } else if (avgTimePerPage < 3000) {
      return {
        rating: 'Good',
        color: 'text-blue-500',
        icon: <Zap className="h-4 w-4 text-blue-500" />
      }
    } else if (avgTimePerPage < 5000) {
      return {
        rating: 'Fair',
        color: 'text-yellow-500',
        icon: <Activity className="h-4 w-4 text-yellow-500" />
      }
    } else {
      return {
        rating: 'Slow',
        color: 'text-red-500',
        icon: <TrendingDown className="h-4 w-4 text-red-500" />
      }
    }
  }

  const performance = getPerformanceRating()

  const handleCopyToClipboard = async () => {
    const summaryText = generateSummaryText()
    try {
      await navigator.clipboard.writeText(summaryText)
      setCopiedToClipboard(true)
      setTimeout(() => setCopiedToClipboard(false), 2000)
    } catch (error) {
      console.error('Failed to copy to clipboard:', error)
    }
  }

  const generateSummaryText = (): string => {
    return `
Data Fetch Summary - ${new Date().toLocaleString()}
${'='.repeat(50)}

Status: ${status.title}
Total Orders: ${formatNumber(data.totalOrders)}
Pages Processed: ${data.totalPages} (${data.successfulPages} successful, ${data.failedPages} failed)
Success Rate: ${data.successRate.toFixed(1)}%
Total Time: ${formatTime(data.totalTime)}
Average Page Time: ${formatTime(data.averagePageTime)}
Performance Rating: ${performance.rating}

${data.errors.length > 0 ? `
Errors Encountered:
${data.errors.map(err => `- Page ${err.page}: ${err.error} (${err.retryCount} retries)`).join('\n')}
` : ''}

Cache Status: ${data.cacheStatus || 'Unknown'}
Completion Reason: ${data.completionReason}
Is Partial Data: ${data.isPartialData ? 'Yes' : 'No'}

Generated by RIS OMS Executive Dashboard
    `.trim()
  }

  const getFailedPageNumbers = (): number[] => {
    return data.errors.map(error => error.page)
  }

  return (
    <Card className={cn("w-full max-w-4xl mx-auto", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3">
            {status.icon}
            <span>{status.title}</span>
            <Badge variant={status.variant}>
              {data.isPartialData ? 'Partial' : 'Complete'}
            </Badge>
          </CardTitle>
          
          {onDismiss && (
            <Button variant="ghost" size="sm" onClick={onDismiss}>
              Dismiss
            </Button>
          )}
        </div>
        
        <Alert variant={status.variant}>
          <AlertDescription>{status.description}</AlertDescription>
        </Alert>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Core Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-muted/30 rounded-lg">
            <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mb-1">
              <Database className="h-3 w-3" />
              Orders Retrieved
            </div>
            <div className="text-lg font-semibold">{formatNumber(data.totalOrders)}</div>
          </div>

          <div className="text-center p-3 bg-muted/30 rounded-lg">
            <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mb-1">
              <Activity className="h-3 w-3" />
              Success Rate
            </div>
            <div className="text-lg font-semibold">{data.successRate.toFixed(1)}%</div>
          </div>

          <div className="text-center p-3 bg-muted/30 rounded-lg">
            <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mb-1">
              <Clock className="h-3 w-3" />
              Total Time
            </div>
            <div className="text-lg font-semibold">{formatTime(data.totalTime)}</div>
          </div>

          <div className="text-center p-3 bg-muted/30 rounded-lg">
            <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mb-1">
              {performance.icon}
              Performance
            </div>
            <div className={cn("text-lg font-semibold", performance.color)}>
              {performance.rating}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Pages Processed: {data.totalPages}</span>
            <span>Successful: {data.successfulPages} | Failed: {data.failedPages}</span>
          </div>
          <Progress value={data.successRate} className="h-2" />
        </div>

        {/* Detailed Metrics (Collapsible) */}
        {showDetailedMetrics && (
          <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between">
                <span>Detailed Performance Metrics</span>
                {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4 pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="font-medium">Timing Metrics</div>
                  <div className="mt-2 space-y-1 text-muted-foreground">
                    <div>Average page time: {formatTime(data.averagePageTime)}</div>
                    {data.fastestPage && <div>Fastest page: {formatTime(data.fastestPage)}</div>}
                    {data.slowestPage && <div>Slowest page: {formatTime(data.slowestPage)}</div>}
                  </div>
                </div>

                <div>
                  <div className="font-medium">Data Quality</div>
                  <div className="mt-2 space-y-1 text-muted-foreground">
                    {data.duplicatesRemoved !== undefined && (
                      <div>Duplicates removed: {data.duplicatesRemoved}</div>
                    )}
                    {data.invalidOrdersFiltered !== undefined && (
                      <div>Invalid orders filtered: {data.invalidOrdersFiltered}</div>
                    )}
                    {data.dateRangeViolations !== undefined && (
                      <div>Date violations: {data.dateRangeViolations}</div>
                    )}
                  </div>
                </div>

                <div>
                  <div className="font-medium">System Performance</div>
                  <div className="mt-2 space-y-1 text-muted-foreground">
                    {data.memoryUsage && (
                      <>
                        <div>Peak memory: {data.memoryUsage.peak}</div>
                        <div>Memory per order: {data.memoryUsage.memoryPerOrder}</div>
                      </>
                    )}
                    <div>Cache status: {data.cacheStatus || 'Unknown'}</div>
                  </div>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Error Recovery Section */}
        {showErrorRecovery && data.errors.length > 0 && (
          <div className="space-y-4">
            <Separator />
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  Error Recovery Options
                </h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowErrors(!showErrors)}
                >
                  {showErrors ? 'Hide' : 'Show'} Errors ({data.errors.length})
                </Button>
              </div>

              {showErrors && (
                <div className="space-y-2 mb-4 max-h-32 overflow-y-auto">
                  {data.errors.map((error, index) => (
                    <div key={index} className="text-sm p-2 bg-red-50 rounded border-l-2 border-red-200">
                      <div className="font-medium">Page {error.page}</div>
                      <div className="text-muted-foreground">{error.error}</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(error.timestamp).toLocaleTimeString()} • {error.retryCount} retries
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                {onRetry && (
                  <Button onClick={onRetry} variant="outline" size="sm">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Retry All
                  </Button>
                )}
                
                {onRetryFailedPages && (
                  <Button 
                    onClick={() => onRetryFailedPages(getFailedPageNumbers())} 
                    variant="outline" 
                    size="sm"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Retry Failed Pages Only
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Export and Sharing Options */}
        {showExportOptions && (
          <div className="space-y-4">
            <Separator />
            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Export & Sharing
              </h4>
              
              <div className="flex flex-wrap gap-2">
                {onExportLogs && (
                  <Button onClick={onExportLogs} variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export Logs
                  </Button>
                )}
                
                <Button onClick={handleCopyToClipboard} variant="outline" size="sm">
                  <Copy className="h-4 w-4 mr-2" />
                  {copiedToClipboard ? 'Copied!' : 'Copy Summary'}
                </Button>
                
                {onShareSummary && (
                  <Button onClick={onShareSummary} variant="outline" size="sm">
                    <Share className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                )}
                
                {logs.length > 0 && (
                  <Button 
                    onClick={() => setShowLogs(!showLogs)} 
                    variant="outline" 
                    size="sm"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    {showLogs ? 'Hide' : 'Show'} Logs ({logs.length})
                  </Button>
                )}
              </div>

              {/* Logs Display */}
              {showLogs && logs.length > 0 && (
                <div className="mt-4 max-h-40 overflow-y-auto p-3 bg-gray-50 rounded border text-xs font-mono">
                  {logs.slice(-20).map((log, index) => (
                    <div key={index} className="py-1">
                      <span className={cn(
                        "inline-block w-16",
                        log.level === 'error' && "text-red-600",
                        log.level === 'warning' && "text-yellow-600",
                        log.level === 'success' && "text-green-600",
                        log.level === 'info' && "text-blue-600"
                      )}>
                        [{log.level.toUpperCase()}]
                      </span>
                      <span className="ml-2">{log.message}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default FetchSummary
