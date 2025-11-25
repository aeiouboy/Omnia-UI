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

import { useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import {
  ArrowLeft,
  Package,
  Barcode,
  Store,
  TrendingUp,
  AlertTriangle,
  Edit,
  RefreshCw,
  ChevronRight,
  Scale,
  CheckCircle,
  ShoppingCart,
  Shield,
  Info,
} from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { StockHistoryChart } from "./stock-history-chart"
import { RecentTransactionsTable } from "./recent-transactions-table"
import type {
  InventoryItem,
  StockHistoryPoint,
  StockTransaction,
} from "@/types/inventory"

interface InventoryDetailViewProps {
  item: InventoryItem
  stockHistory: StockHistoryPoint[]
  transactions: StockTransaction[]
  onBack?: () => void
  onEdit?: (item: InventoryItem) => void
  onReorder?: (item: InventoryItem) => void
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
  onEdit,
  onReorder,
}: InventoryDetailViewProps) {
  const router = useRouter()

  // Calculate stock percentage
  const stockPercentage = (item.currentStock / item.maxStockLevel) * 100

  // Calculate total inventory value
  const totalValue = item.currentStock * item.unitPrice

  // Handle back navigation
  const handleBack = () => {
    if (onBack) {
      onBack()
    } else {
      router.push("/inventory")
    }
  }

  // Handle edit action
  const handleEdit = () => {
    if (onEdit) {
      onEdit(item)
    } else {
      // TODO: Implement edit functionality
      console.log("Edit product:", item.id)
    }
  }

  // Handle reorder action
  const handleReorder = () => {
    if (onReorder) {
      onReorder(item)
    } else {
      // TODO: Implement reorder functionality
      console.log("Reorder product:", item.id)
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
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleEdit}
            className="gap-2"
          >
            <Edit className="h-4 w-4" />
            Edit
          </Button>
          {item.status !== "healthy" && (
            <Button
              onClick={handleReorder}
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Reorder
            </Button>
          )}
        </div>
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
                    <Store className="h-4 w-4" />
                    <span>Store</span>
                  </div>
                  <p className="text-lg">{item.storeName}</p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Package className="h-4 w-4" />
                    <span>Supplier</span>
                  </div>
                  <p className="text-lg">{item.supplier}</p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <TrendingUp className="h-4 w-4" />
                    <span>Unit Price</span>
                  </div>
                  <p className="text-lg font-semibold">฿{item.unitPrice.toFixed(2)}</p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    {item.itemType === "weight" ? (
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
                        item.itemType === "weight"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-800"
                      } text-sm`}
                    >
                      {item.itemType === "weight" ? "Weight Item (kg)" : "Unit Item (pieces)"}
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
                      {item.availableStock}
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
                      {item.reservedStock}
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
                      {item.safetyStock}
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
                      {item.currentStock}
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
                  <p className="max-w-xs">Complete inventory including available and reserved stock</p>
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

            {/* Additional Stock Info */}
            <Separator className="my-6" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Min / Max Stock</p>
                <p className="text-lg font-semibold">
                  {item.minStockLevel} / {item.maxStockLevel}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Reorder Point</p>
                <p className="text-lg font-semibold">{item.reorderPoint} units</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Value</p>
                <p className="text-lg font-semibold">฿{Math.round(totalValue).toLocaleString()}</p>
              </div>
            </div>
          </TooltipProvider>
        </CardContent>
      </Card>

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
