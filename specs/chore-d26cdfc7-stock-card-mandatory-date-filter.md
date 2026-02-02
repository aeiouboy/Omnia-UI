# Chore: Add Mandatory View Type and Date Range Selection to Stock Card Page

## Metadata
adw_id: `d26cdfc7`
prompt: `Add mandatory view type and date range selection to the Stock Card page (app/inventory-new/stores/page.tsx). Requirements: 1) User MUST select both View Type AND Date Range (From/To dates) before any store data is displayed. 2) Show an empty state with clear instruction message like 'Please select a View Type and Date Range to view stock card data' when either is not selected. 3) Add From/To date picker inputs using Calendar and Popover components from src/components/ui/. 4) Place date pickers in the filter section alongside existing View Type dropdown. 5) Disable or hide Store ID/Store Name search filters until view type and date range are selected. 6) Use the same mandatory selection pattern as the main inventory page (app/inventory-new/page.tsx) which requires view type selection. 7) Use consistent styling: min-w-[160px] for inputs, same empty state icon pattern (h-16 w-16). 8) Only fetch/display store performance data after both selections are made. Reference inventory-new/page.tsx for the mandatory view type pattern and stock-config/page.tsx for date picker implementation.`

## Chore Description
This chore adds mandatory filtering to the Stock Card page (`/inventory-new/stores`) requiring users to select BOTH a View Type AND a Date Range (From/To dates) before any store performance data is displayed. Currently, the page allows data display when either a view type OR a search term is provided. The new behavior enforces both a view type selection AND date range selection as prerequisites for viewing data.

Key changes:
1. Add From/To date picker inputs in the filter section using Calendar and Popover components
2. Modify the data loading logic to require BOTH view type AND date range selection
3. Update the empty state message to reflect both requirements
4. Conditionally disable the Store ID/Store Name search filters until prerequisites are met
5. Maintain consistent styling patterns (min-w-[160px], h-16 w-16 icons)

## Relevant Files
Use these files to complete the chore:

- **app/inventory-new/stores/page.tsx** - The Stock Card page that needs modification. This is the primary file to edit. Currently has view type selector and store search filters. Needs date range pickers added and mandatory selection logic updated.

- **app/inventory-new/page.tsx** - Reference for mandatory view type selection pattern. Shows how `InventoryEmptyState` is used with conditional content rendering based on `selectedViewType`. Lines 530-531 show the pattern: `{!activeStoreFilter && (!selectedViewType || selectedViewType === "all") ? (<InventoryEmptyState message="..." />) : (...content...)}`

- **app/stock-config/page.tsx** - Reference for date picker implementation. Lines 822-891 show the From/To date picker pattern using `Calendar`, `Popover`, `PopoverTrigger`, `PopoverContent`, and `format` from date-fns. Shows state management with `configDateRange: { startDate: Date | undefined, endDate: Date | undefined }`.

- **src/components/inventory/inventory-empty-state.tsx** - The empty state component. Already accepts `message` and `subtitle` props. Uses `Package` icon with `h-16 w-16` sizing and dashed border card.

- **src/components/ui/calendar.tsx** - Calendar component using react-day-picker. Already available and used in stock-config page.

- **src/components/ui/popover.tsx** - Popover component using Radix UI. Already available and used in stock-config page.

### New Files
No new files needed - all changes are to existing files.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Add Date Range State and Imports
- Add import for `Calendar` from `@/components/ui/calendar`
- Add import for `Popover, PopoverContent, PopoverTrigger` from `@/components/ui/popover`
- Add import for `format` from `date-fns`
- Add import for `Calendar as CalendarIcon` from `lucide-react`
- Add state for date range: `const [dateRange, setDateRange] = useState<{ startDate: Date | undefined, endDate: Date | undefined }>({ startDate: undefined, endDate: undefined })`
- Add derived validation state: `const hasValidDateRange = dateRange.startDate !== undefined && dateRange.endDate !== undefined`

### 2. Update Data Loading Validation Logic
- Modify the `loadData` function's validation check (around line 122-131)
- Change from: `if (!hasViewTypeFilter && !hasValidSearchCriteria)`
- Change to: `if (!hasViewTypeFilter || !hasValidDateRange)`
- This enforces BOTH conditions must be true before fetching data
- Remove the search criteria bypass - search should only work after view type AND date range are selected

### 3. Update useEffect Dependency Array
- Add `hasValidDateRange` and `dateRange` to the useEffect dependency array (line 172)
- Ensure data reloads when date range changes

### 4. Add Date Picker Components to Filter Section
- Locate the filter section (around lines 409-476)
- Add From/To date pickers after the View Type Select and before the Store Search Group
- Use the same pattern as stock-config/page.tsx lines 822-891
- Styling for date pickers:
  - Button: `variant="outline" size="sm" className="w-[130px] justify-start text-left font-normal"`
  - Include CalendarIcon with `className="mr-2 h-4 w-4"`
  - Show formatted date or placeholder "From" / "To"
- Add a clear button that appears when dates are set
- Add a vertical divider (`<div className="h-8 w-px bg-border" />`) between date pickers and Store Search Group

### 5. Conditionally Disable Store Search Filters
- Wrap the Store Search Group div (lines 432-457) with conditional disabled state
- Add opacity and pointer-events styling when prerequisites not met: `className={... ${(!hasViewTypeFilter || !hasValidDateRange) ? 'opacity-50 pointer-events-none' : ''}}`
- Alternatively, set `disabled` prop on Input components when prerequisites not met

### 6. Update Empty State Condition and Message
- Locate the empty state conditional (lines 608-624)
- Change the condition from `((!selectedViewType || selectedViewType === "all") && !hasValidSearchCriteria)`
- Change to: `(!selectedViewType || selectedViewType === "all" || !hasValidDateRange)`
- Update the message prop to: `"Please select a View Type and Date Range to view stock card data"`
- Update the subtitle prop to: `"Both View Type and Date Range (From/To) are required to display store data"`

### 7. Update Table Display Condition
- Locate the table display conditional (lines 626-627)
- Change from: `((selectedViewType && selectedViewType !== "all") || hasValidSearchCriteria)`
- Change to: `(selectedViewType && selectedViewType !== "all" && hasValidDateRange)`
- This ensures table only shows when BOTH prerequisites are met

### 8. Update Clear All Button Logic
- Locate the Clear All button (lines 463-475)
- Add date range clearing to the onClick handler: `setDateRange({ startDate: undefined, endDate: undefined })`
- Update the disabled condition to include date range: `disabled={!selectedViewType && !storeIdSearch && !storeNameSearch && !dateRange.startDate && !dateRange.endDate}`

### 9. Update Refresh Button Behavior
- The refresh button should remain functional but only trigger data reload when prerequisites are met
- No changes needed if loadData already checks prerequisites

### 10. Verify Styling Consistency
- Ensure date picker buttons use consistent height with other filter inputs (h-10 or h-9)
- Verify empty state icon uses h-16 w-16 pattern (already correct in InventoryEmptyState)
- Ensure min-w-[160px] is used for search inputs (already correct)

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm build` - Ensure the project builds without TypeScript errors
- `pnpm lint` - Ensure no linting errors are introduced
- `pnpm dev` - Start development server and manually verify:
  1. Navigate to `/inventory-new/stores`
  2. Verify empty state shows with message "Please select a View Type and Date Range to view stock card data"
  3. Select a View Type only - verify empty state still shows
  4. Select date range only - verify empty state still shows
  5. Select both View Type AND date range - verify store data loads
  6. Verify Store ID/Store Name search filters are disabled/grayed out until prerequisites are met
  7. Click Clear All button - verify all filters including date range are cleared
  8. Verify date pickers use Calendar/Popover pattern similar to stock-config page

## Notes
- The Stock Card page currently has 5 specific view types defined in `STOCK_CARD_VIEW_TYPES` constant (lines 48-54). These should remain unchanged.
- The `useInventoryView` context hook is already used for view type management. Continue using this pattern.
- The `InventoryEmptyState` component already supports custom `message` and `subtitle` props, so no modification to that component is needed.
- The date range state is local to this page and doesn't need to be stored in context.
- Consider adding date validation to ensure `startDate` is not after `endDate` (optional enhancement).
- The existing debounce logic for search inputs (lines 159-171) should work alongside the new date range requirements.
