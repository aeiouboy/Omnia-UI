/**
 * Utility functions for item fulfillment status management
 * Provides categorization, calculation, and transformation functions
 */

import {
  ItemFulfillmentStatus,
  StatusCategory,
  ItemStatusSummary,
  StatusGroupSummary,
  EnhancedOrderItem,
  FulfillmentTimelineStage,
  StatusBadgeConfig,
  STATUS_BADGE_CONFIG,
  getStatusCategory,
} from '@/types/item-fulfillment'

/**
 * Map raw order item to EnhancedOrderItem with fulfillment status
 * Derives fulfillment status from available item data
 */
export function mapItemToEnhancedItem(item: any, index: number): EnhancedOrderItem {
  // Derive fulfillment status from existing item data
  let itemFulfillmentStatus: ItemFulfillmentStatus = 'FULFILLED'

  // Check for explicit status in item data
  if (item.fulfillmentStatus) {
    const statusMap: Record<string, ItemFulfillmentStatus> = {
      'RETURNED': 'RETURNED',
      'CANCELLED': 'CANCELLED',
      'PICK_DECLINED': 'PICK_DECLINED',
      'REFUNDED': 'REFUNDED',
      'FULFILLED': 'FULFILLED',
      'DELIVERED': 'DELIVERED',
      'COMPLETED': 'COMPLETED',
      'ORDERED': 'ORDERED',
      'ALLOCATED': 'ALLOCATED',
      'RELEASED': 'RELEASED',
      // Map other variations
      'Picked': 'FULFILLED',
      'Shipped': 'FULFILLED',
      'Packed': 'FULFILLED',
      'Pending': 'ORDERED',
    }
    itemFulfillmentStatus = statusMap[item.fulfillmentStatus] || 'FULFILLED'
  }

  // Check for itemFulfillmentStatus field
  if (item.itemFulfillmentStatus) {
    itemFulfillmentStatus = item.itemFulfillmentStatus
  }

  return {
    id: item.id || `item-${index}`,
    product_name: item.product_name || item.productName || item.name || 'Unknown Product',
    product_sku: item.product_sku || item.sku || 'N/A',
    quantity: item.quantity || 1,
    unit_price: item.unit_price || item.unitPrice || 0,
    total_price: item.total_price || item.totalPrice || (item.unit_price || 0) * (item.quantity || 1),

    // Optional fields
    thaiName: item.thaiName,
    category: item.category,
    uom: item.uom || 'EA',
    variant: item.variant,
    color: item.color,
    size: item.size,
    imageUrl: item.imageUrl || item.image_url,
    shippingMethod: item.shippingMethod,

    // Fulfillment status
    itemFulfillmentStatus,
    statusUpdatedAt: item.statusUpdatedAt,

    // Quantity progress
    quantityProgress: item.quantityProgress || {
      ordered: item.quantity || 1,
      allocated: item.quantity || 1,
      released: item.quantity || 1,
      fulfilled: itemFulfillmentStatus === 'FULFILLED' || itemFulfillmentStatus === 'DELIVERED' || itemFulfillmentStatus === 'COMPLETED' ? (item.quantity || 1) : 0,
      delivered: itemFulfillmentStatus === 'DELIVERED' || itemFulfillmentStatus === 'COMPLETED' ? (item.quantity || 1) : 0,
    },

    // Cancellation details
    cancellationReason: item.cancellationReason,
    cancelledBy: item.cancelledBy,
    cancelledAt: item.cancelledAt,

    // Return/Refund details
    returnReason: item.returnReason,
    returnRequestedAt: item.returnRequestedAt,
    refundAmount: item.refundAmount,
    refundStatus: item.refundStatus,
  }
}

/**
 * Categorize items by status into fulfilled/cancelled/returned groups
 */
export function categorizeItemsByStatus(items: EnhancedOrderItem[]): {
  fulfilled: EnhancedOrderItem[]
  cancelled: EnhancedOrderItem[]
  returned: EnhancedOrderItem[]
} {
  const result = {
    fulfilled: [] as EnhancedOrderItem[],
    cancelled: [] as EnhancedOrderItem[],
    returned: [] as EnhancedOrderItem[],
  }

  for (const item of items) {
    const category = getStatusCategory(item.itemFulfillmentStatus)
    if (category === 'fulfilled') {
      result.fulfilled.push(item)
    } else if (category === 'cancelled') {
      result.cancelled.push(item)
    } else if (category === 'returned') {
      result.returned.push(item)
    }
  }

  return result
}

/**
 * Calculate summary statistics for a group of items
 */
function calculateGroupSummary(items: EnhancedOrderItem[]): StatusGroupSummary {
  return {
    count: items.length,
    quantity: items.reduce((sum, item) => sum + item.quantity, 0),
    value: items.reduce((sum, item) => sum + item.total_price, 0),
  }
}

/**
 * Calculate overall item status summary
 */
export function calculateItemStatusSummary(items: EnhancedOrderItem[]): ItemStatusSummary {
  const categorized = categorizeItemsByStatus(items)

  return {
    totalItems: items.length,
    totalQuantity: items.reduce((sum, item) => sum + item.quantity, 0),
    totalValue: items.reduce((sum, item) => sum + item.total_price, 0),
    fulfilled: calculateGroupSummary(categorized.fulfilled),
    cancelled: calculateGroupSummary(categorized.cancelled),
    returned: calculateGroupSummary(categorized.returned),
  }
}

/**
 * Get status badge configuration for a status category
 */
export function getStatusBadgeConfig(category: 'fulfilled' | 'cancelled' | 'returned'): StatusBadgeConfig {
  return STATUS_BADGE_CONFIG[category]
}

/**
 * Get status badge config from item fulfillment status
 */
export function getStatusBadgeConfigFromStatus(status: ItemFulfillmentStatus): StatusBadgeConfig {
  const category = getStatusCategory(status)
  if (category === 'all') {
    // Fallback to fulfilled for 'all' category
    return STATUS_BADGE_CONFIG.fulfilled
  }
  return STATUS_BADGE_CONFIG[category]
}

/**
 * Filter items by status category
 */
export function filterItemsByCategory(
  items: EnhancedOrderItem[],
  category: StatusCategory
): EnhancedOrderItem[] {
  if (category === 'all') {
    return items
  }

  return items.filter((item) => getStatusCategory(item.itemFulfillmentStatus) === category)
}

/**
 * Generate timeline stages from order data
 * Starts from Picking (not Ordered)
 */
export function generateTimelineStages(orderData?: any): FulfillmentTimelineStage[] {
  const stages: FulfillmentTimelineStage[] = [
    { id: 'picking', name: 'Picking', isCompleted: false, isPending: false },
    { id: 'packed', name: 'Packed', isCompleted: false, isPending: false },
    { id: 'shipped', name: 'Shipped', isCompleted: false, isPending: false },
    { id: 'delivered', name: 'Delivered', isCompleted: false, isPending: true },
  ]

  // Derive progress from order status
  const orderStatus = orderData?.status?.toUpperCase()
  const statusProgression: Record<string, number> = {
    'CREATED': 0,
    'SUBMITTED': 0,
    'PROCESSING': 0,
    'PICKING': 0,
    'PACKING': 1,
    'PACKED': 1,
    'SHIPPED': 2,
    'DELIVERED': 3,
    'COMPLETED': 3,
    'FULFILLED': 2,
  }

  const progressIndex = statusProgression[orderStatus] ?? 1 // Default to packed

  // Generate random timestamps for completed stages
  const now = new Date()
  const hoursAgo = Math.floor(Math.random() * 72) + 24 // 1-4 days ago
  let stageTime = new Date(now.getTime() - hoursAgo * 60 * 60 * 1000)

  stages.forEach((stage, index) => {
    if (index <= progressIndex) {
      stage.isCompleted = true
      stage.isPending = false
      stage.dateTime = formatStageDateTime(stageTime)
      // Add 2-8 hours between stages
      stageTime = new Date(stageTime.getTime() + (Math.floor(Math.random() * 6) + 2) * 60 * 60 * 1000)
    } else if (index === progressIndex + 1) {
      stage.isPending = true
      stage.isCompleted = false
    } else {
      stage.isPending = true
      stage.isCompleted = false
    }
  })

  return stages
}

/**
 * Format date for timeline stage display
 * Format: "MM/DD/YYYY HH:mm:ss" (standardized)
 */
function formatStageDateTime(date: Date): string {
  const pad = (n: number) => n.toString().padStart(2, '0')
  const month = pad(date.getMonth() + 1)
  const day = pad(date.getDate())
  const year = date.getFullYear()
  const hours = pad(date.getHours())
  const minutes = pad(date.getMinutes())
  const seconds = pad(date.getSeconds())
  return `${month}/${day}/${year} ${hours}:${minutes}:${seconds}`
}

/**
 * Enhance order items array with fulfillment statuses
 * Used to add mock fulfillment data for demonstration
 */
export function enhanceItemsWithFulfillmentStatus(items: any[]): EnhancedOrderItem[] {
  if (!items || !Array.isArray(items)) {
    return []
  }

  // Randomly assign fulfillment statuses for mock data
  const statuses: ItemFulfillmentStatus[] = ['FULFILLED', 'FULFILLED', 'FULFILLED', 'CANCELLED', 'RETURNED']

  return items.map((item, index) => {
    // Use existing status if present, otherwise assign randomly
    if (!item.itemFulfillmentStatus && !item.fulfillmentStatus) {
      // Most items are fulfilled, some cancelled/returned for demo
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)]
      item.itemFulfillmentStatus = randomStatus
    }
    return mapItemToEnhancedItem(item, index)
  })
}

/**
 * Calculate filtered total for a set of items
 */
export function calculateFilteredTotal(items: EnhancedOrderItem[]): number {
  return items.reduce((sum, item) => sum + item.total_price, 0)
}
