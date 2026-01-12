"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import Image from "next/image"
import { useRouter, useSearchParams } from "next/navigation"
import { useOrganization } from "@/contexts/organization-context"
import { DashboardShell } from "@/components/dashboard-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Package,
  AlertTriangle,
  Clock,
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Download,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronRight as ChevronRightIcon,
  Scale,
  MapPin,
  Store,
  ArrowLeft,
  X,
} from "lucide-react"
import StockAvailabilityIndicator from "@/components/inventory/stock-availability-indicator"
import {
  fetchInventoryData,
  fetchInventorySummary,
  getUniqueBrands,
} from "@/lib/inventory-service"
import { WAREHOUSE_CODES } from "@/lib/mock-inventory-data"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Check } from "lucide-react"
import type {
  InventoryItem,
  InventoryFilters,
  TopsStore,
  ProductCategory,
  Channel,
} from "@/types/inventory"

type SortField = "productName" | "productId" | "brand" | "currentStock" | "status"
type SortOrder = "asc" | "desc"

function getStatusBadgeVariant(status: string) {
  switch (status) {
    case "healthy":
      return "bg-green-100 text-green-800"
    case "low":
      return "bg-yellow-100 text-yellow-800"
    case "critical":
      return "bg-red-100 text-red-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

function getStatusLabel(status: string) {
  switch (status) {
    case "healthy":
      return "In Stock"
    case "low":
      return "Low Stock"
    case "critical":
      return "Out of Stock"
    default:
      return status
  }
}

function getChannelBadgeClass(channel: Channel): string {
  switch (channel) {
    case "store":
      return "bg-gray-100 text-gray-700 border-gray-300"
    case "website":
      return "bg-blue-100 text-blue-700 border-blue-300"
    case "Grab":
      return "bg-green-100 text-green-700 border-green-300"
    case "LINE MAN":
      return "bg-lime-100 text-lime-700 border-lime-300"
    case "Gokoo":
      return "bg-orange-100 text-orange-700 border-orange-300"
    default:
      return "bg-gray-100 text-gray-700"
  }
}

function getChannelLabel(channel: Channel): string {
  switch (channel) {
    case "store":
      return "Store"
    case "website":
      return "Web"
    case "Grab":
      return "GB"
    case "LINE MAN":
      return "LM"
    case "Gokoo":
      return "GK"
    default:
      return channel
  }
}

export default function InventoryPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Get organization context for filtering
  const { selectedOrganization } = useOrganization()

  // State management
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Tab state
  const [activeTab, setActiveTab] = useState<"all" | "low" | "critical">("all")

  // Filter state
  const [searchQuery, setSearchQuery] = useState("")
  const [sortField, setSortField] = useState<SortField>("productName")
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc")
  const [activeStoreFilter, setActiveStoreFilter] = useState<TopsStore | null>(null)
  const [warehouseFilter, setWarehouseFilter] = useState<string>("all")
  const [categoryFilter, setCategoryFilter] = useState<ProductCategory | "all">("all")
  const [itemTypeFilter, setItemTypeFilter] = useState<"weight" | "unit" | "all">("all")
  const [brandFilter, setBrandFilter] = useState<string>("all")
  const [viewFilter, setViewFilter] = useState<string>("all")
  const [availableBrands, setAvailableBrands] = useState<string[]>([])

  // Pagination state
  const [page, setPage] = useState(1)
  const [pageSize] = useState(25)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)

  // Summary stats
  const [summary, setSummary] = useState({
    totalProducts: 0,
    healthyItems: 0,
    lowStockItems: 0,
    criticalStockItems: 0,
    totalInventoryValue: 0,
  })

  // Read store filter from URL
  useEffect(() => {
    const storeParam = searchParams.get("store")
    if (storeParam) {
      try {
        const decodedStore = decodeURIComponent(storeParam) as TopsStore
        setActiveStoreFilter(decodedStore)
      } catch (error) {
        console.error("Failed to decode store parameter:", error)
        setActiveStoreFilter(null)
      }
    } else {
      setActiveStoreFilter(null)
    }
  }, [searchParams])

  // Build filters based on current state
  const filters: InventoryFilters = useMemo(() => ({
    status: activeTab === "all" ? "all" : activeTab,
    searchQuery,
    page,
    pageSize,
    sortBy: sortField as any,
    sortOrder,
    storeName: activeStoreFilter || "all",
    warehouseCode: warehouseFilter,
    category: categoryFilter,
    itemType: itemTypeFilter,
    brand: brandFilter,
    view: viewFilter,
    businessUnit: selectedOrganization !== 'ALL' ? selectedOrganization : undefined,
  }), [activeTab, searchQuery, page, pageSize, sortField, sortOrder, activeStoreFilter, warehouseFilter, categoryFilter, itemTypeFilter, brandFilter, viewFilter, selectedOrganization])

  // Fetch data function
  const loadData = useCallback(async (showLoadingState = true) => {
    if (showLoadingState) {
      setLoading(true)
    } else {
      setRefreshing(true)
    }
    setError(null)

    try {
      // Fetch inventory, summary, and brands in parallel
      const [inventoryResponse, summaryData, brands] = await Promise.all([
        fetchInventoryData(filters),
        fetchInventorySummary(),
        getUniqueBrands(),
      ])

      setInventoryItems(inventoryResponse.items)
      setTotalPages(inventoryResponse.totalPages)
      setTotalItems(inventoryResponse.total)
      setSummary(summaryData)
      setAvailableBrands(brands)
    } catch (err) {
      console.error("Failed to load inventory data:", err)
      setError("Failed to load inventory data. Please try again.")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [filters])

  // Load data on mount and when filters change
  useEffect(() => {
    loadData()
  }, [loadData])

  // Handler functions
  const handleRefresh = () => {
    loadData(false)
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
    setPage(1) // Reset to first page on search
  }

  const handleTabChange = (value: string) => {
    setActiveTab(value as "all" | "low" | "critical")
    setPage(1) // Reset to first page on tab change
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Toggle sort order if clicking same field
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      // Set new field with ascending order
      setSortField(field)
      setSortOrder("asc")
    }
  }

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
  }

  const handleClearStoreFilter = () => {
    router.push("/inventory")
  }

  const handleWarehouseChange = (value: string) => {
    setWarehouseFilter(value)
    setPage(1)
  }

  const handleCategoryChange = (value: string) => {
    setCategoryFilter(value as ProductCategory | "all")
    setPage(1)
  }

  const handleItemTypeChange = (value: string) => {
    setItemTypeFilter(value as "weight" | "unit" | "all")
    setPage(1)
  }

  const handleBrandChange = (value: string) => {
    setBrandFilter(value)
    setPage(1)
  }

  const handleViewChange = (value: string) => {
    setViewFilter(value)
    setPage(1)
  }

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-4 w-4 ml-1 opacity-40" />
    }
    return sortOrder === "asc"
      ? <ArrowUp className="h-4 w-4 ml-1" />
      : <ArrowDown className="h-4 w-4 ml-1" />
  }

  // Action button handlers
  const handleExport = () => {
    // TODO: Implement export functionality
    console.log("Export clicked")
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
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
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
          <div className="flex-1">
            <div className="flex items-center gap-3">
              {activeStoreFilter && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push("/inventory/stores")}
                  className="hover:bg-muted"
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back to Store Overview
                </Button>
              )}
            </div>
            <div className="flex items-center gap-3 mt-2">
              <h1 className="text-3xl font-bold tracking-tight">
                {activeStoreFilter ? `Inventory - ${activeStoreFilter}` : "Inventory Management"}
              </h1>
              {activeStoreFilter && (
                <Badge
                  variant="outline"
                  className="bg-blue-100 text-blue-800 border-blue-300 cursor-pointer hover:bg-blue-200"
                  onClick={handleClearStoreFilter}
                >
                  <Store className="h-3 w-3 mr-1" />
                  {activeStoreFilter}
                  <X className="h-3 w-3 ml-1" />
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground mt-1">
              {activeStoreFilter
                ? `Viewing products from ${activeStoreFilter}`
                : "Monitor stock levels and manage inventory across all Tops stores"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {!activeStoreFilter && (
              <Button variant="outline" onClick={() => router.push("/inventory/stores")}>
                <Store className="h-4 w-4 mr-2" />
                Stock Card
              </Button>
            )}
            <Button variant="outline" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

      {/* KPI Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{summary.lowStockItems}</div>
            <p className="text-xs text-muted-foreground">Needs attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {summary.criticalStockItems}
            </div>
            <p className="text-xs text-muted-foreground">Immediate attention required</p>
          </CardContent>
        </Card>
      </div>

      {/* Products Table */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
        <div className="space-y-4">
          <Card>
            <CardHeader className="flex flex-col gap-4 pb-4">
              {/* Row 1: Title and Tabs */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle>
                    {activeTab === "all" && "All Products"}
                    {activeTab === "low" && "Low Stock"}
                    {activeTab === "critical" && "Out of Stock"}
                  </CardTitle>
                  <CardDescription>
                    Showing {inventoryItems.length} of {totalItems} products
                  </CardDescription>
                </div>

                {/* Tabs */}
                <TabsList>
                  <TabsTrigger value="all">All Products</TabsTrigger>
                  <TabsTrigger value="low">Low Stock</TabsTrigger>
                  <TabsTrigger value="critical">Out of Stock</TabsTrigger>
                </TabsList>
              </div>

              {/* Row 2: Search and Filters - All Right Aligned */}
              <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t">
                {/* Search Box - First Priority */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search products, barcode..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="w-[200px] pl-9 h-9 text-sm"
                  />
                </div>

                {/* Channel Filter */}
                <Select value={warehouseFilter} onValueChange={handleWarehouseChange}>
                  <SelectTrigger className="w-[140px] h-9">
                    <SelectValue placeholder="All Channels" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Channels</SelectItem>
                    {WAREHOUSE_CODES.map((code) => (
                      <SelectItem key={code} value={code}>{code}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Brand Filter */}
                <Select value={brandFilter} onValueChange={handleBrandChange}>
                  <SelectTrigger className="w-[130px] h-9">
                    <SelectValue placeholder="All Brands" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Brands</SelectItem>
                    {availableBrands.map((brand) => (
                      <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* View Filter */}
                <Select value={viewFilter} onValueChange={handleViewChange}>
                  <SelectTrigger className="w-[140px] h-9">
                    <SelectValue placeholder="All Views" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Views</SelectItem>
                    <SelectItem value="ECOM-TH-CFR-LOCD-STD">ECOM-TH-CFR-LOCD-STD</SelectItem>
                    <SelectItem value="ECOM-TH-DSS-NW-ALL">ECOM-TH-DSS-NW-ALL</SelectItem>
                    <SelectItem value="ECOM-TH-DSS-NW-STD">ECOM-TH-DSS-NW-STD</SelectItem>
                    <SelectItem value="ECOM-TH-DSS-LOCD-EXP">ECOM-TH-DSS-LOCD-EXP</SelectItem>
                    <SelectItem value="ECOM-TH-SSP-NW-STD">ECOM-TH-SSP-NW-STD</SelectItem>
                    <SelectItem value="MKP-TH-SSP-NW-STD">MKP-TH-SSP-NW-STD</SelectItem>
                    <SelectItem value="MKP-TH-CFR-LOCD-STD">MKP-TH-CFR-LOCD-STD</SelectItem>
                    <SelectItem value="ECOM-TH-SSP-NW-ALL">ECOM-TH-SSP-NW-ALL</SelectItem>
                    <SelectItem value="MKP-TH-CFR-MANUAL-SYNC">MKP-TH-CFR-MANUAL-SYNC</SelectItem>
                    <SelectItem value="CMG-ECOM-TH-STD">CMG-ECOM-TH-STD</SelectItem>
                    <SelectItem value="CMG-MKP-SHOPEE-TH-NTW-STD">CMG-MKP-SHOPEE-TH-NTW-STD</SelectItem>
                    <SelectItem value="CMG-MKP-LAZADA-TH-LOC-STD">CMG-MKP-LAZADA-TH-LOC-STD</SelectItem>
                    <SelectItem value="CMG-MKP-MIRAKL-TH-NTW-STD">CMG-MKP-MIRAKL-TH-NTW-STD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">Image</TableHead>
                    <TableHead
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleSort("productName")}
                    >
                      <div className="flex items-center">
                        Product Name
                        <SortIcon field="productName" />
                      </div>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleSort("productId")}
                    >
                      <div className="flex items-center">
                        Barcode
                        <SortIcon field="productId" />
                      </div>
                    </TableHead>
                    <TableHead
                      className="hidden md:table-cell cursor-pointer hover:bg-muted/50"
                      onClick={() => handleSort("brand")}
                    >
                      <div className="flex items-center">
                        Brand
                        <SortIcon field="brand" />
                      </div>
                    </TableHead>
                    <TableHead className="hidden md:table-cell">
                      Item Type
                    </TableHead>
                    <TableHead className="hidden xl:table-cell">
                      Channel
                    </TableHead>
                    <TableHead className="hidden lg:table-cell w-[60px]">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="cursor-help">Config</span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Stock configuration status</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleSort("currentStock")}
                    >
                      <div className="flex items-center">
                        Stock Available / Total
                        <SortIcon field="currentStock" />
                      </div>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleSort("status")}
                    >
                      <div className="flex items-center">
                        Status
                        <SortIcon field="status" />
                      </div>
                    </TableHead>
                    <TableHead className="w-[40px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inventoryItems.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                        No products found matching your search.
                      </TableCell>
                    </TableRow>
                  ) : (
                    inventoryItems.map((item) => (
                      <TableRow
                        key={item.id}
                        className="h-16 cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => {
                          const url = `/inventory/${item.id}`
                          const params = activeStoreFilter ? `?store=${encodeURIComponent(activeStoreFilter)}` : ''
                          router.push(`${url}${params}`)
                        }}
                      >
                        <TableCell>
                          <Image
                            src={item.imageUrl || "/images/placeholder-product.svg"}
                            alt={item.productName}
                            width={48}
                            height={48}
                            className="rounded-md object-cover"
                            unoptimized
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.src = "/images/placeholder-product.svg"
                            }}
                          />
                        </TableCell>
                        <TableCell className="font-semibold">
                          {item.productName}
                        </TableCell>
                        <TableCell className="font-mono text-sm text-muted-foreground">
                          {item.barcode || item.productId}
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                          {item.brand || "—"}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="flex items-center gap-2">
                            {item.itemType === "weight" ? (
                              <Scale className="h-4 w-4 text-blue-600" />
                            ) : (
                              <Package className="h-4 w-4 text-gray-600" />
                            )}
                            <Badge
                              variant="outline"
                              className={`${
                                item.itemType === "weight"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-gray-100 text-gray-800"
                              } text-xs`}
                            >
                              {item.itemType === "weight" ? "Weight" : "Unit"}
                            </Badge>
                          </div>
                        </TableCell>
                        {/* Channel Column */}
                        <TableCell className="hidden xl:table-cell">
                          <div className="flex flex-wrap gap-1">
                            {item.channels && item.channels.length > 0 ? (
                              item.channels.slice(0, 3).map((channel) => (
                                <Badge
                                  key={channel}
                                  variant="outline"
                                  className={`text-xs px-1.5 py-0.5 ${getChannelBadgeClass(channel)}`}
                                >
                                  {getChannelLabel(channel)}
                                </Badge>
                              ))
                            ) : (
                              <span className="text-xs text-muted-foreground">—</span>
                            )}
                            {item.channels && item.channels.length > 3 && (
                              <Badge variant="outline" className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-600">
                                +{item.channels.length - 3}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        {/* Config Status Column */}
                        <TableCell className="hidden lg:table-cell">
                          <div className="flex justify-center">
                            {item.stockConfigStatus === "valid" && (
                              <Check className="h-5 w-5 text-green-600" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <StockAvailabilityIndicator
                              isAvailable={item.availableStock > 0}
                              stockCount={item.availableStock}
                              safetyStock={item.safetyStock}
                              status={item.status}
                            />
                            <span className="text-sm">
                              {item.availableStock}/{item.currentStock}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={getStatusBadgeVariant(item.status)}
                          >
                            {getStatusLabel(item.status)}
                          </Badge>
                        </TableCell>
                        <TableCell className="w-[40px]">
                          <ChevronRightIcon className="h-4 w-4 text-muted-foreground" />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <div className="text-sm text-muted-foreground">
                    Page {page} of {totalPages}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(page - 1)}
                      disabled={page === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(page + 1)}
                      disabled={page === totalPages}
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </Tabs>
      </div>
    </DashboardShell>
  )
}
