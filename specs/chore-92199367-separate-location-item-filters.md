# Chore: Separate Location ID and Item ID Filtering

## Metadata
adw_id: `92199367`
prompt: `Separate Location ID and Item ID filtering in All Stock Configurations section (app/stock-config/page.tsx). Requirements: 1) Replace the single 'Search by Location ID, Item ID...' textbox with two separate filter inputs 2) Add 'Location ID' textbox with placeholder 'Filter by Location ID' 3) Add 'Item ID' textbox with placeholder 'Filter by Item ID' 4) Place both filters side by side before the date range picker 5) Each filter should have a search icon prefix like the current search box 6) Update the filtering logic to filter by locationId when Location ID input has value AND by itemId when Item ID input has value 7) Use the same input styling (h-9, text-sm, border, rounded) as current search box 8) Make each filter input narrower (w-40 or similar) since they are now separate fields`

## Chore Description
Currently, the Stock Configuration page has a single combined search textbox that searches across both Location ID and Item ID fields using OR logic. This chore will separate this into two independent filter inputs:

- **Current behavior**: One search box that searches both locationId OR itemId
- **New behavior**: Two separate filter inputs that filter by locationId AND itemId independently

This change will provide users with more precise filtering capabilities, allowing them to filter by specific Location IDs, specific Item IDs, or both simultaneously.

## Relevant Files
Use these files to complete the chore:

- **app/stock-config/page.tsx** (lines 1-1043) - Main page component containing:
  - Current single search input UI (lines 700-719)
  - Search state management (`searchQuery` - line 97)
  - Filter building logic that passes `searchQuery` to service (lines 119-137)

- **src/lib/stock-config-service.ts** (lines 468-475) - Service layer containing:
  - Current filtering logic that searches both locationId and itemId with OR logic
  - This logic needs to be updated to support separate location and item filtering

- **src/types/stock-config.ts** (lines 177-185) - Type definitions containing:
  - `StockConfigFilters` interface that currently has `searchQuery?: string`
  - This interface needs to be extended with separate filter fields

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Update Type Definitions
- Open `src/types/stock-config.ts`
- Locate the `StockConfigFilters` interface (around line 177)
- Add two new optional fields: `locationIdFilter?: string` and `itemIdFilter?: string`
- Keep the existing `searchQuery?: string` for backward compatibility (can be deprecated later if needed)

### 2. Update Service Layer Filtering Logic
- Open `src/lib/stock-config-service.ts`
- Locate the search filtering logic (around lines 468-475)
- Add new filtering logic for `locationIdFilter` and `itemIdFilter`:
  - If `locationIdFilter` is provided, filter items where locationId includes the filter value
  - If `itemIdFilter` is provided, filter items where itemId includes the filter value
  - Both filters should work together with AND logic (not OR)
- Place the new filtering logic after the frequency filter and before (or replacing) the existing searchQuery logic

### 3. Update Page Component State
- Open `app/stock-config/page.tsx`
- Replace the single `searchQuery` state (line 97) with two separate states:
  - `locationIdFilter` with initial value `""`
  - `itemIdFilter` with initial value `""`
- Update the `filters` useMemo (lines 119-137) to pass `locationIdFilter` and `itemIdFilter` instead of `searchQuery`

### 4. Update UI Components
- In `app/stock-config/page.tsx`, locate the search input section (lines 700-719)
- Replace the single search input with two separate inputs:
  - **Location ID Input**:
    - Placeholder: "Filter by Location ID"
    - Width: `w-40` (narrower than current)
    - Same styling: `h-9 text-sm border rounded pl-9 pr-8`
    - Include Search icon prefix
    - Include clear button (X) when value exists
  - **Item ID Input**:
    - Placeholder: "Filter by Item ID"
    - Width: `w-40` (narrower than current)
    - Same styling: `h-9 text-sm border rounded pl-9 pr-8`
    - Include Search icon prefix
    - Include clear button (X) when value exists
- Arrange both inputs side by side in a flex container before the date range picker

### 5. Update Event Handlers
- Remove or update the `handleSearchChange` function (lines 205-208)
- Create two new handler functions:
  - `handleLocationIdChange`: Updates `locationIdFilter` state and resets page to 1
  - `handleItemIdChange`: Updates `itemIdFilter` state and resets page to 1
- Wire up the new handlers to their respective input fields

### 6. Validate Changes
- Test that Location ID filter works independently
- Test that Item ID filter works independently
- Test that both filters work together with AND logic
- Test that clear buttons work correctly on both inputs
- Verify page resets to 1 when filters change
- Check that the UI layout looks correct with both inputs side by side

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm dev` - Start the development server and verify no TypeScript errors
- Navigate to http://localhost:3000/stock-config in browser
- Test Location ID filter: Enter "CFM6686" and verify only matching records show
- Test Item ID filter: Enter "48705813" and verify only matching records show
- Test combined filters: Enter both Location ID and Item ID, verify AND logic works
- Test clear buttons: Click X on each input, verify filters clear correctly
- `pnpm build` - Verify production build completes without errors

## Notes
- The current search input has width `w-[240px]`. Since we're splitting into two inputs, using `w-40` (160px each) provides a total of ~320px width which is reasonable
- Both filters should use case-insensitive matching (toLowerCase) to match existing behavior
- The clear button (X icon) should only show when the respective input has a value
- Consider keeping the old `searchQuery` logic as a fallback for backward compatibility, but the new separate filters should take precedence
- The filters should work together with AND logic: if both are filled, show only items that match BOTH locationId AND itemId filters
