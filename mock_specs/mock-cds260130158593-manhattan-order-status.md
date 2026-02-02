# Manhattan Active Omni - Order Status Data Specification

**Order ID**: CDS260130158593
**Source**: https://crcpp.omni.manh.com/customerengagementfacade/app/orderstatus
**Date Captured**: 2026-01-31

---

## Customer Information

| Field | Type | Example Value | Notes |
|-------|------|---------------|-------|
| customer_name | string | "TASSANAVALAI KLINTIENFUNG" | Full name in Thai/English |
| phone | string | "0624192696" | Contact phone number |
| email | string | "Engzaa@gmail.com" | Customer email |
| registration_status | string | "Not Registered" | Account registration status |

---

## Order Header

| Field | Type | Example Value | Notes |
|-------|------|---------------|-------|
| order_no | string | "CDS260130158593" | Unique order identifier |
| order_status | string | "DELIVERED" | Current order status |
| created | datetime | "01/30/2026 15:10 +07" | Order creation timestamp (GMT+7) |
| order_type | string | "RT-HD-STD" | Order type code (Retail-Home Delivery-Standard) |
| store_no | string | "" | Store number (empty in this case) |
| related_cases | string | "undefined" | Related case IDs |

### Order Attributes

| Field | Type | Example Value | Notes |
|-------|------|---------------|-------|
| full_tax_invoice | boolean | true | Tax invoice required |
| customer_type_id | string | "General" | Customer category |
| the1_member | string | "2002224934" | The1 loyalty program member ID |
| selling_channel | string | "Web" | Sales channel |
| allow_substitution | boolean | false | Product substitution allowed |
| cust_ref | string | "2400131193" | Customer reference number |
| tax_id | string | "0135564014412" | Tax identification number |
| company_name | string | "บริษัท อินเทลลิเจ้นท์ โกลบอล จำกัด" | Company name (Thai) |
| branch_no | string | "00000" | Branch number |
| captured_date | datetime | "01/30/2026 15:10 +07" | Order capture timestamp |

---

## Payment Information

### Payment Summary

| Field | Type | Example Value | Notes |
|-------|------|---------------|-------|
| payment_status | string | "PAID" | Overall payment status |
| total_amount | decimal | 2990.00 | Order total (฿) |
| amount_to_be_charged | decimal | 2990.00 | Total to charge (฿) |
| amount_charged | decimal | 2990.00 | Total charged (฿) |

### Payment Method 1: Credit Card

| Field | Type | Example Value | Notes |
|-------|------|---------------|-------|
| payment_type | string | "CREDIT_CARD" | Payment method type |
| card_number | string | "528560XXXXXX1117" | Masked credit card number |
| expiry_date | string | "**/****" | Masked expiry date |
| amount_to_be_charged | decimal | 2490.00 | Amount to charge (฿) |
| amount_charged | decimal | 2490.00 | Amount actually charged (฿) |
| billing_address | object | See below | Billing address details |
| billing_name | string | "ทัศนาวลัย กลิ่นเทียนฟุ้ง" | Billing name (Thai) |

#### Billing Address (Credit Card)

| Field | Type | Example Value | Notes |
|-------|------|---------------|-------|
| address_line_1 | string | "134/466" | Address line 1 |
| address_line_2 | string | "-" | Address line 2 |
| address_line_3 | string | "-" | Address line 3 |
| subdistrict | string | "ท่าทราย" | Subdistrict (Thai) |
| district | string | "เมืองนนทบุรี" | District (Thai) |
| province | string | "นนทบุรี" | Province (Thai) |
| country_code | string | "TH" | Country code |
| postal_code | string | "11000" | Postal code |

### Payment Method 2: The1 Points

| Field | Type | Example Value | Notes |
|-------|------|---------------|-------|
| payment_type | string | "T1" | The1 loyalty points |
| member_id | string | "2002224934" | The1 member ID |
| amount_to_be_charged | decimal | 500.00 | Points value to charge (฿) |
| amount_charged | decimal | 500.00 | Points value charged (฿) |
| billing_address | object | See below | Same as credit card billing |
| billing_name | string | "ทัศนาวลัย กลิ่นเทียนฟุ้ง" | Billing name (Thai) |

---

## Order Promotions & Coupons

| Field | Type | Example Value | Notes |
|-------|------|---------------|-------|
| order_promotions_count | integer | 0 | Number of order-level promotions |
| order_appeasements_count | integer | 0 | Number of order-level appeasements |
| order_coupons_count | integer | 0 | Number of order-level coupons |

---

## Order Items

### Item Details

| Field | Type | Example Value | Notes |
|-------|------|---------------|-------|
| item_name | string | "Air Pure Compact PT2210T0 White" | Product name |
| sku | string | "CDS19598406" | Stock keeping unit |
| eta | date | "02/01/2026" | Estimated time of arrival |
| status | string | "DELIVERED" | Item fulfillment status |
| price | decimal | 2990.00 | Unit price (฿) |
| ordered_qty | integer | 1 | Quantity ordered |
| allocated_qty | integer | 1 | Quantity allocated |
| released_qty | integer | 1 | Quantity released |
| fulfilled_qty | integer | 1 | Quantity fulfilled |
| delivered_qty | integer | 1 | Quantity delivered |

### Item Attributes

| Field | Type | Example Value | Notes |
|-------|------|---------------|-------|
| style | string | "" | Style attribute (empty) |
| color | string | "" | Color attribute (empty) |
| size | string | "" | Size attribute (empty) |
| shipping_method | string | "Standard Delivery" | Delivery method |
| route | string | "" | Delivery route (empty) |
| booking_slot_from | datetime | "" | Booking time slot start (empty) |
| booking_slot_to | datetime | "" | Booking time slot end (empty) |
| supply_type_id | string | "On Hand Available" | Inventory supply type |
| bundle | boolean | false | Is bundle product |
| bundle_ref_id | string | "" | Bundle reference ID (empty) |
| packed_ordered_qty | integer | 0 | Packed quantity |
| number_of_pack | string | "" | Number of packs (empty) |
| pack_item_description | string | "" | Pack description (empty) |
| uom | string | "PCS" | Unit of measure |
| actual_weight | string | "" | Actual weight (empty) |
| promotion_id | string | "" | Item promotion ID (empty) |
| promotion_type | string | "" | Promotion type (empty) |
| secret_code | string | "" | Promotion secret code (empty) |
| gift_with_purchase | boolean | false | Is gift with purchase |
| gift_with_purchase_item | string | "" | Gift item (empty) |
| gift_wrapped | string | "" | Gift wrapping (empty) |

### Item Promotions

| Field | Type | Example Value | Notes |
|-------|------|---------------|-------|
| promotions_count | integer | 0 | Number of promotions applied |
| coupons_count | integer | 0 | Number of coupons applied |
| appeasements_count | integer | 0 | Number of appeasements applied |
| item_notes_count | integer | 0 | Number of item notes |

### Item Price Breakdown

| Field | Type | Example Value | Notes |
|-------|------|---------------|-------|
| subtotal | decimal | 2990.00 | Item subtotal (฿) |
| discount | decimal | 0.00 | Total discounts (฿) |
| charges | decimal | 0.00 | Additional charges (฿) |
| taxes | decimal | 0.00 | Tax amount (฿) |
| total | decimal | 2990.00 | Item total (฿) |
| informational_taxes | decimal | 195.61 | Informational tax amount (฿) |

---

## Order Summary

| Field | Type | Example Value | Notes |
|-------|------|---------------|-------|
| item_subtotal | decimal | 2990.00 | Items subtotal (฿) |
| total_discounts | decimal | 0.00 | Total discounts (฿) |
| estimated_shipping_handling | decimal | 0.00 | Shipping & handling (฿) |
| other_charges | decimal | 0.00 | Other service charges (฿) |
| estimated_taxes | decimal | 0.00 | Tax amount (฿) |
| order_total | decimal | 2990.00 | Order total (฿) |
| informational_taxes | decimal | 195.61 | Informational tax (฿) |

**Note**: *Includes various service charges for the order.

---

## Status Summary

### Completed Shipments

#### Package Appeasement Options

| Field | Type | Example Value | Notes |
|-------|------|---------------|-------|
| include_charges | boolean | true | Include charges in appeasement |
| appease_button | button | "APPEASE" | Action button |

#### Shipment Details

| Field | Type | Example Value | Notes |
|-------|------|---------------|-------|
| status | string | "DELIVERED" | Shipment status |
| tracking_number | string | "KNJ0202601016215" | Tracking number (clickable) |
| eta | date | "02/01/2026" | Estimated delivery date |
| shipped_on | date | "01/31/2026" | Actual ship date |
| release_number | string | "CDS2601301585931" | Release number |
| shipped_from | string | "Central World" | Fulfillment location |
| shipping_method | string | "Standard Delivery" | Shipping method |
| subdistrict | string | "ท่าทราย" | Delivery subdistrict |
| crc_tracking_link | url | "https://th.kex-express.com/th/track/?track=KNJ0202601016215" | External tracking URL |

#### Ship to Address

| Field | Type | Example Value | Notes |
|-------|------|---------------|-------|
| email | string | "Engzaa@gmail.com" | Delivery email |
| recipient_name | string | "ทัศนาวลัย กลิ่นเทียนฟุ้ง" | Recipient name (Thai) |
| address_line_1 | string | "134/466" | Address line 1 |
| address_line_2 | string | "-" | Address line 2 |
| address_line_3 | string | "-" | Address line 3 |
| city_province_postal | string | "เมืองนนทบุรี, นนทบุรี 11000, TH" | City, province, postal, country |
| allocation_type | string | "Delivery" | Allocation type |
| phone | string | "0624192696" | Contact phone |

#### Shipped Items

| Field | Type | Example Value | Notes |
|-------|------|---------------|-------|
| item_name | string | "Air Pure Compact PT2210T0 White" | Product name |
| sku | string | "CDS19598406" | SKU |
| shipped_qty | integer | 1 | Quantity shipped |
| ordered_qty | integer | 1 | Quantity ordered |
| uom | string | "PCS" | Unit of measure |

### In Process Shipments

| Field | Type | Example Value | Notes |
|-------|------|---------------|-------|
| count | integer | 0 | Number of in-process shipments |
| message | string | "NO SHIPMENTS ARE CURRENTLY IN PROCESS FOR THIS ORDER" | Empty state message |

### Planned Shipments

| Field | Type | Example Value | Notes |
|-------|------|---------------|-------|
| count | integer | 0 | Number of planned shipments |
| message | string | "NO SHIPMENTS ARE PLANNED FOR THIS ORDER" | Empty state message |

---

## Payments and Settlements

### Invoice Information

| Field | Type | Example Value | Notes |
|-------|------|---------------|-------|
| invoice_type | string | "Shipment" | Type of invoice |
| invoice_number | string | "17697739922881358120" | Unique invoice number |
| invoice_status | string | "Closed" | Invoice status |
| invoice_date | date | "01/30/2026" | Invoice date |
| invoice_amount | decimal | 2990.00 | Total invoice amount (฿) |

### Invoice Item Details

| Field | Type | Example Value | Notes |
|-------|------|---------------|-------|
| item_name | string | "Air Pure Compact PT2210T0 White" | Product name |
| sku | string | "CDS19598406" | SKU |
| qty | integer | 1 | Invoiced quantity |
| unit_price | decimal | 2990.00 | Unit price (฿) |
| subtotal | decimal | 2990.00 | Item subtotal (฿) |
| discount | decimal | 0.00 | Discount amount (฿) |
| charges | decimal | 0.00 | Additional charges (฿) |
| taxes | decimal | 0.00 | Tax amount (฿) |
| total | decimal | 2990.00 | Item total (฿) |
| informational_taxes | decimal | 195.61 | Informational tax (฿) |

### Settlement Transactions

#### Transaction 1: Credit Card

| Field | Type | Example Value | Notes |
|-------|------|---------------|-------|
| payment_method | string | "CREDIT_CARD" | Payment type |
| card_number | string | "528560XXXXXX1117" | Masked card number |
| transaction_date | datetime | "" | Transaction timestamp (empty) |
| amount_charged | decimal | 2490.00 | Amount settled (฿) |

#### Transaction 2: The1 Points

| Field | Type | Example Value | Notes |
|-------|------|---------------|-------|
| payment_method | string | "T1" | Payment type |
| member_id | string | "2002224934" | The1 member ID |
| transaction_date | date | "01/30/2026" | Transaction date |
| amount_charged | decimal | 500.00 | Points value settled (฿) |

### Settlement Summary

| Field | Type | Example Value | Notes |
|-------|------|---------------|-------|
| item_subtotal | decimal | 2990.00 | Items subtotal (฿) |
| total_discounts | decimal | 0.00 | Total discounts (฿) |
| total_charges | decimal | 0.00 | Total charges (฿) |
| total_taxes | decimal | 0.00 | Total taxes (฿) |
| shipment_total | decimal | 2990.00 | Shipment total (฿) |
| informational_taxes | decimal | 195.61 | Informational taxes (฿) |

---

## Data Type Definitions

### Enumerations

#### Order Status
- `DELIVERED`
- `IN_PROCESS`
- `PLANNED`
- `CANCELLED`
- etc.

#### Payment Status
- `PAID`
- `PENDING`
- `REFUNDED`
- etc.

#### Payment Type
- `CREDIT_CARD`
- `T1` (The1 loyalty points)
- `BANK_TRANSFER`
- `CASH`
- etc.

#### Invoice Status
- `Closed`
- `Open`
- `Cancelled`
- etc.

#### Invoice Type
- `Shipment`
- `Return`
- etc.

#### Allocation Type
- `Delivery`
- `Pickup`
- etc.

---

## Special Notes

1. **Multi-Payment Support**: This order demonstrates a split payment scenario with both credit card (฿2,490) and The1 loyalty points (฿500) totaling ฿2,990.

2. **Informational Taxes**: The system tracks "informational taxes" (฿195.61) separately from regular taxes, likely for VAT reporting purposes.

3. **Thai Language Support**: Many fields contain Thai text (customer names, addresses, etc.), requiring UTF-8 encoding.

4. **Masked Sensitive Data**: Credit card numbers and expiry dates are masked for security.

5. **Empty Fields**: Many optional fields are empty strings or null values (route, booking slots, promotion details, etc.).

6. **Timestamp Format**: All timestamps use format "MM/DD/YYYY HH:mm +07" (GMT+7 timezone).

7. **Currency**: All monetary values are in Thai Baht (฿).

8. **External Integration**: Includes external tracking link to Kerry Express (KEX) for shipment tracking.

9. **Fulfillment Info Modal**: A modal dialog exists for additional fulfillment and tracking status, but was empty in this order (possibly due to API errors).

10. **The1 Loyalty Integration**: Supports Central Group's The1 loyalty program for point redemption and member identification.

---

## API Integration Points

Based on the console logs and page structure, potential API endpoints include:

1. **Order Search**: `/order/api/order/order/search`
2. **Customer Engagement**: `/customerengagementfacade/api/fw/core/feature/invoked`
3. **Case Management**: `/cases/api/cases/caseConfig/configId/defaultConfig`
4. **External Tracking**: `https://th.kex-express.com/th/track/?track={tracking_number}`

---

## UI Components Observed

1. **Expansion Panels**: Used for shipment sections (COMPLETED, IN PROCESS, PLANNED, PAYMENTS)
2. **Modal Dialogs**: For additional information display (Fulfillment Info)
3. **Dropdown Menus**: For additional payment methods ("1 more")
4. **Badges**: For status indicators (DELIVERED, PAID)
5. **Interactive Links**: Tracking numbers are clickable
6. **Buttons**: Action buttons (APPEASE, MORE INFO)
7. **Empty States**: Messages when no data available
8. **Item Notes Counter**: Badge showing number of notes (currently 0)

---

## Data Validation Rules

1. **Order Number**: Format appears to be `CDS + YYMMDD + 6-digit sequence`
2. **Phone Number**: 10-digit Thai phone format
3. **Email**: Standard email validation
4. **The1 Member ID**: 10-digit numeric format
5. **Tax ID**: 13-digit Thai tax ID format
6. **Postal Code**: 5-digit Thai postal code
7. **Tracking Number**: Carrier-specific format (e.g., KNJ + 13 digits for KEX)

---

**End of Specification**
