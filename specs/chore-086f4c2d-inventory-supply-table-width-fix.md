# Chore: Fix Inventory Supply Page Table Width Layout Issue

## Metadata
adw_id: `086f4c2d`
prompt: `Fix Inventory Supply page table width layout issue in app/inventory-new/supply/page.tsx. The table has excessive white space on the right because columns use fixed widths. Changes needed: 1) Remove the empty spacer TableHead column at line 422 and its corresponding empty TableCell at line 473. 2) Change Item ID TableHead className from 'w-[350px]' to 'min-w-[200px]' (line 386) so it can expand to fill available space. 3) Add 'w-full' class to the Table component at line 373. 4) Update the colSpan in the empty state TableRow from 6 to 5 since we're removing the spacer column (line 428). These changes will make the table utilize the full container width with Item ID column expanding to fill available space.`

## Chore Description
The Inventory Supply page table currently displays excessive white space on the right side due to fixed column widths and an unnecessary spacer column. This creates poor UX and wastes screen real estate. The fix involves:
- Removing the empty spacer column from both the table header and data rows
- Converting the Item ID column from fixed width to flexible minimum width
- Adding full-width styling to the table component
- Updating the empty state colspan to match the reduced column count

These changes will make the table responsive and utilize the full available container width, with the Item ID column expanding dynamically to fill available space.

## Relevant Files
- **app/inventory-new/supply/page.tsx** - Main file requiring fixes for table width layout issue

## Step by Step Tasks

### 1. Remove Spacer Column from Table Header
- Navigate to line 422 in `app/inventory-new/supply/page.tsx`
- Remove the empty spacer `<TableHead></TableHead>` column
- This removes unnecessary column that serves no purpose and creates extra whitespace

### 2. Remove Spacer Column from Table Data Rows
- Navigate to line 473 in `app/inventory-new/supply/page.tsx`
- Remove the empty spacer `<TableCell></TableCell>` inside the data row mapping
- This ensures data rows match the header structure after removing the spacer column

### 3. Update Item ID Column Width to be Flexible
- Navigate to line 386 in `app/inventory-new/supply/page.tsx`
- Change the `className` of the Item ID `TableHead` from `'w-[350px] cursor-pointer hover:bg-muted/50'` to `'min-w-[200px] cursor-pointer hover:bg-muted/50'`
- This allows the Item ID column to expand beyond 200px minimum width and fill available horizontal space

### 4. Add Full-Width Class to Table Component
- Navigate to line 373 in `app/inventory-new/supply/page.tsx`
- Add `'w-full'` class to the `<Table>` component
- Change from `<Table>` to `<Table className="w-full">`
- This ensures the table takes up the full container width

### 5. Update Empty State ColSpan
- Navigate to line 428 in `app/inventory-new/supply/page.tsx`
- Update the `colSpan` attribute from `6` to `5` in the empty state `<TableCell>`
- This accounts for removing the spacer column (reducing total columns from 6 to 5)

### 6. Validate the Changes
- Start the development server with `npm run dev`
- Navigate to the Inventory Supply page at `/inventory-new/supply`
- Verify the table now uses full container width with no excessive right-side whitespace
- Confirm Item ID column expands to fill available space
- Check that all columns display correctly and empty state message centers properly
- Test with browser at different viewport widths to ensure responsive behavior

## Validation Commands
Execute these commands to validate the chore is complete:

- `npm run dev` - Start development server and verify table layout displays correctly at http://localhost:3000/inventory-new/supply
- `npm run build` - Build the project to ensure no TypeScript or build errors

## Notes
- The spacer column appears to have been added to control layout but is unnecessary with proper Tailwind CSS utilities
- Using `min-w-[200px]` instead of `w-[350px]` makes the table more responsive to different screen sizes
- The `w-full` class on the Table component is standard practice for full-width tables in Tailwind
- These changes maintain the existing hover effects, sorting functionality, and responsive behavior
