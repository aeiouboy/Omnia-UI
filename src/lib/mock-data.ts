// Mock data service for development when external APIs are not configured
// This provides realistic sample data for all dashboard components

// Mock API Orders with realistic data for Tops stores
export const mockApiOrders: any[] = Array.from({ length: 150 }, (_, i) => {
  const id = `ORD-${String(i + 1).padStart(4, "0")}`
  const topsStores = [
    "Tops Central Plaza ลาดพร้าว",
    "Tops Central World",
    "Tops สุขุมวิท 39",
    "Tops ทองหล่อ",
    "Tops สีลม คอมเพล็กซ์",
    "Tops เอกมัย",
    "Tops พร้อมพงษ์",
    "Tops จตุจักร"
  ]

  const statuses = ["SUBMITTED", "PROCESSING", "READY_FOR_PICKUP", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"]
  const channels = ["ONLINE", "OFFLINE", "MOBILE_APP", "WEBSITE"]
  const priorities = ["LOW", "NORMAL", "HIGH", "URGENT"]

  const status = statuses[Math.floor(Math.random() * statuses.length)]
  const elapsedMinutes = Math.floor(Math.random() * 600)
  const targetMinutes = Math.floor(Math.random() * 300) + 180 // 3-8 minutes
  const isBreach = elapsedMinutes > targetMinutes
  const isNearBreach = !isBreach && (targetMinutes - elapsedMinutes) <= (targetMinutes * 0.2)

  const createdDate = new Date()
  createdDate.setMinutes(createdDate.getMinutes() - elapsedMinutes)

  return {
    id,
    order_no: id,
    customer: {
      id: `CUST-${Math.floor(Math.random() * 10000)}`,
      name: `Customer ${i + 1}`,
      email: `customer${i + 1}@example.com`,
      phone: `+66${Math.floor(Math.random() * 9000000000) + 1000000000}`
    },
    items: Array.from({ length: Math.floor(Math.random() * 5) + 1 }, (_, j) => ({
      id: `ITEM-${id}-${j + 1}`,
      name: `Product ${j + 1}`,
      quantity: Math.floor(Math.random() * 3) + 1,
      price: Math.floor(Math.random() * 500) + 50,
      category: "Grocery"
    })),
    status,
    channel: channels[Math.floor(Math.random() * channels.length)],
    total: Math.floor(Math.random() * 2000) + 200,
    created_at: createdDate.toISOString(),
    updated_at: new Date().toISOString(),
    store: {
      id: `STORE-${Math.floor(Math.random() * 8) + 1}`,
      name: topsStores[Math.floor(Math.random() * topsStores.length)],
      location: {
        latitude: 13.7563 + (Math.random() - 0.5) * 0.1,
        longitude: 100.5018 + (Math.random() - 0.5) * 0.1
      }
    },
    sla_info: {
      target_minutes: targetMinutes,
      elapsed_minutes: elapsedMinutes,
      status: isBreach ? "BREACH" : isNearBreach ? "NEAR_BREACH" : "COMPLIANT"
    },
    priority: priorities[Math.floor(Math.random() * priorities.length)],
    payment_method: "CREDIT_CARD",
    fulfillment_type: Math.random() > 0.5 ? "DELIVERY" : "PICKUP",
    assigned_driver: Math.random() > 0.7 ? `Driver-${Math.floor(Math.random() * 20) + 1}` : undefined,
    estimated_delivery_time: new Date(Date.now() + Math.floor(Math.random() * 120) * 60000).toISOString()
  }
})

// Mock Executive KPIs
export const mockExecutiveKPIs: any = {
  totalOrders: 1247,
  urgentOrders: 23,
  nearBreachOrders: 45,
  onTimeDeliveryRate: 94.2,
  averageFulfillmentTime: 12.5,
  slaComplianceRate: 91.8,
  activeOrders: 156,
  completedOrders: 1091,
  revenue: 2847500,
  breachCount: 89,
  approachingDeadlineCount: 45,
  submittedCount: 1247,
  onHoldCount: 18,
  lastUpdated: new Date().toISOString()
}

// Mock Order Metrics
export const mockOrderMetrics: any = {
  totalOrders: 1247,
  urgentOrders: 23,
  processingOrders: 89,
  completedOrders: 1091,
  cancelledOrders: 44,
  averageProcessingTime: 12.5,
  onTimeDeliveryRate: 94.2,
  slaComplianceRate: 91.8,
  breachCount: 89,
  approachingDeadlineCount: 45,
  submittedCount: 1247,
  onHoldCount: 18,
  ordersByChannel: {
    ONLINE: 523,
    OFFLINE: 312,
    MOBILE_APP: 289,
    WEBSITE: 123
  },
  ordersByStatus: {
    SUBMITTED: 234,
    PROCESSING: 189,
    READY_FOR_PICKUP: 145,
    OUT_FOR_DELIVERY: 178,
    DELIVERED: 1091,
    CANCELLED: 44
  },
  ordersByHour: Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    count: Math.floor(Math.random() * 100) + 10
  })),
  lastUpdated: new Date().toISOString()
}

// Mock Performance Metrics
export const mockPerformanceMetrics: any = {
  fulfillmentByStore: [
    { storeName: "Tops Central World", fulfilled: 234, total: 250, percentage: 93.6 },
    { storeName: "Tops สุขุมวิท 39", fulfilled: 189, total: 200, percentage: 94.5 },
    { storeName: "Tops ทองหล่อ", fulfilled: 156, total: 175, percentage: 89.1 },
    { storeName: "Tops สีลม คอมเพล็กซ์", fulfilled: 145, total: 160, percentage: 90.6 },
    { storeName: "Tops เอกมัย", fulfilled: 134, total: 145, percentage: 92.4 },
    { storeName: "Tops พร้อมพงษ์", fulfilled: 123, total: 135, percentage: 91.1 },
    { storeName: "Tops จตุจักร", fulfilled: 112, total: 125, percentage: 89.6 },
    { storeName: "Tops Central Plaza ลาดพร้าว", fulfilled: 98, total: 110, percentage: 89.1 }
  ],
  slaByDay: Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (6 - i))
    return {
      date: date.toISOString().split('T')[0],
      compliant: Math.floor(Math.random() * 100) + 50,
      breach: Math.floor(Math.random() * 30) + 10,
      nearBreach: Math.floor(Math.random() * 20) + 5
    }
  }),
  channelPerformance: [
    { channel: "ONLINE", orders: 523, avgTime: 11.2, onTimeRate: 95.1 },
    { channel: "OFFLINE", orders: 312, avgTime: 10.8, onTimeRate: 96.3 },
    { channel: "MOBILE_APP", orders: 289, avgTime: 13.1, onTimeRate: 92.7 },
    { channel: "WEBSITE", orders: 123, avgTime: 14.5, onTimeRate: 90.2 }
  ],
  lastUpdated: new Date().toISOString()
}

// Mock Recent Orders
export const mockRecentOrders = mockApiOrders
  .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  .slice(0, 10)

// Mock Alerts
export const mockAlerts = [
  {
    id: "alert-1",
    type: "SLA_BREACH",
    message: "Order ORD-0156 has exceeded SLA target time",
    orderId: "ORD-0156",
    severity: "HIGH" as const,
    timestamp: "2025-11-23T10:30:00Z",
    acknowledged: false,
    storeName: "Tops Central World"
  },
  {
    id: "alert-2",
    type: "SLA_APPROACHING",
    message: "Order ORD-0157 is approaching SLA breach threshold",
    orderId: "ORD-0157",
    severity: "MEDIUM" as const,
    timestamp: "2025-11-23T11:15:00Z",
    acknowledged: false,
    storeName: "Tops สุขุมวิท 39"
  },
  {
    id: "alert-3",
    type: "HIGH_VOLUME",
    message: "Unusual order volume detected at Tops ทองหล่อ",
    orderId: undefined,
    severity: "MEDIUM" as const,
    timestamp: "2025-11-23T12:00:00Z",
    acknowledged: true,
    storeName: "Tops ทองหล่อ"
  },
  {
    id: "alert-4",
    type: "PAYMENT_FAILED",
    message: "Payment processing failure for Order ORD-0158",
    orderId: "ORD-0158",
    severity: "LOW" as const,
    timestamp: "2025-11-23T12:30:00Z",
    acknowledged: true,
    storeName: "Tops เอกมัย"
  }
]

// Mock Analytics Data
export const mockAnalyticsData = {
  orderTrends: Array.from({ length: 30 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (29 - i))
    return {
      date: date.toISOString().split('T')[0],
      orders: Math.floor(Math.random() * 150) + 50,
      revenue: Math.floor(Math.random() * 500000) + 100000,
      avgTime: Math.floor(Math.random() * 10) + 8,
      slaCompliance: Math.floor(Math.random() * 15) + 85
    }
  }),
  peakHours: Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    orders: Math.floor(Math.random() * 80) + 20,
    avgTime: Math.floor(Math.random() * 5) + 10
  })),
  storeComparison: [
    {
      storeName: "Tops Central World",
      totalOrders: 234,
      avgFulfillmentTime: 11.2,
      slaCompliance: 94.5,
      revenue: 587500
    },
    {
      storeName: "Tops สุขุมวิท 39",
      totalOrders: 189,
      avgFulfillmentTime: 10.8,
      slaCompliance: 96.3,
      revenue: 472500
    },
    {
      storeName: "Tops ทองหล่อ",
      totalOrders: 156,
      avgFulfillmentTime: 13.1,
      slaCompliance: 89.1,
      revenue: 390000
    },
    {
      storeName: "Tops สีลม คอมเพล็กซ์",
      totalOrders: 145,
      avgFulfillmentTime: 12.5,
      slaCompliance: 90.6,
      revenue: 362500
    }
  ],
  channelEfficiency: [
    { channel: "ONLINE", efficiency: 0.951, orderCount: 523, avgTime: 11.2 },
    { channel: "OFFLINE", efficiency: 0.963, orderCount: 312, avgTime: 10.8 },
    { channel: "MOBILE_APP", efficiency: 0.927, orderCount: 289, avgTime: 13.1 },
    { channel: "WEBSITE", efficiency: 0.902, orderCount: 123, avgTime: 14.5 }
  ]
}

// Helper function to get mock orders with filters
export function getMockOrders(filters: {
  status?: string
  channel?: string
  search?: string
  page?: number
  pageSize?: number
  dateFrom?: string
  dateTo?: string
}) {
  let filtered = [...mockApiOrders]

  // Apply filters
  if (filters.status && filters.status !== "all") {
    filtered = filtered.filter(order => order.status === filters.status)
  }

  if (filters.channel && filters.channel !== "all") {
    filtered = filtered.filter(order => order.channel === filters.channel)
  }

  if (filters.search) {
    const searchLower = filters.search.toLowerCase()
    filtered = filtered.filter(order =>
      order.order_no.toLowerCase().includes(searchLower) ||
      order.customer.name.toLowerCase().includes(searchLower) ||
      order.customer.email.toLowerCase().includes(searchLower)
    )
  }

  if (filters.dateFrom || filters.dateTo) {
    filtered = filtered.filter(order => {
      const orderDate = new Date(order.created_at).toISOString().split('T')[0]
      if (filters.dateFrom && orderDate < filters.dateFrom) return false
      if (filters.dateTo && orderDate > filters.dateTo) return false
      return true
    })
  }

  // Pagination
  const page = filters.page || 1
  const pageSize = filters.pageSize || 25
  const start = (page - 1) * pageSize
  const paginated = filtered.slice(start, start + pageSize)

  return {
    data: paginated,
    pagination: {
      page,
      pageSize,
      total: filtered.length,
      totalPages: Math.ceil(filtered.length / pageSize),
      hasNext: page < Math.ceil(filtered.length / pageSize),
      hasPrev: page > 1
    }
  }
}

// Helper function to get mock order counts
export function getMockOrderCounts() {
  const now = new Date()
  const today = now.toISOString().split('T')[0]

  return {
    date: today,
    urgentOrders: 23,
    nearBreachOrders: 45,
    readyToProcessOrders: 156,
    onHoldOrders: 18,
    totalOrders: 1247,
    lastUpdated: now.toISOString()
  }
}

/**
 * Generate mock escalation records for development and testing
 * @param count Number of escalation records to generate (default: 50)
 * @returns Array of mock escalation records matching database schema
 */
export function generateMockEscalations(count: number = 50) {
  const alertTypes = [
    "SLA_BREACH",
    "SLA_APPROACHING",
    "HIGH_VOLUME",
    "PAYMENT_FAILED",
    "DELIVERY_DELAYED",
    "INVENTORY_LOW",
    "SYSTEM_ERROR"
  ]

  const severities: ("HIGH" | "MEDIUM" | "LOW")[] = ["HIGH", "MEDIUM", "LOW"]
  const statuses: ("PENDING" | "SENT" | "FAILED" | "RESOLVED")[] = ["PENDING", "SENT", "FAILED", "RESOLVED"]

  const escalatedToOptions = [
    "operations-team@central.co.th",
    "store-managers@central.co.th",
    "it-support@central.co.th",
    "customer-service@central.co.th",
    "logistics@central.co.th"
  ]

  const topsStores = [
    "Tops Central Plaza ลาดพร้าว",
    "Tops Central World",
    "Tops สุขุมวิท 39",
    "Tops ทองหล่อ",
    "Tops สีลม คอมเพล็กซ์",
    "Tops เอกมัย",
    "Tops พร้อมพงษ์",
    "Tops จตุจักร"
  ]

  return Array.from({ length: count }, (_, i) => {
    const alertType = alertTypes[Math.floor(Math.random() * alertTypes.length)]
    const severity = severities[Math.floor(Math.random() * severities.length)]
    const status = statuses[Math.floor(Math.random() * statuses.length)]
    const store = topsStores[Math.floor(Math.random() * topsStores.length)]
    const orderId = `ORD-${String(Math.floor(Math.random() * 9999) + 1).padStart(4, "0")}`

    const createdDate = new Date()
    createdDate.setHours(createdDate.getHours() - Math.floor(Math.random() * 168)) // Up to 7 days ago

    const updatedDate = new Date(createdDate)
    updatedDate.setMinutes(updatedDate.getMinutes() + Math.floor(Math.random() * 120))

    let message = ""
    switch (alertType) {
      case "SLA_BREACH":
        message = `Order ${orderId} has exceeded SLA target time at ${store}`
        break
      case "SLA_APPROACHING":
        message = `Order ${orderId} is approaching SLA breach threshold at ${store}`
        break
      case "HIGH_VOLUME":
        message = `Unusual order volume detected at ${store}`
        break
      case "PAYMENT_FAILED":
        message = `Payment processing failure for Order ${orderId} at ${store}`
        break
      case "DELIVERY_DELAYED":
        message = `Delivery delay detected for Order ${orderId} at ${store}`
        break
      case "INVENTORY_LOW":
        message = `Low inventory alert at ${store}`
        break
      case "SYSTEM_ERROR":
        message = `System error encountered processing Order ${orderId}`
        break
      default:
        message = `Alert for Order ${orderId}`
    }

    return {
      id: `ESC-${String(i + 1).padStart(5, "0")}`,
      alert_id: `ALERT-${String(i + 1).padStart(5, "0")}`,
      alert_type: alertType,
      message,
      severity,
      timestamp: createdDate.toISOString().replace("T", " ").substring(0, 19),
      status,
      escalated_by: "system",
      escalated_to: escalatedToOptions[Math.floor(Math.random() * escalatedToOptions.length)],
      created_at: createdDate.toISOString(),
      updated_at: updatedDate.toISOString()
    }
  })
}

/**
 * Get mock escalations with filters and pagination
 * Matches the API route filter structure
 */
export function getMockEscalations(filters: {
  status?: string
  alertType?: string
  severity?: string
  escalatedTo?: string
  search?: string
  dateFrom?: string
  dateTo?: string
  page?: number
  pageSize?: number
}) {
  let filtered = generateMockEscalations(100) // Generate larger dataset for filtering

  // Apply filters
  if (filters.status && filters.status !== "all") {
    filtered = filtered.filter(esc => esc.status === filters.status?.toUpperCase())
  }

  if (filters.alertType && filters.alertType !== "all") {
    filtered = filtered.filter(esc => esc.alert_type === filters.alertType?.toUpperCase())
  }

  if (filters.severity && filters.severity !== "all") {
    filtered = filtered.filter(esc => esc.severity === filters.severity?.toUpperCase())
  }

  if (filters.escalatedTo) {
    filtered = filtered.filter(esc =>
      esc.escalated_to.toLowerCase().includes(filters.escalatedTo!.toLowerCase())
    )
  }

  if (filters.search) {
    const searchLower = filters.search.toLowerCase()
    filtered = filtered.filter(esc =>
      esc.alert_id.toLowerCase().includes(searchLower) ||
      esc.message.toLowerCase().includes(searchLower) ||
      esc.escalated_to.toLowerCase().includes(searchLower)
    )
  }

  if (filters.dateFrom || filters.dateTo) {
    filtered = filtered.filter(esc => {
      const escDate = new Date(esc.created_at!).toISOString().split('T')[0]
      if (filters.dateFrom && escDate < filters.dateFrom) return false
      if (filters.dateTo && escDate > filters.dateTo) return false
      return true
    })
  }

  // Sort by created_at descending (newest first)
  filtered.sort((a, b) =>
    new Date(b.created_at!).getTime() - new Date(a.created_at!).getTime()
  )

  // Pagination
  const page = filters.page || 1
  const pageSize = filters.pageSize || 25
  const start = (page - 1) * pageSize
  const paginated = filtered.slice(start, start + pageSize)

  return {
    data: paginated,
    pagination: {
      page,
      pageSize,
      total: filtered.length,
      totalPages: Math.ceil(filtered.length / pageSize),
      hasNext: page < Math.ceil(filtered.length / pageSize),
      hasPrev: page > 1
    }
  }
}

// Export all mock data
export const mockData = {
  orders: mockApiOrders,
  kpis: mockExecutiveKPIs,
  metrics: mockOrderMetrics,
  performance: mockPerformanceMetrics,
  recentOrders: mockRecentOrders,
  alerts: mockAlerts,
  analytics: mockAnalyticsData,
  getOrders: getMockOrders,
  getOrderCounts: getMockOrderCounts,
  generateEscalations: generateMockEscalations,
  getEscalations: getMockEscalations
}