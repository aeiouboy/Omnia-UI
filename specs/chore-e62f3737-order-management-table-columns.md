# Chore: Update Order Management Table Columns

## Metadata
adw_id: `e62f3737`
prompt: `Update Order Management table in src/components/order-management-hub.tsx to display these columns in order: Order Number, Customer Name, Email, Phone Number, Order Total, Store No, Order Status, SLA Status, Return Status, On Hold, Order Type, Payment Status, Confirmed, Channel, Allow Substitution, Created Date. Add missing columns: Customer Name (from order.customer.name or customer_name), Email (from order.customer.email or email), Phone Number (from order.customer.phone or phone_number), Store No (from order.store_no or store_id or fulfillment_store), Order Type (uncomment from FMS Extended Columns or add from order.order_type). Update both TableHeader and TableBody sections consistently. Ensure colSpan for empty state matches the new column count of 16.`

## Chore Description
This chore updates the Order Management table to display 16 columns in a specific order. The current table has 11 columns and is missing Customer Name, Email, Phone Number, Store No, and Order Type. The Order Type column exists but is commented out in the "FMS Extended Columns" section. The task requires:

1. Reordering existing columns to match the specified order
2. Adding 4 new columns: Customer Name, Email, Phone Number, Store No
3. Uncommenting the Order Type column from FMS Extended Columns
4. Updating the `mapOrderToTableRow` function to include the new fields
5. Updating the empty state `colSpan` from 11 to 16

## Relevant Files
Use these files to complete the chore:

- **src/components/order-management-hub.tsx** - Main file containing the Order Management table. Contains:
  - `mapOrderToTableRow` function at line ~1097 - needs new field mappings
  - `TableHeader` section at lines 1659-1716 - needs column reordering and additions
  - `TableBody` section at lines 1717-1787 - needs cell reordering and additions
  - Empty state `colSpan` at line 1720 - needs update from 11 to 16

- **src/components/order-badges.tsx** - Contains `OrderTypeBadge` component (already imported)

### Data Source References
The Order interface (line 218) and ApiCustomer interface (line 44) show available fields:
- `order.customer.name` - Customer name
- `order.customer.email` - Customer email
- `order.customer.phone` - Customer phone number
- `order.metadata?.store_no` - Store number
- `order.order_type` or `order.orderType` - Order type

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Update mapOrderToTableRow Function
- Add `customerName` field: `customerName: order.customer?.name ?? ""`
- Add `customerEmail` field: `customerEmail: order.customer?.email ?? ""`
- Add `customerPhone` field: `customerPhone: order.customer?.phone ?? ""`
- Add `storeNo` field: `storeNo: order.metadata?.store_no ?? order.store_no ?? ""`
- The `orderType` field already exists at line 1118

### 2. Update TableHeader Section (lines 1659-1715)
Reorder and add columns in this exact sequence:
1. Order Number (exists)
2. Customer Name (NEW)
3. Email (NEW)
4. Phone Number (NEW)
5. Order Total (exists, move from position 2)
6. Store No (NEW)
7. Order Status (exists, move from position 3)
8. SLA Status (exists, move from position 4)
9. Return Status (exists, move from position 5)
10. On Hold (exists, move from position 6)
11. Order Type (uncomment from FMS Extended Columns)
12. Payment Status (exists, move from position 7)
13. Confirmed (exists, move from position 8)
14. Channel (exists, move from position 9)
15. Allow Substitution (exists, move from position 10)
16. Created Date (exists, move from position 11)

### 3. Update TableBody Section (lines 1725-1786)
Match the TableHeader order with corresponding TableCell elements:
1. Order Number: `{order.id}` (exists)
2. Customer Name: `{order.customerName || "-"}` (NEW)
3. Email: `{order.customerEmail || "-"}` (NEW)
4. Phone Number: `{order.customerPhone || "-"}` (NEW)
5. Order Total: `฿{order.total_amount?.toLocaleString() || "0"}` (exists)
6. Store No: `{order.storeNo || "-"}` (NEW)
7. Order Status: `<OrderStatusBadge status={order.status} />` (exists)
8. SLA Status: `<SLABadge ... />` (exists)
9. Return Status: `<ReturnStatusBadge status={order.returnStatus} />` (exists)
10. On Hold: `<OnHoldBadge onHold={order.onHold} />` (exists)
11. Order Type: `<OrderTypeBadge orderType={order.orderType} />` (uncomment)
12. Payment Status: `<PaymentStatusBadge status={order.paymentStatus} />` (exists)
13. Confirmed: `{order.confirmed ? "Yes" : "No"}` (exists)
14. Channel: `<ChannelBadge channel={order.channel} />` (exists)
15. Allow Substitution: `{order.allowSubstitution ? "Yes" : "No"}` (exists)
16. Created Date: `{order.createdDate}` (exists)

### 4. Update Empty State colSpan
- Change `colSpan={11}` to `colSpan={16}` at line 1720

### 5. Remove FMS Extended Columns Comments
- Remove the comment markers around Order Type in TableHeader (lines 1687-1689)
- Remove the comment markers around Order Type in TableBody (lines 1763-1765)
- Keep other FMS Extended Columns (Delivery Type, Payment Type, etc.) commented out

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm build` - Verify TypeScript compilation succeeds with no errors
- `pnpm dev` - Start development server and visually verify:
  1. Table displays all 16 columns in correct order
  2. Customer Name, Email, Phone, Store No columns show data or "-" placeholder
  3. Order Type column shows badge with appropriate styling
  4. Empty state message spans all 16 columns correctly

## Notes
- The `OrderTypeBadge` component is already imported at line 21
- The `orderType` field is already mapped in `mapOrderToTableRow` at line 1118
- Customer data comes from `order.customer` object (ApiCustomer interface)
- Store number comes from `order.metadata?.store_no` (ApiMetadata interface)
- Consider adding `text-ellipsis overflow-hidden` classes to Email column for long email addresses
- Phone Number column should use `min-w-[120px]` to accommodate international formats
