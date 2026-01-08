# Chore: Align Inventory Filter Positioning to Match Stock Config Layout

## Metadata
adw_id: `eba3ab02`
prompt: `Align the filter positioning on the Inventory Management page (app/inventory/page.tsx) to match the Stock Configuration page (app/stock-config/page.tsx) layout pattern. Currently, the Inventory page has filters (Tabs, Warehouse dropdown, Category dropdown, Item Type dropdown, Search box) in a separate row above the table header. On Stock Config page, filters are positioned IN the table header row - with title on the left and filters right-aligned on the same row. Specifically: 1) Move the filter row (containing TabsList, warehouse/category/item-type dropdowns, and search box) INTO the table header section where 'All Products' title is displayed. 2) Keep the title 'All Products' and 'Showing X of Y products' on the left side. 3) Position all filters (tabs, dropdowns, search) on the right side of the same row, right-aligned. 4) Use flex justify-between layout like Stock Config page does for its table header. 5) Ensure responsive behavior with flex-wrap for smaller screens. Reference the stock-config-table.tsx component structure for the correct filter placement pattern within the table card header.`

## Chore Description
This chore aims to standardize the filter layout pattern between the Inventory Management page and the Stock Configuration page. Currently, the Inventory page has filters in a separate row above the table, while the Stock Config page positions filters within the table header row itself, creating a cleaner, more compact layout.

The goal is to move all filters (TabsList with All Products/Low Stock/Out of Stock tabs, Warehouse dropdown, Category dropdown, Item Type dropdown, and Search box) from their current separate row into the Card header section where the "All Products" title is displayed. The title and product count will remain on the left, while all filters will be right-aligned on the same row using a flex justify-between layout.

## Relevant Files
Use these files to complete the chore:

- **app/inventory/page.tsx** (lines 391-458) - Contains the current filter layout that needs to be restructured. The Tabs component and filters are currently in a separate section above the Products Table card.

- **app/inventory/page.tsx** (lines 464-478) - Contains the Card header where the title "All Products" is displayed. This is where the filters need to be moved into.

- **app/stock-config/page.tsx** (lines 685-847) - Reference implementation showing the desired layout pattern with filters positioned in the CardHeader alongside the title.

- **src/components/stock-config/stock-config-table.tsx** - Reference component showing a simpler table structure without header filters, for comparison purposes.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Review Reference Layout Pattern
- Read the Stock Config page header structure (lines 692-847 in app/stock-config/page.tsx)
- Identify the flex layout pattern with CardTitle on the left and filters on the right
- Note the responsive breakpoints: flex-col on mobile, flex-row on md screens
- Understand the gap-4 spacing and justify-between alignment

### 2. Restructure Inventory Page Card Header
- Locate the Products Table Card header section (lines 464-478 in app/inventory/page.tsx)
- Change the CardHeader to have `className="flex flex-col gap-4"`
- Add a wrapper div with `className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"`
- Keep the existing CardTitle and CardDescription on the left side
- This will create the two-column layout needed for filters

### 3. Move Tabs Component Into Card Header
- Remove the entire Tabs wrapper section (lines 392-458) that currently wraps the filters
- Keep only the TabsList component (lines 395-399)
- Move TabsList into the right side of the Card header within the new filter area
- The Tabs component value and onValueChange props should remain in the parent component scope

### 4. Move Filter Dropdowns Into Card Header
- Extract the Warehouse Select component (lines 401-412)
- Extract the Category Select component (lines 414-432)
- Extract the Item Type Select component (lines 434-444)
- Group these three Select components together in a container div
- Position them in the right-aligned filter section of the Card header

### 5. Move Search Box Into Card Header
- Extract the Search box component (lines 447-456)
- Position it as the last element in the right-aligned filter section
- Maintain the same Input component structure with Search icon and placeholder text
- Ensure the max-w-sm constraint is preserved for proper sizing

### 6. Create Right-Aligned Filter Container
- Wrap all moved filters (TabsList, 3 Select dropdowns, Search box) in a container div
- Use className="flex flex-col sm:flex-row items-start sm:items-center gap-3"
- This matches the Stock Config page pattern for responsive filter alignment
- The filters will stack vertically on mobile and align horizontally on larger screens

### 7. Remove Old Tabs Wrapper
- Delete the outer Tabs component wrapper that previously contained all filters
- Ensure the TabsContent wrapper is removed since filters are now in the header
- Keep the Tabs component state management (activeTab, handleTabChange) intact
- Verify no orphaned closing tags remain

### 8. Adjust Spacing and Layout
- Update the space-y-6 spacing in the main container if needed
- Ensure the Card component maintains proper spacing with other sections
- Verify the pagination section at the bottom remains unaffected
- Check that the KPI Summary Cards above still have proper gap-4 spacing

### 9. Validate Responsive Behavior
- Test that filters wrap properly on mobile screens using flex-wrap
- Verify filters align horizontally on md breakpoint (768px) and above
- Check that title and filters use justify-between on larger screens
- Ensure TabsList appears before the dropdowns in the filter row

### 10. Final Testing and Cleanup
- Run `pnpm dev` to start the development server
- Navigate to /inventory page and verify the new layout matches Stock Config page pattern
- Test all filter interactions (tabs, dropdowns, search) to ensure functionality is preserved
- Check for any console errors or TypeScript warnings
- Verify responsive behavior on different screen sizes

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm dev` - Start development server and manually test the Inventory page at http://localhost:3000/inventory
- Visual validation: Compare the Inventory page header layout with Stock Config page header layout - they should now follow the same pattern
- `pnpm build` - Ensure the production build compiles without errors
- Functional testing: Test all filters (tabs, warehouse, category, item type, search) to ensure they work correctly after the move
- Responsive testing: Resize browser window to verify flex-wrap behavior on mobile/tablet/desktop breakpoints

## Notes
- This is a pure layout restructuring task - no business logic changes are required
- All filter state management (activeTab, warehouseFilter, categoryFilter, itemTypeFilter, searchQuery) should remain unchanged
- The TabsList component should be moved into the header but the Tabs wrapper may need to remain at a higher level in the component tree to provide context
- Pay attention to the exact className patterns used in Stock Config page for consistency
- The goal is visual and structural alignment - both pages should have filters in the table header row using the same flex layout pattern
