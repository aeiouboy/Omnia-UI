# Chore: Fulfillment Tab Version 4 Implementation

## Metadata
adw_id: `44ae07c8`
prompt: `Implement Version 4 of Fulfillment Tab Item Status Breakdown from wireframe specification at wf_specs/wf-7c8932cb-fulfillment-tab-item-status-breakdown.md. Focus on: 1) Order Fulfillment Timeline with dates ABOVE progress bar (Date/Time above, progress dots middle, stage names below), 2) Simple item cards with status badge on TOP RIGHT (aligned with product name), price on RIGHT side (bottom row), 3) Sub-tabs: All/Fulfilled/Cancelled/Returned with counts, 4) Footer: item count left, Total right. NO KPI cards, NO expand/collapse, NO detail view.`

## Chore Description

Implement Version 4 (the Recommended version) of the Fulfillment Tab redesign as specified in the wireframe specification. This version prioritizes simplicity and clean UI:

**Key Design Principles:**
- ❌ **No KPI cards** - No statistics summary cards at top
- ❌ **No expand/collapse** - Item cards are static, no expandable details
- ❌ **No detail view** - No "MORE INFO" or drill-down
- ❌ **No dates on items** - No fulfilled/cancelled timestamps per item
- ❌ **No reasons** - No cancel/return reasons displayed
- ✅ **Timeline with dates ABOVE** - Order Fulfillment Timeline with Date/Time above progress dots, stage names below
- ✅ **Status badge TOP RIGHT** - Aligned with product name row
- ✅ **Price RIGHT side** - Bottom row: `x1` left, `฿XXX` right
- ✅ **English labels** - `✅ Fulfilled` | `❌ Cancelled` | `🔄 Returned`
- ✅ **Sub-tabs with counts** - `[All (5)] [Fulfilled (3)] [Cancelled (1)] [Returned (1)]`
- ✅ **Footer summary** - Item count left, Total right

**Existing Pattern Reference:**
The current Fulfillment tab (`src/components/order-detail/fulfillment-timeline.tsx`) shows order-level timeline events. We will completely redesign this to match Version 4 specification while preserving the existing Card/CardHeader/CardContent patterns used throughout the codebase.

## Relevant Files

### Existing Files to Modify

- **`src/components/order-detail/fulfillment-timeline.tsx`** - Current fulfillment timeline component that will be completely redesigned to implement Version 4
- **`src/components/order-detail-view.tsx`** - Main order detail view that renders the Fulfillment tab; may need minor prop adjustments

### Existing Files for Reference (Patterns)

- **`src/components/ui/tabs.tsx`** - Radix UI tabs primitives for sub-tab implementation
- **`src/components/ui/card.tsx`** - Card, CardHeader, CardContent patterns
- **`src/components/ui/badge.tsx`** - Badge component for status display
- **`src/components/order-badges.tsx`** - Existing badge patterns (OrderStatusBadge, etc.) - reference for status badge styling
- **`src/components/order-detail/product-card.tsx`** - Existing product card pattern for Ship to Store items
- **`src/lib/currency-utils.ts`** - `formatCurrency` utility for price display

### New Files to Create

- **`src/types/item-fulfillment.ts`** - TypeScript interfaces for item fulfillment status (ItemFulfillmentStatus, StatusCategory, ItemStatusSummary, etc.)
- **`src/lib/item-fulfillment-utils.ts`** - Utility functions for categorizing items by status and calculating summaries
- **`src/components/order-detail/fulfillment-progress-timeline.tsx`** - Order Fulfillment Timeline component with dates above progress bar
- **`src/components/order-detail/fulfillment-status-tabs.tsx`** - Sub-tabs component (All/Fulfilled/Cancelled/Returned)
- **`src/components/order-detail/fulfillment-item-card.tsx`** - Simple item card with status badge (NO expand)
- **`src/components/order-detail/fulfillment-summary-footer.tsx`** - Footer component with item count and total

## Step by Step Tasks

### 1. Create TypeScript Interfaces
- Create `src/types/item-fulfillment.ts` with the following types:
  - `ItemFulfillmentStatus` - Union type for all possible item statuses (ORDERED, ALLOCATED, RELEASED, FULFILLED, DELIVERED, COMPLETED, PICK_DECLINED, CANCELLED, RETURNED, REFUNDED)
  - `StatusCategory` - Type for tab filtering ('all' | 'fulfilled' | 'cancelled' | 'returned')
  - `ItemStatusSummary` - Interface for status counts and values per category
  - `EnhancedOrderItem` - Extended order item with fulfillment status fields
- Define status badge mapping constants (status → icon, color)

### 2. Create Item Fulfillment Utility Functions
- Create `src/lib/item-fulfillment-utils.ts` with:
  - `categorizeItemsByStatus(items)` - Categorizes items into fulfilled/cancelled/returned groups
  - `calculateItemStatusSummary(items)` - Returns counts and totals per category
  - `getStatusBadgeConfig(status)` - Returns icon, label, colors for a status
  - `mapItemToEnhancedItem(item)` - Derives item fulfillment status from order item data

### 3. Create Fulfillment Progress Timeline Component
- Create `src/components/order-detail/fulfillment-progress-timeline.tsx`
- Implement horizontal timeline with:
  - **Date/Time row ABOVE** the progress dots (e.g., "Jan 28 09:00")
  - **Progress dots in the middle** - filled (●) for completed, empty (○) for pending
  - **Stage names BELOW** - Ordered, Picking, Packed, Shipped, Delivered
  - Connecting lines between dots
- Use Card wrapper matching existing patterns
- Accept orderData prop to derive timeline stages

### 4. Create Fulfillment Status Tabs Component
- Create `src/components/order-detail/fulfillment-status-tabs.tsx`
- Implement sub-tab navigation using existing Tabs/TabsList/TabsTrigger patterns
- Tabs: `[All (count)] [Fulfilled (count)] [Cancelled (count)] [Returned (count)]`
- Accept items array and onTabChange callback
- Show counts next to each tab label
- Active tab styling consistent with existing tabs

### 5. Create Simple Fulfillment Item Card Component
- Create `src/components/order-detail/fulfillment-item-card.tsx`
- Implement simple card layout:
  ```
  ┌──────────────────────────────────────────────────────────────┐
  │ ┌──────┐  [Product Name truncated...]           ✅ Fulfilled │
  │ │ IMG  │  Variant/Color info                                 │
  │ │ 80x80│  SKU: XXX-XXX-XXX                                   │
  │ └──────┘  x1                                          ฿490   │
  └──────────────────────────────────────────────────────────────┘
  ```
- Status badge positioned top-right, aligned with product name
- Quantity (x1) on bottom-left, price (฿XXX) on bottom-right
- **NO expand/collapse functionality**
- **NO dates or reasons displayed**
- Use existing image placeholder pattern from Items tab

### 6. Create Fulfillment Summary Footer Component
- Create `src/components/order-detail/fulfillment-summary-footer.tsx`
- Layout: `[X items]` on left, `Total: ฿X,XXX` on right
- Horizontal separator line above
- Use formatCurrency for price display
- Accept items array and calculate total from filtered items

### 7. Redesign Fulfillment Timeline Main Component
- Rewrite `src/components/order-detail/fulfillment-timeline.tsx` to compose:
  1. `FulfillmentProgressTimeline` - Order progress at top
  2. Horizontal divider
  3. "Items Status" heading with optional search
  4. `FulfillmentStatusTabs` - Sub-tab navigation
  5. List of `FulfillmentItemCard` components (filtered by selected tab)
  6. `FulfillmentSummaryFooter` - Footer with counts and total
- Maintain state for: activeTab ('all' | 'fulfilled' | 'cancelled' | 'returned')
- Filter displayed items based on activeTab
- Empty state handling per tab

### 8. Add Status Badge Styles
- Define consistent status badge styling:
  - `✅ Fulfilled` - Green (CheckCircle icon, green-100 bg, green-800 text)
  - `❌ Cancelled` - Red (XCircle icon, red-100 bg, red-800 text)
  - `🔄 Returned` - Orange (RefreshCcw icon, orange-100 bg, orange-800 text)
- Use existing Badge component with custom styling

### 9. Connect to Mock Data
- For initial implementation, enhance `generateFulfillmentTimeline` in mock-data or create new mock generator
- Generate realistic item fulfillment statuses:
  - Some items FULFILLED
  - Some items CANCELLED (Pick Declined)
  - Some items RETURNED
- Ensure orderData.items includes fulfillmentStatus field for testing

### 10. Validate Implementation
- Verify all components render correctly in the Fulfillment tab
- Test sub-tab switching between All/Fulfilled/Cancelled/Returned
- Confirm counts in tabs match actual item counts
- Verify footer totals update based on active tab filter
- Test responsive layout on mobile and desktop
- Ensure no console errors or TypeScript warnings
- Run `pnpm build` to verify no build errors

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm lint` - Verify no ESLint errors in new/modified files
- `pnpm build` - Ensure production build succeeds with no TypeScript errors
- `pnpm dev` - Start dev server and manually verify:
  - Navigate to an order detail page
  - Click on "Fulfillment" tab
  - Verify Order Fulfillment Timeline displays with dates above, stages below
  - Verify sub-tabs show with counts (All/Fulfilled/Cancelled/Returned)
  - Click each sub-tab and verify items filter correctly
  - Verify item cards show status badge top-right, price bottom-right
  - Verify footer shows item count left, total right
  - Verify NO expand/collapse behavior on item cards
  - Test on mobile viewport for responsive design

## Notes

### Mock Data Generation
Since this is a frontend-only implementation using mock data, the item fulfillment status will be derived from existing order item data or generated randomly for demonstration purposes. In production, these statuses would come from the Manhattan OMS API.

### Status Derivation Logic
For initial implementation, derive fulfillment status from existing item data:
- Items with `fulfillmentStatus: 'RETURNED'` → Returned category
- Items with `fulfillmentStatus: 'CANCELLED'` or pick declined → Cancelled category
- Items with normal status → Fulfilled category
- This can be refined when real API integration is done

### Design Decisions from Wireframe
- Version 4 was chosen as the "Recommended" version due to its simplicity
- Estimated effort: 1-2 days (very simple)
- Explicitly excludes: KPI cards, expand/collapse, detail views, dates on items, reasons
- Status labels use English to match sub-tab names

### Component Reuse
- Leverage existing Card, Badge, Tabs UI components
- Follow same patterns as existing order-detail components
- Use formatCurrency from currency-utils for consistent price display
