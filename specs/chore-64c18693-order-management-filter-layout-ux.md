# Chore: Order Management Hub Filter Layout UX Improvements

## Metadata
adw_id: `64c18693`
prompt: `Analyze and improve the Order Management Hub filtering layout UI/UX in src/components/order-management-hub.tsx. Current issues: (1) Information overload with 15+ filters visible simultaneously, (2) Poor visual hierarchy between Quick Filters, Main Filters, Date filters, and Advanced Filters sections, (3) Inconsistent grouping - Payment Status in main but Payment Method in advanced, (4) Date Type dropdown adds unnecessary complexity, (5) No logical filter flow for common use cases. Goals: (1) Reorganize filters into logical groups (Search, Status/Channel, Date Range, Advanced), (2) Collapse advanced filters by default with clear toggle, (3) Improve visual hierarchy using cards/sections, (4) Ensure responsive design for tablet/mobile, (5) Keep Quick Filters prominent as primary action buttons, (6) Group related filters together (all payment filters, all date filters). Reference existing UI patterns from inventory-detail-view.tsx and stock-config-table.tsx for consistency. Use Playwright MCP to capture before/after screenshots for validation.`

## Chore Description
This chore addresses the UX issues in the Order Management Hub's filter section. The current implementation suffers from information overload with 15+ filters visible at once, poor visual hierarchy, and inconsistent grouping of related filters. The goal is to reorganize the filter layout to improve usability by:

1. **Consolidating related filters** - Group payment-related filters together (Payment Status, Payment Method), group date filters together
2. **Establishing clear visual hierarchy** - Use distinct sections with clear visual separation for Search, Core Filters, Date Filters, and Advanced Filters
3. **Improving collapsible advanced filters** - Keep advanced filters collapsed by default with a clear, prominent toggle
4. **Ensuring responsive design** - Maintain usability on tablet and mobile devices with proper wrapping and spacing
5. **Following established patterns** - Use filter grouping patterns from `stock-config-table.tsx` which effectively uses bordered containers with labels

## Relevant Files
Use these files to complete the chore:

- **src/components/order-management-hub.tsx** - Main file to modify. Contains all filter state (~20 useState hooks), filter UI rendering (lines 1929-2368), and the Collapsible advanced filters section
- **app/stock-config/page.tsx** - Reference for UI patterns. Uses bordered filter groups with labels (e.g., `flex items-center gap-2 p-2 border border-border/40 rounded-md bg-muted/5`) - see lines 764-816 for Location/Item filter grouping pattern
- **src/components/inventory-detail-view.tsx** - Reference for Card-based layouts and visual hierarchy using CardHeader/CardContent patterns
- **src/components/ui/collapsible.tsx** - Collapsible component for advanced filters section

### New Files
No new files needed - all changes are within the existing order-management-hub.tsx component.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Capture Before Screenshot
- Use Playwright MCP to navigate to `http://localhost:3000/orders` (Order Management page)
- Wait for page to fully load
- Capture a screenshot of the current filter layout for comparison
- Save as `.playwright-mcp/before-order-management-filters.png`

### 2. Reorganize Main Filters Section Structure
- Update the "Main Filters Section" (line ~1930) to use clearer visual grouping
- Create distinct subsections:
  - **Search Section**: Full-width search input spanning across the grid
  - **Core Filters Group**: Order Status, Store No, Channel in a bordered group with label "Order Filters"
  - **Payment Filters Group**: Payment Status (move from main) in a bordered group with label "Payment"
- Apply the stock-config pattern: `flex items-center gap-2 p-2 border border-border/40 rounded-md bg-muted/5`

### 3. Consolidate Date Filters Section
- Create a dedicated "Date Range" bordered group
- Include Date From and Date To pickers
- Remove the commented-out Date Type dropdown complexity (keep Order Date as default)
- Add clear visual separation from other filter groups
- Apply consistent styling: `border border-border/40 rounded-md bg-muted/5 p-3`

### 4. Improve Advanced Filters Section
- Move Payment Method filter from Advanced to the Payment group in main filters
- Reorganize remaining Advanced Filters into logical subgroups:
  - **Search Fields**: Product ID/SKU, Item Name
  - **Customer Fields**: Customer Name, Email, Phone
  - **Order Details**: Order Type
- Update the toggle button styling for better visibility using: `flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors`
- Consider adding a filter count badge showing number of active advanced filters

### 5. Add Active Filters Summary Bar
- Add a horizontal bar below the main filters section showing active filter badges
- Display clear "Clear All" button when any filters are active
- Style consistently with existing `generateActiveFilters` logic
- Pattern: `flex flex-wrap gap-2 items-center py-2` with Badge components

### 6. Update Responsive Grid Classes
- Adjust grid breakpoints for better tablet support:
  - Mobile (default): `grid-cols-1` - stack all filters vertically
  - Tablet (sm): `sm:grid-cols-2` - 2 columns for filter groups
  - Desktop (lg): `lg:grid-cols-4` or `lg:flex lg:flex-wrap` - horizontal layout
- Ensure filter groups wrap properly on smaller screens
- Test that all inputs maintain `min-w-[160px]` for readability

### 7. Apply Consistent Styling Improvements
- Add hover effects to filter groups: `hover:border-border/60 transition-colors`
- Use consistent input heights: `h-10` for all filter inputs and selects
- Apply label styling: `text-xs font-medium text-muted-foreground mb-1`
- Ensure proper spacing between groups: `gap-4` for main groups, `gap-2` for elements within groups

### 8. Capture After Screenshot and Validate
- Use Playwright MCP to capture the updated filter layout
- Save as `.playwright-mcp/after-order-management-filters.png`
- Compare before/after screenshots to verify improvements:
  - Clearer visual hierarchy
  - Better grouping of related filters
  - Responsive layout on different screen sizes
- Run TypeScript compilation to ensure no errors: `pnpm build`

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm build` - Ensure TypeScript compiles without errors
- `pnpm lint` - Verify no linting errors introduced
- Navigate to `http://localhost:3000/orders` in browser and verify:
  - Filter groups are clearly separated with visual containers
  - Related filters are grouped together (payment filters, date filters)
  - Advanced filters collapse/expand properly
  - Layout works on tablet (768px) and mobile (375px) widths
  - Active filters display correctly below the main filter section
  - Clear All button works to reset all filters

## Notes

### Current Filter State Variables (from lines 677-704):
- **Text search**: searchTerm, skuSearchTerm
- **Status/Channel**: statusFilter, channelFilter, storeNoFilter
- **Payment**: paymentStatusFilter, paymentMethodFilter
- **Dates**: dateFromFilter, dateToFilter, dateTypeFilter
- **Customer**: customerNameFilter, emailFilter, phoneFilter
- **Items**: itemNameFilter, itemStatusFilter, orderTypeFilter
- **FMS (commented out)**: deliveryTypeFilter, requestTaxFilter, settlementTypeFilter

### Existing UI Patterns to Follow (from stock-config-table.tsx):
```jsx
// Filter group container pattern
<div className="flex items-center gap-2 p-2 border border-border/40 rounded-md bg-muted/5">
  <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">Label</span>
  <Input ... />
</div>

// Filter row layout pattern
<div className="flex flex-wrap gap-3 items-center">
  {/* Filter groups */}
</div>
```

### Responsive Design Considerations:
- The current grid uses `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6`
- Consider switching to flexbox with `flex-wrap` for more natural wrapping
- Filter groups should have `min-w-[200px]` or similar to prevent squishing
- Date range should have dedicated space as it needs two pickers

### Performance Notes:
- Filter state updates already trigger page reset via `setCurrentPage(1)` in handlers
- No debouncing is currently applied to text inputs - consider adding if performance issues arise
- The `generateActiveFilters` useMemo already handles computing active filter count efficiently
