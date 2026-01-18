# Chore: Fix Inventory Supply Search Filter Functionality

## Metadata
adw_id: `3b952d25`
prompt: `Fix the Inventory Supply page (app/inventory-new/supply/page.tsx) search filter functionality. Currently data displays but the search input fields (Store ID, Store Name, Item ID, Product Name) are not filtering the data when users type in them. Verify that: (1) The text input onChange handlers are properly updating state variables (storeId, storeName, itemId, productName), (2) The filteredData useMemo correctly references these state variables in its dependency array, (3) The filter conditions properly check item fields against search values using case-insensitive includes() matching. Test that typing in any search field immediately filters the displayed records.`

## Chore Description
The Inventory Supply page at `app/inventory-new/supply/page.tsx` displays inventory data but the search input fields (Store ID, Store Name, Item ID, Product Name) are reportedly not filtering the displayed data when users type in them. This chore requires investigating the filter implementation to identify why typing in search fields does not immediately filter the displayed records.

After code review, the implementation appears correct:
- State variables (`storeId`, `storeName`, `itemId`, `productName`) are declared with `useState("")`
- onChange handlers call the appropriate state setters with `e.target.value`
- The `filteredData` useMemo dependency array includes all filter state variables
- Filter conditions use case-insensitive `includes()` matching with null checks

The issue may be:
1. Data field mismatch (searching fields that don't exist in the data)
2. Controlled input value binding issues
3. React re-render timing issues
4. Mock data not having the expected field values

## Relevant Files
Use these files to complete the chore:

- **app/inventory-new/supply/page.tsx** - Main page component containing the filter state, Input components, and filteredData useMemo logic. This is the primary file to investigate and fix.
- **src/types/inventory.ts** - TypeScript type definitions for `InventoryItem` interface. Needed to verify field names match between filter logic and data structure.
- **src/lib/inventory-service.ts** - Service layer that fetches inventory data. Verify the data structure returned matches what filters expect.
- **src/lib/mock-inventory-data.ts** - Mock data generator. Verify that mock items have the fields being filtered (`storeId`, `storeName`, `productId`, `productName`).

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Verify Filter State Binding
- Confirm each Input component has both `value` and `onChange` props correctly bound
- Check that `value={storeId}` uses the state variable directly (not a derived value)
- Verify `onChange={(e) => setStoreId(e.target.value)}` correctly updates state
- Repeat verification for `storeName`, `itemId`, and `productName` inputs

### 2. Verify useMemo Dependency Array
- Confirm the `filteredData` useMemo at line 92 has all filter state variables in its dependency array
- Expected dependencies: `[data, storeId, storeName, itemId, productName, supplyType, viewType, sortField, sortOrder]`
- If any dependency is missing, add it to trigger re-computation when filters change

### 3. Verify Filter Condition Field Names
- Check that filter conditions use the correct field names from `InventoryItem` interface:
  - Store ID filter should check `item.storeId`
  - Store Name filter should check `item.storeName`
  - Item ID filter should check `item.productId` (note: might need to be `item.itemId` or similar)
  - Product Name filter should check `item.productName`
- Cross-reference with `src/types/inventory.ts` to ensure field names match exactly

### 4. Verify Filter Logic for Each Search Field
- Store ID filter (lines 95-97): Verify `item.storeId` exists and uses `toLowerCase().includes()`
- Store Name filter (lines 100-102): Verify `item.storeName` exists and uses `toLowerCase().includes()`
- Item ID filter (lines 105-107): Verify field name matches data structure (is it `productId` or `itemId`?)
- Product Name filter (lines 110-112): Verify `item.productName` exists and uses `toLowerCase().includes()`

### 5. Verify Mock Data Has Required Fields
- Check `src/lib/mock-inventory-data.ts` to confirm generated items include:
  - `storeId` field with string values
  - `storeName` field with string values
  - `productId` field with string values
  - `productName` field with string values
- If any fields are missing or have different names, update either the mock data or filter logic

### 6. Add Debug Logging (Temporary)
- Add console.log statements in the useMemo to trace filter execution:
  - Log the current filter values: `console.log('Filters:', { storeId, storeName, itemId, productName })`
  - Log sample data item fields: `console.log('Sample item:', data[0])`
  - Log filtered results count: `console.log('Filtered count:', filtered.length)`
- Run the development server and test typing in filters
- Observe console output to identify where the issue occurs

### 7. Apply Fix Based on Investigation
- If field names mismatch: Update filter logic to use correct field names
- If dependencies missing: Add missing variables to useMemo dependency array
- If Input binding issues: Ensure controlled component pattern is correct
- If data structure issue: Update mock data generator or data transformation

### 8. Remove Debug Logging
- Remove all temporary console.log statements added in step 6
- Ensure clean production-ready code

### 9. Validate the Fix
- Run `pnpm dev` and navigate to Inventory Supply page
- Type in Store ID field and verify table filters immediately
- Type in Store Name field and verify table filters immediately
- Type in Item ID field and verify table filters immediately
- Type in Product Name field and verify table filters immediately
- Clear filters and verify all data returns
- Run `pnpm build` to ensure no TypeScript errors

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm build` - Ensure the project compiles without TypeScript errors
- `pnpm dev` - Start development server for manual testing
- Navigate to http://localhost:3000/inventory-new/supply and test:
  1. Type "001" in Store ID field → Table should filter to matching store IDs
  2. Type "Tops" in Store Name field → Table should filter to Tops stores
  3. Type "SKU" in Item ID field → Table should filter to matching product IDs
  4. Type "Milk" in Product Name field → Table should filter to milk products
  5. Click "Clear All" → All records should display

## Notes
- The filter implementation follows standard React patterns for controlled inputs
- The useMemo hook is used correctly for memoized computation
- Consider adding debouncing if filter performance becomes an issue with large datasets (2000+ items)
- The filter logic currently uses client-side filtering; for production with large datasets, server-side filtering may be more appropriate
