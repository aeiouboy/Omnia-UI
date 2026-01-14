"use client"

import { useState, useMemo } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Search,
  X,
  MapPin,
} from "lucide-react"
import { formatStockQuantity } from "@/lib/warehouse-utils"
import type { StockLocation, ItemType } from "@/types/inventory"

interface StockByStoreTableProps {
  locations: StockLocation[]
  itemType: ItemType
  storeName: string
  storeId?: string
}

type SortField = "storeName" | "storeId" | "location" | "available" | "reserved" | "safety" | "total"
type SortOrder = "asc" | "desc"

export function StockByStoreTable({ locations, itemType, storeName, storeId }: StockByStoreTableProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [sortField, setSortField] = useState<SortField>("location")
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc")

  // Filter and sort locations
  const filteredLocations = useMemo(() => {
    let filtered = [...locations]

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (loc) =>
          storeName.toLowerCase().includes(query) ||
          (storeId || "").toLowerCase().includes(query) ||
          loc.warehouseCode.toLowerCase().includes(query) ||
          loc.locationCode.toLowerCase().includes(query)
      )
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let compareValue = 0

      switch (sortField) {
        case "storeName":
          compareValue = storeName.localeCompare(storeName)
          break
        case "storeId":
          compareValue = (storeId || "").localeCompare(storeId || "")
          break
        case "location":
          compareValue = a.locationCode.localeCompare(b.locationCode)
          break
        case "available":
          compareValue = a.stockAvailable - b.stockAvailable
          break
        case "reserved":
          compareValue = a.stockInProcess - b.stockInProcess
          break
        case "safety":
          compareValue = (a.stockSafetyStock || 0) - (b.stockSafetyStock || 0)
          break
        case "total":
          const totalA = a.stockAvailable + a.stockInProcess + (a.stockSafetyStock || 0)
          const totalB = b.stockAvailable + b.stockInProcess + (b.stockSafetyStock || 0)
          compareValue = totalA - totalB
          break
      }

      return sortOrder === "asc" ? compareValue : -compareValue
    })

    return filtered
  }, [locations, searchQuery, sortField, sortOrder, storeName, storeId])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortOrder("asc")
    }
  }

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-4 w-4 ml-1 opacity-40" />
    }
    return sortOrder === "asc" ? (
      <ArrowUp className="h-4 w-4 ml-1" />
    ) : (
      <ArrowDown className="h-4 w-4 ml-1" />
    )
  }

  const clearSearch = () => {
    setSearchQuery("")
  }

  if (locations.length === 0) {
    return (
      <div className="py-8 text-center">
        <div className="flex flex-col items-center gap-2">
          <MapPin className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm font-medium text-muted-foreground">
            No store location data available
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search store or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-8"
          />
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <span className="text-sm text-muted-foreground">
          {filteredLocations.length} of {locations.length} locations
        </span>
      </div>

      {/* Table */}
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort("storeName")}
              >
                <div className="flex items-center">
                  Store
                  <SortIcon field="storeName" />
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort("storeId")}
              >
                <div className="flex items-center">
                  Store ID
                  <SortIcon field="storeId" />
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort("location")}
              >
                <div className="flex items-center">
                  Location
                  <SortIcon field="location" />
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/50 text-right"
                onClick={() => handleSort("available")}
              >
                <div className="flex items-center justify-end">
                  Available
                  <SortIcon field="available" />
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/50 text-right"
                onClick={() => handleSort("reserved")}
              >
                <div className="flex items-center justify-end">
                  Reserved
                  <SortIcon field="reserved" />
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/50 text-right"
                onClick={() => handleSort("safety")}
              >
                <div className="flex items-center justify-end">
                  Safety Stock
                  <SortIcon field="safety" />
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/50 text-right"
                onClick={() => handleSort("total")}
              >
                <div className="flex items-center justify-end">
                  Total
                  <SortIcon field="total" />
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLocations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No locations match your search.
                </TableCell>
              </TableRow>
            ) : (
              filteredLocations.map((location, index) => {
                const totalStock =
                  location.stockAvailable +
                  location.stockInProcess +
                  (location.stockSafetyStock || 0)

                return (
                  <TableRow key={`${location.warehouseCode}-${location.locationCode}-${index}`}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-primary" />
                        <span className="font-medium text-sm whitespace-nowrap">{storeName}</span>
                        {location.isDefaultLocation && (
                          <Badge
                            variant="outline"
                            className="text-[10px] px-1 py-0 h-4 bg-green-50 text-green-700 border-green-200"
                          >
                            Default
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-sm text-muted-foreground">{storeId || "—"}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Badge
                          variant="outline"
                          className="bg-gray-50 text-gray-500 border-gray-200 font-mono text-xs scale-90 origin-left"
                        >
                          {location.warehouseCode}
                        </Badge>
                        <code className="font-mono text-sm">{location.locationCode}</code>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-semibold text-green-700">
                      {formatStockQuantity(location.stockAvailable, itemType, false)}
                    </TableCell>
                    <TableCell className="text-right text-orange-700">
                      {formatStockQuantity(location.stockInProcess, itemType, false)}
                    </TableCell>
                    <TableCell className="text-right text-blue-700">
                      {formatStockQuantity(location.stockSafetyStock || 0, itemType, false)}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatStockQuantity(totalStock, itemType, false)}
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
