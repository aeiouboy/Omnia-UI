"use client"

import { useState } from "react"
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalendarIcon, Download, RefreshCw, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { OrderAnalysisView } from "@/types/order-analysis"
import { DashboardShell } from "@/components/dashboard-shell"

export default function OrdersAnalysisPage() {
    const { data, isLoading, error, dateRange, setDateRange, refresh } = useOrderSummary()
    const [viewMode, setViewMode] = useState<OrderAnalysisView>("both")

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
                            View daily order totals and revenue by channel with stacked bar chart visualization.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                        {/* View Toggle */}
                        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as OrderAnalysisView)} className="w-[300px] sm:w-auto">
                            <TabsList>
                                <TabsTrigger value="orders">Orders</TabsTrigger>
                                <TabsTrigger value="revenue">Revenue</TabsTrigger>
                                <TabsTrigger value="both">Both</TabsTrigger>
                            </TabsList>
                        </Tabs>

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
                        {/* Top Cards Summary */}
                        {data && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
                                    <div className="text-sm font-medium text-muted-foreground">Total Orders</div>
                                    <div className="text-2xl font-bold">{data.totalOrders.toLocaleString()}</div>
                                    <p className="text-xs text-muted-foreground mt-1">in selected period</p>
                                </div>
                                <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
                                    <div className="text-sm font-medium text-muted-foreground">Total Revenue</div>
                                    <div className="text-2xl font-bold">฿{data.totalRevenue.toLocaleString()}</div>
                                    <p className="text-xs text-muted-foreground mt-1">in selected period</p>
                                </div>
                            </div>
                        )}

                        {/* Charts */}
                        {(viewMode === "orders" || viewMode === "both") && (
                            <div className="animate-in fade-in zoom-in-95 duration-500">
                                <StackedOrderChart
                                    data={data?.dailyOrdersByChannel || []}
                                    isLoading={isLoading}
                                />
                            </div>
                        )}

                        {(viewMode === "revenue" || viewMode === "both") && (
                            <div className="animate-in fade-in zoom-in-95 duration-500 slide-in-from-bottom-2">
                                <StackedRevenueChart
                                    data={data?.dailyRevenueByChannel || []}
                                    isLoading={isLoading}
                                />
                            </div>
                        )}
                    </div>
                )}
            </div>
        </DashboardShell>
    )
}
