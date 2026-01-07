# Chore: Fix Recent Transactions Weight Formatting

## Metadata
adw_id: `aae65ebc`
prompt: `Fix Recent Transactions weight formatting: Update generateMockTransactions() function in src/lib/mock-inventory-data.ts to include itemType property when creating transactions. Add 'itemType: item.itemType' to the transaction object (around line 923) so weight-based items display quantities with 3 decimal places (e.g., '-29.000 kg' instead of '-29').`

## Chore Description
The Recent Transactions table displays transaction quantities for weight-based items without proper decimal formatting. Currently, transactions for items with `itemType: "weight"` show quantities as integers (e.g., '-29') instead of formatted weight values with 3 decimal places and units (e.g., '-29.000 kg').

This happens because the `generateMockTransactions()` function in `src/lib/mock-inventory-data.ts` does not include the `itemType` property when creating transaction objects. The `RecentTransactionsTable` component uses this property to determine the correct formatting via the `formatStockQuantity()` utility function.

## Relevant Files
Use these files to complete the chore:

- **src/lib/mock-inventory-data.ts** (line 860-931) - Contains the `generateMockTransactions()` function that needs to be updated to include `itemType` property in transaction objects
- **src/components/recent-transactions-table.tsx** (line 187-194) - Uses `transaction.itemType` to conditionally format quantities, confirming the need for this property
- **src/types/inventory.ts** (line 193-208) - Defines the `StockTransaction` interface which includes optional `itemType?: ItemType` property
- **src/lib/warehouse-utils.ts** - Contains the `formatStockQuantity()` utility function used by the table component to format weight-based quantities with 3 decimals

### New Files
None - this is a simple property addition to existing code

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Update generateMockTransactions Function
- Open `src/lib/mock-inventory-data.ts`
- Locate the `generateMockTransactions()` function (starts around line 860)
- Find the transaction object creation (around line 910-923)
- Add `itemType: item.itemType` property to the transaction object
- Ensure the property is added alongside existing properties like `productId`, `productName`, `type`, etc.

### 2. Verify Type Consistency
- Confirm the `itemType` property matches the `StockTransaction` interface in `src/types/inventory.ts`
- Verify that the property is typed as `ItemType` (which is "weight" | "pack_weight" | "pack" | "normal")
- Ensure TypeScript compilation has no errors related to this change

### 3. Test Formatting Behavior
- Check that weight-based items (itemType: "weight") now display with 3 decimal places (e.g., '-29.000 kg')
- Verify that normal items (itemType: "normal") still display as integers without units
- Confirm the `formatStockQuantity()` function correctly receives the `itemType` property

## Validation Commands
Execute these commands to validate the chore is complete:

- `npm run dev` - Start the development server and verify the Recent Transactions table displays weight-based quantities with proper formatting (3 decimal places + 'kg' unit)
- `npm run build` - Ensure TypeScript compilation succeeds with no errors
- Visual verification: Navigate to a product detail page with `itemType: "weight"` and check that transactions show formatted values like '-29.000 kg' instead of '-29'

## Notes
- The fix is a single-line addition: `itemType: item.itemType,` in the transaction object
- This property already exists in the `StockTransaction` interface as optional (`itemType?: ItemType`)
- The `RecentTransactionsTable` component already has conditional logic to use this property
- Weight-based items in mock data include: Fresh Vegetables Mix, Organic Apples, Fresh Tomatoes, Chicken Breast, Pork Tenderloin, Beef Sirloin, Fresh Salmon Fillet, and Prawns
