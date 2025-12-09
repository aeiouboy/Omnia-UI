/**
 * Stock Location Popover Component
 *
 * Displays detailed stock breakdown by location in an expandable popover
 */

"use client"

import React, { useState, useMemo } from "react"
import { StockLocation } from "@/types/inventory"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Info, Search, X } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  formatWarehouseCode,
  getTotalStockForLocation
} from "@/lib/warehouse-utils"

export interface StockLocationPopoverProps {
  /** Array of stock locations with breakdown */
  locations: StockLocation[]
  /** Custom trigger element (optional) */
  trigger?: React.ReactNode
  /** Additional CSS classes */
  className?: string
}

export default function StockLocationPopover({ locations, trigger, className }: StockLocationPopoverProps) {
  const [searchQuery, setSearchQuery] = useState("")

  if (!locations || locations.length === 0) {
    return null
  }

  // Filter locations based on search query
  const filteredLocations = useMemo(() => {
    if (!searchQuery.trim()) {
      return locations
    }

    const query = searchQuery.toLowerCase()
    return locations.filter((location) => {
      const warehouseCode = location.warehouseCode?.toLowerCase() || ""
      const locationCode = location.locationCode?.toLowerCase() || ""
      const formattedCode = formatWarehouseCode(location.warehouseCode, location.locationCode).toLowerCase()

      return (
        warehouseCode.includes(query) ||
        locationCode.includes(query) ||
        formattedCode.includes(query)
      )
    })
  }, [locations, searchQuery])

  // Calculate total stock across all filtered locations
  const totalStock = filteredLocations.reduce((sum, loc) => sum + getTotalStockForLocation(loc), 0)

  // Default trigger if none provided
  const defaultTrigger = (
    <button
      className={cn(
        "inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded px-2 py-1",
        className
      )}
      aria-label="View stock breakdown by location"
    >
      <Info className="h-3.5 w-3.5" />
      <span className="hidden sm:inline">View Locations</span>
    </button>
  )

  return (
    <Popover>
      <PopoverTrigger asChild>
        {trigger || defaultTrigger}
      </PopoverTrigger>
      <PopoverContent
        className="w-80 sm:w-96 p-0"
        side="right"
        align="start"
        sideOffset={8}
        onClick={(e) => {
          // Prevent clicks inside popover from propagating
          e.stopPropagation()
        }}
      >
        <Card className="border-0 shadow-none">
          <div className="px-4 py-3 border-b bg-muted/50">
            <h3 className="font-semibold text-sm">Stock Breakdown by Location</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {locations.length} location{locations.length !== 1 ? 's' : ''} • Total: {totalStock} units
            </p>
          </div>

          {/* Search Input */}
          <div className="px-4 py-3 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search warehouse or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-8"
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
          </div>

          <div className="max-h-80 overflow-y-auto">
            {filteredLocations.length === 0 && searchQuery.length > 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                No locations found
              </div>
            ) : (
              filteredLocations.map((location, index) => {
              const locationTotal = getTotalStockForLocation(location)
              const formattedCode = formatWarehouseCode(location.warehouseCode, location.locationCode)

              return (
                <div
                  key={`${location.warehouseCode}-${location.locationCode}-${index}`}
                  className="px-4 py-3 border-b last:border-b-0 hover:bg-muted/30 transition-colors"
                >
                  {/* Location Header */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <code className="text-xs font-mono font-semibold bg-muted px-1.5 py-0.5 rounded">
                        {formattedCode}
                      </code>
                      {location.isDefaultLocation && (
                        <Badge variant="outline" className="text-xs px-1.5 py-0 h-5 bg-green-50 text-green-700 border-green-200">
                          dl
                        </Badge>
                      )}
                    </div>
                    <span className="text-xs font-medium text-muted-foreground">
                      {locationTotal} units
                    </span>
                  </div>

                  {/* Stock Status Grid - Matching product-level breakdown */}
                  <div className="grid grid-cols-2 gap-2">
                    {/* Available Stock */}
                    <div className="text-xs px-2 py-1.5 rounded border flex flex-col text-green-600 bg-green-50 border-green-200">
                      <span className="font-medium">Available</span>
                      <span className="font-bold text-base">{location.stockAvailable}</span>
                    </div>
                    {/* Reserved Stock */}
                    <div className="text-xs px-2 py-1.5 rounded border flex flex-col text-orange-600 bg-orange-50 border-orange-200">
                      <span className="font-medium">Reserved</span>
                      <span className="font-bold text-base">{location.stockInProcess}</span>
                    </div>
                    {/* Safety Stock */}
                    <div className="text-xs px-2 py-1.5 rounded border flex flex-col text-blue-600 bg-blue-50 border-blue-200">
                      <span className="font-medium">Safety Stock</span>
                      <span className="font-bold text-base">{location.stockSafetyStock ?? 0}</span>
                    </div>
                    {/* Total Stock */}
                    <div className="text-xs px-2 py-1.5 rounded border flex flex-col text-gray-600 bg-gray-50 border-gray-200">
                      <span className="font-medium">Total Stock</span>
                      <span className="font-bold text-base">{locationTotal}</span>
                    </div>
                  </div>
                </div>
              )
            })
            )}
          </div>

          {/* Footer Summary */}
          <div className="px-4 py-2 border-t bg-muted/30">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-muted-foreground">
                {searchQuery.length > 0 && filteredLocations.length !== locations.length
                  ? `${filteredLocations.length} of ${locations.length} locations`
                  : 'Total Stock'}
              </span>
              <span className="font-bold">{totalStock} units</span>
            </div>
          </div>
        </Card>
      </PopoverContent>
    </Popover>
  )
}
