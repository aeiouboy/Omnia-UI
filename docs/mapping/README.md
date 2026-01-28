# Order Management Field Mapping - Documentation Package

## 📋 Package Contents

This folder contains comprehensive field mapping documentation for the Omnia UI Order Management page.

### Files

| File | Size | Description |
|------|------|-------------|
| **order-management-field-mapping.csv** | 24KB | 135 fields mapped to database with all details in CSV format |
| **order-management-field-mapping.md** | 16KB | Complete field documentation with API examples, SQL schema, and implementation guides |
| **UI Checklist for OMS.xlsx** | 724KB | Source Excel document with complete OMS requirements (reference) |
| **README.md** | This file | Navigation guide for the mapping package |

---

## 🎯 Quick Summary

### Total Mapped Fields: **135**

#### Breakdown by Section:
- **Basic Filters**: 8 fields
  - Search, Order Status, Store No, Channel, Payment Status, Payment Method, Order Date From, Order Date To

- **Advanced Filters**: 6 fields
  - SKU, Item Name, Customer Name, Email, Phone, Order Type

- **Order List Table**: 16 columns
  - Order Number, Customer Name, Email, Phone, Order Total, Store No, Order Status, SLA Status, Return Status, On Hold, Order Type, Payment Status, Confirmed, Channel, Allow Substitution, Created Date

- **Order Detail View**: 105+ fields
  - Header Widget (4 fields)
  - Overview Tab - Customer Information (7 fields)
  - Overview Tab - Order Information (8+ fields)
  - Additional tabs: Audit Trail, Tracking, Payments, Fulfillment Timeline

---

## 📊 Mapping Type Distribution

| Mapping Type | Count | Percentage | Definition |
|---|---|---|---|
| **Direct** | 82 | 61% | 1:1 mapping from database column to display |
| **Fixed value** | 35 | 26% | Predefined enum/dropdown values |
| **Logic** | 18 | 13% | Calculated fields or conditional logic |

---

## 🔍 How to Use These Files

### 1. **For Quick Reference**: Use the CSV File
```bash
# View the CSV in your preferred tool (Excel, Google Sheets, etc.)
open docs/mapping/order-management-field-mapping.csv
```

**Use the CSV when:**
- You need to quickly find field mappings
- You're integrating with external systems
- You need a structured data format
- You're creating documentation for other teams

### 2. **For Detailed Understanding**: Use the Markdown File
```bash
# Read the markdown documentation
cat docs/mapping/order-management-field-mapping.md
```

**Use the markdown when:**
- You're implementing new features
- You need to understand business logic
- You're debugging field display issues
- You want to see code examples
- You need to understand database schema

### 3. **For Complete Requirements**: Reference the Excel
The source Excel file contains:
- UI design specifications
- Role-based access control
- SLA requirements
- LOV (List of Values) definitions
- Complete design mockups

---

## 📐 Field Mapping Types Explained

### Direct Mapping
**Definition**: Field directly from database column with minimal/no transformation

**Example**:
```
Field: Order ID
Database: order.order_id
Type: VARCHAR(255)
Display: W1156251121946800
```

**When to use**: Simple data that doesn't need calculation or conditional logic

---

### Fixed Value Mapping
**Definition**: Predefined constant values from enums or controlled dropdowns

**Example**:
```
Field: Order Status
Database: order.order_status
Fixed Values: PENDING, PROCESSING, DELIVERED, CANCELLED
Type: Fixed value
```

**When to use**: Fields with limited, predefined options

---

### Logic Mapping
**Definition**: Fields derived from database values using calculations or conditional rendering

**Example**:
```
Field: SLA Status
Calculation: IF elapsed_minutes > target_minutes THEN "BREACH" ELSE "LEFT"
Sample: "2m BREACH" or "3m LEFT"
Type: Logic (Calculated)
```

**When to use**: Fields requiring business logic, multiple fields, or calculations

---

## 🗄️ Database Schema Overview

### Primary Tables Referenced

| Table | Records | Purpose |
|---|---|---|
| **orders** | All order data | Order details, status, totals, payment info |
| **order_items** | Products in orders | SKU, product names, quantities |
| **customer** | Customer data | Names, emails, phones, customer type |
| **master_locations** | Store data | Store IDs, names, regions |

### Key Relationships
```
orders (1) ──→ (N) order_items
orders (1) ──→ (1) customer
orders (N) ──→ (1) master_locations
```

---

## 🔗 API Integration

### Order List Endpoint
```
GET /api/orders
```

**Supported Query Parameters**:
- `page` - Page number (default: 1)
- `pageSize` - Records per page (default: 25)
- `searchTerm` - Multi-field search
- `status` - Order status filter
- `channel` - Selling channel filter
- `businessUnit` - Business unit filter
- `paymentStatus` - Payment status filter
- `paymentMethod` - Payment method filter
- `orderType` - Order type filter
- `storeNo` - Store number filter
- `dateFrom` - Date range start
- `dateTo` - Date range end

---

## 💾 CSV Format Specification

### Column Definitions

| Column | Example | Purpose |
|--------|---------|---------|
| No | 1 | Unique sequential row number |
| Module | Order Management | System module |
| Page | Order Management | Page name |
| Sub-Page | Filtering | Section within page |
| Session | Basic Filters | Filter group or detail section |
| Field | Search | Field display name |
| Description | Search by order #, customer name, email, phone | What the field does |
| DataType | VARCHAR(255) | Database data type |
| Mapping_Type | Logic | Type of field mapping |
| Mapping_APIs_Database_Table | order, customer | Source table(s) |
| Mapping_Field_Name | order_id, customer_name, customer_email, customer_phone | Actual database column(s) |
| Sample_Value | W1156251121946800 | Example value |
| Remark | Multi-field search with LIKE operator | Additional notes |

### CSV Statistics
- **Total Records**: 135
- **Columns**: 13
- **File Size**: 24KB
- **Encoding**: UTF-8 with BOM

---

## 🎨 Field Formatting Reference

### Currency Format
- Symbol: Thai Baht (฿)
- Separator: Comma (,)
- Examples: `฿933`, `฿1,289.68`, `฿20,300`
- Decimals: 2 (stored as DECIMAL(18,4) in DB)

### Date/Time Format
- Timezone: GMT+7 (Asia/Bangkok)
- Display Format: `MM/DD/YYYY HH:mm:ss`
- Examples: `11/21/2025 10:42:00`, `01/19/2026 02:03:47`

### SLA Status Format
- Format: `{time} {STATUS}`
- Breach: `2m BREACH` (red badge)
- Near Breach: `3m LEFT` (orange badge)
- Compliant: `-` (hidden/green)

### Boolean Display
- `true` / `1` → "Yes"
- `false` / `0` → "No"

---

## 🔐 Security & Validation

### Input Validation
- **Search**: Multi-field LIKE with SQL injection prevention
- **Dates**: ISO 8601 format validation
- **Enum values**: Against predefined LOV tables
- **Numeric**: DECIMAL(18,4) precision validation

### Authorization
- Filter results based on user role and organization
- Restrict store numbers by location access
- Filter channels by business unit access

---

## 📈 Statistics & Metrics

### Field Count by Type
- **Filtering Fields**: 14 (8 basic + 6 advanced)
- **Display Columns**: 16 (table columns)
- **Detail Fields**: 105+ (order detail view)

### Data Type Distribution
- VARCHAR/VARCHAR(n): 72 fields (53%)
- DECIMAL/NUMERIC: 12 fields (9%)
- TIMESTAMP: 18 fields (13%)
- BOOLEAN: 20 fields (15%)
- JSONB: 5 fields (4%)
- Other: 8 fields (6%)

### Mapping Source Distribution
- **orders table**: 98 fields (73%)
- **order_items table**: 8 fields (6%)
- **customer table**: 15 fields (11%)
- **master_locations table**: 4 fields (3%)
- **Calculated/Logic**: 10 fields (7%)

---

## 🚀 Implementation Tips

### 1. **Building Filters**
- Use Direct mapping for simple field filters
- Use Fixed value mapping for dropdown filters
- Use Logic mapping for complex filters (date ranges, multi-field)

### 2. **Displaying Data**
- Apply currency formatting to DECIMAL fields
- Convert timestamps to GMT+7 timezone
- Convert boolean to "Yes"/"No" display
- Use special formatting for SLA Status (time + status badge)

### 3. **API Calls**
- Include required parameters: page, pageSize
- Use filter parameters that match Mapping_Field_Name
- Handle pagination in response (total, page, pageSize)
- Implement error handling for failed requests

### 4. **Database Queries**
- Use snake_case column names (e.g., order_id, created_at)
- Convert to camelCase in JavaScript (e.g., orderId, createdAt)
- Apply timezone conversion for timestamp fields
- Use LIKE for multi-field search, = for enum fields

---

## 🔄 Related Documentation

- **Component**: `src/components/order-management-hub.tsx`
- **API Route**: `app/api/orders/route.ts`
- **Types**: `src/types/` (order, payment, delivery, audit)
- **Utils**: `src/lib/` (order-utils, currency-utils, timezone-utils)
- **Hooks**: `src/hooks/use-order-summary.ts`, `use-order-analysis.ts`

---

## 📝 Document Information

- **Version**: 1.0
- **Created**: 2026-01-20
- **Last Updated**: 2026-01-20
- **Source**: UI Checklist for OMS.xlsx + Playwright Snapshots
- **Total Fields Documented**: 135
- **Data Quality**: ✅ Verified against actual application

---

## ✅ Validation Checklist

- [x] All 16 table columns documented
- [x] All 8 basic filters documented
- [x] All 6 advanced filters documented
- [x] All database mappings verified
- [x] All API parameters documented
- [x] All data types specified
- [x] All sample values provided
- [x] CSV export created and validated
- [x] Markdown documentation complete
- [x] Schema references included
- [x] Field formatting rules documented
- [x] Implementation examples provided

---

## 📞 Questions?

For questions about specific fields, refer to:
1. **CSV**: Quick lookup of field-to-database mappings
2. **Markdown**: Detailed implementation guidance and examples
3. **Source Excel**: Original requirements and design specifications

---

**Generated**: 2026-01-20
**Total Effort**: Comprehensive mapping of entire Order Management module
**File Format Compatibility**: Excel, Google Sheets, CSV readers, Markdown viewers

