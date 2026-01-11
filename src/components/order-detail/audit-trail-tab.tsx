"use client"

import { useState, useMemo, useCallback, Fragment } from "react"
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
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  History,
  Plus,
  RefreshCw,
  Edit,
  CreditCard,
  Truck,
  AlertTriangle,
  AlertCircle,
  MessageSquare,
  Settings,
  ChevronDown,
  ChevronUp,
  Download,
  Search,
  X,
  Calendar as CalendarIcon,
  Package,
  PackageMinus,
} from "lucide-react"
import { formatGMT7Time } from "@/lib/utils"
import {
  AuditEvent,
  AuditActionType,
  AuditEventSource,
  AuditEventChange,
  AUDIT_ACTION_CONFIG,
  AuditTrailFilters
} from "@/types/audit"
import { generateMockAuditTrail } from "@/lib/mock-data"
import { format } from "date-fns"
import type { DateRange } from "react-day-picker"

interface AuditTrailTabProps {
  orderId: string
  orderData?: any
  loading?: boolean
}

// Icon mapping for action types
const ActionIcon = ({ actionType }: { actionType: AuditActionType }) => {
  const iconClass = "h-4 w-4"

  switch (actionType) {
    case AuditActionType.ORDER_CREATED:
      return <Plus className={iconClass} />
    case AuditActionType.STATUS_CHANGED:
      return <RefreshCw className={iconClass} />
    case AuditActionType.ITEM_ADDED:
      return <Package className={iconClass} />
    case AuditActionType.ITEM_REMOVED:
      return <PackageMinus className={iconClass} />
    case AuditActionType.ITEM_MODIFIED:
      return <Edit className={iconClass} />
    case AuditActionType.PAYMENT_UPDATED:
      return <CreditCard className={iconClass} />
    case AuditActionType.FULFILLMENT_UPDATE:
      return <Truck className={iconClass} />
    case AuditActionType.SLA_BREACH:
      return <AlertTriangle className={iconClass} />
    case AuditActionType.ESCALATED:
      return <AlertCircle className={iconClass} />
    case AuditActionType.NOTE_ADDED:
      return <MessageSquare className={iconClass} />
    case AuditActionType.SYSTEM_EVENT:
      return <Settings className={iconClass} />
    default:
      return <History className={iconClass} />
  }
}

// Source badge component
const SourceBadge = ({ source }: { source: AuditEventSource }) => {
  const config: Record<AuditEventSource, { bg: string; text: string }> = {
    API: { bg: "bg-blue-100", text: "text-blue-800" },
    MANUAL: { bg: "bg-green-100", text: "text-green-800" },
    INTEGRATION: { bg: "bg-purple-100", text: "text-purple-800" },
    WEBHOOK: { bg: "bg-orange-100", text: "text-orange-800" },
    SYSTEM: { bg: "bg-slate-100", text: "text-slate-800" },
  }

  const { bg, text } = config[source] || { bg: "bg-gray-100", text: "text-gray-800" }

  return (
    <Badge variant="outline" className={`${bg} ${text} text-xs`}>
      {source}
    </Badge>
  )
}

export function AuditTrailTab({ orderId, orderData, loading = false }: AuditTrailTabProps) {
  // Filter state
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)
  const [actionTypeFilter, setActionTypeFilter] = useState<string>("all")
  const [sourceFilter, setSourceFilter] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState("")

  // Expanded rows state
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({})

  // Generate mock audit data
  const auditEvents = useMemo(() => {
    if (loading) return []
    return generateMockAuditTrail(orderId, orderData)
  }, [orderId, orderData, loading])

  // Filter audit events
  const filteredEvents = useMemo(() => {
    let filtered = [...auditEvents]

    // Date range filter
    if (dateRange?.from) {
      filtered = filtered.filter(event => {
        const eventDate = new Date(event.timestamp)
        if (dateRange.from && eventDate < dateRange.from) return false
        if (dateRange.to && eventDate > new Date(dateRange.to.getTime() + 24 * 60 * 60 * 1000 - 1)) return false
        return true
      })
    }

    // Action type filter
    if (actionTypeFilter && actionTypeFilter !== "all") {
      filtered = filtered.filter(event => event.actionType === actionTypeFilter)
    }

    // Source filter
    if (sourceFilter && sourceFilter !== "all") {
      filtered = filtered.filter(event => event.source === sourceFilter)
    }

    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      filtered = filtered.filter(event =>
        event.description.toLowerCase().includes(search) ||
        event.actor.name.toLowerCase().includes(search) ||
        event.id.toLowerCase().includes(search)
      )
    }

    return filtered
  }, [auditEvents, dateRange, actionTypeFilter, sourceFilter, searchTerm])

  // Toggle row expansion
  const toggleRowExpansion = useCallback((eventId: string) => {
    setExpandedRows(prev => ({
      ...prev,
      [eventId]: !prev[eventId]
    }))
  }, [])

  // Clear all filters
  const clearFilters = useCallback(() => {
    setDateRange(undefined)
    setActionTypeFilter("all")
    setSourceFilter("all")
    setSearchTerm("")
  }, [])

  // Check if any filters are active
  const hasActiveFilters = dateRange?.from || actionTypeFilter !== "all" || sourceFilter !== "all" || searchTerm

  // Export to CSV
  const exportToCSV = useCallback(() => {
    const headers = ["Timestamp", "Action Type", "Description", "Changed By", "Source", "Changes"]
    const rows = filteredEvents.map(event => [
      formatGMT7Time(event.timestamp, {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      }),
      AUDIT_ACTION_CONFIG[event.actionType as AuditActionType]?.label || event.actionType,
      event.description,
      event.actor.name,
      event.source,
      event.changes?.map((c: AuditEventChange) => `${c.field}: ${c.oldValue || 'null'} -> ${c.newValue || 'null'}`).join("; ") || ""
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
    // In a real implementation, this would refetch from API
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

          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Date Range Picker */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full sm:w-[200px] justify-start text-left font-normal"
                >
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <span className="truncate">
                        {format(dateRange.from, "MMM d")} - {format(dateRange.to, "MMM d")}
                      </span>
                    ) : (
                      format(dateRange.from, "MMM d, yyyy")
                    )
                  ) : (
                    <span className="text-muted-foreground">Date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="range"
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={1}
                />
              </PopoverContent>
            </Popover>

            {/* Action Type Filter */}
            <Select value={actionTypeFilter} onValueChange={setActionTypeFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Action type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                {Object.entries(AUDIT_ACTION_CONFIG).map(([type, config]) => (
                  <SelectItem key={type} value={type}>
                    {config.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Source Filter */}
            <Select value={sourceFilter} onValueChange={setSourceFilter}>
              <SelectTrigger className="w-full sm:w-[140px]">
                <SelectValue placeholder="Source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                <SelectItem value="API">API</SelectItem>
                <SelectItem value="MANUAL">Manual</SelectItem>
                <SelectItem value="INTEGRATION">Integration</SelectItem>
                <SelectItem value="WEBHOOK">Webhook</SelectItem>
                <SelectItem value="SYSTEM">System</SelectItem>
              </SelectContent>
            </Select>

            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-9 w-full"
              />
            </div>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
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
            <h3 className="mt-4 text-lg font-medium text-gray-900">No audit events found</h3>
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
            {/* Desktop Table View */}
            <div className="hidden lg:block border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[180px]">Timestamp</TableHead>
                    <TableHead className="w-[160px]">Action Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="w-[140px]">Changed By</TableHead>
                    <TableHead className="w-[100px]">Source</TableHead>
                    <TableHead className="w-[80px] text-center">Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEvents.map((event) => {
                    const config = AUDIT_ACTION_CONFIG[event.actionType as AuditActionType]
                    const isExpanded = expandedRows[event.id]
                    const hasChanges = event.changes && event.changes.length > 0

                    return (
                      <Fragment key={event.id}>
                        <TableRow
                          className={hasChanges ? "cursor-pointer hover:bg-muted/50" : ""}
                          onClick={() => hasChanges && toggleRowExpansion(event.id)}
                        >
                          <TableCell className="font-mono text-sm">
                            {formatGMT7Time(event.timestamp, {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={`${config?.bgColor || 'bg-gray-100'} ${config?.textColor || 'text-gray-800'} gap-1`}
                            >
                              <ActionIcon actionType={event.actionType as AuditActionType} />
                              <span className="hidden xl:inline">{config?.label || event.actionType}</span>
                            </Badge>
                          </TableCell>
                          <TableCell className="max-w-[300px]">
                            <span className="line-clamp-2">{event.description}</span>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm">{event.actor.name}</span>
                          </TableCell>
                          <TableCell>
                            <SourceBadge source={event.source as AuditEventSource} />
                          </TableCell>
                          <TableCell className="text-center">
                            {hasChanges && (
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                {isExpanded ? (
                                  <ChevronUp className="h-4 w-4" />
                                ) : (
                                  <ChevronDown className="h-4 w-4" />
                                )}
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>

                        {/* Expanded Row - Changes Detail */}
                        {isExpanded && hasChanges && (
                          <TableRow key={`${event.id}-expanded`}>
                            <TableCell colSpan={6} className="bg-muted/30 p-0">
                              <div className="px-6 py-4">
                                <p className="text-xs font-medium text-muted-foreground mb-3">Field Changes</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                  {event.changes.map((change: any, idx: number) => (
                                    <div
                                      key={`${event.id}-change-${idx}`}
                                      className="bg-white rounded-md p-3 border border-enterprise-border"
                                    >
                                      <p className="text-xs font-medium text-muted-foreground mb-1">
                                        {change.field}
                                      </p>
                                      <div className="flex items-center gap-2 text-sm">
                                        <span className="text-red-600 line-through">
                                          {change.oldValue === null ? "null" : String(change.oldValue)}
                                        </span>
                                        <span className="text-muted-foreground">→</span>
                                        <span className="text-green-600 font-medium">
                                          {change.newValue === null ? "null" : String(change.newValue)}
                                        </span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </Fragment>
                    )
                  })}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden space-y-3">
              {filteredEvents.map((event) => {
                const config = AUDIT_ACTION_CONFIG[event.actionType as AuditActionType]
                const isExpanded = expandedRows[event.id]
                const hasChanges = event.changes && event.changes.length > 0

                return (
                  <div
                    key={event.id}
                    className="border rounded-lg bg-white overflow-hidden"
                  >
                    <div
                      className={`p-4 ${hasChanges ? "cursor-pointer" : ""}`}
                      onClick={() => hasChanges && toggleRowExpansion(event.id)}
                    >
                      {/* Header Row */}
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <Badge
                          variant="outline"
                          className={`${config?.bgColor || 'bg-gray-100'} ${config?.textColor || 'text-gray-800'} gap-1`}
                        >
                          <ActionIcon actionType={event.actionType as AuditActionType} />
                          {config?.label || event.actionType}
                        </Badge>
                        <span className="text-xs text-muted-foreground font-mono">
                          {formatGMT7Time(event.timestamp, {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>

                      {/* Description */}
                      <p className="text-sm text-gray-900 mb-3">{event.description}</p>

                      {/* Footer */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">by</span>
                          <span className="text-xs font-medium">{event.actor.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <SourceBadge source={event.source as AuditEventSource} />
                          {hasChanges && (
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                              {isExpanded ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Expanded Changes */}
                    {isExpanded && hasChanges && (
                      <div className="px-4 pb-4 pt-2 border-t bg-muted/30">
                        <p className="text-xs font-medium text-muted-foreground mb-2">Field Changes</p>
                        <div className="space-y-2">
                          {event.changes.map((change: any, idx: number) => (
                            <div
                              key={`${event.id}-mobile-change-${idx}`}
                              className="bg-white rounded-md p-2 border border-enterprise-border"
                            >
                              <p className="text-xs font-medium text-muted-foreground">
                                {change.field}
                              </p>
                              <div className="flex items-center gap-2 text-sm mt-1">
                                <span className="text-red-600 line-through text-xs">
                                  {change.oldValue === null ? "null" : String(change.oldValue)}
                                </span>
                                <span className="text-muted-foreground">→</span>
                                <span className="text-green-600 font-medium text-xs">
                                  {change.newValue === null ? "null" : String(change.newValue)}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
