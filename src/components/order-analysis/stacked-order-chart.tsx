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
import { ChartEmptyState } from "./chart-empty-state"
import {
  CHANNEL_COLORS,
  type ChannelDailySummary,
} from "@/types/order-analysis"

interface StackedOrderChartProps {
  data: ChannelDailySummary[]
  totalOrders?: number
  isLoading?: boolean
}

/**
 * Custom tooltip for order chart
 */
function OrderChartTooltip({ active, payload, label }: any) {
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
          <span className="font-medium tabular-nums">{entry.value?.toLocaleString() || 0}</span>
        </div>
      ))}
      <div className="border-t mt-2 pt-2 flex justify-between text-sm font-medium">
        <span>Total</span>
        <span className="tabular-nums">{total.toLocaleString()}</span>
      </div>
    </div>
  )
}

/**
 * Stacked bar chart for Order/Day view
 * Shows order count by date, stacked by channel
 */
export function StackedOrderChart({ data, totalOrders = 0, isLoading }: StackedOrderChartProps) {
  const maxValue = useMemo(() => {
    if (!data || data.length === 0) return 100
    const max = Math.max(...data.map((d) => d.totalOrders))
    return Math.ceil(max * 1.1) // Add 10% padding
  }, [data])

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-lg font-semibold">Orders by Channel</CardTitle>
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
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-lg font-semibold">Orders by Channel</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <div className="text-muted-foreground">No order data available</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Check if any day has actual order data (TOL or MKP > 0)
  // Note: Use Number() to handle potential undefined/null values safely
  const hasOrderData = data.some(d => Number(d.TOL) > 0 || Number(d.MKP) > 0)
  const showEmptyState = !hasOrderData

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-semibold">Orders by Channel</CardTitle>
        <ChannelLegend variant="orders" />
      </CardHeader>
      <CardContent>
        <div className="h-80 w-full relative">
          {showEmptyState && <ChartEmptyState />}
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
                tickFormatter={(value) => value.toLocaleString()}
              />
              <Tooltip content={<OrderChartTooltip />} />
              {/* Stack order: TOL at bottom, MKP on top with rounded corners */}
              <Bar
                dataKey="TOL"
                stackId="orders"
                fill={CHANNEL_COLORS.TOL}
                name="TOL"
              />
              <Bar
                dataKey="MKP"
                stackId="orders"
                fill={CHANNEL_COLORS.MKP}
                name="MKP"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

export default StackedOrderChart
