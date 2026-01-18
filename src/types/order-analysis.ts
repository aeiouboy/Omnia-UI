/**
 * Order Analysis Types
 *
 * Type definitions for the Order Analysis feature with stacked bar charts
 * displaying order count and revenue summaries by channel.
 */

/**
 * Channel color scheme for consistent visualization across all charts
 * TOL: Blue (#3b82f6 - Tailwind blue-500) - Tops Online
 * MKP: Orange (#f97316 - Tailwind orange-500) - Marketplace
 */
export const CHANNEL_COLORS = {
  TOL: '#3b82f6',       // Blue (Tailwind blue-500)
  MKP: '#f97316',       // Orange (Tailwind orange-500)
} as const

/**
 * Channel colors for revenue chart - identical to CHANNEL_COLORS for visual consistency
 * Kept separate for potential future differentiation if needed
 */
export const CHANNEL_COLORS_REVENUE = {
  TOL: '#3b82f6',       // Blue (Tailwind blue-500)
  MKP: '#f97316',       // Orange (Tailwind orange-500)
} as const

/**
 * Channel names for the order analysis charts
 * Only TOL (Tops Online) and MKP (Marketplace) channels
 */
export const CHANNEL_NAMES = ['TOL', 'MKP'] as const
export type ChannelName = typeof CHANNEL_NAMES[number]

/**
 * Daily summary data by channel for stacked bar charts
 */
export interface ChannelDailySummary {
  /** Date string in YYYY-MM-DD format */
  date: string
  /** Display date string (e.g., "14-Jan") */
  displayDate: string
  /** Order counts by channel */
  TOL: number
  MKP: number
  /** Total orders for the day */
  totalOrders: number
  /** Total revenue for the day */
  totalRevenue: number
}

/**
 * Revenue daily summary data by channel
 */
export interface RevenueDailySummary {
  /** Date string in YYYY-MM-DD format */
  date: string
  /** Display date string (e.g., "14-Jan") */
  displayDate: string
  /** Revenue by channel */
  TOL: number
  MKP: number
  /** Total revenue for the day */
  totalRevenue: number
}

/**
 * Aggregated order analysis data structure
 */
export interface OrderAnalysisData {
  /** Daily orders aggregated by channel */
  dailyOrdersByChannel: ChannelDailySummary[]
  /** Daily revenue aggregated by channel */
  dailyRevenueByChannel: RevenueDailySummary[]
  /** Platform-level breakdown for export */
  platformBreakdown: PlatformDailySummary[]
  /** Total orders across all days */
  totalOrders: number
  /** Total revenue across all days */
  totalRevenue: number
  /** Date range start */
  dateFrom: string
  /** Date range end */
  dateTo: string
}

/**
 * CSV export row format (legacy - for backward compatibility)
 */
export interface OrderAnalysisExportRow {
  Date: string
  'Total Amount': number
  'TOL Orders': number
  'MKP Orders': number
}

/**
 * Platform-level export row for detailed CSV export
 * Each row represents one date+channel+platform combination
 */
export interface PlatformExportRow {
  /** Date in YYYY-MM-DD format */
  date: string
  /** Channel group: 'TOL' or 'MKP' */
  channel: 'TOL' | 'MKP'
  /** Platform subdivision (e.g., 'Standard Delivery', 'Shopee') */
  platform: string
  /** Number of orders (integer) */
  orderCount: number
  /** Revenue amount (decimal) */
  revenue: number
}

/**
 * Platform-level daily summary for aggregation
 */
export interface PlatformDailySummary {
  date: string
  displayDate: string
  channel: 'TOL' | 'MKP'
  platform: string
  orderCount: number
  revenue: number
}

/**
 * View type for order analysis page
 */
export type OrderAnalysisView = 'orders' | 'revenue' | 'both'

/**
 * Order summary from API
 */
export interface OrderSummary {
  id: string
  order_no: string
  status: string
  channel: string
  total_amount: number
  order_date: string
  sla_info: {
    target_minutes: number
    elapsed_minutes: number
    status: string
  }
  delivery_type?: string
}

/**
 * API response structure
 */
export interface OrderSummaryApiResponse {
  success: boolean
  data: {
    data: OrderSummary[]
    pagination: {
      page: number
      pageSize: number
      total: number
      hasNext: boolean
      hasPrev: boolean
    }
  }
  error?: string
}
