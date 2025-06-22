"use client"

import { memo } from "react"
import { TabsContent } from "@/components/ui/tabs"
import { ChartCard } from "@/components/chart-card"
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts"

interface FulfillmentData {
  branch: string
  total: number
  fulfilled: number
  rate: number
}

interface ChannelPerformanceData {
  channel: string
  orders: number
  revenue: number
  sla_rate: number
}

interface FulfillmentTabProps {
  fulfillmentByBranch: FulfillmentData[]
  channelPerformance: ChannelPerformanceData[]
  isLoadingFulfillment: boolean
  isLoadingChannel: boolean
}

export const FulfillmentTab = memo(function FulfillmentTab({
  fulfillmentByBranch,
  channelPerformance,
  isLoadingFulfillment,
  isLoadingChannel
}: FulfillmentTabProps) {
  return (
    <TabsContent value="fulfillment" className="space-y-4 mt-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Fulfillment by Branch */}
        <ChartCard title="Store Fulfillment Performance" isLoading={isLoadingFulfillment}>
          <div className="space-y-6">
            {fulfillmentByBranch.length > 0 ? (
              fulfillmentByBranch.map((branch) => (
                <BranchFulfillmentCard key={branch.branch} branch={branch} />
              ))
            ) : (
              <EmptyDataMessage 
                icon="📊"
                title="ไม่มีข้อมูลการจัดส่ง"
                subtitle="ไม่พบข้อมูลคำสั่งซื้อใน 7 วันที่ผ่านมา"
              />
            )}
          </div>
        </ChartCard>

        {/* Channel Performance */}
        <ChartCard title="Channel Performance" isLoading={isLoadingChannel}>
          <div className="h-[300px]">
            {channelPerformance && channelPerformance.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={channelPerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="channel" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip 
                    formatter={(value, name) => [
                      name === 'revenue' ? `฿${(Number(value) / 1000000).toLocaleString('th-TH', {minimumFractionDigits: 1, maximumFractionDigits: 1})}M` : 
                      name === 'sla_rate' ? `${Number(value).toFixed(1)}%` : value,
                      name === 'orders' ? 'Orders' : 
                      name === 'sla_rate' ? 'Fulfillment Rate' : name
                    ]}
                  />
                  <Legend formatter={(value) => value === 'orders' ? 'Orders' : value === 'sla_rate' ? 'Fulfillment Rate' : value} />
                  <Bar yAxisId="left" dataKey="orders" fill="#3b82f6" name="Orders" />
                  <Bar yAxisId="right" dataKey="sla_rate" fill="#10b981" name="Fulfillment Rate" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <p className="text-sm text-gray-600 font-medium">ไม่มีข้อมูลประสิทธิภาพช่องทาง</p>
                  <p className="text-xs text-gray-400 mt-1">ไม่พบข้อมูลคำสั่งซื้อใน 7 วันที่ผ่านมา</p>
                </div>
              </div>
            )}
          </div>
        </ChartCard>
      </div>
    </TabsContent>
  )
})

function BranchFulfillmentCard({ branch }: { branch: FulfillmentData }) {
  return (
    <div className="p-6 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 space-y-4 group">
      <div className="flex justify-between items-center">
        <span className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
          {branch.branch}
        </span>
        <div className="text-right">
          <div className="text-xl font-bold text-green-600">{Number(branch.rate).toFixed(1)}%</div>
          <div className="text-sm text-gray-500">
            {branch.fulfilled}/{branch.total} orders
          </div>
        </div>
      </div>
      <div className="relative h-3 w-full overflow-hidden rounded-full bg-gray-200">
        <div 
          className="h-full bg-blue-500 transition-all duration-300 ease-in-out rounded-full"
          style={{ width: `${Math.min(Number(branch.rate), 100)}%` }}
        />
      </div>
      <div className="flex justify-between text-sm text-gray-500">
        <span>Fulfilled: {branch.fulfilled}</span>
        <span>Target: 95%</span>
      </div>
    </div>
  )
}

function EmptyDataMessage({ 
  icon, 
  title, 
  subtitle 
}: { 
  icon: string
  title: string
  subtitle: string 
}) {
  return (
    <div className="text-center py-12">
      <div className="text-gray-400 mb-2">{icon}</div>
      <p className="text-sm text-gray-600 font-medium">{title}</p>
      <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
    </div>
  )
}