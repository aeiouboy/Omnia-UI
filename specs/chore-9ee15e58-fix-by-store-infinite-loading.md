# Chore: Fix By Store View Infinite Loading Skeleton

## Metadata
adw_id: `9ee15e58`
prompt: `Fix By Store view showing infinite loading skeleton on Stock Card page (app/inventory-new/stores/page.tsx)`

## Chore Description
When switching to the 'By Store' tab on the Stock Card page, the page displays a loading skeleton forever instead of showing the proper content with filter UI and empty state. This happens because the `loading` state is initialized to `true`, and the skeleton is shown when `loading && viewTab === 'by-store'`. The `loadData()` function only sets `loading=false` when mandatory filters are satisfied, so without a date selected, the skeleton persists indefinitely.

The fix should make By Store view behave consistently with By Product view: show filters first, display empty state when mandatory filters aren't met, and show data when filters are complete.

## Relevant Files
Use these files to complete the chore:

- **app/inventory-new/stores/page.tsx** - The main Stock Card page component containing the bug
  - Line 250: `loading` state initialized to `true`
  - Lines 577-602: Early return skeleton that causes infinite loading
  - Lines 321-354: `loadData()` function that conditionally sets `loading=false`
  - Lines 651-903: By Store view content rendering (filters, empty state, table)

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Change Loading State Initialization
- Change `const [loading, setLoading] = useState(true)` on line 250 to `const [loading, setLoading] = useState(false)`
- This prevents the initial skeleton from showing before any user interaction

### 2. Remove Early Return Skeleton for By Store View
- Delete or comment out the early return skeleton block at lines 577-602
- This block is the root cause: `if (loading && viewTab === "by-store")` returns a skeleton that blocks the actual UI
- The By Store view already handles loading state inline at line 777-781 using `storeOverviewLoading`
- This makes By Store view consistent with By Product view which has no early return skeleton

### 3. Verify By Store View Rendering Logic
- Confirm the By Store view content (lines 651-903) correctly handles all states:
  - When `!hasAllMandatoryFiltersForStore`: Shows empty state with "Please select Date Range to view store stock overview"
  - When `hasAllMandatoryFiltersForStore && storeOverviewLoading`: Shows inline loading spinner in the table card
  - When `hasAllMandatoryFiltersForStore && !storeOverviewLoading`: Shows the Store Stock Overview table with data

### 4. Validate the Fix
- Build the project to ensure no TypeScript errors
- Verify the expected behavior:
  1. Navigate to Stock Card page
  2. Switch to "By Store" tab
  3. Should see: Page header, Date Range filter (with orange border), Empty state message
  4. Select a date range
  5. Should see: Loading spinner briefly, then Store Stock Overview table

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm build` - Ensure TypeScript compilation passes with no errors
- `pnpm dev` - Start dev server and manually test:
  1. Visit `/inventory-new/stores`
  2. Click "By Store" tab
  3. Verify filter UI is visible (not skeleton)
  4. Verify empty state message appears: "Please select Date Range to view store stock overview"
  5. Select date range and verify table loads correctly

## Notes
- The By Product view does not have this issue because it doesn't have an early return skeleton - it handles all states inline
- The `loading` state appears to be a legacy state from before the By Store view was redesigned to use `storeOverviewLoading` for its own loading indicator
- After this fix, the `loading` state is only used for the error state condition at line 605 (`if (error && viewTab === "by-store")`)
- Consider in future: Remove the unused `loading` state entirely and rely solely on `storeOverviewLoading` for By Store view
