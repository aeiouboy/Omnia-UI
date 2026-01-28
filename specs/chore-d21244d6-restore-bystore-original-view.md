# Chore: Restore Original Stock Card 'By Store' View

## Metadata
adw_id: `d21244d6`
prompt: `Restore original Stock Card 'By Store' view to show detailed store performance data (app/inventory-new/stores/page.tsx). The current implementation only shows Date Range filter and store overview listing. Restore the original behavior with View Type dropdown, Store ID/Name search, and proper data loading using fetchStorePerformance().`

## Chore Description
The Stock Card "By Store" view was redesigned to show a simplified Date Range filter with mock store overview data (`generateMockStoreOverview()`). This chore restores the original "By Store" implementation that used:

1. **View Type dropdown** with 5 specific types for filtering store data
2. **Store ID and Store Name search inputs** (minimum 2 characters to trigger)
3. **fetchStorePerformance()** from `lib/inventory-service.ts` for real data loading
4. **Original table columns**: Store Name (MapPin icon), Store ID, Total Products, Low Stock (yellow badge), Out of Stock (red badge), ChevronRight navigation icon
5. **Original data loading logic**: Require EITHER View Type selected OR valid Store search criteria

The current implementation incorrectly:
- Uses Date Range filter (which belongs only in By Product view)
- Uses `generateMockStoreOverview()` mock data instead of `fetchStorePerformance()`
- Uses `StoreStockOverview` type instead of `StorePerformance` type
- Missing View Type dropdown and Store search filters

## Relevant Files
Use these files to complete the chore:

- **app/inventory-new/stores/page.tsx** - Main Stock Card page to modify. Currently has incorrect By Store view implementation.
- **src/lib/inventory-service.ts** - Contains `fetchStorePerformance()` function that should be used for By Store view data loading. Returns `StorePerformanceResponse` with `StorePerformance[]` data.
- **src/types/inventory.ts** - Contains `StorePerformance` type (the correct type for By Store view) and `InventoryFilters` type for filtering.
- **src/lib/stock-card-mock-data.ts** - Contains `generateMockStoreOverview()` and `StoreStockOverview` type that need to be REMOVED from By Store view usage.
- **git show 7edb94b:app/inventory-new/stores/page.tsx** - Reference for original By Store implementation patterns.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Restore STOCK_CARD_VIEW_TYPES Constant
- Add back the View Type constant array at the top of the file (after imports, before component):
```typescript
const STOCK_CARD_VIEW_TYPES = [
  { value: "ECOM-TH-CFR-LOCD-STD", label: "ECOM-TH-CFR-LOCD-STD", description: "CFR - TOL" },
  { value: "ECOM-TH-CFR-LOCD-MKP", label: "ECOM-TH-CFR-LOCD-MKP", description: "CFR - MKP" },
  { value: "MKP-TH-CFR-LOCD-STD", label: "MKP-TH-CFR-LOCD-STD", description: "CFR - QC" },
  { value: "ECOM-TH-DSS-NW-STD", label: "ECOM-TH-DSS-NW-STD", description: "DS - STD" },
  { value: "ECOM-TH-DSS-LOCD-EXP", label: "ECOM-TH-DSS-LOCD-EXP", description: "DS - EXP" },
]
```

### 2. Restore Inventory View Context Usage
- Add back `useInventoryView` context import if not present
- Restore `selectedViewType`, `setViewType`, and `clearViewType` destructuring from `useInventoryView()`
- These are needed for the View Type dropdown functionality

### 3. Restore By Store State Variables
- Restore `storeIdSearch` and `storeNameSearch` state for By Store view (separate from By Product view's store search)
- Ensure `hasValidStoreIdSearch` and `hasValidStoreNameSearch` derived validation states exist
- Ensure `hasValidSearchCriteria` combines both validation states

### 4. Update By Store Data Loading Logic
- Replace `loadStoreOverview()` function with `loadData()` that uses `fetchStorePerformance()`
- Change filter criteria from Date Range to: `hasViewTypeFilter || hasValidSearchCriteria`
- Remove all references to `hasAllMandatoryFiltersForStore` Date Range validation for By Store view
- The data loading should trigger when EITHER:
  - View Type is selected (not "all")
  - OR Store ID/Name search has >= 2 characters

### 5. Remove Mock Data Dependencies from By Store View
- Remove `generateMockStoreOverview` from imports
- Remove `StoreStockOverview` type from imports (By Store uses `StorePerformance` type instead)
- Remove `storeOverviewData` state variable
- Remove `storeOverviewLoading` state variable
- The By Store view should use `storeData` (type `StorePerformance[]`) and `loading` state instead

### 6. Restore By Store Filter UI
Replace the current Date Range filter section in By Store view with:
- **View Type dropdown** (Select component with `selectedViewType` state, `w-[280px]` width)
- **Vertical divider** (`h-8 w-px bg-border`)
- **Store Search Group** (container with border, containing):
  - Label: "Store"
  - Store ID search input (Search icon, placeholder "Search Store ID...", min-w-[160px])
  - Store Name search input (Search icon, placeholder "Search Store Name...", min-w-[160px])
- **Spacer** (`flex-1`)
- **Clear All button** (clears `selectedViewType`, `storeIdSearch`, `storeNameSearch`)
- **Refresh button** (calls `loadData(false)`, disabled when loading or no valid filter criteria)

### 7. Update By Store Empty State
- Change empty state condition from `!hasAllMandatoryFiltersForStore` to `(!selectedViewType || selectedViewType === "all") && !hasValidSearchCriteria`
- Update empty state message to: "Select a view type or search for a store to display data"
- Add subtitle for partial search: "Store ID and Store Name searches require at least 2 characters"

### 8. Restore By Store Table Structure
Replace current store overview table with original table that uses `filteredAndSortedStores`:
- **Table columns** (all sortable except last):
  - Store Name (w-[300px], MapPin icon, sortable by "storeName")
  - Store ID (w-[150px], font-mono style, sortable by "storeId")
  - Total Products (text-center, sortable by "totalProducts")
  - Low Stock (text-center, Badge with yellow styling when > 0, sortable by "lowStockItems")
  - Out of Stock (text-center, Badge with red styling when > 0, sortable by "criticalStockItems")
  - Navigation icon column (w-[100px], ChevronRight icon)
- **Row click handler**: `handleStoreClick(store.storeName)` to navigate to `/inventory-new?store=...`
- **Zebra striping**: Alternate row backgrounds with `bg-muted/30`

### 9. Remove Date Range State/Logic from By Store View
- Keep Date Range state (`dateRange`) only for By Product view
- Remove Date Range from By Store filter validation logic
- By Store should NOT use `hasAllMandatoryFiltersForStore` that checks date range
- By Store filter validation: `(selectedViewType && selectedViewType !== "all") || hasValidSearchCriteria`

### 10. Keep By Product View Unchanged
- Verify By Product view still works with all its filters (Date Range, Product search, Store search, Transaction Type, Notes search)
- By Product remains the default tab (`viewTab` default = 'by-product')
- Transaction History table and all By Product functionality unchanged

### 11. Clean Up Unused Imports
- Remove `format` from date-fns if no longer used in By Store view
- Remove `Calendar`, `Popover`, `PopoverContent`, `PopoverTrigger` if only used by removed Date Range filter in By Store
- Keep all imports needed by By Product view

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm build` - Verify TypeScript compilation succeeds with no errors
- `pnpm lint` - Verify no ESLint errors
- Manual testing:
  1. Navigate to Stock Card page (`/inventory-new/stores`)
  2. Verify default tab is "By Product"
  3. Switch to "By Store" tab
  4. Verify View Type dropdown appears with 5 options
  5. Verify Store ID and Store Name search inputs appear
  6. Select a View Type - verify table shows store data
  7. Type 2+ characters in Store ID search - verify table filters
  8. Click Clear All - verify all filters reset
  9. Click a store row - verify navigation to `/inventory-new?store=...`
  10. Switch back to "By Product" tab - verify all By Product functionality works

## Notes
- The original implementation is available at `git show 7edb94b:app/inventory-new/stores/page.tsx` for reference
- The By Store view uses `StorePerformance` type (from `fetchStorePerformance()`) NOT `StoreStockOverview` type
- `StorePerformance` has fields: `storeName`, `storeId`, `totalProducts`, `lowStockItems`, `criticalStockItems`, `totalValue`, `healthScore`, `storeStatus`
- Health Score and Store Status columns were commented out in original implementation (per user request)
- The filtering and sorting logic (`filteredAndSortedStores`) should be reused from existing code
- Mobile card view for By Store is NOT required - only desktop table view
