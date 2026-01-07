# Chore: Fix inventory mock data quantity inconsistencies

## Metadata
adw_id: `206d9310`
prompt: `Fix inventory mock data quantity inconsistencies across all sections. The problem: stock quantities don't match between product-level display, warehouse location breakdown, and summary KPIs.`

## Chore Description
The inventory management system has data inconsistencies where stock quantities don't align between different views:
1. Product-level `currentStock` doesn't equal `availableStock + reservedStock` correctly
2. Warehouse location stock sums don't match product-level totals
3. The Stock Breakdown section in `inventory-detail-view.tsx` incorrectly calculates Total Stock as `availableStock + reservedStock + safetyStock` (safety stock is a threshold, not actual inventory)
4. `getTotalStockForLocation()` includes sold, on-hold, and pending stock but not safety stock (which is correct behavior but needs documentation)
5. `fetchInventorySummary()` only counts items from the first page instead of all 24 mock items

### Expected Data Relationships:
- **Product level**: `currentStock = availableStock + reservedStock`
- **Safety stock** is a MINIMUM THRESHOLD for when to reorder, not additional physical stock
- **Location level**: Sum of all location `stockAvailable` should equal product `availableStock`
- **Location level**: Sum of all location `stockInProcess` (reserved) should equal product `reservedStock`
- **KPI summary**: Should count all 24 mock inventory items, not just the first page (25 default page size happens to work, but should be explicit)

## Relevant Files
Use these files to complete the chore:

- **`src/lib/mock-inventory-data.ts`** - Contains mock inventory items and `generateMockWarehouseLocations()`. The warehouse location generator creates random stock values that don't correlate with product-level stock values. Need to fix this to ensure location sums match product totals.

- **`src/components/inventory-detail-view.tsx`** - Contains the Stock Breakdown UI section. Line 424 incorrectly shows Total Stock as `availableStock + reservedStock + safetyStock`. Should display `currentStock` which equals `availableStock + reservedStock`. Also need to update the tooltip on line 436.

- **`src/lib/warehouse-utils.ts`** - Contains `getTotalStockForLocation()` which calculates total for a single location. Current implementation (lines 108-116) includes stockAvailable, stockInProcess, stockSold, stockOnHold, stockPending but NOT stockSafetyStock. This is correct behavior since safety stock is a threshold, not physical inventory. However, for clarity, this should be documented with comments.

- **`src/lib/inventory-service.ts`** - Contains `fetchInventorySummary()` which calls `fetchInventoryData()` without pagination override. Line 402-404 only counts items from `data.items` which is limited by default page size. Should pass a filter to get all items or use `mockInventoryItems.length` directly for mock data.

- **`src/types/inventory.ts`** - Contains type definitions. The `InventoryItem` interface comments on lines 92-97 correctly document that `currentStock` should equal `availableStock + reservedStock`, but the mock data doesn't follow this.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Fix mock inventory data stock relationship in `mock-inventory-data.ts`
- Verify all 24 mock inventory items have `currentStock = availableStock + reservedStock`
- Current items already follow this pattern correctly (verified: e.g., INV-001 has currentStock=245, availableStock=220, reservedStock=25, which equals 245)
- No changes needed to the base mock items - they are already correct

### 2. Fix `generateMockWarehouseLocations()` to match product totals
- Current implementation generates random `stockAvailable` and `stockInProcess` values that don't correlate with product-level stock
- Modify the function to accept product `availableStock` and `reservedStock` as parameters
- Distribute the product's available stock across locations proportionally
- Distribute the product's reserved stock (stockInProcess) across locations proportionally
- Ensure: `sum(location.stockAvailable)` = product `availableStock`
- Ensure: `sum(location.stockInProcess)` = product `reservedStock`
- Keep other fields (stockSold, stockOnHold, stockPending, stockUnusable) as supplementary tracking data that doesn't affect core totals

### 3. Update warehouse location generation calls in `ensureWarehouseLocations()`
- Modify `ensureWarehouseLocations()` function to pass product stock values to `generateMockWarehouseLocations()`
- Pass `item.availableStock` and `item.reservedStock` to ensure location stocks match product totals

### 4. Fix Total Stock calculation in `inventory-detail-view.tsx`
- Line 424: Change `item.availableStock + item.reservedStock + item.safetyStock` to `item.currentStock`
- Line 436 tooltip: Update to say "Total physical stock on hand (Available + Reserved)" instead of including safety stock

### 5. Add documentation comment to `getTotalStockForLocation()` in `warehouse-utils.ts`
- Add JSDoc comment explaining that this returns physical stock for a location
- Clarify that `stockSafetyStock` is intentionally excluded because it represents a threshold, not physical inventory
- Document that the returned total includes: stockAvailable + stockInProcess + stockSold + stockOnHold + stockPending

### 6. Fix `fetchInventorySummary()` to count all items in `inventory-service.ts`
- Current implementation relies on default page size (25) which happens to include all 24 items
- Modify to explicitly fetch all items by passing a large pageSize or counting mockInventoryItems directly
- Option A: Pass `pageSize: 1000` to `fetchInventoryData()` to ensure all items are returned
- Option B: For mock data, use `mockInventoryItems.length` directly (more efficient)
- Implement Option B for better performance since we can detect mock data usage

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm build` - Verify no TypeScript errors
- `pnpm lint` - Verify no linting issues
- `pnpm dev` - Start dev server and manually verify:
  1. Navigate to `/inventory` - Check that total products KPI shows 24
  2. Click on any product to view detail page
  3. Verify Stock Breakdown section shows:
     - Total Stock = Available Stock + Reserved Stock (NOT including Safety Stock)
     - Total Stock matches the product's `currentStock` value
  4. Verify Stock by Location section shows:
     - Sum of all location "Available" values = product "Available Stock"
     - Sum of all location "Reserved" values = product "Reserved Stock"
  5. Navigate back to `/inventory` and verify KPI counts match:
     - Total Products: 24
     - Healthy/Low/Critical counts match actual item statuses

## Notes
- Safety stock is a **threshold** indicating when to reorder, not physical stock that should be counted in totals
- The `currentStock` represents total physical inventory: items ready for sale (available) + items allocated to orders (reserved)
- Warehouse location `stockSafetyStock` represents the safety threshold for that specific location
- Other location fields (stockSold, stockOnHold, stockPending, stockUnusable) are for detailed tracking but the primary relationship is: `currentStock = availableStock + reservedStock`
- The mock data items (INV-001 through INV-024) already follow the correct stock relationship; the issue is primarily in the warehouse location generation and the UI display calculation
