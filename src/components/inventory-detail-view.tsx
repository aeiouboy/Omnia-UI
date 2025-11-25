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
} from "lucide-react"
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

      {/* Stock Level Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Available / Total Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{item.availableStock} / {item.currentStock}</div>
            <p className="text-xs text-muted-foreground mt-1">available / total units in stock</p>
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-muted-foreground">Stock Level</span>
                <span className="font-medium">{stockPercentage.toFixed(0)}%</span>
              </div>
              <Progress value={stockPercentage} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Min / Max Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {item.minStockLevel} / {item.maxStockLevel}
            </div>
            <p className="text-xs text-muted-foreground mt-1">minimum / maximum units</p>
            <div className="mt-4">
              <div className="text-xs text-muted-foreground">Reorder Point</div>
              <div className="text-lg font-semibold">{item.reorderPoint} units</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              ฿{Math.round(totalValue).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">current inventory value</p>
            <div className="mt-4">
              <div className="text-xs text-muted-foreground">Demand Forecast</div>
              <div className="text-lg font-semibold">{item.demandForecast} units/month</div>
            </div>
          </CardContent>
        </Card>
      </div>

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
