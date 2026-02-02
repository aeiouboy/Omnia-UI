# Chore: Add Mock Order CDS260121226285

## Metadata
adw_id: `61d6adcd`
prompt: `Add new mock order CDS260121226285 to src/lib/mock-data.ts based on data from mock_specs/mock-CDS260121226285-order-status-complete.md. Create order items array (maoOrderCDS260121226285Items) and order object (maoOrderCDS260121226285) following the same structure as maoOrderW1156251121946800.`

## Chore Description
Add a new mock order `CDS260121226285` to the mock-data.ts file based on real order data captured from the Manhattan OMS system. This order represents a children's clothing purchase from the Central Department Store channel with:
- **Customer**: ธนวัฒน์ สิงห์แพรก (Thanawat Singpraek)
- **Order Status**: DELIVERED
- **13 items** (all children's clothing - Hello Kitty, Kuromi, Cinnamoroll branded)
- **Order Total**: ฿4,551.25 THB
- **Total Discounts**: ฿4,908.75 (promotions: ฿3,225.00 + coupon: ฿1,683.75)
- **Item Subtotal**: ฿9,460.00
- **3 Shipments** from: Central Online Warehouse, Bangna, Lardprao
- **1 Coupon**: CES2520075550 (฿1,683.75 discount)

Key requirements:
1. Split all items by qty=1 per order line (LINE-CDS26012-001-0, LINE-CDS26012-001-1 pattern)
2. Map only existing fields from the reference order
3. Export in mockApiOrders array via unshift (appears after existing MAO orders)

## Relevant Files
Use these files to complete the chore:

- **src/lib/mock-data.ts** - Main file to add the new mock order data. Contains existing `maoOrderW1156251121946800` as reference structure (lines 2626-3912)
- **mock_specs/mock-CDS260121226285-order-status-complete.md** - Source data specification with all order details, items, promotions, coupons, shipments, and invoices
- **src/types/delivery.ts** - DeliveryMethodType type definition for delivery methods

### No New Files
All changes are additions to existing files.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Create Item Price Calculation Helper
Each item has specific pricing from the spec:
- Calculate per-item priceBreakdown (subtotal, discount, charges, amountExcludedTaxes, taxes, amountIncludedTaxes, total)
- Discount = Item Subtotal - Item Total (from spec table)
- For taxes: informationalTaxes given as ฿297.70 for entire order (13 items)

### 2. Create maoOrderCDS260121226285Items Array
Add the items array after the existing `maoOrderW1156251121946800` block (around line 3912), following this structure for each item:
- 13 unique products, each with qty=1 (no splitting needed since all items are qty=1)
- Use LINE-CDS26012-XXX pattern for item IDs
- Map fields: id, product_id, product_sku, product_name, thaiName, barcode, quantity, orderedQty, fulfilledQty, unit_price, total_price, uom, location, fulfillmentStatus, shippingMethod, bundle, packedOrderedQty, route, bookingSlotFrom, bookingSlotTo, eta, giftWithPurchase, priceBreakdown, promotions, viewType, supplyTypeId, substitution, product_details

**Item Data from Spec:**
| # | Product Name | SKU | Price | Discount | Total | Shipment |
|---|--------------|-----|-------|----------|-------|----------|
| 1 | Girl T-Shirt Short Sleeves Round Neck Kuromi Viole | CDS23576490 | 395 | 128.07 | 266.93 | Bangna |
| 2 | Girl Pants Wide Legs Kuromi Denim | CDS23576551 | 645 | 209.13 | 435.87 | Bangna |
| 3 | Girl Pants Hello Kitty Blue | CDS23582996 | 1290 | 854.13 | 435.87 | Central Online Warehouse |
| 4 | Girl Leggings Hello Kitty Red | CDS23583115 | 790 | 523.07 | 266.93 | Central Online Warehouse |
| 5 | Girl Dress Cap Sleeves Hello Kitty Blue | CDS24077910 | 1390 | 920.35 | 469.65 | Central Online Warehouse |
| 6 | Girl Toddler T-Shirt Puff Sleeves Hello Kitty Whit | CDS24097574 | 345 | 111.86 | 233.14 | Lardprao |
| 7 | Girl Toddler Shorts Hello Kitty Cherry Blossom Pin | CDS24097635 | 495 | 160.50 | 334.50 | Lardprao |
| 8 | Girl Toddler Dress Short Sleeves Gingham Cinnamoro | CDS24097840 | 645 | 209.13 | 435.87 | Central Online Warehouse |
| 9 | Girl Dress Short Sleeves Gingham Hello Kitty Cherr | CDS24098083 | 695 | 225.37 | 469.63 | Bangna |
| 10 | Girl T-Shirt Short Sleeves Round Neck Hello Kitty | CDS24098281 | 395 | 128.07 | 266.93 | Bangna |
| 11 | Girl T-Shirt Puff Sleeves Cinnamoroll Light Blue | CDS24098465 | 395 | 128.07 | 266.93 | Central Online Warehouse |
| 12 | Girl Toddler Pyjamas Set Dress Long Sleeves With R | CDS24820752 | 990 | 655.50 | 334.50 | Bangna |
| 13 | Girl Toddler Pyjamas Set Dress Long Sleeves With R | CDS24820776 | 990 | 655.50 | 334.50 | Bangna |

### 3. Create maoOrderCDS260121226285 Object
Add the main order object with these fields:
- `id`: 'CDS260121226285'
- `order_no`: 'CDS260121226285'
- `organization`: 'DS'
- `order_date`: '2026-01-21T11:49:00+07:00'
- `business_unit`: 'Central Department Store'
- `order_type`: 'RT-HD-STD'
- `sellingChannel`: 'Web'
- `channel`: 'Web'
- `status`: 'DELIVERED'
- `customer`: {id, name: 'ธนวัฒน์ สิงห์แพรก', email: 'thanawat4596@gmail.com', phone: '0922643514', customerType: 'General', custRef: '2400777864', T1Number: '8031630388', taxId: '', customerTypeId: 'General'}
- `shipping_address`: {street: '88/10 ม.1 ซ.ชัยพรวิถี 14 ถ.ชัยพรวิถี...', subdistrict: 'หนองปรือ', city: 'บางละมุง', state: 'ชลบุรี', postal_code: '20150', country: 'TH'}
- `items`: maoOrderCDS260121226285Items
- `pricingBreakdown`: {subtotal: 9460, orderDiscount: 0, lineItemDiscount: 4908.75, taxAmount: 297.70, shippingFee: 0, additionalFees: 0, grandTotal: 4551.25, paidAmount: 4551.25, currency: 'THB'}
- `total_amount`: 4551.25
- `payment_info`: {method: 'CREDIT_CARD', status: 'PAID', cardNumber: '525669XXXXXX0005', expiryDate: '**/****', ...}
- `paymentDetails`: Array with 3 invoice payments (1875.25, 567.64, 2108.36)
- `orderDiscounts`: [{amount: 3225, type: 'PROMOTIONS'}, {amount: 1683.75, type: 'COUPONS'}]
- `promotions`: Array of 18 promotion entries (Discount type for each item)
- `couponCodes`: [{code: 'CES2520075550', description: 'Discount|CES2520075550', discountAmount: -1683.75, ...}]
- `deliveryMethods`: HOME_DELIVERY with 13 items
- `deliveryTypeCode`: 'HOME_DELIVERY_STD'
- `sla_info`: {target_minutes: 2880, elapsed_minutes: 2800, status: 'COMPLIANT'} (48hr delivery window)
- `metadata`: {created_at, updated_at, priority: 'NORMAL', store_name: '', store_no: '', ...}
- `on_hold`: false
- `fullTaxInvoice`: false
- `allowSubstitution`: false
- `currency`: 'THB'
- `capturedDate`: '2026-01-21T11:49:00+07:00'
- `t1Member`: '8031630388'
- `billingName`: 'ธนวัฒน์ สิงห์แพรก'
- `billingAddress`: Same as shipping address
- `trackingNumber`: 'DHL0842601006994' (primary shipment)
- `shippedFrom`: 'Central Online Warehouse'
- `shippedOn`: '2026-01-21T00:00:00+07:00'
- `eta`: '01/23/2026'
- `relNo`: 'CDS2601212262851'
- `subdistrict`: 'หนองปรือ'
- `fulfillmentTimeline`: Array with Picking, Picked, Packed, Ready To Ship, Shipped, Delivered events
- `tracking`: Array of 3 shipments with tracking details

### 4. Add Order to mockApiOrders
Add the new order via `mockApiOrders.unshift(maoOrderCDS260121226285)` after the existing MAO order additions (around line 9831), so it appears as Row 3 in the order list.

### 5. Verify TypeScript Compilation
Run build to ensure no TypeScript errors were introduced.

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm run build` - Ensure no TypeScript or build errors
- `grep -n "maoOrderCDS260121226285" src/lib/mock-data.ts` - Verify new order is exported
- `grep -c "LINE-CDS26012" src/lib/mock-data.ts` - Should return 13 (one for each item line)

## Notes
- The order is from Central Department Store (DS organization) rather than Tops/CFR
- All items are children's Sanrio-branded clothing (Hello Kitty, Kuromi, Cinnamoroll)
- Each item has both promotion discount and coupon discount applied
- Three separate shipments from different warehouses
- All items have status DELIVERED with fulfillment complete
- Coupon CES2520075550 is a proportionally-applied coupon (each item gets a share of the ฿1,683.75 total based on item price)

**Promotion breakdown per item (from Promotions Modal):**
- Each item has a "Discount" promotion entry with varying amounts
- Total promotions: ฿3,225.00 (18 promotional applications)
- Total coupons: ฿1,683.75 (1 coupon CES2520075550 applied to all 13 items)

**Coupon line item values:**
| Item | SKU | Line Coupon Value |
|------|-----|-------------------|
| Girl T-Shirt Kuromi | CDS23576490 | ฿98.75 |
| Girl Pants Kuromi | CDS23576551 | ฿161.25 |
| Girl Pants Hello Kitty | CDS23582996 | ฿161.25 |
| Girl Leggings Hello Kitty | CDS23583115 | ฿98.75 |
| (remaining items follow proportional pattern based on price) |
