# Chore: Standardize Store Column Header to 'Store Name'

## Metadata
adw_id: `a578b5df`
prompt: `Standardize Store column header to 'Store Name' across all tables. In Stock Card page (app/inventory-new/stores/page.tsx), change table header from 'Store' to 'Store Name'. In Recent Transactions table (src/components/recent-transactions-table.tsx), change 'Store' header to 'Store Name'.`

## Chore Description
This chore standardizes the column header naming convention for store-related columns across the inventory management tables. Currently, some tables use "Store" as the header while the data displayed includes both store names and store IDs. By changing the header to "Store Name", we create better clarity about what information the column contains and maintain consistency across the application's table headers.

This is a UI-only change that affects two specific table headers without modifying any underlying data, state management, sorting logic, or TypeScript types.

## Relevant Files
Use these files to complete the chore:

- **app/inventory-new/stores/page.tsx** (line 628) - Stock Card page table header
  - Contains the TableHead component with "Store" label that needs to be changed to "Store Name"
  - This is the main inventory page showing store performance data

- **src/components/recent-transactions-table.tsx** (line 295) - Recent Transactions table header
  - Contains the TableHead component with "Store" label in the transaction history table
  - This component is used to display stock movement history across different pages

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Update Stock Card Page Table Header
- Open `app/inventory-new/stores/page.tsx`
- Locate line 628 where the TableHead component contains "Store"
- Change the text content from "Store" to "Store Name"
- Verify the change is purely presentational - no impact on sorting logic or click handlers

### 2. Update Recent Transactions Table Header
- Open `src/components/recent-transactions-table.tsx`
- Locate line 295 where the TableHead component contains "Store"
- Change the text content from "Store" to "Store Name"
- Verify the change is purely presentational - no impact on table functionality

### 3. Verify Build Integrity
- Run build command to ensure no TypeScript errors were introduced
- Confirm that only the display labels were changed
- Verify no state variables, sorting logic, or TypeScript types were affected

## Validation Commands
Execute these commands to validate the chore is complete:

- `grep -n "Store Name" app/inventory-new/stores/page.tsx` - Verify "Store Name" appears at line 628
- `grep -n "Store Name" src/components/recent-transactions-table.tsx` - Verify "Store Name" appears at line 295
- `pnpm build` - Confirm the build completes successfully with no TypeScript errors
- `git diff app/inventory-new/stores/page.tsx src/components/recent-transactions-table.tsx` - Review changes to confirm only the header labels were modified

## Notes
This chore is part of the larger UI standardization effort documented in the recent context. Similar to the previous "Product ID" and quantity column standardization tasks, this change improves UI consistency and clarity without affecting any business logic or data processing.

The change aligns with the pattern of using more descriptive column headers (e.g., "Total Qty" instead of "Quantity", "Product ID" instead of "Item ID") to make the interface more intuitive for users.
