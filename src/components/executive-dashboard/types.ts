// API response types matching OrderManagementHub
export interface ApiSLAInfo {
  target_minutes: number
  elapsed_minutes: number
  status: string
}

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
  /** Secret code for gift items */
  secretCode?: string
  /** Product style variant */
  style?: string
  /** Product color */
  color?: string
  /** Product size */
  size?: string
  /** Whether the item is gift wrapped */
  giftWrapped?: boolean
  /** Gift wrapping message */
  giftWrappedMessage?: string
}

export interface ApiOrder {
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
}

export interface ApiPagination {
  page: number
  pageSize: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export interface ApiResponse {
  data: ApiOrder[]
  pagination: ApiPagination
}

// Enhanced cache structure with date range validation
export interface OrdersCache {
  orders: ApiOrder[]
  timestamp: number
  dateRange: {
    from: string
    to: string
  }
  fetchedPages: number
  totalOrders: number
}

// Dashboard state interfaces
export interface KpiLoadingState {
  ordersProcessing: boolean
  slaBreaches: boolean
  revenueToday: boolean
  fulfillmentRate: boolean
}

export interface ChartsLoadingState {
  channelVolume: boolean
  enhancedChannelData: boolean
  alerts: boolean
  dailyOrders: boolean
  fulfillmentByBranch: boolean
  channelPerformance: boolean
  topProducts: boolean
  revenueByCategory: boolean
  hourlyOrderSummary: boolean
  processingTimes: boolean
  slaCompliance: boolean
  recentOrders: boolean
  approachingSla: boolean
}

export interface KpiData {
  ordersProcessing: number
  slaBreaches: number
  revenueToday: number
  fulfillmentRate: number
}

// Alert types
export interface OrderAlert {
  id: string
  order_number: string
  customer_name: string
  channel: string
  location: string
  remaining?: number
  overTime?: number
  target_minutes?: number
  elapsed_minutes?: number
  type?: 'breach' | 'approaching'
}

// Chart data types
export interface ChannelVolumeData {
  name: string
  orders: number
  revenue: number
}

export interface DailyOrderData {
  date: string
  orders: number
  revenue: number
}

export interface FulfillmentByBranchData {
  branch: string
  rate: number
  fulfilled: number
  total: number
}

export interface ChannelPerformanceData {
  channel: string
  orders: number
  revenue: number
  sla_rate: number
}

export interface TopProductData {
  rank: number
  name: string
  sku: string
  units: number
  revenue: number
}

export interface RevenueByCategoryData {
  name: string
  value: number
}

export interface HourlyOrderSummaryData {
  hour: string
  orders: number
  avgProcessingTime?: number
  revenue?: number
}

export interface ProcessingTimeData {
  time: string
  value: number
}

export interface SlaComplianceData {
  status: string
  count: number
  percentage: number
}

// Data validation
export interface DataValidationIssue {
  field: string
  issue: string
  severity: 'warning' | 'error'
  count?: number
}

export interface DataValidationResult {
  isValid: boolean
  completeness: number
  issues: DataValidationIssue[]
  summary: {
    totalOrders: number
    validOrders: number
    invalidOrders: number
    missingFields: string[]
  }
}

// Chart data container types
export interface ChartDataState {
  channelVolume: any[]
  enhancedChannelData: { overview: any[], drillDown: any[] }
  dailyOrders: any[]
  fulfillmentByBranch: any[]
  channelPerformance: any[]
  topProducts: any[]
  revenueByCategory: any[]
  hourlyOrderSummary: any[]
  processingTimes: any[]
  slaCompliance: any[]
}

// Alert state types
export interface AlertsState {
  orderAlerts: OrderAlert[]
  approachingSla: OrderAlert[]
  criticalAlerts: OrderAlert[]
}

// Dashboard state machine
export type DashboardPhase = 'INITIALIZING' | 'LOADING' | 'READY' | 'ERROR' | 'UPDATING' | 'LOADING_REALTIME'
export type RequestType = 'initial' | 'realtime' | 'manual' | string

export interface DashboardState {
  phase: DashboardPhase
  lastLoadTime: number | null
  error: string | null
  retryCount: number
  requestsInFlight: Set<RequestType>
  dataVersion: number
}

export type DashboardAction = 
  | { type: 'START_INITIAL_LOAD' }
  | { type: 'COMPLETE_INITIAL_LOAD' }
  | { type: 'START_REALTIME_UPDATE' }
  | { type: 'COMPLETE_REALTIME_UPDATE' }
  | { type: 'START_MANUAL_REFRESH' }
  | { type: 'COMPLETE_MANUAL_REFRESH' }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'CLEAR_ERROR' }
  | { type: 'INCREMENT_RETRY' }
  | { type: 'RESET_RETRY' }
  | { type: 'INCREMENT_DATA_VERSION' }
