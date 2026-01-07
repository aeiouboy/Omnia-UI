# Chore: Revert Total Stock Calculation to Include Safety Stock

## Metadata
adw_id: `4a5a7fdc`
prompt: `Revert Total Stock calculation to include Safety Stock per business requirement. Total Stock = availableStock + reservedStock + safetyStock. In inventory-detail-view.tsx, change the Total Stock display from item.currentStock back to (item.availableStock + item.reservedStock + item.safetyStock). Update the tooltip to reflect this formula. For location-level Total Stock in Stock by Location cards, update getActiveStockForLocation() in warehouse-utils.ts to include stockSafetyStock: return location.stockAvailable + location.stockInProcess + location.stockSafetyStock. Also update mock data generation in generateMockWarehouseLocations() to properly distribute safetyStock across locations so location sums match product-level safetyStock.`

## Chore Description
This chore reverts the Total Stock calculation to include Safety Stock as a component, aligning with a specific business requirement. The new formula `Total Stock = availableStock + reservedStock + safetyStock` means that Total Stock represents the sum of all three stock types rather than physical inventory.

This change affects:
1. Product-level Total Stock display in the Stock Breakdown section
2. Location-level Total Stock calculation in Stock by Location cards
3. Mock data generation to ensure location sums match product-level totals
4. Tooltip documentation to reflect the new formula

## Relevant Files
Use these files to complete the chore:

- **src/components/inventory-detail-view.tsx** (lines 410-438) - Contains the Total Stock card in the Stock Breakdown section that currently displays `item.currentStock`. Need to change to calculated value `(item.availableStock + item.reservedStock + item.safetyStock)` and update tooltip.

- **src/lib/warehouse-utils.ts** (lines 147-149) - Contains `getActiveStockForLocation()` function that currently returns `location.stockAvailable + location.stockInProcess`. Need to add `+ (location.stockSafetyStock ?? 0)` to include safety stock.

- **src/lib/mock-inventory-data.ts** (lines 87-175) - Contains `generateMockWarehouseLocations()` function that generates mock warehouse location data. Need to add logic to distribute product-level `safetyStock` across locations proportionally, similar to how `availableStock` and `reservedStock` are distributed.

- **src/types/inventory.ts** (lines 145-205) - Contains `InventoryItem` interface documentation. May need to update comments on lines 153-154 to reflect that `currentStock` might differ from the business Total Stock definition if they diverge.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Update Product-Level Total Stock Display
- Open `src/components/inventory-detail-view.tsx`
- Locate the Total Stock card (lines 410-438)
- Change line 424 from `{formatStockQuantity(item.currentStock, item.itemType, false)}` to `{formatStockQuantity(item.availableStock + item.reservedStock + item.safetyStock, item.itemType, false)}`
- Update the tooltip content on line 436 from `<p className="max-w-xs">Total physical stock on hand (Available + Reserved)</p>` to `<p className="max-w-xs">Total stock including safety buffer (Available + Reserved + Safety)</p>`

### 2. Update Location-Level Total Stock Calculation
- Open `src/lib/warehouse-utils.ts`
- Locate the `getActiveStockForLocation()` function (lines 147-149)
- Update the function documentation comment (lines 132-146) to reflect that it now includes safety stock
- Change line 148 from `return location.stockAvailable + location.stockInProcess` to `return location.stockAvailable + location.stockInProcess + (location.stockSafetyStock ?? 0)`
- Update the function description to indicate it returns "Active stock + Safety stock" instead of just "Active stock"

### 3. Update Mock Data Generation for Safety Stock Distribution
- Open `src/lib/mock-inventory-data.ts`
- Locate the `generateMockWarehouseLocations()` function (lines 87-175)
- Add a `safetyStock` parameter to the function signature on line 87-91, similar to `availableStock` and `reservedStock`
- Add tracking variable `let remainingSafety = safetyStock ?? 0` around line 110
- In the distribution loop (lines 112-151), add logic to distribute safety stock proportionally:
  - For non-last locations: calculate `stockSafetyStock` using the same ratio pattern as `stockAvailable` and `stockInProcess`
  - For the last location: assign remaining safety stock to handle rounding
  - Update the `remainingSafety` counter after each allocation
- Update the fallback random generation case (lines 147-151) to generate a random `stockSafetyStock` value
- Update line 158 to use the calculated/distributed `stockSafetyStock` instead of the random value
- Update the function call in `ensureWarehouseLocations()` (line 216) to pass `item.safetyStock` as the third parameter

### 4. Verify Documentation and Comments
- Review the function documentation in `warehouse-utils.ts` for `getActiveStockForLocation()` to ensure it accurately describes the new behavior
- Ensure inline comments in `mock-inventory-data.ts` explain the safety stock distribution logic
- Verify that the Total Stock tooltip in `inventory-detail-view.tsx` clearly communicates the new formula

### 5. Test the Changes
- Build the application to check for TypeScript errors
- Visually inspect the inventory detail view to ensure Total Stock displays correctly
- Verify that location-level Total Stock sums match the product-level Total Stock
- Check that the tooltip displays the updated formula correctly

## Validation Commands
Execute these commands to validate the chore is complete:

- `npm run build` - Ensure TypeScript compilation succeeds with no errors
- `npm run lint` - Verify code follows linting standards
- Manual testing: Navigate to `/inventory` in dev mode, select a product, verify Stock Breakdown section shows Total Stock = Available + Reserved + Safety, and verify location cards show matching totals

## Notes
- This change represents a business logic shift where "Total Stock" now includes safety stock as a component rather than representing only physical inventory
- The `item.currentStock` field continues to represent physical inventory (Available + Reserved) per the database schema
- Ensure the proportional distribution logic for safety stock in `generateMockWarehouseLocations()` matches the existing patterns for `availableStock` and `reservedStock` to maintain data consistency
- The nullish coalescing operator (`?? 0`) is important for `location.stockSafetyStock` since it's an optional field
