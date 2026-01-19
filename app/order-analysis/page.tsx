"use client"

import { useState, useMemo } from "react"
import { useOrderSummary } from "@/hooks/use-order-summary"
import { StackedOrderChart } from "@/components/order-analysis/stacked-order-chart"
import { StackedRevenueChart } from "@/components/order-analysis/stacked-revenue-chart"
import { exportOrderAnalysisToCSV } from "@/lib/export-utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { CalendarIcon, Download, RefreshCw, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { ChannelDailySummary, RevenueDailySummary } from "@/types/order-analysis"

import { DashboardShell } from "@/components/dashboard-shell"

type ChannelFilter = 'all' | 'TOL' | 'MKP'

export default function OrderAnalysisPage() {
    const { data, isLoading, error, dateRange, setDateRange, refresh } = useOrderSummary()
    const [channelFilter, setChannelFilter] = useState<ChannelFilter>('all')

    // Calculate Average Order Value
    const averageOrderValue = useMemo(() => {
        if (!data || data.totalOrders === 0) return 0
        return Math.round(data.totalRevenue / data.totalOrders)
    }, [data])

    // Filter chart data by selected channel
    const filteredOrderData = useMemo((): ChannelDailySummary[] => {
        if (!data) return []
        if (channelFilter === 'all') return data.dailyOrdersByChannel

        return data.dailyOrdersByChannel.map(day => ({
            ...day,
            TOL: channelFilter === 'TOL' ? day.TOL : 0,
            MKP: channelFilter === 'MKP' ? day.MKP : 0,
            totalOrders: channelFilter === 'TOL' ? day.TOL : day.MKP,
            totalRevenue: day.totalRevenue // Keep for reference
        }))
    }, [data, channelFilter])

    const filteredRevenueData = useMemo((): RevenueDailySummary[] => {
        if (!data) return []
        if (channelFilter === 'all') return data.dailyRevenueByChannel

        return data.dailyRevenueByChannel.map(day => ({
            ...day,
            TOL: channelFilter === 'TOL' ? day.TOL : 0,
            MKP: channelFilter === 'MKP' ? day.MKP : 0,
            totalRevenue: channelFilter === 'TOL' ? day.TOL : day.MKP
        }))
    }, [data, channelFilter])

    // Calculate filtered totals
    const filteredTotalOrders = useMemo(() => {
        if (!data) return 0
        if (channelFilter === 'all') return data.totalOrders
        return filteredOrderData.reduce((sum, day) => sum + day.totalOrders, 0)
    }, [data, channelFilter, filteredOrderData])

    const filteredTotalRevenue = useMemo(() => {
        if (!data) return 0
        if (channelFilter === 'all') return data.totalRevenue
        return filteredRevenueData.reduce((sum, day) => sum + day.totalRevenue, 0)
    }, [data, channelFilter, filteredRevenueData])

    // Handle Export - exports platform-level breakdown
    const handleExport = () => {
        if (!data || !data.platformBreakdown.length) return

        // Convert platformBreakdown to export format
        const exportRows = data.platformBreakdown.map(item => ({
            date: item.date,
            channel: item.channel,
            platform: item.platform,
            orderCount: item.orderCount,
            revenue: item.revenue
        }))

        // Sort by date, then channel, then platform for consistent output
        exportRows.sort((a, b) => {
            if (a.date !== b.date) return a.date.localeCompare(b.date)
            if (a.channel !== b.channel) return a.channel.localeCompare(b.channel)
            return a.platform.localeCompare(b.platform)
        })

        // Use date range for filename
        const startDate = dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : data.dateFrom
        const endDate = dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : data.dateTo

        exportOrderAnalysisToCSV(exportRows, startDate, endDate)
    }

    return (
        <DashboardShell>
            <div className="container mx-auto p-6 space-y-6 max-w-7xl">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Order Analysis</h1>
                        <p className="text-muted-foreground text-sm">
                            Overview of order volume and revenue by channel
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                        {/* Channel Filter Dropdown */}
                        <Select value={channelFilter} onValueChange={(v) => setChannelFilter(v as ChannelFilter)}>
                            <SelectTrigger className="w-[160px]">
                                <SelectValue placeholder="All Channels" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Channels</SelectItem>
                                <SelectItem value="TOL">TOL</SelectItem>
                                <SelectItem value="MKP">MKP</SelectItem>
                            </SelectContent>
                        </Select>

                        {/* Date Picker and Export Controls Group */}
                        <div className="flex gap-2 border rounded-lg p-1 bg-muted/20">
                            {/* Date Picker */}
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={"outline"}
                                        className={cn(
                                            "w-[240px] justify-start text-left font-normal",
                                            !dateRange && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {dateRange?.from ? (
                                            dateRange.to ? (
                                                <>
                                                    {format(dateRange.from, "LLL dd, y")} -{" "}
                                                    {format(dateRange.to, "LLL dd, y")}
                                                </>
                                            ) : (
                                                format(dateRange.from, "LLL dd, y")
                                            )
                                        ) : (
                                            <span>Pick a date</span>
                                        )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="end">
                                    <Calendar
                                        initialFocus
                                        mode="range"
                                        defaultMonth={dateRange?.from}
                                        selected={dateRange}
                                        onSelect={(range) => {
                                            if (range?.from) {
                                                setDateRange({ from: range.from, to: range.to || range.from })
                                            }
                                        }}
                                        numberOfMonths={2}
                                    />
                                </PopoverContent>
                            </Popover>

                            {/* Export Button */}
                            <Button
                                variant="outline"
                                onClick={handleExport}
                                disabled={isLoading || !data || data.platformBreakdown.length === 0}
                            >
                                <Download className="mr-2 h-4 w-4" />
                                Export
                            </Button>
                        </div>

                        {/* Refresh Button */}
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={refresh}
                            disabled={isLoading}
                            title="Refresh Data"
                        >
                            {isLoading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <RefreshCw className="h-4 w-4" />
                            )}
                        </Button>
                    </div>
                </div>

                {/* Content */}
                {error ? (
                    <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center text-red-700">
                        <p className="font-medium">Error loading data</p>
                        <p className="text-sm mt-1">{error}</p>
                        <Button variant="outline" size="sm" onClick={refresh} className="mt-4 border-red-200 hover:bg-red-100">
                            Try Again
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Top Cards Summary - 3 KPI cards */}
                        {data && (
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="rounded-xl border bg-card text-card-foreground shadow-md hover:shadow-lg transition-shadow p-6">
                                    <div className="text-sm font-medium text-muted-foreground">Total Revenue</div>
                                    <div className="text-4xl font-bold">฿{data.totalRevenue.toLocaleString()}</div>
                                    <p className="text-xs text-muted-foreground mt-1">in selected period</p>
                                </div>
                                <div className="rounded-xl border bg-card text-card-foreground shadow-md hover:shadow-lg transition-shadow p-6">
                                    <div className="text-sm font-medium text-muted-foreground">Total Orders</div>
                                    <div className="text-4xl font-bold">{data.totalOrders.toLocaleString()}</div>
                                    <p className="text-xs text-muted-foreground mt-1">in selected period</p>
                                </div>
                                <div className="rounded-xl border bg-card text-card-foreground shadow-md hover:shadow-lg transition-shadow p-6">
                                    <div className="text-sm font-medium text-muted-foreground">Average Order Value</div>
                                    <div className="text-4xl font-bold">฿{averageOrderValue.toLocaleString()}</div>
                                    <p className="text-xs text-muted-foreground mt-1">per order</p>
                                </div>
                            </div>
                        )}

                        {/* Charts - Always show both */}
                        <div className="animate-in fade-in zoom-in-95 duration-500">
                            <StackedOrderChart
                                data={filteredOrderData}
                                totalOrders={filteredTotalOrders}
                                isLoading={isLoading}
                            />
                        </div>

                        <div className="animate-in fade-in zoom-in-95 duration-500 slide-in-from-bottom-2">
                            <StackedRevenueChart
                                data={filteredRevenueData}
                                totalRevenue={filteredTotalRevenue}
                                isLoading={isLoading}
                            />
                        </div>
                    </div>
                )}
            </div>
        </DashboardShell>
    )
}
