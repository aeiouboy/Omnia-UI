# Chore: Add Available Transaction History Section to Inventory Detail Page

## Metadata
adw_id: `18db0b79`
prompt: `Add 'Available Transaction history' section to inventory detail page showing comprehensive transaction history with support for multiple transaction types (stock in/out, adjustments, transfers, allocations, returns). Include date/time (GMT+7), transaction type, reference number, quantity with +/- indicators, balance after, warehouse, user, and notes. Implement pagination, date range filtering, transaction type filtering, and CSV/Excel export. Ensure mobile responsiveness with horizontal scroll. Follow requirements from docs/task/inv-3-transaction-history.md`

## Chore Description
This chore adds a comprehensive "Available Transaction History" section to the inventory detail page (`/inventory/[id]`). The new section will display all historical transactions for an inventory item with advanced filtering, pagination, and export capabilities.

Key features include:
- Full transaction history table (not limited to "Recent" transactions)
- Support for 6 transaction types: Stock In, Stock Out, Adjustments, Transfers, Allocations, Returns
- Date/Time display in GMT+7 (Asia/Bangkok) timezone
- Transaction type with visual indicators and color-coded badges
- Reference number linking (PO, SO, Transfer ID, Order ID)
- Quantity with +/- indicators based on transaction direction
- Balance after each transaction
- Warehouse/Location display
- User who performed the transaction
- Notes/Remarks
- Pagination with configurable page sizes
- Date range filtering using calendar picker
- Transaction type filter dropdown
- CSV and Excel export functionality
- Mobile-responsive table with horizontal scroll

## Relevant Files
Use these files to complete the chore:

### Existing Files to Modify
- **`src/components/inventory-detail-view.tsx`** - Main component to add the new TransactionHistorySection below the existing RecentTransactionsTable
- **`src/lib/inventory-service.ts`** - Add `fetchTransactionHistory()` function with pagination, date filtering, and transaction type filtering
- **`src/lib/mock-inventory-data.ts`** - Extend `generateMockTransactions()` to support transfer and allocation types, and add pagination/filtering support
- **`src/types/inventory.ts`** - Extend `TransactionType` to include 'transfer' and 'allocation' types, add `TransactionHistoryResponse` interface
- **`src/lib/export-utils.ts`** - Add `exportTransactionsToExcel()` function using xlsx library patterns
- **`app/inventory/[id]/page.tsx`** - Update data fetching to support transaction history with filters

### New Files to Create
- **`src/components/inventory/transaction-history-section.tsx`** - New comprehensive transaction history component with:
  - Date range picker using existing Calendar component
  - Transaction type filter dropdown
  - Paginated table with all required columns
  - CSV/Excel export buttons
  - Loading skeleton
  - Empty state
  - Error state with retry
  - Mobile-responsive horizontal scroll

### Reference Files (Read Only)
- **`src/components/recent-transactions-table.tsx`** - Reference for existing transaction display patterns, badges, icons
- **`src/lib/utils.ts`** - Use `formatGMT7Time()` for GMT+7 date formatting
- **`src/components/ui/calendar.tsx`** - Existing calendar component for date picker
- **`src/components/order-management-hub.tsx`** - Reference for pagination patterns and export functionality
- **`docs/task/inv-3-transaction-history.md`** - Complete requirements specification

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Extend TypeScript Types
- Add 'transfer' and 'allocation' to `TransactionType` union in `src/types/inventory.ts`
- Create `TransactionHistoryFilters` interface with: `page`, `pageSize`, `dateFrom`, `dateTo`, `transactionType`
- Create `TransactionHistoryResponse` interface with: `transactions`, `total`, `page`, `pageSize`, `totalPages`
- Update `StockTransaction` interface to include optional `transfer_from`, `transfer_to`, `allocation_type` fields

### 2. Extend Mock Data Generation
- Update `generateMockTransactions()` in `src/lib/mock-inventory-data.ts` to:
  - Include 'transfer' and 'allocation' transaction types
  - Generate transfer-specific fields (from/to warehouse)
  - Generate allocation-specific fields (allocation type)
  - Support larger datasets (50-100 transactions per product)
- Create `filterMockTransactions()` helper function to support:
  - Date range filtering
  - Transaction type filtering
  - Pagination

### 3. Add Inventory Service Functions
- Create `fetchTransactionHistory()` function in `src/lib/inventory-service.ts`:
  - Accept `productId` and `TransactionHistoryFilters` parameters
  - Implement pagination logic (page, pageSize)
  - Implement date range filtering (dateFrom, dateTo)
  - Implement transaction type filtering
  - Return `TransactionHistoryResponse`
  - Use mock data with filtering when Supabase unavailable
  - Include TODO for Supabase implementation

### 4. Add Excel Export Utility
- Add `exportTransactionsToExcel()` function in `src/lib/export-utils.ts`:
  - Use similar pattern to existing `exportToCSV()`
  - Format date/time in GMT+7
  - Include all transaction columns
  - Generate filename with product name and date
  - Create Excel-compatible format (or enhanced CSV with BOM for Excel compatibility)

### 5. Create Transaction History Section Component
- Create `src/components/inventory/transaction-history-section.tsx`:
  - Import required UI components (Card, Table, Button, Select, Calendar, Popover, Badge, Skeleton)
  - Import date utilities from `@/lib/utils` for GMT+7 formatting
  - Implement component with props: `productId`, `productName`, `itemType`, `storeContext?`
  - Add state for: `page`, `pageSize`, `dateRange`, `transactionTypeFilter`, `loading`, `error`, `data`
  - Implement date range picker using Calendar + Popover pattern
  - Implement transaction type filter dropdown with options: All, Stock In, Stock Out, Adjustment, Transfer, Allocation, Return
  - Implement pagination controls with page size options (10, 25, 50, 100)
  - Create responsive table with horizontal scroll using `overflow-x-auto`
  - Display columns: Date/Time (GMT+7), Type (with icon/badge), Reference No (with link), Quantity (+/-), Balance, Warehouse, User, Notes
  - Add CSV and Excel export buttons
  - Add loading skeleton state
  - Add empty state for no transactions
  - Add error state with retry button
  - Ensure 44px minimum touch targets for mobile

### 6. Integrate Component into Inventory Detail View
- Import `TransactionHistorySection` in `src/components/inventory-detail-view.tsx`
- Add section after `RecentTransactionsTable` component
- Pass required props: `productId={item.id}`, `productName={item.productName}`, `itemType={item.itemType}`, `storeContext={storeContext}`
- Remove or keep `RecentTransactionsTable` based on UI design (recommend keeping for quick overview, new section for full history)

### 7. Update Page Data Fetching (Optional Enhancement)
- Consider updating `app/inventory/[id]/page.tsx` to support URL-based filter state
- Add search params for date range and transaction type persistence
- This enables shareable filtered views

### 8. Validate Implementation
- Run `pnpm dev` to start development server
- Navigate to `/inventory/[id]` (any inventory item)
- Verify:
  - Transaction History section appears below Recent Transactions
  - Date range picker works correctly
  - Transaction type filter works correctly
  - Pagination controls work (navigate pages, change page size)
  - All transaction types display with correct icons/badges
  - Quantities show correct +/- indicators
  - Dates display in GMT+7 format
  - CSV export downloads correctly formatted file
  - Excel export downloads correctly formatted file
  - Table scrolls horizontally on mobile
  - No console errors
- Run `pnpm build` to verify no TypeScript/build errors

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm dev` - Start development server and manually test the feature at `/inventory/INV-001`
- `pnpm build` - Verify production build succeeds with no TypeScript errors
- `pnpm lint` - Run ESLint to check for code quality issues

## Notes

### Transaction Type Configuration
| Type | Icon | Badge Color | Quantity Direction |
|------|------|-------------|-------------------|
| stock_in | ArrowUp | Green | + |
| stock_out | ArrowDown | Red | - |
| adjustment | RefreshCw | Blue | +/- (depends on quantity sign) |
| transfer | ArrowLeftRight | Purple | - (from) / + (to) |
| allocation | Lock | Orange | - (allocated) |
| return | RotateCcw | Purple | + |

### GMT+7 Date Formatting
Use `formatGMT7Time()` from `@/lib/utils.ts` with options:
```typescript
formatGMT7Time(timestamp, {
  year: 'numeric',
  month: 'short',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false
})
```

### Mobile Responsiveness
- Wrap table in `<div className="overflow-x-auto">`
- Use `min-w-[800px]` on table for consistent column widths
- Hide less critical columns on smaller screens using `className="hidden lg:table-cell"`
- Ensure touch targets are at least 44px for buttons and controls

### Reference ID Linking
- For stock_out with ORD-{number} pattern: Link to `/orders/{number}`
- For stock_in with PO-{number} pattern: Display as text (no link unless PO detail page exists)
- For transfers with TRF-{number} pattern: Display as text
- For other references: Display as plain text

### Store Context Filtering
When `storeContext` prop is provided, filter transactions to only show those from warehouses associated with that store (same logic as existing `RecentTransactionsTable`).
