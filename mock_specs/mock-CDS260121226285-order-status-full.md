# Mock Data Specification: Order Status Page (CDS260121226285)

**Source URL**: `https://crcpp.omni.manh.com/customerengagementfacade/app/orderstatus?orderId=CDS260121226285&selectedOrg=DS`
**Capture Date**: 2026-01-22
**ADW ID**: CDS260121226285

---

## 1. Order Header

| Field | Type | Sample Value | Description |
|-------|------|--------------|-------------|
| Order No. | string | `CDS260121226285` | Unique order identifier |
| Created | datetime | `01/21/2026 11:49 +07` | Order creation timestamp (GMT+7) |
| Order type | string | `RT-HD-STD` | Order type code (Retail Home Delivery Standard) |
| Order Status | enum | `DELIVERED` | Current order status |
| Store No. | string | *(empty)* | Store number (optional) |
| Related Cases | string | *(empty)* | Related case references |
| Full Tax Invoice | boolean | `false` | Tax invoice requirement flag |
| Customer Type Id | string | `General` | Customer classification |
| The1 member | string | `8031630388` | The1 loyalty membership ID |
| Selling channel | string | `Web` | Sales channel source |
| Allow substitution | boolean | `false` | Product substitution permission |
| Cust Ref | string | `2400777864` | Customer reference number |
| Tax Id | string | *(empty)* | Tax identification number |
| Company Name | string | *(empty)* | Company name (B2B orders) |
| Branch No. | string | *(empty)* | Branch number |
| Captured Date | datetime | `01/21/2026 11:49 +07` | Order capture timestamp |

---

## 2. Customer Information

| Field | Type | Sample Value | Description |
|-------|------|--------------|-------------|
| Customer Name | string | `ธนวัฒน์ สิงห์แพรก` | Customer full name (Thai) |
| Phone | string | `0922643514` | Contact phone number |
| Email | string | `thanawat4596@gmail.com` | Contact email address |
| Registration Status | string | `Not Registered` | Account registration status |

---

## 3. Payment Information

| Field | Type | Sample Value | Description |
|-------|------|--------------|-------------|
| Payment Status | enum | `PAID` | Payment status (PAID/UNPAID/PENDING/REFUNDED) |
| Payment Method | string | `CREDIT CARD` | Payment method type |
| Card Number | string (masked) | `525669XXXXXX0005` | Masked credit card number |
| Expiry Date | string (masked) | `**/****` | Masked card expiry |
| Amount to be charged | currency | `฿4,551.25` | Expected charge amount |
| Amount charged | currency | `฿4,551.25` | Actual charged amount |
| Billing Address | string | `88/10 ม.1 ซ.ชัยพรวิถี 14 ถ.ชัยพรวิถี (รบกวนกดปุ่มเปิดประตูขวามือเข้ามาวางข้างในให้หน่อยนะคะ),-,-,หนองปรือ,บางละมุง,ชลบุรี,TH,20150` | Full billing address |
| Billing Name | string | `ธนวัฒน์ สิงห์แพรก` | Name on billing |

---

## 4. Order Promotions Summary

| Field | Type | Sample Value | Description |
|-------|------|--------------|-------------|
| Order Promotions | number | `0` | Count of order-level promotions |
| Order Appeasements | number | `0` | Count of order-level appeasements |
| Order Coupons Applied | number | `0` | Count of order-level coupons |

---

## 5. Items Section

### Item Fields (per item)

| Field | Type | Sample Value | Description |
|-------|------|--------------|-------------|
| Item Name | string | `Girl T-Shirt Short Sleeves Round Neck Kuromi Viole` | Product name |
| SKU | string | `CDS23576490` | Stock keeping unit |
| ETA | date | `01/23/2026` | Estimated delivery date |
| Style | string | *(empty)* | Product style variant |
| Color | string | *(empty)* | Product color |
| Size | string | *(empty)* | Product size |
| Promotions Count | number | `1` | Applied promotions count |
| Coupons Count | number | `1` | Applied coupons count |
| Appeasements Count | number | `0` | Applied appeasements count |
| PRICE | currency | `฿395.00` | Unit price |
| Shipping Method | string | `Standard Delivery` | Shipping method type |
| Route | string | *(empty)* | Delivery route |
| Booking slot from | datetime | *(empty)* | Delivery time slot start |
| Booking slot to | datetime | *(empty)* | Delivery time slot end |
| SupplyTypeId | string | `On Hand Available` | Inventory supply type |
| Bundle | boolean | `false` | Bundle item flag |
| Bundle Ref Id | string | *(empty)* | Bundle reference ID |
| Packed Ordered Qty | number | `0` | Packed quantity |
| NumberOfPack | number | *(empty)* | Number of packages |
| PackitemDescription | string | *(empty)* | Package description |
| UOM | string | `PCS` | Unit of measure |
| Actual weight | number | *(empty)* | Item weight |
| Promotion Id | string | *(empty)* | Promotion identifier |
| Promotion Type | string | *(empty)* | Promotion category |
| Secret code | string | *(empty)* | Secret/promo code |
| Gift with purchase | boolean | `false` | GWP flag |
| Gift with purchase item | string | *(empty)* | GWP item details |
| Gift wrapped | boolean | *(empty)* | Gift wrap status |

### Item Fulfillment Status (per item)

| Stage | Type | Sample Value | Description |
|-------|------|--------------|-------------|
| Ordered | number | `1` | Quantity ordered |
| Allocated | number | `1` | Quantity allocated |
| Released | number | `1` | Quantity released |
| Fulfilled | number | `1` | Quantity fulfilled |
| Delivered | number | `1` | Quantity delivered |

### Item Pricing (per item)

| Field | Type | Sample Value | Description |
|-------|------|--------------|-------------|
| Subtotal | currency | `฿395.00` | Line item subtotal |
| Discount | currency | `฿128.07` | Applied discount |
| Charges | currency | `฿0.00` | Additional charges |
| Taxes | currency | `฿0.00` | Tax amount |
| Total | currency | `฿266.93` | Line item total |
| Informational Taxes | currency | `฿17.46` | VAT info (included) |

### Items List (14 items)

| # | Item Name | SKU | Unit Price | Discount | Total |
|---|-----------|-----|------------|----------|-------|
| 1 | Girl T-Shirt Short Sleeves Round Neck Kuromi Viole | CDS23576490 | ฿395.00 | ฿128.07 | ฿266.93 |
| 2 | Girl Pants Wide Legs Kuromi Denim | CDS23576551 | ฿645.00 | ฿209.13 | ฿435.87 |
| 3 | Girl Pants Hello Kitty Blue | CDS23582996 | ฿1,290.00 | ฿854.13 | ฿435.87 |
| 4 | Girl Leggings Hello Kitty Red | CDS23583115 | ฿790.00 | ฿523.07 | ฿266.93 |
| 5 | Girl Dress Cap Sleeves Hello Kitty Blue | CDS24077910 | ฿1,390.00 | ฿920.35 | ฿469.65 |
| 6 | Girl Toddler T-Shirt Puff Sleeves Hello Kitty White | CDS24097574 | ฿345.00 | ฿111.86 | ฿233.14 |
| 7 | Girl Toddler Shorts Hello Kitty Cherry Blossom Pink | CDS24097635 | ฿495.00 | ฿160.50 | ฿334.50 |
| 8 | Girl Toddler Dress Short Sleeves Gingham Cinnamoroll | CDS24097840 | ฿645.00 | ฿209.13 | ฿435.87 |
| 9 | Girl T-Shirt Puff Sleeves Cinnamoroll Light Blue | CDS24098465 | ฿395.00 | ฿128.07 | ฿266.93 |
| 10 | Girl Dress Short Sleeves Gingham Hello Kitty Cherry | CDS24098083 | ฿695.00 | ฿225.37 | ฿469.63 |
| 11 | Girl T-Shirt Short Sleeves Round Neck Hello Kitty | CDS24098281 | ฿395.00 | ฿128.07 | ฿266.93 |
| 12 | Girl Toddler Pyjamas Set Dress Long Sleeves With Ribbon | CDS24820752 | ฿990.00 | ฿655.50 | ฿334.50 |
| 13 | Girl Toddler Pyjamas Set Dress Long Sleeves With Ribbon | CDS24820776 | ฿990.00 | ฿655.50 | ฿334.50 |

---

## 6. Order Totals

| Field | Type | Sample Value | Description |
|-------|------|--------------|-------------|
| Item Subtotal | currency | `฿9,460.00` | Sum of all item subtotals |
| Total Discounts | currency | `฿4,908.75` | Sum of all discounts |
| Estimated S&H | currency | `฿0.00` | Shipping & handling |
| Other Charges | currency | `฿0.00` | Additional charges |
| Estimated Taxes | currency | `฿0.00` | Tax estimate |
| Order Total | currency | `฿4,551.25` | Final order total |
| Informational Taxes | currency | `฿297.70` | VAT info (included) |

---

## 7. Status Summary

| Section | Count | Description |
|---------|-------|-------------|
| Completed Shipments | 3 | Delivered packages |
| In Process Shipments | 0 | Packages in transit |
| Planned Shipments | 0 | Scheduled packages |

---

## 8. Shipments (Completed)

### Shipment 1 (DHL)

| Field | Type | Sample Value | Description |
|-------|------|--------------|-------------|
| Status | enum | `DELIVERED` | Shipment status |
| Tracking number | string | `DHL0842601006994` | Carrier tracking ID |
| ETA | date | `01/23/2026` | Estimated arrival |
| Shipped on | date | `01/21/2026` | Ship date |
| Rel No. | string | `CDS2601212262851` | Release number |
| Shipped from | string | `Central Online Warehouse` | Origin location |
| Subdistrict | string | `หนองปรือ` | Destination subdistrict |
| CRC tracking link | url | `https://www.dhl.com/th-en/home/tracking.html?tracking-id=DHL0842601006994` | Tracking URL |
| Allocation Type | string | `Delivery` | Allocation method |

**Ship to Address:**
- Email: `thanawat4596@gmail.com`
- Name: `คุณ อภิญญา สิงห์แพรก`
- Address: `88/10 ม.1 ซ.ชัยพรวิถี 14 ถ.ชัยพรวิถี (รบกวนกดปุ่มเปิดประตูขวามือเข้ามาวางข้างในให้หน่อยนะคะ)`
- City: `บางละมุง, ชลบุรี 20150`
- Phone: `0922643514`

**Items in Shipment 1:**
| Item | SKU | Shipped Qty | Ordered Qty | UOM |
|------|-----|-------------|-------------|-----|
| Girl Pants Hello Kitty Blue | CDS23582996 | 1 | 1 | PCS |
| Girl Leggings Hello Kitty Red | CDS23583115 | 1 | 1 | PCS |
| Girl Dress Cap Sleeves Hello Kitty Blue | CDS24077910 | 1 | 1 | PCS |
| Girl Toddler Dress Short Sleeves Gingham Cinnamoroll | CDS24097840 | 1 | 1 | PCS |
| Girl T-Shirt Puff Sleeves Cinnamoroll Light Blue | CDS24098465 | 1 | 1 | PCS |

### Shipment 2 (KEX)

| Field | Type | Sample Value | Description |
|-------|------|--------------|-------------|
| Status | enum | `DELIVERED` | Shipment status |
| Tracking number | string | `KNJ0202601010946` | Carrier tracking ID |
| ETA | date | `01/23/2026` | Estimated arrival |
| Shipped on | date | `01/21/2026` | Ship date |
| Rel No. | string | `CDS2601212262853` | Release number |
| Shipped from | string | `Bangna` | Origin location |
| Subdistrict | string | `หนองปรือ` | Destination subdistrict |
| CRC tracking link | url | `https://th.kex-express.com/th/track/?track=KNJ0202601010946` | Tracking URL |
| Allocation Type | string | `Delivery` | Allocation method |

**Items in Shipment 2:**
| Item | SKU | Shipped Qty | Ordered Qty | UOM |
|------|-----|-------------|-------------|-----|
| Girl T-Shirt Short Sleeves Round Neck Kuromi Viole | CDS23576490 | 1 | 1 | PCS |
| Girl Pants Wide Legs Kuromi Denim | CDS23576551 | 1 | 1 | PCS |
| Girl Dress Short Sleeves Gingham Hello Kitty Cherry | CDS24098083 | 1 | 1 | PCS |
| Girl T-Shirt Short Sleeves Round Neck Hello Kitty | CDS24098281 | 1 | 1 | PCS |
| Girl Toddler Pyjamas Set Dress Long Sleeves With Ribbon | CDS24820752 | 1 | 1 | PCS |
| Girl Toddler Pyjamas Set Dress Long Sleeves With Ribbon | CDS24820776 | 1 | 1 | PCS |

### Shipment 3 (KEX)

| Field | Type | Sample Value | Description |
|-------|------|--------------|-------------|
| Status | enum | `DELIVERED` | Shipment status |
| Tracking number | string | `KNJ0202601010865` | Carrier tracking ID |
| ETA | date | `01/23/2026` | Estimated arrival |
| Shipped on | date | `01/21/2026` | Ship date |
| Rel No. | string | `CDS2601212262852` | Release number |
| Shipped from | string | `Lardprao` | Origin location |
| Subdistrict | string | `หนองปรือ` | Destination subdistrict |
| CRC tracking link | url | `https://th.kex-express.com/th/track/?track=KNJ0202601010865` | Tracking URL |
| Allocation Type | string | `Delivery` | Allocation method |

**Items in Shipment 3:**
| Item | SKU | Shipped Qty | Ordered Qty | UOM |
|------|-----|-------------|-------------|-----|
| Girl Toddler T-Shirt Puff Sleeves Hello Kitty White | CDS24097574 | 1 | 1 | PCS |
| Girl Toddler Shorts Hello Kitty Cherry Blossom Pink | CDS24097635 | 1 | 1 | PCS |

---

## 9. Package Appeasement Options (per shipment)

| Field | Type | Sample Value | Description |
|-------|------|--------------|-------------|
| Include Charges | checkbox | `checked` | Include charges in appeasement |
| APPEASE button | action | - | Initiate appeasement action |

---

## 10. Payments and Settlements

### Invoice Fields

| Field | Type | Sample Value | Description |
|-------|------|--------------|-------------|
| Invoice type | string | `Shipment` | Invoice category |
| Invoice No. | string | `17689833173984144989` | Invoice identifier |
| Invoice status | enum | `Closed` | Invoice status |
| Invoice date | date | `01/21/2026` | Invoice date |
| Invoice amount | currency | `฿1,875.25` | Invoice total |

### Invoice Line Item Fields

| Field | Type | Sample Value | Description |
|-------|------|--------------|-------------|
| Item Name | string | `Girl Pants Hello Kitty Blue` | Product name |
| SKU | string | `CDS23582996` | Stock keeping unit |
| Qty | number | `1` | Quantity |
| Unit price | currency | `฿1,290.00` | Price per unit |
| Subtotal | currency | `฿1,290.00` | Line subtotal |
| Discount | currency | `฿854.13` | Line discount |
| Charges | currency | `฿0.00` | Line charges |
| Taxes | currency | `฿0.00` | Line taxes |
| Total | currency | `฿435.87` | Line total |
| Informational Taxes | currency | `฿28.51` | VAT info |

### Invoice Summary Fields

| Field | Type | Sample Value | Description |
|-------|------|--------------|-------------|
| Card Number | string (masked) | `525669XXXXXX0005` | Payment card |
| Transaction date | datetime | *(empty)* | Transaction timestamp |
| Amount Charged | currency | `฿1,875.25` | Charged amount |
| Item Subtotal | currency | `฿4,510.00` | Sum of items |
| Total Discounts | currency | `฿2,634.75` | Sum of discounts |
| Total Charges | currency | `฿0.00` | Sum of charges |
| Total Taxes | currency | `฿0.00` | Sum of taxes |
| Shipment Total | currency | `฿1,875.25` | Shipment total |
| Informational Taxes | currency | `฿122.66` | VAT info |

### Invoices List (3 invoices)

| Invoice No. | Status | Date | Amount | Items |
|-------------|--------|------|--------|-------|
| 17689833173984144989 | Closed | 01/21/2026 | ฿1,875.25 | 5 items |
| 17689839997298882773 | Closed | 01/21/2026 | ฿567.64 | 2 items |
| 17689858488467027983 | Closed | 01/21/2026 | ฿2,108.36 | 6 items |

---

## 11. Navigation Elements

| Element | Type | Description |
|---------|------|-------------|
| Home | nav-link | Navigate to home page |
| Item Search | nav-link | Search for items |
| Orders | nav-link | View orders list |
| DS dropdown | selector | Organization selector |
| Standard UI dropdown | selector | UI mode selector |
| Help icon | button | Help/documentation |
| User profile | button | User account menu |
| Close (X) | button | Close order details panel |
| Filter icon | button | Filter items list |
| Notes icon | button | View/add notes |
| MORE INFO button | button | Expand item details |
| local-shipping icon | indicator | Shipping method indicator |

---

## 12. Enumerations

### Order Status
- `DELIVERED`
- `SHIPPED`
- `PROCESSING`
- `PENDING`
- `CANCELLED`

### Payment Status
- `PAID`
- `UNPAID`
- `PENDING`
- `REFUNDED`
- `PARTIALLY_PAID`

### Invoice Status
- `Closed`
- `Open`
- `Pending`

### Shipment Status
- `DELIVERED`
- `SHIPPED`
- `IN_TRANSIT`
- `PENDING`

### Supply Type
- `On Hand Available`
- `Pre-Order`
- `Back Order`

### Shipping Method
- `Standard Delivery`
- `Express Delivery`
- `Same Day Delivery`

---

## 13. Sample JSON Structure

```json
{
  "order": {
    "orderNo": "CDS260121226285",
    "created": "2026-01-21T11:49:00+07:00",
    "orderType": "RT-HD-STD",
    "status": "DELIVERED",
    "storeNo": null,
    "relatedCases": null,
    "fullTaxInvoice": false,
    "customerTypeId": "General",
    "the1Member": "8031630388",
    "sellingChannel": "Web",
    "allowSubstitution": false,
    "custRef": "2400777864",
    "taxId": null,
    "companyName": null,
    "branchNo": null,
    "capturedDate": "2026-01-21T11:49:00+07:00"
  },
  "customer": {
    "name": "ธนวัฒน์ สิงห์แพรก",
    "phone": "0922643514",
    "email": "thanawat4596@gmail.com",
    "registrationStatus": "Not Registered"
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
      "line2": "รบกวนกดปุ่มเปิดประตูขวามือเข้ามาวางข้างในให้หน่อยนะคะ",
      "subdistrict": "หนองปรือ",
      "district": "บางละมุง",
      "province": "ชลบุรี",
      "country": "TH",
      "postalCode": "20150"
    },
    "billingName": "ธนวัฒน์ สิงห์แพรก"
  },
  "orderPromotions": {
    "promotions": 0,
    "appeasements": 0,
    "coupons": 0
  },
  "items": [
    {
      "name": "Girl T-Shirt Short Sleeves Round Neck Kuromi Viole",
      "sku": "CDS23576490",
      "eta": "2026-01-23",
      "style": null,
      "color": null,
      "size": null,
      "promotions": 1,
      "coupons": 1,
      "appeasements": 0,
      "price": 395.00,
      "shippingMethod": "Standard Delivery",
      "supplyTypeId": "On Hand Available",
      "bundle": false,
      "uom": "PCS",
      "giftWithPurchase": false,
      "fulfillment": {
        "ordered": 1,
        "allocated": 1,
        "released": 1,
        "fulfilled": 1,
        "delivered": 1
      },
      "pricing": {
        "subtotal": 395.00,
        "discount": 128.07,
        "charges": 0.00,
        "taxes": 0.00,
        "total": 266.93,
        "informationalTaxes": 17.46
      }
    }
  ],
  "orderTotals": {
    "itemSubtotal": 9460.00,
    "totalDiscounts": 4908.75,
    "estimatedSH": 0.00,
    "otherCharges": 0.00,
    "estimatedTaxes": 0.00,
    "orderTotal": 4551.25,
    "informationalTaxes": 297.70
  },
  "statusSummary": {
    "completedShipments": 3,
    "inProcessShipments": 0,
    "plannedShipments": 0
  },
  "shipments": [
    {
      "status": "DELIVERED",
      "trackingNumber": "DHL0842601006994",
      "carrier": "DHL",
      "eta": "2026-01-23",
      "shippedOn": "2026-01-21",
      "releaseNo": "CDS2601212262851",
      "shippedFrom": "Central Online Warehouse",
      "subdistrict": "หนองปรือ",
      "trackingLink": "https://www.dhl.com/th-en/home/tracking.html?tracking-id=DHL0842601006994",
      "allocationType": "Delivery",
      "shipToAddress": {
        "email": "thanawat4596@gmail.com",
        "name": "คุณ อภิญญา สิงห์แพรก",
        "address": "88/10 ม.1 ซ.ชัยพรวิถี 14 ถ.ชัยพรวิถี",
        "city": "บางละมุง, ชลบุรี 20150",
        "phone": "0922643514"
      },
      "items": [
        { "sku": "CDS23582996", "shippedQty": 1, "orderedQty": 1, "uom": "PCS" }
      ]
    }
  ],
  "invoices": [
    {
      "type": "Shipment",
      "invoiceNo": "17689833173984144989",
      "status": "Closed",
      "date": "2026-01-21",
      "amount": 1875.25,
      "cardNumber": "525669XXXXXX0005",
      "amountCharged": 1875.25,
      "itemSubtotal": 4510.00,
      "totalDiscounts": 2634.75,
      "totalCharges": 0.00,
      "totalTaxes": 0.00,
      "shipmentTotal": 1875.25,
      "informationalTaxes": 122.66,
      "items": []
    }
  ]
}
```

---

## 14. Edge Cases & Notes

1. **Empty Fields**: Many fields (Style, Color, Size, Route, Booking slots, etc.) can be empty/null
2. **Masked Data**: Card numbers and expiry dates are always masked in display
3. **Currency Format**: Thai Baht (฿) with comma separators, 2 decimal places
4. **Date Format**: `MM/DD/YYYY` for display, with timezone `+07` (Bangkok)
5. **Thai Text**: Customer names and addresses may contain Thai characters
6. **Multiple Carriers**: DHL and KEX Express used for different shipments
7. **Split Shipments**: Single order can have multiple shipments from different warehouses
8. **Discount Calculation**: Approximately 33.5% average discount applied
9. **VAT Handling**: Informational taxes shown separately (7% VAT included in prices)
10. **Virtual Scroll**: Items and shipments use virtual scrolling for performance

---

## 15. Field Count Summary

| Section | Field Count |
|---------|-------------|
| Order Header | 16 fields |
| Customer Information | 4 fields |
| Payment Information | 8 fields |
| Order Promotions Summary | 3 fields |
| Item Fields | 28 fields per item |
| Item Fulfillment Status | 5 stages |
| Item Pricing | 6 fields |
| Order Totals | 7 fields |
| Status Summary | 3 sections |
| Shipment Fields | 11 fields per shipment |
| Package Appeasement | 2 fields |
| Invoice Fields | 6 fields |
| Invoice Line Item | 10 fields |
| Invoice Summary | 9 fields |

**Total Unique Fields: ~120 fields**
