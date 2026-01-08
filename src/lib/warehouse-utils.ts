/**
 * Utility functions for warehouse location formatting and management
 */

import { StockLocation, StockStatus, ItemType } from "@/types/inventory"

/**
 * Formats warehouse code and location code into display string
 * @param warehouseCode - Warehouse identifier (e.g., "CMG", "1005")
 * @param locationCode - Specific location within warehouse (e.g., "1055")
 * @returns Formatted string (e.g., "CMG/1005/1055")
 */
export function formatWarehouseCode(warehouseCode: string, locationCode: string): string {
  if (!warehouseCode && !locationCode) {
    return "N/A"
  }
  if (!locationCode) {
    return warehouseCode
  }
  if (!warehouseCode) {
    return locationCode
  }
  return `${warehouseCode}/${locationCode}`
}

/**
 * Parses a formatted warehouse code back into its components
 * @param fullCode - Formatted code (e.g., "CMG/1005/1055")
 * @returns Object with warehouseCode and locationCode
 */
export function parseLocationCode(fullCode: string): { warehouseCode: string; locationCode: string } {
  if (!fullCode || fullCode === "N/A") {
    return { warehouseCode: "", locationCode: "" }
  }

  const parts = fullCode.split("/")
  if (parts.length === 1) {
    return { warehouseCode: parts[0], locationCode: "" }
  }

  // If format is "CMG/1005/1055", combine first two parts as warehouse, last as location
  if (parts.length >= 3) {
    return {
      warehouseCode: parts.slice(0, -1).join("/"),
      locationCode: parts[parts.length - 1]
    }
  }

  return {
    warehouseCode: parts[0] || "",
    locationCode: parts[1] || ""
  }
}

/**
 * Finds the default location from an array of stock locations
 * @param locations - Array of stock locations
 * @returns Default location or null if not found
 */
export function getDefaultLocation(locations: StockLocation[]): StockLocation | null {
  if (!locations || locations.length === 0) {
    return null
  }

  const defaultLocation = locations.find(loc => loc.isDefaultLocation)
  return defaultLocation || null
}

/**
 * Returns Tailwind color class for stock status
 * @param status - Stock status type
 * @returns Tailwind color class string
 */
export function getStockStatusColor(status: StockStatus): string {
  const colorMap: Record<StockStatus, string> = {
    stock: "text-green-500 bg-green-50 border-green-200",
    in_process: "text-orange-500 bg-orange-50 border-orange-200",
    sold: "text-gray-500 bg-gray-50 border-gray-200",
    on_hold: "text-blue-500 bg-blue-50 border-blue-200",
    pending: "text-yellow-500 bg-yellow-50 border-yellow-200"
  }

  return colorMap[status] || "text-gray-500 bg-gray-50 border-gray-200"
}

/**
 * Returns human-readable label for stock status
 * @param status - Stock status type
 * @returns Display label
 */
export function getStockStatusLabel(status: StockStatus): string {
  const labelMap: Record<StockStatus, string> = {
    stock: "Available",
    in_process: "Reserved",
    sold: "Sold",
    on_hold: "On Hold",
    pending: "Pending"
  }

  return labelMap[status] || status
}

/**
 * Calculates total physical stock for a specific warehouse location.
 *
 * This function returns the sum of all physical inventory at a location.
 * The calculation includes:
 * - stockAvailable: Ready-to-sell inventory
 * - stockInProcess: Reserved/allocated for orders (same as reservedStock at product level)
 * - stockSold: Items sold but not yet removed from location
 * - stockOnHold: Items temporarily held (quality check, disputes, etc.)
 * - stockPending: Items pending receipt or processing
 *
 * IMPORTANT: stockSafetyStock is intentionally EXCLUDED because it represents
 * a MINIMUM THRESHOLD for reordering, NOT physical inventory. Safety stock is
 * a policy setting that triggers alerts when available stock drops below it.
 *
 * @param location - Stock location to calculate total for
 * @returns Total physical stock count at this location
 */
export function getTotalStockForLocation(location: StockLocation): number {
  return (
    location.stockAvailable +
    location.stockInProcess +
    location.stockSold +
    location.stockOnHold +
    location.stockPending
  )
}

/**
 * Calculates active stock for a specific warehouse location.
 *
 * This function returns stock that aligns with the product-level Total Stock concept:
 * - stockAvailable: Ready-to-sell inventory (maps to product availableStock)
 * - stockInProcess: Reserved/allocated for orders (maps to product reservedStock)
 * - stockSafetyStock: Safety buffer (maps to product safetyStock)
 *
 * The sum of getActiveStockForLocation() across all locations should equal
 * the product's Total Stock (which is availableStock + reservedStock + safetyStock).
 *
 * Use this for UI display where location totals must sum to product total.
 * Use getTotalStockForLocation() for true physical inventory counting.
 *
 * @param location - Stock location to calculate active stock for
 * @returns Active stock + Safety stock (Available + Reserved + Safety) at this location
 */
export function getActiveStockForLocation(location: StockLocation): number {
  return location.stockAvailable + location.stockInProcess + (location.stockSafetyStock ?? 0)
}

/**
 * Checks if a location has available stock
 * @param location - Stock location
 * @returns True if stock is available
 */
export function hasAvailableStock(location: StockLocation): boolean {
  return location.stockAvailable > 0
}

/**
 * Formats stock quantity based on item type
 * @param quantity - Stock quantity to format
 * @param itemType - Item type indicating measurement method
 * @param includeUnit - Whether to include the unit suffix (default: true)
 * @returns Formatted quantity string with appropriate unit
 * @example
 * formatStockQuantity(12.5, "weight") => "12.500 kg"
 * formatStockQuantity(12.5, "weight", false) => "12.500"
 * formatStockQuantity(42.678, "pack_weight") => "42.678 kg"
 * formatStockQuantity(50, "normal") => "50"
 * formatStockQuantity(25, "pack") => "25"
 */
export function formatStockQuantity(quantity: number, itemType: ItemType, includeUnit: boolean = true): string {
  // Weight-based items: display with 3 decimal places
  if (itemType === "weight" || itemType === "pack_weight") {
    return includeUnit ? `${quantity.toFixed(3)} kg` : quantity.toFixed(3)
  }

  // Unit-based items: display as integer without decimals
  return Math.round(quantity).toString()
}
