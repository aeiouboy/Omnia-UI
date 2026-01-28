# Chore: Stock Card By Product View Implementation

## Metadata
adw_id: `4cd85169`
prompt: `Implement Stock Card By Product View on the Stock Card page (app/inventory-new/stores/page.tsx) following wireframe specs/wireframe-stock-card-by-product-view.md`

## Chore Description
Implement a new "By Product" view mode on the Stock Card page that displays transaction history for a specific product. The page currently shows a "By Store" view (store performance table). This task adds:

1. **Tab Toggle** - Switch between "By Store" (existing) and "By Product" (new) views
2. **By Product Filter Section** - Date range, Product ID/Name (mandatory), Transaction Type, Search Notes filters
3. **Product Summary Card** - Show product info with opening balance, total in/out, current balance
4. **Transaction History Table** - Color-coded transaction types with pagination
5. **CSV Export** - Export filtered transactions with metadata headers
6. **Empty States** - "No Product Selected" and "No Transactions Found" states
7. **Mock Data** - Generate realistic transaction data for development/testing
8. **Responsive Design** - Desktop table, tablet scroll, mobile card layout

## Relevant Files
Use these files to complete the chore:

### Primary Files
- **`app/inventory-new/stores/page.tsx`** - Main Stock Card page to be enhanced with tab toggle and By Product view
- **`specs/wireframe-stock-card-by-product-view.md`** - Wireframe specification with detailed UI requirements

### Reference Files (Patterns to Follow)
- **`src/components/inventory/transaction-history-section.tsx`** - Existing transaction history component with similar patterns for table, pagination, transaction type badges, exports
- **`src/components/inventory/inventory-empty-state.tsx`** - Empty state component to reuse/extend
- **`src/components/ui/tabs.tsx`** - Tabs component from shadcn/ui (already available)
- **`src/components/ui/select.tsx`** - Select dropdown component for transaction type filter
- **`src/lib/utils.ts`** - Utility functions including `formatGMT7Time`, `formatGMT7DateTime`

### Type Definitions
- **`types/inventory.ts`** - Inventory types including `StockTransaction`, `TransactionType`

### New Files
- **`lib/stock-card-mock-data.ts`** - Mock data generator for By Product view transactions (NEW)
- **`lib/stock-card-export.ts`** - CSV export utility specific to stock card (NEW)

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Create Mock Data Generator
Create `lib/stock-card-mock-data.ts` with:
- Define `ProductTransaction` interface extending transaction data
- Define `ProductTransactionType` enum: `RECEIPT_IN`, `ISSUE_OUT`, `TRANSFER_IN`, `TRANSFER_OUT`, `ADJUSTMENT_PLUS`, `ADJUSTMENT_MINUS`, `RETURN`
- Create `generateMockProductTransactions(productId, productName, dateFrom, dateTo)` function
- Generate 50-200 realistic transactions with:
  - Random timestamps within date range
  - Various transaction types
  - Running balance calculations
  - Reference numbers (PO-, SO-, TRF-, ADJ-, RET- prefixes)
  - Realistic notes
- Create `getMockProductSummary(transactions)` function to calculate opening balance, total in, total out, current balance

### 2. Create CSV Export Utility
Create `lib/stock-card-export.ts` with:
- `exportStockCardToCSV(transactions, productInfo, dateRange)` function
- CSV format with header comments:
  ```
  # Stock Card Export - Product: {productId}
  # Product Name: {productName}
  # Date Range: {dateFrom} - {dateTo}
  # Exported: {timestamp}

  Date & Time,Transaction Type,Quantity,Balance,Notes
  ```
- Download as `stock-card-{productId}-{date}.csv`

### 3. Define Transaction Type Configuration
In `app/inventory-new/stores/page.tsx`, add after existing imports:
- Define `TRANSACTION_TYPES` constant array for dropdown options
- Define `transactionTypeConfig` with icons, colors, labels per wireframe:
  - Receipt (IN): Green, download icon
  - Issue (OUT): Red, upload icon
  - Transfer In/Out: Blue, arrows icon
  - Adjustment (+/-): Orange, settings icon
  - Return: Purple, undo icon

### 4. Add State Variables for By Product View
Add new state variables after existing state:
- `viewTab: "by-store" | "by-product"` - Tab selection (default: "by-store")
- `productTransactionType: string` - Transaction type filter (default: "all")
- `searchNotes: string` - Notes search text
- `productTransactions: ProductTransaction[]` - Transaction data
- `productSummary: ProductSummary | null` - Summary statistics
- `productViewLoading: boolean` - Loading state
- `productViewPage: number` - Current page (default: 1)
- `productViewPageSize: number` - Page size (default: 25)

### 5. Implement Data Loading for By Product View
Add `loadProductTransactions()` function:
- Check mandatory filters: `hasValidDateRange && hasValidProductCriteria`
- Call mock data generator with filters
- Apply transaction type filter if not "all"
- Apply notes search filter if provided
- Calculate summary statistics
- Update state with results

### 6. Add useEffect for By Product Data Loading
Add effect that triggers on:
- `viewTab === "by-product"`
- `dateRange` changes
- `productIdSearch` or `productNameSearch` changes
- `productTransactionType` changes
- `searchNotes` changes (debounced)

### 7. Update Page Header with Tab Toggle
Replace the header section with:
- Page title "Stock Card"
- `Tabs` component with:
  - `TabsList` containing two `TabsTrigger` items: "By Store", "By Product"
  - `value={viewTab}` and `onValueChange={setViewTab}`
- Keep existing refresh button (context-aware based on active tab)

### 8. Implement By Product Filter Section
Create filter section for By Product view:
- **Row 1**: Date Range (From/To pickers with orange border validation), Product group (ID/Name inputs with orange border)
- **Row 2**: Transaction Type dropdown, Search Notes input
- **Row 3**: Refresh button (disabled until mandatory filters), Clear All, Export CSV (right-aligned)
- Follow existing filter styling patterns from By Store view
- Use `min-w-[160px]` for inputs, `h-10` height

### 9. Implement Product Summary Card
Create summary card component inside By Product view:
- Card with product ID and name header
- 3-column grid for: Opening Balance, Total In (+green), Total Out (-red)
- Prominent Current Balance display below
- Only show when `productSummary` is available

### 10. Implement Transaction History Table
Create transaction table for By Product view:
- Table columns: Date & Time, Transaction Type, Quantity, Balance, Notes
- Date format: `MMM DD, YY HH:mm:ss` using GMT+7
- Transaction Type: Badge with icon and color per config
- Quantity: +/- prefix with color (green positive, red negative, blue transfer, orange adjustment, purple return)
- Balance: Right-aligned number
- Notes: Truncated with tooltip on hover
- Sortable by date (default newest first)

### 11. Implement Pagination for Transaction Table
Add pagination below transaction table:
- Page size selector: 10, 25, 50, 100 options
- Previous/Next buttons
- "Page X of Y" indicator
- "Showing N records" count

### 12. Implement Empty States
Add conditional empty state rendering:
- **No Product Selected**: Show when `viewTab === "by-product"` and `!hasValidProductCriteria`
  - Package icon (64x64), "Select a Product to View Stock Card" message
- **No Transactions Found**: Show when filters complete but `productTransactions.length === 0`
  - Clipboard icon (64x64), "No Transactions Found" message

### 13. Implement CSV Export Handler
Add `handleExportCSV()` function:
- Call `exportStockCardToCSV()` with current transactions, product info, date range
- Disable button when no transactions available
- Include loading state during export

### 14. Implement Mobile/Responsive Layout
Add responsive styling:
- **Desktop (>=1024px)**: Full table, single-row filters, side-by-side summary cards
- **Tablet (768-1023px)**: Horizontal scroll table, two-row filters, stacked summary
- **Mobile (<768px)**: Card-based transaction list (replace table), stacked filters, collapsible summary
- Create `TransactionCard` component for mobile view with all transaction info

### 15. Wire Up Tab Content Switching
Use conditional rendering based on `viewTab`:
- `viewTab === "by-store"`: Show existing store table content
- `viewTab === "by-product"`: Show new By Product view (filters, summary, transactions)
- Both views share the header and tab toggle

### 16. Test and Validate Implementation
- Run `pnpm dev` and verify:
  - Tab toggle switches views correctly
  - By Store view unchanged
  - By Product filters show orange borders when incomplete
  - Refresh disabled until mandatory filters filled
  - Product summary displays correctly
  - Transaction table populates with mock data
  - Pagination works
  - CSV export downloads correctly formatted file
  - Empty states display appropriately
  - Responsive behavior at all breakpoints

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm build` - Ensure no TypeScript or build errors
- `pnpm lint` - Ensure no ESLint errors
- `pnpm dev` - Start dev server and manually test:
  1. Navigate to /inventory-new/stores
  2. Verify "By Store" tab shows existing functionality
  3. Click "By Product" tab
  4. Verify orange borders on date and product filters
  5. Select date range and enter product ID/name
  6. Verify summary card and transaction table appear
  7. Test transaction type and notes filters
  8. Test pagination
  9. Click Export CSV and verify file downloads
  10. Test responsive layout at mobile, tablet, desktop breakpoints

## Notes

### Consistency Requirements
- Follow existing patterns from `transaction-history-section.tsx` for transaction display
- Use existing `InventoryEmptyState` component styling patterns
- Maintain orange border validation pattern already in use on this page
- Use GMT+7 timezone formatting from `lib/utils.ts`

### Transaction Type Mapping
The wireframe specifies different transaction types than the existing `TransactionType` enum. Map as follows:
- Receipt (IN) -> Similar to `stock_in`
- Issue (OUT) -> Similar to `stock_out`
- Transfer In/Out -> Similar to `transfer`
- Adjustment (+/-) -> Similar to `adjustment`
- Return -> Similar to `return`

### Performance Considerations
- Use `useMemo` for filtered/sorted transaction lists
- Debounce notes search input (400ms)
- Virtualize table if >100 rows displayed (optional enhancement)

### Future API Integration
- Mock data generator should match expected API response structure
- Export utility should be API-agnostic (works with mock or real data)
- Filter parameters should match anticipated API query params
