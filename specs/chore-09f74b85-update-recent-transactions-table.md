# Chore: Update Recent Transactions Table with Filtering and Clickable Order IDs

## Metadata
adw_id: `09f74b85`
prompt: `Add filtering and clickable order IDs to Recent Transactions table: 1) Remove 'spoilage' from TransactionType in src/types/inventory.ts (keep only: stock_in, stock_out, adjustment, return). 2) Remove spoilage handling from src/components/recent-transactions-table.tsx and src/lib/mock-inventory-data.ts. 3) Add filter dropdown with 4 options: 'All Transactions' (default), 'Sold Items' (stock_out with referenceId), 'Stock Movement' (stock_in, adjustment), 'Return/Cancelled' (return). 4) Make Order IDs in Notes column clickable as Link to /orders/[orderId] - extract numeric ID from ORD-{number} format for stock_out and return transactions. 5) Update mock data to add referenceId to 'return' transactions with format ORD-{number} and cancel reason in notes (e.g. 'Order cancellation', 'Customer return', 'Product expired'), also add channel (Grab/Lineman/Gokoo) to return transactions.`

## Chore Description
This chore enhances the Recent Transactions Table component by:
1. Removing the 'spoilage' transaction type from the type system and all related handling
2. Adding a filter dropdown to categorize transactions into three meaningful groups
3. Making Order IDs clickable links that navigate to the order detail page
4. Enhancing mock data with referenceId and channel for return transactions

## Relevant Files
Use these files to complete the chore:

- **src/types/inventory.ts** - Contains TransactionType definition that needs to be updated (remove 'spoilage')
- **src/components/recent-transactions-table.tsx** - Main component that needs filter dropdown, clickable order IDs, and spoilage removal
- **src/lib/mock-inventory-data.ts** - Mock data generator that needs spoilage removal and return transaction referenceId updates

### New Files
No new files need to be created. All changes are modifications to existing files.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Update TypeScript Type Definition
- Open `src/types/inventory.ts`
- Locate the `TransactionType` type definition (around line 188)
- Remove `"spoilage"` from the union type
- Verify the type only includes: `"stock_in" | "stock_out" | "adjustment" | "return"`
- Save the file

### 2. Remove Spoilage Handling from Recent Transactions Table Component
- Open `src/components/recent-transactions-table.tsx`
- Remove spoilage case from `getTransactionIcon()` function (around line 31-32)
- Remove spoilage case from `getTransactionBadgeClass()` function (around line 48-49)
- Remove spoilage case from `getTransactionLabel()` function (around line 65-66)
- Update the quantity formatting logic to remove spoilage reference (change condition from `stock_out || spoilage` to `stock_out || return`)
- Save the file

### 3. Add Filter Dropdown and State Management
- In `src/components/recent-transactions-table.tsx`, import necessary UI components:
  - Import `Select`, `SelectContent`, `SelectItem`, `SelectTrigger`, `SelectValue` from "@/components/ui/select"
  - Import `useState` from React
- Add filter state: `const [filter, setFilter] = useState<"all" | "sold" | "movement" | "returns">("all")`
- Create filter logic function to categorize transactions:
  - "sold": `type === "stock_out" && referenceId exists`
  - "movement": `type === "stock_in" || type === "adjustment"`
  - "returns": `type === "return"`
  - "all": show all transactions
- Apply filter to transactions array before mapping in the table

### 4. Add Filter Dropdown UI
- In the CardHeader section, add a flex container for title and filter
- Add Select component with the filter options:
  - "All Transactions" (default)
  - "Sold Items" (stock_out with referenceId)
  - "Stock Movement" (stock_in, adjustment)
  - "Return/Cancelled" (return)
- Style the select to align properly with the card header
- Keep the CardDescription as "Last {count} stock movements"

### 5. Make Order IDs Clickable Links
- Import `Link` from "next/link"
- In the Notes column rendering, detect if `referenceId` exists
- Extract numeric ID from `ORD-{number}` format using regex: `/ORD-(\d+)/`
- Wrap the referenceId display in a Link component pointing to `/orders/[orderId]`
- Style the link to be visually distinct (e.g., `text-blue-600 hover:text-blue-800 hover:underline`)
- Only make it clickable for stock_out and return transaction types

### 6. Remove Spoilage from Mock Data Generator
- Open `src/lib/mock-inventory-data.ts`
- Locate the `generateMockTransactions()` function (around line 860)
- Remove `"spoilage"` from the `transactionTypes` array
- Remove the spoilage case from the quantity determination switch statement
- Remove spoilage from `generateTransactionNotes()` function notes object

### 7. Update Mock Data for Return Transactions
- In `src/lib/mock-inventory-data.ts`, update the `generateMockTransactions()` function
- Add `referenceId` generation for return transactions (similar to stock_out)
- Format as `ORD-{random number}` for return type transactions
- Update return transaction notes to include realistic cancellation reasons:
  - "Order cancellation"
  - "Customer return"
  - "Product expired"
  - "Item damaged during delivery"
  - "Wrong item ordered"
- Ensure return transactions get a channel assignment (Grab, Lineman, or Gokoo)
- Update the channel/referenceId logic: `const channel = (type === "stock_out" || type === "return") ? randomChannel() : undefined`

### 8. Validate the Changes
- Check TypeScript compilation for any type errors
- Verify spoilage references are completely removed from all files
- Test filter dropdown functionality visually
- Verify clickable order ID links navigate correctly
- Check that return transactions now have referenceId, channel, and appropriate notes

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm build` - Ensure no TypeScript errors or build failures
- `pnpm lint` - Check for any ESLint warnings or errors
- `grep -r "spoilage" src/` - Verify no remaining spoilage references (should return no matches)
- Manual testing in browser:
  - Navigate to inventory detail page with Recent Transactions
  - Test all filter options (All, Sold Items, Stock Movement, Return/Cancelled)
  - Click on Order IDs in Notes column and verify navigation to /orders/[id]
  - Verify return transactions show Order IDs, channel badges, and cancellation reasons

## Notes

### Design Considerations
- The filter dropdown should be placed in the CardHeader next to the title for easy access
- Order ID links should have clear visual feedback (underline, color change on hover)
- Transaction count in description provides useful context at a glance

### Technical Details
- Use Next.js Link component for client-side navigation (faster than full page reload)
- Regex pattern for extracting numeric ID: `/ORD-(\d+)/` to capture the number portion
- Filter state is local to the component (no URL params needed for this simple case)

### Channel Assignment for Returns
- Return transactions should include channel (Grab/Lineman/Gokoo) to show which platform the order came from
- This helps identify patterns (e.g., which channel has more returns)
- Generate channel proportionally: ~60% Grab, ~30% Lineman, ~10% Gokoo (realistic distribution)

### Mobile Responsiveness
- Filter dropdown should remain functional on mobile devices
- Order ID links should have adequate touch target size (min 44px)
- Consider responsive layout for filter on smaller screens
