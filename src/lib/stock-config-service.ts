/**
 * Stock Configuration Service Layer
 *
 * Provides data fetching and manipulation functions for stock configuration management.
 * Supports file parsing (CSV/Excel), validation, and CRUD operations.
 * Uses mock data for development following the same pattern as inventory-service.ts.
 */

import * as XLSX from "xlsx"
import type {
  StockConfigItem,
  StockConfigFile,
  StockConfigFilters,
  StockConfigDataResponse,
  FileHistoryResponse,
  ValidationResult,
  ParsedStockConfigRow,
  FileParseResult,
  SupplyTypeID,
  Frequency,
  Channel,
  ProcessingResult,
  PreSubmissionValidationResult,
  ErrorCode,
  ErrorSeverity,
} from "@/types/stock-config"

// ============================================================================
// Mock Data
// ============================================================================

/**
 * Mock stock configuration items for development
 * Updated to use business spec values: "PreOrder", "On Hand Available", "One-time", "Daily"
 * Includes datetime format for testing
 */
const mockStockConfigs: StockConfigItem[] = [
  {
    id: "SC001",
    locationId: "CFM6686",
    itemId: "48705813",
    quantity: 100,
    supplyTypeId: "PreOrder",
    frequency: "One-time",
    channel: "TOL",
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z",
  },
  {
    id: "SC002",
    locationId: "CFM7234",
    itemId: "48705814",
    quantity: 50,
    supplyTypeId: "On Hand Available",
    frequency: "Daily",
    channel: "MKP",
    startDate: "2024-01-20 10:00:00",
    endDate: "2024-02-20 18:00:00",
    createdAt: "2024-01-16T11:00:00Z",
    updatedAt: "2024-01-16T11:00:00Z",
  },
  {
    id: "SC003",
    locationId: "CFM8901",
    itemId: "48705815",
    quantity: 200,
    supplyTypeId: "PreOrder",
    frequency: "One-time",
    channel: "QC",
    createdAt: "2024-01-17T09:00:00Z",
    updatedAt: "2024-01-17T09:00:00Z",
  },
  {
    id: "SC004",
    locationId: "CFM4521",
    itemId: "48705816",
    quantity: 999999,
    supplyTypeId: "On Hand Available",
    frequency: "Daily",
    channel: "TOL",
    startDate: "2024-01-01 00:00:00",
    endDate: "2024-12-31 23:59:59",
    createdAt: "2024-01-18T14:00:00Z",
    updatedAt: "2024-01-18T14:00:00Z",
  },
  {
    id: "SC005",
    locationId: "CFM3345",
    itemId: "48705817",
    quantity: 75,
    supplyTypeId: "PreOrder",
    frequency: "One-time",
    channel: "MKP",
    createdAt: "2024-01-19T08:00:00Z",
    updatedAt: "2024-01-19T08:00:00Z",
  },
]

/**
 * Mock file history for development
 */
const mockFileHistory: StockConfigFile[] = [
  {
    id: "FILE001",
    filename: "stock_config_jan_2024.csv",
    status: "processed",
    uploadDate: "2024-01-15T10:00:00Z",
    recordCount: 150,
    validRecords: 148,
    invalidRecords: 2,
    folder: "arch",
    uploadedBy: "Sarah Johnson",
  },
  {
    id: "FILE002",
    filename: "preorder_batch_001.xlsx",
    status: "processed",
    uploadDate: "2024-01-16T14:30:00Z",
    recordCount: 50,
    validRecords: 50,
    invalidRecords: 0,
    folder: "arch",
    uploadedBy: "Mike Chen",
  },
  {
    id: "FILE003",
    filename: "onhand_override_feb.csv",
    status: "error",
    uploadDate: "2024-01-17T09:15:00Z",
    recordCount: 25,
    validRecords: 10,
    invalidRecords: 15,
    folder: "err",
    errorMessage: "Too many validation errors",
    uploadedBy: "Alex Rodriguez",
  },
  {
    id: "FILE004",
    filename: "safety_stock_update.xlsx",
    status: "pending",
    uploadDate: "2024-01-18T16:00:00Z",
    recordCount: 80,
    validRecords: 0,
    invalidRecords: 0,
    folder: "pending",
    uploadedBy: "Current User",
  },
]

// ============================================================================
// File Parsing Functions
// ============================================================================

/**
 * Parse a CSV or Excel file and extract stock configuration data
 */
export async function parseStockConfigFile(file: File): Promise<FileParseResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const data = e.target?.result
        if (!data) {
          throw new Error("Failed to read file")
        }

        // Parse the file using xlsx library
        const workbook = XLSX.read(data, { type: "binary" })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        const jsonData = XLSX.utils.sheet_to_json<unknown[]>(worksheet, { header: 1 })

        // First row is headers
        const firstRow = jsonData[0]
        const headers = (Array.isArray(firstRow) ? firstRow.map(h => String(h ?? "")) : []) as string[]
        const dataRows = jsonData.slice(1)

        // Map headers to expected field names (case-insensitive)
        const headerMap = mapHeaders(headers)

        // Parse each row
        const parsedRows: ParsedStockConfigRow[] = dataRows
          .filter((row) => Array.isArray(row) && row.some((cell) => cell !== null && cell !== undefined && cell !== ""))
          .map((row, index) => parseRow(row as unknown[], headerMap, index + 2)) // +2 for 1-based row numbering and header row

        // Aggregate validation results
        const allErrors: ValidationResult[] = []
        const allWarnings: ValidationResult[] = []
        let validCount = 0
        let invalidCount = 0

        parsedRows.forEach((row) => {
          if (row.isValid) {
            validCount++
          } else {
            invalidCount++
          }
          allErrors.push(...row.errors)
          allWarnings.push(...row.warnings)
        })

        resolve({
          filename: file.name,
          totalRows: parsedRows.length,
          validRows: validCount,
          invalidRows: invalidCount,
          rows: parsedRows,
          errors: allErrors,
          warnings: allWarnings,
        })
      } catch (error) {
        reject(new Error(`Failed to parse file: ${error instanceof Error ? error.message : "Unknown error"}`))
      }
    }

    reader.onerror = () => {
      reject(new Error("Failed to read file"))
    }

    reader.readAsBinaryString(file)
  })
}

/**
 * Map header names to expected field names (case-insensitive matching)
 * Supports business spec column names: ItemId, LocationId, SupplyTypeId, Frequency, StartDate, EndDate
 */
function mapHeaders(headers: string[]): Record<string, number> {
  const headerMap: Record<string, number> = {}
  const fieldMappings: Record<string, string[]> = {
    locationId: ["locationid", "location_id", "location", "loc_id"],
    itemId: ["itemid", "item_id", "item", "product_id", "productid"],
    quantity: ["quantity", "qty", "amount"],
    supplyTypeId: ["supplytypeid", "supply_type_id", "supplytype", "supply_type", "type"],
    frequency: ["frequency", "freq"],
    channel: ["channel", "channel_code", "channelcode", "sales_channel"],
    startDate: ["startdate", "start_date", "start"],
    endDate: ["enddate", "end_date", "end"],
  }

  headers.forEach((header, index) => {
    const normalizedHeader = header?.toString().toLowerCase().replace(/\s+/g, "_") || ""
    for (const [fieldName, aliases] of Object.entries(fieldMappings)) {
      if (aliases.includes(normalizedHeader)) {
        headerMap[fieldName] = index
        break
      }
    }
  })

  return headerMap
}

/**
 * Convert Excel serial date number to datetime string
 * Excel serial dates count days since 1899-12-30 (Excel's epoch)
 */
function excelSerialToDateString(serial: number): string {
  // Excel epoch starts at 1899-12-30 (day 0)
  // But Excel has a bug where it thinks 1900 is a leap year, so we adjust
  const excelEpoch = new Date(Date.UTC(1899, 11, 30))
  const millisecondsPerDay = 24 * 60 * 60 * 1000

  // Handle the Excel 1900 leap year bug (serial dates > 60 are off by 1)
  const adjustedSerial = serial > 60 ? serial - 1 : serial

  const date = new Date(excelEpoch.getTime() + adjustedSerial * millisecondsPerDay)

  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  const day = String(date.getUTCDate()).padStart(2, '0')
  const hours = String(date.getUTCHours()).padStart(2, '0')
  const minutes = String(date.getUTCMinutes()).padStart(2, '0')
  const seconds = String(date.getUTCSeconds()).padStart(2, '0')

  // If time is 00:00:00, return date-only format
  if (hours === '00' && minutes === '00' && seconds === '00') {
    return `${year}-${month}-${day}`
  }

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

/**
 * Parse a single row of data
 */
function parseRow(
  row: unknown[],
  headerMap: Record<string, number>,
  rowNumber: number
): ParsedStockConfigRow {
  const errors: ValidationResult[] = []
  const warnings: ValidationResult[] = []

  const getValue = (field: string): string => {
    const index = headerMap[field]
    if (index === undefined) return ""
    const value = row[index]
    if (value === null || value === undefined) return ""

    // Handle Excel serial date numbers for date fields
    if ((field === 'startDate' || field === 'endDate') && typeof value === 'number') {
      return excelSerialToDateString(value)
    }

    // Normalize whitespace in string values (handle potential parsing issues)
    return String(value).replace(/\s+/g, ' ').trim()
  }

  const locationId = getValue("locationId")
  const itemId = getValue("itemId")
  const quantityStr = getValue("quantity")
  const supplyTypeId = getValue("supplyTypeId")
  const frequency = getValue("frequency")
  const channel = getValue("channel")
  const startDate = getValue("startDate")
  const endDate = getValue("endDate")

  // Parse numeric values
  const quantity = quantityStr ? parseInt(quantityStr, 10) : null

  // Validate required fields
  if (!locationId) {
    errors.push({ row: rowNumber, field: "locationId", value: "", message: "LocationID is required", severity: "error" })
  }

  if (!itemId) {
    errors.push({ row: rowNumber, field: "itemId", value: "", message: "ItemID is required", severity: "error" })
  }

  if (quantity === null || isNaN(quantity)) {
    errors.push({ row: rowNumber, field: "quantity", value: quantityStr, message: "Quantity must be a valid number", severity: "error" })
  } else if (quantity < 0) {
    errors.push({ row: rowNumber, field: "quantity", value: quantityStr, message: "Quantity cannot be negative", severity: "error" })
  }

  // Validate supply type (business spec: "PreOrder" and "On Hand Available")
  const validSupplyTypes: SupplyTypeID[] = ["PreOrder", "On Hand Available", "Preorder", "OnHand"]
  if (!supplyTypeId) {
    errors.push({ row: rowNumber, field: "supplyTypeId", value: "", message: "SupplyTypeID is required", severity: "error" })
  } else if (!validSupplyTypes.includes(supplyTypeId as SupplyTypeID)) {
    errors.push({ row: rowNumber, field: "supplyTypeId", value: supplyTypeId, message: "SupplyTypeID must be 'PreOrder' or 'On Hand Available'", severity: "error" })
  }

  // Validate frequency (business spec: "One-time" and "Daily")
  const validFrequencies: Frequency[] = ["One-time", "Daily", "Onetime"]
  if (!frequency) {
    errors.push({ row: rowNumber, field: "frequency", value: "", message: "Frequency is required", severity: "error" })
  } else if (!validFrequencies.includes(frequency as Frequency)) {
    errors.push({ row: rowNumber, field: "frequency", value: frequency, message: "Frequency must be 'One-time' or 'Daily'", severity: "error" })
  }

  // Validate channel if provided (TOL, MKP, QC)
  const validChannels: Channel[] = ["TOL", "MKP", "QC"]
  if (channel && !validChannels.includes(channel as Channel)) {
    errors.push({ row: rowNumber, field: "channel", value: channel, message: "Channel must be 'TOL', 'MKP', or 'QC'", severity: "error" })
  }

  // Validate date fields for OnHand/On Hand Available type
  if (supplyTypeId === "OnHand" || supplyTypeId === "On Hand Available") {
    if (!startDate) {
      warnings.push({ row: rowNumber, field: "startDate", value: "", message: "StartDate is recommended for On Hand Available type", severity: "warning" })
    } else if (!isValidDate(startDate)) {
      errors.push({ row: rowNumber, field: "startDate", value: startDate, message: "StartDate must be a valid date (YYYY-MM-DD or YYYY-MM-DD HH:MM:SS)", severity: "error" })
    }

    if (!endDate) {
      warnings.push({ row: rowNumber, field: "endDate", value: "", message: "EndDate is recommended for On Hand Available type", severity: "warning" })
    } else if (!isValidDate(endDate)) {
      errors.push({ row: rowNumber, field: "endDate", value: endDate, message: "EndDate must be a valid date (YYYY-MM-DD or YYYY-MM-DD HH:MM:SS)", severity: "error" })
    }

    // Validate date range
    if (startDate && endDate && isValidDate(startDate) && isValidDate(endDate)) {
      if (new Date(startDate) > new Date(endDate)) {
        errors.push({ row: rowNumber, field: "endDate", value: endDate, message: "EndDate must be after StartDate", severity: "error" })
      }
    }
  }

  return {
    rowNumber,
    locationId,
    itemId,
    quantity,
    supplyTypeId,
    frequency,
    channel,
    startDate,
    endDate,
    isValid: errors.length === 0,
    errors,
    warnings,
  }
}

/**
 * Validate date string format
 * Supports both formats:
 * - YYYY-MM-DD (date only)
 * - YYYY-MM-DD HH:MM:SS (datetime with time component)
 */
function isValidDate(dateStr: string): boolean {
  // Match either date-only or datetime format
  const dateOnlyRegex = /^\d{4}-\d{2}-\d{2}$/
  const dateTimeRegex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/

  if (!dateOnlyRegex.test(dateStr) && !dateTimeRegex.test(dateStr)) {
    return false
  }

  // Parse and validate the date
  const date = new Date(dateStr)
  return !isNaN(date.getTime())
}

// ============================================================================
// Data Validation Functions
// ============================================================================

/**
 * Validate an array of stock configuration items
 */
export function validateStockConfigData(
  items: Partial<StockConfigItem>[]
): ValidationResult[] {
  const results: ValidationResult[] = []

  items.forEach((item, index) => {
    const row = index + 1

    if (!item.locationId) {
      results.push({ row, field: "locationId", value: "", message: "LocationID is required", severity: "error" })
    }

    if (!item.itemId) {
      results.push({ row, field: "itemId", value: "", message: "ItemID is required", severity: "error" })
    }

    if (item.quantity === undefined || item.quantity === null) {
      results.push({ row, field: "quantity", value: "", message: "Quantity is required", severity: "error" })
    } else if (item.quantity < 0) {
      results.push({ row, field: "quantity", value: String(item.quantity), message: "Quantity cannot be negative", severity: "error" })
    }

    if (!item.supplyTypeId) {
      results.push({ row, field: "supplyTypeId", value: "", message: "SupplyTypeID is required", severity: "error" })
    }

    if (!item.frequency) {
      results.push({ row, field: "frequency", value: "", message: "Frequency is required", severity: "error" })
    }
  })

  return results
}

// ============================================================================
// CRUD Operations
// ============================================================================

/**
 * Fetch stock configurations with filtering and pagination
 */
export async function getStockConfigs(
  filters?: StockConfigFilters
): Promise<StockConfigDataResponse> {
  const page = filters?.page || 1
  const pageSize = filters?.pageSize || 25

  // Apply filters to mock data
  let filtered = [...mockStockConfigs]

  if (filters?.supplyType && filters.supplyType !== "all") {
    filtered = filtered.filter((item) => item.supplyTypeId === filters.supplyType)
  }

  if (filters?.frequency && filters.frequency !== "all") {
    filtered = filtered.filter((item) => item.frequency === filters.frequency)
  }

  if (filters?.channel && filters.channel !== "all") {
    filtered = filtered.filter((item) => item.channel === filters.channel)
  }

  if (filters?.locationIdFilter) {
    const query = filters.locationIdFilter.toLowerCase()
    filtered = filtered.filter((item) =>
      item.locationId.toLowerCase().includes(query)
    )
  }

  if (filters?.itemIdFilter) {
    const query = filters.itemIdFilter.toLowerCase()
    filtered = filtered.filter((item) =>
      item.itemId.toLowerCase().includes(query)
    )
  }

  if (filters?.searchQuery) {
    const query = filters.searchQuery.toLowerCase()
    filtered = filtered.filter(
      (item) =>
        item.locationId.toLowerCase().includes(query) ||
        item.itemId.toLowerCase().includes(query)
    )
  }

  // Apply sorting
  if (filters?.sortBy) {
    filtered.sort((a, b) => {
      const aVal = a[filters.sortBy!]
      const bVal = b[filters.sortBy!]

      if (typeof aVal === "string" && typeof bVal === "string") {
        return filters.sortOrder === "asc"
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal)
      }

      if (typeof aVal === "number" && typeof bVal === "number") {
        return filters.sortOrder === "asc" ? aVal - bVal : bVal - aVal
      }

      return 0
    })
  }

  // Apply pagination
  const total = filtered.length
  const totalPages = Math.ceil(total / pageSize)
  const from = (page - 1) * pageSize
  const to = from + pageSize
  const items = filtered.slice(from, to)

  // Simulate async operation
  await new Promise((resolve) => setTimeout(resolve, 100))

  return {
    items,
    total,
    page,
    pageSize,
    totalPages,
  }
}

/**
 * Save validated stock configuration items
 */
export async function saveStockConfig(
  items: Omit<StockConfigItem, "id" | "createdAt" | "updatedAt">[]
): Promise<StockConfigItem[]> {
  // Simulate async operation
  await new Promise((resolve) => setTimeout(resolve, 500))

  const now = new Date().toISOString()
  const savedItems: StockConfigItem[] = items.map((item, index) => ({
    ...item,
    id: `SC${Date.now()}-${index}`,
    createdAt: now,
    updatedAt: now,
  }))

  // In a real implementation, this would save to the database
  console.info("Saved stock configurations:", savedItems.length)

  return savedItems
}

/**
 * Delete a stock configuration by ID
 */
export async function deleteStockConfig(id: string): Promise<boolean> {
  // Simulate async operation
  await new Promise((resolve) => setTimeout(resolve, 200))

  // In a real implementation, this would delete from the database
  console.info("Deleted stock configuration:", id)

  return true
}

// ============================================================================
// File History Operations
// ============================================================================

/**
 * Get file upload history
 */
export async function getFileHistory(
  folder?: "pending" | "arch" | "err" | "all"
): Promise<FileHistoryResponse> {
  // Simulate async operation
  await new Promise((resolve) => setTimeout(resolve, 100))

  let files = [...mockFileHistory]

  if (folder && folder !== "all") {
    files = files.filter((file) => file.folder === folder)
  }

  // Sort by upload date descending
  files.sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime())

  return {
    files,
    total: files.length,
  }
}

/**
 * Archive a processed file (move to arch/ folder)
 */
export async function archiveFile(fileId: string): Promise<boolean> {
  // Simulate async operation
  await new Promise((resolve) => setTimeout(resolve, 200))

  // In a real implementation, this would update the file status in the database
  console.info("Archived file:", fileId)

  return true
}

/**
 * Mark a file as error (move to err/ folder)
 */
export async function markFileError(fileId: string, errorMessage: string): Promise<boolean> {
  // Simulate async operation
  await new Promise((resolve) => setTimeout(resolve, 200))

  // In a real implementation, this would update the file status in the database
  console.info("Marked file as error:", fileId, errorMessage)

  return true
}

/**
 * Create a file record for a new upload
 */
export async function createFileRecord(
  filename: string,
  recordCount: number,
  validRecords: number,
  invalidRecords: number,
  uploadedBy?: string
): Promise<StockConfigFile> {
  // Simulate async operation
  await new Promise((resolve) => setTimeout(resolve, 100))

  const file: StockConfigFile = {
    id: `FILE${Date.now()}`,
    filename,
    status: invalidRecords === 0 ? "validated" : "pending",
    uploadDate: new Date().toISOString(),
    recordCount,
    validRecords,
    invalidRecords,
    folder: "pending",
    uploadedBy,
  }

  // In a real implementation, this would save to the database
  console.info("Created file record:", file)

  return file
}

// ============================================================================
// DaaS Line-by-Line Processing Functions
// ============================================================================

/**
 * Mock valid items list for simulating backend validation
 * Uses numeric ItemId format matching actual file schema
 */
const VALID_ITEMS = [
  "48705813", "48705814", "48705815", "48705816", "48705817",
  "48705818", "48705819", "48705820", "48705821", "48705822",
  "ITEM001", "ITEM002", "ITEM003", "ITEM004", "ITEM005",
  "ITEM006", "ITEM007", "ITEM008", "ITEM009", "ITEM010",
]

/**
 * Mock valid locations list for simulating backend validation
 */
const VALID_LOCATIONS = [
  "LOC001", "LOC002", "LOC003", "LOC004", "LOC005",
  "LOC006", "LOC007", "LOC008", "LOC009", "LOC010",
  "STORE001", "STORE002", "STORE003", "STORE004", "STORE005",
  "WH001", "WH002", "WH003",
]

/**
 * Mock existing configurations to check for duplicates
 */
const EXISTING_CONFIGS: Array<{ itemId: string; locationId: string; startDate?: string; endDate?: string }> = [
  { itemId: "ITEM001", locationId: "LOC001", startDate: "2024-01-01", endDate: "2024-06-30" },
  { itemId: "ITEM002", locationId: "LOC002", startDate: "2024-02-01", endDate: "2024-07-31" },
]

/**
 * Error message templates mapping error codes to human-readable messages
 * Updated to reflect business spec values
 */
export const ERROR_MESSAGE_TEMPLATES: Record<ErrorCode, { template: string; severity: ErrorSeverity }> = {
  ITEM_NOT_FOUND: { template: "Item [{0}] does not exist in the system", severity: "critical" },
  LOCATION_NOT_FOUND: { template: "Location [{0}] is not valid", severity: "critical" },
  INVALID_DATE_FORMAT: { template: "Date must be in YYYY-MM-DD or YYYY-MM-DD HH:MM:SS format", severity: "critical" },
  DATE_RANGE_INVALID: { template: "End Date must be after Start Date", severity: "critical" },
  DUPLICATE_CONFIG: { template: "A configuration for this Item+Location already exists for the specified period", severity: "critical" },
  MISSING_REQUIRED_FIELD: { template: "Field [{0}] is required", severity: "critical" },
  INVALID_SUPPLY_TYPE: { template: "Supply Type must be PreOrder or On Hand Available", severity: "critical" },
  INVALID_FREQUENCY: { template: "Frequency must be One-time or Daily", severity: "critical" },
  QUANTITY_INVALID: { template: "Quantity must be a positive number", severity: "critical" },
  INVALID_CHANNEL: { template: "Channel must be TOL, MKP, or QC", severity: "critical" },
}

/**
 * Translate error code to human-readable message with parameters
 */
export function getErrorMessage(errorCode: ErrorCode, params?: string[]): string {
  const template = ERROR_MESSAGE_TEMPLATES[errorCode]?.template || "Unknown error"
  if (!params || params.length === 0) return template

  return params.reduce((msg, param, index) => {
    return msg.replace(`[{${index}}]`, param)
  }, template)
}

/**
 * Get error severity for an error code
 */
export function getErrorSeverity(errorCode: ErrorCode): ErrorSeverity {
  return ERROR_MESSAGE_TEMPLATES[errorCode]?.severity || "critical"
}

/**
 * Pre-submission validation for frontend
 * Validates mandatory fields, date formats, numeric values, supply type/frequency
 */
export function validateFilePreSubmission(rows: ParsedStockConfigRow[]): PreSubmissionValidationResult {
  const errors: ValidationResult[] = []
  const warnings: ValidationResult[] = []
  let validCount = 0
  let invalidCount = 0

  rows.forEach((row) => {
    const rowErrors: ValidationResult[] = []

    // Check mandatory fields
    if (!row.locationId) {
      rowErrors.push({ row: row.rowNumber, field: "locationId", value: "", message: getErrorMessage("MISSING_REQUIRED_FIELD", ["LocationID"]), severity: "error" })
    }
    if (!row.itemId) {
      rowErrors.push({ row: row.rowNumber, field: "itemId", value: "", message: getErrorMessage("MISSING_REQUIRED_FIELD", ["ItemID"]), severity: "error" })
    }

    // Validate quantity
    if (row.quantity === null || isNaN(row.quantity)) {
      rowErrors.push({ row: row.rowNumber, field: "quantity", value: String(row.quantity), message: getErrorMessage("QUANTITY_INVALID"), severity: "error" })
    } else if (row.quantity < 0) {
      rowErrors.push({ row: row.rowNumber, field: "quantity", value: String(row.quantity), message: "Quantity cannot be negative", severity: "error" })
    }

    // Validate supply type (business spec: "PreOrder" and "On Hand Available")
    if (!row.supplyTypeId || !["PreOrder", "On Hand Available", "Preorder", "OnHand"].includes(row.supplyTypeId)) {
      rowErrors.push({ row: row.rowNumber, field: "supplyTypeId", value: row.supplyTypeId, message: getErrorMessage("INVALID_SUPPLY_TYPE"), severity: "error" })
    }

    // Validate frequency (business spec: "One-time" and "Daily")
    if (!row.frequency || !["One-time", "Daily", "Onetime"].includes(row.frequency)) {
      rowErrors.push({ row: row.rowNumber, field: "frequency", value: row.frequency, message: getErrorMessage("INVALID_FREQUENCY"), severity: "error" })
    }

    // Validate channel if provided (TOL, MKP, QC)
    if (row.channel && !["TOL", "MKP", "QC"].includes(row.channel)) {
      rowErrors.push({ row: row.rowNumber, field: "channel", value: row.channel, message: getErrorMessage("INVALID_CHANNEL"), severity: "error" })
    }

    // Validate date format for OnHand/On Hand Available type (supports both YYYY-MM-DD and YYYY-MM-DD HH:MM:SS)
    if (row.supplyTypeId === "OnHand" || row.supplyTypeId === "On Hand Available") {
      if (row.startDate && !isValidDate(row.startDate)) {
        rowErrors.push({ row: row.rowNumber, field: "startDate", value: row.startDate, message: getErrorMessage("INVALID_DATE_FORMAT"), severity: "error" })
      }
      if (row.endDate && !isValidDate(row.endDate)) {
        rowErrors.push({ row: row.rowNumber, field: "endDate", value: row.endDate, message: getErrorMessage("INVALID_DATE_FORMAT"), severity: "error" })
      }

      // Validate date range
      if (row.startDate && row.endDate && isValidDate(row.startDate) && isValidDate(row.endDate)) {
        if (new Date(row.startDate) > new Date(row.endDate)) {
          rowErrors.push({ row: row.rowNumber, field: "endDate", value: row.endDate, message: getErrorMessage("DATE_RANGE_INVALID"), severity: "error" })
        }
      }
    }

    if (rowErrors.length > 0) {
      invalidCount++
      errors.push(...rowErrors)
    } else {
      validCount++
    }

    // Add warnings from the original row
    warnings.push(...row.warnings)
  })

  return {
    isValid: invalidCount === 0,
    totalRows: rows.length,
    validRows: validCount,
    invalidRows: invalidCount,
    errors,
    warnings,
  }
}

/**
 * Process file line by line with progress callback
 * Simulates backend processing with realistic delays
 */
export async function processFileLineByLine(
  rows: ParsedStockConfigRow[],
  onProgress?: (progress: number, current: number, success: number, errors: number) => void,
  abortSignal?: AbortSignal
): Promise<ProcessingResult[]> {
  const results: ProcessingResult[] = []
  let successCount = 0
  let errorCount = 0

  for (let i = 0; i < rows.length; i++) {
    // Check if processing was aborted
    if (abortSignal?.aborted) {
      throw new Error("Processing cancelled by user")
    }

    const row = rows[i]

    // Simulate processing delay (50-200ms per row)
    const delay = 50 + Math.random() * 150
    await new Promise((resolve) => setTimeout(resolve, delay))

    const result = processRow(row)
    results.push(result)

    if (result.status === "success") {
      successCount++
    } else {
      errorCount++
    }

    // Report progress
    const progress = Math.round(((i + 1) / rows.length) * 100)
    onProgress?.(progress, i + 1, successCount, errorCount)
  }

  return results
}

/**
 * Process a single row and return the result
 */
function processRow(row: ParsedStockConfigRow): ProcessingResult {
  const baseResult: Omit<ProcessingResult, "status" | "errorCode" | "errorMessage"> = {
    rowNumber: row.rowNumber,
    item: row.itemId,
    location: row.locationId,
    originalData: row,
  }

  // If row already has validation errors, return error result
  if (!row.isValid) {
    return {
      ...baseResult,
      status: "error",
      errorCode: "MISSING_REQUIRED_FIELD",
      errorMessage: row.errors[0]?.message || "Validation failed",
    }
  }

  // Simulate backend validation: Check if item exists
  if (!VALID_ITEMS.includes(row.itemId)) {
    // 20% chance of item not found for simulation
    if (Math.random() < 0.2) {
      return {
        ...baseResult,
        status: "error",
        errorCode: "ITEM_NOT_FOUND",
        errorMessage: getErrorMessage("ITEM_NOT_FOUND", [row.itemId]),
      }
    }
  }

  // Simulate backend validation: Check if location exists
  if (!VALID_LOCATIONS.includes(row.locationId)) {
    // 15% chance of location not found for simulation
    if (Math.random() < 0.15) {
      return {
        ...baseResult,
        status: "error",
        errorCode: "LOCATION_NOT_FOUND",
        errorMessage: getErrorMessage("LOCATION_NOT_FOUND", [row.locationId]),
      }
    }
  }

  // Check for duplicate configuration
  const isDuplicate = EXISTING_CONFIGS.some(
    (config) =>
      config.itemId === row.itemId &&
      config.locationId === row.locationId &&
      checkDateOverlap(config.startDate, config.endDate, row.startDate, row.endDate)
  )

  if (isDuplicate) {
    // 10% chance of duplicate for simulation
    if (Math.random() < 0.1) {
      return {
        ...baseResult,
        status: "error",
        errorCode: "DUPLICATE_CONFIG",
        errorMessage: getErrorMessage("DUPLICATE_CONFIG"),
      }
    }
  }

  // Success
  return {
    ...baseResult,
    status: "success",
  }
}

/**
 * Check if two date ranges overlap
 */
function checkDateOverlap(
  start1?: string,
  end1?: string,
  start2?: string,
  end2?: string
): boolean {
  if (!start1 || !end1 || !start2 || !end2) return false

  const s1 = new Date(start1)
  const e1 = new Date(end1)
  const s2 = new Date(start2)
  const e2 = new Date(end2)

  return s1 <= e2 && s2 <= e1
}

/**
 * Generate CSV blob with all processing results
 */
export function generateErrorReport(results: ProcessingResult[]): Blob {
  const headers = [
    "Row #",
    "Item ID",
    "Location ID",
    "Quantity",
    "Supply Type",
    "Frequency",
    "Channel",
    "Start Date",
    "End Date",
    "Status",
    "Error Code",
    "Error Message",
  ]

  const csvRows = [headers.join(",")]

  results.forEach((result) => {
    const row = result.originalData
    const csvRow = [
      result.rowNumber,
      escapeCSV(row.itemId),
      escapeCSV(row.locationId),
      row.quantity ?? "",
      escapeCSV(row.supplyTypeId),
      escapeCSV(row.frequency),
      escapeCSV(row.channel),
      escapeCSV(row.startDate),
      escapeCSV(row.endDate),
      result.status,
      result.errorCode || "",
      escapeCSV(result.errorMessage || ""),
    ]
    csvRows.push(csvRow.join(","))
  })

  return new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" })
}

/**
 * Generate CSV blob with only failed rows for re-submission
 */
export function generateErrorsOnlyReport(results: ProcessingResult[]): Blob {
  // Use exact upload-compatible column names so users can fix and re-upload
  const headers = [
    "ItemId",
    "LocationId",
    "SupplyTypeId",
    "Frequency",
    "Quantity",
    "StartDate",
    "EndDate",
    "Error",
  ]

  const csvRows = [headers.join(",")]

  results
    .filter((result) => result.status === "error")
    .forEach((result) => {
      const row = result.originalData
      const csvRow = [
        escapeCSV(row.itemId),
        escapeCSV(row.locationId),
        escapeCSV(row.supplyTypeId),
        escapeCSV(row.frequency),
        row.quantity ?? "",
        escapeCSV(row.startDate),
        escapeCSV(row.endDate),
        escapeCSV(result.errorMessage),
      ]
      csvRows.push(csvRow.join(","))
    })

  return new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" })
}

/**
 * Escape a value for CSV
 */
function escapeCSV(value: string | null | undefined): string {
  if (value === null || value === undefined) return ""
  const str = String(value)
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

/**
 * Retry failed rows with corrected data
 */
export async function retryFailedRows(
  fileId: string,
  correctedRows: ParsedStockConfigRow[],
  onProgress?: (progress: number, current: number, success: number, errors: number) => void,
  abortSignal?: AbortSignal
): Promise<ProcessingResult[]> {
  console.info("Retrying failed rows for file:", fileId, "Row count:", correctedRows.length)

  // Use the same processing logic
  return processFileLineByLine(correctedRows, onProgress, abortSignal)
}

/**
 * Update file processing status in mock data
 */
export async function updateFileProcessingStatus(
  fileId: string,
  update: Partial<StockConfigFile>
): Promise<StockConfigFile | null> {
  // Simulate async operation
  await new Promise((resolve) => setTimeout(resolve, 50))

  const fileIndex = mockFileHistory.findIndex((f) => f.id === fileId)
  if (fileIndex === -1) return null

  mockFileHistory[fileIndex] = {
    ...mockFileHistory[fileIndex],
    ...update,
  }

  return mockFileHistory[fileIndex]
}

/**
 * Add a new file to the mock file history
 */
export function addToFileHistory(file: StockConfigFile): void {
  mockFileHistory.unshift(file)
}
