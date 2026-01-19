# Chore: Optimize Order Management Table Column Widths

## Metadata
adw_id: `c16dcea0`
prompt: `Optimize Order Management table column widths at src/components/order-management-hub.tsx:
1. Give Order Number column more width to display full order numbers without truncation
2. Reduce width of boolean columns (On Hold, Confirmed, Allow Substitution) - they only show Yes/No
3. Make Order Status and Payment Status columns fixed width to prevent layout shifts
4. Ensure Created Date column has enough width for full date/time display
5. Consider making the table horizontally scrollable on smaller screens`

## Chore Description
Optimize the column widths in the Order Management Hub table to improve readability and prevent layout issues. The current implementation uses `min-w-[Xpx]` classes that don't properly account for content width requirements:

- **Order Number column** (currently `min-w-[140px]`): Order numbers like `W1156251121946800` are 18+ characters and get truncated
- **Boolean columns** (On Hold, Confirmed, Allow Substitution): Currently 80-140px but only display "Yes"/"No" (3 characters)
- **Status columns** (Order Status, Payment Status): Variable badge widths cause layout shifts
- **Created Date column** (currently `min-w-[150px]`): Full datetime like "12 Jan 2025, 14:00" may truncate

The table already has `overflow-x-auto` wrapper at line 1656, but needs improved column sizing for better responsive behavior.

## Relevant Files
Use these files to complete the chore:

- **src/components/order-management-hub.tsx** (lines 1654-1790): Main file containing the `renderOrderTable()` function with TableHead definitions (lines 1660-1714) and TableCell content (lines 1728-1782). Column widths are set via Tailwind `min-w-[Xpx]` classes.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Update Order Number Column Width
- Change line 1660 from `min-w-[140px]` to `min-w-[180px] w-[180px]` to ensure full order numbers display
- The fixed width prevents column from shrinking below readable size

### 2. Reduce Boolean Column Widths
- **On Hold** (line 1675): Change from `min-w-[80px]` to `min-w-[60px] w-[60px] text-center`
- **Confirmed** (line 1679): Change from `min-w-[100px]` to `min-w-[70px] w-[70px] text-center`
- **Allow Substitution** (line 1708-1709): Change from `min-w-[140px]` to `min-w-[90px] w-[90px] text-center` and update label to "Allow Sub." for space efficiency

### 3. Set Fixed Width for Status Columns
- **Order Status** (line 1666): Change from `min-w-[120px]` to `min-w-[120px] w-[120px]` to prevent layout shifts
- **Payment Status** (line 1676): Change from `min-w-[120px]` to `min-w-[120px] w-[120px]` to prevent layout shifts

### 4. Update Created Date Column Width
- Change line 1711 from `min-w-[150px]` to `min-w-[170px] w-[170px]` to accommodate full datetime format

### 5. Update Corresponding TableCell Alignments
- Add `text-center` class to boolean column TableCells:
  - On Hold cell (line 1751-1753)
  - Confirmed cell (line 1757)
  - Allow Substitution cell (line 1780)

### 6. Enhance Responsive Scrolling
- Update the table wrapper div at line 1656 to include better responsive hints:
  - Add `min-w-full` to the Table element to ensure proper horizontal scroll behavior
  - Consider adding `whitespace-nowrap` to key columns to prevent awkward text wrapping

### 7. Validate Changes
- Run build to ensure no TypeScript/linting errors
- Verify table renders correctly with the updated column widths

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm build` - Ensure the project builds without errors
- `pnpm lint` - Check for linting issues
- `pnpm dev` - Start dev server and visually verify table layout at http://localhost:3000/orders (or wherever Order Management is accessible)

## Notes
- The table currently has 11 active columns (with FMS columns commented out)
- Current column order: Order Number, Order Total, Order Status, SLA Status, Return Status, On Hold, Payment Status, Confirmed, Channel, Allow Substitution, Created Date
- The `overflow-x-auto` wrapper already exists, so horizontal scrolling is enabled - this chore improves the column sizing within that scrollable area
- Using both `min-w-[X]` and `w-[X]` creates a fixed width that won't shrink or grow, which is appropriate for columns with predictable content length
- The abbreviated "Allow Sub." label is acceptable for table headers to save space while remaining understandable
