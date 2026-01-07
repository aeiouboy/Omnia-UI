"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { DashboardShell } from "@/components/dashboard-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Store,
  Package,
  AlertTriangle,
  Clock,
  Search,
  RefreshCw,
  MapPin,
  ArrowLeft,
} from "lucide-react"
import { fetchStorePerformance } from "@/lib/inventory-service"
import type { StorePerformance } from "@/types/inventory"

type FilterType = "all" | "critical" | "low"

export default function StockByStorePage() {
  const router = useRouter()

  // State management
  const [storeData, setStoreData] = useState<StorePerformance[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Filter state
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState<FilterType>("all")

  // Load store performance data
  const loadData = async (showLoadingState = true) => {
    if (showLoadingState) {
      setLoading(true)
    } else {
      setRefreshing(true)
    }
    setError(null)

    try {
      const response = await fetchStorePerformance()
      setStoreData(response.stores)
    } catch (err) {
      console.error("Failed to load store performance data:", err)
      setError("Failed to load store data. Please try again.")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Calculate summary statistics
  const summary = useMemo(() => {
    return {
      totalStores: storeData.length,
      totalProducts: storeData.reduce((sum, store) => sum + store.totalProducts, 0),
      totalLowStock: storeData.filter((store) => store.lowStockItems > 0).length,
      totalOutOfStock: storeData.filter((store) => store.criticalStockItems > 0).length,
    }
  }, [storeData])

  // Filter and sort stores
  const filteredAndSortedStores = useMemo(() => {
    let filtered = [...storeData]

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter((store) =>
        store.storeName.toLowerCase().includes(query)
      )
    }

    // Apply status filter
    if (filterType === "critical") {
      filtered = filtered.filter((store) => store.criticalStockItems > 0)
    } else if (filterType === "low") {
      filtered = filtered.filter((store) => store.lowStockItems > 0)
    }

    // Sort by critical items descending (default)
    filtered.sort((a, b) => b.criticalStockItems - a.criticalStockItems)

    return filtered
  }, [storeData, searchQuery, filterType])

  // Handler functions
  const handleRefresh = () => {
    loadData(false)
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  const handleStoreClick = (storeName: string) => {
    // Navigate to main inventory page with store filter
    router.push(`/inventory?store=${encodeURIComponent(storeName)}`)
  }

  // Loading skeleton
  if (loading) {
    return (
      <DashboardShell>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-8 w-64 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-96 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                </CardHeader>
                <CardContent>
                  <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </DashboardShell>
    )
  }

  // Error state
  if (error) {
    return (
      <DashboardShell>
        <div>
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="text-red-600">Error Loading Data</CardTitle>
              <CardDescription>{error}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => loadData()}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </CardContent>
          </Card>
        </div>
      </DashboardShell>
    )
  }

  return (
    <DashboardShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/inventory")}
              className="hover:bg-muted w-fit"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Inventory
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Stock by Store</h1>
              <p className="text-muted-foreground">
                View inventory performance and stock levels across all Tops stores
              </p>
            </div>
          </div>
          <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {/* Summary KPI Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Stores</CardTitle>
              <Store className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.totalStores}</div>
              <p className="text-xs text-muted-foreground">Active Tops locations</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.totalProducts.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Across all stores</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Stores with Low Stock</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {summary.totalLowStock}
              </div>
              <p className="text-xs text-muted-foreground">Stores needing attention</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Stores with Out of Stock</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {summary.totalOutOfStock}
              </div>
              <p className="text-xs text-muted-foreground">Stores needing immediate attention</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search stores..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="pl-9"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={filterType === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterType("all")}
            >
              All Stores
            </Button>
            <Button
              variant={filterType === "low" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterType("low")}
            >
              Low Stock
            </Button>
            <Button
              variant={filterType === "critical" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterType("critical")}
            >
              Out of Stock
            </Button>
          </div>
        </div>

        {/* Store Cards Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredAndSortedStores.length === 0 ? (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              No stores found matching your search.
            </div>
          ) : (
            filteredAndSortedStores.map((store) => (
              <Card
                key={store.storeName}
                className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:border-primary"
                onClick={() => handleStoreClick(store.storeName)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-primary" />
                      <CardTitle className="text-base line-clamp-2">
                        {store.storeName}
                      </CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Total Products */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Total Products</span>
                    <span className="font-semibold">{store.totalProducts.toLocaleString()}</span>
                  </div>

                  {/* Low Stock Items */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Low Stock</span>
                    <Badge
                      variant="outline"
                      className={store.lowStockItems > 0 ? "bg-yellow-100 text-yellow-800" : "bg-gray-100 text-gray-800"}
                    >
                      {store.lowStockItems}
                    </Badge>
                  </div>

                  {/* Out of Stock Items */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Out of Stock</span>
                    <Badge
                      variant="outline"
                      className={store.criticalStockItems > 0 ? "bg-red-100 text-red-800" : "bg-gray-100 text-gray-800"}
                    >
                      {store.criticalStockItems}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </DashboardShell>
  )
}
