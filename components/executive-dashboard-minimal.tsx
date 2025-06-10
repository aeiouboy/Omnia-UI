"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle, BarChart2, Clock, DollarSign, Package, ShoppingCart } from "lucide-react"

export function ExecutiveDashboard() {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Simple loading simulation
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)
    
    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96 mt-2" />
          </div>
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-[100px]" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-800 rounded-md">
        <div className="flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          <p>{error}</p>
        </div>
        <Button variant="outline" className="mt-4" onClick={() => setError(null)}>
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Executive Dashboard</h1>
          <p className="text-sm text-muted-foreground">Operational insights across all business units</p>
        </div>
        <Button variant="outline" size="sm">
          All Business Units
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Orders Processing */}
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <ShoppingCart className="h-6 w-6 text-blue-600" />
            </div>
            <div className="text-3xl font-bold mt-2">1,247</div>
            <div className="text-sm text-muted-foreground">Processing</div>
          </CardContent>
        </Card>

        {/* SLA Breaches */}
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <div className="text-3xl font-bold mt-2">23</div>
            <div className="text-sm text-muted-foreground">SLA Breaches</div>
          </CardContent>
        </Card>

        {/* Revenue Today */}
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <div className="text-3xl font-bold mt-2">฿2.4M</div>
            <div className="text-sm text-muted-foreground">Revenue Today</div>
          </CardContent>
        </Card>

        {/* Processing Time */}
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <Clock className="h-6 w-6 text-purple-600" />
            </div>
            <div className="text-3xl font-bold mt-2">4.2m</div>
            <div className="text-sm text-muted-foreground">Avg Processing</div>
          </CardContent>
        </Card>

        {/* Active Orders */}
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <Package className="h-6 w-6 text-orange-600" />
            </div>
            <div className="text-3xl font-bold mt-2">891</div>
            <div className="text-sm text-muted-foreground">Active Orders</div>
          </CardContent>
        </Card>

        {/* Fulfillment Rate */}
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <BarChart2 className="h-6 w-6 text-teal-600" />
            </div>
            <div className="text-3xl font-bold mt-2">94.5%</div>
            <div className="text-sm text-muted-foreground">Fulfillment Rate</div>
          </CardContent>
        </Card>
      </div>

      {/* Coming Soon Message */}
      <Card>
        <CardContent className="p-8 text-center">
          <div className="text-lg font-semibold mb-2">Advanced Analytics Coming Soon</div>
          <p className="text-muted-foreground">
            Full dashboard functionality with real-time data integration is being implemented.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}