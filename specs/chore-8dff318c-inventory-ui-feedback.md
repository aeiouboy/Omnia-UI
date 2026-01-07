# Chore: Inventory Management UI Cleanup

## Metadata
adw_id: `8dff318c`
prompt: `Remove Category column, Price column, Total Inventory Value KPI card, Import button, and Add Product button from the Inventory Management page (app/inventory/page.tsx). Update grid layout from lg:grid-cols-4 to lg:grid-cols-3 for KPI cards. Update colspan in empty state message accordingly.`

## Chore Description
This chore simplifies the Inventory Management page by removing unnecessary UI elements based on user feedback. The changes include:
- Removing the "Category" column from the product table
- Removing the "Price" column from the product table
- Removing the "Total Inventory Value" KPI card
- Removing the "Import" button from the page header
- Removing the "Add Product" button from the page header
- Updating the KPI cards grid layout from 4 columns to 3 columns (lg:grid-cols-4 → lg:grid-cols-3)
- Updating the empty state colspan to match the new table column count

This cleanup reduces visual clutter and focuses the page on essential inventory monitoring features.

## Relevant Files
Use these files to complete the chore:

- **app/inventory/page.tsx** (lines 1-583) - Main inventory page component
  - Contains KPI cards grid (lines 288-337) - Remove 4th card, update grid from lg:grid-cols-4 to lg:grid-cols-3
  - Contains header action buttons (lines 272-285) - Remove Import and Add Product buttons
  - Contains table headers (lines 388-455) - Remove Category column (lines 415-423) and Price column (lines 445-453)
  - Contains table body cells (lines 464-541) - Remove corresponding Category and Price cells
  - Contains empty state message (line 460) - Update colspan from 10 to 8 (removing 2 columns)
  - Contains SortField type definition (line 51) - Remove "category" and "unitPrice" from the type

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Update TypeScript Types
- Remove "category" from the SortField type definition at line 51
- Remove "unitPrice" from the SortField type definition at line 51
- This ensures type safety after removing sortable columns

### 2. Remove Total Inventory Value KPI Card
- Delete the fourth KPI card (lines 325-336) - the "Total Inventory Value" card
- Keep the first three cards: Total Products, Low Stock Items, Out of Stock Items

### 3. Update KPI Cards Grid Layout
- Change the grid CSS class on line 289 from `lg:grid-cols-4` to `lg:grid-cols-3`
- This adjusts the layout for 3 cards instead of 4

### 4. Remove Action Buttons from Header
- Delete the Import button code (lines 273-276) - the `<Upload>` button
- Delete the Add Product button code (lines 281-284) - the `<Plus>` button
- Keep only the Export button in the header actions

### 5. Remove Category Column from Table Header
- Delete the Category TableHead element (lines 415-423)
- This removes the sortable "Category" column header

### 6. Remove Price Column from Table Header
- Delete the Price TableHead element (lines 445-453)
- This removes the sortable "Price" column header

### 7. Remove Category Column from Table Body
- Delete the Category TableCell element (lines 494-496) in the table body map
- This removes the category cell from each product row

### 8. Remove Price Column from Table Body
- Delete the Price TableCell element (lines 535-537) in the table body map
- This removes the price cell from each product row

### 9. Update Empty State Colspan
- Change the colspan value on line 460 from `10` to `8`
- This accounts for removing 2 columns (Category and Price)

### 10. Remove Unused Imports
- Remove `Upload` from the lucide-react imports at line 30 (if no longer used)
- Remove `Plus` from the lucide-react imports at line 32 (if no longer used)
- Keep all other imports as they're still being used

### 11. Remove Unused Handler Functions
- Delete the `handleImport` function (lines 196-199)
- Delete the `handleAddProduct` function (lines 206-209)
- Keep `handleExport` as the Export button remains

### 12. Validate Changes
- Verify the page compiles without TypeScript errors
- Verify the page renders correctly in the browser
- Verify responsive layout works (md:grid-cols-2, lg:grid-cols-3)
- Verify table alignment and spacing looks correct with fewer columns

## Validation Commands
Execute these commands to validate the chore is complete:

- `npm run dev` - Start development server and verify page loads without errors
- Navigate to http://localhost:3000/inventory - Visually verify:
  - Only 3 KPI cards are displayed (Total Products, Low Stock, Out of Stock)
  - Only Export button appears in header (no Import or Add Product buttons)
  - Table has no Category column
  - Table has no Price column
  - Empty state message spans correctly when no results
- `npm run build` - Verify production build compiles without TypeScript errors
- `npm run lint` - Verify no linting errors introduced

## Notes
- The Export button functionality remains (handleExport function at lines 201-204)
- All other table columns remain intact: Image, Warehouse & Location, Product Name, Barcode, Type, Stock Available/Total, Status
- The loading skeleton grid (line 222) should also be updated from lg:grid-cols-4 to lg:grid-cols-3 for consistency
- The colspan reduction (10 → 8) accounts for removing exactly 2 columns
