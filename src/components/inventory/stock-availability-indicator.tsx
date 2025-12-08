/**
 * Stock Availability Indicator Component
 *
 * Displays a visual indicator (colored dot) showing stock availability status
 */

import { Circle, CircleDot } from "lucide-react"
import { cn } from "@/lib/utils"

export interface StockAvailabilityIndicatorProps {
  /** Whether stock is available */
  isAvailable: boolean
  /** Current stock count */
  stockCount: number
  /** Whether to show the count next to indicator (default: false) */
  showCount?: boolean
  /** Additional CSS classes */
  className?: string
}

export default function StockAvailabilityIndicator({
  isAvailable,
  stockCount,
  showCount = false,
  className
}: StockAvailabilityIndicatorProps) {
  const isInStock = isAvailable && stockCount > 0

  return (
    <div
      className={cn("inline-flex items-center gap-1.5", className)}
      title={isInStock ? `In Stock (${stockCount} units)` : "Out of Stock"}
    >
      {isInStock ? (
        <CircleDot className="h-3 w-3 text-green-500 fill-green-500" aria-label="In stock" />
      ) : (
        <Circle className="h-3 w-3 text-red-500 fill-red-500" aria-label="Out of stock" />
      )}
      {showCount && (
        <span className={cn(
          "text-xs font-medium",
          isInStock ? "text-green-700" : "text-red-700"
        )}>
          {stockCount}
        </span>
      )}
    </div>
  )
}
