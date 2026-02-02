# Chore: Add Mock Order CDS251229874674 to mock-data.ts

## Metadata
adw_id: `ea4880d4`
prompt: `Add mock order CDS251229874674 to src/lib/mock-data.ts based on mock_specs/mock-pull_mock-CDS251229874674-order-status.md specification. Follow the existing MAO order pattern (maoOrderCDS260121226285) structure exactly. Requirements: 1) Create maoOrderCDS251229874674Items array with 2 items (Men Watch NF9254 D SKU MKP1093056431 ฿822, Sandawatch SKU MKP1875694 ฿399), each item split by qty=1 per order line (LINE-CDS25122-001, LINE-CDS25122-002). 2) Create maoOrderCDS251229874674 order object with: customer ภัคพล พีระภาค (phone 0829359993, email 2512230626@dummy.com, The1 2011010258797097), order_date 2025-12-29T03:33:00+07:00, order_type RT-MIX-STD, status DELIVERED, total ฿1,221, payment BANK_TRANSFER with 2 invoices (17669991293468532966 ฿822 and 17670069174774771878 ฿399). 3) Include 3 shipments: home delivery (KNJ0312512024648 to หนองบอน/ประเวศ/กรุงเทพฯ 10250), store pickup picked (CDS2512298746743 at ROBINSON SUKHUMVIT), and store merge delivered (CDS2512298746742 at ROBINSON SUKHUMVIT). 4) Add mockApiOrders.unshift(maoOrderCDS251229874674) after CDS260121226285. Keep ALL existing Omnia-UI fields (priceBreakdown, fulfillmentProgress, promotions, coupons, appeasements, productInfo, etc).`

## Chore Description
Add a new mixed-fulfillment mock order CDS251229874674 to the mock data file. This order demonstrates a complex scenario with:
- **Mixed fulfillment types**: Both home delivery and store pickup within the same order
- **Shipment merging**: Items consolidated at the pickup store (allocation type "Merge")
- **Mirakl marketplace**: Items shipped from marketplace seller location
- **Kerry Express tracking**: CRC tracking links using Kerry Express system
- **Bank transfer payment**: Full payment made via bank transfer prior to order processing
- **Secret code verification**: Item 1 has a secret code (860492) for pickup verification
- **No promotions/coupons**: Clean order with no promotional discounts applied
- **Informational taxes**: VAT displayed as informational taxes (฿79.88 total)

The order must follow the exact structure of the existing `maoOrderCDS260121226285` pattern in `src/lib/mock-data.ts`.

## Relevant Files
Use these files to complete the chore:

- **`mock_specs/mock-pull_mock-CDS251229874674-order-status.md`** - Source specification document containing all order data fields extracted from Manhattan OMS. Contains customer info, payment details, 2 order items, 3 shipments, 2 invoices, and TypeScript interface definitions.

- **`src/lib/mock-data.ts`** - Target file for adding the new mock order. Contains existing MAO orders including `maoOrderCDS260121226285` (lines 9335-10459) which serves as the template pattern. The new order must be inserted after `maoOrderCDS260121226285` unshift statement at line 10970.

### New Files
None - this is an edit to an existing file only.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Create maoOrderCDS251229874674Items Array
Add the items array before line 9335 (before maoOrderCDS260121226285Items) with 2 items:

**Item 1: Men Watch NF9254 D (Store Pickup)**
- `id`: 'LINE-CDS25122-001'
- `product_id`: 'MKP-WATCH-NF9254-001'
- `product_sku`: 'MKP1093056431'
- `product_name`: 'Men Watch NF9254 D Stainless steel 40mm Black Blac'
- `thaiName`: 'นาฬิกาข้อมือผู้ชาย NF9254 D สเตนเลส 40มม. ดำ'
- `barcode`: 'MKP1093056431'
- `quantity`: 1
- `orderedQty`: 1
- `fulfilledQty`: 1
- `unit_price`: 822
- `total_price`: 822
- `uom`: 'PCS'
- `location`: 'ROBINSON SUKHUMVIT'
- `fulfillmentStatus`: 'DELIVERED'
- `shippingMethod`: 'Standard Pickup'
- `secretCode`: '860492'
- `eta`: { from: '04 Jan 2026 00:00:00', to: '04 Jan 2026 23:59:00' }
- `priceBreakdown`: { subtotal: 822, discount: 0, charges: 0, amountExcludedTaxes: 768.22, taxes: 53.78, amountIncludedTaxes: 822, total: 822 }
- `promotions`: [] (empty - no promotions)
- `viewType`: 'DS-WEB-MIX'
- `supplyTypeId`: 'Mirakl Marketplace'

**Item 2: Sandawatch (Home Delivery)**
- `id`: 'LINE-CDS25122-002'
- `product_id`: 'MKP-SANDAWATCH-001'
- `product_sku`: 'MKP1875694'
- `product_name`: 'Sandawatch men/women\'s wristwatch (ready to ship)'
- `thaiName`: 'นาฬิกาข้อมือ Sandawatch ชาย/หญิง (พร้อมส่ง)'
- `barcode`: 'MKP1875694'
- `quantity`: 1
- `orderedQty`: 1
- `fulfilledQty`: 1
- `unit_price`: 399
- `total_price`: 399
- `uom`: 'PCS'
- `location`: 'Mirakl location'
- `fulfillmentStatus`: 'DELIVERED'
- `shippingMethod`: 'Standard Delivery'
- `eta`: { from: '02 Jan 2026 00:00:00', to: '02 Jan 2026 23:59:00' }
- `priceBreakdown`: { subtotal: 399, discount: 0, charges: 0, amountExcludedTaxes: 372.90, taxes: 26.10, amountIncludedTaxes: 399, total: 399 }
- `promotions`: [] (empty - no promotions)
- `viewType`: 'DS-WEB-MIX'
- `supplyTypeId`: 'Mirakl Marketplace'

### 2. Create maoOrderCDS251229874674 Order Object
Add the main order object after the items array with all required fields:

**Order Header**
- `id`: 'CDS251229874674'
- `order_no`: 'CDS251229874674'
- `organization`: 'DS'
- `order_date`: '2025-12-29T03:33:00+07:00'
- `business_unit`: 'Central Department Store'
- `order_type`: 'RT-MIX-STD'
- `sellingChannel`: 'Web'
- `channel`: 'Web'
- `status`: 'DELIVERED'

**Customer Information**
- `customer.id`: 'CUST-CDS25122-001'
- `customer.name`: 'ภัคพล พีระภาค'
- `customer.email`: '2512230626@dummy.com'
- `customer.phone`: '0829359993'
- `customer.customerType`: 'General'
- `customer.custRef`: '2512230626'
- `customer.T1Number`: '2011010258797097'
- `customer.customerTypeId`: 'General'

**Shipping Address (for Home Delivery item)**
- `shipping_address.street`: '96/104 นิรันดร์เรสซิเด้นท์ 5 ตึก U ซอยอ่อนนุช 46'
- `shipping_address.subdistrict`: 'หนองบอน'
- `shipping_address.city`: 'ประเวศ'
- `shipping_address.state`: 'กรุงเทพมหานคร'
- `shipping_address.postal_code`: '10250'
- `shipping_address.country`: 'TH'

**Pricing Breakdown**
- `pricingBreakdown.subtotal`: 1221
- `pricingBreakdown.orderDiscount`: 0
- `pricingBreakdown.lineItemDiscount`: 0
- `pricingBreakdown.taxAmount`: 79.88
- `pricingBreakdown.shippingFee`: 0
- `pricingBreakdown.additionalFees`: 0
- `pricingBreakdown.grandTotal`: 1221
- `pricingBreakdown.paidAmount`: 1221
- `pricingBreakdown.currency`: 'THB'

**Payment Info**
- `payment_info.method`: 'BANK_TRANSFER'
- `payment_info.status`: 'PAID'
- `payment_info.transaction_id`: '17669991293468532966'
- `payment_info.subtotal`: 1221
- `payment_info.discounts`: 0
- `payment_info.charges`: 0
- `payment_info.amountIncludedTaxes`: 1221
- `payment_info.amountExcludedTaxes`: 1141.12
- `payment_info.taxes`: 79.88

**Payment Details (2 invoices)**
- Invoice 1: id 'PAY-CDS251229874674-001', invoiceNo '17669991293468532966', amount 822
- Invoice 2: id 'PAY-CDS251229874674-002', invoiceNo '17670069174774771878', amount 399

**Delivery Methods (Mixed)**
- HOME_DELIVERY: 1 item (Sandawatch)
- CLICK_COLLECT (Store Pickup): 1 item (Men Watch) at ROBINSON SUKHUMVIT

### 3. Add Tracking Information (3 Shipments)

**Shipment 1: Home Delivery (Delivered)**
- `trackingNumber`: 'KNJ0312512024648'
- `carrier`: 'KEX'
- `status`: 'DELIVERED'
- `eta`: '01/02/2026'
- `relNo`: 'CDS2512298746741'
- `shippedFrom`: 'Mirakl location'
- `shipmentType`: 'HOME_DELIVERY'
- `trackingUrl`: 'https://th.kerryexpress.com/th/track/?track=KNJ0312512024648'
- Ship to address: ภัคพล พีระภาค, หนองบอน/ประเวศ/กรุงเทพฯ 10250
- Shipped item: Sandawatch MKP1875694

**Shipment 2: Store Pickup (Picked Up)**
- `trackingNumber`: 'KNJ0312512024403'
- `carrier`: 'KEX'
- `status`: 'PICKED UP'
- `eta`: '01/04/2026'
- `relNo`: 'CDS2512298746743'
- `pickedFrom`: 'SUKHUMVIT'
- `pickedOn`: '01/01/2026'
- `shipmentType`: 'STORE_PICKUP'
- Ship to store: ROBINSON SUKHUMVIT, 259 SUKHUMVIT ROAD, WATTANA, Bangkok 10110
- `allocationType`: 'Pickup'
- Picked item: Men Watch MKP1093056431

**Shipment 3: Store Merge (Delivered)**
- `trackingNumber`: 'KNJ0312512024403'
- `carrier`: 'KEX'
- `status`: 'DELIVERED'
- `eta`: '01/04/2026'
- `relNo`: 'CDS2512298746742'
- `shippedFrom`: 'Mirakl location'
- `shipmentType`: 'STORE_MERGE'
- `trackingUrl`: 'https://th.kerryexpress.com/th/track/?track=KNJ0312512024403'
- Ship to store: ROBINSON SUKHUMVIT
- `allocationType`: 'Merge'
- Shipped item: Men Watch MKP1093056431

### 4. Add Fulfillment Timeline
Create fulfillmentTimeline array with stages matching the order flow:
1. Order Received - 2025-12-29T03:33:00
2. Payment Confirmed - 2025-12-29T03:35:00
3. Processing - 2025-12-29T04:00:00
4. Shipped (Home Delivery) - 2025-12-30T10:00:00
5. Shipped to Store (Merge) - 2025-12-30T10:00:00
6. Available for Pickup - 2026-01-01T10:00:00
7. Picked Up - 2026-01-01T14:00:00
8. Home Delivered - 2026-01-02T11:00:00

### 5. Add SLA Info and Metadata
- `sla_info`: { target_minutes: 4320, elapsed_minutes: 4200, status: 'COMPLIANT' }
- `metadata.created_at`: '2025-12-29T03:33:00+07:00'
- `metadata.updated_at`: '2026-01-02T11:00:00+07:00'
- `metadata.priority`: 'NORMAL'
- `metadata.viewTypes`: ['DS-WEB-MIX']

### 6. Add Billing and Additional Fields
- `fullTaxInvoice`: false
- `allowSubstitution`: false
- `currency`: 'THB'
- `capturedDate`: '2025-12-29T03:33:00+07:00'
- `t1Member`: '2011010258797097'
- `billingName`: 'ภัคพล พีระภาค'
- `billingAddress`: Same as shipping address

### 7. Update mockApiOrders.unshift Statements
Locate line 10970 where `mockApiOrders.unshift(maoOrderCDS260121226285)` is called and add:
```typescript
mockApiOrders.unshift(maoOrderCDS251229874674);    // Row 4 - Mixed fulfillment order
```
Add this AFTER the line for `maoOrderCDS260121226285` so CDS251229874674 appears below it in the order list.

### 8. Validate TypeScript Compilation
- Run `pnpm build` to ensure no TypeScript errors
- Verify mock data structure matches existing patterns

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm build` - Ensure TypeScript compiles without errors
- `grep -n "maoOrderCDS251229874674" src/lib/mock-data.ts` - Verify order is added
- `grep -n "CDS251229874674" src/lib/mock-data.ts | head -20` - Verify order ID appears in expected locations
- `pnpm dev` - Start dev server and verify order appears in Order Management Hub

## Notes

### Key Differences from Reference Order (CDS260121226285)
1. **Mixed fulfillment**: This order has both home delivery AND store pickup, unlike CDS260121226285 which is home delivery only
2. **Payment method**: Bank transfer instead of credit card
3. **No promotions/coupons**: Clean order with no discounts applied
4. **Store pickup with secret code**: Item 1 requires secret code 860492 for verification
5. **Merge allocation**: Shipment 3 demonstrates the "Merge" allocation type for items consolidated at pickup store
6. **Mirakl marketplace**: Both items shipped from marketplace seller locations

### Data Source
All data extracted from Manhattan OMS order status page:
- URL: `https://crcpp.omni.manh.com/customerengagementfacade/app/orderstatus?orderId=CDS251229874674&selectedOrg=DS`
- Extraction date: 2026-01-23

### Item Order Line IDs
- LINE-CDS25122-001: Men Watch (Store Pickup)
- LINE-CDS25122-002: Sandawatch (Home Delivery)

Note: The line IDs use format `LINE-CDS25122-XXX` to match the order ID pattern prefix while keeping within reasonable length.
