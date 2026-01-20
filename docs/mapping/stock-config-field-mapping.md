# Stock Config Field Mapping

**Status**: ✅ **COMPREHENSIVE** - All 56 Fields Documented

**Page URL**: `/stock-config`
**Component**: `StockConfigPage` in `/app/stock-config/page.tsx`
**Sub-components**: Multiple UI components in `/src/components/stock-config/`

---

## 📋 Overview

This document maps all fields on the **Stock Config Management** page, which displays and manages stock configuration overrides for inventory across channels (TOL, MKP, QC) with support for PreOrder and On Hand Available configurations through file-based bulk uploads and line-by-line processing.

---

## 📊 Field Count Summary

| Component | Fields | Status |
|-----------|--------|--------|
| **Page Header** | 4 | ✅ |
| **KPI Summary Cards** | 13 | ✅ |
| **Tab Navigation** | 3 | ✅ |
| **Search & Filters** | 6 | ✅ |
| **Table Columns** | 8 | ✅ |
| **Upload History Section** | 13 | ✅ |
| **Page Interactions** | 4 | ✅ |
| **TOTAL** | **56** | ✅ **COMPLETE** |

---

## 1. Page Header (4 Fields)

| # | Field | Type | Status |
|---|-------|------|--------|
| 1 | Page Title | VARCHAR(255) | ✅ |
| 2 | Page Subtitle | VARCHAR(255) | ✅ |
| 3 | Refresh Button | N/A | ✅ |
| 4 | Upload Config Button | N/A | ✅ |

### Field Details

**Page Title** (Field 1):
- Display: "Stock Configuration"
- Font: Heading level 1 (h1), bold
- Location: Top of main content area
- Type: Fixed value (no database mapping)

**Page Subtitle** (Field 2):
- Display: "Manage PreOrder and Override OnHand configurations"
- Font: Paragraph text, muted color
- Location: Below main title
- Purpose: Explains page functionality to users

**Refresh Button** (Field 3):
- Icon: RefreshCw from Lucide React
- Action: Triggers `handleRefresh()` to reload all data
- Location: Top right of page header
- State: Shows spinning animation during refresh
- Keyboard: Keyboard shortcut available (F5 or similar)

**Upload Config Button** (Field 4):
- Icon: Upload icon
- Text: "Upload Config"
- Action: Opens FileUploadModal for bulk CSV upload
- Type: Primary button with blue styling
- Location: Right of Refresh button

---

## 2. KPI Summary Cards (13 Fields)

The page displays 4 KPI cards in a responsive grid (2x2 on desktop, 1 column on mobile).

### Card 1: Total Configurations (4 Fields)

| # | Field | Type | Details |
|---|-------|------|---------|
| 5 | Title | VARCHAR(255) | "Total Configurations" |
| 6 | Count | INT | Aggregated total from database |
| 7 | Label | VARCHAR(255) | "Active stock configs" |

**Implementation**:
- Card background: Gray tinted
- Icon: Package (gray)
- Count calculation: `COUNT(*) FROM stock_config WHERE active = true`
- Display example: Large "0" number with smaller "Active stock configs" label below
- Responsive: Full width on mobile, 1/2 width on desktop

### Card 2: Daily Configs (3 Fields)

| # | Field | Type | Details |
|---|-------|------|---------|
| 8 | Title | VARCHAR(255) | "Daily Configs" |
| 9 | Count | INT | Count of On Hand Available |
| 10 | Label | VARCHAR(255) | "On Hand Available" |

**Implementation**:
- Card background: Blue tinted
- Icon: Clock (blue)
- Count calculation: `COUNT(*) FROM stock_config WHERE supply_type = 'On Hand Available'`
- Purpose: Shows active daily recurring configuration count
- Filters to only frequency='Daily' records

### Card 3: One-time Configs (3 Fields)

| # | Field | Type | Details |
|---|-------|------|---------|
| 11 | Title | VARCHAR(255) | "One-time Configs" |
| 12 | Count | INT | Count of PreOrder |
| 13 | Label | VARCHAR(255) | "PreOrder" |

**Implementation**:
- Card background: Purple tinted
- Icon: FileSpreadsheet (purple)
- Count calculation: `COUNT(*) FROM stock_config WHERE supply_type = 'PreOrder'`
- Purpose: Shows one-time PreOrder configuration count
- Filters to only frequency='One-time' records

### Card 4: Upload Status (4 Fields)

| # | Field | Type | Details |
|---|-------|------|---------|
| 14 | Title | VARCHAR(255) | "Upload Status" |
| 15 | Pending Badge | INT | Files in 'pending' folder |
| 16 | Processed Badge | INT | Files in 'arch' folder |
| 17 | Errors Badge | INT | Files in 'err' folder |

**Implementation**:
- Card background: White/default
- Icon: FolderArchive (gray)
- Pending count: `COUNT(*) FROM stock_config_files WHERE folder = 'pending'`
- Processed count: `COUNT(*) FROM stock_config_files WHERE folder = 'arch'`
- Errors count: `COUNT(*) FROM stock_config_files WHERE folder = 'err'`
- Badge colors: Yellow (Pending), Green (Processed), Red (Errors)
- Purpose: Quick overview of file processing status

---

## 3. Tab Navigation (3 Fields)

| # | Tab | Type | Condition |
|---|-----|------|-----------|
| 18 | All Configs | Fixed value | Shows all configurations |
| 19 | PreOrder | Fixed value | Filters supply_type = 'PreOrder' |
| 20 | OnHand | Fixed value | Filters supply_type = 'On Hand Available' |

**Tab Features**:
- Badge count on each tab showing item count
- "Showing X of Y configurations" display below tabs
- Default: "All Configs" tab selected on page load
- Client-side tab switching without page reload
- Active tab styling with underline/background highlight

**Tab Behavior**:
- All Configs: `activeTab = "all"` → `supplyType = "all"`
- PreOrder: `activeTab = "PreOrder"` → `supplyType = "PreOrder"`
- OnHand: `activeTab = "OnHand"` → `supplyType = "On Hand Available"`

---

## 4. Search & Filters (6 Fields)

### Search Inputs (2 Fields)

| # | Field | Type | Details |
|---|-------|------|---------|
| 21 | Location ID Search | VARCHAR(50) | Partial match search |
| 22 | Item ID Search | VARCHAR(13) | 13-digit barcode search |

**Location ID Search**:
- Input width: `min-width-[160px]`
- Placeholder: "Search Location ID..."
- Mapping: `stock_config.location_id`
- Operator: LIKE % (case-insensitive partial match)
- Sample: "CFR1819" or "CFR"
- Resets pagination to page 1

**Item ID Search**:
- Input width: `min-width-[160px]`
- Placeholder: "Search Item ID..."
- Mapping: `stock_config.item_id`
- Format: 13-digit EAN barcode
- Operator: LIKE % (case-insensitive partial match)
- Sample: "885000000001" or "8850"
- Resets pagination to page 1

### Date Range Filters (2 Fields)

| # | Field | Type | Details |
|---|-------|------|---------|
| 23 | Config Start Date Picker | DATE | From date filter |
| 24 | Config End Date Picker | DATE | To date filter |

**Implementation**:
- Calendar popup component with CalendarIcon
- Format: ISO 8601 (YYYY-MM-DD)
- Labels: "From" and "To"
- Separator: Dash "-" between dates
- Applies to: `stock_config.start_date` field
- Behavior: Client-side filtering of loaded configs

### Dropdown Filters (2 Fields)

| # | Field | Type | Options |
|---|-------|------|---------|
| 25 | Channel Filter | VARCHAR(50) | All Channels, TOL, MKP, QC |
| 26 | Frequency Filter | VARCHAR(50) | All Frequencies, One-time, Daily |

**Channel Dropdown**:
- Default: "All Channels"
- Options: TOL (Tops Online), MKP (Marketplace), QC (Quick Commerce)
- Mapping: `stock_config.channel`
- Single-select (not multi-select)
- Resets pagination to page 1

**Frequency Dropdown**:
- Default: "All Frequencies"
- Options: "One-time", "Daily"
- Mapping: `stock_config.frequency`
- Single-select (not multi-select)
- Resets pagination to page 1

---

## 5. Stock Configurations Table (8 Columns)

### Table Columns

| # | Column | Type | Sortable | Details |
|---|--------|------|----------|---------|
| 27 | Location ID | VARCHAR(50) | ✓ Yes | Store/warehouse identifier |
| 28 | Item ID | VARCHAR(13) | ✓ Yes | 13-digit barcode |
| 29 | Quantity | INT | ✓ Yes | Override quantity |
| 30 | Supply Type | VARCHAR(50) | ✗ No | PreOrder or OnHand |
| 31 | Frequency | VARCHAR(50) | ✗ No | Daily or One-time |
| 32 | Channel | VARCHAR(50) | ✗ No | TOL, MKP, or QC |
| 33 | Start Date | TIMESTAMP | ✗ No | Effective start date |
| 34 | End Date | TIMESTAMP | ✗ No | Expiration date |

### Column Specifications

**Location ID Column** (Column 27):
- Database: `stock_config.location_id`
- Width: Auto (responsive)
- Font: Monospace (when needed for code clarity)
- Sortable: Yes (click header to toggle ↑↓)
- Sample: "CFR1819", "CFR2669", "CFR7914"
- Alignment: Left-aligned

**Item ID Column** (Column 28):
- Database: `stock_config.item_id`
- Format: 13-digit EAN-13 barcode
- Font: Monospace
- Sortable: Yes
- Sample: "885000000001", "2000001000002"
- Alignment: Left-aligned

**Quantity Column** (Column 29):
- Database: `stock_config.quantity`
- Type: Integer (positive numbers)
- Sortable: Yes
- Sample: "100", "250", "500"
- Alignment: Right-aligned
- No currency symbol (pure quantity)

**Supply Type Column** (Column 30):
- Database: `stock_config.supply_type`
- Values: "Preorder", "OnHand"
- Display: Color-coded badges
  - Purple badge: "Preorder"
  - Blue badge: "OnHand"
- Non-sortable
- Maps to UI terms: PreOrder = "Preorder", On Hand Available = "OnHand"

**Frequency Column** (Column 31):
- Database: `stock_config.frequency`
- Values: "Onetime", "Daily"
- Display: Gray badge
- Non-sortable
- Business logic: One-time configs use Onetime, Daily recurring use Daily

**Channel Column** (Column 32):
- Database: `stock_config.channel`
- Values: "TOL", "MKP", "QC"
- Display: Badge with muted styling
- Non-sortable
- Optional field (nullable)
- Sample: "TOL", "MKP", or empty

**Start Date Column** (Column 33):
- Database: `stock_config.start_date`
- Format: Locale formatted timestamp (e.g., "Jan 20, 2026 14:30")
- Non-sortable
- Visible only for "On Hand Available" configs (OnHand type)
- Timezone: GMT+7 (Asia/Bangkok)

**End Date Column** (Column 34):
- Database: `stock_config.end_date`
- Format: Locale formatted timestamp
- Non-sortable
- Visible only for "On Hand Available" configs
- Timezone: GMT+7
- Indicates when configuration expires

### Table Features

- **Pagination**: Configurable page size (default 25 items per page)
- **Results Count**: "Showing X of Y configurations" displayed below table
- **Empty State**: Message "No configurations found" when no data
- **Row Styling**: Alternating row backgrounds (odd rows bg-muted/30)
- **Hover Effect**: hover:bg-muted/50 with smooth transition
- **Sorting**: Click column header to toggle asc/desc (↑ ↓ indicators)
- **Default Sort**: Created At (descending - newest first)

---

## 6. Upload History Section (12 Fields)

### Section Header (2 Fields)

| # | Field | Type | Details |
|---|-------|------|---------|
| 37 | Title | VARCHAR(255) | "Upload History (0)" |
| 38 | Subtitle | VARCHAR(255) | Descriptive text |

**Title**: "Upload History" with file count in parentheses
**Subtitle**: "Recent file uploads and their processing status" (muted color)

### Upload History Filters (3 Fields)

| # | Field | Type | Details |
|---|-------|------|---------|
| 39 | File Search | VARCHAR(255) | Search by filename |
| 40 | Start Date Picker | DATE | From upload date |
| 41 | End Date Picker | DATE | To upload date |

**File Search**:
- Placeholder: "Search files..."
- Maps to: `stock_config_files.filename`
- Operator: LIKE % (partial match)
- Sample: "config_upload_2026_01.csv"

**Date Range**:
- Calendar pickers labeled "From" and "To"
- Filters: `stock_config_files.upload_date`
- Format: ISO 8601 date

### Upload History Tabs (4 Fields)

| # | Tab | Type | Filter |
|---|-----|------|--------|
| 42 | All | Fixed value | All files |
| 43 | Pending | Fixed value | folder = 'pending' |
| 44 | Processed | Fixed value | folder = 'arch' |
| 45 | Error | Fixed value | folder = 'err' |

**Tab Behavior**:
- Badge count on each tab
- Default: "All" tab selected
- Client-side tab switching

### Upload History Table (6 Fields)

| # | Column | Type | Details |
|---|--------|------|---------|
| 46 | File Column | VARCHAR(255) | Filename |
| 47 | Upload Date Column | TIMESTAMP | Date uploaded |
| 49 | Record Count Column | INT | Total records |
| 50 | Valid Records Column | INT | Successfully validated |
| 51 | Invalid Records Column | INT | Records with errors |
| 52 | Uploaded By Column | VARCHAR(255) | User who uploaded |
| 48 | Status Column | VARCHAR(50) | Processing status |
| 53 | Actions Column | N/A | File operations |

**File Column** (Column 46):
- Database: `stock_config_files.filename`
- Clickable: Yes (opens file download)
- Sample: "config_upload_2026_01.csv"

**Upload Date Column** (Column 47):
- Database: `stock_config_files.upload_date`
- Format: Locale formatted timestamp
- Sortable: Yes
- Sample: "Jan 20, 2026 at 14:30"

**Status Column** (Column 48):
- Database: `stock_config_files.status`
- Values: "pending", "processed", "error"
- Display: Badge with status color (yellow/gray/red)
- Maps to folders: pending, arch, err

**Record Count Column** (Column 49):
- Database: `stock_config_files.record_count`
- Right-aligned
- Sample: "250"

**Valid Records Column** (Column 50):
- Database: `stock_config_files.valid_records`
- Right-aligned
- Sample: "245"

**Invalid Records Column** (Column 51):
- Database: `stock_config_files.invalid_records`
- Right-aligned
- Sample: "5"

**Uploaded By Column** (Column 52):
- Database: `stock_config_files.uploaded_by`
- Type: User identifier (username or email)
- Display: Left-aligned text with user avatar icon
- Sample: "Current User", "Alex Rodriguez", "Mike Chen"
- Purpose: Audit trail showing who uploaded the file
- Non-sortable

**Actions Column** (Column 53):
- Buttons: View, Download, Delete
- Right-aligned
- View: Opens file detail modal with validation results
- Download: Initiates file download
- Delete: Removes file from history

---

## 7. Page Interactions (4 Fields)

| # | Feature | Type | Details |
|---|---------|------|---------|
| 53 | Sortable Headers | N/A | Click to toggle sort |
| 54 | Row Hover Effect | N/A | Background highlight |
| 55 | Empty State Message | VARCHAR(255) | No data message |
| 56 | Loading State | N/A | Skeleton loaders |

### Interaction Details

**Sortable Column Headers** (Field 53):
- Columns: Location ID, Item ID, Quantity (created at default)
- Visual: ↑ ↓ icons with opacity-40 for inactive
- Behavior: Click to toggle asc/desc
- Default sort: createdAt descending (newest first)

**Row Hover Effect** (Field 54):
- Style: `hover:bg-muted/50` with smooth CSS transition
- Cursor: `cursor-pointer` (indicates interactivity)
- Animation: 150ms ease-in-out

**Empty State Message** (Field 55):
- Text: "No upload history"
- Display: Centered card with Package icon
- Icon size: 64px (h-16 w-16)
- Icon color: `text-muted-foreground/50`

**Loading State** (Field 56):
- Display: 8 skeleton rows while fetching data
- Animation: Shimmer effect with 2-second cycle
- Replaces table during initial load

---

## 🗄️ Database Schema References

### Primary Tables

#### **stock_config**
```sql
CREATE TABLE stock_config (
  id VARCHAR(255) PRIMARY KEY,
  location_id VARCHAR(50) NOT NULL,
  item_id VARCHAR(13) NOT NULL,
  quantity INT NOT NULL,
  supply_type VARCHAR(50) NOT NULL,
  frequency VARCHAR(50) NOT NULL,
  channel VARCHAR(50),
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_config (location_id, item_id, supply_type, channel)
);
```

#### **stock_config_files**
```sql
CREATE TABLE stock_config_files (
  id VARCHAR(255) PRIMARY KEY,
  filename VARCHAR(255) NOT NULL,
  status VARCHAR(50) NOT NULL,
  upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  record_count INT DEFAULT 0,
  valid_records INT DEFAULT 0,
  invalid_records INT DEFAULT 0,
  folder VARCHAR(50) DEFAULT 'pending',
  error_message TEXT,
  uploaded_by VARCHAR(255),
  file_url VARCHAR(512)
);
```

---

## 🔗 API Integration

### Stock Config Endpoints

**Get Configurations**:
```
GET /api/stock-config
Query Parameters:
  - supplyType: "PreOrder" | "On Hand Available" | "all"
  - frequency: "One-time" | "Daily" | "all"
  - channel: "TOL" | "MKP" | "QC" | "all"
  - locationId: string (search filter)
  - itemId: string (search filter)
  - page: number (default 1)
  - pageSize: number (default 25)
  - sortBy: "locationId" | "itemId" | "quantity" | "supplyTypeId" | "channel" | "createdAt"
  - sortOrder: "asc" | "desc"

Response:
{
  "items": [
    {
      "id": "CONFIG-001",
      "locationId": "CFR1819",
      "itemId": "885000000001",
      "quantity": 100,
      "supplyTypeId": "PreOrder",
      "frequency": "One-time",
      "channel": "TOL",
      "startDate": null,
      "endDate": null,
      "createdAt": "2026-01-20T14:30:00Z",
      "updatedAt": "2026-01-20T14:30:00Z"
    }
  ],
  "total": 145,
  "page": 1,
  "pageSize": 25,
  "totalPages": 6
}
```

**Get Upload History**:
```
GET /api/stock-config/files
Query Parameters:
  - status: "pending" | "validated" | "processed" | "error" | "all"
  - page: number (default 1)
  - pageSize: number (default 25)

Response:
{
  "files": [
    {
      "id": "FILE1705756800000",
      "filename": "config_upload_2026_01.csv",
      "status": "processed",
      "uploadDate": "2026-01-20T14:30:00Z",
      "recordCount": 250,
      "validRecords": 245,
      "invalidRecords": 5,
      "folder": "arch",
      "fileUrl": "/api/download/FILE1705756800000"
    }
  ],
  "total": 8
}
```

---

## 📊 Statistics

| Metric | Value |
|--------|-------|
| **Total Fields** | 56 |
| **KPI Cards** | 4 |
| **Tab Views** | 3 |
| **Filter Fields** | 6 |
| **Table Columns** | 8 (stock configs) + 6 (upload history) |
| **Sortable Columns** | 3 |
| **Responsive Breakpoints** | 4+ |
| **Database Tables** | 2 |

---

## 🎯 Key Features

✅ Bulk CSV upload with validation and error reporting
✅ Line-by-line processing with progress tracking
✅ Supply type filtering (PreOrder vs On Hand Available)
✅ Multi-channel support (TOL, MKP, QC)
✅ Date range configuration for daily overrides
✅ Real-time file processing with status monitoring
✅ Complete upload history with audit trail
✅ Configurable pagination and sorting
✅ Responsive design (mobile to desktop)
✅ KPI summary cards for quick overview

---

## Document Information

- **Version**: 1.0
- **Created**: 2026-01-20
- **Page URL**: `/stock-config`
- **Component Files**:
  - `/app/stock-config/page.tsx` - Main page component
  - `/src/components/stock-config/*` - UI components
  - `/src/lib/stock-config-service.ts` - API/service layer
  - `/src/types/stock-config.ts` - Type definitions
- **Status**: ✅ Complete & Verified

