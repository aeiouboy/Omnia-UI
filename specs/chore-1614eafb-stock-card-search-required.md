# Chore: Stock Card - Require Search Before Displaying Data

## Metadata
adw_id: `1614eafb`
prompt: `Update Stock Card page (app/inventory-new/stores/page.tsx) to not display table data until a search is performed. Currently the page shows data when a View Type is selected, but it should require BOTH a View Type selection AND at least one search filter (store name search) before displaying the table data. The empty state message should guide users to select a View Type and enter a search term. Update the conditional rendering logic for Summary Cards, Table, and Empty State to check for both selectedViewType and searchQuery being set.`

## Chore Description
The Stock Card page currently displays table data and summary cards as soon as a View Type is selected from the dropdown. The requirement is to change this behavior so that data is only displayed when BOTH conditions are met:

1. A View Type must be selected (not "all" or empty)
2. A search query must be entered in the store name search field

This ensures users don't see overwhelming data until they've narrowed down their search criteria. The empty state should provide guidance based on what criteria is missing.

## Relevant Files
Use these files to complete the chore:

- **`app/inventory-new/stores/page.tsx`** - Main Stock Card page component containing all the conditional rendering logic for Summary Cards, Table, and Empty State. This is the only file that needs modification.

- **`src/components/inventory/inventory-empty-state.tsx`** - Reference for the InventoryEmptyState component props. Accepts a `message` prop for the primary message. The secondary text is hardcoded to "Select a view from the dropdown above to see inventory data".

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Update the `loadData` function to check for both conditions
- Modify the condition at line 103 to also check for `searchQuery`
- The data should only be fetched when `selectedViewType` is set (and not "all") AND `searchQuery` is not empty
- Update the early return logic to clear `storeData` when conditions are not met

### 2. Update the useEffect dependency array
- Add `searchQuery` to the useEffect dependency array at line 139
- This ensures `loadData` is called when the search query changes

### 3. Update Summary Cards conditional rendering
- Modify the condition at line 328 to also check for `searchQuery.trim()`
- Summary Cards should only display when both `selectedViewType` AND `searchQuery` are set

### 4. Update Empty State rendering logic
- Change the empty state condition at line 557 to show in any of these cases:
  - No view type selected (`!selectedViewType || selectedViewType === "all"`)
  - OR no search query entered (`!searchQuery.trim()`)
- Update the empty state message based on what's missing:
  - If no view type selected: "Please select a View Type to display stock card data"
  - If view type selected but no search: "Please enter a store name to search"
  - If neither: "Please select a View Type and enter a store name to search"

### 5. Update Table conditional rendering
- Modify the condition at line 562 to also check for `searchQuery.trim()`
- Table should only render when both `selectedViewType` AND `searchQuery` are set

### 6. Validate the build compiles without errors
- Run `pnpm build` to ensure no TypeScript or build errors

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm build` - Ensure the TypeScript compiles without errors
- `pnpm dev` - Start development server and manually test:
  1. Load the Stock Card page at `/inventory-new/stores`
  2. Verify empty state shows "Please select a View Type and enter a store name to search"
  3. Select a View Type - verify empty state still shows, message updates to "Please enter a store name to search"
  4. Enter a search term - verify table and summary cards now display
  5. Clear the search term - verify empty state returns
  6. Use "Clear All" button - verify it clears both and returns to empty state

## Notes
- The `InventoryEmptyState` component has a hardcoded secondary message about selecting a view from dropdown. This should be acceptable since the primary message prop can provide context-specific guidance.
- The search filter already works for filtering the data (see `filteredAndSortedStores` useMemo) - we're just adding a gate to prevent showing ANY data until search criteria is entered.
- Consider whether the "no stores found" message in the table (line 640-645) should be different from the empty state message for when no results match the search.
