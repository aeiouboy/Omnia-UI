"use client"

import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, RefreshCcw, Package } from "lucide-react"
import { EnhancedOrderItem, getStatusCategory } from "@/types/item-fulfillment"
import { getStatusBadgeConfigFromStatus } from "@/lib/item-fulfillment-utils"
import { formatCurrency } from "@/lib/currency-utils"

interface FulfillmentItemCardProps {
  item: EnhancedOrderItem
}

/**
 * Simple item card for Version 4 Fulfillment Tab
 * Layout:
 * ┌──────────────────────────────────────────────────────────────┐
 * │ ┌──────┐  [Product Name truncated...]           ✅ Fulfilled │
 * │ │ IMG  │  Variant/Color info                                 │
 * │ │ 80x80│  SKU: XXX-XXX-XXX                                   │
 * │ └──────┘  x1                                          ฿490   │
 * └──────────────────────────────────────────────────────────────┘
 *
 * - NO expand/collapse
 * - NO dates or reasons
 * - Status badge positioned top-right, aligned with product name
 * - Quantity (x1) on bottom-left, price (฿XXX) on bottom-right
 */
export function FulfillmentItemCard({ item }: FulfillmentItemCardProps) {
  const statusConfig = getStatusBadgeConfigFromStatus(item.itemFulfillmentStatus)
  const category = getStatusCategory(item.itemFulfillmentStatus)

  // Get the appropriate icon
  const StatusIcon = {
    fulfilled: CheckCircle,
    cancelled: XCircle,
    returned: RefreshCcw,
    all: CheckCircle,
  }[category]

  // Build variant display string
  const variantParts: string[] = []
  if (item.variant) variantParts.push(item.variant)
  if (item.color) variantParts.push(item.color)
  if (item.size) variantParts.push(`Size: ${item.size}`)
  const variantDisplay = variantParts.join(' • ') || item.thaiName || ''

  return (
    <div className="border rounded-lg p-3 sm:p-4 bg-white dark:bg-gray-900 hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
      <div className="flex gap-3 sm:gap-4">
        {/* Product Image Placeholder */}
        <div className="flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
          {item.imageUrl ? (
            <img
              src={item.imageUrl}
              alt={item.product_name}
              className="w-full h-full object-cover rounded-lg"
            />
          ) : (
            <Package className="h-8 w-8 text-gray-400" />
          )}
        </div>

        {/* Product Details */}
        <div className="flex-1 min-w-0">
          {/* Top Row: Product Name and Status Badge */}
          <div className="flex items-start justify-between gap-2 mb-1">
            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 line-clamp-1 flex-1">
              {item.product_name}
            </h4>
            <Badge
              className={`${statusConfig.bgColor} ${statusConfig.textColor} ${statusConfig.borderColor} border text-xs flex-shrink-0 flex items-center gap-1`}
            >
              <StatusIcon className="h-3 w-3" />
              {statusConfig.label}
            </Badge>
          </div>

          {/* Variant Row */}
          {variantDisplay && (
            <p className="text-xs text-muted-foreground line-clamp-1 mb-0.5">
              {variantDisplay}
            </p>
          )}

          {/* SKU Row */}
          <p className="text-xs text-muted-foreground font-mono mb-2">
            SKU: {item.product_sku}
          </p>

          {/* Bottom Row: Quantity (left) and Price (right) */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              x{item.quantity}
            </span>
            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {formatCurrency(item.total_price)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
