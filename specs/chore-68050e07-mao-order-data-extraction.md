# Chore: Extract REAL MAO Order Data and Update Mock Data

## Metadata
adw_id: `68050e07`
prompt: `Extract REAL data from the MAO (Manhattan Active Omni) order pages and update the mock data for order W1156260115052036 by mapping each MAO field to the correct existing Omnia-UI field.`

## Chore Description
Extract real order data from Manhattan Active Omni (MAO) system for order W1156260115052036 and update the mock data in `src/lib/mock-data.ts`. The task requires:

1. Navigate to MAO Order Status page and extract all visible data fields
2. Navigate to MAO Audit Trail page and extract audit trail entries
3. Analyze reference screenshot for additional data fields
4. Map MAO fields to existing Omnia-UI Order interface fields (NO NEW FIELDS)
5. Replace ALL mock/fake values with REAL values from MAO
6. Validate the updated order displays correctly

**IMPORTANT CONSTRAINTS:**
- DO NOT create new fields in Order interface
- DO NOT modify existing field names
- ONLY update VALUES with data extracted from MAO
- Use EXACT values as shown in MAO (copy-paste where possible)
- If MAO has a field that doesn't exist in Omnia-UI, document it but don't add it
- If Omnia-UI has a field that MAO doesn't show, leave it as null or undefined

## Relevant Files
Use these files to complete the chore:

### Files to Read/Analyze
- `src/lib/mock-data.ts` - Contains the existing maoOrderW1156260115052036 mock order (lines 2997-3616)
- `src/components/order-management-hub.tsx` - Contains Order interface definition (lines 215-263)
- `src/types/payment.ts` - Payment type definitions
- `src/types/delivery.ts` - Delivery type definitions
- `src/types/audit.ts` - Audit trail type definitions
- `/Users/naruechon/Downloads/screencapture-crcpp-omni-manh-omnifacade-2026-01-16-01_31_30.png` - Reference screenshot

### Files to Modify
- `src/lib/mock-data.ts` - Update maoOrderW1156260115052036 with REAL MAO data

### DO NOT Modify
- `src/types/` - Don't add new types
- `src/components/order-management-hub.tsx` - Don't change Order interface
- `src/components/order-detail/*` - Don't change components

### MAO Pages to Extract Data From
1. Order Status Page: https://crcpp.omni.manh.com/customerengagementfacade/app/orderstatus?orderId=W1156260115052036&selectedOrg=CFR
2. Audit Trail Page: https://crcpp.omni.manh.com/omnifacade/#/order (navigate to audit section)

### Existing Omnia-UI Order Interface Fields (lines 215-263 of order-management-hub.tsx)
```typescript
export interface Order {
  // Core fields
  id: string
  order_no: string
  customer: ApiCustomer
  order_date: string
  channel: string
  business_unit: string
  order_type: string
  total_amount: number
  shipping_address: ApiShippingAddress
  payment_info: ApiPaymentInfo
  sla_info: ApiSLAInfo
  metadata: ApiMetadata
  items: ApiOrderItem[]
  status: string
  on_hold?: boolean
  fullTaxInvoice?: boolean
  customerTypeId?: string
  sellingChannel?: string
  allowSubstitution?: boolean
  allow_substitution?: boolean
  taxId?: string
  companyName?: string
  branchNo?: string
  deliveryMethods?: DeliveryMethod[]
  orderType?: FMSOrderType
  deliveryType?: FMSDeliveryType
  deliveryTimeSlot?: DeliveryTimeSlot
  deliveredTime?: string
  settlementType?: FMSSettlementType
  paymentDate?: string
  deliveryDate?: string
  paymentType?: string
  customerPayAmount?: number
  customerRedeemAmount?: number
  orderDeliveryFee?: number
  deliveryTypeCode?: DeliveryTypeCode
  // MAO Extended Fields
  organization?: string
  paymentDetails?: PaymentTransaction[]
  orderDiscounts?: OrderDiscount[]
  promotions?: Promotion[]
  couponCodes?: CouponCode[]
  pricingBreakdown?: PricingBreakdown
  auditTrail?: ManhattanAuditEvent[]
  currency?: string
}
```

### Current Mock Order Structure (lines 3193-3613 of mock-data.ts)
The existing `maoOrderW1156260115052036` object contains:
- Order header (id, order_no, organization, order_date, business_unit, etc.)
- Customer information (id, name, email, phone, customerType, etc.)
- Shipping address (street, city, state, postal_code, country)
- Line items array (4 items with product details, quantities, prices, etc.)
- Pricing breakdown (subtotal, discounts, taxes, shipping fee, grand total)
- Payment information (method, status, transaction_id, etc.)
- Delivery methods and delivery type code
- SLA information
- Metadata (created_at, updated_at, priority, store_name, etc.)
- Audit trail (12 events with timestamps)

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Manual MAO Data Extraction (Due to Authentication Required)
- **Note**: The MAO system requires authentication (https://crcpp.omni.manh.com/auth/realms/maactive/protocol/openid-connect/auth)
- **Action**: User must manually login to MAO and extract the following data for order W1156260115052036:

**Order Header Fields:**
- Order Number: order_no (currently 'W1156260115052036')
- Order Date: order_date (currently '2026-01-09T10:30:00+07:00')
- Status: status (currently 'DELIVERED')
- Organization: organization (currently 'CFR')
- Business Unit: business_unit (currently 'Retail')
- Selling Channel: sellingChannel/channel (currently 'web')

**Customer Information:**
- Customer ID: customer.id (currently 'CUST-W115626')
- Customer Name: customer.name (currently 'สมชาย ใจดี')
- Customer Email: customer.email (currently 'somchai.jaidei@example.com')
- Customer Phone: customer.phone (currently '+66812345678')
- Customer Type: customer.customerType (currently 'Tier 1 Login')

**Shipping Address:**
- Street: shipping_address.street (currently '123/45 สุขุมวิท ซอย 39')
- City: shipping_address.city (currently 'กรุงเทพมหานคร')
- State: shipping_address.state (currently 'วัฒนา')
- Postal Code: shipping_address.postal_code (currently '10110')
- Country: shipping_address.country (currently 'Thailand')

**Line Items (4 items):**
For EACH item, extract:
- Product SKU: items[].product_sku
- Product Name: items[].product_name
- Thai Name: items[].thaiName
- Barcode: items[].barcode
- Ordered Qty: items[].orderedQty
- Fulfilled Qty: items[].fulfilledQty
- Unit Price: items[].unit_price
- Total Price: items[].total_price
- UOM: items[].uom
- Location: items[].location
- Fulfillment Status: items[].fulfillmentStatus
- Shipping Method: items[].shippingMethod
- Weight: items[].weight (if applicable)
- Actual Weight: items[].actualWeight (if applicable)

**Pricing Information:**
- Subtotal: pricingBreakdown.subtotal (currently 345.00)
- Order Discount: pricingBreakdown.orderDiscount (currently 34.50)
- Line Item Discount: pricingBreakdown.lineItemDiscount (currently 25.00)
- Tax Amount: pricingBreakdown.taxAmount (currently 22.40)
- Shipping Fee: pricingBreakdown.shippingFee (currently 40.00)
- Additional Fees: pricingBreakdown.additionalFees (currently 5.00)
- Grand Total: pricingBreakdown.grandTotal (currently 352.90)

**Payment Information:**
- Payment Method: payment_info.method (currently 'CREDIT_CARD')
- Payment Status: payment_info.status (currently 'PAID')
- Transaction ID: payment_info.transaction_id (currently 'TXN-W115626-001')

**Delivery Information:**
- Delivery Type Code: deliveryTypeCode (currently 'RT-HD-EXP')
- Delivery Methods: deliveryMethods[] array

**Promotions/Coupons:**
- Promotions: promotions[] array
- Coupon Codes: couponCodes[] array

**SLA Information:**
- Target Minutes: sla_info.target_minutes (currently 180)
- Elapsed Minutes: sla_info.elapsed_minutes (currently 45)
- Status: sla_info.status (currently 'COMPLIANT')

**Metadata:**
- Created At: metadata.created_at (currently '2026-01-09T10:30:00+07:00')
- Updated At: metadata.updated_at (currently '2026-01-09T11:15:00+07:00')
- Priority: metadata.priority (currently 'NORMAL')
- Store Name: metadata.store_name (currently 'Tops Central World')
- Store No: metadata.store_no (currently 'STR-1001')

**Audit Trail:**
- Extract ALL audit trail entries with exact timestamps
- Each entry should have: updatedBy, updatedOn, entityName, entityId, changedParameter, oldValue, newValue

### 2. Document Extracted MAO Data
- Create a temporary document with ALL extracted values
- Ensure exact text/values are copied from MAO UI
- Use Thai names exactly as shown
- Use exact prices, quantities, dates
- Note any fields that are NOT present in MAO
- Note any fields in MAO that don't exist in Omnia-UI interface

### 3. Map MAO Fields to Omnia-UI Fields
- **Verify** each MAO field maps to an existing Omnia-UI field
- **DO NOT** create new fields
- **Document** any MAO fields that don't have a mapping
- **Leave as null/undefined** any Omnia-UI fields that MAO doesn't provide

**Mapping Reference:**
| MAO Field | Omnia-UI Field | Current Value (to replace) |
|-----------|----------------|---------------------------|
| Order Number | order_no | 'W1156260115052036' |
| Order Date | order_date | '2026-01-09T10:30:00+07:00' |
| Status | status | 'DELIVERED' |
| Customer ID | customer.id | 'CUST-W115626' |
| Customer Name | customer.name | 'สมชาย ใจดี' |
| Customer Email | customer.email | 'somchai.jaidei@example.com' |
| Customer Phone | customer.phone | '+66812345678' |
| Customer Type | customer.customerType | 'Tier 1 Login' |
| Selling Channel | channel/sellingChannel | 'web' |
| Business Unit | business_unit | 'Retail' |
| Organization | organization | 'CFR' |
| Street | shipping_address.street | '123/45 สุขุมวิท ซอย 39' |
| City | shipping_address.city | 'กรุงเทพมหานคร' |
| State | shipping_address.state | 'วัฒนา' |
| Postal Code | shipping_address.postal_code | '10110' |
| Country | shipping_address.country | 'Thailand' |
| Line Items | items[] | [4 items] |
| Total Amount | total_amount | 352.90 |
| Payment Method | payment_info.method | 'CREDIT_CARD' |
| Payment Status | payment_info.status | 'PAID' |
| Transaction ID | payment_info.transaction_id | 'TXN-W115626-001' |
| Delivery Type Code | deliveryTypeCode | 'RT-HD-EXP' |
| SLA Info | sla_info | {target_minutes: 180, elapsed_minutes: 45, status: 'COMPLIANT'} |
| Metadata | metadata | {created_at, updated_at, priority, store_name, store_no} |
| Audit Trail | auditTrail | [12 events] |

### 4. Update mock-data.ts with REAL MAO Data
- **Open** `src/lib/mock-data.ts`
- **Locate** `maoOrderW1156260115052036` object (line ~3193)
- **Replace** each field value with the REAL MAO value
- **Keep** the existing structure intact
- **Ensure** data types match (strings, numbers, booleans, arrays)
- **Use** ISO date format for all dates (e.g., '2026-01-09T10:30:00+07:00')
- **Keep** Thai text in Thai (don't translate)
- **Preserve** array structures for items, payments, audit trail

**Specific Updates:**
- Line 3195-3196: id, order_no (if different)
- Line 3197: organization (if different)
- Line 3198: order_date (use exact date from MAO)
- Line 3199: business_unit (if different)
- Line 3201-3202: sellingChannel/channel (if different)
- Line 3203: status (use exact status from MAO)
- Lines 3206-3214: customer object (all fields)
- Lines 3217-3223: shipping_address object (all fields)
- Lines 3226-3457: items array (all 4 items with all fields)
- Lines 3461-3477: pricingBreakdown object
- Line 3480: total_amount
- Lines 3483-3493: payment_info object
- Lines 3496-3507: paymentDetails array
- Lines 3510-3517: orderDiscountes array
- Lines 3520-3545: promotions array
- Lines 3548-3561: couponCodes array
- Lines 3564-3578: deliveryMethods array
- Line 3581: deliveryTypeCode
- Lines 3584-3588: sla_info object
- Lines 3591-3598: metadata object
- Lines 3601-3609: additional fields
- Line 3612: auditTrail array

### 5. Update Audit Trail with REAL MAO Events
- **Locate** `generateMAOOrderW1156260115052036AuditTrail()` function (line ~3017)
- **Replace** mock audit events with REAL audit trail from MAO
- **Extract** exact timestamps from MAO audit trail
- **Use** exact user names from MAO (e.g., 'apiuser4TMS')
- **Use** exact entity names and field names from MAO
- **Preserve** chronological order (oldest first)
- **Format** timestamps as 'DD/MM/YYYY HH:mm ICT'

**Audit Trail Fields for Each Event:**
- id: Unique event ID
- orderId: 'W1156260115052036'
- updatedBy: User who made the change (from MAO)
- updatedOn: Exact timestamp from MAO
- entityName: Entity type (e.g., 'Order', 'QuantityDetail', 'ShipmentDetail')
- entityId: Entity ID
- changedParameter: What changed
- oldValue: Previous value
- newValue: New value

### 6. Validate Data Type Consistency
- **Verify** all date fields use ISO format with timezone
- **Verify** all numeric fields are numbers (not strings)
- **Verify** all boolean fields are booleans (not strings)
- **Verify** all array fields are arrays (even if empty)
- **Verify** all string fields are strings (even if empty)
- **Verify** Thai text is preserved (not translated)

### 7. Validate Order Display
- **Start** dev server: `pnpm dev`
- **Navigate** to Orders page
- **Search** for order W1156260115052036
- **Verify** order appears in list with correct data
- **Click** on order to open detail page
- **Verify** all tabs display correctly:
  - Overview tab shows correct order header
  - Customer tab shows correct customer information
  - Items tab shows correct line items
  - Payment tab shows correct payment information
  - Delivery tab shows correct delivery information
  - Audit tab shows correct audit trail
- **Verify** no 'undefined' or 'N/A' errors (unless data is truly missing in MAO)
- **Verify** currency formatting works (Thai Baht)
- **Verify** dates display correctly

### 8. Final Validation
- **Check** no TypeScript errors: `pnpm build`
- **Check** no ESLint errors: `pnpm lint`
- **Verify** git status shows only `src/lib/mock-data.ts` modified
- **Commit** changes with clear message: "chore: Update maoOrderW1156260115052036 with REAL MAO data"

## Validation Commands
Execute these commands to validate the chore is complete:

```bash
# 1. Check TypeScript compilation
pnpm build

# 2. Check for lint errors
pnpm lint

# 3. Verify only mock-data.ts was modified
git status

# 4. See the exact changes made
git diff src/lib/mock-data.ts

# 5. Test order displays in dev server
pnpm dev
# Then navigate to http://localhost:3000/orders
# Search for order W1156260115052036
# Verify all fields display correctly
```

## Notes

### Authentication Requirement
The MAO system requires authentication via:
- URL: https://crcpp-auth.omni.manh.com/auth/realms/maactive/protocol/openid-connect/auth
- This prevents automated data extraction via Playwright MCP
- User must manually login and extract data, or provide authenticated session

### Data Extraction Priority
If unable to access MAO directly, use the reference screenshot:
- `/Users/naruechon/Downloads/screencapture-crcpp-omni-manh-omnifacade-2026-01-16-01_31_30.png`
- Extract all visible text/data from screenshot
- Use exact values as shown in the image

### Field Mapping Constraints
- **CRITICAL**: DO NOT add new fields to Order interface
- **CRITICAL**: DO NOT modify existing field names
- **ONLY update field VALUES with REAL MAO data**
- If MAO has a field not in Omnia-UI: document but don't add
- If Omnia-UI has a field not in MAO: leave as null/undefined

### Data Formatting Standards
- Dates: ISO format with timezone (e.g., '2026-01-09T10:30:00+07:00')
- Numbers: Use numbers (not strings) for quantities, prices
- Currency: Thai Baht (THB)
- Text: Preserve Thai text exactly as shown
- Audit timestamps: 'DD/MM/YYYY HH:mm ICT' format

### Current Mock Data Location
- File: `src/lib/mock-data.ts`
- Order object: Lines 3193-3613
- Audit function: Lines 3017-3190
- Inserted into array: Line 3616

### Testing Checklist
After updating mock data:
- [ ] Order appears in order list
- [ ] Order detail page opens without errors
- [ ] Overview tab shows correct data
- [ ] Customer tab shows correct data
- [ ] Items tab shows all 4 line items
- [ ] Payment tab shows correct payment info
- [ ] Delivery tab shows correct delivery info
- [ ] Audit tab shows all audit trail entries
- [ ] No 'undefined' values displayed
- [ ] Currency formatting works (฿ symbol)
- [ ] Dates display correctly in GMT+7
- [ ] Thai text displays correctly
- [ ] TypeScript compilation succeeds
- [ ] No ESLint errors
