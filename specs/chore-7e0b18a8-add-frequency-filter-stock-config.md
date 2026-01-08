# Chore: Add Frequency Filter to Stock Configuration Page

## Metadata
adw_id: `7e0b18a8`
prompt: `Improve filtering consistency in All Stock Configurations section on Stock Configuration page (app/stock-config/page.tsx) to match Upload History section design. Requirements: 1) Move the search input from right side to left side of the filter row for consistency with Upload History section 2) Add a Frequency filter dropdown between search and Supply Type tabs with options: All Frequencies, Daily, One-time 3) Create state frequencyFilter (string, default 'all') to track selected frequency 4) Filter stockConfigs by frequency - 'Daily' shows frequency='Daily', 'One-time' shows frequency='One-time' or frequency='Onetime' 5) Combine frequency filtering with existing search and tab filters - all three should work together 6) Update 'Showing X of Y configurations' count to reflect all active filters 7) Style the frequency dropdown to match the page design using Select component from shadcn/ui 8) Layout order should be: [Search input] [Frequency dropdown] [Supply Type tabs] from left to right`

## Chore Description
Reorganize the filter controls in the "All Stock Configurations" section to improve consistency with the Upload History section design. This involves moving the search input to the left, adding a new frequency filter dropdown in the middle, and ensuring all three filters (search, frequency, supply type) work together seamlessly. The frequency filter should support filtering by Daily, One-time (including legacy "Onetime" format), or all frequencies.

## Relevant Files
Use these files to complete the chore:

- **app/stock-config/page.tsx** (Lines 1-858) - Main Stock Configuration page component
  - Lines 95-96: Add new `frequencyFilter` state alongside existing filter states
  - Lines 112-119: Update `filters` useMemo to include frequency filter
  - Lines 413-421: Update `summaryStats` calculation to reflect frequency-filtered configs
  - Lines 595-612: Reorganize filter layout - move search left, add frequency dropdown, keep tabs
  - Lines 619-628: Update CardDescription to show filtered count

- **src/types/stock-config.ts** (Lines 1-207) - Type definitions
  - Lines 24: Reference for `Frequency` type: "One-time" | "Daily" | "Onetime"
  - Lines 179-187: Reference for `StockConfigFilters` interface (already supports frequency field)

- **src/components/ui/select.tsx** (Lines 1-161) - shadcn/ui Select component
  - Import and use for frequency dropdown: Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Add Frequency Filter State
- Add `frequencyFilter` state variable with type `"all" | "Daily" | "One-time"` and default value `"all"`
- Place this state declaration alongside other filter states (after line 95, near `activeTab` and `searchQuery`)

### 2. Update Filters Object to Include Frequency
- Modify the `filters` useMemo hook (lines 112-119) to include the frequency filter
- Add logic: if `frequencyFilter` is "all", pass "all", otherwise pass the selected frequency value
- Ensure the frequency filter value is properly typed according to `StockConfigFilters` interface

### 3. Import Select Components
- Add Select component imports at the top of the file with other UI imports
- Import: `Select`, `SelectContent`, `SelectItem`, `SelectTrigger`, `SelectValue` from `@/components/ui/select`

### 4. Reorganize Filter Row Layout
- Locate the Tabs component section (lines 596-612)
- Restructure the layout to: `<div className="flex items-center gap-4">` containing:
  - Search input (move from right side, keep same functionality)
  - Frequency filter dropdown (new component)
  - Supply Type TabsList (existing, keep as-is)
- Remove the nested structure that places search on the right side

### 5. Implement Frequency Filter Dropdown
- Create a Select component between search input and tabs
- Add three SelectItems: "All Frequencies" (value="all"), "Daily" (value="Daily"), "One-time" (value="One-time")
- Bind to `frequencyFilter` state with `value={frequencyFilter}` and `onValueChange={setFrequencyFilter}`
- Style the Select trigger to match page design (consistent height and spacing with search input and tabs)
- Reset page to 1 when frequency filter changes

### 6. Update Summary Stats Calculation
- Modify the `summaryStats` useMemo (lines 413-421) if needed
- Ensure `dailyConfigs` count uses `frequency === "Daily"`
- Ensure `oneTimeConfigs` count uses `frequency === "One-time" || frequency === "Onetime"` (for backward compatibility)
- Note: These stats should show totals across all configs, not filtered by current view

### 7. Update Card Description Display
- Locate the CardDescription in the Stock Config Table card (line 626-628)
- Verify it shows: "Showing {stockConfigs.length} of {totalItems} configurations"
- This already reflects all active filters since it uses filtered `stockConfigs.length` and total from API response

### 8. Test Filter Combinations
- Verify search + frequency filters work together
- Verify search + frequency + supply type tabs work together
- Verify page resets to 1 when any filter changes
- Verify the "Showing X of Y" count updates correctly with all filter combinations

## Validation Commands
Execute these commands to validate the chore is complete:

- `npm run dev` - Start development server and verify no compilation errors
- **Manual UI Testing**:
  1. Navigate to `/stock-config` page
  2. Verify filter layout order: [Search] [Frequency dropdown] [Supply Type tabs]
  3. Test search filter alone - verify results update
  4. Test frequency filter alone - select "Daily", verify only Daily configs shown
  5. Test frequency filter alone - select "One-time", verify One-time configs shown
  6. Test combined filters - search + Daily frequency + PreOrder tab
  7. Verify "Showing X of Y configurations" count matches visible filtered results
  8. Verify page resets to 1 when changing any filter
- `npm run build` - Build production bundle and verify no TypeScript errors
- `npm run lint` - Run ESLint and verify no linting errors

## Notes
- The frequency filter should handle both "One-time" and legacy "Onetime" values for backward compatibility (already supported by API/types)
- The StockConfigFilters interface in types already includes the frequency field, so no type changes needed
- The search input should maintain its existing placeholder and functionality, just repositioned
- The frequency dropdown should have a width that balances well between search input and tabs (suggest `w-[180px]` similar to Upload History search)
- All three filters should work independently and in combination - the API/service layer should handle the combined filtering
- Consider using `h-10` height for Select trigger to match Input component default height
