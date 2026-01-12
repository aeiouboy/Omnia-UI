# Chore: Enhance Order Search Page Filtering with Main and Advanced Filters

## Metadata
adw_id: `43f9dddb`
prompt: `Enhance Order Search page filtering with Main Filters and Advanced Filters sections.`

## Chore Description
Redesign the Order Management Hub filtering system to have a clear two-tier filter structure:
1. **Main Filters Section** - Always visible at the top with the most commonly used filters for quick access
2. **Advanced Filters Section** - Collapsible section for additional filtering options

The current implementation has basic filters (search, SKU search, status, channel, quick filter buttons) but needs reorganization and new filter capabilities including:
- Store No. dropdown
- Payment Status dropdown
- Date range picker
- Item Name/SKU search
- Customer Name, Email, Phone fields
- Item Status dropdown
- Payment Method dropdown
- Order Type dropdown
- SLA action buttons (Near SLA, SLA Breach)
- Active filter badges with clear functionality

## Relevant Files
Use these files to complete the chore:

### Primary Files to Modify
- **`src/components/order-management-hub.tsx`** - Main component that needs filter UI refactoring. Currently has ~1507 lines with existing filter states, UI components, and filter logic. The CardHeader section (lines 1188-1381) contains current filter UI that needs restructuring.

- **`src/lib/mock-data.ts`** - Contains `getMockOrders()` function (lines 696-755) that needs to support new filter parameters: `storeNo`, `paymentStatus`, `paymentMethod`, `orderType`, `itemName`, `customerName`, `email`, `phone`, `itemStatus`.

### Reference Files (patterns to follow)
- **`src/components/advanced-filter-panel.tsx`** - Existing advanced filter panel component with date pickers, dropdowns, and filter logic patterns. Good reference for Calendar/Popover date range implementation.

- **`src/components/ui/collapsible.tsx`** - Radix UI Collapsible component for the expandable Advanced Filters section.

- **`src/components/ui/calendar.tsx`** - Calendar component using react-day-picker for date range selection.

- **`src/components/ui/popover.tsx`** - Popover component for housing the date picker calendar.

### Types and Utilities
- **`src/lib/utils.ts`** - Contains `formatGMT7TimeString()`, `getGMT7Time()` for timezone handling.

### New Files
None - all changes will be made to existing files.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Define Extended Filter Types and State
- Add new filter state variables to `OrderManagementHub` component:
  - `storeNoFilter: string` - for Store No. dropdown
  - `paymentStatusFilter: string` - for Payment Status dropdown (PAID, PENDING, FAILED)
  - `dateFromFilter: Date | undefined` - for date range start
  - `dateToFilter: Date | undefined` - for date range end
  - `itemNameFilter: string` - for Item Name search
  - `customerNameFilter: string` - for Customer Name search
  - `emailFilter: string` - for Email search
  - `phoneFilter: string` - for Phone search
  - `itemStatusFilter: string` - for Item Status dropdown (Pending, Picked, Packed, Shipped)
  - `paymentMethodFilter: string` - for Payment Method dropdown
  - `orderTypeFilter: string` - for Order Type dropdown (DELIVERY, PICKUP)
  - `showAdvancedFilters: boolean` - toggle state for collapsible section

### 2. Create Extended AdvancedFilterValues Interface
- Update the `AdvancedFilterValues` interface in `order-management-hub.tsx` to include all new filter fields
- Ensure type safety for all filter parameters

### 3. Refactor Filter UI - Main Filters Section
- Restructure the CardHeader section to create a clear "Main Filters" area
- Include:
  - Order ID search box (keep existing)
  - Order Status dropdown (keep existing)
  - Store No. dropdown (NEW) - populate from unique `metadata.store_no` values
  - Payment Status dropdown (NEW) - PAID, PENDING, FAILED options
  - Date Range picker (NEW) - From/To date fields using Popover + Calendar pattern from `advanced-filter-panel.tsx`
  - Near SLA / SLA Breach toggle buttons (refactor from existing quick filters)
- Ensure single-row layout that wraps responsively on mobile

### 4. Create Advanced Filters Collapsible Section
- Add imports for `Collapsible`, `CollapsibleTrigger`, `CollapsibleContent` from UI components
- Create "Show Advanced Filters" toggle button with ChevronDown/ChevronUp icon
- Build collapsible content with grid layout (responsive 1-4 columns):
  - **Text Search Fields:**
    - Item ID / SKU search (move from current location)
    - Item Name search (NEW)
    - Customer Name search (NEW)
    - Email search (NEW)
    - Phone Number search (NEW)
  - **Dropdowns:**
    - Order Status (duplicate for advanced)
    - Item Status (NEW) - Pending, Picked, Packed, Shipped
    - Selling Channel (move from main section)
    - Payment Method (NEW) - CREDIT_CARD, CASH, WALLET, QR_CODE
    - Order Type (NEW) - DELIVERY, PICKUP
  - **Toggle Buttons:**
    - Near SLA toggle
    - SLA Breach toggle

### 5. Implement Active Filter Badges Display
- Enhance `generateActiveFilters` useMemo to include all new filter types
- Add badge display for each active filter with:
  - Filter name and value
  - X button to remove individual filter
- Add "Clear All Filters" button functionality that resets all filters

### 6. Update Filter Logic in filteredOrders
- Extend the `filteredOrders` filter chain to include:
  - `storeNoFilter` - match against `order.metadata.store_no`
  - `paymentStatusFilter` - match against `order.payment_info.status`
  - `dateFromFilter` / `dateToFilter` - filter by `order.order_date` or `order.metadata.created_at`
  - `itemNameFilter` - search within `order.items[].product_name`
  - `customerNameFilter` - search within `order.customer.name`
  - `emailFilter` - search within `order.customer.email`
  - `phoneFilter` - search within `order.customer.phone`
  - `itemStatusFilter` - filter items by `fulfillmentStatus`
  - `paymentMethodFilter` - match against `order.payment_info.method`
  - `orderTypeFilter` - match against `order.order_type`
- Ensure all filters use AND logic (all must match)

### 7. Update getMockOrders Function
- Extend `getMockOrders()` function parameters in `src/lib/mock-data.ts`:
  ```typescript
  {
    // Existing
    status?: string
    channel?: string
    search?: string
    page?: number
    pageSize?: number
    dateFrom?: string
    dateTo?: string
    // New parameters
    storeNo?: string
    paymentStatus?: string
    paymentMethod?: string
    orderType?: string
    itemName?: string
    customerName?: string
    email?: string
    phone?: string
    itemStatus?: string
  }
  ```
- Add filter logic for each new parameter in the function body

### 8. Update handleResetAllFilters Function
- Extend `handleResetAllFilters` to reset all new filter states to their default values
- Ensure all filter inputs are cleared when "Clear All Filters" is clicked

### 9. Update removeFilter Function
- Extend `removeFilter` to handle removal of individual new filter types
- Add cases for each new filter badge type

### 10. Ensure Responsive Design
- Use Tailwind responsive classes for filter layout:
  - Mobile (`grid-cols-1`) - stack all filters vertically
  - Tablet (`sm:grid-cols-2`) - 2 columns for better space use
  - Desktop (`lg:grid-cols-4`) - 4 columns for advanced filters section
- Ensure touch targets are minimum 44px for mobile usability
- Test that collapsible section animates smoothly

### 11. Validate Implementation
- Run `pnpm dev` to start development server
- Navigate to Order Management page
- Test each filter individually:
  - Main filters apply correctly
  - Advanced filters toggle shows/hides section
  - Date range picker works with calendar popover
  - All dropdowns have correct options
  - Active filter badges appear and can be removed
  - Clear All Filters resets everything
- Test filter combinations (AND logic)
- Test mobile responsiveness
- Run `pnpm build` to ensure no TypeScript errors

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm dev` - Start development server and manually test filter functionality at http://localhost:3000/orders
- `pnpm build` - Ensure production build succeeds without TypeScript errors
- `pnpm lint` - Ensure no ESLint errors are introduced

## Notes
- The existing `AdvancedFilterPanel` component (`src/components/advanced-filter-panel.tsx`) is a modal-style panel. This chore creates an inline collapsible section instead, which provides a different UX pattern.
- Store No. options should be dynamically populated from actual order data if possible, or use a predefined list from `mockApiOrders`.
- Payment methods in mock data are: CREDIT_CARD, CASH, WALLET, QR_CODE
- Order types in mock data are: DELIVERY, PICKUP
- Item fulfillment statuses are: Pending, Picked, Packed, Shipped
- The Calendar component is already configured for react-day-picker v8 with custom styling.
- Ensure GMT+7 timezone handling for date filters using existing utility functions.
