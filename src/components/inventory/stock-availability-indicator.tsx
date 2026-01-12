/**
 * Stock Availability Indicator Component
 *
 * Displays a visual indicator (colored dot) showing stock availability status
 */

import { Circle, CircleDot, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"
import type { InventoryStatus } from "@/types/inventory"

export interface StockAvailabilityIndicatorProps {
  /** Whether stock is available */
  isAvailable: boolean
  /** Current stock count */
  stockCount: number
  /** Safety stock threshold for determining low stock warning */
  safetyStock?: number
  /** Inventory status (healthy/low/critical) - if provided, overrides other logic */
  status?: InventoryStatus
  /** Whether to show the count next to indicator (default: false) */
  showCount?: boolean
  /** Additional CSS classes */
  className?: string
}

export default function StockAvailabilityIndicator({
  isAvailable,
  stockCount,
  safetyStock,
  status,
  showCount = false,
  className
}: StockAvailabilityIndicatorProps) {
  // Determine stock status
  // Priority: 1) explicit status prop, 2) calculated from stockCount vs safetyStock
  let stockStatus: InventoryStatus

  if (status) {
    stockStatus = status
  } else if (stockCount === 0) {
    stockStatus = "critical"
  } else if (safetyStock && stockCount <= safetyStock) {
    stockStatus = "low"
  } else {
    stockStatus = "healthy"
  }

  // Determine visual elements based on status
  const getStatusElements = () => {
    switch (stockStatus) {
      case "healthy":
        return {
          icon: <CircleDot className="h-3 w-3 text-green-500 fill-green-500" aria-label="In stock" />,
          title: `In Stock (${stockCount} units)`,
          textColor: "text-green-700"
        }
      case "low":
        return {
          icon: <AlertTriangle className="h-3 w-3 text-amber-500 fill-amber-500" aria-label="Low stock" />,
          title: `Low Stock (${stockCount} units${safetyStock ? ` - below safety level of ${safetyStock}` : ""})`,
          textColor: "text-amber-700"
        }
      case "critical":
        return {
          icon: <Circle className="h-3 w-3 text-red-500 fill-red-500" aria-label="Out of stock" />,
          title: "Out of Stock",
          textColor: "text-red-700"
        }
      default:
        return {
          icon: <Circle className="h-3 w-3 text-gray-400 fill-gray-400" aria-label="Unknown status" />,
          title: "Unknown Stock Status",
          textColor: "text-gray-700"
        }
    }
  }

  const { icon, title, textColor } = getStatusElements()

  return (
    <div
      className={cn("inline-flex items-center gap-1.5", className)}
      title={title}
    >
      {icon}
      {showCount && (
        <span className={cn("text-xs font-medium", textColor)}>
          {stockCount}
        </span>
      )}
    </div>
  )
}
