# Chore: Create Order Management Field Mapping Documentation

## Metadata
- **adw_id**: chore-omni-001
- **prompt**: Create comprehensive field mapping documentation for Order Management page including all filtering options and table columns
- **created**: 2026-01-20
- **target_dir**: `/Users/naruechon/Omnia-UI/docs/mapping/`

## Chore Description

Create a comprehensive field mapping document for the Order Management page in the Omnia UI platform. This document should catalog:

1. **All filtering fields** (basic and advanced)
2. **All table columns** (16 total)
3. **Data types** and field descriptions
4. **API mappings** to backend database tables
5. **Sample values** for reference

The output should be saved as a CSV or Excel-compatible mapping document following the standard template format with columns:
- No.
- Module
- Page
- Sub-Page
- Session
- Field
- Description
- DataType
- Mapping Type
- Mapping APIs / Database Table
- Mapping Field Name
- Sample Value
- Remark

## Relevant Files

### Source Files to Analyze
- `src/components/order-management-hub.tsx` - Main Order Management component with filtering logic
- `app/api/orders/route.ts` - API endpoint handling order queries and filtering
- `src/lib/order-utils.ts` - Order utility functions and transformations
- `src/types/` - TypeScript type definitions for orders and related data
- `src/lib/orders-service.ts` - Order service with business logic

### Reference Files
- `.claude/CLAUDE.md` - Project context and API structure documentation
- `README.md` - Project overview

### New Files to Create
- `docs/mapping/order-management-field-mapping.csv` - CSV export of all field mappings
- `docs/mapping/order-management-field-mapping.md` - Markdown documentation with details

## Step by Step Tasks

### 1. Analyze Basic Filter Fields
- Review `src/components/order-management-hub.tsx` for basic filter implementations
- Document search fields: Order #, Customer Name, Email, Phone
- Document dropdowns: Order Status, Store No, Channel, Payment Status, Payment Method
- Document date pickers: Order Date From/To
- Extract data types and default values for each field
- Identify API parameter names and mappings

### 2. Analyze Advanced Filter Fields
- Review advanced filter section in Order Management component
- Document Product Search: SKU input, Item Name input
- Document Customer Search: Name, Email, Phone inputs
- Document Order Details: Type dropdown
- Map each field to API request parameters
- Identify validation rules and constraints

### 3. Analyze Table Column Fields
- Extract 16 table columns from table header row
- For each column identify:
  - Display name
  - Data type (VARCHAR, NUMERIC, DATE, BOOLEAN, ENUM, etc.)
  - Source in API response
  - Transformation logic if applicable
  - Sample values from loaded data
- Document SLA Status special formatting (time display + status)
- Document badges and conditional rendering

### 4. Research API and Database Mappings
- Review `app/api/orders/route.ts` to understand API response structure
- Identify database table names for each field (typically `orders` table)
- Extract field name mappings from API response to UI display
- Document any JOIN tables (customers, payments, etc.)
- Note transformation functions applied (e.g., formatGMT7TimeString)

### 5. Document Filter to API Mapping
- Map each filter to API query parameters
- Document filter logic:
  - Search term matching (LIKE queries)
  - Status enum values (PENDING, PAID, FAILED, etc.)
  - Channel values (web, shopee, lazada, etc.)
  - Date range filtering
- Create parameter mapping table

### 6. Create Mapping CSV File
- Generate CSV with all documented fields
- Include columns: No., Module, Page, Sub-Page, Session, Field, Description, DataType, Mapping Type, Mapping APIs / Database Table, Mapping Field Name, Sample Value, Remark
- Organize by section: Basic Filters, Advanced Filters, Table Columns
- Use consistent naming conventions
- Add remarks about special cases (e.g., SLA Status formatting)

### 7. Create Markdown Documentation
- Create detailed markdown guide with:
  - Overview of Order Management page architecture
  - Filter section documentation with examples
  - Table columns documentation
  - API request/response examples
  - Database schema references
  - Type definitions and enums
- Include code snippets from source files

### 8. Validate Completeness
- Cross-reference Playwright snapshot against documented fields
- Verify all 16 table columns are documented
- Verify all filter options are documented
- Check sample values are accurate
- Ensure API mappings are correct
- Validate CSV format and completeness

## Validation Commands

Execute these commands to validate the chore is complete:

```bash
# Verify files were created
ls -lah /Users/naruechon/Omnia-UI/docs/mapping/

# Check CSV file exists and has content
head -5 /Users/naruechon/Omnia-UI/docs/mapping/order-management-field-mapping.csv
wc -l /Users/naruechon/Omnia-UI/docs/mapping/order-management-field-mapping.csv

# Check markdown file exists
cat /Users/naruechon/Omnia-UI/docs/mapping/order-management-field-mapping.md | head -50

# Verify CSV has expected columns
grep -o "," /Users/naruechon/Omnia-UI/docs/mapping/order-management-field-mapping.csv | wc -l
```

## Notes

### Data Mapping Context
- **Order Status values**: PENDING, PROCESSING, READY_FOR_PICKUP, OUT_FOR_DELIVERY, DELIVERED, CANCELLED, SUBMITTED
- **Payment Status values**: PAID, PENDING, FAILED
- **Channel values**: web, shopee, lazada
- **Order Type values**: DELIVERY, PICKUP, SHIP_TO_STORE, CLICK_AND_COLLECT
- **SLA Status**: Formatted as "Xm LEFT" or "Xm BREACH" with status badges

### Special Formatting
- Currency amounts use Thai Baht symbol (฿) with comma separators
- Dates use GMT+7 timezone via `formatGMT7TimeString()`
- Phone numbers support international format
- SLA status includes visual indicators (icons with color coding)

### API Structure
- Primary API endpoint: `/api/orders`
- Response includes pagination metadata
- Each order object contains nested customer, payment, and metadata objects
- Sample values should come from actual mock data used in development

### Database References
- Primary table: `orders` table in Supabase
- Related tables: `customers`, `payments`, `order_items`, `shipments`
- Field naming in database uses snake_case (order_no, created_at, etc.)
- UI converts to camelCase for JavaScript

### Mapping Type Classification
- **Fixed value**: Predefined constant values (enums, dropdowns with fixed options)
- **Direct**: Field directly from API response with no transformation
- **Logic**: Field derived or calculated from API response (e.g., SLA status, conditional rendering)

