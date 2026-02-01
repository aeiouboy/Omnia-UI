"use client"

import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  X,
  Barcode,
  Package,
  Scale,
  Check,
  XCircle,
  Circle,
  Clock,
  Tag,
  Info,
  ExternalLink,
} from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { formatGMT7Time } from "@/lib/utils"
import type { InventoryItem } from "@/types/inventory"

interface ProductInfoCardProps {
  product: InventoryItem
  onClose: () => void
  onViewDetails?: () => void
  refId?: string
}

/**
 * Get Item Type badge styling based on item type
 */
function getItemTypeBadgeClass(itemType: string) {
  switch (itemType) {
    case "weight":
      return "bg-blue-100 text-blue-800 border-blue-200"
    case "pack_weight":
      return "bg-purple-100 text-purple-800 border-purple-200"
    case "pack":
      return "bg-indigo-100 text-indigo-800 border-indigo-200"
    case "normal":
    default:
      return "bg-gray-100 text-gray-800 border-gray-200"
  }
}

/**
 * Get Item Type display label
 */
function getItemTypeLabel(itemType: string) {
  switch (itemType) {
    case "weight":
      return "Weight Item (kg)"
    case "pack_weight":
      return "Pack Weight"
    case "pack":
      return "Pack Item (pieces)"
    case "normal":
    default:
      return "Normal Item"
  }
}

/**
 * Get Supply Type badge styling
 */
function getSupplyTypeBadgeClass(supplyType: string | undefined) {
  if (supplyType === "Pre-Order") {
    return "bg-amber-100 text-amber-800 border-amber-300"
  }
  // Default: On Hand Available
  return "bg-green-100 text-green-800 border-green-300"
}

/**
 * Format last restocked date
 */
function formatLastRestocked(timestamp: string | undefined): string {
  if (!timestamp) return "N/A"
  return formatGMT7Time(timestamp, {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  })
}

export function ProductInfoCard({
  product,
  onClose,
  onViewDetails,
  refId,
}: ProductInfoCardProps) {
  const displayBarcode = product.barcode || product.productId
  const displayBrand = product.brand || product.productName

  return (
    <TooltipProvider>
      <Card className="relative overflow-hidden">
        {/* Close Button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-3 right-3 z-10 h-8 w-8 hover:bg-muted"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </Button>

        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Left Section - Product Image */}
            <div className="flex-shrink-0">
              <div className="w-[200px] aspect-square bg-gray-900 rounded-xl flex items-center justify-center overflow-hidden">
                {product.imageUrl ? (
                  <Image
                    src={product.imageUrl}
                    alt={product.productName}
                    width={200}
                    height={200}
                    className="object-cover w-full h-full"
                    unoptimized
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.style.display = "none"
                      // Show fallback text
                      const parent = target.parentElement
                      if (parent) {
                        const fallback = document.createElement("span")
                        fallback.className = "text-white text-center px-4 font-medium"
                        fallback.textContent = displayBrand
                        parent.appendChild(fallback)
                      }
                    }}
                  />
                ) : (
                  <span className="text-white text-center px-4 font-medium">
                    {displayBrand}
                  </span>
                )}
              </div>
            </div>

            {/* Right Section - Product Details */}
            <div className="flex-1 min-w-0">
              {/* Product Name */}
              <h2 className="text-2xl font-bold text-foreground mb-1 pr-8">
                {product.productName}
              </h2>

              {/* Category */}
              <p className="text-muted-foreground mb-4">{product.category}</p>

              {/* Row 1: 5-column grid - SKU, Ref ID, Item Type, Supply Type, Stock Config */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-x-6 gap-y-4 mb-6">
                {/* SKU */}
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Barcode className="h-4 w-4" />
                    <span>SKU</span>
                  </div>
                  <span className="font-mono text-sm">{displayBarcode}</span>
                </div>

                {/* Ref ID */}
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Tag className="h-4 w-4" />
                    <span>Ref ID</span>
                  </div>
                  <span className="font-mono text-sm">{refId || "-"}</span>
                </div>

                {/* Item Type */}
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    {product.itemType === "weight" || product.itemType === "pack_weight" ? (
                      <Scale className="h-4 w-4" />
                    ) : (
                      <Package className="h-4 w-4" />
                    )}
                    <span>Item Type</span>
                  </div>
                  <Badge
                    variant="outline"
                    className={getItemTypeBadgeClass(product.itemType)}
                  >
                    {getItemTypeLabel(product.itemType)}
                  </Badge>
                </div>

                {/* Supply Type */}
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Package className="h-4 w-4" />
                    <span>Supply Type</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Badge
                      variant="outline"
                      className={getSupplyTypeBadgeClass(product.supplyType)}
                    >
                      {product.supplyType || "On Hand Available"}
                    </Badge>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          {product.supplyType === "Pre-Order"
                            ? "This item requires pre-ordering before availability"
                            : "This item is available from current inventory"}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>

                {/* Stock Config */}
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Circle className="h-4 w-4" />
                    <span>Stock Config</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {product.stockConfigStatus === "valid" ? (
                      <>
                        <Check className="h-4 w-4 text-green-600" />
                        <span className="text-green-600 font-medium">Configured</span>
                      </>
                    ) : product.stockConfigStatus === "invalid" ? (
                      <>
                        <XCircle className="h-4 w-4 text-red-600" />
                        <span className="text-red-600 font-medium">Invalid</span>
                      </>
                    ) : (
                      <>
                        <Circle className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-500">Not Configured</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Row 2: Last Restocked - Standalone */}
              <div className="mb-4">
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-1">
                  <Clock className="h-4 w-4" />
                  <span>Last Restocked</span>
                </div>
                <span className="text-foreground">
                  {formatLastRestocked(product.lastRestocked)}
                </span>
              </div>

              {/* View Details Button */}
              {onViewDetails && (
                <div className="pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onViewDetails}
                    className="gap-2"
                  >
                    <ExternalLink className="h-4 w-4" />
                    View Details
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  )
}
