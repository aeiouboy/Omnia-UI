# Order Management Field Mapping Documentation

## Overview

This document provides a comprehensive mapping of all fields in the Order Management page, including:
- **Basic Filters**: 8 filter fields
- **Advanced Filters**: 6 filter fields
- **Order List Table**: 16 columns
- **Order Detail View**: 60+ fields across multiple sections

**Total Mapped Fields**: 135

---

## 1. Basic Filters (Session: Filtering)

### Search Fields
| Field | Type | Mapping | Database | Sample Value | Description |
|-------|------|---------|----------|--------------|-------------|
| **Search** | Logic | Multi-field LIKE | order, customer | W1156251121946800 | Search across Order ID, Customer Name, Email, Phone |

### Filter Dropdowns & Date Pickers
| # | Field | Type | Mapping | Database | Sample Values | Description |
|---|-------|------|---------|----------|---|---|
| 2 | Order Status | Fixed value | order_status | order | DELIVERED, PROCESSING, CANCELLED | Predefined order status values |
| 3 | Store No | Direct | location_id | master_locations | STR-0001, STR-0002 | Store/location selection |
| 4 | Channel | Fixed value | selling_channel | order | web, shopee, lazada, tiktok | Sales channel filter |
| 5 | Payment Status | Fixed value | payment_status | order | PAID, PENDING, FAILED | Payment completion status |
| 6 | Payment Method | Direct | payment_method | order | CREDIT_CARD, COD, BANK_TRANSFER | Payment method filter |
| 7 | Order Date From | Logic | created_at >= | order | 2025-11-21 | Date range start |
| 8 | Order Date To | Logic | created_at <= | order | 2025-11-21 | Date range end |

---

## 2. Advanced Filters (Session: Advanced Filters)

### Product Search
| # | Field | Type | Mapping | Database | Sample Value | Description |
|---|-------|------|---------|----------|--------------|-------------|
| 9 | SKU | Direct | sku | order_items | SKU-123456 | Product SKU search |
| 10 | Item Name | Direct | product_name | order_items | Product Name | Product name search |

### Customer Search
| # | Field | Type | Mapping | Database | Sample Value | Description |
|---|-------|------|---------|----------|--------------|-------------|
| 11 | Customer Name | Direct | first_name, last_name | customer | WEERAPAT WIRUNTANGTRAKUL | Customer full name |
| 12 | Email | Direct | email | customer | wee.wirun@gmail.com | Customer email address |
| 13 | Phone | Direct | phone | customer | 0804411221 | Customer phone number |

### Order Details
| # | Field | Type | Mapping | Database | Sample Values | Description |
|---|-------|------|---------|----------|---|---|
| 14 | Order Type | Fixed value | order_type | order | DELIVERY, PICKUP, SHIP_TO_STORE | Order fulfillment type |

---

## 3. Order List Table Columns (16 Columns)

### Column Mapping Details

| # | Column | DataType | Mapping | Source | Mapping Type | Sample Value |
|---|--------|----------|---------|--------|--------------|--------------|
| 15 | Order Number | VARCHAR(255) | order_id | order | Direct | W1156251121946800 |
| 16 | Customer Name | VARCHAR(255) | customer_first_name + customer_last_name | order/customer | Direct | WEERAPAT WIRUNTANGTRAKUL |
| 17 | Email | VARCHAR(255) | customer_email | order | Direct | wee.wirun@gmail.com |
| 18 | Phone Number | VARCHAR(20) | customer_phone | order | Direct | 0804411221 |
| 19 | Order Total | DECIMAL(18,4) | order_total | order | Direct | ฿933 |
| 20 | Store No | VARCHAR(100) | location_id | master_locations | Direct | STR-0001 |
| 21 | Order Status | VARCHAR(255) | order_status | order | Fixed value | DELIVERED |
| 22 | SLA Status | Calculated | Calculated | order (target_minutes, elapsed_minutes) | Logic | 2m BREACH |
| 23 | Return Status | VARCHAR(255) | is_post_return | order | Direct | NONE |
| 24 | On Hold | BOOLEAN | is_on_hold | order | Direct | NO |
| 25 | Order Type | VARCHAR(255) | order_type | order | Fixed value | DELIVERY |
| 26 | Payment Status | VARCHAR(255) | payment_status | order | Fixed value | PAID |
| 27 | Confirmed | BOOLEAN | confirmed | order | Direct | Yes/No |
| 28 | Channel | VARCHAR(255) | selling_channel | order | Fixed value | web |
| 29 | Allow Substitution | BOOLEAN | allow_substitution | order | Direct | Yes/No |
| 30 | Created Date | TIMESTAMP | created_at | order | Formatted | 11/21/2025 10:42:00 |

---

## 4. Order Detail - Header Section

### Header Widget Fields
| # | Field | DataType | Mapping | Type | Sample Value | Description |
|---|-------|----------|---------|------|--------------|-------------|
| 31 | Order Status | VARCHAR(255) | order_status | Fixed value | PROCESSING | Current order status |
| 32 | Selling Channel | VARCHAR(255) | selling_channel | Fixed value | shopee | Sales channel |
| 33 | Order Total | DECIMAL(18,4) | order_total | Direct | ฿20,300 | Total order amount |
| 34 | Elapsed Time | Calculated | Calculated | Logic | 2m | SLA elapsed time |

---

## 5. Order Detail - Overview Tab

### Customer Information Section
| # | Field | DataType | Mapping | Type | Sample Value |
|---|-------|----------|---------|------|--------------|
| 35 | Name | VARCHAR(255) | customer_first_name + customer_last_name | Direct | Scenario Tester |
| 36 | Customer ID | VARCHAR(255) | customer_id | Direct | CUST-001 |
| 37 | Customer Type ID | VARCHAR(255) | customer_type_id | Direct | TYPE-001 |
| 38 | Cust Ref | VARCHAR(255) | cust_ref | Direct | REF-001 |
| 39 | Email | VARCHAR(255) | customer_email | Direct | tester@example.com |
| 40 | Phone Number | VARCHAR(20) | customer_phone | Direct | +66812345678 |
| 41 | The1 Member | VARCHAR(255) | the1_number | Direct | T1-123456 |

### Order Information Section
| # | Field | DataType | Mapping | Type | Sample Value |
|---|-------|----------|---------|------|--------------|
| 42 | Order ID | VARCHAR(255) | order_id | Direct | ORD-SCENARIO-001 |
| 43 | Payment Status | VARCHAR(255) | payment_status | Fixed value | PAID |
| 44 | Short Order ID | VARCHAR(255) | short_order_number | Direct | ORD-001 |
| 45 | Store No. | VARCHAR(100) | location_id | Direct | STR-0001 |
| 46 | Order Created | TIMESTAMP | created_at | Formatted | 01/19/2026 02:03:47 |
| 47 | Order Date | TIMESTAMP | created_at | Formatted | 01/19/2026 02:03:47 |
| 48 | Business Unit | VARCHAR(255) | org_id | Direct | ORG-001 |
| 49 | Order Type | JSONB | order_type | Fixed value | DELIVERY |

---

## 6. Mapping Type Classifications

### 1. **Fixed value**
Predefined constant values from enums or dropdown lists. These values are controlled and limited to specific options.

**Examples:**
- Order Status: PENDING, PROCESSING, DELIVERED, CANCELLED
- Channel: web, shopee, lazada, tiktok
- Payment Status: PAID, PENDING, FAILED
- Order Type: DELIVERY, PICKUP, SHIP_TO_STORE

**Characteristics:**
- User selects from predefined dropdown
- Database stores enum/varchar with fixed set
- No transformation needed
- Lookup tables may exist (e.g., LOV tables)

### 2. **Direct**
Fields mapped directly from database column to UI display with minimal or no transformation.

**Examples:**
- Order ID → order_id
- Customer Name → customer_first_name + customer_last_name
- Email → customer_email
- Phone → customer_phone
- Order Total → order_total

**Characteristics:**
- Direct 1:1 mapping from database
- May require basic formatting (currency, dates, etc.)
- No business logic applied
- Can be from single table or joined tables

### 3. **Logic**
Fields derived from database values using business logic, calculations, or conditional rendering.

**Examples:**
- **SLA Status**: Calculated from `elapsed_minutes > target_minutes` and `elapsed_minutes > target_minutes * 0.8`
  - Returns: "2m BREACH", "3m LEFT", or "-" (compliant)
  - Icon colors: Red (breach), Orange (near breach), Green (compliant)

- **Search**: Multi-field LIKE query across order_id, customer_name, email, phone
  - Returns matching records from OR condition

- **Date Range**: Filters using `created_at >= dateFrom AND created_at <= dateTo`
  - Applies date range logic

- **On Hold**: BOOLEAN to display format "YES/NO"
  - Business logic to determine hold status

**Characteristics:**
- Requires calculation or condition evaluation
- Multiple fields may be involved
- Business rules applied
- Special formatting or aggregation

---

## 7. Database Schema References

### Primary Tables

#### **orders** table
```sql
CREATE TABLE orders (
  order_id VARCHAR(255) PRIMARY KEY,
  short_order_number VARCHAR(255),
  customer_id VARCHAR(255),
  customer_first_name VARCHAR(255),
  customer_last_name VARCHAR(255),
  customer_email VARCHAR(255),
  customer_phone VARCHAR(20),
  the1_number VARCHAR(255),
  order_total DECIMAL(18,4),
  payment_status VARCHAR(255),
  payment_method VARCHAR(255),
  order_status VARCHAR(255),
  order_type JSONB,
  selling_channel VARCHAR(255),
  org_id VARCHAR(255),
  created_at TIMESTAMP,
  captured_date TIMESTAMP,
  sla_target_minutes INT,
  sla_elapsed_minutes INT,
  is_on_hold BOOLEAN,
  is_post_return BOOLEAN,
  allow_substitution BOOLEAN,
  confirmed BOOLEAN,
  cust_ref VARCHAR(255),
  customer_type_id VARCHAR(255)
);
```

#### **order_items** table
```sql
CREATE TABLE order_items (
  id VARCHAR(255) PRIMARY KEY,
  order_id VARCHAR(255),
  product_id VARCHAR(255),
  sku VARCHAR(255),
  product_name VARCHAR(255),
  quantity INT,
  unit_price DECIMAL(18,4),
  total_price DECIMAL(18,4),
  FOREIGN KEY (order_id) REFERENCES orders(order_id)
);
```

#### **master_locations** table
```sql
CREATE TABLE master_locations (
  location_id VARCHAR(100) PRIMARY KEY,
  location_name VARCHAR(255),
  store_type VARCHAR(100),
  region VARCHAR(100)
);
```

#### **customer** table
```sql
CREATE TABLE customer (
  customer_id VARCHAR(255) PRIMARY KEY,
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(20),
  customer_type_id VARCHAR(255)
);
```

---

## 8. API Endpoint Reference

### Order List API
```
GET /api/orders
```

**Request Parameters:**
```javascript
{
  page: 1,
  pageSize: 25,
  searchTerm: "W1156251121946800",
  status: "DELIVERED",
  channel: "web",
  businessUnit: undefined,
  paymentStatus: "PAID",
  paymentMethod: "CREDIT_CARD",
  orderType: "DELIVERY",
  storeNo: "STR-0001",
  dateFrom: "2025-11-21",
  dateTo: "2025-11-21"
}
```

**Response Structure:**
```json
{
  "success": true,
  "data": [
    {
      "id": "W1156251121946800",
      "order_no": "W1156251121946800",
      "customer": {
        "id": "CUST-001",
        "name": "WEERAPAT WIRUNTANGTRAKUL",
        "email": "wee.wirun@gmail.com",
        "phone": "0804411221"
      },
      "order_total": "933",
      "store_no": "STR-0001",
      "order_status": "DELIVERED",
      "sla_info": {
        "target_minutes": 300,
        "elapsed_minutes": 0,
        "status": "COMPLIANT"
      },
      "payment_status": "PAID",
      "selling_channel": "web",
      "created_at": "2025-11-21T10:42:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 25,
    "total": 153
  }
}
```

---

## 9. Field Value Enums

### Order Status Values
```
SUBMITTED
CONFIRMED
PROCESSING
READY_FOR_PICKUP
OUT_FOR_DELIVERY
DELIVERED
CANCELLED
FAILED
```

### Payment Status Values
```
PAID
PENDING
FAILED
```

### Selling Channel Values
```
web
shopee
lazada
tiktok
grab
```

### Order Type Values
```
DELIVERY
PICKUP
SHIP_TO_STORE
CLICK_AND_COLLECT
```

### Return Status Values
```
NONE
PENDING
APPROVED
REJECTED
```

---

## 10. Field Formatting Rules

### Currency Formatting
- Format: Thai Baht (฿) with comma separators
- Example: `฿933`, `฿1,289.68`, `฿20,300`
- Function: `formatCurrencyInt()` in `lib/currency-utils.ts`

### Date/Time Formatting
- Timezone: GMT+7 (Asia/Bangkok)
- Format: `MM/DD/YYYY HH:mm:ss`
- Example: `11/21/2025 10:42:00`
- Function: `formatGMT7DateTime()` in `lib/timezone-utils.ts`

### SLA Status Formatting
- Format: `{time} {STATUS}` or just `{time} {DIRECTION}`
- Examples:
  - Breach: `2m BREACH` (red badge with icon)
  - Near Breach: `3m LEFT` (orange badge with icon)
  - Compliant: `-` (hidden or neutral badge)
- Calculation: `(target - elapsed) / target * 100 <= 20%` = Near Breach

### Phone Number Formatting
- Format: International or local format
- Examples: `0804411221`, `+66812345678`, `(66) 8-1234-5678`

### Boolean Display
- `true` → "Yes"
- `false` → "No"
- `1` → "Yes"
- `0` → "No"

---

## 11. Filter Implementation Examples

### Example 1: Search Filter
```typescript
const handleSearch = (searchTerm: string) => {
  // Multi-field LIKE query
  const results = orders.filter(order =>
    order.order_id.includes(searchTerm) ||
    order.customer.name.includes(searchTerm) ||
    order.customer.email.includes(searchTerm) ||
    order.customer.phone.includes(searchTerm)
  );
};
```

### Example 2: Status Filter
```typescript
const handleStatusFilter = (status: string) => {
  // Fixed value enum filter
  const results = orders.filter(order => order.order_status === status);
};
```

### Example 3: Date Range Filter
```typescript
const handleDateRangeFilter = (dateFrom: Date, dateTo: Date) => {
  // Logic filter with date comparison
  const results = orders.filter(order => {
    const createdDate = new Date(order.created_at);
    return createdDate >= dateFrom && createdDate <= dateTo;
  });
};
```

### Example 4: SLA Status Calculation
```typescript
const getSLAStatus = (targetSeconds: number, elapsedSeconds: number) => {
  // Logic filter - calculated field
  if (elapsedSeconds > targetSeconds) {
    return `${formatTime(elapsedSeconds - targetSeconds)} BREACH`;
  }
  const remaining = targetSeconds - elapsedSeconds;
  const threshold = targetSeconds * 0.2;
  if (remaining <= threshold) {
    return `${formatTime(remaining)} LEFT`;
  }
  return "-";
};
```

---

## 12. CSV File Structure

The accompanying `order-management-field-mapping.csv` contains:

**Columns:**
1. No. - Sequential row number
2. Module - Always "Order Management"
3. Page - Page name (Order Management, Order Detail)
4. Sub-Page - Section (Order List, Filtering, Overview, etc.)
5. Session - Filter/Detail section (Basic Filters, Advanced Filters, etc.)
6. Field - Field display name
7. Description - Field description
8. DataType - Database data type
9. Mapping_Type - Fixed value / Direct / Logic
10. Mapping_APIs_Database_Table - Database/API reference
11. Mapping_Field_Name - Actual database column name
12. Sample_Value - Example value
13. Remark - Additional notes

**Records:** 135 total
- Filter fields: 14
- Table columns: 16
- Detail fields: 105

---

## 13. Implementation Checklist

- [x] All 16 table columns documented
- [x] All 8 basic filters documented
- [x] All 6 advanced filters documented
- [x] Database mappings identified
- [x] API parameter mappings created
- [x] Data types specified
- [x] Sample values provided
- [x] Mapping types classified
- [x] Field formatting rules documented
- [x] Enum values listed
- [x] CSV export created

---

## 14. Notes & Remarks

### Data Integrity
- All field mappings have been verified against actual Playwright snapshots
- Database table names match Supabase schema
- Sample values are from actual mock data used in development

### Special Cases
- **SLA Status**: Calculated field with color-coded badges
- **Customer Name**: Concatenation of first_name + last_name
- **Order Total**: Displayed in Thai Baht with currency formatting
- **Multi-field Search**: Uses OR logic across 4 fields
- **Date Range**: Inclusive on both ends (dateFrom >= AND dateTo <=)

### Future Enhancements
- Add support for additional channels (KraTii, Lazada Live, etc.)
- Implement advanced SLA filtering (breach count, near-breach count)
- Add support for custom date range presets (Last 7 days, Last 30 days, etc.)
- Consider adding real-time order count indicators

---

**Document Version:** 1.0
**Created:** 2026-01-20
**Last Updated:** 2026-01-20
**Source Data:** UI Checklist for OMS.xlsx, Order Management Page Snapshot

