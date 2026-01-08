# Chore: Add Status Filtering to Upload History Section

## Metadata
adw_id: `edf963a9`
prompt: `Add status filtering to the Upload History section on Stock Configuration page (app/stock-config/page.tsx). Requirements: 1) Add filter tabs above the Upload History table with options: All, Pending, Processed, Error - matching the same tab styling as Stock Configurations table (using shadcn Tabs component) 2) Create state to track selected upload history filter, default to 'all' 3) Filter the fileHistory array based on selected status before rendering - 'pending' shows status='pending', 'processed' shows status='processed' or status='validated', 'error' shows status='error' 4) Update the card title to show count in parentheses like 'Upload History (4)' showing filtered count 5) When user clicks on Upload Status card badges (Pending/Processed/Errors), auto-scroll to Upload History AND set the corresponding filter 6) Keep the existing table structure and responsive design unchanged`

## Chore Description
This chore adds status filtering functionality to the Upload History section on the Stock Configuration page. Users will be able to filter upload history by status (All, Pending, Processed, Error) using tabs similar to the Stock Configurations table. Additionally, clicking on the Upload Status card badges will scroll to Upload History and automatically apply the corresponding filter. The filtered count will be displayed in the card title.

## Relevant Files

### Existing Files to Modify
- **app/stock-config/page.tsx** (Lines 1-643)
  - Main page component where Upload History section is rendered
  - Add new state for upload history filter (uploadHistoryFilter)
  - Add filter logic to filter fileHistory array before passing to UploadHistoryTable
  - Add Tabs component above Upload History table (similar to Stock Configurations tabs at line 508-514)
  - Update card title to show filtered count (line 591-593)
  - Modify handleScrollToUploadHistory function to accept optional filter parameter (line 393-395)
  - Update Upload Status card onClick handlers (lines 466-504) to set filter and scroll

- **src/components/stock-config/upload-history-table.tsx** (Lines 1-249)
  - Review to ensure no changes needed (table structure remains unchanged)
  - Verify component can handle filtered array properly

- **src/types/stock-config.ts** (Lines 1-207)
  - Review FileStatus and ProcessingStatus types to understand status values
  - No modifications needed - types already defined correctly

## Step by Step Tasks

### 1. Add Upload History Filter State
- Add new state variable `uploadHistoryFilter` with type `"all" | "pending" | "processed" | "error"` after existing state declarations (around line 91)
- Initialize with default value of `"all"`
- Add state setter `setUploadHistoryFilter`

### 2. Create Filtered File History Array
- Create a `useMemo` hook to filter `fileHistory` array based on `uploadHistoryFilter` state
- Filter logic:
  - `"all"`: Return all files (no filter)
  - `"pending"`: Return files where `file.status === "pending"` OR `file.processingStatus === "processing"` OR `file.processingStatus === "validating"`
  - `"processed"`: Return files where `file.status === "processed"` OR `file.status === "validated"` OR `file.processingStatus === "completed"`
  - `"error"`: Return files where `file.status === "error"` OR `file.processingStatus === "error"` OR `file.processingStatus === "partial"`
- Place this memo after the `summaryStats` memo (around line 407)

### 3. Add Filter Tabs to Upload History Section
- Locate the Upload History Card section (line 589)
- Add Tabs component wrapper in CardContent (before UploadHistoryTable)
- Create TabsList with 4 TabsTrigger components:
  - "All" (value="all")
  - "Pending" (value="pending")
  - "Processed" (value="processed")
  - "Error" (value="error")
- Use same styling as Stock Configurations tabs (reference line 508-524)
- Bind to `uploadHistoryFilter` state with `onValueChange={setUploadHistoryFilter}`
- Wrap UploadHistoryTable in TabsContent

### 4. Update Card Title with Filtered Count
- Modify CardTitle at line 591-593
- Change from `"Upload History"` to template string showing count
- Use filtered array length: `Upload History (${filteredFileHistory.length})`
- Keep the FileSpreadsheet icon

### 5. Update Upload Status Card Click Handlers
- Modify Upload Status card at lines 466-504
- Replace single `onClick={handleScrollToUploadHistory}` with wrapper div containing three clickable badge sections
- Create three separate click handlers:
  - **Pending badge click**: Call updated `handleScrollToUploadHistory("pending")`
  - **Processed badge click**: Call updated `handleScrollToUploadHistory("processed")`
  - **Errors badge click**: Call updated `handleScrollToUploadHistory("error")`
- Keep card header onClick for general scroll (sets filter to "all")

### 6. Update handleScrollToUploadHistory Function
- Modify function at line 393-395 to accept optional `filter` parameter
- Type: `handleScrollToUploadHistory(filter?: "all" | "pending" | "processed" | "error")`
- If filter provided, call `setUploadHistoryFilter(filter || "all")`
- Then scroll to uploadHistorySectionRef
- Ensure smooth scroll behavior maintained

### 7. Update UploadHistoryTable Rendering
- Pass `filteredFileHistory` instead of `fileHistory.slice(0, 10)` to UploadHistoryTable component (line 600)
- Consider removing the `.slice(0, 10)` limit since filtering might reduce the number of items
- Or apply slice to filtered results if we want to maintain the 10-item limit per tab

### 8. Test and Validate
- Verify all four filter tabs work correctly
- Verify badge clicks scroll to Upload History and apply correct filter
- Verify filtered count displays correctly in card title
- Verify existing table structure and responsive design unchanged
- Verify no TypeScript errors
- Test mobile responsive behavior

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm build` - Ensure no TypeScript errors and production build succeeds
- `pnpm lint` - Verify code meets ESLint standards
- Manual testing in browser:
  - Navigate to Stock Configuration page
  - Verify Upload History section shows filter tabs (All, Pending, Processed, Error)
  - Click each tab and verify table filters correctly
  - Verify card title shows correct count for each filter
  - Click Pending/Processed/Errors badges in Upload Status card
  - Verify page scrolls to Upload History section
  - Verify correct filter is applied after badge click
  - Verify responsive design on mobile viewport

## Notes

### Status Mapping Reference
Based on `StockConfigFile` type and `UploadHistoryTable` component:

**Pending Status:**
- `status === "pending"`
- `processingStatus === "validating"`
- `processingStatus === "processing"`

**Processed Status:**
- `status === "processed"`
- `status === "validated"`
- `processingStatus === "completed"`

**Error Status:**
- `status === "error"`
- `processingStatus === "error"`
- `processingStatus === "partial"`

### UI/UX Considerations
- Filter tabs should use same Tabs component styling as Stock Configurations section (lines 508-524)
- Maintain existing spacing and layout of Upload History card
- Ensure filtered count updates reactively when filter changes
- Badge click handlers should be intuitive - clicking badge applies that specific filter
- Smooth scroll behavior should be maintained for good UX
- Consider whether to keep 10-item limit per filter or show all filtered items

### Implementation Strategy
- Follow the pattern established by Stock Configurations table filtering
- Use same Tabs component structure for consistency
- Leverage existing useMemo pattern for performance
- Keep all changes isolated to app/stock-config/page.tsx
- No changes needed to UploadHistoryTable component (data filtering happens at parent level)
