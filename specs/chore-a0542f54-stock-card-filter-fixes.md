# Chore: Stock Card Page Filter Fixes

## Metadata
adw_id: `a0542f54`
prompt: `Fix Stock Card page (app/inventory-new/stores/page.tsx) filtering issues. ISSUE 1 - VIEW TYPE OPTIONS: Currently showing 14 view types, should only show 5 view types. Keep only these 5: ECOM-TH-CFR-LOCD-STD (CFR - TOL), ECOM-TH-CFR-LOCD-MKP (CFR - MKP), MKP-TH-CFR-LOCD-STD (CFR - QC), ECOM-TH-DSS-NW-STD (DS - STD), ECOM-TH-DSS-LOCD-EXP (DS - EXP). Remove all other view types from the dropdown. ISSUE 2 - SEARCH MINIMUM CHARACTERS: Store search currently triggers with just 1 character. Add validation to require minimum 2-3 characters before search triggers. Show message like "Enter at least 2 characters to search" if user types only 1 character. ISSUE 3 - SEPARATE STORE ID AND STORE NAME SEARCH: Currently has one search field. Split into TWO separate search fields like Inventory Supply page: 1) "Search Store ID..." field for searching by Store ID (e.g., CFR1819, CDS10114), 2) "Search Store Name..." field for searching by Store Name (e.g., Tops Central World). Both fields should work independently - user can search by either or both. Apply same cross-search logic from Inventory Supply where Store ID field also matches storeName and vice versa.`

## Chore Description
This chore addresses three distinct filtering issues on the Stock Card page (`app/inventory-new/stores/page.tsx`):

1. **VIEW TYPE OPTIONS** - The dropdown currently displays all 14 view types from `VIEW_TYPE_CONFIG`. This needs to be reduced to only 5 specific view types that are relevant for the Stock Card page.

2. **SEARCH MINIMUM CHARACTERS** - The search triggers immediately with just 1 character typed, which can cause unnecessary API calls and poor UX. A minimum of 2 characters should be required before search triggers.

3. **SEPARATE STORE ID AND STORE NAME SEARCH** - The current implementation has a single "Search stores..." input field. This needs to be split into two separate fields like the Inventory Supply page, with cross-search logic where each field can match both storeId and storeName.

## Relevant Files
Use these files to complete the chore:

- **app/inventory-new/stores/page.tsx** - Main file to modify. Contains the Stock Card page with View Type dropdown, search input, and filter logic. Currently at 734 lines.
- **app/inventory-new/supply/page.tsx** - Reference implementation for the two-field search pattern with cross-search logic (lines 151-170) and debounce pattern (lines 123-140).
- **src/types/view-type-config.ts** - Contains `VIEW_TYPE_CONFIG` with all 14 view types. Stock Card page imports and iterates over this, but should define its own subset of 5 view types locally.
- **src/components/inventory/inventory-empty-state.tsx** - Empty state component for showing messages when search criteria is insufficient.

### New Files
No new files needed. All changes are modifications to existing files.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Define Local View Types Subset for Stock Card
- Add a new constant `STOCK_CARD_VIEW_TYPES` at the top of `app/inventory-new/stores/page.tsx` (after imports, around line 48)
- Include only these 5 view types with their labels and descriptions:
  ```typescript
  const STOCK_CARD_VIEW_TYPES = [
    { value: "ECOM-TH-CFR-LOCD-STD", label: "ECOM-TH-CFR-LOCD-STD", description: "CFR - TOL" },
    { value: "ECOM-TH-CFR-LOCD-MKP", label: "ECOM-TH-CFR-LOCD-MKP", description: "CFR - MKP" },
    { value: "MKP-TH-CFR-LOCD-STD", label: "MKP-TH-CFR-LOCD-STD", description: "CFR - QC" },
    { value: "ECOM-TH-DSS-NW-STD", label: "ECOM-TH-DSS-NW-STD", description: "DS - STD" },
    { value: "ECOM-TH-DSS-LOCD-EXP", label: "ECOM-TH-DSS-LOCD-EXP", description: "DS - EXP" },
  ]
  ```
- Remove the import of `VIEW_TYPE_CONFIG` from `@/types/view-type-config` if it becomes unused

### 2. Update View Type Dropdown to Use Local Subset
- Locate the View Type Select component (around line 387-402)
- Replace the iteration over `VIEW_TYPE_CONFIG` with `STOCK_CARD_VIEW_TYPES`
- Update the SelectItem rendering to use the new array structure:
  ```tsx
  {STOCK_CARD_VIEW_TYPES.map(vt => (
    <SelectItem key={vt.value} value={vt.value}>
      <div className="flex flex-col">
        <span className="font-medium">{vt.label}</span>
        <span className="text-xs text-muted-foreground">{vt.description}</span>
      </div>
    </SelectItem>
  ))}
  ```

### 3. Add State for Separate Store ID and Store Name Fields
- Locate the state declarations (around line 91)
- Replace the single `searchQuery` state with two separate states:
  ```typescript
  const [storeIdSearch, setStoreIdSearch] = useState("")
  const [storeNameSearch, setStoreNameSearch] = useState("")
  ```

### 4. Add Minimum Characters Validation
- Create a constant for minimum search characters: `const MIN_SEARCH_CHARS = 2`
- Add a derived state to check if search criteria meets minimum:
  ```typescript
  const hasValidStoreIdSearch = storeIdSearch.trim().length >= MIN_SEARCH_CHARS
  const hasValidStoreNameSearch = storeNameSearch.trim().length >= MIN_SEARCH_CHARS
  const hasValidSearchCriteria = hasValidStoreIdSearch || hasValidStoreNameSearch
  ```
- Update the `loadData` function condition (around line 102-112) to use new validation
- Update the `hasSearchQuery` check to use: `hasValidStoreIdSearch || hasValidStoreNameSearch`

### 5. Update loadData Function for New Search Logic
- Modify the early return condition in `loadData` (line 102-112):
  ```typescript
  const hasViewTypeFilter = selectedViewType && selectedViewType !== "all"
  const hasValidStoreIdSearch = storeIdSearch.trim().length >= MIN_SEARCH_CHARS
  const hasValidStoreNameSearch = storeNameSearch.trim().length >= MIN_SEARCH_CHARS
  const hasValidSearchCriteria = hasValidStoreIdSearch || hasValidStoreNameSearch

  if (!hasViewTypeFilter && !hasValidSearchCriteria) {
    // ... existing early return logic
  }
  ```

### 6. Update Filter Logic with Cross-Search
- Locate `filteredAndSortedStores` useMemo (around line 155-200)
- Update the search filter logic to implement cross-search (reference: supply page lines 151-170):
  ```typescript
  // Store ID Filter - cross-search both fields
  if (hasValidStoreIdSearch) {
    const storeIdLower = storeIdSearch.toLowerCase()
    filtered = filtered.filter((store) =>
      (store.storeId && store.storeId.toLowerCase().includes(storeIdLower)) ||
      (store.storeName && store.storeName.toLowerCase().includes(storeIdLower))
    )
  }

  // Store Name Filter - cross-search both fields
  if (hasValidStoreNameSearch) {
    const storeNameLower = storeNameSearch.toLowerCase()
    filtered = filtered.filter((store) =>
      (store.storeName && store.storeName.toLowerCase().includes(storeNameLower)) ||
      (store.storeId && store.storeId.toLowerCase().includes(storeNameLower))
    )
  }
  ```
- Update the useMemo dependencies to include new state variables

### 7. Add Debounce to Search Inputs
- Add `useRef` to the imports (line 3)
- Add debounce timeout ref: `const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null)`
- Update the `useEffect` for `loadData` to use debouncing (reference: supply page lines 123-140):
  ```typescript
  useEffect(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current)
    }
    debounceTimeoutRef.current = setTimeout(() => {
      loadData()
    }, 400)
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
      }
    }
  }, [selectedViewType, storeIdSearch, storeNameSearch, isContextLoading])
  ```

### 8. Update UI: Replace Single Search with Two Search Fields
- Locate the Store Search input (around line 404-413)
- Replace with two separate search inputs matching Inventory Supply layout:
  ```tsx
  {/* Store ID Search */}
  <div className="relative">
    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
    <Input
      placeholder="Search Store ID..."
      value={storeIdSearch}
      onChange={(e) => setStoreIdSearch(e.target.value)}
      className="pl-9 w-[160px] h-10"
    />
  </div>

  {/* Store Name Search */}
  <div className="relative">
    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
    <Input
      placeholder="Search Store Name..."
      value={storeNameSearch}
      onChange={(e) => setStoreNameSearch(e.target.value)}
      className="pl-9 w-[180px] h-10"
    />
  </div>
  ```

### 9. Update Empty State Message for Minimum Characters
- Locate the empty state rendering (around line 560-565)
- Update the condition and message to reflect minimum character requirement:
  ```tsx
  {((!selectedViewType || selectedViewType === "all") && !hasValidSearchCriteria) && (
    <InventoryEmptyState
      message={
        (storeIdSearch.trim().length > 0 && storeIdSearch.trim().length < MIN_SEARCH_CHARS) ||
        (storeNameSearch.trim().length > 0 && storeNameSearch.trim().length < MIN_SEARCH_CHARS)
          ? "Enter at least 2 characters to search"
          : "Please select a view type or search for a store"
      }
      subtitle={
        (storeIdSearch.trim().length > 0 && storeIdSearch.trim().length < MIN_SEARCH_CHARS) ||
        (storeNameSearch.trim().length > 0 && storeNameSearch.trim().length < MIN_SEARCH_CHARS)
          ? "Store ID and Store Name searches require at least 2 characters"
          : "Select a view type from the dropdown OR enter a store ID/name to display data"
      }
    />
  )}
  ```

### 10. Update Clear All Button Logic
- Locate the Clear All button (around line 416-427)
- Update the onClick handler and disabled condition:
  ```tsx
  <Button
    variant="ghost"
    size="sm"
    onClick={() => {
      clearViewType()
      setStoreIdSearch("")
      setStoreNameSearch("")
    }}
    disabled={!selectedViewType && !storeIdSearch && !storeNameSearch}
    className="h-10"
  >
    Clear All
  </Button>
  ```

### 11. Update Summary Cards and Table Visibility Conditions
- Locate summary cards condition (around line 331)
- Locate store table condition (around line 568)
- Update both to use new `hasValidSearchCriteria`:
  ```tsx
  {((selectedViewType && selectedViewType !== "all") || hasValidSearchCriteria) && (
    // ... summary cards or table content
  )}
  ```

### 12. Remove Unused Import
- If `VIEW_TYPE_CONFIG` import is no longer used after changes, remove it from imports (line 44)

### 13. Validate Build and Test
- Run `pnpm build` to ensure no TypeScript errors
- Manually test the page at `/inventory-new/stores`:
  - Verify dropdown shows only 5 view types
  - Verify search requires minimum 2 characters
  - Verify Store ID and Store Name are separate fields
  - Verify cross-search works (typing in Store ID finds by name too)
  - Verify empty state message updates correctly

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm build` - Ensure the project compiles without TypeScript errors
- `pnpm lint` - Check for any linting issues

## Notes
- The cross-search logic mirrors the Inventory Supply page implementation where Store ID search also matches storeName and vice versa
- The 5 view types to keep are:
  1. ECOM-TH-CFR-LOCD-STD (CFR - TOL)
  2. ECOM-TH-CFR-LOCD-MKP (CFR - MKP) - **Note: This view type is NOT in current VIEW_TYPE_CONFIG**, may need to be added or confirmed with user
  3. MKP-TH-CFR-LOCD-STD (CFR - QC)
  4. ECOM-TH-DSS-NW-STD (DS - STD)
  5. ECOM-TH-DSS-LOCD-EXP (DS - EXP)
- The debounce delay of 400ms matches the Inventory Supply page for consistency
- Minimum character validation (2 chars) provides better UX and reduces unnecessary filtering operations
