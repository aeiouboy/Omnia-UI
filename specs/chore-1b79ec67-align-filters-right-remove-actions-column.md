# Chore: Align Filters Right and Remove Actions Column

## Metadata
adw_id: `1b79ec67`
prompt: `Update All Stock Configurations section on Stock Configuration page (app/stock-config/page.tsx) with two changes: 1) Move filter controls to right side - update the filter row container to use 'flex items-center gap-3 justify-end' so filters align to the right side of the container, keep same filter order: [Search input] [Date Range (From/To)] [Frequency dropdown] [Supply Type tabs] 2) Remove Actions column entirely from the table - remove the Actions columnheader from TableHeader, remove the Actions cell with DropdownMenu (View Details and Delete buttons) from each TableRow in TableBody, this removes the last column from the table completely. The table should now end with End Date column as the last visible column.`

## Chore Description
This chore involves making two UI updates to the Stock Configuration page:

1. **Right-align filter controls**: Update the filter row container in the "All Stock Configurations" section to align all filters to the right side of the container while maintaining the current filter order (Search input, Date Range, Frequency dropdown, Supply Type tabs).

2. **Remove Actions column**: Completely remove the Actions column from the StockConfigTable component, including:
   - The Actions table header in the TableHeader
   - The Actions table cell with dropdown menu (containing "View Details" and "Delete" options) from each TableRow
   - After removal, the "End Date" column will be the last visible column

## Relevant Files

### Files to Modify
- **app/stock-config/page.tsx** (lines 645-760)
  - Contains the filter row container that needs layout update (line 647)
  - The container currently uses `flex flex-col sm:flex-row items-start sm:items-center gap-3`
  - Need to add `justify-end` to align filters to the right

- **src/components/stock-config/stock-config-table.tsx** (lines 1-261)
  - Contains the StockConfigTable component with Actions column
  - TableHeader has Actions header at line 202 (empty header with `w-12` class)
  - TableBody has Actions cell at lines 231-254 (DropdownMenu with MoreHorizontal icon)
  - Loading skeleton also has Actions column at line 121 and 135
  - Need to remove all Actions-related code

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Update Filter Row Layout in Stock Config Page
- Open `app/stock-config/page.tsx`
- Locate the filter row container at line 647: `<div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">`
- Update the className to: `<div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 justify-end">`
- Verify that all filters remain in the same order after this change

### 2. Remove Actions Column from TableHeader
- Open `src/components/stock-config/stock-config-table.tsx`
- In the TableHeader section (around lines 160-203), remove the Actions header:
  ```tsx
  <TableHead className="w-12"></TableHead>
  ```
- Verify that "End Date" is now the last TableHead

### 3. Remove Actions Column from TableBody
- In the same file, within the TableBody section (around lines 205-256)
- Remove the entire Actions TableCell block (lines 231-254):
  ```tsx
  <TableCell>
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Actions</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onView?.(item)}>
          <Eye className="h-4 w-4 mr-2" />
          View Details
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onDelete?.(item)}
          className="text-red-600"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </TableCell>
  ```
- Verify that "End Date" is now the last TableCell in each row

### 4. Remove Actions Column from Loading Skeleton
- In the loading state section (around lines 107-142)
- Remove the Actions header from loading skeleton at line 121: `<TableHead className="w-12"></TableHead>`
- Remove the Actions cell from loading skeleton at line 135: `<TableCell><Skeleton className="h-8 w-8" /></TableCell>`
- Ensure the loading skeleton structure matches the updated table structure

### 5. Remove Unused Imports
- At the top of `stock-config-table.tsx`, check if the following imports are still used elsewhere:
  - `DropdownMenu`, `DropdownMenuContent`, `DropdownMenuItem`, `DropdownMenuTrigger` (lines 16-20)
  - `MoreHorizontal`, `Eye`, `Trash2` icons (lines 25-27)
- If these imports are only used for the Actions column, remove them from the import statements

### 6. Validation and Testing
- Run the development server: `pnpm dev`
- Navigate to the Stock Configuration page at `/stock-config`
- Verify filter controls are aligned to the right side of the container
- Verify filters maintain the correct order: Search, Date Range, Frequency, Supply Type tabs
- Verify the table no longer shows the Actions column
- Verify "End Date" is the last visible column in the table
- Test table with loading state to ensure skeleton is correct
- Test table with empty state to ensure no layout issues
- Test table with data to ensure all columns display properly

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm dev` - Start the development server and verify the UI changes
- Navigate to http://localhost:3000/stock-config in browser
- Check browser console for any errors or warnings
- Verify responsive behavior on mobile (filters should stack vertically, still aligned right on desktop)
- `pnpm build` - Ensure production build completes without errors
- `pnpm lint` - Verify no ESLint errors were introduced

## Notes

- The `onView` and `onDelete` props in StockConfigTable will become unused after removing the Actions column. These can be left in the component interface for backward compatibility or future use, or removed if desired.
- The handlers `handleViewConfig` and `handleDeleteConfig` in the page component will also become unused but can be left for future implementation.
- The filter alignment change uses `justify-end` which works with flexbox to push all items to the right while maintaining their internal order.
- On mobile (when flexbox switches to column), the `justify-end` will align items to the bottom of the container, which is acceptable behavior.
