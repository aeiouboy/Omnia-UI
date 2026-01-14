"use client"

import { useState, useCallback, useEffect } from "react"
import {
    OrderSummary,
    OrderSummaryApiResponse,
    OrderAnalysisData,
    ChannelDailySummary,
    RevenueDailySummary,
    CHANNEL_NAMES,
    ChannelName
} from "@/types/order-analysis"
import { format, subDays, startOfDay, endOfDay, eachDayOfInterval, isSameDay } from "date-fns"

// Helper to determine channel group
const getChannelGroup = (channel: string): ChannelName | null => {
    const c = channel.toUpperCase()
    if (c.includes("GRAB") || c.includes("LINE") || c.includes("LINEMAN") || c.includes("GOKOO")) return "QC"
    // Map Web to TOL as per user request
    if (c.includes("TOL") || c.includes("TOPS ONLINE") || c.includes("WEB")) return "TOL"
    if (c.includes("MKP") || c.includes("MARKETPLACE") || c.includes("SHOPEE") || c.includes("LAZADA")) return "MKP"
    return "TOL" // Default to TOL if unknown
}

export function useOrderSummary() {
    const [data, setData] = useState<OrderAnalysisData | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Default date range: Last 7 days
    const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
        from: subDays(new Date(), 6),
        to: new Date()
    })

    const fetchSummary = useCallback(async () => {
        setIsLoading(true)
        setError(null)

        try {
            const fromStr = format(dateRange.from, "yyyy-MM-dd")
            const toStr = format(dateRange.to, "yyyy-MM-dd")

            const allOrders: OrderSummary[] = []
            let page = 1
            let hasNext = true

            // Safety limit for pages to avoid infinite loops
            const MAX_PAGES = 50

            while (hasNext && page <= MAX_PAGES) {
                const response = await fetch(
                    `/api/orders/summary?page=${page}&pageSize=100&dateFrom=${fromStr}&dateTo=${toStr}`
                )

                if (!response.ok) {
                    throw new Error(`Failed to fetch orders: ${response.statusText}`)
                }

                const json: OrderSummaryApiResponse = await response.json()

                if (json.success && json.data.data) {
                    allOrders.push(...json.data.data)
                    hasNext = json.data.pagination.hasNext
                    page++
                } else {
                    hasNext = false
                }
            }

            // Aggregate Data
            const days = eachDayOfInterval({ start: dateRange.from, end: dateRange.to })

            const dailyOrders: ChannelDailySummary[] = []
            const dailyRevenue: RevenueDailySummary[] = []

            let totalOrderCount = 0
            let totalRevenueAmount = 0

            days.forEach(day => {
                const dateStr = format(day, "yyyy-MM-dd")
                const displayDate = format(day, "dd-MMM")

                // Initialize daily buckets
                const orderCounts: Record<ChannelName, number> = {
                    TOL: 0, MKP: 0, QC: 0
                }
                const revenueCounts: Record<ChannelName, number> = {
                    TOL: 0, MKP: 0, QC: 0
                }

                // Filter orders for this day
                const dayOrders = allOrders.filter(o => {
                    // Parse order_date or created_at
                    const orderDate = new Date(o.order_date)
                    return isSameDay(orderDate, day)
                })

                dayOrders.forEach(order => {
                    const group = getChannelGroup(order.channel || "")
                    if (group) {
                        orderCounts[group]++
                        revenueCounts[group] += (order.total_amount || 0)
                    }
                })

                const dayTotalOrders = Object.values(orderCounts).reduce((a, b) => a + b, 0)
                const dayTotalRevenue = Object.values(revenueCounts).reduce((a, b) => a + b, 0)

                totalOrderCount += dayTotalOrders
                totalRevenueAmount += dayTotalRevenue

                dailyOrders.push({
                    date: dateStr,
                    displayDate,
                    ...orderCounts,
                    totalOrders: dayTotalOrders,
                    totalRevenue: dayTotalRevenue
                })

                dailyRevenue.push({
                    date: dateStr,
                    displayDate,
                    ...revenueCounts,
                    totalRevenue: dayTotalRevenue
                })
            })

            setData({
                dailyOrdersByChannel: dailyOrders,
                dailyRevenueByChannel: dailyRevenue,
                totalOrders: totalOrderCount,
                totalRevenue: totalRevenueAmount,
                dateFrom: fromStr,
                dateTo: toStr
            })

        } catch (err: any) {
            console.error("Error fetching order summary:", err)
            setError(err.message || "Failed to load order analysis data")
        } finally {
            setIsLoading(false)
        }
    }, [dateRange])

    // Initial fetch
    useEffect(() => {
        fetchSummary()
    }, [fetchSummary])

    return {
        data,
        isLoading,
        error,
        dateRange,
        setDateRange,
        refresh: fetchSummary
    }
}
