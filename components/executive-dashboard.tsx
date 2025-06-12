"use client"

import { useState, useEffect } from "react"
import { TeamsWebhookService } from "@/lib/teams-webhook"
import { useToast } from "@/components/ui/use-toast"
import { usePullToRefresh } from "@/hooks/use-pull-to-refresh"
import { getGMT7Time, formatGMT7DateString, safeParseDate } from "@/lib/utils"
import { 
  calculateSLAStatus, 
  filterSLABreach, 
  filterApproachingSLA, 
  calculateSLAComplianceRate,
  formatOverTime,
  formatRemainingTime 
} from "@/lib/sla-utils"
import { 
  createEscalationRecord, 
  updateEscalationStatus,
  getAlertMessage,
  getSeverityFromAlertType,
  createTeamsMessagePayload,
} from "@/lib/escalation-service"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChannelBadge, OrderStatusBadge } from "./order-badges"
import { useSwipeTabs } from "@/hooks/use-swipe-tabs"
import { KpiCard } from "./kpi-card"
import { CriticalAlertsBanner } from "./critical-alerts-banner"
import { ChartCard } from "./chart-card"
import { InteractiveChart } from "./interactive-chart"
import { useRealTimeUpdates } from "@/hooks/use-real-time-updates"
import { RealTimeStatus, UpdatesSummary } from "./real-time-status"
import { PerformanceAnalytics } from "./performance-analytics"
import { AccessibilityWrapper, AccessibleCard } from "./accessibility-wrapper"
import { announceToScreenReader } from "@/hooks/use-keyboard-navigation"
import {
  AlertTriangle,
  BarChart2,
  Clock,
  DollarSign,
  Package,
  ShoppingCart,
  TrendingDown,
  TrendingUp,
  AlertCircle,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
} from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { SwipeableListItem } from "@/components/ui/swipeable-list-item"
import {
  LineChart,
  Line,
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
} from "recharts"

// API response types matching OrderManagementHub
interface ApiCustomer {
  id: string
  name: string
  email: string
  phone: string
  T1Number: string
}

interface ApiShippingAddress {
  street: string
  city: string
  state: string
  postal_code: string
  country: string
}

interface ApiPaymentInfo {
  method: string
  status: string
  transaction_id: string
}

interface ApiSLAInfo {
  target_minutes: number
  elapsed_minutes: number
  status: string
}

interface ApiMetadata {
  created_at: string
  updated_at: string
  priority: string
  store_name: string
}

interface ApiProductDetails {
  description: string
  category: string
  brand: string
}

interface ApiOrderItem {
  id: string
  product_id: string
  product_name: string
  product_sku: string
  quantity: number
  unit_price: number
  total_price: number
  product_details: ApiProductDetails
}

interface ApiOrder {
  id: string
  order_no: string
  customer: ApiCustomer
  order_date: string
  channel: string
  business_unit: string
  order_type: string
  total_amount: number
  shipping_address: ApiShippingAddress
  payment_info: ApiPaymentInfo
  sla_info: ApiSLAInfo
  metadata: ApiMetadata
  items: ApiOrderItem[]
  status: string
}

interface ApiPagination {
  page: number
  pageSize: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

interface ApiResponse {
  data: ApiOrder[]
  pagination: ApiPagination
}

// Cache for API data
let ordersCache: { data: ApiOrder[]; timestamp: number } | null = null
const CACHE_DURATION = 120000 // 2 minutes for better performance

// Optimized API client function with caching - Yesterday + Today only
const fetchOrdersFromApi = async (): Promise<ApiOrder[]> => {
  try {
    // Check cache first
    const now = Date.now()
    if (ordersCache && now - ordersCache.timestamp < CACHE_DURATION) {
      return ordersCache.data
    }

    // Calculate date range for yesterday + today - using GMT+7 timezone
    const endDate = getGMT7Time()
    endDate.setHours(23, 59, 59, 999) // End of today in GMT+7
    const startDate = getGMT7Time()
    startDate.setDate(endDate.getDate() - 1)
    startDate.setHours(0, 0, 0, 0) // Start of yesterday in GMT+7

    const dateFrom = startDate.toISOString().split("T")[0]
    const dateTo = endDate.toISOString().split("T")[0]

    // Optimized pagination for 2-day scope
    const allOrders: ApiOrder[] = []
    let currentPage = 1
    let hasNext = true
    const maxPages = 2 // Reduced for 2-day scope
    const pageSize = 2000 // Optimized for 2-day dataset

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000) // 30s timeout

    try {
      while (hasNext && currentPage <= maxPages) {
        const queryParams = new URLSearchParams({
          page: currentPage.toString(),
          pageSize: pageSize.toString(),
          dateFrom,
          dateTo,
        })

        const response = await fetch(`/api/orders/external?${queryParams.toString()}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
        })

        if (response.ok) {
          const data = await response.json()
          if (data.success && data.data) {
            const orders = data.data.data || []
            
            // Filter for yesterday + today only
            const filteredOrders = orders.filter((order: ApiOrder) => {
              try {
                const orderDate = safeParseDate(order.order_date || order.metadata?.created_at)
                const orderGMT7 = getGMT7Time(orderDate)
                return orderGMT7 >= startDate && orderGMT7 <= endDate
              } catch (error) {
                return false
              }
            })

            allOrders.push(...filteredOrders)
            hasNext = data.data.pagination?.hasNext || false
            currentPage++
          } else {
            break
          }
        } else {
          break
        }
      }

      clearTimeout(timeoutId)
      
      // Cache the result
      ordersCache = { data: allOrders, timestamp: now }
      return allOrders
    } catch (fetchError) {
      clearTimeout(timeoutId)
      if (fetchError.name === "AbortError") {
        return []
      }
      return []
    }
  } catch (error) {
    return []
  }
}

export function ExecutiveDashboard() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isMounted, setIsMounted] = useState(false)
  
  // Individual loading states for progressive loading UX
  const [kpiLoading, setKpiLoading] = useState({
    ordersProcessing: true,
    slaBreaches: true,
    revenueToday: true,
    avgProcessingTime: true,
    activeOrders: true,
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
    processingTimes: true,
    slaCompliance: true,
    recentOrders: true,
    approachingSla: true,
  })
  
  // All dashboard data states
  const [ordersProcessing, setOrdersProcessing] = useState(0)
  const [slaBreaches, setSlaBreaches] = useState(0)
  const [revenueToday, setRevenueToday] = useState(0)
  const [avgProcessingTime, setAvgProcessingTime] = useState(0)
  const [activeOrders, setActiveOrders] = useState(0)
  const [fulfillmentRate, setFulfillmentRate] = useState(0)
  const [channelVolume, setChannelVolume] = useState<any[]>([])
  const [enhancedChannelData, setEnhancedChannelData] = useState<{overview: any[], drillDown: any[]}>({overview: [], drillDown: []})
  const [orderAlerts, setOrderAlerts] = useState<any[]>([])
  const [approachingSla, setApproachingSla] = useState<any[]>([])
  const [processingTimes, setProcessingTimes] = useState<any[]>([])
  const [slaCompliance, setSlaCompliance] = useState<any[]>([])
  const [dailyOrders, setDailyOrders] = useState<any[]>([])
  const [fulfillmentByBranch, setFulfillmentByBranch] = useState<any[]>([])
  const [channelPerformance, setChannelPerformance] = useState<any[]>([])
  const [hourlyOrderSummary, setHourlyOrderSummary] = useState<any[]>([])
  const [topProducts, setTopProducts] = useState<any[]>([])
  const [revenueByCategory, setRevenueByCategory] = useState<any[]>([])
  const [recentOrders, setRecentOrders] = useState<any[]>([])
  const [ordersData, setOrdersData] = useState<any[]>([])
  const [isEscalating, setIsEscalating] = useState(false)

  // Real-time updates hook
  const {
    isConnected,
    connectionStatus,
    lastUpdateTime,
    updates,
    optimisticUpdates,
    connect,
    disconnect,
    performAction,
    getUnconfirmedUpdates
  } = useRealTimeUpdates({
    pollInterval: 10000, // 10 seconds for dashboard
    onUpdate: (update) => {
      console.log("Real-time update received:", update)
      // Handle specific update types with optimized refresh
      if (update.type === 'order_status_change' || update.type === 'new_order' || update.type === 'sla_breach') {
        // Refresh only critical dashboard data for real-time updates
        loadData(true) // Pass true to indicate this is a real-time update
      }
    },
    onError: (error) => {
      console.error("Real-time updates error:", error)
    }
  })

  const loadData = async (isRealTimeUpdate = false) => {
    // For real-time updates, don't show full loading states
    if (!isRealTimeUpdate) {
      setIsLoading(true)
      setError(null)
      
      // Reset all loading states to true only for manual refreshes
      setKpiLoading({
        ordersProcessing: true,
        slaBreaches: true,
        revenueToday: true,
        avgProcessingTime: true,
        activeOrders: true,
        fulfillmentRate: true,
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
        approachingSla: true,
      })
    } else {
      // For real-time updates, only refresh critical data
      console.log("🔄 Real-time update: refreshing critical data only")
      // Only set loading for critical real-time sections
      setKpiLoading(prev => ({
        ...prev,
        ordersProcessing: true,
        slaBreaches: true,
      }))
      setChartsLoading(prev => ({
        ...prev,
        alerts: true,
        approachingSla: true,
      }))
    }

    try {
      // For real-time updates, only fetch critical data to improve performance
      if (isRealTimeUpdate) {
        // Only fetch critical real-time data
        const [ordersProcessingData, slaBreachesData, orderAlertsData, approachingSlaData] = await Promise.all([
          fetchOrdersProcessing().catch((err) => {
            console.error("Error fetching orders processing:", err)
            return { count: 0, change: 0, orders: [] }
          }),
          fetchSlaBreaches().catch((err) => {
            console.error("Error fetching SLA breaches:", err)
            return { count: 0, change: 0, breaches: [] }
          }),
          fetchOrderAlerts().catch((err) => {
            console.error("Error fetching order alerts:", err)
            return []
          }),
          fetchApproachingSla().catch((err) => {
            console.error("Error fetching approaching SLA:", err)
            return []
          }),
        ])

        // Update only critical KPIs
        setOrdersProcessing(ordersProcessingData.count)
        setSlaBreaches(slaBreachesData.count)
        setOrderAlerts(orderAlertsData)
        setApproachingSla(approachingSlaData)
        
        // Clear only critical loading states
        setKpiLoading(prev => ({
          ...prev,
          ordersProcessing: false,
          slaBreaches: false,
        }))
        setChartsLoading(prev => ({ 
          ...prev, 
          alerts: false,
          approachingSla: false,
        }))
        
        console.log("✅ Real-time critical data updated:", {
          ordersProcessing: ordersProcessingData.count,
          slaBreaches: slaBreachesData.count,
          alerts: orderAlertsData.length,
          approaching: approachingSlaData.length
        })
        
        return // Exit early for real-time updates
      }

      // Full data fetching for manual refreshes
      const [ordersProcessingData, slaBreachesData, channelVolumeData, enhancedChannelDataRes, orderAlertsData] = await Promise.all([
        fetchOrdersProcessing().catch((err) => {
          console.error("Error fetching orders processing:", err)
          return { count: 0, change: 0, orders: [] }
        }),
        fetchSlaBreaches().catch((err) => {
          console.error("Error fetching SLA breaches:", err)
          return { count: 0, change: 0, breaches: [] }
        }),
        fetchChannelVolume().catch((err) => {
          console.error("Error fetching channel volume:", err)
          return []
        }),
        fetchEnhancedChannelData().catch((err) => {
          console.error("Error fetching enhanced channel data:", err)
          return { overview: [], drillDown: [] }
        }),
        fetchOrderAlerts().catch((err) => {
          console.error("Error fetching order alerts:", err)
          return []
        }),
      ])

      // Update KPI data and mark KPI loading as complete
      setOrdersProcessing(ordersProcessingData.count)
      setSlaBreaches(slaBreachesData.count)
      setChannelVolume(channelVolumeData)
      setEnhancedChannelData(enhancedChannelDataRes)
      setOrderAlerts(orderAlertsData)
      
      // Clear KPI loading states
      setKpiLoading({
        ordersProcessing: false,
        slaBreaches: false,
        revenueToday: false,
        avgProcessingTime: false,
        activeOrders: false,
        fulfillmentRate: false,
      })
      
      // Update charts loading for alerts
      console.log("📊 Clearing loading states for: channelVolume, enhancedChannelData, alerts")
      setChartsLoading(prev => ({ ...prev, channelVolume: false, enhancedChannelData: false, alerts: false }))

      // Fetch additional data for charts and analytics
      const [approachingSlaData, processingTimesData, slaComplianceData, dailyOrdersData] = await Promise.all([
        fetchApproachingSla().catch((err) => {
          console.error("Error fetching approaching SLA:", err)
          return []
        }),
        fetchProcessingTimes().catch((err) => {
          console.error("Error fetching processing times:", err)
          return []
        }),
        fetchSlaCompliance().catch((err) => {
          console.error("Error fetching SLA compliance:", err)
          return []
        }),
        fetchDailyOrders().catch((err) => {
          console.error("Error fetching daily orders:", err)
          return []
        }),
      ])

      setApproachingSla(approachingSlaData)
      setProcessingTimes(processingTimesData)
      setSlaCompliance(slaComplianceData)
      setDailyOrders(dailyOrdersData)
      
      // Update charts loading states
      setChartsLoading(prev => ({
        ...prev,
        approachingSla: false,
        processingTimes: false,
        slaCompliance: false,
        dailyOrders: false,
      }))

      // Fetch orders data for performance analytics
      const allOrdersData = await fetchOrdersFromApi().catch((err) => {
        console.error("Error fetching orders for analytics:", err)
        return []
      })
      setOrdersData(allOrdersData)

      // Fetch remaining data
      const [fulfillmentData, channelPerfData, hourlyData, topProductsData, revenueCategoryData, recentOrdersData] = await Promise.all([
        fetchFulfillmentByBranch().catch((err) => {
          console.error("Error fetching fulfillment by branch:", err)
          return []
        }),
        fetchChannelPerformance().catch((err) => {
          console.error("Error fetching channel performance:", err)
          return []
        }),
        fetchHourlyOrderSummary().catch((err) => {
          console.error("Error fetching hourly order summary:", err)
          return []
        }),
        fetchTopProducts().catch((err) => {
          console.error("Error fetching top products:", err)
          return []
        }),
        fetchRevenueByCategory().catch((err) => {
          console.error("Error fetching revenue by category:", err)
          return []
        }),
        fetchRecentOrders().catch((err) => {
          console.error("Error fetching recent orders:", err)
          return []
        }),
      ])

      setFulfillmentByBranch(fulfillmentData)
      setChannelPerformance(channelPerfData)
      setHourlyOrderSummary(hourlyData)
      setTopProducts(topProductsData)
      setRevenueByCategory(revenueCategoryData)
      setRecentOrders(recentOrdersData)

      // Calculate additional KPI values from ALL fetched orders (not just processing)
      const allOrders = await fetchOrdersFromApi() // Get all orders for accurate KPI calculations
      const revenue = calculateRevenue(allOrders)
      const avgTime = calculateAvgProcessingTime(allOrders)
      const active = calculateActiveOrders(allOrders)
      const fulfillment = calculateFulfillmentRate(allOrders)

      setRevenueToday(revenue)
      setAvgProcessingTime(avgTime)
      setActiveOrders(active)
      setFulfillmentRate(fulfillment)
      
      // Check if we got data
      const totalDataItems = ordersProcessingData.count + slaBreachesData.count + channelVolumeData.length
      if (totalDataItems === 0) {
        console.warn("⚠️ No data retrieved from API")
        toast({
          title: "Limited Data Available",
          description: "No order data available. This may be due to API connectivity issues.",
          variant: "default",
        })
      } else {
        console.log("✅ Dashboard data loaded successfully", {
          ordersProcessing: ordersProcessingData.count,
          slaBreaches: slaBreachesData.count,
          channelVolume: channelVolumeData.length,
          alerts: orderAlertsData.length
        })
      }
      
    } catch (err) {
      console.error("Failed to load dashboard data:", err)
      setError("Failed to load dashboard data. Please try again later.")
      
      // Show user-friendly notification for data loading issues
      toast({
        title: "Data Loading Issue",
        description: "Some data may be incomplete due to connectivity issues. Dashboard will show available data.",
        variant: "default",
      })
    } finally {
      // Only clear loading states for non-real-time updates
      if (!isRealTimeUpdate) {
        setIsLoading(false)
        setKpiLoading({
          ordersProcessing: false,
          slaBreaches: false,
          revenueToday: false,
          avgProcessingTime: false,
          activeOrders: false,
          fulfillmentRate: false,
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
          approachingSla: false,
        })
      }
    }
  }

  const {
    containerRef,
    isRefreshing: isPullRefreshing,
    pullToRefreshIndicator,
  } = usePullToRefresh({
    onRefresh: loadData,
    threshold: 80,
  })


  useEffect(() => {
    setIsMounted(true)
    loadData()
  }, [])

  // Tab state management  
  const [activeTab, setActiveTab] = useState("overview")
  
  // Tab swipe support
  const {
    containerRef: swipeContainerRef,
    swipeProps,
    swipeIndicator,
  } = useSwipeTabs({
    tabs: ["overview", "orders", "fulfillment", "analytics"],
    activeTab,
    onTabChange: setActiveTab,
  })

  const handleEscalation = async () => {
    if (isEscalating) return

    const alertOrder = orderAlerts[0] || approachingSla[0]
    if (!alertOrder) {
      toast({
        title: "No alerts to escalate",
        description: "There are no SLA alerts to escalate at this time.",
        variant: "default",
      })
      return
    }

    const escalationId = `escalation-${Date.now()}`
    const isBreach = orderAlerts.length > 0
    const orderNumber = alertOrder.order_number || alertOrder.id
    const alertType = isBreach ? "SLA_BREACH" : "SLA_WARNING"

    // Use optimistic update for escalation
    await performAction(
      // The actual escalation function
      async () => {
        setIsEscalating(true)

        try {
          const location = alertOrder.location || "Unknown Location"
          const channel = alertOrder.channel || "UNKNOWN"

          // Create escalation record in database first
          let createdEscalation: any = null
          let dbStorageWorking = true

          try {
            const escalationData = {
              alert_id: orderNumber,
              alert_type: alertType,
              message: getAlertMessage(alertType, orderNumber),
              severity: getSeverityFromAlertType(alertType),
              status: "PENDING" as const,
              escalated_by: "Executive Dashboard",
              escalated_to: location,
            }

            createdEscalation = await createEscalationRecord(escalationData)
          } catch (dbError) {
            console.warn("Database storage failed, but continuing with Teams notification:", dbError)
            dbStorageWorking = false
          }

          // Create timestamp for Teams message
          const timestamp = new Date().toLocaleString("th-TH", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          })

          // Create Teams message payload
          const teamsMessage = createTeamsMessagePayload(orderNumber, alertType, location, timestamp)

          // Send to MS Teams
          const response = await fetch("/api/teams-webhook", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(teamsMessage),
          })

          const result = await response.json()

          if (!response.ok) {
            if (dbStorageWorking && createdEscalation) {
              try {
                await updateEscalationStatus(createdEscalation.id, { status: "FAILED" })
              } catch (updateError) {
                console.warn("Failed to update escalation status:", updateError)
              }
            }
            throw new Error(result.message || `Failed to send to MS Teams: ${response.statusText}`)
          }

          if (dbStorageWorking && createdEscalation) {
            try {
              await updateEscalationStatus(createdEscalation.id, { status: "SENT" })
            } catch (updateError) {
              console.warn("Failed to update escalation status:", updateError)
            }
          }

          return {
            escalationId,
            orderNumber,
            alertType,
            status: "SENT"
          }
        } finally {
          setIsEscalating(false)
        }
      },
      // Optimistic data - show escalation as processing immediately
      {
        escalationId,
        orderNumber,
        alertType,
        status: "PROCESSING",
        timestamp: new Date()
      },
      escalationId,
      "escalation_sent",
      // Rollback function
      () => {
        setIsEscalating(false)
      }
    )
  }

  const handleTestEscalation = async () => {
    if (isEscalating) return

    setIsEscalating(true)

    try {
      await TeamsWebhookService.sendEscalation({
        orderNumber: "TEST-ORDER-001",
        alertType: "SLA_BREACH",
        branch: "Test Branch",
        severity: "HIGH",
        description: "This is a test escalation from the Executive Dashboard to verify webhook functionality.",
        additionalInfo: {
          customerName: "Test Customer",
          channel: "GRAB",
          targetMinutes: "5 minutes",
          elapsedMinutes: "8 minutes",
          currentDelay: "3 minutes over target",
          status: "PROCESSING",
          processingTime: "8 minutes",
          location: "Test Location",
          testMode: "true",
        },
      })

      toast({
        title: "Test escalation sent successfully",
        description: "Test webhook message has been sent to MS Teams.",
        variant: "default",
      })
    } catch (error) {
      console.error("Test escalation failed:", error)
      toast({
        title: "Test escalation failed",
        description: error instanceof Error ? error.message : "Failed to send test escalation to MS Teams.",
        variant: "destructive",
      })
    } finally {
      setIsEscalating(false)
    }
  }

  const fetchOrdersProcessing = async () => {
    try {
      const orders = await fetchOrdersFromApi()
      const processingOrders = orders.filter((order) => order.status === "PROCESSING")

      return {
        count: processingOrders.length,
        change: 0,
        orders: processingOrders,
      }
    } catch (err) {
      console.warn("Error fetching processing orders:", err)
      return {
        count: 0,
        change: 0,
        orders: [],
      }
    }
  }

  const fetchSlaBreaches = async () => {
    try {
      const orders = await fetchOrdersFromApi()
      const breachedOrders = filterSLABreach(orders)

      return {
        count: breachedOrders.length,
        change: 0,
        breaches: breachedOrders,
      }
    } catch (err) {
      console.warn("Error fetching SLA breaches:", err)
      return {
        count: 0,
        change: 0,
        breaches: [],
      }
    }
  }

  const fetchChannelVolume = async () => {
    try {
      const orders = await fetchOrdersFromApi()

      if (!orders || orders.length === 0) {
        return [
          { channel: "GRAB", orders: 0 },
          { channel: "LAZADA", orders: 0 },
          { channel: "SHOPEE", orders: 0 },
          { channel: "TIKTOK", orders: 0 },
        ]
      }

      const channelCounts = {
        GRAB: 0,
        LAZADA: 0,
        SHOPEE: 0,
        TIKTOK: 0,
      }

      const channelMapping = {
        GRAB: "GRAB",
        GRABMART: "GRAB",
        GRAB_MART: "GRAB",
        "GRAB-MART": "GRAB",
        LAZADA: "LAZADA",
        SHOPEE: "SHOPEE",
        TIKTOK: "TIKTOK",
        TIKTOK_SHOP: "TIKTOK",
        "TIKTOK-SHOP": "TIKTOK",
      }

      orders.forEach((order) => {
        const normalizedChannel = order.channel?.toUpperCase()?.trim()
        if (normalizedChannel) {
          const mappedChannel = channelMapping[normalizedChannel]
          if (mappedChannel && channelCounts.hasOwnProperty(mappedChannel)) {
            channelCounts[mappedChannel]++
          }
        }
      })

      return [
        { channel: "GRAB", orders: channelCounts.GRAB },
        { channel: "LAZADA", orders: channelCounts.LAZADA },
        { channel: "SHOPEE", orders: channelCounts.SHOPEE },
        { channel: "TIKTOK", orders: channelCounts.TIKTOK },
      ]
    } catch (err) {
      return [
        { channel: "GRAB", orders: 0 },
        { channel: "LAZADA", orders: 0 },
        { channel: "SHOPEE", orders: 0 },
        { channel: "TIKTOK", orders: 0 },
      ]
    }
  }

  const fetchEnhancedChannelData = async () => {
    try {
      const orders = await fetchOrdersFromApi()

      if (!orders || orders.length === 0) {
        return {
          overview: [],
          drillDown: []
        }
      }

      const channelMapping = {
        GRAB: "GRAB",
        GRABMART: "GRAB", 
        GRAB_MART: "GRAB",
        "GRAB-MART": "GRAB",
        LAZADA: "LAZADA",
        SHOPEE: "SHOPEE", 
        TIKTOK: "TIKTOK",
        TIKTOK_SHOP: "TIKTOK",
        "TIKTOK-SHOP": "TIKTOK",
      }

      // Channel overview data
      const channelCounts = { GRAB: 0, LAZADA: 0, SHOPEE: 0, TIKTOK: 0 }
      const channelRevenue = { GRAB: 0, LAZADA: 0, SHOPEE: 0, TIKTOK: 0 }
      const channelSLA = { GRAB: { total: 0, breaches: 0 }, LAZADA: { total: 0, breaches: 0 }, SHOPEE: { total: 0, breaches: 0 }, TIKTOK: { total: 0, breaches: 0 } }
      
      // Store detail data by status for drill-down
      const statusBreakdown = {}

      orders.forEach((order) => {
        const normalizedChannel = order.channel?.toUpperCase()?.trim()
        if (normalizedChannel) {
          const mappedChannel = channelMapping[normalizedChannel]
          if (mappedChannel && channelCounts.hasOwnProperty(mappedChannel)) {
            channelCounts[mappedChannel]++
            channelRevenue[mappedChannel] += order.total_amount || 0
            
            // SLA tracking
            channelSLA[mappedChannel].total++
            const slaStatus = calculateSLAStatus(order)
            if (slaStatus.isBreach) {
              channelSLA[mappedChannel].breaches++
            }

            // Status breakdown for drill-down
            const status = order.status || 'UNKNOWN'
            const key = `${mappedChannel}_${status}`
            if (!statusBreakdown[key]) {
              statusBreakdown[key] = {
                channel: mappedChannel,
                status: status,
                orders: 0,
                revenue: 0,
                drillDownId: `status_${mappedChannel}_${status}`
              }
            }
            statusBreakdown[key].orders++
            statusBreakdown[key].revenue += order.total_amount || 0
          }
        }
      })

      const overview = Object.entries(channelCounts).map(([channel, orders]) => ({
        name: channel,
        channel: channel,
        orders: orders,
        revenue: channelRevenue[channel],
        slaCompliance: channelSLA[channel].total > 0 ? 
          ((channelSLA[channel].total - channelSLA[channel].breaches) / channelSLA[channel].total * 100).toFixed(1) : 100,
        drillDownId: `channel_${channel}`
      }))

      return {
        overview,
        drillDown: Object.values(statusBreakdown)
      }
    } catch (err) {
      console.warn("Error in fetchEnhancedChannelData:", err)
      return {
        overview: [],
        drillDown: []
      }
    }
  }

  const fetchOrderAlerts = async () => {
    try {
      const orders = await fetchOrdersFromApi()
      
      if (!orders || orders.length === 0) {
        console.log("📊 No orders available for SLA breach detection")
        return []
      }

      const breachedOrders = filterSLABreach(orders)
      console.log(`🚨 Found ${breachedOrders.length} SLA breached orders out of ${orders.length} total orders`)
      
      // Debug: Show sample order data and SLA status
      if (orders.length > 0) {
        const sampleOrder = orders[0]
        const sampleSLA = calculateSLAStatus(sampleOrder)
        console.log('📊 Sample order SLA data:', {
          orderId: sampleOrder.id,
          status: sampleOrder.status,
          slaInfo: sampleOrder.sla_info,
          calculatedSLA: sampleSLA
        })
      }
      
      // Debug: Check order statuses
      const statusCounts = orders.reduce((acc, order) => {
        acc[order.status] = (acc[order.status] || 0) + 1
        return acc
      }, {})
      console.log('📊 Order status distribution:', statusCounts)

      if (!breachedOrders || breachedOrders.length === 0) {
        console.log("🔍 No SLA breaches found. Checking for orders that might be close...")
        
        // If no actual breaches, show orders that are at 50% or more of their SLA time for debugging
        const nearBreach = orders
          .filter(order => order.sla_info && order.status !== "DELIVERED" && order.status !== "FULFILLED")
          .map(order => ({ order, sla: calculateSLAStatus(order) }))
          .filter(({ sla }) => sla.elapsedSeconds >= (sla.targetSeconds * 0.5)) // 50% threshold for debugging
          .sort((a, b) => b.sla.elapsedSeconds - a.sla.elapsedSeconds) // Most elapsed first
          .slice(0, 3)
        
        if (nearBreach.length > 0) {
          console.log("🟡 Showing orders at 50%+ of SLA time for debugging:", nearBreach.map(({ sla }) => ({
            elapsed: sla.elapsedSeconds,
            target: sla.targetSeconds,
            percentage: ((sla.elapsedSeconds / sla.targetSeconds) * 100).toFixed(1)
          })))
          
          return nearBreach.map(({ order, sla }) => ({
            id: order.id,
            order_number: order.order_no || order.id,
            customer_name: order.customer?.name || `Customer ${order.customer?.id || 'Unknown'}`,
            channel: order.channel || "UNKNOWN",
            location: order.metadata?.store_name || order.shipping_address?.city || "Unknown Location",
            target_minutes: sla.targetSeconds,
            elapsed_minutes: sla.elapsedSeconds,
          }))
        }
        
        return []
      }

      // Return up to 5 most critical breaches (instead of just 1)
      return breachedOrders.slice(0, 5).map((order) => {
        const slaStatus = calculateSLAStatus(order)

        return {
          id: order.id,
          order_number: order.order_no || order.id, // Use actual order number
          customer_name: order.customer?.name || `Customer ${order.customer?.id || 'Unknown'}`,
          channel: order.channel || "UNKNOWN",
          location: order.metadata?.store_name || order.shipping_address?.city || "Unknown Location",
          target_minutes: slaStatus.targetSeconds,
          elapsed_minutes: slaStatus.elapsedSeconds,
        }
      })
    } catch (err) {
      console.warn("Error in fetchOrderAlerts:", err)
      return []
    }
  }

  const fetchApproachingSla = async () => {
    try {
      const orders = await fetchOrdersFromApi()
      
      if (!orders || orders.length === 0) {
        console.log("📊 No orders available for approaching SLA detection")
        return []
      }

      const approaching = filterApproachingSLA(orders)
      console.log(`⚠️ Found ${approaching.length} orders approaching SLA deadline out of ${orders.length} total orders`)
      
      // Debug: Check how many orders have SLA info
      const ordersWithSLA = orders.filter(order => order.sla_info)
      console.log(`📊 Orders with SLA info: ${ordersWithSLA.length}/${orders.length}`)
      
      // Debug: Show SLA timing distribution
      if (ordersWithSLA.length > 0) {
        const slaStats = ordersWithSLA.map(order => {
          const sla = calculateSLAStatus(order)
          return {
            target: sla.targetSeconds,
            elapsed: sla.elapsedSeconds,
            remaining: sla.remainingSeconds,
            isBreach: sla.isBreach,
            isApproaching: sla.isApproaching
          }
        })
        console.log('📊 SLA timing stats (first 5):', slaStats.slice(0, 5))
      }

      if (approaching.length === 0) {
        console.log("🔍 No orders approaching SLA deadline. Checking for orders at 30%+ of SLA time...")
        
        // If no approaching alerts, show orders that are at 30% or more of their SLA time for debugging
        const moderateProgress = orders
          .filter(order => order.sla_info && order.status !== "DELIVERED" && order.status !== "FULFILLED")
          .map(order => ({ order, sla: calculateSLAStatus(order) }))
          .filter(({ sla }) => sla.elapsedSeconds >= (sla.targetSeconds * 0.3) && !sla.isBreach) // 30% threshold, not breached
          .sort((a, b) => b.sla.elapsedSeconds - a.sla.elapsedSeconds) // Most elapsed first
          .slice(0, 4)
        
        if (moderateProgress.length > 0) {
          console.log("🟡 Showing orders at 30%+ of SLA time for debugging:", moderateProgress.map(({ sla }) => ({
            elapsed: sla.elapsedSeconds,
            target: sla.targetSeconds,
            remaining: sla.remainingSeconds,
            percentage: ((sla.elapsedSeconds / sla.targetSeconds) * 100).toFixed(1)
          })))
          
          return moderateProgress.map(({ order, sla }) => ({
            id: order.id,
            order_number: order.order_no || order.id,
            customer_name: order.customer?.name || `Customer ${order.customer?.id || 'Unknown'}`,
            channel: order.channel || "UNKNOWN",
            location: order.metadata?.store_name || order.shipping_address?.city || "Unknown Location", 
            target_minutes: sla.targetSeconds,
            elapsed_minutes: sla.elapsedSeconds,
            remaining: sla.remainingSeconds,
          }))
        }
        
        return []
      }

      // Return up to 6 approaching SLA orders (instead of 4) for better visibility
      return approaching.slice(0, 6).map((order) => {
        const slaStatus = calculateSLAStatus(order)

        return {
          id: order.id,
          order_number: order.order_no || order.id, // Use actual order number
          customer_name: order.customer?.name || `Customer ${order.customer?.id || 'Unknown'}`,
          channel: order.channel || "UNKNOWN",
          location: order.metadata?.store_name || order.shipping_address?.city || "Unknown Location", 
          target_minutes: slaStatus.targetSeconds,
          elapsed_minutes: slaStatus.elapsedSeconds,
          remaining: slaStatus.remainingSeconds,
        }
      })
    } catch (err) {
      console.warn("Error in fetchApproachingSla:", err)
      return []
    }
  }

  const fetchProcessingTimes = async () => {
    try {
      const orders = await fetchOrdersFromApi()
      const activeOrders = orders.filter((order) => order.status !== "DELIVERED" && order.status !== "FULFILLED")

      if (!activeOrders || activeOrders.length === 0) {
        return [
          { channel: "GRAB", minutes: 0 },
          { channel: "LAZADA", minutes: 0 },
          { channel: "SHOPEE", minutes: 0 },
          { channel: "TIKTOK", minutes: 0 },
        ]
      }

      // Group by channel and calculate average
      const channelTimes = {
        GRAB: { total: 0, count: 0 },
        LAZADA: { total: 0, count: 0 },
        SHOPEE: { total: 0, count: 0 },
        TIKTOK: { total: 0, count: 0 },
      }

      const channelMapping = {
        GRAB: "GRAB",
        GRABMART: "GRAB", 
        GRAB_MART: "GRAB",
        "GRAB-MART": "GRAB",
        LAZADA: "LAZADA",
        SHOPEE: "SHOPEE", 
        TIKTOK: "TIKTOK",
        TIKTOK_SHOP: "TIKTOK",
        "TIKTOK-SHOP": "TIKTOK",
      }

      activeOrders.forEach((order) => {
        const normalizedChannel = order.channel?.toUpperCase()?.trim()
        const mappedChannel = channelMapping[normalizedChannel] || normalizedChannel
        
        if (channelTimes[mappedChannel] && order.sla_info?.elapsed_minutes) {
          // API returns elapsed time in seconds, convert to minutes for display
          const elapsedSeconds = order.sla_info.elapsed_minutes
          const elapsedMinutes = elapsedSeconds / 60

          channelTimes[mappedChannel].total += elapsedMinutes
          channelTimes[mappedChannel].count++
        }
      })

      return [
        {
          channel: "GRAB",
          minutes: channelTimes.GRAB.count > 0 ? channelTimes.GRAB.total / channelTimes.GRAB.count : 0,
        },
        {
          channel: "LAZADA",
          minutes: channelTimes.LAZADA.count > 0 ? channelTimes.LAZADA.total / channelTimes.LAZADA.count : 0,
        },
        {
          channel: "SHOPEE",
          minutes: channelTimes.SHOPEE.count > 0 ? channelTimes.SHOPEE.total / channelTimes.SHOPEE.count : 0,
        },
        {
          channel: "TIKTOK",
          minutes: channelTimes.TIKTOK.count > 0 ? channelTimes.TIKTOK.total / channelTimes.TIKTOK.count : 0,
        },
      ]
    } catch (err) {
      console.warn("Error in fetchProcessingTimes:", err)
      return [
        { channel: "GRAB", minutes: 0 },
        { channel: "LAZADA", minutes: 0 },
        { channel: "SHOPEE", minutes: 0 },
        { channel: "TIKTOK", minutes: 0 },
      ]
    }
  }

  const fetchSlaCompliance = async () => {
    try {
      const orders = await fetchOrdersFromApi()

      // Always return all 4 channels
      const channelCompliance = {
        GRAB: { orders: [] as any[], total: 0 },
        LAZADA: { orders: [] as any[], total: 0 },
        SHOPEE: { orders: [] as any[], total: 0 },
        TIKTOK: { orders: [] as any[], total: 0 },
      }

      // Group orders by channel
      if (orders && orders.length > 0) {
        orders.forEach((order) => {
          const channel = order.channel?.toUpperCase()
          if (channelCompliance[channel]) {
            channelCompliance[channel].orders.push(order)
            channelCompliance[channel].total++
          }
        })
      }

      return [
        {
          channel: "GRAB",
          compliance: channelCompliance.GRAB.total > 0 
            ? calculateSLAComplianceRate(channelCompliance.GRAB.orders)
            : null,
          total: channelCompliance.GRAB.total,
          compliant: channelCompliance.GRAB.orders.filter(order => calculateSLAStatus(order).isCompliant).length,
        },
        {
          channel: "LAZADA", 
          compliance: channelCompliance.LAZADA.total > 0
            ? calculateSLAComplianceRate(channelCompliance.LAZADA.orders)
            : null,
          total: channelCompliance.LAZADA.total,
          compliant: channelCompliance.LAZADA.orders.filter(order => calculateSLAStatus(order).isCompliant).length,
        },
        {
          channel: "SHOPEE",
          compliance: channelCompliance.SHOPEE.total > 0
            ? calculateSLAComplianceRate(channelCompliance.SHOPEE.orders)
            : null,
          total: channelCompliance.SHOPEE.total,
          compliant: channelCompliance.SHOPEE.orders.filter(order => calculateSLAStatus(order).isCompliant).length,
        },
        {
          channel: "TIKTOK",
          compliance: channelCompliance.TIKTOK.total > 0
            ? calculateSLAComplianceRate(channelCompliance.TIKTOK.orders)
            : null,
          total: channelCompliance.TIKTOK.total,
          compliant: channelCompliance.TIKTOK.orders.filter(order => calculateSLAStatus(order).isCompliant).length,
        },
      ]
    } catch (err) {
      console.warn("Error fetching SLA compliance:", err)
      return [
        { channel: "GRAB", compliance: null, total: 0, compliant: 0 },
        { channel: "LAZADA", compliance: null, total: 0, compliant: 0 },
        { channel: "SHOPEE", compliance: null, total: 0, compliant: 0 },
        { channel: "TIKTOK", compliance: null, total: 0, compliant: 0 },
      ]
    }
  }

  const fetchRecentOrders = async () => {
    try {
      const orders = await fetchOrdersFromApi()
      // Sort by date descending and show up to 50 orders for better visibility
      const sortedOrders = orders.sort((a, b) => {
        try {
          const dateA = safeParseDate(a.order_date || a.metadata?.created_at)
          const dateB = safeParseDate(b.order_date || b.metadata?.created_at)
          const gmt7A = getGMT7Time(dateA)
          const gmt7B = getGMT7Time(dateB)
          return gmt7B.getTime() - gmt7A.getTime() // Most recent first
        } catch (error) {
          console.warn("Error sorting orders by date:", error)
          return 0
        }
      })
      const recentOrders = sortedOrders.slice(0, 50)

      if (!recentOrders || recentOrders.length === 0) {
        return []
      }

      return recentOrders.map((order) => {
        try {
          const orderDate = safeParseDate(order.order_date)
          return {
            order_number: order.id, // Full Order ID
            order_no: order.order_no || order.id, // Use order ID directly to avoid dynamic generation
            customer: order.customer?.name || "Customer",
            channel: order.channel,
            status: order.status || "CREATED",
            total: `฿${(order.total_amount || 0).toLocaleString()}`,
            date: formatGMT7DateString(orderDate),
          }
        } catch (error) {
          console.warn("Error processing order:", error, order)
          return {
            order_number: order.id || "Unknown",
            order_no: order.order_no || order.id || "Unknown",
            customer: "Customer",
            channel: order.channel || "UNKNOWN",
            status: order.status || "CREATED",
            total: "฿0",
            date: formatGMT7DateString(new Date()),
          }
        }
      })
    } catch (err) {
      console.warn("Error fetching recent orders:", err)
      return []
    }
  }

  const fetchFulfillmentByBranch = async () => {
    try {
      const orders = await fetchOrdersFromApi()

      if (!orders || orders.length === 0) {
        return []
      }

      // Group by store/branch
      const branchData = {}

      orders.forEach((order) => {
        const branchName = order.metadata?.store_name || "Unknown Store"

        if (!branchData[branchName]) {
          branchData[branchName] = { total: 0, fulfilled: 0 }
        }

        branchData[branchName].total++

        if (order.status === "DELIVERED" || order.status === "FULFILLED") {
          branchData[branchName].fulfilled++
        }
      })

      // Convert to array and calculate rates
      const result = Object.entries(branchData)
        .map(([branch, data]: [string, any]) => ({
          branch,
          total: data.total,
          fulfilled: data.fulfilled,
          rate: data.total > 0 ? (data.fulfilled / data.total) * 100 : 0,
        }))
        .sort((a, b) => b.rate - a.rate)
        .slice(0, 3)

      // If no real data, return empty array
      if (result.length === 0) {
        return []
      }

      return result
    } catch (err) {
      console.warn("Error fetching fulfillment by branch:", err)
      return []
    }
  }

  const fetchDailyOrders = async () => {
    try {
      const orders = await fetchOrdersFromApi()

      // Create consistent 2-day structure using GMT+7 dates (yesterday + today)
      const createDailyStructure = () => {
        const dailyData = {}
        const today = getGMT7Time()

        for (let i = 1; i >= 0; i--) {
          const date = getGMT7Time(today)
          date.setDate(date.getDate() - i)
          const dateKey = formatGMT7DateString(date).split("/").reverse().join("-") // Convert MM/DD/YYYY to YYYY-MM-DD
          dailyData[dateKey] = {
            date: dateKey,
            GRAB: 0,
            LAZADA: 0,
            SHOPEE: 0,
            TIKTOK: 0,
            total: 0,
          }
        }
        return dailyData
      }

      const dailyData = createDailyStructure()

      if (orders && orders.length > 0) {
        // Populate with real data from yesterday + today
        orders.forEach((order) => {
          try {
            const orderDate = safeParseDate(order.order_date || order.metadata?.created_at)
            const gmt7Date = getGMT7Time(orderDate)
            const dateKey = formatGMT7DateString(gmt7Date).split("/").reverse().join("-") // Convert MM/DD/YYYY to YYYY-MM-DD

            // Only include if it's within our 2-day window (yesterday + today)
            if (dailyData[dateKey]) {
              const channel = (order.channel || "UNKNOWN").toUpperCase()
              if (["GRAB", "LAZADA", "SHOPEE", "TIKTOK"].includes(channel)) {
                dailyData[dateKey][channel] = (dailyData[dateKey][channel] || 0) + 1
              }
              dailyData[dateKey].total += order.total_amount || 0
            }
          } catch (error) {
            console.warn("Error processing order for daily data:", error, order)
          }
        })
      }

      // Use consistent date formatting
      return Object.values(dailyData).map((day: any) => ({
        ...day,
        date: day.date.slice(5).replace("-", "/"), // Convert YYYY-MM-DD to MM/DD format consistently
      }))
    } catch (err) {
      console.warn("Error in fetchDailyOrders:", err)
      // Return consistent empty structure on error
      const dailyData = {}
      const today = getGMT7Time()

      for (let i = 1; i >= 0; i--) {
        const date = getGMT7Time(today)
        date.setDate(date.getDate() - i)
        const dateKey = formatGMT7DateString(date).split("/").reverse().join("-") // Convert MM/DD/YYYY to YYYY-MM-DD
        dailyData[dateKey] = {
          date: dateKey,
          GRAB: 0,
          LAZADA: 0,
          SHOPEE: 0,
          TIKTOK: 0,
          total: 0,
        }
      }

      return Object.values(dailyData).map((day: any) => ({
        ...day,
        date: day.date.slice(5).replace("-", "/"),
      }))
    }
  }

  const fetchChannelPerformance = async () => {
    try {
      const orders = await fetchOrdersFromApi()

      if (!orders || orders.length === 0) {
        return [
          { channel: "GRAB", orders: 0, revenue: 0, sla_rate: 0 },
          { channel: "LAZADA", orders: 0, revenue: 0, sla_rate: 0 },
          { channel: "SHOPEE", orders: 0, revenue: 0, sla_rate: 0 },
          { channel: "TIKTOK", orders: 0, revenue: 0, sla_rate: 0 },
        ]
      }

      // Group by channel
      const channelData = {
        GRAB: { orders: [] as any[], revenue: 0, orderCount: 0 },
        LAZADA: { orders: [] as any[], revenue: 0, orderCount: 0 },
        SHOPEE: { orders: [] as any[], revenue: 0, orderCount: 0 },
        TIKTOK: { orders: [] as any[], revenue: 0, orderCount: 0 },
      }

      const channelMapping = {
        GRAB: "GRAB",
        GRABMART: "GRAB",
        GRAB_MART: "GRAB", 
        "GRAB-MART": "GRAB",
        LAZADA: "LAZADA",
        SHOPEE: "SHOPEE",
        TIKTOK: "TIKTOK",
        TIKTOK_SHOP: "TIKTOK",
        "TIKTOK-SHOP": "TIKTOK",
      }

      orders.forEach((order) => {
        const normalizedChannel = order.channel?.toUpperCase()?.trim()
        const mappedChannel = channelMapping[normalizedChannel] || normalizedChannel
        
        if (channelData[mappedChannel]) {
          channelData[mappedChannel].orders.push(order)
          channelData[mappedChannel].orderCount++
          channelData[mappedChannel].revenue += order.total_amount || 0
        }
      })

      return Object.entries(channelData).map(([channel, data]: [string, any]) => ({
        channel,
        orders: data.orderCount,
        revenue: data.revenue,
        sla_rate: data.orders.length > 0 ? calculateSLAComplianceRate(data.orders) : 0,
      }))
    } catch (err) {
      console.warn("Error fetching channel performance:", err)
      return [
        { channel: "GRAB", orders: 0, revenue: 0, sla_rate: 0 },
        { channel: "LAZADA", orders: 0, revenue: 0, sla_rate: 0 },
        { channel: "SHOPEE", orders: 0, revenue: 0, sla_rate: 0 },
        { channel: "TIKTOK", orders: 0, revenue: 0, sla_rate: 0 },
      ]
    }
  }

  const fetchHourlyOrderSummary = async () => {
    try {
      const orders = await fetchOrdersFromApi()
      
      if (!orders || orders.length === 0) {
        // Return empty hourly data for 24 hours
        return Array.from({ length: 24 }, (_, i) => ({
          hour: i.toString().padStart(2, '0') + ':00',
          orders: 0,
          revenue: 0
        }))
      }

      // Get today's date in GMT+7
      const today = getGMT7Time()
      const todayStart = getGMT7Time(today)
      todayStart.setHours(0, 0, 0, 0)
      const todayEnd = getGMT7Time(today)
      todayEnd.setHours(23, 59, 59, 999)

      // Filter orders for today only using GMT+7 timezone
      const todayOrders = orders.filter(order => {
        try {
          const orderDate = safeParseDate(order.order_date || order.metadata?.created_at)
          const orderGMT7 = getGMT7Time(orderDate)
          return orderGMT7 >= todayStart && orderGMT7 <= todayEnd
        } catch (error) {
          return false
        }
      })

      // Initialize hourly data
      const hourlyData = Array.from({ length: 24 }, (_, i) => ({
        hour: i.toString().padStart(2, '0') + ':00',
        orders: 0,
        revenue: 0
      }))

      // Aggregate orders by hour using GMT+7 timezone
      todayOrders.forEach(order => {
        try {
          const orderDate = safeParseDate(order.order_date || order.metadata?.created_at)
          const orderGMT7 = getGMT7Time(orderDate)
          const hour = orderGMT7.getHours()
          
          hourlyData[hour].orders++
          hourlyData[hour].revenue += order.total_amount || 0
        } catch (error) {
          console.warn("Error processing order for hourly data:", error, order)
        }
      })

      return hourlyData

    } catch (err) {
      console.warn("Error fetching hourly order summary:", err)
      return Array.from({ length: 24 }, (_, i) => ({
        hour: i.toString().padStart(2, '0') + ':00',
        orders: 0,
        revenue: 0
      }))
    }
  }

  const fetchTopProducts = async () => {
    try {
      const orders = await fetchOrdersFromApi()

      if (!orders || orders.length === 0) {
        return []
      }

      const productMap = {}

      orders.forEach((order) => {
        if (order.items && Array.isArray(order.items)) {
          order.items.forEach((item) => {
            const productKey = item.product_sku || item.product_id

            if (productKey) {
              if (!productMap[productKey]) {
                productMap[productKey] = {
                  name: item.product_name || "Unknown Product",
                  sku: item.product_sku || productKey,
                  units: 0,
                  revenue: 0,
                }
              }

              const quantity = item.quantity || 1
              const unitPrice = item.unit_price || 0
              const revenue = item.total_price || unitPrice * quantity || 0

              productMap[productKey].units += quantity
              productMap[productKey].revenue += revenue
            }
          })
        }
      })

      const result = Object.values(productMap)
      result.sort((a: any, b: any) => b.revenue - a.revenue)

      if (result.length === 0) {
        return []
      }

      return result.slice(0, 5)
    } catch (err) {
      return []
    }
  }

  const fetchRevenueByCategory = async () => {
    try {
      const orders = await fetchOrdersFromApi()

      if (!orders || orders.length === 0) {
        return []
      }

      // Aggregate revenue by category from order items
      const categoryMap = {}

      orders.forEach((order) => {
        if (order.items && Array.isArray(order.items)) {
          order.items.forEach((item) => {
            const category = item.product_details?.category || "Other"

            if (!categoryMap[category]) {
              categoryMap[category] = {
                name: category,
                value: 0,
              }
            }

            const itemRevenue = item.total_price || item.unit_price * item.quantity || 0
            categoryMap[category].value += itemRevenue
          })
        }
      })

      // Convert to array and sort by value
      const result = Object.values(categoryMap)
      result.sort((a: any, b: any) => b.value - a.value)

      // If no real data, return empty array
      if (result.length === 0) {
        return []
      }

      return result.slice(0, 5)
    } catch (err) {
      console.warn("Error in fetchRevenueByCategory:", err)
      return []
    }
  }

  const calculateRevenue = (orders: any[]) => {
    if (!orders || orders.length === 0) return 0

    const total = orders.reduce((sum, order) => {
      return sum + (order.total_amount || 0)
    }, 0)

    return Math.round((total / 1000000) * 10) / 10 // Convert to millions with 1 decimal place
  }

  const calculateAvgProcessingTime = (orders: any[]) => {
    if (!orders || orders.length === 0) return 0

    const processingOrders = orders.filter((order) => order.status !== "DELIVERED" && order.status !== "FULFILLED")

    if (processingOrders.length === 0) return 0

    const totalMinutes = processingOrders.reduce((sum, order) => {
      if (order.sla_info?.elapsed_minutes) {
        // API returns elapsed time in seconds, convert to minutes
        const elapsedSeconds = order.sla_info.elapsed_minutes
        const elapsedMinutes = elapsedSeconds / 60
        return sum + elapsedMinutes
      }
      return sum
    }, 0)

    return Math.round((totalMinutes / processingOrders.length) * 10) / 10
  }

  const calculateFulfillmentRate = (orders: any[]) => {
    if (!orders || orders.length === 0) return 0

    const fulfilledOrders = orders.filter((order) => order.status === "DELIVERED" || order.status === "FULFILLED")

    return Math.round((fulfilledOrders.length / orders.length) * 100 * 10) / 10
  }

  const calculateActiveOrders = (orders: any[]) => {
    if (!orders || orders.length === 0) return 0

    const activeOrders = orders.filter(
      (order) => order.status !== "DELIVERED" && order.status !== "FULFILLED" && order.status !== "CANCELLED",
    )

    return activeOrders.length
  }


  const extractNumericValue = (priceString: string | number): number => {
    if (typeof priceString === "number") return priceString
    if (!priceString) return 0

    // Remove currency symbol, commas, and other non-numeric characters except decimal point
    const numericString = priceString.replace(/[^0-9.]/g, "")
    return Number.parseFloat(numericString) || 0
  }

  const getProgressColor = (value: number, threshold = 90) => {
    if (value >= threshold) return "bg-green-500"
    if (value >= threshold - 10) return "bg-yellow-500"
    return "bg-red-500"
  }

  const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"]

  // Only show full skeleton during initial mount, not during data refresh
  if (!isMounted) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96 mt-2" />
          </div>
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-[100px]" />
          ))}
        </div>
        <Skeleton className="h-10 w-96" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-[400px]" />
          <Skeleton className="h-[400px]" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-800 rounded-md">
        <div className="flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          <p>{error}</p>
        </div>
        <Button variant="outline" className="mt-4" onClick={loadData}>
          Retry
        </Button>
      </div>
    )
  }

  return (
    <AccessibilityWrapper
      pageTitle="Executive Dashboard - Real-time Order Management and SLA Monitoring"
      onEscape={() => {
        // Close any open modals or panels
        setActiveTab("overview")
        announceToScreenReader("Returned to dashboard overview", "polite")
      }}
      className="space-y-8 relative p-6 bg-gray-50/50 min-h-screen"
    >
      <div ref={containerRef}>
        {pullToRefreshIndicator}
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Executive Dashboard</h1>
          <p className="text-sm text-muted-foreground">Real-time order management and SLA monitoring</p>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <RealTimeStatus
            connectionStatus={connectionStatus}
            lastUpdateTime={lastUpdateTime}
            optimisticUpdatesCount={getUnconfirmedUpdates().length}
            onReconnect={connect}
          />
          <div className="text-xs text-muted-foreground">Yesterday + Today</div>
          <Button variant="outline" size="sm" className="min-h-[44px] w-full sm:w-auto" onClick={() => loadData()}>
            Refresh Data
          </Button>
        </div>
      </div>

      {/* Critical Alerts Banner */}
      <CriticalAlertsBanner
        slaBreaches={orderAlerts.map(alert => ({
          id: alert.id,
          order_number: alert.order_number,
          customer_name: alert.customer_name,
          channel: alert.channel,
          location: alert.location,
          target_minutes: alert.target_minutes,
          elapsed_minutes: alert.elapsed_minutes,
          type: 'breach' as const
        }))}
        approachingAlerts={approachingSla.map(alert => ({
          id: alert.id,
          order_number: alert.order_number || alert.id,
          customer_name: alert.customer_name || alert.customer || 'Customer',
          channel: alert.channel,
          location: alert.location || 'Unknown Location',
          target_minutes: alert.target_minutes,
          elapsed_minutes: alert.elapsed_minutes,
          type: 'approaching' as const
        }))}
        onEscalate={handleEscalation}
        isEscalating={isEscalating}
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        <KpiCard
          icon={<Package className="h-6 w-6 text-blue-600" />}
          value={ordersProcessing}
          change={0}
          label="Orders Processing"
          isLoading={kpiLoading.ordersProcessing}
        />
        <KpiCard
          icon={<AlertTriangle className="h-6 w-6 text-red-600" />}
          value={slaBreaches}
          change={0}
          label="SLA Breaches"
          isLoading={kpiLoading.slaBreaches}
          inverseColor
        />
        <KpiCard
          icon={<DollarSign className="h-6 w-6 text-blue-600" />}
          value={`฿${revenueToday}M`}
          change={0}
          label="Revenue (Yesterday + Today)"
          isLoading={kpiLoading.revenueToday}
        />
        <KpiCard
          icon={<Clock className="h-6 w-6 text-orange-600" />}
          value={`${avgProcessingTime}m`}
          change={0}
          label="Avg Processing Time"
          isLoading={kpiLoading.avgProcessingTime}
          inverseColor
        />
        <KpiCard
          icon={<ShoppingCart className="h-6 w-6 text-purple-600" />}
          value={activeOrders}
          change={0}
          label="Active Orders"
          isLoading={kpiLoading.activeOrders}
        />
        <KpiCard
          icon={<BarChart2 className="h-6 w-6 text-indigo-600" />}
          value={`${fulfillmentRate}%`}
          change={0}
          label="Fulfillment Rate"
          isLoading={kpiLoading.fulfillmentRate}
        />
      </div>

      {/* Tabs */}
      <div className="mt-12">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="relative" ref={swipeContainerRef}>
          {swipeIndicator}
          <TabsList className="grid w-full grid-cols-4" {...swipeProps}>
            <TabsTrigger value="overview">
              Overview
            </TabsTrigger>
            <TabsTrigger value="orders">
              Orders
            </TabsTrigger>
            <TabsTrigger value="fulfillment">
              Fulfillment
            </TabsTrigger>
            <TabsTrigger value="analytics">
              Analytics
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6 mt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Enhanced Interactive Channel Analysis */}
            <InteractiveChart
              title="Channel Performance Analytics"
              initialLevel={{
                id: "channel_overview",
                title: "Channel Overview",
                data: enhancedChannelData.overview,
                type: "bar",
                xAxisKey: "name",
                yAxisKey: "orders"
              }}
              drillDownLevels={[
                {
                  id: "channel_overview", 
                  title: "Channel Overview",
                  data: enhancedChannelData.overview,
                  type: "bar",
                  xAxisKey: "name", 
                  yAxisKey: "orders"
                },
                {
                  id: "status_breakdown",
                  title: "Status Breakdown",
                  data: enhancedChannelData.drillDown,
                  type: "pie",
                  valueKey: "orders",
                  nameKey: "status"
                }
              ]}
              isLoading={chartsLoading.enhancedChannelData}
              priority="important"
              status="good"
              height="h-[350px]"
              onDataPointClick={(data, level) => {
                console.log("Drill-down clicked:", data, level)
              }}
              showInsights={true}
            />

            {/* Critical Alerts */}
            <ChartCard title="Critical Alerts" isLoading={chartsLoading.alerts}>
              <div className="space-y-4">
                {/* SLA Breach Alerts */}
                <div>
                  <h4 className="font-semibold text-red-600 mb-2 flex items-center">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    SLA Breach Alerts ({orderAlerts.length})
                  </h4>
                  {orderAlerts.length > 0 ? (
                    <div className="space-y-2">
                      {orderAlerts.map((alert, index) => (
                        <div key={index} className="flex items-center justify-between p-6 bg-white rounded-xl border border-red-200 shadow-sm hover:shadow-md hover:border-red-300 transition-all duration-200 group">
                          <div className="space-y-2">
                            <div className="font-semibold text-base text-gray-900 group-hover:text-red-700 transition-colors">{alert.order_number}</div>
                            <div className="flex items-center space-x-3 text-sm text-gray-600">
                              <span>{alert.customer_name}</span>
                              <ChannelBadge channel={alert.channel} />
                            </div>
                          </div>
                          <div className="text-right space-y-2">
                            <div className="text-base font-bold text-red-600 group-hover:text-red-700 transition-colors">
                              {formatOverTime(alert.elapsed_minutes || 0, alert.target_minutes || 300)}
                            </div>
                            <div className="text-sm text-gray-500">{alert.location}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-600 py-4">No SLA breaches detected</p>
                  )}
                </div>

                {/* Approaching SLA Alerts */}
                <div>
                  <h4 className="font-semibold text-orange-600 mb-2 flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    Approaching SLA ({approachingSla.length})
                  </h4>
                  {approachingSla.length > 0 ? (
                    <div className="space-y-2">
                      {approachingSla.slice(0, 6).map((alert, index) => (
                        <div key={index} className="flex items-center justify-between p-6 bg-white rounded-xl border border-amber-200 shadow-sm hover:shadow-md hover:border-amber-300 transition-all duration-200 group">
                          <div className="space-y-2">
                            <div className="font-semibold text-base text-gray-900 group-hover:text-amber-700 transition-colors">{alert.order_number}</div>
                            <div className="flex items-center text-sm text-gray-600">
                              <ChannelBadge channel={alert.channel} />
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-base font-bold text-amber-600 group-hover:text-amber-700 transition-colors">
                              {Math.ceil((alert.remaining || 0) / 60)}m left
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-600 py-4">No orders approaching SLA deadline</p>
                  )}
                </div>

                {/* Escalation Actions */}
                <div className="border-t border-gray-100 pt-6 mt-6">
                  <div className="space-y-3">
                    <div className="text-xs text-gray-500 text-center">
                      Quick Actions
                    </div>
                    <div className="flex gap-3">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleEscalation}
                        disabled={isEscalating || (orderAlerts.length === 0 && approachingSla.length === 0)}
                        className="flex-1 min-h-[48px] rounded-xl font-medium shadow-sm hover:shadow-md hover:scale-[1.01] transition-all duration-200 active:scale-[0.99] border-0"
                      >
                        {isEscalating ? (
                          <div className="flex items-center space-x-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            <span>Escalating...</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <span>🚨</span>
                            <span>Escalate to Teams</span>
                          </div>
                        )}
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleTestEscalation} 
                        disabled={isEscalating} 
                        className="min-h-[48px] px-6 rounded-xl border-gray-200 hover:border-gray-300 hover:bg-gray-50 hover:scale-[1.01] transition-all duration-200 active:scale-[0.99]"
                      >
                        🧪 Test
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </ChartCard>
          </div>
        </TabsContent>

        {/* Orders Tab */}
        <TabsContent value="orders" className="space-y-6 mt-8">
          <div className="grid grid-cols-1 gap-6">
            {/* Hourly Order Summary */}
            <ChartCard 
              title="Order Volume by Hour - Today" 
              isLoading={chartsLoading.hourlyOrderSummary}
              height="h-[500px]"
            >
              <div className="space-y-4">
                {/* Current Hour Summary */}
                <div className="grid grid-cols-3 gap-8 p-8 bg-white rounded-xl border border-gray-200 shadow-sm">
                  {(() => {
                    // Only get current hour on client side to prevent hydration mismatch using GMT+7
                    const currentHour = isMounted ? getGMT7Time().getHours() : 0
                    const currentHourData = hourlyOrderSummary.find(h => h.hour === currentHour.toString().padStart(2, '0') + ':00') || 
                                             { orders: 0, revenue: 0 }
                    return (
                      <>
                        <div className="text-center space-y-1">
                          <div className="text-2xl font-bold text-gray-900">
                            {isMounted ? currentHour.toString().padStart(2, '0') : '--'}:00
                          </div>
                          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Current Hour</div>
                        </div>
                        <div className="text-center space-y-1">
                          <div className="text-xl font-bold text-blue-600">{currentHourData.orders}</div>
                          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Orders</div>
                        </div>
                        <div className="text-center space-y-1">
                          <div className="text-xl font-bold text-green-600">฿{((currentHourData.revenue || 0) / 1000000).toFixed(1)}M</div>
                          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Revenue</div>
                        </div>
                      </>
                    )
                  })()} 
                </div>

                {/* Hourly Chart */}
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={hourlyOrderSummary}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="hour" 
                        tick={{ fontSize: 12 }}
                        interval={1}
                      />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip 
                        formatter={(value, name) => [
                          name === 'revenue' ? `฿${(value / 1000000).toFixed(1)}M` : value,
                          name === 'orders' ? 'Orders' : 'Revenue'
                        ]}
                        labelFormatter={(hour) => `Time: ${hour}`}
                      />
                      <Legend />
                      <Bar yAxisId="left" dataKey="orders" fill="#3b82f6" name="Orders" />
                      <Bar yAxisId="right" dataKey="revenue" fill="#10b981" name="Revenue" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </ChartCard>

            {/* Daily Order Volume */}
            <ChartCard title="Daily Order Volume - Yesterday & Today" isLoading={chartsLoading.dailyOrders}>
              <div className="h-[300px]">
                {dailyOrders && dailyOrders.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dailyOrders}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="GRAB" stackId="a" fill="#10b981" />
                      <Bar dataKey="LAZADA" stackId="a" fill="#3b82f6" />
                      <Bar dataKey="SHOPEE" stackId="a" fill="#f59e0b" />
                      <Bar dataKey="TIKTOK" stackId="a" fill="#ef4444" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-sm text-gray-600">No daily order data available</p>
                  </div>
                )}
              </div>
            </ChartCard>
          </div>
        </TabsContent>

        {/* Fulfillment Tab */}
        <TabsContent value="fulfillment" className="space-y-4 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Fulfillment by Branch */}
            <ChartCard title="Fulfillment by Branch" isLoading={chartsLoading.fulfillmentByBranch}>
              <div className="space-y-6">
                {fulfillmentByBranch.length > 0 ? (
                  fulfillmentByBranch.map((branch, index) => (
                    <div key={index} className="p-6 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 space-y-4 group">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{branch.branch}</span>
                        <div className="text-right">
                          <div className="text-xl font-bold text-green-600">{branch.rate.toFixed(1)}%</div>
                          <div className="text-sm text-gray-500">
                            {branch.fulfilled}/{branch.total} orders
                          </div>
                        </div>
                      </div>
                      <Progress value={branch.rate} className={`h-3 ${getProgressColor(branch.rate)} rounded-full`} />
                      <div className="flex justify-between text-sm text-gray-500">
                        <span>Fulfilled: {branch.fulfilled}</span>
                        <span>Target: 95%</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <div className="text-gray-400 mb-2">📊</div>
                    <p className="text-sm text-gray-600">No fulfillment data available</p>
                  </div>
                )}
              </div>
            </ChartCard>

            {/* Channel Performance */}
            <ChartCard title="Channel Performance" isLoading={chartsLoading.channelPerformance}>
              <div className="h-[300px]">
                {channelPerformance && channelPerformance.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={channelPerformance}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="channel" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip 
                        formatter={(value, name) => [
                          name === 'revenue' ? `฿${(value / 1000000).toFixed(1)}M` : 
                          name === 'sla_rate' ? `${value.toFixed(1)}%` : value,
                          name === 'orders' ? 'Orders' : 
                          name === 'revenue' ? 'Revenue' : 'SLA Rate'
                        ]}
                      />
                      <Legend />
                      <Bar yAxisId="left" dataKey="orders" fill="#3b82f6" name="Orders" />
                      <Bar yAxisId="right" dataKey="sla_rate" fill="#10b981" name="SLA Rate" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-sm text-gray-600">No channel performance data available</p>
                  </div>
                )}
              </div>
            </ChartCard>
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6 mt-8">
          {/* Performance Analytics Dashboard */}
          <PerformanceAnalytics
            data={{
              orders: ordersData || [],
              channels: channelVolume || [],
              slaMetrics: slaCompliance || [],
              timeRange: "Yesterday + Today"
            }}
            isLoading={chartsLoading.topProducts || chartsLoading.revenueByCategory}
            className="mb-6"
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Top Products */}
            <ChartCard title="Top Products by Revenue" isLoading={chartsLoading.topProducts}>
              <div className="space-y-4">
                {topProducts.length > 0 ? (
                  <div className="space-y-4">
                    {topProducts.map((product, index) => (
                      <div key={index} className="flex justify-between items-center p-6 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 group">
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-50 to-blue-100 rounded-full flex items-center justify-center group-hover:from-blue-100 group-hover:to-blue-200 transition-all duration-200">
                            <span className="text-sm font-bold text-blue-600">#{index + 1}</span>
                          </div>
                          <div className="space-y-2">
                            <div className="font-semibold text-lg text-gray-900 group-hover:text-blue-600 transition-colors">{product.name}</div>
                            <div className="text-sm text-gray-500 bg-gray-50 px-3 py-1 rounded-full inline-block border">{product.sku}</div>
                            <div className="text-sm text-gray-600 flex items-center space-x-2">
                              <span>📦</span>
                              <span>{product.units} units sold</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-green-600 group-hover:text-green-700 transition-colors">฿{product.revenue.toLocaleString()}</div>
                          <div className="text-sm font-medium text-gray-500">Revenue</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-gray-400 mb-2">📦</div>
                    <p className="text-sm text-gray-600">No product data available</p>
                  </div>
                )}
              </div>
            </ChartCard>

            {/* Revenue by Category */}
            <ChartCard title="Revenue by Category" isLoading={chartsLoading.revenueByCategory}>
              <div className="h-[300px]">
                {revenueByCategory.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={revenueByCategory}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {revenueByCategory.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`฿${value.toLocaleString()}`, 'Revenue']} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-sm text-gray-600">No category data available</p>
                  </div>
                )}
              </div>
            </ChartCard>
          </div>
        </TabsContent>
      </Tabs>
      </div>
      </div>
    </AccessibilityWrapper>
  )
}
