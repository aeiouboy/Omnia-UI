# Chore: Simplify Upload History Table

## Metadata
adw_id: `d9c3e7b9`
prompt: `Simplify Upload History table in Stock Configuration page by removing unnecessary columns. Update src/components/stock-config/upload-history-table.tsx to: 1) Remove 'Actions' column header and TableCell - also remove canViewReport, canRetry helper functions 2) Remove 'Uploaded By' column header and TableCell 3) Remove 'Records' column header and TableCell 4) Update UploadHistoryTableProps interface to remove onViewReport and onRetry props 5) Update responsive classes since fewer columns now - remove hidden md:table-cell classes that are no longer needed 6) Keep only 3 columns: File Name (with folder icon), Upload Date (date + time), Status (badge) 7) Update app/stock-config/page.tsx to remove onViewReport and onRetry props from UploadHistoryTable component`

## Chore Description
The Upload History table in the Stock Configuration page currently displays too many columns (6 columns total), making it cluttered and difficult to scan. This chore simplifies the table by reducing it to only 3 essential columns: File Name (with folder icon), Upload Date (date + time), and Status (badge). This will involve:

1. Removing unnecessary columns: Actions, Uploaded By, and Records
2. Removing associated helper functions that are no longer needed (canViewReport, canRetry)
3. Updating the component's TypeScript interface to remove unused props
4. Cleaning up responsive CSS classes that are no longer necessary
5. Updating the parent component to match the simplified interface
6. Removing unused icon imports that were only used for removed columns

The simplified table will be cleaner, easier to read, and maintain the same mobile-responsive behavior with fewer columns.

## Relevant Files
Use these files to complete the chore:

- **src/components/stock-config/upload-history-table.tsx** - Main component file that needs simplification
  - Remove 'Actions', 'Uploaded By', and 'Records' columns from TableHeader and TableBody
  - Remove `canViewReport` and `canRetry` helper functions
  - Update `UploadHistoryTableProps` interface to remove `onViewReport` and `onRetry` props
  - Remove unused icon imports: `Eye`, `RotateCcw`, `User`
  - Update responsive classes since fewer columns exist
  - Simplify loading skeleton to match 3-column structure

- **app/stock-config/page.tsx** - Parent component that uses UploadHistoryTable
  - Remove `onViewReport` prop from UploadHistoryTable component (line 560)
  - Remove `onRetry` prop from UploadHistoryTable component (lines 561-567)
  - Keep `handleViewFileReport` function as it's still used elsewhere in the component

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Update UploadHistoryTableProps Interface
- Open `src/components/stock-config/upload-history-table.tsx`
- Locate the `UploadHistoryTableProps` interface (lines 28-33)
- Remove the `onViewReport: (file: StockConfigFile) => void` prop
- Remove the `onRetry: (file: StockConfigFile) => void` prop
- Keep only `fileHistory` and `loading` props

### 2. Remove Unused Helper Functions
- Locate and delete the `canViewReport` function (lines 126-133)
- Locate and delete the `canRetry` function (lines 135-142)
- These functions are no longer needed without the Actions column

### 3. Remove Unused Icon Imports
- Locate the icon imports at the top of the file (lines 14-25)
- Remove `Eye` import (used for view report button)
- Remove `RotateCcw` import (used for retry button)
- Remove `User` import (used for Uploaded By column)
- Keep all other icons as they're still used

### 4. Update Loading Skeleton Table Headers
- Locate the loading skeleton TableHeader section (lines 149-157)
- Remove the "Uploaded By" TableHead (line 153)
- Remove the "Records" TableHead (lines 154)
- Remove the "Actions" TableHead (line 156)
- Keep only: File Name, Upload Date, Status

### 5. Update Loading Skeleton Table Cells
- Locate the loading skeleton TableBody section (lines 160-181)
- Remove the "Uploaded By" TableCell skeleton (lines 168-170)
- Remove the "Records" TableCell skeleton (lines 171-173)
- Remove the "Actions" TableCell skeleton (lines 177-179)
- Update responsive classes: remove `hidden md:table-cell` from Upload Date since it should always show

### 6. Update Main Table Headers
- Locate the main TableHeader section (lines 206-214)
- Remove the "Uploaded By" TableHead (line 210)
- Remove the "Records" TableHead (line 211)
- Remove the "Actions" TableHead (line 213)
- Remove `className="hidden md:table-cell"` from Upload Date TableHead since only 3 columns now

### 7. Update Main Table Body Cells
- Locate the TableBody section (lines 217-313)
- Remove the entire "Uploaded By" TableCell block (lines 244-254)
- Remove the entire "Records" TableCell block (lines 256-283)
- Remove the entire "Actions" TableCell block (lines 288-312)
- Remove `className="hidden md:table-cell"` from Upload Date TableCell (line 228)
- Keep File Name, Upload Date, and Status columns intact

### 8. Update Parent Component Props
- Open `app/stock-config/page.tsx`
- Locate the UploadHistoryTable component usage (lines 558-568)
- Remove the `onViewReport={handleViewFileReport}` prop (line 560)
- Remove the entire `onRetry` prop block (lines 561-567)
- The component should now only have `fileHistory` prop

### 9. Validate Component Structure
- Verify the table now has exactly 3 columns in all places:
  - Loading skeleton headers
  - Loading skeleton cells
  - Main table headers
  - Main table body cells
- Verify all removed columns and their associated code are completely removed
- Verify no responsive `hidden md:table-cell` classes remain on the 3 columns
- Verify the component compiles without TypeScript errors

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm run lint` - Ensure no linting errors
- `pnpm run build` - Verify TypeScript compilation succeeds
- `grep -n "onViewReport\|onRetry" src/components/stock-config/upload-history-table.tsx` - Should return no matches
- `grep -n "canViewReport\|canRetry" src/components/stock-config/upload-history-table.tsx` - Should return no matches
- `grep -n "Eye\|RotateCcw\|User" src/components/stock-config/upload-history-table.tsx` - Should only return matches in lucide-react import comments, not in code
- `grep -n "Uploaded By\|Records\|Actions" src/components/stock-config/upload-history-table.tsx` - Should return no matches in TableHead or comments
- `grep -c "TableHead" src/components/stock-config/upload-history-table.tsx` - Should return 6 (3 in loading skeleton, 3 in main table)
- Manual test: Navigate to Stock Configuration page and verify Upload History table displays only 3 columns

## Notes
- The `handleViewFileReport` function in the parent component should be kept as it may be used elsewhere
- The simplified 3-column layout will be cleaner and easier to scan on all screen sizes
- All 3 columns should be visible on all screen sizes (no more responsive hiding)
- The component should maintain the same empty state and loading state behavior
