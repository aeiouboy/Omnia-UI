# Chore: Fix Data Consistency Between Stock by Store and Inventory Pages

## Metadata
adw_id: `d5ca05ba`
prompt: `Fix data consistency between Stock by Store and Inventory pages: 1) In src/lib/mock-inventory-data.ts, update mockStorePerformance to calculate metrics dynamically from mockInventoryItems instead of using hardcoded values. Create a function generateStorePerformanceFromInventory() that: groups mockInventoryItems by storeName, calculates totalProducts count per store, calculates lowStockItems count (status === "low"), calculates criticalStockItems count (status === "critical"), calculates totalValue (sum of currentStock * unitPrice), calculates healthScore based on ratio of healthy items. 2) Export this function and use it in fetchStorePerformance() in src/lib/inventory-service.ts. 3) Ensure all 8 Tops stores have inventory items - if a store has no items in mockInventoryItems, add sample products for that store. 4) The drill-down from Stock by Store to Inventory should show the exact same count of products as displayed on the store card. Purpose: Ensure data consistency so users see accurate metrics when navigating between store overview and store-specific inventory views.`

## Chore Description
Fix data consistency issue where the Stock by Store overview page displays hardcoded metrics that don't match the actual inventory items shown when drilling down to a specific store's inventory. Currently, `mockStorePerformance` in `src/lib/mock-inventory-data.ts` uses hardcoded values for totalProducts, lowStockItems, criticalStockItems, totalValue, and healthScore. These values don't reflect the actual `mockInventoryItems` data, causing confusion when users navigate from the store overview to the filtered inventory page.

The solution involves dynamically calculating store performance metrics from the actual inventory items, ensuring that:
- The product count on store cards matches the number of products shown in the filtered inventory view
- Low stock and critical stock counts are accurate
- All 8 Tops stores have representative inventory items
- Health scores reflect the actual status distribution of products

## Relevant Files
Use these files to complete the chore:

- **src/lib/mock-inventory-data.ts** - Contains `mockInventoryItems` array and `mockStorePerformance` array. Need to create `generateStorePerformanceFromInventory()` function here to replace hardcoded store performance data with dynamically calculated metrics.

- **src/lib/inventory-service.ts** - Contains `fetchStorePerformance()` function (lines 280-298) that currently returns hardcoded mock data. Need to update this to use the new dynamic generation function.

- **src/types/inventory.ts** - Contains type definitions including `StorePerformance`, `InventoryItem`, `TopsStore`, and `InventoryStatus`. Reference for understanding data structures.

- **app/inventory/stores/page.tsx** - Stock by Store overview page that displays store performance cards. Shows totalProducts, lowStockItems, criticalStockItems, healthScore, and totalValue. This is where users see the store-level metrics.

- **app/inventory/page.tsx** - Main inventory page that filters by store when navigating from the store overview. The drill-down destination where users expect to see the same product count shown on the store card.

### New Files
None - all changes are to existing files.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Audit Current Inventory Data Coverage
- Read `src/lib/mock-inventory-data.ts` to identify which stores currently have inventory items
- Count inventory items per store in `mockInventoryItems` array (lines 169-718)
- Identify which of the 8 Tops stores are missing inventory items
- Note the distribution of statuses (healthy, low, critical) per store

### 2. Add Missing Inventory Items for Stores
- For any Tops store that has no items in `mockInventoryItems`, add at least 2-3 sample products
- Ensure new items follow the existing pattern with proper fields: id, productId, productName, category, storeName, currentStock, availableStock, reservedStock, safetyStock, status, etc.
- Distribute product categories and statuses realistically across stores
- Ensure `warehouseLocations` are generated using `generateMockWarehouseLocations()`

### 3. Create `generateStorePerformanceFromInventory()` Function
- Add a new exported function in `src/lib/mock-inventory-data.ts` after the `mockInventoryItems` export (around line 723)
- Function signature: `export function generateStorePerformanceFromInventory(): StorePerformance[]`
- Group `mockInventoryItems` by `storeName` field
- For each of the 8 Tops stores, calculate:
  - `totalProducts`: Count of items for that store
  - `lowStockItems`: Count where `status === "low"`
  - `criticalStockItems`: Count where `status === "critical"`
  - `totalValue`: Sum of `(currentStock * unitPrice)` for all items
  - `healthScore`: Percentage of healthy items calculated as `(healthyCount / totalProducts) * 100`, rounded to 1 decimal
- Return array of `StorePerformance` objects matching the type definition
- Ensure all 8 Tops stores are included in the result, even if they have 0 products (to avoid breaking the UI)

### 4. Replace Hardcoded `mockStorePerformance` with Dynamic Generation
- In `src/lib/mock-inventory-data.ts`, replace the hardcoded `mockStorePerformance` array (lines 728-793) with:
  ```typescript
  export const mockStorePerformance: StorePerformance[] = generateStorePerformanceFromInventory()
  ```
- Remove the old hardcoded array entirely
- This ensures the exported data is always dynamically generated

### 5. Update `fetchStorePerformance()` in Inventory Service
- In `src/lib/inventory-service.ts`, update the `fetchStorePerformance()` function (lines 280-298)
- Import `generateStorePerformanceFromInventory` from mock-inventory-data
- Replace the hardcoded return statement with:
  ```typescript
  const stores = generateStorePerformanceFromInventory()
  return {
    stores,
    total: stores.length,
  }
  ```
- Update the console.info message to clarify that data is dynamically generated from inventory items

### 6. Verify Data Consistency
- Manually test by checking inventory items count for each store in the mock data
- Cross-reference with the calculated `totalProducts` in the generated store performance
- Verify that navigating from Stock by Store page to filtered Inventory page shows matching counts
- Ensure low stock and critical stock counts match between overview and detail views
- Confirm health scores reflect the actual status distribution

### 7. Test Health Score Calculation
- Verify health score formula handles edge cases:
  - Stores with 0 products should have healthScore of 0 or 100 (define business rule)
  - Stores with only healthy items should have healthScore = 100
  - Stores with all critical items should have healthScore = 0
  - Mixed status stores should have accurate percentage
- Add inline comments documenting the health score calculation logic

### 8. Validate All 8 Tops Stores Have Data
- Ensure `generateStorePerformanceFromInventory()` returns exactly 8 store performance objects
- Verify each store name matches the `TopsStore` type exactly
- Check that stores without inventory items still appear in the result with 0 counts (graceful handling)

## Validation Commands
Execute these commands to validate the chore is complete:

- **Compile Check**: `pnpm build` - Verify TypeScript compiles without errors
- **Type Check**: `npx tsc --noEmit` - Ensure all types are correct
- **Development Test**: `pnpm dev` - Start dev server and manually navigate:
  1. Go to `/inventory/stores` - note the product count for a specific store
  2. Click on that store card to navigate to `/inventory?store=<storeName>`
  3. Verify the product count matches exactly
  4. Repeat for stores with low stock and critical stock items
- **Data Consistency Check**: Open browser console and run:
  ```javascript
  // After page loads on /inventory/stores
  console.table(document.querySelector('[data-store-performance]'))
  ```
- **Manual Verification**:
  - Check that all 8 Tops stores appear on the Stock by Store page
  - Verify low stock and critical stock badges match when drilling down
  - Confirm health scores are realistic percentages (0-100)
  - Test search and filter functionality still works correctly

## Notes
- **Data Integrity**: The primary goal is ensuring that store-level metrics accurately reflect the underlying inventory items, eliminating discrepancies between overview and detail views
- **Health Score Formula**: Define healthy items as those with `status === "healthy"`. Health score should be: `(healthyItems / totalProducts) * 100`, with proper handling for division by zero
- **Zero-Product Stores**: If a store has 0 products after inventory audit, either add sample items OR ensure the health score calculation handles this gracefully (suggest healthScore = 0 for empty stores)
- **Performance**: Since this is mock data, calculation performance is not a concern. The function can be called on every render if needed
- **Future Database Integration**: When Supabase is properly configured, this same aggregation logic should be implemented as a database query or view for production use
- **Testing Coverage**: This is a data consistency fix, so focus on manual testing of the drill-down navigation flow rather than unit tests
- **Warehouse Locations**: Ensure all new inventory items added have `warehouseLocations` properly populated using the existing `generateMockWarehouseLocations()` helper
