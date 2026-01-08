# Chore: Add File Download Functionality to Stock Config Upload History

## Metadata
adw_id: `518ee08c`
prompt: `Update File Detail Modal in Upload History section on Stock Configuration page (app/stock-config/page.tsx) to add file download functionality. Requirements: 1) Add a 'Download File' button in the modal that allows users to download the actual uploaded file to review its contents 2) Use the Download icon from lucide-react for the button 3) Place the download button prominently in the modal header next to the filename or as a primary action button 4) The download should trigger browser download of the file using the file's original filename 5) If file URL/path is stored in StockConfigFile type, use that; otherwise create a mock download URL like '/api/stock-config/files/{fileId}/download' 6) Add appropriate button styling - use Button component with variant='outline' or 'default' 7) Show loading state on button while download is in progress 8) Handle download errors gracefully with toast notification 9) Also add a smaller download icon button in the Upload History table row as quick access to download without opening modal`

## Chore Description
Add file download functionality to the Stock Configuration Upload History section, allowing users to download uploaded CSV files for review. This includes:
- Adding a prominent download button in the File Detail Modal header
- Adding a quick-access download icon button in each Upload History table row
- Implementing download handling with loading states and error management
- Creating a mock API endpoint for file downloads (since actual file storage is not yet implemented)
- Using proper download triggers with original filenames

## Relevant Files
Use these files to complete the chore:

- **src/components/stock-config/file-detail-modal.tsx** - Main modal component where the primary download button will be added to the header/actions area
- **src/components/stock-config/upload-history-table.tsx** - Table component where quick-access download icon buttons will be added to each row
- **src/types/stock-config.ts** - Type definitions for StockConfigFile; may need to add optional fileUrl or filePath property
- **app/stock-config/page.tsx** - Parent page component that manages state and handlers; will need to add download handler function

### New Files
- **app/api/stock-config/files/[fileId]/download/route.ts** - API endpoint to handle file download requests (mock implementation for now)

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Update Type Definitions
- Open `src/types/stock-config.ts`
- Add optional `fileUrl?: string` property to the `StockConfigFile` interface
- This will store the file path/URL when actual file storage is implemented

### 2. Create Mock Download API Endpoint
- Create directory structure: `app/api/stock-config/files/[fileId]/download/`
- Create `route.ts` file with GET handler
- Implement mock file download that returns a sample CSV file
- Use proper headers: `Content-Type: text/csv` and `Content-Disposition: attachment; filename="..."`
- Include error handling for invalid file IDs

### 3. Add Download Handler to Main Page Component
- Open `app/stock-config/page.tsx`
- Import `Download` icon from lucide-react
- Create `handleDownloadFile` async function that:
  - Takes a `StockConfigFile` parameter
  - Shows loading state using useState
  - Fetches from the download API endpoint
  - Triggers browser download using the file's original filename
  - Handles errors with toast notifications
  - Includes proper cleanup

### 4. Update File Detail Modal Component
- Open `src/components/stock-config/file-detail-modal.tsx`
- Import `Download` icon from lucide-react
- Add `onDownload?: (file: StockConfigFile) => void` prop to interface
- Add download button in the DialogHeader section next to the filename
- Use Button component with variant="default" or "outline"
- Add Download icon with proper spacing
- Add loading state using local useState
- Wire up onClick handler to call onDownload prop
- Use proper accessibility labels

### 5. Update Upload History Table Component
- Open `src/components/stock-config/upload-history-table.tsx`
- Import `Download` icon from lucide-react
- Add `onDownload?: (file: StockConfigFile) => void` prop to interface
- Add a download icon button in the Status TableCell (before or after the Eye button)
- Use Button component with variant="ghost" and size="sm"
- Add Download icon
- Use onClick with stopPropagation to prevent row click
- Add proper accessibility label (sr-only)
- Maintain consistent styling with existing Eye button

### 6. Wire Up Handlers in Parent Page
- Open `app/stock-config/page.tsx`
- Pass `handleDownloadFile` to FileDetailModal via `onDownload` prop
- Pass `handleDownloadFile` to UploadHistoryTable via `onDownload` prop
- Ensure all necessary imports are added

### 7. Test Download Functionality
- Verify download button appears in File Detail Modal header
- Verify download icon button appears in Upload History table rows
- Test clicking download button triggers file download
- Test loading states appear during download
- Test error handling with invalid file IDs
- Test download uses original filename correctly
- Verify clicking table download button doesn't open modal (stopPropagation works)

### 8. Validate Code Quality
- Ensure no TypeScript errors
- Ensure consistent code style with existing components
- Verify proper error handling
- Verify accessibility features (sr-only labels, proper button semantics)
- Check responsive design (buttons work on mobile)

## Validation Commands
Execute these commands to validate the chore is complete:

- `npm run build` - Ensure the code compiles without TypeScript errors
- `npm run lint` - Check for linting issues
- **Manual Testing**:
  - Navigate to Stock Configuration page
  - Open Upload History section
  - Click on a file row to open File Detail Modal
  - Verify "Download File" button appears in modal header with Download icon
  - Click the download button and verify CSV file downloads with correct filename
  - Close modal and verify Download icon button appears in table rows
  - Click table download button and verify file downloads without opening modal
  - Test with different file records to ensure consistent behavior

## Notes
- This implementation uses a mock API endpoint since actual file storage is not yet implemented
- When real file storage is implemented (e.g., S3, local storage), update the API endpoint to fetch actual files
- The `fileUrl` property in `StockConfigFile` type is optional for backward compatibility
- Download functionality uses the browser's built-in download mechanism via blob URLs
- Error handling provides user-friendly feedback via toast notifications
- Loading states prevent duplicate download requests
- The download buttons are styled consistently with existing UI patterns in the application
