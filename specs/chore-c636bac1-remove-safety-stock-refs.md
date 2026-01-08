# Chore: Remove Safety Stock References from Stock Config UI

## Metadata
adw_id: `c636bac1`
prompt: `Fix remaining Safety Stock references in Stock Config UI after schema alignment.`

## Chore Description
After the schema alignment work, some leftover "Safety Stock" references remain in the Stock Config UI that need to be cleaned up. This is a UI text cleanup task only - no data or business logic changes.

Specifically:
1. The page subtitle in `app/stock-config/page.tsx` still mentions "Safety Stock" as a configuration type
2. The loading skeleton in `src/components/stock-config/stock-config-table.tsx` has a "Safety Stock" column header that doesn't exist in the main table
3. The loading skeleton shows 8 skeleton cells per row while the main table only has 7 columns

## Relevant Files
Use these files to complete the chore:

- **app/stock-config/page.tsx** (line 580-582) - Contains the page subtitle with outdated "Safety Stock" reference in the text "Manage PreOrder, Override OnHand, and Safety Stock configurations"
- **src/components/stock-config/stock-config-table.tsx** (lines 96-130) - Contains the loading skeleton with:
  - Line 108: "Safety Stock" column header that should be removed
  - Lines 114-124: 8 skeleton cells per row instead of the 7 columns in the main table

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Update Page Subtitle
- Open `app/stock-config/page.tsx`
- Navigate to line 580-582 where the page subtitle is defined
- Change the text from `Manage PreOrder, Override OnHand, and Safety Stock configurations` to `Manage PreOrder and Override OnHand configurations`

### 2. Remove Safety Stock Column from Loading Skeleton Header
- Open `src/components/stock-config/stock-config-table.tsx`
- Navigate to lines 101-111 (loading skeleton table header)
- Remove line 108: `<TableHead className="text-right">Safety Stock</TableHead>`
- This will reduce the header columns from 8 to 7, matching the main table

### 3. Reduce Skeleton Row Cells from 8 to 7
- In the same file, navigate to lines 114-124 (skeleton rows)
- Remove one `<TableCell><Skeleton className="h-4 w-..." /></TableCell>` line
- Specifically, remove line 121 which corresponds to the Safety Stock cell: `<TableCell><Skeleton className="h-4 w-16" /></TableCell>`
- This ensures the loading skeleton matches the 7 columns: Location ID, Item ID, Quantity, Supply Type, Frequency, Start Date, End Date

### 4. Verify Main Table Column Structure
- Confirm the main table (lines 147-209) has exactly 7 columns:
  1. Location ID
  2. Item ID
  3. Quantity
  4. Supply Type
  5. Frequency
  6. Start Date
  7. End Date
- Verify the loading skeleton now matches this structure

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm build` - Ensure the build completes without errors
- `grep -n "Safety Stock" app/stock-config/page.tsx` - Should return no results
- `grep -n "Safety Stock" src/components/stock-config/stock-config-table.tsx` - Should return no results
- `grep -c "TableHead" src/components/stock-config/stock-config-table.tsx` - Verify loading skeleton header count decreased

## Notes
- This is a cleanup task only - do not change any data structures, types, or business logic
- The main table already has the correct 7-column structure; only the loading skeleton and page subtitle need updates
- The changes align the UI text with the updated schema that removed Safety Stock as a separate field
