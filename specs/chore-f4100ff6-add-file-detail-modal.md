# Chore: Add File Detail View to Upload History

## Metadata
adw_id: `f4100ff6`
prompt: `Add file detail view functionality to Upload History section on Stock Configuration page (app/stock-config/page.tsx). Requirements: 1) Make each row in the Upload History table clickable to open a file detail modal/dialog 2) Create a FileDetailModal component or use existing Dialog/Sheet component from shadcn/ui 3) When clicking a row, show file details including: filename, upload date, uploaded by, total records, valid/invalid record counts, processing status, and if available show processing results/errors 4) Add a subtle hover effect on table rows to indicate they are clickable (cursor-pointer, hover:bg-muted/50) 5) Include a close button in the modal header 6) If the file has errors (invalidRecords > 0 or status is Error), show an error summary section with details 7) Add an eye icon button in the Status column as an alternative way to view details 8) Store selected file in state: selectedFile (StockConfigFile | null) and control modal visibility with isFileDetailOpen (boolean)`

## Chore Description
Add interactive file detail modal functionality to the Upload History section on the Stock Configuration page. This enhancement will allow users to click on any row in the Upload History table to view comprehensive details about the uploaded file, including metadata, processing status, record counts, and error details if applicable. The implementation will use the existing shadcn/ui Dialog component for consistency and include both row-click and icon-button interactions.

## Relevant Files
Use these files to complete the chore:

- `app/stock-config/page.tsx` - Main page component containing the Upload History section. Need to add state management for modal visibility and selected file, plus add click handlers to open the modal.

- `src/components/stock-config/upload-history-table.tsx` - Upload History table component. Need to add hover effects to rows, make rows clickable, and add Eye icon button in Status column.

- `src/components/ui/dialog.tsx` - Existing shadcn/ui Dialog component primitives that will be used to build the FileDetailModal.

- `src/types/stock-config.ts` - Type definitions for StockConfigFile interface. Contains all the data structure needed for the modal display.

### New Files

- `src/components/stock-config/file-detail-modal.tsx` - New modal component to display file details. Will use Dialog primitives from shadcn/ui and show comprehensive file information including error summaries.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Create FileDetailModal Component
- Create new file `src/components/stock-config/file-detail-modal.tsx`
- Import Dialog primitives from `@/components/ui/dialog`
- Import necessary icons from `lucide-react` (FileSpreadsheet, Calendar, User, CheckCircle, AlertCircle, Clock, X, Eye)
- Import Badge component from `@/components/ui/badge`
- Import StockConfigFile type from `@/types/stock-config`
- Define component props interface: `open: boolean`, `onOpenChange: (open: boolean) => void`, `file: StockConfigFile | null`
- Create modal structure with DialogContent (max-w-3xl for wider layout)
- Add DialogHeader with DialogTitle showing filename and close button (X icon)
- Create file metadata section displaying: filename, upload date, uploaded by, total records, valid/invalid counts
- Add processing status badge similar to the one in UploadHistoryTable
- Conditionally render error summary section if `file.invalidRecords > 0` or `file.processingStatus === 'error'` or `file.processingStatus === 'partial'`
- In error summary section, display error count, error message if available, and list of processing results with errors
- Style with proper spacing, borders, and responsive layout
- Handle null file case gracefully (early return if file is null)

### 2. Update Stock Config Page State Management
- Open `app/stock-config/page.tsx`
- Add import for FileDetailModal component
- Add new state variables after line 92: `selectedFile: StockConfigFile | null` initialized to null
- Add new state variable: `isFileDetailOpen: boolean` initialized to false
- Create handler function `handleViewFileDetails` that accepts a `StockConfigFile` parameter, sets selectedFile, and opens modal (setIsFileDetailOpen(true))
- Pass `onViewDetails` handler to UploadHistoryTable component as a prop

### 3. Update UploadHistoryTable Component
- Open `src/components/stock-config/upload-history-table.tsx`
- Add Eye icon import from `lucide-react`
- Add Button component import from `@/components/ui/button`
- Update UploadHistoryTableProps interface to include `onViewDetails?: (file: StockConfigFile) => void`
- Extract onViewDetails from props with default empty function
- Update TableRow (line 188) className to include `cursor-pointer hover:bg-muted/50`
- Add onClick handler to TableRow that calls `onViewDetails(file)`
- In Status TableCell (around line 241), wrap the status badge in a flex container
- Add Eye icon button next to the status badge with variant="ghost", size="sm"
- Eye icon button onClick should call `onViewDetails(file)` and stop propagation (e.stopPropagation())
- Add sr-only text "View details" for accessibility

### 4. Wire Up FileDetailModal in Stock Config Page
- In `app/stock-config/page.tsx`, find the Modals section (around line 967)
- Add FileDetailModal component after PostProcessingReport modal
- Pass props: `open={isFileDetailOpen}`, `onOpenChange={setIsFileDetailOpen}`, `file={selectedFile}`
- Ensure the modal can be closed by clicking outside or pressing Escape (handled by Dialog primitive)

### 5. Test Modal Functionality
- Verify clicking on a table row opens the modal with correct file details
- Verify clicking the Eye icon button opens the modal
- Verify modal displays all file metadata correctly
- Verify error summary section appears when file has errors
- Verify modal can be closed via X button, clicking outside, or pressing Escape
- Verify hover effect is visible on table rows
- Test responsive layout on mobile, tablet, and desktop viewports

### 6. Validate Code Quality
- Ensure no TypeScript errors or warnings
- Verify proper import organization
- Confirm consistent code style with existing components
- Check that all event handlers prevent memory leaks
- Verify accessibility attributes are present (aria labels, sr-only text)

## Validation Commands
Execute these commands to validate the chore is complete:

- `npm run dev` - Start development server and manually test the file detail modal functionality
- `npm run build` - Ensure TypeScript compilation succeeds with no errors
- `npm run lint` - Verify ESLint passes with no errors
- Manual testing checklist:
  - Click on different rows in Upload History table and verify modal opens with correct data
  - Click Eye icon button and verify modal opens
  - Test modal with files that have errors vs. no errors
  - Test modal close functionality (X button, outside click, Escape key)
  - Verify responsive layout at different screen sizes
  - Check hover effect visibility on table rows

## Notes
- Use existing Dialog component from shadcn/ui for consistency with other modals in the application
- The FileDetailModal should reuse the same badge styling logic from UploadHistoryTable for status display
- Consider showing processing results in a scrollable container if the list is long
- The error summary section should be prominently displayed with red/warning styling to draw attention
- Make sure to handle the case where processingResults array might be undefined
- The Eye icon button should stop event propagation to prevent triggering the row click handler twice
