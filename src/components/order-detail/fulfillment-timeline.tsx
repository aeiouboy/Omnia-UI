"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, Search } from "lucide-react"
import { Input } from "@/components/ui/input"

import { FulfillmentProgressTimeline } from "./fulfillment-progress-timeline"
import { FulfillmentStatusTabs } from "./fulfillment-status-tabs"
import { FulfillmentItemCard } from "./fulfillment-item-card"
import { FulfillmentSummaryFooter } from "./fulfillment-summary-footer"

import {
  enhanceItemsWithFulfillmentStatus,
  calculateItemStatusSummary,
  filterItemsByCategory,
  calculateFilteredTotal,
} from "@/lib/item-fulfillment-utils"
import { StatusCategory, EnhancedOrderItem } from "@/types/item-fulfillment"

interface FulfillmentTimelineProps {
  orderId: string
  orderData?: any
}

/**
 * Version 4 Fulfillment Tab Component
 *
 * Combines:
 * 1. FulfillmentProgressTimeline - Order progress at top
 * 2. Horizontal divider
 * 3. "Items Status" heading with optional search
 * 4. FulfillmentStatusTabs - Sub-tab navigation
 * 5. List of FulfillmentItemCard components (filtered by selected tab)
 * 6. FulfillmentSummaryFooter - Footer with counts and total
 *
 * Key Design Principles:
 * - ❌ No KPI cards
 * - ❌ No expand/collapse
 * - ❌ No detail view
 * - ❌ No dates on items
 * - ❌ No reasons
 * - ✅ Timeline with dates ABOVE progress bar
 * - ✅ Status badge TOP RIGHT
 * - ✅ Price RIGHT side
 * - ✅ English labels
 * - ✅ Sub-tabs with counts
 * - ✅ Footer summary
 */
export function FulfillmentTimeline({ orderId, orderData }: FulfillmentTimelineProps) {
  // State for active tab and search
  const [activeTab, setActiveTab] = useState<StatusCategory>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Enhance order items with fulfillment status
  const enhancedItems = useMemo<EnhancedOrderItem[]>(() => {
    const items = orderData?.items || []
    return enhanceItemsWithFulfillmentStatus(items)
  }, [orderData?.items])

  // Calculate status summary for tabs
  const summary = useMemo(() => {
    return calculateItemStatusSummary(enhancedItems)
  }, [enhancedItems])

  // Filter items based on active tab
  const filteredByTab = useMemo(() => {
    return filterItemsByCategory(enhancedItems, activeTab)
  }, [enhancedItems, activeTab])

  // Apply search filter
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) {
      return filteredByTab
    }
    const query = searchQuery.toLowerCase()
    return filteredByTab.filter((item) =>
      item.product_name.toLowerCase().includes(query) ||
      item.product_sku.toLowerCase().includes(query) ||
      (item.variant?.toLowerCase().includes(query)) ||
      (item.thaiName?.toLowerCase().includes(query))
    )
  }, [filteredByTab, searchQuery])

  // Calculate total for filtered items
  const filteredTotal = useMemo(() => {
    return calculateFilteredTotal(filteredItems)
  }, [filteredItems])

  // Empty state when no items
  if (!enhancedItems.length) {
    return (
      <div className="space-y-4">
        <FulfillmentProgressTimeline orderData={orderData} />

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Package className="h-4 w-4 sm:h-5 sm:w-5" />
              Items Status
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <div className="text-center py-12">
              <Package className="mx-auto h-12 w-12 text-gray-300" />
              <p className="mt-4 text-sm text-muted-foreground">
                No items found in this order.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Order Fulfillment Timeline */}
      <FulfillmentProgressTimeline orderData={orderData} />

      {/* Items Status Section */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Package className="h-4 w-4 sm:h-5 sm:w-5" />
              Items Status
            </CardTitle>

            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="px-4 sm:px-6">
          {/* Status Tabs */}
          <div className="mb-4">
            <FulfillmentStatusTabs
              activeTab={activeTab}
              onTabChange={setActiveTab}
              summary={summary}
            />
          </div>

          {/* Items List */}
          {filteredItems.length > 0 ? (
            <div className="space-y-3">
              {filteredItems.map((item) => (
                <FulfillmentItemCard key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Package className="mx-auto h-10 w-10 text-gray-300" />
              <p className="mt-3 text-sm text-muted-foreground">
                {searchQuery
                  ? 'No items match your search.'
                  : `No ${activeTab === 'all' ? '' : activeTab} items found.`}
              </p>
            </div>
          )}

          {/* Summary Footer */}
          {filteredItems.length > 0 && (
            <FulfillmentSummaryFooter
              itemCount={filteredItems.length}
              totalAmount={filteredTotal}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
