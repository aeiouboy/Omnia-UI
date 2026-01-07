# Chore: Improve Error Handling and Re-upload Workflow for Stock Config

## Metadata
adw_id: `7f5a2db1`
prompt: `Improve error handling and re-upload workflow for Stock Config file processing.`

## Chore Description
Enhance the Stock Config file processing workflow to provide a better user experience when processing completes with errors. The key improvements are:

1. **Add 'Download Errors' button to Processing Progress Modal** - When processing completes with errors, users should be able to download failed rows directly from the progress modal (in addition to viewing the full report).

2. **Fix error CSV headers to match upload format** - The downloaded error CSV must use the exact header names that the upload validation accepts (`ItemId`, `LocationId`, `SupplyTypeId`, `Frequency`, `Quantity`, `StartDate`, `EndDate`) so users can fix errors and re-upload the corrected file without header compatibility issues.

3. **Include error message column** - Add an `Error` column as the last column in the error CSV so users can see what needs to be fixed for each row.

## Relevant Files
Use these files to complete the chore:

- **`src/components/stock-config/processing-progress-modal.tsx`** - The modal that shows processing progress. Currently shows 'Close' and 'View Report' buttons when complete. Needs a 'Download Errors' button when `isComplete && errorCount > 0`.

- **`src/lib/stock-config-service.ts`** - Contains `generateErrorsOnlyReport()` function (lines 990-1024) that generates the error CSV. Currently uses headers: `LocationID, ItemID, SKU, Quantity, SupplyTypeID, Frequency, SafetyStock, StartDate, EndDate`. Needs to be updated to use exact upload-compatible headers and include error message.

- **`src/types/stock-config.ts`** - Type definitions for stock config. May need minor updates for new types if needed.

- **`src/components/stock-config/post-processing-report.tsx`** - The post-processing report modal that already has 'Download Errors Only' button. The same download function should be reusable.

- **`app/stock-config/page.tsx`** - Main page component that manages all modal states and data flow. Will need to pass additional props to `ProcessingProgressModal`.

### New Files
No new files needed.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Update generateErrorsOnlyReport() Function Headers
- Open `src/lib/stock-config-service.ts`
- Find the `generateErrorsOnlyReport()` function (around line 990)
- Update headers array to use exact upload-compatible column names:
  - Current headers: `LocationID, ItemID, SKU, Quantity, SupplyTypeID, Frequency, SafetyStock, StartDate, EndDate`
  - New headers: `ItemId, LocationId, SupplyTypeId, Frequency, Quantity, StartDate, EndDate, Error`
- Note: Remove `SKU` and `SafetyStock` columns as they are auto-generated/optional
- Add `Error` column as the last column to show the error message for each failed row
- Update the CSV row generation to match the new headers order and include `result.errorMessage`

### 2. Update ProcessingProgressModal Props Interface
- Open `src/components/stock-config/processing-progress-modal.tsx`
- Add new props to the interface:
  - `processingResults: ProcessingResult[]` - Array of processing results (needed to generate error CSV)
  - `onDownloadErrors: () => void` - Callback to trigger error CSV download
- Import `ProcessingResult` type from `@/types/stock-config`

### 3. Add Download Errors Button to ProcessingProgressModal
- In the footer actions section of `ProcessingProgressModal` (around line 185)
- When `isComplete && errorCount > 0`, add a 'Download Errors' button:
  - Position: Before the 'Close' button
  - Style: `variant="outline"` with Download icon
  - Label: "Download Errors"
  - Action: Call `onDownloadErrors()`
- Button order when complete with errors should be: `Download Errors | Close | View Report`

### 4. Update Page Component to Pass Props and Handle Download
- Open `app/stock-config/page.tsx`
- Create a new handler function `handleDownloadProcessingErrors` that:
  - Imports `generateErrorsOnlyReport` (already imported)
  - Generates the error CSV blob using `generateErrorsOnlyReport(processingResults)`
  - Downloads the blob as `errors-{filename}.csv`
- Pass the new props to `ProcessingProgressModal`:
  - `processingResults={processingResults}`
  - `onDownloadErrors={handleDownloadProcessingErrors}`

### 5. Validate the Implementation
- Run `pnpm dev` to verify no build errors
- Manual testing steps:
  1. Upload a CSV file with some valid and some invalid rows (use `test-stock-config.csv` or create test data)
  2. After processing completes with errors, verify the 'Download Errors' button appears
  3. Click 'Download Errors' and verify the CSV:
     - Has correct headers: `ItemId,LocationId,SupplyTypeId,Frequency,Quantity,StartDate,EndDate,Error`
     - Contains only failed rows
     - Each row has the error message in the last column
  4. Fix the errors in the downloaded CSV
  5. Re-upload using 'Upload Config' button
  6. Verify the corrected rows are processed successfully

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm dev` - Start development server and verify no build errors
- `pnpm build` - Run production build to ensure no TypeScript errors
- `pnpm lint` - Run linter to ensure code style compliance

## Notes
- The header mapping in `mapHeaders()` function (line 229-254 in stock-config-service.ts) already supports case-insensitive matching, so `ItemId` will match `itemid`, `item_id`, etc.
- The `SKU` column is auto-generated from `ItemId` if not provided, so it's not needed in the re-upload format
- The `SafetyStock` column defaults to 0 if not provided, so it's optional and can be omitted
- The existing 'Download Errors Only' button in PostProcessingReport uses the same `generateErrorsOnlyReport()` function, so updating it will fix both locations
- Consider backward compatibility: if users have old error CSVs with the previous header format, they should still work due to case-insensitive header mapping
