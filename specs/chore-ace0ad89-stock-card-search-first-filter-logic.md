# Chore: Stock Card Search-First Filter Logic Redesign

## Metadata
adw_id: `ace0ad89`
prompt: `Redesign Stock Card page (app/inventory-new/stores/page.tsx) filter logic with search-first approach. PURPOSE: Show what products are sold in each store. FILTER REQUIREMENTS: User MUST select at least one filter before data appears. NEW FLOW: 1) EMPTY STATE: When no filter selected (View Type is "All Views" AND Store search is empty) show message "Please select a view type or search for a store". No data displayed. 2) VIEW TYPE FILTER: When user selects specific View Type from dropdown (not "All Views"), immediately display ALL stores that have inventory in that view type. 3) STORE SEARCH: When user enters Store ID or Store Name, display matching stores. 4) COMBINED: If both View Type AND Store search are provided, filter by both criteria. CURRENT PROBLEM: Page only checks for store search, ignoring View Type selection. Message says "Please enter a store name to search" even after selecting View Type. FIX: Check if View Type is selected (not "All Views") OR if Store search has value. If either condition is true, fetch and display data. Only show empty state when BOTH are empty/default. After stores table displayed, user clicks store row to view products for that selected store with the selected view type filter applied.`

## Chore Description
Redesign the Stock Card page (`app/inventory-new/stores/page.tsx`) filter logic to implement a search-first approach with OR-based filter gating instead of the current restrictive AND-based logic.

**Current Problem:**
The page currently requires BOTH View Type selection AND Store search to display data. This is too restrictive - users cannot see stores by View Type alone, and the page shows "Please enter a store name to search" even after selecting a View Type.

**New Behavior:**
- **Empty State**: Show empty state ONLY when View Type is "All Views" AND Store search is empty
- **View Type Filter**: Selecting any View Type (not "All Views") immediately displays ALL stores with inventory in that view type
- **Store Search**: Entering Store ID or Store Name displays matching stores regardless of View Type
- **Combined Filters**: When both are provided, filter by both criteria (intersection)

**Purpose**: The Stock Card page shows what products are sold in each store. Users should be able to explore stores by View Type OR by search query.

## Relevant Files
Use these files to complete the chore:

- **`app/inventory-new/stores/page.tsx`** - Main file to modify. Contains the Stock Card page with filter logic, data loading, and conditional rendering. The core fix involves changing the AND condition to OR condition in `loadData()` function and empty state rendering.

- **`src/components/inventory/inventory-empty-state.tsx`** - Empty state component used for displaying the "no filter selected" message. May need to update the default message props.

- **`src/lib/inventory-service.ts`** - Service layer for fetching store performance data. Contains `fetchStorePerformance()` function which accepts `InventoryFilters`. No changes needed here - the filter logic works correctly.

- **`src/types/view-type-config.ts`** - Contains `VIEW_TYPE_CONFIG` with all view type definitions. Used for the View Type dropdown. No changes needed.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Fix the loadData Function Filter Condition
- Open `app/inventory-new/stores/page.tsx`
- Locate the `loadData()` function around line 100-135
- Find the current condition on line 103:
  ```typescript
  if (!selectedViewType || selectedViewType === "all" || !searchQuery.trim()) {
  ```
- Change to OR logic - only block loading when BOTH are empty/default:
  ```typescript
  const hasViewTypeFilter = selectedViewType && selectedViewType !== "all"
  const hasSearchQuery = searchQuery.trim() !== ""

  // Only show empty state when NEITHER filter is provided
  if (!hasViewTypeFilter && !hasSearchQuery) {
    if (!isContextLoading) {
      setLoading(false)
      setStoreData([])
    }
    return
  }
  ```

### 2. Update the Empty State Conditional Rendering
- Locate the empty state rendering around lines 556-567
- Find the current condition:
  ```typescript
  {(!selectedViewType || selectedViewType === "all" || !searchQuery.trim()) && (
  ```
- Change to match the new OR logic:
  ```typescript
  {((!selectedViewType || selectedViewType === "all") && !searchQuery.trim()) && (
  ```

### 3. Update the Empty State Message
- In the same empty state section, update the message prop
- Current messages are too specific to each individual filter
- Change to a single clear message:
  ```typescript
  <InventoryEmptyState
    message="Please select a view type or search for a store"
    subtitle="Select a view type from the dropdown OR enter a store name to display data"
  />
  ```

### 4. Update Summary Cards Conditional Rendering
- Locate the Summary Cards section around lines 327-378
- Find the current condition on line 328:
  ```typescript
  {selectedViewType && selectedViewType !== "all" && searchQuery.trim() && (
  ```
- Change to OR logic to show summary when EITHER filter is active:
  ```typescript
  {((selectedViewType && selectedViewType !== "all") || searchQuery.trim()) && (
  ```

### 5. Update Store Table Conditional Rendering
- Locate the Store Table section around lines 569-732
- Find the current condition on line 570:
  ```typescript
  {selectedViewType && selectedViewType !== "all" && searchQuery.trim() && (
  ```
- Change to OR logic:
  ```typescript
  {((selectedViewType && selectedViewType !== "all") || searchQuery.trim()) && (
  ```

### 6. Verify Filter Data Flow Works Correctly
- Confirm the `filteredAndSortedStores` useMemo (lines 152-197) already applies search filter on top of loaded data
- Confirm the store search input updates `searchQuery` state which triggers `loadData()` via the useEffect
- No changes needed to the data filtering logic - it already handles both filters

### 7. Validate Build Compiles Successfully
- Run `pnpm build` to verify no TypeScript compilation errors
- Fix any type errors if they occur

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm build` - Verify the project compiles without TypeScript errors
- `pnpm dev` - Start development server and manually test:
  1. Navigate to `/inventory-new/stores`
  2. Verify empty state shows "Please select a view type or search for a store"
  3. Select a View Type (not "All Views") - stores should appear immediately
  4. Clear View Type back to "All Views" - empty state should return
  5. With "All Views" selected, type in Store search - matching stores should appear
  6. Select both View Type AND enter Store search - should filter by both
  7. Click on a store row - should navigate to inventory page with store filter

## Notes
- The fix changes from AND gating (`viewType AND search`) to OR gating (`viewType OR search`)
- This allows users to explore stores by View Type alone, which is the more common use case
- The Store search becomes an additional refinement filter, not a mandatory requirement
- Navigation to product view when clicking a store row is already implemented and should continue working
- The debounce implementation for search input (from previous chore) remains intact
