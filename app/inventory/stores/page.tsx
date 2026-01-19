"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { DashboardShell } from "@/components/dashboard-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Store,
  Package,
  AlertTriangle,
  Clock,
  Search,
  RefreshCw,
  MapPin,
  ArrowLeft,
  LayoutGrid,
  List,
  ChevronRight,
  TrendingUp,
  Activity,
} from "lucide-react"
import { fetchStorePerformance } from "@/lib/inventory-service"
import type { StorePerformance } from "@/types/inventory"

type FilterType = "all" | "critical" | "low"
type ViewMode = "cards" | "table"
type SortField = "storeName" | "storeId" | "totalProducts" | "lowStockItems" | "criticalStockItems" | "healthScore" | "storeStatus"
type SortOrder = "asc" | "desc"

function getHealthScoreColor(score: number): string {
  if (score >= 80) return "text-green-600"
  if (score >= 60) return "text-yellow-600"
  return "text-red-600"
}

function getHealthScoreBackground(score: number): string {
  if (score >= 80) return "bg-green-100"
  if (score >= 60) return "bg-yellow-100"
  return "bg-red-100"
}

import { useInventoryView } from "@/contexts/inventory-view-context"
import { useOrganization } from "@/contexts/organization-context"

// ... (imports remain)

export default function StockByStorePage() {
  const router = useRouter()

  // Get inventory view context
  const {
    selectedViewType,
    channels: viewChannels,
    businessUnit: viewBusinessUnit,
  } = useInventoryView()

  // Get organization context
  const { selectedOrganization } = useOrganization()

  // State management
  const [storeData, setStoreData] = useState<StorePerformance[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Filter state
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState<FilterType>("all")
  const [viewMode, setViewMode] = useState<ViewMode>("table") // Default to table view

  // Sorting state
  const [sortField, setSortField] = useState<SortField>("criticalStockItems")
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc")

  // Load store performance data
  const loadData = async (showLoadingState = true) => {
    if (showLoadingState) {
      setLoading(true)
    } else {
      setRefreshing(true)
    }
    setError(null)

    try {
      // Create filters based on current context
      const filters = {
        view: selectedViewType || "all",
        businessUnit: selectedOrganization !== 'ALL' ? selectedOrganization : (viewBusinessUnit || undefined),
        channels: viewChannels.length > 0 ? viewChannels : undefined,
      }

      const response = await fetchStorePerformance(filters)
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
  }, [selectedViewType])

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

    // Apply sorting
    filtered.sort((a, b) => {
      const multiplier = sortOrder === "asc" ? 1 : -1

      switch (sortField) {
        case "storeName":
          return multiplier * a.storeName.localeCompare(b.storeName)
        case "storeId":
          return multiplier * (a.storeId || "").localeCompare(b.storeId || "")
        case "totalProducts":
          return multiplier * (a.totalProducts - b.totalProducts)
        case "lowStockItems":
          return multiplier * (a.lowStockItems - b.lowStockItems)
        case "criticalStockItems":
          return multiplier * (a.criticalStockItems - b.criticalStockItems)
        case "healthScore":
          return multiplier * (a.healthScore - b.healthScore)
        case "storeStatus":
          const statusA = a.storeStatus || 'Active'
          const statusB = b.storeStatus || 'Active'
          return multiplier * statusA.localeCompare(statusB)
        default:
          return 0
      }
    })

    return filtered
  }, [storeData, searchQuery, filterType, sortField, sortOrder])

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

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortOrder("desc")
    }
  }

  // Sort icon component
  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null
    return (
      <span className="ml-1">
        {sortOrder === "asc" ? "↑" : "↓"}
      </span>
    )
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
              <h1 className="text-3xl font-bold tracking-tight">Stock Card</h1>
              <p className="text-muted-foreground">
                View inventory performance and stock levels across all store locations
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-2 items-end">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => loadData(false)}
                disabled={refreshing}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Stores</CardTitle>
              <Store className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.totalStores}</div>
              <p className="text-xs text-muted-foreground">Active locations</p>
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

        {/* Filters and View Toggle */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search stores..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="pl-9 w-[240px]"
              />
            </div>
            {/* Filter buttons - hidden per user request
            <div className="flex gap-2">
              <Button
                variant={filterType === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterType("all")}
              >
                All Stores ({summary.totalStores})
              </Button>
              <Button
                variant={filterType === "low" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterType("low")}
              >
                Low Stock ({summary.totalLowStock})
              </Button>
              <Button
                variant={filterType === "critical" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterType("critical")}
              >
                Out of Stock ({summary.totalOutOfStock})
              </Button>
            </div>
            */}
          </div>
          {/* View Toggle - hidden per user request, only table view shown
          <div className="flex gap-1 border rounded-md p-1">
            <Button
              variant={viewMode === "cards" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("cards")}
              className="h-8 px-3"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "table" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("table")}
              className="h-8 px-3"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
          */}
        </div>

        {/* Store Cards Grid View - hidden per user request
        {viewMode === "cards" && (
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
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className={
                            (store.storeStatus || 'Active') === 'Active'
                              ? "bg-green-100 text-green-800 border-green-300 text-xs"
                              : "bg-gray-100 text-gray-600 border-gray-300 text-xs"
                          }
                        >
                          <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1 ${(store.storeStatus || 'Active') === 'Active'
                              ? "bg-green-500"
                              : "bg-gray-400"
                            }`} />
                          {store.storeStatus || 'Active'}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={`${getHealthScoreBackground(store.healthScore)} ${getHealthScoreColor(store.healthScore)} border-0`}
                        >
                          {store.healthScore}%
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Health Score</span>
                        <span className={getHealthScoreColor(store.healthScore)}>{store.healthScore}%</span>
                      </div>
                      <Progress
                        value={store.healthScore}
                        className={`h-2 ${store.healthScore >= 80 ? "[&>div]:bg-green-500" : store.healthScore >= 60 ? "[&>div]:bg-yellow-500" : "[&>div]:bg-red-500"}`}
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="text-center p-2 rounded-lg bg-gray-50">
                        <div className="text-lg font-bold">{store.totalProducts}</div>
                        <div className="text-xs text-muted-foreground">Total Products</div>
                      </div>
                      <div className="text-center p-2 rounded-lg bg-yellow-50">
                        <div className="text-lg font-bold text-yellow-700">{store.lowStockItems}</div>
                        <div className="text-xs text-yellow-600">Low Stock</div>
                      </div>
                      <div className="text-center p-2 rounded-lg bg-red-50">
                        <div className="text-lg font-bold text-red-700">{store.criticalStockItems}</div>
                        <div className="text-xs text-red-600">Out of Stock</div>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full" size="sm">
                      View Inventory
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
        */}

        {/* Store Table View */}
        {/* Always show table view since grid is hidden */}
        {true && (
          <Card>
            <CardContent className="p-0">
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead
                        className="w-[300px] cursor-pointer hover:bg-muted/50"
                        onClick={() => handleSort("storeName")}
                      >
                        <div className="flex items-center">
                          Store
                          <SortIcon field="storeName" />
                        </div>
                      </TableHead>
                      <TableHead
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleSort("storeId")}
                      >
                        <div className="flex items-center">
                          Store ID
                          <SortIcon field="storeId" />
                        </div>
                      </TableHead>
                      <TableHead
                        className="text-center cursor-pointer hover:bg-muted/50"
                        onClick={() => handleSort("totalProducts")}
                      >
                        <div className="flex items-center justify-center">
                          Total Products
                          <SortIcon field="totalProducts" />
                        </div>
                      </TableHead>
                      <TableHead
                        className="text-center cursor-pointer hover:bg-muted/50"
                        onClick={() => handleSort("lowStockItems")}
                      >
                        <div className="flex items-center justify-center">
                          Low Stock
                          <SortIcon field="lowStockItems" />
                        </div>
                      </TableHead>
                      <TableHead
                        className="text-center cursor-pointer hover:bg-muted/50"
                        onClick={() => handleSort("criticalStockItems")}
                      >
                        <div className="flex items-center justify-center">
                          Out of Stock
                          <SortIcon field="criticalStockItems" />
                        </div>
                      </TableHead>
                      {/* Health Score column - hidden per user request
                      <TableHead
                        className="text-center cursor-pointer hover:bg-muted/50"
                        onClick={() => handleSort("healthScore")}
                      >
                        <div className="flex items-center justify-center">
                          Health Score
                          <SortIcon field="healthScore" />
                        </div>
                      </TableHead>
                      */}
                      {/* Store Status column - hidden per user request
                      <TableHead
                        className="text-center cursor-pointer hover:bg-muted/50"
                        onClick={() => handleSort("storeStatus")}
                      >
                        <div className="flex items-center justify-center">
                          Store Status
                          <SortIcon field="storeStatus" />
                        </div>
                      </TableHead>
                      */}
                      <TableHead className="w-[100px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAndSortedStores.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                          No stores found matching your search.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredAndSortedStores.map((store) => (
                        <TableRow
                          key={store.storeName}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => handleStoreClick(store.storeName)}
                        >
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-primary" />
                              <span className="font-medium">{store.storeName}</span>
                            </div>
                          </TableCell>
                          <TableCell className="font-mono text-sm text-muted-foreground">
                            {store.storeId || "—"}
                          </TableCell>
                          <TableCell className="text-center font-semibold">
                            {store.totalProducts}
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge
                              variant="outline"
                              className={store.lowStockItems > 0 ? "bg-yellow-100 text-yellow-800" : "bg-gray-100 text-gray-600"}
                            >
                              {store.lowStockItems}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge
                              variant="outline"
                              className={store.criticalStockItems > 0 ? "bg-red-100 text-red-800" : "bg-gray-100 text-gray-600"}
                            >
                              {store.criticalStockItems}
                            </Badge>
                          </TableCell>
                          {/* Health Score cell - hidden per user request
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center gap-2">
                              <Progress
                                value={store.healthScore}
                                className={`h-2 w-20 ${store.healthScore >= 80 ? "[&>div]:bg-green-500" : store.healthScore >= 60 ? "[&>div]:bg-yellow-500" : "[&>div]:bg-red-500"}`}
                              />
                              <span className={`text-sm font-medium ${getHealthScoreColor(store.healthScore)}`}>
                                {store.healthScore}%
                              </span>
                            </div>
                          </TableCell>
                          */}
                          {/* Store Status cell - hidden per user request
                          <TableCell className="text-center">
                            <Badge
                              variant="outline"
                              className={
                                (store.storeStatus || 'Active') === 'Active'
                                  ? "bg-green-100 text-green-800 border-green-300"
                                  : "bg-gray-100 text-gray-600 border-gray-300"
                              }
                            >
                              <span className={`inline-block w-2 h-2 rounded-full mr-1.5 ${
                                (store.storeStatus || 'Active') === 'Active'
                                  ? "bg-green-500"
                                  : "bg-gray-400"
                              }`} />
                              {store.storeStatus || 'Active'}
                            </Badge>
                          </TableCell>
                          */}
                          <TableCell>
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardShell>
  )
}
