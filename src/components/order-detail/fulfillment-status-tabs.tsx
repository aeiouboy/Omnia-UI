"use client"

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StatusCategory, ItemStatusSummary } from "@/types/item-fulfillment"

interface FulfillmentStatusTabsProps {
  activeTab: StatusCategory
  onTabChange: (tab: StatusCategory) => void
  summary: ItemStatusSummary
}

/**
 * Sub-tabs for filtering items by fulfillment status
 * Displays: [All (count)] [Fulfilled (count)] [Cancelled (count)] [Returned (count)]
 */
export function FulfillmentStatusTabs({
  activeTab,
  onTabChange,
  summary,
}: FulfillmentStatusTabsProps) {
  const tabs: { value: StatusCategory; label: string; count: number }[] = [
    { value: 'all', label: 'All', count: summary.totalItems },
    { value: 'fulfilled', label: 'Fulfilled', count: summary.fulfilled.count },
    { value: 'cancelled', label: 'Cancelled', count: summary.cancelled.count },
    { value: 'returned', label: 'Returned', count: summary.returned.count },
  ]

  return (
    <Tabs
      value={activeTab}
      onValueChange={(value) => onTabChange(value as StatusCategory)}
      className="w-full"
    >
      <TabsList className="w-full justify-start h-auto flex-wrap gap-1 bg-transparent p-0">
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            className="px-3 py-1.5 text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md"
            disabled={tab.count === 0 && tab.value !== 'all'}
          >
            {tab.label} ({tab.count})
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  )
}
