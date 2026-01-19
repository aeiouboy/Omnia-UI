"use client"

import { useState, useEffect, useCallback, useMemo, useRef } from "react"
import { formatGMT7TimeString, getGMT7Time, formatGMT7DateTime } from "@/lib/utils"
import { formatBangkokTime, formatBangkokDateTime } from "@/lib/timezone-utils"
import { useOrganization } from "@/contexts/organization-context"
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
  DeliveryTypeBadge,
  SettlementTypeBadge,
  RequestTaxBadge,
  OrderTypeBadge,
  PaymentTypeBadge,
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
import type { PaymentTransaction, OrderDiscount, Promotion, CouponCode, PricingBreakdown } from "@/types/payment"
import type { ManhattanAuditEvent } from "@/types/audit"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
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
  informationalTaxes?: number  // Display-only tax info (not part of Order Total calculation)
  cardNumber?: string  // Credit card number (masked format)
  expiryDate?: string  // Card expiry date
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
    couponId?: string      // Coupon code e.g., 'AUTOAPPLY'
    couponName?: string    // Coupon name e.g., 'CPN9|AUTOAPPLY'
  }[]
  giftWithPurchase?: string | boolean | null  // null, false, or gift description
  priceBreakdown?: {
    subtotal: number
    discount: number
    charges: number
    amountIncludedTaxes: number
    amountExcludedTaxes: number
    taxes: number
    total: number
  }
  weight?: number  // Product weight in kg
  actualWeight?: number  // Actual measured weight in kg
  route?: string  // Delivery route name, e.g., 'สายรถหนองบอน'
  bookingSlotFrom?: string  // ISO datetime string, e.g., '2026-01-12T14:00:00'
  bookingSlotTo?: string  // ISO datetime string, e.g., '2026-01-12T15:00:00'
  // Order Line Splitting Fields
  parentLineId?: string  // Original order line ID for split items
  splitIndex?: number  // Position in split sequence (0-based)
  splitReason?: string  // Reason for split, e.g., "quantity-normalization"
}

// FMS Extended Fields - Delivery Time Slot
export interface DeliveryTimeSlot {
  date: string
  from: string
  to: string
}

// FMS Order Type values
export type FMSOrderType = 'Large format' | 'Tops daily CFR' | 'Tops daily CFM' | 'Subscription' | 'Retail'

// FMS Delivery Type values
export type FMSDeliveryType = 'Standard Delivery' | 'Express Delivery' | 'Click & Collect'

// FMS Settlement Type values
export type FMSSettlementType = 'Auto Settle' | 'Manual Settle'

// Delivery Type Code values for order-level delivery type
export type DeliveryTypeCode = 'RT-HD-EXP' | 'RT-CC-STD' | 'MKP-HD-STD' | 'RT-HD-STD' | 'RT-CC-EXP'

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
  on_hold?: boolean
  fullTaxInvoice?: boolean
  // FMS Extended Fields
  orderType?: FMSOrderType
  deliveryType?: FMSDeliveryType
  deliveryTimeSlot?: DeliveryTimeSlot
  deliveredTime?: string
  settlementType?: FMSSettlementType
  paymentDate?: string
  deliveryDate?: string
  paymentType?: string
  customerPayAmount?: number
  customerRedeemAmount?: number
  orderDeliveryFee?: number
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
  sellingChannel?: string
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
  allowSubstitution?: boolean
  allow_substitution?: boolean // API returns snake_case
  taxId?: string
  companyName?: string
  branchNo?: string
  deliveryMethods?: DeliveryMethod[]
  // FMS Extended Fields
  orderType?: FMSOrderType
  deliveryType?: FMSDeliveryType
  deliveryTimeSlot?: DeliveryTimeSlot
  deliveredTime?: string
  settlementType?: FMSSettlementType
  paymentDate?: string
  deliveryDate?: string
  paymentType?: string
  customerPayAmount?: number
  customerRedeemAmount?: number
  orderDeliveryFee?: number
  deliveryTypeCode?: DeliveryTypeCode
  // MAO (Manhattan Active Omni) Extended Fields
  organization?: string
  paymentDetails?: PaymentTransaction[]
  orderDiscounts?: OrderDiscount[]
  promotions?: Promotion[]
  couponCodes?: CouponCode[]
  pricingBreakdown?: PricingBreakdown
  auditTrail?: ManhattanAuditEvent[]
  currency?: string
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
  channel: string
  paymentStatus: string
  fulfillmentLocationId: string
  items: string
}

// Filter parameters interface
interface FilterParams {
  searchTerm?: string
  status?: string
  channel?: string
  businessUnit?: string
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
    // TEMPORARY: Add varied elapsed times and FMS mock data for demonstration
    const mappedOrders = orders.map((apiOrder: ApiOrder, index) => {
      // For demonstration: vary elapsed times and add FMS fields based on order index
      if (process.env.NODE_ENV === 'development') {
        const demoOrder: any = { ...apiOrder }

        // SLA demo patterns
        if (apiOrder.sla_info) {
          const slaPatterns = [
            { elapsed: 0 },    // 0% - Normal (green)
            { elapsed: 120 },  // 40% - Normal (green)
            { elapsed: 180 },  // 60% - Approaching (yellow)
            { elapsed: 250 },  // 83% - Warning (orange)
            { elapsed: 350 },  // 117% - Critical (red)
          ]

          // Cycle through patterns
          const pattern = slaPatterns[index % slaPatterns.length]
          demoOrder.sla_info = {
            ...demoOrder.sla_info,
            elapsed_minutes: pattern.elapsed,
            status: pattern.elapsed > 300 ? "BREACH" :
              pattern.elapsed > 240 ? "NEAR_BREACH" : "ON_TRACK"
          }
        }

        // FMS Extended Fields - mock data for development
        // const orderTypes: FMSOrderType[] = ['Large format', 'Tops daily CFR', 'Tops daily CFM', 'Subscription', 'Retail']
        // const deliveryTypes: FMSDeliveryType[] = ['Standard Delivery', 'Express Delivery', 'Click & Collect']
        // const settlementTypes: FMSSettlementType[] = ['Auto Settle', 'Manual Settle']

        // demoOrder.orderType = orderTypes[index % orderTypes.length]
        // demoOrder.deliveryType = deliveryTypes[index % deliveryTypes.length]
        // demoOrder.settlementType = settlementTypes[index % settlementTypes.length]
        // demoOrder.fullTaxInvoice = index % 3 === 0 // Every 3rd order requests tax invoice

        // // Generate mock delivery time slot
        // const today = new Date()
        // const slotDate = new Date(today.getTime() + (index % 7) * 24 * 60 * 60 * 1000)
        // const slotHour = 9 + (index % 7) * 2 // Slots from 9:00 to 21:00 in 2-hour intervals (7 slots)
        // demoOrder.deliveryTimeSlot = {
        //   date: slotDate.toISOString().split('T')[0],
        //   from: `${String(slotHour).padStart(2, '0')}:00`,
        //   to: `${String(slotHour + 2).padStart(2, '0')}:00`
        // }

        // // Delivered time for completed orders
        // if (demoOrder.status === 'DELIVERED' || demoOrder.status === 'FULFILLED') {
        //   const deliveredDate = new Date(today.getTime() - (index % 5) * 24 * 60 * 60 * 1000)
        //   demoOrder.deliveredTime = deliveredDate.toISOString()
        // }

        // // Payment and delivery dates
        // if (demoOrder.payment_info?.status === 'PAID') {
        //   const paymentDate = new Date(today.getTime() - (index % 3) * 24 * 60 * 60 * 1000)
        //   demoOrder.paymentDate = paymentDate.toISOString()
        // }

        // // Delivery date for DELIVERED orders
        // if (demoOrder.status === 'DELIVERED') {
        //   const orderDate = new Date(demoOrder.order_date || demoOrder.metadata?.created_at || '')
        //   orderDate.setHours(orderDate.getHours() + Math.floor(Math.random() * 48) + 2)
        //   demoOrder.deliveryDate = orderDate.toISOString()
        // }

        // // Payment type with T1C combinations
        // const paymentTypes = [
        //   'Cash on Delivery',
        //   'Credit Card on Delivery',
        //   '2C2P-Credit-Card',
        //   'QR PromptPay',
        //   'T1C Redeem Payment',
        //   'Cash on Delivery + T1C Redeem Payment',
        //   '2C2P-Credit-Card + T1C Redeem Payment',
        //   'Lazada Payment',
        //   'Shopee Payment'
        // ]
        // demoOrder.paymentType = paymentTypes[index % paymentTypes.length]

        // Check if this is a MAO order (starts with 'W') - used to skip demo data modifications
        const isMaoOrder = apiOrder.id?.startsWith('W') || apiOrder.order_no?.startsWith('W')

        // Financial fields - EXCLUDE MAO orders (they have their own payment data)
        if (!isMaoOrder) {
          const hasRedemption = index % 3 === 0 // ~30% of orders
          demoOrder.customerRedeemAmount = hasRedemption ? Math.floor(Math.random() * 500) : 0
          demoOrder.orderDeliveryFee = [0, 40, 60, 80][index % 4]
          demoOrder.customerPayAmount = (demoOrder.total_amount || 0) - (demoOrder.customerRedeemAmount || 0)
        }

        // Generate random deliveryTypeCode for filtering demo
        const deliveryTypeCodes: DeliveryTypeCode[] = ['RT-HD-EXP', 'RT-CC-STD', 'MKP-HD-STD', 'RT-HD-STD', 'RT-CC-EXP']
        demoOrder.deliveryTypeCode = deliveryTypeCodes[index % deliveryTypeCodes.length]

        // Mock Channel (using new standard) - EXCLUDE MAO orders (start with 'W')
        if (!isMaoOrder) {
          const channels = ['web', 'lazada', 'shopee']
          demoOrder.channel = channels[index % channels.length]
        }

        // Mock Gift with Purchase for items - EXCLUDE MAO orders (start with 'W')
        if (!isMaoOrder && demoOrder.items && demoOrder.items.length > 0) {
          demoOrder.items = demoOrder.items.map((item: any, i: number) => {
            // Every 4th item has a gift
            if (i % 4 === 0) {
              return {
                ...item,
                giftWithPurchase: "Free Travel Kit"
              }
            }
            return item
          })
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
    if (filterParams?.businessUnit && filterParams.businessUnit !== "ALL") {
      queryParams.set("businessUnit", filterParams.businessUnit)
    }

    // Add advanced filter parameters
    if (filterParams?.advancedFilters) {
      const af = filterParams.advancedFilters as any // Cast to any to access extended properties
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

      // Extended filters mapping
      if (af.itemStatus) queryParams.set("itemStatus", af.itemStatus)
      if (af.orderType) queryParams.set("orderType", af.orderType)
      if (af.deliveryType) queryParams.set("deliveryType", af.deliveryType)
      if (af.requestTax) queryParams.set("requestTax", af.requestTax)
      if (af.settlementType) queryParams.set("settlementType", af.settlementType)

      // Handle date filters
      if (af.orderDateFrom && af.orderDateTo) {
        // Override the default wide date range with user-selected dates
        queryParams.set("dateFrom", af.orderDateFrom instanceof Date ? af.orderDateFrom.toISOString().split('T')[0] : af.orderDateFrom)
        queryParams.set("dateTo", af.orderDateTo instanceof Date ? af.orderDateTo.toISOString().split('T')[0] : af.orderDateTo)
      }

      // Handle extended date filters
      if (af.deliverySlotDateFrom && af.deliverySlotDateTo) {
        queryParams.set("deliverySlotDateFrom", af.deliverySlotDateFrom instanceof Date ? af.deliverySlotDateFrom.toISOString().split('T')[0] : af.deliverySlotDateFrom)
        queryParams.set("deliverySlotDateTo", af.deliverySlotDateTo instanceof Date ? af.deliverySlotDateTo.toISOString().split('T')[0] : af.deliverySlotDateTo)
      }

      if (af.deliveredTimeFrom && af.deliveredTimeTo) {
        queryParams.set("deliveredTimeFrom", af.deliveredTimeFrom instanceof Date ? af.deliveredTimeFrom.toISOString().split('T')[0] : af.deliveredTimeFrom)
        queryParams.set("deliveredTimeTo", af.deliveredTimeTo instanceof Date ? af.deliveredTimeTo.toISOString().split('T')[0] : af.deliveredTimeTo)
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

  // Get organization context for filtering
  const { selectedOrganization } = useOrganization()

  // Get real-time order counts across all pages (filtered by organization)
  const { counts: realTimeCounts, isLoading: countsLoading, error: countsError } = useOrderCounts(10000, selectedOrganization) // Update every 10 seconds
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

  // Scroll indicator effect for table horizontal scrolling
  useEffect(() => {
    const handleScroll = () => {
      const container = tableContainerRef.current
      if (!container) return

      const { scrollLeft, scrollWidth, clientWidth } = container
      const isScrollable = scrollWidth > clientWidth

      if (!isScrollable) {
        setShowLeftShadow(false)
        setShowRightShadow(false)
        return
      }

      // Show left shadow when not at the start
      setShowLeftShadow(scrollLeft > 0)

      // Show right shadow when not at the end (with 1px tolerance)
      setShowRightShadow(scrollLeft + clientWidth < scrollWidth - 1)
    }

    const container = tableContainerRef.current
    if (container) {
      // Initial check
      handleScroll()

      // Add scroll listener
      container.addEventListener('scroll', handleScroll)

      // Add resize listener to recalculate on window resize
      window.addEventListener('resize', handleScroll)

      return () => {
        container.removeEventListener('scroll', handleScroll)
        window.removeEventListener('resize', handleScroll)
      }
    }
  }, []) // Run once on mount, recalculate on scroll and resize events
  // Filter states
  const [searchTerm, setSearchTerm] = useState("")
  const [skuSearchTerm, setSkuSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all-status")
  const [channelFilter, setChannelFilter] = useState("all-channels")


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
  // FMS Extended Filter States
  const [deliveryTypeFilter, setDeliveryTypeFilter] = useState("all-delivery-type")
  const [requestTaxFilter, setRequestTaxFilter] = useState("all-request-tax")
  const [settlementTypeFilter, setSettlementTypeFilter] = useState("all-settlement-type")
  const [dateTypeFilter, setDateTypeFilter] = useState("order-date") // 'order-date' | 'payment-date' | 'delivery-date' | 'shipping-slot'
  const [deliverySlotDateFromFilter, setDeliverySlotDateFromFilter] = useState<Date | undefined>(undefined)
  const [deliverySlotDateToFilter, setDeliverySlotDateToFilter] = useState<Date | undefined>(undefined)
  const [deliveredTimeFromFilter, setDeliveredTimeFromFilter] = useState<Date | undefined>(undefined)
  const [deliveredTimeToFilter, setDeliveredTimeToFilter] = useState<Date | undefined>(undefined)

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
    channel: "all-channels",
    paymentStatus: "all-payment",
    fulfillmentLocationId: "",
    items: "",
  })

  // Bulk selection states
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set())
  const [isAllSelected, setIsAllSelected] = useState(false)

  // Scroll indicator states for horizontal table scroll
  const tableContainerRef = useRef<HTMLDivElement>(null)
  const [showLeftShadow, setShowLeftShadow] = useState(false)
  const [showRightShadow, setShowRightShadow] = useState(false)

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

  // Export dialog state
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [exportDateFrom, setExportDateFrom] = useState<Date | undefined>(undefined)
  const [exportDateTo, setExportDateTo] = useState<Date | undefined>(undefined)

  // 6-month backward limit for export
  const sixMonthsAgo = useMemo(() => {
    const date = new Date()
    date.setMonth(date.getMonth() - 6)
    date.setHours(0, 0, 0, 0)
    return date
  }, [])

  const isDateDisabledForExport = (date: Date) => {
    return date < sixMonthsAgo || date > new Date()
  }

  // Regular single page fetch
  const fetchOrders = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      // Merge all filter values for API request
      const mergedFilters: FilterParams = {
        searchTerm,
        status: statusFilter,
        channel: channelFilter,
        businessUnit: selectedOrganization !== 'ALL' ? selectedOrganization : undefined,
        advancedFilters: {
          ...advancedFilters,
          // Map separate state variables to advancedFilters object
          orderNumber: skuSearchTerm || advancedFilters.orderNumber,
          items: itemNameFilter || advancedFilters.items,
          customerName: customerNameFilter || advancedFilters.customerName,
          email: emailFilter || advancedFilters.email,
          phoneNumber: phoneFilter || advancedFilters.phoneNumber,
          paymentStatus: paymentStatusFilter !== 'all-payment' ? paymentStatusFilter : advancedFilters.paymentStatus,
          fulfillmentLocationId: storeNoFilter !== 'all-stores' ? storeNoFilter : advancedFilters.fulfillmentLocationId,
          orderDateFrom: dateFromFilter || advancedFilters.orderDateFrom,
          orderDateTo: dateToFilter || advancedFilters.orderDateTo,

          // Map extended filters
          // @ts-ignore - Extending interface dynamically
          itemStatus: itemStatusFilter !== 'all-item-status' ? itemStatusFilter : undefined,
          // @ts-ignore
          orderType: orderTypeFilter !== 'all-order-type' ? orderTypeFilter : undefined,
          // @ts-ignore
          deliveryType: deliveryTypeFilter !== 'all-delivery-type' ? deliveryTypeFilter : undefined,
          // @ts-ignore
          requestTax: requestTaxFilter !== 'all-request-tax' ? requestTaxFilter : undefined,
          // @ts-ignore
          settlementType: settlementTypeFilter !== 'all-settlement-type' ? settlementTypeFilter : undefined,
          // @ts-ignore
          deliverySlotDateFrom: deliverySlotDateFromFilter,
          // @ts-ignore
          deliverySlotDateTo: deliverySlotDateToFilter,
          // @ts-ignore
          deliveredTimeFrom: deliveredTimeFromFilter,
          // @ts-ignore
          deliveredTimeTo: deliveredTimeToFilter
        }
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
  }, [currentPage, pageSize, searchTerm, statusFilter, channelFilter, selectedOrganization, advancedFilters])

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
    }
    // } else if (filter.startsWith("Delivery Type:")) {
    //   setDeliveryTypeFilter("all-delivery-type")
    // } else if (filter.startsWith("Request Tax:")) {
    //   setRequestTaxFilter("all-request-tax")
    // } else if (filter.startsWith("Settlement Type:")) {
    //   setSettlementTypeFilter("all-settlement-type")
    // } else if (filter.startsWith("Delivery Time Slot From:")) {
    //   setDeliverySlotDateFromFilter(undefined)
    // } else if (filter.startsWith("Delivery Time Slot To:")) {
    //   setDeliverySlotDateToFilter(undefined)
    // } else if (filter.startsWith("Delivery Date From:")) {
    //   setDeliveredTimeFromFilter(undefined)
    // } else if (filter.startsWith("Delivery Date To:")) {
    //   setDeliveredTimeToFilter(undefined)
    // } else if (filter.startsWith("Date Type:")) {
    //   setDateTypeFilter("order-date")
    // }
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
    // // FMS Extended Filters
    // if (deliveryTypeFilter !== "all-delivery-type") filters.push(`Delivery Type: ${deliveryTypeFilter}`)
    // if (requestTaxFilter !== "all-request-tax") filters.push(`Request Tax: ${requestTaxFilter === 'yes' ? 'Yes' : 'No'}`)
    // if (settlementTypeFilter !== "all-settlement-type") filters.push(`Settlement Type: ${settlementTypeFilter}`)
    // if (deliverySlotDateFromFilter) filters.push(`Delivery Time Slot From: ${format(deliverySlotDateFromFilter, "dd/MM/yyyy")}`)
    // if (deliverySlotDateToFilter) filters.push(`Delivery Time Slot To: ${format(deliverySlotDateToFilter, "dd/MM/yyyy")}`)
    // if (deliveredTimeFromFilter) filters.push(`Delivery Date From: ${format(deliveredTimeFromFilter, "dd/MM/yyyy")}`)
    // if (deliveredTimeToFilter) filters.push(`Delivery Date To: ${format(deliveredTimeToFilter, "dd/MM/yyyy")}`)
    // if (dateTypeFilter !== "order-date") {
    //   const dateTypeLabels: Record<string, string> = {
    //     'payment-date': 'Payment Date',
    //     'delivery-date': 'Delivery Date',
    //     'shipping-slot': 'Shipping Slot'
    //   }
    //   filters.push(`Date Type: ${dateTypeLabels[dateTypeFilter] || dateTypeFilter}`)
    // }

    return filters
  }, [searchTerm, skuSearchTerm, statusFilter, channelFilter, storeNoFilter, paymentStatusFilter, dateFromFilter, dateToFilter, itemNameFilter, customerNameFilter, emailFilter, phoneFilter, itemStatusFilter, paymentMethodFilter, orderTypeFilter, deliveryTypeFilter, requestTaxFilter, settlementTypeFilter, deliverySlotDateFromFilter, deliverySlotDateToFilter, deliveredTimeFromFilter, deliveredTimeToFilter, dateTypeFilter])

  // Count active advanced filters (for badge display)
  const advancedFilterCount = useMemo(() => {
    let count = 0
    if (skuSearchTerm) count++
    if (itemNameFilter) count++
    if (customerNameFilter) count++
    if (emailFilter) count++
    if (phoneFilter) count++
    if (orderTypeFilter !== "all-order-type") count++
    return count
  }, [skuSearchTerm, itemNameFilter, customerNameFilter, emailFilter, phoneFilter, orderTypeFilter])

  // Reset all filters
  const handleResetAllFilters = () => {
    setSearchTerm("")
    setSkuSearchTerm("")
    setStatusFilter("all-status")
    setChannelFilter("all-channels")
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
    // setOrderTypeFilter("all-order-type")
    // // Reset FMS extended filters
    // setDeliveryTypeFilter("all-delivery-type")
    // setRequestTaxFilter("all-request-tax")
    // setSettlementTypeFilter("all-settlement-type")
    // setDateTypeFilter("order-date")
    // setDeliverySlotDateFromFilter(undefined)
    // setDeliverySlotDateToFilter(undefined)
    // setDeliveredTimeFromFilter(undefined)
    // setDeliveredTimeToFilter(undefined)
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
  // Updated colors to meet WCAG AA contrast requirements (4.5:1 for normal text)
  function getUrgencyRowStyle(urgencyLevel: string): string {
    switch (urgencyLevel) {
      case "critical":
        return "bg-red-100 border-l-4 border-l-red-600 hover:bg-red-150 text-gray-900"
      case "warning":
        return "bg-orange-100 border-l-4 border-l-orange-600 hover:bg-orange-150 text-gray-900"
      case "approaching":
        return "bg-yellow-100 border-l-4 border-l-yellow-600 hover:bg-yellow-150 text-gray-900"
      default:
        return "hover:bg-gray-50"
    }
  }

  // Helper to format delivery time slot for display
  function formatDeliveryTimeSlot(slot?: { date: string; from: string; to: string }): string {
    if (!slot) return ""
    return `${slot.date} ${slot.from}-${slot.to}`
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
      // Customer Fields
      customerName: order.customer?.name ?? "",
      customerEmail: order.customer?.email ?? "",
      customerPhone: order.customer?.phone ?? "",
      // Store Field
      storeNo: order.metadata?.store_no ?? order.store_no ?? "",
      // FMS Extended Fields
      orderType: order.orderType ?? order.order_type ?? "",
      deliveryType: order.deliveryType ?? "",
      paymentType: order.paymentType ?? "",
      requestTax: order.fullTaxInvoice ?? false,
      deliveryTimeSlot: formatDeliveryTimeSlot(order.deliveryTimeSlot),
      deliveredTime: order.deliveredTime ? formatGMT7DateTime(order.deliveredTime) : "",
      settlementType: order.settlementType ?? "",
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

    // Date range filter (respects dateTypeFilter selection)
    if (dateFromFilter || dateToFilter) {
      // Determine which date field to use based on dateTypeFilter
      let dateFieldValue: string | undefined
      switch (dateTypeFilter) {
        case 'payment-date':
          dateFieldValue = order.paymentDate || order.payment_info?.transaction_id // Use transaction date as fallback
          break
        case 'delivery-date':
          dateFieldValue = order.deliveryDate || order.deliveredTime
          break
        case 'shipping-slot':
          dateFieldValue = order.deliveryTimeSlot?.date
          break
        case 'order-date':
        default:
          dateFieldValue = order.order_date || order.metadata?.created_at
          break
      }

      if (dateFieldValue) {
        const targetDate = getGMT7Time(dateFieldValue)

        if (dateFromFilter) {
          const fromDate = getGMT7Time(dateFromFilter)
          if (targetDate < fromDate) return false
        }

        if (dateToFilter) {
          const toDate = getGMT7Time(dateToFilter)
          toDate.setHours(23, 59, 59, 999) // Include the entire day
          if (targetDate > toDate) return false
        }
      } else {
        // If the selected date type doesn't exist on the order, filter it out when date filters are active
        if (dateTypeFilter !== 'order-date') return false
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

    // Order Type filter (mapped to deliveryTypeCode)
    if (orderTypeFilter && orderTypeFilter !== "all-order-type") {
      if (order.deliveryTypeCode !== orderTypeFilter) {
        return false
      }
    }

    // // Delivery Type filter (FMS)
    // if (deliveryTypeFilter && deliveryTypeFilter !== "all-delivery-type") {
    //   if (order.deliveryType !== deliveryTypeFilter) {
    //     return false
    //   }
    // }

    // // Request Tax filter (FMS) - uses fullTaxInvoice boolean
    // if (requestTaxFilter && requestTaxFilter !== "all-request-tax") {
    //   const wantsTaxInvoice = requestTaxFilter === "yes"
    //   if (order.fullTaxInvoice !== wantsTaxInvoice) {
    //     return false
    //   }
    // }

    // // Settlement Type filter (FMS)
    // if (settlementTypeFilter && settlementTypeFilter !== "all-settlement-type") {
    //   if (order.settlementType !== settlementTypeFilter) {
    //     return false
    //   }
    // }

    // // Delivery Slot Date Range filter (FMS)
    // if (deliverySlotDateFromFilter || deliverySlotDateToFilter) {
    //   const slotDateValue = order.deliveryTimeSlot?.date
    //   if (slotDateValue) {
    //     const slotDate = getGMT7Time(slotDateValue)

    //     if (deliverySlotDateFromFilter) {
    //       const fromDate = getGMT7Time(deliverySlotDateFromFilter)
    //       if (slotDate < fromDate) return false
    //     }

    //     if (deliverySlotDateToFilter) {
    //       const toDate = getGMT7Time(deliverySlotDateToFilter)
    //       toDate.setHours(23, 59, 59, 999) // Include entire day
    //       if (slotDate > toDate) return false
    //     }
    //   } else {
    //     // Filter out orders without delivery slot data when filter is active
    //     return false
    //   }
    // }

    // // Delivered Time Date Range filter (FMS)
    // if (deliveredTimeFromFilter || deliveredTimeToFilter) {
    //   const deliveredTimeValue = order.deliveredTime
    //   if (deliveredTimeValue) {
    //     const deliveredDate = getGMT7Time(deliveredTimeValue)

    //     if (deliveredTimeFromFilter) {
    //       const fromDate = getGMT7Time(deliveredTimeFromFilter)
    //       if (deliveredDate < fromDate) return false
    //     }

    //     if (deliveredTimeToFilter) {
    //       const toDate = getGMT7Time(deliveredTimeToFilter)
    //       toDate.setHours(23, 59, 59, 999) // Include entire day
    //       if (deliveredDate > toDate) return false
    //     }
    //   } else {
    //     // Filter out orders without delivered time data when filter is active
    //     return false
    //   }
    // }

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

    if (advancedFilters.channel && advancedFilters.channel !== "all-channels") {
      if (order.channel?.toUpperCase() !== advancedFilters.channel.toUpperCase()) {
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

    // Format date for FMS export: DD-MM-YYYY HH:mm:ss
    const formatDateForFMSExport = (dateString: string | undefined): string => {
      if (!dateString) return ""
      try {
        const date = new Date(dateString)
        const day = String(date.getDate()).padStart(2, '0')
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const year = date.getFullYear()
        const hours = String(date.getHours()).padStart(2, '0')
        const minutes = String(date.getMinutes()).padStart(2, '0')
        const seconds = String(date.getSeconds()).padStart(2, '0')
        return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`
      } catch {
        return dateString || ""
      }
    }

    // Format delivery time slot for FMS export: DD-MM-YYYY HH:mm-HH:mm
    const formatDeliveryTimeSlotForFMSExport = (slot?: { date: string; from: string; to: string }): string => {
      if (!slot) return ""
      try {
        const [year, month, day] = slot.date.split('-')
        return `${day}-${month}-${year} ${slot.from}-${slot.to}`
      } catch {
        return `${slot.date} ${slot.from}-${slot.to}`
      }
    }

    // Format number to 2 decimal places
    const formatAmount = (value: number | undefined | null): string => {
      if (value === null || value === undefined) return "0.00"
      return value.toFixed(2)
    }

    // FMS 19-column header row (exact format from Order Fulfillment.xlsx)
    const headers = [
      "Order No",
      "Store Id",
      "Store Name",
      "Status",
      // "Request Full Tax",
      "Customer Name",
      // "Order Type",
      // "Delivery Type",
      "Order Date",
      // "Payment Date",
      // "Delivery Time Slot",
      // "Delivery Date",
      // "Payment Type",
      // "Customer Pay Amount",
      // "Customer Redeem Amount",
      // "Order Delivery Fee",
      // "VAT Amount",
      // "Discount",
      "Total Amount"
    ]

    // Map orders to FMS CSV rows
    const rows = orders.map(order => [
      escapeCSV(order.order_no),
      escapeCSV(order.metadata?.store_no || ""),
      escapeCSV(order.metadata?.store_name || ""),
      escapeCSV(order.status),
      // escapeCSV(order.fullTaxInvoice ? "Yes" : "No"),
      escapeCSV(order.customer?.name || ""),
      // escapeCSV(order.orderType || order.order_type || ""),
      // escapeCSV(order.deliveryType || ""),
      escapeCSV(formatDateForFMSExport(order.order_date || order.metadata?.created_at)),
      // escapeCSV(formatDateForFMSExport(order.paymentDate)),
      // escapeCSV(formatDeliveryTimeSlotForFMSExport(order.deliveryTimeSlot)),
      // escapeCSV(order.status === "DELIVERED" ? formatDateForFMSExport(order.deliveryDate || order.deliveredTime) : ""),
      // escapeCSV(order.paymentType || order.payment_info?.method || ""),
      // escapeCSV(formatAmount(order.customerPayAmount ?? order.total_amount)),
      // escapeCSV(formatAmount(order.customerRedeemAmount)),
      // escapeCSV(formatAmount(order.orderDeliveryFee)),
      // escapeCSV(formatAmount(order.payment_info?.taxes)),
      // escapeCSV(formatAmount(order.payment_info?.discounts ? Math.abs(order.payment_info.discounts) : 0)),
      escapeCSV(formatAmount(order.total_amount))
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

  // Export Handler Function - opens dialog
  const handleExportSearchResults = async () => {
    setShowExportDialog(true)
  }

  // Export Handler with Date Range
  const handleExportWithDateRange = async () => {
    if (!exportDateFrom) {
      toast({
        title: "Date Required",
        description: "Please select an Order Date From to export.",
        variant: "destructive",
      })
      return
    }

    setIsExporting(true)
    try {
      // Filter orders based on export date range
      const ordersToExport = filteredOrders.filter(order => {
        const orderDate = new Date(order.order_date || order.metadata?.created_at || '')
        if (exportDateFrom && orderDate < exportDateFrom) return false
        if (exportDateTo && orderDate > exportDateTo) return false
        return true
      })

      exportOrdersToCSV(ordersToExport)
      setShowExportDialog(false)

      toast({
        title: "Export Successful",
        description: `Exported ${ordersToExport.length} order(s) to CSV.`,
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
      <div
        ref={tableContainerRef}
        className={cn(
          "overflow-x-auto transition-shadow duration-300",
          showLeftShadow && "shadow-[inset_10px_0_8px_-8px_rgba(0,0,0,0.15)]",
          showRightShadow && "shadow-[inset_-10px_0_8px_-8px_rgba(0,0,0,0.15)]",
          showLeftShadow && showRightShadow && "shadow-[inset_10px_0_8px_-8px_rgba(0,0,0,0.15),inset_-10px_0_8px_-8px_rgba(0,0,0,0.15)]"
        )}
      >
        <Table>
          <TableHeader className="bg-light-gray">
            <TableRow className="hover:bg-light-gray/80 border-b border-medium-gray">
              <TableHead className="font-heading text-deep-navy min-w-[140px] text-sm font-semibold">
                Order Number
              </TableHead>
              <TableHead className="font-heading text-deep-navy min-w-[140px] text-sm font-semibold">
                Customer Name
              </TableHead>
              <TableHead className="font-heading text-deep-navy min-w-[180px] text-sm font-semibold">
                Email
              </TableHead>
              <TableHead className="font-heading text-deep-navy min-w-[120px] text-sm font-semibold">
                Phone Number
              </TableHead>
              <TableHead className="font-heading text-deep-navy min-w-[100px] text-sm font-semibold">
                Order Total
              </TableHead>
              <TableHead className="font-heading text-deep-navy min-w-[100px] text-sm font-semibold">
                Store No
              </TableHead>
              <TableHead className="font-heading text-deep-navy min-w-[120px] text-sm font-semibold">
                Order Status
              </TableHead>
              <TableHead className="font-heading text-deep-navy min-w-[120px] text-sm font-semibold">
                SLA Status
              </TableHead>
              <TableHead className="font-heading text-deep-navy min-w-[120px] text-sm font-semibold">
                Return Status
              </TableHead>
              <TableHead className="font-heading text-deep-navy min-w-[80px] text-sm font-semibold">On Hold</TableHead>
              <TableHead className="font-heading text-deep-navy min-w-[120px] text-sm font-semibold">
                Order Type
              </TableHead>
              <TableHead className="font-heading text-deep-navy min-w-[120px] text-sm font-semibold">
                Payment Status
              </TableHead>
              <TableHead className="font-heading text-deep-navy min-w-[100px] text-sm font-semibold">
                Confirmed
              </TableHead>
              <TableHead className="font-heading text-deep-navy min-w-[120px] text-sm font-semibold">
                Channel
              </TableHead>
              {/* FMS Extended Columns (commented out) */}
              {/* <TableHead className="font-heading text-deep-navy min-w-[100px] text-sm font-semibold">
                Delivery Type
              </TableHead>
              <TableHead className="font-heading text-deep-navy min-w-[130px] text-sm font-semibold">
                Payment Type
              </TableHead>
              <TableHead className="font-heading text-deep-navy min-w-[90px] text-sm font-semibold">
                Request Tax
              </TableHead>
              <TableHead className="font-heading text-deep-navy min-w-[150px] text-sm font-semibold">
                Delivery Time Slot
              </TableHead>
              <TableHead className="font-heading text-deep-navy min-w-[130px] text-sm font-semibold">
                Delivered Time
              </TableHead>
              <TableHead className="font-heading text-deep-navy min-w-[110px] text-sm font-semibold">
                Settlement Type
              </TableHead> */}
              {/* End FMS Extended Columns */}
              <TableHead className="font-heading text-deep-navy min-w-[140px] text-sm font-semibold">
                Allow Substitution
              </TableHead>
              <TableHead className="font-heading text-deep-navy min-w-[150px] text-sm font-semibold">
                Created Date
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ordersToShow.length === 0 ? (
              <TableRow>
                <TableCell colSpan={16} className="text-center py-8">
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
                    <TableCell>{order.customerName || "-"}</TableCell>
                    <TableCell className="max-w-[180px] truncate" title={order.customerEmail || ""}>{order.customerEmail || "-"}</TableCell>
                    <TableCell>{order.customerPhone || "-"}</TableCell>
                    <TableCell>฿{order.total_amount?.toLocaleString() || "0"}</TableCell>
                    <TableCell className="whitespace-nowrap">{order.storeNo || "-"}</TableCell>
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
                      <OrderTypeBadge orderType={order.orderType} />
                    </TableCell>
                    <TableCell>
                      <PaymentStatusBadge status={order.paymentStatus} />
                    </TableCell>
                    <TableCell>{order.confirmed ? "Yes" : "No"}</TableCell>
                    <TableCell>
                      <ChannelBadge channel={order.channel} />
                    </TableCell>
                    {/* FMS Extended Column Data (commented out) */}
                    {/* <TableCell>
                      <DeliveryTypeBadge deliveryType={order.deliveryType} />
                    </TableCell>
                    <TableCell>
                      <PaymentTypeBadge paymentType={order.paymentType} />
                    </TableCell>
                    <TableCell>
                      <RequestTaxBadge requestTax={order.requestTax} />
                    </TableCell>
                    <TableCell>{order.deliveryTimeSlot || "-"}</TableCell>
                    <TableCell>{order.deliveredTime || "-"}</TableCell>
                    <TableCell>
                      <SettlementTypeBadge settlementType={order.settlementType} />
                    </TableCell> */}
                    {/* End FMS Extended Column Data */}
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
            <CardTitle className="text-2xl font-bold text-deep-navy font-heading">Order Management</CardTitle>
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
          {/* <div className="mt-4 flex items-center gap-4 text-xs">
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
          </div> */}


          {/* Main Filters Section - Reorganized with visual groups */}
          <div className="mt-3 space-y-4">
            {/* Row 1: Full-width Search */}
            <div className="relative">
              <Input
                placeholder="Search by order #, customer name, email, phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 h-11 text-base"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              {searchTerm && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearchTerm("")}
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-transparent"
                >
                  <X className="h-4 w-4 text-gray-400" />
                  <span className="sr-only">Clear search</span>
                </Button>
              )}
            </div>

            {/* Filter Groups - Responsive wrapping with larger gaps */}
            <div className="flex flex-wrap gap-3 items-center xl:flex-nowrap overflow-x-auto md:overflow-visible">
              {/* Order Filters Group */}
              <div className="flex items-center gap-1 p-2 border border-border/60 rounded-md bg-muted/10 shadow-sm hover:border-border/80 transition-colors flex-shrink-0">
                <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">Order</span>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="h-9 min-w-[110px] border-0 bg-transparent focus:ring-0">
                    <SelectValue placeholder="Status" />
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
                <div className="h-5 w-px bg-border/60" />
                <Select value={storeNoFilter} onValueChange={setStoreNoFilter}>
                  <SelectTrigger className="h-9 min-w-[120px] border-0 bg-transparent focus:ring-0">
                    <SelectValue placeholder="Store" />
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
                <div className="h-5 w-px bg-border/60" />
                <Select value={channelFilter} onValueChange={setChannelFilter}>
                  <SelectTrigger className="h-9 min-w-[140px] border-0 bg-transparent focus:ring-0">
                    <SelectValue placeholder="Channel" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-channels">All Channels</SelectItem>
                    <SelectItem value="WEB">Web</SelectItem>
                    <SelectItem value="LAZADA">Lazada</SelectItem>
                    <SelectItem value="SHOPEE">Shopee</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Payment Filters Group */}
              <div className="flex items-center gap-1 p-2 border border-border/60 rounded-md bg-muted/10 shadow-sm hover:border-border/80 transition-colors flex-shrink-0">
                <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">Payment</span>
                <Select value={paymentStatusFilter} onValueChange={setPaymentStatusFilter}>
                  <SelectTrigger className="h-9 min-w-[110px] border-0 bg-transparent focus:ring-0">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-payment">All Status</SelectItem>
                    <SelectItem value="PAID">Paid</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="FAILED">Failed</SelectItem>
                  </SelectContent>
                </Select>
                <div className="h-5 w-px bg-border/60" />
                <Select value={paymentMethodFilter} onValueChange={setPaymentMethodFilter}>
                  <SelectTrigger className="h-9 min-w-[150px] border-0 bg-transparent focus:ring-0">
                    <SelectValue placeholder="Method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-payment-method">All Methods</SelectItem>
                    <SelectItem value="CASH_ON_DELIVERY">Cash on Delivery</SelectItem>
                    <SelectItem value="CREDIT_CARD_ON_DELIVERY">Credit Card on Delivery</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Order Date Group */}
              <div className="flex items-center gap-1 p-2 border border-border/60 rounded-md bg-muted/10 shadow-sm hover:border-border/80 transition-colors flex-shrink-0">
                <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">Order Date</span>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      className={cn(
                        "h-9 min-w-[88px] justify-start text-left font-normal px-2",
                        !dateFromFilter && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateFromFilter ? format(dateFromFilter, "dd/MM/yyyy") : "From"}
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
                <span className="text-muted-foreground">-</span>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      className={cn(
                        "h-9 min-w-[88px] justify-start text-left font-normal px-2",
                        !dateToFilter && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateToFilter ? format(dateToFilter, "dd/MM/yyyy") : "To"}
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

            {/* Active Filters Summary Bar */}
            {generateActiveFilters.length > 0 && (
              <div className="flex flex-wrap gap-2 items-center py-2 px-3 bg-muted/20 rounded-md border border-border/30">
                <span className="text-xs font-medium text-muted-foreground">Active filters:</span>
                {generateActiveFilters.map((filter, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="text-xs font-normal cursor-pointer hover:bg-secondary/80"
                    onClick={() => removeFilter(filter)}
                  >
                    {filter}
                    <X className="ml-1 h-3 w-3" />
                  </Badge>
                ))}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleResetAllFilters}
                  className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground hover:bg-gray-100"
                >
                  Clear All
                </Button>
              </div>
            )}
          </div>

          {/* Advanced Filters Collapsible Section */}
          <Collapsible open={showAdvancedFilters} onOpenChange={setShowAdvancedFilters} className="mt-4">
            <CollapsibleTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 hover:bg-primary/5 transition-colors border-primary/30"
              >
                <Filter className="h-4 w-4" />
                {showAdvancedFilters ? "Hide Advanced Filters" : "Show Advanced Filters"}
                {advancedFilterCount > 0 && !showAdvancedFilters && (
                  <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                    {advancedFilterCount}
                  </Badge>
                )}
                {showAdvancedFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-3">
              <div className="p-4 bg-muted/30 border border-border/40 rounded-lg space-y-4">
                {/* Product Search Group */}
                <div>
                  <div className="text-xs font-medium text-muted-foreground mb-2">Product Search</div>
                  <div className="flex flex-wrap gap-3">
                    <div className="flex items-center gap-2 p-2 border border-border/40 rounded-md bg-background min-w-[200px]">
                      <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">SKU</span>
                      <div className="relative flex-1">
                        <Input
                          placeholder="Search by SKU..."
                          value={skuSearchTerm}
                          onChange={(e) => setSkuSearchTerm(e.target.value)}
                          className="h-8 pl-8 pr-2 border-0 bg-transparent focus-visible:ring-0"
                        />
                        <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-2 border border-border/40 rounded-md bg-background min-w-[200px]">
                      <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">Item</span>
                      <Input
                        placeholder="Search by item name..."
                        value={itemNameFilter}
                        onChange={(e) => setItemNameFilter(e.target.value)}
                        className="h-8 border-0 bg-transparent focus-visible:ring-0"
                      />
                    </div>
                  </div>
                </div>

                {/* Customer Search Group */}
                <div>
                  <div className="text-xs font-medium text-muted-foreground mb-2">Customer Search</div>
                  <div className="flex flex-wrap gap-3">
                    <div className="flex items-center gap-2 p-2 border border-border/40 rounded-md bg-background min-w-[200px]">
                      <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">Name</span>
                      <Input
                        placeholder="Customer name..."
                        value={customerNameFilter}
                        onChange={(e) => setCustomerNameFilter(e.target.value)}
                        className="h-8 border-0 bg-transparent focus-visible:ring-0"
                      />
                    </div>
                    <div className="flex items-center gap-2 p-2 border border-border/40 rounded-md bg-background min-w-[200px]">
                      <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">Email</span>
                      <Input
                        placeholder="Email address..."
                        value={emailFilter}
                        onChange={(e) => setEmailFilter(e.target.value)}
                        className="h-8 border-0 bg-transparent focus-visible:ring-0"
                      />
                    </div>
                    <div className="flex items-center gap-2 p-2 border border-border/40 rounded-md bg-background min-w-[200px]">
                      <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">Phone</span>
                      <Input
                        placeholder="Phone number..."
                        value={phoneFilter}
                        onChange={(e) => setPhoneFilter(e.target.value)}
                        className="h-8 border-0 bg-transparent focus-visible:ring-0"
                      />
                    </div>
                  </div>
                </div>

                {/* Order Details Group */}
                <div>
                  <div className="text-xs font-medium text-muted-foreground mb-2">Order Details</div>
                  <div className="flex flex-wrap gap-3">
                    <div className="flex items-center gap-2 p-2 border border-border/40 rounded-md bg-background min-w-[160px]">
                      <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">Type</span>
                      <Select value={orderTypeFilter} onValueChange={setOrderTypeFilter}>
                        <SelectTrigger className="h-8 min-w-[120px] border-0 bg-transparent focus:ring-0">
                          <SelectValue placeholder="All Types" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all-order-type">All Types</SelectItem>
                          <SelectItem value="RT-HD-EXP">RT-HD-EXP</SelectItem>
                          <SelectItem value="RT-CC-STD">RT-CC-STD</SelectItem>
                          <SelectItem value="MKP-HD-STD">MKP-HD-STD</SelectItem>
                          <SelectItem value="RT-HD-STD">RT-HD-STD</SelectItem>
                          <SelectItem value="RT-CC-EXP">RT-CC-EXP</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
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
                Loading orders...
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
                <div className="flex items-center justify-between">
                  {lastUpdated && (
                    <p className="text-sm text-steel-gray">Last updated: {lastUpdated}</p>
                  )}
                </div>
                <PaginationControls
                  currentPage={currentPage}
                  totalPages={pagination.totalPages}
                  pageSize={pageSize}
                  totalItems={pagination.total}
                  onPageChange={handlePageChange}
                  onPageSizeChange={handlePageSizeChange}
                />
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

      {/* Export Dialog */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Export Orders</DialogTitle>
            <DialogDescription>
              Select date range for export. Export is limited to the last 6 months from today.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Info message about 6-month limit */}
            <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 p-3 rounded-md">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>Export date range is limited to the last 6 months from today.</span>
            </div>

            {/* Date Type Selector */}
            <div className="space-y-2">
              <Label htmlFor="export-date-type">Date Type</Label>
              <Select value={dateTypeFilter} onValueChange={setDateTypeFilter}>
                <SelectTrigger id="export-date-type" className="h-11">
                  <SelectValue placeholder="Order Date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="order-date">Order Date</SelectItem>
                  <SelectItem value="payment-date">Payment Date</SelectItem>
                  <SelectItem value="delivery-date">Delivery Date</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date From Picker with 6-month restriction */}
            <div className="space-y-2">
              <Label htmlFor="export-date-from">Order Date From *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal h-11",
                      !exportDateFrom && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {exportDateFrom ? format(exportDateFrom, "dd/MM/yyyy") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={exportDateFrom}
                    onSelect={setExportDateFrom}
                    disabled={isDateDisabledForExport}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Date To Picker */}
            <div className="space-y-2">
              <Label htmlFor="export-date-to">Order Date To</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal h-11",
                      !exportDateTo && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {exportDateTo ? format(exportDateTo, "dd/MM/yyyy") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={exportDateTo}
                    onSelect={setExportDateTo}
                    disabled={(date) => date > new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowExportDialog(false)}
              disabled={isExporting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleExportWithDateRange}
              disabled={isExporting || !exportDateFrom}
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
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
