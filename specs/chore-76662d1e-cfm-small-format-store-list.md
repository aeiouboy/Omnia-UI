# Chore: Update Inventory Mock Data to Use CFM Small Format Store List

## Metadata
adw_id: `76662d1e`
status: `completed`
completed_at: `2026-01-17`
prompt: `Update inventory mock data to use CFM small format store list. Reference file: docs/wording/store-list-reference.json contains 516 stores with storeId (CFM0xxx format) and storeName fields. Tasks: 1) In src/lib/mock-inventory-data.ts, replace existing TOPS_CFR_STORES array with store names from the reference JSON, and update any hardcoded store names in static mock items. 2) Update the store ID generation logic to use CFM format (e.g., CFM0103, CFM0298) instead of CFR format. 3) Create a mapping constant MAO_CFM_STORES similar to MAO_CDS_STORES that maps storeId to storeName from the reference file. 4) Update generateInventorySupplyData and other functions that generate store data to use the new CFM stores. 5) Ensure Store ID format is consistent as CFMxxxx across all inventory pages. Validate by running build to ensure no TypeScript errors.`

## Chore Description
This chore updates the inventory mock data to use the CFM (Central Food Market) small format store list instead of the existing TOPS_CFR_STORES and CFR-based store IDs. The reference file at `docs/wording/store-list-reference.json` contains 516 stores with proper storeId (CFM0xxx format) and storeName fields that should replace the current mock data.

Key changes:
1. Replace the hardcoded `TOPS_CFR_STORES` array (8 Thai store names) with store names from the reference JSON
2. Create a new `MAO_CFM_STORES` mapping constant similar to the existing `MAO_CDS_STORES`
3. Update all store ID generation logic to use CFM format (e.g., CFM0103) instead of CFR format (e.g., CFR432)
4. Update all functions that generate store data to use the new CFM stores
5. Ensure consistency across all inventory pages

## Relevant Files
Use these files to complete the chore:

- **`docs/wording/store-list-reference.json`** - Reference file containing 516 CFM stores with storeId and storeName fields. This is the source of truth for the new store data.

- **`src/lib/mock-inventory-data.ts`** - Main file to modify. Contains:
  - `TOPS_CFR_STORES` array (line 235-244) - needs to be replaced with CFM store names
  - `MAO_CDS_STORES` mapping (line 192-213) - reference for creating similar `MAO_CFM_STORES`
  - Store ID generation logic using CFR format (line 487-489) - needs to change to CFM format
  - `ensureWarehouseLocationsAndNewFields` function - generates storeId using CFR format
  - `generateMultiStoreProducts` function (line 2532-2534) - uses `TOPS_CFR_STORES`
  - `generateAdditionalItems` function (line 2632-2633) - uses `TOPS_CFR_STORES`
  - `generateStorePerformanceFromInventory` function (line 2733-2734) - uses `TOPS_CFR_STORES`
  - `mockInventoryItemsBase` array - contains hardcoded store names like "Tops Central World", "Tops สุขุมวิท 39", etc.
  - Various CFR-specific items and products throughout the file

- **`src/types/inventory.ts`** - May need to update `TopsStore` type if it references specific store names

### New Files
None required - all changes are modifications to existing files.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Create MAO_CFM_STORES Mapping Constant
- Read the reference JSON file at `docs/wording/store-list-reference.json`
- Create a new `MAO_CFM_STORES` constant similar to `MAO_CDS_STORES`
- The mapping should be: `{ [storeId: string]: string }` where key is storeId (e.g., "CFM0103") and value is storeName (e.g., "Wat Ampawa")
- Include all 516 stores from the reference file
- Add TypeScript types for `MaoCfmStoreId`
- Export `MAO_CFM_STORE_IDS` array similar to `MAO_CDS_STORE_IDS`

### 2. Replace TOPS_CFR_STORES Array
- Replace the existing `TOPS_CFR_STORES` array (8 hardcoded Thai store names) with store names from `MAO_CFM_STORES`
- Create `CFM_STORES` array from `Object.values(MAO_CFM_STORES)`
- Update `TOPS_STORES` array to combine `CFM_STORES` and `CDS_STORES` (instead of `TOPS_CFR_STORES`)
- Optionally keep a smaller subset (e.g., first 50 stores) for `TOPS_CFR_STORES` to maintain backwards compatibility with functions that expect a smaller array

### 3. Update Store ID Generation Logic
- In `ensureWarehouseLocationsAndNewFields` function, update the store ID generation:
  - Change from `CFR${(storeIdSeed % 9000) + 100}` format to looking up actual CFM store IDs
  - Add a helper function `getCfmStoreId` similar to `getCdsStoreId` to look up CFM store IDs
  - For non-CDS stores, use the CFM format (e.g., CFM0103) instead of CFR format
- Update `generateStorePerformanceFromInventory` function:
  - Change store ID format from `CFR${idNum}` to CFM format
  - Use `getCfmStoreId` helper to get actual store IDs from mapping

### 4. Update Static Mock Items Store Names
- Update `mockInventoryItemsBase` array to use CFM store names instead of hardcoded Thai Tops names
- Replace references like:
  - "Tops Central World" → Use a CFM store name
  - "Tops สุขุมวิท 39" → Use a CFM store name
  - "Tops ทองหล่อ" → Use a CFM store name
  - "Tops สีลม คอมเพล็กซ์" → Use a CFM store name
  - "Tops เอกมัย" → Use a CFM store name
  - "Tops พร้อมพงษ์" → Use a CFM store name
  - "Tops จตุจักร" → Use a CFM store name
  - "Tops Central Plaza ลาดพร้าว" → Use a CFM store name

### 5. Update Functions Using TOPS_CFR_STORES
- Update `generateMultiStoreProducts` function (line 2532):
  - Change `TOPS_CFR_STORES.slice(0, storeCount)` to use CFM stores
- Update `generateAdditionalItems` function (line 2632-2633):
  - Change `TOPS_CFR_STORES[seed % TOPS_CFR_STORES.length]` to use CFM stores
- Update `generateStorePerformanceFromInventory` function (line 2733-2734):
  - Change `storesToProcess = TOPS_CFR_STORES` to use CFM stores

### 6. Update Business Unit References
- Review and update any references to "CFR" business unit that should remain as "CFR"
- The business unit should still be "CFR" for Central Food Retail, but store IDs should use CFM format
- Ensure the `businessUnit` field in items is not changed (it should remain "CFR" vs "DS")

### 7. Validate Build and Type Safety
- Run `pnpm build` to ensure no TypeScript errors
- Verify that all store ID formats are consistent (CFMxxxx for CFM stores, CDS10xxx for CDS stores)
- Check that the inventory pages still render correctly with the new store data

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm build` - Build the project to ensure no TypeScript errors
- `grep -n "CFR[0-9]" src/lib/mock-inventory-data.ts` - Should return no matches (all CFR store IDs replaced with CFM)
- `grep -n "TOPS_CFR_STORES" src/lib/mock-inventory-data.ts` - Verify usage is updated or replaced
- `grep -n "MAO_CFM_STORES" src/lib/mock-inventory-data.ts` - Should find the new mapping constant
- `grep -n "CFM[0-9]" src/lib/mock-inventory-data.ts` - Should find CFM store IDs in use

## Notes

1. **Store Count Considerations**: The reference file contains 516 stores. For functions that iterate over all stores (like generating multi-store products), consider using a subset to avoid performance issues.

2. **Backwards Compatibility**: Some components may expect the old store names. The `TopsStore` type may need to be updated to accept the new store names.

3. **Business Unit vs Store Format**: The business unit "CFR" (Central Food Retail) is a categorization concept and should remain unchanged. Only the store ID format changes from CFRxxxx to CFMxxxx.

4. **View Type Mapping**: The existing view type logic (CFR views vs DS views) should continue to work. CFM stores are the CFR (grocery) stores, while CDS stores are the DS (department store) stores.

5. **Deterministic Generation**: The existing code uses seed-based deterministic generation. Ensure the new store selection logic maintains deterministic behavior for consistent test data.
