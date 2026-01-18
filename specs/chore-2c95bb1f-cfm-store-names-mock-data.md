# Chore: Update mock-data.ts to use CFM store names

## Metadata
adw_id: `2c95bb1f`
prompt: `Update src/lib/mock-data.ts to use CFM store names from MAO_CFM_STORES mapping. The file still contains old 'Tops' store names that should be replaced with CFM store names. Tasks: 1) Import MAO_CFM_STORES and CFM_STORES from mock-inventory-data.ts. 2) Replace all hardcoded 'Tops Central World', 'Tops สุขุมวิท 39', 'Tops ทองหล่อ', 'Tops สีลม คอมเพล็กซ์', 'Tops เอกมัย', 'Tops พร้อมพงษ์', 'Tops จตุจักร', 'Tops Central ลาดพร้าว' with CFM store names from the CFM_STORES array. 3) Update the TOPS_STORES array (lines 18-19, 184-191, 943-950, 1944-1951) to use CFM_STORES instead of hardcoded names. 4) Update storeFulfillmentData (lines 626-633), stockAlerts (lines 668-698), and other objects with storeName fields to use CFM store names. 5) Add storeId fields where storeName is used, using the MAO_CFM_STORES mapping to get the correct CFM store ID. 6) Validate with pnpm build.`

## Chore Description
This chore updates `src/lib/mock-data.ts` to consistently use CFM (Central Food Market) store names and IDs from the `MAO_CFM_STORES` mapping defined in `mock-inventory-data.ts`. Currently, `mock-data.ts` contains hardcoded "Tops" store names (e.g., "Tops Central World", "Tops สุขุมวิท 39") that should be replaced with actual CFM store names and IDs for consistency across the codebase.

The update involves:
1. Importing `MAO_CFM_STORES`, `CFM_STORES`, and `getCfmStoreId` from `mock-inventory-data.ts`
2. Replacing all hardcoded Tops store name arrays with `CFM_STORES.slice()` references
3. Adding `storeId` fields to data structures that have `storeName` fields
4. Ensuring all store-related mock data uses the CFM naming convention

## Relevant Files
Use these files to complete the chore:

- **`src/lib/mock-data.ts`** - Main file to update. Contains multiple hardcoded Tops store name arrays and store-related mock data objects that need CFM updates.
- **`src/lib/mock-inventory-data.ts`** - Source of CFM store data. Exports `MAO_CFM_STORES` mapping (store ID -> store name), `CFM_STORES` array (all store names), and `getCfmStoreId()` helper function.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Add CFM imports to mock-data.ts
- Add import statement at the top of the file (after existing imports around line 5):
  ```typescript
  import { MAO_CFM_STORES, CFM_STORES, getCfmStoreId } from './mock-inventory-data'
  ```

### 2. Update clickCollectStores array (lines 12-21)
- Replace the hardcoded Click & Collect store names with CFM store names
- Use `CFM_STORES.slice(0, 8)` to get first 8 CFM stores
- The current hardcoded names include "Central Ladprao", "Central World", etc. which mix Central and Tops brands

### 3. Update topsStores array in mockApiOrders (lines 183-192)
- Replace the hardcoded `topsStores` array with `CFM_STORES.slice(0, 8)`
- This array is used when generating mock orders

### 4. Update mockPerformanceMetrics.fulfillmentByStore (lines 625-634)
- Replace hardcoded store names with CFM store names
- Add `storeId` field to each entry using the `getCfmStoreId()` helper
- Keep the existing fulfilled, total, and percentage values

### 5. Update mockAlerts store names (lines 659-699)
- Replace "Tops Central World", "Tops สุขุมวิท 39", "Tops ทองหล่อ", "Tops เอกมัย" with CFM store names
- Add `storeId` field to each alert entry

### 6. Update mockAnalyticsData.storeComparison (lines 720-749)
- Replace hardcoded store names with CFM store names
- Add `storeId` field to each store comparison entry

### 7. Update topsStores in generateMockEscalations (lines 942-951)
- Replace the hardcoded `topsStores` array with `CFM_STORES.slice(0, 8)`

### 8. Update thaiStores array in tracking data (lines 1942-1953)
- Replace the hardcoded `thaiStores` array with CFM store names
- This is used for origin store names in tracking data

### 9. Update scenario order store references (lines 2778, 2806)
- Replace "Tops Central World" with a CFM store name
- Add appropriate `storeId` fields

### 10. Validate the changes
- Run `pnpm build` to ensure no TypeScript errors
- Verify that all store name references are consistent

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm build` - Ensure the build passes with no TypeScript errors
- `grep -n "Tops Central World\|Tops สุขุมวิท\|Tops ทองหล่อ\|Tops สีลม\|Tops เอกมัย\|Tops พร้อมพงษ์\|Tops จตุจักร" src/lib/mock-data.ts` - Should return no matches after the update (all old Tops names should be removed)
- `grep -n "CFM_STORES\|getCfmStoreId\|MAO_CFM_STORES" src/lib/mock-data.ts` - Should show the new CFM imports and usage

## Notes
- The `MAO_CFM_STORES` mapping contains 516 CFM stores with IDs in format `CFM0xxx` to `CFM2xxx`
- The `CFM_STORES` array contains all store names extracted from the mapping
- The `getCfmStoreId()` helper function looks up a store ID by store name
- Use `CFM_STORES.slice(0, 8)` or similar to limit the number of stores used for performance and to match the original array sizes
- Maintain backwards compatibility - the data structure shapes should remain the same, just with different store name values and added storeId fields
