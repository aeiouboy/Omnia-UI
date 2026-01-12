# Chore: Fix Recent Transactions Store Context Filtering

## Metadata
adw_id: `c104dc69`
prompt: `Fix Recent Transactions not showing when viewing inventory detail with store context. In inventory-detail-view.tsx the storeContext filtering uses warehouseCode but mock transactions may use different store identifiers. Investigate the transaction filtering logic and fix the store matching to properly display filtered transactions when storeContext exists.`

## Chore Description

When viewing inventory detail pages with a store context (e.g., navigating from the store view via URL parameter `?store=Tops+Central+World`), the Recent Transactions section does not display any transactions.

**Root Cause Analysis:**

1. **Store Context Parameter**: The page receives `store` URL parameter (e.g., "Tops Central World") which is passed to `InventoryDetailView` as `storeContext` prop (line 73 in `app/inventory/[id]/page.tsx`).

2. **Filtering Logic Issue**: The component filters transactions by comparing `storeContext` to `transaction.warehouseCode`:
   ```typescript
   const filteredTransactions = storeContext
     ? transactions.filter(t => t.warehouseCode === storeContext)
     : transactions
   ```

3. **Data Mismatch**:
   - `storeContext` contains store names like "Tops Central World" (from Tops store list)
   - `transaction.warehouseCode` contains warehouse codes like "CDC-BKK01", "RWH-CW", "STW-001" (generated from `WAREHOUSE_CODES` constant)
   - These values never match, resulting in empty filtered transaction list

**Expected Behavior:**
When viewing inventory detail with store context, transactions should be filtered to show only those related to the specified store.

**Current Behavior:**
No transactions are displayed because store names never match warehouse codes.

## Relevant Files

### Existing Files

- **`src/components/inventory-detail-view.tsx`** (lines 105-108)
  - Contains the filtering logic that needs to be fixed
  - Filters transactions based on `warehouseCode` comparison

- **`src/lib/mock-inventory-data.ts`** (lines 1040-1177)
  - `generateMockTransactions()` function generates transactions with `warehouseCode` field
  - Uses warehouse codes from `WAREHOUSE_CODES` constant (lines 141-156)
  - Picks random warehouse location from item's `warehouseLocations` array (lines 1082-1084)

- **`src/types/inventory.ts`** (lines 355-392)
  - `StockTransaction` interface defines transaction structure
  - Has both `warehouseCode` and optional `locationCode` fields
  - No direct link to store name

- **`app/inventory/[id]/page.tsx`** (lines 46-77)
  - Passes `store` search parameter as `storeContext` to `InventoryDetailView`
  - `store` parameter contains Tops store names (e.g., "Tops Central World")

### Files to Modify

- **`src/components/inventory-detail-view.tsx`** (lines 105-108)
  - Update filtering logic to handle store-to-warehouse mapping

- **`src/lib/mock-inventory-data.ts`** (lines 1040-1177)
  - Optionally enhance transaction generation to include better store context

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Create Store-to-Warehouse Mapping Utility
- Add a new utility function in `src/lib/mock-inventory-data.ts` that maps store names to their associated warehouse codes
- Use the existing inventory items data to build this mapping (each item has `storeName` and `warehouseLocations` with `warehouseCode`)
- Export this mapping function for use in other components
- Map each Tops store name to the warehouse codes that appear in that store's items

### 2. Update Transaction Filtering Logic
- Modify `inventory-detail-view.tsx` filtering logic (lines 105-108)
- Instead of direct `warehouseCode === storeContext` comparison:
  - Use the store-to-warehouse mapping to get warehouse codes for the store
  - Filter transactions where `warehouseCode` is in the mapped warehouse codes
- Handle cases where storeContext doesn't match any known store (return all transactions)

### 3. Enhance Transaction Generation (Optional Improvement)
- In `generateMockTransactions()` function (lines 1082-1084):
  - Ensure transactions pick warehouse locations that align with the item's store
  - Filter `item.warehouseLocations` to only use locations that match the item's `storeName` if needed
- This ensures better data consistency between items and their transactions

### 4. Test Transaction Filtering
- Navigate to inventory detail page with store context: `/inventory/[id]?store=Tops+Central+World`
- Verify transactions are displayed in the Recent Transactions section
- Verify transactions only show those related to the specified store's warehouses
- Navigate to inventory detail without store context: `/inventory/[id]`
- Verify all transactions are displayed (no filtering)

### 5. Validate Data Consistency
- Check that filtered transactions have `warehouseCode` values that logically belong to the specified store
- Ensure transaction counts match expectations (some transactions visible, not empty)
- Test with multiple different store contexts to ensure mapping works for all stores

## Validation Commands

Execute these commands to validate the chore is complete:

- `pnpm build` - Ensure TypeScript compilation succeeds with no errors
- `pnpm lint` - Verify code meets linting standards
- Manual testing:
  - Open browser to `http://localhost:3000/inventory`
  - Click on any inventory item to view details
  - Add `?store=Tops+Central+World` to URL
  - Verify Recent Transactions section shows transactions (not empty)
  - Remove store parameter from URL
  - Verify all transactions are visible

## Notes

**Design Decision:**
- The fix should maintain backwards compatibility with existing transaction data structure
- Avoid adding new required fields to transactions (keep `warehouseCode` as-is)
- The mapping approach allows flexibility for real data sources that may have different warehouse naming conventions

**Alternative Approaches Considered:**
1. **Add `storeName` field to transactions**: Rejected because it duplicates data already available through warehouse locations
2. **Change `storeContext` to pass warehouse codes**: Rejected because it would require changes to URL structure and navigation logic
3. **Store-to-warehouse mapping (chosen)**: Best approach as it handles the translation layer without changing data structures

**Data Integrity:**
- Mock data uses deterministic generation based on productId seeds
- Warehouse codes are selected from `WAREHOUSE_CODES` constant (CDC-*, RWH-*, STW-* prefixes)
- Real implementation may need different mapping logic if warehouse codes follow different patterns
