"use client"

import { useMemo } from "react"
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChannelLegend } from "./channel-legend"
import {
    CHANNEL_COLORS,
    type RevenueDailySummary,
} from "@/types/order-analysis"

interface StackedRevenueChartProps {
    data: RevenueDailySummary[]
    isLoading?: boolean
}

/**
 * Custom tooltip for revenue chart
 */
function RevenueChartTooltip({ active, payload, label }: any) {
    if (!active || !payload || !payload.length) return null

    const total = payload.reduce((sum: number, entry: any) => sum + (entry.value || 0), 0)

    return (
        <div className="rounded-lg border bg-background p-3 shadow-lg">
            <p className="font-medium mb-2">{label}</p>
            {payload.map((entry: any, index: number) => (
                <div key={index} className="flex items-center justify-between gap-4 text-sm">
                    <div className="flex items-center gap-2">
                        <div
                            className="w-2.5 h-2.5 rounded-sm"
                            style={{ backgroundColor: entry.fill }}
                        />
                        <span className="text-muted-foreground">{entry.name}</span>
                    </div>
                    <span className="font-medium tabular-nums">฿{entry.value?.toLocaleString() || "0"}</span>
                </div>
            ))}
            <div className="border-t mt-2 pt-2 flex items-center justify-between text-sm font-medium">
                <span>Total</span>
                <span className="tabular-nums">฿{total.toLocaleString()}</span>
            </div>
        </div>
    )
}

/**
 * Stacked bar chart for Revenue/Day view
 * Shows revenue by date, stacked by channel
 */
export function StackedRevenueChart({ data, isLoading }: StackedRevenueChartProps) {
    const maxValue = useMemo(() => {
        if (!data || data.length === 0) return 10000
        const max = Math.max(...data.map((d) => d.totalRevenue))
        return Math.ceil(max * 1.1) // Add 10% padding
    }, [data])

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Revenue Summary Per Day</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-80 flex items-center justify-center">
                        <div className="animate-pulse text-muted-foreground">Loading chart data...</div>
                    </div>
                </CardContent>
            </Card>
        )
    }

    if (!data || data.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Revenue Summary Per Day</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-80 flex items-center justify-center">
                        <div className="text-muted-foreground">No revenue data available</div>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg">Revenue Summary Per Day</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={data}
                            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                            <XAxis
                                dataKey="displayDate"
                                tick={{ fontSize: 12 }}
                                tickLine={false}
                                axisLine={{ stroke: "#e5e7eb" }}
                            />
                            <YAxis
                                domain={[0, maxValue]}
                                tick={{ fontSize: 12 }}
                                tickLine={false}
                                axisLine={{ stroke: "#e5e7eb" }}
                                tickFormatter={(value) => `฿${value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value}`}
                            />
                            <Tooltip content={<RevenueChartTooltip />} />
                            {/* Stack order matches Order Chart: TOL at bottom */}
                            <Bar
                                dataKey="TOL"
                                stackId="revenue"
                                fill={CHANNEL_COLORS.TOL}
                                name="TOL"
                            />
                            <Bar
                                dataKey="MKP"
                                stackId="revenue"
                                fill={CHANNEL_COLORS.MKP}
                                name="MKP"
                            />
                            <Bar
                                dataKey="QC"
                                stackId="revenue"
                                fill={CHANNEL_COLORS.QC}
                                name="QC"
                                radius={[4, 4, 0, 0]}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <ChannelLegend className="mt-4" />
            </CardContent>
        </Card>
    )
}
