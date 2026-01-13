# Task 2: Inventory Detail - Allocate by Order Transactions

## Objective
Add a new section showing transaction details for allocations by order

## Requirements
- Create a new section titled "Transaction about allocate by order"
- Display allocation transactions in a tabular format
- Include relevant fields:
  - Order ID/Number
  - Allocation Date/Time
  - Quantity Allocated
  - Warehouse/Location
  - Status
  - User who performed allocation
- Implement proper data fetching from backend API
- Add loading states and error handling
- Ensure mobile responsiveness

## Data Structure
```typescript
interface AllocateByOrderTransaction {
  id: string
  order_id: string
  order_no: string
  allocated_at: string
  quantity: number
  warehouse_id: string
  warehouse_name: string
  status: 'pending' | 'confirmed' | 'cancelled'
  allocated_by: string
  allocated_by_name: string
}
```

## API Endpoint (to be implemented or connected)
- GET `/api/inventory/:item_id/allocate-transactions`

## UI Components Needed
- Table/Card component for transactions
- Loading skeleton
- Empty state message
- Error state with retry
- Mobile responsive layout

## Success Criteria
- [ ] Section displays on inventory detail page
- [ ] Table shows all required fields
- [ ] Data fetches correctly from API
- [ ] Loading state shows while fetching
- [ ] Error handling works properly
- [ ] Mobile responsive table/cards
- [ ] No console errors

## ADW Execution
```bash
./adws/adw_chore_implement.py "Add 'Transaction about allocate by order' section to inventory detail page with tabular display showing order ID, allocation date/time, quantity, warehouse, status, and user. Include API integration, loading states, error handling, and mobile responsiveness." --model opus
```
