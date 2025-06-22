"use client"

import { memo, useMemo } from "react"
import { TabsContent } from "@/components/ui/tabs"
import { ChartCard } from "@/components/chart-card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ChannelBadge, OrderStatusBadge, SLABadge } from "@/components/order-badges"
import { Eye, RefreshCw, Wifi, WifiOff, Calendar, AlertTriangle } from "lucide-react"
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts"
import { formatGMT7DateTime } from "@/lib/utils"
import { getGMT7Time } from "@/lib/utils"
import { formatCurrencyInt } from "@/lib/currency-utils"
import { HourlyOrderSummaryData, DailyOrderData, ApiOrder } from "./types"

interface OrdersTabProps {
  hourlyOrderSummary: HourlyOrderSummaryData[]
  dailyOrders: DailyOrderData[]
  recentOrders: ApiOrder[]
  isLoadingHourly: boolean
  isLoadingDaily: boolean
  isLoadingRecent: boolean
  isMounted: boolean
  apiStatus: 'loading' | 'success' | 'error' | 'empty'
  currentDateRange: { dateFrom: string; dateTo: string } | null
  lastApiError: string | null
  isManualRefreshing: boolean
  onOrderClick: (order: ApiOrder) => void
  onManualRefresh: () => void
}

export const OrdersTab = memo(function OrdersTab({
  hourlyOrderSummary,
  dailyOrders,
  recentOrders,
  isLoadingHourly,
  isLoadingDaily,
  isLoadingRecent,
  isMounted,
  apiStatus,
  currentDateRange,
  lastApiError,
  isManualRefreshing,
  onOrderClick,
  onManualRefresh
}: OrdersTabProps) {
  return (
    <TabsContent value="orders" className="space-y-6 mt-8">
      <div className="grid grid-cols-1 gap-6">
        {/* Hourly Order Summary */}
        <HourlyOrderSummary 
          data={hourlyOrderSummary}
          isLoading={isLoadingHourly}
          isMounted={isMounted}
        />

        {/* Daily Order Volume */}
        <DailyOrderVolume 
          data={dailyOrders}
          isLoading={isLoadingDaily}
        />

        {/* Recent Orders Table */}
        <RecentOrdersTable
          orders={recentOrders}
          isLoading={isLoadingRecent}
          apiStatus={apiStatus}
          currentDateRange={currentDateRange}
          lastApiError={lastApiError}
          isManualRefreshing={isManualRefreshing}
          onOrderClick={onOrderClick}
          onManualRefresh={onManualRefresh}
        />
      </div>
    </TabsContent>
  )
})

const HourlyOrderSummary = memo(function HourlyOrderSummary({ 
  data, 
  isLoading, 
  isMounted 
}: { 
  data: HourlyOrderSummaryData[]
  isLoading: boolean
  isMounted: boolean 
}) {
  const currentHour = isMounted ? getGMT7Time().getHours() : 0
  const currentHourData = useMemo(() => 
    data.find(h => h.hour === currentHour.toString().padStart(2, '0') + ':00') || 
    { orders: 0, revenue: 0 }
  , [data, currentHour])

  return (
    <ChartCard 
      title="ปริมาณคำสั่งซื้อตามชั่วโมง - 7 วันย้อนหลัง" 
      isLoading={isLoading}
      height="h-[500px]"
    >
      <div className="space-y-4">
        {/* Current Hour Summary */}
        <div className="grid grid-cols-3 gap-8 p-8 bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="text-center space-y-1">
            <div className="text-2xl font-bold text-gray-900">
              {isMounted ? currentHour.toString().padStart(2, '0') : '--'}:00
            </div>
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">ชั่วโมงปัจจุบัน</div>
          </div>
          <div className="text-center space-y-1">
            <div className="text-xl font-bold text-blue-600">{currentHourData.orders}</div>
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">คำสั่งซื้อ</div>
          </div>
          <div className="text-center space-y-1">
            <div className="text-xl font-bold text-green-600">
              {formatCurrencyInt(currentHourData.revenue || 0)}
            </div>
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">รายได้</div>
          </div>
        </div>

        {/* Hourly Chart */}
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="hour" 
                tick={{ fontSize: 12 }}
                interval={1}
              />
              <YAxis yAxisId="left" />
              <YAxis 
                yAxisId="right" 
                orientation="right" 
                tickFormatter={(value) => `฿${value.toLocaleString('th-TH')}`}
              />
              <Tooltip 
                formatter={(value, name) => [
                  name === 'Revenue' ? formatCurrencyInt(Number(value)) : value,
                  name
                ]}
                labelFormatter={(hour) => `Time: ${hour}`}
              />
              <Legend />
              <Bar yAxisId="left" dataKey="orders" fill="#3b82f6" name="Orders" />
              <Bar yAxisId="right" dataKey="revenue" fill="#10b981" name="Revenue" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </ChartCard>
  )
})

function DailyOrderVolume({ 
  data, 
  isLoading 
}: { 
  data: DailyOrderData[]
  isLoading: boolean 
}) {
  return (
    <ChartCard title="Daily Order Volume - Last 7 Days" isLoading={isLoading}>
      <div className="h-[300px]">
        {data && data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(value) => {
                  const date = new Date(value)
                  return `${date.getMonth() + 1}/${date.getDate()}`
                }}
              />
              <YAxis />
              <Tooltip 
                labelFormatter={(value) => {
                  const date = new Date(value)
                  return `Date: ${date.toLocaleDateString()}`
                }}
                formatter={(value, name) => [value, name === 'orders' ? 'Orders' : 'Revenue']}
              />
              <Legend />
              <Bar dataKey="orders" fill="#10b981" name="Orders" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-gray-600">No daily order data available</p>
          </div>
        )}
      </div>
    </ChartCard>
  )
}

function RecentOrdersTable({
  orders,
  isLoading,
  apiStatus,
  currentDateRange,
  lastApiError,
  isManualRefreshing,
  onOrderClick,
  onManualRefresh
}: {
  orders: ApiOrder[]
  isLoading: boolean
  apiStatus: 'loading' | 'success' | 'error' | 'empty'
  currentDateRange: { dateFrom: string; dateTo: string } | null
  lastApiError: string | null
  isManualRefreshing: boolean
  onOrderClick: (order: ApiOrder) => void
  onManualRefresh: () => void
}) {
  return (
    <ChartCard title="รายการคำสั่งซื้อล่าสุด" isLoading={isLoading}>
      <div className="space-y-4">
        {/* API Status and Controls Header */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
          <div className="flex items-center space-x-3">
            {/* API Status Indicator */}
            <div className="flex items-center space-x-2">
              {apiStatus === 'loading' && (
                <>
                  <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />
                  <span className="text-sm text-blue-600">กำลังโหลดข้อมูล...</span>
                </>
              )}
              {apiStatus === 'success' && (
                <>
                  <Wifi className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-600">เชื่อมต่อสำเร็จ</span>
                </>
              )}
              {apiStatus === 'error' && (
                <>
                  <WifiOff className="w-4 h-4 text-red-500" />
                  <span className="text-sm text-red-600">เชื่อมต่อไม่สำเร็จ</span>
                </>
              )}
              {apiStatus === 'empty' && (
                <>
                  <Wifi className="w-4 h-4 text-orange-500" />
                  <span className="text-sm text-orange-600">ไม่มีข้อมูล</span>
                </>
              )}
            </div>
            
            {/* Date Range Display */}
            {currentDateRange && (
              <div className="flex items-center space-x-1 text-sm text-gray-500">
                <Calendar className="w-4 h-4" />
                <span>
                  {currentDateRange.dateFrom} ถึง {currentDateRange.dateTo}
                </span>
              </div>
            )}
          </div>
          
          {/* Manual Refresh Button */}
          <Button 
            variant="outline" 
            size="sm"
            onClick={onManualRefresh}
            disabled={isManualRefreshing || apiStatus === 'loading'}
            className="flex items-center space-x-2"
          >
            <RefreshCw className={`w-4 h-4 ${isManualRefreshing ? 'animate-spin' : ''}`} />
            <span>{isManualRefreshing ? 'กำลังรีเฟรช...' : 'รีเฟรช'}</span>
          </Button>
        </div>

        {/* Error Message */}
        {apiStatus === 'error' && lastApiError && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <div>
                <p className="font-medium">ไม่สามารถโหลดข้อมูลได้</p>
                <p className="text-sm mt-1">{lastApiError}</p>
                <p className="text-sm mt-1">กดปุ่ม "รีเฟรช" เพื่อลองใหม่อีกครั้ง</p>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Orders Table */}
        {orders.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="whitespace-nowrap">Order ID</TableHead>
                  <TableHead className="whitespace-nowrap">Order No</TableHead>
                  <TableHead className="whitespace-nowrap">ลูกค้า</TableHead>
                  <TableHead className="whitespace-nowrap">ช่องทาง</TableHead>
                  <TableHead className="whitespace-nowrap">สถานะ</TableHead>
                  <TableHead className="whitespace-nowrap text-right">ยอดเงิน</TableHead>
                  <TableHead className="whitespace-nowrap">วันที่</TableHead>
                  <TableHead className="whitespace-nowrap">SLA</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.slice(0, 20).map((order, index) => (
                  <TableRow key={order.id || index} className="hover:bg-gray-50 cursor-pointer">
                    <TableCell className="font-mono text-sm">
                      <button
                        onClick={() => onOrderClick(order)}
                        className="text-blue-600 hover:text-blue-800 font-medium hover:underline text-left"
                      >
                        {order.id}
                      </button>
                    </TableCell>
                    <TableCell>{order.order_no}</TableCell>
                    <TableCell>{order.customer?.name || '-'}</TableCell>
                    <TableCell>
                      <ChannelBadge channel={order.channel} />
                    </TableCell>
                    <TableCell>
                      <OrderStatusBadge status={order.status} />
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      ฿{(order.total_amount || 0).toLocaleString('th-TH')}
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {formatGMT7DateTime(order.order_date)}
                    </TableCell>
                    <TableCell>
                      {order.sla_info ? (
                        <SLABadge
                          targetMinutes={order.sla_info.target_minutes}
                          elapsedMinutes={order.sla_info.elapsed_minutes}
                          status={order.status}
                        />
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">ไม่พบข้อมูลคำสั่งซื้อ</p>
          </div>
        )}

        {/* View All Button */}
        {orders.length > 20 && (
          <div className="text-center mt-4">
            <Button 
              variant="outline"
              onClick={() => {
                // Navigate to Order Management Hub
                window.location.href = '/order-management'
              }}
              className="flex items-center space-x-2 mx-auto"
            >
              <Eye className="w-4 h-4" />
              <span>ดูทั้งหมด ({orders.length} รายการ)</span>
            </Button>
          </div>
        )}
      </div>
    </ChartCard>
  )
}
