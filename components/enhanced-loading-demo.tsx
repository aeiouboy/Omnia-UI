"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useLoadingState } from '@/hooks/use-loading-state'
import ProgressIndicator from '@/components/progress-indicator'
import FetchSummary from '@/components/fetch-summary'
import { loggingService } from '@/lib/logging-service'
import enhancedFetchWithProgress from '@/lib/enhanced-pagination'

/**
 * Demo component showing how the enhanced loading system would be integrated
 * into the executive dashboard for multi-page data fetching
 */
export function EnhancedLoadingDemo() {
  const [isRunning, setIsRunning] = useState(false)
  const [showSummary, setShowSummary] = useState(false)
  const [summaryData, setSummaryData] = useState(null)

  // Initialize the enhanced loading state management
  const loadingState = useLoadingState({
    enableProgressTracking: true,
    enableTimingAnalysis: true,
    enableMemoryMonitoring: true,
    slowPageThreshold: 5000,
    memoryWarningThreshold: 100
  })

  const handleStartDemo = async () => {
    setIsRunning(true)
    setShowSummary(false)
    
    try {
      // Simulate a multi-page fetch operation
      await simulateEnhancedFetch()
    } catch (error) {
      console.error('Demo fetch failed:', error)
    } finally {
      setIsRunning(false)
    }
  }

  const simulateEnhancedFetch = async () => {
    // Start loading with initial message
    loadingState.startLoading('Preparing to fetch orders data...')
    
    // Initialize progress tracking
    const estimatedPages = 5
    const estimatedOrders = 15000
    loadingState.startPaginationProgress(estimatedPages, estimatedOrders)
    
    // Simulate fetching multiple pages
    for (let page = 1; page <= estimatedPages; page++) {
      const pageStartTime = Date.now()
      
      // Log page start
      loadingState.addLoadingMessage(`Fetching page ${page} with pageSize 3000...`, 'info')
      
      // Simulate network delay (variable timing)
      const delay = Math.random() * 2000 + 1000 // 1-3 seconds
      await new Promise(resolve => setTimeout(resolve, delay))
      
      // Simulate page results
      const ordersThisPage = Math.floor(Math.random() * 3000) + 2000 // 2000-5000 orders per page
      const hasNext = page < estimatedPages
      
      // Simulate occasional errors
      if (Math.random() < 0.1) { // 10% chance of error
        loadingState.addLoadingMessage(`Page ${page} failed, retrying...`, 'warning')
        await new Promise(resolve => setTimeout(resolve, 1000)) // Retry delay
      }
      
      // Update progress
      loadingState.updatePaginationProgress(page, ordersThisPage, hasNext, pageStartTime)
      
      // Update individual loading states as data becomes available
      if (page === 1) {
        loadingState.setKpiLoadingBatch({
          ordersProcessing: false,
          slaBreaches: false,
          revenueToday: false
        })
      }
      
      if (page === 2) {
        loadingState.setKpiLoadingBatch({
          avgProcessingTime: false,
          activeOrders: false,
          fulfillmentRate: false
        })
      }
      
      if (page === 3) {
        loadingState.setChartsLoadingBatch({
          channelVolume: false,
          alerts: false,
          dailyOrders: false
        })
      }
      
      if (page === 4) {
        loadingState.setChartsLoadingBatch({
          fulfillmentByBranch: false,
          channelPerformance: false,
          topProducts: false
        })
      }
      
      if (page === 5) {
        loadingState.setChartsLoadingBatch({
          revenueByCategory: false,
          hourlyOrderSummary: false,
          processingTimes: false,
          slaCompliance: false
        })
      }
    }
    
    // Complete the operation
    const totalTime = Date.now() - (loadingState.paginationProgress?.startTime || Date.now())
    const totalOrders = estimatedOrders - Math.floor(Math.random() * 1000) // Simulate slight variance
    
    loadingState.completePaginationProgress(totalOrders, totalTime, 0, 0)
    loadingState.resetLoadingStates()
    
    // Generate summary data
    const summary = {
      totalOrders,
      totalPages: estimatedPages,
      successfulPages: estimatedPages,
      failedPages: 0,
      totalTime,
      averagePageTime: totalTime / estimatedPages,
      successRate: 100,
      errors: [],
      completionReason: 'completed' as const,
      isPartialData: false,
      cacheStatus: 'updated' as const,
      memoryUsage: {
        peak: '45.2MB',
        average: '38.7MB',
        memoryPerOrder: '2.8KB'
      }
    }
    
    setSummaryData(summary)
    setShowSummary(true)
  }

  const handleExportLogs = () => {
    const logs = loggingService.exportLogs()
    const blob = new Blob([logs], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `loading-demo-logs-${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const getProgressSummary = loadingState.getProgressSummary()

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Enhanced Loading States Demo</CardTitle>
          <p className="text-sm text-muted-foreground">
            Demonstration of the new loading state management system for multi-page data fetching operations.
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button 
              onClick={handleStartDemo} 
              disabled={isRunning}
              className="flex-1"
            >
              {isRunning ? 'Running Demo...' : 'Start Enhanced Loading Demo'}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => loadingState.clearLoadingMessages()}
            >
              Clear Messages
            </Button>
            
            <Button 
              variant="outline" 
              onClick={handleExportLogs}
            >
              Export Logs
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Progress Indicator */}
      {(isRunning || loadingState.paginationProgress) && (
        <ProgressIndicator
          progress={loadingState.paginationProgress}
          messages={loadingState.loadingMessages}
          isActive={isRunning}
          onPause={() => console.log('Pause requested')}
          onResume={() => console.log('Resume requested')}
          onCancel={() => {
            setIsRunning(false)
            loadingState.resetLoadingStates()
          }}
          onRetry={() => handleStartDemo()}
          onDownloadLogs={handleExportLogs}
          showControls={true}
          showMessages={true}
          showDetailedMetrics={true}
        />
      )}

      {/* KPI Loading States Demo */}
      <Card>
        <CardHeader>
          <CardTitle>KPI Loading States</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {Object.entries(loadingState.kpiLoading).map(([key, loading]) => (
              <div key={key} className="p-3 border rounded-lg">
                <div className="text-sm font-medium capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </div>
                <div className={`text-xs mt-1 ${loading ? 'text-yellow-600' : 'text-green-600'}`}>
                  {loading ? 'Loading...' : 'Loaded'}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Charts Loading States Demo */}
      <Card>
        <CardHeader>
          <CardTitle>Charts Loading States</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {Object.entries(loadingState.chartsLoading).map(([key, loading]) => (
              <div key={key} className="p-2 border rounded text-center">
                <div className="text-xs font-medium capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </div>
                <div className={`text-xs mt-1 ${loading ? 'text-yellow-600' : 'text-green-600'}`}>
                  {loading ? '⏳' : '✅'}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Loading Messages */}
      {loadingState.loadingMessages.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Loading Messages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-40 overflow-y-auto space-y-1">
              {loadingState.loadingMessages.slice(-10).reverse().map((message, index) => (
                <div key={`${message.timestamp}-${index}`} className="text-xs p-2 border-l-2 border-gray-200">
                  <span className={`font-medium ${
                    message.type === 'success' ? 'text-green-600' :
                    message.type === 'warning' ? 'text-yellow-600' :
                    message.type === 'error' ? 'text-red-600' :
                    'text-blue-600'
                  }`}>
                    [{message.type.toUpperCase()}]
                  </span>
                  <span className="ml-2">{message.message}</span>
                  <span className="ml-2 text-gray-500">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Completion Summary */}
      {showSummary && summaryData && (
        <FetchSummary
          data={summaryData}
          logs={loggingService.getLogs()}
          messages={loadingState.loadingMessages}
          onRetry={() => {
            setShowSummary(false)
            handleStartDemo()
          }}
          onExportLogs={handleExportLogs}
          onShareSummary={() => console.log('Share summary')}
          onDismiss={() => setShowSummary(false)}
          showDetailedMetrics={true}
          showErrorRecovery={true}
          showExportOptions={true}
        />
      )}
    </div>
  )
}

export default EnhancedLoadingDemo
