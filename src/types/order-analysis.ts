/**
 * Order Analysis Types
 *
 * Type definitions for the Order Analysis feature with stacked bar charts
 * displaying order count and revenue summaries by channel.
 */

/**
 * Channel color scheme for consistent visualization
 */
/**
 * Channel color scheme for consistent visualization
 */
export const CHANNEL_COLORS = {
  TOL: '#0ea5e9',       // Light Blue 
  MKP: '#7c3aed',       // Purple
  QC: '#16a34a',        // Green (consolidated Quick Commerce)
} as const

/**
 * Channel names for the order analysis charts
 */
export const CHANNEL_NAMES = ['TOL', 'MKP', 'QC'] as const
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
  QC: number
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
  QC: number
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
 * CSV export row format
 */
export interface OrderAnalysisExportRow {
  Date: string
  'Total Amount': number
  'TOL Orders': number
  'MKP Orders': number
  'QC Orders': number
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
