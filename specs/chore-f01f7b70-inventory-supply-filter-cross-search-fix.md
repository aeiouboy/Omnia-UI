# Chore: Fix Inventory Supply Search Filter Cross-Search Behavior

## Metadata
adw_id: `f01f7b70`
prompt: `Fix Inventory Supply page search filters to NOT cross-search. In app/inventory-new/supply/page.tsx, update the filter logic so that: 1) Store ID search field ONLY searches the storeId field (not storeName). 2) Store Name search field ONLY searches the storeName field (not storeId). Currently the cross-search logic causes Store Name search to match Store IDs like 'CFM0103' when user types 'C'. Remove the cross-search behavior - each search field should only filter its corresponding data field. Update the filteredData useMemo logic around lines 240-280 to separate the search conditions.`

## Chore Description
The Inventory Supply page currently implements cross-search logic where the Store ID search field searches both `storeId` and `storeName` fields, and the Store Name search field also searches both fields. This causes unintended behavior where typing 'C' in the Store Name field matches Store IDs like 'CFM0103'.

This chore removes the cross-search behavior to make each search field filter only its corresponding data field:
- **Store ID** search field → filters only `item.storeId`
- **Store Name** search field → filters only `item.storeName`

## Relevant Files
- **app/inventory-new/supply/page.tsx** (lines 143-220) - Contains the `filteredData` useMemo with the cross-search logic that needs to be fixed. Specifically:
  - Lines 152-160: Store ID filter with cross-search to storeName (needs fix)
  - Lines 162-170: Store Name filter with cross-search to storeId (needs fix)

## Step by Step Tasks

### 1. Update Store ID Filter Logic
- Remove cross-search to `storeName` field in the Store ID filter (lines 152-160)
- Change from checking both `matchesStoreId` OR `matchesStoreName` to checking ONLY `matchesStoreId`
- Keep the case-insensitive search using `toLowerCase()` and `includes()`

### 2. Update Store Name Filter Logic
- Remove cross-search to `storeId` field in the Store Name filter (lines 162-170)
- Change from checking both `matchesStoreName` OR `matchesStoreId` to checking ONLY `matchesStoreName`
- Keep the case-insensitive search using `toLowerCase()` and `includes()`

### 3. Test Filter Behavior
- Verify that Store ID search only matches `storeId` field
- Verify that Store Name search only matches `storeName` field
- Confirm typing 'C' in Store Name field no longer matches 'CFM0103' store IDs
- Ensure other filters (Product ID, Product Name, Supply Type, View Type) continue working correctly

### 4. Build Verification
- Run `pnpm build` to ensure no TypeScript compilation errors
- Verify the application starts correctly with `pnpm dev`

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm build` - Verify TypeScript compilation succeeds with no errors
- `pnpm dev` - Start dev server and verify the page loads without errors (Ctrl+C after confirming)
- Manual testing:
  - Navigate to `/inventory-new/supply`
  - Type 'C' in Store Name field → should NOT match 'CFM0103' store IDs
  - Type 'CFM' in Store ID field → should match 'CFM0103' store IDs
  - Type store name text in Store Name field → should only match store names

## Notes
- The fix only affects the Store ID and Store Name filter logic
- Product ID and Product Name filters do not have cross-search and remain unchanged
- The `hasStoreSearch` logic (line 146) remains unchanged as it correctly determines if any store-based filtering is active
- This change improves filter precision and user experience by making each search field's behavior predictable and aligned with its label
