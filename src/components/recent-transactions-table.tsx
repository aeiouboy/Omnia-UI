"use client"

import { useState, useMemo, useEffect } from "react"
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
import { Switch } from "@/components/ui/switch"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Download, Search } from "lucide-react"
import Link from "next/link"
import type { StockTransaction } from "@/types/inventory"
import type { ViewTypeChannel } from "@/types/view-type-config"
import { formatStockQuantity } from "@/lib/warehouse-utils"
import { exportTransactionsToCSV } from "@/lib/export-utils"

// Simplified transaction type for display purposes
type SimplifiedTransactionType = "STOCK_IN" | "STOCK_OUT" | "ADJUSTMENT"

// Mapping from original 4 types to simplified 3 types
const TRANSACTION_TYPE_MAPPING: Record<StockTransaction["type"], SimplifiedTransactionType> = {
  stock_in: "STOCK_IN",
  stock_out: "STOCK_OUT",
  adjustment: "ADJUSTMENT",
  return: "STOCK_IN", // Returns increase stock like stock_in
  transfer: "ADJUSTMENT", // Transfers treated as adjustments
  allocation: "STOCK_OUT", // Allocations decrease available stock
}

// Simplified type configuration matching Stock Card
const simplifiedTypeConfig: Record<SimplifiedTransactionType, {
  badgeClass: string
  label: string
  quantityClass: string
}> = {
  STOCK_IN: {
    badgeClass: "bg-green-100 text-green-700 border-green-200",
    label: "Stock In",
    quantityClass: "text-green-600",
  },
  STOCK_OUT: {
    badgeClass: "bg-red-100 text-red-700 border-red-200",
    label: "Stock Out",
    quantityClass: "text-red-600",
  },
  ADJUSTMENT: {
    badgeClass: "bg-cyan-100 text-cyan-700 border-cyan-200",
    label: "Adjustment",
    quantityClass: "text-cyan-600",
  },
}

interface RecentTransactionsTableProps {
  transactions: StockTransaction[]
  loading?: boolean
  /** Optional: Channels from View Type to display instead of transaction channel */
  viewChannels?: ViewTypeChannel[]
  storeName?: string
  storeId?: string
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


export function RecentTransactionsTable({
  transactions,
  loading = false,
}: RecentTransactionsTableProps) {
  const [typeFilter, setTypeFilter] = useState<"all" | "stock_in" | "stock_out" | "adjustment" | "return">("all")
  const [dateFilter, setDateFilter] = useState<string>("")
  const [noteSearch, setNoteSearch] = useState<string>("")
  const [showMerchantSku, setShowMerchantSku] = useState(false)

  // Load showMerchantSku from localStorage on mount
  useEffect(() => {
    const savedValue = localStorage.getItem("recentTransactions-showMerchantSku")
    if (savedValue !== null) {
      setShowMerchantSku(savedValue === "true")
    }
  }, [])

  // Persist showMerchantSku changes to localStorage
  useEffect(() => {
    localStorage.setItem("recentTransactions-showMerchantSku", String(showMerchantSku))
  }, [showMerchantSku])

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
      exportTransactionsToCSV(filteredTransactions, productName, { includeMerchantSku: showMerchantSku })
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
                className="h-9 text-muted-foreground hover:text-foreground hover:bg-gray-100"
              >
                Clear
              </Button>
            )}

            {/* Spacer */}
            <div className="flex-1" />

            {/* Merchant SKU Toggle */}
            <div className="flex items-center gap-2">
              <label htmlFor="show-merchant-sku-recent" className="text-sm font-medium text-muted-foreground whitespace-nowrap">
                Show Merchant SKU
              </label>
              <Switch
                id="show-merchant-sku-recent"
                checked={showMerchantSku}
                onCheckedChange={setShowMerchantSku}
              />
            </div>

            {/* Export CSV Button */}
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
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[180px]">Date & Time</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                  <TableHead>Notes</TableHead>
                  {showMerchantSku && (
                    <TableHead className="whitespace-nowrap">Merchant SKU</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map((transaction) => {
                  const simplifiedType = TRANSACTION_TYPE_MAPPING[transaction.type]
                  const config = simplifiedTypeConfig[simplifiedType]

                  return (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-mono text-sm">
                        {formatDateTime(transaction.timestamp)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`${config.badgeClass} rounded-full px-3 py-1`}
                        >
                          {config.label}
                        </Badge>
                      </TableCell>
                      <TableCell className={`text-right font-semibold ${config.quantityClass}`}>
                        {simplifiedType === "STOCK_OUT" ? "-" : "+"}
                        {transaction.itemType
                          ? formatStockQuantity(transaction.quantity, transaction.itemType, false)
                          : transaction.quantity}
                      </TableCell>
                      <TableCell className="text-right">
                        {transaction.itemType
                          ? formatStockQuantity(transaction.balanceAfter, transaction.itemType, false)
                          : transaction.balanceAfter}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-[200px]">
                        <Tooltip delayDuration={300}>
                          <TooltipTrigger asChild>
                            <div className="truncate">
                              {transaction.user && (
                                <span className="font-medium">{transaction.user}: </span>
                              )}
                              {transaction.notes}
                              {transaction.referenceId && (() => {
                                const match = transaction.referenceId.match(/ORD-(\d+)/)
                                const numericId = match ? match[1] : null

                                if ((transaction.type === "stock_out" || transaction.type === "return") && numericId) {
                                  return (
                                    <Link
                                      href={`/orders/${numericId}`}
                                      className="ml-1 font-mono text-xs text-primary underline hover:text-primary/80"
                                    >
                                      ({transaction.referenceId})
                                    </Link>
                                  )
                                }

                                return (
                                  <span className="ml-1 font-mono text-xs">
                                    ({transaction.referenceId})
                                  </span>
                                )
                              })()}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-[300px] whitespace-normal break-words">
                            {transaction.user && (
                              <span className="font-medium">{transaction.user}: </span>
                            )}
                            {transaction.notes}
                            {transaction.referenceId && (() => {
                              const match = transaction.referenceId.match(/ORD-(\d+)/)
                              const numericId = match ? match[1] : null

                              if ((transaction.type === "stock_out" || transaction.type === "return") && numericId) {
                                return (
                                  <Link
                                    href={`/orders/${numericId}`}
                                    className="ml-1 font-mono text-xs text-primary underline hover:text-primary/80"
                                  >
                                    ({transaction.referenceId})
                                  </Link>
                                )
                              }

                              return (
                                <span className="ml-1 font-mono text-xs">
                                  ({transaction.referenceId})
                                </span>
                              )
                            })()}
                          </TooltipContent>
                        </Tooltip>
                      </TableCell>
                      {showMerchantSku && (
                        <TableCell className="font-mono text-sm text-muted-foreground">
                          {transaction.merchantSku || "-"}
                        </TableCell>
                      )}
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  )
}
