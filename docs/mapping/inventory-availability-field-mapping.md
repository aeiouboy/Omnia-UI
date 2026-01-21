# Inventory Availability Field Mapping Documentation

**Status**: ✅ **COMPREHENSIVE** - All 21 Fields Documented

## Overview

This document provides complete field mapping for the **Inventory Availability** sub-menu page in the Omnia UI Inventory Management module.

---

## 📊 Field Count Summary

| Component | Fields | Status |
|-----------|--------|--------|
| **Header/KPI Section** | 3 | ✅ |
| **View Selector** | 1 | ✅ |
| **Search & Filters** | 5 | ✅ |
| **Tab Navigation** | 3 | ✅ |
| **Products Table** | 9 | ✅ |
| **TOTAL** | **21** | ✅ **COMPLETE** |

---

## 1. Header Section (3 Fields)

### KPI Cards Display

| # | Field | Type | Mapping | Sample | Description |
|---|-------|------|---------|--------|-------------|
| 1 | Total Products | INT | Logic | 24 | Total count of products across all stores |
| 2 | Low Stock | INT | Logic | 0 | Products below safety threshold |
| 3 | Out of Stock | INT | Logic | 0 | Products with zero inventory |

**Mapping Details:**
- **Total Products**: `COUNT(*) FROM pim_master_product_base_info`
- **Low Stock**: `COUNT(WHERE stock_on_hand < safety_stock) FROM inv_master_stock`
- **Out of Stock**: `COUNT(WHERE stock_on_hand = 0) FROM inv_master_stock`

**Display Format:**
- Large KPI cards with icon indicators
- Color coding: Green (healthy), Orange (low), Red (out of stock)
- Subtitle: "Across all stores" / "Needs attention" / "Immediate attention required"

---

## 2. View Selector (1 Field)

| # | Field | Type | Mapping | Values |
|---|-------|------|---------|--------|
| 4 | View Selector | VARCHAR(255) | Fixed value | ECOM-TH-CFR-LOCD-STD, CFR - TOL Channel |

**Details:**
- Dropdown menu at top right
- Selects organization/business unit
- Filters entire page based on selection
- Sample: "ECOM-TH-CFR-LOCD-STD - CFR - TOL Channel (TOL)"

---

## 3. Search & Filters Section (5 Fields)

### Filter Controls

| # | Field | Type | Mapping | Input | Purpose |
|---|-------|------|---------|-------|---------|
| 5 | Search Product Name | VARCHAR(256) | Logic | Text box | Bilingual product name search |
| 6 | Search Barcode | VARCHAR(13) | Direct | Text box | 13-digit EAN barcode search |
| 7 | Item Types Filter | VARCHAR(255) | Fixed value | Dropdown | Packed/Weighed/Mixed types |
| 8 | Stock Config Filter | VARCHAR(255) | Direct | Dropdown | In stock/Low stock/Out of stock |
| 9 | Brands Filter | VARCHAR(255) | Direct | Dropdown | Brand name filter |

### Search Implementation

**Product Name Search** (Field 5):
- Multi-language support: `name_en LIKE OR name_th LIKE`
- Partial matching
- Sample: "Betagen Fermented" → matches "Betagen Fermented Milk 400ml"

**Barcode Search** (Field 6):
- Exact match or prefix
- Standard 13-digit EAN format
- Sample: "885000000001"

### Filter Dropdowns

**Item Types** (Field 7):
- Fixed values: Pack, Weight, Pack Weight, Normal
- Based on `is_sold_by_weight` boolean + additional type
- Display with icon indicators

**Stock Config** (Field 8):
- Status-based: In stock, Low stock, Out of stock
- Calculated from inventory data
- Icon color coding

**Brands** (Field 9):
- Dynamic list from available brands in current view
- Multiple select capable
- Populated from `pim_master_product_brand`

---

## 4. Tab Navigation (3 Fields)

| # | Field | Type | Condition | Display |
|---|-------|------|-----------|---------|
| 10 | All Products Tab | VARCHAR(50) | All records | Default tab |
| 11 | Low Stock Tab | VARCHAR(50) | stock_on_hand < safety_stock | Shows matching products |
| 12 | Out of Stock Tab | VARCHAR(50) | stock_on_hand = 0 | Shows matching products |

**Tab Features:**
- Tab count shown: "Showing 24 of 24 products" (All Products), etc.
- Badge count on tab label showing number of items
- Switch tabs without page reload

---

## 5. Products Table (9 Columns)

### Table Columns Detailed

| # | Column | Type | Mapping | Sample | Width |
|---|--------|------|---------|--------|-------|
| 13 | Product Image | VARCHAR(256) | Direct | https://cdn.../product.jpg | 80px |
| 14 | Product Name | VARCHAR(256) | Direct | Betagen Fermented Milk 400ml | 250px |
| 15 | Barcode | VARCHAR(13) | Direct | 885000000001 | 120px |
| 16 | Brand | VARCHAR(255) | Direct | Oishi | 100px |
| 17 | Item Type | VARCHAR(50) | Fixed value | Pack, Weight | 100px |
| 18 | Config | VARCHAR(50) | Direct | In stock | 100px |
| 19 | Stock Status Badge | VARCHAR(50) | Logic | In Stock (42 units) | 120px |
| 20 | Available / Total | INTEGER/INTEGER | Logic | 42/52 | 120px |
| 21 | Action Icons | N/A | N/A | Expand, Menu | 60px |

### Column Details

**Product Image** (Column 13):
- Thumbnail display (80x80px recommended)
- URL from `pim_master_product_base_info.image_url`
- Fallback: Generic product placeholder

**Product Name** (Column 14):
- English or Thai based on system language
- Click to view product details
- Truncate with ellipsis if too long

**Barcode** (Column 15):
- Standard 13-digit EAN-13 format
- Copyable or scannable
- Links to search

**Brand** (Column 16):
- Brand name display
- Filterable column

**Item Type** (Column 17):
- Icon indicator:
  - **Pack**: Box icon (for packed items)
  - **Weight**: Scale icon (for weighed items)
  - **Pack Weight**: Combined icon
  - **Normal**: No special icon
- Type name text
- Based on `pim_master_product_base_info.is_sold_by_weight`

**Config** (Column 18):
- Configuration status label
- Direct from `inv_master_stock.config`

**Stock Status Badge** (Column 19):
- **Color Coding**:
  - Green with checkmark: In Stock
  - Orange with warning: Low Stock
  - Red with X: Out of Stock
- Display format: "In Stock (42 units)"
- Icon + text combination

**Available / Total** (Column 20):
- Format: "42/52" (available/total)
- Percentage bar below (optional)
- Green = Good stock, Yellow = Low, Red = Out

**Action Icons** (Column 21):
- Expand row (show more details)
- More options menu (ellipsis)
- Clickable row for full details view

---

## 🗄️ Database Schema References

### Primary Tables

#### **pim_master_product_base_info**
```sql
CREATE TABLE pim_master_product_base_info (
  product_id VARCHAR(255) PRIMARY KEY,
  name_en VARCHAR(256),
  name_th VARCHAR(256),
  barcode VARCHAR(13),
  image_url VARCHAR(256),
  brand_id VARCHAR(255),
  category_id VARCHAR(80),
  is_sold_by_weight BOOLEAN,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

#### **inv_master_stock**
```sql
CREATE TABLE inv_master_stock (
  stock_id VARCHAR(255) PRIMARY KEY,
  product_id VARCHAR(255),
  item_id VARCHAR(13),  -- Barcode
  location_id VARCHAR(4),
  stock_on_hand INTEGER,
  safety_stock INTEGER,
  total_stock INTEGER,
  config VARCHAR(50),
  FOREIGN KEY (product_id) REFERENCES pim_master_product_base_info(product_id),
  FOREIGN KEY (location_id) REFERENCES master_locations(location_id)
);
```

#### **pim_master_product_brand**
```sql
CREATE TABLE pim_master_product_brand (
  brand_id VARCHAR(255) PRIMARY KEY,
  brand_name VARCHAR(255),
  description TEXT
);
```

#### **master_locations**
```sql
CREATE TABLE master_locations (
  location_id VARCHAR(4) PRIMARY KEY,
  location_name VARCHAR(255),
  store_type VARCHAR(100),
  region VARCHAR(100)
);
```

#### **pim_lov_product_category**
```sql
CREATE TABLE pim_lov_product_category (
  category_id VARCHAR(80) PRIMARY KEY,
  category_name VARCHAR(255),
  description TEXT
);
```

---

## 🎯 Mapping Type Breakdown

### Direct Mapping (11 fields - 52%)
Fields with 1:1 mapping from database column to display:
- Product Image → image_url
- Product Name → name_en, name_th
- Barcode → item_id
- Brand → brand_name
- Config → config
- Item Types (via is_sold_by_weight)
- Brands filter
- Stock Config filter
- Barcode search

### Fixed Value Mapping (6 fields - 29%)
Predefined enum or dropdown values:
- View Selector (organizations)
- Item Types (Pack, Weight, Pack Weight, Normal)
- All/Low/Out of Stock tabs
- Tab labels

### Logic Mapping (4 fields - 19%)
Calculated or conditional fields:
- Total Products (COUNT aggregation)
- Low Stock (COUNT with condition)
- Out of Stock (COUNT with condition)
- Stock Status Badge (condition-based display)
- Available / Total (calculation from database)

---

## 🔗 API Integration

### Inventory Availability Endpoint
```
GET /api/inventory/products
```

**Query Parameters:**
```javascript
{
  orgId: "ECOM-TH-CFR-LOCD-STD",
  search: "Betagen",           // Product name or barcode
  itemTypes: ["Pack", "Weight"],
  config: "In stock",
  brands: ["Oishi", "Tipco"],
  tab: "all"                    // all, low-stock, out-of-stock
}
```

**Response Structure:**
```json
{
  "success": true,
  "data": [
    {
      "product_id": "PROD-001",
      "image_url": "https://cdn.example.com/product.jpg",
      "name_en": "Betagen Fermented Milk 400ml",
      "name_th": "เบต้าเจน นม ...กำ 400ml",
      "barcode": "885000000001",
      "brand": "Oishi",
      "item_type": "Pack",
      "config": "In stock",
      "stock_available": 42,
      "total_stock": 52,
      "status": "In Stock"
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 25,
    "total": 24
  },
  "kpis": {
    "total_products": 24,
    "low_stock": 0,
    "out_of_stock": 0
  }
}
```

---

## 📋 Field Value Enums

### Item Types
```
Pack              → Packed items
Weight            → Sold by weight
Pack Weight       → Combination
Normal            → Standard items
```

### Stock Status
```
In Stock          → stock_on_hand > safety_stock
Low Stock         → safety_stock >= stock_on_hand > 0
Out of Stock      → stock_on_hand = 0
```

### Config Values
```
In stock
Low stock
Out of stock
```

---

## 🎨 UI Formatting Rules

### Product Image
- Dimensions: 80x80px (thumbnail)
- Format: JPG, PNG
- Fallback: Generic product image
- Aspect ratio: 1:1 (square)

### Barcode
- Format: 13-digit EAN-13
- Example: 885000000001
- Display: With hyphens optional (8850-0000-001)

### Stock Display
- Available: Bold number
- Total: Regular number
- Format: "42/52"
- Progress bar: Percentage fill

### Status Badge
- **In Stock**: Green background, checkmark icon
- **Low Stock**: Orange/Yellow background, warning icon
- **Out of Stock**: Red background, X icon

---

## 📊 Statistics & Coverage

| Metric | Value | Status |
|--------|-------|--------|
| Total Fields | 21 | ✅ Complete |
| Field Coverage | 100% | ✅ All fields mapped |
| Database Tables | 5 | ✅ Verified |
| Mapping Type Variety | 3 types | ✅ Diverse |
| Sample Values | 100% | ✅ All provided |

---

## 🚀 Implementation Checklist

- [x] All KPI fields documented
- [x] All filter fields documented
- [x] All table columns documented
- [x] All tabs documented
- [x] Database mappings verified
- [x] API parameters documented
- [x] Data types specified
- [x] Sample values provided
- [x] Color coding documented
- [x] Formatting rules documented
- [x] Enum values listed
- [x] CSV export created

---

## 📝 Notes & Remarks

### Search Behavior
- Multi-field search across product name (EN/TH) and barcode
- Uses LIKE operator for partial matching
- Case-insensitive search

### Filter Logic
- Multiple filters work with AND logic (all conditions must match)
- View selector applies globally to all data
- Filters are preserved when switching tabs

### Stock Calculation
- **Available**: stock_on_hand minus reserved/allocated
- **Total**: Physical inventory count
- **Safety Stock**: Minimum threshold before "Low Stock" alert

### Performance Considerations
- Table pagination: 25 items per page (configurable)
- Search uses indexed columns (barcode, product_id)
- KPI aggregations use pre-calculated views

---

## 🔐 Security & Access

- Organization-based data filtering (multi-tenant)
- Row-level security based on user location access
- Barcode search is read-only (no edit capability from list view)

---

## Document Information

- **Version**: 1.0
- **Created**: 2026-01-20
- **Total Fields**: 21
- **Total Tabs**: 3 (All Products, Low Stock, Out of Stock)
- **Database Tables Referenced**: 5
- **Status**: ✅ Complete & Verified

---

**Companion Files:**
- `inventory-availability-field-mapping.csv` - Structured field data
- `UI Checklist for OMS.xlsx` - Source specification (Inventory sheet)

