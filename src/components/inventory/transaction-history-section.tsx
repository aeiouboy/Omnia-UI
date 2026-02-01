/**
 * Transaction History Section Component
 *
 * Displays comprehensive transaction history for an inventory item with:
 * - Full transaction history table (not limited to "Recent" transactions)
 * - Support for 6 transaction types: Stock In, Stock Out, Adjustments, Transfers, Allocations, Returns
 * - Date/Time display in GMT+7 (Asia/Bangkok) timezone
 * - Transaction type with visual indicators and color-coded badges
 * - Reference number linking (PO, SO, Transfer ID, Order ID)
 * - Quantity with +/- indicators based on transaction direction
 * - Balance after each transaction
 * - Warehouse/Location display
 * - User who performed the transaction
 * - Notes/Remarks
 * - Pagination with configurable page sizes
 * - Date range filtering using calendar picker
 * - Transaction type filter dropdown
 * - CSV and Excel export functionality
 * - Mobile-responsive table with horizontal scroll
 */

"use client"

import * as React from "react"
import { useState, useEffect, useCallback } from "react"
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
import { Skeleton } from "@/components/ui/skeleton"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  ArrowUp,
  ArrowDown,
  RefreshCw,
  ArrowLeftRight,
  MapPin,
  Download,
  FileSpreadsheet,
  CalendarIcon,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  History,
} from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { formatGMT7Time } from "@/lib/utils"
import { formatWarehouseCode, formatStockQuantity } from "@/lib/warehouse-utils"
import { exportTransactionsToCSV, exportTransactionsToExcel } from "@/lib/export-utils"
import { fetchTransactionHistory } from "@/lib/inventory-service"
import { getWarehouseCodesForStore } from "@/lib/mock-inventory-data"
import { useInventoryView } from "@/contexts/inventory-view-context"
import type {
  StockTransaction,
  TransactionType,
  TransactionHistoryResponse,
  ItemType,
} from "@/types/inventory"
import { format, subDays } from "date-fns"

interface TransactionHistorySectionProps {
  productId: string
  productName: string
  itemType: ItemType
  storeContext?: string
}

// Transaction type configuration for icons, badges, and quantity direction
const transactionTypeConfig: Record<
  TransactionType,
  {
    icon: React.ReactNode
    badgeClass: string
    label: string
    quantitySign: "+" | "-" | "+/-"
  }
> = {
  "Initial sync": {
    icon: <ArrowUp className="h-4 w-4 text-green-600" />,
    badgeClass: "bg-green-100 text-green-800",
    label: "Initial sync",
    quantitySign: "+",
  },
  "Order Ship": {
    icon: <ArrowDown className="h-4 w-4 text-red-600" />,
    badgeClass: "bg-red-100 text-red-800",
    label: "Order Ship",
    quantitySign: "-",
  },
  "Adjust In": {
    icon: <RefreshCw className="h-4 w-4 text-blue-600" />,
    badgeClass: "bg-blue-100 text-blue-800",
    label: "Adjust In",
    quantitySign: "+",
  },
  "Adjust out": {
    icon: <RefreshCw className="h-4 w-4 text-blue-600" />,
    badgeClass: "bg-blue-100 text-blue-800",
    label: "Adjust out",
    quantitySign: "-",
  },
  "Replacement": {
    icon: <ArrowLeftRight className="h-4 w-4 text-purple-600" />,
    badgeClass: "bg-purple-100 text-purple-800",
    label: "Replacement",
    quantitySign: "+/-",
  },
}

function getQuantityDisplay(
  transaction: StockTransaction,
  itemType: ItemType
): { text: string; className: string } {
  const config = transactionTypeConfig[transaction.type]
  const quantity = formatStockQuantity(transaction.quantity, itemType, false)

  // For Replacement, check if the balance increased or decreased
  let sign = config.quantitySign
  if (transaction.type === "Replacement") {
    // We can't know the direction without comparing with previous balance
    // Use the balance change sign if available, otherwise use +
    sign = "+"
  }

  const isNegative = sign === "-"
  const prefix = isNegative ? "-" : "+"
  const className = isNegative ? "text-red-600" : "text-green-600"

  return {
    text: `${prefix}${quantity}`,
    className,
  }
}

function formatDateTimeGMT7(timestamp: string): string {
  return formatGMT7Time(timestamp, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
}

export function TransactionHistorySection({
  productId,
  productName,
  itemType,
  storeContext,
}: TransactionHistorySectionProps) {
  // Get channels from inventory view context
  const { channels: viewChannels } = useInventoryView()

  // State
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(25)
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: subDays(new Date(), 90), // Default to last 90 days
    to: new Date(),
  })
  const [transactionTypeFilter, setTransactionTypeFilter] = useState<TransactionType | "all">("all")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<TransactionHistoryResponse | null>(null)
  const [allTransactions, setAllTransactions] = useState<StockTransaction[]>([]) // For export

  // Fetch data
  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetchTransactionHistory(productId, {
        page,
        pageSize,
        dateFrom: dateRange.from ? format(dateRange.from, "yyyy-MM-dd") : undefined,
        dateTo: dateRange.to ? format(dateRange.to, "yyyy-MM-dd") : undefined,
        transactionType: transactionTypeFilter,
      })

      // Filter by store context if provided
      if (storeContext) {
        const warehouseCodes = getWarehouseCodesForStore(storeContext)
        if (warehouseCodes.length > 0) {
          const filteredTransactions = response.transactions.filter(
            (t) => t.warehouseCode && warehouseCodes.includes(t.warehouseCode)
          )
          setData({
            ...response,
            transactions: filteredTransactions,
            total: filteredTransactions.length,
            totalPages: Math.ceil(filteredTransactions.length / pageSize),
          })
        } else {
          setData(response)
        }
      } else {
        setData(response)
      }

      // Also fetch all transactions for export (without pagination)
      const allResponse = await fetchTransactionHistory(productId, {
        page: 1,
        pageSize: 1000, // Large number to get all
        dateFrom: dateRange.from ? format(dateRange.from, "yyyy-MM-dd") : undefined,
        dateTo: dateRange.to ? format(dateRange.to, "yyyy-MM-dd") : undefined,
        transactionType: transactionTypeFilter,
      })

      if (storeContext) {
        const warehouseCodes = getWarehouseCodesForStore(storeContext)
        if (warehouseCodes.length > 0) {
          setAllTransactions(
            allResponse.transactions.filter(
              (t) => t.warehouseCode && warehouseCodes.includes(t.warehouseCode)
            )
          )
        } else {
          setAllTransactions(allResponse.transactions)
        }
      } else {
        setAllTransactions(allResponse.transactions)
      }
    } catch (err) {
      console.error("Failed to fetch transaction history:", err)
      setError("Failed to load transaction history. Please try again.")
    } finally {
      setLoading(false)
    }
  }, [productId, page, pageSize, dateRange, transactionTypeFilter, storeContext])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Reset page when filters change
  useEffect(() => {
    setPage(1)
  }, [dateRange, transactionTypeFilter, pageSize])

  // Handle exports
  const handleExportCSV = () => {
    if (allTransactions.length > 0) {
      exportTransactionsToCSV(allTransactions, productName)
    }
  }

  const handleExportExcel = () => {
    if (allTransactions.length > 0) {
      exportTransactionsToExcel(allTransactions, productName)
    }
  }

  // Render reference ID with link when applicable
  const renderReferenceId = (transaction: StockTransaction) => {
    if (!transaction.referenceId) {
      return <span className="text-muted-foreground">-</span>
    }

    const ref = transaction.referenceId

    // Link to order for ORD- pattern
    const orderMatch = ref.match(/^ORD-(\d+)$/)
    if (orderMatch && (transaction.type === "Order Ship" || transaction.type === "Replacement")) {
      return (
        <Link
          href={`/orders/${orderMatch[1]}`}
          className="font-mono text-xs text-primary underline hover:text-primary/80"
        >
          {ref}
        </Link>
      )
    }

    // Display as plain text for other references (PO-, TRF-, ALLOC-)
    return <span className="font-mono text-xs">{ref}</span>
  }

  // Loading skeleton
  if (loading && !data) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Available Transaction History
              </CardTitle>
              <CardDescription>Complete transaction history for this item</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-4">
              <Skeleton className="h-10 w-[200px]" />
              <Skeleton className="h-10 w-[150px]" />
              <Skeleton className="h-10 w-[100px]" />
            </div>
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Error state
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Available Transaction History
          </CardTitle>
          <CardDescription>Complete transaction history for this item</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={fetchData} variant="outline">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Empty state
  if (!data || data.transactions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Available Transaction History
              </CardTitle>
              <CardDescription>Complete transaction history for this item</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-6">
            {/* Date Range Picker */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-[280px] justify-start text-left font-normal min-h-[44px]",
                    !dateRange.from && !dateRange.to && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(dateRange.from, "LLL dd, y")
                    )
                  ) : (
                    <span>Pick a date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange.from}
                  selected={{ from: dateRange.from, to: dateRange.to }}
                  onSelect={(range) => setDateRange({ from: range?.from, to: range?.to })}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>

            {/* Transaction Type Filter */}
            <Select
              value={transactionTypeFilter}
              onValueChange={(value) => setTransactionTypeFilter(value as TransactionType | "all")}
            >
              <SelectTrigger className="w-[180px] min-h-[44px]">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Initial sync">Initial sync</SelectItem>
                <SelectItem value="Order Ship">Order Ship</SelectItem>
                <SelectItem value="Adjust In">Adjust In</SelectItem>
                <SelectItem value="Adjust out">Adjust out</SelectItem>
                <SelectItem value="Replacement">Replacement</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="text-center py-8 text-muted-foreground">
            <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No transaction history found for the selected filters.</p>
            <p className="text-sm mt-2">Try adjusting the date range or transaction type filter.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <TooltipProvider>
      <Card>
        <CardHeader>
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Available Transaction History
              </CardTitle>
              <CardDescription>
                Showing {data.transactions.length} of {data.total} transactions
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportCSV}
                disabled={allTransactions.length === 0}
                className="min-h-[44px]"
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportExcel}
                disabled={allTransactions.length === 0}
                className="min-h-[44px]"
              >
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Export Excel
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-6">
            {/* Date Range Picker */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-[280px] justify-start text-left font-normal min-h-[44px]",
                    !dateRange.from && !dateRange.to && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(dateRange.from, "LLL dd, y")
                    )
                  ) : (
                    <span>Pick a date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange.from}
                  selected={{ from: dateRange.from, to: dateRange.to }}
                  onSelect={(range) => setDateRange({ from: range?.from, to: range?.to })}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>

            {/* Transaction Type Filter */}
            <Select
              value={transactionTypeFilter}
              onValueChange={(value) => setTransactionTypeFilter(value as TransactionType | "all")}
            >
              <SelectTrigger className="w-[180px] min-h-[44px]">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Initial sync">Initial sync</SelectItem>
                <SelectItem value="Order Ship">Order Ship</SelectItem>
                <SelectItem value="Adjust In">Adjust In</SelectItem>
                <SelectItem value="Adjust out">Adjust out</SelectItem>
                <SelectItem value="Replacement">Replacement</SelectItem>
              </SelectContent>
            </Select>

            {/* Page Size */}
            <Select
              value={pageSize.toString()}
              onValueChange={(value) => setPageSize(parseInt(value))}
            >
              <SelectTrigger className="w-[120px] min-h-[44px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 / page</SelectItem>
                <SelectItem value="25">25 / page</SelectItem>
                <SelectItem value="50">50 / page</SelectItem>
                <SelectItem value="100">100 / page</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table with horizontal scroll for mobile */}
          <div className="overflow-x-auto -mx-6 px-6">
            <Table className="min-w-[900px]">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[160px]">Date/Time (GMT+7)</TableHead>
                  <TableHead className="w-[120px]">Type</TableHead>
                  <TableHead className="w-[100px]">Reference No</TableHead>
                  <TableHead className="text-right w-[100px]">Quantity</TableHead>
                  <TableHead className="text-right w-[100px]">Balance</TableHead>
                  <TableHead className="w-[120px] hidden lg:table-cell">Warehouse</TableHead>
                  <TableHead className="w-[100px] hidden lg:table-cell">User</TableHead>
                  <TableHead className="w-[200px]">Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  // Loading state with skeleton rows
                  Array.from({ length: pageSize }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                      <TableCell className="hidden lg:table-cell"><Skeleton className="h-5 w-full" /></TableCell>
                      <TableCell className="hidden lg:table-cell"><Skeleton className="h-5 w-full" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                    </TableRow>
                  ))
                ) : (
                  data.transactions.map((transaction) => {
                    const config = transactionTypeConfig[transaction.type]
                    const quantityDisplay = getQuantityDisplay(transaction, itemType)

                    return (
                      <TableRow key={transaction.id}>
                        <TableCell className="font-mono text-sm">
                          {formatDateTimeGMT7(transaction.timestamp)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {config.icon}
                            <Badge variant="outline" className={config.badgeClass}>
                              {config.label}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>{renderReferenceId(transaction)}</TableCell>
                        <TableCell className={cn("text-right font-semibold", quantityDisplay.className)}>
                          {quantityDisplay.text}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatStockQuantity(transaction.balanceAfter, itemType, false)}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          {transaction.warehouseCode && transaction.locationCode ? (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Badge
                                  variant="outline"
                                  className="text-xs px-2 py-1 h-6 font-mono bg-blue-50 text-blue-700 border-blue-200 cursor-help"
                                >
                                  <MapPin className="h-3 w-3 mr-1 inline" />
                                  {formatWarehouseCode(transaction.warehouseCode, transaction.locationCode)}
                                </Badge>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Warehouse: {transaction.warehouseCode}</p>
                                <p>Location: {transaction.locationCode}</p>
                                {transaction.transferFrom && (
                                  <p>From: {transaction.transferFrom}</p>
                                )}
                                {transaction.transferTo && (
                                  <p>To: {transaction.transferTo}</p>
                                )}
                              </TooltipContent>
                            </Tooltip>
                          ) : (
                            <span className="text-xs text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-sm">
                          {transaction.user || "-"}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground max-w-[200px]">
                          <Tooltip delayDuration={300}>
                            <TooltipTrigger asChild>
                              <div className="truncate cursor-help">
                                {transaction.notes || "-"}
                                {transaction.allocationType && (
                                  <Badge
                                    variant="outline"
                                    className="ml-2 text-xs bg-orange-50 text-orange-700"
                                  >
                                    {transaction.allocationType}
                                  </Badge>
                                )}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-[300px] whitespace-normal break-words">
                              <p>{transaction.notes || "No notes"}</p>
                              {viewChannels && viewChannels.length > 0 && (
                                <p>Channel: {viewChannels.join(", ")}</p>
                              )}
                              {transaction.allocationType && (
                                <p>Allocation Type: {transaction.allocationType}</p>
                              )}
                            </TooltipContent>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {data.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-muted-foreground">
                Page {data.page} of {data.totalPages}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1 || loading}
                  className="min-h-[44px] min-w-[44px]"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="hidden sm:inline ml-1">Previous</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                  disabled={page >= data.totalPages || loading}
                  className="min-h-[44px] min-w-[44px]"
                >
                  <span className="hidden sm:inline mr-1">Next</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </TooltipProvider>
  )
}
