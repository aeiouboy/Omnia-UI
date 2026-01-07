# Chore: Add Upload Date Range Filter to Upload History

## Metadata
adw_id: `b3f65b08`
prompt: `Add Upload Date range filter to Upload History section on Stock Configuration page (app/stock-config/page.tsx). Requirements: 1) Add a date range picker next to the status filter tabs on the right side of the Upload History header 2) Use two date inputs or a date range picker component - 'From' and 'To' dates 3) Create state for uploadHistoryDateRange with startDate and endDate (both optional, default to undefined) 4) Filter fileHistory by uploadDate - show files where uploadDate is between startDate and endDate 5) If only startDate is set, show files from that date onwards; if only endDate is set, show files up to that date 6) Add a clear/reset button (X icon) to reset the date filter 7) Combine date filtering with existing status filtering - both filters should work together 8) Update the filtered count in 'Upload History (X)' title to reflect both filters 9) Use compact date inputs with Calendar icon, styled to match the page design 10) Position date filter between the title and status tabs, or below the status tabs if space is limited`

## Chore Description
Add a date range filter to the Upload History section of the Stock Configuration page. This filter will allow users to filter uploaded files by their upload date. The filter should:
- Display two date inputs (From and To) with Calendar icons
- Work alongside the existing status filter tabs (All, Pending, Processed, Error)
- Support partial date ranges (only From, only To, or both)
- Update the displayed count in the section header to reflect filtered results
- Include a clear button to reset the date filter

## Relevant Files
Use these files to complete the chore:

- **app/stock-config/page.tsx** - Main page component containing the Upload History section. This is where:
  - State management for `uploadHistoryDateRange` will be added
  - The `filteredFileHistory` memo will be updated to include date filtering
  - The date range picker UI will be added to the CardHeader

- **src/types/stock-config.ts** - Contains `StockConfigFile` interface with `uploadDate: string` field (ISO 8601 timestamp) that will be used for filtering

- **src/components/ui/calendar.tsx** - Existing Calendar component using `react-day-picker` for date selection

- **src/components/ui/popover.tsx** - Existing Popover component for dropdown UI

- **src/components/ui/button.tsx** - Button component for the clear/reset button

- **src/lib/utils.ts** - Contains date utility functions like `formatGMT7DateString` and `safeParseDate` for date handling

### New Files
No new files required - all changes will be made to existing files.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Add Date Range State
- Add new state variable `uploadHistoryDateRange` to hold the date filter:
  ```typescript
  const [uploadHistoryDateRange, setUploadHistoryDateRange] = useState<{
    startDate: Date | undefined
    endDate: Date | undefined
  }>({ startDate: undefined, endDate: undefined })
  ```
- Position this state near the existing `uploadHistoryFilter` state (around line 93)

### 2. Update filteredFileHistory Memo to Include Date Filtering
- Modify the `filteredFileHistory` useMemo (lines 414-441) to:
  - First apply status filtering (existing logic)
  - Then apply date filtering based on `uploadHistoryDateRange`
  - Handle partial date ranges:
    - If only `startDate` is set: filter files where uploadDate >= startDate
    - If only `endDate` is set: filter files where uploadDate <= endDate (end of day)
    - If both set: filter files where startDate <= uploadDate <= endDate
  - Add `uploadHistoryDateRange` to the dependency array
- Use date comparison logic that handles ISO 8601 strings properly

### 3. Create Date Range Clear Handler
- Add handler function `handleClearDateFilter`:
  ```typescript
  const handleClearDateFilter = () => {
    setUploadHistoryDateRange({ startDate: undefined, endDate: undefined })
  }
  ```

### 4. Add Imports for Date Picker Components
- Add imports at the top of the file:
  ```typescript
  import { Calendar } from "@/components/ui/calendar"
  import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
  import { format } from "date-fns"  // May need to install if not available
  import { X, Calendar as CalendarIcon } from "lucide-react"
  ```
- Note: Check if `date-fns` is already a dependency or if `react-day-picker` provides formatting

### 5. Add Date Range Picker UI to Upload History Header
- Locate the Upload History Card's CardHeader (lines 631-660)
- Add date range picker between the title/description and the status tabs
- Structure the UI as follows:
  ```tsx
  <CardHeader className="flex flex-col gap-4">
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      {/* Title and description */}
      <div>
        <CardTitle>...</CardTitle>
        <CardDescription>...</CardDescription>
      </div>

      {/* Filters row - date range + status tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        {/* Date Range Filter */}
        <div className="flex items-center gap-2">
          {/* From Date Popover */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="w-[130px] justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate ? format(startDate, "MMM d, yyyy") : "From"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar mode="single" selected={startDate} onSelect={...} />
            </PopoverContent>
          </Popover>

          <span className="text-muted-foreground">-</span>

          {/* To Date Popover */}
          <Popover>...</Popover>

          {/* Clear Button (show only when dates are set) */}
          {(startDate || endDate) && (
            <Button variant="ghost" size="sm" onClick={handleClearDateFilter}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Status Filter Tabs */}
        <Tabs value={uploadHistoryFilter} ...>
          <TabsList>...</TabsList>
        </Tabs>
      </div>
    </div>
  </CardHeader>
  ```

### 6. Implement Date Selection Handlers
- Create handlers for date selection that update the state:
  ```typescript
  const handleStartDateSelect = (date: Date | undefined) => {
    setUploadHistoryDateRange(prev => ({ ...prev, startDate: date }))
  }

  const handleEndDateSelect = (date: Date | undefined) => {
    setUploadHistoryDateRange(prev => ({ ...prev, endDate: date }))
  }
  ```

### 7. Style the Date Picker for Compact Display
- Use `size="sm"` on buttons
- Set fixed width (`w-[130px]`) for consistent sizing
- Use appropriate text truncation for dates
- Match existing page styling with muted colors and borders

### 8. Ensure Mobile Responsiveness
- On smaller screens, stack the date filter and status tabs vertically
- Use `flex-col sm:flex-row` for responsive layout
- Test that touch targets are at least 44px

### 9. Verify Count Updates in Title
- Confirm that `filteredFileHistory.length` in the title reflects both status and date filters
- The existing code `Upload History ({filteredFileHistory.length})` should automatically update

### 10. Test Date Filtering Logic
- Verify filtering works correctly for:
  - Only start date set
  - Only end date set
  - Both dates set
  - No dates set (shows all files matching status filter)
  - Edge cases: same start and end date should show files from that day

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm build` - Ensure no TypeScript or build errors
- `pnpm lint` - Ensure no linting errors
- `pnpm dev` - Start dev server and manually test:
  1. Navigate to /stock-config page
  2. Scroll to Upload History section
  3. Click "From" date picker, select a date
  4. Verify files are filtered to show only those from that date onwards
  5. Click "To" date picker, select a date
  6. Verify files are filtered within the date range
  7. Click X button to clear dates
  8. Verify all files are shown again
  9. Combine date filter with status tabs (e.g., "Processed" + date range)
  10. Verify the count in "Upload History (X)" updates correctly

## Notes
- The `uploadDate` field in `StockConfigFile` is an ISO 8601 string, so date comparison should use `new Date(file.uploadDate)` for accurate comparison
- End date filtering should include the entire day (set time to 23:59:59 or use date-only comparison)
- Consider using `date-fns` for date formatting if already available, or use native `toLocaleDateString` for simpler approach
- The existing Calendar component from UI library supports single date selection (`mode="single"`) which works well for separate From/To inputs
- If `date-fns` is not available, use `toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })` for formatting
