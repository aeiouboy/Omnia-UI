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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Download, Search } from "lucide-react"
import Link from "next/link"
import type { StockTransaction, TransactionType } from "@/types/inventory"
import type { ViewTypeChannel } from "@/types/view-type-config"
import { formatStockQuantity } from "@/lib/warehouse-utils"
import { exportTransactionsToCSV } from "@/lib/export-utils"

// Full transaction type configuration for all 5 types
const transactionTypeConfig: Record<TransactionType, {
  badgeClass: string
  label: string
  quantityClass: string
  quantitySign: "+" | "-"
}> = {
  "Initial sync": {
    badgeClass: "bg-green-100 text-green-700 border-green-200",
    label: "Initial sync",
    quantityClass: "text-green-600",
    quantitySign: "+",
  },
  "Order Ship": {
    badgeClass: "bg-red-100 text-red-700 border-red-200",
    label: "Order Ship",
    quantityClass: "text-red-600",
    quantitySign: "-",
  },
  "Adjust In": {
    badgeClass: "bg-blue-100 text-blue-700 border-blue-200",
    label: "Adjust In",
    quantityClass: "text-green-600",
    quantitySign: "+",
  },
  "Adjust out": {
    badgeClass: "bg-blue-100 text-blue-700 border-blue-200",
    label: "Adjust out",
    quantityClass: "text-red-600",
    quantitySign: "-",
  },
  "Replacement": {
    badgeClass: "bg-purple-100 text-purple-700 border-purple-200",
    label: "Replacement",
    quantityClass: "text-purple-600",
    quantitySign: "+",
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
  const [typeFilter, setTypeFilter] = useState<"all" | "Initial sync" | "Adjust In" | "Adjust out" | "Replacement" | "Order Ship">("all")
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
      exportTransactionsToCSV(filteredTransactions, productName, { includeMerchantSku: false })
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
              <SelectTrigger className="w-[160px] h-9">
                <SelectValue placeholder="All Transaction Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Transaction Types</SelectItem>
                <SelectItem value="Initial sync">Initial sync</SelectItem>
                <SelectItem value="Adjust In">Adjust In</SelectItem>
                <SelectItem value="Adjust out">Adjust out</SelectItem>
                <SelectItem value="Replacement">Replacement</SelectItem>
                <SelectItem value="Order Ship">Order Ship</SelectItem>
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
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map((transaction) => {
                  const config = transactionTypeConfig[transaction.type]

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
                        {config.quantitySign}
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

                                if (transaction.type === "Order Ship" && numericId) {
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

                              if (transaction.type === "Order Ship" && numericId) {
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
