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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalendarIcon, Download, RefreshCw, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { OrderAnalysisView } from "@/types/order-analysis"

import { DashboardShell } from "@/components/dashboard-shell"

export default function OrderAnalysisPage() {
    const { data, isLoading, error, dateRange, setDateRange, refresh } = useOrderSummary()
    const [viewMode, setViewMode] = useState<OrderAnalysisView>("both")

    // Handle Export
    const handleExport = () => {
        if (!data || !data.dailyOrdersByChannel.length) return

        const exportRows = data.dailyOrdersByChannel.map(dayOrders => {
            // Find matching revenue data for the same day
            const dayRevenue = data.dailyRevenueByChannel.find(r => r.date === dayOrders.date)

            return {
                date: dayOrders.date,
                totalAmount: dayRevenue?.totalRevenue || 0,
                tolOrders: dayOrders.TOL,
                mkpOrders: dayOrders.MKP,
                qcOrders: dayOrders.QC
            }
        })

        const filename = `order_analysis_export_${format(new Date(), 'yyyy-MM-dd')}`
        exportOrderAnalysisToCSV(exportRows, filename)
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
                            disabled={isLoading || !data || data.dailyOrdersByChannel.length === 0}
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
