// Order line splitting utilities
// Normalizes order line items to 1 quantity unit per line

import type { ApiOrderItem } from "@/components/order-management-hub"

/**
 * UOM types that represent weight-based measurements
 * These items should NOT be split as they represent continuous quantities
 */
const WEIGHT_UOMS = ['KG', 'G', 'GRAM', 'LB', 'LBS', 'OZ', 'ML', 'L', 'LITER'] as const

/**
 * Check if a UOM represents a weight-based measurement
 */
function isWeightUOM(uom?: string): boolean {
  if (!uom) return false
  return WEIGHT_UOMS.some(weightUOM => uom.toUpperCase().includes(weightUOM))
}

/**
 * Check if a quantity is an integer (safe for splitting)
 */
function isIntegerQuantity(value: number): boolean {
  return Number.isFinite(value) && Number.isInteger(value) && value > 0
}

/**
 * Check if a quantity is a decimal (weight-based, should NOT split)
 */
function isDecimalQuantity(value: number): boolean {
  return Number.isFinite(value) && !Number.isInteger(value) && value > 0
}

/**
 * Split a single order line item into multiple lines with quantity = 1
 * Only splits items with integer quantity > 1 and non-weight UOM
 *
 * @param item - The order line item to split
 * @returns Array of split order line items
 */
function splitOrderLineItem(item: ApiOrderItem): ApiOrderItem[] {
  const { quantity, id, uom } = item

  // Handle null/undefined quantity - default to 1, don't split
  if (quantity == null) {
    return [{ ...item, quantity: 1 }]
  }

  // Filter out invalid quantities (zero, negative, NaN)
  if (quantity <= 0 || !Number.isFinite(quantity)) {
    return []
  }

  // Don't split weight-based items (decimal quantities or weight UOM)
  if (isDecimalQuantity(quantity) || isWeightUOM(uom)) {
    return [{ ...item }]
  }

  // Don't split items with quantity = 1
  if (quantity === 1) {
    return [{ ...item }]
  }

  // Split integer quantity > 1 into multiple lines
  const splitLines: ApiOrderItem[] = []
  const splitCount = Math.floor(quantity)

  for (let i = 0; i < splitCount; i++) {
    splitLines.push({
      ...item,
      id: `${id}-${i}`,
      quantity: 1,
      total_price: item.unit_price, // Each line's total is the unit price
      parentLineId: id,
      splitIndex: i,
      splitReason: 'quantity-normalization'
    })
  }

  return splitLines
}

/**
 * Split all order line items to normalize quantity to 1 per line
 * Preserves all metadata and handles edge cases appropriately
 *
 * @param items - Array of order line items to split
 * @returns Array of normalized order line items
 */
export function splitOrderLines(items: ApiOrderItem[]): ApiOrderItem[] {
  if (!Array.isArray(items) || items.length === 0) {
    return []
  }

  const result: ApiOrderItem[] = []
  let originalCount = items.length
  let splitCount = 0

  for (const item of items) {
    const splitItems = splitOrderLineItem(item)
    result.push(...splitItems)

    // Track splitting statistics
    if (splitItems.length > 1) {
      splitCount++
    }
  }

  // Log splitting statistics
  if (splitCount > 0) {
    console.log(`[OrderUtils] Split ${splitCount} order lines: ${originalCount} items -> ${result.length} items`)
  }

  return result
}

/**
 * Group split order lines by their parent line ID
 * Useful for visual grouping in UI components
 *
 * @param items - Array of order line items (potentially split)
 * @returns Map of parentLineId to array of child items
 */
export function groupSplitLinesByParent(items: ApiOrderItem[]): Map<string, ApiOrderItem[]> {
  const groups = new Map<string, ApiOrderItem[]>()

  for (const item of items) {
    const key = item.parentLineId || item.id
    if (!groups.has(key)) {
      groups.set(key, [])
    }
    groups.get(key)!.push(item)
  }

  return groups
}

/**
 * Get the original quantity before splitting
 *
 * @param item - Order line item (may be split)
 * @param allItems - All items in the order (to find siblings)
 * @returns Original quantity before splitting
 */
export function getOriginalQuantity(item: ApiOrderItem, allItems: ApiOrderItem[]): number {
  // If this is a split line, count all siblings
  if (item.parentLineId) {
    return allItems.filter(i => i.parentLineId === item.parentLineId).length
  }

  // If this item has split children, return the count
  const splitChildren = allItems.filter(i => i.parentLineId === item.id)
  if (splitChildren.length > 0) {
    return splitChildren.length
  }

  // No splitting involved
  return item.quantity || 1
}

/**
 * Check if an item is a split line (has parentLineId)
 *
 * @param item - Order line item
 * @returns True if item is a split line
 */
export function isSplitLine(item: ApiOrderItem): boolean {
  return !!item.parentLineId
}

/**
 * Check if an item has been split into multiple lines
 *
 * @param item - Order line item
 * @param allItems - All items in the order
 * @returns True if item has split children
 */
export function hasSplitChildren(item: ApiOrderItem, allItems: ApiOrderItem[]): boolean {
  return allItems.some(i => i.parentLineId === item.id)
}
