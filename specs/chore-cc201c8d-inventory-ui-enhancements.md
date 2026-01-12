# Chore: Inventory UI Enhancements

## Metadata
adw_id: `cc201c8d`
prompt: `Implement Inventory UI adjustments based on user feedback:

  ## 1. Remove 'Warehouse & Location' Column from Inventory Management Page
  - Location: app/inventory/page.tsx
  - Remove the 'Warehouse & Location' column header from the table
  - Remove the corresponding cell data (warehouse code, location badges)
  - Update colspan for empty states if needed
  - Remove the WarehouseLocationCell component usage or related imports if no longer needed

  ## 2. Add 'Brand' Field/Column on Inventory Management Page
  - Location: app/inventory/page.tsx
  - Add 'Brand' as a visible column in the inventory table (not just filter)
  - Display brand name for each product row
  - Position after Product Name or Barcode column
  - Style consistently with other text columns

  ## 3. Add 'Config' Status Field on Inventory Detail Page
  - Location: src/components/inventory-detail-view.tsx
  - Add Stock Config status indicator in the Product Details section (near Item Type and Supply Type)
  - Display green checkmark icon (CheckCircle) when stockConfigStatus === 'valid'
  - Display yellow warning icon (AlertTriangle) when stockConfigStatus === 'invalid'
  - Display gray dash when stockConfigStatus === 'unconfigured' or undefined
  - Add tooltip explaining the config status
  - Use same styling pattern as other detail fields

  ## 4. Enhance Stock by Store Section - Convert to Table View
  - Location: src/components/inventory-detail-view.tsx
  - Current: Card-based layout for stock locations
  - Change to: Full table view for better visibility with many stores
  - Table columns: Store/Warehouse, Location Code, Available, Reserved, Safety Stock, Total, Status
  - Add sorting capability on columns (especially Available and Total)
  - Keep existing filter controls (warehouse filter, search)
  - Ensure responsive design for mobile
  - Add alternating row colors for better readability

  ## Files to Modify
  - app/inventory/page.tsx - Remove Warehouse & Location column, add Brand column
  - src/components/inventory-detail-view.tsx - Add Config field, convert Stock by Store to table

  ## Validation
  1. Run pnpm dev
  2. Navigate to /inventory - verify Warehouse & Location column removed, Brand column visible
  3. Click on a product - verify Config status shows, Stock by Store is table format
  4. Run pnpm build to ensure no TypeScript errors`

## Chore Description

This chore implements UI improvements to the Inventory Management system based on user feedback. The changes focus on four key areas:

1. **Simplify Inventory Table**: Remove the 'Warehouse & Location' column from the main inventory page since this detailed information is better suited for the detail view.

2. **Add Brand Column**: Make brand information more prominent by adding it as a visible column in the main inventory table (currently only available as a filter).

3. **Add Config Status Indicator**: Add a visual indicator for stock configuration status on the detail page to help users quickly identify products with configuration issues.

4. **Improve Stock by Store Display**: Convert the card-based layout to a table format with sorting capabilities for better scalability when viewing many store locations.

These changes improve the user experience by:
- Reducing clutter on the main inventory page
- Making brand information more visible and scannable
- Providing clear visual feedback for configuration status
- Improving readability and sorting capabilities for multi-store inventory

## Relevant Files

Use these files to complete the chore:

- **app/inventory/page.tsx** - Main inventory management page with product table
  - Remove Warehouse & Location column (lines 564-569, 643-645)
  - Add Brand column after Barcode column
  - Update empty state colspan from 10 to 9 (line 612)
  - Remove unused WarehouseLocationCell import if no longer needed (line 40)

- **src/components/inventory-detail-view.tsx** - Product detail view component
  - Add Config Status field in Product Details section (after line 318)
  - Replace Stock by Store card grid (lines 634-704) with table component
  - Import and use StockByStoreTable component

- **src/components/inventory/stock-by-store-table.tsx** - Existing table component for stock locations
  - This component already exists and provides the table functionality needed
  - Needs to be imported and used in inventory-detail-view.tsx
  - May need minor adjustments to include Safety Stock column

- **src/types/inventory.ts** - Type definitions for inventory domain
  - Contains StockConfigStatus type definition (line 52)
  - Contains InventoryItem interface with stockConfigStatus field (line 236)
  - No changes needed - just for reference

### New Files
No new files need to be created. All changes are modifications to existing files.

## Step by Step Tasks

IMPORTANT: Execute every step in order, top to bottom.

### 1. Remove Warehouse & Location Column from Inventory Page
- Open `app/inventory/page.tsx`
- Remove the Warehouse & Location TableHead element (lines 564-569)
- Remove the corresponding TableCell rendering for warehouse locations (lines 643-645)
- Update the empty state colspan from 10 to 9 (line 612)
- Check if WarehouseLocationCell import (line 40) is still used elsewhere in the file
- If not used, remove the WarehouseLocationCell import statement
- Verify the table structure is correct with remaining columns

### 2. Add Brand Column to Inventory Page
- In `app/inventory/page.tsx`, locate the table headers section (around line 544)
- Add a new TableHead for "Brand" after the Barcode column (after line 563)
- Make the column sortable by using the same pattern as other columns
- Add corresponding TableCell in the table body (around line 642)
- Display `item.brand` or a dash "—" if brand is undefined
- Style the brand text consistently with other text columns (use text-sm and text-muted-foreground classes)
- Verify the brand filter dropdown already exists (lines 507-518) - no changes needed there

### 3. Add Config Status Indicator to Detail Page
- Open `src/components/inventory-detail-view.tsx`
- Locate the Product Details Grid section (around line 252)
- Add a new grid item after the Supply Type section (after line 318)
- Import CheckCircle, AlertTriangle, and Minus icons from lucide-react (if not already imported)
- Create a Config Status field with icon and tooltip:
  - Use CheckCircle with green colors when stockConfigStatus === 'valid'
  - Use AlertTriangle with yellow colors when stockConfigStatus === 'invalid'
  - Use Minus with gray colors when stockConfigStatus === 'unconfigured' or undefined
- Add TooltipProvider and Tooltip with explanatory messages for each status
- Match the styling pattern used for Item Type and Supply Type fields
- Ensure the tooltip content explains what each config status means

### 4. Replace Stock by Store Cards with Table View
- In `src/components/inventory-detail-view.tsx`, locate the Stock by Store section (around line 508)
- Import the StockByStoreTable component: `import { StockByStoreTable } from "./inventory/stock-by-store-table"`
- Remove the existing filter controls (lines 519-608) since they're included in the table component
- Remove the card grid layout (lines 612-704)
- Replace with StockByStoreTable component usage:
  ```tsx
  <StockByStoreTable
    locations={item.warehouseLocations}
    itemType={item.itemType}
  />
  ```
- Verify the component receives the correct props
- Check that the existing StockByStoreTable component in `src/components/inventory/stock-by-store-table.tsx` includes Safety Stock column
- If Safety Stock column is missing from StockByStoreTable, add it:
  - Add "Safety Stock" TableHead with sorting capability
  - Add corresponding TableCell displaying `location.stockSafetyStock` using formatStockQuantity
  - Update sort logic to handle "safety" sort field
  - Position between Reserved and Total columns

### 5. Test and Validate Changes
- Run `pnpm dev` to start the development server
- Navigate to `/inventory` page
- Verify Warehouse & Location column is removed from the table
- Verify Brand column is visible and displays brand names
- Verify the table still renders correctly with all remaining columns
- Click on a product to navigate to detail page
- Verify Config Status indicator appears in Product Details section
- Verify Config Status icon and color are correct based on stockConfigStatus value
- Hover over Config Status to verify tooltip displays
- Verify Stock by Store section displays as a table (not cards)
- Verify table has sortable columns: Store/Warehouse, Location Code, Available, Reserved, Safety Stock, Total, Status
- Test sorting on Available and Total columns
- Test search functionality in the table
- Verify responsive design on mobile viewport
- Run `pnpm build` to ensure no TypeScript errors
- Fix any type errors or compilation issues

## Validation Commands

Execute these commands to validate the chore is complete:

- `pnpm dev` - Start development server and manually test UI changes
  - Navigate to `http://localhost:3000/inventory`
  - Verify Warehouse & Location column removed
  - Verify Brand column visible with brand names
  - Click on any product to open detail page
  - Verify Config Status indicator present and styled correctly
  - Verify Stock by Store section is a sortable table
  - Test sorting on Available and Total columns
  - Test search functionality

- `pnpm build` - Build for production to ensure no TypeScript errors
  - Command should complete without errors
  - Pay attention to any type errors related to modified components

- `pnpm lint` - Run ESLint to check for code quality issues
  - Should pass without errors related to the changes

## Notes

### Design Considerations

- The Brand column should be positioned early in the table (after Barcode) for better visibility
- Config Status uses the same icon-based pattern as other status indicators in the app
- Converting cards to table improves scalability - card layout becomes unwieldy with 10+ locations
- The existing StockByStoreTable component already has search and sort functionality built-in
- Safety Stock column may need to be added to StockByStoreTable if not present

### Backwards Compatibility

- InventoryItem type already includes `brand` and `stockConfigStatus` fields (optional)
- No database schema changes required
- Existing mock data should support these fields
- If brand or stockConfigStatus is undefined, UI gracefully handles with fallbacks (dash for brand, gray icon for config)

### Mobile Responsiveness

- Brand column should use `hidden md:table-cell` or similar to hide on mobile if space is constrained
- Config Status should remain visible on all viewports (it's just an icon)
- StockByStoreTable component already handles mobile responsive design with horizontal scrolling

### Performance

- No performance impact expected - same data being rendered, just different layout
- StockByStoreTable component uses useMemo for filtering/sorting optimization
- No additional API calls required

### Future Enhancements

- Consider adding Brand as a quick filter button (like warehouse filter)
- Consider adding bulk actions for products with invalid config status
- Consider adding export functionality for Stock by Store table
- Consider adding visual indicators for default locations in the table
