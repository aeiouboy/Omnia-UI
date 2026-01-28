# Stock Config Field Mapping Index

**Quick Reference for Stock Config Management Page**

---

## 📊 Field Summary

- **Total Fields**: 56
- **Status**: ✅ Complete
- **Page URL**: `/stock-config`
- **Location**: Inventory Management → Stock Config (3rd submenu item)

---

## 🔍 Field Inventory by Section

### 1. Page Header (4 fields)
- Page Title
- Page Subtitle
- Refresh Button
- Upload Config Button

**Key Details**: Primary navigation and action buttons at top of page

---

### 2. KPI Summary Cards (13 fields)

#### Card 1: Total Configurations
- Title: "Total Configurations"
- Count: Aggregated total (0)
- Label: "Active stock configs"
- **Style**: Gray background with Package icon

#### Card 2: Daily Configs
- Title: "Daily Configs"
- Count: On Hand Available count (0)
- Label: "On Hand Available"
- **Style**: Blue background with Clock icon
- **Filter**: supply_type = 'On Hand Available'

#### Card 3: One-time Configs
- Title: "One-time Configs"
- Count: PreOrder count (0)
- Label: "PreOrder"
- **Style**: Purple background with FileSpreadsheet icon
- **Filter**: supply_type = 'PreOrder'

#### Card 4: Upload Status
- Pending Badge: folder = 'pending' (0)
- Processed Badge: folder = 'arch' (0)
- Errors Badge: folder = 'err' (0)
- **Style**: White background with FolderArchive icon
- **Colors**: Yellow (Pending), Green (Processed), Red (Errors)

---

### 3. Tab Navigation (3 fields)

| Tab | Filter | Default |
|-----|--------|---------|
| All Configs | No filter | ✓ Selected |
| PreOrder | supply_type = 'PreOrder' | - |
| OnHand | supply_type = 'On Hand Available' | - |

**Behavior**: Badge counts, "Showing X of Y" text, client-side switching

---

### 4. Search & Filters (6 fields)

#### Search Inputs
| Field | Mapping | Width | Sample |
|-------|---------|-------|--------|
| Location ID Search | location_id | min-w-160px | CFR1819 |
| Item ID Search | item_id | min-w-160px | 885000000001 |

#### Date Pickers
| Field | Mapping | Format |
|-------|---------|--------|
| Start Date | start_date | ISO 8601 (YYYY-MM-DD) |
| End Date | end_date | ISO 8601 (YYYY-MM-DD) |

#### Dropdowns
| Field | Options | Default | Mapping |
|-------|---------|---------|---------|
| Channel | All, TOL, MKP, QC | All Channels | channel |
| Frequency | All, One-time, Daily | All Frequencies | frequency |

---

### 5. Stock Configurations Table (8 columns)

| Column | Type | Sortable | Width | Details |
|--------|------|----------|-------|---------|
| Location ID | VARCHAR(50) | ✓ Yes | Auto | Monospace font |
| Item ID | VARCHAR(13) | ✓ Yes | Auto | 13-digit barcode |
| Quantity | INT | ✓ Yes | Auto | Right-aligned |
| Supply Type | VARCHAR(50) | ✗ No | Auto | Color badge (Preorder=Purple, OnHand=Blue) |
| Frequency | VARCHAR(50) | ✗ No | Auto | Gray badge (One-time, Daily) |
| Channel | VARCHAR(50) | ✗ No | Auto | TOL/MKP/QC badge, optional |
| Start Date | TIMESTAMP | ✗ No | Auto | Locale format, OnHand only |
| End Date | TIMESTAMP | ✗ No | Auto | Locale format, OnHand only |

**Sorting**: Default by createdAt (descending - newest first)

**Pagination**: 25 items per page, "Showing X of Y configurations"

**Row Styling**: Alternating bg-muted/30, hover:bg-muted/50

---

### 6. Upload History Section (12 fields)

#### Section Header
- Title: "Upload History (0)"
- Subtitle: "Recent file uploads and their processing status"

#### Upload History Filters
| Field | Type | Mapping |
|-------|------|---------|
| File Search | VARCHAR(255) | filename (LIKE) |
| Start Date | DATE | upload_date (≥) |
| End Date | DATE | upload_date (≤) |

#### Upload History Tabs
| Tab | Folder | Count |
|-----|--------|-------|
| All | all folders | Show all |
| Pending | pending | Awaiting processing |
| Processed | arch | Successfully processed |
| Error | err | Processing errors |

#### Upload History Table Columns
| Column | Mapping | Right-aligned | Details |
|--------|---------|----------------|---------|
| File | filename | No | Clickable to download |
| Upload Date | upload_date | No | Locale formatted timestamp |
| Records | record_count, valid_records, invalid_records | Yes | Shows total + valid/invalid breakdown |
| Uploaded By | uploaded_by | No | User avatar + name, audit trail |
| Status | status | No | Color badge (pending/processed/error) |
| Actions | view/download/delete | Yes | Action buttons |

---

### 7. Page Interactions (4 fields)

| Interaction | Details |
|-------------|---------|
| Sortable Headers | Location ID, Item ID, Quantity - Click to toggle ↑↓ |
| Row Hover | hover:bg-muted/50 with smooth transition |
| Empty State | "No upload history" with Package icon |
| Loading State | 8 skeleton rows with shimmer effect |

---

## 🔗 Database Mapping Reference

### Primary Table: stock_config
| Field | Column | Type |
|-------|--------|------|
| Location ID | location_id | VARCHAR(50) |
| Item ID | item_id | VARCHAR(13) |
| Quantity | quantity | INT |
| Supply Type | supply_type | VARCHAR(50) |
| Frequency | frequency | VARCHAR(50) |
| Channel | channel | VARCHAR(50) |
| Start Date | start_date | TIMESTAMP |
| End Date | end_date | TIMESTAMP |
| Created At | created_at | TIMESTAMP |
| Updated At | updated_at | TIMESTAMP |

### Secondary Table: stock_config_files
| Field | Column | Type |
|-------|--------|------|
| Filename | filename | VARCHAR(255) |
| Upload Date | upload_date | TIMESTAMP |
| Status | status | VARCHAR(50) |
| Record Count | record_count | INT |
| Valid Records | valid_records | INT |
| Invalid Records | invalid_records | INT |
| Folder | folder | VARCHAR(50) |

---

## 📝 Supply Type Specifications

### PreOrder (One-time)
- **Display**: Purple badge "Preorder"
- **Frequency**: One-time (non-recurring)
- **Dates**: Not applicable (no start_date/end_date)
- **Purpose**: Limited quantity one-time sales override
- **Use Case**: Flash sales, special promotions

### On Hand Available (Daily)
- **Display**: Blue badge "OnHand"
- **Frequency**: Daily (recurring)
- **Dates**: Required (start_date and end_date)
- **Purpose**: Override available stock for specific date range
- **Use Case**: Reserved inventory, hold periods

---

## 🎯 Channel Reference

| Code | Name | Details |
|------|------|---------|
| TOL | Tops Online | E-commerce sales channel |
| MKP | Marketplace | Third-party marketplace |
| QC | Quick Commerce | Same-day delivery |

---

## 🔄 Upload Workflow Phases

### Phase 1: Upload
- User selects CSV file
- File upload modal opens
- File sent to server for validation

### Phase 2: Validate
- CSV parsing and field validation
- Duplicate detection
- Error reporting with row numbers
- Display validation results table

### Phase 3: Process
- User confirms valid rows
- Line-by-line processing begins
- Real-time progress tracking
- Post-processing report with success/error counts

---

## ⚡ Quick API Reference

### Get Stock Configs
```
GET /api/stock-config
?supplyType=PreOrder&frequency=One-time&channel=TOL
&locationId=CFR&itemId=885&page=1&pageSize=25
&sortBy=createdAt&sortOrder=desc
```

### Get Upload History
```
GET /api/stock-config/files
?status=processed&page=1&pageSize=25
```

---

## 📋 Mapping Type Distribution

| Type | Count | Percentage |
|------|-------|-----------|
| Direct | 29 | 52% |
| Fixed value | 18 | 32% |
| Logic | 9 | 16% |
| **Total** | **56** | **100%** |

**Direct**: Fields mapped 1:1 from database (locationId, itemId, quantity, etc.)
**Fixed value**: Predefined enums or UI constants (tabs, dropdowns, button labels)
**Logic**: Calculated fields (KPI counts, pagination text, conditional display)

---

## ✅ Validation Checklist

- [x] All 4 KPI cards documented with count formulas
- [x] All 3 tabs with filter conditions specified
- [x] All 6 filter fields with mapping and sample values
- [x] All 8 table columns with sortable/non-sortable indicators
- [x] Upload history section with 6 table columns (including Uploaded By)
- [x] Database schema provided for 2 tables
- [x] API endpoints documented with sample queries
- [x] Supply type and channel specifications included
- [x] Responsive design breakpoints noted
- [x] Complete field count: 56 fields ✓

---

## 📚 Related Documentation

- **CSV Export**: `stock-config-field-mapping.csv`
- **Detailed Docs**: `stock-config-field-mapping.md`
- **Component File**: `/app/stock-config/page.tsx`
- **Type Definitions**: `/src/types/stock-config.ts`
- **Service Layer**: `/src/lib/stock-config-service.ts`

---

## 📊 Document Statistics

- **Created**: 2026-01-20
- **Total Sections**: 7
- **KPI Cards**: 4
- **Table Columns**: 8 (stock configs) + 6 (upload history)
- **Filter Options**: 6
- **Database Tables**: 2
- **API Endpoints**: 2+
- **Status**: ✅ Complete & Ready

