# Manhattan WMS Order Status Data Specification

**Source URL**: https://crcpp.omni.manh.com/customerengagementfacade/app/orderstatus?orderId=CDS260130806823&selectedOrg=DS

**Captured Date**: 2026-02-01

**Sample Order ID**: CDS260130806823

---

## 1. Customer Information Section

### Customer Profile
- **Customer Name** (Thai): `สุทิศา ทับเอี่ยม`
- **Phone**: `0855500085`
- **Email**: `dummyemail_qRakhvnA_@xyz.com`
- **Registration Status**: `Not Registered`

---

## 2. Order Status Section

### Order Header
- **Order Status**: `DELIVERED` (with status badge)
- **Order Number** (`order_no`): `CDS260130806823`
- **Created Date** (`created`): `01/30/2026 07:17 +07` (GMT+7 timezone)
- **Order Type** (`order_type`): `RT-HD-STD`
- **Store Number** (`store_no`): (empty in this order)
- **Related Cases** (`related_cases`): `undefined` (with clickable link)

### Order Properties
- **Full Tax Invoice** (`full_tax_invoice`): `true`
- **Customer Type ID** (`customer_type_id`): `General`
- **The1 Member** (`the1_member`): (boolean flag - true in this case)
- **Selling Channel** (`selling_channel`): `Web`
- **Allow Substitution** (`allow_substitution`): `false`
- **Customer Reference** (`cust_ref`): `2409849642`
- **Tax ID** (`tax_id`): `3451100654063`
- **Company Name** (`company_name`): (empty)
- **Branch Number** (`branch_no`): (empty)
- **Captured Date** (`captured_date`): `01/30/2026 07:17 +07`

---

## 3. Payment Info Section

### Payment Status
- **Payment Status**: `PAID`
- **Payment Method**: `BANK TRANSFER`

### Payment Amounts
- **Amount to be Charged** (`amount_to_be_charged`): `฿3,700.00`
- **Amount Charged** (`amount_charged`): `฿3,700.00`

### Billing Address
- **Billing Address Line 1** (`billing_address_1`): `99/20 คอนโดยู ถ.หัวหมาก,-,-,`
- **Billing Address Line 2** (`billing_address_2`): `หัวหมาก,บางกะปิ,กรุงเทพมหานคร,TH,10250`
- **Billing Name** (`billing_name`): `นางสาวดาราณี จวงหัวโทน`

---

## 4. Order Promotions, Appeasements, and Coupons

### Summary Counts
- **Order Promotions Count**: `0`
- **Order Appeasements Count**: `0`
- **Order Coupons Applied Count**: `0`

---

## 5. Items Section

### Item List
Multiple order line items with the following structure:

#### Item Example 1: GET FREE - MYSLF EAU DE PARFUM 1.2 mL
- **Item Name** (`item_name`): `GET FREE - MYSLF EAU DE PARFUM 1.2 mL`
- **SKU** (`sku`): `CDS10174760`
- **ETA** (`eta`): `02/01/2026`
- **Style** (`style`): (empty)
- **Color** (`color`): (empty)
- **Size** (`size`): (empty)
- **Price** (`price`): `฿0.00`
- **Notes Count** (`notes_count`): `0`

##### Item Promotions/Coupons/Appeasements
- **Promotions**: `0`
- **Coupons**: `0`
- **Appeasements**: `0`

##### Fulfillment & Shipping Details
- **Shipping Method** (`shipping_method`): `Standard Delivery`
- **Route** (`route`): (empty)
- **Booking Slot From** (`booking_slot_from`): (empty)
- **Booking Slot To** (`booking_slot_to`): (empty)
- **Supply Type ID** (`supply_type_id`): `On Hand Available`
- **Bundle** (`bundle`): `false`
- **Bundle Ref ID** (`bundle_ref_id`): (empty)
- **Packed Ordered Qty** (`packed_ordered_qty`): `0`
- **Number of Pack** (`number_of_pack`): (empty)
- **Pack Item Description** (`pack_item_description`): (empty)
- **UOM** (`uom`): `PCS`
- **Actual Weight** (`actual_weight`): (empty)
- **Promotion ID** (`promotion_id`): (empty)
- **Promotion Type** (`promotion_type`): (empty)
- **Secret Code** (`secret_code`): (empty)
- **Gift with Purchase** (`gift_with_purchase`): `false`
- **Gift with Purchase Item** (`gift_with_purchase_item`): (empty)
- **Gift Wrapped** (`gift_wrapped`): (empty)

##### Item Status Breakdown
- **Status**: `DELIVERED`
- **Ordered Quantity**: `1`
- **Allocated Quantity**: `1`
- **Released Quantity**: `1`
- **Fulfilled Quantity**: `1`
- **Delivered Quantity**: `1`

##### Item Financial Summary
- **Subtotal**: `฿0.00`
- **Discount**: `฿0.00`
- **Charges**: `฿0.00`
- **Taxes**: `฿0.00`
- **Total**: `฿0.00`

#### Item Example 2: YSL All Hours Glow Foundation
- **Item Name**: `GET FREE - YSL All Hours Glow Foundation LC1 1 mL`
- **SKU**: `CDS23578005`
- **Quantities**: Ordered: 2, Allocated: 2, Released: 2, Fulfilled: 2, Delivered: 2
- (Same field structure as Item Example 1)

#### Item Example 3: Libre EDP
- **Item Name**: `GET FREE - Libre EDP 1.2 mL`
- **SKU**: `CDS23619029`
- **Quantities**: Ordered: 1, Allocated: 1, Released: 1, Fulfilled: 1, Delivered: 1
- (Same field structure as Item Example 1)

#### Item Example 4: Libre EDP (Duplicate SKU, Different Line)
- **Item Name**: `GET FREE - Libre EDP 1.2 mL`
- **SKU**: `CDS23619029`
- **Quantities**: Ordered: 2, Allocated: 2, Released: 2, Fulfilled: 2, Delivered: 2
- (Same field structure as Item Example 1)

#### Item Example 5: Lipstick (PAID ITEM)
- **Item Name**: `Lipstick Loveshine Candy Glow Valentines Limited E`
- **SKU**: `CDS26769646`
- **Price**: `฿1,850.00` per unit
- **Quantities**: Ordered: 2, Allocated: 2, Released: 2, Fulfilled: 2, Delivered: 2
- **Financial Summary**:
  - Subtotal: `฿3,700.00`
  - Discount: `฿0.00`
  - Charges: `฿0.00`
  - Taxes: `฿0.00`
  - Total: `฿3,700.00`
  - Informational Taxes: `฿242.06`

#### Item Example 6: Ang Pao Packet Set
- **Item Name**: `GET FREE - Ang Pao Packet Set`
- **SKU**: `CDS27800461`
- **Quantities**: Ordered: 1, Allocated: 1, Released: 1, Fulfilled: 1, Delivered: 1
- (Same field structure as Item Example 1)

---

## 6. Order Financial Summary

### Order Totals
- **Item Subtotal** (`item_subtotal`): `฿3,700.00`
- **Total Discounts** (`total_discounts`): `฿0.00`
- **Estimated S&H** (`estimated_sh`): `฿0.00`
- **Other Charges*** (`other_charges`): `฿0.00`
  - *Note: Includes various service charges for the order
- **Estimated Taxes** (`estimated_taxes`): `฿0.00`
- **Order Total** (`order_total`): `฿3,700.00`
- **Informational Taxes** (`informational_taxes`): `฿242.06`

---

## 7. Status Summary Section

### 7.1 Completed Shipments (Expanded by Default)

#### Package Appeasement Options
- **Include Charges Checkbox** (`include_charges`): `checked` (boolean)
- **APPEASE Button**: Available for customer service actions

#### Shipment Details
- **Status**: `DELIVERED`
- **Tracking Number** (`tracking_number`): `FEX0842601001855` (clickable link)
- **ETA** (`eta`): `02/01/2026`
- **Shipped On** (`shipped_on`): `01/30/2026`
- **Release Number** (`rel_no`): `CDS2601308068231`
- **Shipped From** (`shipped_from`): `Central Online Warehouse`
- **Shipping Method** (`shipping_method`): `Standard Delivery`
- **Subdistrict** (`subdistrict`): `ท่าอิฐ`
- **CRC Tracking Link** (`crc_tracking_link`): `https://www.flashexpress.co.th/tracking/?se=FEX0842601001855`

#### Ship to Address
- **Email**: `dummyemail_qRakhvnA_@xyz.com`
- **Recipient Name**: `สุทิศา ทับเอี่ยม`
- **Address Line 1**: `98/242 หมู่บ้านคาซ่าวิลล์ 2 ซ.15/2 ถ.ราชพฤกษ์-รัตนาธิเบศร์`
- **Address Line 2**: `-`
- **Address Line 3**: `-`
- **City/Province/Postal**: `ปากเกร็ด, นนทบุรี 11120, TH`
- **Allocation Type** (`allocation_type`): `Delivery`
- **Phone**: `0855500085`

#### Shipped Items List
Each shipped item includes:
- **Item Name**
- **SKU**
- **Shipped Qty** (`shipped_qty`)
- **Ordered Qty** (`ordered_qty`)
- **UOM**: `PCS`

Example shipped items:
1. GET FREE - MYSLF EAU DE PARFUM 1.2 mL (CDS10174760) - Shipped: 1, Ordered: 1
2. GET FREE - YSL All Hours Glow Foundation LC1 1 mL (CDS23578005) - Shipped: 2, Ordered: 2
3. GET FREE - Libre EDP 1.2 mL (CDS23619029) - Shipped: 1, Ordered: 1
4. GET FREE - Libre EDP 1.2 mL (CDS23619029) - Shipped: 2, Ordered: 2
5. Lipstick Loveshine Candy Glow Valentines Limited E (CDS26769646) - Shipped: 2, Ordered: 2
6. GET FREE - Ang Pao Packet Set (CDS27800461) - Shipped: 1, Ordered: 1

### 7.2 In Process Shipments
- **Count**: `0`
- **Status**: Collapsed section (no items)

### 7.3 Planned Shipments
- **Count**: `0`
- **Status**: Collapsed section (no items)

### 7.4 Payments and Settlements (Expanded by Default)

#### Invoice Information
- **Invoice Type** (`invoice_type`): `Shipment`
- **Invoice Number** (`invoice_no`): `17697640380197003278`
- **Invoice Status** (`invoice_status`): `Closed`
- **Invoice Date** (`invoice_date`): `01/30/2026`
- **Invoice Amount** (`invoice_amount`): `฿3,700.00`

#### Invoiced Items
Each invoiced item includes:
- **Item Name**
- **SKU**
- **Quantity** (`qty`)
- **Unit Price** (`unit_price`)
- **Subtotal** (`subtotal`)
- **Discount** (`discount`)
- **Charges** (`charges`)
- **Taxes** (`taxes`)
- **Total** (`total`)
- **Informational Taxes** (`informational_taxes`) - only for taxable items

Example invoiced items:
1. GET FREE - MYSLF EAU DE PARFUM 1.2 mL (CDS10174760)
   - Qty: 1, Unit Price: ฿0.00, Total: ฿0.00

2. GET FREE - YSL All Hours Glow Foundation LC1 1 mL (CDS23578005)
   - Qty: 2, Unit Price: ฿0.00, Total: ฿0.00

3. GET FREE - Libre EDP 1.2 mL (CDS23619029)
   - Qty: 1, Unit Price: ฿0.00, Total: ฿0.00

4. GET FREE - Libre EDP 1.2 mL (CDS23619029)
   - Qty: 2, Unit Price: ฿0.00, Total: ฿0.00

5. Lipstick Loveshine Candy Glow Valentines Limited E (CDS26769646)
   - Qty: 2, Unit Price: ฿1,850.00, Subtotal: ฿3,700.00, Total: ฿3,700.00
   - Informational Taxes: ฿242.06

6. GET FREE - Ang Pao Packet Set (CDS27800461)
   - Qty: 1, Unit Price: ฿0.00, Total: ฿0.00

#### Payment Transaction Details
- **Payment Method**: `Bank Transfer`
- **Transaction Date** (`transaction_date`): `01/30/2026`
- **Amount Charged** (`amount_charged`): `฿3,700.00`

#### Shipment Financial Summary
- **Item Subtotal**: `฿3,700.00`
- **Total Discounts**: `-` `฿0.00`
- **Total Charges**: `+` `฿0.00`
- **Total Taxes**: `+` `฿0.00`
- **Shipment Total**: `=` `฿3,700.00`
- **Informational Taxes**: `฿242.06`

---

## 8. Additional Features

### Fulfillment Info Modal
When clicking "More Info" button on an item, a modal appears with two sections:
- **Fulfillment Status** (left panel)
- **Tracking Status** (right panel)

Note: The modal content appears to load data from external sources and may display fulfillment timelines and tracking events.

---

## 9. Data Type Definitions

### Currency Fields
All currency values are in Thai Baht (฿) format:
- Example: `฿3,700.00`, `฿1,850.00`, `฿0.00`

### Date/Time Fields
All dates include GMT+7 timezone:
- Format: `MM/DD/YYYY HH:MM +07`
- Example: `01/30/2026 07:17 +07`
- Date-only format: `MM/DD/YYYY`
- Example: `01/30/2026`

### Boolean Fields
- Values: `true`, `false`
- Display: Some booleans shown as text (e.g., "false" for Bundle field)

### Quantity Fields
- Integer values
- Examples: `0`, `1`, `2`

### Status Values
- **Order Status**: `DELIVERED`, `IN_PROCESS`, `PLANNED`, etc.
- **Payment Status**: `PAID`, `PENDING`, etc.
- **Invoice Status**: `Closed`, `Open`, etc.
- **Item Status**: Tracks through fulfillment pipeline (Ordered → Allocated → Released → Fulfilled → Delivered)

---

## 10. UI Navigation Elements

### Header
- **Organization Selector**: `DS` dropdown
- **UI Theme Selector**: `Standard UI` dropdown
- **Help Icon**: Button with question mark icon
- **User Profile**: `Naruechon Woraphatphawan` dropdown

### Sidebar Navigation
- **Home**: Icon + label
- **Item Search**: Icon + label
- **Orders**: Icon + label (current page)

### Expandable Sections
- **Completed Shipments (1)**: Expanded by default
- **In Process Shipments (0)**: Collapsed
- **Planned Shipments (0)**: Collapsed
- **Payments and Settlements (1)**: Expanded by default

---

## 11. Mapping to Omnia-UI Order Schema

### Key Field Mappings

```typescript
// Manhattan WMS → Omnia-UI mapping
{
  // Order Header
  order_no: "CDS260130806823",           // → order_id
  created: "01/30/2026 07:17 +07",       // → order_date
  order_type: "RT-HD-STD",               // → order_type
  status: "DELIVERED",                    // → order_status

  // Customer Info
  customer_name: "สุทิศา ทับเอี่ยม",      // → customer_name
  phone: "0855500085",                   // → customer_phone
  email: "dummyemail_qRakhvnA_@xyz.com", // → customer_email

  // Payment Info
  payment_method: "BANK TRANSFER",       // → payment_method
  amount_charged: 3700.00,               // → payment_amount
  payment_status: "PAID",                // → payment_status

  // Financial Summary
  item_subtotal: 3700.00,                // → subtotal_amount
  order_total: 3700.00,                  // → total_amount
  informational_taxes: 242.06,           // → tax_amount

  // Shipping Info
  tracking_number: "FEX0842601001855",   // → tracking_number
  shipped_from: "Central Online Warehouse", // → warehouse_location
  shipping_method: "Standard Delivery",  // → shipping_method
  eta: "02/01/2026",                     // → estimated_delivery_date
  shipped_on: "01/30/2026",              // → shipped_date

  // Items (per line item)
  items: [{
    sku: "CDS26769646",                  // → item_sku
    item_name: "Lipstick...",            // → item_name
    unit_price: 1850.00,                 // → unit_price
    qty: 2,                              // → quantity
    subtotal: 3700.00,                   // → line_total
    status: "DELIVERED"                  // → item_status
  }]
}
```

---

## 12. Notes and Observations

1. **Free Items**: Multiple "GET FREE" promotional items with `฿0.00` price
2. **Duplicate SKUs**: Same SKU (CDS23619029) appears in multiple line items with different quantities
3. **Thai Language Support**: Customer names, addresses, and some labels in Thai
4. **Informational Taxes**: Displayed separately from charged taxes (VAT information)
5. **Tracking Integration**: Links to Flash Express tracking system
6. **Timezone**: All timestamps in GMT+7 (Bangkok/Asia timezone)
7. **The1 Membership**: Loyalty program integration indicated
8. **Gift Items**: Support for gift wrapping and gift with purchase promotions
9. **Bundle Support**: Orders can contain bundled items (not present in this example)
10. **Allocation Type**: Distinguishes between Delivery, Pickup, etc.

---

**End of Specification**
