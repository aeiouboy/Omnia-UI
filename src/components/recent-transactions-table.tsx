"use client"

import { useState, useMemo } from "react"
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ArrowUp, ArrowDown, RefreshCw, RotateCcw, MapPin, Download, Search, Calendar } from "lucide-react"
import Link from "next/link"
import type { StockTransaction } from "@/types/inventory"
import type { ViewTypeChannel } from "@/types/view-type-config"
import { formatWarehouseCode, formatStockQuantity } from "@/lib/warehouse-utils"
import { exportTransactionsToCSV } from "@/lib/export-utils"

interface RecentTransactionsTableProps {
  transactions: StockTransaction[]
  loading?: boolean
  /** Optional: Channels from View Type to display instead of transaction channel */
  viewChannels?: ViewTypeChannel[]
  storeName?: string
  storeId?: string
}

function getTransactionIcon(type: StockTransaction["type"]) {
  switch (type) {
    case "stock_in":
      return <ArrowUp className="h-4 w-4 text-green-600" />
    case "stock_out":
      return <ArrowDown className="h-4 w-4 text-red-600" />
    case "adjustment":
      return <RefreshCw className="h-4 w-4 text-blue-600" />
    case "return":
      return <RotateCcw className="h-4 w-4 text-purple-600" />
    default:
      return null
  }
}

function getTransactionBadgeClass(type: StockTransaction["type"]) {
  switch (type) {
    case "stock_in":
      return "bg-green-100 text-green-800"
    case "stock_out":
      return "bg-red-100 text-red-800"
    case "adjustment":
      return "bg-blue-100 text-blue-800"
    case "return":
      return "bg-purple-100 text-purple-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

function getTransactionLabel(type: StockTransaction["type"]) {
  switch (type) {
    case "stock_in":
      return "Stock In"
    case "stock_out":
      return "Stock Out"
    case "adjustment":
      return "Adjustment"
    case "return":
      return "Return"
    default:
      return type
  }
}

function formatDateTime(timestamp: string) {
  const date = new Date(timestamp)
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function getChannelBadge(channel?: "Grab" | "Lineman" | "Gokoo") {
  if (!channel) {
    return <span className="text-xs text-muted-foreground">—</span>
  }

  const channelConfig = {
    Grab: { label: "GB", bg: "#0a9830", color: "#ffffff" },
    Lineman: { label: "LM", bg: "#06C755", color: "#ffffff" },
    Gokoo: { label: "GK", bg: "#FD4D2B", color: "#ffffff" },
  }

  const config = channelConfig[channel]

  return (
    <Badge
      variant="outline"
      className="text-xs px-2 py-1 h-6 font-semibold border-0"
      style={{ backgroundColor: config.bg, color: config.color }}
    >
      {config.label}
    </Badge>
  )
}

export function RecentTransactionsTable({
  transactions,
  loading = false,
  viewChannels,
  storeName,
  storeId,
}: RecentTransactionsTableProps) {
  const [typeFilter, setTypeFilter] = useState<"all" | "stock_in" | "stock_out" | "adjustment" | "return">("all")
  const [dateFilter, setDateFilter] = useState<string>("")
  const [noteSearch, setNoteSearch] = useState<string>("")

  // Filter transactions based on all filters
  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      // Filter by transaction type
      if (typeFilter !== "all" && transaction.type !== typeFilter) {
        return false
      }

      // Filter by date
      if (dateFilter) {
        const transactionDate = new Date(transaction.timestamp).toISOString().split('T')[0]
        if (transactionDate !== dateFilter) {
          return false
        }
      }

      // Filter by note search
      if (noteSearch.trim()) {
        const searchLower = noteSearch.toLowerCase()
        const notesMatch = transaction.notes?.toLowerCase().includes(searchLower)
        const refMatch = transaction.referenceId?.toLowerCase().includes(searchLower)
        const userMatch = transaction.user?.toLowerCase().includes(searchLower)
        if (!notesMatch && !refMatch && !userMatch) {
          return false
        }
      }

      return true
    })
  }, [transactions, typeFilter, dateFilter, noteSearch])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Last 10 stock movements</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (transactions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Last 10 stock movements</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            No transaction history available
          </div>
        </CardContent>
      </Card>
    )
  }

  const handleExport = () => {
    if (transactions.length > 0) {
      const productName = transactions[0].productName || "inventory"
      exportTransactionsToCSV(filteredTransactions, productName)
    }
  }

  return (
    <TooltipProvider>
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Last {transactions.length} stock movements</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
                disabled={filteredTransactions.length === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
          {/* Filters Row */}
          <div className="flex flex-wrap items-center gap-3 pt-3 border-t">
            {/* Note Search - Primary filter (wider) */}
            <div className="relative flex-1 min-w-[200px] max-w-[300px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search notes, reference, user..."
                value={noteSearch}
                onChange={(e) => setNoteSearch(e.target.value)}
                className="pl-9 h-9"
              />
            </div>

            {/* Transaction Type Filter */}
            <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as typeof typeFilter)}>
              <SelectTrigger className="w-[140px] h-9">
                <SelectValue placeholder="All Transaction Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Transaction Types</SelectItem>
                <SelectItem value="stock_in">Stock In</SelectItem>
                <SelectItem value="stock_out">Stock Out</SelectItem>
                <SelectItem value="adjustment">Adjustment</SelectItem>
                <SelectItem value="return">Return</SelectItem>
              </SelectContent>
            </Select>

            {/* Date Filter */}
            <Input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-[140px] h-9"
            />

            {/* Clear Filters */}
            {(typeFilter !== "all" || dateFilter || noteSearch) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setTypeFilter("all")
                  setDateFilter("")
                  setNoteSearch("")
                }}
                className="h-9 text-muted-foreground hover:text-foreground"
              >
                Clear
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[180px]">Date & Time</TableHead>
                  <TableHead>Transaction Type</TableHead>
                  <TableHead>Channel</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                  <TableHead className="hidden lg:table-cell">Store Name</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="font-mono text-sm">
                      {formatDateTime(transaction.timestamp)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getTransactionIcon(transaction.type)}
                        <Badge
                          variant="outline"
                          className={getTransactionBadgeClass(transaction.type)}
                        >
                          {getTransactionLabel(transaction.type)}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      {viewChannels && viewChannels.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {viewChannels.map((channel) => (
                            <Badge
                              key={channel}
                              variant="outline"
                              className="text-xs px-2 py-1 h-6 font-semibold bg-blue-100 text-blue-700 border-blue-300"
                            >
                              {channel}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        getChannelBadge(transaction.channel)
                      )}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {transaction.type === "stock_out"
                        ? `-${transaction.itemType ? formatStockQuantity(transaction.quantity, transaction.itemType, false) : transaction.quantity}`
                        : `+${transaction.itemType ? formatStockQuantity(transaction.quantity, transaction.itemType, false) : transaction.quantity}`}
                    </TableCell>
                    <TableCell className="text-right">
                      {transaction.itemType ? formatStockQuantity(transaction.balanceAfter, transaction.itemType, false) : transaction.balanceAfter}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {storeName ? (
                        <div className="flex flex-col">
                          <span className="font-medium text-xs truncate max-w-[150px]" title={storeName}>{storeName}</span>
                          <span className="text-[10px] text-muted-foreground font-mono">{storeId}</span>
                        </div>
                      ) : (
                        transaction.warehouseCode && transaction.locationCode ? (
                          <div className="flex items-center gap-1.5">
                            <Badge
                              variant="outline"
                              className="text-xs px-2 py-1 h-6 font-mono bg-blue-50 text-blue-700 border-blue-200"
                            >
                              <MapPin className="h-3 w-3 mr-1 inline" />
                              {formatWarehouseCode(transaction.warehouseCode, transaction.locationCode)}
                            </Badge>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-[200px]">
                      <Tooltip delayDuration={300}>
                        <TooltipTrigger asChild>
                          <div className="truncate">
                            {/* Only show user name if no referenceId exists for stock_out/return */}
                            {transaction.user &&
                              !((transaction.type === "stock_out" || transaction.type === "return") && transaction.referenceId) &&
                              <span className="font-medium">{transaction.user}: </span>
                            }
                            {transaction.notes}
                            {transaction.referenceId && (() => {
                              // Extract numeric ID from ORD-{number} format for stock_out and return transactions
                              const match = transaction.referenceId.match(/ORD-(\d+)/)
                              const numericId = match ? match[1] : null

                              if ((transaction.type === "stock_out" || transaction.type === "return") && numericId) {
                                return (
                                  <Link
                                    href={`/orders/${numericId}`}
                                    className="ml-2 font-mono text-xs text-primary underline hover:text-primary/80"
                                  >
                                    ({transaction.referenceId})
                                  </Link>
                                )
                              }

                              return (
                                <span className="ml-2 font-mono text-xs">
                                  ({transaction.referenceId})
                                </span>
                              )
                            })()}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-[300px] whitespace-normal break-words">
                          {/* Only show user name if no referenceId exists for stock_out/return */}
                          {transaction.user &&
                            !((transaction.type === "stock_out" || transaction.type === "return") && transaction.referenceId) &&
                            <span className="font-medium">{transaction.user}: </span>
                          }
                          {transaction.notes}
                          {transaction.referenceId && (() => {
                            // Extract numeric ID from ORD-{number} format for stock_out and return transactions
                            const match = transaction.referenceId.match(/ORD-(\d+)/)
                            const numericId = match ? match[1] : null

                            if ((transaction.type === "stock_out" || transaction.type === "return") && numericId) {
                              return (
                                <Link
                                  href={`/orders/${numericId}`}
                                  className="ml-2 font-mono text-xs text-primary underline hover:text-primary/80"
                                >
                                  ({transaction.referenceId})
                                </Link>
                              )
                            }

                            return (
                              <span className="ml-2 font-mono text-xs">
                                ({transaction.referenceId})
                              </span>
                            )
                          })()}
                        </TooltipContent>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  )
}
