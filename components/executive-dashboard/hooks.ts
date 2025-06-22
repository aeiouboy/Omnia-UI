import { useState, useEffect, useCallback, useRef, useReducer } from 'react'
import { useToast } from '@/components/ui/use-toast'
import { 
  ApiOrder, 
  DashboardState, 
  DashboardAction, 
  DashboardPhase,
  RequestType,
  KpiData,
  ChartDataState,
  AlertsState,
  OrderAlert
} from './types'
import { 
  fetchOrdersWithCache, 
  createRequestQueueManager, 
  getDefaultDateRange,
  processOrderAlerts,
  clearChannelDataCache,
  LoadingProgress
} from './data-fetching'
import { 
  calculateFulfillmentRate,
  calculateChannelVolume,
  calculateEnhancedChannelData,
  calculateDailyOrders,
  calculateFulfillmentByBranch,
  calculateChannelPerformance,
  calculateTopProducts,
  calculateRevenueByCategory,
  calculateHourlyOrderSummary,
  calculateProcessingTimes,
  calculateSlaCompliance
} from './utils'
import { filterSLABreach } from '@/lib/sla-utils'
import { getGMT7Time } from '@/lib/utils'

// Dashboard state reducer
const dashboardReducer = (state: DashboardState, action: DashboardAction): DashboardState => {
  switch (action.type) {
    case 'START_INITIAL_LOAD':
      if (state.requestsInFlight.has('initial')) return state
      return {
        ...state,
        phase: 'LOADING',
        error: null,
        requestsInFlight: new Set(state.requestsInFlight).add('initial')
      }
      
    case 'COMPLETE_INITIAL_LOAD':
      const newRequestsAfterInitial = new Set(state.requestsInFlight)
      newRequestsAfterInitial.delete('initial')
      return {
        ...state,
        phase: 'READY',
        lastLoadTime: Date.now(),
        retryCount: 0,
        requestsInFlight: newRequestsAfterInitial
      }
      
    case 'START_REALTIME_UPDATE':
      if (state.phase !== 'READY' || state.requestsInFlight.has('realtime')) return state
      return {
        ...state,
        phase: 'LOADING_REALTIME',
        requestsInFlight: new Set(state.requestsInFlight).add('realtime')
      }
      
    case 'COMPLETE_REALTIME_UPDATE':
      const newRequestsAfterRealtime = new Set(state.requestsInFlight)
      newRequestsAfterRealtime.delete('realtime')
      return {
        ...state,
        phase: 'READY',
        lastLoadTime: Date.now(),
        requestsInFlight: newRequestsAfterRealtime
      }
      
    case 'SET_ERROR':
      return {
        ...state,
        phase: 'ERROR',
        error: action.payload,
        requestsInFlight: new Set<RequestType>()
      }
      
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
        retryCount: 0
      }
      
    case 'INCREMENT_RETRY':
      return {
        ...state,
        retryCount: state.retryCount + 1
      }
      
    default:
      return state
  }
}

// Main dashboard data hook
export function useDashboardData() {
  const { toast } = useToast()
  
  // State management with reducer
  const [dashboardState, dispatch] = useReducer(dashboardReducer, {
    phase: 'INITIALIZING' as DashboardPhase,
    lastLoadTime: null,
    error: null,
    retryCount: 0,
    requestsInFlight: new Set<RequestType>(),
    dataVersion: 0
  })
  
  // Request queue and cache
  const queueManagerRef = useRef(createRequestQueueManager())
  const dataCacheRef = useRef<{[key: string]: {data: ApiOrder[], timestamp: number}}>({})
  
  // KPI states with safe defaults
  const [kpiData, setKpiData] = useState<KpiData>({
    ordersProcessing: 0,
    slaBreaches: 0,
    revenueToday: 0,
    fulfillmentRate: 0
  })
  
  // Chart data states
  const [chartData, setChartData] = useState<ChartDataState>({
    channelVolume: [],
    enhancedChannelData: { overview: [], drillDown: [] },
    dailyOrders: [],
    fulfillmentByBranch: [],
    channelPerformance: [],
    topProducts: [],
    revenueByCategory: [],
    hourlyOrderSummary: [],
    processingTimes: [],
    slaCompliance: []
  })
  
  // Alert states
  const [alerts, setAlerts] = useState<AlertsState>({
    orderAlerts: [],
    approachingSla: [],
    criticalAlerts: []
  })
  
  // Order data states
  const [ordersData, setOrdersData] = useState<ApiOrder[]>([])
  const [recentOrders, setRecentOrders] = useState<ApiOrder[]>([])
  
  // Loading states
  const [isLoading, setIsLoading] = useState(true)
  const [apiStatus, setApiStatus] = useState<'loading' | 'success' | 'error' | 'empty'>('loading')
  const [lastApiError, setLastApiError] = useState<string | null>(null)
  
  // Date range state
  // Fixed 7-day date range - no filtering allowed
  
  const [currentDateRange, setCurrentDateRange] = useState<{ dateFrom: string; dateTo: string } | null>(null)
  
  // Process dashboard data with validation
  const processDashboardData = useCallback(async (orders: ApiOrder[] = []) => {
    try {
      // Validate input
      if (!Array.isArray(orders)) {
        console.error('❌ Invalid orders data: expected array')
        throw new Error('Invalid orders data: expected array')
      }
      
      console.log(`🔧 Processing ${orders.length} orders...`)
      
      // Calculate KPIs
      const ordersProcessing = orders.filter(order => order.status === 'SUBMITTED').length
      const slaBreaches = filterSLABreach(orders).length
      const revenueToday = orders.reduce((sum, order) => sum + (order.total_amount || 0), 0)
      const fulfillmentRate = calculateFulfillmentRate(orders)
      
      setKpiData({
        ordersProcessing,
        slaBreaches,
        revenueToday,
        fulfillmentRate
      })
      
      // Process alerts
      const alertData = processOrderAlerts(orders)
      setAlerts(alertData)
      
      // Process chart data
      console.log('📊 Processing chart data for dashboard...')
      const channelVolume = calculateChannelVolume(orders)
      console.log('✅ Channel volume:', channelVolume.length, 'channels')
      
      const enhancedChannelData = calculateEnhancedChannelData(orders)
      console.log('✅ Enhanced channel data:', enhancedChannelData.length, 'data points')
      
      const dailyOrders = calculateDailyOrders(orders)
      console.log('✅ Daily orders:', dailyOrders.length, 'days')
      
      const fulfillmentByBranch = calculateFulfillmentByBranch(orders)
      console.log('✅ Fulfillment by branch:', fulfillmentByBranch.length, 'branches')
      
      const channelPerformance = calculateChannelPerformance(orders)
      console.log('✅ Channel performance:', channelPerformance.length, 'channels')
      
      const topProducts = calculateTopProducts(orders)
      console.log('✅ Top products:', topProducts.length, 'products')
      
      const revenueByCategory = calculateRevenueByCategory(orders)
      console.log('✅ Revenue by category:', revenueByCategory.length, 'categories')
      
      const hourlyOrderSummary = calculateHourlyOrderSummary(orders)
      console.log('✅ Hourly order summary:', hourlyOrderSummary.length, 'hours')
      
      const processingTimes = calculateProcessingTimes(orders)
      const slaCompliance = calculateSlaCompliance(orders)
      
      setChartData({
        channelVolume,
        enhancedChannelData: { overview: enhancedChannelData, drillDown: [] },
        dailyOrders,
        fulfillmentByBranch,
        channelPerformance,
        topProducts,
        revenueByCategory,
        hourlyOrderSummary,
        processingTimes,
        slaCompliance
      })
      
      // Set order data
      setOrdersData(orders)
      setRecentOrders(orders.slice(0, 20))
      
      console.log('✅ Dashboard data processed successfully')
    } catch (error) {
      console.error('❌ Error processing dashboard data:', error)
      throw error
    }
  }, [])
  
  // Force refresh with cache clear
  const forceRefreshData = useCallback(async () => {
    console.log('🔄 Force refresh: Clearing cache and reloading data')
    clearChannelDataCache(dataCacheRef.current)
    await loadDashboardData(false)
  }, [])

  // Load dashboard data
  const loadDashboardData = useCallback(async (isRealTimeUpdate = false) => {
    console.log('🔄 loadDashboardData called - isRealTimeUpdate:', isRealTimeUpdate)
    const requestType = isRealTimeUpdate ? 'realtime' : 'initial'
    const actionType = isRealTimeUpdate ? 'START_REALTIME_UPDATE' : 'START_INITIAL_LOAD'
    
    // State machine guard
    if (requestType === 'initial' && dashboardState.requestsInFlight.has('initial')) {
      console.log(`🔒 Initial load already in progress`)
      return
    }
    
    if (requestType === 'realtime' && 
        (dashboardState.phase !== 'READY' || dashboardState.requestsInFlight.has('realtime'))) {
      console.log(`🔒 Real-time update blocked`)
      return
    }
    
    dispatch({ type: actionType })
    
    if (!isRealTimeUpdate) {
      setIsLoading(true)
      setApiStatus('loading')
      setLastApiError(null)
    }
    
    try {
      const { dateFrom, dateTo } = currentDateRange || getDefaultDateRange()
      
      if (!currentDateRange) {
        setCurrentDateRange({ dateFrom, dateTo })
      }
      
      const result = await fetchOrdersWithCache(
        dateFrom,
        dateTo,
        dataCacheRef.current,
        queueManagerRef.current
      )
      
      const { orders, completeness } = result
      
      console.log(`📊 Retrieved ${orders.length} orders with ${completeness.coverage}% coverage`)
      console.log(`📅 Completeness: ${completeness.completeDays}/7 days, Missing: ${completeness.missingDays.join(', ') || 'None'}`)
      
      // CRITICAL: Only show data when we have complete 7-day coverage OR reasonable fallback
      if (orders.length > 0 && completeness.isComplete) {
        console.log('✅ Complete 7-day dataset available - Processing dashboard data')
        console.log('📋 Sample order:', orders[0])
        await processDashboardData(orders)
        setApiStatus('success')
      } else if (orders.length > 0 && completeness.coverage >= 50) {
        console.warn(`⚠️ Partial coverage dataset: ${completeness.coverage}% coverage - Proceeding with available data`)
        console.log('📋 Sample order:', orders[0])
        await processDashboardData(orders)
        setApiStatus('success')
      } else if (orders.length > 0 && orders.length >= 10) {
        console.warn(`⚠️ Small dataset: ${orders.length} orders with ${completeness.coverage}% coverage - Proceeding to prevent infinite loading`)
        console.log('📋 Sample order:', orders[0])
        await processDashboardData(orders)
        setApiStatus('success')
      } else if (orders.length > 0) {
        console.warn(`⚠️ Very small dataset: ${orders.length} orders - Still waiting for more data`)
        // Show loading state for very small datasets
        setApiStatus('loading')
        return
      } else {
        console.warn('⚠️ No orders found for date range:', dateFrom, 'to', dateTo)
        setApiStatus('empty')
        // Still process to show empty charts
        await processDashboardData([])
      }
      
      dispatch({ type: isRealTimeUpdate ? 'COMPLETE_REALTIME_UPDATE' : 'COMPLETE_INITIAL_LOAD' })
      
    } catch (error) {
      console.error(`❌ Error in ${requestType} load:`, error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to load data'
      setApiStatus('error')
      setLastApiError(errorMessage)
      dispatch({ type: 'SET_ERROR', payload: errorMessage })
      throw error // Re-throw to handle in component
    } finally {
      setIsLoading(false)
      console.log('🏁 loadDashboardData completed')
    }
  }, [currentDateRange, dashboardState, processDashboardData])
  
  // Date range is fixed to 7 days - no filtering allowed in executive dashboard
  
  return {
    // State
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
    
    // Actions
    loadDashboardData,
    forceRefreshData,
    dispatch
  }
}

// Real-time updates hook
export function useRealTimeUpdates(
  loadDashboardData: (isRealTimeUpdate: boolean) => Promise<void>,
  dashboardState: DashboardState
) {
  const [isConnected, setIsConnected] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'disconnected' | 'error'>('disconnected')
  const [lastUpdateTime, setLastUpdateTime] = useState<Date | null>(null)
  const realTimeIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)
  const failedUpdateCount = useRef(0)
  
  // Debounced real-time update
  const debouncedRealTimeUpdate = useCallback(() => {
    if (dashboardState.phase !== 'READY') {
      console.log(`🔒 Real-time update skipped - dashboard not ready`)
      return
    }
    
    if (failedUpdateCount.current > 3) {
      console.log('🚫 Circuit breaker: Too many failed updates')
      return
    }
    
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }
    
    const timeSinceLastUpdate = dashboardState.lastLoadTime ? 
      Date.now() - dashboardState.lastLoadTime : Infinity
    const minInterval = 30000 // 30 seconds
    
    if (timeSinceLastUpdate < minInterval) {
      console.log(`🔒 Real-time update skipped - too frequent`)
      return
    }
    
    console.log('✅ Triggering real-time update')
    loadDashboardData(true)
      .then(() => {
        failedUpdateCount.current = 0
        setLastUpdateTime(new Date())
      })
      .catch((error) => {
        failedUpdateCount.current++
        console.warn(`⚠️ Real-time update failed:`, error)
      })
  }, [dashboardState, loadDashboardData])
  
  // Start real-time updates
  const startRealTimeUpdates = useCallback(() => {
    console.log('🔄 Starting real-time updates...')
    setConnectionStatus('connecting')
    
    setTimeout(() => {
      setIsConnected(true)
      setConnectionStatus('connected')
      setLastUpdateTime(new Date())
      console.log('✅ Real-time updates connected')
    }, 2000)
    
    setTimeout(() => {
      if (realTimeIntervalRef.current) {
        clearInterval(realTimeIntervalRef.current)
      }
      
      realTimeIntervalRef.current = setInterval(() => {
        console.log('🔄 Real-time update interval triggered')
        debouncedRealTimeUpdate()
      }, 60000) // 60 seconds
    }, 10000) // Wait 10 seconds before starting
  }, [debouncedRealTimeUpdate])
  
  // Stop real-time updates
  const stopRealTimeUpdates = useCallback(() => {
    console.log('🔌 Stopping real-time updates...')
    if (realTimeIntervalRef.current) {
      clearInterval(realTimeIntervalRef.current)
      realTimeIntervalRef.current = null
    }
    setIsConnected(false)
    setConnectionStatus('disconnected')
  }, [])
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (realTimeIntervalRef.current) {
        clearInterval(realTimeIntervalRef.current)
      }
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [])
  
  return {
    isConnected,
    connectionStatus,
    lastUpdateTime,
    startRealTimeUpdates,
    stopRealTimeUpdates
  }
}