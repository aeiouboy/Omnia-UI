/**
 * TypeScript type definitions for Stock Configuration Management
 *
 * These types define the structure of stock configuration data used
 * for managing Preorder, Override OnHand, and Safety Stock configurations.
 */

/**
 * Supply type identifier
 * Business spec format:
 * - PreOrder: Limited quantity one-time sales (capital O)
 * - On Hand Available: Daily stock overrides with configurable date ranges (with spaces)
 * Note: Backward compatible with legacy values "Preorder" and "OnHand"
 */
export type SupplyTypeID = "PreOrder" | "On Hand Available" | "Preorder" | "OnHand"

/**
 * Frequency type for stock configuration
 * Business spec format:
 * - One-time: One-time configuration (with hyphen, used with PreOrder)
 * - Daily: Daily recurring configuration (used with On Hand Available)
 * Note: Backward compatible with legacy value "Onetime"
 */
export type Frequency = "One-time" | "Daily" | "Onetime"

/**
 * Sales channel identifier
 * - TOL: Tops Online
 * - MKP: Marketplace
 * - QC: Quality Control / Quick Commerce
 */
export type Channel = "TOL" | "MKP" | "QC"

/**
 * Stock configuration item representing a single stock config record
 */
export interface StockConfigItem {
  id: string
  locationId: string
  itemId: string
  quantity: number
  supplyTypeId: SupplyTypeID
  frequency: Frequency
  channel?: Channel // Sales channel (TOL, MKP, QC)
  startDate?: string // ISO 8601 date or YYYY-MM-DD HH:MM:SS (only for OnHand type)
  endDate?: string // ISO 8601 date or YYYY-MM-DD HH:MM:SS (only for OnHand type)
  createdAt: string // ISO 8601 timestamp
  updatedAt: string // ISO 8601 timestamp
}

/**
 * File processing status (legacy)
 */
export type FileStatus = "pending" | "validated" | "processed" | "error"

/**
 * Processing status for DaaS line-by-line processing workflow
 */
export type ProcessingStatus = "validating" | "processing" | "completed" | "partial" | "error"

/**
 * Error code enum for standardized error codes
 */
export type ErrorCode =
  | "ITEM_NOT_FOUND"
  | "LOCATION_NOT_FOUND"
  | "INVALID_DATE_FORMAT"
  | "DATE_RANGE_INVALID"
  | "DUPLICATE_CONFIG"
  | "MISSING_REQUIRED_FIELD"
  | "INVALID_SUPPLY_TYPE"
  | "INVALID_FREQUENCY"
  | "QUANTITY_INVALID"
  | "INVALID_CHANNEL"

/**
 * Error severity for processing results
 */
export type ErrorSeverity = "critical" | "warning"

/**
 * Processing result for a single row during line-by-line processing
 */
export interface ProcessingResult {
  rowNumber: number
  item: string
  location: string
  status: "success" | "error"
  errorCode?: ErrorCode
  errorMessage?: string
  originalData: ParsedStockConfigRow
}

/**
 * Pre-submission validation result for frontend validation
 */
export interface PreSubmissionValidationResult {
  isValid: boolean
  totalRows: number
  validRows: number
  invalidRows: number
  errors: ValidationResult[]
  warnings: ValidationResult[]
}

/**
 * File folder/location for tracking processing state
 */
export type FileFolder = "pending" | "arch" | "err"

/**
 * Stock configuration file metadata
 */
export interface StockConfigFile {
  id: string
  filename: string
  status: FileStatus
  uploadDate: string // ISO 8601 timestamp
  recordCount: number
  validRecords: number
  invalidRecords: number
  folder: FileFolder
  errorMessage?: string
  // User who uploaded the file (optional for backward compatibility)
  uploadedBy?: string
  // Extended fields for DaaS processing workflow
  processingStatus?: ProcessingStatus
  processingProgress?: number // 0-100
  successCount?: number
  errorCount?: number
  processedAt?: string // ISO 8601 timestamp
  errorReportUrl?: string
  processingResults?: ProcessingResult[]
  // File URL for download functionality
  fileUrl?: string
}

/**
 * Validation severity levels
 */
export type ValidationSeverity = "error" | "warning"

/**
 * Validation result for a specific row/field
 */
export interface ValidationResult {
  row: number
  field: string
  value: string
  message: string
  severity: ValidationSeverity
}

/**
 * Parsed row from uploaded file with validation status
 */
export interface ParsedStockConfigRow {
  rowNumber: number
  locationId: string
  itemId: string
  quantity: number | null
  supplyTypeId: string
  frequency: string
  channel: string
  startDate: string
  endDate: string
  isValid: boolean
  errors: ValidationResult[]
  warnings: ValidationResult[]
}

/**
 * File parse result containing all parsed rows and validation summary
 */
export interface FileParseResult {
  filename: string
  totalRows: number
  validRows: number
  invalidRows: number
  rows: ParsedStockConfigRow[]
  errors: ValidationResult[]
  warnings: ValidationResult[]
}

/**
 * Filter parameters for stock configuration queries
 */
export interface StockConfigFilters {
  supplyType?: SupplyTypeID | "all"
  frequency?: Frequency | "all"
  channel?: Channel | "all"
  searchQuery?: string
  locationIdFilter?: string
  itemIdFilter?: string
  page?: number
  pageSize?: number
  sortBy?: "locationId" | "itemId" | "quantity" | "supplyTypeId" | "channel" | "createdAt"
  sortOrder?: "asc" | "desc"
}

/**
 * Response structure for paginated stock configuration data
 */
export interface StockConfigDataResponse {
  items: StockConfigItem[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

/**
 * Response structure for file upload history
 */
export interface FileHistoryResponse {
  files: StockConfigFile[]
  total: number
}
