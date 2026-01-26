/**
 * CSV Export Utility for Stock Card By Product View
 *
 * Exports transaction history to CSV format with metadata headers.
 */

import type { ProductTransaction, ProductTransactionType } from "./stock-card-mock-data"
import { format } from "date-fns"

/**
 * Transaction type labels for export
 */
const TRANSACTION_TYPE_LABELS: Record<ProductTransactionType, string> = {
  RECEIPT_IN: "Receipt (IN)",
  ISSUE_OUT: "Issue (OUT)",
  TRANSFER_IN: "Transfer In",
  TRANSFER_OUT: "Transfer Out",
  ADJUSTMENT_PLUS: "Adjustment (+)",
  ADJUSTMENT_MINUS: "Adjustment (-)",
  RETURN: "Return",
}

/**
 * Determine if a transaction type is inbound (increases stock)
 */
function isInboundType(type: ProductTransactionType): boolean {
  return ["RECEIPT_IN", "TRANSFER_IN", "ADJUSTMENT_PLUS", "RETURN"].includes(type)
}

/**
 * Format quantity with +/- sign
 */
function formatQuantity(type: ProductTransactionType, quantity: number): string {
  const isInbound = isInboundType(type)
  return isInbound ? `+${quantity}` : `-${quantity}`
}

/**
 * Escape CSV field (handle commas, quotes, newlines)
 */
function escapeCSVField(value: string | number): string {
  const str = String(value)
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

/**
 * Format timestamp for CSV export
 */
function formatTimestamp(timestamp: string): string {
  try {
    const date = new Date(timestamp)
    return format(date, "MMM dd, yyyy HH:mm:ss")
  } catch {
    return timestamp
  }
}

/**
 * Product info for export
 */
export interface ExportProductInfo {
  productId: string
  productName: string
}

/**
 * Date range for export
 */
export interface ExportDateRange {
  startDate: Date
  endDate: Date
}

/**
 * Export options
 */
export interface ExportOptions {
  includeMerchantSku?: boolean
}

/**
 * Export stock card transactions to CSV format
 */
export function exportStockCardToCSV(
  transactions: ProductTransaction[],
  productInfo: ExportProductInfo,
  dateRange: ExportDateRange,
  options: ExportOptions = {}
): void {
  const { includeMerchantSku = true } = options

  // Build CSV content
  const lines: string[] = []

  // Add metadata comments
  lines.push(`# Stock Card Export - Product: ${productInfo.productId}`)
  lines.push(`# Product Name: ${productInfo.productName}`)
  lines.push(
    `# Date Range: ${format(dateRange.startDate, "MMM d, yyyy")} - ${format(dateRange.endDate, "MMM d, yyyy")}`
  )
  lines.push(`# Exported: ${format(new Date(), "MMM d, yyyy HH:mm:ss")}`)
  lines.push("")

  // Add header row
  const headers = ["Date & Time", "Transaction Type", "Quantity", "Balance", "Reference No", "Notes"]
  if (includeMerchantSku) {
    headers.push("Merchant SKU")
  }
  lines.push(headers.join(","))

  // Add data rows
  for (const txn of transactions) {
    const row = [
      escapeCSVField(formatTimestamp(txn.timestamp)),
      escapeCSVField(TRANSACTION_TYPE_LABELS[txn.type]),
      escapeCSVField(formatQuantity(txn.type, txn.quantity)),
      escapeCSVField(txn.balance),
      escapeCSVField(txn.referenceNo),
      escapeCSVField(txn.notes),
    ]
    if (includeMerchantSku) {
      row.push(escapeCSVField(txn.merchantSku || "-"))
    }
    lines.push(row.join(","))
  }

  // Join all lines
  const csvContent = lines.join("\n")

  // Create and download file
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")

  // Generate filename
  const dateStr = format(new Date(), "yyyyMMdd")
  const filename = `stock-card-${productInfo.productId}-${dateStr}.csv`

  link.setAttribute("href", url)
  link.setAttribute("download", filename)
  link.style.visibility = "hidden"
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
