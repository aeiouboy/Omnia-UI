# Manhattan OMS Order Status Page - Mock Data Specification

**Order ID**: CDS260121226285
**Organization**: DS
**Page**: `/customerengagementfacade/app/orderstatus`
**Captured**: 2026-01-22
**Status**: DELIVERED

---

## Overview

The order status page displays comprehensive order details including customer information, payment data, ordered items with fulfillment tracking, and pricing breakdown. The page uses an accordion-style layout with expandable sections for detailed information.

---

## Field Definitions

### Order Header Section

| Field | Type | Value | Description |
|-------|------|-------|-------------|
| **Page Title** | string | "Call center" | Browser page title |
| **Order Status Display** | string | "DELIVERED" | Current order fulfillment status |
| **Organization** | string | "DS" | Organization/store identifier |
| **UI Type** | string | "Standard UI" | Interface type selector |

### Order Information Section

| Field | Type | Value | Description |
|-------|------|-------|-------------|
| **Order No.** | string | CDS260121226285 | Unique order identifier |
| **Created** | datetime | 01/21/2026 11:49 +07 | Order creation timestamp (GMT+7) |
| **Order type** | string | RT-HD-STD | Order type classification |
| **Store No.** | string | (empty) | Store number |
| **Related Cases** | string | undefined | Linked case identifier (if any) |
| **Full Tax Invoice** | boolean | false | Whether full tax invoice was issued |
| **Customer Type Id** | string | General | Customer classification |
| **The1 member** | string | 8031630388 | The 1 loyalty member ID |
| **Selling channel** | string | Web | Sales channel (Web/Mobile/Store) |
| **Allow substitution** | boolean | false | Product substitution allowed flag |
| **Cust Ref** | string | 2400777864 | Customer reference number |
| **Tax Id** | string | (empty) | Customer tax ID |
| **Company Name** | string | (empty) | Business entity name |
| **Branch No.** | string | (empty) | Branch number |
| **Captured Date** | datetime | 01/21/2026 11:49 +07 | Date order was captured |

### Customer Information Section

| Field | Type | Value | Description |
|-------|------|-------|-------------|
| **Customer Name** | string | ธนวัฒน์ สิงห์แพรก | Full customer name |
| **Phone** | string | 0922643514 | Contact phone number |
| **Email** | string | thanawat4596@gmail.com | Email address |
| **Registration Status** | string | Not Registered | Customer account status |

### Payment Information Section

| Field | Type | Value | Description |
|-------|------|-------|-------------|
| **Payment Status** | string | PAID | Payment completion status |
| **Payment Method** | string | CREDIT CARD | Payment method type |
| **Credit Card** | string | 525669XXXXXX0005 | Masked credit card number |
| **Expiry Date** | string | **/\**** | Card expiry (masked) |
| **Amount to be charged** | currency | ฿4,551.25 | Original payment amount |
| **Amount charged** | currency | ฿4,551.25 | Actual charged amount |
| **Billing Address** | string | 88/10 ม.1 ซ.ชัยพรวิถี 14 ถ.ชัยพรวิถี | Street address |
| **Billing Address (cont.)** | string | หนองปรือ, บางละมุง, ชลบุรี, TH, 20150 | District, City, Country, ZIP |
| **Billing Name** | string | ธนวัฒน์ สิงห์แพรก | Name on billing address |

### Order Promotions Summary

| Field | Type | Value | Description |
|-------|------|-------|-------------|
| **Order Promotions** | number | 0 | Count of promotions applied to order |
| **Order Appeasements** | number | 0 | Count of appeasement adjustments |
| **Order Coupons Applied** | number | 0 | Count of coupons applied to order |

### Items Section

#### Item 1: Girl T-Shirt Short Sleeves Round Neck Kuromi Viole

| Field | Type | Value | Description |
|-------|------|-------|-------------|
| **Item Name** | string | Girl T-Shirt Short Sleeves Round Neck Kuromi Viole | Product name |
| **SKU** | string | CDS23576490 | Stock keeping unit |
| **ETA** | date | 01/23/2026 | Estimated delivery date |
| **Style** | string | (empty) | Product style attribute |
| **Color** | string | (empty) | Product color attribute |
| **Size** | string | (empty) | Product size attribute |
| **Promotions Count** | number | 1 | Promotions applied to item |
| **Coupons Count** | number | 1 | Coupons applied to item |
| **Appeasements Count** | number | 0 | Appeasements applied to item |
| **Price** | currency | ฿395.00 | Item unit price |
| **Shipping Method** | string | Standard Delivery | Shipping type |
| **Route** | string | (empty) | Shipping route |
| **Booking slot from** | string | (empty) | Delivery slot start time |
| **Booking slot to** | string | (empty) | Delivery slot end time |
| **SupplyTypeId** | string | On Hand Available | Stock availability type |
| **Bundle** | boolean | false | Whether item is bundled |
| **Bundle Ref Id** | string | (empty) | Reference ID if bundled |
| **Packed Ordered Qty** | number | 0 | Quantity packed |
| **NumberOfPack** | string | (empty) | Number of packs |
| **PackitemDescription** | string | (empty) | Pack description |
| **UOM** | string | PCS | Unit of measurement |
| **Actual weight** | string | (empty) | Item weight |
| **Promotion Id** | string | (empty) | Promotion identifier |
| **Promotion Type** | string | (empty) | Type of promotion |
| **Secret code** | string | (empty) | Promotion code |
| **Gift with purchase** | boolean | false | Gift item flag |
| **Gift with purchase item** | string | (empty) | Gift item description |
| **Gift wrapped** | string | (empty) | Gift wrapping flag |

**Item Fulfillment Status**:
| Status | Quantity |
|--------|----------|
| Ordered | 1 |
| Allocated | 1 |
| Released | 1 |
| Fulfilled | 1 |
| Delivered | 1 |

**Item Price Breakdown**:
| Component | Amount |
|-----------|--------|
| Subtotal | ฿395.00 |
| Discount | ฿128.07 |
| Charges | ฿0.00 |
| Taxes | ฿0.00 |
| Total | ฿266.93 |
| Informational Taxes | ฿17.46 |

#### Item 2: Girl Pants Wide Legs Kuromi Denim

| Field | Type | Value | Description |
|-------|------|-------|-------------|
| **Item Name** | string | Girl Pants Wide Legs Kuromi Denim | Product name |
| **SKU** | string | CDS23576551 | Stock keeping unit |
| **ETA** | date | 01/23/2026 | Estimated delivery date |
| **Price** | currency | ฿645.00 | Item unit price |
| **Promotions Count** | number | 1 | Promotions applied to item |
| **Coupons Count** | number | 1 | Coupons applied to item |
| **Appeasements Count** | number | 0 | Appeasements applied to item |
| **SupplyTypeId** | string | On Hand Available | Stock availability type |

**Item Fulfillment Status**:
| Status | Quantity |
|--------|----------|
| Ordered | 1 |
| Allocated | 1 |
| Released | 1 |
| Fulfilled | 1 |
| Delivered | 1 |

**Item Price Breakdown**:
| Component | Amount |
|-----------|--------|
| Subtotal | ฿645.00 |
| Discount | ฿209.13 |
| Charges | ฿0.00 |
| Taxes | ฿0.00 |
| Total | ฿435.87 |
| Informational Taxes | ฿28.51 |

#### Item 3: Girl Pants Hello Kitty Blue

| Field | Type | Value | Description |
|-------|------|-------|-------------|
| **Item Name** | string | Girl Pants Hello Kitty Blue | Product name |
| **SKU** | string | CDS23582996 | Stock keeping unit |
| **ETA** | date | 01/23/2026 | Estimated delivery date |
| **Price** | currency | ฿1,290.00 | Item unit price |
| **Promotions Count** | number | 2 | Promotions applied to item |
| **Coupons Count** | number | 1 | Coupons applied to item |
| **Appeasements Count** | number | 0 | Appeasements applied to item |
| **SupplyTypeId** | string | On Hand Available | Stock availability type |

**Item Fulfillment Status**:
| Status | Quantity |
|--------|----------|
| Ordered | 1 |
| Allocated | 1 |
| Released | 1 |
| Fulfilled | 1 |
| Delivered | 1 |

**Item Price Breakdown**:
| Component | Amount |
|-----------|--------|
| Subtotal | ฿1,290.00 |
| Discount | ฿854.13 |
| Charges | ฿0.00 |
| Taxes | ฿0.00 |
| Total | ฿435.87 |
| Informational Taxes | ฿28.51 |

#### Item 4: Girl Leggings Hello Kitty Red

| Field | Type | Value | Description |
|-------|------|-------|-------------|
| **Item Name** | string | Girl Leggings Hello Kitty Red | Product name |
| **SKU** | string | CDS23583115 | Stock keeping unit |
| **ETA** | date | 01/23/2026 | Estimated delivery date |
| **Price** | currency | ฿790.00 | Item unit price |
| **Promotions Count** | number | 2 | Promotions applied to item |
| **Coupons Count** | number | 1 | Coupons applied to item |
| **Appeasements Count** | number | 0 | Appeasements applied to item |
| **SupplyTypeId** | string | On Hand Available | Stock availability type |

---

## Data Relationships

**Order → Items**: One order contains multiple items (4 items in this example)

**Item → Fulfillment Status**: Each item has a fulfillment pipeline with 5 stages:
- Ordered → Allocated → Released → Fulfilled → Delivered

**Item → Price Breakdown**: Each item displays:
- Base subtotal with discount applied
- Additional charges and taxes
- Calculated total price

**Order → Payment**: Single payment method per order with billing address and customer name

---

## Sample JSON Representation

```json
{
  "order": {
    "orderNo": "CDS260121226285",
    "status": "DELIVERED",
    "created": "01/21/2026 11:49 +07",
    "orderType": "RT-HD-STD",
    "organization": "DS",
    "customer": {
      "name": "ธนวัฒน์ สิงห์แพรก",
      "phone": "0922643514",
      "email": "thanawat4596@gmail.com",
      "the1MemberId": "8031630388",
      "registrationStatus": "Not Registered"
    },
    "payment": {
      "status": "PAID",
      "method": "CREDIT CARD",
      "cardNumber": "525669XXXXXX0005",
      "amountCharged": "฿4,551.25",
      "billingAddress": {
        "street": "88/10 ม.1 ซ.ชัยพรวิถี 14 ถ.ชัยพรวิถี",
        "district": "หนองปรือ",
        "city": "บางละมุง",
        "province": "ชลบุรี",
        "country": "TH",
        "zipCode": "20150"
      }
    },
    "items": [
      {
        "name": "Girl T-Shirt Short Sleeves Round Neck Kuromi Viole",
        "sku": "CDS23576490",
        "eta": "01/23/2026",
        "price": "฿395.00",
        "fulfillmentStatus": {
          "ordered": 1,
          "allocated": 1,
          "released": 1,
          "fulfilled": 1,
          "delivered": 1
        },
        "pricing": {
          "subtotal": "฿395.00",
          "discount": "฿128.07",
          "charges": "฿0.00",
          "taxes": "฿0.00",
          "total": "฿266.93"
        }
      }
    ],
    "promotions": 0,
    "appeasements": 0,
    "couponsApplied": 0
  }
}
```

---

## Page Navigation Elements

- **Navigation Menu**: Home, Item Search, Orders
- **Organization Selector**: DS (dropdown)
- **UI Type Selector**: Standard UI (dropdown)
- **Help Button**: Information/help icon
- **User Profile**: Naruechon Woraphatphawan (with user menu)
- **Customer Panel**: Expandable/collapsible customer details section
- **Item Actions**: "More Info" buttons for each item

---

## Edge Cases & Notes

- Empty fields like Tax Id, Company Name, Branch No., Style, Color, Size are displayed but empty
- Gift wrapping and gift-with-purchase fields are always false in this order
- All items show same ETA date (01/23/2026)
- All items show "On Hand Available" as supply type
- Related Cases field shows "undefined" - may be populated when cases exist
- Card expiry shows as **/\**** - masked for security
- Customer registration status shows "Not Registered" - can vary per customer
- All items are delivered with all fulfillment statuses showing quantity 1

---

## Key Fields for Integration

**For Order List Sync**:
- `orderNo`: Unique order identifier
- `status`: Current fulfillment status (DELIVERED, IN_PROGRESS, etc.)
- `created`: Order creation timestamp
- `customer.name`: Customer identifier
- `customer.the1MemberId`: Loyalty program member ID

**For Order Detail View**:
- All order, payment, and item fields above
- Item SKU and ETA for inventory tracking
- Fulfillment status pipeline for progress tracking
- Price breakdown for financial records

