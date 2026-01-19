# Chore: Fix Inventory Supply Page Filter Logic

## Metadata
adw_id: `da8e4034`
prompt: `Fix the Inventory Supply page (app/inventory-new/supply/page.tsx) filter logic issue where data doesn't display correctly when users don't search by Store ID/Store Name or Item ID/Product Name. The expected behavior is: (1) When user searches by Store ID or Store Name - show all products under that store for the selected View Type, (2) When user searches by Item ID or Product Name - show that product across all stores that have it, (3) When NO search filters are applied - data should still display (all records). Analyze the current filteredData useMemo logic and fix any conditions that prevent data from displaying when search fields are empty. Ensure the View Type dropdown works correctly both with and without store/item filters applied.`

## Chore Description
The Inventory Supply page (`app/inventory-new/supply/page.tsx`) has a filter logic issue where data may not display correctly in certain scenarios:

1. **Store-based Search**: When filtering by Store ID or Store Name, the page should show all products at that store for the selected View Type
2. **Product-based Search**: When filtering by Item ID or Product Name, the page should show that product across all stores
3. **No Filters Applied**: When no search filters are used, all records should display (currently may show "No results found")

**Root Cause Analysis**: After reviewing the code, the current `filteredData` useMemo logic at lines 92-148 appears structurally correct. Each filter condition only returns `false` when a filter is active AND the item doesn't match. When filters are empty strings, conditions like `if (storeId && ...)` evaluate to falsy and skip the filter.

However, there may be edge cases:
- The `item.storeId` field might be undefined for some mock data items
- The `item.view` field check for View Type might exclude items without a view assigned
- Data might not be loading initially (check `data.length` after fetch)

## Relevant Files
Use these files to complete the chore:

- **`app/inventory-new/supply/page.tsx`**: Main page component with filter logic in `filteredData` useMemo (lines 92-148). Contains all filter state management and UI.
- **`src/lib/inventory-service.ts`**: Data fetching service with `fetchInventoryData()` function. Returns `InventoryDataResponse` with items array.
- **`src/lib/mock-inventory-data.ts`**: Mock data generator. The `ensureWarehouseLocationsAndNewFields()` function (lines 398-444) populates `storeId`, `storeName`, and `view` fields.
- **`src/types/inventory.ts`**: TypeScript types for `InventoryItem` interface defining `storeId?` (optional), `storeName`, `productId`, `productName`, `view?` (optional) fields.

### New Files
None needed.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Verify Data Loading and Initial State
- Add console logging to `loadData()` function to verify data is being fetched
- Check `data.length` after fetch completes to confirm items are loaded
- Verify the `loading` state transitions correctly (true → false)

### 2. Analyze Filter Logic for Edge Cases
- Review the `filteredData` useMemo at lines 92-148
- Check if optional fields (`storeId?`, `view?`) could cause filtering issues when undefined
- Verify the View Type filter at line 120 handles items without a `view` property

### 3. Fix View Type Filter Logic
- Current: `if (viewType !== "all" && item.view !== viewType)` - excludes items where `item.view` is undefined
- Fix: Change to `if (viewType !== "all" && item.view && item.view !== viewType)` or ensure all items have a `view` property
- This ensures items without a view assignment are included when View Type is "all"

### 4. Add Defensive Checks for Optional Fields
- For Store ID filter: Add null check `!item.storeId` is already handled with `|| !item.storeId`
- For Product Name filter: Already has `!item.productName` check
- Verify consistency across all text search filters

### 5. Test Filter Combinations
- Test with NO filters: All records should display
- Test with only View Type selected: Records matching that view should display
- Test with Store Name only: All products at matching stores should display
- Test with Product Name only: That product across all stores should display

### 6. Add Debug Logging (Optional, Remove Before Final)
- Add `console.log('filteredData count:', filteredData.length)` to track filtering results
- Add `console.log('data count:', data.length)` to verify source data

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm build` - Ensure no TypeScript errors after changes
- `pnpm dev` - Start development server and manually test:
  1. Navigate to `/inventory-new/supply`
  2. Verify data displays without any filters applied
  3. Select a View Type and verify matching records display
  4. Enter a Store Name and verify filtering works
  5. Enter a Product Name and verify filtering works
  6. Clear all filters and verify all records return

## Notes
- The filter logic structure is correct; the issue may be related to:
  1. Data not loading initially
  2. Items missing optional fields (storeId, view) causing them to be filtered out
  3. Mock data not having consistent field population
- The `ensureWarehouseLocationsAndNewFields()` function in mock-inventory-data.ts ensures all items have `storeId` and `view` fields, so this should work correctly
- If data still doesn't display, check if `fetchInventoryData()` is returning items correctly
