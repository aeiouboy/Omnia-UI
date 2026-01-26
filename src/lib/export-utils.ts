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
    case "transfer":
      return "Transfer"
    case "allocation":
      return "Allocation"
    default:
      return type
  }
}

/**
 * Format date in GMT+7 timezone for export
 */
function formatDateGMT7ForExport(timestamp: string): string {
  const date = new Date(timestamp)
  return date.toLocaleString("en-US", {
    timeZone: "Asia/Bangkok",
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
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
 * Default columns for transaction export (aligned with Recent Transactions table structure)
 */
export const transactionExportColumns: ExportColumn[] = [
  {
    key: "timestamp",
    header: "Date & Time",
    formatter: (value) => formatDateForExport(value),
  },
  {
    key: "type",
    header: "Type",
    formatter: (value) => formatTransactionType(value),
  },
  {
    key: "quantity",
    header: "Qty",
    formatter: (value, row) => {
      const sign = row.type === "stock_out" || row.type === "allocation" ? "-" : "+"
      const formatted = row.itemType
        ? formatStockQuantity(value, row.itemType, false)
        : String(value)
      return `${sign}${formatted}`
    },
  },
  {
    key: "balanceAfter",
    header: "Balance",
    formatter: (value, row) => {
      return row.itemType
        ? formatStockQuantity(value, row.itemType, false)
        : String(value)
    },
  },
  {
    key: "notes",
    header: "Notes",
    formatter: (value, row) => {
      const parts: string[] = []
      if (row.user) parts.push(`${row.user}:`)
      if (value) parts.push(value)
      if (row.referenceId) parts.push(`(${row.referenceId})`)
      return parts.join(" ") || "-"
    },
  },
]

/**
 * Merchant SKU column for conditional inclusion in export
 */
const merchantSkuColumn: ExportColumn = {
  key: "merchantSku",
  header: "Merchant SKU",
  formatter: (value) => value || "-",
}

/**
 * Export options for transactions CSV
 */
export interface TransactionExportOptions {
  includeMerchantSku?: boolean
}

/**
 * Export transactions to CSV
 *
 * @param transactions - Array of stock transactions
 * @param productName - Name of the product (used in filename)
 * @param options - Export options (e.g., includeMerchantSku)
 */
export function exportTransactionsToCSV(
  transactions: StockTransaction[],
  productName: string,
  options?: TransactionExportOptions
): void {
  const filename = `transactions-${productName.replace(/[^a-zA-Z0-9]/g, "-")}-${
    new Date().toISOString().split("T")[0]
  }`

  // Build columns based on options
  const columns = [...transactionExportColumns]
  if (options?.includeMerchantSku) {
    columns.push(merchantSkuColumn)
  }

  exportToCSV(transactions, filename, columns)
}

/**
 * Extended columns for full transaction history export (includes transfer/allocation fields)
 */
export const transactionHistoryExportColumns: ExportColumn[] = [
  {
    key: "timestamp",
    header: "Date & Time (GMT+7)",
    formatter: (value) => formatDateGMT7ForExport(value),
  },
  {
    key: "type",
    header: "Transaction Type",
    formatter: (value) => formatTransactionType(value),
  },
  {
    key: "referenceId",
    header: "Reference No",
    formatter: (value) => value || "-",
  },
  {
    key: "quantity",
    header: "Quantity",
    formatter: (value, row) => {
      // Determine sign based on transaction type
      let sign = "+"
      if (row.type === "stock_out" || row.type === "transfer" || row.type === "allocation") {
        sign = "-"
      }
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
    key: "transferFrom",
    header: "Transfer From",
    formatter: (value) => value || "-",
  },
  {
    key: "transferTo",
    header: "Transfer To",
    formatter: (value) => value || "-",
  },
  {
    key: "allocationType",
    header: "Allocation Type",
    formatter: (value) => {
      if (!value) return "-"
      switch (value) {
        case "order":
          return "Order"
        case "hold":
          return "Hold"
        case "reserve":
          return "Reserve"
        default:
          return value
      }
    },
  },
  {
    key: "channel",
    header: "Channel",
    formatter: (value) => value || "-",
  },
  {
    key: "user",
    header: "User",
    formatter: (value) => value || "-",
  },
  {
    key: "notes",
    header: "Notes",
    formatter: (value) => value || "-",
  },
]

/**
 * Export transactions to Excel-compatible CSV format with BOM for proper encoding
 * This ensures Excel correctly interprets UTF-8 characters
 *
 * @param transactions - Array of stock transactions
 * @param productName - Name of the product (used in filename)
 */
export function exportTransactionsToExcel(
  transactions: StockTransaction[],
  productName: string
): void {
  if (transactions.length === 0) {
    console.warn("No transactions to export")
    return
  }

  const filename = `transaction-history-${productName.replace(/[^a-zA-Z0-9]/g, "-")}-${
    new Date().toISOString().split("T")[0]
  }`

  // Build CSV header row
  const headers = transactionHistoryExportColumns.map((col) => escapeCSVValue(col.header)).join(",")

  // Build CSV data rows
  const rows = transactions.map((row) => {
    return transactionHistoryExportColumns
      .map((col) => {
        const value = (row as any)[col.key]
        const formattedValue = col.formatter ? col.formatter(value, row) : value
        return escapeCSVValue(formattedValue)
      })
      .join(",")
  })

  // Combine header and rows
  const csvContent = [headers, ...rows].join("\n")

  // Add BOM (Byte Order Mark) for Excel UTF-8 compatibility
  const BOM = "\uFEFF"
  const csvWithBOM = BOM + csvContent

  // Create blob with UTF-8 encoding and trigger download
  const blob = new Blob([csvWithBOM], { type: "text/csv;charset=utf-8;" })
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
 * Platform-level export row interface
 */
export interface PlatformExportRow {
  date: string
  channel: 'TOL' | 'MKP'
  platform: string
  orderCount: number
  revenue: number
}

/**
 * Export Order Analysis data to CSV with platform-level breakdown
 *
 * @param data - Platform-level export data
 * @param startDate - Start date for filename (YYYY-MM-DD format)
 * @param endDate - End date for filename (YYYY-MM-DD format)
 */
export function exportOrderAnalysisToCSV(
  data: PlatformExportRow[],
  startDate: string,
  endDate: string
): void {
  if (data.length === 0) {
    console.warn("No data to export")
    return
  }

  // CSV header row with new column structure
  const headers = "Date,Channel,Platform,Order Count,Revenue"

  // Build CSV data rows with proper formatting
  // - Date: YYYY-MM-DD (no escaping needed)
  // - Channel: TOL or MKP (no escaping needed)
  // - Platform: e.g., "Standard Delivery", "Shopee" (no commas in our data)
  // - Order Count: integer (no formatting, no commas)
  // - Revenue: decimal with 2 decimal places (no thousands separators)
  const rows = data.map(row => {
    const formattedDate = row.date
    const channel = row.channel
    const platform = row.platform
    const orderCount = row.orderCount  // Raw integer, no formatting
    const revenue = row.revenue.toFixed(2)  // Decimal with 2 places, no commas

    return `${formattedDate},${channel},${platform},${orderCount},${revenue}`
  })

  // Combine header and rows
  const csvContent = [headers, ...rows].join("\n")

  // Add BOM (Byte Order Mark) for Excel UTF-8 compatibility
  const BOM = "\uFEFF"
  const csvWithBOM = BOM + csvContent

  // Create blob with UTF-8 encoding and trigger download
  const blob = new Blob([csvWithBOM], { type: "text/csv;charset=utf-8;" })
  const link = document.createElement("a")
  const url = URL.createObjectURL(blob)

  // Filename pattern: order-analysis-{startDate}-to-{endDate}.csv
  const filename = `order-analysis-${startDate}-to-${endDate}.csv`

  link.setAttribute("href", url)
  link.setAttribute("download", filename)
  link.style.visibility = "hidden"

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  // Clean up URL object
  URL.revokeObjectURL(url)
}
