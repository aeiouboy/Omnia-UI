# Chore: Adjust Filtering Layout and Add Date Filter to Stock Configuration Page

## Metadata
adw_id: `d728b4a6`
prompt: `Adjust filtering layout in All Stock Configurations section on Stock Configuration page (app/stock-config/page.tsx) to align with Upload History section design and add date filtering. Requirements: 1) Reorganize filter row to match Upload History layout order: [Search input] [Date Range (From/To)] [Frequency dropdown] [Supply Type tabs] 2) Add Start Date range filter with From/To date pickers using Popover and Calendar components like Upload History section 3) Create state for date range: configDateRange with startDate and endDate (both Date | undefined) 4) Filter stockConfigs by checking if config's startDate falls within the selected date range - if From date set, config.startDate >= From; if To date set, config.startDate <= To 5) Remove SKU column from the table as it duplicates Item ID - remove from TableHeader and TableBody 6) Update column order to be: Location ID, Item ID, Quantity, Supply Type, Frequency, Safety Stock, Start Date, End Date, Actions 7) Style date pickers consistently with Upload History section using CalendarIcon, same button styling, and dash separator between From/To 8) Ensure all filters work together: search + date range + frequency + supply type tabs 9) Update 'Showing X of Y configurations' count to reflect all active filters`

## Chore Description
This chore improves the Stock Configuration page by reorganizing the filter layout to match the Upload History section's design and adding a new date range filter for filtering stock configurations by their start date. The changes make the filtering system more consistent across sections, remove duplicate column data (SKU), and ensure proper filter integration.

The main goals are:
- **Consistent UX**: Align the All Stock Configurations filter layout with Upload History section
- **Enhanced Filtering**: Add date range filtering capability for start dates
- **Cleaner Table**: Remove redundant SKU column since it duplicates Item ID
- **Correct Column Order**: Reorganize columns to match business requirements
- **Integrated Filtering**: Ensure all filters (search, date range, frequency, supply type) work together seamlessly

## Relevant Files
Use these files to complete the chore:

- **app/stock-config/page.tsx** (lines 614-702) - Main page component containing the filter layout and table. This is where we'll reorganize the filter row, add date range state, implement filtering logic, and update the "Showing X of Y" count.

- **app/stock-config/page.tsx** (lines 101-105) - Upload History date range filter implementation. This serves as the reference design for the new date range filter we'll add to the All Stock Configurations section.

- **app/stock-config/page.tsx** (lines 743-812) - Upload History filter row layout. This is the exact layout pattern we need to replicate for the All Stock Configurations section (Search input → Date Range → Tabs).

- **src/components/stock-config/stock-config-table.tsx** (lines 162-206) - Table header definition. We'll remove the SKU column and reorder columns to: Location ID, Item ID, Quantity, Supply Type, Frequency, Safety Stock, Start Date, End Date, Actions.

- **src/components/stock-config/stock-config-table.tsx** (lines 208-259) - Table body rendering. We'll remove the SKU cell and ensure the column order matches the updated header.

- **src/components/stock-config/stock-config-table.tsx** (lines 107-144) - Loading skeleton. We'll update the skeleton to match the new column count (9 columns instead of 10).

- **src/types/stock-config.ts** (lines 28-42) - StockConfigItem interface showing that `startDate` is an optional string field, which we'll use for date range filtering.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Add Date Range State for Stock Configurations
- Open `app/stock-config/page.tsx`
- Locate the state declarations section (around line 95-105 where `uploadHistoryDateRange` is defined)
- Add a new state variable `configDateRange` right after line 105:
  ```typescript
  const [configDateRange, setConfigDateRange] = useState<{
    startDate: Date | undefined
    endDate: Date | undefined
  }>({ startDate: undefined, endDate: undefined })
  ```

### 2. Update Filter Logic to Include Date Range Filtering
- Locate the `filters` useMemo hook (lines 114-132)
- This hook currently handles supplyType, frequency, searchQuery, pagination, and sorting
- Add date range filtering logic in the `loadData` function or create a new filtering step
- Since the API filters are in the `filters` object but date filtering needs to happen client-side on `stockConfigs`, we'll need to filter the results after they're loaded
- Create a new `filteredStockConfigs` useMemo that applies date range filtering to `stockConfigs`:
  ```typescript
  const filteredStockConfigs = useMemo(() => {
    const { startDate, endDate } = configDateRange
    if (!startDate && !endDate) return stockConfigs

    return stockConfigs.filter((config) => {
      if (!config.startDate) return false

      const configDate = new Date(config.startDate)
      const configDateOnly = new Date(configDate.getFullYear(), configDate.getMonth(), configDate.getDate())

      if (startDate && endDate) {
        const startDateOnly = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate())
        const endDateOnly = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate())
        return configDateOnly >= startDateOnly && configDateOnly <= endDateOnly
      } else if (startDate) {
        const startDateOnly = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate())
        return configDateOnly >= startDateOnly
      } else if (endDate) {
        const endDateOnly = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate())
        return configDateOnly <= endDateOnly
      }
      return true
    })
  }, [stockConfigs, configDateRange])
  ```

### 3. Reorganize Filter Row Layout
- Locate the filter row in the Tabs section (lines 614-640)
- Currently structured as: `[Search] [Frequency dropdown] [Supply Type tabs]`
- Reorganize to match Upload History layout: `[Search] [Date Range From/To] [Frequency dropdown] [Supply Type tabs]`
- Replace the current filter row (lines 615-640) with the new layout:
  ```tsx
  <div className="flex flex-col gap-4">
    {/* Filters row - search + date range + frequency + supply type tabs */}
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by Location ID, Item ID..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="w-[240px] pl-9 pr-8 h-9"
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSearchQuery("")}
            className="absolute right-0 top-1/2 -translate-y-1/2 h-7 w-7 p-0 hover:bg-transparent"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Clear search</span>
          </Button>
        )}
      </div>

      {/* Date Range Filter */}
      <div className="flex items-center gap-2">
        {/* From Date Popover */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="w-[130px] justify-start text-left font-normal"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {configDateRange.startDate
                ? format(configDateRange.startDate, "MMM d, yyyy")
                : "From"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={configDateRange.startDate}
              onSelect={(date) =>
                setConfigDateRange((prev) => ({ ...prev, startDate: date }))
              }
              initialFocus
            />
          </PopoverContent>
        </Popover>

        <span className="text-muted-foreground">-</span>

        {/* To Date Popover */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="w-[130px] justify-start text-left font-normal"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {configDateRange.endDate
                ? format(configDateRange.endDate, "MMM d, yyyy")
                : "To"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={configDateRange.endDate}
              onSelect={(date) =>
                setConfigDateRange((prev) => ({ ...prev, endDate: date }))
              }
              initialFocus
            />
          </PopoverContent>
        </Popover>

        {/* Clear Button (show only when dates are set) */}
        {(configDateRange.startDate || configDateRange.endDate) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              setConfigDateRange({ startDate: undefined, endDate: undefined })
            }
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Clear date filter</span>
          </Button>
        )}
      </div>

      {/* Frequency Dropdown */}
      <Select value={frequencyFilter} onValueChange={handleFrequencyChange}>
        <SelectTrigger className="w-[180px] h-9">
          <SelectValue placeholder="All Frequencies" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Frequencies</SelectItem>
          <SelectItem value="Daily">Daily</SelectItem>
          <SelectItem value="One-time">One-time</SelectItem>
        </SelectContent>
      </Select>

      {/* Supply Type Tabs */}
      <TabsList>
        <TabsTrigger value="all">All Configs</TabsTrigger>
        <TabsTrigger value="PreOrder">PreOrder</TabsTrigger>
        <TabsTrigger value="OnHand">OnHand</TabsTrigger>
      </TabsList>
    </div>
  </div>
  ```

### 4. Update "Showing X of Y" Count
- Locate the CardDescription in the Stock Config Table card (lines 654-656)
- Update it to use `filteredStockConfigs.length` instead of `stockConfigs.length`:
  ```tsx
  <CardDescription>
    Showing {filteredStockConfigs.length} of {totalItems} configurations
  </CardDescription>
  ```

### 5. Update StockConfigTable Component to Use Filtered Data
- In the `<StockConfigTable>` component call (line 661), replace `items={stockConfigs}` with `items={filteredStockConfigs}`

### 6. Remove SKU Column from Table Header
- Open `src/components/stock-config/stock-config-table.tsx`
- Locate the TableHeader section (lines 162-206)
- Remove the SKU TableHead element (line 182):
  ```tsx
  <TableHead>SKU</TableHead>  {/* REMOVE THIS LINE */}
  ```
- Ensure the remaining column order is:
  1. Location ID (with sort)
  2. Item ID (with sort)
  3. Quantity (with sort)
  4. Supply Type (with sort)
  5. Frequency
  6. Safety Stock
  7. Start Date
  8. End Date
  9. Actions (dropdown menu)

### 7. Remove SKU Column from Table Body
- In the same file, locate the TableBody section (lines 208-259)
- Remove the SKU TableCell (line 213):
  ```tsx
  <TableCell className="font-medium">{item.sku}</TableCell>  {/* REMOVE THIS LINE */}
  ```
- Verify the remaining cells match the header order

### 8. Update Loading Skeleton
- Locate the loading skeleton section (lines 107-144)
- Update the TableHeader to remove the SKU column (line 115):
  ```tsx
  <TableHead>SKU</TableHead>  {/* REMOVE THIS LINE */}
  ```
- Update each skeleton row to have 9 TableCells instead of 10 (remove line 130):
  ```tsx
  <TableCell><Skeleton className="h-4 w-28" /></TableCell>  {/* REMOVE THIS LINE */}
  ```

### 9. Verify Imports
- At the top of `app/stock-config/page.tsx`, verify that `X` icon is imported from lucide-react (should already be imported on line 27)
- Verify that `CalendarIcon` is imported (should already be imported on line 26)
- Verify that `format` from `date-fns` is imported (should already be imported on line 31)
- Verify that `Calendar` and `Popover` components are imported (should already be imported on lines 29-30)

## Validation Commands
Execute these commands to validate the chore is complete:

- **TypeScript Compilation**: `npx tsc --noEmit` - Ensure no TypeScript errors in the updated files
- **Build Test**: `pnpm build` - Verify the application builds successfully with all changes
- **Development Server**: `pnpm dev` - Start the dev server and navigate to `/stock-config` page
- **Visual Verification**:
  - Verify filter layout matches: [Search] [Date Range From/To] [Frequency] [Supply Type Tabs]
  - Verify date pickers use CalendarIcon and have dash separator between From/To
  - Verify table has 9 columns (no SKU column)
  - Verify column order: Location ID, Item ID, Quantity, Supply Type, Frequency, Safety Stock, Start Date, End Date, Actions
  - Verify "Showing X of Y" count updates when date range is selected
  - Test all filters together (search + date range + frequency + supply type tabs)

## Notes
- The date range filtering is implemented client-side on the `stockConfigs` data using `useMemo` for performance
- The filtering logic normalizes dates to start of day for accurate comparison (same approach as Upload History section)
- The "Showing X of Y configurations" count will reflect the client-side filtered results, while `totalItems` still shows the total from the API
- The SKU column removal reduces redundancy since SKU and Item ID contain the same information
- The new layout order matches the Upload History section for consistency across the page
- All existing filter functionality (search, frequency, supply type tabs) remains intact and works together with the new date range filter
