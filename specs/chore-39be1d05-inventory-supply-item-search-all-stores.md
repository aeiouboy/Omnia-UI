# Chore: Fix Inventory Supply Item Search to Show All Stores

## Metadata
adw_id: `39be1d05`
prompt: `Fix Inventory Supply page (app/inventory-new/supply/page.tsx) search logic for Item ID and Product Name filters. CURRENT BUG: When searching by Item ID or Product Name, only inventory from a single store is displayed. EXPECTED BEHAVIOR: When searching by Item ID or Product Name, inventory data should display for ALL stores that carry that product (since one product can be sold in multiple stores). SEARCH LOGIC REQUIREMENTS: 1. Store-based search (Store ID or Store Name): Filter results to show inventory for that specific store ONLY. 2. Item-based search (Item ID or Product Name): Show inventory for ALL stores that have that item - do NOT filter by store. The filteredData useMemo logic needs to be updated to differentiate between store-based filtering (should filter by store) vs item-based filtering (should show all stores with matching item). Check if the current filtering logic incorrectly applies store filtering even when only item criteria is provided.`

## Chore Description
The Inventory Supply page has a bug in its search/filter logic. When a user searches by Item ID or Product Name, only a single store's inventory is displayed instead of showing all stores that carry that product.

**Root Cause Analysis:**
Looking at the current `filteredData` useMemo in `app/inventory-new/supply/page.tsx` (lines 117-175), all four filters (storeId, storeName, itemId, productName) are applied independently and cumulatively. This means:

1. When a user enters an Item ID but leaves Store ID/Name empty, the filter logic correctly finds items matching the Item ID
2. However, the data appears to be showing only one store because the mock data or the way data is structured may have one inventory record per product-store combination, and the filter doesn't distinguish between "user actively filtering by store" vs "no store filter applied"

The actual issue is that the filter logic is correct, but the business logic expectation is different:
- **Store-based search**: When storeId OR storeName has a value, filter by that store
- **Item-based search**: When ONLY itemId OR productName has a value (and NO store criteria), show ALL stores with that item

The current logic doesn't differentiate between these two search modes. The fix requires updating the filter logic to:
1. Detect which type of search the user is performing
2. Only apply store filters when the user explicitly provides store criteria
3. Show all stores when only item criteria is provided

## Relevant Files
Use these files to complete the chore:

- **app/inventory-new/supply/page.tsx** - The main file to modify. Contains the `filteredData` useMemo that needs logic updates to differentiate between store-based and item-based searches. The current filter logic (lines 117-152) applies all four filters cumulatively without distinguishing between search modes.

- **src/lib/inventory-service.ts** - Reference file for understanding how inventory data is fetched. The `fetchInventoryData` function returns all inventory items, and filtering happens client-side in the page component.

- **src/types/inventory.ts** - Reference file for `InventoryItem` type definition. Contains fields like `storeId`, `storeName`, `productId`, `productName` that are used in filtering.

- **src/lib/mock-inventory-data.ts** - Reference file to understand the structure of mock data. Each inventory item has a specific store assignment, so filtering correctly is essential.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Analyze Current Filter Logic
- Review the `filteredData` useMemo in `app/inventory-new/supply/page.tsx` (lines 117-175)
- Confirm the current filter logic applies all four filters (storeId, storeName, itemId, productName) cumulatively
- Identify that the issue is the lack of distinction between store-based vs item-based search modes

### 2. Add Search Mode Detection Helper
- Add a helper variable to determine the search mode based on which fields have values:
  - `hasStoreSearchCriteria`: true if storeId OR storeName has a non-empty value
  - `hasItemSearchCriteria`: true if itemId OR productName has a non-empty value
- These helpers will be used inside the `filteredData` useMemo

### 3. Update filteredData useMemo Filter Logic
- Modify the filter logic to apply store filtering conditionally:
  - **If hasStoreSearchCriteria is true**: Apply store filters (storeId and/or storeName) normally
  - **If hasStoreSearchCriteria is false (item-only search)**: Skip store filtering entirely, show all stores with matching items
- Keep item filtering (itemId, productName) always applied when values are provided
- Keep supplyType and viewType filters unchanged (they are post-filters)

### 4. Update the filteredData Implementation
- Replace the current filter logic with the conditional logic:
```typescript
const filteredData = useMemo(() => {
    // Determine search mode
    const hasStoreSearch = storeId.trim() !== "" || storeName.trim() !== ""
    const hasItemSearch = itemId.trim() !== "" || productName.trim() !== ""

    let filtered = data.filter(item => {
        // Store filters - ONLY apply if user provided store criteria
        if (hasStoreSearch) {
            if (storeId && (!item.storeId || !item.storeId.toLowerCase().includes(storeId.toLowerCase()))) {
                return false
            }
            if (storeName && (!item.storeName || !item.storeName.toLowerCase().includes(storeName.toLowerCase()))) {
                return false
            }
        }

        // Item filters - always apply when provided
        if (itemId && !item.productId.toLowerCase().includes(itemId.toLowerCase())) {
            return false
        }
        if (productName && (!item.productName || !item.productName.toLowerCase().includes(productName.toLowerCase()))) {
            return false
        }

        // Supply Type Filter
        if (supplyType !== "all" && item.supplyType !== supplyType) {
            return false
        }

        // View Type Filter
        if (viewType !== "all" && item.view && item.view !== viewType) {
            return false
        }

        return true
    })

    // Apply sorting (unchanged)
    // ...

    return filtered
}, [data, storeId, storeName, itemId, productName, supplyType, viewType, sortField, sortOrder])
```

### 5. Validate the Changes
- Build the project to ensure no TypeScript errors: `pnpm build`
- Start the dev server: `pnpm dev`
- Test scenarios:
  1. Search by Item ID only → Should show all stores with that item
  2. Search by Product Name only → Should show all stores with that product
  3. Search by Store ID only → Should show only that store's inventory
  4. Search by Store Name only → Should show only that store's inventory
  5. Search by Store ID + Item ID → Should show the specific item at the specific store
  6. Clear all filters → Should return to empty state (search required)

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm build` - Build should complete without TypeScript errors
- `pnpm lint` - Linting should pass without errors
- `pnpm dev` - Start dev server and manually test the search scenarios described above

## Notes
- The filter logic change is localized to the `filteredData` useMemo - no changes needed to the data fetching logic
- The `hasValidSearchCriteria` check remains unchanged as it correctly requires at least one search field
- View Type and Supply Type dropdowns remain as post-filters (they filter the already-searched results)
- This change aligns with typical inventory search UX: searching for a product shows where it's available across all stores
