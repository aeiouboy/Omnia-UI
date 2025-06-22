/**
 * Unified SLA calculation utilities for the executive dashboard
 * Handles the confusion between field names (minutes) and actual values (seconds)
 */

export interface SLAInfo {
  target_minutes: number  // Actually in seconds despite the name
  elapsed_minutes: number // Actually in seconds despite the name  
  status: string
}

export interface Order {
  id: string
  status: string
  sla_info?: SLAInfo
}

/**
 * Calculate SLA status for an order
 * @param order Order with SLA info
 * @returns Object with breach, approaching, and compliance status
 */
export function calculateSLAStatus(order: Order) {
  // Skip completed orders
  if (order.status === "DELIVERED" || order.status === "FULFILLED") {
    return {
      isBreach: false,
      isApproaching: false,
      isCompliant: true,
      remainingSeconds: 0,
      elapsedSeconds: 0,
      targetSeconds: 0
    }
  }

  if (!order.sla_info) {
    return {
      isBreach: false,
      isApproaching: false,
      isCompliant: true,
      remainingSeconds: 0,
      elapsedSeconds: 0,
      targetSeconds: 300 // Default 5 minutes
    }
  }

  // API returns values in seconds despite field names suggesting minutes
  const targetSeconds = order.sla_info.target_minutes || 300 // Default 5 minutes
  const elapsedSeconds = order.sla_info.elapsed_minutes || 0

  // Calculate breach status
  const isBreach = elapsedSeconds > targetSeconds || order.sla_info.status === "BREACH"

  // Calculate approaching status (within 20% of target time)
  const remainingSeconds = targetSeconds - elapsedSeconds
  const criticalThreshold = targetSeconds * 0.2 // 20% of target
  const isApproaching = !isBreach && remainingSeconds <= criticalThreshold && remainingSeconds > 0

  // Calculate compliance
  const isCompliant = order.sla_info.status === "COMPLIANT" || 
                     order.status === "DELIVERED" || 
                     order.status === "FULFILLED" ||
                     (!isBreach && !isApproaching)

  return {
    isBreach,
    isApproaching,
    isCompliant,
    remainingSeconds: Math.max(0, remainingSeconds),
    elapsedSeconds,
    targetSeconds
  }
}

/**
 * Filter orders by SLA breach status
 */
export function filterSLABreach(orders: Order[]): Order[] {
  return orders.filter(order => {
    const slaStatus = calculateSLAStatus(order)
    return slaStatus.isBreach
  })
}

/**
 * Filter orders approaching SLA deadline
 */
export function filterApproachingSLA(orders: Order[]): Order[] {
  return orders.filter(order => {
    const slaStatus = calculateSLAStatus(order)
    return slaStatus.isApproaching
  })
}

/**
 * Calculate SLA compliance rate for a set of orders
 */
export function calculateSLAComplianceRate(orders: Order[]): number {
  if (!orders || orders.length === 0) return 100

  const compliantOrders = orders.filter(order => {
    const slaStatus = calculateSLAStatus(order)
    return slaStatus.isCompliant
  })

  return (compliantOrders.length / orders.length) * 100
}

/**
 * Format elapsed time for display (converts seconds to minutes)
 */
export function formatElapsedTime(elapsedSeconds: number): string {
  const minutes = Math.floor(elapsedSeconds / 60)
  return `${minutes}m`
}

/**
 * Format remaining time for display (converts seconds to minutes)
 */
export function formatRemainingTime(remainingSeconds: number): string {
  const minutes = Math.ceil(remainingSeconds / 60)
  return `${minutes}m left`
}

/**
 * Format time over SLA for display (converts seconds to minutes)
 */
export function formatOverTime(elapsedSeconds: number, targetSeconds: number): string {
  const overSeconds = elapsedSeconds - targetSeconds
  const overMinutes = Math.floor(overSeconds / 60)
  return `${overMinutes}m over`
}
