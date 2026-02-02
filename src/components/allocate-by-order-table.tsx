"use client"

import Link from "next/link"
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
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { MapPin, RefreshCw, AlertCircle, Package, User, Calendar, Hash } from "lucide-react"
import type { AllocateByOrderTransaction, AllocateByOrderStatus } from "@/types/inventory"

interface AllocateByOrderTableProps {
  transactions: AllocateByOrderTransaction[]
  loading?: boolean
  error?: string | null
  onRetry?: () => void
}

/**
 * Get status badge styling based on allocation status
 */
function getStatusBadgeClass(status: AllocateByOrderStatus): string {
  switch (status) {
    case "confirmed":
      return "bg-green-100 text-green-800 border-green-200"
    case "pending":
      return "bg-yellow-100 text-yellow-800 border-yellow-200"
    case "cancelled":
      return "bg-red-100 text-red-800 border-red-200"
    default:
      return "bg-gray-100 text-gray-800 border-gray-200"
  }
}

/**
 * Get status label for display
 */
function getStatusLabel(status: AllocateByOrderStatus): string {
  switch (status) {
    case "confirmed":
      return "Confirmed"
    case "pending":
      return "Pending"
    case "cancelled":
      return "Cancelled"
    default:
      return status
  }
}

/**
 * Format date/time for display in standardized MM/DD/YYYY HH:mm:ss format
 */
function formatDateTime(timestamp: string): string {
  const date = new Date(timestamp)
  if (isNaN(date.getTime())) return "-"

  const pad = (n: number) => n.toString().padStart(2, '0')
  const month = pad(date.getMonth() + 1)
  const day = pad(date.getDate())
  const year = date.getFullYear()
  const hours = pad(date.getHours())
  const minutes = pad(date.getMinutes())
  const seconds = pad(date.getSeconds())

  return `${month}/${day}/${year} ${hours}:${minutes}:${seconds}`
}

/**
 * Loading skeleton component
 */
function LoadingSkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaction about allocate by order</CardTitle>
        <CardDescription>Stock allocations tied to customer orders</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Empty state component
 */
function EmptyState() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaction about allocate by order</CardTitle>
        <CardDescription>Stock allocations tied to customer orders</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Package className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground mb-2">
            No allocation transactions
          </h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            No stock has been allocated to orders for this item yet.
            Allocations will appear here when orders are placed.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Error state component
 */
function ErrorState({ error, onRetry }: { error: string; onRetry?: () => void }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaction about allocate by order</CardTitle>
        <CardDescription>Stock allocations tied to customer orders</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-lg font-medium text-red-700 mb-2">
            Failed to load transactions
          </h3>
          <p className="text-sm text-muted-foreground max-w-sm mb-4">
            {error}
          </p>
          {onRetry && (
            <Button variant="outline" onClick={onRetry}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Mobile card layout for a single transaction
 */
function MobileTransactionCard({ transaction }: { transaction: AllocateByOrderTransaction }) {
  return (
    <div className="p-4 border rounded-lg space-y-3">
      {/* Order ID and Status */}
      <div className="flex items-center justify-between">
        <Link
          href={`/orders/${transaction.order_id}`}
          className="font-mono text-sm text-primary underline hover:text-primary/80"
        >
          {transaction.order_no}
        </Link>
        <Badge
          variant="outline"
          className={getStatusBadgeClass(transaction.status)}
        >
          {getStatusLabel(transaction.status)}
        </Badge>
      </div>

      {/* Date and Quantity */}
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>{formatDateTime(transaction.allocated_at)}</span>
        </div>
        <div className="flex items-center gap-2">
          <Hash className="h-4 w-4 text-muted-foreground" />
          <span className="font-semibold">{transaction.quantity}</span>
        </div>
      </div>

      {/* Warehouse and User */}
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className="text-xs px-2 py-1 h-6 font-mono bg-blue-50 text-blue-700 border-blue-200"
          >
            <MapPin className="h-3 w-3 mr-1 inline" />
            {transaction.warehouse_id}
          </Badge>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <User className="h-4 w-4" />
          <span className="truncate">{transaction.allocated_by_name}</span>
        </div>
      </div>
    </div>
  )
}

/**
 * AllocateByOrderTable Component
 *
 * Displays a table of allocate-by-order transactions for an inventory item.
 * Includes responsive layout with table on desktop and cards on mobile.
 */
export function AllocateByOrderTable({
  transactions,
  loading = false,
  error,
  onRetry,
}: AllocateByOrderTableProps) {
  // Show loading skeleton
  if (loading) {
    return <LoadingSkeleton />
  }

  // Show error state
  if (error) {
    return <ErrorState error={error} onRetry={onRetry} />
  }

  // Show empty state
  if (transactions.length === 0) {
    return <EmptyState />
  }

  return (
    <TooltipProvider>
      <Card>
        <CardHeader>
          <CardTitle>Transaction about allocate by order</CardTitle>
          <CardDescription>
            Last {transactions.length} stock allocation{transactions.length !== 1 ? "s" : ""} tied to customer orders
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[140px]">Order ID</TableHead>
                  <TableHead className="w-[180px]">Allocation Date</TableHead>
                  <TableHead className="text-right w-[100px]">Quantity</TableHead>
                  <TableHead className="w-[180px]">Warehouse</TableHead>
                  <TableHead className="w-[100px]">Status</TableHead>
                  <TableHead>Allocated By</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    {/* Order ID - Clickable */}
                    <TableCell>
                      <Link
                        href={`/orders/${transaction.order_id}`}
                        className="font-mono text-sm text-primary underline hover:text-primary/80"
                      >
                        {transaction.order_no}
                      </Link>
                    </TableCell>

                    {/* Allocation Date/Time */}
                    <TableCell className="font-mono text-sm">
                      {formatDateTime(transaction.allocated_at)}
                    </TableCell>

                    {/* Quantity */}
                    <TableCell className="text-right font-semibold">
                      {transaction.quantity}
                    </TableCell>

                    {/* Warehouse */}
                    <TableCell>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Badge
                            variant="outline"
                            className="text-xs px-2 py-1 h-6 font-mono bg-blue-50 text-blue-700 border-blue-200 cursor-help"
                          >
                            <MapPin className="h-3 w-3 mr-1 inline" />
                            {transaction.warehouse_id}
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{transaction.warehouse_name}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={getStatusBadgeClass(transaction.status)}
                      >
                        {getStatusLabel(transaction.status)}
                      </Badge>
                    </TableCell>

                    {/* Allocated By */}
                    <TableCell className="text-sm text-muted-foreground">
                      {transaction.allocated_by_name}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-3">
            {transactions.map((transaction) => (
              <MobileTransactionCard
                key={transaction.id}
                transaction={transaction}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  )
}
