/**
 * Export Utility Functions
 *
 * Provides utility functions for exporting data to CSV format.
 * Used for downloading transaction history and inventory data.
 */

import type { StockTransaction, ItemType } from "@/types/inventory"
import { formatStockQuantity } from "./warehouse-utils"

/**
 * Column configuration for export
 */
export interface ExportColumn {
  key: string
  header: string
  formatter?: (value: any, row: any) => string
}

/**
 * Escape a value for CSV format
 * Handles special characters like commas, quotes, and newlines
 */
function escapeCSVValue(value: any): string {
  if (value === null || value === undefined) {
    return ""
  }

  const stringValue = String(value)

  // If the value contains comma, quote, or newline, wrap in quotes
  if (
    stringValue.includes(",") ||
    stringValue.includes('"') ||
    stringValue.includes("\n") ||
    stringValue.includes("\r")
  ) {
    // Escape double quotes by doubling them
    return `"${stringValue.replace(/"/g, '""')}"`
  }

  return stringValue
}

/**
 * Format date for export (ISO format with readable time)
 */
function formatDateForExport(timestamp: string): string {
  const date = new Date(timestamp)
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
}

/**
 * Format transaction type for display
 */
function formatTransactionType(type: StockTransaction["type"]): string {
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

/**
 * Export data to CSV format and trigger download
 *
 * @param data - Array of objects to export
 * @param filename - Name of the downloaded file (without extension)
 * @param columns - Column configuration for export
 */
export function exportToCSV<T extends Record<string, any>>(
  data: T[],
  filename: string,
  columns: ExportColumn[]
): void {
  if (data.length === 0) {
    console.warn("No data to export")
    return
  }

  // Build CSV header row
  const headers = columns.map((col) => escapeCSVValue(col.header)).join(",")

  // Build CSV data rows
  const rows = data.map((row) => {
    return columns
      .map((col) => {
        const value = row[col.key]
        const formattedValue = col.formatter ? col.formatter(value, row) : value
        return escapeCSVValue(formattedValue)
      })
      .join(",")
  })

  // Combine header and rows
  const csvContent = [headers, ...rows].join("\n")

  // Create blob and trigger download
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
  const link = document.createElement("a")
  const url = URL.createObjectURL(blob)

  link.setAttribute("href", url)
  link.setAttribute("download", `${filename}.csv`)
  link.style.visibility = "hidden"

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  // Clean up URL object
  URL.revokeObjectURL(url)
}

/**
 * Default columns for transaction export
 */
export const transactionExportColumns: ExportColumn[] = [
  {
    key: "timestamp",
    header: "Date & Time",
    formatter: (value) => formatDateForExport(value),
  },
  {
    key: "type",
    header: "Transaction Type",
    formatter: (value) => formatTransactionType(value),
  },
  {
    key: "channel",
    header: "Channel",
    formatter: (value) => value || "-",
  },
  {
    key: "quantity",
    header: "Quantity",
    formatter: (value, row) => {
      const sign = row.type === "stock_out" ? "-" : "+"
      const formatted = row.itemType
        ? formatStockQuantity(value, row.itemType, false)
        : String(value)
      return `${sign}${formatted}`
    },
  },
  {
    key: "balanceAfter",
    header: "Balance After",
    formatter: (value, row) => {
      return row.itemType
        ? formatStockQuantity(value, row.itemType, false)
        : String(value)
    },
  },
  {
    key: "warehouseCode",
    header: "Warehouse",
    formatter: (value) => value || "-",
  },
  {
    key: "locationCode",
    header: "Location",
    formatter: (value) => value || "-",
  },
  {
    key: "referenceId",
    header: "Order/Reference ID",
    formatter: (value) => value || "-",
  },
  {
    key: "notes",
    header: "Notes",
    formatter: (value) => value || "-",
  },
  {
    key: "user",
    header: "Action By",
    formatter: (value) => value || "-",
  },
]

/**
 * Export transactions to CSV
 *
 * @param transactions - Array of stock transactions
 * @param productName - Name of the product (used in filename)
 */
export function exportTransactionsToCSV(
  transactions: StockTransaction[],
  productName: string
): void {
  const filename = `transactions-${productName.replace(/[^a-zA-Z0-9]/g, "-")}-${
    new Date().toISOString().split("T")[0]
  }`

  exportToCSV(transactions, filename, transactionExportColumns)
}
