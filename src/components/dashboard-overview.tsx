"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { AlertCircle, BarChart2, CheckCircle, Clock, Package } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { DashboardService } from "@/lib/dashboard-service"

export function DashboardOverview() {
  const [activeTab, setActiveTab] = useState("overview")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [orderData, setOrderData] = useState<any[]>([])
  const [channelData, setChannelData] = useState<any[]>([])
  const [slaComplianceData, setSlaComplianceData] = useState<any[]>([])
  const [processingTime, setProcessingTime] = useState<number>(0)
  const [fulfillmentRate, setFulfillmentRate] = useState<number>(0)
  const [recentOrders, setRecentOrders] = useState<any[]>([])
  const [orderAlerts, setOrderAlerts] = useState<any[]>([])
  const [allOrdersCompliant, setAllOrdersCompliant] = useState(false)

  useEffect(() => {
    loadData()
  }, [activeTab])

  const loadData = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Load data based on active tab
      if (activeTab === "overview") {
        await loadOverviewData()
      } else if (activeTab === "orders") {
        await loadOrdersData()
      } else if (activeTab === "fulfillment") {
        await loadFulfillmentData()
      } else if (activeTab === "analytics") {
        await loadAnalyticsData()
      }
    } catch (err) {
      console.error("Failed to load dashboard data:", err)
      setError("Failed to load dashboard data. Please try again later.")
    } finally {
      setIsLoading(false)
    }
  }

  const loadOverviewData = async () => {
    try {
      // Load channel distribution data
      const channelDistribution = await DashboardService.getChannelDistribution()
      setChannelData(channelDistribution)

      // Load SLA compliance data
      const { data: orders, error } = await supabase.from("orders").select("*")

      if (error) throw error
      if (!orders) return

      // Check if all orders are SLA compliant
      const nonCompliantOrders = orders.filter(
        (order: any) =>
          order.sla_status === "BREACH" ||
          (order.elapsed_minutes > order.sla_target_minutes &&
            order.status !== "DELIVERED" &&
            order.status !== "FULFILLED"),
      )

      setAllOrdersCompliant(nonCompliantOrders.length === 0)

      // Create SLA compliance by channel data
      const channelMap = new Map()

      orders.forEach((order: any) => {
        const channel = order.channel
        if (!channelMap.has(channel)) {
          channelMap.set(channel, {
            channel,
            compliant: 0,
            total: 0,
          })
        }

        const stats = channelMap.get(channel)
        stats.total += 1

        if (
          order.sla_status === "COMPLIANT" ||
          order.status === "DELIVERED" ||
          order.status === "FULFILLED" ||
          order.elapsed_minutes <= order.sla_target_minutes
        ) {
          stats.compliant += 1
        }
      })

      const slaByChannel = Array.from(channelMap.values())
        .map((item) => ({
          channel: item.channel,
          compliance_rate: item.total > 0 ? (item.compliant / item.total) * 100 : 100,
        }))
        .sort((a, b) => b.compliance_rate - a.compliance_rate)

      setSlaComplianceData(slaByChannel)

      // Calculate processing metrics
      const processingOrders = orders.filter((order: any) => order.status !== "DELIVERED" && order.status !== "FULFILLED")

      const avgTime =
        processingOrders.length > 0
          ? processingOrders.reduce((sum: number, order: any) => sum + order.elapsed_minutes, 0) / processingOrders.length
          : 0

      setProcessingTime(avgTime)

      const rate =
        orders.length > 0
          ? (orders.filter((order: any) => order.status === "DELIVERED" || order.status === "FULFILLED").length /
              orders.length) *
            100
          : 0

      setFulfillmentRate(rate)

      // Get recent orders
      const recent = orders
        .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5)

      setRecentOrders(recent)

      // Get order alerts
      const breachedOrders = orders.filter(
        (order: any) =>
          order.sla_status === "BREACH" ||
          (order.elapsed_minutes > order.sla_target_minutes &&
            order.status !== "DELIVERED" &&
            order.status !== "FULFILLED"),
      )

      const nearBreachOrders = orders.filter((order: any) => {
        const remainingMinutes = order.sla_target_minutes - order.elapsed_minutes
        const criticalThreshold = order.sla_target_minutes * 0.2
        return (
          remainingMinutes <= criticalThreshold &&
          remainingMinutes > 0 &&
          order.sla_status !== "BREACH" &&
          order.status !== "DELIVERED" &&
          order.status !== "FULFILLED"
        )
      })

      // Group alerts by business unit
      const alertsByBU = new Map()

      const processOrdersForAlerts = (ordersList: any[], type: string) => {
        ordersList.forEach((order: any) => {
          const bu = order.business_unit || "Unknown"
          if (!alertsByBU.has(bu)) {
            alertsByBU.set(bu, {
              business_unit: bu,
              breached: 0,
              near_breach: 0,
            })
          }

          const stats = alertsByBU.get(bu)
          if (type === "breached") {
            stats.breached += 1
          } else {
            stats.near_breach += 1
          }
        })
      }

      processOrdersForAlerts(breachedOrders, "breached")
      processOrdersForAlerts(nearBreachOrders, "near_breach")

      setOrderAlerts(Array.from(alertsByBU.values()))
    } catch (error) {
      console.error("Error loading overview data:", error)
      throw error
    }
  }

  const loadOrdersData = async () => {
    // Implementation for Orders tab
    const { data: orders, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10)

    if (error) throw error
    setRecentOrders(orders || [])
  }

  const loadFulfillmentData = async () => {
    // Implementation for Fulfillment tab
    const performance = await DashboardService.getFulfillmentPerformance()
    setFulfillmentRate(performance.onTimeFulfillment)
    setProcessingTime(performance.avgFulfillmentTime)
  }

  const loadAnalyticsData = async () => {
    // Implementation for Analytics tab
    const summary = await DashboardService.getAnalyticsSummary()
    const channelDistribution = await DashboardService.getChannelDistribution()
    setChannelData(channelDistribution)
  }

  // Colors for charts
  const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"]

  return (
    <div className="space-y-4">
      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="fulfillment">Fulfillment</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Order Volume by Active Channels */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <BarChart2 className="h-4 w-4 mr-2" />
                  Order Volume by Active Channels
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="h-[200px] flex items-center justify-center">
                    <p className="text-sm text-muted-foreground">Loading...</p>
                  </div>
                ) : channelData.length > 0 ? (
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={channelData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="channel" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="order_count" fill="#3b82f6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-[200px] flex items-center justify-center">
                    <p className="text-sm text-muted-foreground">No order data available</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Order Alerts */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Order Alerts (Live from DB)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="h-[200px] flex items-center justify-center">
                    <p className="text-sm text-muted-foreground">Loading...</p>
                  </div>
                ) : allOrdersCompliant ? (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-md flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    <p className="text-green-700">All orders within SLA compliance</p>
                  </div>
                ) : orderAlerts.length > 0 ? (
                  <div className="space-y-2">
                    {orderAlerts.map((alert, index) => (
                      <div key={index} className="p-3 bg-red-50 border border-red-200 rounded-md">
                        <p className="font-medium text-red-800">{alert.business_unit}</p>
                        <div className="mt-1 text-sm">
                          {alert.breached > 0 && <p className="text-red-700">{alert.breached} SLA breached orders</p>}
                          {alert.near_breach > 0 && (
                            <p className="text-orange-700">{alert.near_breach} orders near breach</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-[200px] flex items-center justify-center">
                    <p className="text-sm text-muted-foreground">No alerts found</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* SLA Compliance by Channel */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <Clock className="h-4 w-4 mr-2" />
                  SLA Compliance by Channel
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="h-[200px] flex items-center justify-center">
                    <p className="text-sm text-muted-foreground">Loading...</p>
                  </div>
                ) : slaComplianceData.length > 0 ? (
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={slaComplianceData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="channel" />
                        <YAxis domain={[0, 100]} />
                        <Tooltip formatter={(value) => [`${Number(value).toFixed(1)}%`, "Compliance Rate"]} />
                        <Bar dataKey="compliance_rate" fill="#10b981" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-[200px] flex items-center justify-center">
                    <p className="text-sm text-muted-foreground">No channel data available</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Order Processing Performance */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <Package className="h-4 w-4 mr-2" />
                  Order Processing Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="h-[200px] flex items-center justify-center">
                    <p className="text-sm text-muted-foreground">Loading...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium mb-2">Average Processing Time (minutes)</h3>
                      {processingTime > 0 ? (
                        <p className="text-2xl font-bold">{processingTime.toFixed(1)}</p>
                      ) : (
                        <p className="text-sm text-muted-foreground">No channel data available</p>
                      )}
                    </div>
                    <div>
                      <h3 className="text-sm font-medium mb-2">Order Fulfillment Rate</h3>
                      <div className="relative h-32 w-32 mx-auto">
                        <svg className="w-full h-full" viewBox="0 0 100 100">
                          <circle
                            className="text-gray-200"
                            strokeWidth="8"
                            stroke="currentColor"
                            fill="transparent"
                            r="40"
                            cx="50"
                            cy="50"
                          />
                          <circle
                            className="text-blue-500"
                            strokeWidth="8"
                            strokeLinecap="round"
                            stroke="currentColor"
                            fill="transparent"
                            r="40"
                            cx="50"
                            cy="50"
                            strokeDasharray={`${(fulfillmentRate / 100) * 251.2} 251.2`}
                            strokeDashoffset="0"
                            transform="rotate(-90 50 50)"
                          />
                        </svg>
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                          <p className="text-xl font-bold">{fulfillmentRate.toFixed(1)}%</p>
                        </div>
                      </div>
                      <p className="text-xs text-center mt-2 text-muted-foreground">Target: 95%</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent Orders */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <Package className="h-4 w-4 mr-2" />
                Recent Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-[200px] flex items-center justify-center">
                  <p className="text-sm text-muted-foreground">Loading...</p>
                </div>
              ) : recentOrders.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-2 font-medium">ORDER NO.</th>
                        <th className="text-left py-2 px-2 font-medium">CUSTOMER</th>
                        <th className="text-left py-2 px-2 font-medium">CHANNEL</th>
                        <th className="text-left py-2 px-2 font-medium">STATUS</th>
                        <th className="text-left py-2 px-2 font-medium">TOTAL</th>
                        <th className="text-left py-2 px-2 font-medium">DATE</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentOrders.map((order) => (
                        <tr key={order.id} className="border-b">
                          <td className="py-2 px-2">{order.order_number}</td>
                          <td className="py-2 px-2">{order.customer_name}</td>
                          <td className="py-2 px-2">{order.channel}</td>
                          <td className="py-2 px-2">
                            <span
                              className={`inline-block px-2 py-1 rounded-full text-xs ${
                                order.status === "DELIVERED" || order.status === "FULFILLED"
                                  ? "bg-green-100 text-green-800"
                                  : order.status === "PROCESSING"
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {order.status}
                            </span>
                          </td>
                          <td className="py-2 px-2">{order.total}</td>
                          <td className="py-2 px-2">{new Date(order.created_at).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="h-[200px] flex items-center justify-center">
                  <p className="text-sm text-muted-foreground">No orders found</p>
                </div>
              )}
              {recentOrders.length > 0 && (
                <div className="mt-4 flex justify-end">
                  <Button variant="outline" size="sm" asChild>
                    <a href="/orders">View All Orders</a>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders">
          {/* Orders tab content */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Orders Management</h2>
            {/* Orders content would go here */}
          </div>
        </TabsContent>

        <TabsContent value="fulfillment">
          {/* Fulfillment tab content */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Fulfillment Management</h2>
            {/* Fulfillment content would go here */}
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          {/* Analytics tab content */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
            {/* Analytics content would go here */}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
