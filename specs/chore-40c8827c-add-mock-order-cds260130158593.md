# Chore: Add Mock Order CDS260130158593 from Manhattan OMS

## Metadata
adw_id: `40c8827c`
prompt: `Create a new mock order in Omnia-UI based on Manhattan order CDS260130158593`

## Chore Description
Add a new mock order entry to `src/lib/mock-data.ts` based on the Manhattan Active Omni order specification in `mock_specs/mock-cds260130158593-manhattan-order-status.md`. This order represents a DELIVERED status order with:
- Multi-payment: Credit Card (฿2,490) + The1 Points (฿500)
- Single item: Air Pure Compact PT2210T0 White
- Tax invoice required with company details
- The1 loyalty member
- Kerry Express delivery to Nonthaburi

The implementation must map Manhattan OMS fields to existing Omnia-UI schema fields only - no new fields should be added.

## Relevant Files
Use these files to complete the chore:

- **`mock_specs/mock-cds260130158593-manhattan-order-status.md`** - Source specification with complete Manhattan OMS data structure including customer info, order header, payment methods, items, shipments, and settlements
- **`src/lib/mock-data.ts`** - Target file for adding the new mock order. Contains existing MAO orders (`maoOrderCDS251229874674`, `maoOrderCDS260121226285`) as templates for the structure
- **`src/types/payment.ts`** - Payment type definitions for reference (transactionType: 'SETTLEMENT' | 'AUTHORIZATION')
- **`src/types/delivery.ts`** - DeliveryMethodType definitions for reference

### New Files
None - only modifying `src/lib/mock-data.ts`

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Create Items Array Constant
- Define `const maoOrderCDS260130158593Items = [...]` with a single item
- Map Manhattan item fields to existing Omnia-UI item structure:
  - `id`: 'LINE-CDS26013-001'
  - `product_id`: 'CDS-AIRPURE-PT2210T0-001'
  - `product_sku`: 'CDS19598406'
  - `product_name`: 'Air Pure Compact PT2210T0 White'
  - `thaiName`: 'เครื่องฟอกอากาศ Air Pure Compact PT2210T0 สีขาว'
  - `barcode`: 'CDS19598406'
  - `quantity`: 1, `orderedQty`: 1, `fulfilledQty`: 1, `unit_price`: 2990, `total_price`: 2990
  - `uom`: 'PCS'
  - `location`: 'Central World'
  - `fulfillmentStatus`: 'DELIVERED'
  - `shippingMethod`: 'Standard Delivery'
  - `bundle`: false
  - `packedOrderedQty`: 1
  - `route`: '', `bookingSlotFrom`: '', `bookingSlotTo`: ''
  - `eta`: `{ from: '01 Feb 2026 00:00:00', to: '01 Feb 2026 23:59:00' }`
  - `giftWithPurchase`: false
  - `priceBreakdown`: `{ subtotal: 2990, discount: 0, charges: 0, amountExcludedTaxes: 2794.39, taxes: 195.61, amountIncludedTaxes: 2990, total: 2990 }`
  - `promotions`: []
  - `viewType`: 'DS-WEB-STD'
  - `supplyTypeId`: 'On Hand Available'
  - `substitution`: false
  - `product_details`: `{ description: 'Air Pure Compact PT2210T0 White', category: 'Home Appliances', brand: 'Air Pure' }`

### 2. Create Main Order Object
- Define `const maoOrderCDS260130158593 = {...}` after the items array
- Add header block comment following existing pattern:
  ```javascript
  // -----------------------------------------------------------------------------
  // MAO ORDER: CDS260130158593
  // -----------------------------------------------------------------------------
  // Real MAO order extracted from Manhattan Active Omni system
  // Customer: TASSANAVALAI KLINTIENFUNG from Nonthaburi
  // Items: 1 line item (Air Pure Compact air purifier)
  // Products: Air Pure Compact PT2210T0 White
  // Delivery: Home Delivery - Standard from Central World
  // Payment: Multi-payment - Credit Card (2,490) + The1 Points (500)
  // Total: 2,990.00 THB
  // Tax Invoice: Required - บริษัท อินเทลลิเจ้นท์ โกลบอล จำกัด
  // -----------------------------------------------------------------------------
  ```
- Map order header fields:
  - `id`: 'CDS260130158593', `order_no`: 'CDS260130158593'
  - `organization`: 'CDS'
  - `order_date`: '2026-01-30T15:10:00+07:00'
  - `business_unit`: 'Central Department Store'
  - `order_type`: 'RT-HD-STD'
  - `sellingChannel`: 'Web', `channel`: 'web'
  - `status`: 'DELIVERED'

### 3. Add Customer Object
- Map customer fields:
  - `id`: 'CUST-CDS26013-001'
  - `name`: 'TASSANAVALAI KLINTIENFUNG'
  - `email`: 'Engzaa@gmail.com'
  - `phone`: '0624192696'
  - `customerType`: 'General'
  - `custRef`: '2400131193'
  - `T1Number`: '2002224934'
  - `taxId`: '0135564014412'
  - `customerTypeId`: 'General'

### 4. Add Shipping Address
- Map shipping address with Thai UTF-8 text:
  - `street`: '134/466'
  - `subdistrict`: 'ท่าทราย'
  - `city`: 'เมืองนนทบุรี'
  - `state`: 'นนทบุรี'
  - `postal_code`: '11000'
  - `country`: 'TH'

### 5. Add Pricing Breakdown and Payment Info
- Add `pricingBreakdown`:
  - `subtotal`: 2990, `orderDiscount`: 0, `lineItemDiscount`: 0
  - `taxAmount`: 195.61
  - `taxBreakdown`: Map from items
  - `shippingFee`: 0, `additionalFees`: 0
  - `grandTotal`: 2990, `paidAmount`: 2990, `currency`: 'THB'
- Add `total_amount`: 2990
- Add `payment_info`:
  - `method`: 'CREDIT_CARD'
  - `status`: 'PAID'
  - `transaction_id`: '17697739922881358120'
  - `subtotal`: 2990, `discounts`: 0, `charges`: 0
  - `amountIncludedTaxes`: 2990, `amountExcludedTaxes`: 2794.39, `taxes`: 195.61
  - `cardNumber`: '528560XXXXXX1117', `expiryDate`: '**/****'

### 6. Add Payment Details Array with Multi-Payment
- Add `paymentDetails` array with 2 entries:

**Entry 1: Credit Card Settlement**
  - `id`: 'PAY-CDS260130158593-001'
  - `method`: 'CREDIT_CARD'
  - `status`: 'PAID'
  - `transactionId`: '17697739922881358120'
  - `amount`: 2490
  - `currency`: 'THB'
  - `date`: '2026-01-30T15:10:00+07:00'
  - `gateway`: 'KBank'
  - `cardNumber`: '528560XXXXXX1117', `expiryDate`: '**/****'
  - `invoiceNo`: '17697739922881358120'
  - `transactionType`: 'SETTLEMENT'
  - `settledItems`: Array with the single item (Air Pure Compact, ฿2,490 portion)

**Entry 2: The1 Points Settlement**
  - `id`: 'PAY-CDS260130158593-002'
  - `method`: 'T1' (The1 Points)
  - `status`: 'PAID'
  - `transactionId`: 'T1-2002224934-2026013015'
  - `amount`: 500
  - `currency`: 'THB'
  - `date`: '2026-01-30T15:10:00+07:00'
  - `gateway`: 'The1'
  - `memberId`: '2002224934'
  - `invoiceNo`: '17697739922881358120'
  - `transactionType`: 'SETTLEMENT'
  - `settledItems`: Array with the single item (Air Pure Compact, ฿500 portion)

### 7. Add Delivery Methods
- Add `deliveryMethods` array with HOME_DELIVERY type:
  ```javascript
  deliveryMethods: [
    {
      type: 'HOME_DELIVERY' as DeliveryMethodType,
      itemCount: 1,
      homeDelivery: {
        recipient: 'ทัศนาวลัย กลิ่นเทียนฟุ้ง',
        phone: '0624192696',
        address: '134/466',
        district: 'ท่าทราย',
        city: 'เมืองนนทบุรี',
        postalCode: '11000',
        specialInstructions: ''
      }
    }
  ]
  ```
- Add `deliveryTypeCode`: 'HOME_DELIVERY'

### 8. Add SLA, Metadata, and Tax Invoice Fields
- Add `sla_info`: `{ target_minutes: 4320, elapsed_minutes: 1440, status: 'COMPLIANT' }`
- Add `metadata`:
  - `created_at`: '2026-01-30T15:10:00+07:00'
  - `updated_at`: '2026-01-31T10:00:00+07:00'
  - `priority`: 'NORMAL'
  - `store_name`: 'Central World'
  - `store_no`: ''
  - `order_created`: '2026-01-30T15:10:00+07:00'
  - `viewTypes`: ['DS-WEB-STD']
- Add boolean flags:
  - `on_hold`: false
  - `fullTaxInvoice`: true
  - `allowSubstitution`: false, `allow_substitution`: false
- Add The1/Tax fields:
  - `t1Member`: '2002224934'
  - `taxId`: '0135564014412'
  - `companyName`: 'บริษัท อินเทลลิเจ้นท์ โกลบอล จำกัด'
  - `branchNo`: '00000'

### 9. Add Billing Address and Tracking Info
- Add `billingName`: 'ทัศนาวลัย กลิ่นเทียนฟุ้ง'
- Add `billingAddress`:
  - `street`: '134/466'
  - `subdistrict`: 'ท่าทราย'
  - `city`: 'เมืองนนทบุรี'
  - `state`: 'นนทบุรี'
  - `postal_code`: '11000'
  - `country`: 'TH'
- Add tracking fields:
  - `trackingNumber`: 'KNJ0202601016215'
  - `shippedFrom`: 'Central World'
  - `shippedOn`: '2026-01-31T10:00:00+07:00'
  - `eta`: '02/01/2026'
  - `relNo`: 'CDS2601301585931'
  - `subdistrict`: 'ท่าทราย'

### 10. Add Fulfillment Timeline
- Add `fulfillmentTimeline` array with events:
  1. Order Received - '2026-01-30T15:10:00'
  2. Payment Confirmed - '2026-01-30T15:10:00'
  3. Processing - '2026-01-30T16:00:00'
  4. Shipped - '2026-01-31T10:00:00'
  5. Delivered - '2026-02-01T11:00:00'

### 11. Add Tracking Array
- Add `tracking` array with single shipment:
  - `trackingNumber`: 'KNJ0202601016215'
  - `carrier`: 'KEX'
  - `status`: 'DELIVERED'
  - `eta`: '02/01/2026'
  - `shippedOn`: '01/31/2026'
  - `relNo`: 'CDS2601301585931'
  - `shippedFrom`: 'Central World'
  - `subdistrict`: 'ท่าทราย'
  - `shipToAddress`: recipient details with Thai address
  - `trackingUrl`: 'https://th.kex-express.com/th/track/?track=KNJ0202601016215'
  - `shipmentType`: 'HOME_DELIVERY'
  - `shippedItems`: Single item with Air Pure Compact details
  - `events`: Array with Shipped, In Transit, Out for Delivery, Delivered events

### 12. Register Order in mockApiOrders
- Add the new order to the `mockApiOrders.unshift()` section at line ~10729
- Insert: `mockApiOrders.unshift(maoOrderCDS260130158593);` with comment `// Row 5 - Multi-payment delivered order`
- Position it BEFORE the existing MAO orders so it appears in the list

### 13. Validate Implementation
- Run `pnpm build` to ensure no TypeScript errors
- Verify Thai text encoding is preserved (UTF-8)
- Confirm all field mappings use existing Omnia-UI schema - no new types added

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm build` - Build the project to ensure no TypeScript errors
- `grep -n "CDS260130158593" src/lib/mock-data.ts` - Verify the order ID appears in mock-data.ts
- `grep -n "maoOrderCDS260130158593" src/lib/mock-data.ts` - Verify the order constant is defined
- `grep -n "บริษัท อินเทลลิเจ้นท์" src/lib/mock-data.ts` - Verify Thai company name is preserved

## Notes
- This order demonstrates The1 Points (T1) multi-payment, a common Central Group retail pattern
- The `transactionType: 'SETTLEMENT'` indicates completed payment transactions
- Two payment entries with `settledItems` show how a single item's cost was split between payment methods
- Tax invoice details include company name in Thai and 13-digit tax ID
- Kerry Express (KEX) is the carrier with external tracking URL
- Dates use ISO 8601 format with +07:00 timezone offset (GMT+7)
- Insert position should be at the END of the unshift sequence so it appears after existing MAO orders in the list
