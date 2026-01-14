"use client"

import { useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Package,
} from "lucide-react"
import type { StockConfigItem, StockConfigFilters } from "@/types/stock-config"

type SortField = "locationId" | "itemId" | "quantity" | "supplyTypeId" | "channel" | "createdAt"

interface StockConfigTableProps {
  items: StockConfigItem[]
  loading: boolean
  onSort?: (field: SortField, order: "asc" | "desc") => void
  onView?: (item: StockConfigItem) => void
  onDelete?: (item: StockConfigItem) => void
  sortBy?: SortField
  sortOrder?: "asc" | "desc"
}

export function StockConfigTable({
  items,
  loading,
  onSort,
  onView,
  onDelete,
  sortBy,
  sortOrder,
}: StockConfigTableProps) {
  const handleSort = (field: SortField) => {
    if (!onSort) return

    if (sortBy === field) {
      onSort(field, sortOrder === "asc" ? "desc" : "asc")
    } else {
      onSort(field, "asc")
    }
  }

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortBy !== field) {
      return <ArrowUpDown className="h-4 w-4 ml-1 opacity-40" />
    }
    return sortOrder === "asc" ? (
      <ArrowUp className="h-4 w-4 ml-1" />
    ) : (
      <ArrowDown className="h-4 w-4 ml-1" />
    )
  }

  const getSupplyTypeBadge = (supplyType: string) => {
    switch (supplyType) {
      case "Preorder":
        return <Badge className="bg-purple-100 text-purple-800">Preorder</Badge>
      case "OnHand":
        return <Badge className="bg-blue-100 text-blue-800">OnHand</Badge>
      default:
        return <Badge variant="outline">{supplyType}</Badge>
    }
  }

  const getFrequencyBadge = (frequency: string) => {
    switch (frequency) {
      case "Onetime":
        return <Badge variant="outline" className="bg-gray-100">Onetime</Badge>
      case "Daily":
        return <Badge variant="outline" className="bg-green-100 text-green-800">Daily</Badge>
      default:
        return <Badge variant="outline">{frequency}</Badge>
    }
  }

  const getChannelBadge = (channel?: string) => {
    if (!channel) return <span className="text-gray-400">-</span>

    switch (channel) {
      case "TOL":
        return <Badge className="bg-blue-100 text-blue-800 border-blue-300">TOL</Badge>
      case "MKP":
        return <Badge className="bg-orange-100 text-orange-800 border-orange-300">MKP</Badge>
      case "QC":
        return <Badge className="bg-green-100 text-green-800 border-green-300">QC</Badge>
      default:
        return <Badge variant="outline">{channel}</Badge>
    }
  }

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "-"
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  // Loading skeleton
  if (loading) {
    return (
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Location ID</TableHead>
              <TableHead>Item ID</TableHead>
              <TableHead className="text-right">Quantity</TableHead>
              <TableHead>Supply Type</TableHead>
              <TableHead>Frequency</TableHead>
              <TableHead>Channel</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>End Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(5)].map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )
  }

  // Empty state
  if (items.length === 0) {
    return (
      <div className="border rounded-lg p-12 text-center">
        <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No stock configurations</h3>
        <p className="text-sm text-gray-500 mb-4">
          Get started by uploading a CSV or Excel file with stock configuration data.
        </p>
      </div>
    )
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => handleSort("locationId")}
            >
              <div className="flex items-center">
                Location ID
                <SortIcon field="locationId" />
              </div>
            </TableHead>
            <TableHead
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => handleSort("itemId")}
            >
              <div className="flex items-center">
                Item ID
                <SortIcon field="itemId" />
              </div>
            </TableHead>
            <TableHead
              className="cursor-pointer hover:bg-muted/50 text-right"
              onClick={() => handleSort("quantity")}
            >
              <div className="flex items-center justify-end">
                Quantity
                <SortIcon field="quantity" />
              </div>
            </TableHead>
            <TableHead
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => handleSort("supplyTypeId")}
            >
              <div className="flex items-center">
                Supply Type
                <SortIcon field="supplyTypeId" />
              </div>
            </TableHead>
            <TableHead>Frequency</TableHead>
            <TableHead
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => handleSort("channel" as SortField)}
            >
              <div className="flex items-center">
                Channel
                <SortIcon field="channel" />
              </div>
            </TableHead>
            <TableHead>Start Date</TableHead>
            <TableHead>End Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id} className="hover:bg-muted/50">
              <TableCell className="font-mono text-sm">{item.locationId}</TableCell>
              <TableCell className="font-mono text-sm">{item.itemId}</TableCell>
              <TableCell className="text-right">
                <span className={item.quantity === 999999 ? "text-red-600 font-medium" : ""}>
                  {item.quantity.toLocaleString()}
                </span>
              </TableCell>
              <TableCell>{getSupplyTypeBadge(item.supplyTypeId)}</TableCell>
              <TableCell>{getFrequencyBadge(item.frequency)}</TableCell>
              <TableCell>{getChannelBadge(item.channel)}</TableCell>
              <TableCell>{formatDate(item.startDate)}</TableCell>
              <TableCell>{formatDate(item.endDate)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
