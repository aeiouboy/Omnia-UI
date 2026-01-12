"use client"

import { useState, useMemo, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  History,
  Download,
  RefreshCw,
  Calendar as CalendarIcon,
  X,
} from "lucide-react"
import { ManhattanAuditEvent, EntityNameCategory } from "@/types/audit"
import { generateManhattanAuditTrail } from "@/lib/mock-data"
import { format } from "date-fns"

interface AuditTrailTabProps {
  orderId: string
  orderData?: any
  loading?: boolean
}

export function AuditTrailTab({ orderId, orderData, loading = false }: AuditTrailTabProps) {
  // Pending filter state (before APPLY is clicked)
  const [pendingEntityCategory, setPendingEntityCategory] = useState<EntityNameCategory>("All")
  const [pendingAuditDate, setPendingAuditDate] = useState<Date | undefined>(undefined)
  const [pendingOrderLineId, setPendingOrderLineId] = useState("")

  // Applied filter state (after APPLY is clicked)
  const [appliedEntityCategory, setAppliedEntityCategory] = useState<EntityNameCategory>("All")
  const [appliedAuditDate, setAppliedAuditDate] = useState<Date | undefined>(undefined)
  const [appliedOrderLineId, setAppliedOrderLineId] = useState("")

  // Generate mock audit data using Manhattan-style generator
  const auditEvents = useMemo(() => {
    if (loading) return []
    return generateManhattanAuditTrail(orderId, orderData) as ManhattanAuditEvent[]
  }, [orderId, orderData, loading])

  // Filter audit events based on applied filters
  const filteredEvents = useMemo(() => {
    let filtered = [...auditEvents]

    // Entity category filter
    if (appliedEntityCategory !== "All") {
      filtered = filtered.filter(event => {
        const entityName = event.entityName.toLowerCase()
        switch (appliedEntityCategory) {
          case "Order":
            return entityName === "order" || entityName === "lineitem"
          case "Fulfillment":
            return entityName.includes("fulfillment") ||
                   entityName.includes("shipment") ||
                   entityName.includes("tracking") ||
                   entityName === "inventoryreservation"
          case "Payment":
            return entityName.includes("payment")
          case "System":
            return entityName === "quantitydetail" ||
                   entityName === "customerdetail" ||
                   entityName === "addressdetail"
          default:
            return true
        }
      })
    }

    // Audit date filter (compare date portion only)
    if (appliedAuditDate) {
      const filterDateStr = format(appliedAuditDate, "dd/MM/yyyy")
      filtered = filtered.filter(event => {
        const eventDateStr = event.updatedOn.split(" ")[0]
        return eventDateStr === filterDateStr
      })
    }

    // Order Line ID filter (case-insensitive partial match)
    if (appliedOrderLineId) {
      const searchLower = appliedOrderLineId.toLowerCase()
      filtered = filtered.filter(event =>
        event.entityId.toLowerCase().includes(searchLower)
      )
    }

    return filtered
  }, [auditEvents, appliedEntityCategory, appliedAuditDate, appliedOrderLineId])

  // Apply filters handler
  const handleApplyFilters = useCallback(() => {
    setAppliedEntityCategory(pendingEntityCategory)
    setAppliedAuditDate(pendingAuditDate)
    setAppliedOrderLineId(pendingOrderLineId)
  }, [pendingEntityCategory, pendingAuditDate, pendingOrderLineId])

  // Clear all filters
  const clearFilters = useCallback(() => {
    // Clear pending
    setPendingEntityCategory("All")
    setPendingAuditDate(undefined)
    setPendingOrderLineId("")
    // Clear applied
    setAppliedEntityCategory("All")
    setAppliedAuditDate(undefined)
    setAppliedOrderLineId("")
  }, [])

  // Check if any filters are active
  const hasActiveFilters = appliedEntityCategory !== "All" || appliedAuditDate || appliedOrderLineId

  // Export to CSV with Manhattan columns
  const exportToCSV = useCallback(() => {
    const headers = [
      "UPDATED BY",
      "UPDATED ON",
      "ENTITY NAME",
      "ENTITY ID",
      "CHANGED PARAMETER",
      "OLD VALUE",
      "NEW VALUE"
    ]
    const rows = filteredEvents.map(event => [
      event.updatedBy,
      event.updatedOn,
      event.entityName,
      event.entityId,
      event.changedParameter,
      event.oldValue || "",
      event.newValue || ""
    ])

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = `audit-trail-${orderId}-${format(new Date(), "yyyy-MM-dd")}.csv`
    link.click()
  }, [filteredEvents, orderId])

  // Refresh data (simulated)
  const handleRefresh = useCallback(() => {
    window.location.reload()
  }, [])

  // Loading skeleton
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Audit Trail
          </CardTitle>
          <CardDescription>Loading audit history...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <History className="h-5 w-5" />
                Audit Trail
              </CardTitle>
              <CardDescription className="text-sm">
                {filteredEvents.length} event{filteredEvents.length !== 1 ? "s" : ""}
                {hasActiveFilters && ` (filtered from ${auditEvents.length})`}
              </CardDescription>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={exportToCSV}
                disabled={filteredEvents.length === 0}
              >
                <Download className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Export CSV</span>
              </Button>
              <Button variant="outline" size="sm" onClick={handleRefresh}>
                <RefreshCw className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
            </div>
          </div>

          {/* Manhattan-style Filter Bar */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border">
            {/* Order Number Display (read-only) */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">Order Number:</span>
              <span className="text-sm font-mono font-semibold">{orderId}</span>
            </div>

            <div className="hidden lg:block h-6 w-px bg-gray-300 dark:bg-gray-700" />

            {/* Audit Trail Dropdown */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-sm text-muted-foreground whitespace-nowrap">Audit Trail:</span>
              <Select
                value={pendingEntityCategory}
                onValueChange={(value) => setPendingEntityCategory(value as EntityNameCategory)}
              >
                <SelectTrigger className="w-full sm:w-[140px] h-9">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All</SelectItem>
                  <SelectItem value="Order">Order</SelectItem>
                  <SelectItem value="Fulfillment">Fulfillment</SelectItem>
                  <SelectItem value="Payment">Payment</SelectItem>
                  <SelectItem value="System">System</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Audit Date Picker */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-sm text-muted-foreground whitespace-nowrap">Audit Date:</span>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full sm:w-[160px] justify-start text-left font-normal h-9"
                  >
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    {pendingAuditDate ? (
                      format(pendingAuditDate, "dd/MM/yyyy")
                    ) : (
                      <span className="text-muted-foreground">Select date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={pendingAuditDate}
                    onSelect={setPendingAuditDate}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Order Line ID Input */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-sm text-muted-foreground whitespace-nowrap">Order Line ID:</span>
              <Input
                type="text"
                placeholder="Enter ID..."
                value={pendingOrderLineId}
                onChange={(e) => setPendingOrderLineId(e.target.value)}
                className="w-full sm:w-[150px] h-9"
                disabled
              />
            </div>

            {/* APPLY Button */}
            <Button
              onClick={handleApplyFilters}
              size="sm"
              className="h-9 px-6"
            >
              APPLY
            </Button>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="h-9">
                <X className="h-4 w-4 mr-1" />
                Clear
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="px-3 sm:px-6">
        {filteredEvents.length === 0 ? (
          // Empty State
          <div className="text-center py-12">
            <History className="mx-auto h-12 w-12 text-gray-300" />
            <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-gray-100">No audit events found</h3>
            <p className="mt-2 text-sm text-gray-500 max-w-sm mx-auto">
              {hasActiveFilters
                ? "No events match your current filters. Try adjusting your search criteria."
                : "This order has no audit history to display."
              }
            </p>
            {hasActiveFilters && (
              <Button variant="outline" size="sm" className="mt-4" onClick={clearFilters}>
                Clear all filters
              </Button>
            )}
          </div>
        ) : (
          <>
            {/* Desktop Table View - Manhattan Style */}
            <div className="hidden lg:block border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-100 dark:bg-gray-800">
                    <TableHead className="text-xs font-semibold uppercase text-gray-700 dark:text-gray-300 w-[130px]">
                      UPDATED BY
                    </TableHead>
                    <TableHead className="text-xs font-semibold uppercase text-gray-700 dark:text-gray-300 w-[160px]">
                      UPDATED ON
                    </TableHead>
                    <TableHead className="text-xs font-semibold uppercase text-gray-700 dark:text-gray-300 w-[140px]">
                      ENTITY NAME
                    </TableHead>
                    <TableHead className="text-xs font-semibold uppercase text-gray-700 dark:text-gray-300 min-w-[200px]">
                      ENTITY ID
                    </TableHead>
                    <TableHead className="text-xs font-semibold uppercase text-gray-700 dark:text-gray-300 min-w-[250px]">
                      CHANGED PARAMETER
                    </TableHead>
                    <TableHead className="text-xs font-semibold uppercase text-gray-700 dark:text-gray-300 w-[120px]">
                      OLD VALUE
                    </TableHead>
                    <TableHead className="text-xs font-semibold uppercase text-gray-700 dark:text-gray-300 w-[120px]">
                      NEW VALUE
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEvents.map((event) => (
                    <TableRow
                      key={event.id}
                      className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    >
                      <TableCell className="text-sm font-mono">
                        {event.updatedBy}
                      </TableCell>
                      <TableCell className="text-sm font-mono text-muted-foreground">
                        {event.updatedOn}
                      </TableCell>
                      <TableCell className="text-sm">
                        {event.entityName}
                      </TableCell>
                      <TableCell className="text-sm font-mono break-all">
                        {event.entityId}
                      </TableCell>
                      <TableCell className="text-sm break-words">
                        {event.changedParameter}
                      </TableCell>
                      <TableCell className="text-sm font-mono text-muted-foreground">
                        {event.oldValue || "-"}
                      </TableCell>
                      <TableCell className="text-sm font-mono">
                        {event.newValue || "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden space-y-3">
              {filteredEvents.map((event) => (
                <div
                  key={event.id}
                  className="border rounded-lg bg-white dark:bg-gray-900 overflow-hidden shadow-sm"
                >
                  <div className="p-4">
                    {/* Header: Updated By and Updated On */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <span className="text-sm font-mono font-medium">{event.updatedBy}</span>
                      <span className="text-xs text-muted-foreground font-mono">
                        {event.updatedOn}
                      </span>
                    </div>

                    {/* Entity Name */}
                    <div className="mb-2">
                      <span className="text-xs text-muted-foreground uppercase">Entity: </span>
                      <span className="text-sm font-medium">{event.entityName}</span>
                    </div>

                    {/* Entity ID */}
                    <div className="mb-2">
                      <span className="text-xs text-muted-foreground uppercase">ID: </span>
                      <span className="text-xs font-mono break-all">{event.entityId}</span>
                    </div>

                    {/* Changed Parameter */}
                    <div className="mb-2 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                      <span className="text-sm">{event.changedParameter}</span>
                    </div>

                    {/* Values */}
                    {(event.oldValue || event.newValue) && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground font-mono">
                          {event.oldValue || "-"}
                        </span>
                        <span className="text-muted-foreground">→</span>
                        <span className="font-mono font-medium">
                          {event.newValue || "-"}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
