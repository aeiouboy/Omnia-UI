# Task 3: Inventory Detail - Available Transaction History

## Objective
Add comprehensive transaction history section to inventory detail page

## Requirements
- Create a new section titled "Available Transaction history"
- Display all historical transactions for the inventory item
- Support multiple transaction types:
  - Stock In (Receiving)
  - Stock Out (Shipment)
  - Adjustments (Increase/Decrease)
  - Transfers (Between locations)
  - Allocations
  - Returns
- Include fields:
  - Transaction Date/Time (GMT+7)
  - Transaction Type
  - Reference Number (PO, SO, Transfer ID, etc.)
  - Quantity (with +/- indicator)
  - Balance After Transaction
  - Location/Warehouse
  - User who performed transaction
  - Notes/Remarks
- Implement pagination or infinite scroll for large datasets
- Add date range filtering
- Add transaction type filtering
- Export functionality (CSV/Excel)
- Mobile responsive table with horizontal scroll

## Data Structure
```typescript
interface TransactionHistory {
  id: string
  transaction_date: string
  transaction_type: 'stock_in' | 'stock_out' | 'adjustment' | 'transfer' | 'allocation' | 'return'
  reference_no: string
  quantity: number
  balance_after: number
  warehouse_id: string
  warehouse_name: string
  performed_by: string
  performed_by_name: string
  notes?: string
}
```

## API Endpoint (to be implemented or connected)
- GET `/api/inventory/:item_id/transaction-history?page=1&limit=50&dateFrom=&dateTo=&type=`

## UI Components Needed
- Transaction history table with pagination
- Date range filter (date picker)
- Transaction type filter (dropdown/select)
- Export button (CSV/Excel)
- Loading skeleton
- Empty state
- Error state with retry
- Mobile responsive horizontal scroll table

## Success Criteria
- [ ] Section displays on inventory detail page
- [ ] All transaction types shown correctly
- [ ] Quantity shows +/- indicators
- [ ] Date/time in GMT+7 format
- [ ] Pagination works correctly
- [ ] Date range filter functional
- [ ] Transaction type filter functional
- [ ] Export to CSV/Excel works
- [ ] Mobile responsive with horizontal scroll
- [ ] No console errors

## ADW Execution
```bash
./adws/adw_chore_implement.py "Add 'Available Transaction history' section to inventory detail page showing comprehensive transaction history with support for multiple transaction types (stock in/out, adjustments, transfers, allocations, returns). Include date/time (GMT+7), transaction type, reference number, quantity with +/- indicators, balance after, warehouse, user, and notes. Implement pagination, date range filtering, transaction type filtering, and CSV/Excel export. Ensure mobile responsiveness with horizontal scroll." --model opus
```
