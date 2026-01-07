# Chore: Add File Name Search Filter to Upload History Section

## Metadata
adw_id: `d896bf80`
prompt: `Add file name search filter to Upload History section on Stock Configuration page (app/stock-config/page.tsx). Requirements: 1) Add a search input field with Search icon (from lucide-react) to filter files by filename 2) Position the search input on the left side of the date range filter, creating a filter row layout: [Search] [Date Range] [Status Tabs] 3) Create state uploadHistorySearch (string, default empty) to track the search query 4) Filter fileHistory by filename using case-insensitive partial match (filename.toLowerCase().includes(search.toLowerCase())) 5) Combine search filtering with existing date range and status filters - all three should work together 6) Add placeholder text 'Search files...' in the input 7) Make the search input compact (w-[180px]) to fit the filter row 8) Update filtered count in 'Upload History (X)' title to reflect all active filters 9) Add a clear button (X icon) inside the search input when text is entered`

## Chore Description
Add a filename search filter to the Upload History section that allows users to filter files by name. The search input should be positioned before the date range filter, creating a horizontal filter row with three filter types: filename search, date range, and status tabs. All three filters should work together combinatorially. The search should use case-insensitive partial matching and include a clear button when text is entered.

## Relevant Files
- `app/stock-config/page.tsx` (lines 1-829) - Main Stock Configuration page component
  - Contains Upload History section starting at line 669
  - Has existing filter state: `uploadHistoryFilter` (line 98) and `uploadHistoryDateRange` (lines 99-102)
  - Has existing filter logic in `filteredFileHistory` useMemo (lines 423-480)
  - Needs new state `uploadHistorySearch` added
  - Needs search input UI added in filter row (around lines 683-755)
  - Needs search filtering logic added to `filteredFileHistory` useMemo
  - Already imports `Search` and `X` icons from lucide-react (lines 12, 26)
  - Already imports `Input` component from UI (line 9)

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Add Search State Variable
- Add `uploadHistorySearch` state below the existing `uploadHistoryDateRange` state (around line 103)
- Initialize as empty string: `const [uploadHistorySearch, setUploadHistorySearch] = useState("")`

### 2. Add Search Input UI Component
- Locate the filters row section in the Upload History CardHeader (lines 683-755)
- Add search input container div before the date range filter div (before line 684)
- Create a relative container for the search input with clear button
- Add Input component with:
  - `w-[180px]` width class
  - `placeholder="Search files..."`
  - `value={uploadHistorySearch}`
  - `onChange` handler to update `uploadHistorySearch` state
  - Left padding for Search icon: `pl-9`
  - Right padding for clear button: `pr-8`
- Add Search icon positioned absolutely at left side
- Add clear button (X icon) inside input on right side, visible only when `uploadHistorySearch` is not empty
- Make clear button clickable to reset search: `onClick={() => setUploadHistorySearch("")}`

### 3. Update Filter Logic in filteredFileHistory Memo
- Locate the `filteredFileHistory` useMemo hook (lines 423-480)
- Add search filtering logic after status filter (around line 454, before date range filter)
- Filter by filename using case-insensitive partial match:
  ```typescript
  if (uploadHistorySearch) {
    filtered = filtered.filter((f) =>
      f.filename.toLowerCase().includes(uploadHistorySearch.toLowerCase())
    )
  }
  ```
- Ensure search filter is applied AFTER status filter but BEFORE date range filter
- Add `uploadHistorySearch` to the useMemo dependency array (line 480)

### 4. Update Filtered Count Display
- The count in the title "Upload History (X)" already uses `filteredFileHistory.length` (line 675)
- No changes needed - it will automatically reflect all active filters

### 5. Test Layout and Responsiveness
- Verify the filter row layout: [Search Input] [Date Range] [Status Tabs]
- Ensure the search input is compact (180px width)
- Test that all three filters work together
- Verify the clear button appears/disappears correctly
- Test case-insensitive search matching

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm dev` - Start development server and navigate to `/stock-config` page
- Manual testing:
  1. Navigate to Stock Configuration page
  2. Scroll to Upload History section
  3. Verify search input appears on left side of date range filter
  4. Enter text in search input and verify files are filtered by filename (case-insensitive)
  5. Verify clear button (X) appears when text is entered
  6. Click clear button and verify search is reset
  7. Combine search with date range filter and verify both work together
  8. Combine search with status tabs and verify both work together
  9. Verify the count in "Upload History (X)" title updates correctly with all filters
- `pnpm build` - Ensure no TypeScript errors

## Notes
- The search input uses the same Input component already imported in the file
- The Search and X icons are already imported from lucide-react
- The filtering logic follows the same pattern as the existing date range filter
- All three filters (search, date range, status) work combinatorially in sequence
- The filtered count automatically updates because it uses `filteredFileHistory.length`
