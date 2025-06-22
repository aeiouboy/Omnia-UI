"use client"

/**
 * Executive Dashboard Component
 * 
 * IMPORTANT: NO FILTERS ALLOWED
 * - This dashboard must NOT have any filtering capabilities
 * - No date range picker, no search box, no status filters
 * - Always displays full 7-day data for complete business overview
 * - All filtering should be done in Order Management Hub only
 */

import { useEffect, useCallback, useState, lazy, Suspense } from "react"
import { useToast } from "@/components/ui/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { ConnectionStatus } from "@/components/error-feedback"
import { RealTimeStatus } from "@/components/real-time-status"
import { CriticalAlertsBanner } from "@/components/critical-alerts-banner"
import { OrderDetailView } from "@/components/order-detail-view"
import { usePullToRefresh } from "@/hooks/use-pull-to-refresh"
import { useSwipeTabs } from "@/hooks/use-swipe-tabs"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Package, 
  AlertTriangle, 
  DollarSign, 
  BarChart2,
  RefreshCw
} from "lucide-react"

// Import modular components
import { KpiCard } from "@/components/kpi-card"
import { KpiCards } from "./kpi-cards"

// Lazy load tab components
const OverviewTab = lazy(() => import("./overview-tab").then(module => ({ default: module.OverviewTab })))
const OrdersTab = lazy(() => import("./orders-tab").then(module => ({ default: module.OrdersTab })))
const FulfillmentTab = lazy(() => import("./fulfillment-tab").then(module => ({ default: module.FulfillmentTab })))
const AnalyticsTab = lazy(() => import("./analytics-tab").then(module => ({ default: module.AnalyticsTab })))

// Import loading states
import { 
  OverviewTabSkeleton, 
  OrdersTabSkeleton, 
  FulfillmentTabSkeleton, 
  AnalyticsTabSkeleton 
} from "./loading-states"

// Import hooks and utilities
import { useDashboardData, useRealTimeUpdates } from "./hooks"
import { ApiOrder } from "./types"
import { TeamsWebhookService } from "@/lib/teams-webhook"
import { 
  createEscalationRecord, 
  updateEscalationStatus,
  getAlertMessage,
  getSeverityFromAlertType,
} from "@/lib/escalation-service"
import { EscalationCreateInput } from "@/app/api/escalations/route"

export function ExecutiveDashboard() {
  const { toast } = useToast()
  const [isMounted, setIsMounted] = useState(false)
  const [showSkeleton, setShowSkeleton] = useState(true)
  const [dataLoaded, setDataLoaded] = useState(false)
  const [minimumTimeElapsed, setMinimumTimeElapsed] = useState(false)
  
  // Dashboard data and state management
  const {
    dashboardState,
    kpiData,
    chartData,
    alerts,
    ordersData,
    recentOrders,
    isLoading,
    apiStatus,
    lastApiError,
    currentDateRange,
    loadDashboardData
  } = useDashboardData()
  
  // Real-time updates
  const {
    isConnected,
    connectionStatus,
    lastUpdateTime,
    startRealTimeUpdates,
    stopRealTimeUpdates
  } = useRealTimeUpdates(loadDashboardData, dashboardState)
  
  // UI state
  const [activeTab, setActiveTab] = useState("overview")
  const [selectedOrder, setSelectedOrder] = useState<ApiOrder | null>(null)
  const [showOrderDetail, setShowOrderDetail] = useState(false)
  const [isEscalating, setIsEscalating] = useState(false)
  const [isManualRefreshing, setIsManualRefreshing] = useState(false)
  
  // Preloaded tabs tracking
  const [preloadedTabs, setPreloadedTabs] = useState<Set<string>>(new Set())
  
  // Preload tab on hover
  const handleTabHover = useCallback((tabValue: string) => {
    setPreloadedTabs(prev => {
      if (prev.has(tabValue)) return prev
      
      // Trigger preloading by importing the component
      switch (tabValue) {
        case "overview":
          import("./overview-tab")
          break
        case "orders":
          import("./orders-tab")
          break
        case "fulfillment":
          import("./fulfillment-tab")
          break
        case "analytics":
          import("./analytics-tab")
          break
      }
      
      return new Set(prev).add(tabValue)
    })
  }, [])
  
  // Loading states for progressive loading
  const [kpiLoading, setKpiLoading] = useState({
    ordersProcessing: true,
    slaBreaches: true,
    revenueToday: true,
    fulfillmentRate: true,
  })
  
  const [chartsLoading, setChartsLoading] = useState({
    channelVolume: true,
    enhancedChannelData: true,
    alerts: true,
    dailyOrders: true,
    fulfillmentByBranch: true,
    channelPerformance: true,
    topProducts: true,
    revenueByCategory: true,
    hourlyOrderSummary: true,
    recentOrders: true,
  })
  
  // Swipe functionality for tabs
  const { containerRef: swipeContainerRef, swipeProps, swipeIndicator } = useSwipeTabs({
    tabs: ["overview", "orders", "fulfillment", "analytics"],
    activeTab,
    onTabChange: setActiveTab
  })
  
  // Pull-to-refresh hook
  const { containerRef, pullToRefreshIndicator, isRefreshing: isPullRefreshing } = usePullToRefresh({
    onRefresh: async () => {
      console.log("🔄 Pull-to-refresh triggered")
      await loadDashboardData(true)
    },
    threshold: 80,
    resistance: 2.5,
    refreshTimeout: 2000
  })
  
  // Mount effect
  useEffect(() => {
    console.log('🚀 Dashboard mounting, showing skeleton...')
    let isCleanedUp = false
    
    // Set mounted state after next tick to ensure component is rendered
    const mountTimer = setTimeout(() => {
      if (!isCleanedUp) {
        setIsMounted(true)
      }
    }, 0)
    
    
    // Ensure skeleton shows for at least 800ms (reduced for better UX when no data)
    const minimumTimer = setTimeout(() => {
      if (!isCleanedUp) {
        console.log('⏱️ Minimum skeleton time elapsed')
        setMinimumTimeElapsed(true)
      }
    }, 800)
    
    // Load data with extended timeout for complete 7-day data
    const loadDataWithTimeout = async () => {
      try {
        // Extended timeout for complete data loading - 3 minutes
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Loading timeout - Complete data fetch exceeded 3 minutes')), 180000)
        )
        
        // Race between data loading and timeout
        await Promise.race([
          loadDashboardData(),
          timeoutPromise
        ])
        
        console.log('✅ Complete 7-day data loaded successfully')
      } catch (error) {
        console.error('❌ Data loading failed or timed out:', error)
        // Even if timeout occurs, allow partial data display to prevent infinite loading
        if (error instanceof Error && error.message.includes('Loading timeout')) {
          console.warn('⚠️ Timeout occurred - allowing fallback to partial data if available')
        }
      } finally {
        if (!isCleanedUp) {
          console.log('📊 Setting dataLoaded to true (complete or fallback)')
          setDataLoaded(true)
        }
      }
    }
    
    loadDataWithTimeout()
    
    // Start real-time updates after initial load
    const realtimeTimer = setTimeout(() => {
      if (dashboardState.phase === 'READY') {
        startRealTimeUpdates()
      }
    }, 5000)
    
    // Fallback timer - hide skeleton after 3 seconds no matter what
    const fallbackTimer = setTimeout(() => {
      if (!isCleanedUp && showSkeleton) {
        console.warn('⚠️ Fallback timer triggered - forcing skeleton hide')
        setDataLoaded(true)
        setMinimumTimeElapsed(true)
      }
    }, 3000)
    
    return () => {
      isCleanedUp = true
      clearTimeout(mountTimer)
      clearTimeout(minimumTimer)
      clearTimeout(realtimeTimer)
      clearTimeout(fallbackTimer)
      stopRealTimeUpdates()
    }
  }, [])
  
  // Control skeleton visibility - only hide when complete 7-day data is available
  useEffect(() => {
    // Hide skeleton only when complete data is available or explicitly empty
    // apiStatus 'success' now guarantees complete 7-day coverage
    const hasCompleteData = apiStatus === 'success'
    const hasEmptyData = apiStatus === 'empty'
    
    if ((hasCompleteData || hasEmptyData) && minimumTimeElapsed) {
      console.log('🎯 Complete data available and minimum time elapsed, hiding skeleton')
      console.log('📊 Data status:', {
        apiStatus,
        ordersCount: ordersData.length,
        kpiProcessing: kpiData.ordersProcessing,
        channelDataCount: chartData.channelVolume.length
      })
      setShowSkeleton(false)
    } else if (apiStatus === 'loading') {
      console.log('⏳ Still loading complete 7-day dataset...')
      // Keep skeleton visible until complete data is ready
    } else {
      console.log('🔍 Skeleton still showing:', {
        hasCompleteData,
        hasEmptyData,
        minimumTimeElapsed,
        apiStatus,
        ordersCount: ordersData.length
      })
    }
  }, [apiStatus, kpiData, chartData, ordersData, minimumTimeElapsed])
  
  // Update loading states based on data
  useEffect(() => {
    // Update KPI loading states
    setKpiLoading({
      ordersProcessing: false,
      slaBreaches: false,
      revenueToday: false,
      fulfillmentRate: false,
    })
    
    // Update chart loading states
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
      recentOrders: false,
    })
  }, [kpiData, chartData])
  
  // Escalation handler
  const handleEscalation = useCallback(async () => {
    if (isEscalating || alerts.orderAlerts.length === 0) return
    
    setIsEscalating(true)
    try {
      console.log('🚨 Triggering escalation for', alerts.orderAlerts.length, 'breached orders')
      
      // Create escalation records for each breached order
      for (const order of (alerts?.orderAlerts || []).slice(0, 5)) { // Limit to top 5
        const escalationData: EscalationCreateInput = {
          alert_id: order.id,
          alert_type: 'SLA_BREACH',
          message: getAlertMessage('SLA_BREACH', order.order_number),
          severity: 'HIGH',
          status: 'PENDING',
          escalated_by: 'System',
          escalated_to: 'Operations Team'
        }
        
        const escalationRecord = await createEscalationRecord(escalationData)
        console.log('📝 Created escalation record:', escalationRecord.id)
        
        // Send to MS Teams
        const teamsData = {
          orderNumber: order.order_number,
          orderId: order.id,
          alertType: 'SLA_BREACH' as const,
          branch: order.location || 'Store Location TBD',
          severity: 'HIGH' as const,
          description: getAlertMessage('SLA_BREACH', order.order_number)
        }
        await TeamsWebhookService.sendEscalation(teamsData)
        await updateEscalationStatus(escalationRecord.id, { status: 'SENT' })
      }
      
      toast({
        title: "Escalation Sent",
        description: `${Math.min(alerts.orderAlerts.length, 5)} SLA breach alerts have been escalated to MS Teams`,
        variant: "default"
      })
      
      // Refresh dashboard data after escalation
      setTimeout(() => loadDashboardData(), 2000)
      
    } catch (error) {
      console.error('❌ Escalation failed:', error)
      toast({
        title: "Escalation Failed",
        description: error instanceof Error ? error.message : "Failed to send escalation alerts",
        variant: "destructive"
      })
    } finally {
      setIsEscalating(false)
    }
  }, [isEscalating, alerts.orderAlerts, toast, loadDashboardData])
  
  // Order click handler
  const handleOrderClick = useCallback((order: ApiOrder) => {
    console.log('🔍 Order clicked for details:', order.id || order.order_no)
    setSelectedOrder(order)
    setShowOrderDetail(true)
  }, [])
  
  const handleCloseOrderDetail = useCallback(() => {
    setShowOrderDetail(false)
    setSelectedOrder(null)
  }, [])
  
  // Manual refresh handler
  const handleManualRefresh = useCallback(async () => {
    setIsManualRefreshing(true)
    try {
      await loadDashboardData(false)
    } finally {
      setIsManualRefreshing(false)
    }
  }, [loadDashboardData])
  
  // Show skeleton until explicitly hidden
  if (showSkeleton) {
    console.log('🦴 Showing skeleton - dataLoaded:', dataLoaded, 'minimumTimeElapsed:', minimumTimeElapsed)
    return (
      <div className="space-y-8 p-6 bg-gray-50/50 min-h-screen animate-in fade-in duration-300">
        
        {/* Header skeleton */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-2">
            <div className="h-8 w-64 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-96 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="flex gap-3">
            <div className="h-10 w-40 bg-gray-200 rounded animate-pulse" />
            <div className="h-10 w-32 bg-gray-200 rounded animate-pulse" />
            <div className="h-10 w-32 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
        
        {/* Critical alerts skeleton */}
        <div className="h-16 w-full bg-gray-200 rounded-lg animate-pulse" />
        
        {/* KPI cards skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg border border-gray-200 p-6 animate-in slide-in-from-bottom duration-500" style={{ animationDelay: `${i * 100}ms` }}>
              <div className="flex justify-between items-start mb-4">
                <div className="h-10 w-10 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
              </div>
              <div className="h-8 w-24 bg-gray-300 rounded mb-2 animate-pulse" />
              <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
            </div>
          ))}
        </div>
        
        {/* Tabs skeleton */}
        <div className="mt-12 space-y-6">
          <div className="h-10 w-full max-w-md bg-gray-200 rounded-lg animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-[400px] bg-white border border-gray-200 rounded-lg p-6 animate-in slide-in-from-left duration-700">
              <div className="h-6 w-48 bg-gray-200 rounded mb-4 animate-pulse" />
              <div className="h-[320px] bg-gray-100 rounded animate-pulse" />
            </div>
            <div className="h-[400px] bg-white border border-gray-200 rounded-lg p-6 animate-in slide-in-from-right duration-700">
              <div className="h-6 w-48 bg-gray-200 rounded mb-4 animate-pulse" />
              <div className="h-[320px] bg-gray-100 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  // Show empty state when no data is available
  if (apiStatus === 'empty' && !showSkeleton) {
    return (
      <div className="space-y-8 relative p-6 bg-gray-50/50 min-h-screen">
        <div ref={containerRef}>
          {pullToRefreshIndicator}
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">Executive Dashboard</h1>
              <p className="text-sm text-muted-foreground">Real-time Order Management and SLA Monitoring</p>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <RealTimeStatus
                connectionStatus={connectionStatus}
                lastUpdateTime={lastUpdateTime}
                optimisticUpdatesCount={0}
                onReconnect={startRealTimeUpdates}
              />
              <ConnectionStatus className="text-xs" />
              <Button 
                variant="outline" 
                className="min-h-[44px] w-full sm:w-auto" 
                onClick={handleManualRefresh}
                disabled={isManualRefreshing || isLoading}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isManualRefreshing ? 'animate-spin' : ''}`} />
                {isManualRefreshing ? 'Refreshing...' : 'Refresh Data'}
              </Button>
            </div>
          </div>
          
          {/* No Data State */}
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Package className="w-16 h-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No Order Data Available</h3>
            <p className="text-gray-500 mb-6 max-w-md">
              No orders found for the current date range ({currentDateRange?.dateFrom} to {currentDateRange?.dateTo}). 
              This could be due to no orders during this period or external API connectivity issues.
            </p>
            <Button onClick={handleManualRefresh} disabled={isManualRefreshing}>
              <RefreshCw className={`w-4 h-4 mr-2 ${isManualRefreshing ? 'animate-spin' : ''}`} />
              Try Refreshing
            </Button>
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <div className="space-y-8 relative p-6 bg-gray-50/50 min-h-screen">
      <div ref={containerRef}>
        {pullToRefreshIndicator}
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">Executive Dashboard</h1>
            <p className="text-sm text-muted-foreground">Real-time Order Management and SLA Monitoring</p>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <RealTimeStatus
              connectionStatus={connectionStatus}
              lastUpdateTime={lastUpdateTime}
              optimisticUpdatesCount={0}
              onReconnect={startRealTimeUpdates}
            />
            <ConnectionStatus className="text-xs" />
            <Button 
              variant="outline" 
              className="min-h-[44px] w-full sm:w-auto" 
              onClick={handleManualRefresh}
              disabled={isManualRefreshing || isLoading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isManualRefreshing ? 'animate-spin' : ''}`} />
              {isManualRefreshing ? 'Refreshing...' : 'Refresh Data'}
            </Button>
          </div>
        </div>
        
        {/* Critical Alerts Banner */}
        <CriticalAlertsBanner
          slaBreaches={alerts.orderAlerts.map(alert => ({
            id: alert.id,
            order_number: alert.order_number,
            customer_name: alert.customer_name || 'Customer',
            channel: alert.channel,
            location: alert.location || 'Location TBD',
            target_minutes: alert.target_minutes || 300,
            elapsed_minutes: alert.elapsed_minutes || 0,
            type: 'breach' as const
          }))}
          approachingAlerts={alerts.approachingSla.map(alert => ({
            id: alert.id,
            order_number: alert.order_number || alert.id,
            customer_name: alert.customer_name || 'Customer',
            channel: alert.channel,
            location: alert.location || 'Location TBD',
            target_minutes: alert.target_minutes || 300,
            elapsed_minutes: alert.elapsed_minutes || 0,
            type: 'approaching' as const
          }))}
          onEscalate={handleEscalation}
          isEscalating={isEscalating}
        />
        
        {/* KPI Cards */}
        <KpiCards
          kpiData={kpiData}
          kpiLoading={kpiLoading}
        />
        
        {/* Tabs */}
        <div className="mt-12">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="relative" ref={swipeContainerRef}>
              {swipeIndicator}
              <TabsList className="grid w-full grid-cols-4" {...swipeProps}>
                <TabsTrigger value="overview" onMouseEnter={() => handleTabHover("overview")}>Overview</TabsTrigger>
                <TabsTrigger value="orders" onMouseEnter={() => handleTabHover("orders")}>Orders</TabsTrigger>
                <TabsTrigger value="fulfillment" onMouseEnter={() => handleTabHover("fulfillment")}>Fulfillment</TabsTrigger>
                <TabsTrigger value="analytics" onMouseEnter={() => handleTabHover("analytics")}>Analytics</TabsTrigger>
              </TabsList>
            </div>
            
            {/* Tab Content with Lazy Loading */}
            {activeTab === "overview" && (
              <Suspense fallback={<OverviewTabSkeleton />}>
                <OverviewTab
                  enhancedChannelData={chartData.enhancedChannelData}
                  orderAlerts={alerts.orderAlerts}
                  approachingSla={alerts.approachingSla}
                  isLoadingChannelData={chartsLoading.enhancedChannelData}
                  isLoadingAlerts={chartsLoading.alerts}
                  onEscalate={handleEscalation}
                  isEscalating={isEscalating}
                />
              </Suspense>
            )}
            
            {activeTab === "orders" && (
              <Suspense fallback={<OrdersTabSkeleton />}>
                <OrdersTab
                  hourlyOrderSummary={chartData.hourlyOrderSummary}
                  dailyOrders={chartData.dailyOrders}
                  recentOrders={recentOrders}
                  isLoadingHourly={chartsLoading.hourlyOrderSummary}
                  isLoadingDaily={chartsLoading.dailyOrders}
                  isLoadingRecent={chartsLoading.recentOrders}
                  isMounted={isMounted}
                  apiStatus={apiStatus}
                  currentDateRange={currentDateRange}
                  lastApiError={lastApiError}
                  isManualRefreshing={isManualRefreshing}
                  onOrderClick={handleOrderClick}
                  onManualRefresh={handleManualRefresh}
                />
              </Suspense>
            )}
            
            {activeTab === "fulfillment" && (
              <Suspense fallback={<FulfillmentTabSkeleton />}>
                <FulfillmentTab
                  fulfillmentByBranch={chartData.fulfillmentByBranch}
                  channelPerformance={chartData.channelPerformance}
                  isLoadingFulfillment={chartsLoading.fulfillmentByBranch}
                  isLoadingChannel={chartsLoading.channelPerformance}
                />
              </Suspense>
            )}
            
            {activeTab === "analytics" && (
              <Suspense fallback={<AnalyticsTabSkeleton />}>
                <AnalyticsTab
                  topProducts={chartData.topProducts}
                  revenueByCategory={chartData.revenueByCategory}
                  isLoadingProducts={chartsLoading.topProducts}
                  isLoadingCategory={chartsLoading.revenueByCategory}
                />
              </Suspense>
            )}
          </Tabs>
        </div>
      </div>
      
      {/* Order Detail Modal */}
      {showOrderDetail && selectedOrder && (
        <OrderDetailView
          order={{
            ...selectedOrder,
            total: selectedOrder.total_amount || 0
          }}
          onClose={handleCloseOrderDetail}
          open={showOrderDetail}
        />
      )}
    </div>
  )
}
