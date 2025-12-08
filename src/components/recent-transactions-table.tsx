/**
 * Recent Transactions Table Component
 *
 * Displays a table of recent stock transactions with color-coded transaction types.
 */

"use client"

import { useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowUp, ArrowDown, RefreshCw, AlertTriangle, RotateCcw, MapPin } from "lucide-react"
import type { StockTransaction } from "@/types/inventory"
import { formatWarehouseCode } from "@/lib/warehouse-utils"

interface RecentTransactionsTableProps {
  transactions: StockTransaction[]
  loading?: boolean
}

function getTransactionIcon(type: StockTransaction["type"]) {
  switch (type) {
    case "stock_in":
      return <ArrowUp className="h-4 w-4 text-green-600" />
    case "stock_out":
      return <ArrowDown className="h-4 w-4 text-red-600" />
    case "adjustment":
      return <RefreshCw className="h-4 w-4 text-blue-600" />
    case "spoilage":
      return <AlertTriangle className="h-4 w-4 text-orange-600" />
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
    case "spoilage":
      return "bg-orange-100 text-orange-800"
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
    case "spoilage":
      return "Spoilage"
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

export function RecentTransactionsTable({
  transactions,
  loading = false,
}: RecentTransactionsTableProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Last 10 stock movements</CardDescription>
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
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Last 10 stock movements</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            No transaction history available
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
        <CardDescription>Last {transactions.length} stock movements</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[180px]">Date & Time</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead className="text-right">Balance After</TableHead>
                <TableHead>User</TableHead>
                <TableHead className="hidden lg:table-cell">Location</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction) => (
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
                  <TableCell className="text-right font-semibold">
                    {transaction.type === "stock_out" || transaction.type === "spoilage"
                      ? `-${transaction.quantity}`
                      : `+${transaction.quantity}`}
                  </TableCell>
                  <TableCell className="text-right">
                    {transaction.balanceAfter}
                  </TableCell>
                  <TableCell className="text-sm">
                    {transaction.user}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {transaction.warehouseCode && transaction.locationCode ? (
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
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                    {transaction.notes}
                    {transaction.referenceId && (
                      <span className="ml-2 font-mono text-xs">
                        ({transaction.referenceId})
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
