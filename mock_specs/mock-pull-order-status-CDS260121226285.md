# Mock Data Specification: Manhattan OMS Order Status Page

**Source URL**: `https://crcpp.omni.manh.com/customerengagementfacade/app/orderstatus?orderId=CDS260121226285&selectedOrg=DS`

**Captured Date**: 2026-01-22

**Order ID**: CDS260121226285

---

## 1. Application Header

| Field | Type | Example Value | Notes |
|-------|------|---------------|-------|
| Organization | string | `DS` | Dropdown selector |
| UI Mode | string | `Standard UI` | Dropdown selector |
| User Name | string | `Naruechon Woraphatphawan` | Logged-in user |

---

## 2. Customer Information Section

| Field | Type | Example Value | Notes |
|-------|------|---------------|-------|
| Customer Name | string | `ธนวัฒน์ สิงห์แพรก` | Thai language support |
| Phone | string | `0922643514` | Clickable |
| Email | string | `thanawat4596@gmail.com` | Clickable |
| Registration Status | string | `Not Registered` | Display only |

---

## 3. Order Status Section

### 3.1 Order Header

| Field | Type | Example Value | Notes |
|-------|------|---------------|-------|
| Order No. | string | `CDS260121226285` | Primary identifier |
| Created | datetime | `01/21/2026 11:49 +07` | GMT+7 timezone |
| Order type | string | `RT-HD-STD` | Order type code |
| Store No. | string | `` | Empty in this order |
| Related Cases | string | `undefined` | Link to case detail |
| Full Tax Invoice | boolean | `false` | |
| Customer Type Id | string | `General` | |
| The1 member | string | `8031630388` | Loyalty ID |
| Selling channel | string | `Web` | |
| Allow substitution | boolean | `false` | |
| Cust Ref | string | `2400777864` | Customer reference |
| Tax Id | string | `` | Empty if not provided |
| Company Name | string | `` | Empty if B2C |
| Branch No. | string | `` | Empty if B2C |
| Captured Date | datetime | `01/21/2026 11:49 +07` | GMT+7 timezone |
| Order Status | enum | `DELIVERED` | See Order Status enum |

### 3.2 Order Status Enum

- `DELIVERED`
- `IN_PROCESS`
- `PLANNED`
- `CANCELLED`

---

## 4. Payment Information Section

| Field | Type | Example Value | Notes |
|-------|------|---------------|-------|
| Payment Method | string | `CREDIT CARD` | |
| Card Number | string | `525669XXXXXX0005` | Masked, show first 6 and last 4 |
| Expiry Date | string | `**/****` | Fully masked |
| Amount to be charged | currency | `฿4,551.25` | Thai Baht |
| Amount charged | currency | `฿4,551.25` | Thai Baht |
| Billing Address Line 1 | string | `88/10 ม.1 ซ.ชัยพรวิถี 14 ถ.ชัยพรวิถี` | Thai address format |
| Billing Address Line 2 | string | `(รบกวนกดปุ่มเปิดประตูขวามือเข้ามาวางข้างในให้หน่อยนะคะ)` | Delivery instructions |
| Billing Address Line 3 | string | `-,-` | Optional fields |
| Billing Subdistrict | string | `หนองปรือ` | Thai |
| Billing District | string | `บางละมุง` | Thai |
| Billing Province | string | `ชลบุรี` | Thai |
| Billing Country | string | `TH` | ISO country code |
| Billing Postal Code | string | `20150` | |
| Billing Name | string | `ธนวัฒน์ สิงห์แพรก` | Thai name |
| Payment Status | enum | `PAID` | See Payment Status enum |

### 4.1 Payment Status Enum

- `PAID`
- `PENDING`
- `FAILED`
- `REFUNDED`

---

## 5. Order Promotions Summary

| Field | Type | Example Value | Notes |
|-------|------|---------------|-------|
| Order Promotions Count | number | `0` | |
| Order Appeasements Count | number | `0` | |
| Order Coupons Applied Count | number | `0` | |

---

## 6. Items Section

### 6.1 Line Item Structure

Each line item contains:

| Field | Type | Example Value | Notes |
|-------|------|---------------|-------|
| Item Name | string | `Girl T-Shirt Short Sleeves Round Neck Kuromi Viole` | Product description |
| SKU | string | `CDS23576490` | Stock keeping unit |
| ETA | date | `01/23/2026` | Estimated delivery |
| Style | string | `` | Optional |
| Color | string | `` | Optional |
| Size | string | `` | Optional |
| Promotions Count | number | `1` | Clickable for details |
| Coupons Count | number | `1` | Clickable for details |
| Appeasements Count | number | `0` | Clickable for details |
| Price | currency | `฿395.00` | Unit price |
| Shipping Method | string | `Standard Delivery` | |
| Route | string | `` | Optional |
| Booking slot from | datetime | `` | Optional for non-scheduled |
| Booking slot to | datetime | `` | Optional for non-scheduled |
| SupplyTypeId | string | `On Hand Available` | Inventory type |
| Bundle | boolean | `false` | |
| Bundle Ref Id | string | `` | If bundle = true |
| Packed Ordered Qty | number | `0` | |
| NumberOfPack | number | `` | Optional |
| PackitemDescription | string | `` | Optional |
| UOM | string | `PCS` | Unit of measure |
| Actual weight | string | `` | Optional |
| Promotion Id | string | `` | Optional |
| Promotion Type | string | `` | Optional |
| Secret code | string | `` | Optional |
| Gift with purchase | boolean | `false` | |
| Gift with purchase item | string | `` | If GWP = true |
| Gift wrapped | string | `` | Optional |
| Line Status | enum | `DELIVERED` | |

### 6.2 Line Item Fulfillment Stages

| Stage | Type | Example Value | Notes |
|-------|------|---------------|-------|
| Ordered | number | `1` | Initial quantity |
| Allocated | number | `1` | Reserved in inventory |
| Released | number | `1` | Released for picking |
| Fulfilled | number | `1` | Picked and packed |
| Delivered | number | `1` | Final delivery |

### 6.3 Line Item Pricing

| Field | Type | Example Value | Notes |
|-------|------|---------------|-------|
| Subtotal | currency | `฿395.00` | |
| Discount | currency | `฿128.07` | |
| Charges | currency | `฿0.00` | |
| Taxes | currency | `฿0.00` | |
| Total | currency | `฿266.93` | Subtotal - Discount + Charges + Taxes |
| Informational Taxes | currency | `฿17.46` | VAT included in price |

---

## 7. Order Totals

| Field | Type | Example Value | Notes |
|-------|------|---------------|-------|
| Item Subtotal | currency | `฿9,460.00` | Sum of all item subtotals |
| Total Discounts | currency | `฿4,908.75` | Sum of all discounts |
| Estimated S&H | currency | `฿0.00` | Shipping and handling |
| Other Charges | currency | `฿0.00` | Service charges |
| Estimated Taxes | currency | `฿0.00` | |
| Order Total | currency | `฿4,551.25` | Final amount |
| Informational Taxes | currency | `฿297.70` | VAT info |

---

## 8. Status Summary Section

### 8.1 Completed Shipments

**Total Count**: 3

#### Shipment Structure

| Field | Type | Example Value | Notes |
|-------|------|---------------|-------|
| Status | enum | `DELIVERED` | Shipment status |
| Tracking number | string | `DHL0842601006994` | Carrier tracking ID |
| ETA | date | `01/23/2026` | |
| Shipped on | date | `01/21/2026` | |
| Rel No. | string | `CDS2601212262851` | Release number |
| Shipped from | string | `Central Online Warehouse` | Fulfillment location |
| Subdistrict | string | `หนองปรือ` | Thai |
| CRC tracking link | url | `https://www.dhl.com/th-en/home/tracking.html?tracking-id=DHL0842601006994` | |
| Ship to Email | string | `thanawat4596@gmail.com` | |
| Ship to Name | string | `คุณ อภิญญา สิงห์แพรก` | Recipient name (Thai) |
| Ship to Address Line 1 | string | `88/10 ม.1 ซ.ชัยพรวิถี 14 ถ.ชัยพรวิถี` | |
| Ship to Address Line 2 | string | `(รบกวนกดปุ่มเปิดประตูขวามือเข้ามาวางข้างในให้หน่อยนะคะ)` | |
| Ship to City District | string | `บางละมุง, ชลบุรี 20150` | |
| Allocation Type | string | `Delivery` | |
| Phone | string | `0922643514` | |

#### Shipment Package Appeasement Options

| Field | Type | Example Value | Notes |
|-------|------|---------------|-------|
| Include Charges | boolean | `true` | Checkbox, checked by default |
| APPEASE | button | - | Action button |

#### Shipment Items

| Field | Type | Example Value | Notes |
|-------|------|---------------|-------|
| Item Name | string | `Girl Pants Hello Kitty Blue` | |
| SKU | string | `CDS23582996` | |
| Shipped Qty | number | `1` | |
| Ordered Qty | number | `1` | |
| UOM | string | `PCS` | |

### 8.2 Sample Shipments Data

#### Shipment 1 (DHL)

```json
{
  "status": "DELIVERED",
  "trackingNumber": "DHL0842601006994",
  "carrier": "DHL",
  "eta": "01/23/2026",
  "shippedOn": "01/21/2026",
  "releaseNumber": "CDS2601212262851",
  "shippedFrom": "Central Online Warehouse",
  "trackingUrl": "https://www.dhl.com/th-en/home/tracking.html?tracking-id=DHL0842601006994",
  "items": [
    { "sku": "CDS23582996", "name": "Girl Pants Hello Kitty Blue", "shippedQty": 1, "orderedQty": 1 },
    { "sku": "CDS23583115", "name": "Girl Leggings Hello Kitty Red", "shippedQty": 1, "orderedQty": 1 },
    { "sku": "CDS24077910", "name": "Girl Dress Cap Sleeves Hello Kitty Blue", "shippedQty": 1, "orderedQty": 1 },
    { "sku": "CDS24097840", "name": "Girl Toddler Dress Short Sleeves Gingham Cinnamoroll", "shippedQty": 1, "orderedQty": 1 },
    { "sku": "CDS24098465", "name": "Girl T-Shirt Puff Sleeves Cinnamoroll Light Blue", "shippedQty": 1, "orderedQty": 1 }
  ]
}
```

#### Shipment 2 (KEX Express)

```json
{
  "status": "DELIVERED",
  "trackingNumber": "KNJ0202601010946",
  "carrier": "KEX Express",
  "eta": "01/23/2026",
  "shippedOn": "01/21/2026",
  "releaseNumber": "CDS2601212262853",
  "shippedFrom": "Bangna",
  "trackingUrl": "https://th.kex-express.com/th/track/?track=KNJ0202601010946",
  "items": [
    { "sku": "CDS23576490", "name": "Girl T-Shirt Short Sleeves Round Neck Kuromi Violet", "shippedQty": 1, "orderedQty": 1 },
    { "sku": "CDS23576551", "name": "Girl Pants Wide Legs Kuromi Denim", "shippedQty": 1, "orderedQty": 1 },
    { "sku": "CDS24098083", "name": "Girl Dress Short Sleeves Gingham Hello Kitty Cherry", "shippedQty": 1, "orderedQty": 1 },
    { "sku": "CDS24098281", "name": "Girl T-Shirt Short Sleeves Round Neck Hello Kitty", "shippedQty": 1, "orderedQty": 1 },
    { "sku": "CDS24820752", "name": "Girl Toddler Pyjamas Set Dress Long Sleeves", "shippedQty": 1, "orderedQty": 1 },
    { "sku": "CDS24820776", "name": "Girl Toddler Pyjamas Set Dress Long Sleeves", "shippedQty": 1, "orderedQty": 1 }
  ]
}
```

#### Shipment 3 (KEX Express)

```json
{
  "status": "DELIVERED",
  "trackingNumber": "KNJ0202601010865",
  "carrier": "KEX Express",
  "eta": "01/23/2026",
  "shippedOn": "01/21/2026",
  "releaseNumber": "CDS2601212262852",
  "shippedFrom": "Lardprao",
  "trackingUrl": "https://th.kex-express.com/th/track/?track=KNJ0202601010865",
  "items": [
    { "sku": "CDS24097574", "name": "Girl Toddler T-Shirt Puff Sleeves Hello Kitty White", "shippedQty": 1, "orderedQty": 1 },
    { "sku": "CDS24097635", "name": "Girl Toddler Shorts Hello Kitty Cherry Blossom Pink", "shippedQty": 1, "orderedQty": 1 }
  ]
}
```

### 8.3 In Process Shipments

**Total Count**: 0

### 8.4 Planned Shipments

**Total Count**: 0

---

## 9. Payments and Settlements Section

**Total Count**: 3 (One per shipment)

### 9.1 Invoice Structure

| Field | Type | Example Value | Notes |
|-------|------|---------------|-------|
| Invoice type | string | `Shipment` | |
| Invoice No. | string | `17689833173984144989` | |
| Invoice status | enum | `Closed` | |
| Invoice date | date | `01/21/2026` | |
| Invoice amount | currency | `฿1,875.25` | |

### 9.2 Invoice Line Items

| Field | Type | Example Value | Notes |
|-------|------|---------------|-------|
| Item Name | string | `Girl Pants Hello Kitty Blue` | |
| SKU | string | `CDS23582996` | |
| Qty | number | `1` | |
| Unit price | currency | `฿1,290.00` | |
| Subtotal | currency | `฿1,290.00` | |
| Discount | currency | `฿854.13` | |
| Charges | currency | `฿0.00` | |
| Taxes | currency | `฿0.00` | |
| Total | currency | `฿435.87` | |
| Informational Taxes | currency | `฿28.51` | |

### 9.3 Invoice Payment Info

| Field | Type | Example Value | Notes |
|-------|------|---------------|-------|
| Card Number | string | `525669XXXXXX0005` | Masked |
| Transaction date | datetime | `` | May be empty |
| Amount Charged | currency | `฿1,875.25` | |

### 9.4 Invoice Summary

| Field | Type | Example Value | Notes |
|-------|------|---------------|-------|
| Item Subtotal | currency | `฿4,510.00` | |
| Total Discounts | currency | `฿2,634.75` | |
| Total Charges | currency | `฿0.00` | |
| Total Taxes | currency | `฿0.00` | |
| Shipment Total | currency | `฿1,875.25` | |
| Informational Taxes | currency | `฿122.66` | |

### 9.5 Sample Invoices Data

#### Invoice 1

```json
{
  "invoiceType": "Shipment",
  "invoiceNo": "17689833173984144989",
  "invoiceStatus": "Closed",
  "invoiceDate": "01/21/2026",
  "invoiceAmount": 1875.25,
  "items": [
    { "sku": "CDS23582996", "name": "Girl Pants Hello Kitty Blue", "qty": 1, "unitPrice": 1290.00, "subtotal": 1290.00, "discount": 854.13, "charges": 0, "taxes": 0, "total": 435.87, "infoTaxes": 28.51 },
    { "sku": "CDS23583115", "name": "Girl Leggings Hello Kitty Red", "qty": 1, "unitPrice": 790.00, "subtotal": 790.00, "discount": 523.07, "charges": 0, "taxes": 0, "total": 266.93, "infoTaxes": 17.46 },
    { "sku": "CDS24077910", "name": "Girl Dress Cap Sleeves Hello Kitty Blue", "qty": 1, "unitPrice": 1390.00, "subtotal": 1390.00, "discount": 920.35, "charges": 0, "taxes": 0, "total": 469.65, "infoTaxes": 30.72 },
    { "sku": "CDS24097840", "name": "Girl Toddler Dress Short Sleeves Gingham Cinnamoroll", "qty": 1, "unitPrice": 645.00, "subtotal": 645.00, "discount": 209.13, "charges": 0, "taxes": 0, "total": 435.87, "infoTaxes": 28.51 },
    { "sku": "CDS24098465", "name": "Girl T-Shirt Puff Sleeves Cinnamoroll Light Blue", "qty": 1, "unitPrice": 395.00, "subtotal": 395.00, "discount": 128.07, "charges": 0, "taxes": 0, "total": 266.93, "infoTaxes": 17.46 }
  ],
  "payment": {
    "cardNumber": "525669XXXXXX0005",
    "amountCharged": 1875.25
  },
  "summary": {
    "itemSubtotal": 4510.00,
    "totalDiscounts": 2634.75,
    "totalCharges": 0,
    "totalTaxes": 0,
    "shipmentTotal": 1875.25,
    "informationalTaxes": 122.66
  }
}
```

#### Invoice 2

```json
{
  "invoiceType": "Shipment",
  "invoiceNo": "17689839997298882773",
  "invoiceStatus": "Closed",
  "invoiceDate": "01/21/2026",
  "invoiceAmount": 567.64,
  "items": [
    { "sku": "CDS24097574", "name": "Girl Toddler T-Shirt Puff Sleeves Hello Kitty White", "qty": 1, "unitPrice": 345.00, "subtotal": 345.00, "discount": 111.86, "charges": 0, "taxes": 0, "total": 233.14, "infoTaxes": 15.25 },
    { "sku": "CDS24097635", "name": "Girl Toddler Shorts Hello Kitty Cherry Blossom Pink", "qty": 1, "unitPrice": 495.00, "subtotal": 495.00, "discount": 160.50, "charges": 0, "taxes": 0, "total": 334.50, "infoTaxes": 21.88 }
  ],
  "payment": {
    "cardNumber": "525669XXXXXX0005",
    "amountCharged": 567.64
  },
  "summary": {
    "itemSubtotal": 840.00,
    "totalDiscounts": 272.36,
    "totalCharges": 0,
    "totalTaxes": 0,
    "shipmentTotal": 567.64,
    "informationalTaxes": 37.13
  }
}
```

#### Invoice 3

```json
{
  "invoiceType": "Shipment",
  "invoiceNo": "17689858488467027983",
  "invoiceStatus": "Closed",
  "invoiceDate": "01/21/2026",
  "invoiceAmount": 2108.36,
  "items": [
    { "sku": "CDS23576490", "name": "Girl T-Shirt Short Sleeves Round Neck Kuromi Violet", "qty": 1, "unitPrice": 395.00, "subtotal": 395.00, "discount": 128.07, "charges": 0, "taxes": 0, "total": 266.93, "infoTaxes": 17.46 },
    { "sku": "CDS23576551", "name": "Girl Pants Wide Legs Kuromi Denim", "qty": 1, "unitPrice": 645.00, "subtotal": 645.00, "discount": 209.13, "charges": 0, "taxes": 0, "total": 435.87, "infoTaxes": 28.51 },
    { "sku": "CDS24098083", "name": "Girl Dress Short Sleeves Gingham Hello Kitty Cherry", "qty": 1, "unitPrice": 695.00, "subtotal": 695.00, "discount": 225.37, "charges": 0, "taxes": 0, "total": 469.63, "infoTaxes": 30.72 },
    { "sku": "CDS24098281", "name": "Girl T-Shirt Short Sleeves Round Neck Hello Kitty", "qty": 1, "unitPrice": 395.00, "subtotal": 395.00, "discount": 128.07, "charges": 0, "taxes": 0, "total": 266.93, "infoTaxes": 17.46 },
    { "sku": "CDS24820752", "name": "Girl Toddler Pyjamas Set Dress Long Sleeves", "qty": 1, "unitPrice": 990.00, "subtotal": 990.00, "discount": 655.50, "charges": 0, "taxes": 0, "total": 334.50, "infoTaxes": 21.88 },
    { "sku": "CDS24820776", "name": "Girl Toddler Pyjamas Set Dress Long Sleeves", "qty": 1, "unitPrice": 990.00, "subtotal": 990.00, "discount": 655.50, "charges": 0, "taxes": 0, "total": 334.50, "infoTaxes": 21.88 }
  ],
  "payment": {
    "cardNumber": "525669XXXXXX0005",
    "amountCharged": 2108.36
  },
  "summary": {
    "itemSubtotal": 4110.00,
    "totalDiscounts": 2001.64,
    "totalCharges": 0,
    "totalTaxes": 0,
    "shipmentTotal": 2108.36,
    "informationalTaxes": 137.91
  }
}
```

---

## 10. Complete Line Items List

| # | SKU | Item Name | Price | Discount | Total |
|---|-----|-----------|-------|----------|-------|
| 1 | CDS23576490 | Girl T-Shirt Short Sleeves Round Neck Kuromi Violet | ฿395.00 | ฿128.07 | ฿266.93 |
| 2 | CDS23576551 | Girl Pants Wide Legs Kuromi Denim | ฿645.00 | ฿209.13 | ฿435.87 |
| 3 | CDS23582996 | Girl Pants Hello Kitty Blue | ฿1,290.00 | ฿854.13 | ฿435.87 |
| 4 | CDS23583115 | Girl Leggings Hello Kitty Red | ฿790.00 | ฿523.07 | ฿266.93 |
| 5 | CDS24077910 | Girl Dress Cap Sleeves Hello Kitty Blue | ฿1,390.00 | ฿920.35 | ฿469.65 |
| 6 | CDS24097574 | Girl Toddler T-Shirt Puff Sleeves Hello Kitty White | ฿345.00 | ฿111.86 | ฿233.14 |
| 7 | CDS24097635 | Girl Toddler Shorts Hello Kitty Cherry Blossom Pink | ฿495.00 | ฿160.50 | ฿334.50 |
| 8 | CDS24097840 | Girl Toddler Dress Short Sleeves Gingham Cinnamoroll | ฿645.00 | ฿209.13 | ฿435.87 |
| 9 | CDS24098083 | Girl Dress Short Sleeves Gingham Hello Kitty Cherry | ฿695.00 | ฿225.37 | ฿469.63 |
| 10 | CDS24098281 | Girl T-Shirt Short Sleeves Round Neck Hello Kitty | ฿395.00 | ฿128.07 | ฿266.93 |
| 11 | CDS24098465 | Girl T-Shirt Puff Sleeves Cinnamoroll Light Blue | ฿395.00 | ฿128.07 | ฿266.93 |
| 12 | CDS24820752 | Girl Toddler Pyjamas Set Dress Long Sleeves | ฿990.00 | ฿655.50 | ฿334.50 |
| 13 | CDS24820776 | Girl Toddler Pyjamas Set Dress Long Sleeves | ฿990.00 | ฿655.50 | ฿334.50 |

**Total Items**: 13

---

## 11. Enumerations

### 11.1 Order Status

```typescript
type OrderStatus = 'DELIVERED' | 'IN_PROCESS' | 'PLANNED' | 'CANCELLED';
```

### 11.2 Payment Status

```typescript
type PaymentStatus = 'PAID' | 'PENDING' | 'FAILED' | 'REFUNDED';
```

### 11.3 Invoice Status

```typescript
type InvoiceStatus = 'Closed' | 'Open' | 'Cancelled';
```

### 11.4 Shipment Status

```typescript
type ShipmentStatus = 'DELIVERED' | 'IN_TRANSIT' | 'SHIPPED' | 'PENDING';
```

### 11.5 Supply Type

```typescript
type SupplyType = 'On Hand Available' | 'Backorder' | 'Preorder';
```

### 11.6 Allocation Type

```typescript
type AllocationType = 'Delivery' | 'Pickup' | 'Ship to Store';
```

---

## 12. Carriers

| Carrier | Tracking URL Pattern |
|---------|---------------------|
| DHL | `https://www.dhl.com/th-en/home/tracking.html?tracking-id={trackingNumber}` |
| KEX Express | `https://th.kex-express.com/th/track/?track={trackingNumber}` |

---

## 13. Data Formatting Notes

1. **Currency**: Thai Baht (฿) with 2 decimal places, comma separator for thousands
2. **Date Format**: `MM/DD/YYYY` (US format)
3. **DateTime Format**: `MM/DD/YYYY HH:mm +07` (with GMT+7 timezone)
4. **Phone Format**: 10 digits, no formatting (e.g., `0922643514`)
5. **Card Masking**: First 6 digits + XXXXXX + Last 4 digits
6. **Thai Language**: Full support for Thai characters in names and addresses

---

## 14. UI Components

1. **Virtual Scroll**: Uses Angular CDK virtual scrolling for Items, Shipments, and Invoices
2. **Expandable Sections**: Accordion-style for Completed Shipments, In Process Shipments, Planned Shipments, Payments and Settlements
3. **Action Buttons**: "More Info" on each line item, "APPEASE" on each shipment
4. **Checkboxes**: "Include Charges" for appeasement options
5. **Links**: Tracking URLs, Case detail links

---

## 15. Complete JSON Response Structure

```json
{
  "order": {
    "orderId": "CDS260121226285",
    "orderNo": "CDS260121226285",
    "created": "2026-01-21T11:49:00+07:00",
    "orderType": "RT-HD-STD",
    "status": "DELIVERED",
    "capturedDate": "2026-01-21T11:49:00+07:00",
    "fullTaxInvoice": false,
    "allowSubstitution": false,
    "sellingChannel": "Web",
    "custRef": "2400777864"
  },
  "customer": {
    "name": "ธนวัฒน์ สิงห์แพรก",
    "phone": "0922643514",
    "email": "thanawat4596@gmail.com",
    "registrationStatus": "Not Registered",
    "customerTypeId": "General",
    "the1Member": "8031630388"
  },
  "payment": {
    "status": "PAID",
    "method": "CREDIT CARD",
    "cardNumber": "525669XXXXXX0005",
    "expiryDate": "**/****",
    "amountToBeCharged": 4551.25,
    "amountCharged": 4551.25,
    "billingAddress": {
      "line1": "88/10 ม.1 ซ.ชัยพรวิถี 14 ถ.ชัยพรวิถี",
      "line2": "(รบกวนกดปุ่มเปิดประตูขวามือเข้ามาวางข้างในให้หน่อยนะคะ)",
      "subdistrict": "หนองปรือ",
      "district": "บางละมุง",
      "province": "ชลบุรี",
      "country": "TH",
      "postalCode": "20150"
    },
    "billingName": "ธนวัฒน์ สิงห์แพรก"
  },
  "promotionsSummary": {
    "orderPromotions": 0,
    "orderAppeasements": 0,
    "orderCouponsApplied": 0
  },
  "items": [
    {
      "sku": "CDS23576490",
      "name": "Girl T-Shirt Short Sleeves Round Neck Kuromi Violet",
      "eta": "2026-01-23",
      "price": 395.00,
      "shippingMethod": "Standard Delivery",
      "supplyTypeId": "On Hand Available",
      "bundle": false,
      "uom": "PCS",
      "giftWithPurchase": false,
      "status": "DELIVERED",
      "fulfillment": { "ordered": 1, "allocated": 1, "released": 1, "fulfilled": 1, "delivered": 1 },
      "pricing": { "subtotal": 395.00, "discount": 128.07, "charges": 0, "taxes": 0, "total": 266.93, "informationalTaxes": 17.46 },
      "promotions": 1,
      "coupons": 1,
      "appeasements": 0
    }
  ],
  "orderTotals": {
    "itemSubtotal": 9460.00,
    "totalDiscounts": 4908.75,
    "estimatedSH": 0,
    "otherCharges": 0,
    "estimatedTaxes": 0,
    "orderTotal": 4551.25,
    "informationalTaxes": 297.70
  },
  "statusSummary": {
    "completedShipments": {
      "count": 3,
      "shipments": []
    },
    "inProcessShipments": {
      "count": 0,
      "shipments": []
    },
    "plannedShipments": {
      "count": 0,
      "shipments": []
    },
    "paymentsAndSettlements": {
      "count": 3,
      "invoices": []
    }
  }
}
```
