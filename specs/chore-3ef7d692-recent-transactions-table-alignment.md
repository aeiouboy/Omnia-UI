# Chore: Align Recent Transactions Table with Stock Card By Product Structure

## Metadata
adw_id: `3ef7d692`
prompt: `Adjust the Recent Transactions table in src/components/recent-transactions-table.tsx to follow the same field structure and Merchant SKU toggle feature as the Stock Card By Product table in app/inventory-new/stores/page.tsx. Changes needed: 1) Reorder columns to match: Date & Time, Type, Qty, Balance, Notes, Merchant SKU (remove Channel and Store Name columns as they are not in Stock Card), 2) Update Type column to use simplified transaction types with colored badges matching Stock Card (Stock In=green, Stock Out=red, Adjustment=cyan) instead of 4 separate types with icons, 3) Update Qty column to show +/- sign with colored text matching Stock Card pattern (green for positive, red for negative), 4) Update Notes column to match Stock Card format showing 'PersonName: notes (ORD-XXXX)' with clickable order link, 5) Add Merchant SKU toggle switch with localStorage persistence (key: 'recentTransactions-showMerchantSku') matching the Stock Card implementation - when ON shows Merchant SKU column, when OFF hides it, 6) Add merchantSku field to StockTransaction interface in src/types/inventory.ts if not present, 7) Update the CSV export to conditionally include Merchant SKU based on toggle state. Position toggle in the filters row before the Export CSV button.`

## Chore Description
This chore aligns the Recent Transactions table component (`src/components/recent-transactions-table.tsx`) with the field structure and interaction patterns established in the Stock Card By Product table (`app/inventory-new/stores/page.tsx`). The alignment involves:

1. **Column Structure Alignment**: Reorder and simplify columns to match the Stock Card table structure (Date & Time, Type, Qty, Balance, Notes, Merchant SKU), removing Channel and Store Name columns that don't exist in Stock Card
2. **Transaction Type Simplification**: Replace the current 4-type system (stock_in, stock_out, adjustment, return) with 3 simplified colored badge types (Stock In=green, Stock Out=red, Adjustment=cyan) matching Stock Card's visual pattern
3. **Quantity Display Update**: Add +/- sign prefixes with color coding (green for positive/inbound, red for negative/outbound) to match Stock Card pattern
4. **Notes Format Update**: Ensure Notes column displays in the format "PersonName: notes (ORD-XXXX)" with clickable order links, matching Stock Card
5. **Merchant SKU Toggle**: Add a toggle switch with localStorage persistence (`recentTransactions-showMerchantSku`) to show/hide the Merchant SKU column
6. **Type Interface Update**: Add `merchantSku` field to `StockTransaction` interface if not present
7. **CSV Export Update**: Conditionally include Merchant SKU in exports based on toggle state

## Relevant Files
Use these files to complete the chore:

- **`src/components/recent-transactions-table.tsx`** - Main component to modify. Contains the Recent Transactions table with current 7-column structure (Date & Time, Transaction Type, Channel, Quantity, Balance, Store Name, Notes)
- **`app/inventory-new/stores/page.tsx`** - Reference implementation for Stock Card By Product table with simplified transaction types, Merchant SKU toggle, and Notes formatting. Lines 172-210 define simplified type configuration, lines 1046-1057 show toggle UI, lines 1153-1222 show table column structure
- **`src/types/inventory.ts`** - Contains `StockTransaction` interface (lines 419-465). Need to verify and potentially add `merchantSku` field
- **`src/lib/export-utils.ts`** - Contains `exportTransactionsToCSV` function used by Recent Transactions table. May need to update to support conditional Merchant SKU inclusion
- **`src/lib/stock-card-export.ts`** - Reference for CSV export with optional Merchant SKU (`includeMerchantSku` option in `ExportOptions` interface)
- **`src/components/ui/switch.tsx`** - Switch component to import for toggle functionality

### New Files
No new files needed - all changes are modifications to existing files.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Add merchantSku Field to StockTransaction Interface
- Open `src/types/inventory.ts`
- Locate the `StockTransaction` interface (line 419)
- Add `merchantSku?: string` field after `allocationType` field (around line 465)
- Add JSDoc comment: `/** Merchant SKU identifier for this transaction */`

### 2. Define Simplified Transaction Types in Recent Transactions Table
- Open `src/components/recent-transactions-table.tsx`
- Add type mapping at the top of the file after imports (around line 30):
  ```typescript
  // Simplified transaction type for display purposes
  type SimplifiedTransactionType = "STOCK_IN" | "STOCK_OUT" | "ADJUSTMENT"

  // Mapping from original 4 types to simplified 3 types
  const TRANSACTION_TYPE_MAPPING: Record<StockTransaction["type"], SimplifiedTransactionType> = {
    stock_in: "STOCK_IN",
    stock_out: "STOCK_OUT",
    adjustment: "ADJUSTMENT",
    return: "STOCK_IN", // Returns increase stock like stock_in
  }
  ```
- Add simplified type configuration matching Stock Card (lines 186-210 of stores/page.tsx):
  ```typescript
  const simplifiedTypeConfig: Record<SimplifiedTransactionType, {
    badgeClass: string
    label: string
    quantityClass: string
  }> = {
    STOCK_IN: {
      badgeClass: "bg-green-100 text-green-700 border-green-200",
      label: "Stock In",
      quantityClass: "text-green-600",
    },
    STOCK_OUT: {
      badgeClass: "bg-red-100 text-red-700 border-red-200",
      label: "Stock Out",
      quantityClass: "text-red-600",
    },
    ADJUSTMENT: {
      badgeClass: "bg-cyan-100 text-cyan-700 border-cyan-200",
      label: "Adjustment",
      quantityClass: "text-cyan-600",
    },
  }
  ```
- Remove existing `getTransactionIcon`, `getTransactionBadgeClass`, and `getTransactionLabel` functions (lines 41-84)

### 3. Add Merchant SKU Toggle State
- Import `Switch` component from `@/components/ui/switch`
- Add state for showMerchantSku: `const [showMerchantSku, setShowMerchantSku] = useState(false)`
- Add `useEffect` to load from localStorage on mount:
  ```typescript
  useEffect(() => {
    const savedValue = localStorage.getItem("recentTransactions-showMerchantSku")
    if (savedValue !== null) {
      setShowMerchantSku(savedValue === "true")
    }
  }, [])
  ```
- Add `useEffect` to persist changes:
  ```typescript
  useEffect(() => {
    localStorage.setItem("recentTransactions-showMerchantSku", String(showMerchantSku))
  }, [showMerchantSku])
  ```

### 4. Update Filter Row Layout
- Locate the filters row in CardHeader (around line 234)
- Add Merchant SKU toggle switch before the Export CSV button:
  ```tsx
  {/* Merchant SKU Toggle */}
  <div className="flex items-center gap-2">
    <label htmlFor="show-merchant-sku-recent" className="text-sm font-medium text-muted-foreground whitespace-nowrap">
      Show Merchant SKU
    </label>
    <Switch
      id="show-merchant-sku-recent"
      checked={showMerchantSku}
      onCheckedChange={setShowMerchantSku}
    />
  </div>
  ```

### 5. Update Table Header
- Remove Channel column (line 292)
- Remove Store Name column (line 295)
- Reorder columns to: Date & Time, Type, Qty, Balance, Notes, Merchant SKU (conditional)
- Add conditional Merchant SKU header:
  ```tsx
  {showMerchantSku && (
    <TableHead className="whitespace-nowrap">Merchant SKU</TableHead>
  )}
  ```

### 6. Update Table Body Row Rendering
- Remove Channel cell (lines 316-331)
- Remove Store Name cell (lines 341-361)
- Update Type cell to use simplified badge without icon:
  ```tsx
  <TableCell>
    <Badge
      variant="outline"
      className={`${config.badgeClass} rounded-full px-3 py-1`}
    >
      {config.label}
    </Badge>
  </TableCell>
  ```
- Update Quantity cell to show +/- with color:
  ```tsx
  <TableCell className={`text-right font-semibold ${config.quantityClass}`}>
    {simplifiedType === "STOCK_OUT" ? "-" : "+"}{transaction.quantity}
  </TableCell>
  ```
- Ensure Notes cell format matches "PersonName: notes (ORD-XXXX)" pattern with clickable link (current implementation at lines 363-427 is close, verify consistency)
- Add conditional Merchant SKU cell:
  ```tsx
  {showMerchantSku && (
    <TableCell className="font-mono text-sm text-muted-foreground">
      {transaction.merchantSku || "-"}
    </TableCell>
  )}
  ```

### 7. Update CSV Export Function
- Locate `handleExport` function (around line 205)
- Update to pass toggle state to export function:
  ```typescript
  const handleExport = () => {
    if (transactions.length > 0) {
      const productName = transactions[0].productName || "inventory"
      exportTransactionsToCSV(filteredTransactions, productName, { includeMerchantSku: showMerchantSku })
    }
  }
  ```
- Update `src/lib/export-utils.ts`:
  - Modify `exportTransactionsToCSV` function signature to accept options parameter:
    ```typescript
    export function exportTransactionsToCSV(
      transactions: StockTransaction[],
      productName: string,
      options?: { includeMerchantSku?: boolean }
    ): void
    ```
  - Add conditional Merchant SKU column to `transactionExportColumns` based on options
  - Remove Channel column from export columns (as it's being removed from table)
  - Reorder columns to match new table structure

### 8. Clean Up Unused Code
- Remove `getChannelBadge` function (lines 97-119) as Channel column is removed
- Remove any unused imports (ArrowUp, ArrowDown, RefreshCw, RotateCcw icons if no longer needed)
- Verify removal of viewChannels, storeName, storeId props if no longer used in UI

### 9. Validate Implementation
- Run `pnpm build` to ensure no TypeScript errors
- Test the component renders correctly with updated structure
- Verify Merchant SKU toggle persists state to localStorage
- Verify CSV export includes/excludes Merchant SKU based on toggle

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm build` - Build production to verify no TypeScript/compilation errors
- `pnpm lint` - Run ESLint to check for code quality issues
- `pnpm dev` - Start dev server and manually verify:
  - Navigate to a page using RecentTransactionsTable component
  - Verify columns order: Date & Time, Type, Qty, Balance, Notes, (Merchant SKU if toggle on)
  - Verify Type column shows colored badges (green/red/cyan) without icons
  - Verify Qty column shows +/- prefix with colored text
  - Verify Notes format: "PersonName: notes (ORD-XXXX)"
  - Toggle Merchant SKU switch and verify column visibility
  - Refresh page and verify toggle state persists
  - Export CSV and verify Merchant SKU included/excluded based on toggle

## Notes

- The Stock Card By Product table uses `ProductTransaction` type from `stock-card-mock-data.ts` which has different field names (balance vs balanceAfter, notes format includes personName). The Recent Transactions table uses `StockTransaction` from `types/inventory.ts`. Ensure the field mapping is correct.
- The Stock Card uses 7 original transaction types that map to 3 simplified types. Recent Transactions has 4 types (`stock_in`, `stock_out`, `adjustment`, `return`) that should map to the same 3 simplified types (return → Stock In).
- localStorage key must be `recentTransactions-showMerchantSku` (not `stockCard-showMerchantSku`) to maintain separate toggle states for each table.
- The `viewChannels`, `storeName`, and `storeId` props may still be needed for other purposes in the parent component even if not displayed in the table - verify before removing from interface.
