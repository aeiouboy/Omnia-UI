# Chore: Remove Store Column from Inventory Management Table

## Metadata
adw_id: `7c614d89`
prompt: `Remove the Store column from the Inventory Management page table at app/inventory/page.tsx. The inventory is master data that can be sold at multiple stores, so having a single store field is not valid for the requirement. Specifically: 1) Remove the Store table header column (lines 411-416 with Store icon), 2) Remove the Store table cell that displays item.storeName (lines 493-497), 3) Keep the 'Stock by Store' button and store filter functionality as those are for viewing inventory BY store - they are separate features. 4) Update the colSpan for the empty row from 9 to 8. 5) Also check src/types/inventory.ts and src/lib/inventory-service.ts to see if storeName field should be removed from the InventoryItem type since it's no longer displayed in the main table (but keep it if it's used elsewhere for filtering).`

## Chore Description
The inventory management page currently displays a Store column showing individual store names for each inventory item. However, this is conceptually incorrect because inventory items are master data that can be sold across multiple stores. A single storeName field creates confusion about the nature of the data.

The task is to:
- Remove the Store column header from the table
- Remove the Store data cell that displays item.storeName
- Update the empty state row's colSpan from 9 to 8 to match the new column count
- Preserve the "Stock by Store" button and store filtering functionality (these are separate features for viewing inventory BY store)
- Review the data types and service layer to determine if storeName should be removed from the InventoryItem interface

This change improves the conceptual clarity of the inventory management system while maintaining the ability to filter and view inventory by store through the dedicated store filter feature.

## Relevant Files
Use these files to complete the chore:

- **`app/inventory/page.tsx`** - Main file to modify. Contains the inventory table with the Store column header (lines 411-416) and Store data cell (lines 493-497). Also contains the empty state row with colSpan={9} that needs updating to colSpan={8} (line 468).

- **`src/types/inventory.ts`** - Type definitions for inventory domain. Contains the InventoryItem interface with storeName field (line 151). Need to review if this field is used elsewhere for filtering or if it should be removed entirely.

- **`src/lib/inventory-service.ts`** - Service layer for inventory data fetching. Contains filtering logic that uses storeName (lines 98-100). Need to assess if the filtering functionality depends on this field and how it relates to the "Stock by Store" feature.

- **`src/lib/mock-inventory-data.ts`** - May contain mock data using storeName. Should verify if mock data generation depends on this field.

### New Files
None - only modifying existing files.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Analyze Current Implementation
- Read `app/inventory/page.tsx` to understand the table structure and column count
- Identify the Store column header (lines 411-416)
- Identify the Store data cell (lines 493-497)
- Locate the empty state row with colSpan (line 468)
- Verify the current column count is 9

### 2. Review Data Type Dependencies
- Read `src/types/inventory.ts` to understand InventoryItem interface
- Check if storeName is used in InventoryFilters interface (line 240)
- Determine if storeName is essential for store filtering functionality
- Read `src/lib/inventory-service.ts` to see how storeName is used in filtering (lines 98-100)
- Understand the relationship between storeName field and "Stock by Store" feature

### 3. Remove Store Column Header
- Locate the TableHead for Store column in `app/inventory/page.tsx` (lines 411-416)
- Remove the entire TableHead element including:
  - The opening and closing tags
  - The div wrapper with flex layout
  - The Store icon
  - The "Store" text
- Verify the surrounding TableHead elements remain intact

### 4. Remove Store Data Cell
- Locate the TableCell that displays item.storeName (lines 493-497)
- Remove the entire TableCell element including:
  - The opening and closing tags with className
  - The inner div with text styling
  - The storeName display logic
- Ensure the TableRow structure remains valid

### 5. Update Empty State Row
- Locate the empty state row in the TableBody (line 468)
- Update the colSpan value from `9` to `8` to match the new column count
- Verify the empty state message displays correctly across all columns

### 6. Assess storeName Field Removal
- Based on analysis from step 2, determine if storeName should be removed from InventoryItem type
- If storeName is ONLY used for the removed column and not for filtering:
  - Remove storeName from InventoryItem interface in `src/types/inventory.ts`
  - Remove storeName from InventoryItemDB interface if present
  - Remove storeName references from service layer
- If storeName is used for store filtering (likely for the "Stock by Store" feature):
  - KEEP storeName in the type definitions
  - KEEP storeName in the service layer filtering logic
  - Only remove the visual display of the column
- Document the decision in code comments if needed

### 7. Verify Functionality Preservation
- Ensure the "Stock by Store" button functionality is preserved (lines 316-320)
- Verify the store filter badge display works correctly (lines 297-307)
- Confirm the activeStoreFilter state and URL parameter handling remain functional (lines 115-128)
- Check that filtering by store still works through the InventoryFilters interface

### 8. Test Table Layout
- Start the development server with `npm run dev`
- Navigate to `/inventory` page
- Verify the table displays 8 columns instead of 9
- Confirm all remaining columns are properly aligned
- Test the "Stock by Store" button navigation
- Verify store filtering still works when accessing via `/inventory?store=Tops%20Central%20World`
- Check responsive behavior on different screen sizes

## Validation Commands
Execute these commands to validate the chore is complete:

- `npm run dev` - Start development server and verify table displays correctly
- Visual inspection at `/inventory`:
  - Table should have 8 columns (no Store column)
  - Columns: Image, Warehouse & Location, Product Name, Barcode, Item Type, Stock Available/Total, Status, chevron
  - Empty state row should span all 8 columns
  - No visual gaps or misalignment
- Functional testing:
  - Click "Stock by Store" button → should navigate to store overview
  - Access `/inventory?store=Tops%20Central%20World` → should show store-filtered inventory
  - Store filter badge should display correctly when filtering by store
  - Search and sorting should work correctly
- `npm run build` - Ensure no TypeScript errors
- Code review:
  - Verify storeName field handling is consistent across types and service layer
  - Confirm no references to removed Store column remain in comments or code

## Notes
- The Store column is being removed from the visual display, but the storeName field may still be needed in the data model for filtering purposes
- The "Stock by Store" feature is a separate concept from displaying store in the table - it allows users to filter the inventory view by a specific store
- The store filter functionality works through URL parameters and should continue to function after this change
- If storeName is removed from the type definitions, ensure mock data generation is updated accordingly
- The decision to keep or remove storeName from the data model should be based on whether it's actively used for filtering, not just display
- The inventory concept is "master data that can be sold at multiple stores" - the storeName field in the current implementation may represent "default/primary store" or may be an artifact from earlier design iterations
