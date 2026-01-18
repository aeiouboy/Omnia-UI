"use client"

import { useState, useEffect, useMemo, useRef } from "react"
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
import { InventoryViewSelector } from "@/components/inventory/inventory-view-selector"
import { InventoryEmptyState } from "@/components/inventory/inventory-empty-state"

// Stock Card page uses only 5 specific view types
const STOCK_CARD_VIEW_TYPES = [
  { value: "ECOM-TH-CFR-LOCD-STD", label: "ECOM-TH-CFR-LOCD-STD", description: "CFR - TOL" },
  { value: "ECOM-TH-CFR-LOCD-MKP", label: "ECOM-TH-CFR-LOCD-MKP", description: "CFR - MKP" },
  { value: "MKP-TH-CFR-LOCD-STD", label: "MKP-TH-CFR-LOCD-STD", description: "CFR - QC" },
  { value: "ECOM-TH-DSS-NW-STD", label: "ECOM-TH-DSS-NW-STD", description: "DS - STD" },
  { value: "ECOM-TH-DSS-LOCD-EXP", label: "ECOM-TH-DSS-LOCD-EXP", description: "DS - EXP" },
]

// Minimum characters required for search to trigger
const MIN_SEARCH_CHARS = 2

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

import { useOrganization } from "@/contexts/organization-context"
import { useInventoryView } from "@/contexts/inventory-view-context"

export default function StockByStorePage() {
  const router = useRouter()

  // Get inventory view context
  const {
    selectedViewType,
    setViewType,
    channels: viewChannels,
    businessUnit: viewBusinessUnit,
    isLoading: isContextLoading,
    clearViewType,
  } = useInventoryView()

  // Get organization context
  const { selectedOrganization } = useOrganization()

  // State management
  const [storeData, setStoreData] = useState<StorePerformance[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Filter state - separate Store ID and Store Name search fields
  const [storeIdSearch, setStoreIdSearch] = useState("")
  const [storeNameSearch, setStoreNameSearch] = useState("")
  const [filterType, setFilterType] = useState<FilterType>("all")
  const [viewMode, setViewMode] = useState<ViewMode>("table") // Default to table view

  // Debounce ref for search inputs
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Sorting state
  const [sortField, setSortField] = useState<SortField>("criticalStockItems")
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc")

  // Derived validation states for minimum character requirement
  const hasValidStoreIdSearch = storeIdSearch.trim().length >= MIN_SEARCH_CHARS
  const hasValidStoreNameSearch = storeNameSearch.trim().length >= MIN_SEARCH_CHARS
  const hasValidSearchCriteria = hasValidStoreIdSearch || hasValidStoreNameSearch

  // Load store performance data
  const loadData = async (showLoadingState = true) => {
    // Check if either filter is active
    const hasViewTypeFilter = selectedViewType && selectedViewType !== "all"

    // Only show empty state when NEITHER filter is provided (with minimum character validation)
    if (!hasViewTypeFilter && !hasValidSearchCriteria) {
      if (!isContextLoading) {
        setLoading(false)
        setStoreData([])
      }
      return
    }

    if (showLoadingState) {
      setLoading(true)
    } else {
      setRefreshing(true)
    }
    setError(null)

    try {
      // Create filters based on current context
      const filters = {
        view: selectedViewType || undefined,
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
    // Debounce search inputs to avoid excessive API calls
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current)
    }
    debounceTimeoutRef.current = setTimeout(() => {
      loadData()
    }, 400)
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
      }
    }
  }, [selectedViewType, storeIdSearch, storeNameSearch, isContextLoading, hasValidSearchCriteria])

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

    // Apply Store ID cross-search filter (searches both storeId and storeName)
    if (hasValidStoreIdSearch) {
      const storeIdLower = storeIdSearch.toLowerCase()
      filtered = filtered.filter((store) =>
        (store.storeId && store.storeId.toLowerCase().includes(storeIdLower)) ||
        (store.storeName && store.storeName.toLowerCase().includes(storeIdLower))
      )
    }

    // Apply Store Name cross-search filter (searches both storeName and storeId)
    if (hasValidStoreNameSearch) {
      const storeNameLower = storeNameSearch.toLowerCase()
      filtered = filtered.filter((store) =>
        (store.storeName && store.storeName.toLowerCase().includes(storeNameLower)) ||
        (store.storeId && store.storeId.toLowerCase().includes(storeNameLower))
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
  }, [storeData, storeIdSearch, storeNameSearch, hasValidStoreIdSearch, hasValidStoreNameSearch, filterType, sortField, sortOrder])

  // Handler functions
  const handleRefresh = () => {
    loadData(false)
  }

  const handleViewChange = (value: string) => {
    if (value === "all") {
      clearViewType()
    } else {
      setViewType(value)
    }
  }

  const handleClearViewType = () => {
    clearViewType()
  }

  const handleStoreClick = (storeName: string) => {
    // Navigate to main inventory page with store filter
    router.push(`/inventory-new?store=${encodeURIComponent(storeName)}`)
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            {/* <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/inventory-new")}
              className="hover:bg-muted w-fit"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Inventory
            </Button> */}
            <h1 className="text-2xl font-semibold tracking-tight">Stock Card</h1>
            <p className="text-base text-muted-foreground mt-1">
              View inventory performance and stock levels across all store locations
            </p>
          </div>
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

        {/* Summary Cards - disabled per user request
        {((selectedViewType && selectedViewType !== "all") || hasValidSearchCriteria) && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
                <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
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
                <CardTitle className="text-sm font-medium">Out of Stock Items</CardTitle>
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
        )}
        */}

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4">
          {/* View Type Filter - Primary Filter */}
          <Select value={selectedViewType || "all"} onValueChange={handleViewChange}>
            <SelectTrigger className="w-[280px] h-10 bg-primary/5 border-primary/30">
              <SelectValue placeholder="All Views" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Views</SelectItem>
              {STOCK_CARD_VIEW_TYPES.map(vt => (
                <SelectItem key={vt.value} value={vt.value}>
                  <div className="flex flex-col">
                    <span className="font-medium">{vt.label}</span>
                    <span className="text-xs text-muted-foreground">{vt.description}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Vertical Divider */}
          <div className="h-8 w-px bg-border" />

          {/* Store Search Group */}
          <div className="flex items-center gap-2 p-2 border border-border/40 rounded-md bg-muted/5">
            <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">Store</span>

            {/* Store ID Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search Store ID..."
                value={storeIdSearch}
                onChange={(e) => setStoreIdSearch(e.target.value)}
                className="pl-9 min-w-[160px] h-10"
              />
            </div>

            {/* Store Name Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search Store Name..."
                value={storeNameSearch}
                onChange={(e) => setStoreNameSearch(e.target.value)}
                className="pl-9 min-w-[160px] h-10"
              />
            </div>
          </div>

          {/* Spacer to push Clear All button to the right */}
          <div className="flex-1" />

          {/* Clear All Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              clearViewType()
              setStoreIdSearch("")
              setStoreNameSearch("")
            }}
            disabled={!selectedViewType && !storeIdSearch && !storeNameSearch}
            className="h-10 hover:bg-gray-100 transition-colors"
          >
            Clear All
          </Button>
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

        {/* Empty State - Show when no view type is selected AND no valid search criteria */}
        {((!selectedViewType || selectedViewType === "all") && !hasValidSearchCriteria) && (
          <InventoryEmptyState
            message={
              (storeIdSearch.trim().length > 0 && storeIdSearch.trim().length < MIN_SEARCH_CHARS) ||
              (storeNameSearch.trim().length > 0 && storeNameSearch.trim().length < MIN_SEARCH_CHARS)
                ? "Enter at least 2 characters to search"
                : "Select a view type or search for a store to display data"
            }
            subtitle={
              (storeIdSearch.trim().length > 0 && storeIdSearch.trim().length < MIN_SEARCH_CHARS) ||
              (storeNameSearch.trim().length > 0 && storeNameSearch.trim().length < MIN_SEARCH_CHARS)
                ? "Store ID and Store Name searches require at least 2 characters"
                : undefined
            }
          />
        )}

        {/* Store Table View - Show when EITHER view type is selected OR valid search criteria is entered */}
        {((selectedViewType && selectedViewType !== "all") || hasValidSearchCriteria) && (
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
                          Store Name
                          <SortIcon field="storeName" />
                        </div>
                      </TableHead>
                      <TableHead
                        className="w-[150px] cursor-pointer hover:bg-muted/50"
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
                          Status
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
                        <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                          No stores found matching your search.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredAndSortedStores.map((store, index) => (
                        <TableRow
                          key={store.storeName}
                          className={`cursor-pointer hover:bg-muted/50 transition-colors ${index % 2 === 1 ? 'bg-muted/30' : ''}`}
                          onClick={() => handleStoreClick(store.storeName)}
                        >
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-primary" />
                              <span className="font-medium">{store.storeName}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-muted-foreground font-mono">{store.storeId || "—"}</span>
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
