# Chore: Inventory Supply Page Search Preconditions

## Metadata
adw_id: `5463cfaa`
prompt: `Update Inventory Supply page (app/inventory-new/supply/page.tsx) with new search logic requirements: 1. INITIAL LOAD: No inventory data displayed on page load. 2. SEARCH PRECONDITIONS: Data displays ONLY after user searches using at least ONE of: Store ID, Store Name, Item ID, or Item Name. View Type selection alone should NOT trigger data display. 3. SEARCH LOGIC: Search by Store ID or Store Name displays inventory data for the selected store ONLY; Search by Item ID or Item Name displays inventory data for ALL stores that carry the searched item. 4. VIEW TYPE BEHAVIOR: View Type filter applies ONLY after search results are displayed. 5. Update the loadData function, filteredData useMemo, and conditional rendering.`

## Chore Description
Update the Inventory Supply page to implement a search-first approach where no data is displayed on initial page load. Users must enter search criteria (Store ID, Store Name, Item ID, or Item Name) before any inventory data is shown. This matches the pattern recently implemented on the Stock Card page.

Key behavior changes:
1. **Initial Load**: No data fetching on page load - show empty state with guidance
2. **Search Preconditions**: At least one search field (Store ID, Store Name, Item ID, Item Name) must have a value before data displays
3. **Search Logic Differentiation**:
   - Store-based search (Store ID/Store Name): Show inventory for that specific store only
   - Item-based search (Item ID/Item Name): Show inventory across ALL stores carrying that item
4. **View Type as Post-Filter**: View Type selection only filters existing search results, does not trigger data display on its own
5. **Supply Type**: Treated as a post-filter similar to View Type

## Relevant Files
Use these files to complete the chore:

- **`app/inventory-new/supply/page.tsx`** - Main file to modify. Currently loads all data on mount and filters client-side. Needs search preconditions added.
- **`src/components/inventory/inventory-empty-state.tsx`** - Reusable empty state component that accepts a `message` prop. Will be imported and used for the search guidance state.
- **`app/inventory-new/stores/page.tsx`** - Reference implementation showing the pattern for view type gating with search requirements (lines 99-139, 556-567, 569-732).

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Add State for Search Execution Tracking
- Add a new state variable `hasSearched` to track whether a valid search has been performed
- This state will be `false` initially and set to `true` when user enters search criteria

### 2. Add InventoryEmptyState Component Import
- Import `InventoryEmptyState` from `@/components/inventory/inventory-empty-state`
- This component will be used to show the empty state with search guidance

### 3. Create Helper Function to Check Valid Search Criteria
- Add a helper function or computed value `hasValidSearchCriteria` that returns `true` if at least one of: storeId, storeName, itemId, or productName has a non-empty trimmed value
- This function should NOT consider viewType or supplyType as valid search criteria

### 4. Modify loadData Function
- Remove automatic data fetch on page load
- Change the function to only fetch data when `hasValidSearchCriteria` is true
- If no valid search criteria, set data to empty array and loading to false
- Keep the data fetching logic but only execute when search criteria exists

### 5. Update useEffect Hook
- Modify the useEffect that calls loadData to depend on the search input values (storeId, storeName, itemId, productName)
- Remove the empty dependency array `[]` behavior that loads data on mount
- Add debouncing consideration if needed (search fields should trigger on change)

### 6. Update filteredData useMemo Logic
- The current filtering logic is correct and can remain largely unchanged
- Ensure the filter logic respects the search type distinction:
  - Store-based search: Filter to show only items matching the searched store
  - Item-based search: Show all stores carrying the searched item
- View Type and Supply Type should continue to filter as post-filters on the search results

### 7. Update Loading State Behavior
- Change the initial loading state from `true` to `false` (no loading on mount)
- Only show loading skeleton when actively fetching data after search

### 8. Add Empty State Rendering
- Add conditional rendering before the table to show `InventoryEmptyState` when no valid search criteria exists
- Pass dynamic message based on current state:
  - "Please enter a Store ID, Store Name, Item ID, or Item Name to search inventory"
  - If View Type is selected but no search: "Please enter search criteria to view inventory for the selected view type"

### 9. Update Table Rendering Conditionals
- Wrap the table Card component in a conditional that only renders when `hasValidSearchCriteria` is true
- Keep the "No results found" empty state inside the table for when search returns zero results

### 10. Update Footer Text
- Modify the footer text to reflect the search-based display:
  - Show "X records displayed" when search results exist
  - Reference the search criteria in the filtered count text

### 11. Update handleClear Function
- Ensure handleClear resets the `hasSearched` state if added
- Clear should return the page to the initial empty state

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm build` - Ensure TypeScript compilation succeeds with no errors
- `pnpm dev` - Start development server and manually test:
  1. Navigate to `/inventory-new/supply`
  2. Verify empty state shows on initial load with search guidance message
  3. Enter a Store ID and verify data displays for that store only
  4. Clear and enter a Product Name, verify data displays for all stores with that product
  5. Select a View Type without search criteria, verify no data displays
  6. Enter search criteria then select View Type, verify View Type filters the results
  7. Click "Clear All" and verify page returns to empty state

## Notes
- The implementation follows the pattern established in the Stock Card page (`app/inventory-new/stores/page.tsx`)
- The key difference from Stock Card is that Inventory Supply has 4 search fields (Store ID, Store Name, Item ID, Item Name) vs Stock Card's single search field
- The search logic differentiation (store-based vs item-based) affects what data is shown but the underlying API call remains the same - all filtering is client-side
- Consider adding a subtle visual indicator (border color, label) when search is active to help users understand the current filter state
