# Chore: Fix location-level Total Stock display to align with product-level Total Stock

## Metadata
adw_id: `0328e68b`
prompt: `Fix location-level Total Stock display to align with product-level Total Stock concept.`

## Chore Description
The Stock by Location cards in the Inventory Detail View display 'Total Stock' values that are inconsistent with the product-level Total Stock. The current implementation uses `getTotalStockForLocation()` which sums all stock fields including `stockSold`, `stockOnHold`, and `stockPending` - fields that are randomly generated and don't align with the product-level Total Stock concept.

**Current Behavior:**
- Product Total Stock: 245 (using `item.currentStock`)
- Location CMG Total Stock: 251 (using `getTotalStockForLocation()`)
- Location TPS-1005 Total Stock: 148
- Sum of locations: 399 ≠ 245 (confusing to users)

**Expected Behavior:**
- Location Total Stock should equal: `stockAvailable + stockInProcess` (matching product-level Available + Reserved)
- Location 1 Total: 157 + 17 = 174
- Location 2 Total: 63 + 8 = 71
- Sum: 174 + 71 = 245 = Product Total Stock

## Relevant Files
Use these files to complete the chore:

- **`src/lib/warehouse-utils.ts`** - Contains `getTotalStockForLocation()` function that currently calculates total including all stock fields. Add new helper function here.
- **`src/components/inventory-detail-view.tsx`** (line ~603) - Uses `getTotalStockForLocation()` to calculate `totalLocationStock`. Update to use new calculation.
- **`src/types/inventory.ts`** - Reference for `StockLocation` interface definition showing available stock fields.

### New Files
- No new files needed

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Add helper function to warehouse-utils.ts
- Add a new function `getActiveStockForLocation(location: StockLocation): number`
- The function should return `location.stockAvailable + location.stockInProcess`
- Add JSDoc comment explaining this aligns with product-level Total Stock (Available + Reserved)
- Place it after the existing `getTotalStockForLocation()` function for logical grouping

### 2. Update inventory-detail-view.tsx to use new calculation
- Import `getActiveStockForLocation` function (replace or add to existing import from warehouse-utils)
- Update line ~603 where `totalLocationStock` is calculated:
  - Change from: `const totalLocationStock = getTotalStockForLocation(location)`
  - Change to: `const totalLocationStock = getActiveStockForLocation(location)`

### 3. Validate the changes
- Run the development server
- Navigate to an inventory item detail page with multiple locations
- Verify that the sum of location Total Stock values equals the product's Total Stock (currentStock)
- Verify the Stock by Location cards display correctly formatted values

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm lint` - Ensure no linting errors introduced
- `pnpm build` - Verify the build succeeds without TypeScript errors
- `pnpm dev` - Start development server and manually verify:
  1. Navigate to `/inventory` and select a product with multiple warehouse locations
  2. Check that the sum of all location "Total Stock" values equals the product's "Total Stock"
  3. Confirm the Available and Reserved values display correctly at both product and location levels

## Notes
- The existing `getTotalStockForLocation()` function is NOT being removed as it may be used elsewhere for true physical inventory calculations
- The new `getActiveStockForLocation()` function specifically represents "active" stock that aligns with product-level Available + Reserved totals
- This fix ensures UI consistency without changing the underlying data model
