# Chore: Update Recent Transactions Table UI

## Metadata
adw_id: `19af25ea`
prompt: `Update Recent Transactions table UI: 1) Move filter dropdown to right side of CardHeader - use flex container with justify-between, title on left and Select on right. 2) In Notes column, hide user name when transaction has clickable order ID (referenceId exists for stock_out or return types) - only show 'notes + clickable order link', but keep user name for transactions without order ID. 3) Verify filter groupings work correctly: 'Sold Items' = stock_out with referenceId (stock decrease from orders), 'Stock Movement' = stock_in and adjustment (system updates, both increase and decrease), 'Return/Cancelled' = return type (cancelled/returned orders with clickable order ID and cancel reason in notes).`

## Chore Description
This chore enhances the Recent Transactions table UI to improve usability and data clarity:
1. **Move filter dropdown to right side**: Restructure CardHeader to use a flex container with `justify-between`, placing the title on the left and the filter Select component on the right side
2. **Conditional user name display in Notes column**: Hide the user name when a transaction has a clickable order ID (when `referenceId` exists for `stock_out` or `return` types), showing only the notes and clickable order link. Keep the user name visible for transactions without order IDs.
3. **Verify filter groupings**: Ensure the filter logic correctly groups transactions:
   - "Sold Items" = `stock_out` transactions with `referenceId` (stock decreases from actual orders)
   - "Stock Movement" = `stock_in` and `adjustment` transactions (system updates, both increases and decreases)
   - "Return/Cancelled" = `return` type transactions (cancelled/returned orders with clickable order ID and cancel reason in notes)

## Relevant Files
Use these files to complete the chore:

- **src/components/recent-transactions-table.tsx** (lines 1-273) - Main component to update
  - Move filter dropdown from CardContent to CardHeader (currently at lines 168-180)
  - Restructure CardHeader layout with flex container (lines 163-166)
  - Update Notes column conditional rendering for user name (lines 237-263)
  - Verify filter logic for transaction groupings (lines 119-125)

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Restructure CardHeader with Flex Layout
- Open `src/components/recent-transactions-table.tsx`
- Locate the `CardHeader` section (lines 163-166)
- Replace the current `CardHeader` structure with a flex container:
  ```tsx
  <CardHeader>
    <div className="flex items-start justify-between">
      <div>
        <CardTitle>Recent Transactions</CardTitle>
        <CardDescription>Last {transactions.length} stock movements</CardDescription>
      </div>
      {/* Filter dropdown will be moved here in next step */}
    </div>
  </CardHeader>
  ```
- This creates a flex container with title/description on left and space for filter on right

### 2. Move Filter Dropdown to CardHeader
- Remove the filter dropdown section from `CardContent` (currently lines 168-180)
- Move the entire `Select` component into the CardHeader flex container:
  ```tsx
  <div className="flex items-start justify-between">
    <div>
      <CardTitle>Recent Transactions</CardTitle>
      <CardDescription>Last {transactions.length} stock movements</CardDescription>
    </div>
    <Select value={filter} onValueChange={(value) => setFilter(value as typeof filter)}>
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="Filter transactions" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Transactions</SelectItem>
        <SelectItem value="sold">Sold Items</SelectItem>
        <SelectItem value="movement">Stock Movement</SelectItem>
        <SelectItem value="return">Return/Cancelled</SelectItem>
      </SelectContent>
    </Select>
  </div>
  ```
- Remove the old `<div className="mb-4">` wrapper that contained the filter
- Ensure CardContent now starts directly with the table

### 3. Update Notes Column User Name Display Logic
- Locate the Notes column TableCell (lines 237-263)
- Update the conditional rendering to hide user name when referenceId exists for stock_out or return:
  ```tsx
  <TableCell className="text-sm text-muted-foreground max-w-[200px]">
    <div className="truncate">
      {/* Only show user name if no referenceId exists for stock_out/return */}
      {transaction.user &&
        !((transaction.type === "stock_out" || transaction.type === "return") && transaction.referenceId) &&
        <span className="font-medium">{transaction.user}: </span>
      }
      {transaction.notes}
      {transaction.referenceId && (() => {
        // Extract numeric ID from ORD-{number} format for stock_out and return transactions
        const match = transaction.referenceId.match(/ORD-(\d+)/)
        const numericId = match ? match[1] : null

        if ((transaction.type === "stock_out" || transaction.type === "return") && numericId) {
          return (
            <Link
              href={`/orders/${numericId}`}
              className="ml-2 font-mono text-xs text-primary underline hover:text-primary/80"
            >
              ({transaction.referenceId})
            </Link>
          )
        }

        return (
          <span className="ml-2 font-mono text-xs">
            ({transaction.referenceId})
          </span>
        )
      })()}
    </div>
  </TableCell>
  ```
- This ensures user names are hidden when there's a clickable order ID, but visible for other transactions

### 4. Verify Filter Grouping Logic
- Review the `filteredTransactions` logic (lines 119-125)
- Current implementation should already be correct:
  ```tsx
  const filteredTransactions = transactions.filter((transaction) => {
    if (filter === "all") return true
    if (filter === "sold") return transaction.type === "stock_out" && transaction.referenceId
    if (filter === "movement") return transaction.type === "stock_in" || transaction.type === "adjustment"
    if (filter === "return") return transaction.type === "return"
    return true
  })
  ```
- Verify this logic matches the requirements:
  - ✅ "Sold Items": `stock_out` with `referenceId` (stock decrease from orders)
  - ✅ "Stock Movement": `stock_in` and `adjustment` (system updates)
  - ✅ "Return/Cancelled": `return` type (cancelled/returned orders)
- No changes needed if logic is already correct

### 5. Update Loading and Empty States CardHeader
- Locate the loading state CardHeader (lines 130-133)
- Update to match the new flex layout structure:
  ```tsx
  <CardHeader>
    <div className="flex items-start justify-between">
      <div>
        <CardTitle>Recent Transactions</CardTitle>
        <CardDescription>Last 10 stock movements</CardDescription>
      </div>
    </div>
  </CardHeader>
  ```
- Repeat for the empty state CardHeader (lines 149-151)
- Note: Loading and empty states don't need the filter dropdown since there's no data to filter

### 6. Test Component Rendering
- Run `pnpm dev` to start the development server
- Navigate to inventory detail pages with transaction tables
- Verify the following:
  - ✅ Filter dropdown appears on the right side of the CardHeader
  - ✅ Title and description remain on the left
  - ✅ User names are hidden for stock_out/return transactions with order IDs
  - ✅ User names are visible for stock_in/adjustment transactions
  - ✅ User names are visible for stock_out/return transactions WITHOUT order IDs
  - ✅ Clickable order links still work correctly
  - ✅ Filter groupings work as expected (test all 4 filter options)
  - ✅ Responsive layout works on mobile/tablet/desktop
  - ✅ No TypeScript errors or console warnings

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm run build` - Ensure no TypeScript or build errors
- `pnpm run lint` - Check for any linting issues
- Manual testing:
  1. Navigate to an inventory product detail page
  2. Scroll to Recent Transactions table
  3. Test filter dropdown on the right side of the header
  4. Check "Sold Items" filter - should only show stock_out with order IDs
  5. Check "Stock Movement" filter - should show stock_in and adjustment
  6. Check "Return/Cancelled" filter - should show return transactions
  7. Verify user names appear/disappear correctly based on transaction type and referenceId

## Notes
- The filter dropdown move to CardHeader improves UI/UX by keeping controls closer to the data they affect
- Hiding user names for transactions with order IDs reduces clutter and emphasizes the clickable order link
- The filter logic already correctly implements the required groupings based on the mock data generator in `src/lib/mock-inventory-data.ts` (lines 907-920)
- Stock_out and return transactions with referenceId are generated with channel data and order IDs (60% Grab, 30% Lineman, 10% Gokoo)
- The Notes column already has proper text truncation with `max-w-[200px]` and `truncate` classes
- No type definition changes needed - all required fields already exist in `StockTransaction` interface
