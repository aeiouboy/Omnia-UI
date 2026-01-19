# Chore: Store Filter Cross-Search

## Metadata
adw_id: `412e8715`
prompt: `Fix Inventory Supply page (app/inventory-new/supply/page.tsx) Store Name and Store ID filters to cross-search both fields. BUG: When user types CFR3841 (a Store ID) in Store Name field, returns 0 results because filter only checks storeName column. CURRENT CODE lines 152-160: Store ID filter only checks item.storeId, Store Name filter only checks item.storeName. FIX: 1) Store Name filter (line 158) should match if EITHER item.storeName OR item.storeId contains the search term. 2) Store ID filter (line 153) should also match if EITHER item.storeId OR item.storeName contains the search term. This allows users to search by either ID or Name in either field for better UX.`

## Chore Description
The Inventory Supply page has a UX issue where the Store ID and Store Name filters are too strict. When a user enters a Store ID value (like "CFR3841") into the Store Name field, it returns 0 results because the filter only checks the `storeName` column. Similarly, if a user types a store name into the Store ID field, it fails to find matches.

The fix is to make both filters cross-search both fields:
- **Store ID filter**: Match if EITHER `item.storeId` OR `item.storeName` contains the search term
- **Store Name filter**: Match if EITHER `item.storeName` OR `item.storeId` contains the search term

This provides a more forgiving and intuitive search experience.

## Relevant Files
Use these files to complete the chore:

- **app/inventory-new/supply/page.tsx** (lines 152-160) - Contains the filter logic that needs modification. The `filteredData` useMemo hook has the Store ID filter (line 153) and Store Name filter (line 158) that currently only check single fields.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Update Store ID Filter to Cross-Search
- Modify line 153 to check BOTH `item.storeId` AND `item.storeName`
- Change from:
  ```typescript
  if (storeId && (!item.storeId || !item.storeId.toLowerCase().includes(storeId.toLowerCase()))) {
  ```
- Change to:
  ```typescript
  if (storeId) {
      const storeIdLower = storeId.toLowerCase()
      const matchesStoreId = item.storeId && item.storeId.toLowerCase().includes(storeIdLower)
      const matchesStoreName = item.storeName && item.storeName.toLowerCase().includes(storeIdLower)
      if (!matchesStoreId && !matchesStoreName) {
          return false
      }
  }
  ```

### 2. Update Store Name Filter to Cross-Search
- Modify line 158 to check BOTH `item.storeName` AND `item.storeId`
- Change from:
  ```typescript
  if (storeName && (!item.storeName || !item.storeName.toLowerCase().includes(storeName.toLowerCase()))) {
  ```
- Change to:
  ```typescript
  if (storeName) {
      const storeNameLower = storeName.toLowerCase()
      const matchesStoreName = item.storeName && item.storeName.toLowerCase().includes(storeNameLower)
      const matchesStoreId = item.storeId && item.storeId.toLowerCase().includes(storeNameLower)
      if (!matchesStoreName && !matchesStoreId) {
          return false
      }
  }
  ```

### 3. Validate the Build
- Run `pnpm build` to ensure no TypeScript or compilation errors
- Test the page manually to confirm cross-search works:
  - Type a Store ID (e.g., "CFR3841") in the Store Name field → should return results
  - Type a Store Name (e.g., "Tops") in the Store ID field → should return results

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm build` - Ensure no TypeScript errors and the build succeeds
- `pnpm dev` and navigate to `/inventory-new/supply` - Manual verification:
  1. Enter "CFR3841" in Store Name field → should show results for that store
  2. Enter "Tops" in Store ID field → should show results for Tops stores
  3. Enter "CDS" in either field → should show CDS stores

## Notes
- The cross-search logic is additive (OR condition) - a match in either field passes the filter
- The existing behavior of requiring store criteria before store filtering applies is preserved
- This change only affects the Store ID and Store Name filters; Item ID and Product Name filters remain unchanged
