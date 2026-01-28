# Chore: Transaction History Table Redesign

## Metadata
adw_id: `689ab0e3`
prompt: `Adjust Transaction History table on Stock Card By Product view (app/inventory-new/stores/page.tsx) to match Recent Transactions style from the reference image, but WITHOUT the Channel column`

## Chore Description
Redesign the Transaction History table in the Stock Card By Product view to match a cleaner, more modern "Recent Transactions" style. The changes include:

1. **Simplified Transaction Types**: Consolidate 7 transaction types into 3 display categories (Stock In, Stock Out, Adjustment) with distinctive icons and colors
2. **New Store Name Column**: Add a two-line store name display showing store name and store ID
3. **Enhanced Notes Column**: Merge Reference No into Notes as a clickable link, add person names
4. **Updated Date Format**: Change to full format 'Jan 19, 2026, 05:31 AM'
5. **Updated Badge Styling**: Icons positioned before text in rounded pill badges with new color scheme

## Relevant Files
Use these files to complete the chore:

- **`app/inventory-new/stores/page.tsx`** (lines 94-157, 1093-1155): Contains the Transaction History table JSX and `transactionTypeConfig` object that defines badge styling and icons for each transaction type
- **`src/lib/stock-card-mock-data.ts`** (lines 22-32, 57-114): Contains the `ProductTransaction` interface that needs new fields (storeName, storeId, personName) and the mock data generators

### New Files
- None required - all changes are modifications to existing files

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Update ProductTransaction Interface
- In `src/lib/stock-card-mock-data.ts`, add three new fields to the `ProductTransaction` interface:
  - `storeName: string` - Name of the store where transaction occurred
  - `storeId: string` - ID of the store
  - `personName: string` - Name of person who performed the transaction

### 2. Add Mock Data Constants
- In `src/lib/stock-card-mock-data.ts`, add new constant arrays:
  - `STORE_DATA` array with ~8 stores containing `storeName` and `storeId`
  - `PERSON_NAMES` array with names like 'Amy Wang', 'Lisa Wong', 'Sarah Johnson', 'John Chen', 'Mike Davis'
  - `ORDER_REFERENCES` array with order IDs like 'ORD-4343', 'ORD-3779', 'ORD-5521'

### 3. Update Mock Transaction Generator
- In `src/lib/stock-card-mock-data.ts`, modify `generateMockProductTransactions`:
  - Add `storeName` and `storeId` from random `STORE_DATA` element
  - Add `personName` from random `PERSON_NAMES` element
  - Update notes format to include person name and optional order reference (e.g., "Amy Wang: Stock count correction" or "Lisa Wong: Grab order fulfillment (ORD-4343)")

### 4. Create Simplified Transaction Type Display Mapping
- In `app/inventory-new/stores/page.tsx`, create new `SIMPLIFIED_TRANSACTION_TYPES` mapping:
  ```typescript
  type SimplifiedTransactionType = "STOCK_IN" | "STOCK_OUT" | "ADJUSTMENT"

  const TRANSACTION_TYPE_MAPPING: Record<ProductTransactionType, SimplifiedTransactionType> = {
    RECEIPT_IN: "STOCK_IN",
    ISSUE_OUT: "STOCK_OUT",
    TRANSFER_IN: "STOCK_IN",
    TRANSFER_OUT: "STOCK_OUT",
    ADJUSTMENT_PLUS: "ADJUSTMENT",
    ADJUSTMENT_MINUS: "ADJUSTMENT",
    RETURN: "STOCK_IN",
  }
  ```

### 5. Update Transaction Type Config for New Badge Styling
- In `app/inventory-new/stores/page.tsx`, replace existing `transactionTypeConfig` with simplified version:
  ```typescript
  const simplifiedTypeConfig: Record<SimplifiedTransactionType, {
    icon: React.ReactNode
    badgeClass: string
    label: string
    quantityClass: string
  }> = {
    STOCK_IN: {
      icon: <ArrowUp className="h-3.5 w-3.5" />,  // Up arrow
      badgeClass: "bg-green-100 text-green-700 border-green-200",
      label: "Stock In",
      quantityClass: "text-green-600",
    },
    STOCK_OUT: {
      icon: <ArrowDown className="h-3.5 w-3.5" />,  // Down arrow
      badgeClass: "bg-red-100 text-red-700 border-red-200",
      label: "Stock Out",
      quantityClass: "text-red-600",
    },
    ADJUSTMENT: {
      icon: <RefreshCw className="h-3.5 w-3.5" />,  // Refresh/sync icon
      badgeClass: "bg-cyan-100 text-cyan-700 border-cyan-200",
      label: "Adjustment",
      quantityClass: "text-cyan-600",
    },
  }
  ```

### 6. Import Required Icons
- In `app/inventory-new/stores/page.tsx`, add `ArrowUp`, `ArrowDown` to the lucide-react imports (line 38-60)

### 7. Update Date Formatting Function
- In `app/inventory-new/stores/page.tsx`, modify `formatTransactionDateTime` function (lines 165-181):
  - Change from short format to full format: 'Jan 19, 2026, 05:31 AM'
  - Use options: `{ month: "short", day: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true }`

### 8. Update Table Header Columns
- In `app/inventory-new/stores/page.tsx`, modify the desktop table header (lines 1094-1104):
  - Date & Time (w-[200px])
  - Transaction Type (w-[140px])
  - Quantity (text-right, w-[100px])
  - Balance (text-right, w-[100px])
  - Store Name (w-[180px]) - NEW
  - Notes - (flexible width, removed Reference No as separate column)

### 9. Update Table Body Row Rendering
- In `app/inventory-new/stores/page.tsx`, update each table row (lines 1106-1152):
  - Get simplified type using `TRANSACTION_TYPE_MAPPING[txn.type]`
  - Get config from `simplifiedTypeConfig` instead of `transactionTypeConfig`
  - Update Transaction Type badge: icon BEFORE text, use new badge class
  - Add Store Name cell: two-line format with store name on top, store ID (text-xs text-muted-foreground) below
  - Update Notes cell: Show "Person Name: Description" with optional clickable reference link (text-blue-600 hover:underline)
  - Remove Reference No cell

### 10. Update Mobile Card View
- In `app/inventory-new/stores/page.tsx`, update mobile card view (lines 1157-1202):
  - Use simplified type config
  - Add Store Name section
  - Update Notes format with person name
  - Add clickable reference links if present
  - Remove separate Reference display

### 11. Update isInboundType Helper Function
- In `app/inventory-new/stores/page.tsx`, ensure `isInboundType` function (lines 159-162) works with simplified types:
  - Create new helper `getQuantitySign` that checks if simplified type is STOCK_IN or STOCK_OUT

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm build` - Ensure TypeScript compiles without errors
- `pnpm lint` - Ensure no linting errors
- `pnpm dev` - Start development server and manually verify:
  1. Navigate to Stock Card page
  2. Switch to "By Product" tab
  3. Enter required filters (date range, product)
  4. Verify table columns appear in correct order
  5. Verify Transaction Type badges show: Stock In (green), Stock Out (red), Adjustment (cyan)
  6. Verify Store Name shows two-line format
  7. Verify Notes show "Person Name: Description" format
  8. Verify reference links are clickable (if present)
  9. Test mobile responsive view

## Notes
- The `RefreshCw` icon is already imported and used elsewhere in the file, so no additional import needed for the Adjustment badge
- Keep the existing `transactionTypeConfig` temporarily until all references are updated, then remove it
- The filter dropdown still shows all 7 original transaction types - this is intentional as filtering by specific type (e.g., TRANSFER_IN vs RECEIPT_IN) is still useful, only the display is simplified
- Quantity sign (+/-) should be determined by the simplified type, not the original type
- Balance column styling remains unchanged (plain number, right-aligned)
