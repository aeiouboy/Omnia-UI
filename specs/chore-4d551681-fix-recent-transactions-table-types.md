# Chore: Fix RecentTransactionsTable to Display Actual 5 Transaction Types

## Metadata
adw_id: `4d551681`
prompt: `Fix RecentTransactionsTable component in src/components/recent-transactions-table.tsx to display the actual 5 transaction types instead of the simplified 3-type mapping. Current issue: TRANSACTION_TYPE_MAPPING and simplifiedTypeConfig map 5 new types (Initial sync, Adjust In, Adjust out, Replacement, Order Ship) back to 3 simplified display types (Stock In, Stock Out, Adjustment). Required fix: Remove the simplified mapping and display each transaction type with its actual name and appropriate styling: Initial sync (green), Order Ship (red), Adjust In (blue/+), Adjust out (blue/-), Replacement (purple). Update the filter dropdown options, badge labels, and any type filtering logic to use the actual 5 transaction type values. Keep the same badge colors for positive types (green for Initial sync, Adjust In) and negative types (red for Order Ship, Adjust out), with purple for Replacement.`

## Chore Description
The RecentTransactionsTable component currently uses a simplified 3-type mapping system that collapses the 5 actual transaction types into 3 display categories:
- "Initial sync" & "Adjust In" → "Stock In" (green)
- "Adjust out" & "Order Ship" → "Stock Out" (red)
- "Replacement" → "Adjustment" (cyan)

This oversimplifies the transaction data and loses meaningful distinctions between transaction types. The fix requires removing this abstraction layer and displaying each of the 5 transaction types with their actual names and appropriate styling that matches the TransactionHistorySection component.

**Target Styling (from transaction-history-section.tsx):**
- Initial sync: green badge (`bg-green-100 text-green-800`), + quantity
- Order Ship: red badge (`bg-red-100 text-red-800`), - quantity
- Adjust In: blue badge (`bg-blue-100 text-blue-800`), + quantity
- Adjust out: blue badge (`bg-blue-100 text-blue-800`), - quantity
- Replacement: purple badge (`bg-purple-100 text-purple-800`), +/- quantity

## Relevant Files
Use these files to complete the chore:

- **src/components/recent-transactions-table.tsx** - Main file to modify. Contains `TRANSACTION_TYPE_MAPPING` and `simplifiedTypeConfig` that need to be replaced with the full 5-type configuration
- **src/components/inventory/transaction-history-section.tsx** - Reference implementation with correct `transactionTypeConfig` for all 5 types (lines 95-134)
- **src/types/inventory.ts** - Defines `TransactionType` as `"Initial sync" | "Adjust In" | "Adjust out" | "Replacement" | "Order Ship"` (line 397)

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Remove Simplified Type Abstractions
- Delete the `SimplifiedTransactionType` type definition (line 33)
- Delete the `TRANSACTION_TYPE_MAPPING` constant (lines 36-42)
- Delete the `simplifiedTypeConfig` constant (lines 45-65)

### 2. Add Full Transaction Type Configuration
- Add new `transactionTypeConfig` constant matching the pattern from transaction-history-section.tsx
- Configuration should map each `TransactionType` to its badge classes, label, and quantity sign:
  ```typescript
  const transactionTypeConfig: Record<TransactionType, {
    badgeClass: string
    label: string
    quantityClass: string
    quantitySign: "+" | "-"
  }> = {
    "Initial sync": {
      badgeClass: "bg-green-100 text-green-700 border-green-200",
      label: "Initial sync",
      quantityClass: "text-green-600",
      quantitySign: "+",
    },
    "Order Ship": {
      badgeClass: "bg-red-100 text-red-700 border-red-200",
      label: "Order Ship",
      quantityClass: "text-red-600",
      quantitySign: "-",
    },
    "Adjust In": {
      badgeClass: "bg-blue-100 text-blue-700 border-blue-200",
      label: "Adjust In",
      quantityClass: "text-green-600",
      quantitySign: "+",
    },
    "Adjust out": {
      badgeClass: "bg-blue-100 text-blue-700 border-blue-200",
      label: "Adjust out",
      quantityClass: "text-red-600",
      quantitySign: "-",
    },
    "Replacement": {
      badgeClass: "bg-purple-100 text-purple-700 border-purple-200",
      label: "Replacement",
      quantityClass: "text-purple-600",
      quantitySign: "+",
    },
  }
  ```
- Import `TransactionType` from `@/types/inventory`

### 3. Update Table Row Rendering
- In the table body rendering (around line 267-357):
  - Remove the `simplifiedType` variable that uses `TRANSACTION_TYPE_MAPPING`
  - Change to directly access `transactionTypeConfig[transaction.type]`
  - Update badge to use `config.label` (the actual type name)
  - Update quantity prefix to use `config.quantitySign` instead of determining from simplified type
  - Update quantity styling to use `config.quantityClass`

### 4. Verify Filter Dropdown Already Correct
- Confirm the filter dropdown (lines 200-213) already uses the 5 actual type values
- The `typeFilter` state type (line 93) is already correct: `"all" | "Initial sync" | "Adjust In" | "Adjust out" | "Replacement" | "Order Ship"`
- No changes needed to filter logic

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm build` - Verify production build succeeds with no TypeScript errors
- `pnpm lint` - Verify no ESLint errors introduced
- `pnpm dev` - Start dev server and manually verify:
  1. Navigate to an inventory detail page with transactions
  2. Confirm Recent Transactions table shows 5 distinct type badges
  3. Confirm filter dropdown works correctly with all 5 types
  4. Confirm quantity shows correct +/- signs based on type

## Notes
- The filter dropdown and typeFilter state are already correctly implemented for 5 types - only the display rendering needs to change
- The TransactionHistorySection component (used in full inventory detail view) already uses the correct 5-type configuration and can serve as the reference implementation
- Keep the rounded badge style (`rounded-full px-3 py-1`) for visual consistency with the existing design
- The Replacement type quantity direction is ambiguous - using "+" as default since replacements typically add stock back
