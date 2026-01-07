# Chore: Change Retry Failed Rows Button Workflow to Retry Failed File

## Metadata
adw_id: `9e9f4101`
prompt: `Change the 'Retry Failed Rows' button workflow in the Stock Config processing report. Currently, clicking 'Retry Failed Rows' in PostProcessingReport calls handleRetryFailedRows which auto-retries the same failed data.

  The new workflow should be:
  1. Rename the button from 'Retry Failed Rows' to 'Retry Failed File'
  2. When clicked, instead of auto-retrying same data:
     - Close the PostProcessingReport modal
     - Open the FileUploadModal so user can upload a corrected CSV file
     - User will have already downloaded the errors CSV, fixed the data based on error messages, and now wants to re-upload

  Files to modify:
  - src/components/stock-config/post-processing-report.tsx: Change button text and behavior
  - app/stock-config/page.tsx: Update handleRetryFailedRows to close report modal and open upload modal instead of reprocessing same data

  The Download Errors Only button should remain unchanged - it already allows users to download failed rows as CSV for manual correction. The new workflow is: Download Errors → Fix CSV externally → Re-upload via Retry Failed File button.`

## Chore Description
This chore updates the retry workflow for failed stock configuration uploads. Currently, the "Retry Failed Rows" button automatically re-processes the same failed data, which doesn't make sense since the data hasn't changed. The new workflow aligns with the actual user journey:

1. User processes a file and gets some failures
2. User downloads the error-only CSV report
3. User fixes the errors in the CSV file externally
4. User wants to re-upload the corrected file

The new "Retry Failed File" button will close the processing report modal and open the file upload modal, allowing users to upload their corrected CSV file. This creates a more intuitive workflow that matches how users actually fix and re-upload failed data.

## Relevant Files
Files to modify for this chore:

- **src/components/stock-config/post-processing-report.tsx** (Lines 181-185)
  - Contains the "Retry Failed Rows" button that needs to be renamed to "Retry Failed File"
  - The button's `handleRetryFailed` callback needs updated behavior
  - Button is shown conditionally when `stats.errors > 0`

- **app/stock-config/page.tsx** (Lines 374-390)
  - Contains `handleRetryFailedRows` function that currently auto-retries same data
  - This function needs to be updated to close report modal and open upload modal instead
  - Function is passed as `onRetryFailed` prop to PostProcessingReport component (line 794)
  - Upload modal state is controlled by `uploadModalOpen` and `setUploadModalOpen` (line 65)
  - Report modal state is controlled by `reportModalOpen` and `setReportModalOpen` (line 81)

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Update PostProcessingReport Button Text
- Change button text from "Retry Failed Rows" to "Retry Failed File" in `src/components/stock-config/post-processing-report.tsx` line 183
- Update the button count display to keep showing number of errors (line 183)
- No changes needed to the `handleRetryFailed` callback function itself (lines 133-136)

### 2. Update Page-Level Handler Function
- Modify `handleRetryFailedRows` function in `app/stock-config/page.tsx` (lines 374-390)
- Remove the current logic that creates a FileParseResult and calls handleStartProcessing
- Replace with new logic that:
  1. Closes the report modal by calling `setReportModalOpen(false)`
  2. Opens the upload modal by calling `setUploadModalOpen(true)`
- Keep the function signature the same: `(failedResults: ProcessingResult[]) => void`
- The function no longer needs to use the `failedResults` parameter since we're not auto-retrying

### 3. Verify Modal State Management
- Ensure `uploadModalOpen` state (line 65) is properly controlled
- Ensure `reportModalOpen` state (line 81) is properly controlled
- Verify FileUploadModal component (lines 760-766) will open when `uploadModalOpen` is set to true
- Verify PostProcessingReport component (lines 789-795) will close when `reportModalOpen` is set to false

### 4. Test the Workflow End-to-End
- Upload a stock config file with intentional errors
- Wait for processing to complete
- Click "Download Errors Only" button to get error CSV
- Click the new "Retry Failed File" button
- Verify that:
  - The PostProcessingReport modal closes
  - The FileUploadModal opens
  - User can upload a corrected CSV file
  - New upload processes correctly

## Validation Commands
Execute these commands to validate the chore is complete:

- `grep -n "Retry Failed File" src/components/stock-config/post-processing-report.tsx` - Verify button text was updated (should show line 183)
- `grep -n "setReportModalOpen\|setUploadModalOpen" app/stock-config/page.tsx` - Verify modal state updates are in handleRetryFailedRows function
- `pnpm run build` - Ensure no TypeScript compilation errors
- `pnpm run lint` - Ensure no linting errors
- Manual testing: Process file with errors → Download errors → Click "Retry Failed File" → Verify upload modal opens

## Notes

### Why This Change Makes Sense
The current "Retry Failed Rows" behavior doesn't align with how users fix errors:
- Re-processing the same failed data will just fail again (data hasn't changed)
- Users need to download errors, fix them externally, then re-upload
- The new workflow matches this actual user journey

### Download Errors Only Button
This button remains unchanged and continues to:
- Generate a CSV with only the failed rows
- Include error messages in the "Error Message" column
- Allow users to download and fix data externally
- File is downloaded with prefix `errors-{original-filename}.csv`

### Alternative Considered
We could have made "Retry Failed File" auto-populate the upload modal with the error CSV, but this would require:
- Storing the error blob in state
- Pre-loading it into the file input
- Additional complexity for minimal UX benefit
The simpler approach of just opening the upload modal is cleaner and more flexible.
