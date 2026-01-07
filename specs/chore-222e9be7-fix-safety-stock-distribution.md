# Chore: Fix Safety Stock Distribution in generateMockWarehouseLocations()

## Metadata
adw_id: `222e9be7`
prompt: `Fix Safety Stock distribution in generateMockWarehouseLocations(). The function is not properly distributing safetyStock to warehouse locations - all locations show stockSafetyStock as 0 even though the product has safetyStock of 75. In mock-inventory-data.ts, ensure the generateMockWarehouseLocations function: 1) Accepts safetyStock parameter (already added), 2) Distributes safetyStock proportionally across locations using the same pattern as availableStock and reservedStock distribution, 3) Assigns remaining safetyStock to the last location to handle rounding. The expected result: sum of all location stockSafetyStock values should equal product safetyStock, and sum of location Total Stock should equal product Total Stock (Available + Reserved + Safety).`

## Chore Description

The `generateMockWarehouseLocations()` function in `src/lib/mock-inventory-data.ts` is not properly distributing safety stock to warehouse locations. The function already accepts a `safetyStock` parameter and has logic to distribute it proportionally across locations (lines 142, 148, 152), but there is a hardcoded call on line 259 that omits the safetyStock parameter when generating warehouse locations for product PROD-001.

**Current Behavior:**
- Product PROD-001 has `safetyStock: 75` defined on line 247
- The `generateMockWarehouseLocations()` call on line 259 only passes 3 parameters: `("PROD-001", 220, 25)`
- The missing 4th parameter (safetyStock: 75) causes the function to use the default value of `undefined`
- When safetyStock is undefined, the function defaults it to 0 (line 114: `let remainingSafety = safetyStock ?? 0`)
- All warehouse locations end up with `stockSafetyStock: 0`

**Root Cause:**
Line 259 calls `generateMockWarehouseLocations("PROD-001", 220, 25)` without passing the 4th parameter for safetyStock (which should be 75).

**Expected Behavior:**
- Pass the safetyStock parameter (75) to the function
- The function will distribute the 75 units of safety stock proportionally across warehouse locations
- Sum of all `location.stockSafetyStock` values should equal `product.safetyStock` (75)
- Sum of all location Total Stock should equal product Total Stock: `(220 + 25 + 75) = 320`

## Relevant Files

- **src/lib/mock-inventory-data.ts** (line 259)
  - Contains the hardcoded call missing the safetyStock parameter
  - The function logic is already correct and handles safety stock distribution properly
  - Only need to fix the function call to pass all 4 parameters

## Step by Step Tasks

### 1. Add safetyStock Parameter to Hardcoded Call
- Locate line 259: `warehouseLocations: generateMockWarehouseLocations("PROD-001", 220, 25),`
- Update the call to include the 4th parameter for safetyStock: `generateMockWarehouseLocations("PROD-001", 220, 25, 75)`
- The value 75 matches the product's safetyStock defined on line 247

### 2. Verify Data Consistency
- Confirm that the product PROD-001 has these values:
  - `availableStock: 220` (line 245)
  - `reservedStock: 25` (line 246)
  - `safetyStock: 75` (line 247)
- Verify that the function call now passes all three stock values correctly

### 3. Test the Distribution Logic
- Run the application in development mode to verify the fix
- Check that warehouse locations for PROD-001 now have non-zero `stockSafetyStock` values
- Verify that sum of all location `stockSafetyStock` equals 75
- Verify that sum of all location `stockAvailable` equals 220
- Verify that sum of all location `stockInProcess` equals 25
- Confirm total stock across all locations equals 320 (220 + 25 + 75)

## Validation Commands

Execute these commands to validate the chore is complete:

- `pnpm dev` - Start development server and verify no build errors
- **Manual Verification**: Open browser to http://localhost:3000 and navigate to inventory detail page for product PROD-001
- **Console Check**: In browser DevTools, verify warehouse locations have distributed safety stock:
  ```javascript
  // Check that locations have safety stock distributed
  const locations = // ... get locations for PROD-001
  const totalSafety = locations.reduce((sum, loc) => sum + loc.stockSafetyStock, 0)
  console.log('Total Safety Stock:', totalSafety) // Should equal 75
  ```
- `pnpm build` - Ensure production build completes without errors

## Notes

- The function's distribution logic (lines 134-153) is already correct and properly handles safety stock
- The `ensureWarehouseLocations()` helper function (lines 224-228) already passes safetyStock correctly
- This is a simple fix - only need to update one function call to pass the missing parameter
- The fix ensures data consistency between product-level stock values and location-level breakdowns
- After this fix, the formula holds true: `product.currentStock = sum(location.stockAvailable) + sum(location.stockInProcess) + sum(location.stockSafetyStock)`
