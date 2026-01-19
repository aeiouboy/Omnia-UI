"use client"

import { useState, useCallback, useEffect } from "react"
import {
    OrderSummary,
    OrderSummaryApiResponse,
    OrderAnalysisData,
    ChannelDailySummary,
    RevenueDailySummary,
    PlatformDailySummary,
    CHANNEL_NAMES,
    ChannelName
} from "@/types/order-analysis"
import { format, subDays, startOfDay, endOfDay, eachDayOfInterval, isSameDay } from "date-fns"

// Helper to determine channel group - only TOL and MKP
const getChannelGroup = (channel: string): ChannelName => {
    const c = channel.toUpperCase()
    // TOL: Web, TOL, Tops Online, and unknown channels
    if (c.includes("TOL") || c.includes("TOPS ONLINE") || c.includes("WEB")) return "TOL"
    // MKP: Grab, Lineman, Gokoo, Shopee, Lazada, QC, Marketplace, and any other marketplace
    if (c.includes("GRAB") || c.includes("LINE") || c.includes("LINEMAN") || c.includes("GOKOO") ||
        c.includes("MKP") || c.includes("MARKETPLACE") || c.includes("SHOPEE") || c.includes("LAZADA") ||
        c.includes("QC")) return "MKP"
    return "TOL" // Default to TOL if unknown
}

// Helper to determine platform subdivision for export
const getPlatform = (order: OrderSummary): string => {
    const channelGroup = getChannelGroup(order.channel || "")

    if (channelGroup === "MKP") {
        // For MKP, use the specific marketplace name
        const c = (order.channel || "").toUpperCase()
        if (c.includes("SHOPEE")) return "Shopee"
        if (c.includes("LAZADA")) return "Lazada"
        // Use delivery_type if available, otherwise default to channel name
        return order.delivery_type || order.channel || "Other"
    }

    // For TOL, use delivery_type to determine platform
    if (order.delivery_type) {
        const dt = order.delivery_type.toLowerCase()
        if (dt.includes("express") || dt.includes("3h") || dt.includes("next day")) {
            return "Express Delivery"
        }
        if (dt.includes("click") || dt.includes("collect") || dt.includes("pickup")) {
            return "Click & Collect"
        }
        if (dt.includes("standard")) {
            return "Standard Delivery"
        }
        return order.delivery_type
    }

    // Default for TOL without delivery_type
    return "Standard Delivery"
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
            const platformBreakdown: PlatformDailySummary[] = []

            let totalOrderCount = 0
            let totalRevenueAmount = 0

            days.forEach(day => {
                const dateStr = format(day, "yyyy-MM-dd")
                const displayDate = format(day, "dd-MMM")

                // Initialize daily buckets - only TOL and MKP
                const orderCounts: Record<ChannelName, number> = {
                    TOL: 0, MKP: 0
                }
                const revenueCounts: Record<ChannelName, number> = {
                    TOL: 0, MKP: 0
                }

                // Platform-level aggregation for export
                const platformData: Record<string, { channel: ChannelName; orderCount: number; revenue: number }> = {}

                // Filter orders for this day
                const dayOrders = allOrders.filter(o => {
                    // Parse order_date or created_at
                    const orderDate = new Date(o.order_date)
                    return isSameDay(orderDate, day)
                })

                dayOrders.forEach(order => {
                    const group = getChannelGroup(order.channel || "")
                    const platform = getPlatform(order)
                    const platformKey = `${group}-${platform}`

                    orderCounts[group]++
                    revenueCounts[group] += (order.total_amount || 0)

                    // Aggregate by platform
                    if (!platformData[platformKey]) {
                        platformData[platformKey] = { channel: group, orderCount: 0, revenue: 0 }
                    }
                    platformData[platformKey].orderCount++
                    platformData[platformKey].revenue += (order.total_amount || 0)
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

                // Add platform breakdown entries
                Object.entries(platformData).forEach(([key, data]) => {
                    const platform = key.replace(`${data.channel}-`, "")
                    platformBreakdown.push({
                        date: dateStr,
                        displayDate,
                        channel: data.channel,
                        platform,
                        orderCount: data.orderCount,
                        revenue: data.revenue
                    })
                })
            })

            setData({
                dailyOrdersByChannel: dailyOrders,
                dailyRevenueByChannel: dailyRevenue,
                platformBreakdown,
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
