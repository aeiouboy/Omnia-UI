# Chore: Add Mock Order CDS260130806823 from Manhattan WMS

## Metadata
adw_id: `9aa6f1d5`
prompt: `Add new mock order CDS260130806823 to Omnia-UI based on Manhattan WMS data from mock_specs/mock-4e082819-manhattan-order-status-cds260130806823.md. Map only to existing fields in Omnia-UI schema (src/lib/mock-data.ts and src/types/order.ts). Create a delivered order with: order_id='CDS260130806823', customer name='สุทิศา ทับเอี่ยม', phone='0855500085', email='dummyemail_qRakhvnA_@xyz.com', order_date='2026-01-30T07:17:00+07:00', status='delivered', payment_method='bank_transfer', payment_status='paid', total_amount=3700.00, 6 line items (5 free promotional items with price 0 + 1 paid Lipstick SKU CDS26769646 qty 2 @ 1850 baht each), tracking_number='FEX0842601001855', shipped_from='Central Online Warehouse', shipping_method='Standard Delivery', estimated_delivery='2026-02-01', shipped_date='2026-01-30'. Include Thai customer type, The1 member flag, web channel, informational_taxes=242.06. Map all fields according to section 11 of the spec. Only use fields that already exist in the Omnia-UI codebase.`

## Chore Description
Add a new mock order object to `src/lib/mock-data.ts` for order CDS260130806823 based on real Manhattan WMS (MAO) data documented in the specification file. This is a delivered beauty/cosmetics order with:
- **Customer**: Thai customer สุทิศา ทับเอี่ยม with The1 membership
- **Products**: 6 line items (5 free promotional items + 1 paid lipstick)
- **Payment**: Bank Transfer, fully paid (฿3,700.00)
- **Fulfillment**: Standard Delivery via Flash Express, delivered
- **Special**: Includes informational taxes (฿242.06) for VAT transparency

This order demonstrates promotional/gift-with-purchase items (GET FREE items with ฿0 price) alongside paid items.

## Relevant Files
Use these files to complete the chore:

- **`mock_specs/mock-4e082819-manhattan-order-status-cds260130806823.md`**: Source data specification containing all field values and mapping guidance (Section 11)
- **`src/lib/mock-data.ts`**: Target file where the new mock order must be added. Follow existing patterns from similar orders like `maoOrderCDS260130158593` and `maoOrderCDS251229874674`
- **`src/types/payment.ts`**: Reference for `PaymentTransaction`, `SettledItem`, and `TransactionType` interfaces
- **`src/types/delivery.ts`**: Reference for `DeliveryMethodType`, `HomeDeliveryDetails`, and `DeliveryMethod` interfaces

### New Files
None required - this chore only modifies the existing `src/lib/mock-data.ts` file.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Create Order Line Items Array
Define `maoOrderCDS260130806823Items` array with 6 line items. Follow the existing item structure from `maoOrderCDS260130158593Items`:

- **LINE-CDS26080-001**: GET FREE - MYSLF EAU DE PARFUM 1.2 mL (CDS10174760)
  - qty: 1, unit_price: 0, total_price: 0
  - fulfillmentStatus: 'DELIVERED', shippingMethod: 'Standard Delivery'
  - supplyTypeId: 'On Hand Available', uom: 'PCS'
  - priceBreakdown: all zeros

- **LINE-CDS26080-002**: GET FREE - YSL All Hours Glow Foundation LC1 1 mL (CDS23578005)
  - qty: 2, unit_price: 0, total_price: 0
  - Same structure as above

- **LINE-CDS26080-003**: GET FREE - Libre EDP 1.2 mL (CDS23619029)
  - qty: 1, unit_price: 0, total_price: 0
  - Same structure as above

- **LINE-CDS26080-004**: GET FREE - Libre EDP 1.2 mL (CDS23619029)
  - qty: 2, unit_price: 0, total_price: 0
  - Note: Duplicate SKU on separate line (per MAO data)

- **LINE-CDS26080-005**: Lipstick Loveshine Candy Glow Valentines Limited E (CDS26769646)
  - qty: 2, unit_price: 1850, total_price: 3700
  - priceBreakdown: subtotal=3700, taxes=242.06, total=3700

- **LINE-CDS26080-006**: GET FREE - Ang Pao Packet Set (CDS27800461)
  - qty: 1, unit_price: 0, total_price: 0
  - Same structure as first item

### 2. Create Main Order Object
Define `maoOrderCDS260130806823` object with all required fields:

- **Order Header**:
  - id: 'CDS260130806823'
  - order_no: 'CDS260130806823'
  - organization: 'DS'
  - order_date: '2026-01-30T07:17:00+07:00'
  - business_unit: 'Central Department Store'
  - order_type: 'RT-HD-STD'
  - sellingChannel: 'Web'
  - channel: 'web'
  - status: 'DELIVERED'

- **Customer Object**:
  - id: 'CUST-CDS26080-001'
  - name: 'สุทิศา ทับเอี่ยม'
  - email: 'dummyemail_qRakhvnA_@xyz.com'
  - phone: '0855500085'
  - customerType: 'General'
  - custRef: '2409849642'
  - T1Number: (include The1 member flag)
  - taxId: '3451100654063'
  - customerTypeId: 'General'

- **Shipping Address**:
  - street: '98/242 หมู่บ้านคาซ่าวิลล์ 2 ซ.15/2 ถ.ราชพฤกษ์-รัตนาธิเบศร์'
  - subdistrict: 'ท่าอิฐ'
  - city: 'ปากเกร็ด'
  - state: 'นนทบุรี'
  - postal_code: '11120'
  - country: 'TH'

- **items**: Reference `maoOrderCDS260130806823Items`

- **pricingBreakdown**:
  - subtotal: 3700
  - orderDiscount: 0
  - lineItemDiscount: 0
  - taxAmount: 242.06 (informational)
  - shippingFee: 0
  - grandTotal: 3700
  - paidAmount: 3700
  - currency: 'THB'

- **total_amount**: 3700

- **payment_info**:
  - method: 'BANK_TRANSFER'
  - status: 'PAID'
  - transaction_id: '17697640380197003278'
  - subtotal: 3700
  - discounts: 0
  - charges: 0
  - amountIncludedTaxes: 3700
  - amountExcludedTaxes: 3457.94 (3700 - 242.06)
  - taxes: 242.06

- **paymentDetails** Array with single transaction:
  - id: 'PAY-CDS260130806823-001'
  - method: 'BANK_TRANSFER'
  - status: 'PAID'
  - transactionId: '17697640380197003278'
  - amount: 3700
  - currency: 'THB'
  - date: '2026-01-30T07:17:00+07:00'
  - gateway: 'Bank Transfer'
  - invoiceNo: '17697640380197003278'
  - transactionType: 'SETTLEMENT'
  - settledItems: Array of all 6 items with line-level settlement amounts

- **deliveryMethods** Array:
  - type: 'HOME_DELIVERY' as DeliveryMethodType
  - itemCount: 6
  - homeDelivery object with recipient details

- **Tracking Fields**:
  - trackingNumber: 'FEX0842601001855'
  - shippedFrom: 'Central Online Warehouse'
  - shippedOn: '2026-01-30'
  - eta: '02/01/2026'
  - relNo: 'CDS2601308068231'
  - subdistrict: 'ท่าอิฐ'

- **tracking** Array with shipment object:
  - Include trackingUrl for Flash Express
  - shippedItems array (all 6 items)
  - events array (fulfillment timeline)

- **fulfillmentTimeline** Array with 5 statuses

- **Metadata and Flags**:
  - fullTaxInvoice: true
  - allowSubstitution: false
  - t1Member: (The1 member ID)
  - billingName: 'นางสาวดาราณี จวงหัวโทน'
  - billingAddress object
  - on_hold: false
  - sla_info with COMPLIANT status

### 3. Register Order in mockApiOrders
Add registration statement after the existing MAO orders near line 11036:

```typescript
mockApiOrders.unshift(maoOrderCDS260130806823);  // Row X - Beauty order with promotional items
```

Insert above the existing MAO order unshift statements so it appears near the top of the order list.

### 4. Validate TypeScript Types
Ensure all fields match existing type definitions:
- Payment fields use types from `src/types/payment.ts`
- Delivery fields use types from `src/types/delivery.ts`
- All string values properly escaped for Thai characters

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm build` - Verify TypeScript compilation with no errors
- `pnpm lint` - Check for linting issues
- `pnpm dev` - Start dev server and navigate to Order Management to verify order appears in list

## Notes

1. **Promotional Items**: The 5 "GET FREE" items have ฿0.00 price - these are gift-with-purchase promotional items bundled with the paid lipstick

2. **Duplicate SKU**: CDS23619029 (Libre EDP) appears on two separate lines with quantities 1 and 2 - this matches MAO data structure and should be preserved

3. **Informational Taxes**: The ฿242.06 tax is "informational" (displayed for VAT transparency) but not separately charged - the total remains ฿3,700

4. **Flash Express Tracking**: Use tracking URL format `https://www.flashexpress.co.th/tracking/?se=FEX0842601001855`

5. **The1 Member**: Customer has The1 loyalty membership - include member flag in customer object

6. **Field Reuse**: Only use fields that already exist in the codebase. Reference `maoOrderCDS260130158593` for the exact field names and structure patterns
