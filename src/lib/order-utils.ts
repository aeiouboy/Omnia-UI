// Order line utilities
// NOTE: Order line splitting logic has been removed (chore-17105b9b)
// The splitOrderLines function now acts as a simple passthrough

import type { ApiOrderItem } from "@/components/order-management-hub"

/**
 * Process order line items (passthrough - no longer splits)
 *
 * Previously this function split items with qty > 1 into multiple lines with qty=1.
 * This behavior has been removed. Items are now returned unchanged.
 *
 * @param items - Array of order line items
 * @returns Same array of order line items (unchanged)
 */
export function splitOrderLines(items: ApiOrderItem[]): ApiOrderItem[] {
  if (!Array.isArray(items) || items.length === 0) {
    return []
  }
  return items
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
