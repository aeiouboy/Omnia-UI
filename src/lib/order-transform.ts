/**
 * Order Transform Utilities
 *
 * Shared transformation functions for converting full order objects to
 * lightweight summary formats used by Order Analysis.
 */

import { mapLegacyChannel, type StandardChannel } from './channel-utils'
import type { OrderSummary } from '@/types/order-analysis'

/**
 * Full order interface (subset of ApiOrder from external API)
 */
export interface FullOrder {
  id: string
  order_no: string
  status: string
  channel?: string
  total_amount: number
  order_date: string
  sla_info?: {
    target_minutes: number
    elapsed_minutes: number
    status: string
  }
  delivery_type?: string
  deliveryType?: string // Alternative field name
  deliveryMethods?: Array<{
    type: string
  }>
}

/**
 * Maps delivery type from various source formats to normalized lowercase values.
 *
 * Input formats:
 * - FMSDeliveryType: 'Standard Delivery', 'Express Delivery', 'Click & Collect'
 * - deliveryMethods[].type: 'HOME_DELIVERY', 'CLICK_COLLECT'
 * - Existing lowercase: 'standard', 'express', 'click_collect'
 *
 * @param order - Order object with delivery type fields
 * @returns Normalized delivery type: 'standard', 'express', or 'click_collect'
 */
export function normalizeDeliveryType(order: FullOrder): string {
  // Check explicit delivery_type field first
  const dt = order.delivery_type || order.deliveryType

  if (dt) {
    const dtLower = dt.toLowerCase()

    // Already normalized
    if (dtLower === 'standard' || dtLower === 'express' || dtLower === 'click_collect') {
      return dtLower
    }

    // FMS delivery type format
    if (dtLower.includes('express')) return 'express'
    if (dtLower.includes('click') || dtLower.includes('collect')) return 'click_collect'
    if (dtLower.includes('standard')) return 'standard'
  }

  // Check deliveryMethods array
  if (order.deliveryMethods && order.deliveryMethods.length > 0) {
    const method = order.deliveryMethods[0].type?.toUpperCase()
    if (method === 'CLICK_COLLECT') return 'click_collect'
    if (method === 'HOME_DELIVERY') {
      // Default home delivery to standard unless we have more context
      return 'standard'
    }
  }

  // Default to standard
  return 'standard'
}

/**
 * Transforms a full order object to a lightweight OrderSummary.
 *
 * This function is used by both the summary API and client-side transformations
 * to ensure consistent data format across the application.
 *
 * @param order - Full order object from external API or mock data
 * @returns OrderSummary with normalized channel and delivery type
 */
export function transformOrderToSummary(order: FullOrder): OrderSummary {
  // Apply channel normalization using mapLegacyChannel
  const normalizedChannel = mapLegacyChannel(order.channel)

  return {
    id: order.id,
    order_no: order.order_no,
    status: order.status || 'PENDING',
    channel: normalizedChannel,
    total_amount: order.total_amount || 0,
    order_date: order.order_date,
    sla_info: {
      target_minutes: order.sla_info?.target_minutes || 0,
      elapsed_minutes: order.sla_info?.elapsed_minutes || 0,
      status: order.sla_info?.status || '',
    },
    delivery_type: normalizeDeliveryType(order),
  }
}

/**
 * Transforms an array of full orders to OrderSummary format.
 *
 * @param orders - Array of full order objects
 * @returns Array of OrderSummary objects with normalized fields
 */
export function transformOrdersToSummary(orders: FullOrder[]): OrderSummary[] {
  return orders.map(transformOrderToSummary)
}

/**
 * Maps standard channel ('web', 'lazada', 'shopee') to analysis channel (TOL/MKP).
 *
 * TOL (Tops Online): web channel (GrabMart, LINE MAN, etc.)
 * MKP (Marketplace): lazada, shopee channels
 *
 * @param channel - Standard channel from mapLegacyChannel
 * @returns Analysis channel: 'TOL' or 'MKP'
 */
export function mapChannelToAnalysis(channel: StandardChannel): 'TOL' | 'MKP' {
  if (channel === 'lazada' || channel === 'shopee') {
    return 'MKP'
  }
  return 'TOL'
}
