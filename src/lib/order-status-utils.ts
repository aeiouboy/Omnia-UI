// Order Status Utility Functions
// Defines cancellable and non-cancellable statuses based on order lifecycle

/**
 * Order lifecycle stages where cancellation is still allowed.
 * These statuses represent orders that haven't been shipped yet.
 */
export const CANCELLABLE_STATUSES = [
  'Open',
  'Back Ordered',
  'Partially Back Ordered',
  'Allocated',
  'Partially Allocated',
  'Released',
  'Partially Released',
  'In Process',
  'Partially In Process',
  'Picked',
  'Partially Picked',
  'Packed',
  'Partially Packed',
  'Fulfilled',
  'Partially Fulfilled',
] as const

/**
 * Order lifecycle stages where cancellation is NOT allowed.
 * These statuses represent orders that have been shipped or completed.
 */
export const NON_CANCELLABLE_STATUSES = [
  'Shipped',
  'In Transit',
  'Out for Delivery',
  'Delivered',
  'Partially Delivered',
  'Pending Return',
  'Partially Pending Return',
  'Returned',
  'Partially Returned',
  'Canceled',
] as const

/**
 * Maps common API status variations to canonical status names.
 * This ensures consistent status handling regardless of API response format.
 */
export const STATUS_MAPPINGS: Record<string, string> = {
  'PROCESSING': 'In Process',
  'READY_FOR_PICKUP': 'Packed',
  'OUT_FOR_DELIVERY': 'Out for Delivery',
  'SUBMITTED': 'Open',
  'CREATED': 'Open',
  'CANCELLED': 'Canceled',
  'FULFILLED': 'Fulfilled',
  'SHIPPED': 'Shipped',
  'DELIVERED': 'Delivered',
  'IN_TRANSIT': 'In Transit',
  'RETURNED': 'Returned',
  'ALLOCATED': 'Allocated',
  'RELEASED': 'Released',
  'PICKED': 'Picked',
  'PACKED': 'Packed',
}

/**
 * Normalizes an order status to its canonical form.
 * Handles API variations and case differences.
 *
 * @param status - The raw status string from the API
 * @returns The normalized canonical status name
 */
export function normalizeOrderStatus(status: string): string {
  if (!status) return ''

  // First check if the uppercase version is in our mappings
  const upperStatus = status.toUpperCase()
  if (STATUS_MAPPINGS[upperStatus]) {
    return STATUS_MAPPINGS[upperStatus]
  }

  // Check if the exact string is in our mappings
  if (STATUS_MAPPINGS[status]) {
    return STATUS_MAPPINGS[status]
  }

  // Return the original status if no mapping found
  // This preserves already-normalized statuses
  return status
}

/**
 * Determines if an order can be cancelled based on its status.
 * Returns true if the order is at or before the "Fulfilled" stage.
 *
 * @param status - The order status (raw or normalized)
 * @returns true if the order can be cancelled, false otherwise
 */
export function isOrderCancellable(status: string): boolean {
  if (!status) return false

  const normalizedStatus = normalizeOrderStatus(status)

  // Check against cancellable statuses (case-insensitive)
  const cancellableSet = new Set(
    CANCELLABLE_STATUSES.map(s => s.toLowerCase())
  )

  return cancellableSet.has(normalizedStatus.toLowerCase())
}

/**
 * Gets a human-readable reason why the cancel button is disabled.
 *
 * @param status - The order status (raw or normalized)
 * @returns A descriptive message explaining why cancellation is disabled
 */
export function getCancelDisabledReason(status: string): string {
  if (!status) return 'Order status unknown'

  const normalizedStatus = normalizeOrderStatus(status)
  const lowerStatus = normalizedStatus.toLowerCase()

  // Check specific statuses and provide appropriate messages
  if (lowerStatus === 'canceled' || lowerStatus === 'cancelled') {
    return 'Order is already cancelled'
  }

  if (lowerStatus === 'shipped' || lowerStatus === 'in transit') {
    return 'Order has been shipped and cannot be cancelled'
  }

  if (lowerStatus === 'out for delivery') {
    return 'Order is out for delivery and cannot be cancelled'
  }

  if (lowerStatus === 'delivered' || lowerStatus === 'partially delivered') {
    return 'Order has been delivered and cannot be cancelled'
  }

  if (lowerStatus.includes('return')) {
    return 'Order is in return process and cannot be cancelled'
  }

  // Generic message for any other non-cancellable status
  return `Order cannot be cancelled (Status: ${normalizedStatus})`
}
