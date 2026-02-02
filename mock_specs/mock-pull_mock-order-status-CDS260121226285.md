# Mock Data Specification: Manhattan OMS Order Status Page

**Source URL**: `https://crcpp.omni.manh.com/customerengagementfacade/app/orderstatus?orderId=CDS260121226285&selectedOrg=DS`
**Capture Date**: 2026-01-22
**Application**: Manhattan OMS Contact Center
**Order ID**: CDS260121226285

---

## 1. Application Header

| Field | Type | Example Value | Notes |
|-------|------|---------------|-------|
| Application Title | string | "CONTACT CENTER" | Fixed heading |
| Organization | string | "DS" | Dropdown selector |
| UI Mode | string | "Standard UI" | Dropdown selector |
| User Name | string | "Naruechon Woraphatphawan" | Logged-in user |

---

## 2. Navigation Menu

| Field | Type | Example Value | Notes |
|-------|------|---------------|-------|
| Home | link | `/home` | Navigation item |
| Item Search | link | `/itemsearch` | Navigation item |
| Orders | link | `/orders` | Navigation item |

---

## 3. Customer Information

| Field | Type | Example Value | Notes |
|-------|------|---------------|-------|
| Customer Name | string | "ธนวัฒน์ สิงห์แพรก" | Thai name, expandable dropdown |
| Phone | string | "0922643514" | 10-digit format |
| Email | string | "thanawat4596@gmail.com" | Email address |
| Registration Status | string | "Not Registered" | Membership status |

---

## 4. Order Status Section

### 4.1 Order Header

| Field | Type | Example Value | Notes |
|-------|------|---------------|-------|
| Order Status | enum | "DELIVERED" | See status enums below |
| Order No. | string | "CDS260121226285" | Order identifier |
| Created | datetime | "01/21/2026 11:49 +07" | MM/DD/YYYY HH:mm +07 format |
| Order type | string | "RT-HD-STD" | Order type code |

### 4.2 Store Information

| Field | Type | Example Value | Notes |
|-------|------|---------------|-------|
| Store No. | string | "" | Empty in this order |
| Related Cases | string | "undefined" | Links to case detail page |

### 4.3 Order Details

| Field | Type | Example Value | Notes |
|-------|------|---------------|-------|
| Full Tax Invoice | boolean | false | Tax invoice flag |
| Customer Type Id | string | "General" | Customer category |
| The1 member | string | "8031630388" | Loyalty card number |
| Selling channel | string | "Web" | Sales channel |
| Allow substitution | boolean | false | Substitution allowed flag |
| Cust Ref | string | "2400777864" | Customer reference |
| Tax Id | string | "" | Optional tax ID |
| Company Name | string | "" | Optional company name |
| Branch No. | string | "" | Optional branch number |
| Captured Date | datetime | "01/21/2026 11:49 +07" | Order capture timestamp |

---

## 5. Payment Information

### 5.1 Payment Header

| Field | Type | Example Value | Notes |
|-------|------|---------------|-------|
| Section Title | string | "PAYMENT INFO" | Fixed heading |
| Payment Status | enum | "PAID" | See payment status enums |

### 5.2 Payment Details

| Field | Type | Example Value | Notes |
|-------|------|---------------|-------|
| CREDIT CARD | string | "525669XXXXXX0005" | Masked card number (6+XXXXXX+4) |
| Expiry Date | string | "**/****" | Masked expiry |
| Amount to be charged | currency | "฿4,551.25" | Thai Baht, 2 decimals |
| Amount charged | currency | "฿4,551.25" | Thai Baht, 2 decimals |

### 5.3 Billing Address

| Field | Type | Example Value | Notes |
|-------|------|---------------|-------|
| Billing Address | string | "88/10 ม.1 ซ.ชัยพรวิถี 14 ถ.ชัยพรวิถี (รบกวนกดปุ่มเปิดประตูขวามือเข้ามาวางข้างในให้หน่อยนะคะ),-,-," | Multi-line, Thai with special instructions |
| Address Line 2 | string | "หนองปรือ,บางละมุง,ชลบุรี,TH,20150" | Subdistrict, District, Province, Country, Postal |
| Billing Name | string | "ธนวัฒน์ สิงห์แพรก" | Customer name |

---

## 6. Order Summary Counts

| Field | Type | Example Value | Notes |
|-------|------|---------------|-------|
| ORDER PROMOTIONS | integer | 0 | Count of order-level promotions |
| ORDER APPEASEMENTS | integer | 0 | Count of order-level appeasements |
| ORDER COUPONS APPLIED | integer | 0 | Count of order-level coupons |

---

## 7. Items Section

### 7.1 Item Card Structure

Each item displays:

| Field | Type | Example Value | Notes |
|-------|------|---------------|-------|
| Product Name | string | "Girl T-Shirt Short Sleeves Round Neck Kuromi Viole" | Product description |
| SKU | string | "CDS23576490" | Stock keeping unit |
| ETA | date | "01/23/2026" | Estimated arrival date (MM/DD/YYYY) |
| Notes Count | integer | 0 | Number of item notes |
| Style | string | "" | Optional style attribute |
| Color | string | "" | Optional color attribute |
| Size | string | "" | Optional size attribute |
| Promotions Count | integer | 1 | Clickable link |
| Coupons Count | integer | 1 | Clickable link |
| Appeasements Count | integer | 0 | Clickable link |
| PRICE | currency | "฿395.00" | Unit price |

### 7.2 Item Shipping Details

| Field | Type | Example Value | Notes |
|-------|------|---------------|-------|
| Shipping Method | string | "Standard Delivery" | Delivery method |
| Route | string | "" | Optional route info |
| Booking slot from | datetime | "" | Optional booking start |
| Booking slot to | datetime | "" | Optional booking end |
| SupplyTypeId | string | "On Hand Available" | Inventory supply type |
| Bundle | boolean | false | Bundle flag |
| Bundle Ref Id | string | "" | Optional bundle reference |
| Packed Ordered Qty | integer | 0 | Packed quantity |
| NumberOfPack | integer | "" | Number of packages |
| PackitemDescription | string | "" | Package description |
| UOM | string | "PCS" | Unit of measure |
| Actual weight | string | "" | Item weight |
| Promotion Id | string | "" | Promotion identifier |
| Promotion Type | string | "" | Promotion type |
| Secret code | string | "" | Secret/promo code |
| Gift with purchase | boolean | false | GWP flag |
| Gift with purchase item | string | "" | GWP item reference |
| Gift wrapped | string | "" | Gift wrap option |

### 7.3 Item Fulfillment Stages

| Stage | Type | Example Value | Notes |
|-------|------|---------------|-------|
| Ordered | integer | 1 | Quantity ordered |
| Allocated | integer | 1 | Quantity allocated |
| Released | integer | 1 | Quantity released |
| Fulfilled | integer | 1 | Quantity fulfilled |
| Delivered | integer | 1 | Quantity delivered |
| Status | enum | "DELIVERED" | Item-level status |

### 7.4 Item Pricing Breakdown

| Field | Type | Example Value | Notes |
|-------|------|---------------|-------|
| Subtotal | currency | "฿395.00" | Item subtotal |
| Discount | currency | "฿128.07" | Discount amount |
| Charges | currency | "฿0.00" | Additional charges |
| Taxes | currency | "฿0.00" | Applied taxes |
| Total | currency | "฿266.93" | Line total |
| Informational Taxes | currency | "฿17.46" | For reference only |

### 7.5 Sample Items in Order

| # | Product Name | SKU | Unit Price | Total |
|---|-------------|-----|------------|-------|
| 1 | Girl T-Shirt Short Sleeves Round Neck Kuromi Viole | CDS23576490 | ฿395.00 | ฿266.93 |
| 2 | Girl Pants Wide Legs Kuromi Denim | CDS23576551 | ฿645.00 | ฿435.87 |
| 3 | Girl Pants Hello Kitty Blue | CDS23582996 | ฿1,290.00 | ฿435.87 |
| 4 | Girl Leggings Hello Kitty Red | CDS23583115 | ฿790.00 | ฿266.93 |
| 5 | Girl Dress Cap Sleeves Hello Kitty Blue | CDS24077910 | ฿1,390.00 | ฿469.65 |
| 6 | Girl Toddler T-Shirt Puff Sleeves Hello Kitty White | CDS24097574 | ฿345.00 | ฿233.14 |
| 7 | Girl Toddler Shorts Hello Kitty Cherry Blossom Pink | CDS24097635 | ฿495.00 | ฿334.50 |
| 8 | Girl Toddler Dress Short Sleeves Gingham Cinnamoroll | CDS24097840 | ฿645.00 | ฿435.87 |
| 9 | Girl Dress Short Sleeves Gingham Hello Kitty Cherry | CDS24098083 | ฿695.00 | ฿469.63 |
| 10 | Girl T-Shirt Short Sleeves Round Neck Hello Kitty | CDS24098281 | ฿395.00 | ฿266.93 |
| 11 | Girl T-Shirt Puff Sleeves Cinnamoroll Light Blue | CDS24098465 | ฿395.00 | ฿266.93 |
| 12 | Girl Toddler Pyjamas Set Dress Long Sleeves (Item 1) | CDS24820752 | ฿990.00 | ฿334.50 |
| 13 | Girl Toddler Pyjamas Set Dress Long Sleeves (Item 2) | CDS24820776 | ฿990.00 | ฿334.50 |

---

## 8. Order Totals

| Field | Type | Example Value | Notes |
|-------|------|---------------|-------|
| Item Subtotal | currency | "฿9,460.00" | Sum of item prices |
| Total Discounts | currency | "฿4,908.75" | Total discount applied |
| Estimated S&H | currency | "฿0.00" | Shipping & handling |
| Other Charges | currency | "฿0.00" | Additional fees |
| Estimated Taxes | currency | "฿0.00" | Tax estimate |
| Order Total | currency | "฿4,551.25" | Final order total |
| Informational Taxes | currency | "฿297.70" | Tax for reference |

*Note: Includes various service charges for the order*

---

## 9. Status Summary Section

### 9.1 Shipment Categories

| Category | Count | Status |
|----------|-------|--------|
| COMPLETED SHIPMENTS | 3 | Expanded by default |
| IN PROCESS SHIPMENTS | 0 | Collapsed |
| PLANNED SHIPMENTS | 0 | Collapsed |
| PAYMENTS AND SETTLEMENTS | 3 | Expanded by default |

---

## 10. Shipment Details (COMPLETED SHIPMENTS)

### 10.1 Shipment Card Structure

| Field | Type | Example Value | Notes |
|-------|------|---------------|-------|
| Status | enum | "DELIVERED" | Shipment status |
| Tracking number | string | "DHL0842601006994" | Carrier tracking ID |
| ETA | date | "01/23/2026" | Estimated delivery date |
| Shipped on | date | "01/21/2026" | Ship date |
| Rel No. | string | "CDS2601212262851" | Release number |
| Shipped from | string | "Central Online Warehouse" | Fulfillment location |
| Subdistrict | string | "หนองปรือ" | Destination subdistrict |
| CRC tracking link | url | "https://www.dhl.com/th-en/home/tracking.html?tracking-id=DHL0842601006994" | Carrier tracking URL |

### 10.2 Ship to Address

| Field | Type | Example Value | Notes |
|-------|------|---------------|-------|
| Email | string | "thanawat4596@gmail.com" | Contact email |
| Recipient Name | string | "คุณ อภิญญา สิงห์แพรก" | Thai honorific + name |
| Address Line 1 | string | "88/10 ม.1 ซ.ชัยพรวิถี 14 ถ.ชัยพรวิถี (รบกวนกดปุ่มเปิดประตูขวามือเข้ามาวางข้างในให้หน่อยนะคะ)" | Street address with delivery instructions |
| Address Line 2 | string | "-" | Additional address line |
| Address Line 3 | string | "-" | Additional address line |
| City/Province | string | "บางละมุง, ชลบุรี 20150" | District, Province, Postal |
| Allocation Type | string | "Delivery" | Fulfillment type |
| Phone | string | "0922643514" | Contact phone |

### 10.3 Package Appeasement Options

| Field | Type | Example Value | Notes |
|-------|------|---------------|-------|
| Include Charges | boolean | true | Checkbox, checked by default |
| APPEASE button | button | - | Action button |

### 10.4 Shipment Items

| Field | Type | Example Value | Notes |
|-------|------|---------------|-------|
| Product Name | string | "Girl Pants Hello Kitty Blue" | Item description |
| Shipped Qty | integer | 1 | Quantity shipped |
| UOM | string | "PCS" | Unit of measure |
| SKU | string | "CDS23582996" | Item SKU |
| Ordered Qty | integer | 1 | Quantity ordered |

### 10.5 Sample Shipments

#### Shipment 1 - Central Online Warehouse (DHL)
- **Tracking**: DHL0842601006994
- **Carrier**: DHL
- **Items**: 5 items
  - Girl Pants Hello Kitty Blue (CDS23582996)
  - Girl Leggings Hello Kitty Red (CDS23583115)
  - Girl Dress Cap Sleeves Hello Kitty Blue (CDS24077910)
  - Girl Toddler Dress Short Sleeves Gingham Cinnamoroll (CDS24097840)
  - Girl T-Shirt Puff Sleeves Cinnamoroll Light Blue (CDS24098465)

#### Shipment 2 - Bangna (KEX Express)
- **Tracking**: KNJ0202601010946
- **Carrier**: KEX Express
- **Tracking URL**: https://th.kex-express.com/th/track/?track=KNJ0202601010946
- **Items**: 6 items
  - Girl T-Shirt Short Sleeves Round Neck Kuromi Viole (CDS23576490)
  - Girl Pants Wide Legs Kuromi Denim (CDS23576551)
  - Girl Dress Short Sleeves Gingham Hello Kitty Cherry (CDS24098083)
  - Girl T-Shirt Short Sleeves Round Neck Hello Kitty (CDS24098281)
  - Girl Toddler Pyjamas Set Dress Long Sleeves (CDS24820752)
  - Girl Toddler Pyjamas Set Dress Long Sleeves (CDS24820776)

#### Shipment 3 - Lardprao (KEX Express)
- **Tracking**: KNJ0202601010865
- **Carrier**: KEX Express
- **Tracking URL**: https://th.kex-express.com/th/track/?track=KNJ0202601010865
- **Items**: 2 items
  - Girl Toddler T-Shirt Puff Sleeves Hello Kitty White (CDS24097574)
  - Girl Toddler Shorts Hello Kitty Cherry Blossom Pink (CDS24097635)

---

## 11. Payments and Settlements

### 11.1 Invoice Structure

| Field | Type | Example Value | Notes |
|-------|------|---------------|-------|
| Invoice type | string | "Shipment" | Invoice category |
| Invoice No. | string | "17689833173984144989" | Invoice identifier |
| Invoice status | enum | "Closed" | See invoice status enums |
| Invoice date | date | "01/21/2026" | Invoice creation date |
| Invoice amount | currency | "฿1,875.25" | Invoice total |

### 11.2 Invoice Item Details

| Field | Type | Example Value | Notes |
|-------|------|---------------|-------|
| Product Name | string | "Girl Pants Hello Kitty Blue" | Item description |
| Qty | integer | 1 | Quantity invoiced |
| SKU | string | "CDS23582996" | Item SKU |
| Unit price | currency | "฿1,290.00" | Item unit price |
| Subtotal | currency | "฿1,290.00" | Line subtotal |
| Discount | currency | "฿854.13" | Line discount |
| Charges | currency | "฿0.00" | Line charges |
| Taxes | currency | "฿0.00" | Line taxes |
| Total | currency | "฿435.87" | Line total |
| Informational Taxes | currency | "฿28.51" | Reference tax amount |

### 11.3 Payment Settlement

| Field | Type | Example Value | Notes |
|-------|------|---------------|-------|
| Card Number | string | "525669XXXXXX0005" | Masked card |
| Transaction date | datetime | "" | Empty in sample |
| Amount Charged | currency | "฿1,875.25" | Settlement amount |

### 11.4 Invoice Totals

| Field | Type | Example Value | Notes |
|-------|------|---------------|-------|
| Item Subtotal | currency | "฿4,510.00" | Sum of items |
| Total Discounts | currency | "฿2,634.75" | Total discounts |
| Total Charges | currency | "฿0.00" | Total charges |
| Total Taxes | currency | "฿0.00" | Total taxes |
| Shipment Total | currency | "฿1,875.25" | Invoice total |
| Informational Taxes | currency | "฿122.66" | Reference taxes |

### 11.5 Sample Invoices

| Invoice No. | Date | Amount | Items |
|-------------|------|--------|-------|
| 17689833173984144989 | 01/21/2026 | ฿1,875.25 | 5 items (Shipment 1) |
| 17689839997298882773 | 01/21/2026 | ฿567.64 | 2 items (Shipment 3) |
| 17689858488467027983 | 01/21/2026 | ฿2,108.36 | 6 items (Shipment 2) |

---

## 12. Enumerations

### Order Status
```typescript
type OrderStatus =
  | "DELIVERED"
  | "IN_PROCESS"
  | "PLANNED"
  | "CANCELLED"
  | "ON_HOLD";
```

### Payment Status
```typescript
type PaymentStatus =
  | "PAID"
  | "PENDING"
  | "FAILED"
  | "REFUNDED";
```

### Shipment Status
```typescript
type ShipmentStatus =
  | "DELIVERED"
  | "IN_TRANSIT"
  | "SHIPPED"
  | "PROCESSING"
  | "PLANNED";
```

### Invoice Status
```typescript
type InvoiceStatus =
  | "Closed"
  | "Open"
  | "Cancelled";
```

### Fulfillment Stages
```typescript
type FulfillmentStage =
  | "Ordered"
  | "Allocated"
  | "Released"
  | "Fulfilled"
  | "Delivered";
```

### Supply Types
```typescript
type SupplyType =
  | "On Hand Available"
  | "Back Order"
  | "Pre-Order";
```

### Allocation Types
```typescript
type AllocationType =
  | "Delivery"
  | "Pickup"
  | "Ship to Store";
```

---

## 13. Data Formatting Rules

### Currency
- Format: `฿X,XXX.XX` (Thai Baht with 2 decimal places)
- Thousands separator: comma
- Decimal separator: period

### Dates
- Display format: `MM/DD/YYYY`
- Datetime format: `MM/DD/YYYY HH:mm +07`
- Timezone: GMT+7 (Asia/Bangkok)

### Phone Numbers
- Format: 10 digits without separators
- Example: `0922643514`

### Credit Card Masking
- Pattern: First 6 digits + XXXXXX + last 4 digits
- Example: `525669XXXXXX0005`

### Thai Language
- Customer names in Thai
- Address fields support Thai characters
- Delivery instructions in Thai

---

## 14. UI Components

### Expandable Sections
- COMPLETED SHIPMENTS (accordion, expanded by default)
- IN PROCESS SHIPMENTS (accordion, collapsed)
- PLANNED SHIPMENTS (accordion, collapsed)
- PAYMENTS AND SETTLEMENTS (accordion, expanded by default)

### Interactive Elements
- Customer name dropdown
- Organization selector (DS)
- UI mode selector (Standard UI)
- Filter icon for items
- "More Info" button per item
- Promotions/Coupons/Appeasements links
- Tracking number links
- APPEASE button per shipment
- Include Charges checkbox

### Navigation
- Home link
- Item Search link
- Orders link
- Close button (X) for order panel

---

## 15. Carriers & Tracking

| Carrier | Tracking URL Pattern | Example Tracking Number |
|---------|---------------------|------------------------|
| DHL | `https://www.dhl.com/th-en/home/tracking.html?tracking-id={trackingNumber}` | DHL0842601006994 |
| KEX Express | `https://th.kex-express.com/th/track/?track={trackingNumber}` | KNJ0202601010946, KNJ0202601010865 |

---

## 16. Fulfillment Locations

| Location Name | Location Type |
|---------------|---------------|
| Central Online Warehouse | DC |
| Bangna | Store/DC |
| Lardprao | Store/DC |

---

## 17. Promotion Dialog Structure

When clicking on "Promotions" link, a dialog opens showing:

### 17.1 Promotion Dialog Header

| Field | Type | Example Value | Notes |
|-------|------|---------------|-------|
| Product Name | string | "Girl T-Shirt Short Sleeves Round Neck Kuromi Viole" | Full product name |
| SKU | string | "SKU: CDS23576490" | Prefixed with "SKU:" |
| Style | string | "" | Optional |
| Color | string | "" | Optional |
| Size | string | "" | Optional |

### 17.2 Promotion Pricing Table

| Field | Type | Example Value | Notes |
|-------|------|---------------|-------|
| Price | currency | "Price: ฿395.00" | Item unit price |
| Quantity | string | "1 PCS" | Quantity and UOM |
| Subtotal | currency | "฿395.00" | Line subtotal |
| Discount | currency | "- ฿128.07" | With minus sign |
| Total | currency | "= ฿266.93" | With equals sign |

### 17.3 Promotion Details List

| Column | Type | Example Value |
|--------|------|---------------|
| PROMOTION NAME | string | "Discount" |
| DISCOUNT | currency | "฿29.32" |

### 17.4 Promotion Summary Totals

| Field | Type | Example Value | Notes |
|-------|------|---------------|-------|
| Total Promotions | integer | 18 | Count across all items |
| Total Promotions Value | currency | "฿3,225.00" | Sum of promotion discounts |

### 17.5 Dialog Pagination

| Field | Type | Example Value |
|-------|------|---------------|
| Display Range | string | "1 - 10 of 13" |
| First Page | button | Disabled when on first |
| Previous Page | button | Disabled when on first |
| Next Page | button | Enabled |
| Last Page | button | Enabled |

### 17.6 Dialog Order Summary

| Field | Type | Example Value |
|-------|------|---------------|
| Item Subtotal | currency | "฿9,460.00" |
| Total Discounts | currency | "- ฿4,908.75" |
| Estimated S&H | currency | "+ ฿0.00" |
| Estimated Charges | currency | "+ ฿0.00" |
| Estimated Taxes | currency | "+ ฿0.00" |
| ORDER TOTAL | currency | "= ฿4,551.25" |

---

## Notes

1. **Virtual Scrolling**: The items section uses Angular CDK virtual scrolling for performance
2. **Modal Dialogs**: "More Info" and "Promotions" buttons trigger Angular Material dialogs
3. **Multi-shipment Orders**: This order demonstrates multi-shipment fulfillment from 3 different locations
4. **Multi-carrier**: Order uses both DHL and KEX Express carriers
5. **Character-based Products**: All items are Hello Kitty/Sanrio themed children's apparel
6. **Promotions Applied**: Items show 1-2 promotions and 1 coupon per item (18 total promotions = ฿3,225.00)
7. **Zero Appeasements**: This order has no appeasements applied at order or item level
8. **Dialog Overlay**: CDK overlay backdrop prevents interaction with main page while dialog is open
9. **Promotion Name**: All promotions in this order are named "Discount" with varying amounts per item
