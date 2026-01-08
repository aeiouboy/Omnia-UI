# Chore: Reorder Inventory Filters and Table Columns

## Metadata
adw_id: `61fd67a4`
prompt: `Fix two layout issues on the Inventory Management page (app/inventory/page.tsx): 1) FILTER ORDER: The current filter order is TabsList, Warehouse Select, Category Select, Item Type Select, Search textbox. Change to match Stock Configuration page pattern where tabs come LAST. The correct order should be: Search textbox (first/leftmost), Warehouse Select, Category Select, Item Type Select, TabsList (last/rightmost). Physically reorder the JSX elements in the filter container div. 2) TABLE COLUMN ORDER: Move the 'Warehouse & Location' column to appear AFTER the 'Barcode' column. Current column order is: Image, Warehouse & Location, Product Name, Barcode, Item Type, Stock, Status. New column order should be: Image, Product Name, Barcode, Warehouse & Location, Item Type, Stock, Status. This requires reordering both the TableHead elements in the header row AND the corresponding TableCell elements in each data row.`

## Chore Description
This chore fixes two UI consistency and layout issues on the Inventory Management page:

1. **Filter Order Alignment**: Currently, the Inventory page has filters in the order: TabsList → Warehouse → Category → Item Type → Search. The Stock Configuration page has a more logical pattern with Search first and Tabs last. This chore reorders the Inventory filters to match: Search → Warehouse → Category → Item Type → TabsList.

2. **Table Column Reordering**: The 'Warehouse & Location' column is currently positioned too early (second column). Moving it after the 'Barcode' column creates a more logical flow: Image → Product Name → Barcode → Warehouse & Location → Item Type → Stock → Status.

Both changes improve UI consistency across pages and create a more intuitive user experience.

## Relevant Files
Use these files to complete the chore:

- **app/inventory/page.tsx** (lines 408-472) - Contains the filter row with Search, Warehouse, Category, Item Type filters and TabsList that need reordering
- **app/inventory/page.tsx** (lines 477-526) - Contains the TableHeader with TableHead elements that need reordering
- **app/inventory/page.tsx** (lines 536-607) - Contains the TableBody with TableCell elements in each row that need reordering to match the header

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Read Current Implementation
- Read app/inventory/page.tsx to understand the current filter and table structure
- Identify the exact filter order in the JSX (currently around lines 408-472)
- Identify the table header structure (currently around lines 477-526)
- Identify the table body row structure (currently around lines 536-607)

### 2. Reorder Filter Elements
- Locate the filter container div (around line 409: `<div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">`)
- Physically reorder the JSX child elements to match this sequence:
  1. Search textbox (currently lines 410-419)
  2. Warehouse Select (currently lines 421-432)
  3. Category Select (currently lines 434-452)
  4. Item Type Select (currently lines 454-464)
  5. TabsList (currently lines 466-471)
- Ensure proper indentation and spacing is maintained

### 3. Reorder Table Header Columns
- Locate the TableHeader section (around lines 477-526)
- Reorder the TableHead elements to match this sequence:
  1. Image (line 479)
  2. Product Name (lines 486-493)
  3. Barcode (lines 494-502)
  4. Warehouse & Location (lines 480-485) - move this from position 2 to position 4
  5. Item Type (lines 504-506)
  6. Stock Available / Total (lines 507-515)
  7. Status (lines 516-524)
  8. Empty column for chevron (line 525)

### 4. Reorder Table Body Columns
- Locate the TableBody mapping section (around lines 536-607)
- Reorder the TableCell elements within each row to match the header:
  1. Image (lines 542-555)
  2. Product Name (lines 559-561)
  3. Barcode (lines 562-564)
  4. Warehouse & Location (lines 556-558) - move this from position 2 to position 4
  5. Item Type (lines 565-583)
  6. Stock Available / Total (lines 584-594)
  7. Status (lines 595-602)
  8. Chevron icon (lines 603-605)

### 5. Validate Changes
- Verify that the filter order matches the Stock Configuration page pattern
- Verify that table header and body columns are in the same order
- Ensure no JSX elements were accidentally removed or duplicated
- Confirm proper className and styling attributes are preserved

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm run build` - Verify the TypeScript code compiles without errors
- `pnpm run lint` - Check for any ESLint violations
- Manual visual check: Navigate to http://localhost:3000/inventory and verify:
  1. Filter order is: Search → Warehouse → Category → Item Type → Tabs
  2. Table column order is: Image → Product Name → Barcode → Warehouse & Location → Item Type → Stock → Status
  3. All filters and columns are properly aligned and functional

## Notes
- This is purely a UI reordering task - no logic changes required
- All filter handlers and event listeners remain unchanged
- All column content and styling remain unchanged
- Only the physical JSX element order is being modified for better UX consistency
