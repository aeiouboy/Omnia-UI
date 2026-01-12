# Chore: Add Store Status Column and Rename Location Status to Store Status

## Metadata
adw_id: `a5f2ba0f`
prompt: `Add 'Store Status' column to Stock by Store page and rename Location Status to Store Status.`

## Chore Description
This chore involves two related changes:
1. **Add 'Store Status' column** to the Stock by Store page (`/inventory/stores`) - both table view and card view
2. **Rename 'Location Status' to 'Store Status'** in the Inventory Detail page's Stock by Store table

The Store Status column will display 'Active' (green badge/dot) or 'Inactive' (gray badge/dot) values, indicating whether a store is currently operational.

## Relevant Files
Use these files to complete the chore:

- **app/inventory/stores/page.tsx** - Stock by Store page with table and card views. Currently displays: Store Name, Total SKUs, Low Stock, Out of Stock, Health Score. Need to add Store Status column to table view (line ~405-470) and status indicator to card view (line ~329-396).

- **src/components/inventory/stock-by-store-table.tsx** - The Stock by Store table component used in inventory detail view. Already has `locationStatus` column (line ~229-237 for header, line ~297-313 for cell). Need to rename "Location Status" to "Store Status" in header text (line 235).

- **src/lib/mock-inventory-data.ts** - Mock data generator. Already has `locationStatus` field in `generateMockWarehouseLocations()` function (line ~269) with logic to assign 'Active' or 'Inactive' values. The `StorePerformance` type does NOT have storeStatus field - need to verify if we need to add it for the stores page.

- **src/types/inventory.ts** - Type definitions. The `StockLocation` interface already has `locationStatus?: 'Active' | 'Inactive'` field (line ~132). May need to add `storeStatus` field to `StorePerformance` interface (line ~244-251) for the stores page.

### New Files
- None required. All changes are modifications to existing files.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Add storeStatus Field to StorePerformance Type
- Open `src/types/inventory.ts`
- Add `storeStatus?: 'Active' | 'Inactive'` field to the `StorePerformance` interface (around line 251)
- This enables the stores page to display store status

### 2. Update Mock Data Generator for Store Status
- Open `src/lib/mock-inventory-data.ts`
- In the `generateStorePerformanceFromInventory()` function (line ~909), add storeStatus field to each store
- Use deterministic logic based on store name to assign 'Active' or 'Inactive' values
- Most stores should be Active, 1-2 stores should be Inactive for testing
- Example: Make "Tops จตุจักร" Inactive for testing purposes

### 3. Add Store Status Column to Stores Page Table View
- Open `app/inventory/stores/page.tsx`
- Add TableHead for "Store Status" after "Health Score" column header (around line 410)
- Make it sortable by adding onClick handler
- Add TableCell with Badge displaying Active (green) or Inactive (gray) status
- Include colored dot indicator inside badge (similar to stock-by-store-table.tsx implementation)

### 4. Add Store Status Indicator to Stores Page Card View
- In `app/inventory/stores/page.tsx`, locate the card view section (line ~329-396)
- Add Store Status badge below the store name or near the health score
- Use consistent styling with the table view (green for Active, gray for Inactive)

### 5. Rename Location Status to Store Status in Stock by Store Table
- Open `src/components/inventory/stock-by-store-table.tsx`
- Change column header text from "Location Status" to "Store Status" (line ~235)
- The sorting field name `locationStatus` and data field `locationStatus` can remain unchanged as this is internal implementation detail

### 6. Add Sorting Logic for Store Status in Stores Page
- In `app/inventory/stores/page.tsx`, add state for sorting (if not already present for store status)
- Update the filteredAndSortedStores useMemo to support sorting by storeStatus

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm dev` - Start development server
- Navigate to `http://localhost:3000/inventory/stores` - Verify:
  - Table view shows 'Store Status' column with Active/Inactive badges
  - Card view shows Store Status indicator
  - Column is sortable
  - Most stores show Active, 1-2 show Inactive
- Navigate to `http://localhost:3000/inventory` and click on any product to view detail page - Verify:
  - Stock by Store table shows 'Store Status' column header (renamed from Location Status)
- `pnpm build` - Ensure no TypeScript errors

## Notes
- The `locationStatus` field in `StockLocation` interface is for warehouse locations (per-product granularity)
- The new `storeStatus` field in `StorePerformance` interface is for store-level status (store-wide granularity)
- Both use the same 'Active' | 'Inactive' type values and similar UI styling for consistency
- The internal field names (`locationStatus`) don't need to change as they're implementation details - only the user-facing labels need updating
