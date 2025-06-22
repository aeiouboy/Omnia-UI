// Cache configuration
export const CACHE_TTL = 30 * 1000 // 30 seconds
export const CACHE_KEY = 'dashboard-orders-cache'
export const STALE_DATA_THRESHOLD = 60 * 1000 // 1 minute
export const CACHE_MEMORY_LIMIT = 100 * 1024 * 1024 // 100MB

// API configuration
export const API_TIMEOUT_MS = 30000 // 30 seconds
export const MAX_RETRY_ATTEMPTS = 3
export const RETRY_DELAY_MS = 1000

// Pagination
export const DEFAULT_PAGE_SIZE = 5000
export const ORDERS_PER_PAGE = 500

// Data fetching
export const FETCH_INTERVAL = 30000 // 30 seconds
export const SEVEN_DAYS_AGO_OFFSET = 6 // 6 days ago + today = 7 days

// Chart colors
export const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"]

// SLA thresholds
export const SLA_CRITICAL_THRESHOLD = 0.2 // 20% of target time
export const DEFAULT_SLA_TARGET_SECONDS = 300 // 5 minutes

// Store branches for fulfillment
export const TOPS_STORES = [
  'Tops Central Plaza ลาดพร้าว',
  'Tops Central World', 
  'Tops สุขุมวิท 39',
  'Tops ทองหล่อ',
  'Tops สีลม คอมเพล็กซ์',
  'Tops เอกมัย',
  'Tops พร้อมพงษ์',
  'Tops จตุจักร'
]

// Tab configuration
export const DASHBOARD_TABS = ["overview", "orders", "fulfillment", "analytics"] as const
export type DashboardTab = typeof DASHBOARD_TABS[number]

// Error messages
export const ERROR_MESSAGES = {
  FETCH_FAILED: "Failed to fetch dashboard data",
  TOKEN_EXPIRED: "Authentication token expired",
  NETWORK_ERROR: "Network connection error",
  TIMEOUT: "Request timed out",
  INVALID_DATA: "Invalid data received from server",
  CACHE_ERROR: "Failed to access cache",
  MEMORY_LIMIT: "Memory limit exceeded"
}

// Success messages
export const SUCCESS_MESSAGES = {
  DATA_LOADED: "Dashboard data loaded successfully",
  CACHE_HIT: "Data loaded from cache",
  REAL_TIME_UPDATE: "Real-time update received",
  ESCALATION_SENT: "Escalation sent successfully"
}

// Loading states
export const INITIAL_KPI_LOADING = {
  ordersProcessing: true,
  slaBreaches: true,
  revenueToday: true,
  fulfillmentRate: true,
}

export const INITIAL_CHARTS_LOADING = {
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
}

// Empty data states
export const EMPTY_KPI_DATA = {
  ordersProcessing: 0,
  slaBreaches: 0,
  revenueToday: 0,
  fulfillmentRate: 0,
}

export const EMPTY_CHARTS_DATA = {
  channelVolume: [],
  enhancedChannelData: { overview: [], drillDown: [] },
  criticalAlerts: [],
  dailyOrders: [],
  fulfillmentByBranch: [],
  channelPerformance: [],
  topProducts: [],
  revenueByCategory: [],
  hourlyOrderSummary: [],
  processingTimes: [],
  slaCompliance: [],
  recentOrders: [],
  approachingSla: [],
  orderAlerts: [],
  ordersData: [],
}
