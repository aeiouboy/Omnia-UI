# Chore: Swap Filter Buttons and Remove Sorting in Stock by Store Page

## Metadata
adw_id: `a32649ac`
prompt: `Update Stock by Store page filter buttons and remove sorting: 1) In app/inventory/stores/page.tsx, swap the position of Critical Stock and Low Stock filter buttons so the order is: All Stores, Low Stock, Critical Stock - this aligns with the KPI card order (Stores with Low Stock comes before Stores with Critical Stock). 2) Remove the entire Sort by section including the "Sort by:" label and all sort buttons (Store Name, Critical Items, Low Stock Items). 3) Remove the sortField and sortOrder state variables and handleSort function since sorting is no longer needed. 4) Remove the SortField type and SortIcon component. 5) Keep the default store order as-is (by critical items descending) but remove user-facing sort controls. Purpose: Simplify UI by removing sort controls and align filter button order with KPI card layout.`

## Chore Description
This chore simplifies the Stock by Store page UI by removing user-facing sort controls while maintaining consistent filter button order with KPI cards. The changes include:

1. **Filter Button Reordering**: Swap "Critical Stock" and "Low Stock" filter buttons to match the KPI card order (Low Stock card appears before Critical Stock card)
2. **Remove Sort UI**: Completely remove the "Sort by:" section with all sort buttons (Store Name, Critical Items, Low Stock Items)
3. **Remove Sort Logic**: Clean up unused sort-related state variables, handlers, types, and components
4. **Maintain Default Sorting**: Keep the existing default sort (by critical items descending) but remove the ability for users to change it

This aligns the filter button order with the visual hierarchy of the KPI cards and simplifies the UI by removing sort controls that may not be essential for the primary use case.

## Relevant Files
Use these files to complete the chore:

- **app/inventory/stores/page.tsx** (lines 1-409)
  - Primary file to modify containing the Stock by Store page component
  - Contains filter buttons that need reordering (lines 294-315)
  - Contains sort section to remove (lines 318-348)
  - Contains SortField type (line 25), SortIcon component (lines 155-162), sortField/sortOrder state (lines 41-42), and handleSort function (lines 141-148)
  - The sorting logic in the useMemo (lines 98-127) will be simplified to use only the default sort

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Remove Sort-Related Types and Imports
- Remove the `SortField` type definition at line 25
- Remove unused icon imports `ArrowUpDown`, `ArrowUp`, and `ArrowDown` from lines 17-19 (used only for sorting)
- Keep all other imports unchanged

### 2. Remove Sort-Related State Variables
- Remove the `sortField` state variable declaration at line 41
- Remove the `sortOrder` state variable declaration at line 42
- Keep all other state variables (searchQuery, filterType, etc.)

### 3. Remove Sort Handler Function
- Remove the entire `handleSort` function (lines 141-148)
- This function is no longer needed since sorting controls are being removed

### 4. Remove SortIcon Component
- Remove the entire `SortIcon` component definition (lines 155-162)
- This component was only used by the sort buttons

### 5. Simplify Filtering and Sorting Logic
- Update the `filteredAndSortedStores` useMemo (lines 80-130) to:
  - Keep search filtering logic (lines 84-89)
  - Keep status filtering logic (lines 92-96)
  - Replace the dynamic sorting logic (lines 98-127) with a fixed sort by critical items descending:
    ```typescript
    filtered.sort((a, b) => b.criticalStockItems - a.criticalStockItems)
    ```
- This maintains the default sort behavior but removes the ability to change it

### 6. Swap Filter Button Order
- In the filter buttons section (lines 293-316), swap the order of "Critical Stock" and "Low Stock" buttons:
  - Current order: All Stores → Critical Stock → Low Stock
  - New order: All Stores → Low Stock → Critical Stock
- Move the "Low Stock" button block (lines 308-314) to appear before the "Critical Stock" button block (lines 301-307)
- Update the filterType values to maintain correct functionality

### 7. Remove Sort Section
- Remove the entire "Sort Options" section (lines 318-348)
- This includes the "Sort by:" label and all sort buttons (Store Name, Critical Items, Low Stock Items)
- The store cards grid section (lines 351-406) should remain unchanged

### 8. Validate Changes
- Ensure the file has no TypeScript errors
- Verify that all unused variables, types, and components are removed
- Confirm that the filter buttons are in the correct order matching KPI cards
- Verify that stores are still sorted by critical items descending by default

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm run build` - Verify no TypeScript errors or build issues
- `pnpm run dev` - Start development server and manually test the Stock by Store page
- Navigate to `/inventory/stores` and verify:
  - Filter button order is: All Stores, Low Stock, Critical Stock
  - Sort section is completely removed
  - Stores are displayed sorted by critical items in descending order
  - All filter buttons (All Stores, Low Stock, Critical Stock) work correctly
  - Search functionality still works as expected

## Notes
- The default sorting behavior (by critical items descending) is preserved in the filtering logic
- Users can no longer change the sort order, which simplifies the UI
- The filter button order now matches the visual hierarchy of the KPI cards above them (Low Stock card appears before Critical Stock card)
- All other functionality (search, filtering, navigation to inventory page) remains unchanged
