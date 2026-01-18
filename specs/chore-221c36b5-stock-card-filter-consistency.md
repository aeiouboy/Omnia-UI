# Chore: Stock Card Page Filter Consistency Improvements

## Metadata
adw_id: `221c36b5`
prompt: `Improve Stock Card page filter consistency at app/inventory-new/stores/page.tsx: 1. Make All Views dropdown width consistent with search fields 2. Align Store ID and Store Name search fields with equal width 3. Add visual indicator showing current filter state 4. Consider adding a Total Stores: X indicator similar to Inventory Availability record count display`

## Chore Description
This chore improves the visual consistency and usability of the Stock Card page filters. The current implementation has inconsistent widths between the View Type dropdown and search fields, and lacks a clear indicator showing active filter state or total record count. The improvements include:

1. **Consistent dropdown width**: The "All Views" dropdown should have the same width as the search fields for visual alignment
2. **Equal search field widths**: Store ID and Store Name search fields should have matching widths
3. **Filter state indicator**: Add a visual badge/indicator showing how many filters are currently active
4. **Total Stores indicator**: Add a "Total Stores: X" count similar to the Inventory Availability page's "Showing X of Y products" display

## Relevant Files
Use these files to complete the chore:

- **app/inventory-new/stores/page.tsx** (lines 409-466) - Main Stock Card page with filter controls. Contains the View Type Select dropdown (w-[280px]), Store ID search (w-[160px]), and Store Name search (w-[180px]). These widths need to be standardized.

- **app/inventory-new/page.tsx** (lines 584-588) - Reference implementation for record count display. Shows pattern: `<CardDescription>Showing {inventoryItems.length} of {totalItems} products</CardDescription>`

- **app/inventory-new/supply/page.tsx** - Reference for filter layout patterns. Uses similar search fields with consistent styling.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Standardize Filter Element Widths
- Change the View Type Select dropdown width from `w-[280px]` to `w-[200px]` to better align with search fields
- Change Store ID search input width from `w-[160px]` to `w-[200px]` for consistency
- Change Store Name search input width from `w-[180px]` to `w-[200px]` for consistency
- All three filter elements will now have matching `w-[200px]` width

### 2. Add Active Filter State Indicator
- Add a Badge component after the filter row to show active filter count
- Badge should display when any filter is active (viewType selected OR storeIdSearch has value OR storeNameSearch has value)
- Badge text format: "X filter(s) active" or specific labels like "View Type: ECOM-TH-CFR-LOCD-STD"
- Use a subtle badge style that doesn't overpower the UI (e.g., `variant="secondary"` with small text)

### 3. Add Total Stores Counter
- Add a "Total Stores: X" indicator in the filter bar area (right side)
- Display `filteredAndSortedStores.length` when filters are active
- Position it similarly to how the Inventory Availability page shows record counts
- Use muted text styling: `text-sm text-muted-foreground`

### 4. Validate the Changes
- Run `pnpm build` to ensure no TypeScript or build errors
- Verify visually that all filter elements have consistent widths
- Confirm the Total Stores indicator updates correctly when filters change
- Test that the filter state indicator shows/hides appropriately

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm build` - Verify no TypeScript compilation errors
- `pnpm lint` - Ensure code style compliance
- `pnpm dev` - Start dev server and manually verify:
  1. All three filter fields (View Type, Store ID, Store Name) have equal widths
  2. Total Stores indicator displays correct count
  3. Filter state indicator shows when filters are active

## Notes
- The current filter row uses `flex flex-wrap gap-3 items-center` layout which should accommodate the new elements
- Consider using `justify-between` on the filter row to push the Total Stores counter to the right
- The existing `summary.totalStores` variable already tracks total store count from `storeData.length`
- Filter validation states (`hasValidStoreIdSearch`, `hasValidStoreNameSearch`) can be reused for the filter indicator
