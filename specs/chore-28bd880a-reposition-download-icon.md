# Chore: Reposition Download Icon in Upload History Table

## Metadata
adw_id: `28bd880a`
prompt: `Reposition download icon in Upload History table (app/stock-config/page.tsx) to align in a straight vertical line. Requirements: 1) Move download icon button to a dedicated Actions column on the far right 2) Keep Status column with only the status badge (Pending/Error/Processed) 3) Add 'Actions' column header after Status column 4) Center-align the download icon in the Actions column 5) Use consistent column width for Actions column (w-20 or similar) to ensure vertical alignment 6) Match the table structure pattern from StockConfigTable component`

## Chore Description
Currently, the Upload History table has a download icon button positioned inside the Status column alongside the status badge. This causes misalignment and inconsistent visual layout. The task is to restructure the table by creating a dedicated Actions column on the far right, moving the download icon button to this new column, and ensuring it aligns vertically in a straight line for all rows.

The solution should:
- Create a new "Actions" column header as the rightmost column
- Move the download icon button from the Status column to the Actions column
- Keep only the status badge in the Status column
- Center-align the download icon within the Actions column
- Use a consistent column width (w-20 or similar) for proper vertical alignment
- Follow the same table structure pattern used in StockConfigTable component

## Relevant Files
Use these files to complete the chore:

- **`src/components/stock-config/upload-history-table.tsx`** - Main file to modify. Contains the UploadHistoryTable component with the current table structure where the download button is in the Status column (lines 247-265).

- **`src/components/stock-config/stock-config-table.tsx`** - Reference file. Shows the proper table structure pattern with clean column organization (no actions column, but demonstrates clean table structure).

- **`app/stock-config/page.tsx`** - Parent component that uses UploadHistoryTable. May need verification to ensure the changes work correctly with the onDownload handler.

### New Files
None - only modifying existing files.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Analyze Current Table Structure
- Review `src/components/stock-config/upload-history-table.tsx` to understand current layout
- Identify the Status column TableHead and TableCell elements
- Locate the download button implementation (currently inside Status column)
- Review `src/components/stock-config/stock-config-table.tsx` for table structure pattern reference

### 2. Modify Table Header - Add Actions Column
- Locate the TableHeader section in `upload-history-table.tsx` (lines 181-188)
- Add a new TableHead element after the Status column header
- Set the column header text to "Actions"
- Apply center-alignment class (`text-center`)
- Apply consistent width class (`w-20` or `w-24` for proper vertical alignment)

### 3. Modify Status Column - Remove Download Button
- Locate the Status TableCell (lines 247-265)
- Remove the download button from the Status column
- Keep only the `getFileStatusBadge(file)` badge element
- Simplify the TableCell to only render the status badge without the flex container with gap-2

### 4. Create Actions Column - Add Download Button
- Add a new TableCell after the Status column
- Apply center-alignment class (`text-center`)
- Move the download button code from Status column to this new TableCell
- Ensure the button is centered within the column
- Maintain the same button styling and functionality (variant="ghost", size="sm", onClick handler)
- Keep the Download icon and sr-only span for accessibility

### 5. Update Loading Skeleton
- Locate the loading skeleton section (lines 124-160)
- Add a new TableHead for Actions column in the skeleton header
- Add a new TableCell with Skeleton component in each skeleton row
- Match the styling and alignment of the actual Actions column

### 6. Verify Table Structure Consistency
- Ensure all TableRow elements have the same number of TableCell elements
- Verify the Actions column appears in both regular and loading states
- Check that the download button maintains its functionality
- Confirm center alignment of download icons creates a straight vertical line

## Validation Commands
Execute these commands to validate the chore is complete:

- `npm run dev` - Start development server and verify the table displays correctly
- Visual inspection: Navigate to `/stock-config` page and verify:
  - Upload History table has a new "Actions" column on the far right
  - Status column only shows the status badge (no download button)
  - Download icons are center-aligned in a straight vertical line
  - Actions column has consistent width across all rows
  - Loading skeleton includes the Actions column
- Test functionality: Click download button to ensure it still works correctly
- `npm run build` - Ensure no TypeScript errors occur during build
- Responsive check: Verify table layout works on different screen sizes

## Notes
- The download button should maintain its current functionality - only styling and positioning changes
- Ensure accessibility is maintained with the sr-only span for screen readers
- The Actions column width should be narrow but sufficient to contain the download icon button without wrapping
- Follow the same styling patterns used in StockConfigTable for consistency
- The download button's onClick handler and conditional rendering logic (only show if onDownload is provided) should remain unchanged
