# Chore: Remove View Details Functionality from Upload History

## Metadata
adw_id: `38aa99e4`
prompt: `Remove View Details functionality from Upload History section on Stock Configuration page (app/stock-config/page.tsx) since it duplicates data already visible in table. Requirements: 1) Remove the 'View details' button from each row in Upload History table - keep only the 'Download file' button 2) Remove the File Detail Modal dialog component entirely including its state (selectedFile, isFileDetailOpen) 3) Remove the handleViewFileDetails function 4) Remove the canViewReport and related modal handling code 5) Keep only the download functionality - 'Download file' button in table rows should remain 6) Clean up any unused imports related to the modal (Dialog, DialogContent, DialogHeader, DialogTitle, etc. if no longer needed) 7) The Status column should now show: [Status Badge] [Download file] only`

## Chore Description
This chore removes the "View Details" functionality from the Upload History section on the Stock Configuration page, as it duplicates information already visible in the table. The change simplifies the UI by keeping only the download functionality and removing the File Detail Modal component entirely.

The current implementation shows both "View details" and "Download file" buttons in the Status column of the Upload History table, and clicking "View details" opens a modal with file metadata. Since this information is already visible in the table, the modal is redundant and should be removed.

## Relevant Files
Use these files to complete the chore:

- **app/stock-config/page.tsx** (Main page component)
  - Remove FileDetailModal import (line 39)
  - Remove selectedFile state (line 97)
  - Remove isFileDetailOpen state (line 98)
  - Remove handleViewFileDetails function (lines 466-469)
  - Remove FileDetailModal component usage (lines 1055-1060)
  - Update UploadHistoryTable props to remove onViewDetails handler (line 1009)
  - Clean up any unused Dialog-related imports

- **src/components/stock-config/upload-history-table.tsx** (Upload history table component)
  - Remove Eye icon import (line 23)
  - Remove onViewDetails prop from interface (line 31)
  - Remove onViewDetails default value (line 38)
  - Remove "View details" button from Status column (lines 269-280)
  - Remove onClick handler from table row that triggers onViewDetails (line 198)
  - Update table row to be non-clickable (remove cursor-pointer class and hover state from line 197)

### New Files
No new files will be created for this chore.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Update Upload History Table Component
- Remove the `Eye` icon import from lucide-react
- Remove the `onViewDetails` prop from the `UploadHistoryTableProps` interface
- Remove the default value for `onViewDetails` in the component parameters
- Remove the "View details" button from the Status column (keep only Download button and status badge)
- Remove the `onClick` handler from the `<TableRow>` component that calls `onViewDetails`
- Remove the `cursor-pointer` and `hover:bg-muted/50` classes from the `<TableRow>` component since rows are no longer clickable

### 2. Update Stock Config Page Component
- Remove the `FileDetailModal` import from the imports section
- Remove the `selectedFile` state variable
- Remove the `isFileDetailOpen` state variable
- Remove the `handleViewFileDetails` function
- Remove the `<FileDetailModal>` component from the JSX (near line 1055-1060)
- Remove the `onViewDetails` prop from the `<UploadHistoryTable>` component call
- Clean up any unused imports (Dialog-related imports that were only used by FileDetailModal)

### 3. Verify No Broken References
- Search for any remaining references to `handleViewFileDetails`, `selectedFile`, or `isFileDetailOpen`
- Ensure no TypeScript errors are present
- Verify that the file-detail-modal.tsx file is no longer imported or used anywhere else in the codebase

## Validation Commands
Execute these commands to validate the chore is complete:

- `grep -r "handleViewFileDetails" app/stock-config/` - Should return no results
- `grep -r "isFileDetailOpen" app/stock-config/` - Should return no results
- `grep -r "selectedFile" app/stock-config/` - Should return no results (except in unrelated contexts)
- `grep -r "FileDetailModal" app/stock-config/` - Should return no results
- `grep -r "onViewDetails" src/components/stock-config/upload-history-table.tsx` - Should return no results
- `npm run build` - Should complete successfully with no TypeScript errors
- `npm run lint` - Should pass with no errors related to the modified files

## Notes
- The File Detail Modal component itself (src/components/stock-config/file-detail-modal.tsx) is NOT being deleted - it may be used elsewhere or kept for future reference. We are only removing its usage from the Stock Configuration page.
- The download functionality must remain fully intact - the Download button in the Status column should continue to work exactly as before.
- After this change, the Status column will display: [Status Badge] [Download Button] only.
- The table rows in Upload History will no longer be clickable since the click action was tied to viewing details.
