# Chore: Implement DaaS File Processing Workflow

## Metadata
adw_id: `410360c4`
prompt: `Enhance the existing Stock Config page at /app/stock-config/page.tsx to implement the full DaaS file processing workflow with line-by-line validation, detailed error reporting, and post-processing results display.`

## Chore Description
Enhance the Stock Config page to implement the complete DaaS (Data-as-a-Service) file processing workflow following the CMG model (modern line-by-line processing). This replaces the legacy "entire file rejection" approach with a sophisticated workflow that:

1. **Pre-Submission Validation**: Validates files on the frontend before submission with immediate error feedback
2. **Line-by-Line Processing**: Processes each row individually - valid rows succeed while invalid rows fail independently
3. **Post-Processing Report**: Displays detailed results with filtering, error messages, and CSV export capabilities
4. **File Status Management**: Tracks files through processing states (validating → processing → completed/partial/error)

This implementation aligns with the DaaS system's role as the "Instruction Reader & Logic Engine" that validates data, executes timing logic, and generates detailed error reports (as documented in the reference PDFs).

## Relevant Files
Use these files to complete the chore:

### Existing Files to Modify

- **`src/types/stock-config.ts`** - Add new types for ProcessingResult, ProcessingStatus, and extended StockConfigFile fields
- **`src/lib/stock-config-service.ts`** - Add new service functions for pre-submission validation, line-by-line processing, error report generation, and retry logic
- **`src/components/stock-config/file-upload-modal.tsx`** - Update to add validation step before upload, show validation results inline
- **`src/components/stock-config/validation-results-table.tsx`** - Enhance to support post-processing results display with download capabilities
- **`app/stock-config/page.tsx`** - Update to integrate new modals, processing progress, and enhanced file history section

### New Files to Create

- **`src/components/stock-config/processing-progress-modal.tsx`** - Modal showing real-time processing progress with progress bar, current row, running counts, and cancel button
- **`src/components/stock-config/post-processing-report.tsx`** - Full-screen modal/section for detailed processing results with filtering, sorting, and export buttons

### Reference Documentation (Read-Only)

- **`docs/config_stock/DaaS Inventory Configuration_ Process Overview.pdf`** - Describes the CMG line-by-line processing model vs legacy entire-file rejection
- **`docs/config_stock/The Journey of a Data File_ From Upload to Online Store.pdf`** - Explains file journey through DaaS → MAO → PMP systems

### UI Components to Leverage

- **`src/components/ui/progress.tsx`** - Progress bar component for processing progress
- **`src/components/ui/dialog.tsx`** - Dialog component for modals
- **`src/components/ui/tabs.tsx`** - Tabs for filtering results (All/Success/Errors)
- **`src/components/ui/badge.tsx`** - Status badges
- **`src/components/ui/table.tsx`** - Data tables

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Update Type Definitions
- Add `ProcessingStatus` type: `'validating' | 'processing' | 'completed' | 'partial' | 'error'`
- Add `ProcessingResult` interface with fields: `rowNumber`, `item`, `location`, `status`, `errorCode`, `errorMessage`, `originalData`
- Add `ErrorCode` type enum for standardized error codes: `ITEM_NOT_FOUND`, `LOCATION_NOT_FOUND`, `INVALID_DATE_FORMAT`, `DATE_RANGE_INVALID`, `DUPLICATE_CONFIG`, `MISSING_REQUIRED_FIELD`, `INVALID_SUPPLY_TYPE`, `INVALID_FREQUENCY`, `QUANTITY_INVALID`
- Extend `StockConfigFile` interface with new fields: `processingStatus`, `processingProgress`, `successCount`, `errorCount`, `processedAt`, `errorReportUrl`
- Add `PreSubmissionValidationResult` interface for frontend validation results

### 2. Add Service Layer Functions
- Implement `validateFilePreSubmission(data: StockConfigItem[]): ValidationResult[]` - Frontend validation for mandatory fields, date formats, numeric validation, supply type/frequency validation
- Implement `processFileLineByLine(data: StockConfigItem[], onProgress?: (progress: number, current: number, success: number, errors: number) => void): Promise<ProcessingResult[]>` - Simulates backend processing with realistic delays, validates against mock "database" for item/location existence, checks for duplicate configs
- Implement `generateErrorReport(results: ProcessingResult[]): Blob` - Generates CSV blob with all processing results
- Implement `generateErrorsOnlyReport(results: ProcessingResult[]): Blob` - Generates CSV with only failed rows for re-submission
- Implement `retryFailedRows(fileId: string, correctedData: StockConfigItem[]): Promise<ProcessingResult[]>` - Re-processes previously failed rows
- Add mock validation data for simulating backend checks (valid items list, valid locations list)

### 3. Create ProcessingProgressModal Component
- Create modal with progress bar using `Progress` component
- Display current processing state: percentage, current row being processed
- Show running counts: "X succeeded, Y failed" with color-coded badges
- Add animated progress indicator
- Implement cancel button with confirmation to abort processing
- Use `AbortController` pattern for cancellation support
- Display estimated time remaining based on processing speed

### 4. Create PostProcessingReport Component
- Create full-screen dialog showing comprehensive results
- Add summary section: Total rows, Successful rows (green), Failed rows (red)
- Build sortable/filterable table with columns: Row#, Item, Location, Status, Error Message
- Implement row highlighting: green background for success, red for error
- Add filter toggle tabs: 'All' | 'Success Only' | 'Errors Only'
- Create expandable error details section for each failed row showing full error context
- Add 'Download Full Report' button (CSV export of all results)
- Add 'Download Errors Only' button (CSV export of failed rows formatted for re-submission)
- Add 'Retry Failed Rows' button that pre-populates upload modal with failed data

### 5. Update FileUploadModal Component
- Add multi-step workflow: File Selection → Validation → Review → Submit
- Show step indicator (1. Select File, 2. Validate, 3. Review, 4. Submit)
- After file parsing, automatically run `validateFilePreSubmission`
- Display inline validation results with error counts before submission
- Add "Validation Results" expandable section showing errors by row
- Only enable "Submit for Processing" button when validation passes (or user confirms to proceed with warnings)
- Add "Fix and Re-upload" button when validation fails
- Update button states based on validation results

### 6. Update Upload History Section in Main Page
- Add processing status column with new states: 'Validating', 'Processing', 'Completed', 'Partial', 'Error'
- Show progress percentage for 'Processing' status files (e.g., "Processing... 45%")
- Display success/error counts for completed files (e.g., "148 success, 2 errors")
- Add 'View Report' button for files with status 'completed' or 'partial' - opens PostProcessingReport modal
- Add 'Retry Failed Rows' button for files with status 'partial' or 'error'
- Update folder icon logic to reflect new processing states
- Add timestamp for `processedAt` display

### 7. Integrate Components in Main Page
- Add state management for processing workflow: `processingModalOpen`, `currentProcessingFile`, `processingResults`
- Wire up FileUploadModal to trigger processing after submission
- Open ProcessingProgressModal during processing phase
- Automatically open PostProcessingReport when processing completes
- Handle processing cancellation gracefully
- Update file history after processing completes
- Add toast notifications for processing status changes

### 8. Add Error Message Mapping
- Create error message constants mapping error codes to human-readable messages
- Implement error code to message translation function
- Support parameterized error messages (e.g., "Item [X] does not exist in the system")
- Add error severity indicators (critical vs warning)

### 9. Validate and Test
- Test complete upload workflow from file selection to post-processing report
- Verify line-by-line processing works correctly (valid rows succeed, invalid fail independently)
- Test CSV export functionality for both full report and errors-only
- Verify filter toggles work correctly in post-processing report
- Test cancel functionality during processing
- Verify file history updates correctly with new processing states
- Test retry functionality for failed rows

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm build` - Ensure no TypeScript compilation errors
- `pnpm lint` - Verify no ESLint errors
- `pnpm dev` - Start development server and manually test:
  1. Navigate to /stock-config
  2. Upload a test CSV/Excel file with mix of valid and invalid rows
  3. Verify pre-submission validation shows errors immediately
  4. Submit file and verify progress modal appears
  5. After processing, verify post-processing report shows correct results
  6. Test filter toggles (All/Success/Errors)
  7. Download CSV reports and verify content
  8. Check upload history shows correct processing status
  9. Test "View Report" button on completed files
  10. Test "Retry Failed Rows" button functionality

## Notes

### CMG Model Processing Logic
Based on the reference documentation, the CMG model processes files line-by-line:
- Valid rows are processed and stored successfully
- Invalid rows generate specific error messages (e.g., "Item not found in DaaS")
- Users receive detailed reports showing exactly which rows failed and why
- This is in contrast to the legacy model where a single error rejects the entire file

### Mock Backend Simulation
Since this is a frontend implementation, backend processing is simulated with:
- Realistic processing delays (50-200ms per row)
- Mock validation against predefined valid items/locations lists
- Random simulated failures for demonstration purposes (configurable)
- Progress callback support for real-time UI updates

### File Status Flow
```
Upload → Validating → Processing → Completed (all success)
                   ↘          ↘→ Partial (some success, some error)
                    ↘           ↘→ Error (all failed)
```

### Error Codes Reference
| Code | Message Template |
|------|-----------------|
| ITEM_NOT_FOUND | Item [X] does not exist in the system |
| LOCATION_NOT_FOUND | Location [X] is not valid |
| INVALID_DATE_FORMAT | Date must be in YYYY-MM-DD format |
| DATE_RANGE_INVALID | End Date must be after Start Date |
| DUPLICATE_CONFIG | A configuration for this Item+Location already exists for the specified period |
| MISSING_REQUIRED_FIELD | Field [X] is required |
| INVALID_SUPPLY_TYPE | Supply Type must be Preorder or OnHand |
| INVALID_FREQUENCY | Frequency must be Onetime or Daily |
| QUANTITY_INVALID | Quantity must be a positive number |

### Folder Status Mapping
- `pending` folder → File awaiting processing
- `arch` folder → Successfully processed (Completed status)
- `err` folder → Processing failed (Error status) or partial failures (Partial status)
