"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { DashboardService, type TopProduct, type BusinessUnitRevenue, type WeeklyTrend } from "@/lib/dashboard-service"
import { Skeleton } from "@/components/ui/skeleton"
import { formatCurrencyInt, formatCurrencyShort } from "@/lib/currency-utils"

export function AnalyticsTab() {
  const [loading, setLoading] = useState(true)
  const [timeFilter, setTimeFilter] = useState("week")
  const [analyticsSummary, setAnalyticsSummary] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    avgOrderValue: 0,
  })
  const [businessUnitRevenue, setBusinessUnitRevenue] = useState<BusinessUnitRevenue[]>([])
  const [weeklyTrends, setWeeklyTrends] = useState<WeeklyTrend[]>([])
  const [topProducts, setTopProducts] = useState<TopProduct[]>([])

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        const [summary, buRevenue, trends, products] = await Promise.all([
          DashboardService.getAnalyticsSummary(),
          DashboardService.getBusinessUnitRevenue(),
          DashboardService.getWeeklyPerformanceTrends(),
          DashboardService.getTopProducts(),
        ])

        setAnalyticsSummary(summary)
        setBusinessUnitRevenue(buRevenue)
        setWeeklyTrends(trends)
        setTopProducts(products)
      } catch (error) {
        console.error("Error loading analytics data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [timeFilter])

  // Find the maximum revenue to calculate percentages for bar widths
  const maxRevenue = businessUnitRevenue.length > 0 ? Math.max(...businessUnitRevenue.map((bu) => bu.total_revenue)) : 1

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Performance Analytics</h2>
          <Skeleton className="h-10 w-[150px]" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-[150px]" />
          <Skeleton className="h-[150px]" />
          <Skeleton className="h-[150px]" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-[300px]" />
          <Skeleton className="h-[300px]" />
        </div>

        <Skeleton className="h-[400px]" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Performance Analytics</h2>
        <Select value={timeFilter} onValueChange={setTimeFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="This Week" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
            <SelectItem value="quarter">This Quarter</SelectItem>
            <SelectItem value="year">This Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card className="p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Revenue</p>
              <h3 className="text-2xl font-bold mt-1">{formatCurrencyShort(analyticsSummary.totalRevenue, 1)}</h3>
            </div>
            <div className="text-sm font-medium text-green-600">+15.2%</div>
          </div>
          <div className="mt-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 3V21H21" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path
                d="M7 14L11 10L15 14L21 8"
                stroke="#94A3B8"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </Card>

        <Card className="p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Avg Order Value</p>
              <h3 className="text-2xl font-bold mt-1">
                {formatCurrencyInt(Math.round(analyticsSummary.avgOrderValue))}
              </h3>
            </div>
            <div className="text-sm font-medium text-green-600">+8.7%</div>
          </div>
          <div className="mt-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M12 2L2 7L12 12L22 7L12 2Z"
                stroke="#94A3B8"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M2 17L12 22L22 17"
                stroke="#94A3B8"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M2 12L12 17L22 12"
                stroke="#94A3B8"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </Card>

        <Card className="p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Orders</p>
              <h3 className="text-2xl font-bold mt-1">{analyticsSummary.totalOrders.toLocaleString('th-TH')}</h3>
            </div>
            <div className="text-sm font-medium text-green-600">+12.1%</div>
          </div>
          <div className="mt-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M16 4H18C18.5304 4 19.0391 4.21071 19.4142 4.58579C19.7893 4.96086 20 5.46957 20 6V20C20 20.5304 19.7893 21.0391 19.4142 21.4142C19.0391 21.7893 18.5304 22 18 22H6C5.46957 22 4.96086 21.7893 4.58579 21.4142C4.21071 21.0391 4 20.5304 4 20V6C4 5.46957 4.21071 4.96086 4.58579 4.58579C4.96086 4.21071 5.46957 4 6 4H8"
                stroke="#94A3B8"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M15 2H9C8.44772 2 8 2.44772 8 3V5C8 5.55228 8.44772 6 9 6H15C15.5523 6 16 5.55228 16 5V3C16 2.44772 15.5523 2 15 2Z"
                stroke="#94A3B8"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Revenue by Business Unit</h3>
          <div className="space-y-4">
            {businessUnitRevenue.map((bu, index) => (
              <div key={bu.business_unit || `bu-${index}`} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{bu.business_unit}</span>
                  <span className="text-sm font-medium">{formatCurrencyShort(bu.total_revenue, 1)}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-4">
                  <div
                    className={`h-4 rounded-full ${
                      index === 0 ? "bg-green-500" : index === 1 ? "bg-blue-500" : "bg-purple-500"
                    }`}
                    style={{ width: `${(bu.total_revenue / maxRevenue) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Weekly Performance Trends</h3>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyTrends}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="Orders"
                  stroke="#10b981"
                  activeDot={{ r: 8 }}
                  dot={{ r: 4 }}
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="Revenue"
                  stroke="#3b82f6"
                  activeDot={{ r: 8 }}
                  dot={{ r: 4 }}
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card className="p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Top Performing Products</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-600">PRODUCT</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">SKU</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">UNITS SOLD</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">REVENUE</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">GROWTH</th>
              </tr>
            </thead>
            <tbody>
              {topProducts.map((product, index) => (
                <tr key={product.sku || product.product || `product-${index}`} className="border-b border-gray-100">
                  <td className="py-3 px-4">{product.product}</td>
                  <td className="py-3 px-4 text-gray-600">{product.sku}</td>
                  <td className="py-3 px-4">{product.units_sold.toLocaleString('th-TH')}</td>
                  <td className="py-3 px-4">{formatCurrencyInt(product.revenue)}</td>
                  <td className="py-3 px-4 text-green-600 font-medium">+{product.growth}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
