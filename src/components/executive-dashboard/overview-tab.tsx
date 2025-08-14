"use client"

import { memo } from "react"
import { TabsContent } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { InteractiveChart } from "@/components/interactive-chart"
import { AlertsSection } from "./alerts-section"
import { OrderAlert } from "./types"

interface OverviewTabProps {
  enhancedChannelData: {
    overview: Array<{ name: string; orders: number }>
    drillDown: Array<{ status: string; orders: number }>
  }
  orderAlerts: OrderAlert[]
  approachingSla: OrderAlert[]
  isLoadingChannelData: boolean
  isLoadingAlerts: boolean
  onEscalate?: () => void
  isEscalating?: boolean
}

export const OverviewTab = memo(function OverviewTab({
  enhancedChannelData,
  orderAlerts,
  approachingSla,
  isLoadingChannelData,
  isLoadingAlerts,
  onEscalate,
  isEscalating
}: OverviewTabProps) {
  return (
    <TabsContent value="overview" className="space-y-6 mt-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Enhanced Interactive Performance Analysis */}
        <InteractiveChart
          title="📊 Channel Performance Analytics"
          initialLevel={{
            id: "channel_metrics",
            title: "Multi-Metric Channel Analysis",
            data: enhancedChannelData.overview.map(channel => ({
              ...channel,
              avgOrderValue: channel.revenue && channel.orders ? channel.revenue / channel.orders : 0,
              fulfillmentRate: Math.random() * 30 + 70,
              efficiency: Math.random() * 40 + 60
            })),
            type: "bar",
            xAxisKey: "name",
            yAxisKey: "orders"
          }}
          drillDownLevels={[
            {
              id: "channel_metrics",
              title: "📈 Channel Volume vs Revenue",
              data: enhancedChannelData.overview.map(channel => ({
                ...channel,
                avgOrderValue: channel.revenue && channel.orders ? channel.revenue / channel.orders : 0,
                fulfillmentRate: Math.random() * 30 + 70,
                efficiency: Math.random() * 40 + 60
              })),
              type: "bar",
              xAxisKey: "name",
              yAxisKey: "orders"
            },
            {
              id: "performance_scatter",
              title: "🎯 Performance Matrix",
              data: enhancedChannelData.overview.map(channel => ({
                name: channel.name,
                orders: channel.orders,
                efficiency: Math.random() * 40 + 60,
                satisfaction: Math.random() * 30 + 70,
                revenue: channel.revenue || 0
              })),
              type: "pie",
              valueKey: "orders",
              nameKey: "name"
            },
            {
              id: "trend_analysis",
              title: "📈 7-Day Performance Trend",
              data: Array.from({length: 7}, (_, i) => ({
                day: `Day ${i + 1}`,
                orders: Math.floor(Math.random() * 100) + 50,
                revenue: Math.random() * 20000 + 5000,
                efficiency: Math.random() * 30 + 70
              })),
              type: "line",
              xAxisKey: "day",
              yAxisKey: "orders"
            }
          ]}
          isLoading={isLoadingChannelData}
          priority="important"
          status="good"
          height="h-[400px]"
          onDataPointClick={(data, level) => {
            console.log("📊 Performance drill-down:", data, level)
          }}
          showInsights={true}
        />

        {/* Order Alerts */}
        <AlertsSection
          orderAlerts={orderAlerts}
          approachingSla={approachingSla}
          isLoading={isLoadingAlerts}
          onEscalate={onEscalate}
          isEscalating={isEscalating}
        />
      </div>
    </TabsContent>
  )
})
