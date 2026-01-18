"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import type {
  OrderAnalysisData,
  ChannelDailySummary,
  RevenueDailySummary,
  OrderSummary,
  ChannelName,
  CHANNEL_NAMES,
} from "@/types/order-analysis"

/**
 * Format date to display format (e.g., "14-Jan")
 */
function formatDisplayDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { day: '2-digit', month: 'short' }).replace(' ', '-')
}

/**
 * Normalize channel name to match expected channel names (TOL or MKP only)
 */
function normalizeChannelName(channel: string | undefined): ChannelName {
  if (!channel) return 'TOL'

  const normalized = channel.toLowerCase().trim()

  // MKP: Grab, Lineman, Gokoo, Shopee, Lazada, QC, Marketplace
  if (normalized.includes('grab') ||
      normalized.includes('line') || normalized.includes('man') ||
      normalized.includes('gokoo') ||
      normalized.includes('mkp') || normalized.includes('marketplace') ||
      normalized.includes('shopee') || normalized.includes('lazada') ||
      normalized.includes('qc')) {
    return 'MKP'
  }

  // TOL: Web, TOL, Tops Online, and default
  return 'TOL'
}

/**
 * Get default date range (last 7 days)
 */
function getDefaultDateRange(): { dateFrom: string; dateTo: string } {
  const today = new Date()
  const sevenDaysAgo = new Date(today)
  sevenDaysAgo.setDate(today.getDate() - 6)

  return {
    dateFrom: sevenDaysAgo.toISOString().split('T')[0],
    dateTo: today.toISOString().split('T')[0],
  }
}

/**
 * Generate all dates in a range
 */
function generateDateRange(dateFrom: string, dateTo: string): string[] {
  const dates: string[] = []
  const start = new Date(dateFrom)
  const end = new Date(dateTo)

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    dates.push(d.toISOString().split('T')[0])
  }

  return dates
}

/**
 * Aggregate orders by date and channel
 */
function aggregateOrdersByDateAndChannel(
  orders: OrderSummary[],
  dateFrom: string,
  dateTo: string
): { dailyOrders: ChannelDailySummary[]; dailyRevenue: RevenueDailySummary[] } {
  // Initialize all dates in range with zero values
  const dates = generateDateRange(dateFrom, dateTo)

  const ordersByDate = new Map<string, {
    orders: Record<ChannelName, number>
    revenue: Record<ChannelName, number>
  }>()

  // Initialize all dates - only TOL and MKP channels
  for (const date of dates) {
    ordersByDate.set(date, {
      orders: { TOL: 0, MKP: 0 },
      revenue: { TOL: 0, MKP: 0 },
    })
  }

  // Aggregate orders
  for (const order of orders) {
    if (!order.order_date) continue

    const orderDate = order.order_date.split('T')[0]
    const channel = normalizeChannelName(order.channel)

    const existing = ordersByDate.get(orderDate)
    if (existing) {
      existing.orders[channel] += 1
      existing.revenue[channel] += order.total_amount || 0
    }
  }

  // Transform to array format
  const dailyOrders: ChannelDailySummary[] = []
  const dailyRevenue: RevenueDailySummary[] = []

  for (const [date, data] of ordersByDate.entries()) {
    const totalOrders = Object.values(data.orders).reduce((sum, val) => sum + val, 0)
    const totalRevenue = Object.values(data.revenue).reduce((sum, val) => sum + val, 0)

    dailyOrders.push({
      date,
      displayDate: formatDisplayDate(date),
      ...data.orders,
      totalOrders,
      totalRevenue,
    })

    dailyRevenue.push({
      date,
      displayDate: formatDisplayDate(date),
      ...data.revenue,
      totalRevenue,
    })
  }

  // Sort by date ascending
  dailyOrders.sort((a, b) => a.date.localeCompare(b.date))
  dailyRevenue.sort((a, b) => a.date.localeCompare(b.date))

  return { dailyOrders, dailyRevenue }
}

interface UseOrderAnalysisParams {
  dateFrom?: string
  dateTo?: string
}

interface UseOrderAnalysisReturn {
  data: OrderAnalysisData | null
  isLoading: boolean
  error: string | null
  refetch: () => void
}

/**
 * Custom hook for fetching and aggregating order analysis data
 */
export function useOrderAnalysis(params?: UseOrderAnalysisParams): UseOrderAnalysisReturn {
  const defaultRange = useMemo(() => getDefaultDateRange(), [])
  const dateFrom = params?.dateFrom || defaultRange.dateFrom
  const dateTo = params?.dateTo || defaultRange.dateTo

  const [data, setData] = useState<OrderAnalysisData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Fetch orders with large page size to get all orders for the date range
      const url = new URL('/api/orders/summary', window.location.origin)
      url.searchParams.set('page', '1')
      url.searchParams.set('pageSize', '5000')
      url.searchParams.set('dateFrom', dateFrom)
      url.searchParams.set('dateTo', dateTo)

      console.log('📊 Fetching order analysis data:', { dateFrom, dateTo })

      const response = await fetch(url.toString())

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} - ${response.statusText}`)
      }

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch order data')
      }

      const orders: OrderSummary[] = result.data?.data || []

      console.log(`📊 Received ${orders.length} orders for analysis`)

      // Aggregate data by date and channel
      const { dailyOrders, dailyRevenue } = aggregateOrdersByDateAndChannel(orders, dateFrom, dateTo)

      // Calculate totals
      const totalOrders = dailyOrders.reduce((sum, day) => sum + day.totalOrders, 0)
      const totalRevenue = dailyRevenue.reduce((sum, day) => sum + day.totalRevenue, 0)

      setData({
        dailyOrdersByChannel: dailyOrders,
        dailyRevenueByChannel: dailyRevenue,
        platformBreakdown: [], // TODO: Implement platform-level breakdown if needed
        totalOrders,
        totalRevenue,
        dateFrom,
        dateTo,
      })

      console.log('📊 Order analysis data aggregated:', {
        days: dailyOrders.length,
        totalOrders,
        totalRevenue,
      })
    } catch (err) {
      console.error('❌ Failed to fetch order analysis data:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
      setData(null)
    } finally {
      setIsLoading(false)
    }
  }, [dateFrom, dateTo])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return {
    data,
    isLoading,
    error,
    refetch: fetchData,
  }
}

export default useOrderAnalysis
