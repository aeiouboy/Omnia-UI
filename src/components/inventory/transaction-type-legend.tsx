"use client"

import { Badge } from "@/components/ui/badge"
import { ArrowUp, ArrowDown, RefreshCw } from "lucide-react"

export interface TransactionTypeLegendProps {
  className?: string
}

/**
 * Transaction Type Legend Bar
 * Displays a horizontal bar explaining transaction type badges.
 * Used above transaction tables for quick reference.
 */
export function TransactionTypeLegend({ className }: TransactionTypeLegendProps) {
  return (
    <div
      className={`sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b px-4 py-2.5 flex items-center gap-6 ${className || ""}`}
      role="complementary"
      aria-label="Transaction type legend"
    >
      <span className="text-xs font-medium text-muted-foreground">Legend:</span>
      <div className="flex items-center gap-4 flex-wrap">
        <Badge
          variant="outline"
          className="bg-green-100 text-green-700 border-green-200 flex items-center gap-1 rounded-full px-3 py-1"
        >
          <ArrowUp className="h-3 w-3" aria-hidden="true" />
          <span>Stock In</span>
        </Badge>
        <Badge
          variant="outline"
          className="bg-red-100 text-red-700 border-red-200 flex items-center gap-1 rounded-full px-3 py-1"
        >
          <ArrowDown className="h-3 w-3" aria-hidden="true" />
          <span>Stock Out</span>
        </Badge>
        <Badge
          variant="outline"
          className="bg-cyan-100 text-cyan-700 border-cyan-200 flex items-center gap-1 rounded-full px-3 py-1"
        >
          <RefreshCw className="h-3 w-3" aria-hidden="true" />
          <span>Adjustment</span>
        </Badge>
      </div>
    </div>
  )
}
