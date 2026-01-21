# Chore: Stock Card By Store View Filter Validation Improvements

## Metadata
adw_id: `af59d821`
prompt: `Stock Card By Store view improvements: 1) Analyze and document the current data display conditions - user must select View Type dropdown OR search Store ID/Store Name (minimum 2 chars) before data loads, 2) Change header text from 'Store Performance' to 'Store' in the table/card section, 3) Ensure filter validation shows orange borders when criteria not met, 4) Verify the fetchStorePerformance API is called only when valid filters are selected. Reference existing By Product view filter validation pattern in app/inventory-new/stores/page.tsx`

## Chore Description

This chore improves the Stock Card "By Store" view's filter validation and user experience by implementing visual feedback patterns consistent with the "By Product" view. The current By Store implementation has the correct filtering logic but lacks visual validation feedback to guide users.

Key improvements:
1. **Document current filter conditions**: View Type OR Store search (2+ chars) required before data loads
2. **Change table header text**: "Store Performance" → "Store" for consistency
3. **Add orange border validation**: Visual feedback when mandatory filter criteria not met
4. **Verify API gating**: Ensure `fetchStorePerformance()` only called with valid filters

The By Product view already implements this validation pattern with orange borders on incomplete mandatory filters (Date Range, Product, Store). We'll apply the same pattern to By Store view.

## Relevant Files

**Main Implementation File:**
- **app/inventory-new/stores/page.tsx** (lines 1-1300)
  - Contains both By Store and By Product view implementations
  - By Store filter logic: lines 628-712
  - By Store table: lines 722-836
  - By Product filter validation (reference pattern): lines 847-970

**Reference Files:**
- **specs/chore-d21244d6-restore-bystore-original-view.md** - Previous restoration spec documenting By Store view requirements
- **specs/wireframe-stock-card-by-product-transaction-view.md** - By Product filter validation pattern (lines 73-105)

**Type Definitions:**
- **src/types/inventory.ts** - `StorePerformance` type definition
- **src/lib/inventory-service.ts** - `fetchStorePerformance()` API function

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Document Current By Store Filter Conditions
Create documentation block in code comments explaining the filter validation logic:
- View Type dropdown selection (value !== "all") **OR** Store search (2+ chars in ID or Name)
- Validation states: `hasViewTypeFilter`, `hasValidStoreIdSearch`, `hasValidStoreNameSearch`, `hasValidSearchCriteria`
- Data loading condition: `hasAllMandatoryFiltersForStore = hasViewTypeFilter || hasValidSearchCriteria`
- Empty state condition: Show empty state when `!hasAllMandatoryFiltersForStore`

Add comment block above the By Store filter section (around line 628):
```typescript
// By Store View Filter Validation:
// - Requires EITHER View Type selected (not "all") OR Store search (2+ chars)
// - View Type filter: selectedViewType && selectedViewType !== "all"
// - Store search: storeIdSearch >= 2 chars OR storeNameSearch >= 2 chars
// - Orange borders shown when filter criteria not met
// - fetchStorePerformance() only called when hasAllMandatoryFiltersForStore = true
```

### 2. Change Table Header Text
Update the CardTitle component in By Store view (line 728):
- **Current**: `<CardTitle className="text-lg">Store Performance</CardTitle>`
- **Change to**: `<CardTitle className="text-lg">Store</CardTitle>`

This aligns with the simplified naming convention and matches the filter label "Store" used in the filter section.

### 3. Add Orange Border Validation to View Type Dropdown
Update the View Type dropdown wrapper (lines 631-655) to show orange border when filter criteria not met:

**Current structure:**
```tsx
<Select
  value={selectedViewType || "all"}
  onValueChange={(v) => { ... }}
>
  <SelectTrigger className="w-[280px] h-10">
```

**Add validation class:**
```tsx
<div className={`${
  !hasAllMandatoryFiltersForStore ? "border border-orange-400 ring-1 ring-orange-400 rounded-md" : ""
}`}>
  <Select
    value={selectedViewType || "all"}
    onValueChange={(v) => { ... }}
  >
    <SelectTrigger className="w-[280px] h-10">
```

### 4. Add Orange Border Validation to Store Search Group
Update the Store Search Group container (lines 660-685) to show orange border when:
- No View Type selected AND
- Both Store ID and Store Name searches have < 2 characters

**Current structure:**
```tsx
<div className="flex items-center gap-2 p-2 border border-border/40 rounded-md bg-muted/5">
  <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">Store</span>
```

**Add validation class:**
```tsx
<div className={`flex items-center gap-2 p-2 border rounded-md bg-muted/5 ${
  !hasAllMandatoryFiltersForStore ? "border-orange-400 ring-1 ring-orange-400" : "border-border/40"
}`}>
  <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">Store</span>
```

### 5. Update Empty State Message
Enhance the empty state (lines 715-720) to provide clearer guidance about filter requirements:

**Current:**
```tsx
<InventoryEmptyState
  message="Select a view type or search for a store to display data"
  subtitle="Store ID and Store Name searches require at least 2 characters"
/>
```

**Update to:**
```tsx
<InventoryEmptyState
  message="Select a View Type or search for a store to display data"
  subtitle="Store ID and Store Name searches require at least 2 characters. Orange borders indicate incomplete filters."
/>
```

### 6. Verify API Gating Logic
Review and confirm the `loadData` function (lines 330-366) has correct gating:

**Key validation points:**
- Line 332: Check `!hasAllMandatoryFiltersForStore` returns early
- Line 347-355: Filters object only built when validation passes
- Line 357: `fetchStorePerformance(filters)` only called after validation
- Lines 406-410: `useEffect` only calls `loadData()` when `hasAllMandatoryFiltersForStore` is true

Add assertion comment at line 332:
```typescript
// Guard: Only proceed if View Type OR Store search criteria met
if (!hasAllMandatoryFiltersForStore) {
```

### 7. Add Visual Consistency Documentation
Create a documentation comment at the top of the By Store filter section explaining the visual validation pattern matches By Product:

```typescript
// FILTER VALIDATION PATTERN:
// Orange borders indicate mandatory filters that need completion.
// This pattern matches the By Product view for UI consistency.
// - View Type dropdown: Shows orange border when criteria not met
// - Store Search Group: Shows orange border when criteria not met
// - Pattern reference: By Product view lines 847-970
```

### 8. Test Filter Validation States
Create test scenarios documentation in code comments:

```typescript
// VALIDATION TEST SCENARIOS:
// 1. Initial load: Both filters show orange borders, empty state visible
// 2. Select View Type: Orange borders removed, data loads
// 3. Clear View Type: Orange borders return if Store search empty
// 4. Type 1 char in Store ID: Orange borders remain (< 2 chars)
// 5. Type 2+ chars in Store ID: Orange borders removed, data loads
// 6. Clear Store search with View Type selected: Data still shows (View Type sufficient)
```

### 9. Verify Clear All Button Behavior
Confirm Clear All button (lines 691-699) resets filters correctly:
- Calls `clearViewType()` to reset View Type to "all"
- Resets `storeIdSearch` and `storeNameSearch` to empty strings
- Resets `storeData` to empty array
- Results in orange borders reappearing due to `!hasAllMandatoryFiltersForStore`

### 10. Update Refresh Button State
Verify Refresh button (lines 702-712) disables correctly:
- Line 706: `disabled={loading || !hasAllMandatoryFiltersForStore}`
- Ensures user can't refresh without valid filter criteria
- Consistent with By Product view pattern (line 1010)

### 11. Cross-Reference By Product Pattern
Document the By Product filter validation pattern used as reference:

**By Product validation examples (for reference):**
- Date Range (lines 847-905): Orange border when `!hasValidDateRange`
- Product Search (lines 911-937): Orange border when `!hasValidProductCriteria`
- Store Search (lines 943-969): Orange border when `!hasValidByProductStoreCriteria`

Add reference comment in By Store section:
```typescript
// Visual validation pattern matches By Product view:
// - Date Range filter: lines 847-905
// - Product search filter: lines 911-937
// - Store search filter: lines 943-969
```

## Validation Commands

Execute these commands to validate the chore is complete:

### Build Validation
```bash
pnpm build
```
- Verify TypeScript compilation succeeds with no errors
- Confirm no type errors in validation logic

### Lint Validation
```bash
pnpm lint
```
- Verify no ESLint errors
- Confirm code style consistency

### Manual Testing - Initial State
1. Navigate to Stock Card page (`/inventory-new/stores`)
2. Switch to "By Store" tab
3. **Verify**: View Type dropdown shows orange border
4. **Verify**: Store Search Group shows orange border
5. **Verify**: Empty state message visible with updated text
6. **Verify**: Refresh button is disabled
7. **Verify**: Table header says "Store" (not "Store Performance")

### Manual Testing - View Type Filtering
1. Click View Type dropdown
2. Select "ECOM-TH-CFR-LOCD-STD"
3. **Verify**: Orange borders disappear from both filters
4. **Verify**: Store data table loads and displays
5. **Verify**: Table header says "Store"
6. **Verify**: Refresh button becomes enabled
7. Click "Clear All" button
8. **Verify**: Orange borders reappear on both filters
9. **Verify**: Table clears and empty state shows

### Manual Testing - Store Search Filtering
1. Clear all filters (View Type = "All View Types")
2. **Verify**: Orange borders visible on both filters
3. Type "to" in Store ID search (2 characters)
4. **Verify**: Orange borders disappear immediately
5. **Verify**: Store data table loads and displays stores matching "to"
6. Clear Store ID search
7. **Verify**: Orange borders reappear
8. Type "T" in Store Name search (1 character)
9. **Verify**: Orange borders remain (< 2 chars)
10. Add "o" to make "To" (2 characters)
11. **Verify**: Orange borders disappear
12. **Verify**: Store data table loads

### Manual Testing - Combined Filtering
1. Select View Type "ECOM-TH-CFR-LOCD-MKP"
2. **Verify**: Orange borders removed, data loads
3. Type "ce" in Store Name search (2 characters)
4. **Verify**: Data filters to show only matching stores
5. Clear View Type (set to "All View Types")
6. **Verify**: Orange borders do NOT appear (Store search still has 2+ chars)
7. **Verify**: Data continues to show (Store search criteria sufficient)
8. Clear Store Name search
9. **Verify**: Orange borders reappear
10. **Verify**: Empty state shows

### Visual Consistency Check
1. Switch between "By Product" and "By Store" tabs
2. **Verify**: Orange border styling matches exactly between views
3. **Verify**: Border color, ring thickness, and rounding consistent
4. **Verify**: Empty state messages follow same pattern
5. **Verify**: Filter group borders match (border-border/40 vs border-orange-400)

## Notes

### Visual Validation Pattern
The orange border validation pattern uses:
```css
border-orange-400 ring-1 ring-orange-400
```

This creates:
- Border color: `#fb923c` (Tailwind orange-400)
- Ring width: 1px
- Applied when: `!hasAllMandatoryFiltersForStore`
- Removed when: Valid filter criteria met

### Filter Logic Summary
```typescript
// By Store view requires EITHER:
hasViewTypeFilter = selectedViewType && selectedViewType !== "all"
// OR:
hasValidSearchCriteria = (storeIdSearch.length >= 2) || (storeNameSearch.length >= 2)

// Combined validation:
hasAllMandatoryFiltersForStore = hasViewTypeFilter || hasValidSearchCriteria
```

### Comparison with By Product View
| Aspect | By Product | By Store |
|--------|-----------|----------|
| Mandatory Filters | Date Range + Product + Store | View Type OR Store |
| Orange Border Logic | 3 separate groups | 2 groups (can be satisfied by 1) |
| Empty State | Package icon | Same pattern |
| API Gating | `hasAllMandatoryFiltersForProduct` | `hasAllMandatoryFiltersForStore` |
| Data Loading | `loadProductTransactions()` | `loadData()` with `fetchStorePerformance()` |

### Implementation Reference
- Previous restoration chore: `chore-d21244d6-restore-bystore-original-view.md`
- Wireframe spec: `wireframe-stock-card-by-product-transaction-view.md`
- Implementation file: `app/inventory-new/stores/page.tsx`
- Current By Store section: lines 625-837
- Reference By Product section: lines 840-1296

### No Breaking Changes
This chore only adds visual feedback and updates one header text:
- No logic changes to filter validation
- No changes to API calls or data loading
- No changes to By Product view
- No changes to routing or navigation
- Purely additive improvements to UX
