# Chore: Enhance Overview Tab with Manhattan OMS Design

## Metadata
adw_id: `a88306c5`
prompt: `Enhance the Overview tab in Order Detail page (src/components/order-detail-view.tsx) to match Manhattan OMS design with additional fields in each section.`

## Chore Description
Enhance the Overview tab in the Order Detail page to match Manhattan OMS design. This involves restructuring 4 cards (Customer Information, Order Information, Delivery Address, Payment Information) with new fields, reorganized layouts, and a payment breakdown section. The changes include:

1. **Customer Information** - Add Customer Type, Cust Ref fields; rename T1 Number to The1 Member; remove icons from email/phone
2. **Order Information** - Major reorganization with 10+ new fields including Payment Status badge, Order Created timestamp, Full Tax Invoice, Selling Channel, etc.
3. **Delivery Address** - No changes (keep as-is)
4. **Payment Information** - Complete restructure with payment breakdown (Subtotal, Discounts, Charges, Taxes, Total) and PAID/PENDING badge in section title

## Relevant Files
Use these files to complete the chore:

- **src/components/order-detail-view.tsx** - Main file to modify. Contains the Overview tab content with 4 cards (Customer Information, Order Information, Delivery Address, Payment Information). Lines 218-365 contain the Overview TabsContent.
- **src/components/order-management-hub.tsx** - Contains the Order interface and related type definitions (lines 113-130). Must be updated to include new optional fields.
- **src/lib/mock-data.ts** - Contains mock order data generation. Must be updated to include new fields for testing (lines 7-125 for mockApiOrders).
- **src/components/order-badges.tsx** - Contains PaymentStatusBadge component (line 90) which will be reused in Order Information section.

### New Files
None required - all changes are modifications to existing files.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Update Order and Customer Type Interfaces
- In `src/components/order-management-hub.tsx`, add new optional fields to `ApiCustomer` interface:
  - `customerType?: string` - Customer type classification
  - `custRef?: string` - Customer reference number
- Add new optional fields to `ApiPaymentInfo` interface:
  - `subtotal?: number` - Order subtotal before discounts
  - `discounts?: number` - Total discounts applied
  - `charges?: number` - Additional charges
  - `amountIncludedTaxes?: number` - Amount including taxes
  - `amountExcludedTaxes?: number` - Amount excluding taxes
  - `taxes?: number` - Total tax amount
- Add new optional fields to `ApiMetadata` interface:
  - `store_no?: string` - Store number/ID
  - `order_created?: string` - Order creation timestamp
- Add new optional fields to `Order` interface:
  - `fullTaxInvoice?: boolean` - Full tax invoice flag
  - `customerTypeId?: string` - Customer type ID
  - `sellingChannel?: string` - Selling channel (Grab, ShopeeFood, etc.)
  - `allowSubstitution?: boolean` - Allow substitution flag
  - `taxId?: string` - Tax ID for invoicing
  - `companyName?: string` - Company name for B2B orders
  - `branchNo?: string` - Branch number

### 2. Update Mock Data with New Fields
- In `src/lib/mock-data.ts`, update the `mockApiOrders` array generation (starting around line 82) to include:
  - In `customer` object: `customerType`, `custRef`
  - In `payment_info` object: `subtotal`, `discounts`, `charges`, `amountIncludedTaxes`, `amountExcludedTaxes`, `taxes`
  - In `metadata` object: `store_no`, `order_created`
  - At root level: `fullTaxInvoice`, `customerTypeId`, `sellingChannel`, `allowSubstitution`, `taxId`, `companyName`, `branchNo`
- Generate realistic mock values:
  - `customerType`: random from ["RETAIL", "WHOLESALE", "VIP", "CORPORATE"]
  - `custRef`: random string like "CREF-XXXXX"
  - `subtotal`: calculate from items before discounts
  - `discounts`: random 0-15% of subtotal
  - `charges`: random delivery/service charge 0-100 baht
  - `taxes`: 7% VAT calculation
  - `fullTaxInvoice`: random boolean
  - `sellingChannel`: same as channel field
  - `allowSubstitution`: random boolean

### 3. Restructure Customer Information Card
- In `src/components/order-detail-view.tsx`, modify the Customer Information CardContent (lines 228-253):
- Reorder and modify fields to:
  1. **Name** - Keep as-is
  2. **Customer ID** - Keep as-is
  3. **Customer Type** - NEW: `order?.customer?.customerType || '-'`
  4. **Cust Ref** - NEW: `order?.customer?.custRef || '-'`
  5. **Email** - MODIFY: Remove Mail icon, use plain text label-value format
  6. **Phone Number** - MODIFY: Remove Phone icon, use plain text label-value format
  7. **The1 Member** - RENAME from "T1 Number", keep same data source
- Use consistent layout: label in muted color, value below

### 4. Restructure Order Information Card
- Modify the Order Information CardContent (lines 264-304):
- Complete restructure with new field order:
  1. **Order ID** - Rename from "Order Number (ID)", keep copy button
  2. **Payment Status** - MOVED from Payment section, display as PaymentStatusBadge
  3. **Short Order ID** - Rename from "Short Order"
  4. **Store No.** - Rename from "Store", use `order?.metadata?.store_no || order?.metadata?.store_name || '-'`
  5. **Order Created** - NEW: Format as DD/MM/YYYY HH:mm:ss from `order?.metadata?.order_created`
  6. **Order Date** - Keep existing
  7. **Business Unit** - Keep existing
  8. **Order Type** - Keep existing badge
  9. **Full Tax Invoice** - NEW: Display "Yes"/"No" based on `order?.fullTaxInvoice`
  10. **Customer Type ID** - NEW: `order?.customerTypeId || '-'`
  11. **Selling Channel** - NEW: `order?.sellingChannel || order?.channel || '-'`
  12. **Allow Substitution** - NEW: Display "Yes"/"No" based on `order?.allowSubstitution`
  13. **Tax ID** - NEW: `order?.taxId || '-'`
  14. **Company Name** - NEW: `order?.companyName || '-'`
  15. **Branch No.** - NEW: `order?.branchNo || '-'`
- Use 2-column grid layout for better organization

### 5. Restructure Payment Information Card
- Modify the Payment Information Card (lines 337-363):
- Update CardHeader (line 338-342):
  - Add PAID/PENDING badge next to CardTitle
  - Badge color: green for PAID, gray for PENDING
  - Use `order?.payment_info?.status` to determine badge
- Remove existing fields: Payment Method, Payment Status, Transaction ID
- Add payment breakdown section with right-aligned values:
  1. **Subtotal** - `฿${order?.payment_info?.subtotal?.toFixed(2) || '0.00'}`
  2. **Discounts** - `฿${order?.payment_info?.discounts?.toFixed(2) || '0.00'}`
  3. **Charges** - `฿${order?.payment_info?.charges?.toFixed(2) || '0.00'}`
  4. **Amount Included Taxes** - `฿${order?.payment_info?.amountIncludedTaxes?.toFixed(2) || '0.00'}`
  5. **Amount Excluded Taxes** - `฿${order?.payment_info?.amountExcludedTaxes?.toFixed(2) || '0.00'}`
  6. **Taxes** - `฿${order?.payment_info?.taxes?.toFixed(2) || '0.00'}`
  7. **Total** - Make bold/emphasized, use existing `order?.total_amount`
- Layout: left-aligned labels (muted), right-aligned currency values

### 6. Add Helper Function for Date Formatting
- Add a helper function to format order_created timestamp as DD/MM/YYYY HH:mm:ss:
```typescript
const formatOrderCreatedDate = (dateString?: string): string => {
  if (!dateString) return '-'
  try {
    const date = new Date(dateString)
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    const seconds = String(date.getSeconds()).padStart(2, '0')
    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`
  } catch {
    return '-'
  }
}
```

### 7. Verify Build and Type Safety
- Run `pnpm build` to ensure no TypeScript errors
- Verify all new optional fields are properly typed
- Ensure all dash fallbacks are working for empty/null values

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm build` - Verify TypeScript compilation and build succeeds
- `pnpm dev` - Start development server and navigate to Order Management Hub, select an order to view Order Detail page, verify Overview tab displays correctly
- Visual verification checklist:
  - Customer Information shows all 7 fields in correct order (Name, Customer ID, Customer Type, Cust Ref, Email, Phone Number, The1 Member)
  - Order Information shows all 15 fields with Payment Status badge
  - Delivery Address unchanged
  - Payment Information shows PAID/PENDING badge in title and payment breakdown with right-aligned currency values

## Notes
- All new fields are optional with dash '-' fallback for empty values
- Maintain responsive 2-column desktop / 1-column mobile grid layout
- Currency formatting uses Thai Baht (฿) with 2 decimal places
- PaymentStatusBadge component is reused from order-badges.tsx
- The Order type is defined in order-management-hub.tsx and exported for use in order-detail-view.tsx
