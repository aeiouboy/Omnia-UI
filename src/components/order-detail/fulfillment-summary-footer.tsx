"use client"

import { formatCurrency } from "@/lib/currency-utils"

interface FulfillmentSummaryFooterProps {
  itemCount: number
  totalAmount: number
}

/**
 * Footer component for Version 4 Fulfillment Tab
 * Layout: [X items] on left, [Total: ฿X,XXX] on right
 * Includes horizontal separator line above
 */
export function FulfillmentSummaryFooter({
  itemCount,
  totalAmount,
}: FulfillmentSummaryFooterProps) {
  return (
    <div className="border-t pt-4 mt-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {itemCount} {itemCount === 1 ? 'item' : 'items'}
        </span>
        <span className="text-base font-semibold text-gray-900 dark:text-gray-100">
          Total: {formatCurrency(totalAmount)}
        </span>
      </div>
    </div>
  )
}
