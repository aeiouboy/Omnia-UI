"use client"

import { useState, useEffect } from "react"
import { TeamsWebhookService } from "@/lib/teams-webhook"
import { useToast } from "@/components/ui/use-toast"
import { usePullToRefresh } from "@/hooks/use-pull-to-refresh"
import { useSwipeTabs } from "@/hooks/use-swipe-tabs"
import { getGMT7Time, formatGMT7DateString, safeParseDate } from "@/lib/utils"
import { 
  createEscalationRecord, 
  updateEscalationStatus,
  getAlertMessage,
  getSeverityFromAlertType,
  createTeamsMessagePayload,
} from "@/lib/escalation-service"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { ChannelBadge, OrderStatusBadge } from "./order-badges"
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
const CACHE_DURATION = 30000 // 30 seconds

// Optimized API client function with caching - Last 7 days only
const fetchOrdersFromApi = async (): Promise<ApiOrder[]> => {
  try {
    // Check cache first
    const now = Date.now()
    if (ordersCache && now - ordersCache.timestamp < CACHE_DURATION) {
      console.log("📦 Using cached orders data (last 7 days)")
      return ordersCache.data
    }

    console.log("🔄 Fetching last 7 days orders from API for dashboard...")

    // Calculate date range for last 7 days - using GMT+7 timezone
    const endDate = getGMT7Time()
    endDate.setHours(23, 59, 59, 999) // End of today in GMT+7
    const startDate = getGMT7Time()
    startDate.setDate(endDate.getDate() - 7)
    startDate.setHours(0, 0, 0, 0) // Start of 7 days ago in GMT+7

    const dateFrom = startDate.toISOString().split("T")[0]
    const dateTo = endDate.toISOString().split("T")[0]

    // Try server-side API route with date filtering
    const controller = new AbortController()
    const timeoutId = setTimeout(() => {
      controller.abort()
    }, 15000) // Increased timeout to 15 seconds

    const queryParams = new URLSearchParams({
      pageSize: "200", // Smaller page size for last 7 days
      dateFrom,
      dateTo,
    })

    try {
      const proxyResponse = await fetch(`/api/orders/external?${queryParams.toString()}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (proxyResponse.ok) {
        const proxyData = await proxyResponse.json()
        if (proxyData.success && proxyData.data) {
          console.log("✅ Successfully fetched last 7 days data via server proxy")
          const orders = proxyData.data.data || []

          // Additional client-side filtering to ensure we only get last 7 days
          const filteredOrders = orders.filter((order: ApiOrder) => {
            try {
              const orderDate = safeParseDate(order.order_date || order.metadata?.created_at)
              const orderGMT7 = getGMT7Time(orderDate)
              return orderGMT7 >= startDate && orderGMT7 <= endDate
            } catch (error) {
              console.warn("Error parsing order date:", error, order)
              return false
            }
          })

          // Cache the result
          ordersCache = { data: filteredOrders, timestamp: now }
          return filteredOrders
        }
      }

      console.warn("⚠️ Proxy response not successful, returning empty data")
      return []
    } catch (fetchError) {
      clearTimeout(timeoutId)

      if (fetchError.name === "AbortError") {
        console.warn("⏰ Dashboard API request timed out after 15 seconds")
        return []
      }

      console.error("❌ Dashboard API fetch failed:", fetchError)
      return []
    }
  } catch (error) {
    console.error("❌ Dashboard API general error:", error)
    return []
  }
}

export function ExecutiveDashboard() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("overview")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEscalating, setIsEscalating] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [kpiData, setKpiData] = useState({
    ordersProcessing: { value: 0, change: 0 },
    slaBreaches: { value: 0, change: 0 },
    revenueToday: { value: 0, change: 0 },
    avgProcessingTime: { value: 0, change: 0 },
    activeOrders: { value: 0, change: 0 },
    fulfillmentRate: { value: 0, change: 0 },
  })
  const [channelVolume, setChannelVolume] = useState<any[]>([])
  const [orderAlerts, setOrderAlerts] = useState<any[]>([])
  const [approachingSla, setApproachingSla] = useState<any[]>([])
  const [processingTimes, setProcessingTimes] = useState<any[]>([])
  const [slaCompliance, setSlaCompliance] = useState<any[]>([])
  const [recentOrders, setRecentOrders] = useState<any[]>([])
  const [dailyOrders, setDailyOrders] = useState<any[]>([])
  const [fulfillmentByBranch, setFulfillmentByBranch] = useState<any[]>([])
  const [channelPerformance, setChannelPerformance] = useState<any[]>([])
  const [topProducts, setTopProducts] = useState<any[]>([])
  const [revenueByCategory, setRevenueByCategory] = useState<any[]>([])
  const [hourlyOrderSummary, setHourlyOrderSummary] = useState<any[]>([])

  const loadData = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Load all data in parallel with error handling for each request
      const [
        ordersData,
        breachesData,
        channelData,
        alertsData,
        approachingData,
        processingData,
        complianceData,
        recentOrdersData,
        dailyOrdersData,
        fulfillmentData,
        channelPerfData,
        productsData,
        categoryData,
        hourlyData,
      ] = await Promise.all([
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
          return [
            { channel: "GRAB", orders: 0 },
            { channel: "LAZADA", orders: 0 },
            { channel: "SHOPEE", orders: 0 },
            { channel: "TIKTOK", orders: 0 },
          ]
        }),
        fetchOrderAlerts().catch((err) => {
          console.error("Error fetching order alerts:", err)
          return []
        }),
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
        fetchRecentOrders().catch((err) => {
          console.error("Error fetching recent orders:", err)
          return []
        }),
        fetchDailyOrders().catch((err) => {
          console.error("Error fetching daily orders:", err)
          return []
        }),
        fetchFulfillmentByBranch().catch((err) => {
          console.error("Error fetching fulfillment by branch:", err)
          return []
        }),
        fetchChannelPerformance().catch((err) => {
          console.error("Error fetching channel performance:", err)
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
        fetchHourlyOrderSummary().catch((err) => {
          console.error("Error fetching hourly order summary:", err)
          return []
        }),
      ])

      // Set KPI data - all based on real data now
      const allOrders = await fetchOrdersFromApi()
      const fulfillmentRate = calculateFulfillmentRate(allOrders)
      const activeOrdersCount = calculateActiveOrders(allOrders)

      setKpiData({
        ordersProcessing: { value: ordersData.count, change: 0 }, // Real count, change calculation would need historical data
        slaBreaches: { value: breachesData.count, change: 0 }, // Real count, change calculation would need historical data
        revenueToday: { value: calculateRevenue(allOrders), change: 0 }, // Real revenue, change calculation would need historical data
        avgProcessingTime: { value: calculateAvgProcessingTime(ordersData.orders), change: 0 }, // Real avg time, change calculation would need historical data
        activeOrders: { value: activeOrdersCount, change: 0 }, // Real active orders count
        fulfillmentRate: { value: fulfillmentRate, change: 0 }, // Real fulfillment rate
      })

      // Set other data
      setChannelVolume(channelData)
      setOrderAlerts(alertsData)
      setApproachingSla(approachingData)
      setProcessingTimes(processingData)
      setSlaCompliance(complianceData)
      setRecentOrders(recentOrdersData)
      setDailyOrders(dailyOrdersData)
      setFulfillmentByBranch(fulfillmentData)
      setChannelPerformance(channelPerfData)
      setTopProducts(productsData)
      setRevenueByCategory(categoryData)
      setHourlyOrderSummary(hourlyData)
    } catch (err) {
      console.error("Failed to load dashboard data:", err)
      setError("Failed to load dashboard data. Please try again later.")
    } finally {
      setIsLoading(false)
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

  const tabs = ["overview", "orders", "fulfillment", "analytics"]
  const {
    containerRef: tabsContainerRef,
    swipeProps,
    swipeIndicator,
  } = useSwipeTabs({
    tabs,
    activeTab,
    onTabChange: setActiveTab,
  })

  useEffect(() => {
    setIsMounted(true)
    loadData()
  }, [])

  const handleEscalation = async () => {
    if (isEscalating) return

    setIsEscalating(true)

    try {
      // Get the first SLA breach order, or approaching SLA order if no breaches
      const alertOrder = orderAlerts[0] || approachingSla[0]

      if (!alertOrder) {
        toast({
          title: "No alerts to escalate",
          description: "There are no SLA alerts to escalate at this time.",
          variant: "default",
        })
        return
      }

      // Determine if it's a breach or approaching breach
      const isBreach = orderAlerts.length > 0
      const alertType = isBreach ? "SLA_BREACH" : "SLA_WARNING"
      
      // Handle different data structures for breach vs approaching
      const orderNumber = alertOrder.order_number || alertOrder.id
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
        // Update escalation status to FAILED if Teams webhook fails (only if DB is working)
        if (dbStorageWorking && createdEscalation) {
          try {
            await updateEscalationStatus(createdEscalation.id, { status: "FAILED" })
          } catch (updateError) {
            console.warn("Failed to update escalation status:", updateError)
          }
        }
        throw new Error(result.message || `Failed to send to MS Teams: ${response.statusText}`)
      }

      // Update escalation status to SENT if Teams webhook succeeds (only if DB is working)
      if (dbStorageWorking && createdEscalation) {
        try {
          await updateEscalationStatus(createdEscalation.id, { status: "SENT" })
        } catch (updateError) {
          console.warn("Failed to update escalation status:", updateError)
        }
      }

      toast({
        title: "Escalation sent successfully",
        description: `${isBreach ? "SLA breach" : "SLA warning"} alert for order ${orderNumber} has been escalated to MS Teams${!dbStorageWorking ? " (History not saved - database not configured)" : ""}.`,
        variant: "default",
      })
    } catch (error) {
      console.error("Escalation failed:", error)
      toast({
        title: "Escalation failed",
        description: error instanceof Error ? error.message : "Failed to send escalation to MS Teams.",
        variant: "destructive",
      })
    } finally {
      setIsEscalating(false)
    }
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
      const breachedOrders = orders.filter((order) => {
        if (order.status === "DELIVERED" || order.status === "FULFILLED") return false
        if (!order.sla_info) return false

        // API returns values in seconds
        // Default SLA target is 300 seconds (5 minutes)
        const targetSeconds = order.sla_info.target_minutes || 300
        const elapsedSeconds = order.sla_info.elapsed_minutes || 0

        // Over SLA if elapsed time exceeds target
        return elapsedSeconds > targetSeconds || order.sla_info.status === "BREACH"
      })

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

      console.log("🔍 Channel Volume Debug - Total orders:", orders.length)

      if (!orders || orders.length === 0) {
        console.log("⚠️ No orders found for channel volume")
        return [
          { channel: "GRAB", orders: 0 },
          { channel: "LAZADA", orders: 0 },
          { channel: "SHOPEE", orders: 0 },
          { channel: "TIKTOK", orders: 0 },
        ]
      }

      // Count orders by channel with detailed logging
      const channelCounts = {
        GRAB: 0,
        LAZADA: 0,
        SHOPEE: 0,
        TIKTOK: 0,
      }

      // Channel mapping to handle different variations
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

      // Debug: Log all unique channels found and detailed analysis
      const allChannels = new Set()
      const channelAnalysis = {}

      orders.forEach((order, index) => {
        const originalChannel = order.channel
        const normalizedChannel = order.channel?.toUpperCase()?.trim()

        // Track all variations
        if (originalChannel) {
          channelAnalysis[originalChannel] = (channelAnalysis[originalChannel] || 0) + 1
        }

        allChannels.add(`"${originalChannel}" -> "${normalizedChannel}"`)

        // Log first 10 orders for more detailed debugging
        if (index < 10) {
          console.log(`🔍 Order ${index + 1}:`, {
            id: order.id,
            channel_raw: originalChannel,
            channel_normalized: normalizedChannel,
            channel_type: typeof originalChannel,
            channel_length: originalChannel?.length,
            has_channel: !!originalChannel,
          })
        }

        // Count with better debugging using channel mapping
        if (normalizedChannel) {
          const mappedChannel = channelMapping[normalizedChannel]
          if (mappedChannel && channelCounts.hasOwnProperty(mappedChannel)) {
            channelCounts[mappedChannel]++
            console.log(
              `✅ Mapped "${normalizedChannel}" -> "${mappedChannel}" - new count: ${channelCounts[mappedChannel]}`,
            )
          } else {
            console.log(
              `⚠️ Unknown channel found: "${normalizedChannel}" (original: "${originalChannel}", type: ${typeof originalChannel})`,
            )
          }
        } else {
          console.log(`❌ Order ${index + 1} has null/undefined channel:`, order.channel)
        }
      })

      console.log("🔍 Raw channel analysis (all variations):", channelAnalysis)
      console.log("🔍 All channel transformations:", Array.from(allChannels))
      console.log("🔍 Final channel counts:", channelCounts)
      console.log("🔍 Expected channels:", Object.keys(channelCounts))

      const result = [
        { channel: "GRAB", orders: channelCounts.GRAB },
        { channel: "LAZADA", orders: channelCounts.LAZADA },
        { channel: "SHOPEE", orders: channelCounts.SHOPEE },
        { channel: "TIKTOK", orders: channelCounts.TIKTOK },
      ]

      console.log("🔍 Channel volume result:", result)
      return result
    } catch (err) {
      console.warn("Error in fetchChannelVolume:", err)
      return [
        { channel: "GRAB", orders: 0 },
        { channel: "LAZADA", orders: 0 },
        { channel: "SHOPEE", orders: 0 },
        { channel: "TIKTOK", orders: 0 },
      ]
    }
  }

  const fetchOrderAlerts = async () => {
    try {
      const orders = await fetchOrdersFromApi()
      const breachedOrders = orders.filter((order) => {
        if (order.status === "DELIVERED" || order.status === "FULFILLED") return false
        if (!order.sla_info) return false

        // API returns values in seconds
        // Default SLA target is 300 seconds (5 minutes)
        const targetSeconds = order.sla_info.target_minutes || 300
        const elapsedSeconds = order.sla_info.elapsed_minutes || 0

        // Over SLA if elapsed time exceeds target
        return elapsedSeconds > targetSeconds || order.sla_info.status === "BREACH"
      })

      if (!breachedOrders || breachedOrders.length === 0) {
        return [] // Return empty array instead of mock data
      }

      return breachedOrders.slice(0, 1).map((order) => {
        const targetSeconds = order.sla_info?.target_minutes || 300
        const elapsedSeconds = order.sla_info?.elapsed_minutes || 0

        console.log(`🔍 SLA Breach Debug for order ${order.id}:`)
        console.log(`  - target_minutes (seconds): ${targetSeconds}`)
        console.log(`  - elapsed_minutes (seconds): ${elapsedSeconds}`)
        console.log(`  - over SLA: ${elapsedSeconds > targetSeconds}`)

        return {
          id: order.id,
          order_number: order.id,
          customer_name: order.customer?.name || "Customer",
          channel: order.channel || "UNKNOWN",
          location: order.metadata?.store_name || "Unknown Location",
          target_minutes: targetSeconds,
          elapsed_minutes: elapsedSeconds,
        }
      })
    } catch (err) {
      console.warn("Error in fetchOrderAlerts:", err)
      return [] // Return empty array instead of mock data
    }
  }

  const fetchApproachingSla = async () => {
    try {
      const orders = await fetchOrdersFromApi()
      console.log(`🔍 SLA Debug - Processing ${orders.length} orders for approaching SLA check`)

      // Log first order's SLA info to understand the data structure
      if (orders.length > 0 && orders[0].sla_info) {
        console.log(`🔍 Sample SLA Info from first order:`, {
          target_minutes: orders[0].sla_info.target_minutes,
          elapsed_minutes: orders[0].sla_info.elapsed_minutes,
          status: orders[0].sla_info.status,
          sla_info_keys: Object.keys(orders[0].sla_info),
        })
      }

      const approaching = orders.filter((order) => {
        if (order.status === "DELIVERED" || order.status === "FULFILLED") return false
        if (!order.sla_info) return false
        if (order.sla_info.status === "BREACH") return false

        // API returns values in seconds
        // Default SLA target is 300 seconds (5 minutes)
        const targetSeconds = order.sla_info.target_minutes || 300
        const elapsedSeconds = order.sla_info.elapsed_minutes || 0

        // Check if approaching SLA (within 20% of target time)
        const remainingSeconds = targetSeconds - elapsedSeconds
        const criticalThreshold = targetSeconds * 0.2 // 20% of target (60 seconds for 300s target)
        return remainingSeconds <= criticalThreshold && remainingSeconds > 0
      })

      console.log(`🔍 Found ${approaching.length} orders approaching SLA deadline`)

      if (approaching.length === 0) {
        return [] // Return empty array instead of mock data
      }

      return approaching.slice(0, 4).map((order) => {
        const targetSeconds = order.sla_info.target_minutes || 300
        const elapsedSeconds = order.sla_info.elapsed_minutes || 0
        const remainingSeconds = Math.max(1, targetSeconds - elapsedSeconds)

        console.log(`🔍 SLA Approaching Debug for order ${order.id}:`)
        console.log(`  - target_minutes (seconds): ${targetSeconds}`)
        console.log(`  - elapsed_minutes (seconds): ${elapsedSeconds}`)
        console.log(`  - remaining seconds: ${remainingSeconds}`)
        console.log(`  - approaching threshold: ${targetSeconds * 0.2}s`)

        return {
          id: order.id,
          order_number: order.id, // Use full order ID instead of short order_no
          channel: order.channel,
          remaining: remainingSeconds,
        }
      })
    } catch (err) {
      console.warn("Error fetching approaching SLA orders:", err)
      return [] // Return empty array instead of mock data
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

      activeOrders.forEach((order) => {
        const channel = order.channel?.toUpperCase() // Normalize to uppercase
        if (channelTimes[channel] && order.sla_info?.elapsed_minutes) {
          // API returns elapsed time in seconds, convert to minutes for display
          const elapsedSeconds = order.sla_info.elapsed_minutes
          const elapsedMinutes = elapsedSeconds / 60

          channelTimes[channel].total += elapsedMinutes
          channelTimes[channel].count++
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

      // Always return all 4 channels - the widget should always show these channels
      const channelCompliance = {
        GRAB: { compliant: 0, total: 0 },
        LAZADA: { compliant: 0, total: 0 },
        SHOPEE: { compliant: 0, total: 0 },
        TIKTOK: { compliant: 0, total: 0 },
      }

      // If we have orders, calculate real compliance
      if (orders && orders.length > 0) {
        orders.forEach((order) => {
          const channel = order.channel?.toUpperCase() // Normalize to uppercase
          if (channelCompliance[channel]) {
            channelCompliance[channel].total++

            // Check SLA compliance using seconds-based calculation
            let isCompliant = false
            if (
              order.sla_info?.status === "COMPLIANT" ||
              order.status === "DELIVERED" ||
              order.status === "FULFILLED"
            ) {
              isCompliant = true
            } else if (order.sla_info) {
              const targetSeconds = order.sla_info.target_minutes || 300
              const elapsedSeconds = order.sla_info.elapsed_minutes || 0
              isCompliant = elapsedSeconds <= targetSeconds
            }

            if (isCompliant) {
              channelCompliance[channel].compliant++
            }
          }
        })
      }

      return [
        {
          channel: "GRAB",
          compliance:
            channelCompliance.GRAB.total > 0
              ? (channelCompliance.GRAB.compliant / channelCompliance.GRAB.total) * 100
              : null,
          total: channelCompliance.GRAB.total,
          compliant: channelCompliance.GRAB.compliant,
        },
        {
          channel: "LAZADA",
          compliance:
            channelCompliance.LAZADA.total > 0
              ? (channelCompliance.LAZADA.compliant / channelCompliance.LAZADA.total) * 100
              : null,
          total: channelCompliance.LAZADA.total,
          compliant: channelCompliance.LAZADA.compliant,
        },
        {
          channel: "SHOPEE",
          compliance:
            channelCompliance.SHOPEE.total > 0
              ? (channelCompliance.SHOPEE.compliant / channelCompliance.SHOPEE.total) * 100
              : null,
          total: channelCompliance.SHOPEE.total,
          compliant: channelCompliance.SHOPEE.compliant,
        },
        {
          channel: "TIKTOK",
          compliance:
            channelCompliance.TIKTOK.total > 0
              ? (channelCompliance.TIKTOK.compliant / channelCompliance.TIKTOK.total) * 100
              : null,
          total: channelCompliance.TIKTOK.total,
          compliant: channelCompliance.TIKTOK.compliant,
        },
      ]
    } catch (err) {
      console.warn("Error fetching SLA compliance:", err)
      // Return empty data structure - widget will show "No data" state
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

      // Create consistent 7-day structure using GMT+7 dates
      const createDailyStructure = () => {
        const dailyData = {}
        const today = getGMT7Time()

        for (let i = 6; i >= 0; i--) {
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
        // Populate with real data from last 7 days
        orders.forEach((order) => {
          try {
            const orderDate = safeParseDate(order.order_date || order.metadata?.created_at)
            const gmt7Date = getGMT7Time(orderDate)
            const dateKey = formatGMT7DateString(gmt7Date).split("/").reverse().join("-") // Convert MM/DD/YYYY to YYYY-MM-DD

            // Only include if it's within our 7-day window
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

      for (let i = 6; i >= 0; i--) {
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
        GRAB: { orders: 0, revenue: 0, sla_compliance: 0, total: 0 },
        LAZADA: { orders: 0, revenue: 0, sla_compliance: 0, total: 0 },
        SHOPEE: { orders: 0, revenue: 0, sla_compliance: 0, total: 0 },
        TIKTOK: { orders: 0, revenue: 0, sla_compliance: 0, total: 0 },
      }

      orders.forEach((order) => {
        const channel = order.channel?.toUpperCase() // Normalize to uppercase
        if (channelData[channel]) {
          channelData[channel].orders++
          channelData[channel].revenue += order.total_amount || 0
          channelData[channel].total++

          // Check SLA compliance using seconds-based calculation
          let isCompliant = false
          if (order.sla_info?.status === "COMPLIANT" || order.status === "DELIVERED" || order.status === "FULFILLED") {
            isCompliant = true
          } else if (order.sla_info) {
            const targetSeconds = order.sla_info.target_minutes || 300
            const elapsedSeconds = order.sla_info.elapsed_minutes || 0
            isCompliant = elapsedSeconds <= targetSeconds
          }

          if (isCompliant) {
            channelData[channel].sla_compliance++
          }
        }
      })

      return Object.entries(channelData).map(([channel, data]: [string, any]) => ({
        channel,
        orders: data.orders,
        revenue: data.revenue,
        sla_rate: data.total > 0 ? (data.sla_compliance / data.total) * 100 : 0,
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
          revenue: 0,
          sla_compliance: 100
        }))
      }

      // Get today's date in GMT+7
      const today = new Date()
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())
      const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000)

      // Filter orders for today only
      const todayOrders = orders.filter(order => {
        const orderDate = new Date(order.order_date || order.metadata?.created_at)
        return orderDate >= todayStart && orderDate < todayEnd
      })

      // Initialize hourly data
      const hourlyData = Array.from({ length: 24 }, (_, i) => ({
        hour: i.toString().padStart(2, '0') + ':00',
        orders: 0,
        revenue: 0,
        sla_compliant: 0,
        total_orders: 0
      }))

      // Aggregate orders by hour
      todayOrders.forEach(order => {
        const orderDate = new Date(order.order_date || order.metadata?.created_at)
        const hour = orderDate.getHours()
        
        hourlyData[hour].orders++
        hourlyData[hour].revenue += order.total_amount || 0
        hourlyData[hour].total_orders++

        // Check SLA compliance
        if (order.sla_info?.status === "COMPLIANT" || 
            order.status === "DELIVERED" || 
            order.status === "FULFILLED" ||
            (order.sla_info && (order.sla_info.elapsed_minutes || 0) <= (order.sla_info.target_minutes || 300))) {
          hourlyData[hour].sla_compliant++
        }
      })

      // Calculate SLA compliance percentage
      return hourlyData.map(data => ({
        ...data,
        sla_compliance: data.total_orders > 0 ? (data.sla_compliant / data.total_orders) * 100 : 100
      }))

    } catch (err) {
      console.warn("Error fetching hourly order summary:", err)
      return Array.from({ length: 24 }, (_, i) => ({
        hour: i.toString().padStart(2, '0') + ':00',
        orders: 0,
        revenue: 0,
        sla_compliance: 100
      }))
    }
  }

  const fetchTopProducts = async () => {
    try {
      console.log("🔍 Top Products Debug - Using external API directly...")

      // Use the same fetchOrdersFromApi function to get data from external API
      // This ensures consistency with other dashboard widgets
      const orders = await fetchOrdersFromApi()

      console.log("🔍 External API - Total orders for top products:", orders.length)

      if (!orders || orders.length === 0) {
        console.log("⚠️ No orders found from external API")
        return []
      }

      // Aggregate products from order items
      const productMap = {}
      let totalItemsProcessed = 0
      let ordersWithItems = 0

      orders.forEach((order, orderIndex) => {
        if (order.items && Array.isArray(order.items)) {
          ordersWithItems++

          if (orderIndex < 3) {
            console.log(`🔍 Order ${orderIndex + 1} (${order.id}) has ${order.items.length} items`)
          }

          order.items.forEach((item, itemIndex) => {
            totalItemsProcessed++
            const productKey = item.product_sku || item.product_id

            if (orderIndex < 2 && itemIndex < 2) {
              // Log first few items for debugging
              console.log(`🔍 External API Item ${itemIndex + 1} in Order ${orderIndex + 1}:`, {
                product_id: item.product_id,
                product_name: item.product_name,
                product_sku: item.product_sku,
                quantity: item.quantity,
                unit_price: item.unit_price,
                total_price: item.total_price,
                productKey,
                calculated_total: (item.unit_price || 0) * (item.quantity || 0),
              })
            }

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

              if (orderIndex < 2 && itemIndex < 2) {
                console.log(`✅ Added to product ${productKey}: +${quantity} units, +฿${revenue} revenue`)
              }
            } else {
              if (orderIndex < 3) {
                console.log(`⚠️ Item missing product key:`, {
                  product_id: item.product_id,
                  product_sku: item.product_sku,
                  product_name: item.product_name,
                })
              }
            }
          })
        } else {
          if (orderIndex < 3) {
            console.log(`❌ Order ${orderIndex + 1} (${order.id}) has no items or items is not array:`, {
              items: order.items,
              itemsType: typeof order.items,
              isArray: Array.isArray(order.items),
            })
          }
        }
      })

      console.log("🔍 External API Top Products Summary:", {
        ordersWithItems,
        totalItemsProcessed,
        uniqueProducts: Object.keys(productMap).length,
      })

      // Convert to array and sort by revenue
      const result = Object.values(productMap)
      result.sort((a: any, b: any) => b.revenue - a.revenue)

      console.log("🔍 External API Top 5 products by revenue:", result.slice(0, 5))

      // If no real data, return empty array
      if (result.length === 0) {
        console.log("⚠️ No products found after processing external API")
        return []
      }

      return result.slice(0, 5)
    } catch (err) {
      console.warn("Error in fetchTopProducts:", err)
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

  const getProgressColor = (value: number, threshold = 90) => {
    if (value >= threshold) return "bg-green-500"
    if (value >= threshold - 10) return "bg-yellow-500"
    return "bg-red-500"
  }

  const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"]

  if ((isLoading && !isPullRefreshing) || !isMounted) {
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
    <div className="space-y-6 relative" ref={containerRef}>
      {pullToRefreshIndicator}
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Executive Dashboard</h1>
          <p className="text-sm text-muted-foreground">Last 7 days operational insights across all business units</p>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
          <div className="text-xs text-muted-foreground">Last 7 Days</div>
          <Button variant="outline" size="sm" className="min-h-[44px] w-full sm:w-auto">
            All Business Units
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Orders Processing */}
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-3 sm:mb-2">
              <div className="flex justify-between items-start mb-2 sm:mb-0">
                <ShoppingCart className="h-6 w-6 sm:h-5 sm:w-5 text-muted-foreground" />
                <span
                  className={`text-sm sm:text-xs flex items-center sm:hidden ${getChangeClass(kpiData.ordersProcessing.change)}`}
                >
                  {getChangeIcon(kpiData.ordersProcessing.change)}
                  {Math.abs(kpiData.ordersProcessing.change)}%
                </span>
              </div>
              <span
                className={`text-sm sm:text-xs hidden sm:flex items-center ${getChangeClass(kpiData.ordersProcessing.change)}`}
              >
                {getChangeIcon(kpiData.ordersProcessing.change)}
                {Math.abs(kpiData.ordersProcessing.change)}%
              </span>
            </div>
            <div className="text-3xl sm:text-2xl font-bold">{kpiData.ordersProcessing.value.toLocaleString()}</div>
            <div className="text-sm sm:text-xs text-muted-foreground">Orders Processing (7d)</div>
          </CardContent>
        </Card>

        {/* SLA Breaches */}
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-3 sm:mb-2">
              <div className="flex justify-between items-start mb-2 sm:mb-0">
                <AlertTriangle className="h-6 w-6 sm:h-5 sm:w-5 text-red-500" />
                <span
                  className={`text-sm sm:text-xs flex items-center sm:hidden ${getChangeClass(kpiData.slaBreaches.change, true)}`}
                >
                  {getChangeIcon(kpiData.slaBreaches.change)}
                  {kpiData.slaBreaches.change > 0 ? "+" : ""}
                  {kpiData.slaBreaches.change}% vs yesterday
                </span>
              </div>
              <span
                className={`text-sm sm:text-xs hidden sm:flex items-center ${getChangeClass(kpiData.slaBreaches.change, true)}`}
              >
                {getChangeIcon(kpiData.slaBreaches.change)}
                {kpiData.slaBreaches.change > 0 ? "+" : ""}
                {kpiData.slaBreaches.change}% vs yesterday
              </span>
            </div>
            <div className="text-3xl sm:text-2xl font-bold">{kpiData.slaBreaches.value}</div>
            <div className="text-sm sm:text-xs text-muted-foreground">SLA Breaches (7d)</div>
          </CardContent>
        </Card>

        {/* Revenue Today */}
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-3 sm:mb-2">
              <div className="flex justify-between items-start mb-2 sm:mb-0">
                <DollarSign className="h-6 w-6 sm:h-5 sm:w-5 text-muted-foreground" />
                <span
                  className={`text-sm sm:text-xs flex items-center sm:hidden ${getChangeClass(kpiData.revenueToday.change)}`}
                >
                  {getChangeIcon(kpiData.revenueToday.change)}
                  {Math.abs(kpiData.revenueToday.change)}%
                </span>
              </div>
              <span
                className={`text-sm sm:text-xs hidden sm:flex items-center ${getChangeClass(kpiData.revenueToday.change)}`}
              >
                {getChangeIcon(kpiData.revenueToday.change)}
                {Math.abs(kpiData.revenueToday.change)}%
              </span>
            </div>
            <div className="text-3xl sm:text-2xl font-bold">฿{kpiData.revenueToday.value}M</div>
            <div className="text-sm sm:text-xs text-muted-foreground">Revenue (7d)</div>
          </CardContent>
        </Card>

        {/* Avg Processing Time */}
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-3 sm:mb-2">
              <div className="flex justify-between items-start mb-2 sm:mb-0">
                <Clock className="h-6 w-6 sm:h-5 sm:w-5 text-muted-foreground" />
                <span
                  className={`text-sm sm:text-xs flex items-center sm:hidden ${getChangeClass(kpiData.avgProcessingTime.change, true)}`}
                >
                  {getChangeIcon(kpiData.avgProcessingTime.change)}
                  {kpiData.avgProcessingTime.change > 0 ? "+" : ""}
                  {Math.abs(kpiData.avgProcessingTime.change)} min
                </span>
              </div>
              <span
                className={`text-sm sm:text-xs hidden sm:flex items-center ${getChangeClass(kpiData.avgProcessingTime.change, true)}`}
              >
                {getChangeIcon(kpiData.avgProcessingTime.change)}
                {kpiData.avgProcessingTime.change > 0 ? "+" : ""}
                {Math.abs(kpiData.avgProcessingTime.change)} min
              </span>
            </div>
            <div className="text-3xl sm:text-2xl font-bold">{kpiData.avgProcessingTime.value} min</div>
            <div className="text-sm sm:text-xs text-muted-foreground">Avg Processing Time (7d)</div>
          </CardContent>
        </Card>

        {/* Active Orders */}
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-3 sm:mb-2">
              <div className="flex justify-between items-start mb-2 sm:mb-0">
                <Package className="h-6 w-6 sm:h-5 sm:w-5 text-muted-foreground" />
                <span
                  className={`text-sm sm:text-xs flex items-center sm:hidden ${getChangeClass(kpiData.activeOrders.change)}`}
                >
                  {getChangeIcon(kpiData.activeOrders.change)}
                  {Math.abs(kpiData.activeOrders.change)}%
                </span>
              </div>
              <span
                className={`text-sm sm:text-xs hidden sm:flex items-center ${getChangeClass(kpiData.activeOrders.change)}`}
              >
                {getChangeIcon(kpiData.activeOrders.change)}
                {Math.abs(kpiData.activeOrders.change)}%
              </span>
            </div>
            <div className="text-3xl sm:text-2xl font-bold">{kpiData.activeOrders.value.toLocaleString()}</div>
            <div className="text-sm sm:text-xs text-muted-foreground">Active Orders (7d)</div>
          </CardContent>
        </Card>

        {/* Fulfillment Rate */}
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-3 sm:mb-2">
              <div className="flex justify-between items-start mb-2 sm:mb-0">
                <Package className="h-6 w-6 sm:h-5 sm:w-5 text-muted-foreground" />
                <span
                  className={`text-sm sm:text-xs flex items-center sm:hidden ${getChangeClass(kpiData.fulfillmentRate.change)}`}
                >
                  {getChangeIcon(kpiData.fulfillmentRate.change)}
                  {Math.abs(kpiData.fulfillmentRate.change)}%
                </span>
              </div>
              <span
                className={`text-sm sm:text-xs hidden sm:flex items-center ${getChangeClass(kpiData.fulfillmentRate.change)}`}
              >
                {getChangeIcon(kpiData.fulfillmentRate.change)}
                {Math.abs(kpiData.fulfillmentRate.change)}%
              </span>
            </div>
            <div className="text-3xl sm:text-2xl font-bold">{kpiData.fulfillmentRate.value}%</div>
            <div className="text-sm sm:text-xs text-muted-foreground">Fulfillment Rate (7d)</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
        <div className="relative">
          {swipeIndicator}
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="fulfillment">Fulfillment</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>
        </div>

        <div ref={tabsContainerRef} className="relative" {...swipeProps}>
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Order Volume by Channel */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-2">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <BarChart2 className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-base font-semibold">Order Volume by Channel</h3>
                        <p className="text-xs text-muted-foreground">Last 7 days orders per channel</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {channelVolume.map((item, index) => {
                      const maxOrders = Math.max(...channelVolume.map((c) => c.orders || 0))
                      const percentage = maxOrders > 0 ? ((item.orders || 0) / maxOrders) * 100 : 0
                      const channelColors = {
                        0: { bg: "bg-green-500", light: "bg-green-100", icon: "🟢" },
                        1: { bg: "bg-blue-500", light: "bg-blue-100", icon: "🔵" },
                        2: { bg: "bg-orange-500", light: "bg-orange-100", icon: "🟠" },
                        3: { bg: "bg-gray-500", light: "bg-gray-100", icon: "⚫" },
                      }
                      const color = channelColors[index] || channelColors[3]

                      return (
                        <div key={index} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <span className="text-lg">{color.icon}</span>
                              <span className="text-sm font-medium">
                                {item.channel.charAt(0) + item.channel.slice(1).toLowerCase()}
                              </span>
                            </div>
                            <div className="text-right">
                              <span className="text-sm font-semibold">{item.orders.toLocaleString()}</span>
                              <span className="text-xs text-muted-foreground ml-1">orders</span>
                            </div>
                          </div>
                          <div className="relative">
                            <div className={`h-8 ${color.light} rounded-full overflow-hidden`}>
                              <div
                                className={`h-full ${color.bg} rounded-full transition-all duration-500 ease-out flex items-center justify-end pr-2`}
                                style={{ width: `${isNaN(percentage) ? 0 : percentage}%` }}
                              >
                                <span className="text-xs text-white font-medium">
                                  {(isNaN(percentage) ? 0 : percentage).toFixed(0)}%
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  <div className="mt-6 pt-4 border-t">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Total Orders (7d)</span>
                      <span className="font-semibold">
                        {channelVolume.reduce((sum, item) => sum + item.orders, 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Order Alerts */}
              <Card>
                <CardContent className="p-4 overflow-y-auto" style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-y' }}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <AlertCircle className="h-4 w-4 mr-2 text-red-500" />
                      <h3 className="text-sm font-medium">Order Alerts</h3>
                    </div>
                    <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                      {orderAlerts.length + approachingSla.length} Active Alerts
                    </span>
                  </div>

                  {(orderAlerts.length > 0 || approachingSla.length > 0) && (
                    <div className="mb-4">
                      <div className="flex items-center mb-2">
                        <AlertTriangle className="h-4 w-4 mr-2 text-red-500" />
                        <span className="text-xs font-bold text-red-800 bg-red-100 px-2 py-1 rounded">
                          {orderAlerts.length > 0 ? "SLA BREACH" : "SLA WARNING"}
                        </span>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="ml-auto text-xs h-6"
                          onClick={handleEscalation}
                          disabled={isEscalating || (orderAlerts.length === 0 && approachingSla.length === 0)}
                        >
                          {isEscalating ? "Escalating..." : "Escalate"}
                        </Button>
                      </div>
                      {orderAlerts.slice(0, 5).map((alert, index) => (
                        <div key={index} className="border-l-2 border-red-500 pl-3 py-1 ml-1 text-xs">
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            <div>
                              <div className="text-muted-foreground">Order:</div>
                              <div>{alert.order_number}</div>
                            </div>
                            <div>
                              <div className="text-muted-foreground">Customer:</div>
                              <div>{alert.customer_name}</div>
                            </div>
                            <div>
                              <div className="text-muted-foreground">Channel:</div>
                              <div>{alert.channel}</div>
                            </div>
                            <div>
                              <div className="text-muted-foreground">Location:</div>
                              <div>{alert.location}</div>
                            </div>
                            <div>
                              <div className="text-muted-foreground">Target:</div>
                              <div>{Math.round(alert.target_minutes / 60)} min</div>
                            </div>
                            <div>
                              <div className="text-muted-foreground">Elapsed:</div>
                              <div className="text-red-600 font-medium">
                                {Math.round(alert.elapsed_minutes / 60)} min
                              </div>
                            </div>
                            <div>
                              <div className="text-muted-foreground">Time Left:</div>
                              <div className="text-red-600 font-medium">
                                {(() => {
                                  const timeLeft = Math.round((alert.target_minutes - alert.elapsed_minutes) / 60)
                                  return timeLeft <= 0 ? `${Math.abs(timeLeft)} min over` : `${timeLeft} min`
                                })()}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      {orderAlerts.length > 5 && (
                        <div className="mt-3 pt-3 border-t border-red-200">
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full text-xs h-8 text-red-600 border-red-200 hover:bg-red-50"
                            onClick={() => {
                              // Navigate to full orders page with filter
                              window.location.href = '/orders?filter=sla-breach';
                            }}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            View All {orderAlerts.length} SLA Breach Orders
                          </Button>
                        </div>
                      )}
                    </div>
                  )}

                  <div>
                    <div className="flex items-center mb-2">
                      <Clock className="h-4 w-4 mr-2 text-yellow-500" />
                      <span className="text-xs font-bold text-yellow-800 bg-yellow-100 px-2 py-1 rounded">
                        APPROACHING SLA ({approachingSla.length})
                      </span>
                    </div>
                    <div className="border-l-2 border-yellow-500 pl-2 sm:pl-3 py-1 ml-1">
                      {approachingSla.length > 0 ? (
                        <div className="space-y-2">
                          {approachingSla.slice(0, 5).map((item, index) => (
                            <div
                              key={index}
                              className="bg-yellow-50 border border-yellow-200 rounded-lg p-2 sm:p-3 hover:bg-yellow-100 transition-colors touch-manipulation"
                              style={{ WebkitOverflowScrolling: 'touch' }}
                            >
                              {/* Mobile layout: stacked */}
                              <div className="flex flex-col space-y-2 sm:hidden">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-1">
                                    <Clock className="h-3 w-3 text-yellow-600 flex-shrink-0" />
                                    <span className="text-xs font-medium text-yellow-900 truncate">
                                      {item.order_number}
                                    </span>
                                  </div>
                                  <div
                                    className={`w-2 h-2 rounded-full flex-shrink-0 ${
                                      item.remaining <= 300
                                        ? "bg-red-500 animate-pulse"
                                        : item.remaining <= 600
                                          ? "bg-yellow-500"
                                          : "bg-yellow-400"
                                    }`}
                                  />
                                </div>
                                <div className="flex items-center justify-between">
                                  <div className="text-xs text-yellow-700">
                                    <ChannelBadge channel={item.channel} />
                                  </div>
                                  <div className="text-right">
                                    <span className="text-xs font-bold text-yellow-800">
                                      {Math.round(item.remaining / 60)} min remaining
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Desktop layout: horizontal */}
                              <div className="hidden sm:flex items-center justify-between">
                                <div className="flex items-center space-x-3 min-w-0 flex-1">
                                  <div className="flex items-center space-x-1 min-w-0">
                                    <Clock className="h-3 w-3 text-yellow-600 flex-shrink-0" />
                                    <span className="text-xs font-medium text-yellow-900 truncate">
                                      {item.order_number}
                                    </span>
                                  </div>
                                  <div className="text-xs text-yellow-700 flex-shrink-0">
                                    <ChannelBadge channel={item.channel} />
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2 flex-shrink-0">
                                  <div className="text-right">
                                    <div className="text-xs font-bold text-yellow-800">
                                      {Math.round(item.remaining / 60)} min
                                    </div>
                                    <div className="text-xs text-yellow-600">remaining</div>
                                  </div>
                                  <div
                                    className={`w-2 h-2 rounded-full ${
                                      item.remaining <= 300
                                        ? "bg-red-500 animate-pulse"
                                        : item.remaining <= 600
                                          ? "bg-yellow-500"
                                          : "bg-yellow-400"
                                    }`}
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        {approachingSla.length > 5 && (
                          <div className="mt-3 pt-3 border-t border-yellow-200">
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full text-xs h-8 text-yellow-600 border-yellow-200 hover:bg-yellow-50"
                              onClick={() => {
                                // Navigate to full orders page with filter
                                window.location.href = '/orders?filter=approaching-sla';
                              }}
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              View All {approachingSla.length} Approaching SLA Orders
                            </Button>
                          </div>
                        )}
                      ) : (
                        <div className="text-xs text-muted-foreground py-2">No orders approaching SLA deadline</div>
                      )}
                    </div>
                  </div>

                  {/* Test Escalation Button - Always visible for testing */}
                  {orderAlerts.length === 0 && approachingSla.length === 0 && (
                    <div className="mb-4">
                      <div className="flex items-center mb-2">
                        <AlertTriangle className="h-4 w-4 mr-2 text-gray-500" />
                        <span className="text-xs font-bold text-gray-800 bg-gray-100 px-2 py-1 rounded">
                          TEST ESCALATION
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          className="ml-auto text-xs h-6"
                          onClick={handleTestEscalation}
                          disabled={isEscalating}
                        >
                          {isEscalating ? "Testing..." : "Test Escalation"}
                        </Button>
                      </div>
                      <div className="text-xs text-gray-500 pl-3">
                        No active alerts. Click to test webhook functionality.
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Order Processing Performance */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center mb-4">
                    <Clock className="h-4 w-4 mr-2" />
                    <h3 className="text-sm font-medium">Order Processing Performance</h3>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-xs text-muted-foreground mb-2">Average Processing Time (minutes)</h4>
                      <div className="space-y-2">
                        {processingTimes.map((item, index) => (
                          <div key={index} className="flex justify-between items-center">
                            <span className="text-xs">
                              {item.channel.charAt(0) + item.channel.slice(1).toLowerCase()}
                            </span>
                            <span className="text-xs font-medium">{item.minutes.toFixed(1)} min</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs text-muted-foreground mb-2">Order Fulfillment Rate</h4>
                      <div className="relative h-32 w-32 mx-auto">
                        <svg className="w-full h-full" viewBox="0 0 100 100">
                          <circle
                            className="text-gray-200"
                            strokeWidth="8"
                            stroke="currentColor"
                            fill="transparent"
                            r="40"
                            cx="50"
                            cy="50"
                          />
                          <circle
                            className="text-green-500"
                            strokeWidth="8"
                            strokeLinecap="round"
                            stroke="currentColor"
                            fill="transparent"
                            r="40"
                            cx="50"
                            cy="50"
                            strokeDasharray={`${(kpiData.fulfillmentRate.value / 100) * 251.2} 251.2`}
                            strokeDashoffset="0"
                            transform="rotate(-90 50 50)"
                          />
                        </svg>
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                          <p className="text-xl font-bold">{kpiData.fulfillmentRate.value}%</p>
                        </div>
                      </div>
                      <p className="text-xs text-center mt-2 text-muted-foreground">Target: 98%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* SLA Compliance by Channel */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center mb-4">
                    <Clock className="h-4 w-4 mr-2" />
                    <h3 className="text-sm font-medium">SLA Compliance by Channel</h3>
                  </div>

                  <div className="space-y-4">
                    {slaCompliance.map((item, index) => (
                      <div key={index}>
                        <div className="flex justify-between text-sm mb-1">
                          <span>{item.channel.charAt(0) + item.channel.slice(1).toLowerCase()}</span>
                          <div className="text-right">
                            {item.compliance !== null ? (
                              <>
                                <span className="font-medium">{item.compliance.toFixed(1)}%</span>
                                <div className="text-xs text-muted-foreground">
                                  {item.compliant}/{item.total} orders
                                </div>
                              </>
                            ) : (
                              <span className="text-xs text-muted-foreground">No data</span>
                            )}
                          </div>
                        </div>
                        {item.compliance !== null ? (
                          <Progress
                            value={item.compliance}
                            className="h-2 bg-gray-100"
                            indicatorClassName={getProgressColor(item.compliance)}
                          />
                        ) : (
                          <div className="h-2 bg-gray-100 rounded-full">
                            <div className="h-full bg-gray-300 rounded-full flex items-center justify-center">
                              <span className="text-xs text-gray-500">No orders</span>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="orders" className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h3 className="text-lg font-medium">Recent Orders (Last 7 Days)</h3>
              <div className="flex flex-col sm:flex-row gap-2 sm:space-x-2 w-full sm:w-auto">
                <Button variant="outline" size="sm" className="min-h-[44px] w-full sm:w-auto">
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
                <Button variant="outline" size="sm" className="min-h-[44px] w-full sm:w-auto">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
                <Button variant="outline" size="sm" className="min-h-[44px] w-full sm:w-auto">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>

            <Card>
              <CardContent className="p-4 overflow-x-auto">
                <div className="min-w-[640px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Order Number</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Channel</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentOrders.length > 0 ? (
                        recentOrders.map((order, index) => {
                          const swipeActions = [
                            {
                              id: "view",
                              label: "View",
                              icon: <Eye className="h-4 w-4" />,
                              className: "bg-blue-500 text-white",
                              onAction: () => {
                                toast({
                                  title: "View Order",
                                  description: `Opening order ${order.order_no}`,
                                })
                              },
                            },
                            {
                              id: "edit",
                              label: "Edit",
                              icon: <Edit className="h-4 w-4" />,
                              className: "bg-green-500 text-white",
                              onAction: () => {
                                toast({
                                  title: "Edit Order",
                                  description: `Editing order ${order.order_no}`,
                                })
                              },
                            },
                          ]

                          return (
                            <SwipeableListItem key={index} actions={swipeActions}>
                              <TableRow className="hover:bg-gray-50">
                                <TableCell className="font-medium font-mono text-xs">{order.order_number}</TableCell>
                                <TableCell className="font-medium">{order.order_no}</TableCell>
                                <TableCell>{order.customer}</TableCell>
                                <TableCell>
                                  <ChannelBadge channel={order.channel} />
                                </TableCell>
                                <TableCell>
                                  <OrderStatusBadge status={order.status} />
                                </TableCell>
                                <TableCell>{order.total}</TableCell>
                                <TableCell>{order.date}</TableCell>
                              </TableRow>
                            </SwipeableListItem>
                          )
                        })
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">
                            No orders found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Daily Order Volume (Last 7 Days)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[200px] sm:h-[250px] lg:h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dailyOrders}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="GRAB" stackId="a" fill="#10b981" name="Grab" />
                      <Bar dataKey="LAZADA" stackId="a" fill="#3b82f6" name="Lazada" />
                      <Bar dataKey="SHOPEE" stackId="a" fill="#f59e0b" name="Shopee" />
                      <Bar dataKey="TIKTOK" stackId="a" fill="#6b7280" name="TikTok" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="fulfillment" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Fulfillment by Branch</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {fulfillmentByBranch.length > 0 ? (
                      fulfillmentByBranch.map((branch, index) => (
                        <div key={index}>
                          <div className="flex justify-between mb-1">
                            <span>{branch.branch}</span>
                            <span className="font-medium">{branch.rate.toFixed(1)}%</span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-2.5">
                            <div
                              className={`h-2.5 rounded-full ${getProgressColor(branch.rate)}`}
                              style={{ width: `${branch.rate}%` }}
                            ></div>
                          </div>
                          <div className="flex justify-between text-xs text-muted-foreground mt-1">
                            <span>{branch.fulfilled} fulfilled</span>
                            <span>{branch.total} total</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <p>No fulfillment data available</p>
                        <p className="text-xs mt-1">Data will appear when orders are processed</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Channel Performance</span>
                    <span className="text-sm text-muted-foreground">Today</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Performance Summary Cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                      {channelPerformance.map((channel, index) => (
                        <div key={channel.channel} className="bg-gray-50 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <ChannelBadge channel={channel.channel} />
                            <div className={`text-xs px-2 py-1 rounded-full ${
                              channel.sla_rate >= 95 ? 'bg-green-100 text-green-800' :
                              channel.sla_rate >= 85 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {channel.sla_rate.toFixed(1)}% SLA
                            </div>
                          </div>
                          <div className="space-y-1">
                            <div className="flex justify-between">
                              <span className="text-xs text-muted-foreground">Orders</span>
                              <span className="text-sm font-medium">{channel.orders}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-xs text-muted-foreground">Revenue</span>
                              <span className="text-sm font-medium">฿{(channel.revenue || 0).toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Performance Chart */}
                    <div className="h-[200px] sm:h-[250px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={channelPerformance}
                          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="channel" />
                          <YAxis yAxisId="left" orientation="left" />
                          <YAxis yAxisId="right" orientation="right" />
                          <Tooltip 
                            formatter={(value, name, props) => [
                              name === 'orders' ? value : name === 'revenue' ? `฿${value.toLocaleString()}` : `${value.toFixed(1)}%`,
                              name === 'orders' ? 'Orders' : name === 'revenue' ? 'Revenue' : 'SLA Compliance'
                            ]}
                          />
                          <Legend />
                          <Bar yAxisId="left" dataKey="orders" fill="#3b82f6" name="Orders" />
                          <Bar yAxisId="right" dataKey="sla_rate" fill="#10b981" name="SLA Compliance %" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Fulfillment Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="flex flex-col items-center">
                    <div className="text-2xl font-bold text-green-600">{kpiData.fulfillmentRate.value}%</div>
                    <div className="text-sm text-muted-foreground">Overall Fulfillment Rate (7d)</div>
                    <div className={`text-xs mt-1 ${getChangeClass(kpiData.fulfillmentRate.change)} flex items-center`}>
                      {getChangeIcon(kpiData.fulfillmentRate.change)}
                      {kpiData.fulfillmentRate.change > 0 ? "+" : ""}
                      {kpiData.fulfillmentRate.change}% from last period
                    </div>
                  </div>

                  <div className="flex flex-col items-center">
                    <div className="text-2xl font-bold text-blue-600">{kpiData.avgProcessingTime.value} min</div>
                    <div className="text-sm text-muted-foreground">Avg Processing Time (7d)</div>
                    <div
                      className={`text-xs mt-1 ${getChangeClass(kpiData.avgProcessingTime.change, true)} flex items-center`}
                    >
                      {getChangeIcon(kpiData.avgProcessingTime.change)}
                      {kpiData.avgProcessingTime.change > 0 ? "+" : ""}
                      {Math.abs(kpiData.avgProcessingTime.change)} min from last period
                    </div>
                  </div>

                  <div className="flex flex-col items-center">
                    <div className="text-2xl font-bold text-yellow-600">{kpiData.slaBreaches.value}</div>
                    <div className="text-sm text-muted-foreground">SLA Breaches (7d)</div>
                    <div
                      className={`text-xs mt-1 ${getChangeClass(kpiData.slaBreaches.change, true)} flex items-center`}
                    >
                      {getChangeIcon(kpiData.slaBreaches.change)}
                      {kpiData.slaBreaches.change > 0 ? "+" : ""}
                      {kpiData.slaBreaches.change}% from yesterday
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Hourly Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Order Summary by Hour</span>
                  <span className="text-sm text-muted-foreground">Today</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Current Hour Summary */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-blue-50 rounded-lg">
                    {(() => {
                      const currentHour = new Date().getHours()
                      const currentHourData = hourlyOrderSummary.find(h => h.hour === currentHour.toString().padStart(2, '0') + ':00') || 
                                               { orders: 0, revenue: 0, sla_compliance: 100 }
                      return (
                        <>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">{currentHour.toString().padStart(2, '0')}:00</div>
                            <div className="text-xs text-muted-foreground">Current Hour</div>
                          </div>
                          <div className="text-center">
                            <div className="text-xl font-bold">{currentHourData.orders}</div>
                            <div className="text-xs text-muted-foreground">Orders</div>
                          </div>
                          <div className="text-center">
                            <div className="text-xl font-bold">฿{(currentHourData.revenue || 0).toLocaleString()}</div>
                            <div className="text-xs text-muted-foreground">Revenue</div>
                          </div>
                          <div className="text-center">
                            <div className={`text-xl font-bold ${
                              currentHourData.sla_compliance >= 95 ? 'text-green-600' :
                              currentHourData.sla_compliance >= 85 ? 'text-yellow-600' : 'text-red-600'
                            }`}>
                              {currentHourData.sla_compliance.toFixed(1)}%
                            </div>
                            <div className="text-xs text-muted-foreground">SLA</div>
                          </div>
                        </>
                      )
                    })()}
                  </div>

                  {/* Hourly Chart */}
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={hourlyOrderSummary}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="hour" 
                          tick={{ fontSize: 12 }}
                          interval={3}
                        />
                        <YAxis yAxisId="left" orientation="left" />
                        <YAxis yAxisId="right" orientation="right" />
                        <Tooltip 
                          formatter={(value, name) => [
                            name === 'orders' ? value : 
                            name === 'revenue' ? `฿${value.toLocaleString()}` : 
                            `${value.toFixed(1)}%`,
                            name === 'orders' ? 'Orders' : 
                            name === 'revenue' ? 'Revenue' : 
                            'SLA Compliance'
                          ]}
                          labelFormatter={(hour) => `Time: ${hour}`}
                        />
                        <Legend />
                        <Bar yAxisId="left" dataKey="orders" fill="#3b82f6" name="Orders" />
                        <Bar yAxisId="right" dataKey="sla_compliance" fill="#10b981" name="SLA Compliance %" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Top Products</CardTitle>
                </CardHeader>
                <CardContent className="overflow-x-auto">
                  <div className="min-w-[480px]">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Product</TableHead>
                          <TableHead>SKU</TableHead>
                          <TableHead className="text-right">Units</TableHead>
                          <TableHead className="text-right">Revenue</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {topProducts.length > 0 ? (
                          topProducts.map((product, index) => (
                            <TableRow key={index}>
                              <TableCell className="font-medium">{product.name}</TableCell>
                              <TableCell>{product.sku}</TableCell>
                              <TableCell className="text-right">{product.units.toLocaleString()}</TableCell>
                              <TableCell className="text-right">฿{product.revenue.toLocaleString()}</TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                              <div>
                                <p>No product data available</p>
                                <p className="text-xs mt-1">Data will appear when orders contain product information</p>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Revenue by Category</CardTitle>
                </CardHeader>
                <CardContent>
                  {revenueByCategory.length > 0 ? (
                    <div className="h-[200px] sm:h-[250px] lg:h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={revenueByCategory}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {revenueByCategory.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => `฿${value.toLocaleString()}`} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="h-[200px] sm:h-[250px] lg:h-[300px] flex items-center justify-center text-muted-foreground">
                      <div className="text-center">
                        <p>No category data available</p>
                        <p className="text-xs mt-1">Data will appear when orders contain product categories</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Revenue Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[200px] sm:h-[250px] lg:h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={dailyOrders}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip formatter={(value) => `฿${value.toLocaleString()}`} />
                      <Legend />
                      <Line type="monotone" dataKey="total" stroke="#10b981" name="Revenue" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
