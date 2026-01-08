# Chore: Reorder Inventory Management Page Filters

## Metadata
adw_id: `fa8c6f51`
prompt: `Reorder the filters on the Inventory Management page (app/inventory/page.tsx) to match the Stock Configuration page (app/stock-config/page.tsx) filter order pattern. Currently on Inventory page, the filter order is: Tabs → Warehouse dropdown → Category dropdown → Item Type dropdown → Search textbox. On Stock Config page, the pattern is: Search/Text filters first → Dropdowns → Tabs LAST. Change the Inventory page filter order to: 1) Search textbox (first, leftmost), 2) Warehouse dropdown, 3) Category dropdown, 4) Item Type dropdown, 5) Tabs (last, rightmost). This means moving the TabsList from the beginning to the END of the filter row, and moving the Search textbox from the end to the BEGINNING. Reference stock-config-table.tsx component for the correct filter ordering pattern.`

## Chore Description
Reorder the filter elements on the Inventory Management page to follow the same pattern as the Stock Configuration page. Currently, the Inventory page places Tabs first and Search textbox last, but the Stock Configuration page uses a more logical pattern: text filters first, dropdowns in the middle, and tabs last. This change will improve UI consistency across the application and provide a better user experience by grouping similar filter types together.

**Current Order (Inventory page):**
1. TabsList (All Products, Low Stock, Out of Stock)
2. Warehouse dropdown
3. Category dropdown
4. Item Type dropdown
5. Search textbox

**Target Order (to match Stock Config page):**
1. Search textbox (first, leftmost)
2. Warehouse dropdown
3. Category dropdown
4. Item Type dropdown
5. TabsList (last, rightmost)

## Relevant Files
Use these files to complete the chore:

- **app/inventory/page.tsx** (lines 408-473) - The main file to modify. Contains the filter row that needs reordering. Currently has TabsList at the beginning and Search textbox at the end.
- **app/stock-config/page.tsx** (lines 704-846, 907-1024) - Reference file showing the correct filter ordering pattern. Has two filter rows: one for stock configs and one for upload history, both following the pattern of search/text filters first, dropdowns in middle, tabs last.
- **src/components/stock-config/stock-config-table.tsx** - Referenced in the prompt but contains only the table component, not the filter layout.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Review Current Filter Structure
- Read the filter row in app/inventory/page.tsx (lines 408-473)
- Identify the exact JSX structure of the current filter arrangement
- Note the classNames and responsive breakpoints used
- Confirm the current order: TabsList → Warehouse → Category → ItemType → Search

### 2. Review Stock Config Filter Pattern
- Examine app/stock-config/page.tsx filter rows (lines 704-846 and 907-1024)
- Understand the target pattern: Search/Text filters → Dropdowns → Tabs
- Note any styling or className differences that should be preserved
- Identify the consistent pattern used for filter ordering

### 3. Reorder Inventory Page Filters
- Open app/inventory/page.tsx for editing
- Move the Search textbox section (lines 462-471) to be the FIRST element in the filters row
- Keep Warehouse, Category, and Item Type dropdowns in their current order (2nd, 3rd, 4th positions)
- Move the TabsList section (lines 411-415) to be the LAST element in the filters row
- Ensure all className properties remain intact
- Preserve all event handlers and state bindings
- Maintain responsive design classes (flex-col, sm:flex-row, gap-3, etc.)

### 4. Verify Code Integrity
- Ensure no syntax errors were introduced
- Confirm all imports are still valid
- Check that all event handlers are properly connected
- Verify responsive design breakpoints are preserved
- Ensure the filter functionality remains unchanged (only visual order changed)

### 5. Test the Changes
- Run `npm run dev` to start the development server
- Navigate to the Inventory Management page (http://localhost:3000/inventory)
- Verify the filter order visually: Search → Warehouse → Category → ItemType → Tabs
- Test each filter to ensure functionality is preserved
- Check responsive behavior on mobile/tablet screen sizes
- Compare with Stock Config page to confirm consistent pattern

## Validation Commands
Execute these commands to validate the chore is complete:

- `npm run build` - Verify the code compiles without errors
- `npm run lint` - Check for ESLint errors or warnings
- Visual inspection at http://localhost:3000/inventory - Confirm filter order matches: Search → Warehouse → Category → ItemType → Tabs
- Visual comparison with http://localhost:3000/stock-config - Verify both pages follow the same filter ordering pattern

## Notes
- This is a UI-only change that improves consistency across the application
- No functional changes to filter logic or data fetching
- Preserve all existing responsive design classes and mobile behavior
- The change improves UX by grouping text filters at the start and tabs at the end, following a logical left-to-right pattern
