# Chore: Redesign Stock Card Page Filtering with Mandatory Product Filters

## Metadata
adw_id: `ccc86b56`
prompt: `Adjust filtering on the Stock Card page (app/inventory-new/stores/page.tsx) with the following changes: 1. REMOVE: View Type dropdown filter completely 2. ADD NEW FILTERS: Product ID text input field, Product Name text input field 3. MANDATORY FILTER CONDITION: User MUST select Date range (From/To dates) AND (Store ID OR Store Name) AND (Product ID OR Product Name). Show orange border visual feedback on unselected mandatory fields. Disable the search/fetch button until all mandatory conditions are met. Show empty state message explaining required filters when conditions not met. 4. UI REQUIREMENTS: Maintain existing filter layout style consistency, use min-w-[160px] for new input fields per UI standards, keep Clear All button with hover:bg-gray-100 styling.`

## Chore Description
This chore redesigns the Stock Card page filtering system to remove the View Type dropdown and introduce Product-based filtering with mandatory filter conditions. The changes enforce a strict filter combination requirement before any data is fetched:

**Key Changes:**
1. **Remove View Type Filter**: Completely remove the View Type dropdown selector and its associated state (`STOCK_CARD_VIEW_TYPES`, `selectedViewType`, `hasViewTypeFilter`, and related context usage)

2. **Add Product Filters**: Add two new text input fields:
   - Product ID (text input with search icon)
   - Product Name (text input with search icon)

3. **Mandatory Filter Logic**: Implement strict validation requiring ALL three conditions:
   - Date range (From AND To dates must be selected)
   - Store identifier (Store ID OR Store Name with minimum 2 characters)
   - Product identifier (Product ID OR Product Name with minimum 2 characters)

4. **Visual Feedback System**:
   - Orange border (`border-orange-400 ring-1 ring-orange-400`) on ANY unselected mandatory filter group
   - Date pickers show orange when date range is incomplete
   - Store inputs group shows orange when neither has valid input (min 2 chars)
   - Product inputs group shows orange when neither has valid input (min 2 chars)

5. **Search Button Control**: Disable the Refresh/Search button until all mandatory conditions are satisfied

6. **Empty State Messaging**: Update the InventoryEmptyState component usage to display appropriate messaging explaining the required filter combination

## Relevant Files
Use these files to complete the chore:

- **app/inventory-new/stores/page.tsx** - The Stock Card page component. Primary file to modify:
  - Remove `STOCK_CARD_VIEW_TYPES` constant (lines 53-59)
  - Remove `selectedViewType`, `setViewType`, `clearViewType` from `useInventoryView` destructuring (lines 88-95)
  - Remove `hasViewTypeFilter` derived state (line 134)
  - Add new state variables for Product ID and Product Name search
  - Add new derived validation states for product search
  - Update `loadData` function to use new mandatory conditions
  - Update filter JSX to remove View Type and add Product filters
  - Update Clear All button to clear new product filters
  - Update empty state conditions and messaging

- **src/components/inventory/inventory-empty-state.tsx** - Empty state component (no changes needed, already supports custom message/subtitle props)

- **CLAUDE.md** - UI standards reference:
  - `min-w-[160px]` for input fields
  - `hover:bg-gray-100` for Clear All button
  - Orange border pattern: `border-orange-400 ring-1 ring-orange-400`

### New Files
No new files needed - this is a modification to the existing Stock Card page.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Remove View Type Related Code
- Delete the `STOCK_CARD_VIEW_TYPES` constant array (lines 53-59)
- Remove `selectedViewType`, `setViewType`, `clearViewType`, `isContextLoading` from `useInventoryView()` destructuring (lines 88-95). Keep only `channels: viewChannels` and `businessUnit: viewBusinessUnit` if needed for API filters
- Remove the `hasViewTypeFilter` derived state variable (line 134: `const hasViewTypeFilter = selectedViewType && selectedViewType !== "all"`)
- Remove the `handleViewChange` function (lines 261-267)
- Remove the `handleClearViewType` function (lines 269-271)

### 2. Add Product Search State Variables
- Add new state for Product ID search after the existing Store Name search state (around line 108):
  ```typescript
  const [productIdSearch, setProductIdSearch] = useState("")
  const [productNameSearch, setProductNameSearch] = useState("")
  ```

### 3. Add Product Validation Derived States
- Add validation states for product search inputs (after existing store validation around line 128):
  ```typescript
  // Product search validation (minimum 2 characters)
  const hasValidProductIdSearch = productIdSearch.trim().length >= MIN_SEARCH_CHARS
  const hasValidProductNameSearch = productNameSearch.trim().length >= MIN_SEARCH_CHARS
  const hasValidProductCriteria = hasValidProductIdSearch || hasValidProductNameSearch
  ```

### 4. Update Mandatory Filter Validation Logic
- Create a new derived state for the complete mandatory filter check:
  ```typescript
  // All mandatory filters must be satisfied
  const hasAllMandatoryFilters = hasValidDateRange && hasValidSearchCriteria && hasValidProductCriteria
  ```
- This replaces the previous `hasViewTypeFilter && hasValidDateRange` check

### 5. Update loadData Function
- Modify the early return condition (line 139) from checking `hasViewTypeFilter` to checking new mandatory conditions:
  ```typescript
  if (!hasAllMandatoryFilters) {
    if (!isContextLoading) {
      setLoading(false)
      setStoreData([])
    }
    return
  }
  ```
- Remove `view: selectedViewType || undefined` from the filters object (line 157)
- Add product filter parameters to the filters object if needed for API

### 6. Update useEffect Dependencies
- Update the useEffect dependency array (line 186) to include new product search states:
  ```typescript
  }, [storeIdSearch, storeNameSearch, productIdSearch, productNameSearch, isContextLoading, hasAllMandatoryFilters, dateRange])
  ```
- Remove `selectedViewType` from dependencies

### 7. Remove View Type Filter JSX
- Delete the entire View Type Select component block (lines 425-441):
  ```typescript
  {/* View Type Filter - Primary Filter */}
  <Select value={selectedViewType || "all"} onValueChange={handleViewChange}>
    ...
  </Select>
  ```

### 8. Add Product Search Filter Group
- After the Store Search Group (ending around line 549), add a new Product Search Group:
  ```typescript
  {/* Vertical Divider */}
  <div className="h-8 w-px bg-border" />

  {/* Product Search Group */}
  <div className={`flex items-center gap-2 p-2 border border-border/40 rounded-md bg-muted/5 ${
    !hasValidProductCriteria ? "border-orange-400 ring-1 ring-orange-400" : ""
  }`}>
    <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">Product</span>

    {/* Product ID Search */}
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder="Search Product ID..."
        value={productIdSearch}
        onChange={(e) => setProductIdSearch(e.target.value)}
        className="pl-9 min-w-[160px] h-10"
      />
    </div>

    {/* Product Name Search */}
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder="Search Product Name..."
        value={productNameSearch}
        onChange={(e) => setProductNameSearch(e.target.value)}
        className="pl-9 min-w-[160px] h-10"
      />
    </div>
  </div>
  ```

### 9. Update Store Search Group Orange Border
- Modify the Store Search Group container (line 523) to show orange border when store criteria not met:
  ```typescript
  <div className={`flex items-center gap-2 p-2 border border-border/40 rounded-md bg-muted/5 ${
    !hasValidSearchCriteria ? "border-orange-400 ring-1 ring-orange-400" : ""
  }`}>
  ```
- Remove the opacity/pointer-events disabled styles that were dependent on view type and date

### 10. Update Date Picker Orange Border Logic
- Update "From" date picker (line 452) to use independent validation:
  ```typescript
  className={`w-[130px] h-10 justify-start text-left font-normal ${
    !hasValidDateRange ? "border-orange-400 ring-1 ring-orange-400" : ""
  }`}
  ```
- Update "To" date picker (line 482) with same pattern

### 11. Update Refresh Button Disabled State
- Modify the Refresh button (lines 368-377) to be disabled when mandatory filters are not met:
  ```typescript
  <Button
    variant="outline"
    size="sm"
    onClick={() => loadData(false)}
    disabled={refreshing || !hasAllMandatoryFilters}
  >
  ```

### 12. Update Clear All Button
- Update the Clear All onClick handler to clear product search fields:
  ```typescript
  onClick={() => {
    setStoreIdSearch("")
    setStoreNameSearch("")
    setProductIdSearch("")
    setProductNameSearch("")
    setDateRange({ startDate: undefined, endDate: undefined })
  }}
  ```
- Update the disabled condition to include product search:
  ```typescript
  disabled={!storeIdSearch && !storeNameSearch && !productIdSearch && !productNameSearch && !dateRange.startDate && !dateRange.endDate}
  ```
- Remove `clearViewType()` from the handler

### 13. Update Empty State Condition and Message
- Update the empty state condition (line 702) to use new mandatory filter check:
  ```typescript
  {!hasAllMandatoryFilters && (
    <InventoryEmptyState
      message="Please complete all required filters to view stock card data"
      subtitle="Required: Date range (From/To) AND (Store ID or Store Name) AND (Product ID or Product Name)"
    />
  )}
  ```

### 14. Update Table Display Condition
- Update the table card condition (line 710) to use new mandatory filter check:
  ```typescript
  {hasAllMandatoryFilters && (
    <Card>
      ...
    </Card>
  )}
  ```

### 15. Clean Up Unused Imports and Context
- Review imports at the top of the file and remove any unused ones related to View Type
- Clean up any remaining references to removed view type functionality

### 16. Validate Build and Test
- Run `pnpm build` to ensure no TypeScript errors
- Run `pnpm lint` to check for linting issues
- Manually test the page in development mode

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm build` - Ensure the project builds without TypeScript errors
- `pnpm lint` - Ensure no linting errors are introduced
- `pnpm dev` - Start development server and manually verify:
  1. Navigate to `/inventory-new/stores`
  2. **Initial Load**: Verify empty state shows with message about required filters
  3. **Orange Borders**: Verify Date pickers, Store group, AND Product group all show orange borders initially
  4. **Partial Selection - Dates Only**: Select date range, verify dates lose orange but Store and Product groups retain orange
  5. **Partial Selection - Dates + Store**: Enter 2+ chars in Store ID, verify Store group loses orange but Product group retains
  6. **Complete Selection**: Enter 2+ chars in Product ID, verify ALL orange borders disappear
  7. **Refresh Button**: Verify button is disabled until all mandatory filters complete
  8. **Data Loading**: Confirm data only loads when all mandatory conditions are met
  9. **Clear All**: Click Clear All, verify all fields reset and orange borders reappear
  10. **No View Type**: Confirm View Type dropdown is completely removed from UI

## Notes
- The minimum character requirement (`MIN_SEARCH_CHARS = 2`) is already defined and used for store search validation
- The orange border styling pattern (`border-orange-400 ring-1 ring-orange-400`) is consistent with existing CLAUDE.md UI standards
- Store and Product groups each have their own orange border that wraps the entire group, not individual inputs
- The filter groups use `flex items-center gap-2 p-2 border border-border/40 rounded-md bg-muted/5` styling pattern for consistency
- Date pickers maintain individual orange borders since they're separate buttons
- The API integration may need adjustment if View Type was required for the backend - consult `lib/inventory-service.ts` if API changes needed
- Product filters are for client-side filtering initially; API integration can be enhanced later if needed
