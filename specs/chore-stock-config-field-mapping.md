# Chore: Stock Config Field Mapping Documentation

## Metadata
adw_id: `stock-config-field-mapping`
prompt: `Create comprehensive field mapping documentation for Stock Config sub-menu page at https://v0-ris-oms.vercel.app/stock-config including all KPI cards, search filters, table columns, tab navigation, and upload history section. Use the standard template with 13 columns: No., Module, Page, Sub-Page, Session, Field, Description, DataType, Mapping_Type, Mapping_APIs_Database_Table, Mapping_Field_Name, Sample_Value, Remark. Save all documentation files to /Users/naruechon/Omnia-UI/docs/mapping/`

## Chore Description

This chore involves creating comprehensive field mapping documentation for the Stock Config management page (`/stock-config`), which handles stock configuration management for PreOrder and OnHand inventory override configurations across channels (TOL, MKP, QC).

The Stock Config page provides three primary workflows:
1. **Stock Configuration Management**: View, search, filter, and manage stock configurations with 8 table columns (Location ID, Item ID, Quantity, Supply Type, Frequency, Channel, Start Date, End Date)
2. **Bulk Configuration Upload**: File-based CSV upload with validation, processing, and error reporting
3. **Upload History Tracking**: Monitor file uploads, processing status (Pending/Processed/Error), and download reports

The documentation must comprehensively cover:
- **KPI Summary Cards** (4 cards): Total Configurations, Daily Configs, One-time Configs, Upload Status
- **Tab Navigation** (3 tabs): All Configs, PreOrder, OnHand with supply type filtering
- **Search & Filter Section** (5 filters): Location ID, Item ID, Date Range, Channel, Frequency
- **Stock Configurations Table** (8 columns): All fields with sortable/non-sortable indicators
- **Upload History Section** (3 components): File search, date range, upload status tabs with history table
- **Page Interactions**: Sorting, pagination, modal workflows (Upload, Validation, Processing, Report)

Database schema maps to table: `stock_config` with fields for location_id, item_id, quantity, supply_type, frequency, channel, start_date, end_date, created_at, updated_at

## Relevant Files

### Existing Component Files
- **App Page**: `/app/stock-config/page.tsx` - Main Stock Config page component with state management, filters, and data loading
- **Type Definitions**: `/src/types/stock-config.ts` - TypeScript interfaces defining StockConfigItem, StockConfigFile, SupplyTypeID, Frequency, Channel enums
- **Service Layer**: `/src/lib/stock-config-service.ts` - API calls for getStockConfigs(), getFileHistory(), saveStockConfig()
- **UI Components**:
  - `/src/components/stock-config/stock-config-table.tsx` - Main table displaying configurations
  - `/src/components/stock-config/file-upload-modal.tsx` - File upload workflow modal
  - `/src/components/stock-config/upload-history-table.tsx` - Upload history table
  - `/src/components/stock-config/validation-results-table.tsx` - Validation error/warning display
  - `/src/components/stock-config/processing-progress-modal.tsx` - Real-time processing progress
  - `/src/components/stock-config/post-processing-report.tsx` - Final results report

### Playwright Snapshot (Already Captured)
- `/.playwright-mcp/stock-config-page-snapshot.md` - Page structure accessibility snapshot showing all elements

### New Files to Create
- `/docs/mapping/stock-config-field-mapping.csv` - 13-column CSV with all fields (expect ~50-60 fields total)
- `/docs/mapping/stock-config-field-mapping.md` - Detailed markdown documentation with implementation examples
- `/docs/mapping/STOCK-CONFIG-INDEX.md` - Quick reference index linking to specific field sections
- `/docs/mapping/stock-config-file-upload-workflow.csv` (optional) - Additional documentation for upload modal fields if needed

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Analyze Complete Page Structure and Field Inventory
- Open Stock Config page in browser and capture all visible fields and controls
- Review `/app/stock-config/page.tsx` (page component) for state management and field definitions
- Review `/src/types/stock-config.ts` for TypeScript type definitions and interfaces
- Identify all fields organized by section:
  - Page Header (3-4 fields)
  - KPI Cards Section (4 cards × multiple fields each = ~12-16 fields)
  - Tab Navigation (3 tabs = 3 fields)
  - Search & Filter Section (5 filter fields)
  - Stock Configurations Table (8 columns)
  - Upload History Section (5+ fields)
  - Page Interactions (5-8 fields for sorting, pagination, modal workflows)
- Total estimated: 50-70 fields across all sections

### 2. Classify Fields by Mapping Type
- **Direct Fields** (Database 1:1 mapping):
  - locationId → location_id
  - itemId → item_id
  - quantity → quantity
  - supplyTypeId → supply_type
  - frequency → frequency
  - channel → channel
  - startDate → start_date
  - endDate → end_date
  - createdAt → created_at
  - updatedAt → updated_at
  - KPI count fields (totalConfigurations, dailyConfigs, onTimeConfigs from COUNT queries)

- **Fixed Value Fields** (Predefined enums):
  - Supply Type Tab options: "All Configs", "PreOrder", "OnHand"
  - Channel dropdown: "All Channels", "TOL", "MKP", "QC"
  - Frequency dropdown: "All Frequencies", "One-time", "Daily"
  - Upload Status tabs: "All", "Pending", "Processed", "Error"
  - File Status values: "pending", "validated", "processed", "error"

- **Logic Fields** (Calculated/conditional):
  - Upload Status counters (count by status: Pending/0, Processed/0, Errors/0)
  - "Showing X of Y configurations" (pagination text)
  - Row styling/alternating backgrounds
  - Sort indicators on table headers

### 3. Identify Database Schema and API Mappings
- Review `/src/lib/stock-config-service.ts` for API endpoint signatures
- Identify database table: `stock_config` (primary) + `stock_config_files` (for upload history)
- Field mappings from types:
  ```typescript
  interface StockConfigItem {
    id: string
    locationId: string        // Direct → location_id
    itemId: string            // Direct → item_id
    quantity: number          // Direct → quantity
    supplyTypeId: SupplyTypeID // Direct → supply_type ("PreOrder"|"On Hand Available")
    frequency: Frequency      // Direct → frequency ("One-time"|"Daily")
    channel?: Channel         // Direct → channel ("TOL"|"MKP"|"QC")
    startDate?: string        // Direct → start_date (only for OnHand)
    endDate?: string          // Direct → end_date (only for OnHand)
    createdAt: string         // Direct → created_at
    updatedAt: string         // Direct → updated_at
  }
  ```

### 4. Create CSV Field Mapping Document
- Create file: `/docs/mapping/stock-config-field-mapping.csv`
- Use 13-column structure: No., Module, Page, Sub-Page, Session, Field, Description, DataType, Mapping_Type, Mapping_APIs_Database_Table, Mapping_Field_Name, Sample_Value, Remark
- Organize by sections:
  - Page Header (3-4 rows)
  - KPI Cards - Total Configurations (4 rows)
  - KPI Cards - Daily Configs (4 rows)
  - KPI Cards - One-time Configs (4 rows)
  - KPI Cards - Upload Status (4 rows with logic-based counters)
  - Tab Navigation (3 rows)
  - Search & Filters (5 rows)
  - Stock Configurations Table (8 column rows)
  - Upload History Section (5+ rows)
  - Page Interactions (5+ rows)
- Example row format:
  ```
  1,Stock Config,Stock Config Management,Configuration Table,Search & Filters,Location ID Search,Search input for filtering by location,VARCHAR,Direct,stock_config,location_id,CFR1819,Search field with min-width 160px
  ```

### 5. Create Comprehensive Markdown Documentation
- Create file: `/docs/mapping/stock-config-field-mapping.md`
- Structure with sections matching CSV organization
- Include for each section:
  - Section heading with icon (📋 Overview, 🔍 Filters, 📊 KPI Cards, etc.)
  - Field count summary table showing fields and status
  - Detailed field specifications with:
    - Field name, type, database mapping
    - UI specifications (width, styling, colors)
    - Sample values with actual data examples
    - Conditional logic (when displayed, validation rules)
  - Implementation notes from component analysis
- Include subsections for:
  - Stock Configuration Table columns (8 columns documented)
  - Upload History features and workflow
  - Date range filters (From/To pickers with ISO format)
  - Channel and Frequency dropdowns (with options)
  - Supply Type logic (PreOrder vs On Hand Available differences)
- Add database schema CREATE TABLE statement for `stock_config` table
- Add TypeScript interface definitions from types/stock-config.ts
- Document API endpoints used:
  - GET /api/stock-config - getStockConfigs(filters)
  - POST /api/stock-config/files - file upload
  - GET /api/stock-config/files - getFileHistory()

### 6. Create INDEX Documentation File
- Create file: `/docs/mapping/STOCK-CONFIG-INDEX.md`
- Quick reference guide with:
  - Field count summary (Total: X fields across Y sections)
  - Quick navigation links to each section
  - KPI card specifications at a glance
  - Table column quick reference (sortable Y/N, width, hidden breakpoint)
  - Filter options quick lookup (Channel: TOL/MKP/QC, Frequency: One-time/Daily)
  - Supply Type explanations (PreOrder vs On Hand Available)
  - Upload workflow summary (3-phase: Upload → Validate → Process)
- Format as compact table-based reference for quick lookups

### 7. Validate Documentation Completeness
- Verify all visible UI fields from Playwright snapshot are documented
- Check that all 8 table columns are documented with specifications
- Confirm all 4 KPI cards have complete field specifications
- Verify all filters (5) are documented with sample values
- Check that upload history section fields are documented
- Ensure database mappings match type definitions in /src/types/stock-config.ts
- Validate that Mapping_Type classifications are correct (Direct/Fixed value/Logic)
- Cross-reference with component code to ensure no fields missed
- Verify sample values are realistic and match actual UI data

### 8. Final Review and Commit
- Review all three files for completeness and consistency
- Ensure consistent formatting across CSV and markdown
- Verify file paths match `/Users/naruechon/Omnia-UI/docs/mapping/` requirement
- Check that field counts in INDEX match actual CSV/markdown row counts
- Validate CSV can be parsed by Excel/Google Sheets (proper escaping)
- Ensure all sample values are realistic (store IDs, item IDs, quantities)
- Commit files to git with clear message describing Stock Config documentation creation

## Validation Commands

Execute these commands to validate the chore is complete:

- `ls -lh /Users/naruechon/Omnia-UI/docs/mapping/stock-config*` - Verify all three files are created with proper sizes (CSV 10-15KB, markdown 20-30KB, INDEX 5-10KB)
- `head -3 /Users/naruechon/Omnia-UI/docs/mapping/stock-config-field-mapping.csv && wc -l /Users/naruechon/Omnia-UI/docs/mapping/stock-config-field-mapping.csv` - Verify CSV structure and count rows (expect 50-70 data rows)
- `grep -c "^##" /Users/naruechon/Omnia-UI/docs/mapping/stock-config-field-mapping.md` - Verify markdown has section headings (expect 8+ sections)
- `grep -c "LocationID\|ItemID\|Quantity\|SupplyType" /Users/naruechon/Omnia-UI/docs/mapping/stock-config-field-mapping.csv` - Verify key table columns documented
- `grep "Direct\|Fixed value\|Logic" /Users/naruechon/Omnia-UI/docs/mapping/stock-config-field-mapping.csv | sort | uniq -c` - Verify mapping types distribution (expect all three types present)
- `grep -c "sample\|example" /Users/naruechon/Omnia-UI/docs/mapping/stock-config-field-mapping.md` - Verify documentation includes examples (expect 30+ examples)
- `git status | grep stock-config` - Verify new files appear in git status ready to commit

## Notes

**Field Count Estimate**: The Stock Config page should document approximately 50-70 fields organized across:
- Page Header: 3-4 fields
- KPI Cards (4 cards): 12-16 fields total
- Tab Navigation: 3 fields
- Search & Filters: 5 fields
- Stock Configurations Table: 8 columns
- Upload History: 8-10 fields
- Page Interactions: 6-8 fields

**Key Mapping Differences**:
- Supply Type has two formats: "PreOrder" (one-time) and "On Hand Available" (daily)
- Channel is optional for some configurations
- Date fields (startDate/endDate) only apply to "On Hand Available" configs
- Upload Status KPI counters use calculated logic (COUNT by status)

**Component Architecture Notes**:
- Main page uses React hooks for state management (useState, useCallback, useMemo)
- Filters are built from 5+ individual state values and passed to API
- Upload workflow uses 3-phase modal system (Upload → Validate → Process)
- Sorting supported on Location ID, Item ID, Quantity, Supply Type, Channel, Created At
- Pagination with configurable page sizes (default 25 items)

**Database Considerations**:
- Primary table: `stock_config` with location_id, item_id, quantity, supply_type, frequency, channel, start_date, end_date
- File tracking table: `stock_config_files` for upload history
- Both tables have created_at/updated_at timestamps

**Consistency with Other Documentation**:
- Follow same CSV template as Order Management (187 fields) and Inventory mappings
- Use same markdown section formatting as existing inventory documentation
- Create INDEX file matching format of STOCK-CARD-INDEX.md
- Maintain consistent field count display format in INDEX

