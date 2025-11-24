/**
 * Stock History Chart Component
 *
 * Displays a line chart showing stock levels over the last 30 days
 * with reference lines for minimum stock and reorder point.
 */

"use client"

import { useMemo } from "react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import type { StockHistoryPoint } from "@/types/inventory"

interface StockHistoryChartProps {
  data: StockHistoryPoint[]
  productName?: string
  loading?: boolean
}

export function StockHistoryChart({
  data,
  productName,
  loading = false,
}: StockHistoryChartProps) {
  // Format date for display
  const formattedData = useMemo(() => {
    return data.map((point) => ({
      ...point,
      displayDate: new Date(point.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
    }))
  }, [data])

  // Get min/max values for reference lines (from first data point)
  const minLevel = data.length > 0 ? data[0].minLevel : 0
  const reorderPoint = data.length > 0 ? data[0].reorderPoint : 0

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Stock Level History</CardTitle>
          <CardDescription>Last 30 days</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    )
  }

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Stock Level History</CardTitle>
          <CardDescription>Last 30 days</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            No stock history data available
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Stock Level History</CardTitle>
        <CardDescription>
          {productName ? `${productName} - Last 30 days` : "Last 30 days"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={formattedData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="displayDate"
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              label={{ value: "Units", angle: -90, position: "insideLeft", style: { fontSize: 12 } }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--background))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "var(--radius)",
              }}
              labelStyle={{ color: "hsl(var(--foreground))" }}
            />
            <Legend
              wrapperStyle={{ fontSize: 12 }}
              iconType="line"
            />

            {/* Reference line for minimum stock level */}
            <ReferenceLine
              y={minLevel}
              stroke="hsl(var(--destructive))"
              strokeDasharray="3 3"
              label={{
                value: "Min Level",
                position: "right",
                fill: "hsl(var(--destructive))",
                fontSize: 11,
              }}
            />

            {/* Reference line for reorder point */}
            <ReferenceLine
              y={reorderPoint}
              stroke="hsl(var(--warning))"
              strokeDasharray="3 3"
              label={{
                value: "Reorder Point",
                position: "right",
                fill: "hsl(var(--warning))",
                fontSize: 11,
              }}
            />

            {/* Main stock level line */}
            <Line
              type="monotone"
              dataKey="stock"
              name="Stock Level"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={{ r: 2 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
