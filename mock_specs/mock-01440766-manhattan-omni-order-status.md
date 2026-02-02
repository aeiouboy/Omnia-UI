# Manhattan OMNI Order Status Data Specification

**ADW ID:** 01440766
**Source URL:** `https://crcpp.omni.manh.com/customerengagementfacade/app/orderstatus?orderId=CDS260120221340&selectedOrg=DS`
**System:** Manhattan Associates OMNI - Customer Engagement Facade
**Page Title:** Call center
**Date Captured:** 2026-02-02

---

## Page Overview

The Manhattan OMNI Order Status page provides comprehensive order tracking and management for call center operations. It displays order details, payment information, line items with fulfillment status, shipment tracking, and invoice information.

---

## Data Schema

### 1. Header & Navigation

#### 1.1 Organization Context
| Field | Type | Example Value | Description |
|-------|------|---------------|-------------|
| `organization_name` | String | "DS" | Selected organization/store group |
| `ui_mode` | String | "Standard UI" | User interface mode |
| `user_name` | String | "Naruechon Woraphatphawan" | Logged-in user name |

#### 1.2 Navigation Menu
| Field | Type | Options | Description |
|-------|------|---------|-------------|
| `nav_items` | Array | ["Home", "Item Search", "Orders"] | Available navigation options |

---

### 2. Customer Information

#### 2.1 Customer Profile
| Field | Type | Example Value | Description |
|-------|------|---------------|-------------|
| `customer_name` | String | "TIAGO SILVA" | Customer full name |
| `phone` | String | "0996576505" | Customer phone number |
| `email` | String | "2601202853@dummy.com" | Customer email address |
| `registration_status` | String | "Not Registered" | Customer account registration status |

---

### 3. Order Status Section

#### 3.1 Order Header
| Field | Type | Example Value | Description |
|-------|------|---------------|-------------|
| `order_status` | String | "FULFILLED" | Overall order status |
| `order_number` | String | "CDS260120221340" | Unique order identifier |
| `created_date` | DateTime | "01/20/2026 18:40 +07" | Order creation timestamp (GMT+7) |
| `order_type` | String | "RT-CC-STD" | Order type code (Retail Click & Collect Standard) |

#### 3.2 Order Metadata
| Field | Type | Example Value | Description |
|-------|------|---------------|-------------|
| `store_number` | String | "" (empty) | Store number for the order |
| `related_cases` | String | "undefined" | Related case management ID |
| `full_tax_invoice` | Boolean | false | Full tax invoice requested |
| `customer_type_id` | String | "General" | Customer type classification |
| `the1_member` | Boolean | true | The1 loyalty program member status |
| `selling_channel` | String | "Web" | Sales channel origin |
| `allow_substitution` | Boolean | false | Allow item substitution flag |
| `customer_reference` | String | "2601202853" | Customer reference number |
| `tax_id` | String | "" (empty) | Tax identification number |
| `company_name` | String | "" (empty) | Company name for business orders |
| `branch_number` | String | "" (empty) | Branch number for business orders |
| `captured_date` | DateTime | "01/20/2026 18:40 +07" | Order capture timestamp |

---

### 4. Payment Information

#### 4.1 Payment Status
| Field | Type | Example Value | Description |
|-------|------|---------------|-------------|
| `payment_status` | String | "PAID" | Payment status |
| `payment_method` | String | "BANK TRANSFER" | Payment method used |

#### 4.2 Payment Amounts
| Field | Type | Example Value | Description |
|-------|------|---------------|-------------|
| `amount_to_be_charged` | Currency | "THB 5,200.00" | Amount to be charged |
| `amount_charged` | Currency | "THB 5,200.00" | Amount actually charged |

#### 4.3 Billing Address
| Field | Type | Example Value | Description |
|-------|------|---------------|-------------|
| `billing_address_line1` | String | "-" | Billing address line 1 |
| `billing_address_line2` | String | "-" | Billing address line 2 |
| `billing_address_city` | String | "-" | Billing city |
| `billing_address_country` | String | "TH" | Billing country code |
| `billing_name` | String | "Tiago Silva" | Billing name |

---

### 5. Order Summary

#### 5.1 Promotions & Discounts
| Field | Type | Example Value | Description |
|-------|------|---------------|-------------|
| `order_promotions_count` | Integer | 0 | Number of order-level promotions |
| `order_appeasements_count` | Integer | 0 | Number of order-level appeasements |
| `order_coupons_count` | Integer | 0 | Number of order-level coupons applied |

---

### 6. Order Line Items

#### 6.1 Line Item Structure
| Field | Type | Example Value | Description |
|-------|------|---------------|-------------|
| `item_name` | String | "GET FREE - MYSLF EAU DE PARFUM 1.2 mL" | Item description |
| `sku` | String | "CDS10174760" | Stock keeping unit identifier |
| `eta` | Date | "01/26/2026" | Estimated time of arrival |
| `notes_count` | Integer | 0 | Number of notes attached to line item |

#### 6.2 Item Attributes
| Field | Type | Example Value | Description |
|-------|------|---------------|-------------|
| `style` | String | "" (empty) | Item style attribute |
| `color` | String | "" (empty) | Item color attribute |
| `size` | String | "" (empty) | Item size attribute |
| `price` | Currency | "THB 0.00" | Item unit price |

#### 6.3 Item Promotions
| Field | Type | Example Value | Description |
|-------|------|---------------|-------------|
| `item_promotions_count` | Integer | 0 | Number of item-level promotions |
| `item_coupons_count` | Integer | 0 | Number of item-level coupons |
| `item_appeasements_count` | Integer | 0 | Number of item-level appeasements |

#### 6.4 Shipping & Fulfillment Details
| Field | Type | Example Value | Description |
|-------|------|---------------|-------------|
| `shipping_method` | String | "Standard Pickup" | Shipping method |
| `route` | String | "" (empty) | Delivery route |
| `booking_slot_from` | DateTime | "" (empty) | Booking slot start time |
| `booking_slot_to` | DateTime | "" (empty) | Booking slot end time |
| `supply_type_id` | String | "" (empty) | Supply type identifier |
| `bundle` | Boolean | false | Is bundle item flag |
| `bundle_ref_id` | String | "" (empty) | Bundle reference ID |
| `packed_ordered_qty` | Integer | 0 | Packed ordered quantity |
| `number_of_pack` | String | "" (empty) | Number of packs |
| `pack_item_description` | String | "" (empty) | Pack item description |
| `uom` | String | "PCS" | Unit of measure |
| `actual_weight` | String | "" (empty) | Actual item weight |
| `promotion_id` | String | "" (empty) | Promotion identifier |
| `promotion_type` | String | "" (empty) | Promotion type |
| `secret_code` | String | "564775" | Secret code for gift/promotion |
| `gift_with_purchase` | Boolean | true (for SKUs: CDS10174760, CDS16319509, CDS23619029)<br>false (for SKU: CDS24737203) | Gift with purchase flag |
| `gift_with_purchase_item` | String | "CDS24737203" (for gift items)<br>"" (empty for main purchase item) | Gift with purchase item SKU - references the main item that triggered the gift |
| `gift_wrapped` | String | "" (empty) | Gift wrapping status |

#### 6.5 Fulfillment Status
| Field | Type | Example Value | Description |
|-------|------|---------------|-------------|
| `fulfillment_status` | String | "FULFILLED" | Line item fulfillment status |
| `quantity_ordered` | Integer | 1 | Quantity ordered |
| `quantity_allocated` | Integer | 1 | Quantity allocated |
| `quantity_released` | Integer | 1 | Quantity released |
| `quantity_picked_up` | Integer | 1 | Quantity picked up |

#### 6.6 Line Item Financial Summary
| Field | Type | Example Value | Description |
|-------|------|---------------|-------------|
| `line_subtotal` | Currency | "THB 0.00" | Line item subtotal |
| `line_discount` | Currency | "THB 0.00" | Line item discount |
| `line_charges` | Currency | "THB 0.00" | Line item charges |
| `line_taxes` | Currency | "THB 0.00" | Line item taxes |
| `line_total` | Currency | "THB 0.00" | Line item total |
| `line_informational_taxes` | Currency | "THB 340.19" | Informational taxes (for taxable items) |

---

### 7. Order Financial Summary

#### 7.1 Order Totals
| Field | Type | Example Value | Description |
|-------|------|---------------|-------------|
| `item_subtotal` | Currency | "THB 5,200.00" | Total item subtotal |
| `total_discounts` | Currency | "THB 0.00" | Total discounts applied |
| `estimated_shipping_handling` | Currency | "THB 0.00" | Estimated shipping & handling |
| `other_charges` | Currency | "THB 0.00" | Other service charges |
| `estimated_taxes` | Currency | "THB 0.00" | Estimated taxes |
| `order_total` | Currency | "THB 5,200.00" | Final order total |
| `informational_taxes` | Currency | "THB 340.19" | Informational taxes |

---

### 8. Status Summary Section

#### 8.1 Completed Shipments

##### 8.1.1 Shipment Header
| Field | Type | Example Value | Description |
|-------|------|---------------|-------------|
| `shipment_status` | String | "PICKED UP" / "FULFILLED" | Shipment status |
| `tracking_number` | String | "CNJ2601065054" | Tracking number |
| `eta` | Date | "01/26/2026" | Estimated time of arrival |
| `release_number` | String | "CDS2601202213402" | Release number |

##### 8.1.2 Pickup Shipment Details
| Field | Type | Example Value | Description |
|-------|------|---------------|-------------|
| `picked_on` | Date | "01/23/2026" | Pickup date |
| `picked_from` | String | "Chidlom" | Pickup location name |
| `shipping_method` | String | "Standard Pickup" | Shipping method |
| `subdistrict` | String | "Lumpini" | Subdistrict for delivery |
| `crc_tracking_link` | String | "" (empty) | CRC tracking URL |

##### 8.1.3 Standard Shipment Details
| Field | Type | Example Value | Description |
|-------|------|---------------|-------------|
| `shipped_on` | Date | "01/21/2026" | Ship date |
| `shipped_from` | String | "Central Online Warehouse" | Shipping origin location |

##### 8.1.4 Ship to Store Address
| Field | Type | Example Value | Description |
|-------|------|---------------|-------------|
| `ship_to_type` | String | "Ship to Store" | Shipping destination type |
| `recipient_email` | String | "2601202853@dummy.com" | Recipient email |
| `store_name` | String | "CENTRAL CHIDLOM" | Store name |
| `store_address_line1` | String | "Store Pickup Central Chidlom (CDS 10102) 1027 Ploenchit Road" | Store address line 1 |
| `store_city` | String | "Pathumwan" | Store city |
| `store_province` | String | "Bangkok" | Store province/state |
| `store_postal_code` | String | "10330" | Store postal code |
| `store_country` | String | "TH" | Store country code |
| `allocation_type` | String | "Pickup" / "Merge" | Allocation type |
| `store_phone` | String | "027937777" | Store phone number |

##### 8.1.5 Shipment Items
| Field | Type | Example Value | Description |
|-------|------|---------------|-------------|
| `item_name` | String | "GET FREE - MYSLF EAU DE PARFUM 1.2 mL" | Item description |
| `sku` | String | "CDS10174760" | Stock keeping unit |
| `picked_qty` | Integer | 1 | Quantity picked (for pickup shipments) |
| `shipped_qty` | Integer | 1 | Quantity shipped (for standard shipments) |
| `ordered_qty` | Integer | 1 | Quantity ordered |
| `uom` | String | "PCS" | Unit of measure |

#### 8.2 In Process Shipments
| Field | Type | Example Value | Description |
|-------|------|---------------|-------------|
| `in_process_count` | Integer | 0 | Number of shipments in process |

#### 8.3 Planned Shipments
| Field | Type | Example Value | Description |
|-------|------|---------------|-------------|
| `planned_shipments_count` | Integer | 0 | Number of planned shipments |

---

### 9. Payments and Settlements

#### 9.1 Invoice Header
| Field | Type | Example Value | Description |
|-------|------|---------------|-------------|
| `invoice_type` | String | "Shipment" | Type of invoice |
| `invoice_number` | String | "17689146816096382236" | Invoice number |
| `invoice_status` | String | "Closed" | Invoice status |
| `invoice_date` | Date | "01/20/2026" | Invoice date |
| `invoice_amount` | Currency | "THB 5,200.00" | Invoice amount |

#### 9.2 Invoice Line Items
| Field | Type | Example Value | Description |
|-------|------|---------------|-------------|
| `item_name` | String | "GET FREE - MYSLF EAU DE PARFUM 1.2 mL" | Item description |
| `sku` | String | "CDS10174760" | Stock keeping unit |
| `quantity` | Integer | 1 | Invoiced quantity |
| `unit_price` | Currency | "THB 0.00" | Unit price |
| `subtotal` | Currency | "THB 0.00" | Item subtotal |
| `discount` | Currency | "THB 0.00" | Item discount |
| `charges` | Currency | "THB 0.00" | Item charges |
| `taxes` | Currency | "THB 0.00" | Item taxes |
| `total` | Currency | "THB 0.00" | Item total |
| `informational_taxes` | Currency | "THB 340.19" | Informational taxes (for taxable items) |

#### 9.3 Payment Transaction
| Field | Type | Example Value | Description |
|-------|------|---------------|-------------|
| `payment_method` | String | "Bank Transfer" | Payment method |
| `transaction_date` | Date | "01/20/2026" | Transaction date |
| `amount_charged` | Currency | "THB 5,200.00" | Amount charged |

#### 9.4 Invoice Summary
| Field | Type | Example Value | Description |
|-------|------|---------------|-------------|
| `item_subtotal` | Currency | "THB 5,200.00" | Total item subtotal |
| `total_discounts` | Currency | "THB 0.00" | Total discounts |
| `total_charges` | Currency | "THB 0.00" | Total charges |
| `total_taxes` | Currency | "THB 0.00" | Total taxes |
| `shipment_total` | Currency | "THB 5,200.00" | Shipment total |
| `informational_taxes` | Currency | "THB 340.19" | Informational taxes |

---

## Sample Order Data

### Order: CDS260120221340

**Customer:** TIAGO SILVA
**Order Type:** RT-CC-STD (Retail Click & Collect Standard)
**Status:** FULFILLED
**Payment:** PAID via Bank Transfer (THB 5,200.00)

**Line Items (4):**

1. **GET FREE - MYSLF EAU DE PARFUM 1.2 mL**
   - SKU: CDS10174760
   - Qty: 1, Price: THB 0.00
   - Status: FULFILLED
   - Gift with purchase: true
   - Gift with purchase item: CDS24737203

2. **GET FREE - YSL Pureshot Stability Reboot B 30 mL.**
   - SKU: CDS16319509
   - Qty: 1, Price: THB 0.00
   - Status: FULFILLED
   - Gift with purchase: true
   - Gift with purchase item: CDS24737203

3. **GET FREE - Libre EDP 1.2 mL**
   - SKU: CDS23619029
   - Qty: 1, Price: THB 0.00
   - Status: FULFILLED
   - Gift with purchase: true
   - Gift with purchase item: CDS24737203

4. **Women Fragrance Gift Set Libre 50 mL Holiday 25**
   - SKU: CDS24737203
   - Qty: 1, Price: THB 5,200.00
   - Status: FULFILLED
   - Informational Taxes: THB 340.19
   - Gift with purchase: false (main purchase item that triggers gifts)

**Shipments (2):**

1. **Pickup Shipment** (CDS2601202213402)
   - Status: PICKED UP
   - Tracking: CNJ2601065054
   - Picked on: 01/23/2026 from Chidlom
   - Ship to: CENTRAL CHIDLOM store

2. **Standard Shipment** (CDS2601202213401)
   - Status: FULFILLED
   - Tracking: CNJ2601065054
   - Shipped on: 01/21/2026 from Central Online Warehouse
   - Ship to: CENTRAL CHIDLOM store

---

## Field Type Definitions

| Type | Description | Format/Pattern |
|------|-------------|----------------|
| String | Text field | Plain text |
| Integer | Whole number | 0-9+ |
| Boolean | True/False flag | true/false |
| Currency | Monetary amount | "THB X,XXX.XX" |
| Date | Date only | "MM/DD/YYYY" |
| DateTime | Date with time | "MM/DD/YYYY HH:MM +TZ" |
| Array | List of values | ["value1", "value2"] |

---

## Notes

1. **Currency Format**: All monetary amounts use Thai Baht (THB) with 2 decimal places
2. **Date Format**: Dates use MM/DD/YYYY format with GMT+7 timezone
3. **Empty Fields**: Many optional fields return empty strings "" instead of null
4. **Informational Taxes**: Displayed separately from regular taxes for certain items
5. **Order Type Codes**: Follow pattern `{Platform}-{Method}-{Speed}` (e.g., RT-CC-STD = Retail Click & Collect Standard)
6. **Fulfillment Stages**: Ordered → Allocated → Released → Picked Up/Shipped → Fulfilled
7. **Secret Code**: Used for promotional gift items (e.g., "564775")
8. **Allocation Types**: "Pickup" for store pickup, "Merge" for merged shipments
9. **Gift with Purchase Relationship**: Free gift items have `gift_with_purchase: true` and reference the main purchase item in `gift_with_purchase_item` field. In this order, three free perfume samples (CDS10174760, CDS16319509, CDS23619029) are gifts triggered by purchasing the main item (CDS24737203)

---

## API Endpoint Pattern

Based on console logs and network activity:

- **Base URL**: `https://crcpp.omni.manh.com`
- **Order Search**: `/order/api/order/order/search` (POST)
- **Auth Required**: 403 errors indicate authentication/authorization required
- **Query Pattern**: `OrderId= 'CDS260120221340'`

---

## UI Interactions

### Available Actions

1. **More Info Button**: Expands additional fulfillment and tracking details in modal dialog
2. **Promotions/Coupons Links**: Clickable counters showing "0Promotions", "0Coupons", "0Appeasements"
3. **Customer Dropdown**: Expandable customer information panel
4. **Accordion Sections**:
   - COMPLETED SHIPMENTS (2) - Expanded by default
   - IN PROCESS SHIPMENTS (0) - Collapsed
   - PLANNED SHIPMENTS (0) - Collapsed
   - PAYMENTS AND SETTLEMENTS (1) - Expanded by default
5. **Notes Icons**: Clickable icons showing note count (currently "0")

---

## System Information

- **Platform**: Manhattan Associates OMNI
- **Module**: Customer Engagement Facade
- **Version**: 227-11-0 (build: 71441bc)
- **CDN**: cdn.manh.cloud
- **Browser Compatibility**: Tested with Playwright automation
- **Authentication**: Keycloak-based (MA Active realm)
