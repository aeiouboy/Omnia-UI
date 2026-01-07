/**
 * Inventory Detail View Component
 *
 * Displays detailed information about a single inventory item including:
 * - Product image and basic info
 * - Stock levels and status
 * - Stock history chart
 * - Recent transactions
 * - Action buttons
 */

"use client"

import { useState, useMemo } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ArrowLeft,
  Package,
  Barcode,
  Store,
  TrendingUp,
  AlertTriangle,
  ChevronRight,
  Scale,
  CheckCircle,
  ShoppingCart,
  Shield,
  Info,
  Search,
  X,
  MapPin,
  ArrowUpDown,
} from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { StockHistoryChart } from "./stock-history-chart"
import { RecentTransactionsTable } from "./recent-transactions-table"
import StockAvailabilityIndicator from "./inventory/stock-availability-indicator"
import {
  formatWarehouseCode,
  getStockStatusColor,
  getStockStatusLabel,
  getActiveStockForLocation,
  hasAvailableStock,
  formatStockQuantity,
} from "@/lib/warehouse-utils"
import type {
  InventoryItem,
  StockHistoryPoint,
  StockTransaction,
  StockLocation,
} from "@/types/inventory"

interface InventoryDetailViewProps {
  item: InventoryItem
  stockHistory: StockHistoryPoint[]
  transactions: StockTransaction[]
  onBack?: () => void
}

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

export function InventoryDetailView({
  item,
  stockHistory,
  transactions,
  onBack,
}: InventoryDetailViewProps) {
  const router = useRouter()

  // State for location filtering and sorting
  const [warehouseFilter, setWarehouseFilter] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [sortBy, setSortBy] = useState<"warehouse" | "location" | "stock">("warehouse")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")

  // Calculate stock percentage
  const stockPercentage = (item.currentStock / item.maxStockLevel) * 100

  // Extract unique warehouse codes
  const uniqueWarehouseCodes = useMemo(() => {
    if (!item.warehouseLocations || item.warehouseLocations.length === 0) {
      return []
    }
    const codes = item.warehouseLocations.map(loc => loc.warehouseCode)
    return Array.from(new Set(codes)).sort()
  }, [item.warehouseLocations])

  // Filter and sort warehouse locations
  const filteredLocations = useMemo(() => {
    if (!item.warehouseLocations || item.warehouseLocations.length === 0) {
      return []
    }

    let filtered = [...item.warehouseLocations]

    // Apply warehouse filter
    if (warehouseFilter !== "all") {
      filtered = filtered.filter(loc => loc.warehouseCode === warehouseFilter)
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(loc =>
        loc.warehouseCode.toLowerCase().includes(query) ||
        loc.locationCode.toLowerCase().includes(query)
      )
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let compareValue = 0

      switch (sortBy) {
        case "warehouse":
          compareValue = a.warehouseCode.localeCompare(b.warehouseCode)
          break
        case "location":
          compareValue = a.locationCode.localeCompare(b.locationCode)
          break
        case "stock":
          compareValue = a.stockAvailable - b.stockAvailable
          break
      }

      return sortOrder === "asc" ? compareValue : -compareValue
    })

    return filtered
  }, [item.warehouseLocations, warehouseFilter, searchQuery, sortBy, sortOrder])

  // Check if filters are active
  const hasActiveFilters = warehouseFilter !== "all" || searchQuery.trim() !== ""

  // Clear all filters
  const clearFilters = () => {
    setWarehouseFilter("all")
    setSearchQuery("")
    setSortBy("warehouse")
    setSortOrder("asc")
  }

  // Handle back navigation
  const handleBack = () => {
    if (onBack) {
      onBack()
    } else {
      router.push("/inventory")
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={handleBack}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Inventory
        </Button>
      </div>

      {/* Product Header */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-6">
            {/* Product Image */}
            <div className="flex-shrink-0">
              <div className="relative w-full md:w-[400px] h-[400px] rounded-lg overflow-hidden border bg-muted">
                <Image
                  src={item.imageUrl || "/images/placeholder-product.svg"}
                  alt={item.productName}
                  fill
                  className="object-cover"
                  unoptimized
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = "/images/placeholder-product.svg"
                  }}
                />
              </div>
            </div>

            {/* Product Info */}
            <div className="flex-1 space-y-4">
              <div>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h1 className="text-3xl font-bold">{item.productName}</h1>
                    <p className="text-muted-foreground mt-1">
                      {item.category}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className={`${getStatusBadgeVariant(item.status)} text-sm px-3 py-1`}
                  >
                    {getStatusLabel(item.status)}
                  </Badge>
                </div>
              </div>

              <Separator />

              {/* Product Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Barcode className="h-4 w-4" />
                    <span>Barcode</span>
                  </div>
                  <p className="font-mono text-lg">{item.barcode || item.productId}</p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    {item.itemType === "weight" || item.itemType === "pack_weight" ? (
                      <Scale className="h-4 w-4" />
                    ) : (
                      <Package className="h-4 w-4" />
                    )}
                    <span>Item Type</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={`${
                        item.itemType === "weight" || item.itemType === "pack_weight"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-800"
                      } text-sm`}
                    >
                      {item.itemType === "weight" && "Weight Item (kg)"}
                      {item.itemType === "pack_weight" && "Pack Weight (kg)"}
                      {item.itemType === "pack" && "Pack Item (pieces)"}
                      {item.itemType === "normal" && "Unit Item (pieces)"}
                    </Badge>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Last Restocked */}
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Last Restocked</p>
                <p className="text-base">
                  {new Date(item.lastRestocked).toLocaleString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Stock Breakdown Section */}
      <Card>
        <CardHeader>
          <CardTitle>Stock Breakdown</CardTitle>
          <CardDescription>
            Detailed breakdown of inventory allocation and safety levels
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TooltipProvider>
            {/* Stock Type Cards Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {/* Available Stock */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="p-4 rounded-lg border bg-green-50 border-green-200 hover:shadow-md transition-shadow cursor-help">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-2 rounded-full bg-green-100">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-medium text-green-900">Available Stock</span>
                        <Info className="h-3 w-3 text-green-600" />
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-green-900 mb-1">
                      {formatStockQuantity(item.availableStock, item.itemType, false)}
                    </div>
                    <div className="text-xs text-green-700">
                      {((item.availableStock / item.currentStock) * 100).toFixed(0)}% of total
                    </div>
                    <Progress
                      value={(item.availableStock / item.currentStock) * 100}
                      className="h-1.5 mt-2 bg-green-200"
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">Stock currently available for sale to customers</p>
                </TooltipContent>
              </Tooltip>

              {/* Reserved Stock */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="p-4 rounded-lg border bg-orange-50 border-orange-200 hover:shadow-md transition-shadow cursor-help">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-2 rounded-full bg-orange-100">
                        <ShoppingCart className="h-5 w-5 text-orange-600" />
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-medium text-orange-900">Reserved Stock</span>
                        <Info className="h-3 w-3 text-orange-600" />
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-orange-900 mb-1">
                      {formatStockQuantity(item.reservedStock, item.itemType, false)}
                    </div>
                    <div className="text-xs text-orange-700">
                      {((item.reservedStock / item.currentStock) * 100).toFixed(0)}% of total
                    </div>
                    <Progress
                      value={(item.reservedStock / item.currentStock) * 100}
                      className="h-1.5 mt-2 bg-orange-200"
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">Stock allocated to pending orders and not available for sale</p>
                </TooltipContent>
              </Tooltip>

              {/* Safety Stock */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="p-4 rounded-lg border bg-blue-50 border-blue-200 hover:shadow-md transition-shadow cursor-help">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-2 rounded-full bg-blue-100">
                        <Shield className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-medium text-blue-900">Safety Stock</span>
                        <Info className="h-3 w-3 text-blue-600" />
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-blue-900 mb-1">
                      {formatStockQuantity(item.safetyStock, item.itemType, false)}
                    </div>
                    <div className="text-xs text-blue-700">
                      {((item.safetyStock / item.maxStockLevel) * 100).toFixed(0)}% of max
                    </div>
                    <Progress
                      value={(item.safetyStock / item.maxStockLevel) * 100}
                      className="h-1.5 mt-2 bg-blue-200"
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">Minimum buffer quantity to prevent stockouts and ensure continuity</p>
                </TooltipContent>
              </Tooltip>

              {/* Total Stock */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="p-4 rounded-lg border bg-gray-50 border-gray-200 hover:shadow-md transition-shadow cursor-help">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-2 rounded-full bg-gray-100">
                        <Package className="h-5 w-5 text-gray-600" />
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-medium text-gray-900">Total Stock</span>
                        <Info className="h-3 w-3 text-gray-600" />
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-1">
                      {formatStockQuantity(item.availableStock + item.reservedStock + item.safetyStock, item.itemType, false)}
                    </div>
                    <div className="text-xs text-gray-700">
                      {stockPercentage.toFixed(0)}% of max capacity
                    </div>
                    <Progress
                      value={stockPercentage}
                      className="h-1.5 mt-2 bg-gray-200"
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">Total stock including safety buffer (Available + Reserved + Safety)</p>
                </TooltipContent>
              </Tooltip>
            </div>

            {/* Stock Warnings */}
            {item.availableStock < item.safetyStock && (
              <div className="flex items-start gap-3 p-4 rounded-lg bg-yellow-50 border border-yellow-200">
                <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-yellow-900">
                    Warning: Available stock below safety threshold
                  </p>
                  <p className="text-xs text-yellow-700 mt-1">
                    Available stock ({item.availableStock}) is below the safety stock level ({item.safetyStock}).
                    Consider reordering soon to prevent potential stockouts.
                  </p>
                </div>
              </div>
            )}

            {item.reservedStock > item.currentStock * 0.5 && (
              <div className="flex items-start gap-3 p-4 rounded-lg bg-blue-50 border border-blue-200 mt-3">
                <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-900">
                    Info: High allocation rate
                  </p>
                  <p className="text-xs text-blue-700 mt-1">
                    Reserved stock ({item.reservedStock}) exceeds 50% of total inventory.
                    This indicates strong demand and pending orders.
                  </p>
                </div>
              </div>
            )}
          </TooltipProvider>
        </CardContent>
      </Card>

      {/* Stock by Location Section */}
      {item.warehouseLocations && item.warehouseLocations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Stock by Location</CardTitle>
            <CardDescription>
              View and filter stock distribution across warehouse locations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Filter Controls */}
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Warehouse Filter */}
              <div className="flex-1 min-w-0">
                <Select
                  value={warehouseFilter}
                  onValueChange={setWarehouseFilter}
                >
                  <SelectTrigger className="w-full" aria-label="Filter by warehouse">
                    <SelectValue placeholder="Filter by warehouse" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Warehouses</SelectItem>
                    {uniqueWarehouseCodes.map((code) => (
                      <SelectItem key={code} value={code}>
                        {code}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Search Input */}
              <div className="flex-1 min-w-0 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  type="text"
                  placeholder="Search warehouse or location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-8"
                  aria-label="Search locations"
                />
                {searchQuery.length > 0 && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground hover:bg-gray-100 rounded p-0.5 transition-colors"
                    aria-label="Clear search"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Sort Dropdown */}
              <div className="flex-1 min-w-0">
                <Select
                  value={`${sortBy}-${sortOrder}`}
                  onValueChange={(value) => {
                    const [newSortBy, newSortOrder] = value.split("-") as [typeof sortBy, typeof sortOrder]
                    setSortBy(newSortBy)
                    setSortOrder(newSortOrder)
                  }}
                >
                  <SelectTrigger className="w-full" aria-label="Sort locations">
                    <div className="flex items-center gap-2">
                      <ArrowUpDown className="h-4 w-4" />
                      <SelectValue placeholder="Sort by" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="warehouse-asc">Warehouse (A-Z)</SelectItem>
                    <SelectItem value="warehouse-desc">Warehouse (Z-A)</SelectItem>
                    <SelectItem value="location-asc">Location (A-Z)</SelectItem>
                    <SelectItem value="location-desc">Location (Z-A)</SelectItem>
                    <SelectItem value="stock-desc">Stock (High to Low)</SelectItem>
                    <SelectItem value="stock-asc">Stock (Low to High)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Results Count and Clear Filters */}
            <div className="flex items-center justify-between text-sm" role="status" aria-live="polite">
              <span className="text-muted-foreground">
                {hasActiveFilters
                  ? `Showing ${filteredLocations.length} of ${item.warehouseLocations.length} locations`
                  : `All ${item.warehouseLocations.length} locations`}
              </span>
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="gap-2"
                >
                  <X className="h-4 w-4" />
                  Clear Filters
                </Button>
              )}
            </div>

            <Separator />

            {/* Location Cards Grid */}
            {filteredLocations.length === 0 ? (
              <div className="py-8 text-center">
                <div className="flex flex-col items-center gap-2">
                  <MapPin className="h-8 w-8 text-muted-foreground" />
                  <p className="text-sm font-medium text-muted-foreground">
                    {hasActiveFilters ? "No locations match your filters" : "No warehouse location data available"}
                  </p>
                  {hasActiveFilters && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearFilters}
                      className="gap-2 mt-2"
                    >
                      <X className="h-4 w-4" />
                      Clear Filters
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredLocations.map((location, index) => {
                  const totalLocationStock = getActiveStockForLocation(location)
                  const isAvailable = hasAvailableStock(location)

                  return (
                    <Card
                      key={`${location.warehouseCode}-${location.locationCode}-${index}`}
                      className="hover:shadow-md transition-shadow"
                    >
                      <CardContent className="p-4 space-y-3">
                        {/* Location Header */}
                        <div className="flex items-start justify-between">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2">
                              <Badge
                                variant="outline"
                                className="bg-blue-50 text-blue-700 border-blue-200 font-medium"
                              >
                                <MapPin className="h-3 w-3 mr-1" />
                                {location.warehouseCode}
                              </Badge>
                              {location.isDefaultLocation && (
                                <Badge
                                  variant="outline"
                                  className="text-xs px-1.5 py-0 h-5 bg-green-50 text-green-700 border-green-200"
                                >
                                  dl
                                </Badge>
                              )}
                            </div>
                            <code className="text-sm font-mono font-semibold block">
                              {location.locationCode}
                            </code>
                          </div>
                          <StockAvailabilityIndicator
                            isAvailable={isAvailable}
                            stockCount={location.stockAvailable}
                          />
                        </div>

                        <Separator />

                        {/* Stock Status Breakdown - Matching product-level labels */}
                        <div className="grid grid-cols-2 gap-2">
                          {/* Available Stock */}
                          <div className="text-xs px-2 py-1.5 rounded border flex flex-col text-green-600 bg-green-50 border-green-200">
                            <span className="font-medium">Available Stock</span>
                            <span className="font-bold text-base">{formatStockQuantity(location.stockAvailable, item.itemType, false)}</span>
                          </div>
                          {/* Reserved Stock */}
                          <div className="text-xs px-2 py-1.5 rounded border flex flex-col text-orange-600 bg-orange-50 border-orange-200">
                            <span className="font-medium">Reserved Stock</span>
                            <span className="font-bold text-base">{formatStockQuantity(location.stockInProcess, item.itemType, false)}</span>
                          </div>
                          {/* Safety Stock */}
                          <div className="text-xs px-2 py-1.5 rounded border flex flex-col text-blue-600 bg-blue-50 border-blue-200">
                            <span className="font-medium">Safety Stock</span>
                            <span className="font-bold text-base">{formatStockQuantity(location.stockSafetyStock ?? 0, item.itemType, false)}</span>
                          </div>
                          {/* Total Stock */}
                          <div className="text-xs px-2 py-1.5 rounded border flex flex-col text-gray-600 bg-gray-50 border-gray-200">
                            <span className="font-medium">Total Stock</span>
                            <span className="font-bold text-base">{formatStockQuantity(totalLocationStock, item.itemType, false)}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Stock History Chart */}
      <StockHistoryChart
        data={stockHistory}
        productName={item.productName}
      />

      {/* Recent Transactions */}
      <RecentTransactionsTable transactions={transactions} />
    </div>
  )
}
