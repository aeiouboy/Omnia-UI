# Inventory Supply Field Mapping Documentation

**Status**: ✅ **COMPREHENSIVE** - All 26 Fields Documented

**Page URL**: `/inventory-new/supply`
**Navigation**: Inventory Management → Inventory Availability (Supply View)

---

## 📋 Overview

This document provides complete field mapping for the **Inventory Supply** page in the Omnia UI Inventory Management module. This page enables detailed stock-level querying across stores and products with advanced filtering and sorting capabilities.

---

## 📊 Field Count Summary

| Component | Fields | Status |
|-----------|--------|--------|
| **Page Header** | 2 | ✅ |
| **Search Filters** | 6 | ✅ |
| **Filter Controls** | 2 | ✅ |
| **Validation** | 1 | ✅ |
| **Results Table Columns** | 7 | ✅ |
| **Pagination & Count** | 1 | ✅ |
| **Sorting** | 1 | ✅ |
| **Empty States** | 3 | ✅ |
| **Page Interactions** | 2 | ✅ |
| **Data Types & Formatting** | 1 | ✅ |
| **TOTAL** | **26** | ✅ **COMPLETE** |

---

## 1. Page Header (2 Fields)

| # | Field | Type | Mapping | Sample | Description |
|---|-------|------|---------|--------|-------------|
| 1 | Page Title | VARCHAR(255) | Fixed value | Inventory Availability | Main heading of the page |
| 2 | Page Description | VARCHAR(500) | Fixed value | View and manage inventory supply levels across all stores and items | Subtitle describing page purpose |

**Implementation**:
- Title: h1 heading, bold font
- Description: Subtitle text below title, muted color
- Indicates this is the supply inventory view for all stores and products

---

## 2. Search Filters (6 Fields)

### Store Search Group (2 Fields)

| # | Field | Type | Mapping | Sample |
|---|-------|------|---------|--------|
| 3 | Search Store ID | VARCHAR(50) | Direct | CFR1819 |
| 4 | Search Store Name | VARCHAR(255) | Direct | Tops Central World |

**Mapping Details**:
- **Store ID**: Maps to `location_id` from `master_locations` table
- **Store Name**: Maps to `location_name` from `master_locations` table

**Input Specifications**:
- Both fields: Text input, min-width 160px
- Placeholder text provided for guidance
- Case-insensitive partial matching supported
- Used with OR logic (either field can trigger search)

### Product Search Group (2 Fields)

| # | Field | Type | Mapping | Sample |
|---|-------|------|---------|--------|
| 5 | Search Product ID | VARCHAR(100) | Direct | PROD-001 |
| 6 | Search Product Name | VARCHAR(256) | Direct | Betagen Fermented Milk 400ml |

**Mapping Details**:
- **Product ID**: Maps to `product_id` from `pim_master_product_base_info` table
- **Product Name**: Maps to `product_name` from `pim_master_product_base_info` table

**Input Specifications**:
- Both fields: Text input, min-width 160px
- Placeholder text for user guidance
- Bilingual support (English product names)
- Partial matching supported

### Dropdown Filters (2 Fields)

| # | Field | Type | Mapping | Options |
|---|-------|------|---------|---------|
| 7 | Supply Type Filter | VARCHAR(50) | Fixed value | All Supply Types, On Hand, Pre-Order |
| 8 | View Type Filter | VARCHAR(255) | Fixed value | All View Types, ECOM-TH-CFR-LOCD-STD, ECOM-TH-CFR-LOCD-MKP, MKP-TH-CFR-LOCD-STD, ECOM-TH-DSS-NW-STD, ECOM-TH-DSS-LOCD-EXP |

**Supply Type Options**:
```
- All Supply Types (default, value: "all")
- On Hand (value: "On Hand Available")
- Pre-Order (value: "Pre-Order")
```

**View Type Options**:
```
- All View Types (default, value: "all")
- ECOM-TH-CFR-LOCD-STD - CFR - TOL Channel (TOL)
- ECOM-TH-CFR-LOCD-MKP - CFR - MKP Channel (MKP)
- MKP-TH-CFR-LOCD-STD - CFR - QC Channel (QC)
- ECOM-TH-DSS-NW-STD - DS - Standard Delivery & Pickup (STD)
- ECOM-TH-DSS-LOCD-EXP - DS - 3H Delivery & 1H Pickup (EXP)
```

**Dropdown Specifications**:
- Supply Type: min-width 160px
- View Type: fixed width 280px (prevents layout shift)
- Both support multi-value filtering with AND logic

---

## 3. Filter Controls (2 Fields)

| # | Field | Type | Interaction |
|---|-------|------|-------------|
| 9 | Refresh Button | N/A | Refreshes data with current filter values |
| 10 | Clear All Button | N/A | Clears all search inputs and dropdowns |

**Button Specifications**:
- **Refresh**: Icon button with refresh icon, triggers immediate data reload
- **Clear All**: Disabled state when no filters applied, enabled when filters active
- Provides explicit user control over filtering

---

## 4. Validation Logic (1 Field)

| # | Field | Type | Logic |
|---|-------|------|-------|
| 11 | Search Requirement | BOOLEAN | At least one search field must contain a value |

**Validation Behavior**:
- Page shows message: "Please enter a Store ID, Store Name, Product ID, or Item Name to search inventory"
- Additional guidance: "Use the search fields above to find inventory data"
- Data fetching is blocked until requirement satisfied
- Prevents "no criteria" queries on large dataset

---

## 5. Results Table (7 Columns)

### Table Structure

| # | Column | Type | Mapping | Sortable | Display |
|---|--------|------|---------|----------|---------|
| 12 | Store ID | VARCHAR(50) | Direct | ↑↓ Yes | CFR1819 |
| 13 | Store Name | VARCHAR(255) | Direct | ✗ No | Tops Central World |
| 14 | Product ID | VARCHAR(100) | Direct | ↑↓ Yes | PROD-001 |
| 15 | Product Name | VARCHAR(256) | Direct | ✗ No | Betagen Fermented Milk 400ml |
| 16 | Total Qty | INTEGER | Direct | ↑↓ Yes | 42 |
| 17 | Available Qty | INTEGER | Logic | ↑↓ Yes | 35 |
| 18 | Supply Type | VARCHAR(50) | Direct | ↑↓ Yes | On Hand |

### Column Details

**Store ID** (Column 12):
- Database: `master_locations.location_id`
- Format: Alphanumeric code (e.g., CFR1819)
- Style: Font-medium, text-sm
- Sortable: Yes, with ↑↓ indicators
- Purpose: Unique store identifier

**Store Name** (Column 13):
- Database: `master_locations.location_name`
- Format: Full store name with Tops branding
- Style: text-sm, text-muted-foreground, whitespace-nowrap
- Sortable: No
- Purpose: Human-readable store reference

**Product ID** (Column 14):
- Database: `pim_master_product_base_info.product_id`
- Format: Monospace alphanumeric (e.g., PROD-001)
- Style: font-mono, text-xs, text-muted-foreground
- Sortable: Yes, with ↑↓ indicators
- Purpose: Unique product identifier

**Product Name** (Column 15):
- Database: `pim_master_product_base_info.product_name`
- Format: Full product description in English
- Style: text-sm
- Sortable: No
- Purpose: Human-readable product reference

**Total Qty** (Column 16):
- Database: `inv_master_stock.current_stock`
- Format: Number with comma separators (e.g., 1,042)
- Style: Right-aligned, badge with muted background
- Sortable: Yes, with ↑↓ indicators
- Purpose: Total physical inventory count

**Available Qty** (Column 17):
- Database Calculation: `inv_master_stock.available_stock` = `current_stock - reserved_stock`
- Format: Number with comma separators, color-coded badge
- Style: Right-aligned
- **Color Coding**:
  - Green (bg-green-100 text-green-800) when availableStock > 0
  - Red (bg-red-100 text-red-800) when availableStock = 0
- Sortable: Yes, with ↑↓ indicators
- Purpose: Stock available for sale (excluding reserved items)

**Supply Type** (Column 18):
- Database: `inv_master_stock.supply_type`
- Format: Rounded pill badge, text-xs, font-medium
- **Color Coding**:
  - Yellow (bg-yellow-100 text-yellow-800) for "Pre-Order"
  - Blue (bg-blue-100 text-blue-800) for "On Hand"
- Sortable: Yes, with ↑↓ indicators
- Purpose: Inventory classification (immediate vs. future availability)

---

## 6. Pagination & Results Count (1 Field)

| # | Field | Type | Display Format |
|---|-------|------|-----------------|
| 19 | Results Count | VARCHAR(100) | Showing X of Y products |

**Sample Values**:
```
Showing 30 of 199 products
Showing 1 of 1 product
Showing 0 of 0 products
```

**Location**: Footer of results table
**Purpose**: Inform user of filtered vs. total record counts
**Calculation**: Dynamic count of filtered records vs. total available records

---

## 7. Sorting (1 Field)

| # | Field | Type | Supported Columns |
|---|-------|------|-------------------|
| 20 | Sortable Columns | VARCHAR(100) | Store ID, Product ID, Total Qty, Available Qty, Supply Type |

**Sort Behavior**:
- Click column header to toggle sort direction (ascending ↑ / descending ↓)
- Non-sortable columns: Store Name, Product Name (cannot be used for sorting)
- Sort indicators show current direction visually
- Default sort order: Not specified (display order depends on data source)

---

## 8. Empty States (3 Fields)

### No Results Message

| # | Field | Display |
|---|-------|---------|
| 21 | No Results | No inventory records found matching your search criteria. Please try different search terms. |

**Trigger**: Search executed but returned zero records

### Initial Search Message

| # | Field | Display |
|---|-------|---------|
| 22 | Initial Message | Please enter a Store ID, Store Name, Product ID, or Item Name to search inventory |

**Trigger**: Page load or all filters cleared, no search criteria entered

### Search Instructions

| # | Field | Display |
|---|-------|---------|
| 23 | Instructions | Use the search fields above to find inventory data |

**Trigger**: Shown alongside initial message for user guidance

---

## 9. Page Interactions (2 Fields)

| # | Field | Type | Value | Purpose |
|---|-------|------|-------|---------|
| 24 | Debounce Duration | INTEGER | 400ms | Delay before filter triggers fetch |
| 25 | Page Size | INTEGER | 2000 | Client-side fetch limit |

**Interaction Details**:
- **Debouncing**: 400 milliseconds wait after user stops typing before API call executes
- **Pagination**: Fetches up to 2000 records then filters client-side
- **Performance**: Reduces server load during rapid filter changes
- **UX**: "Loading..." indicator shown during debounce and fetch

---

## 10. Data Types & Formatting (1 Field)

| # | Field | Type | Format | Example |
|---|-------|------|--------|---------|
| 26 | Stock Display Format | VARCHAR(50) | Number with locale-specific comma separators | 1,000 |

**Formatting Rules**:
- Numbers above 999 display with comma separators
- Locale-aware formatting (uses `toLocaleString()`)
- Applied to: Total Qty, Available Qty columns
- Improves readability for large stock numbers

---

## 🗄️ Database Schema References

### Primary Tables

#### **master_locations**
```sql
CREATE TABLE master_locations (
  location_id VARCHAR(4) PRIMARY KEY,
  location_name VARCHAR(255),
  store_type VARCHAR(100),
  region VARCHAR(100),
  address VARCHAR(500)
);
```
**Used for**: Store ID and Store Name columns

#### **pim_master_product_base_info**
```sql
CREATE TABLE pim_master_product_base_info (
  product_id VARCHAR(255) PRIMARY KEY,
  product_name VARCHAR(256),
  barcode VARCHAR(13),
  image_url VARCHAR(256),
  brand_id VARCHAR(255),
  category_id VARCHAR(80),
  is_sold_by_weight BOOLEAN,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```
**Used for**: Product ID and Product Name columns

#### **inv_master_stock**
```sql
CREATE TABLE inv_master_stock (
  stock_id VARCHAR(255) PRIMARY KEY,
  product_id VARCHAR(255),
  location_id VARCHAR(4),
  current_stock INTEGER,
  available_stock INTEGER,
  reserved_stock INTEGER,
  safety_stock INTEGER,
  supply_type VARCHAR(50),
  view_type VARCHAR(255),
  last_updated TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES pim_master_product_base_info(product_id),
  FOREIGN KEY (location_id) REFERENCES master_locations(location_id)
);
```
**Used for**: Stock quantities, Supply Type, and View Type filtering

---

## 🔗 API Integration

### Search Endpoint
```
GET /api/inventory/supply?
  storeId={storeId}&
  storeName={storeName}&
  productId={productId}&
  productName={productName}&
  supplyType={supplyType}&
  viewType={viewType}&
  pageSize=2000
```

**Query Parameters**:
```javascript
{
  storeId: "CFR1819",           // Store ID search (partial match)
  storeName: "Tops Central",    // Store Name search (partial match)
  productId: "PROD-",           // Product ID search (partial match)
  productName: "Betagen",       // Product Name search (partial match)
  supplyType: "On Hand Available",  // Fixed value from dropdown
  viewType: "ECOM-TH-CFR-LOCD-STD", // Organization/channel code
  pageSize: 2000                // Client-side fetch limit
}
```

**Response Structure**:
```json
{
  "success": true,
  "data": [
    {
      "id": "INV-001",
      "storeId": "CFR1819",
      "storeName": "Tops Central World",
      "productId": "PROD-001",
      "productName": "Betagen Fermented Milk 400ml",
      "currentStock": 42,
      "availableStock": 35,
      "reservedStock": 7,
      "supplyType": "On Hand",
      "viewType": "ECOM-TH-CFR-LOCD-STD"
    }
  ],
  "pagination": {
    "total": 199,
    "currentPage": 1,
    "pageSize": 2000
  }
}
```

---

## 📋 Field Mapping Type Breakdown

| Type | Count | % | Examples |
|------|-------|---|----------|
| **Direct** | 14 | 54% | Store ID, Store Name, Product ID, Product Name, Stock quantities |
| **Fixed value** | 11 | 42% | Dropdowns, Buttons, Messages, Empty states |
| **Logic** | 1 | 4% | Available Qty calculation, Sort indicators |

---

## 🎨 UI/UX Specifications

### Search Filter Layout
- **Arrangement**: Horizontal flex layout with responsive wrapping
- **Mobile**: Single column (grid-cols-1)
- **Small**: Two columns (sm:flex-row)
- **Desktop**: All fields inline
- **Spacing**: Consistent gap between inputs

### Input Widths
- Search inputs: `min-w-[160px]`
- Supply Type dropdown: `min-w-[160px]`
- View Type dropdown: `w-[280px]` (fixed width prevents layout shift)

### Table Display
- **Responsive**: Horizontal scroll on small screens
- **Header**: Sticky header for column sorting
- **Rows**: Hover effect for interactivity
- **Alignment**: Right-aligned numeric columns, left-aligned text

### Color Scheme
- **Available Qty badges**:
  - Green (in-stock): `bg-green-100 text-green-800`
  - Red (out-of-stock): `bg-red-100 text-red-800`
- **Supply Type badges**:
  - Blue (On Hand): `bg-blue-100 text-blue-800`
  - Yellow (Pre-Order): `bg-yellow-100 text-yellow-800`

---

## 🔐 Security & Access

- **Organization-based filtering**: Data filtered by View Type (org/channel codes)
- **Multi-tenant support**: Each org sees only their configured view data
- **Read-only interface**: Inventory Supply page for viewing only (no edit capability from this view)
- **Row-level access**: Visible records depend on user's authorized organizations

---

## 📝 Implementation Notes

### Search Behavior
- Multiple search fields work with OR logic: matches any field that contains criteria
- At least one field must have value (validation enforced)
- Partial matching enabled via LIKE operator
- Debounce prevents excessive API calls during typing

### Sorting
- Clicking column header toggles between ascending/descending
- Sort direction shown visually (↑ or ↓)
- Non-sortable columns (Store Name, Product Name) cannot be used as sort keys
- Sort persists across filter changes

### Performance Considerations
- Page Size: 2000 records fetched, filtered client-side
- Debounce: 400ms prevents rapid consecutive API calls
- Results Count: Shows filtered vs. total for context
- Loading indicator: Displayed during data fetch

---

## Document Information

- **Version**: 1.0
- **Created**: 2026-01-20
- **Total Fields**: 26
- **Database Tables Referenced**: 3 (master_locations, pim_master_product_base_info, inv_master_stock)
- **Status**: ✅ Complete & Verified

**Companion Files**:
- `inventory-supply-field-mapping.csv` - Structured field data
- `inventory-availability-field-mapping.md` - Original KPI-based inventory page
- Related components: `/app/inventory-new/supply/page.tsx`

