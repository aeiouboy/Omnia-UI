"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Search,
  RefreshCw,
  ShoppingBag,
  Package,
  Truck,
  CheckCircle,
  Clock,
  AlertTriangle,
  MoreHorizontal,
  X,
  Filter,
  Loader2,
} from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AdvancedFilterPanel, type AdvancedFilterValues } from "./advanced-filter-panel"
import { PaginationControls } from "./pagination-controls"
import { useToast } from "@/components/ui/use-toast"

// Exact API response types based on the actual API structure
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

// Standardized internal order format
interface Order {
  id: string
  orderNo: string
  customer: string
  email: string
  phoneNumber: string
  channel: string
  status: string
  businessUnit: string
  orderType: string
  items: number
  total: string
  date: string
  slaTargetMinutes: number
  elapsedMinutes: number
  slaStatus: string
  storeName: string
  sellingLocationId: string
  priority: string
  billingMethod: string
  paymentStatus: string
  fulfillmentLocationId: string
  itemsList: string[]
  orderDate: Date
  returnStatus: string
  onHold: boolean
  confirmed: boolean
  allowSubstitution: boolean
  createdDate: string
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

    const mappedOrders = orders.map((apiOrder: ApiOrder, index: number) => {
      console.log(`Processing order ${index + 1}:`, {
        id: apiOrder.id,
        order_no: apiOrder.order_no,
        status: apiOrder.status,
        itemCount: apiOrder.items?.length || 0,
      })

      // Calculate actual total from items since total_amount appears to be 0
      const calculatedTotal = apiOrder.items?.reduce((sum, item) => sum + (item.total_price || 0), 0) || 0
      const displayTotal = calculatedTotal > 0 ? calculatedTotal : apiOrder.total_amount

      // Handle customer information (most fields are masked with "-")
      const customerName = apiOrder.customer?.name !== "-" ? apiOrder.customer.name : "Grab Customer"
      const customerEmail = apiOrder.customer?.email !== "-" ? apiOrder.customer.email : "customer@grab.com"
      const customerPhone = apiOrder.customer?.phone !== "-" ? apiOrder.customer.phone : "N/A"

      // Extract items information
      const itemsList = apiOrder.items?.map((item) => item.product_name) || []
      const itemCount = apiOrder.items?.length || 0

      // Handle dates
      const orderDate = new Date(apiOrder.order_date)
      const createdDate = apiOrder.metadata?.created_at || apiOrder.order_date

      // Calculate SLA status based on elapsed vs target minutes
      let slaStatus = "COMPLIANT"
      const remainingMinutes = apiOrder.sla_info.target_minutes - apiOrder.sla_info.elapsed_minutes

      if (remainingMinutes <= 0) {
        slaStatus = "BREACH"
      } else if (remainingMinutes <= apiOrder.sla_info.target_minutes * 0.2) {
        slaStatus = "NEAR_BREACH"
      }

      // Handle location information (most fields are masked)
      const storeName = apiOrder.metadata?.store_name !== "-" ? apiOrder.metadata.store_name : apiOrder.business_unit
      const sellingLocationId = storeName

      // Handle priority (masked in API)
      const priority = apiOrder.metadata?.priority !== "-" ? apiOrder.metadata.priority : "NORMAL"

      // Handle payment information
      const paymentMethod = apiOrder.payment_info?.method || "Online Payment"
      const paymentStatus = apiOrder.payment_info?.status !== "-" ? apiOrder.payment_info.status : "UNKNOWN"

      const mappedOrder: Order = {
        id: apiOrder.id,
        orderNo: apiOrder.order_no,
        customer: customerName,
        email: customerEmail,
        phoneNumber: customerPhone,
        channel: apiOrder.channel.toUpperCase(),
        status: apiOrder.status.toUpperCase(),
        businessUnit: apiOrder.business_unit,
        orderType: apiOrder.order_type,
        items: itemCount,
        total: `฿${displayTotal.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        date: orderDate.toLocaleString(),
        slaTargetMinutes: apiOrder.sla_info.target_minutes,
        elapsedMinutes: apiOrder.sla_info.elapsed_minutes,
        slaStatus,
        storeName,
        sellingLocationId,
        priority: priority.toUpperCase(),
        billingMethod: paymentMethod,
        paymentStatus: paymentStatus.toUpperCase(),
        fulfillmentLocationId: apiOrder.business_unit,
        itemsList,
        orderDate,
        returnStatus: "",
        onHold: false,
        confirmed: true,
        allowSubstitution: false,
        createdDate: new Date(createdDate).toLocaleString(),
      }

      console.log(`✅ Mapped order ${index + 1}:`, {
        id: mappedOrder.id,
        orderNo: mappedOrder.orderNo,
        status: mappedOrder.status,
        total: mappedOrder.total,
        slaStatus: mappedOrder.slaStatus,
      })

      return mappedOrder
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
        throw new Error(proxyData.error || "Server proxy fallback")
      }
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

// Realistic fallback data based on actual API structure
const fallbackOrders: Order[] = [
  {
    id: "TRV2-123456789-C7ECJUN1MF2WLE2",
    orderNo: "GF-5173",
    customer: "Grab Customer",
    email: "customer@grab.com",
    phoneNumber: "N/A",
    channel: "GRAB",
    status: "CANCELLED",
    businessUnit: "CFG",
    orderType: "STANDARD",
    items: 1,
    total: "฿72.00",
    date: "2025-05-26T07:29:57.000Z",
    slaTargetMinutes: 300,
    elapsedMinutes: 790626,
    slaStatus: "BREACH",
    storeName: "CFG",
    sellingLocationId: "CFG",
    priority: "NORMAL",
    billingMethod: "Online Payment",
    paymentStatus: "UNKNOWN",
    fulfillmentLocationId: "CFG",
    itemsList: ["หอมใหญ่ออสเตรเลีย"],
    orderDate: new Date("2025-05-26T07:29:57.000Z"),
    returnStatus: "",
    onHold: false,
    confirmed: true,
    allowSubstitution: false,
    createdDate: "2025-05-26T07:29:57.000Z",
  },
  {
    id: "XMS1-123456789-C7ETGCBVAKXVCX",
    orderNo: "GF-2455",
    customer: "Grab Customer",
    email: "customer@grab.com",
    phoneNumber: "N/A",
    channel: "GRAB",
    status: "DELIVERED",
    businessUnit: "CFG",
    orderType: "STANDARD",
    items: 1,
    total: "฿17.00",
    date: "2025-06-04T09:53:52.000Z",
    slaTargetMinutes: 300,
    elapsedMinutes: 4391,
    slaStatus: "BREACH",
    storeName: "CFG",
    sellingLocationId: "CFG",
    priority: "NORMAL",
    billingMethod: "Online Payment",
    paymentStatus: "UNKNOWN",
    fulfillmentLocationId: "CFG",
    itemsList: ["เชาว์คัทสึโอะไก่และปลาโอ 40ก"],
    orderDate: new Date("2025-06-04T09:53:52.000Z"),
    returnStatus: "",
    onHold: false,
    confirmed: true,
    allowSubstitution: false,
    createdDate: "2025-06-04T09:53:52.000Z",
  },
  {
    id: "123456789-C7EFA24KEPDHN6",
    orderNo: "GF-2738",
    customer: "Grab Customer",
    email: "customer@grab.com",
    phoneNumber: "N/A",
    channel: "GRAB",
    status: "CANCELLED",
    businessUnit: "CFG",
    orderType: "STANDARD",
    items: 3,
    total: "฿411.00",
    date: "2025-05-29T08:12:29.000Z",
    slaTargetMinutes: 300,
    elapsedMinutes: 528874,
    slaStatus: "BREACH",
    storeName: "CFG",
    sellingLocationId: "CFG",
    priority: "NORMAL",
    billingMethod: "Online Payment",
    paymentStatus: "UNKNOWN",
    fulfillmentLocationId: "CFG",
    itemsList: ["มายช้อยส์สตรอเบอร์รี่ 250ก", "GI กระเทียมมัดจุก500ก", "หอมใหญ่ออสเตรเลีย"],
    orderDate: new Date("2025-05-29T08:12:29.000Z"),
    returnStatus: "",
    onHold: false,
    confirmed: true,
    allowSubstitution: false,
    createdDate: "2025-05-29T08:12:29.000Z",
  },
]

const fallbackPagination: ApiPagination = {
  page: 1,
  pageSize: 10,
  total: 3,
  totalPages: 1,
  hasNext: false,
  hasPrev: false,
}

function getStatusIcon(status: string) {
  switch (status) {
    case "CREATED":
      return <ShoppingBag className="h-4 w-4 text-dark-gray" />
    case "PROCESSING":
      return <Package className="h-4 w-4 text-info" />
    case "SHIPPED":
      return <Truck className="h-4 w-4 text-corporate-blue" />
    case "DELIVERED":
      return <CheckCircle className="h-4 w-4 text-success" />
    case "FULFILLED":
      return <CheckCircle className="h-4 w-4 text-success" />
    case "CANCELLED":
      return <X className="h-4 w-4 text-destructive" />
    default:
      return <ShoppingBag className="h-4 w-4 text-dark-gray" />
  }
}

function getChannelBadge(channel: string) {
  switch (channel) {
    case "GRAB":
      return (
        <Badge variant="outline" className="bg-[#e6f7ef] text-success border-[#c2e8d7] font-mono text-sm">
          GRAB
        </Badge>
      )
    case "LAZADA":
      return (
        <Badge variant="outline" className="bg-[#e6f1fc] text-info border-[#c2d8f0] font-mono text-sm">
          LAZADA
        </Badge>
      )
    case "SHOPEE":
      return (
        <Badge variant="outline" className="bg-[#fef3e6] text-warning border-[#f5e0c5] font-mono text-sm">
          SHOPEE
        </Badge>
      )
    case "TIKTOK":
      return (
        <Badge variant="outline" className="bg-[#f1f1f1] text-dark-gray border-[#e0e0e0] font-mono text-sm">
          TIKTOK
        </Badge>
      )
    default:
      return (
        <Badge variant="outline" className="font-mono text-sm">
          {channel}
        </Badge>
      )
  }
}

function getSLABadge(targetMinutes: number, elapsedMinutes: number, status: string) {
  if (status === "DELIVERED" || status === "FULFILLED") {
    return (
      <Badge variant="outline" className="bg-[#e6f7ef] text-success border-[#c2e8d7] font-mono text-sm">
        COMPLETE
      </Badge>
    )
  }

  const remainingMinutes = targetMinutes - elapsedMinutes

  if (status === "BREACH" || remainingMinutes < 0) {
    return (
      <div className="flex items-center">
        <AlertTriangle className="h-3 w-3 text-red-500 mr-1" />
        <span className="text-red-500 font-mono text-sm font-medium">{Math.abs(remainingMinutes)}m BREACH</span>
      </div>
    )
  } else if (remainingMinutes < targetMinutes * 0.2 || status === "NEAR_BREACH") {
    return (
      <div className="flex items-center">
        <Clock className="h-3 w-3 text-amber-500 mr-1" />
        <span className="text-amber-500 font-mono text-sm font-medium">{remainingMinutes}m LEFT</span>
      </div>
    )
  } else {
    return (
      <div className="flex items-center">
        <Clock className="h-3 w-3 text-blue-500 mr-1" />
        <span className="text-blue-500 font-mono text-sm font-medium">{remainingMinutes}m LEFT</span>
      </div>
    )
  }
}

function getPriorityBadge(priority: string) {
  switch (priority) {
    case "HIGH":
      return <Badge className="bg-critical text-white border-0 font-mono text-sm">HIGH</Badge>
    case "NORMAL":
      return (
        <Badge variant="outline" className="font-mono text-sm">
          NORMAL
        </Badge>
      )
    case "LOW":
      return (
        <Badge variant="secondary" className="font-mono text-sm">
          LOW
        </Badge>
      )
    default:
      return (
        <Badge variant="outline" className="font-mono text-sm">
          NORMAL
        </Badge>
      )
  }
}

export function OrderManagementHub() {
  // Filter states
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all-status")
  const [channelFilter, setChannelFilter] = useState("all-channels")
  const [priorityFilter, setPriorityFilter] = useState("all-priority")
  const [slaFilter, setSlaFilter] = useState<"all" | "near-breach" | "breach">("all")
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [activeFilters, setActiveFilters] = useState<string[]>([])
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
  const [pageSize, setPageSize] = useState(25)
  const [pagination, setPagination] = useState<ApiPagination>(fallbackPagination)

  // Data states
  const [ordersData, setOrdersData] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dataSource, setDataSource] = useState<"api" | "fallback">("fallback")

  // SLA states
  const [slaAlerts, setSlaAlerts] = useState<string[]>([])
  const [slaStats, setSlaStats] = useState({
    criticalOrders: [] as Order[],
    breachedOrders: [] as Order[],
    nearBreachOrders: [] as Order[],
  })

  const router = useRouter()
  const { toast } = useToast()

  // Debounced search to avoid too many API calls
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("")

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 500)

    return () => clearTimeout(timer)
  }, [searchTerm])

  // Fetch orders function with pagination and filters
  const fetchOrders = useCallback(
    async (page: number = currentPage, size: number = pageSize, resetPage = false) => {
      setIsLoading(true)
      setError(null)

      try {
        console.log("🔄 Starting order fetch process...")

        const actualPage = resetPage ? 1 : page

        const paginationParams: PaginationParams = {
          page: actualPage,
          pageSize: size,
        }

        const filterParams: FilterParams = {
          searchTerm: debouncedSearchTerm,
          status: statusFilter,
          channel: channelFilter,
          priority: priorityFilter,
          slaFilter,
          advancedFilters,
        }

        const { orders, pagination: apiPagination } = await fetchOrdersFromApi(paginationParams, filterParams)

        if (orders.length === 0 && apiPagination.total === 0) {
          console.log("⚠️ API returned empty data, using fallback")
          setOrdersData(fallbackOrders)
          setPagination(fallbackPagination)
          setDataSource("fallback")
          setError("API returned no data. Using demo data.")
        } else {
          console.log(
            `✅ Successfully loaded ${orders.length} orders from API (Page ${apiPagination.page}/${apiPagination.totalPages})`,
          )
          setOrdersData(orders)
          setPagination(apiPagination)
          setDataSource("api")

          if (resetPage) {
            setCurrentPage(1)
          } else {
            setCurrentPage(actualPage)
          }
        }

        const { criticalOrders, breachedOrders, nearBreachOrders, newAlerts } = checkSLAAlerts(
          orders.length > 0 ? orders : fallbackOrders,
        )
        setSlaStats({ criticalOrders, breachedOrders, nearBreachOrders })

        if (newAlerts.length > 0) {
          setSlaAlerts(newAlerts)
        }
      } catch (error) {
        console.error("❌ Failed to fetch orders:", error)

        let errorMessage = "Unknown error occurred"
        if (error instanceof Error) {
          errorMessage = error.message
        }

        setError(`API Connection Failed: ${errorMessage}`)
        setDataSource("fallback")

        // Use fallback data if API fails
        console.log("🔄 Using fallback demo data...")
        setOrdersData(fallbackOrders)
        setPagination(fallbackPagination)
        setCurrentPage(1)

        const { criticalOrders, breachedOrders, nearBreachOrders } = checkSLAAlerts(fallbackOrders)
        setSlaStats({ criticalOrders, breachedOrders, nearBreachOrders })

        toast({
          title: "API Connection Failed",
          description: "Unable to connect to external API. Using demo data for demonstration.",
          variant: "destructive",
          duration: 8000,
        })
      } finally {
        setIsLoading(false)
      }
    },
    [
      currentPage,
      pageSize,
      debouncedSearchTerm,
      statusFilter,
      channelFilter,
      priorityFilter,
      slaFilter,
      advancedFilters,
      toast,
    ],
  )

  // Initial data fetch
  useEffect(() => {
    fetchOrders(1, pageSize, true)
  }, [pageSize])

  // Fetch when filters change (reset to page 1)
  useEffect(() => {
    if (debouncedSearchTerm !== searchTerm) return // Wait for debounced search
    fetchOrders(1, pageSize, true)
  }, [debouncedSearchTerm, statusFilter, channelFilter, priorityFilter, slaFilter, advancedFilters])

  // SLA alerts check function
  const checkSLAAlerts = (orders: Order[]) => {
    const criticalOrders = orders.filter((order) => {
      if (order.status === "DELIVERED" || order.status === "FULFILLED" || order.status === "CANCELLED") {
        return false
      }

      const remainingMinutes = order.slaTargetMinutes - order.elapsedMinutes
      const criticalThreshold = order.slaTargetMinutes * 0.2

      return remainingMinutes <= criticalThreshold || order.slaStatus === "NEAR_BREACH" || order.slaStatus === "BREACH"
    })

    const breachedOrders = criticalOrders.filter(
      (order) => order.slaTargetMinutes - order.elapsedMinutes <= 0 || order.slaStatus === "BREACH",
    )

    const nearBreachOrders = criticalOrders.filter(
      (order) =>
        order.slaTargetMinutes - order.elapsedMinutes > 0 &&
        (order.slaStatus === "NEAR_BREACH" || order.slaStatus !== "BREACH"),
    )

    const newAlerts = criticalOrders.map((order) => {
      const remainingMinutes = order.slaTargetMinutes - order.elapsedMinutes
      if (remainingMinutes <= 0) {
        return `🚨 Order ${order.orderNo} has exceeded SLA by ${Math.abs(remainingMinutes)} minutes!`
      } else {
        return `⚠️ Order ${order.orderNo} will exceed SLA in ${remainingMinutes} minutes!`
      }
    })

    return { criticalOrders, breachedOrders, nearBreachOrders, newAlerts }
  }

  // Pagination handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    fetchOrders(page, pageSize)
  }

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize)
    setCurrentPage(1)
    fetchOrders(1, newPageSize, true)
  }

  // Refresh data handler
  const refreshData = async () => {
    await fetchOrders(currentPage, pageSize)
    toast({
      title: "Data refreshed",
      description: dataSource === "api" ? "Order data updated from API." : "Using demo data.",
    })
  }

  // Advanced filters handlers
  const handleApplyAdvancedFilters = (filters: AdvancedFilterValues) => {
    setAdvancedFilters(filters)
    setStatusFilter(filters.orderStatus)
    setChannelFilter(filters.sellingChannel)

    const newActiveFilters: string[] = []
    if (filters.orderNumber) newActiveFilters.push(`Order #: ${filters.orderNumber}`)
    if (filters.customerName) newActiveFilters.push(`Customer: ${filters.customerName}`)
    if (filters.phoneNumber) newActiveFilters.push(`Phone: ${filters.phoneNumber}`)
    if (filters.email) newActiveFilters.push(`Email: ${filters.email}`)
    if (filters.orderDateFrom) newActiveFilters.push(`From: ${filters.orderDateFrom.toLocaleDateString()}`)
    if (filters.orderDateTo) newActiveFilters.push(`To: ${filters.orderDateTo.toLocaleDateString()}`)
    if (filters.orderStatus !== "all-status") newActiveFilters.push(`Status: ${filters.orderStatus}`)
    if (filters.exceedSLA) newActiveFilters.push("SLA Breached")
    if (filters.sellingChannel !== "all-channels") newActiveFilters.push(`Channel: ${filters.sellingChannel}`)
    if (filters.paymentStatus !== "all-payment") newActiveFilters.push(`Payment: ${filters.paymentStatus}`)
    if (filters.fulfillmentLocationId) newActiveFilters.push(`Location: ${filters.fulfillmentLocationId}`)
    if (filters.items) newActiveFilters.push(`Items: ${filters.items}`)

    setActiveFilters(newActiveFilters)
    setShowAdvancedFilters(false)
  }

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
    setStatusFilter("all-status")
    setChannelFilter("all-channels")
    setPriorityFilter("all-priority")
    setSlaFilter("all")
    setActiveFilters([])
  }

  const removeFilter = (filter: string) => {
    setActiveFilters(activeFilters.filter((f) => f !== filter))

    if (filter.startsWith("Order #:")) {
      setAdvancedFilters((prev) => ({ ...prev, orderNumber: "" }))
    } else if (filter.startsWith("Customer:")) {
      setAdvancedFilters((prev) => ({ ...prev, customerName: "" }))
    } else if (filter.startsWith("Phone:")) {
      setAdvancedFilters((prev) => ({ ...prev, phoneNumber: "" }))
    } else if (filter.startsWith("Email:")) {
      setAdvancedFilters((prev) => ({ ...prev, email: "" }))
    } else if (filter.startsWith("From:")) {
      setAdvancedFilters((prev) => ({ ...prev, orderDateFrom: undefined }))
    } else if (filter.startsWith("To:")) {
      setAdvancedFilters((prev) => ({ ...prev, orderDateTo: undefined }))
    } else if (filter.startsWith("Status:")) {
      setAdvancedFilters((prev) => ({ ...prev, orderStatus: "all-status" }))
      setStatusFilter("all-status")
    } else if (filter === "SLA Breached") {
      setAdvancedFilters((prev) => ({ ...prev, exceedSLA: false }))
    } else if (filter.startsWith("Channel:")) {
      setAdvancedFilters((prev) => ({ ...prev, sellingChannel: "all-channels" }))
      setChannelFilter("all-channels")
    } else if (filter.startsWith("Payment:")) {
      setAdvancedFilters((prev) => ({ ...prev, paymentStatus: "all-payment" }))
    } else if (filter.startsWith("Location:")) {
      setAdvancedFilters((prev) => ({ ...prev, fulfillmentLocationId: "" }))
    } else if (filter.startsWith("Items:")) {
      setAdvancedFilters((prev) => ({ ...prev, items: "" }))
    }
  }

  // Client-side filtering for SLA filters (since API doesn't support these)
  const filteredOrders = ordersData.filter((order) => {
    if (slaFilter === "near-breach") {
      if (order.status === "DELIVERED" || order.status === "FULFILLED" || order.status === "CANCELLED") {
        return false
      }
      const remainingMinutes = order.slaTargetMinutes - order.elapsedMinutes
      const criticalThreshold = order.slaTargetMinutes * 0.2
      return (remainingMinutes <= criticalThreshold && remainingMinutes > 0) || order.slaStatus === "NEAR_BREACH"
    } else if (slaFilter === "breach") {
      if (order.status === "DELIVERED" || order.status === "FULFILLED" || order.status === "CANCELLED") {
        return false
      }
      const remainingMinutes = order.slaTargetMinutes - order.elapsedMinutes
      return remainingMinutes <= 0 || order.slaStatus === "BREACH"
    }
    return true
  })

  const renderOrderTable = (ordersToShow: Order[]) => (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader className="bg-light-gray">
          <TableRow className="hover:bg-light-gray/80 border-b border-medium-gray">
            <TableHead className="font-heading text-deep-navy min-w-[150px] text-sm font-semibold">
              ORDER NUMBER
            </TableHead>
            <TableHead className="font-heading text-deep-navy min-w-[100px] text-sm font-semibold">
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
            <TableHead className="font-heading text-deep-navy min-w-[100px] text-sm font-semibold">CONFIRMED</TableHead>
            <TableHead className="font-heading text-deep-navy min-w-[120px] text-sm font-semibold">
              SELLING CHANNEL
            </TableHead>
            <TableHead className="font-heading text-deep-navy min-w-[140px] text-sm font-semibold">
              ALLOW SUBSTITUTION
            </TableHead>
            <TableHead className="font-heading text-deep-navy min-w-[150px] text-sm font-semibold">
              CREATED DATE
            </TableHead>
            <TableHead className="text-right min-w-[100px] text-sm font-semibold font-heading text-deep-navy">
              ACTIONS
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={13} className="text-center py-8">
                <div className="flex justify-center items-center">
                  <Loader2 className="h-6 w-6 animate-spin mr-2" />
                  <span>Loading orders...</span>
                </div>
              </TableCell>
            </TableRow>
          ) : error ? (
            <TableRow>
              <TableCell colSpan={13} className="text-center py-4">
                <div className="flex flex-col items-center gap-2">
                  <span className="text-destructive">{error}</span>
                  <span className="text-sm text-muted-foreground">
                    Data source: {dataSource === "api" ? "External API" : "Demo Data"}
                  </span>
                </div>
              </TableCell>
            </TableRow>
          ) : ordersToShow.length > 0 ? (
            ordersToShow.map((order) => (
              <TableRow key={order.id} className="hover:bg-light-gray/50 border-b border-medium-gray">
                <TableCell className="font-mono text-sm text-deep-navy whitespace-nowrap leading-relaxed">
                  <div className="flex items-center">
                    <button
                      onClick={() => router.push(`/orders/${order.id}`)}
                      className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer font-medium"
                    >
                      {order.orderNo}
                    </button>
                  </div>
                </TableCell>
                <TableCell className="text-readable text-deep-navy leading-relaxed">{order.total}</TableCell>
                <TableCell className="text-readable text-deep-navy leading-relaxed">
                  {order.sellingLocationId}
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    {getStatusIcon(order.status)}
                    <span className="ml-2 text-readable text-deep-navy leading-relaxed">{order.status}</span>
                  </div>
                </TableCell>
                <TableCell>{getSLABadge(order.slaTargetMinutes, order.elapsedMinutes, order.slaStatus)}</TableCell>
                <TableCell className="text-readable text-deep-navy leading-relaxed">
                  {order.returnStatus ? order.returnStatus : "NONE"}
                </TableCell>
                <TableCell className="text-readable text-deep-navy leading-relaxed">
                  {order.onHold ? (
                    <Badge variant="outline" className="bg-[#fef3e6] text-warning border-[#f5e0c5] font-mono text-sm">
                      YES
                    </Badge>
                  ) : (
                    ""
                  )}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={`font-mono text-sm ${
                      order.paymentStatus === "PAID"
                        ? "bg-[#e6f7ef] text-success border-[#c2e8d7]"
                        : order.paymentStatus === "UNKNOWN"
                          ? "bg-[#f1f1f1] text-dark-gray border-[#e0e0e0]"
                          : "bg-[#fef3e6] text-warning border-[#f5e0c5]"
                    }`}
                  >
                    {order.paymentStatus}
                  </Badge>
                </TableCell>
                <TableCell className="text-readable text-deep-navy leading-relaxed">
                  {order.confirmed ? <CheckCircle className="h-4 w-4 text-success" /> : ""}
                </TableCell>
                <TableCell>
                  <span className="text-sm">{getChannelBadge(order.channel)}</span>
                </TableCell>
                <TableCell className="text-readable text-deep-navy leading-relaxed">
                  {order.allowSubstitution ? "Yes" : "No"}
                </TableCell>
                <TableCell className="text-readable text-deep-navy font-mono text-sm leading-relaxed">
                  {order.createdDate}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4 text-steel-gray" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="border-medium-gray">
                      <DropdownMenuLabel className="text-deep-navy font-heading">Actions</DropdownMenuLabel>
                      <DropdownMenuItem
                        className="text-body text-deep-navy cursor-pointer"
                        onClick={() => router.push(`/orders/${order.id}`)}
                      >
                        View details
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-body text-deep-navy cursor-pointer">
                        Process order
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-body text-deep-navy cursor-pointer">
                        Print invoice
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-body text-deep-navy cursor-pointer">
                        Print shipping label
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-body text-deep-navy cursor-pointer">
                        Cancel order
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={13} className="text-center py-4 text-muted-foreground">
                No orders found matching your criteria
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )

  return (
    <Card className="shadow-enterprise border-medium-gray">
      <CardHeader className="border-b border-medium-gray pb-6">
        <div className="flex flex-col gap-4">
          {/* Data source indicator */}
          {dataSource === "fallback" && (
            <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 p-2 rounded-md">
              <AlertTriangle className="h-4 w-4" />
              <span>Using demo data - External API not accessible</span>
            </div>
          )}

          {/* Search and filters row */}
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search input */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-dark-gray" />
              <Input
                type="search"
                placeholder="Search by order number, customer name, email, phone, or product..."
                className="pl-8 w-full border-medium-gray text-deep-navy"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Filters section */}
            <div className="flex gap-2 overflow-x-auto pb-2 max-w-full">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px] border-medium-gray">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-status">All Status</SelectItem>
                  <SelectItem value="created">Created</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="fulfilled">Fulfilled</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Select value={channelFilter} onValueChange={setChannelFilter}>
                <SelectTrigger className="w-[120px] border-medium-gray">
                  <SelectValue placeholder="Channel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-channels">All Channels</SelectItem>
                  <SelectItem value="grab">Grab</SelectItem>
                  <SelectItem value="lazada">Lazada</SelectItem>
                  <SelectItem value="shopee">Shopee</SelectItem>
                  <SelectItem value="tiktok">TikTok</SelectItem>
                  <SelectItem value="shopify">Shopify</SelectItem>
                  <SelectItem value="instore">In-store</SelectItem>
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-[120px] border-medium-gray">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-priority">All Priority</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>

              {/* SLA Quick Filters */}
              <div className="flex gap-1 flex-shrink-0">
                <Button
                  variant={slaFilter === "near-breach" ? "default" : "outline"}
                  size="sm"
                  className={`border-medium-gray ${
                    slaFilter === "near-breach"
                      ? "bg-amber-500 text-white hover:bg-amber-600"
                      : "text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                  }`}
                  onClick={() => setSlaFilter(slaFilter === "near-breach" ? "all" : "near-breach")}
                >
                  <Clock className="h-4 w-4 mr-1" />
                  Near SLA
                  {slaStats.nearBreachOrders.length > 0 && (
                    <Badge variant="outline" className="ml-1 bg-white text-amber-600 border-amber-300">
                      {slaStats.nearBreachOrders.length}
                    </Badge>
                  )}
                </Button>

                {slaAlerts.length > 0 && (
                  <Button
                    variant={slaFilter === "breach" ? "default" : "outline"}
                    size="sm"
                    className={`border-medium-gray ${
                      slaFilter === "breach"
                        ? "bg-red-500 text-white hover:bg-red-600"
                        : "text-red-600 hover:text-red-700 hover:bg-red-50"
                    }`}
                    onClick={() => setSlaFilter(slaFilter === "breach" ? "all" : "breach")}
                  >
                    <AlertTriangle className="h-4 w-4 mr-1" />
                    SLA Breach
                    {slaStats.breachedOrders.length > 0 && (
                      <Badge variant="outline" className="ml-1 bg-white text-red-600 border-red-300">
                        {slaStats.breachedOrders.length}
                      </Badge>
                    )}
                  </Button>
                )}
              </div>

              <Button
                variant="outline"
                size="icon"
                className={`border-medium-gray ${
                  showAdvancedFilters
                    ? "bg-light-gray text-deep-navy"
                    : "text-steel-gray hover:text-deep-navy hover:bg-light-gray"
                }`}
                title="Advanced Filters"
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              >
                <Filter className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="border-medium-gray text-steel-gray hover:text-deep-navy hover:bg-light-gray"
                title="Refresh Data"
                onClick={refreshData}
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* Active filters row */}
          {activeFilters.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {activeFilters.map((filter) => (
                <Badge key={filter} variant="outline" className="bg-light-gray text-deep-navy font-mono text-sm">
                  {filter}
                  <button
                    onClick={() => removeFilter(filter)}
                    className="ml-2 text-destructive hover:text-destructive/80"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}

          {/* Advanced filters panel */}
          {showAdvancedFilters && (
            <AdvancedFilterPanel
              isOpen={showAdvancedFilters}
              onClose={() => setShowAdvancedFilters(false)}
              onApplyFilters={handleApplyAdvancedFilters}
              onResetFilters={handleResetAdvancedFilters}
              initialValues={advancedFilters}
            />
          )}
        </div>
      </CardHeader>

      <CardContent className="p-6">
        {renderOrderTable(filteredOrders)}

        {/* Pagination Controls */}
        {!isLoading && !error && (
          <PaginationControls
            currentPage={currentPage}
            totalPages={pagination.totalPages}
            pageSize={pageSize}
            totalItems={pagination.total}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            isLoading={isLoading}
          />
        )}
      </CardContent>
    </Card>
  )
}
