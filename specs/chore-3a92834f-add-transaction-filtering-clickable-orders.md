# Chore: Add Filtering and Clickable Order IDs to Recent Transactions Table

## Metadata
adw_id: `3a92834f`
prompt: `Add filtering and clickable order IDs to Recent Transactions table: 1) Remove 'spoilage' from TransactionType in src/types/inventory.ts (keep only: stock_in, stock_out, adjustment, return). 2) Remove spoilage handling from src/components/recent-transactions-table.tsx and src/lib/mock-inventory-data.ts. 3) Add filter dropdown with 4 options: 'All Transactions' (default), 'Sold Items' (stock_out with referenceId), 'Stock Movement' (stock_in, adjustment), 'Return/Cancelled' (return). 4) Make Order IDs in Notes column clickable as Link to /orders/[orderId] - extract numeric ID from ORD-{number} format for stock_out and return transactions. 5) Update mock data to add referenceId to 'return' transactions with format ORD-{number} and cancel reason in notes (e.g. 'Order cancellation', 'Customer return', 'Product expired'), also add channel (Grab/Lineman/Gokoo) to return transactions.`

## Chore Description
This chore enhances the Recent Transactions Table component by:
1. Removing the "spoilage" transaction type from the system entirely
2. Adding a filtering dropdown to categorize transactions by type
3. Making Order IDs clickable links that navigate to the order details page
4. Updating mock data to include realistic return transaction data with order references and channels

The changes improve user experience by allowing quick filtering of transactions and enabling direct navigation to related orders.

## Relevant Files
Use these files to complete the chore:

- **src/types/inventory.ts** - TypeScript type definitions for inventory domain
  - Remove "spoilage" from TransactionType union
  - Keep: stock_in, stock_out, adjustment, return

- **src/components/recent-transactions-table.tsx** - React component for displaying transaction table
  - Remove spoilage icon, badge class, and label handling functions
  - Add filter dropdown with Select component
  - Add filtering logic for 4 categories
  - Convert Order IDs in Notes column to clickable Next.js Link components
  - Extract numeric ID from "ORD-{number}" format using regex

- **src/lib/mock-inventory-data.ts** - Mock data generator for development/testing
  - Remove spoilage from transactionTypes array in generateMockTransactions()
  - Update generateTransactionNotes() to remove spoilage notes
  - Add referenceId to return transactions with ORD-{number} format
  - Add channel (Grab/Lineman/Gokoo) to return transactions
  - Update return transaction notes to include realistic cancel reasons

### New Files
No new files need to be created.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Remove Spoilage from Type Definition
- Open `src/types/inventory.ts`
- Locate the `TransactionType` type definition (line 188)
- Remove "spoilage" from the union type
- Keep only: "stock_in" | "stock_out" | "adjustment" | "return"

### 2. Remove Spoilage Handling from Transaction Table Component
- Open `src/components/recent-transactions-table.tsx`
- Remove spoilage case from `getTransactionIcon()` function (lines 31-32)
- Remove spoilage case from `getTransactionBadgeClass()` function (lines 48-49)
- Remove spoilage case from `getTransactionLabel()` function (lines 65-66)
- Remove spoilage from quantity formatting logic (line 188)
- Update imports to add Select, SelectContent, SelectItem, SelectTrigger, SelectValue from "@/components/ui/select"
- Add Link import from "next/link"

### 3. Add Filter Dropdown to Component
- Add state hook for filter selection with default "all"
- Add Select dropdown above the Table component with 4 options:
  - "All Transactions" (value: "all")
  - "Sold Items" (value: "sold") - stock_out with referenceId
  - "Stock Movement" (value: "movement") - stock_in, adjustment
  - "Return/Cancelled" (value: "return") - return type
- Add filtering logic before mapping transactions:
  - "all": show all transactions
  - "sold": filter where type === "stock_out" && referenceId exists
  - "movement": filter where type === "stock_in" || type === "adjustment"
  - "return": filter where type === "return"

### 4. Make Order IDs Clickable in Notes Column
- In the Notes column TableCell (lines 210-220)
- Extract order ID detection logic:
  - Check if transaction.type is "stock_out" or "return"
  - Check if referenceId exists and matches pattern ORD-{number}
  - Extract numeric ID using regex: `/ORD-(\d+)/`
- Render referenceId as Next.js Link component:
  - If referenceId matches ORD-{number}, wrap in `<Link href="/orders/{numericId}">`
  - Style as clickable link: text-primary underline hover:text-primary/80
  - Keep font-mono text-xs styling
  - If no match, render as plain text (existing behavior)

### 5. Update Mock Data Generator
- Open `src/lib/mock-inventory-data.ts`
- In `generateMockTransactions()` function (line 860):
  - Remove "spoilage" from transactionTypes array (line 868)
  - Update quantity switch statement to remove spoilage case (lines 893-895)
- Add referenceId to return transactions:
  - Generate referenceId for return type similar to stock_out: `ORD-{random number}`
  - Update return transaction creation to include channel (Grab/Lineman/Gokoo)
  - Use same randomChannel() logic for return transactions
- In `generateTransactionNotes()` function (line 953):
  - Remove spoilage from notes record (lines 973-978)
  - Update return notes to include realistic cancel reasons:
    - "Order cancellation"
    - "Customer return"
    - "Product expired"
    - "Wrong item received"

### 6. Validate Changes
- Run `pnpm dev` to start development server
- Navigate to inventory detail page with Recent Transactions table
- Verify spoilage transactions are not displayed
- Test filter dropdown:
  - Select "All Transactions" - all types shown
  - Select "Sold Items" - only stock_out with referenceId
  - Select "Stock Movement" - only stock_in and adjustment
  - Select "Return/Cancelled" - only return type
- Verify Order IDs are clickable links
- Click an Order ID and verify navigation to /orders/[orderId]
- Check browser console for any TypeScript errors
- Run `pnpm build` to verify production build compiles without errors

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm dev` - Start development server and manually test all features
- `pnpm build` - Verify TypeScript compilation and production build succeeds
- Test filtering: Select each filter option and verify correct transaction types displayed
- Test clickable links: Click on ORD-{number} in Notes column and verify navigation to /orders/{numericId}
- Verify no spoilage transactions appear in the table
- Check return transactions have referenceId, channel, and appropriate cancel reasons in notes

## Notes
- The filter dropdown should be placed above the table for easy access
- Order ID links should open in the same tab (default Link behavior)
- Ensure the numeric ID extraction handles edge cases (no match, invalid format)
- Mock data should maintain realistic distribution: more stock_out than returns
- All return transactions should now have both referenceId and channel fields
- The filtering logic should maintain performance even with large transaction lists
