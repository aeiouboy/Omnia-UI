# Chore: Add View Dropdown Filter to Inventory Management

## Metadata
adw_id: `1af0fd44`
prompt: `Add a 'View' dropdown filter to the inventory management page (app/inventory/page.tsx). The filter should be a combobox/select component placed in the filter row alongside existing filters (All Warehouses, All Categories, All Brands, All Types). The View filter should have the following options: 'All Views' (default), 'ECOM-TH-CFR-LOCD-STD', 'ECOM-TH-DSS-NW-ALL', 'ECOM-TH-DSS-NW-STD', 'ECOM-TH-DSS-LOCD-EXP', 'ECOM-TH-SSP-NW-STD', 'MKP-TH-SSP-NW-STD', 'MKP-TH-CFR-LOCD-STD', 'ECOM-TH-SSP-NW-ALL', 'MKP-TH-CFR-MANUAL-SYNC', 'CMG-ECOM-TH-STD', 'CMG-MKP-SHOPEE-TH-NTW-STD', 'CMG-MKP-LAZADA-TH-LOC-STD', 'CMG-MKP-MIRAKL-TH-NTW-STD'. Add state management for the selected view filter value. The filter should work like other existing filters - when a view is selected, it filters the inventory items. Add a 'view' field to the InventoryItem type in src/types/inventory.ts if not exists, and update mock data in src/lib/mock-inventory-data.ts to include view values for items. Style the combobox consistently with existing filter dropdowns using the same Select/SelectTrigger/SelectContent pattern from shadcn/ui components.`

## Chore Description
Add a new 'View' dropdown filter to the inventory management page alongside existing filters (Warehouses, Categories, Brands, Types). The view filter enables users to filter inventory items by specific view configurations (e.g., ECOM-TH-CFR-LOCD-STD, MKP-TH-SSP-NW-STD). The implementation requires:

1. Adding a 'view' field to the InventoryItem TypeScript type
2. Updating mock inventory data with realistic view values
3. Adding state management for the view filter
4. Creating the UI dropdown component in the filter row
5. Implementing filtering logic that works with existing filter combinations

The view filter should follow the same patterns as existing filters: using Select/SelectTrigger/SelectContent from shadcn/ui, integrating with the current filter state management, resetting pagination on filter change, and working alongside all other existing filters.

## Relevant Files
Use these files to complete the chore:

- **src/types/inventory.ts** (lines 1-456) - Contains InventoryItem type definition and InventoryFilters interface. Need to add optional 'view' field to InventoryItem interface and add 'view' filter parameter to InventoryFilters interface.

- **src/lib/mock-inventory-data.ts** (lines 1-1250) - Contains mock inventory data generation. Need to:
  - Add view constants array (14 view options)
  - Create deterministic function to assign views to products based on productId
  - Update ensureWarehouseLocationsAndNewFields() to include view field
  - Ensure mockInventoryItemsBase items get view values assigned

- **app/inventory/page.tsx** (lines 1-773) - Main inventory page component. Need to:
  - Add viewFilter state (line ~151 after brandFilter)
  - Add view to InventoryFilters useMemo (line ~198)
  - Add handleViewChange handler function (line ~288 after handleBrandChange)
  - Add View Select dropdown in filter row (line ~523 after Item Type Filter, before Tabs)
  - Use same Select/SelectTrigger/SelectContent pattern as existing filters

- **src/lib/inventory-service.ts** - Inventory data fetching service. Need to add view filtering logic in fetchInventoryData function to filter items by view field when filters.view is set.

### New Files
No new files need to be created. All changes are modifications to existing files.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Update TypeScript Type Definitions
- Open `src/types/inventory.ts`
- Add optional `view?: string` field to the `InventoryItem` interface (around line 242, after businessUnit field)
- Add optional `view?: string | "all"` field to the `InventoryFilters` interface (around line 294, after businessUnit field)
- Add TypeScript comment documenting the view field: "/** View configuration (e.g., ECOM-TH-CFR-LOCD-STD, MKP-TH-SSP-NW-STD) */"

### 2. Update Mock Data Generation
- Open `src/lib/mock-inventory-data.ts`
- Add VIEW_OPTIONS constant array after BRANDS constant (around line 44):
  ```typescript
  export const VIEW_OPTIONS = [
    "ECOM-TH-CFR-LOCD-STD",
    "ECOM-TH-DSS-NW-ALL",
    "ECOM-TH-DSS-NW-STD",
    "ECOM-TH-DSS-LOCD-EXP",
    "ECOM-TH-SSP-NW-STD",
    "MKP-TH-SSP-NW-STD",
    "MKP-TH-CFR-LOCD-STD",
    "ECOM-TH-SSP-NW-ALL",
    "MKP-TH-CFR-MANUAL-SYNC",
    "CMG-ECOM-TH-STD",
    "CMG-MKP-SHOPEE-TH-NTW-STD",
    "CMG-MKP-LAZADA-TH-LOC-STD",
    "CMG-MKP-MIRAKL-TH-NTW-STD",
  ] as const
  ```
- Create `getViewForProduct()` helper function (around line 122 after getStockConfigStatus):
  ```typescript
  function getViewForProduct(productId: string, category: ProductCategory): string {
    const seed = productId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    return VIEW_OPTIONS[seed % VIEW_OPTIONS.length]
  }
  ```
- Update `ensureWarehouseLocationsAndNewFields()` function (line 326) to include view field:
  - Add `view: item.view || getViewForProduct(item.productId, item.category)` to the returned object

### 3. Add State Management to Inventory Page
- Open `app/inventory/page.tsx`
- Add viewFilter state after brandFilter state (around line 151):
  ```typescript
  const [viewFilter, setViewFilter] = useState<string>("all")
  ```
- Update the filters useMemo (around line 198) to include view:
  ```typescript
  view: viewFilter,
  ```
- Add handleViewChange handler function after handleBrandChange (around line 288):
  ```typescript
  const handleViewChange = (value: string) => {
    setViewFilter(value)
    setPage(1)
  }
  ```

### 4. Add View Dropdown UI Component
- Open `app/inventory/page.tsx`
- Locate the filter row section (around line 466-543)
- Add the View Select dropdown after the Item Type Filter and before the Tabs (around line 535):
  ```tsx
  {/* View Filter */}
  <Select value={viewFilter} onValueChange={handleViewChange}>
    <SelectTrigger className="w-[180px]">
      <SelectValue placeholder="All Views" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="all">All Views</SelectItem>
      <SelectItem value="ECOM-TH-CFR-LOCD-STD">ECOM-TH-CFR-LOCD-STD</SelectItem>
      <SelectItem value="ECOM-TH-DSS-NW-ALL">ECOM-TH-DSS-NW-ALL</SelectItem>
      <SelectItem value="ECOM-TH-DSS-NW-STD">ECOM-TH-DSS-NW-STD</SelectItem>
      <SelectItem value="ECOM-TH-DSS-LOCD-EXP">ECOM-TH-DSS-LOCD-EXP</SelectItem>
      <SelectItem value="ECOM-TH-SSP-NW-STD">ECOM-TH-SSP-NW-STD</SelectItem>
      <SelectItem value="MKP-TH-SSP-NW-STD">MKP-TH-SSP-NW-STD</SelectItem>
      <SelectItem value="MKP-TH-CFR-LOCD-STD">MKP-TH-CFR-LOCD-STD</SelectItem>
      <SelectItem value="ECOM-TH-SSP-NW-ALL">ECOM-TH-SSP-NW-ALL</SelectItem>
      <SelectItem value="MKP-TH-CFR-MANUAL-SYNC">MKP-TH-CFR-MANUAL-SYNC</SelectItem>
      <SelectItem value="CMG-ECOM-TH-STD">CMG-ECOM-TH-STD</SelectItem>
      <SelectItem value="CMG-MKP-SHOPEE-TH-NTW-STD">CMG-MKP-SHOPEE-TH-NTW-STD</SelectItem>
      <SelectItem value="CMG-MKP-LAZADA-TH-LOC-STD">CMG-MKP-LAZADA-TH-LOC-STD</SelectItem>
      <SelectItem value="CMG-MKP-MIRAKL-TH-NTW-STD">CMG-MKP-MIRAKL-TH-NTW-STD</SelectItem>
    </SelectContent>
  </Select>
  ```

### 5. Implement View Filtering Logic
- Open `src/lib/inventory-service.ts`
- Locate the `fetchInventoryData` function
- Find the filtering logic section where items are filtered by category, warehouse, brand, etc.
- Add view filtering logic:
  ```typescript
  // Apply view filter
  if (filters.view && filters.view !== "all") {
    filtered = filtered.filter(item => item.view === filters.view)
  }
  ```

### 6. Test and Validate Implementation
- Start development server with `pnpm dev`
- Navigate to inventory management page at http://localhost:3000/inventory
- Verify the View dropdown appears in the filter row alongside other filters
- Test selecting different view options and confirm inventory items are filtered correctly
- Test view filter in combination with other filters (warehouse, category, brand, item type)
- Verify pagination resets to page 1 when view filter changes
- Check that "All Views" option shows all items
- Confirm UI styling matches existing filter dropdowns
- Test with browser console open to catch any TypeScript or runtime errors

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm dev` - Start development server and manually test the view filter functionality
- Check browser console at http://localhost:3000/inventory for any errors
- Verify TypeScript compilation: `npx tsc --noEmit`
- Test view filter with different combinations:
  - Select "ECOM-TH-CFR-LOCD-STD" - should show only items with that view
  - Select "All Views" - should show all items
  - Combine view filter with category filter - should show items matching both
  - Combine view filter with warehouse filter - should show items matching both
  - Change view filter - should reset to page 1

## Notes

### View Field Design Decisions
- The view field is optional in InventoryItem to support backwards compatibility
- View values are deterministically generated in mock data based on productId to ensure consistency
- The view field represents different view configurations used in the inventory system (e.g., E-commerce Thailand CFR Local Standard)

### UI/UX Considerations
- The View dropdown is placed after Item Type filter and before Tabs to maintain logical grouping
- Width set to 180px to accommodate longest view option text without truncation
- Dropdown follows same Select pattern as existing filters for consistency
- Filter resets pagination to page 1 like all other filters

### Filter Integration
- View filter works independently and in combination with all existing filters (warehouse, category, brand, item type, status, search)
- Filter logic uses AND operation (items must match ALL selected filters)
- "All Views" option effectively disables the view filter

### Testing Considerations
- Test with all 14 view options to ensure no typos in option values
- Verify deterministic view assignment produces variety across products
- Confirm filter state persists during pagination navigation
- Test filter combination scenarios to ensure proper AND logic
