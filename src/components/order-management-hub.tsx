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
import { RefreshCw, X, Filter, Loader2, AlertCircle, Download, Search, Clock, Package, PauseCircle, ChevronDown, ChevronUp, CalendarIcon } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PaginationControls } from "./pagination-controls"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { toast } from "@/hooks/use-toast"
import { useOrderCounts } from "@/hooks/use-order-counts"
import { DeliveryMethod } from "@/types/delivery"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { format } from "date-fns"

// Exact API response types based on the actual API structure
export interface ApiCustomer {
  id: string
  name: string
  email: string
  phone: string
  T1Number: string
  customerType?: string
  custRef?: string
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
  subtotal?: number
  discounts?: number
  charges?: number
  amountIncludedTaxes?: number
  amountExcludedTaxes?: number
  taxes?: number
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
  store_no?: string
  order_created?: string
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
  thaiName?: string  // Thai product name for bilingual display
  product_sku: string
  quantity: number
  unit_price: number
  total_price: number
  product_details: ApiProductDetails
  // Manhattan OMS Enhanced Fields
  uom?: string  // Unit of Measure: PACK, SCAN, SBOX, EA, KG, etc.
  packedOrderedQty?: number
  location?: string  // Store code e.g., CFM5252
  barcode?: string  // 13-digit barcode
  giftWrapped?: boolean
  giftWrappedMessage?: string
  supplyTypeId?: 'On Hand Available' | 'Pre-Order'
  substitution?: boolean
  fulfillmentStatus?: 'Picked' | 'Pending' | 'Shipped' | 'Packed'
  shippingMethod?: string  // Standard Delivery, Express, etc.
  bundle?: boolean
  bundleRef?: string
  eta?: {
    from: string  // DD Mon YYYY HH:MM:SS format
    to: string
  }
  promotions?: {
    discountAmount: number  // Negative value e.g., -0.50
    promotionId: string
    promotionType: string  // Discount, Product Discount Promotion
    secretCode?: string
  }[]
  giftWithPurchase?: string | null  // null or gift description
  priceBreakdown?: {
    subtotal: number
    discount: number
    charges: number
    amountIncludedTaxes: number
    amountExcludedTaxes: number
    taxes: number
    total: number
  }
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
  on_hold?: boolean
  fullTaxInvoice?: boolean
  customerTypeId?: string
  sellingChannel?: string
  allowSubstitution?: boolean
  taxId?: string
  companyName?: string
  branchNo?: string
  deliveryMethods?: DeliveryMethod[]
  // Optionally add derived fields for UI only if needed
}

// Pagination parameters interface
interface PaginationParams {
  page: number
  pageSize: number
}

// Advanced filter values interface (legacy, kept for compatibility)
interface AdvancedFilterValues {
  orderNumber: string
  customerName: string
  phoneNumber: string
  email: string
  orderDateFrom: Date | undefined
  orderDateTo: Date | undefined
  orderStatus: string
  exceedSLA: boolean
  sellingChannel: string
  paymentStatus: string
  fulfillmentLocationId: string
  items: string
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
    // TEMPORARY: Add varied elapsed times for demonstration
    const mappedOrders = orders.map((apiOrder: ApiOrder, index) => {
      // For demonstration: vary elapsed times based on order index
      if (process.env.NODE_ENV === 'development' && apiOrder.sla_info) {
        const demoOrder = { ...apiOrder }
        const patterns = [
          { elapsed: 0 },    // 0% - Normal (green)
          { elapsed: 120 },  // 40% - Normal (green)
          { elapsed: 180 },  // 60% - Approaching (yellow)
          { elapsed: 250 },  // 83% - Warning (orange)
          { elapsed: 350 },  // 117% - Critical (red)
        ]
        
        // Cycle through patterns
        const pattern = patterns[index % patterns.length]
        demoOrder.sla_info = {
          ...demoOrder.sla_info,
          elapsed_minutes: pattern.elapsed,
          status: pattern.elapsed > 300 ? "BREACH" : 
                  pattern.elapsed > 240 ? "NEAR_BREACH" : "ON_TRACK"
        }
        
        return demoOrder
      }
      
      return { ...apiOrder }
    })

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
  
  // Get real-time order counts across all pages
  const { counts: realTimeCounts, isLoading: countsLoading, error: countsError } = useOrderCounts(10000) // Update every 10 seconds
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
  const [skuSearchTerm, setSkuSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all-status")
  const [channelFilter, setChannelFilter] = useState("all-channels")
  const [activeSlaFilter, setActiveSlaFilter] = useState<"all" | "near-breach" | "breach">("all")
  const [quickFilter, setQuickFilter] = useState<"all" | "urgent" | "due-soon" | "ready" | "on-hold">("all")

  // New extended filter states
  const [storeNoFilter, setStoreNoFilter] = useState("all-stores")
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("all-payment")
  const [dateFromFilter, setDateFromFilter] = useState<Date | undefined>(undefined)
  const [dateToFilter, setDateToFilter] = useState<Date | undefined>(undefined)
  const [itemNameFilter, setItemNameFilter] = useState("")
  const [customerNameFilter, setCustomerNameFilter] = useState("")
  const [emailFilter, setEmailFilter] = useState("")
  const [phoneFilter, setPhoneFilter] = useState("")
  const [itemStatusFilter, setItemStatusFilter] = useState("all-item-status")
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("all-payment-method")
  const [orderTypeFilter, setOrderTypeFilter] = useState("all-order-type")
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  
  // Legacy advanced filters state (kept for compatibility)
  const [advancedFilters] = useState({
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
  
  // Bulk selection states
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set())
  const [isAllSelected, setIsAllSelected] = useState(false)

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

  // Bulk selection handlers
  const handleSelectOrder = (orderId: string) => {
    const newSelection = new Set(selectedOrders)
    if (newSelection.has(orderId)) {
      newSelection.delete(orderId)
    } else {
      newSelection.add(orderId)
    }
    setSelectedOrders(newSelection)
    setIsAllSelected(false)
  }

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedOrders(new Set())
      setIsAllSelected(false)
    } else {
      const allOrderIds = new Set(filteredOrders.map(order => order.id))
      setSelectedOrders(allOrderIds)
      setIsAllSelected(true)
    }
  }

  // Quick action handlers
  const handleQuickAction = async (action: "process" | "hold" | "print" | "assign") => {
    if (selectedOrders.size === 0) {
      toast({
        title: "No orders selected",
        description: "Please select at least one order to perform this action.",
        variant: "destructive",
      })
      return
    }

    const orderIds = Array.from(selectedOrders)
    
    switch (action) {
      case "process":
        toast({
          title: "Processing orders",
          description: `Processing ${orderIds.length} order(s)...`,
        })
        // TODO: Implement actual processing logic
        break
      case "hold":
        toast({
          title: "Orders on hold",
          description: `${orderIds.length} order(s) placed on hold.`,
        })
        // TODO: Implement actual hold logic
        break
      case "print":
        toast({
          title: "Printing documents",
          description: `Preparing documents for ${orderIds.length} order(s)...`,
        })
        // TODO: Implement actual print logic
        break
      case "assign":
        toast({
          title: "Assignment dialog",
          description: "Opening assignment dialog...",
        })
        // TODO: Implement assignment modal
        break
    }

    // Clear selection after action
    setSelectedOrders(new Set())
    setIsAllSelected(false)
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
  const [isExporting, setIsExporting] = useState<boolean>(false)

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
    } else if (filter.startsWith("SKU:")) {
      setSkuSearchTerm("")
    } else if (filter.startsWith("Status:")) {
      setStatusFilter("all-status")
    } else if (filter.startsWith("Channel:")) {
      setChannelFilter("all-channels")
    } else if (filter.startsWith("Store No:")) {
      setStoreNoFilter("all-stores")
    } else if (filter.startsWith("Payment Status:")) {
      setPaymentStatusFilter("all-payment")
    } else if (filter.startsWith("From:")) {
      setDateFromFilter(undefined)
    } else if (filter.startsWith("To:")) {
      setDateToFilter(undefined)
    } else if (filter.startsWith("Item Name:")) {
      setItemNameFilter("")
    } else if (filter.startsWith("Customer:")) {
      setCustomerNameFilter("")
    } else if (filter.startsWith("Email:")) {
      setEmailFilter("")
    } else if (filter.startsWith("Phone:")) {
      setPhoneFilter("")
    } else if (filter.startsWith("Item Status:")) {
      setItemStatusFilter("all-item-status")
    } else if (filter.startsWith("Payment Method:")) {
      setPaymentMethodFilter("all-payment-method")
    } else if (filter.startsWith("Order Type:")) {
      setOrderTypeFilter("all-order-type")
    } else if (filter === "Urgent Orders" || filter === "Due Soon" || filter === "Ready to Process" || filter === "On Hold") {
      setQuickFilter("all")
      setActiveSlaFilter("all")
    }
    // Reset to first page when filter is removed
    setCurrentPage(1)
  }

  // Generate active filters for display
  const generateActiveFilters = useMemo(() => {
    const filters: string[] = []

    if (searchTerm) filters.push(`Search: ${searchTerm}`)
    if (skuSearchTerm) filters.push(`SKU: ${skuSearchTerm}`)
    if (statusFilter !== "all-status") filters.push(`Status: ${statusFilter}`)
    if (channelFilter !== "all-channels") filters.push(`Channel: ${channelFilter}`)
    if (storeNoFilter && storeNoFilter !== "all-stores") filters.push(`Store No: ${storeNoFilter}`)
    if (paymentStatusFilter !== "all-payment") filters.push(`Payment Status: ${paymentStatusFilter}`)
    if (dateFromFilter) filters.push(`From: ${format(dateFromFilter, "dd/MM/yyyy")}`)
    if (dateToFilter) filters.push(`To: ${format(dateToFilter, "dd/MM/yyyy")}`)
    if (itemNameFilter) filters.push(`Item Name: ${itemNameFilter}`)
    if (customerNameFilter) filters.push(`Customer: ${customerNameFilter}`)
    if (emailFilter) filters.push(`Email: ${emailFilter}`)
    if (phoneFilter) filters.push(`Phone: ${phoneFilter}`)
    if (itemStatusFilter !== "all-item-status") filters.push(`Item Status: ${itemStatusFilter}`)
    if (paymentMethodFilter !== "all-payment-method") filters.push(`Payment Method: ${paymentMethodFilter}`)
    if (orderTypeFilter !== "all-order-type") filters.push(`Order Type: ${orderTypeFilter}`)
    if (quickFilter !== "all") {
      const quickFilterLabels = {
        "urgent": "Urgent Orders",
        "due-soon": "Due Soon",
        "ready": "Ready to Process",
        "on-hold": "On Hold"
      }
      filters.push(quickFilterLabels[quickFilter] || quickFilter)
    }

    return filters
  }, [searchTerm, skuSearchTerm, statusFilter, channelFilter, storeNoFilter, paymentStatusFilter, dateFromFilter, dateToFilter, itemNameFilter, customerNameFilter, emailFilter, phoneFilter, itemStatusFilter, paymentMethodFilter, orderTypeFilter, quickFilter])

  // Reset all filters
  const handleResetAllFilters = () => {
    setSearchTerm("")
    setSkuSearchTerm("")
    setStatusFilter("all-status")
    setChannelFilter("all-channels")
    setActiveSlaFilter("all")
    setQuickFilter("all")
    // Reset new extended filters
    setStoreNoFilter("all-stores")
    setPaymentStatusFilter("all-payment")
    setDateFromFilter(undefined)
    setDateToFilter(undefined)
    setItemNameFilter("")
    setCustomerNameFilter("")
    setEmailFilter("")
    setPhoneFilter("")
    setItemStatusFilter("all-item-status")
    setPaymentMethodFilter("all-payment-method")
    setOrderTypeFilter("all-order-type")
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

  // Function to determine urgency level based on SLA status
  function getOrderUrgencyLevel(order: Order): "critical" | "warning" | "approaching" | "normal" {
    if (!order.sla_info || order.status === "DELIVERED" || order.status === "FULFILLED" || order.status === "CANCELLED" || order.status === "COLLECTED") {
      return "normal"
    }

    const targetSeconds = order.sla_info.target_minutes || 300
    const elapsedSeconds = order.sla_info.elapsed_minutes || 0
    const remainingSeconds = targetSeconds - elapsedSeconds
    const percentRemaining = (remainingSeconds / targetSeconds) * 100

    // Debug logging only in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`Order ${order.id}: target=${targetSeconds}s, elapsed=${elapsedSeconds}s, remaining=${remainingSeconds}s, %remaining=${percentRemaining}%`)
    }

    if (elapsedSeconds > targetSeconds || order.sla_info.status === "BREACH") {
      return "critical" // Red - SLA breached
    } else if (percentRemaining <= 20 || order.sla_info.status === "NEAR_BREACH") {
      return "warning" // Orange - Near breach (20% or less remaining)
    } else if (percentRemaining <= 50) {
      return "approaching" // Yellow - Approaching deadline (50% or less remaining)
    }
    return "normal" // Green - On track
  }

  // Get row styling based on urgency
  function getUrgencyRowStyle(urgencyLevel: string): string {
    switch (urgencyLevel) {
      case "critical":
        return "bg-red-50 border-l-4 border-l-red-500 hover:bg-red-100"
      case "warning":
        return "bg-orange-50 border-l-4 border-l-orange-500 hover:bg-orange-100"
      case "approaching":
        return "bg-yellow-50 border-l-4 border-l-yellow-500 hover:bg-yellow-100"
      default:
        return "hover:bg-gray-50"
    }
  }

  // Mapping function to flatten nested Order payloads to legacy flat structure for table
  function mapOrderToTableRow(order: any) {
    // SLA data is already in seconds, pass through as-is for SLA badge component to handle
    let slaInfo = order.sla_info
    const urgencyLevel = getOrderUrgencyLevel(order)

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
      urgencyLevel: urgencyLevel,
      _originalOrder: order // Keep reference to original order for urgency calculation
    }
  }

  // Compute SLA stats and alerts for quick filter buttons
  const slaStats = useMemo(() => {
    const nearBreachOrders = ordersData.filter((order) => {
      if (
        !order.sla_info ||
        order.status === "DELIVERED" ||
        order.status === "FULFILLED" ||
        order.status === "CANCELLED" ||
        order.status === "COLLECTED"
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
        order.status === "CANCELLED" ||
        order.status === "COLLECTED"
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

  // Get unique store numbers from orders data for dropdown
  const uniqueStoreNos = useMemo(() => {
    const storeNos = ordersData
      .map(order => order.metadata?.store_no)
      .filter((storeNo): storeNo is string => !!storeNo)
    return [...new Set(storeNos)].sort()
  }, [ordersData])

  // Filter and map orders for table
  const filteredOrders = ordersData.filter((order) => {
    // Search term filter (searches across multiple fields - NOT including SKU)
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

    // SKU search filter (separate from main search)
    if (skuSearchTerm) {
      const skuSearchLower = skuSearchTerm.toLowerCase()
      const matchesSku = order.items?.some(item =>
        item.product_sku?.toLowerCase().includes(skuSearchLower)
      )
      if (!matchesSku) return false
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

    // New extended filters
    // Store No filter
    if (storeNoFilter && storeNoFilter !== "all-stores") {
      if (order.metadata?.store_no?.toUpperCase() !== storeNoFilter.toUpperCase()) {
        return false
      }
    }

    // Payment Status filter
    if (paymentStatusFilter && paymentStatusFilter !== "all-payment") {
      if (order.payment_info?.status?.toUpperCase() !== paymentStatusFilter.toUpperCase()) {
        return false
      }
    }

    // Date range filter (new state-based)
    if (dateFromFilter || dateToFilter) {
      const orderDate = getGMT7Time(order.order_date || order.metadata?.created_at)

      if (dateFromFilter) {
        const fromDate = getGMT7Time(dateFromFilter)
        if (orderDate < fromDate) return false
      }

      if (dateToFilter) {
        const toDate = getGMT7Time(dateToFilter)
        toDate.setHours(23, 59, 59, 999) // Include the entire day
        if (orderDate > toDate) return false
      }
    }

    // Item Name filter
    if (itemNameFilter) {
      const itemNameLower = itemNameFilter.toLowerCase()
      const matchesItemName = order.items?.some(
        (item) => item.product_name?.toLowerCase().includes(itemNameLower)
      )
      if (!matchesItemName) return false
    }

    // Customer Name filter
    if (customerNameFilter) {
      const customerNameLower = customerNameFilter.toLowerCase()
      if (!order.customer?.name?.toLowerCase().includes(customerNameLower)) {
        return false
      }
    }

    // Email filter
    if (emailFilter) {
      const emailLower = emailFilter.toLowerCase()
      if (!order.customer?.email?.toLowerCase().includes(emailLower)) {
        return false
      }
    }

    // Phone filter
    if (phoneFilter) {
      if (!order.customer?.phone?.includes(phoneFilter)) {
        return false
      }
    }

    // Item Status filter
    if (itemStatusFilter && itemStatusFilter !== "all-item-status") {
      const matchesItemStatus = order.items?.some(
        (item) => item.fulfillmentStatus?.toUpperCase() === itemStatusFilter.toUpperCase()
      )
      if (!matchesItemStatus) return false
    }

    // Payment Method filter
    if (paymentMethodFilter && paymentMethodFilter !== "all-payment-method") {
      if (order.payment_info?.method?.toUpperCase() !== paymentMethodFilter.toUpperCase()) {
        return false
      }
    }

    // Order Type filter
    if (orderTypeFilter && orderTypeFilter !== "all-order-type") {
      if (order.order_type?.toUpperCase() !== orderTypeFilter.toUpperCase()) {
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
      if (order.status === "DELIVERED" || order.status === "FULFILLED" || order.status === "CANCELLED" || order.status === "COLLECTED") {
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
      if (order.status === "DELIVERED" || order.status === "FULFILLED" || order.status === "CANCELLED" || order.status === "COLLECTED") {
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

    // Quick filter for on-hold orders
    if (quickFilter === "on-hold") {
      if (!order.on_hold) return false
    }

    return true
  })

  // CSV Export Helper Function
  const exportOrdersToCSV = (orders: Order[]) => {
    // Escape special characters for CSV
    const escapeCSV = (value: string | number | undefined | null): string => {
      if (value === null || value === undefined) return ""
      const stringValue = String(value)
      // If value contains comma, quote, or newline, wrap in quotes and escape inner quotes
      if (stringValue.includes(",") || stringValue.includes('"') || stringValue.includes("\n")) {
        return `"${stringValue.replace(/"/g, '""')}"`
      }
      return stringValue
    }

    // Format date for CSV using GMT+7
    const formatDateForCSV = (dateString: string | undefined): string => {
      if (!dateString) return ""
      try {
        const date = new Date(dateString)
        return formatBangkokDateTime(date)
      } catch {
        return dateString || ""
      }
    }

    // Get SLA status as human-readable string
    const getSLAStatusLabel = (order: Order): string => {
      if (!order.sla_info) return "N/A"
      const targetSeconds = order.sla_info.target_minutes || 300
      const elapsedSeconds = order.sla_info.elapsed_minutes || 0

      if (elapsedSeconds > targetSeconds || order.sla_info.status === "BREACH") {
        return "Breach"
      }
      const remainingSeconds = targetSeconds - elapsedSeconds
      const criticalThreshold = targetSeconds * 0.2
      if (remainingSeconds <= criticalThreshold && remainingSeconds > 0) {
        return "Near Breach"
      }
      return "On Track"
    }

    // CSV Header row
    const headers = [
      "Order ID",
      "Order No",
      "Customer Name",
      "Email",
      "Phone",
      "Status",
      "Channel",
      "Store No",
      "Order Date",
      "Total Amount",
      "Payment Status",
      "Payment Method",
      "Order Type",
      "SLA Status",
      "Items Count"
    ]

    // Map orders to CSV rows
    const rows = orders.map(order => [
      escapeCSV(order.id),
      escapeCSV(order.order_no),
      escapeCSV(order.customer?.name),
      escapeCSV(order.customer?.email),
      escapeCSV(order.customer?.phone),
      escapeCSV(order.status),
      escapeCSV(order.channel),
      escapeCSV(order.metadata?.store_no),
      escapeCSV(formatDateForCSV(order.order_date || order.metadata?.created_at)),
      escapeCSV(order.total_amount?.toFixed(2)),
      escapeCSV(order.payment_info?.status),
      escapeCSV(order.payment_info?.method),
      escapeCSV(order.order_type),
      escapeCSV(getSLAStatusLabel(order)),
      escapeCSV(order.items?.length || 0)
    ])

    // Combine headers and rows
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n")

    // Generate filename with timestamp
    const now = new Date()
    const timestamp = format(now, "yyyy-MM-dd-HHmmss")
    const filename = `orders-export-${timestamp}.csv`

    // Create blob and trigger download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = filename
    link.click()
    URL.revokeObjectURL(link.href)
  }

  // Export Handler Function
  const handleExportSearchResults = async () => {
    try {
      setIsExporting(true)

      // Small delay to show loading state
      await new Promise(resolve => setTimeout(resolve, 100))

      exportOrdersToCSV(filteredOrders)

      toast({
        title: "Export Successful",
        description: `Exported ${filteredOrders.length} order${filteredOrders.length !== 1 ? "s" : ""} to CSV.`,
      })
    } catch (err: any) {
      toast({
        title: "Export Failed",
        description: err.message || "Failed to export orders to CSV.",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

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
              ordersToShow.map((order) => {
                const urgencyStyle = getUrgencyRowStyle(order.urgencyLevel || "normal")
                return (
                  <TableRow key={order.id} className={`transition-colors duration-150 ${urgencyStyle}`}>
                    <TableCell className="cursor-pointer text-blue-600 hover:text-blue-800">
                      <button
                        onClick={() => handleOrderRowClick(order._originalOrder || ordersData.find((o) => o.id === order.id) || order)}
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
                      slaStatus={order.slaStatus?.status}
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
                )
              })
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
                className="border-medium-gray text-steel-gray hover:text-deep-navy hover:bg-light-gray transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-corporate-blue focus-visible:outline-none shadow-sm hover:shadow-md"
                title="Export filtered orders to CSV"
                onClick={handleExportSearchResults}
                disabled={isExporting || filteredOrders.length === 0}
              >
                {isExporting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </>
                )}
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
          {/* Urgency Legend */}
          <div className="mt-4 flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span className="text-gray-600">Critical (Breach)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-orange-500 rounded"></div>
              <span className="text-gray-600">Warning (≤20% time)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-yellow-500 rounded"></div>
              <span className="text-gray-600">Approaching (≤50% time)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span className="text-gray-600">On Track</span>
            </div>
          </div>

          {/* Operations Quick Filters */}
          <div className="mt-4 space-y-3">
            <div className="text-sm font-medium text-gray-700">Quick Filters</div>
            <div className="flex flex-wrap gap-2">
              {/* Urgent Orders - SLA Breach */}
              <Button
                variant={quickFilter === "urgent" ? "default" : "outline"}
                onClick={() => {
                  setQuickFilter("urgent")
                  setActiveSlaFilter("breach")
                  setStatusFilter("all-status")
                  setCurrentPage(1)
                }}
                className={`h-10 px-4 font-medium ${
                  quickFilter === "urgent" 
                    ? "bg-red-600 text-white hover:bg-red-700 shadow-md" 
                    : "bg-red-50 text-red-700 border-red-300 hover:bg-red-100"
                }`}
              >
                <AlertCircle className="h-4 w-4 mr-2" />
                Urgent Orders ({realTimeCounts.breach})
              </Button>
              
              {/* Due Soon - Near Breach */}
              <Button
                variant={quickFilter === "due-soon" ? "default" : "outline"}
                onClick={() => {
                  setQuickFilter("due-soon")
                  setActiveSlaFilter("near-breach")
                  setStatusFilter("all-status")
                  setCurrentPage(1)
                }}
                className={`h-10 px-4 font-medium ${
                  quickFilter === "due-soon"
                    ? "bg-amber-600 text-white hover:bg-amber-700 shadow-md"
                    : "bg-amber-50 text-amber-700 border-amber-300 hover:bg-amber-100"
                }`}
              >
                <Clock className="h-4 w-4 mr-2" />
                Due Soon ({realTimeCounts.nearBreach})
              </Button>
              
              {/* Ready to Process - New/Submitted Orders */}
              <Button
                variant={quickFilter === "ready" ? "default" : "outline"}
                onClick={() => {
                  setQuickFilter("ready")
                  setStatusFilter("SUBMITTED")
                  setActiveSlaFilter("all")
                  setCurrentPage(1)
                }}
                className={`h-10 px-4 font-medium ${
                  quickFilter === "ready"
                    ? "bg-green-600 text-white hover:bg-green-700 shadow-md"
                    : "bg-green-50 text-green-700 border-green-300 hover:bg-green-100"
                }`}
              >
                <Package className="h-4 w-4 mr-2" />
                Ready to Process ({realTimeCounts.submitted})
              </Button>
              
              {/* On Hold Orders */}
              <Button
                variant={quickFilter === "on-hold" ? "default" : "outline"}
                onClick={() => {
                  setQuickFilter("on-hold")
                  // Filter will be applied client-side for on-hold status
                  setStatusFilter("all-status")
                  setActiveSlaFilter("all")
                  setCurrentPage(1)
                }}
                className={`h-10 px-4 font-medium ${
                  quickFilter === "on-hold"
                    ? "bg-gray-600 text-white hover:bg-gray-700 shadow-md"
                    : "bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100"
                }`}
              >
                <PauseCircle className="h-4 w-4 mr-2" />
                On Hold ({realTimeCounts.onHold})
              </Button>
              
              {/* Reset Filters */}
              <Button
                variant="ghost"
                onClick={handleResetAllFilters}
                className="h-10 px-4 font-medium text-gray-600 hover:text-gray-900"
                disabled={quickFilter === "all" && statusFilter === "all-status" && channelFilter === "all-channels" && activeSlaFilter === "all" && !searchTerm && !skuSearchTerm && storeNoFilter === "all-stores" && paymentStatusFilter === "all-payment" && !dateFromFilter && !dateToFilter && !itemNameFilter && !customerNameFilter && !emailFilter && !phoneFilter && itemStatusFilter === "all-item-status" && paymentMethodFilter === "all-payment-method" && orderTypeFilter === "all-order-type"}
              >
                <X className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
            </div>
          </div>

          {/* Main Filters Section */}
          <div className="mt-4 space-y-3">
            <div className="text-sm font-medium text-gray-700">Main Filters</div>
            {/* Row 1: Search and Core Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-3">
              {/* Order ID Search */}
              <div className="relative sm:col-span-2 lg:col-span-2">
                <Input
                  placeholder="Search by order #, customer name, email, phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 h-11 text-base"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>

              {/* Order Status */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-11">
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

              {/* Store No. */}
              <Select value={storeNoFilter} onValueChange={setStoreNoFilter}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="All Stores" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-stores">All Stores</SelectItem>
                  {uniqueStoreNos.map((storeNo) => (
                    <SelectItem key={storeNo} value={storeNo}>
                      {storeNo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Payment Status */}
              <Select value={paymentStatusFilter} onValueChange={setPaymentStatusFilter}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Payment Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-payment">All Payment Status</SelectItem>
                  <SelectItem value="PAID">Paid</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="FAILED">Failed</SelectItem>
                </SelectContent>
              </Select>

              {/* Selling Channel */}
              <Select value={channelFilter} onValueChange={setChannelFilter}>
                <SelectTrigger className="h-11">
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

            {/* Row 2: Date Range */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Date From */}
              <div className="space-y-1">
                <Label htmlFor="dateFrom" className="text-xs text-gray-600">Order Date From</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal h-11",
                        !dateFromFilter && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateFromFilter ? format(dateFromFilter, "dd/MM/yyyy") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dateFromFilter}
                      onSelect={setDateFromFilter}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Date To */}
              <div className="space-y-1">
                <Label htmlFor="dateTo" className="text-xs text-gray-600">Order Date To</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal h-11",
                        !dateToFilter && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateToFilter ? format(dateToFilter, "dd/MM/yyyy") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dateToFilter}
                      onSelect={setDateToFilter}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>

          {/* Advanced Filters Collapsible Section */}
          <Collapsible open={showAdvancedFilters} onOpenChange={setShowAdvancedFilters} className="mt-4">
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900 p-0 h-auto"
              >
                <Filter className="h-4 w-4" />
                {showAdvancedFilters ? "Hide Advanced Filters" : "Show Advanced Filters"}
                {showAdvancedFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-3">
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg space-y-4">
                {/* Text Search Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {/* Item ID / SKU Search */}
                  <div className="space-y-1">
                    <Label className="text-xs text-gray-600">Item ID / SKU</Label>
                    <div className="relative">
                      <Input
                        placeholder="Search by SKU..."
                        value={skuSearchTerm}
                        onChange={(e) => setSkuSearchTerm(e.target.value)}
                        className="pl-10 pr-4 h-11"
                      />
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    </div>
                  </div>

                  {/* Item Name Search */}
                  <div className="space-y-1">
                    <Label className="text-xs text-gray-600">Item Name</Label>
                    <Input
                      placeholder="Search by item name..."
                      value={itemNameFilter}
                      onChange={(e) => setItemNameFilter(e.target.value)}
                      className="h-11"
                    />
                  </div>

                  {/* Customer Name */}
                  <div className="space-y-1">
                    <Label className="text-xs text-gray-600">Customer Name</Label>
                    <Input
                      placeholder="Search by customer name..."
                      value={customerNameFilter}
                      onChange={(e) => setCustomerNameFilter(e.target.value)}
                      className="h-11"
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-1">
                    <Label className="text-xs text-gray-600">Email</Label>
                    <Input
                      placeholder="Search by email..."
                      value={emailFilter}
                      onChange={(e) => setEmailFilter(e.target.value)}
                      className="h-11"
                    />
                  </div>

                  {/* Phone */}
                  <div className="space-y-1">
                    <Label className="text-xs text-gray-600">Phone Number</Label>
                    <Input
                      placeholder="Search by phone..."
                      value={phoneFilter}
                      onChange={(e) => setPhoneFilter(e.target.value)}
                      className="h-11"
                    />
                  </div>

                  {/* Item Status */}
                  <div className="space-y-1">
                    <Label className="text-xs text-gray-600">Item Status</Label>
                    <Select value={itemStatusFilter} onValueChange={setItemStatusFilter}>
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="All Item Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all-item-status">All Item Status</SelectItem>
                        <SelectItem value="PENDING">Pending</SelectItem>
                        <SelectItem value="PICKED">Picked</SelectItem>
                        <SelectItem value="PACKED">Packed</SelectItem>
                        <SelectItem value="SHIPPED">Shipped</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Payment Method */}
                  <div className="space-y-1">
                    <Label className="text-xs text-gray-600">Payment Method</Label>
                    <Select value={paymentMethodFilter} onValueChange={setPaymentMethodFilter}>
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="All Payment Methods" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all-payment-method">All Payment Methods</SelectItem>
                        <SelectItem value="CREDIT_CARD">Credit Card</SelectItem>
                        <SelectItem value="CASH">Cash</SelectItem>
                        <SelectItem value="WALLET">Wallet</SelectItem>
                        <SelectItem value="QR_CODE">QR Code</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Order Type */}
                  <div className="space-y-1">
                    <Label className="text-xs text-gray-600">Order Type</Label>
                    <Select value={orderTypeFilter} onValueChange={setOrderTypeFilter}>
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="All Order Types" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all-order-type">All Order Types</SelectItem>
                        <SelectItem value="DELIVERY">Delivery</SelectItem>
                        <SelectItem value="PICKUP">Pickup</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </CardHeader>

        <CardContent className="p-6">

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
