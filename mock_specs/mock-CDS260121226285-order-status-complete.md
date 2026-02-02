# Mock Data Specification: Manhattan OMS Order Status Page

**Source URL:** `https://crcpp.omni.manh.com/customerengagementfacade/app/orderstatus?orderId=CDS260121226285&selectedOrg=DS`
**Captured Date:** 2026-01-22
**Order ID:** CDS260121226285

---

## 1. Page Header

| Field | Value | Type |
|-------|-------|------|
| Application Title | CONTACT CENTER | string |
| Organization Code | DS | string |
| UI Mode | Standard UI | string |
| Logged-in User | Naruechon Woraphatphawan | string |

---

## 2. Customer Information

| Field | Value | Type |
|-------|-------|------|
| Customer Name (Thai) | ธนวัฒน์ สิงห์แพรก | string |
| Phone | 0922643514 | string |
| Email | thanawat4596@gmail.com | string |
| Registration Status | Not Registered | string |

---

## 3. Order Header

| Field | Value | Type |
|-------|-------|------|
| Order No. | CDS260121226285 | string |
| Order Status | DELIVERED | enum |
| Created | 01/21/2026 11:49 +07 | datetime |
| Order Type | RT-HD-STD | string |
| Store No. | (empty) | string |
| Related Cases | undefined | string/null |
| Full Tax Invoice | false | boolean |
| Customer Type Id | General | string |
| The1 Member | 8031630388 | string |
| Selling Channel | Web | string |
| Allow Substitution | false | boolean |
| Cust Ref | 2400777864 | string |
| Tax Id | (empty) | string |
| Company Name | (empty) | string |
| Branch No. | (empty) | string |
| Captured Date | 01/21/2026 11:49 +07 | datetime |

---

## 4. Payment Information

| Field | Value | Type |
|-------|-------|------|
| Payment Status | PAID | enum |
| Credit Card | 525669XXXXXX0005 | string (masked) |
| Expiry Date | **/**** | string (masked) |
| Amount to be charged | ฿4,551.25 | currency |
| Amount charged | ฿4,551.25 | currency |

### 4.1 Billing Address

| Field | Value | Type |
|-------|-------|------|
| Billing Address Line 1 | 88/10 ม.1 ซ.ชัยพรวิถี 14 ถ.ชัยพรวิถี (รบกวนกดปุ่มเปิดประตูขวามือเข้ามาวางข้างในให้หน่อยนะคะ) | string |
| Billing Address Line 2 | - | string |
| Billing Address Line 3 | - | string |
| Subdistrict | หนองปรือ | string |
| District | บางละมุง | string |
| Province | ชลบุรี | string |
| Country | TH | string |
| Postal Code | 20150 | string |
| Billing Name | ธนวัฒน์ สิงห์แพรก | string |

---

## 5. Order Summary

| Field | Value | Type |
|-------|-------|------|
| Order Promotions | 0 | number |
| Order Appeasements | 0 | number |
| Order Coupons Applied | 0 | number |
| Item Subtotal | ฿9,460.00 | currency |
| Total Discounts | ฿4,908.75 | currency |
| Estimated S&H | ฿0.00 | currency |
| Other Charges | ฿0.00 | currency |
| Estimated Taxes | ฿0.00 | currency |
| Order Total | ฿4,551.25 | currency |
| Informational Taxes | ฿297.70 | currency |

---

## 6. Order Items (13 items)

### Item Schema

```typescript
interface OrderItem {
  productName: string;
  sku: string;
  eta: string;          // Format: MM/DD/YYYY
  notes: number;
  style: string;
  color: string;
  size: string;
  price: number;        // Original price

  // Item Details (expandable)
  shippingMethod: string;
  route: string;
  bookingSlotFrom: string;
  bookingSlotTo: string;
  supplyTypeId: string;
  bundle: boolean;
  bundleRefId: string;
  packedOrderedQty: number;
  numberOfPack: number;
  packitemDescription: string;
  uom: string;
  actualWeight: string;
  promotionId: string;
  promotionType: string;
  secretCode: string;
  giftWithPurchase: boolean;
  giftWithPurchaseItem: string;
  giftWrapped: string;

  // Status counts
  orderedQty: number;
  allocatedQty: number;
  releasedQty: number;
  fulfilledQty: number;
  deliveredQty: number;

  // Pricing
  subtotal: number;
  discount: number;
  charges: number;
  taxes: number;
  total: number;
  informationalTaxes: number;

  // Links
  promotionsCount: number;
  couponsCount: number;
  appeasementsCount: number;

  itemStatus: 'DELIVERED' | 'IN_PROCESS' | 'PLANNED' | 'CANCELLED';
}
```

### Sample Items

| # | Product Name | SKU | Price | Subtotal | Discount | Total | Status |
|---|--------------|-----|-------|----------|----------|-------|--------|
| 1 | Girl T-Shirt Short Sleeves Round Neck Kuromi Viole | CDS23576490 | ฿395.00 | ฿395.00 | ฿128.07 | ฿266.93 | DELIVERED |
| 2 | Girl Pants Wide Legs Kuromi Denim | CDS23576551 | ฿645.00 | ฿645.00 | ฿209.13 | ฿435.87 | DELIVERED |
| 3 | Girl Pants Hello Kitty Blue | CDS23582996 | ฿1,290.00 | ฿1,290.00 | ฿854.13 | ฿435.87 | DELIVERED |
| 4 | Girl Leggings Hello Kitty Red | CDS23583115 | ฿790.00 | ฿790.00 | ฿523.07 | ฿266.93 | DELIVERED |
| 5 | Girl Dress Cap Sleeves Hello Kitty Blue | CDS24077910 | ฿1,390.00 | ฿1,390.00 | ฿920.35 | ฿469.65 | DELIVERED |
| 6 | Girl Toddler T-Shirt Puff Sleeves Hello Kitty Whit | CDS24097574 | ฿345.00 | ฿345.00 | ฿111.86 | ฿233.14 | DELIVERED |
| 7 | Girl Toddler Shorts Hello Kitty Cherry Blossom Pin | CDS24097635 | ฿495.00 | ฿495.00 | ฿160.50 | ฿334.50 | DELIVERED |
| 8 | Girl Toddler Dress Short Sleeves Gingham Cinnamoro | CDS24097840 | ฿645.00 | ฿645.00 | ฿209.13 | ฿435.87 | DELIVERED |
| 9 | Girl Dress Short Sleeves Gingham Hello Kitty Cherr | CDS24098083 | ฿695.00 | ฿695.00 | ฿225.37 | ฿469.63 | DELIVERED |
| 10 | Girl T-Shirt Short Sleeves Round Neck Hello Kitty | CDS24098281 | ฿395.00 | ฿395.00 | ฿128.07 | ฿266.93 | DELIVERED |
| 11 | Girl T-Shirt Puff Sleeves Cinnamoroll Light Blue | CDS24098465 | ฿395.00 | ฿395.00 | ฿128.07 | ฿266.93 | DELIVERED |
| 12 | Girl Toddler Pyjamas Set Dress Long Sleeves With R | CDS24820752 | ฿990.00 | ฿990.00 | ฿655.50 | ฿334.50 | DELIVERED |
| 13 | Girl Toddler Pyjamas Set Dress Long Sleeves With R | CDS24820776 | ฿990.00 | ฿990.00 | ฿655.50 | ฿334.50 | DELIVERED |

---

## 7. Promotions Modal

**Total Promotions:** 18
**Total Promotions Value:** ฿3,225.00

### Promotion Schema

```typescript
interface PromotionItem {
  productName: string;
  sku: string;
  style: string;
  color: string;
  size: string;
  price: number;
  quantity: number;
  subtotal: number;
  discount: number;
  total: number;

  promotions: {
    promotionName: string;   // e.g., "Discount"
    discountAmount: number;
  }[];
}
```

### Sample Promotion Data

| Item | SKU | Price | Qty | Subtotal | Discount | Total | Promotion Name | Promo Discount |
|------|-----|-------|-----|----------|----------|-------|----------------|----------------|
| Girl T-Shirt Short Sleeves Round Neck Kuromi Viole | CDS23576490 | ฿395.00 | 1 | ฿395.00 | ฿128.07 | ฿266.93 | Discount | ฿29.32 |
| Girl Pants Wide Legs Kuromi Denim | CDS23576551 | ฿645.00 | 1 | ฿645.00 | ฿209.13 | ฿435.87 | Discount | ฿47.88 |

---

## 8. Coupons Modal

**Total Coupons:** 1
**Total Coupon Value:** ฿1,683.75

### Coupon Schema

```typescript
interface Coupon {
  code: string;             // e.g., "CES2520075550"
  couponName: string;       // e.g., "Discount|CES2520075550"
  appliedBy: string;        // e.g., "pubsubuser@TWD"
  appliedDate: string;      // e.g., "01/21/2026"
  appliedItemsCount: number;
  totalValue: number;

  items: {
    productName: string;
    sku: string;
    style: string;
    color: string;
    price: number;
    lineCouponValue: number;
    quantity: number;
  }[];
}
```

### Sample Coupon Data

| Code | Coupon Name | Applied By | Applied Date | Items Applied | Total Value |
|------|-------------|------------|--------------|---------------|-------------|
| CES2520075550 | Discount\|CES2520075550 | pubsubuser@TWD | 01/21/2026 | 13 | ฿1,683.75 |

### Coupon Line Items

| Item | SKU | Price | Line Coupon Value | Qty |
|------|-----|-------|-------------------|-----|
| Girl T-Shirt Short Sleeves Round Neck Kuromi Viole | CDS23576490 | ฿395.00 | ฿98.75 | 1 |
| Girl Pants Wide Legs Kuromi Denim | CDS23576551 | ฿645.00 | ฿161.25 | 1 |
| Girl Pants Hello Kitty Blue | CDS23582996 | ฿1,290.00 | ฿161.25 | 1 |
| Girl Leggings Hello Kitty Red | CDS23583115 | ฿790.00 | ฿98.75 | 1 |

---

## 9. Status Summary - Shipments

### 9.1 Completed Shipments (3)

#### Shipment Schema

```typescript
interface Shipment {
  status: 'DELIVERED' | 'IN_TRANSIT' | 'SHIPPED' | 'PENDING';
  trackingNumber: string;
  eta: string;               // Format: MM/DD/YYYY
  shippedOn: string;         // Format: MM/DD/YYYY
  releaseNo: string;
  shippedFrom: string;       // Warehouse name
  subdistrict: string;
  crcTrackingLink: string;   // Full tracking URL

  // Ship to Address
  shipToEmail: string;
  shipToName: string;
  shipToAddress: string;
  shipToAddressLine2: string;
  shipToAddressLine3: string;
  shipToDistrictProvince: string;
  allocationType: string;    // e.g., "Delivery"
  phone: string;

  // Package Appeasement Options
  includeCharges: boolean;

  items: {
    productName: string;
    sku: string;
    shippedQty: number;
    orderedQty: number;
    uom: string;
  }[];
}
```

#### Shipment 1 (Central Online Warehouse)

| Field | Value |
|-------|-------|
| Status | DELIVERED |
| Tracking Number | DHL0842601006994 |
| ETA | 01/23/2026 |
| Shipped On | 01/21/2026 |
| Rel No. | CDS2601212262851 |
| Shipped From | Central Online Warehouse |
| CRC Tracking Link | https://www.dhl.com/th-en/home/tracking.html?tracking-id=DHL0842601006994 |
| Allocation Type | Delivery |
| Phone | 0922643514 |

**Items in Shipment 1:**
- Girl Pants Hello Kitty Blue (CDS23582996) - 1 PCS
- Girl Leggings Hello Kitty Red (CDS23583115) - 1 PCS
- Girl Dress Cap Sleeves Hello Kitty Blue (CDS24077910) - 1 PCS
- Girl Toddler Dress Short Sleeves Gingham Cinnamoro (CDS24097840) - 1 PCS
- Girl T-Shirt Puff Sleeves Cinnamoroll Light Blue (CDS24098465) - 1 PCS

#### Shipment 2 (Bangna)

| Field | Value |
|-------|-------|
| Status | DELIVERED |
| Tracking Number | KNJ0202601010946 |
| ETA | 01/23/2026 |
| Shipped On | 01/21/2026 |
| Rel No. | CDS2601212262853 |
| Shipped From | Bangna |
| CRC Tracking Link | https://th.kex-express.com/th/track/?track=KNJ0202601010946 |

**Items in Shipment 2:**
- Girl T-Shirt Short Sleeves Round Neck Kuromi Viole (CDS23576490) - 1 PCS
- Girl Pants Wide Legs Kuromi Denim (CDS23576551) - 1 PCS
- Girl Dress Short Sleeves Gingham Hello Kitty Cherr (CDS24098083) - 1 PCS
- Girl T-Shirt Short Sleeves Round Neck Hello Kitty (CDS24098281) - 1 PCS
- Girl Toddler Pyjamas Set Dress Long Sleeves With R (CDS24820752) - 1 PCS
- Girl Toddler Pyjamas Set Dress Long Sleeves With R (CDS24820776) - 1 PCS

#### Shipment 3 (Lardprao)

| Field | Value |
|-------|-------|
| Status | DELIVERED |
| Tracking Number | KNJ0202601010865 |
| ETA | 01/23/2026 |
| Shipped On | 01/21/2026 |
| Rel No. | CDS2601212262852 |
| Shipped From | Lardprao |
| CRC Tracking Link | https://th.kex-express.com/th/track/?track=KNJ0202601010865 |

**Items in Shipment 3:**
- Girl Toddler T-Shirt Puff Sleeves Hello Kitty Whit (CDS24097574) - 1 PCS
- Girl Toddler Shorts Hello Kitty Cherry Blossom Pin (CDS24097635) - 1 PCS

### 9.2 In Process Shipments: 0
### 9.3 Planned Shipments: 0

---

## 10. Payments and Settlements (3 Invoices)

### Invoice Schema

```typescript
interface Invoice {
  invoiceType: string;       // e.g., "Shipment"
  invoiceNo: string;
  invoiceStatus: string;     // e.g., "Closed"
  invoiceDate: string;       // Format: MM/DD/YYYY
  invoiceAmount: number;

  items: {
    productName: string;
    sku: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
    discount: number;
    charges: number;
    taxes: number;
    total: number;
    informationalTaxes: number;
  }[];

  payment: {
    cardNumber: string;      // Masked
    transactionDate: string;
    amountCharged: number;
  };

  summary: {
    itemSubtotal: number;
    totalDiscounts: number;
    totalCharges: number;
    totalTaxes: number;
    shipmentTotal: number;
    informationalTaxes: number;
  };
}
```

### Invoice 1

| Field | Value |
|-------|-------|
| Invoice Type | Shipment |
| Invoice No. | 17689833173984144989 |
| Invoice Status | Closed |
| Invoice Date | 01/21/2026 |
| Invoice Amount | ฿1,875.25 |
| Card Number | 525669XXXXXX0005 |
| Amount Charged | ฿1,875.25 |
| Item Subtotal | ฿4,510.00 |
| Total Discounts | ฿2,634.75 |
| Shipment Total | ฿1,875.25 |
| Informational Taxes | ฿122.66 |

### Invoice 2

| Field | Value |
|-------|-------|
| Invoice Type | Shipment |
| Invoice No. | 17689839997298882773 |
| Invoice Status | Closed |
| Invoice Date | 01/21/2026 |
| Invoice Amount | ฿567.64 |
| Card Number | 525669XXXXXX0005 |
| Amount Charged | ฿567.64 |
| Item Subtotal | ฿840.00 |
| Total Discounts | ฿272.36 |
| Shipment Total | ฿567.64 |
| Informational Taxes | ฿37.13 |

### Invoice 3

| Field | Value |
|-------|-------|
| Invoice Type | Shipment |
| Invoice No. | 17689858488467027983 |
| Invoice Status | Closed |
| Invoice Date | 01/21/2026 |
| Invoice Amount | ฿2,108.36 |
| Card Number | 525669XXXXXX0005 |
| Amount Charged | ฿2,108.36 |
| Item Subtotal | ฿4,110.00 |
| Total Discounts | ฿2,001.64 |
| Shipment Total | ฿2,108.36 |
| Informational Taxes | ฿137.91 |

---

## 11. More Info Dialog (Fulfillment Info)

The "More Info" button opens a dialog with an iframe showing:
- **Fulfillment Status**: Track fulfillment progress
- **Tracking Status**: Real-time shipment tracking

Note: This section may require additional API authentication to display data.

---

## 12. Navigation Elements

| Element | Destination |
|---------|-------------|
| Home | /home |
| Item Search | /itemsearch |
| Orders | /orders |
| Customer Dropdown | Customer details panel |

---

## 13. Action Buttons

| Button | Location | Function |
|--------|----------|----------|
| APPEASE | Per shipment | Create package appeasement |
| More Info | Per item | View fulfillment details |
| APPLY | Coupons modal | Apply new coupon code |
| REMOVE | Coupons modal | Remove selected coupon |
| Include Charges | Appeasement checkbox | Include charges in appeasement |

---

## 14. Enums and Constants

### Order Status
```typescript
type OrderStatus = 'DELIVERED' | 'IN_PROCESS' | 'PLANNED' | 'CANCELLED' | 'ON_HOLD' | 'PENDING';
```

### Payment Status
```typescript
type PaymentStatus = 'PAID' | 'PENDING' | 'FAILED' | 'REFUNDED';
```

### Invoice Status
```typescript
type InvoiceStatus = 'Open' | 'Closed' | 'Cancelled';
```

### Supply Type
```typescript
type SupplyType = 'On Hand Available' | 'Backorder' | 'Drop Ship';
```

### Allocation Type
```typescript
type AllocationType = 'Delivery' | 'Pickup' | 'Ship to Store';
```

---

## 15. Screenshots Reference

| Screenshot | Description |
|------------|-------------|
| order-status-full-page.png | Full page screenshot |
| promotions-modal.png | Promotions modal view |
| coupons-modal.png | Coupons modal view |
| more-info-modal.png | Fulfillment info modal |

---

## 16. API Endpoints (Inferred)

| Endpoint | Method | Description |
|----------|--------|-------------|
| /customerengagementfacade/app/orderstatus | GET | Order status page |
| /customerengagementfacade/app/additionalInfo | GET | Item fulfillment details |
| /customerengagementfacade/app/casedetail | GET | Case detail page |

### Query Parameters
- `orderId`: Order ID (required)
- `selectedOrg`: Organization code (required, e.g., "DS")
- `OrderLineId`: Order line ID (for additionalInfo)
- `loggedInUser`: Current user info

---

*Generated by Claude Code on 2026-01-22*
