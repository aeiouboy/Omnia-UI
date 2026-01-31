import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatCurrency } from "@/lib/currency-utils"
import { useMemo } from "react"
import { SettledItem } from "@/types/payment"

interface SettledItemsTableProps {
  items: SettledItem[]
  paymentAmount: number
  currency?: string
  /** Whether to show the subtotal row in the table. Defaults to true. */
  showSubtotal?: boolean
}

export function SettledItemsTable({
  items,
  paymentAmount,
  currency = 'THB',
  showSubtotal = true
}: SettledItemsTableProps) {
  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => sum + item.itemAmount, 0)
  }, [items])

  const totalQuantity = useMemo(() => {
    return items.reduce((sum, item) => sum + item.quantity, 0)
  }, [items])

  return (
    <>
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-100/50">
              <TableHead className="font-semibold text-gray-700 w-[280px]">
                Product Name
              </TableHead>
              <TableHead className="font-semibold text-gray-700 font-mono w-[120px]">
                SKU
              </TableHead>
              <TableHead className="font-semibold text-gray-700 text-center w-[60px]">
                Qty
              </TableHead>
              <TableHead className="font-semibold text-gray-700 text-right w-[100px]">
                Amount
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.lineId} className="hover:bg-gray-50">
                <TableCell>
                  <span className="font-medium text-gray-900">{item.productName}</span>
                </TableCell>
                <TableCell className="font-mono text-gray-700 text-sm">
                  {item.sku}
                </TableCell>
                <TableCell className="text-center text-gray-900">
                  {item.quantity}
                </TableCell>
                <TableCell className="text-right font-medium text-gray-900">
                  {formatCurrency(item.itemAmount)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          {showSubtotal && (
            <TableFooter>
              <TableRow className="bg-gray-100 font-semibold">
                <TableCell>Subtotal</TableCell>
                <TableCell className="text-gray-500"></TableCell>
                <TableCell className="text-center">{totalQuantity}</TableCell>
                <TableCell className="text-right">
                  {formatCurrency(subtotal)}
                </TableCell>
              </TableRow>
            </TableFooter>
          )}
        </Table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {items.map((item) => (
          <div key={item.lineId} className="bg-white border border-gray-200 rounded-md p-3 space-y-2">
            <div className="flex justify-between items-start">
              <span className="font-medium text-gray-900 flex-1 pr-2">
                {item.productName}
              </span>
              <span className="font-semibold text-gray-900 whitespace-nowrap">
                {formatCurrency(item.itemAmount)}
              </span>
            </div>
            <div className="text-sm text-gray-600">
              <span className="font-mono">{item.sku}</span>
              <span className="mx-1.5">•</span>
              <span>Qty: {item.quantity}</span>
              {item.uom && (
                <>
                  <span className="mx-1.5">•</span>
                  <span>{item.uom}</span>
                </>
              )}
            </div>
          </div>
        ))}

        {/* Mobile Subtotal Card - Only show if showSubtotal is true */}
        {showSubtotal && (
          <div className="bg-gray-100 border border-gray-300 rounded-md p-3">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-gray-900">
                Subtotal ({totalQuantity} items)
              </span>
              <span className="font-bold text-gray-900">
                {formatCurrency(subtotal)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Subtotal Validation Warning (if mismatch) - Only show if showSubtotal is true */}
      {showSubtotal && Math.abs(subtotal - paymentAmount) > 0.01 && (
        <div className="mt-2 text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded px-2 py-1">
          Note: Item subtotal ({formatCurrency(subtotal)}) differs from payment amount ({formatCurrency(paymentAmount)})
        </div>
      )}
    </>
  )
}
