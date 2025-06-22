import { useState, useCallback, useRef } from 'react'

// Loading state types for different sections
export interface KpiLoadingState {
  ordersProcessing: boolean
  slaBreaches: boolean
  revenueToday: boolean
  avgProcessingTime: boolean
  activeOrders: boolean
  fulfillmentRate: boolean
}

export interface ChartsLoadingState {
  channelVolume: boolean
  enhancedChannelData: boolean
  alerts: boolean
  dailyOrders: boolean
  fulfillmentByBranch: boolean
  channelPerformance: boolean
  topProducts: boolean
  revenueByCategory: boolean
  hourlyOrderSummary: boolean
  processingTimes: boolean
  slaCompliance: boolean
  recentOrders: boolean
  approachingSla: boolean
}

export interface PaginationProgress {
  currentPage: number
  totalPages?: number
  estimatedPages?: number
  fetchedOrders: number
  estimatedTotal?: number
  startTime: number
  lastPageTime: number
  averagePageTime: number
  remainingTime?: number
  completionPercentage?: number
}

export interface LoadingMessage {
  type: 'info' | 'success' | 'warning' | 'error'
  message: string
  timestamp: number
  details?: any
}

export interface LoadingStateOptions {
  // Default loading states
  defaultKpiLoading?: Partial<KpiLoadingState>
  defaultChartsLoading?: Partial<ChartsLoadingState>
  
  // Progress tracking options
  enableProgressTracking?: boolean
  enableTimingAnalysis?: boolean
  enableMemoryMonitoring?: boolean
  
  // Performance thresholds
  slowPageThreshold?: number // ms
  memoryWarningThreshold?: number // MB
}

/**
 * Enhanced loading state management hook for multi-page fetching operations
 * Provides comprehensive loading state management, progress tracking, and performance monitoring
 */
export function useLoadingState(options: LoadingStateOptions = {}) {
  const {
    defaultKpiLoading = {},
    defaultChartsLoading = {},
    enableProgressTracking = true,
    enableTimingAnalysis = true,
    enableMemoryMonitoring = false,
    slowPageThreshold = 5000,
    memoryWarningThreshold = 100
  } = options

  // Core loading states
  const [isLoading, setIsLoading] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState<string>('')
  const [loadingMessages, setLoadingMessages] = useState<LoadingMessage[]>([])
  
  // Individual component loading states
  const [kpiLoading, setKpiLoading] = useState<KpiLoadingState>({
    ordersProcessing: true,
    slaBreaches: true,
    revenueToday: true,
    avgProcessingTime: true,
    activeOrders: true,
    fulfillmentRate: true,
    ...defaultKpiLoading
  })
  
  const [chartsLoading, setChartsLoading] = useState<ChartsLoadingState>({
    channelVolume: true,
    enhancedChannelData: true,
    alerts: true,
    dailyOrders: true,
    fulfillmentByBranch: true,
    channelPerformance: true,
    topProducts: true,
    revenueByCategory: true,
    hourlyOrderSummary: true,
    processingTimes: true,
    slaCompliance: true,
    recentOrders: true,
    approachingSla: true,
    ...defaultChartsLoading
  })
  
  // Progress tracking state
  const [paginationProgress, setPaginationProgress] = useState<PaginationProgress | null>(null)
  const progressRef = useRef<PaginationProgress | null>(null)
  
  // Performance monitoring
  const [performanceMetrics, setPerformanceMetrics] = useState<{
    totalTime: number
    averagePageTime: number
    slowPages: number
    fastPages: number
    errors: number
    retries: number
    memoryUsage?: string
  } | null>(null)

  // Add loading message with timestamp and type
  const addLoadingMessage = useCallback((message: string, type: LoadingMessage['type'] = 'info', details?: any) => {
    const newMessage: LoadingMessage = {
      type,
      message,
      timestamp: Date.now(),
      details
    }
    
    setLoadingMessages(prev => [...prev.slice(-19), newMessage]) // Keep last 20 messages
    setLoadingMessage(message)
    
    // Console logging with emoji indicators
    const emoji = {
      info: '🔄',
      success: '✅',
      warning: '⚠️',
      error: '❌'
    }[type]
    
    console.log(`${emoji} [Loading] ${message}`, details ? details : '')
  }, [])

  // Start pagination progress tracking
  const startPaginationProgress = useCallback((estimatedPages?: number, estimatedTotal?: number) => {
    if (!enableProgressTracking) return
    
    const progress: PaginationProgress = {
      currentPage: 0,
      totalPages: estimatedPages,
      estimatedPages,
      fetchedOrders: 0,
      estimatedTotal,
      startTime: Date.now(),
      lastPageTime: Date.now(),
      averagePageTime: 0,
      remainingTime: undefined,
      completionPercentage: 0
    }
    
    setPaginationProgress(progress)
    progressRef.current = progress
    addLoadingMessage(`Starting pagination fetch${estimatedPages ? ` (estimated ${estimatedPages} pages)` : ''}`, 'info')
  }, [enableProgressTracking, addLoadingMessage])

  // Update pagination progress for each page
  const updatePaginationProgress = useCallback((currentPage: number, ordersThisPage: number, hasNext: boolean, pageStartTime?: number) => {
    if (!enableProgressTracking || !progressRef.current) return
    
    const now = Date.now()
    const progress = progressRef.current
    const pageTime = pageStartTime ? now - pageStartTime : now - progress.lastPageTime
    
    // Update progress
    const updatedProgress: PaginationProgress = {
      ...progress,
      currentPage,
      fetchedOrders: progress.fetchedOrders + ordersThisPage,
      lastPageTime: now,
      averagePageTime: currentPage > 0 ? (now - progress.startTime) / currentPage : 0,
    }
    
    // Calculate completion percentage
    if (updatedProgress.totalPages || updatedProgress.estimatedPages) {
      const totalEstimate = updatedProgress.totalPages || updatedProgress.estimatedPages!
      updatedProgress.completionPercentage = Math.min(95, (currentPage / totalEstimate) * 100)
    } else if (!hasNext) {
      updatedProgress.completionPercentage = 100
      updatedProgress.totalPages = currentPage
    }
    
    // Calculate remaining time
    if (updatedProgress.averagePageTime > 0 && updatedProgress.totalPages) {
      const remainingPages = updatedProgress.totalPages - currentPage
      updatedProgress.remainingTime = remainingPages * updatedProgress.averagePageTime
    }
    
    progressRef.current = updatedProgress
    setPaginationProgress(updatedProgress)
    
    // Log progress with performance details
    const details = {
      page: currentPage,
      orders: ordersThisPage,
      totalOrders: updatedProgress.fetchedOrders,
      pageTime: `${pageTime}ms`,
      avgTime: `${updatedProgress.averagePageTime.toFixed(0)}ms`,
      hasNext,
      ...(updatedProgress.completionPercentage && { progress: `${updatedProgress.completionPercentage.toFixed(1)}%` }),
      ...(updatedProgress.remainingTime && { remaining: `${(updatedProgress.remainingTime / 1000).toFixed(0)}s` })
    }
    
    // Check for slow pages
    if (enableTimingAnalysis && pageTime > slowPageThreshold) {
      addLoadingMessage(`Page ${currentPage} completed (SLOW: ${pageTime}ms)`, 'warning', details)
    } else {
      addLoadingMessage(`Page ${currentPage} completed: ${ordersThisPage} orders`, 'success', details)
    }
  }, [enableProgressTracking, enableTimingAnalysis, slowPageThreshold, addLoadingMessage])

  // Complete pagination progress
  const completePaginationProgress = useCallback((totalOrders: number, totalTime: number, errors: number = 0, retries: number = 0) => {
    if (!enableProgressTracking || !progressRef.current) return
    
    const progress = progressRef.current
    const finalMetrics = {
      totalTime,
      averagePageTime: progress.currentPage > 0 ? totalTime / progress.currentPage : 0,
      slowPages: 0, // Could be tracked during updates
      fastPages: 0, // Could be tracked during updates
      errors,
      retries
    }
    
    setPerformanceMetrics(finalMetrics)
    
    const completionDetails = {
      totalOrders,
      totalPages: progress.currentPage,
      totalTime: `${(totalTime / 1000).toFixed(2)}s`,
      averagePageTime: `${finalMetrics.averagePageTime.toFixed(0)}ms`,
      errors,
      retries,
      ...(progress.estimatedTotal && { 
        accuracy: `${((totalOrders / progress.estimatedTotal) * 100).toFixed(1)}%` 
      })
    }
    
    addLoadingMessage(`Pagination complete: ${totalOrders} orders fetched`, 'success', completionDetails)
    
    // Reset progress after completion
    setTimeout(() => {
      setPaginationProgress(null)
      progressRef.current = null
    }, 3000) // Keep visible for 3 seconds
  }, [enableProgressTracking, addLoadingMessage])

  // Update individual KPI loading state
  const setKpiLoadingState = useCallback((key: keyof KpiLoadingState, loading: boolean) => {
    setKpiLoading(prev => ({ ...prev, [key]: loading }))
    
    if (!loading) {
      addLoadingMessage(`${key} data loaded`, 'success')
    }
  }, [addLoadingMessage])

  // Update individual chart loading state
  const setChartLoadingState = useCallback((key: keyof ChartsLoadingState, loading: boolean) => {
    setChartsLoading(prev => ({ ...prev, [key]: loading }))
    
    if (!loading) {
      addLoadingMessage(`${key} chart loaded`, 'success')
    }
  }, [addLoadingMessage])

  // Batch update KPI loading states
  const setKpiLoadingBatch = useCallback((updates: Partial<KpiLoadingState>) => {
    setKpiLoading(prev => ({ ...prev, ...updates }))
    
    const loadedKeys = Object.entries(updates).filter(([_, loading]) => !loading).map(([key]) => key)
    if (loadedKeys.length > 0) {
      addLoadingMessage(`Loaded: ${loadedKeys.join(', ')}`, 'success')
    }
  }, [addLoadingMessage])

  // Batch update chart loading states
  const setChartsLoadingBatch = useCallback((updates: Partial<ChartsLoadingState>) => {
    setChartsLoading(prev => ({ ...prev, ...updates }))
    
    const loadedKeys = Object.entries(updates).filter(([_, loading]) => !loading).map(([key]) => key)
    if (loadedKeys.length > 0) {
      addLoadingMessage(`Charts loaded: ${loadedKeys.join(', ')}`, 'success')
    }
  }, [addLoadingMessage])

  // Reset all loading states
  const resetLoadingStates = useCallback(() => {
    setIsLoading(false)
    setLoadingMessage('')
    setKpiLoading({
      ordersProcessing: false,
      slaBreaches: false,
      revenueToday: false,
      avgProcessingTime: false,
      activeOrders: false,
      fulfillmentRate: false
    })
    setChartsLoading({
      channelVolume: false,
      enhancedChannelData: false,
      alerts: false,
      dailyOrders: false,
      fulfillmentByBranch: false,
      channelPerformance: false,
      topProducts: false,
      revenueByCategory: false,
      hourlyOrderSummary: false,
      processingTimes: false,
      slaCompliance: false,
      recentOrders: false,
      approachingSla: false
    })
    setPaginationProgress(null)
    progressRef.current = null
    addLoadingMessage('All loading states reset', 'info')
  }, [addLoadingMessage])

  // Set all loading states to true (for refresh)
  const startLoading = useCallback((message: string = 'Loading data...') => {
    setIsLoading(true)
    setLoadingMessage(message)
    setKpiLoading({
      ordersProcessing: true,
      slaBreaches: true,
      revenueToday: true,
      avgProcessingTime: true,
      activeOrders: true,
      fulfillmentRate: true
    })
    setChartsLoading({
      channelVolume: true,
      enhancedChannelData: true,
      alerts: true,
      dailyOrders: true,
      fulfillmentByBranch: true,
      channelPerformance: true,
      topProducts: true,
      revenueByCategory: true,
      hourlyOrderSummary: true,
      processingTimes: true,
      slaCompliance: true,
      recentOrders: true,
      approachingSla: true
    })
    addLoadingMessage(message, 'info')
  }, [addLoadingMessage])

  // Clear loading messages
  const clearLoadingMessages = useCallback(() => {
    setLoadingMessages([])
    setLoadingMessage('')
  }, [])

  // Get current progress summary
  const getProgressSummary = useCallback(() => {
    if (!paginationProgress) return null
    
    return {
      ...paginationProgress,
      isActive: paginationProgress.completionPercentage !== 100,
      formattedTime: paginationProgress.averagePageTime > 0 ? 
        `${(paginationProgress.averagePageTime / 1000).toFixed(1)}s/page` : 'Calculating...',
      formattedRemaining: paginationProgress.remainingTime ? 
        `${Math.ceil(paginationProgress.remainingTime / 1000)}s remaining` : 'Unknown',
      formattedProgress: paginationProgress.completionPercentage ? 
        `${paginationProgress.completionPercentage.toFixed(1)}%` : 'Unknown'
    }
  }, [paginationProgress])

  return {
    // Core loading state
    isLoading,
    setIsLoading,
    loadingMessage,
    setLoadingMessage,
    loadingMessages,
    
    // Individual loading states
    kpiLoading,
    chartsLoading,
    setKpiLoadingState,
    setChartLoadingState,
    setKpiLoadingBatch,
    setChartsLoadingBatch,
    
    // Progress tracking
    paginationProgress,
    performanceMetrics,
    startPaginationProgress,
    updatePaginationProgress,
    completePaginationProgress,
    getProgressSummary,
    
    // Utility functions
    startLoading,
    resetLoadingStates,
    addLoadingMessage,
    clearLoadingMessages,
  }
}

// Export types for use in other components
export type { LoadingMessage, PaginationProgress }
