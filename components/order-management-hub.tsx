"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { formatGMT7TimeString, getGMT7Time, formatGMT7DateTime } from "@/lib/utils"
import { formatBangkokTime, formatBangkokDateTime } from "@/lib/timezone-utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  ChannelBadge,
  PaymentStatusBadge,
  OrderStatusBadge,
  OnHoldBadge,
  ReturnStatusBadge,
  SLABadge,
} from "./order-badges"
import { OrderDetailView } from "./order-detail-view"
import { RefreshCw, X, Filter, Loader2, AlertCircle, Download, Search } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { EnhancedFilterPanel, type AdvancedFilterValues } from "./enhanced-filter-panel"
import { PaginationControls } from "./pagination-controls"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// Exact API response types based on the actual API structure
export interface ApiCustomer {
  id: string
  name: string
  email: string
  phone: string
  T1Number: string
}

export interface ApiShippingAddress {
  street: string
  city: string
  state: string
  postal_code: string
  country: string
}

export interface ApiPaymentInfo {
  method: string
  status: string
  transaction_id: string
}

export interface ApiSLAInfo {
  target_minutes: number
  elapsed_minutes: number
  status: string
}

export interface ApiMetadata {
  created_at: string
  updated_at: string
  priority: string
  store_name: string
}

export interface ApiProductDetails {
  description: string
  category: string
  brand: string
}

export interface ApiOrderItem {
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

// Standardized internal order format
// Refactored Order interface to match API payload
export interface Order {
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
  // Optionally add derived fields for UI only if needed
}

// Pagination parameters interface
interface PaginationParams {
  page: number
  pageSize: number
}

// Filter parameters interface
interface FilterParams {
  searchTerm?: string
  status?: string
  channel?: string
  priority?: string
  slaFilter?: "all" | "near-breach" | "breach"
  advancedFilters?: AdvancedFilterValues
}

// Precise data mapping function based on actual API structure
const mapApiResponseToOrders = (apiResponse: ApiResponse): { orders: Order[]; pagination: ApiPagination } => {
  try {
    console.log("🔄 Mapping API response to internal format...")
    console.log("API Response structure:", {
      dataLength: apiResponse.data?.length || 0,
      pagination: apiResponse.pagination,
      sampleOrder: apiResponse.data?.[0] || null,
    })

    if (!apiResponse.data || !Array.isArray(apiResponse.data)) {
      console.log("⚠️ No valid orders array found in API response")
      return {
        orders: [],
        pagination: apiResponse.pagination || {
          page: 1,
          pageSize: 10,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false,
        },
      }
    }

    const orders = apiResponse.data

    console.log(`🔄 Processing ${orders.length} orders from API...`)

    // Directly return the API structure for each order
    const mappedOrders = orders.map((apiOrder: ApiOrder) => ({ ...apiOrder }))

    return { orders: mappedOrders, pagination: apiResponse.pagination }
  } catch (error) {
    console.error("❌ Error mapping API response:", error)
    throw new Error(`Failed to map API response: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

// Enhanced API client with pagination support
const fetchOrdersFromApi = async (
  paginationParams: PaginationParams,
  filterParams?: FilterParams,
): Promise<{ orders: Order[]; pagination: ApiPagination }> => {
  try {
    console.log("🔄 Attempting to fetch orders from API endpoint...")
    console.log("Pagination params:", paginationParams)
    console.log("Filter params:", filterParams)

    // Build query parameters
    const queryParams = new URLSearchParams({
      page: paginationParams.page.toString(),
      pageSize: paginationParams.pageSize.toString(),
    })

    // Add filter parameters if provided
    if (filterParams?.searchTerm) {
      queryParams.set("search", filterParams.searchTerm)
    }
    if (filterParams?.status && filterParams.status !== "all-status") {
      queryParams.set("status", filterParams.status)
    }
    if (filterParams?.channel && filterParams.channel !== "all-channels") {
      queryParams.set("channel", filterParams.channel)
    }
    
    // Add advanced filter parameters
    if (filterParams?.advancedFilters) {
      const af = filterParams.advancedFilters
      if (af.orderNumber) queryParams.set("orderNumber", af.orderNumber)
      if (af.customerName) queryParams.set("customerName", af.customerName)
      if (af.phoneNumber) queryParams.set("phoneNumber", af.phoneNumber)
      if (af.email) queryParams.set("email", af.email)
      if (af.exceedSLA) queryParams.set("exceedSLA", "true")
      if (af.fulfillmentLocationId) queryParams.set("location", af.fulfillmentLocationId)
      if (af.items) queryParams.set("items", af.items)
      if (af.paymentStatus && af.paymentStatus !== "all-payment") {
        queryParams.set("paymentStatus", af.paymentStatus)
      }
      // Handle date filters
      if (af.orderDateFrom && af.orderDateTo) {
        // Override the default wide date range with user-selected dates
        queryParams.set("dateFrom", af.orderDateFrom.toISOString().split('T')[0])
        queryParams.set("dateTo", af.orderDateTo.toISOString().split('T')[0])
      }
    }
    
    // For Order Management Hub - fetch ALL orders by setting a very wide date range
    // This will override the 7-day default in the API route
    // UNLESS user has explicitly set date filters
    if (!filterParams?.advancedFilters?.orderDateFrom && !filterParams?.advancedFilters?.orderDateTo) {
      const farPastDate = new Date('2020-01-01').toISOString().split('T')[0]
      const farFutureDate = new Date('2030-12-31').toISOString().split('T')[0]
      queryParams.set("dateFrom", farPastDate)
      queryParams.set("dateTo", farFutureDate)
    }

    // Try server-side API route first (bypasses CORS)
    const proxyResponse = await fetch(`/api/orders/external?${queryParams.toString()}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    console.log("Proxy response status:", proxyResponse.status)

    if (proxyResponse.ok) {
      const proxyData = await proxyResponse.json()
      console.log("Proxy response data structure:", {
        success: proxyData.success,
        hasData: !!proxyData.data,
        dataType: typeof proxyData.data,
      })

      if (proxyData.success && proxyData.data) {
        console.log("✅ Successfully fetched via server proxy")
        return mapApiResponseToOrders(proxyData.data)
      } else if (proxyData.fallback) {
        console.log("⚠️ Server proxy indicated fallback needed:", proxyData.error)
        // Check for authentication error
        if (proxyData.error?.includes('authentication') || proxyData.error?.includes('401')) {
          throw new Error("Authentication failed. Please check API credentials in environment variables.")
        }
        throw new Error(proxyData.error || "Server proxy fallback")
      }
    } else if (proxyResponse.status === 401) {
      throw new Error("Authentication failed. Please check API credentials.")
    } else if (proxyResponse.status === 404) {
      throw new Error("API endpoint not found. Please check the API configuration.")
    }

    // Fallback to direct client-side fetch
    console.log("🔄 Trying direct client-side fetch as fallback...")

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 15000)

    const apiUrl = `https://dev-pmpapis.central.co.th/pmp/v2/grabmart/v1/merchant/orders?${queryParams.toString()}`
    const directResponse = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!directResponse.ok) {
      throw new Error(`Direct API error: ${directResponse.status} - ${directResponse.statusText}`)
    }

    const directData: ApiResponse = await directResponse.json()
    console.log("✅ Direct fetch successful")

    return mapApiResponseToOrders(directData)
  } catch (error) {
    console.error("❌ All fetch attempts failed:", error)

    if (error instanceof Error) {
      if (error.name === "AbortError") {
        throw new Error("Request timeout - API took too long to respond (15s)")
      } else if (error.message.includes("CORS") || error.message.includes("cors")) {
        throw new Error("CORS error - API access blocked by browser security policy")
      } else if (error.message.includes("Failed to fetch")) {
        throw new Error("Network error - Unable to reach API endpoint. Check network connectivity.")
      }
    }

    throw error
  }
}

export function OrderManagementHub() {
  // Track client mount to avoid hydration mismatch
  const [isMounted, setIsMounted] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<string>("")

  useEffect(() => {
    setIsMounted(true)
    // Set initial timestamp only after client mount
    const updateTimestamp = () => {
      setLastUpdated(formatGMT7TimeString())
    }
    updateTimestamp()

    // Cleanup function to restore body scroll when component unmounts
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [])
  // Filter states
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all-status")
  const [channelFilter, setChannelFilter] = useState("all-channels")
  const [activeSlaFilter, setActiveSlaFilter] = useState<"all" | "near-breach" | "breach">("all")
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilterValues>({
    orderNumber: "",
    customerName: "",
    phoneNumber: "",
    email: "",
    orderDateFrom: undefined,
    orderDateTo: undefined,
    orderStatus: "all-status",
    exceedSLA: false,
    sellingChannel: "all-channels",
    paymentStatus: "all-payment",
    fulfillmentLocationId: "",
    items: "",
  })

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  // Set default page size to 25
  const [pageSize, setPageSize] = useState(25)
  const [pagination, setPagination] = useState<ApiPagination>({
    page: 1,
    pageSize: 25,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  })

  // SLA Filter Handler
  const handleSlaFilterChange = (filterValue: "all" | "near-breach" | "breach") => {
    setActiveSlaFilter(filterValue)
    setCurrentPage(1) // Reset to first page when SLA filter changes
  }

  // Order Detail Click Handler
  const handleOrderRowClick = (order: Order) => {
    const fullOrderData = ordersData.find((o) => o.id === order.id) // Ensure we pass the full original order object
    if (fullOrderData) {
      setSelectedOrderForDetail(fullOrderData)
      setIsDetailViewOpen(true)
      // Disable body scroll when modal opens
      document.body.style.overflow = "hidden"
    }
  }

  // Close Order Detail View
  const handleCloseDetailView = () => {
    setIsDetailViewOpen(false)
    setSelectedOrderForDetail(null)
    // Re-enable body scroll when modal closes
    document.body.style.overflow = "unset"
  }

  // Data states
  const [ordersData, setOrdersData] = useState<Order[]>([])

  // Order Detail View states
  const [selectedOrderForDetail, setSelectedOrderForDetail] = useState<Order | null>(null)
  const [isDetailViewOpen, setIsDetailViewOpen] = useState(false)

  // Loading and error states
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  // State for fetch all mode
  const [fetchAllMode, setFetchAllMode] = useState(false)
  const [fetchingAllProgress, setFetchingAllProgress] = useState({ current: 0, total: 0 })

  // Fetch all orders across all pages
  const fetchAllOrders = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    setFetchingAllProgress({ current: 0, total: 0 })
    
    try {
      const allOrders: Order[] = []
      let currentFetchPage = 1
      let hasMorePages = true
      let totalPages = 0
      
      // Merge all filter values for API request
      const mergedFilters: FilterParams = {
        searchTerm,
        status: statusFilter,
        channel: channelFilter,
        slaFilter: activeSlaFilter,
        advancedFilters: advancedFilters
      }
      
      // Loop through all pages
      while (hasMorePages) {
        console.log(`📄 Fetching page ${currentFetchPage}...`)
        
        const { orders, pagination: apiPagination } = await fetchOrdersFromApi(
          { page: currentFetchPage, pageSize: 100 }, // Use larger page size for efficiency
          mergedFilters,
        )
        
        allOrders.push(...orders)
        totalPages = apiPagination.totalPages
        hasMorePages = apiPagination.hasNext
        
        // Update progress
        setFetchingAllProgress({ current: currentFetchPage, total: totalPages })
        
        // Move to next page
        currentFetchPage++
        
        // Safety check to prevent infinite loops
        if (currentFetchPage > 1000) {
          console.warn("⚠️ Safety limit reached: stopping at 1000 pages")
          break
        }
      }
      
      console.log(`✅ Fetched all ${allOrders.length} orders across ${currentFetchPage - 1} pages`)
      
      // Update state with all orders
      setOrdersData(allOrders)
      setPagination({
        page: 1,
        pageSize: allOrders.length,
        total: allOrders.length,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      })
      
      // Only update timestamp on client side
      if (typeof window !== "undefined") {
        setLastUpdated(formatGMT7TimeString())
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch all orders")
      setOrdersData([])
      setPagination({
        page: 1,
        pageSize,
        total: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false,
      })
    } finally {
      setIsLoading(false)
      setFetchingAllProgress({ current: 0, total: 0 })
    }
  }, [pageSize, searchTerm, statusFilter, channelFilter, activeSlaFilter, advancedFilters])

  // Regular single page fetch
  const fetchOrders = useCallback(async () => {
    // If in fetch all mode, fetch all pages
    if (fetchAllMode) {
      return fetchAllOrders()
    }
    
    setIsLoading(true)
    setError(null)
    try {
      // Merge all filter values for API request
      const mergedFilters: FilterParams = {
        searchTerm,
        status: statusFilter,
        channel: channelFilter,
        slaFilter: activeSlaFilter,
        advancedFilters: advancedFilters
      }
      const { orders, pagination: apiPagination } = await fetchOrdersFromApi(
        { page: currentPage, pageSize },
        mergedFilters,
      )
      setOrdersData(orders)
      setPagination(apiPagination)

      // Only update timestamp on client side
      if (typeof window !== "undefined") {
        setLastUpdated(formatGMT7TimeString())
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch orders")
      setOrdersData([])
      setPagination({
        page: 1,
        pageSize,
        total: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false,
      })
    } finally {
      setIsLoading(false)
    }
  }, [currentPage, pageSize, searchTerm, statusFilter, channelFilter, activeSlaFilter, advancedFilters, fetchAllMode, fetchAllOrders])

  // Initial fetch & refetch on filters/pagination change
  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  // Handle escape key to close order detail modal
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isDetailViewOpen) {
        handleCloseDetailView()
      }
    }

    if (isDetailViewOpen) {
      document.addEventListener("keydown", handleEscapeKey)
      return () => {
        document.removeEventListener("keydown", handleEscapeKey)
      }
    }
  }, [isDetailViewOpen])

  // Refresh handler
  const refreshData = () => {
    fetchOrders()
  }

  // Remove individual filter
  const removeFilter = (filter: string) => {
    if (filter.startsWith("Search:")) {
      setSearchTerm("")
    } else if (filter.startsWith("Status:")) {
      setStatusFilter("all-status")
    } else if (filter.startsWith("Channel:")) {
      setChannelFilter("all-channels")
    } else if (filter.startsWith("SLA:")) {
      setActiveSlaFilter("all")
    } else if (filter.startsWith("Order:")) {
      setAdvancedFilters((prev) => ({ ...prev, orderNumber: "" }))
    } else if (filter.startsWith("Customer:")) {
      setAdvancedFilters((prev) => ({ ...prev, customerName: "" }))
    } else if (filter.startsWith("Phone:")) {
      setAdvancedFilters((prev) => ({ ...prev, phoneNumber: "" }))
    } else if (filter.startsWith("Email:")) {
      setAdvancedFilters((prev) => ({ ...prev, email: "" }))
    } else if (filter.startsWith("Date:")) {
      setAdvancedFilters((prev) => ({
        ...prev,
        orderDateFrom: undefined,
        orderDateTo: undefined,
      }))
    } else if (filter === "SLA Exceeded") {
      setAdvancedFilters((prev) => ({ ...prev, exceedSLA: false }))
    } else if (filter.startsWith("Location:")) {
      setAdvancedFilters((prev) => ({ ...prev, fulfillmentLocationId: "" }))
    } else if (filter.startsWith("Items:")) {
      setAdvancedFilters((prev) => ({ ...prev, items: "" }))
    }
    // Reset to first page when filter is removed
    setCurrentPage(1)
  }

  // Generate active filters for display
  const generateActiveFilters = useMemo(() => {
    const filters: string[] = []

    if (searchTerm) filters.push(`Search: ${searchTerm}`)
    if (statusFilter !== "all-status") filters.push(`Status: ${statusFilter}`)
    if (channelFilter !== "all-channels") filters.push(`Channel: ${channelFilter}`)
    if (activeSlaFilter !== "all") filters.push(`SLA: ${activeSlaFilter}`)

    // Advanced filters
    if (advancedFilters.orderNumber) filters.push(`Order: ${advancedFilters.orderNumber}`)
    if (advancedFilters.customerName) filters.push(`Customer: ${advancedFilters.customerName}`)
    if (advancedFilters.phoneNumber) filters.push(`Phone: ${advancedFilters.phoneNumber}`)
    if (advancedFilters.email) filters.push(`Email: ${advancedFilters.email}`)
    if (advancedFilters.orderDateFrom || advancedFilters.orderDateTo) {
      const dateRange = `${advancedFilters.orderDateFrom || "Start"} - ${advancedFilters.orderDateTo || "End"}`
      filters.push(`Date: ${dateRange}`)
    }
    if (advancedFilters.exceedSLA) filters.push("SLA Exceeded")
    if (advancedFilters.fulfillmentLocationId) filters.push(`Location: ${advancedFilters.fulfillmentLocationId}`)
    if (advancedFilters.items) filters.push(`Items: ${advancedFilters.items}`)

    return filters
  }, [searchTerm, statusFilter, channelFilter, activeSlaFilter, advancedFilters])

  // Advanced filter handlers
  const handleResetAdvancedFilters = () => {
    setAdvancedFilters({
      orderNumber: "",
      customerName: "",
      phoneNumber: "",
      email: "",
      orderDateFrom: undefined,
      orderDateTo: undefined,
      orderStatus: "all-status",
      exceedSLA: false,
      sellingChannel: "all-channels",
      paymentStatus: "all-payment",
      fulfillmentLocationId: "",
      items: "",
    })
    setSearchTerm("")
    setStatusFilter("all-status")
    setChannelFilter("all-channels")
    setActiveSlaFilter("all")
  }

  const handleApplyAdvancedFilters = (filters: AdvancedFilterValues) => {
    setAdvancedFilters(filters)
    // Sync status and channel from advanced filters if they were changed there
    if (filters.orderStatus && filters.orderStatus !== "all-status") {
      setStatusFilter(filters.orderStatus)
    }
    if (filters.sellingChannel && filters.sellingChannel !== "all-channels") {
      setChannelFilter(filters.sellingChannel)
    }
    setCurrentPage(1)
  }

  // Pagination handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handlePageSizeChange = (size: number) => {
    setPageSize(size)
    setCurrentPage(1)
  }

  // Mapping function to flatten nested Order payloads to legacy flat structure for table
  function mapOrderToTableRow(order: any) {
    // SLA data is already in seconds, pass through as-is for SLA badge component to handle
    let slaInfo = order.sla_info

    return {
      id: order.id,
      orderNo: order.order_no,
      total_amount: order.total_amount,
      sellingLocationId: order.metadata?.store_name ?? "",
      status: order.status,
      slaStatus: slaInfo ?? "",
      returnStatus: order.return_status ?? "",
      onHold: order.on_hold ?? false,
      paymentStatus: order.payment_info?.status ?? "",
      confirmed: order.confirmed ?? false,
      channel: order.channel,
      allowSubstitution: order.allow_substitution ?? false,
      createdDate: order.metadata?.created_at ? formatGMT7DateTime(order.metadata.created_at) : "",
    }
  }

  // Compute SLA stats and alerts for quick filter buttons
  const slaStats = useMemo(() => {
    const nearBreachOrders = ordersData.filter((order) => {
      if (
        !order.sla_info ||
        order.status === "DELIVERED" ||
        order.status === "FULFILLED" ||
        order.status === "CANCELLED"
      )
        return false

      // API returns values in seconds - Default SLA target is 300 seconds (5 minutes)
      const targetSeconds = order.sla_info.target_minutes || 300
      const elapsedSeconds = order.sla_info.elapsed_minutes || 0

      const remainingSeconds = targetSeconds - elapsedSeconds
      const criticalThreshold = targetSeconds * 0.2 // 20% of target (60 seconds for 300s target)
      return (remainingSeconds <= criticalThreshold && remainingSeconds > 0) || order.sla_info.status === "NEAR_BREACH"
    })
    const breachedOrders = ordersData.filter((order) => {
      if (
        !order.sla_info ||
        order.status === "DELIVERED" ||
        order.status === "FULFILLED" ||
        order.status === "CANCELLED"
      )
        return false

      // API returns values in seconds - Default SLA target is 300 seconds (5 minutes)
      const targetSeconds = order.sla_info.target_minutes || 300
      const elapsedSeconds = order.sla_info.elapsed_minutes || 0

      // Over SLA if elapsed time exceeds target
      return elapsedSeconds > targetSeconds || order.sla_info.status === "BREACH"
    })
    return {
      all: ordersData.length,
      nearBreach: nearBreachOrders.length,
      breach: breachedOrders.length,
    }
  }, [ordersData])

  // slaAlerts is just the breached orders for button enablement
  const slaAlerts = slaStats.breach > 0 // True if there are any breached orders

  // Filter and map orders for table
  const filteredOrders = ordersData.filter((order) => {
    // Search term filter (searches across multiple fields)
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      const matchesSearch =
        order.id?.toLowerCase().includes(searchLower) ||
        order.order_no?.toLowerCase().includes(searchLower) ||
        order.customer?.name?.toLowerCase().includes(searchLower) ||
        order.customer?.email?.toLowerCase().includes(searchLower) ||
        order.customer?.phone?.toLowerCase().includes(searchLower) ||
        order.channel?.toLowerCase().includes(searchLower) ||
        order.status?.toLowerCase().includes(searchLower)

      if (!matchesSearch) return false
    }

    // Status filter
    if (statusFilter && statusFilter !== "all-status") {
      if (order.status?.toUpperCase() !== statusFilter.toUpperCase()) {
        return false
      }
    }

    // Channel filter
    if (channelFilter && channelFilter !== "all-channels") {
      if (order.channel?.toUpperCase() !== channelFilter.toUpperCase()) {
        return false
      }
    }

    // Advanced filters
    if (advancedFilters.orderNumber) {
      const orderNumberLower = advancedFilters.orderNumber.toLowerCase()
      const matchesOrderNumber =
        order.id?.toLowerCase().includes(orderNumberLower) || order.order_no?.toLowerCase().includes(orderNumberLower)
      if (!matchesOrderNumber) return false
    }

    if (advancedFilters.customerName) {
      const customerNameLower = advancedFilters.customerName.toLowerCase()
      if (!order.customer?.name?.toLowerCase().includes(customerNameLower)) {
        return false
      }
    }

    if (advancedFilters.phoneNumber) {
      if (!order.customer?.phone?.includes(advancedFilters.phoneNumber)) {
        return false
      }
    }

    if (advancedFilters.email) {
      const emailLower = advancedFilters.email.toLowerCase()
      if (!order.customer?.email?.toLowerCase().includes(emailLower)) {
        return false
      }
    }

    if (advancedFilters.orderStatus && advancedFilters.orderStatus !== "all-status") {
      if (order.status?.toUpperCase() !== advancedFilters.orderStatus.toUpperCase()) {
        return false
      }
    }

    if (advancedFilters.sellingChannel && advancedFilters.sellingChannel !== "all-channels") {
      if (order.channel?.toUpperCase() !== advancedFilters.sellingChannel.toUpperCase()) {
        return false
      }
    }

    if (advancedFilters.paymentStatus && advancedFilters.paymentStatus !== "all-payment") {
      if (order.payment_info?.status?.toUpperCase() !== advancedFilters.paymentStatus.toUpperCase()) {
        return false
      }
    }

    if (advancedFilters.fulfillmentLocationId) {
      const locationLower = advancedFilters.fulfillmentLocationId.toLowerCase()
      if (!order.metadata?.store_name?.toLowerCase().includes(locationLower)) {
        return false
      }
    }

    if (advancedFilters.items) {
      const itemsLower = advancedFilters.items.toLowerCase()
      const matchesItems = order.items?.some(
        (item) =>
          item.product_name?.toLowerCase().includes(itemsLower) || item.product_sku?.toLowerCase().includes(itemsLower),
      )
      if (!matchesItems) return false
    }

    // Date range filter
    if (advancedFilters.orderDateFrom || advancedFilters.orderDateTo) {
      const orderDate = getGMT7Time(order.order_date || order.metadata?.created_at)

      if (advancedFilters.orderDateFrom) {
        const fromDate = getGMT7Time(advancedFilters.orderDateFrom)
        if (orderDate < fromDate) return false
      }

      if (advancedFilters.orderDateTo) {
        const toDate = getGMT7Time(advancedFilters.orderDateTo)
        toDate.setHours(23, 59, 59, 999) // Include the entire day
        if (orderDate > toDate) return false
      }
    }

    // SLA filter
    if (activeSlaFilter === "near-breach") {
      if (order.status === "DELIVERED" || order.status === "FULFILLED" || order.status === "CANCELLED") {
        return false
      }
      if (!order.sla_info) return false

      // API returns values in seconds - Default SLA target is 300 seconds (5 minutes)
      const targetSeconds = order.sla_info.target_minutes || 300
      const elapsedSeconds = order.sla_info.elapsed_minutes || 0

      const remainingSeconds = targetSeconds - elapsedSeconds
      const criticalThreshold = targetSeconds * 0.2 // 20% of target (60 seconds for 300s target)
      return (remainingSeconds <= criticalThreshold && remainingSeconds > 0) || order.sla_info.status === "NEAR_BREACH"
    } else if (activeSlaFilter === "breach") {
      if (order.status === "DELIVERED" || order.status === "FULFILLED" || order.status === "CANCELLED") {
        return false
      }
      if (!order.sla_info) return false

      // API returns values in seconds - Default SLA target is 300 seconds (5 minutes)
      const targetSeconds = order.sla_info.target_minutes || 300
      const elapsedSeconds = order.sla_info.elapsed_minutes || 0

      // Over SLA if elapsed time exceeds target
      return elapsedSeconds > targetSeconds || order.sla_info.status === "BREACH"
    }

    // SLA exceed filter from advanced filters
    if (advancedFilters.exceedSLA) {
      if (!order.sla_info) return false

      // API returns values in seconds - Default SLA target is 300 seconds (5 minutes)
      const targetSeconds = order.sla_info.target_minutes || 300
      const elapsedSeconds = order.sla_info.elapsed_minutes || 0

      // Only show orders that exceed SLA (elapsed > target)
      if (elapsedSeconds <= targetSeconds && order.sla_info.status !== "BREACH") return false
    }

    return true
  })

  const mappedOrders = filteredOrders.map(mapOrderToTableRow)

  // Local function to render the order table
  function renderOrderTable(ordersToShow: any[]) {
    return (
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-light-gray">
            <TableRow className="hover:bg-light-gray/80 border-b border-medium-gray">
              <TableHead className="font-heading text-deep-navy min-w-[150px] text-sm font-semibold">
                ORDER NUMBER
              </TableHead>
              <TableHead className="font-heading text-deep-navy min-w-[120px] text-sm font-semibold">
                SHORT ORDER
              </TableHead>
              <TableHead className="font-heading text-deep-navy min-w-[120px] text-sm font-semibold">
                ORDER TOTAL
              </TableHead>
              <TableHead className="font-heading text-deep-navy min-w-[140px] text-sm font-semibold">
                SELLING LOCATION ID
              </TableHead>
              <TableHead className="font-heading text-deep-navy min-w-[120px] text-sm font-semibold">
                ORDER STATUS
              </TableHead>
              <TableHead className="font-heading text-deep-navy min-w-[120px] text-sm font-semibold">
                SLA STATUS
              </TableHead>
              <TableHead className="font-heading text-deep-navy min-w-[120px] text-sm font-semibold">
                RETURN STATUS
              </TableHead>
              <TableHead className="font-heading text-deep-navy min-w-[80px] text-sm font-semibold">ON HOLD</TableHead>
              <TableHead className="font-heading text-deep-navy min-w-[120px] text-sm font-semibold">
                PAYMENT STATUS
              </TableHead>
              <TableHead className="font-heading text-deep-navy min-w-[100px] text-sm font-semibold">
                CONFIRMED
              </TableHead>
              <TableHead className="font-heading text-deep-navy min-w-[120px] text-sm font-semibold">
                SELLING CHANNEL
              </TableHead>
              <TableHead className="font-heading text-deep-navy min-w-[140px] text-sm font-semibold">
                ALLOW SUBSTITUTION
              </TableHead>
              <TableHead className="font-heading text-deep-navy min-w-[150px] text-sm font-semibold">
                CREATED DATE
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ordersToShow.length === 0 ? (
              <TableRow>
                <TableCell colSpan={12} className="text-center py-8">
                  No orders found.
                </TableCell>
              </TableRow>
            ) : (
              ordersToShow.map((order) => (
                <TableRow key={order.id} className="hover:bg-gray-50 transition-colors duration-150">
                  <TableCell className="cursor-pointer text-blue-600 hover:text-blue-800">
                    <button
                      onClick={() => handleOrderRowClick(ordersData.find((o) => o.id === order.id) || order)}
                      className="hover:underline text-left"
                    >
                      {order.id}
                    </button>
                  </TableCell>
                  <TableCell>{order.orderNo}</TableCell>
                  <TableCell>฿{order.total_amount?.toLocaleString() || "0"}</TableCell>
                  <TableCell>{order.sellingLocationId}</TableCell>
                  <TableCell>
                    <OrderStatusBadge status={order.status} />
                  </TableCell>
                  <TableCell>
                    <SLABadge
                      targetMinutes={order.slaStatus?.target_minutes ?? 0}
                      elapsedMinutes={order.slaStatus?.elapsed_minutes ?? 0}
                      status={order.status}
                    />
                  </TableCell>
                  <TableCell>
                    <ReturnStatusBadge status={order.returnStatus} />
                  </TableCell>
                  <TableCell>
                    <OnHoldBadge onHold={order.onHold} />
                  </TableCell>
                  <TableCell>
                    <PaymentStatusBadge status={order.paymentStatus} />
                  </TableCell>
                  <TableCell>{order.confirmed ? "Yes" : "No"}</TableCell>
                  <TableCell>
                    <ChannelBadge channel={order.channel} />
                  </TableCell>
                  <TableCell>{order.allowSubstitution ? "Yes" : "No"}</TableCell>
                  <TableCell>{order.createdDate}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    )
  }
  return (
    <>
      <Card className="w-full max-w-none">
        <CardHeader className="border-b border-medium-gray bg-white p-6">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold text-deep-navy font-heading">Order Management Hub</CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className={`border-medium-gray ${
                  showAdvancedFilters
                    ? "bg-light-gray text-deep-navy"
                    : "text-steel-gray hover:text-deep-navy hover:bg-light-gray"
                } transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-corporate-blue focus-visible:outline-none shadow-sm hover:shadow-md`}
                title="Advanced Filters"
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              >
                <Filter className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="border-medium-gray text-steel-gray hover:text-deep-navy hover:bg-light-gray transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-corporate-blue focus-visible:outline-none shadow-sm hover:shadow-md"
                title="Refresh Data"
                onClick={refreshData}
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          {/* Operations Quick Filters */}
          <div className="mt-4 space-y-3">
            <div className="text-sm font-medium text-gray-700">Quick Filters</div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={activeSlaFilter === "breach" ? "default" : "outline"}
                onClick={() => handleSlaFilterChange("breach")}
                className={`h-10 px-4 font-medium ${
                  activeSlaFilter === "breach" 
                    ? "bg-red-600 text-white hover:bg-red-700" 
                    : "bg-red-50 text-red-700 border-red-300 hover:bg-red-100"
                }`}
              >
                <AlertCircle className="h-4 w-4 mr-2" />
                🚨 SLA Breach ({slaStats.breach})
              </Button>
              <Button
                variant={activeSlaFilter === "near-breach" ? "default" : "outline"}
                onClick={() => handleSlaFilterChange("near-breach")}
                className={`h-10 px-4 font-medium ${
                  activeSlaFilter === "near-breach"
                    ? "bg-amber-600 text-white hover:bg-amber-700"
                    : "bg-amber-50 text-amber-700 border-amber-300 hover:bg-amber-100"
                }`}
              >
                ⚠️ Near Breach ({slaStats.nearBreach})
              </Button>
              <Button
                variant={statusFilter === "PROCESSING" ? "default" : "outline"}
                onClick={() => {
                  setStatusFilter("PROCESSING")
                  setActiveSlaFilter("all")
                  setCurrentPage(1)
                }}
                className="h-10 px-4 font-medium"
              >
                📦 Processing Orders
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  const today = new Date()
                  const todayStr = today.toISOString().split('T')[0]
                  setAdvancedFilters(prev => ({
                    ...prev,
                    orderDateFrom: today,
                    orderDateTo: today
                  }))
                  setCurrentPage(1)
                }}
                className="h-10 px-4 font-medium"
              >
                ✓ Today's Orders
              </Button>
              <Button
                variant={statusFilter === "SUBMITTED" ? "default" : "outline"}
                onClick={() => {
                  setStatusFilter("SUBMITTED")
                  setActiveSlaFilter("all")
                  setCurrentPage(1)
                }}
                className="h-10 px-4 font-medium"
              >
                🆕 New Orders
              </Button>
              <Button
                variant={activeSlaFilter === "all" ? "default" : "outline"}
                onClick={() => handleSlaFilterChange("all")}
                className="h-10 px-4 font-medium"
              >
                All Orders ({slaStats.all})
              </Button>
            </div>
          </div>

          {/* Smart Search and Essential Filters */}
          <div className="mt-4 space-y-3">
            {/* Main Search Bar */}
            <div className="flex items-center space-x-2">
              <div className="relative flex-1 max-w-md">
                <Input
                  placeholder="Search by order #, customer name, email, phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 h-11 text-base"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40 h-11">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-status">All Status</SelectItem>
                  <SelectItem value="SUBMITTED">Submitted</SelectItem>
                  <SelectItem value="PROCESSING">Processing</SelectItem>
                  <SelectItem value="SHIPPED">Shipped</SelectItem>
                  <SelectItem value="DELIVERED">Delivered</SelectItem>
                  <SelectItem value="FULFILLED">Fulfilled</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Select value={channelFilter} onValueChange={setChannelFilter}>
                <SelectTrigger className="w-40 h-11">
                  <SelectValue placeholder="All Channels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-channels">All Channels</SelectItem>
                  <SelectItem value="GRAB">Grab</SelectItem>
                  <SelectItem value="LAZADA">Lazada</SelectItem>
                  <SelectItem value="SHOPEE">Shopee</SelectItem>
                  <SelectItem value="TIKTOK">TikTok</SelectItem>
                  <SelectItem value="SHOPIFY">Shopify</SelectItem>
                  <SelectItem value="INSTORE">In-Store</SelectItem>
                  <SelectItem value="FOODPANDA">FoodPanda</SelectItem>
                  <SelectItem value="LINEMAN">LineMan</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {/* Advanced filters panel */}
          {showAdvancedFilters && (
            <div className="mb-6">
              <EnhancedFilterPanel
                isOpen={showAdvancedFilters}
                onClose={() => setShowAdvancedFilters(false)}
                onApplyFilters={handleApplyAdvancedFilters}
                onResetFilters={handleResetAdvancedFilters}
                initialValues={advancedFilters}
              />
            </div>
          )}

          {/* Active filters summary */}
          {isMounted && generateActiveFilters.length > 0 && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-blue-900">Active Filters ({generateActiveFilters.length})</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleResetAdvancedFilters}
                  className="text-blue-700 hover:text-blue-900 hover:bg-blue-100"
                >
                  Clear All Filters
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {generateActiveFilters.map((filter) => (
                  <Badge
                    key={filter}
                    variant="secondary"
                    className="bg-white text-blue-800 border-blue-300 font-medium text-sm py-1 px-3"
                  >
                    {filter}
                    <button
                      onClick={() => removeFilter(filter)}
                      className="ml-2 text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              {/* Note about filtering limitations */}
              {(advancedFilters.orderNumber || advancedFilters.customerName || advancedFilters.phoneNumber || 
                advancedFilters.email || advancedFilters.fulfillmentLocationId || advancedFilters.items) && (
                <p className="text-xs text-blue-700 mt-2">
                  Note: Some filters are applied on current page only. Use "Fetch All Pages" for complete filtering.
                </p>
              )}
            </div>
          )}

          {/* Loading State */}
          {isMounted && isLoading && (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-corporate-blue" />
              <p className="ml-2 text-steel-gray">
                {fetchingAllProgress.total > 0 
                  ? `Fetching page ${fetchingAllProgress.current} of ${fetchingAllProgress.total}...` 
                  : "Loading orders..."}
              </p>
            </div>
          )}

          {/* Error State */}
          {isMounted && !isLoading && error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Render table and pagination */}
          {isMounted && !isLoading && !error && mappedOrders && pagination && (
            <div>
              {renderOrderTable(mappedOrders)}
              <div className="mt-4 space-y-2">
                {/* Fetch All Toggle */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button
                      variant={fetchAllMode ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        setFetchAllMode(!fetchAllMode)
                        if (!fetchAllMode) {
                          setCurrentPage(1)
                        }
                      }}
                      disabled={isLoading}
                      className="flex items-center gap-2"
                    >
                      <Download className="h-4 w-4" />
                      {fetchAllMode ? "Switch to Paginated View" : "Fetch All Pages"}
                    </Button>
                    {fetchAllMode && ordersData.length > 0 && (
                      <span className="text-sm text-steel-gray">
                        Showing all {ordersData.length} orders
                      </span>
                    )}
                  </div>
                  {lastUpdated && (
                    <p className="text-sm text-steel-gray">Last updated: {lastUpdated}</p>
                  )}
                </div>
                {/* Pagination Controls - Only show when not in fetch all mode */}
                {!fetchAllMode && (
                  <PaginationControls
                    currentPage={currentPage}
                    totalPages={pagination.totalPages}
                    pageSize={pageSize}
                    totalItems={pagination.total}
                    onPageChange={handlePageChange}
                    onPageSizeChange={handlePageSizeChange}
                  />
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Detail View Modal/Overlay */}
      {isDetailViewOpen && selectedOrderForDetail && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={handleCloseDetailView}
        >
          <div
            className="bg-white rounded-lg shadow-xl max-w-7xl w-full max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <OrderDetailView order={selectedOrderForDetail} onClose={handleCloseDetailView} />
          </div>
        </div>
      )}
    </>
  )
}
