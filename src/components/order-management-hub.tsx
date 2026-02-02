"use client"

import { useState, useEffect, useCallback, useMemo, useRef } from "react"
import { useRouter } from "next/navigation"
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
  // SLABadge, // Disabled SLA elements
  DeliveryTypeBadge,
  SettlementTypeBadge,
  RequestTaxBadge,
  OrderTypeBadge,
  PaymentTypeBadge,
} from "./order-badges"
import { RefreshCw, X, Filter, Loader2, AlertCircle, Download, Search, Clock, Package, PauseCircle, ChevronDown, ChevronUp, CalendarIcon, CheckCircle, GripVertical, RotateCcw } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
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
import { EnhancedCalendar } from "@/components/ui/enhanced-calendar"
import { Switch } from "@/components/ui/switch"
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
  subdistrict?: string
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
  // Product Variant Fields
  secretCode?: string  // Secret code for gift items
  style?: string  // Product style variant
  color?: string  // Product color
  size?: string  // Product size
  // Additional Product Fields
  reason?: string  // Reason code or description
  temperature?: string  // Temperature requirement (e.g., "Frozen", "Chilled")
  expiry?: string  // Expiry date
}

// FMS Extended Fields - Delivery Time Slot
export interface DeliveryTimeSlot {
  date: string
  from: string
  to: string
}

// FMS Order Type values - UNIFIED with 7 correct values (chore-ae72224b)
export type FMSOrderType = 'Return Order' | 'MKP-HD-STD' | 'RT-HD-EXP' | 'RT-CC-STD' | 'RT-MIX-STD' | 'RT-HD-STD' | 'RT-CC-EXP'

// FMS Delivery Type values
export type FMSDeliveryType = 'Standard Delivery' | 'Express Delivery' | 'Click & Collect'

// FMS Settlement Type values
export type FMSSettlementType = 'Auto Settle' | 'Manual Settle'

// DEPRECATED: DeliveryTypeCode merged into FMSOrderType (chore-ae72224b)
// export type DeliveryTypeCode = 'RT-HD-EXP' | 'RT-CC-STD' | 'MKP-HD-STD' | 'RT-HD-STD' | 'RT-CC-EXP' | 'RT-MIX-STD'
export type DeliveryTypeCode = FMSOrderType  // Alias for backward compatibility

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
  // DEPRECATED: Use orderType instead (chore-ae72224b)
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
  // Billing Information Fields
  billingName?: string
  billingAddress?: {
    street?: string
    subdistrict?: string
    city?: string
    state?: string
    postal_code?: string
    country?: string
  }
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

// Column configuration for drag-and-drop reordering
interface ColumnConfig {
  id: string
  label: string
  minWidth: string
  align?: 'left' | 'center' | 'right'
  visible: boolean
}

// Default column order configuration
const DEFAULT_COLUMNS: ColumnConfig[] = [
  { id: 'orderNumber', label: 'Order Number', minWidth: '160px', visible: true },
  { id: 'customerName', label: 'Customer Name', minWidth: '150px', visible: true },
  { id: 'email', label: 'Email', minWidth: '200px', visible: true },
  { id: 'phone', label: 'Phone Number', minWidth: '130px', visible: true },
  { id: 'total', label: 'Order Total', minWidth: '110px', align: 'right', visible: true },
  { id: 'storeNo', label: 'Store No', minWidth: '100px', align: 'center', visible: true },
  { id: 'status', label: 'Order Status', minWidth: '130px', visible: true },
  { id: 'returnStatus', label: 'Return Status', minWidth: '120px', visible: true },
  { id: 'onHold', label: 'On Hold', minWidth: '80px', visible: true },
  { id: 'orderType', label: 'Order Type', minWidth: '120px', visible: true },
  { id: 'paymentStatus', label: 'Payment Status', minWidth: '130px', visible: true },
  { id: 'channel', label: 'Channel', minWidth: '110px', visible: true },
  { id: 'allowSubstitution', label: 'Allow Substitution', minWidth: '140px', visible: true },
  { id: 'createdDate', label: 'Created Date', minWidth: '160px', visible: true },
]

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

        // Check if this is a MAO order (starts with 'W' or 'CDS') - used to skip demo data modifications
        const isMaoOrder = apiOrder.id?.startsWith('W') || apiOrder.order_no?.startsWith('W') ||
                           apiOrder.id?.startsWith('CDS') || apiOrder.order_no?.startsWith('CDS')

        // Financial fields - EXCLUDE MAO orders (they have their own payment data)
        if (!isMaoOrder) {
          const hasRedemption = index % 3 === 0 // ~30% of orders
          demoOrder.customerRedeemAmount = hasRedemption ? Math.floor(Math.random() * 500) : 0
          demoOrder.orderDeliveryFee = [0, 40, 60, 80][index % 4]
          demoOrder.customerPayAmount = (demoOrder.total_amount || 0) - (demoOrder.customerRedeemAmount || 0)
        }

        // Generate random orderType using the UNIFIED 7 values (chore-ae72224b)
        // EXCLUDE MAO orders (they have their own orderType from Manhattan OMS)
        if (!isMaoOrder) {
          const fmsOrderTypes: FMSOrderType[] = ['Return Order', 'MKP-HD-STD', 'RT-HD-EXP', 'RT-CC-STD', 'RT-MIX-STD', 'RT-HD-STD', 'RT-CC-EXP']
          // Return orders should be ~10% of total
          demoOrder.orderType = index % 10 === 0 ? 'Return Order' : fmsOrderTypes[(index % 6) + 1]
          // DEPRECATED: deliveryTypeCode - set to same as orderType for backward compatibility
          demoOrder.deliveryTypeCode = demoOrder.orderType
        }

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

  // Router for navigation
  const router = useRouter()

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

  // Column reordering state
  const [columnOrder, setColumnOrder] = useState<ColumnConfig[]>(DEFAULT_COLUMNS)
  const [draggedColumn, setDraggedColumn] = useState<string | null>(null)
  const [stickyHeader, setStickyHeader] = useState(true)
  const [isReorderMode, setIsReorderMode] = useState(false)
  const [columnSettingsOpen, setColumnSettingsOpen] = useState(false)

  // Reset columns to default order
  const handleResetColumns = () => {
    setColumnOrder(DEFAULT_COLUMNS)
  }

  // Toggle column visibility
  const handleToggleColumnVisibility = (columnId: string) => {
    setColumnOrder(prev => prev.map(col =>
      col.id === columnId ? { ...col, visible: !col.visible } : col
    ))
  }

  // Show all columns
  const handleShowAllColumns = () => {
    setColumnOrder(prev => prev.map(col => ({ ...col, visible: true })))
  }

  // Drag and drop handlers for column reordering in popover list
  const handleDragStart = (e: React.DragEvent, columnId: string) => {
    setDraggedColumn(columnId)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', columnId)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e: React.DragEvent, targetColumnId: string) => {
    e.preventDefault()
    if (!draggedColumn || draggedColumn === targetColumnId) {
      setDraggedColumn(null)
      return
    }

    const newOrder = [...columnOrder]
    const draggedIndex = newOrder.findIndex(col => col.id === draggedColumn)
    const targetIndex = newOrder.findIndex(col => col.id === targetColumnId)

    if (draggedIndex !== -1 && targetIndex !== -1) {
      const [removed] = newOrder.splice(draggedIndex, 1)
      newOrder.splice(targetIndex, 0, removed)
      setColumnOrder(newOrder)
    }
    setDraggedColumn(null)
  }

  const handleDragEnd = () => {
    setDraggedColumn(null)
  }

  // Get visible columns only
  const visibleColumns = columnOrder.filter(col => col.visible)

  // Render cell content based on column id
  const renderCellContent = (order: any, columnId: string) => {
    switch (columnId) {
      case 'orderNumber':
        return (
          <button
            onClick={() => handleOrderRowClick(order._originalOrder || ordersData.find((o) => o.id === order.id) || order)}
            className="font-medium text-blue-600 hover:text-blue-800 hover:underline text-left"
          >
            {order.id}
          </button>
        )
      case 'customerName':
        return (
          <span className="block whitespace-nowrap" title={order.customerName || ""}>
            {order.customerName || "-"}
          </span>
        )
      case 'email':
        return (
          <span className="block whitespace-nowrap" title={order.customerEmail || ""}>
            {order.customerEmail || "-"}
          </span>
        )
      case 'phone':
        return <span className="font-mono">{order.customerPhone || "-"}</span>
      case 'total':
        return <span className="font-semibold">฿{order.total_amount?.toLocaleString() || "0"}</span>
      case 'storeNo':
        return order.storeNo || ""
      case 'status':
        return <OrderStatusBadge status={order.status} />
      case 'returnStatus':
        return <ReturnStatusBadge status={order.returnStatus} />
      case 'onHold':
        return <OnHoldBadge onHold={order.onHold} />
      case 'orderType':
        return <OrderTypeBadge orderType={order.orderType} />
      case 'paymentStatus':
        return <PaymentStatusBadge status={order.paymentStatus} />
      case 'channel':
        return <ChannelBadge channel={order.channel} />
      case 'allowSubstitution':
        return order.allowSubstitution ? <CheckCircle className="h-4 w-4 text-green-600" /> : null
      case 'createdDate':
        return <span className="whitespace-nowrap">{order.createdDate}</span>
      default:
        return "-"
    }
  }

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



  // Order Detail Click Handler - Navigate to dedicated order detail page
  const handleOrderRowClick = (order: Order) => {
    router.push(`/orders/${order.id}`)
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

  // Data states
  const [ordersData, setOrdersData] = useState<Order[]>([])

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
    // let slaInfo = order.sla_info // Disabled SLA elements
    const urgencyLevel = getOrderUrgencyLevel(order)

    return {
      id: order.id,
      orderNo: order.order_no,
      total_amount: order.total_amount,
      sellingLocationId: order.metadata?.store_name ?? "",
      status: order.status,
      // slaStatus: slaInfo ?? "", // Disabled SLA elements
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

    // Order Type filter - uses unified orderType field (chore-ae72224b)
    if (orderTypeFilter && orderTypeFilter !== "all-order-type") {
      if (order.orderType !== orderTypeFilter) {
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
      <>
        {/* Table Settings Controls */}
        <div className="flex items-center justify-end gap-4 mb-3 px-1">
          <div className="flex items-center gap-2">
            <Switch
              id="sticky-header"
              checked={stickyHeader}
              onCheckedChange={setStickyHeader}
            />
            <Label htmlFor="sticky-header" className="text-sm text-muted-foreground cursor-pointer">
              Sticky
            </Label>
          </div>
          <Popover open={columnSettingsOpen} onOpenChange={setColumnSettingsOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1.5"
              >
                <GripVertical className="h-4 w-4" />
                Columns
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-72 p-0" align="end">
              <div className="p-3 border-b">
                <h4 className="font-semibold text-sm">Columns</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Drag to reorder, toggle to show/hide
                </p>
              </div>
              <div className="max-h-[300px] overflow-y-auto p-2">
                {columnOrder.map((column) => (
                  <div
                    key={column.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, column.id)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, column.id)}
                    onDragEnd={handleDragEnd}
                    className={cn(
                      "flex items-center gap-2 p-2 rounded-md cursor-grab hover:bg-gray-100 transition-colors",
                      draggedColumn === column.id && "opacity-50 bg-blue-50"
                    )}
                  >
                    <GripVertical className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <Switch
                      id={`col-${column.id}`}
                      checked={column.visible}
                      onCheckedChange={() => handleToggleColumnVisibility(column.id)}
                      className="data-[state=checked]:bg-blue-600"
                    />
                    <Label
                      htmlFor={`col-${column.id}`}
                      className={cn(
                        "text-sm cursor-pointer flex-1",
                        !column.visible && "text-muted-foreground"
                      )}
                    >
                      {column.label}
                    </Label>
                  </div>
                ))}
              </div>
              <div className="p-2 border-t flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleShowAllColumns}
                  className="flex-1 text-xs"
                >
                  Show All
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleResetColumns}
                  className="flex-1 text-xs"
                >
                  <RotateCcw className="h-3 w-3 mr-1" />
                  Reset
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
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
            <TableHeader className={cn("bg-gray-50 z-10", stickyHeader && "sticky top-0")}>
            <TableRow className="hover:bg-gray-50 border-b border-medium-gray">
              {visibleColumns.map((column) => (
                <TableHead
                  key={column.id}
                  className={cn(
                    "font-heading text-deep-navy text-sm font-semibold py-3 px-4 select-none",
                    column.align === 'right' && 'text-right',
                    column.align === 'center' && 'text-center'
                  )}
                  style={{ minWidth: column.minWidth }}
                >
                  <span>{column.label}</span>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {ordersToShow.length === 0 ? (
              <TableRow>
                <TableCell colSpan={visibleColumns.length} className="text-center py-8">
                  No orders found.
                </TableCell>
              </TableRow>
            ) : (
              ordersToShow.map((order) => {
                // const urgencyStyle = getUrgencyRowStyle(order.urgencyLevel || "normal") // Disabled SLA row coloring
                return (
                  <TableRow key={order.id} className="transition-colors duration-150 hover:bg-gray-50">
                    {visibleColumns.map((column) => (
                      <TableCell
                        key={column.id}
                        className={cn(
                          "py-3 px-4 text-sm",
                          column.align === 'right' && 'text-right',
                          column.align === 'center' && 'text-center'
                        )}
                        style={{ minWidth: column.minWidth }}
                      >
                        {renderCellContent(order, column.id)}
                      </TableCell>
                    ))}
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
        </div>
      </>
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
                aria-label="Refresh orders"
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


          {/* Smart Filter Bar - 7 Primary Filters Always Visible */}
          <div className="mt-3 space-y-4">
            {/* Primary Filters Grid - Responsive 2/3/4 columns */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {/* 1. Order ID Search */}
              <div className="space-y-1.5">
                <Label htmlFor="order-id" className="text-xs font-medium text-muted-foreground">Order ID</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  <Input
                    id="order-id"
                    placeholder="Search order..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="min-w-[160px] pl-9"
                    aria-label="Search by order ID, customer name, email, or phone"
                  />
                </div>
              </div>

              {/* 2. Order Status */}
              <div className="space-y-1.5">
                <Label htmlFor="order-status" className="text-xs font-medium text-muted-foreground">Order Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger id="order-status" className="min-w-[160px]">
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
              </div>

              {/* 3. Store No */}
              <div className="space-y-1.5">
                <Label htmlFor="store-no" className="text-xs font-medium text-muted-foreground">Store No</Label>
                <Select value={storeNoFilter} onValueChange={setStoreNoFilter}>
                  <SelectTrigger id="store-no" className="min-w-[160px]">
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
              </div>

              {/* 4. Channel */}
              <div className="space-y-1.5">
                <Label htmlFor="channel" className="text-xs font-medium text-muted-foreground">Channel</Label>
                <Select value={channelFilter} onValueChange={setChannelFilter}>
                  <SelectTrigger id="channel" className="min-w-[160px]">
                    <SelectValue placeholder="All Channels" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-channels">All Channels</SelectItem>
                    <SelectItem value="WEB">Web</SelectItem>
                    <SelectItem value="LAZADA">Lazada</SelectItem>
                    <SelectItem value="SHOPEE">Shopee</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* 5. Payment Status */}
              <div className="space-y-1.5">
                <Label htmlFor="payment-status" className="text-xs font-medium text-muted-foreground">Payment Status</Label>
                <Select value={paymentStatusFilter} onValueChange={setPaymentStatusFilter}>
                  <SelectTrigger id="payment-status" className="min-w-[160px]">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-payment">All Status</SelectItem>
                    <SelectItem value="PAID">Paid</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="FAILED">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* 6. Payment Method */}
              <div className="space-y-1.5">
                <Label htmlFor="payment-method" className="text-xs font-medium text-muted-foreground">Payment Method</Label>
                <Select value={paymentMethodFilter} onValueChange={setPaymentMethodFilter}>
                  <SelectTrigger id="payment-method" className="min-w-[160px]">
                    <SelectValue placeholder="All Methods" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-payment-method">All Methods</SelectItem>
                    <SelectItem value="CASH_ON_DELIVERY">Cash on Delivery</SelectItem>
                    <SelectItem value="CREDIT_CARD_ON_DELIVERY">Credit Card on Delivery</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* 7. Order Date Range */}
              <div className="space-y-1.5 md:col-span-2 lg:col-span-2">
                <Label className="text-xs font-medium text-muted-foreground">Order Date Range</Label>
                <div className="flex gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "min-w-[160px] justify-start text-left font-normal",
                          !dateFromFilter && "text-muted-foreground"
                        )}
                        aria-label="Select start date"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateFromFilter ? format(dateFromFilter, "dd/MM/yyyy") : "From"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <EnhancedCalendar
                        mode="single"
                        selected={dateFromFilter}
                        onSelect={setDateFromFilter}
                        onToday={() => setDateFromFilter(new Date())}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "min-w-[160px] justify-start text-left font-normal",
                          !dateToFilter && "text-muted-foreground"
                        )}
                        aria-label="Select end date"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateToFilter ? format(dateToFilter, "dd/MM/yyyy") : "To"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <EnhancedCalendar
                        mode="single"
                        selected={dateToFilter}
                        onSelect={setDateToFilter}
                        onToday={() => setDateToFilter(new Date())}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>

          </div>

          {/* More Filters Section with Clear All on right */}
          <Collapsible open={showAdvancedFilters} onOpenChange={setShowAdvancedFilters} className="mt-4">
            <div className="flex items-center justify-between">
              <CollapsibleTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 hover:bg-primary/5 transition-colors border-primary/30"
                >
                  <Filter className="h-4 w-4" />
                  {showAdvancedFilters ? "Hide More Filters" : "More Filters"}
                  {advancedFilterCount > 0 && !showAdvancedFilters && (
                    <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                      {advancedFilterCount}
                    </Badge>
                  )}
                  {showAdvancedFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </CollapsibleTrigger>
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetAllFilters}
                className="hover:bg-gray-100"
                aria-label="Clear all filters"
              >
                Clear All
              </Button>
            </div>
            <CollapsibleContent className="mt-3">
              <div className="p-4 bg-muted/30 border border-border/40 rounded-lg">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {/* SKU */}
                <div className="space-y-1.5">
                  <Label htmlFor="sku-filter" className="text-xs font-medium text-muted-foreground">SKU</Label>
                  <div className="relative">
                    <Input
                      id="sku-filter"
                      placeholder="Search by SKU..."
                      value={skuSearchTerm}
                      onChange={(e) => setSkuSearchTerm(e.target.value)}
                      className="min-w-[160px] pl-8"
                    />
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  </div>
                </div>

                {/* Item Name */}
                <div className="space-y-1.5">
                  <Label htmlFor="item-name-filter" className="text-xs font-medium text-muted-foreground">Item Name</Label>
                  <Input
                    id="item-name-filter"
                    placeholder="Search by item..."
                    value={itemNameFilter}
                    onChange={(e) => setItemNameFilter(e.target.value)}
                    className="min-w-[160px]"
                  />
                </div>

                {/* Customer Name */}
                <div className="space-y-1.5">
                  <Label htmlFor="customer-name-filter" className="text-xs font-medium text-muted-foreground">Customer Name</Label>
                  <Input
                    id="customer-name-filter"
                    placeholder="Customer name..."
                    value={customerNameFilter}
                    onChange={(e) => setCustomerNameFilter(e.target.value)}
                    className="min-w-[160px]"
                  />
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <Label htmlFor="email-filter" className="text-xs font-medium text-muted-foreground">Email</Label>
                  <Input
                    id="email-filter"
                    placeholder="Email address..."
                    value={emailFilter}
                    onChange={(e) => setEmailFilter(e.target.value)}
                    className="min-w-[160px]"
                  />
                </div>

                {/* Phone */}
                <div className="space-y-1.5">
                  <Label htmlFor="phone-filter" className="text-xs font-medium text-muted-foreground">Phone</Label>
                  <Input
                    id="phone-filter"
                    placeholder="Phone number..."
                    value={phoneFilter}
                    onChange={(e) => setPhoneFilter(e.target.value)}
                    className="min-w-[160px]"
                  />
                </div>

                {/* Order Type */}
                <div className="space-y-1.5">
                  <Label htmlFor="order-type-filter" className="text-xs font-medium text-muted-foreground">Order Type</Label>
                  <Select value={orderTypeFilter} onValueChange={setOrderTypeFilter}>
                    <SelectTrigger id="order-type-filter" className="min-w-[160px]">
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all-order-type">All Types</SelectItem>
                      <SelectItem value="Return Order">Return Order</SelectItem>
                      <SelectItem value="MKP-HD-STD">MKP-HD-STD</SelectItem>
                      <SelectItem value="RT-HD-EXP">RT-HD-EXP</SelectItem>
                      <SelectItem value="RT-CC-STD">RT-CC-STD</SelectItem>
                      <SelectItem value="RT-MIX-STD">RT-MIX-STD</SelectItem>
                      <SelectItem value="RT-HD-STD">RT-HD-STD</SelectItem>
                      <SelectItem value="RT-CC-EXP">RT-CC-EXP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </CardHeader>

        <CardContent className="p-6">

          {/* Skeleton Loading State */}
          {isMounted && isLoading && (
            <div role="status" aria-live="polite" aria-label="Loading orders">
              {/* Desktop Skeleton - Table Rows */}
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader className="sticky top-0 bg-gray-50 z-10">
                    <TableRow className="hover:bg-gray-50 border-b border-medium-gray">
                      <TableHead className="font-heading text-deep-navy min-w-[160px] text-sm font-semibold py-3 px-4">Order Number</TableHead>
                      <TableHead className="font-heading text-deep-navy min-w-[200px] text-sm font-semibold py-3 px-4">Customer Name</TableHead>
                      <TableHead className="font-heading text-deep-navy min-w-[200px] text-sm font-semibold py-3 px-4">Email</TableHead>
                      <TableHead className="font-heading text-deep-navy min-w-[130px] text-sm font-semibold py-3 px-4">Phone Number</TableHead>
                      <TableHead className="font-heading text-deep-navy min-w-[110px] text-sm font-semibold py-3 px-4 text-right">Order Total</TableHead>
                      <TableHead className="font-heading text-deep-navy min-w-[100px] text-sm font-semibold py-3 px-4 text-center">Store No</TableHead>
                      <TableHead className="font-heading text-deep-navy min-w-[130px] text-sm font-semibold py-3 px-4">Order Status</TableHead>
                      <TableHead className="font-heading text-deep-navy min-w-[120px] text-sm font-semibold py-3 px-4">Return Status</TableHead>
                      <TableHead className="font-heading text-deep-navy min-w-[80px] text-sm font-semibold py-3 px-4">On Hold</TableHead>
                      <TableHead className="font-heading text-deep-navy min-w-[120px] text-sm font-semibold py-3 px-4">Order Type</TableHead>
                      <TableHead className="font-heading text-deep-navy min-w-[130px] text-sm font-semibold py-3 px-4">Payment Status</TableHead>
                      {/* Confirmed column disabled */}
                      <TableHead className="font-heading text-deep-navy min-w-[110px] text-sm font-semibold py-3 px-4">Channel</TableHead>
                      <TableHead className="font-heading text-deep-navy min-w-[140px] text-sm font-semibold py-3 px-4">Allow Substitution</TableHead>
                      <TableHead className="font-heading text-deep-navy min-w-[160px] text-sm font-semibold py-3 px-4">Created Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[...Array(5)].map((_, i) => (
                      <TableRow key={i}>
                        <TableCell className="min-w-[160px] py-3 px-4"><Skeleton className="h-5 w-32" /></TableCell>
                        <TableCell className="min-w-[200px] py-3 px-4"><Skeleton className="h-5 w-36" /></TableCell>
                        <TableCell className="min-w-[200px] py-3 px-4"><Skeleton className="h-5 w-40" /></TableCell>
                        <TableCell className="min-w-[130px] py-3 px-4"><Skeleton className="h-5 w-24" /></TableCell>
                        <TableCell className="min-w-[110px] py-3 px-4"><Skeleton className="h-5 w-20" /></TableCell>
                        <TableCell className="min-w-[100px] py-3 px-4"><Skeleton className="h-5 w-16" /></TableCell>
                        <TableCell className="min-w-[130px] py-3 px-4"><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
                        <TableCell className="min-w-[120px] py-3 px-4"><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                        <TableCell className="min-w-[80px] py-3 px-4"><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
                        <TableCell className="min-w-[120px] py-3 px-4"><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                        <TableCell className="min-w-[130px] py-3 px-4"><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                        {/* Confirmed column disabled */}
                        <TableCell className="min-w-[110px] py-3 px-4"><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                        <TableCell className="min-w-[140px] py-3 px-4"><Skeleton className="h-5 w-12" /></TableCell>
                        <TableCell className="min-w-[160px] py-3 px-4"><Skeleton className="h-5 w-32" /></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Skeleton - Cards */}
              <div className="md:hidden space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Card key={i} className="p-4">
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-6 w-24 rounded-full" />
                      </div>
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-4 w-32" />
                      <div className="flex gap-2">
                        <Skeleton className="h-6 w-20 rounded-full" />
                        <Skeleton className="h-6 w-20 rounded-full" />
                      </div>
                      <div className="flex justify-between pt-2 border-t">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-9 w-16" />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
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

          {/* Enhanced Empty State */}
          {isMounted && !isLoading && !error && mappedOrders.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <Package className="h-16 w-16 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No orders found</h3>
              <p className="text-sm text-muted-foreground mb-6 max-w-md">
                Try adjusting your filters or search terms to find the orders you're looking for.
              </p>
              <div className="flex gap-3">
                <Button variant="outline" onClick={handleResetAllFilters} className="hover:bg-gray-100" aria-label="Clear all filters">
                  Clear Filters
                </Button>
                <Button onClick={refreshData} aria-label="Refresh orders">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh
                </Button>
              </div>
            </div>
          )}

          {/* Render table and pagination */}
          {isMounted && !isLoading && !error && mappedOrders && mappedOrders.length > 0 && pagination && (
            <div>
              {/* Mobile Card View - Show on screens < 768px */}
              <div className="md:hidden space-y-3">
                {mappedOrders.map((order) => (
                  <Card key={order.id} className="p-4">
                    <div className="space-y-3">
                      {/* Order Number & Status */}
                      <div className="flex items-center justify-between">
                        <button
                          onClick={() => handleOrderRowClick(order._originalOrder || ordersData.find((o) => o.id === order.id) || order)}
                          className="font-medium text-blue-600 hover:text-blue-800 hover:underline text-left min-h-[44px] min-w-[44px] flex items-center"
                        >
                          {order.id}
                        </button>
                        <OrderStatusBadge status={order.status} />
                      </div>

                      {/* Customer Info */}
                      <div className="space-y-1 text-sm">
                        <div className="font-medium">{order.customerName || "-"}</div>
                        <div className="font-mono text-muted-foreground">{order.customerPhone || "-"}</div>
                      </div>

                      {/* Store & Total */}
                      <div className="flex items-center justify-between text-sm">
                        <div>Store: {order.storeNo || ""}</div>
                        <div className="font-semibold">฿{order.total_amount?.toLocaleString() || "0"}</div>
                      </div>

                      {/* Payment Status & Channel */}
                      <div className="flex gap-2">
                        <PaymentStatusBadge status={order.paymentStatus} />
                        <ChannelBadge channel={order.channel} />
                      </div>

                      {/* Date & View Button */}
                      <div className="flex items-center justify-between pt-2 border-t">
                        <div className="text-xs text-muted-foreground">{order.createdDate}</div>
                        <Button
                          size="sm"
                          onClick={() => handleOrderRowClick(order._originalOrder || ordersData.find((o) => o.id === order.id) || order)}
                          className="min-h-[44px] min-w-[44px]"
                        >
                          View
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Desktop Table View - Show on screens >= 768px */}
              <div className="hidden md:block">
                {renderOrderTable(mappedOrders)}
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between">
                  {lastUpdated && (
                    <p className="text-sm text-steel-gray" aria-live="polite">Last updated: {lastUpdated}</p>
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
