# Chore: Fix Inventory Supply Input Filter Debounce Bug

## Metadata
adw_id: `e6fa2948`
prompt: `Fix Inventory Supply page (app/inventory-new/supply/page.tsx) input filter bug where users can only type one character. ROOT CAUSE: The useEffect at line 112-114 calls loadData() on every keystroke, which sets loading=true (line 92), causing the component to render a loading skeleton (lines 219-233) that replaces the entire form including inputs, making the input lose focus. FIX REQUIRED: 1) Add debouncing to search inputs - only trigger loadData after user stops typing for 300-500ms. Use a debounce pattern with setTimeout and clearTimeout in useEffect. 2) OR change loadData to NOT set loading=true when triggered by search input changes - only show loading skeleton on initial load or manual refresh button click. 3) The loading skeleton should NOT replace the filter inputs - keep the form visible while loading data. IMPLEMENTATION: Add a useRef for debounce timeout, modify the useEffect to debounce the loadData call, or separate the loading state into initialLoading vs filterLoading where filterLoading doesn't show skeleton.`

## Chore Description
The Inventory Supply page has a critical UX bug where users can only type one character in the search input fields before losing focus. This happens because:

1. The `useEffect` at lines 112-114 triggers `loadData()` immediately on every keystroke when any search field value changes
2. `loadData()` sets `loading=true` (line 92) which causes a full re-render
3. When `loading` is true, the component renders only a loading skeleton (lines 219-233) which completely replaces the form including all input fields
4. Since the input elements are unmounted and replaced, the user's focus is lost and they cannot continue typing

The fix requires implementing debouncing so that `loadData()` is only called after the user stops typing for 300-500ms, AND ensuring the filter inputs remain visible during loading by separating the loading state or restructuring the render logic.

## Relevant Files
Use these files to complete the chore:

- **app/inventory-new/supply/page.tsx** - The main file that needs modification. Contains the broken useEffect hook (line 112-114), loading state (line 58), loadData function (line 77-109), and the loading skeleton render (lines 219-233)

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Add useRef Import for Debounce Timeout
- Update the React import at line 3 to include `useRef`:
  ```typescript
  import { useState, useEffect, useMemo, useRef } from "react"
  ```

### 2. Create Debounce Timeout Ref
- Add a ref to track the debounce timeout after the state declarations (around line 60):
  ```typescript
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  ```

### 3. Split Loading State into Initial vs Filter Loading
- Replace the single `loading` state with two separate states to distinguish between initial page load and filter-triggered loading:
  ```typescript
  const [initialLoading, setInitialLoading] = useState(false) // For full skeleton
  const [filterLoading, setFilterLoading] = useState(false)   // For inline loading indicator
  ```
- Note: Keep the existing `loading` variable name for backwards compatibility by computing it: `const loading = initialLoading`

### 4. Update loadData Function to Support Debounced Loading
- Modify the `loadData` function to accept a parameter indicating whether this is an initial load or filter change:
  - For initial/manual refresh: set `initialLoading = true` (shows skeleton)
  - For filter changes: set `filterLoading = true` (keeps form visible, shows inline indicator)
- Update the finally block to reset the appropriate loading state

### 5. Implement Debounced useEffect for Search Inputs
- Replace the useEffect at lines 112-114 with a debounced version:
  ```typescript
  useEffect(() => {
    // Clear any existing timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current)
    }

    // Set a new timeout to call loadData after 400ms of no typing
    debounceTimeoutRef.current = setTimeout(() => {
      loadData(false) // false = filter change, not initial load
    }, 400)

    // Cleanup on unmount or dependency change
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
      }
    }
  }, [storeId, storeName, itemId, productName])
  ```

### 6. Update Loading Skeleton Condition
- Modify the loading skeleton render condition (line 219) to only show for `initialLoading`, not `filterLoading`:
  ```typescript
  if (initialLoading) {
  ```

### 7. Add Inline Loading Indicator for Filter Changes (Optional Enhancement)
- Add a subtle loading indicator near the filter bar that shows when `filterLoading` is true, so users know data is being fetched without disrupting their input focus
- This could be a small spinner icon next to the filter bar or an overlay on the table only

### 8. Update handleRefresh to Use Initial Loading
- Ensure the manual refresh button still uses the full loading skeleton by passing the appropriate parameter:
  ```typescript
  const handleRefresh = () => {
    loadData(true) // true = show full skeleton
  }
  ```
- Actually, looking at the current code, `handleRefresh` calls `loadData(false)` which sets `refreshing` state. This is fine - we should keep this behavior and only modify the debounced filter loading.

### 9. Test All Input Fields
- Verify that users can type multiple characters in:
  - Store ID input
  - Store Name input
  - Item ID input
  - Product Name input
- Confirm that data loads after typing stops (after 400ms delay)
- Confirm the loading skeleton only appears on page load or error retry, not during filter typing

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm build` - Verify the TypeScript compiles without errors
- `pnpm dev` - Start the development server and navigate to `/inventory-new/supply`
- Manual test: Type multiple characters quickly in each search input field and verify:
  1. Focus remains in the input while typing
  2. Data loads ~400ms after you stop typing
  3. The form inputs remain visible during loading (no skeleton replaces them)

## Notes
- The 400ms debounce delay is a good balance between responsiveness and preventing excessive API calls
- Consider adding a visual indicator (like a spinner in the filter bar) to show that data is being fetched, so users understand why results may not update instantly
- The `supplyType` and `viewType` dropdowns do not need debouncing since they are select elements that trigger on selection, not continuous typing
- Clean up the timeout ref on component unmount to prevent memory leaks
