"use client"

import { memo, useMemo } from "react"
import { TabsContent } from "@/components/ui/tabs"
import { ChartCard } from "@/components/chart-card"
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts"

interface ProductData {
  name: string
  sku: string
  units: number
  revenue: number
}

interface CategoryData {
  category: string
  revenue: number
  value?: number
}

interface AnalyticsTabProps {
  topProducts: ProductData[]
  revenueByCategory: CategoryData[]
  isLoadingProducts: boolean
  isLoadingCategory: boolean
}

// Colors for pie chart
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

export const AnalyticsTab = memo(function AnalyticsTab({
  topProducts,
  revenueByCategory,
  isLoadingProducts,
  isLoadingCategory
}: AnalyticsTabProps) {
  // Transform category data for pie chart - handle both 'value' and 'revenue' fields
  const categoryChartData = useMemo(() => 
    revenueByCategory.map(item => ({
      name: item.category || 'Other Category',
      value: item.value || item.revenue || 0
    }))
  , [revenueByCategory])

  return (
    <TabsContent value="analytics" className="space-y-6 mt-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Products */}
        <ChartCard title="Top Products by Revenue" isLoading={isLoadingProducts}>
          <div className="space-y-4">
            {topProducts.length > 0 ? (
              <div className="space-y-4">
                {topProducts.map((product, index) => (
                  <ProductCard key={product.sku} product={product} rank={index + 1} />
                ))}
              </div>
            ) : (
              <EmptyDataMessage
                icon="📦"
                title="No product data"
                subtitle="No sales data found in the last 7 days"
              />
            )}
          </div>
        </ChartCard>

        {/* Revenue by Category */}
        <ChartCard title="Revenue by Food Category" isLoading={isLoadingCategory}>
          <div className="h-[300px]">
            {categoryChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`฿${Number(value).toLocaleString()}`, 'Revenue']} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <p className="text-sm text-gray-600 font-medium">No category data</p>
                  <p className="text-xs text-gray-400 mt-1">No revenue data found in the last 7 days</p>
                </div>
              </div>
            )}
          </div>
        </ChartCard>
      </div>
    </TabsContent>
  )
})

function ProductCard({ product, rank }: { product: ProductData; rank: number }) {
  return (
    <div className="flex justify-between items-center p-6 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 group">
      <div className="flex items-center space-x-4">
        <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-50 to-blue-100 rounded-full flex items-center justify-center group-hover:from-blue-100 group-hover:to-blue-200 transition-all duration-200">
          <span className="text-sm font-bold text-blue-600">#{rank}</span>
        </div>
        <div className="space-y-2">
          <div className="font-semibold text-lg text-gray-900 group-hover:text-blue-600 transition-colors">
            {product.name}
          </div>
          <div className="text-sm text-gray-500 bg-gray-50 px-3 py-1 rounded-full inline-block border">
            {product.sku}
          </div>
          <div className="text-sm text-gray-600 flex items-center space-x-2">
            <span>📦</span>
            <span>{product.units} units sold</span>
          </div>
        </div>
      </div>
      <div className="text-right">
        <div className="text-2xl font-bold text-green-600 group-hover:text-green-700 transition-colors">
          ฿{product.revenue.toLocaleString('th-TH')}
        </div>
        <div className="text-sm font-medium text-gray-500">Revenue</div>
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
