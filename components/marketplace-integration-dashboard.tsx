"use client"

import { useState, useEffect } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts"
import { ShoppingCart, AlertTriangle, RefreshCw, ArrowUpDown, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  MarketplaceService,
  type Marketplace,
  type MarketplacePerformance,
  type MarketplaceSummary,
} from "@/lib/marketplace-service"

export function MarketplaceIntegrationDashboard() {
  const [marketplaces, setMarketplaces] = useState<Marketplace[]>([])
  const [performanceData, setPerformanceData] = useState<MarketplacePerformance[]>([])
  const [summary, setSummary] = useState<MarketplaceSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sortField, setSortField] = useState<keyof Marketplace>("name")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [timeRange, setTimeRange] = useState<"7" | "30" | "90">("30")

  useEffect(() => {
    loadData()
  }, [timeRange])

  const loadData = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const [marketplacesData, performanceData, summaryData] = await Promise.all([
        MarketplaceService.getMarketplaces(),
        MarketplaceService.getMarketplacePerformance(Number.parseInt(timeRange)),
        MarketplaceService.getMarketplaceSummary(),
      ])

      setMarketplaces(marketplacesData)
      setPerformanceData(performanceData)
      setSummary(summaryData)
    } catch (err) {
      console.error("Failed to load marketplace data:", err)
      setError("Failed to load marketplace data. Please try again later.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSort = (field: keyof Marketplace) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const sortedMarketplaces = [...marketplaces].sort((a, b) => {
    const aValue = a[sortField]
    const bValue = b[sortField]

    if (typeof aValue === "string" && typeof bValue === "string") {
      return sortDirection === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
    }

    if (typeof aValue === "number" && typeof bValue === "number") {
      return sortDirection === "asc" ? aValue - bValue : bValue - aValue
    }

    return 0
  })

  // Process performance data for charts
  const processChartData = () => {
    // Group by date and sum orders/revenue across marketplaces
    const dailyData: Record<string, { date: string; orders: number; revenue: number }> = {}

    performanceData.forEach((item) => {
      if (!dailyData[item.date]) {
        dailyData[item.date] = { date: item.date, orders: 0, revenue: 0 }
      }
      dailyData[item.date].orders += item.orders
      dailyData[item.date].revenue += item.revenue
    })

    return Object.values(dailyData).sort((a, b) => a.date.localeCompare(b.date))
  }

  // Process marketplace performance data
  const processMarketplaceData = () => {
    const marketplaceData: Record<string, { name: string; orders: number; revenue: number }> = {}

    performanceData.forEach((item) => {
      if (!marketplaceData[item.marketplace_name]) {
        marketplaceData[item.marketplace_name] = {
          name: item.marketplace_name,
          orders: 0,
          revenue: 0,
        }
      }
      marketplaceData[item.marketplace_name].orders += item.orders
      marketplaceData[item.marketplace_name].revenue += item.revenue
    })

    return Object.values(marketplaceData).sort((a, b) => b.revenue - a.revenue)
  }

  const chartData = processChartData()
  const marketplaceChartData = processMarketplaceData()

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-500/20 text-green-700 hover:bg-green-500/30"
      case "Inactive":
        return "bg-gray-500/20 text-gray-700 hover:bg-gray-500/30"
      case "Error":
        return "bg-red-500/20 text-red-700 hover:bg-red-500/30"
      default:
        return "bg-gray-500/20 text-gray-700 hover:bg-gray-500/30"
    }
  }

  if (isLoading && !marketplaces.length) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-2 text-lg text-muted-foreground">Loading marketplace data...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Marketplaces</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.total_marketplaces || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">{summary?.active_marketplaces || 0} active</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.total_orders?.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Across all marketplaces</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${summary?.total_revenue?.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Across all marketplaces</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg. Order Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              $
              {summary && summary.total_orders > 0 ? (summary.total_revenue / summary.total_orders).toFixed(2) : "0.00"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Per marketplace order</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Orders Over Time</CardTitle>
              <div className="flex gap-2">
                <Button variant={timeRange === "7" ? "default" : "outline"} size="sm" onClick={() => setTimeRange("7")}>
                  7d
                </Button>
                <Button
                  variant={timeRange === "30" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTimeRange("30")}
                >
                  30d
                </Button>
                <Button
                  variant={timeRange === "90" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTimeRange("90")}
                >
                  90d
                </Button>
              </div>
            </div>
            <CardDescription>Daily order volume across all marketplaces</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-80">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart
                  data={chartData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(date) => {
                      const d = new Date(date)
                      return `${d.getMonth() + 1}/${d.getDate()}`
                    }}
                  />
                  <YAxis />
                  <Tooltip
                    formatter={(value: number) => [value.toLocaleString(), "Orders"]}
                    labelFormatter={(label) => new Date(label).toLocaleDateString()}
                  />
                  <Line type="monotone" dataKey="orders" stroke="#8884d8" activeDot={{ r: 8 }} name="Orders" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue by Marketplace</CardTitle>
            <CardDescription>Total revenue for the selected time period</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-80">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={marketplaceChartData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => [`$${value.toLocaleString()}`, "Revenue"]} />
                  <Bar dataKey="revenue" fill="#82ca9d" name="Revenue" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Marketplace Integrations</CardTitle>
            <Button variant="outline" size="sm" onClick={loadData} disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              <span className="ml-2 hidden md:inline">Refresh</span>
            </Button>
          </div>
          <CardDescription>Overview of all connected marketplace platforms</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[250px]">
                  <Button variant="ghost" size="sm" onClick={() => handleSort("name")}>
                    Marketplace
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" size="sm" onClick={() => handleSort("status")}>
                    Status
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead className="hidden md:table-cell">
                  <Button variant="ghost" size="sm" onClick={() => handleSort("last_sync")}>
                    Last Sync
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead className="text-right">
                  <Button variant="ghost" size="sm" onClick={() => handleSort("orders_count")}>
                    Orders
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead className="text-right">
                  <Button variant="ghost" size="sm" onClick={() => handleSort("revenue")}>
                    Revenue
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead className="text-right">
                  <Button variant="ghost" size="sm" onClick={() => handleSort("error_count")}>
                    Errors
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedMarketplaces.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <Loader2 className="h-6 w-6 animate-spin" />
                        <span className="ml-2">Loading marketplaces...</span>
                      </div>
                    ) : (
                      "No marketplaces found"
                    )}
                  </TableCell>
                </TableRow>
              ) : (
                sortedMarketplaces.map((marketplace) => (
                  <TableRow key={marketplace.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center">
                        {marketplace.logo_url ? (
                          <img
                            src={marketplace.logo_url || "/placeholder.svg"}
                            alt={marketplace.name}
                            className="w-6 h-6 mr-2 rounded-full"
                          />
                        ) : (
                          <ShoppingCart className="w-5 h-5 mr-2 text-muted-foreground" />
                        )}
                        {marketplace.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(marketplace.status)}>{marketplace.status}</Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {new Date(marketplace.last_sync).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">{marketplace.orders_count.toLocaleString()}</TableCell>
                    <TableCell className="text-right">${marketplace.revenue.toLocaleString()}</TableCell>
                    <TableCell className="text-right">
                      {marketplace.error_count > 0 ? (
                        <div className="flex items-center justify-end text-red-600">
                          <AlertTriangle className="w-4 h-4 mr-1" />
                          {marketplace.error_count}
                        </div>
                      ) : (
                        "0"
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="flex items-center justify-between py-4">
          <div className="text-sm text-muted-foreground">
            Showing <strong>{sortedMarketplaces.length}</strong> marketplaces
          </div>
          <div className="text-sm text-muted-foreground">Last updated: {new Date().toLocaleString()}</div>
        </CardFooter>
      </Card>
    </div>
  )
}
