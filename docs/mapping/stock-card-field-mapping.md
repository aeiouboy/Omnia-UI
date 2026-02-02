# Stock Card Field Mapping Documentation

**Status**: ✅ **COMPREHENSIVE** - All 27 Fields Documented

**Page URL**: `/inventory-new/stores`
**Navigation**: Inventory Management → Stock Card

---

## 📋 Overview

This document provides complete field mapping for the **Stock Card** page in the Omnia UI Inventory Management module. This page displays store-level inventory performance with filtering, searching, and sorting capabilities.

---

## 📊 Field Count Summary

| Component | Fields | Status |
|-----------|--------|--------|
| **Page Header** | 3 | ✅ |
| **Search Filters** | 4 | ✅ |
| **Results Table Columns** | 6 | ✅ |
| **Sorting** | 3 | ✅ |
| **Row Behavior & Styling** | 3 | ✅ |
| **Search Behavior** | 2 | ✅ |
| **Data Loading** | 2 | ✅ |
| **Empty States** | 2 | ✅ |
| **Page Interactions** | 2 | ✅ |
| **TOTAL** | **27** | ✅ **COMPLETE** |

---

## 1. Page Header (3 Fields)

| # | Field | Type | Mapping | Sample |
|---|-------|------|---------|--------|
| 1 | Page Title | VARCHAR(255) | Fixed value | Stock Card |
| 2 | Page Description | VARCHAR(500) | Fixed value | View inventory performance and stock levels across all store locations |
| 3 | Refresh Button | N/A | N/A | N/A |

**Implementation**:
- Title: h1 heading, bold font, displays "Stock Card"
- Description: Subtitle text below title, muted color
- Refresh: Icon button with refresh icon, triggers data reload with loading spinner

---

## 2. Search Filters (4 Fields)

### View Type Filter (1 Field)

| # | Field | Type | Options |
|---|-------|------|---------|
| 4 | View Type Filter | VARCHAR(255) | 5 predefined organization/channel views |

**View Type Options**:
```
- ECOM-TH-CFR-LOCD-STD (CFR - TOL)
- ECOM-TH-CFR-LOCD-MKP (CFR - MKP)
- MKP-TH-CFR-LOCD-STD (CFR - QC)
- ECOM-TH-DSS-NW-STD (DS - Standard Delivery & Pickup)
- ECOM-TH-DSS-LOCD-EXP (DS - 3H Delivery & 1H Pickup)
```

**Specifications**:
- Fixed width: `w-[280px]` (prevents layout shift)
- Background: Primary color tinted (`bg-primary/5` with `border-primary/30`)
- Uses context hook: `useInventoryView()`
- Persists to localStorage
- Required field for data display

### Store Search Group (2 Fields)

**Container Styling**: `border border-border/40 rounded-md bg-muted/5`

| # | Field | Type | Details |
|---|-------|------|---------|
| 5 | Search Store ID | VARCHAR(50) | Minimum 2 characters required |
| 6 | Search Store Name | VARCHAR(255) | Minimum 2 characters required |

**Specifications**:
- Both fields: Text input with Search icon (left side)
- Width: `min-w-[160px]` each
- Placeholder text provided
- Cross-search: Either field can trigger search
- Both fields filter across store ID and store name

**Search Logic**:
```javascript
// Searches both storeId and storeName in both input fields
WHERE (storeId LIKE '%search%' OR storeName LIKE '%search%')
```

### Filter Controls (1 Field)

| # | Field | Type | Action |
|---|-------|------|--------|
| 7 | Clear All Button | N/A | Clears all filters |

**Specifications**:
- Position: Right-aligned with flex spacer
- Styling: `hover:bg-gray-100` hover effect
- Disabled state: When no filters active
- Clears: View type, Store ID search, Store Name search

---

## 3. Results Table (6 Columns)

### Table Structure

| # | Column | Type | Sortable | Width | Details |
|---|--------|------|----------|-------|---------|
| 8 | Store Name | VARCHAR(255) | ✓ Yes | 300px | Primary identifier |
| 9 | Store ID | VARCHAR(50) | ✓ Yes | 150px | Location code |
| 10 | Total Products | INTEGER | ✓ Yes | Auto | Product count |
| 11 | Low Stock | INTEGER | ✓ Yes | Auto | Below threshold |
| 12 | Out of Stock | INTEGER | ✓ Yes | Auto | Zero inventory |
| 13 | Action | N/A | — No | 100px | Navigation icon |

### Column Details

**Store Name** (Column 8):
- Database: `master_locations.location_name`
- Format: Full store name (e.g., "Tops Central World")
- Styling:
  - Font: Bold
  - Icon: MapPin (left side)
  - Color: Default text color
- Width: 300px (fixed)
- Sortable: Yes - alphabetical sort
- Clickable: Entire row is clickable
- Sample Stores: Tops Central Plaza ลาดพร้าว, Tops Central World, Tops สุขุมวิท 39, etc.

**Store ID** (Column 9):
- Database: `master_locations.location_id`
- Format: 4-6 character code (e.g., "CFR1819")
- Styling:
  - Font: Monospace
  - Color: Muted foreground
  - Optional: Shows "—" if missing
- Width: 150px (fixed)
- Sortable: Yes - alphanumeric sort
- Sample IDs: CFR3841, CFR1819, CFR2669, CFR7914, CFR6299, CFR4284, CFR6180, CFR7820

**Total Products** (Column 10):
- Database: `COUNT(product_id)` from `inv_master_stock` per store
- Format: Integer (e.g., "7")
- Styling:
  - Alignment: Center
  - Font: Bold
  - No special color
- Sortable: Yes - numeric sort
- Purpose: Total product SKUs in store
- Sample: 2, 7, 3, 2, 3, 3, 2, 2

**Low Stock** (Column 11):
- Database: `COUNT(WHERE stock_on_hand < safety_stock)` from `inv_master_stock`
- Format: Integer with badge styling
- Styling:
  - Alignment: Center
  - Color-coded: Yellow badge if value > 0, otherwise muted
  - Background: `bg-yellow-100` / `text-yellow-800` when > 0
  - Font: Bold
- Sortable: Yes - numeric sort
- Purpose: Count of products below safety stock threshold
- Sample: All 0 in sample data

**Out of Stock** (Column 12):
- Database: `COUNT(WHERE stock_on_hand = 0)` from `inv_master_stock`
- Format: Integer with badge styling
- Styling:
  - Alignment: Center
  - Color-coded: Red badge if value > 0, otherwise muted
  - Background: `bg-red-100` / `text-red-800` when > 0
  - Font: Bold
- Sortable: Yes - numeric sort (**DEFAULT SORT: DESCENDING**)
- Sort Indicator: Shows ↓ symbol indicating current default sort
- Purpose: Count of products with zero stock
- Sample: All 0 in sample data

**Action Icon** (Column 13):
- Icon: ChevronRight (right arrow)
- Styling:
  - Alignment: Right
  - Not independently clickable (entire row is clickable)
- Sortable: No
- Purpose: Visual indicator that row is expandable/navigable

---

## 4. Sorting Capabilities (3 Fields)

### Sortable Columns

| # | Field | Sortable Fields |
|---|-------|-----------------|
| 14 | Sortable Columns | Store Name, Store ID, Total Products, Low Stock, Out of Stock |

**Sort Features**:
- Click column header to toggle sort direction
- Visual indicators: ↑ for ascending, ↓ for descending
- Non-sortable: Action column

### Default Sort Field

| # | Field | Value |
|---|-------|-------|
| 15 | Default Sort Field | Out of Stock (descending) |

**Purpose**: Shows critical items (out of stock stores) first by default

### Sort Order

| # | Field | Type | Logic |
|---|-------|------|-------|
| 16 | Sort Order | VARCHAR(10) | Toggled on column header click |

**Implementation**:
```typescript
// Sort order persists while clicking different columns
// Clicking same column again toggles between asc/desc
const toggleSort = (field: SortField) => {
  if (sortField === field) {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
  } else {
    setSortField(field)
    setSortOrder('asc')  // Reset to ascending for new field
  }
}
```

---

## 5. Row Behavior & Styling (3 Fields)

| # | Field | Type | Details |
|---|-------|------|---------|
| 17 | Row Click Navigation | VARCHAR(500) | Navigation to store detail page |
| 18 | Row Alternating Background | VARCHAR(50) | Visual alternation for readability |
| 19 | Row Hover Effect | VARCHAR(50) | Interactive feedback |

### Row Click Navigation (Field 17)

**Target URL**: `/inventory-new?store={storeName}`

**Example**:
```
Click on "Tops Central World" row
→ Navigates to: /inventory-new?store=Tops%20Central%20World
```

**Implementation**:
```javascript
const handleRowClick = (storeName: string) => {
  router.push(`/inventory-new?store=${encodeURIComponent(storeName)}`)
}
```

### Row Alternating Background (Field 18)

**Styling**:
- Odd rows (index % 2 === 1): `bg-muted/30` (light background)
- Even rows: Default/transparent background
- Purpose: Improves readability of dense tabular data

### Row Hover Effect (Field 19)

**Styling**:
- On hover: `hover:bg-muted/50 transition-colors`
- Cursor: `cursor-pointer`
- Purpose: Visual feedback that row is interactive

---

## 6. Search Behavior (2 Fields)

| # | Field | Type | Value |
|---|-------|------|-------|
| 20 | Minimum Search Length | INTEGER | 2 characters |
| 21 | Search Debounce Duration | INTEGER | 400 milliseconds |

**Minimum Search Length (Field 20)**:
- Validation: Both Store ID and Store Name require minimum 2 characters
- Error message: "Enter at least 2 characters to search"
- Prevents excessive API calls with single character

**Search Debounce (Field 21)**:
- Duration: 400ms
- Timing: Waits 400ms after user stops typing before fetching data
- Purpose: Reduces server load during rapid typing
- UX: Shows "Loading..." indicator during debounce and fetch

---

## 7. Data Loading States (2 Fields)

| # | Field | Type | Display |
|---|-------|------|---------|
| 22 | Loading State | N/A | Skeleton cards placeholder |
| 23 | Error State | VARCHAR(255) | Error message with retry |

**Loading State (Field 22)**:
- Display: Multiple skeleton cards matching table structure
- Duration: Shown while data is being fetched
- User Experience: Indicates data loading in progress

**Error State (Field 23)**:
- Message: "Failed to load store performance data"
- Display: Error alert with retry button
- Trigger: When API request fails

---

## 8. Empty States (2 Fields)

| # | Field | Trigger | Message |
|---|-------|---------|---------|
| 24 | No Selection Message | Page load without filters | "Select a view type or search for a store to display data" |
| 25 | Insufficient Search Message | Search < 2 characters | "Enter at least 2 characters to search" |

**No Selection (Field 24)**:
- Condition: No view type selected AND no/empty search criteria
- Display: Icon + message guiding user to take action

**Insufficient Search (Field 25)**:
- Condition: Search input has 1 character only
- Display: Message explaining minimum requirement

---

## 9. Page Interactions (2 Fields)

| # | Field | Type | Purpose |
|---|-------|------|---------|
| 26 | Organization Context Filter | Logic | Filters data by organization |
| 27 | View Type localStorage | Logic | Persists view selection |

**Organization Context Filter (Field 26)**:
- Hook: `useOrganization()`
- Retrieval: `selectedOrganization` from context
- Application: Only applied when `selectedOrganization !== 'ALL'`
- Impact: Restricts store data to selected organization

**View Type localStorage (Field 27)**:
- Hook: `useInventoryView()`
- Persistence: Stores selected view in browser localStorage
- Retrieval: On page load, restores previous view selection
- Impact: User preference preserved across sessions

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
**Used for**: Store Name and Store ID columns

#### **inv_master_stock**
```sql
CREATE TABLE inv_master_stock (
  stock_id VARCHAR(255) PRIMARY KEY,
  product_id VARCHAR(255),
  location_id VARCHAR(4),
  stock_on_hand INTEGER,
  safety_stock INTEGER,
  total_stock INTEGER,
  supply_type VARCHAR(50),
  view_type VARCHAR(255),
  last_updated TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES pim_master_product_base_info(product_id),
  FOREIGN KEY (location_id) REFERENCES master_locations(location_id)
);
```
**Used for**: Product counts (Total, Low Stock, Out of Stock columns)

---

## 🔗 API Integration

### Get Store Performance Data
```
GET /api/inventory/stores?
  view={viewType}&
  organization={organizationId}&
  search={searchTerm}&
  limit=1000
```

**Query Parameters**:
```javascript
{
  view: "ECOM-TH-CFR-LOCD-STD",  // Selected view type
  organization: undefined,         // From context if selected
  search: "CFR",                   // Search term (min 2 chars)
  limit: 1000                      // Fetch limit
}
```

**Response Structure**:
```json
{
  "success": true,
  "data": [
    {
      "storeName": "Tops Central World",
      "storeId": "CFR1819",
      "totalProducts": 7,
      "lowStockItems": 0,
      "criticalStockItems": 0,
      "totalValue": 15250,
      "healthScore": 95,
      "storeStatus": "Active"
    }
  ],
  "total": 8
}
```

---

## 📊 Store Sample Data

**Stores displayed** (Sample from ECOM-TH-CFR-LOCD-STD view):

| Store Name | Store ID | Total | Low | Out |
|------------|----------|-------|-----|-----|
| Tops Central Plaza ลาดพร้าว | CFR3841 | 2 | 0 | 0 |
| Tops Central World | CFR1819 | 7 | 0 | 0 |
| Tops สุขุมวิท 39 | CFR2669 | 3 | 0 | 0 |
| Tops ทองหล่อ | CFR7914 | 2 | 0 | 0 |
| Tops สีลม คอมเพล็กซ์ | CFR6299 | 3 | 0 | 0 |
| Tops เอกมัย | CFR4284 | 3 | 0 | 0 |
| Tops พร้อมพงษ์ | CFR6180 | 2 | 0 | 0 |
| Tops จตุจักร | CFR7820 | 2 | 0 | 0 |

---

## 🎨 UI/UX Specifications

### Filter Layout
- **Arrangement**: Horizontal flex layout
- **View Type**: Fixed width 280px, primary color tinted
- **Store Search**: Grouped container with border/muted background
- **Spacing**: Consistent gap between components

### Table Styling
- **Header**: Sticky, sortable columns with hover effect
- **Rows**: Alternating background colors, hover effect, clickable
- **Icons**: MapPin for stores, ChevronRight for navigation
- **Responsive**: Column widths fixed for consistency

### Color Scheme
- **Low Stock**: Yellow badge (`bg-yellow-100 text-yellow-800`)
- **Out of Stock**: Red badge (`bg-red-100 text-red-800`)
- **Row Hover**: Muted background with smooth transition
- **Default**: Muted colors for neutral data

---

## 🔐 Security & Access

- **Organization-based filtering**: Data filtered by selected organization
- **Multi-tenant support**: Each org sees only their stores
- **Read-only interface**: Stock Card page for viewing only
- **Row-level access**: Visible stores depend on user's authorized organizations

---

## 📝 Implementation Notes

### Search Behavior
- Multiple search fields work with OR logic
- Minimum 2 characters required to trigger search
- Debounce prevents excessive API calls
- Cross-field search (either ID or Name can match)

### Sorting
- Click column header to toggle sort direction
- Default sort: Out of Stock (descending)
- Sort persists while filtering
- Visual indicators show current sort direction

### Performance Considerations
- Debounce: 400ms prevents rapid API calls
- Skeleton loading: Smooth loading experience
- Organization context: Filters data efficiently
- localStorage: Reduces redundant selections

---

## Document Information

- **Version**: 1.0
- **Created**: 2026-01-20
- **Total Fields**: 27
- **Database Tables Referenced**: 2 (master_locations, inv_master_stock)
- **Status**: ✅ Complete & Verified

**Component File**: `/app/inventory-new/stores/page.tsx`

**Companion Files**:
- `stock-card-field-mapping.csv` - Structured field data
- Related pages: Inventory Availability, Inventory Supply
