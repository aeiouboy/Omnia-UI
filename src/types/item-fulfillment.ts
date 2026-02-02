/**
 * Item Fulfillment Types for Version 4 Fulfillment Tab
 * Provides item-level fulfillment status tracking
 */

/**
 * All possible item fulfillment statuses
 */
export type ItemFulfillmentStatus =
  | 'ORDERED'       // Initial state - ordered
  | 'ALLOCATED'     // Allocated from inventory
  | 'RELEASED'      // Released for picking
  | 'FULFILLED'     // Successfully fulfilled
  | 'DELIVERED'     // Delivered to customer
  | 'COMPLETED'     // Fully completed
  | 'PICK_DECLINED' // Pick declined (out of stock)
  | 'CANCELLED'     // Cancelled
  | 'RETURNED'      // Returned by customer
  | 'REFUNDED'      // Refunded

/**
 * Status category for tab filtering
 */
export type StatusCategory = 'all' | 'fulfilled' | 'cancelled' | 'returned'

/**
 * Quantity progress for each fulfillment stage
 */
export interface ItemQuantityProgress {
  ordered: number
  allocated: number
  released: number
  fulfilled: number
  delivered: number
}

/**
 * Summary of items grouped by status category
 */
export interface StatusGroupSummary {
  count: number
  quantity: number
  value: number
}

/**
 * Overall item status summary for the order
 */
export interface ItemStatusSummary {
  totalItems: number
  totalQuantity: number
  totalValue: number
  fulfilled: StatusGroupSummary
  cancelled: StatusGroupSummary
  returned: StatusGroupSummary
}

/**
 * Order item with enhanced fulfillment fields
 */
export interface EnhancedOrderItem {
  // Core item fields
  id: string
  product_name: string
  product_sku: string
  quantity: number
  unit_price: number
  total_price: number

  // Optional fields from existing order items
  thaiName?: string
  category?: string
  uom?: string
  variant?: string
  color?: string
  size?: string
  imageUrl?: string
  shippingMethod?: string

  // Fulfillment status
  itemFulfillmentStatus: ItemFulfillmentStatus
  statusUpdatedAt?: string  // ISO timestamp

  // Quantity progress
  quantityProgress?: ItemQuantityProgress

  // Cancellation details (optional)
  cancellationReason?: string
  cancelledBy?: 'CUSTOMER' | 'MERCHANT' | 'SYSTEM'
  cancelledAt?: string

  // Return/Refund details (optional)
  returnReason?: string
  returnRequestedAt?: string
  refundAmount?: number
  refundStatus?: 'PENDING' | 'APPROVED' | 'PROCESSED'
}

/**
 * Timeline stage for order fulfillment progress
 */
export interface FulfillmentTimelineStage {
  id: string
  name: string
  dateTime?: string  // Format: "Jan 28 09:00" or undefined for pending
  isCompleted: boolean
  isPending: boolean
}

/**
 * Status badge configuration
 */
export interface StatusBadgeConfig {
  label: string
  icon: 'CheckCircle' | 'XCircle' | 'RefreshCcw'
  bgColor: string
  textColor: string
  borderColor: string
}

/**
 * Mapping of status categories to badge configurations
 */
export const STATUS_BADGE_CONFIG: Record<'fulfilled' | 'cancelled' | 'returned', StatusBadgeConfig> = {
  fulfilled: {
    label: 'Fulfilled',
    icon: 'CheckCircle',
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
    borderColor: 'border-green-200',
  },
  cancelled: {
    label: 'Cancelled',
    icon: 'XCircle',
    bgColor: 'bg-red-100',
    textColor: 'text-red-800',
    borderColor: 'border-red-200',
  },
  returned: {
    label: 'Returned',
    icon: 'RefreshCcw',
    bgColor: 'bg-orange-100',
    textColor: 'text-orange-800',
    borderColor: 'border-orange-200',
  },
}

/**
 * Map ItemFulfillmentStatus to StatusCategory
 */
export function getStatusCategory(status: ItemFulfillmentStatus): StatusCategory {
  switch (status) {
    case 'RETURNED':
    case 'REFUNDED':
      return 'returned'
    case 'CANCELLED':
    case 'PICK_DECLINED':
      return 'cancelled'
    case 'FULFILLED':
    case 'DELIVERED':
    case 'COMPLETED':
      return 'fulfilled'
    default:
      // For in-progress statuses, treat as fulfilled for display
      return 'fulfilled'
  }
}
