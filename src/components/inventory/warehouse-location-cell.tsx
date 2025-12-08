/**
 * Warehouse Location Cell Component
 *
 * Table cell component displaying warehouse codes, location badges, and expandable details
 */

"use client"

import { StockLocation } from "@/types/inventory"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import StockLocationPopover from "./stock-location-popover"
import { formatWarehouseCode, getDefaultLocation } from "@/lib/warehouse-utils"
import { MapPin } from "lucide-react"

export interface WarehouseLocationCellProps {
  /** Array of stock locations for the product */
  stockLocations?: StockLocation[]
  /** Additional CSS classes */
  className?: string
}

export default function WarehouseLocationCell({
  stockLocations,
  className
}: WarehouseLocationCellProps) {
  // Handle case where no locations are available
  if (!stockLocations || stockLocations.length === 0) {
    return (
      <div className={className}>
        <span className="text-xs text-muted-foreground">No location data</span>
      </div>
    )
  }

  // Get the default location to display in the table
  const defaultLocation = getDefaultLocation(stockLocations) || stockLocations[0]
  // Show only warehouse code in table (location details in popover)
  const formattedCode = defaultLocation.warehouseCode

  // Show count if multiple locations
  const hasMultipleLocations = stockLocations.length > 1

  return (
    <div
      className={className}
      onClick={(e) => {
        // Stop event propagation to prevent parent row click
        e.stopPropagation()
      }}
    >
      <TooltipProvider>
        <Tooltip delayDuration={300}>
          <TooltipTrigger asChild>
            <div>
              <StockLocationPopover
                locations={stockLocations}
                trigger={
                  <div
                    className="flex items-center gap-1.5 cursor-pointer group"
                    onClick={(e) => {
                      // Additional stop propagation on trigger
                      e.stopPropagation()
                    }}
                  >
                    {/* Store Code Badge - Clickable */}
                    <Badge
                      variant="outline"
                      className="text-xs px-2 py-1 h-6 font-mono bg-blue-50 text-blue-700 border-blue-200 group-hover:bg-blue-100 group-hover:border-blue-300 group-hover:ring-2 group-hover:ring-blue-200 transition-all"
                    >
                      <MapPin className="h-3 w-3 mr-1 inline" />
                      {formattedCode}
                    </Badge>

                    {/* Default Location Badge */}
                    {defaultLocation.isDefaultLocation && (
                      <Badge
                        variant="outline"
                        className="text-xs px-1.5 py-0 h-5 bg-green-50 text-green-700 border-green-200"
                      >
                        dl
                      </Badge>
                    )}

                    {/* Multiple Locations Indicator */}
                    {hasMultipleLocations && (
                      <Badge
                        variant="secondary"
                        className="text-xs px-1.5 py-0 h-5 group-hover:bg-blue-100 group-hover:text-blue-700 transition-colors"
                      >
                        +{stockLocations.length - 1}
                      </Badge>
                    )}
                  </div>
                }
              />
            </div>
          </TooltipTrigger>
          <TooltipContent side="top" className="text-xs">
            <p>Click to view detailed stock breakdown</p>
            {hasMultipleLocations && (
              <p className="text-muted-foreground mt-0.5">
                {stockLocations.length} locations available
              </p>
            )}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  )
}
