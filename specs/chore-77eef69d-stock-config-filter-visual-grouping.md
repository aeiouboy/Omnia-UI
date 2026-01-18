# Chore: Stock Configuration Filter Visual Grouping

## Metadata
adw_id: `77eef69d`
prompt: `Fix layout filtering on Stock Configuration page (app/stock-config/page.tsx): Add visual grouping for search fields to match the Inventory Availability page pattern. In the 'All Stock Configurations' section filter row (lines 762-916), make these changes: 1) Wrap Location ID filter input (lines 764-786) in a bordered container with 'Location' label using classes 'flex items-center gap-2 p-2 border border-border/40 rounded-md bg-muted/5' for container and 'text-xs font-medium text-muted-foreground whitespace-nowrap' for label. 2) Wrap Item ID filter input (lines 788-811) in a bordered container with 'Item' label using the same styling. 3) Add a vertical divider between Item group and date range using 'hidden sm:block h-8 w-px bg-border'. 4) Update the outer filter container (line 762) to use 'flex flex-nowrap gap-3 items-center overflow-x-auto' to prevent wrapping and enable horizontal scroll. 5) Keep the Search icons inside the inputs but remove them from the grouped inputs since the label provides sufficient context. 6) Apply same pattern to Upload History section filter row (lines 978-1093) - wrap Search files input in a bordered container with 'File' label. This creates visual hierarchy consistent with the Inventory Availability page at app/inventory-new/supply/page.tsx lines 315-406.`

## Chore Description
Add visual grouping to filter inputs on the Stock Configuration page to match the design pattern established in the Inventory Availability page. The current filter layout has standalone input fields without visual grouping, making it harder to understand the filter categories. This chore adds bordered containers with labels around related filter inputs, creating clear visual hierarchy and consistency across the application.

The changes affect two sections:
1. **All Stock Configurations section** (lines 762-916): Group Location ID and Item ID filters with labels, add vertical divider before date range
2. **Upload History section** (lines 978-1093): Group file search input with 'File' label

## Relevant Files
Use these files to complete the chore:

- **app/stock-config/page.tsx** - Main file to modify. Contains both filter sections that need visual grouping updates.
- **app/inventory-new/supply/page.tsx** (lines 315-406) - Reference implementation showing the target design pattern with bordered containers, labels, and vertical dividers.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Update Stock Configurations Filter Container (Line 762)
- Change outer filter container classes from `flex flex-col sm:flex-row items-start sm:items-center gap-3` to `flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between overflow-x-auto`
- Add an inner wrapper `<div className="flex flex-nowrap gap-3 items-center">` around the Location, Item, divider, date range, and dropdown groups to prevent wrapping

### 2. Wrap Location ID Filter in Visual Group (Lines 764-786)
- Replace the standalone Location ID filter `<div className="relative">` with a grouped container:
  ```tsx
  <div className="flex items-center gap-2 p-2 border border-border/40 rounded-md bg-muted/5">
    <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">Location</span>
    <div className="relative">
      <Input
        placeholder="Search Location ID..."
        value={locationIdFilter}
        onChange={handleLocationIdChange}
        className="min-w-[160px] h-9 text-sm"
      />
      {locationIdFilter && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setLocationIdFilter("")
            setPage(1)
          }}
          className="absolute right-0 top-1/2 -translate-y-1/2 h-7 w-7 p-0 hover:bg-transparent"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Clear location filter</span>
        </Button>
      )}
    </div>
  </div>
  ```
- Remove the Search icon from inside the input (label provides context)
- Update placeholder from "Filter by Location ID" to "Search Location ID..."
- Remove `pl-9 pr-8` padding classes from Input since icon is removed, keep `min-w-[160px] h-9 text-sm`

### 3. Wrap Item ID Filter in Visual Group (Lines 788-811)
- Apply same pattern as Location ID filter:
  ```tsx
  <div className="flex items-center gap-2 p-2 border border-border/40 rounded-md bg-muted/5">
    <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">Item</span>
    <div className="relative">
      <Input
        placeholder="Search Item ID..."
        value={itemIdFilter}
        onChange={handleItemIdChange}
        className="min-w-[160px] h-9 text-sm"
      />
      {itemIdFilter && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setItemIdFilter("")
            setPage(1)
          }}
          className="absolute right-0 top-1/2 -translate-y-1/2 h-7 w-7 p-0 hover:bg-transparent"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Clear item filter</span>
        </Button>
      )}
    </div>
  </div>
  ```
- Remove Search icon from input
- Update placeholder from "Filter by Item ID" to "Search Item ID..."
- Remove `pl-9 pr-8` padding classes from Input

### 4. Add Vertical Divider After Item Group
- Insert vertical divider between Item group and Date Range filter:
  ```tsx
  {/* Vertical Divider */}
  <div className="hidden sm:block h-8 w-px bg-border" />
  ```

### 5. Update Upload History Filter Container (Line 978)
- Change outer filter container classes to match stock config section: `flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between overflow-x-auto`
- Add inner wrapper `<div className="flex flex-nowrap gap-3 items-center">` around search input, date range, and status tabs

### 6. Wrap Upload History Search in Visual Group (Lines 980-998)
- Replace standalone search input with grouped container:
  ```tsx
  <div className="flex items-center gap-2 p-2 border border-border/40 rounded-md bg-muted/5">
    <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">File</span>
    <div className="relative">
      <Input
        placeholder="Search files..."
        value={uploadHistorySearch}
        onChange={(e) => setUploadHistorySearch(e.target.value)}
        className="w-[180px] h-9 text-sm"
      />
      {uploadHistorySearch && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setUploadHistorySearch("")}
          className="absolute right-0 top-1/2 -translate-y-1/2 h-7 w-7 p-0 hover:bg-transparent"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Clear search</span>
        </Button>
      )}
    </div>
  </div>
  ```
- Remove Search icon from input
- Remove `pl-9 pr-8` padding classes from Input

### 7. Validate Build
- Run `pnpm build` to ensure no TypeScript errors
- Verify the changes compile correctly

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm build` - Ensure TypeScript compilation succeeds with no errors
- `pnpm lint` - Check for any linting issues introduced
- Visual inspection of `/stock-config` page to confirm filter grouping matches Inventory Availability pattern

## Notes
- The Search icon imports remain in the file as they may be used elsewhere; only removed from grouped inputs
- The grouped container pattern (`flex items-center gap-2 p-2 border border-border/40 rounded-md bg-muted/5`) is the standard across the application
- The label styling (`text-xs font-medium text-muted-foreground whitespace-nowrap`) ensures consistent label appearance
- The `overflow-x-auto` on the outer container enables horizontal scrolling on narrow viewports while `flex-nowrap` on the inner container prevents filter groups from stacking vertically
- The `hidden sm:block` on the vertical divider hides it on mobile where the layout stacks
