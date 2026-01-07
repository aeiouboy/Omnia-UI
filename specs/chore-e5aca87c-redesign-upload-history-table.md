# Chore: Redesign Upload History to Table Format

## Metadata
adw_id: `e5aca87c`
prompt: `Redesign Upload History section in Stock Configuration page (app/stock-config/page.tsx) to use a proper table format for better readability. Requirements: 1) Convert the current list-based layout to a table with clear column headers: File Name, Upload Date, Uploaded By, Records, Status, Actions 2) Use the same table styling as StockConfigTable component (src/components/stock-config/stock-config-table.tsx) for consistency 3) Move status badge to be more prominent - place it right after filename or in a dedicated Status column 4) Combine the folder icon with filename in the first column 5) Format 'Uploaded By' column with User icon and name, use text-sm instead of text-xs for better readability 6) Show record counts as 'Total (Valid/Invalid)' format in a single Records column 7) Keep View Report and Retry buttons in an Actions column 8) Add subtle alternating row backgrounds for easier scanning 9) Make the table responsive - on mobile show condensed view with key info only (filename, status, date)`

## Chore Description
Transform the Upload History section from its current list-based layout (lines 658-749 in `app/stock-config/page.tsx`) to a proper table format using shadcn/ui Table components. The redesign will:

1. **Table Structure**: Replace the `div.space-y-3` list with a `Table` component matching the styling of `StockConfigTable`
2. **Column Organization**: Create 6 clear columns:
   - **File Name**: Folder icon + filename combined (left-aligned)
   - **Upload Date**: Formatted date and time (sortable)
   - **Uploaded By**: User icon + name (text-sm for better readability)
   - **Records**: Total count with success/error breakdown in format "X (Y valid / Z invalid)"
   - **Status**: Prominent badge matching current `getFileStatusBadge()` logic
   - **Actions**: View Report and Retry buttons in a compact button group
3. **Visual Improvements**:
   - Alternating row backgrounds (hover:bg-muted/50)
   - Consistent padding and spacing
   - Better visual hierarchy with proper font sizes
4. **Responsive Design**:
   - Desktop: Full 6-column table
   - Mobile: Condensed view showing only filename, status, and date

## Relevant Files

- **app/stock-config/page.tsx** (lines 646-751) - Main file containing Upload History section to be redesigned
  - Contains existing list-based layout with file history rendering logic
  - Has helper functions: `getFileStatusBadge()`, `getFolderIcon()`, `canViewReport()`, `canRetry()`
  - Uses existing state: `fileHistory`, `handleViewFileReport()`, `handleRetryFailedRows()`

- **src/components/stock-config/stock-config-table.tsx** (lines 1-264) - Reference table component for styling consistency
  - Shows proper table structure with TableHeader, TableBody, TableRow, TableCell
  - Demonstrates badge usage, action buttons in dropdown menu
  - Uses loading skeletons and empty states
  - Shows proper sorting UI patterns

- **src/types/stock-config.ts** (lines 104-126) - Type definitions for StockConfigFile
  - Defines all fields needed for the table: filename, uploadDate, uploadedBy, recordCount, validRecords, invalidRecords
  - Includes processingStatus, processingProgress, successCount, errorCount
  - Contains ProcessingStatus and FileFolder types for status display

- **src/components/ui/table.tsx** - shadcn/ui Table components (assumed to exist)
  - Provides Table, TableHeader, TableBody, TableRow, TableHead, TableCell components

### New Files
None - this is a redesign of existing UI within `app/stock-config/page.tsx`

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Extract Upload History Section to New Component
- Create new file `src/components/stock-config/upload-history-table.tsx` to separate concerns
- Move the Upload History rendering logic (lines 658-749) from `app/stock-config/page.tsx` to the new component
- Define component props interface:
  ```typescript
  interface UploadHistoryTableProps {
    fileHistory: StockConfigFile[]
    loading?: boolean
    onViewReport: (file: StockConfigFile) => void
    onRetry: (file: StockConfigFile) => void
  }
  ```
- Move helper functions `getFileStatusBadge()`, `getFolderIcon()`, `canViewReport()`, `canRetry()` into the new component

### 2. Implement Table Structure
- Replace the current `div.space-y-3` list layout with shadcn/ui Table component structure:
  ```tsx
  <div className="border rounded-lg">
    <Table>
      <TableHeader>
        <TableRow>
          {/* Column headers */}
        </TableRow>
      </TableHeader>
      <TableBody>
        {/* File rows */}
      </TableBody>
    </Table>
  </div>
  ```
- Add table headers for: File Name, Upload Date, Uploaded By, Records, Status, Actions
- Ensure table wrapper has `border rounded-lg` to match StockConfigTable styling

### 3. Build File Name Column with Folder Icon
- Combine folder icon and filename in the first TableCell:
  ```tsx
  <TableCell>
    <div className="flex items-center gap-2">
      {getFolderIcon(file)}
      <span className="font-medium text-sm">{file.filename}</span>
    </div>
  </TableCell>
  ```
- Use existing `getFolderIcon()` function that returns appropriate icon based on processing status
- Keep icon sizes consistent (h-4 w-4) and apply proper color classes

### 4. Format Upload Date Column
- Create dedicated Upload Date column showing both date and time
- Format upload date using same pattern as current implementation:
  ```tsx
  <TableCell>
    <div className="text-sm">
      {new Date(file.uploadDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })}
      <div className="text-xs text-muted-foreground">
        {new Date(file.uploadDate).toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </div>
    </div>
  </TableCell>
  ```
- Optionally add processed time if `file.processedAt` exists

### 5. Create Uploaded By Column
- Build Uploaded By column with User icon and improved typography:
  ```tsx
  <TableCell>
    {file.uploadedBy ? (
      <div className="flex items-center gap-1.5 text-sm">
        <User className="h-4 w-4 text-muted-foreground" />
        <span>{file.uploadedBy}</span>
      </div>
    ) : (
      <span className="text-sm text-muted-foreground">-</span>
    )}
  </TableCell>
  ```
- Upgrade text size from text-xs to text-sm for better readability
- Handle cases where uploadedBy is undefined

### 6. Design Records Column with Breakdown
- Create Records column showing total count and success/error breakdown:
  ```tsx
  <TableCell>
    <div className="text-sm text-right">
      <div className="font-medium">{file.recordCount} total</div>
      {file.successCount !== undefined || file.errorCount !== undefined ? (
        <div className="text-xs text-muted-foreground">
          <span className="text-green-600">{file.successCount || 0}</span> /
          <span className={file.errorCount && file.errorCount > 0 ? "text-red-600" : "text-muted-foreground"}>
            {file.errorCount || 0}
          </span>
        </div>
      ) : (
        <div className="text-xs text-muted-foreground">
          {file.validRecords} valid / {file.invalidRecords} invalid
        </div>
      )}
    </div>
  </TableCell>
  ```
- Right-align numbers for easier comparison
- Use color coding: green for success, red for errors

### 7. Move Status Badge to Dedicated Column
- Create Status column using existing `getFileStatusBadge()` function:
  ```tsx
  <TableCell>
    {getFileStatusBadge(file)}
  </TableCell>
  ```
- Keep all existing badge variants (validating, processing, completed, partial, error, pending, etc.)
- Ensure badges remain prominent with their current color schemes

### 8. Build Actions Column with View Report and Retry Buttons
- Create Actions column with button group:
  ```tsx
  <TableCell>
    <div className="flex items-center gap-1">
      {canViewReport(file) && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onViewReport(file)}
          title="View Report"
        >
          <Eye className="h-4 w-4" />
        </Button>
      )}
      {canRetry(file) && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onRetry(file)}
          title="Retry Failed Rows"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      )}
    </div>
  </TableCell>
  ```
- Use existing `canViewReport()` and `canRetry()` helper functions
- Keep icon-only buttons with tooltips (title attribute)

### 9. Add Alternating Row Backgrounds
- Apply alternating row styling to TableRow components:
  ```tsx
  <TableRow className="hover:bg-muted/50">
    {/* cells */}
  </TableRow>
  ```
- Use subtle hover effect matching StockConfigTable pattern
- Consider adding `odd:bg-muted/25` class for alternating rows if needed

### 10. Implement Responsive Design
- Add responsive classes to hide columns on mobile:
  ```tsx
  <TableHead className="hidden md:table-cell">Uploaded By</TableHead>
  <TableHead className="hidden lg:table-cell">Records</TableHead>
  ```
- Show essential columns on mobile: File Name, Status, Upload Date
- Hide Records and Uploaded By columns on smaller screens
- Actions column visible on all screen sizes but may stack icons on mobile

### 11. Add Loading State with Skeletons
- Implement loading skeleton matching StockConfigTable pattern:
  ```tsx
  if (loading) {
    return (
      <div className="border rounded-lg">
        <Table>
          <TableHeader>{/* headers */}</TableHeader>
          <TableBody>
            {[...Array(3)].map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                {/* more skeleton cells */}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )
  }
  ```
- Show 3 skeleton rows while data is loading

### 12. Add Empty State
- Implement empty state when no files exist:
  ```tsx
  if (fileHistory.length === 0 && !loading) {
    return (
      <div className="border rounded-lg p-12 text-center">
        <FileSpreadsheet className="h-12 w-12 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No upload history</h3>
        <p className="text-sm text-gray-500">
          Files you upload will appear here
        </p>
      </div>
    )
  }
  ```
- Match the empty state pattern from StockConfigTable

### 13. Update Main Page to Use New Component
- Import the new UploadHistoryTable component in `app/stock-config/page.tsx`:
  ```tsx
  import { UploadHistoryTable } from "@/components/stock-config/upload-history-table"
  ```
- Replace the current Upload History section (lines 646-751) with:
  ```tsx
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <FileSpreadsheet className="h-5 w-5" />
        Upload History
      </CardTitle>
      <CardDescription>
        Recent file uploads and their processing status
      </CardDescription>
    </CardHeader>
    <CardContent>
      <UploadHistoryTable
        fileHistory={fileHistory.slice(0, 10)}
        onViewReport={handleViewFileReport}
        onRetry={(file) => {
          if (file.processingResults) {
            setReportFile(file)
            setReportResults(file.processingResults)
            setReportModalOpen(true)
          }
        }}
      />
    </CardContent>
  </Card>
  ```
- Remove old helper functions from main page (moved to new component)
- Keep the slice(0, 10) limit to show only 10 most recent files

### 14. Validate and Test
- Run `pnpm dev` to start development server
- Navigate to `/stock-config` page
- Verify table renders correctly with proper column headers
- Check responsive behavior by resizing browser window
- Test that View Report and Retry buttons work correctly
- Verify loading state displays skeleton rows
- Confirm empty state appears when no files exist
- Ensure alternating row backgrounds improve readability

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm dev` - Start dev server and visually test the Upload History table at /stock-config
- `pnpm build` - Ensure no TypeScript or build errors
- Check browser console for any React warnings or errors
- Test responsive breakpoints: mobile (< 640px), tablet (640-1024px), desktop (> 1024px)
- Verify table styling matches StockConfigTable component

## Notes

**Design Consistency**: The new table should visually match the StockConfigTable component in terms of:
- Border and rounded corners styling
- Header row styling
- Cell padding and alignment
- Badge colors and icons
- Hover states

**Data Handling**: The component relies on existing helper functions and data structures. No changes to data fetching or processing logic are needed - this is purely a UI redesign.

**Backwards Compatibility**: The new component should handle all existing file statuses and processing states correctly, including edge cases like files with no uploadedBy value or missing success/error counts.

**Accessibility**: Ensure buttons have proper title attributes for tooltips, and the table has semantic HTML structure for screen readers.
