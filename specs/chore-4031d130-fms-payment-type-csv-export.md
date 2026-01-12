# Chore: Add Payment Type Column and Update CSV Export for FMS 19-Column Format

## Metadata
adw_id: `4031d130`
prompt: `Add missing Payment Type column to UI and ensure CSV export matches FMS 19-column format.`

## Chore Description
The FMS implementation is mostly complete with 7 of 8 FMS columns already implemented. This chore completes the UI by adding the Payment Type column and updates the CSV export function to match the exact 19-column FMS Order Fulfillment.xlsx format.

**Current State:**
- UI has 7 FMS columns: Order Type, Delivery Type, Request Tax, Delivery Time Slot, Delivered Time, Settlement Type, Allow Substitution
- Missing: Payment Type column (after Delivery Type)
- CSV export has 20 columns but does not match FMS format exactly

**Target State:**
- UI: Add Payment Type column (8th FMS column)
- CSV: Exact 19-column format matching FMS Order Fulfillment.xlsx
- Payment Method filter: Updated with FMS-specific values

## Relevant Files
Use these files to complete the chore:

### Primary Files to Modify
- `src/components/order-management-hub.tsx` - Main component containing:
  - Order/ApiOrder interfaces (lines 152-228) - Add paymentType and financial fields
  - Table headers (lines 1564-1623) - Add Payment Type column header
  - Table cells (lines 1672-1687) - Add Payment Type cell with badge
  - exportOrdersToCSV function (lines 1418-1530) - Rewrite to match FMS 19-column format
  - Payment Method filter (lines 2095-2115) - Update filter options
  - Mock data generation (lines 294-350) - Add new field mock data

- `src/components/order-badges.tsx` - Badge components (lines 1-300)
  - Add new PaymentTypeBadge component for displaying payment type

### Reference Files (Read Only)
- `docs/config_stock/sample_file/Order Fulfillment.xlsx` - FMS format reference (binary, reference from prompt)
- `specs/chore-4ebca4cd-fms-order-management-fields.md` - Previous FMS implementation spec

### New Files
- No new files needed - all changes are modifications to existing files

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Add PaymentTypeBadge Component to order-badges.tsx
Add a new badge component to display payment types with appropriate colors:
- Import CreditCard or similar icon from lucide-react if needed
- Create `PaymentTypeBadge` component after `OrderTypeBadge` (around line 300)
- Handle payment types:
  - Cash on Delivery → "COD" (green badge)
  - Credit Card on Delivery → "CC-OD" (blue badge)
  - 2C2P-Credit-Card → "2C2P" (purple badge)
  - QR PromptPay → "QR" (cyan badge)
  - T1C Redeem Payment → "T1C" (orange badge)
  - Lazada Payment → "Lazada" (blue badge)
  - Shopee Payment → "Shopee" (orange badge)
  - Combined values (e.g., "Cash on Delivery + T1C Redeem Payment") → Show abbreviated combo

### 2. Update Order Interface with New Fields
Add new fields to both `ApiOrder` and `Order` interfaces in `order-management-hub.tsx`:
```typescript
// Add after existing FMS Extended Fields
paymentType?: string  // e.g., 'Cash on Delivery', '2C2P-Credit-Card + T1C Redeem Payment'
customerPayAmount?: number
customerRedeemAmount?: number
orderDeliveryFee?: number
```

### 3. Add Payment Type Column to Table Header
In the table header section (around line 1601-1603), add Payment Type column after Delivery Type:
```tsx
<TableHead className="font-heading text-deep-navy min-w-[130px] text-sm font-semibold">
  Payment Type
</TableHead>
```
- Update colspan in empty state from 19 to 20 (line 1628)

### 4. Add Payment Type Cell to Table Body
In the table body section (around line 1676-1678), add Payment Type cell after Delivery Type:
```tsx
<TableCell>
  <PaymentTypeBadge paymentType={order.paymentType} />
</TableCell>
```
- Import PaymentTypeBadge in the component imports (line 18-22)

### 5. Update Payment Method Filter Options
Update the Payment Method filter dropdown (lines 2095-2115) with FMS values:
- Remove: Credit Card, Cash, Wallet, QR Code (generic values)
- Add: Lazada Payment, Shopee Payment
- Keep: Cash on Delivery, Credit Card on Delivery, 2C2P Credit-Card, QR Payment (rename to QR PromptPay), T1C Redeem Payment

### 6. Update exportOrdersToCSV Function for FMS 19-Column Format
Completely rewrite the CSV headers and row mapping (lines 1465-1510) to match exact FMS format:

**Headers (exactly 19 columns in this order):**
1. Order No
2. Store Id
3. Store Name
4. Status
5. Request Full Tax
6. Customer Name
7. Order Type
8. Delivery Type
9. Order Date
10. Payment Date
11. Delivery Time Slot
12. Delivery Date
13. Payment Type
14. Customer Pay Amount
15. Customer Redeem Amount
16. Order Delivery Fee
17. VAT Amount
18. Discount
19. Total Amount

**Date format:** DD-MM-YYYY HH:mm:ss (not the default YYYY-MM-DD format)
**Delivery Time Slot format:** DD-MM-YYYY HH:mm-HH:mm
**Number format:** 2 decimal places for all amounts

### 7. Add Date Formatting Helper for FMS Format
Add a new date formatting function for FMS export format:
```typescript
const formatDateForFMSExport = (dateString: string | undefined): string => {
  if (!dateString) return ""
  try {
    const date = new Date(dateString)
    // Format: DD-MM-YYYY HH:mm:ss
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    const seconds = String(date.getSeconds()).padStart(2, '0')
    return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`
  } catch {
    return dateString || ""
  }
}
```

### 8. Update Mock Data Generation for New Fields
In the mock data generation section (around lines 294-350), add:
```typescript
// Payment types with T1C combination
const paymentTypes = [
  'Cash on Delivery',
  'Credit Card on Delivery',
  '2C2P-Credit-Card',
  'QR PromptPay',
  'T1C Redeem Payment',
  'Cash on Delivery + T1C Redeem Payment',
  '2C2P-Credit-Card + T1C Redeem Payment'
]
demoOrder.paymentType = paymentTypes[index % paymentTypes.length]

// Financial fields
const hasRedemption = index % 3 === 0 // ~30% of orders
demoOrder.customerRedeemAmount = hasRedemption ? Math.floor(Math.random() * 500) : 0
demoOrder.orderDeliveryFee = [0, 40, 60, 80][index % 4]
demoOrder.customerPayAmount = (demoOrder.total_amount || 0) - (demoOrder.customerRedeemAmount || 0)

// Payment date: same as or shortly after order date
if (demoOrder.order_date || demoOrder.metadata?.created_at) {
  const orderDate = new Date(demoOrder.order_date || demoOrder.metadata?.created_at || '')
  orderDate.setMinutes(orderDate.getMinutes() + Math.floor(Math.random() * 30))
  demoOrder.paymentDate = orderDate.toISOString()
}

// Delivery date: only for DELIVERED status
if (demoOrder.status === 'DELIVERED') {
  const orderDate = new Date(demoOrder.order_date || demoOrder.metadata?.created_at || '')
  orderDate.setHours(orderDate.getHours() + Math.floor(Math.random() * 48) + 2)
  demoOrder.deliveryDate = orderDate.toISOString()
}
```

### 9. Update Table Row Mapping
In the ordersToShow mapping (check for mapOrderToTableRow or similar), ensure new fields are included:
- paymentType
- Add to the order object passed to table rows

### 10. Validate the Implementation
- Run `pnpm dev` to start development server
- Verify Payment Type column displays correctly with badge
- Test Payment Method filter works with new FMS options
- Export CSV and verify:
  - Exactly 19 columns in correct order
  - Date format is DD-MM-YYYY HH:mm:ss
  - All numeric amounts have 2 decimal places
  - Column headers match FMS exactly

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm lint` - Verify no ESLint errors
- `pnpm build` - Verify production build succeeds with no TypeScript errors
- `pnpm dev` - Start development server and manually verify:
  - Payment Type column appears in table after Delivery Type
  - Payment Type badge shows correct abbreviation and color
  - Payment Method filter dropdown has FMS values (Lazada Payment, Shopee Payment added)
  - CSV export has exactly 19 columns
  - CSV column order matches FMS format exactly
  - CSV dates are in DD-MM-YYYY HH:mm:ss format
  - CSV amounts have 2 decimal places

## Notes
- Do NOT add extra columns to UI table beyond Payment Type (keep it clean)
- Payment Type is different from Payment Method - Payment Type is what's displayed in the column
- The CSV format must match FMS Order Fulfillment.xlsx exactly for import compatibility
- Combined payment types (e.g., "Cash on Delivery + T1C Redeem Payment") should display abbreviated in UI but full in CSV
- Mock data should only be generated in development mode
- Financial fields (customerPayAmount, customerRedeemAmount, orderDeliveryFee) are primarily for CSV export
- Request Full Tax in CSV should output "Yes" or "No" (not boolean)
- Empty Delivery Date for non-DELIVERED orders (not "N/A" or "-")
