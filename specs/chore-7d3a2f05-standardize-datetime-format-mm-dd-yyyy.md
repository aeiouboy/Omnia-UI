# Chore: Standardize Date/Time Format to MM/DD/YYYY HH:mm:ss

## Metadata
adw_id: `7d3a2f05`
prompt: `Analyze all time value displays and formatting in the codebase. The target format should be: MM/DD/YYYY HH:mm:ss (e.g., 11/21/2025 10:42:00). Identify all locations where time/date values are displayed or formatted, including: 1) Utility functions in lib/utils.ts, 2) Component displays (tables, cards, details), 3) API response handling, 4) Mock data generators. Create a comprehensive plan to standardize all time displays to use this format consistently across the application.`

## Chore Description
Standardize all date/time formatting across the Omnia UI application to use a consistent MM/DD/YYYY HH:mm:ss format (e.g., 11/21/2025 10:42:00). Currently, the codebase uses multiple inconsistent date/time formats:

**Current Formats Found:**
1. **DD/MM/YYYY HH:mm:ss** - Used in `formatOrderCreatedDate` (order-detail-view.tsx:208)
2. **Month DD, YYYY HH:mm** - Used in various utility functions with `toLocaleString`
3. **MM/DD/YYYY** - Used in `formatGMT7DateString` (lib/utils.ts:65)
4. **ISO 8601** - Used in API responses and data storage
5. **Short formats** - "Month DD, YYYY" without time in some components

**Target Standardization:**
- **Display Format**: MM/DD/YYYY HH:mm:ss (e.g., 11/21/2025 10:42:00)
- **Timezone**: GMT+7 (Asia/Bangkok) for all user-facing displays
- **Storage Format**: ISO 8601 (unchanged) for API/database operations
- **Consistency**: All tables, cards, details views, and exports use the same format

**Scope:**
- Utility functions in `src/lib/utils.ts` and `src/lib/timezone-utils.ts`
- Component displays: order tables, order details, transaction tables, inventory
- Export utilities in `src/lib/export-utils.ts`
- Mock data generators in `src/lib/mock-data.ts`
- API response handling and formatting
- All 224 TypeScript files in the `src/` directory

## Relevant Files

### Core Utility Files (Primary Changes)
- **src/lib/utils.ts** - Main utility file containing `formatGMT7TimeString`, `formatGMT7DateString`, `formatGMT7DateTime` functions that need to be updated to produce MM/DD/YYYY HH:mm:ss format
- **src/lib/timezone-utils.ts** - Contains `formatBangkokTime` and `formatBangkokDateTime` functions that should align with the new format
- **src/lib/export-utils.ts** - Contains `formatDateForExport` (line 48) and `formatDateGMT7ForExport` (line 72) that need to output MM/DD/YYYY HH:mm:ss for CSV exports

### Component Files (Secondary Changes)
- **src/components/order-detail-view.tsx** - Contains `formatOrderCreatedDate` function (line 208) that currently uses DD/MM/YYYY HH:mm:ss format and needs to be updated to MM/DD/YYYY HH:mm:ss
- **src/components/order-management-hub.tsx** - Uses `formatGMT7DateTime` for Created Date column (line 1207) and order date exports (line 1673)
- **src/components/recent-transactions-table.tsx** - Contains `formatDateTime` function (line 81) that needs updating
- **src/components/allocate-by-order-table.tsx** - Contains `formatDateTime` function (line 67) for transaction timestamps
- **src/components/stock-config/stock-config-table.tsx** - Contains `formatDate` function (line 102) that needs alignment
- **src/components/executive-dashboard.tsx** - Uses date/time utilities for dashboard displays and analytics
- **src/components/inventory/transaction-history-section.tsx** - Displays transaction timestamps
- **src/components/inventory/product-info-card.tsx** - May display date/time information

### Mock Data and Service Files
- **src/lib/mock-data.ts** - Contains multiple date formatting functions including `formatDateDDMMYYYY` (line 2250) and MAO format helpers (line 1376)
- **src/lib/mock-inventory-data.ts** - Generates mock timestamps for inventory transactions
- **src/lib/stock-card-mock-data.ts** - Generates mock stock card data with timestamps
- **src/lib/dashboard-service.ts** - Handles date ranges and filtering logic
- **src/lib/orders-service.ts** - Contains `toISOString()` calls for updated_at timestamps

### Other Files with Date/Time Usage
- **src/components/order-detail/audit-trail-tab.tsx** - Displays audit timestamps
- **src/components/order-detail/tracking-tab.tsx** - Shows tracking event timestamps
- **src/components/stock-config/file-detail-modal.tsx** - Displays file upload/processing timestamps
- **src/components/executive-dashboard/utils.ts** - Contains dashboard utility functions
- **src/components/executive-dashboard/data-fetching.ts** - Handles data with timestamps
- **app/api/orders/route.ts** - API endpoint that may format dates in responses
- **app/api/orders/external/route.ts** - External API integration with date handling

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Create New Standardized DateTime Utility Functions
- Create new function `formatStandardDateTime` in `src/lib/utils.ts` that returns MM/DD/YYYY HH:mm:ss format
- Implement proper GMT+7 timezone handling using `toLocaleString` with explicit format options
- Add proper error handling with fallback to current date/time
- Create companion functions: `formatStandardDate` (MM/DD/YYYY only) and `formatStandardTime` (HH:mm:ss only)
- Add JSDoc comments explaining the standard format and usage
- Ensure functions handle Date objects, ISO strings, timestamps, null, and undefined inputs

### 2. Update Core Utility Functions in lib/utils.ts
- Update `formatGMT7DateTime` function to use MM/DD/YYYY HH:mm:ss format instead of current format
- Update `formatGMT7DateString` function to return MM/DD/YYYY format (currently returns MM/DD/YYYY correctly)
- Update `formatGMT7TimeString` function to return HH:mm:ss format (verify current implementation)
- Ensure all functions use consistent `toLocaleString` options with proper timezone
- Keep `safeToISOString` unchanged as it's for API/storage purposes
- Update `formatGMT7Time` to align with new standard if used for display

### 3. Update Timezone Utility Functions in lib/timezone-utils.ts
- Update `formatBangkokDateTime` function to return MM/DD/YYYY HH:mm:ss format
- Align `formatBangkokTime` to return HH:mm:ss if used for time-only display
- Ensure consistency with `src/lib/utils.ts` functions
- Consider deprecating redundant functions and consolidating into utils.ts

### 4. Update Export Utility Functions in lib/export-utils.ts
- Update `formatDateForExport` function (line 48) to use MM/DD/YYYY HH:mm:ss format
- Update `formatDateGMT7ForExport` function (line 72) to use MM/DD/YYYY HH:mm:ss format
- Update `transactionExportColumns` configuration (line 139) to use new formatter
- Test CSV export to ensure proper Excel/spreadsheet compatibility with new format
- Verify escapeCSVValue properly handles the new date format

### 5. Update Component-Specific Formatting Functions
- **order-detail-view.tsx**: Update `formatOrderCreatedDate` function (line 208) from DD/MM/YYYY to MM/DD/YYYY format
- **recent-transactions-table.tsx**: Update `formatDateTime` function (line 81) to use new standard format
- **allocate-by-order-table.tsx**: Update `formatDateTime` function (line 67) to use new standard format
- **stock-config-table.tsx**: Update `formatDate` function (line 102) to use new standard format
- Remove local formatting functions where possible and import from centralized utils instead

### 6. Update Order Management Hub Component
- Review all date/time displays in order-management-hub.tsx
- Update Created Date column rendering (line 1207) to use new `formatStandardDateTime`
- Update export functions (line 1673) to use new standardized format
- Update mobile card view date displays if they exist
- Verify skeleton loading states don't hard-code date format examples
- Test filter date range displays and ensure they use consistent format

### 7. Update Mock Data Generators
- Update `src/lib/mock-data.ts` function `formatDateDDMMYYYY` (line 2250) to use MM/DD/YYYY format
- Update MAO format helper (line 1376) to use standard MM/DD/YYYY HH:mm:ss format
- Review all date assignments in mock order generation to ensure consistency
- Update `src/lib/mock-inventory-data.ts` timestamp generation
- Update `src/lib/stock-card-mock-data.ts` timestamp formatting
- Ensure mock data uses GMT+7 timezone consistently

### 8. Update Dashboard and Analytics Components
- Review `src/components/executive-dashboard.tsx` for all date/time displays
- Update Recent Orders table timestamps to use new format
- Update alert timestamps and SLA displays
- Review `src/components/executive-dashboard/utils.ts` for date formatting
- Update `src/components/executive-dashboard/data-fetching.ts` if it formats dates
- Ensure dashboard refresh timestamps use new format

### 9. Update Order Detail View Components
- Review all tabs in order-detail-view.tsx for date/time displays
- Update order created, updated, and status change timestamps
- Update `src/components/order-detail/audit-trail-tab.tsx` audit timestamps
- Update `src/components/order-detail/tracking-tab.tsx` tracking event times
- Update delivery time slots and booking times (lines 1206, 1212)
- Ensure all timestamps are GMT+7 formatted

### 10. Update Inventory and Stock Components
- Update `src/components/inventory/transaction-history-section.tsx` transaction timestamps
- Update `src/components/inventory/product-info-card.tsx` if it displays dates
- Update `src/components/stock-config/file-detail-modal.tsx` file timestamps
- Ensure transaction tables across all inventory views use consistent format
- Update any inventory export functions to use new format

### 11. Update API Response Formatting
- Review `app/api/orders/route.ts` to ensure responses don't include formatted dates (should use ISO)
- Review `app/api/orders/external/route.ts` for any date formatting in API responses
- Ensure API endpoints return ISO 8601 format for storage/transmission
- Update any middleware or interceptors that format dates
- Document that formatting should happen in components, not API responses

### 12. Global Search and Replace for Common Patterns
- Search for all instances of `toLocaleString("en-US"` and verify they use correct format options
- Search for `DD/MM/YYYY`, `dd/MM/yyyy`, `MM-DD-YYYY` patterns and update to MM/DD/YYYY
- Search for `month: "short"` pattern and update to `month: "2-digit"` for numeric format
- Search for any hard-coded date format examples in comments or placeholder text
- Update any date format documentation in JSDoc comments

### 13. Update Tests and Validation
- Create test file to validate new formatting functions
- Test with various date inputs: past dates, future dates, null, undefined, invalid dates
- Test timezone conversion accuracy for GMT+7
- Test date parsing from ISO strings, timestamps, and Date objects
- Verify CSV export formats properly in Excel
- Test mobile and desktop views for date display consistency

### 14. Comprehensive Visual Validation
- Build the application: `pnpm build`
- Start development server: `pnpm dev`
- Navigate to Order Management Hub and verify Created Date column shows MM/DD/YYYY HH:mm:ss
- Open Order Detail view and verify all timestamps use new format
- Check Executive Dashboard recent orders and alerts for correct format
- Verify transaction history tables in inventory section
- Test CSV export from multiple pages and verify format in Excel
- Check mobile responsive views for date display
- Verify skeleton loading states and empty states don't show old format examples

### 15. Documentation and Cleanup
- Update CLAUDE.md with new date/time formatting standard
- Add section documenting MM/DD/YYYY HH:mm:ss as the official format
- Document that all user-facing dates must use GMT+7 timezone
- Create code comment standards for date formatting functions
- Remove deprecated or unused formatting functions
- Add migration notes if any breaking changes affect external integrations

## Validation Commands
Execute these commands to validate the chore is complete:

```bash
# 1. Search for old DD/MM/YYYY pattern to ensure none remain
grep -r "DD/MM/YYYY\|dd/MM/yyyy" src/ --include="*.ts" --include="*.tsx"

# 2. Search for inconsistent date formatting patterns
grep -r "month.*short\|month.*long" src/ --include="*.ts" --include="*.tsx"

# 3. Verify new formatting functions exist
grep -r "formatStandardDateTime\|formatStandardDate" src/lib/utils.ts

# 4. Check that components import centralized utilities
grep -r "formatGMT7DateTime\|formatStandardDateTime" src/components/ --include="*.tsx" | head -20

# 5. Verify export utilities updated
grep -A 10 "formatDateForExport\|formatDateGMT7ForExport" src/lib/export-utils.ts

# 6. Test TypeScript compilation
pnpm build

# 7. Run development server for visual validation
pnpm dev
# Then manually verify:
# - Order Management Hub: Created Date column
# - Order Detail View: All timestamp fields
# - Executive Dashboard: Recent orders and alerts
# - Transaction History: All transaction timestamps
# - CSV Export: Download and open in Excel to verify format

# 8. Search for any remaining inconsistent date formats
grep -r "toLocaleString" src/ --include="*.ts" --include="*.tsx" | grep -v "MM/DD/YYYY\|formatStandard\|currency"

# 9. Verify no hard-coded format examples in comments
grep -r "11/21/2025\|21/11/2025\|2025-11-21" src/ --include="*.ts" --include="*.tsx"
```

## Notes

### Format Rationale
- **MM/DD/YYYY HH:mm:ss** format chosen for US-style date formatting consistency
- **24-hour time** (HH:mm:ss) eliminates AM/PM ambiguity
- **GMT+7 timezone** maintained for Bangkok/Thailand operations
- **ISO 8601** format retained for API/database operations (internal use only)

### Breaking Changes
- Users may notice date format change from DD/MM/YYYY to MM/DD/YYYY
- CSV exports will have new date format (may affect automated import scripts)
- Any external systems parsing date strings from API responses should use ISO format, not display format

### Performance Considerations
- Date formatting functions are called frequently in tables and lists
- Consider memoization for expensive formatting operations
- Avoid creating new Date objects unnecessarily
- Cache formatted values when rendering large datasets

### Accessibility
- Ensure screen readers properly announce formatted dates
- Consider adding aria-labels with spelled-out dates for critical timestamps
- Maintain ISO format in datetime attributes for machine readability

### Future Enhancements
- Consider user preference settings for date format (US vs EU)
- Implement relative time displays ("2 hours ago") for recent timestamps
- Add timezone selector for international users
- Create date formatting utility that accepts format string parameter

### Testing Checklist
- [ ] Desktop view: All tables show MM/DD/YYYY HH:mm:ss
- [ ] Mobile view: All cards/lists show MM/DD/YYYY HH:mm:ss
- [ ] Order Detail: All 10+ timestamp fields use new format
- [ ] CSV Export: Excel opens with correct date format in columns
- [ ] Dashboard: Recent orders and alerts show new format
- [ ] Inventory: Transaction history uses new format
- [ ] No console errors related to date parsing
- [ ] TypeScript compilation passes with no errors
- [ ] Search results show no DD/MM/YYYY pattern remaining

### Migration Strategy
1. Update utility functions first (single source of truth)
2. Update components to use centralized utilities
3. Remove component-specific formatting functions
4. Update mock data generators
5. Validate visually across all pages
6. Document changes in CLAUDE.md
7. Consider adding changelog entry for users

### Rollback Plan
If issues arise:
1. Revert changes to `src/lib/utils.ts` and `src/lib/export-utils.ts`
2. Components will fall back to old formatting automatically
3. Test that reverting doesn't break any functionality
4. Git commit structure should allow selective revert of formatting changes
