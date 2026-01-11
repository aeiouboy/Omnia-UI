# Chore: Redesign Audit Trail Tab to Match Manhattan Associates OMS Layout

## Metadata
adw_id: `8076245c`
prompt: `Redesign Audit Trail tab to exactly match Manhattan Associates OMS audit page layout.`

## Chore Description
Completely redesign the Audit Trail tab in the Order Detail view to match the Manhattan Associates OMS audit page layout exactly. This involves:

1. Replacing the current category tabs with a Manhattan-style filter bar containing Order Number display, Audit Trail dropdown, Audit Date picker, Order Line ID input, and APPLY button
2. Updating the table columns to match Manhattan exactly: UPDATED BY, UPDATED ON, ENTITY NAME, ENTITY ID, CHANGED PARAMETER, OLD VALUE, NEW VALUE
3. Removing colored badges, expandable rows, and current styled elements in favor of plain text presentation
4. Updating the audit event data interface and mock data generator to produce Manhattan-style records
5. Implementing APPLY button-triggered filtering (not auto-filter on change)

## Relevant Files
Use these files to complete the chore:

- **src/components/order-detail/audit-trail-tab.tsx** - Main component to be completely redesigned. Currently has category tabs, colored badges, expandable rows that need to be replaced with Manhattan-style filter bar and plain text table.

- **src/types/audit.ts** - Audit type definitions that need new interface fields for Manhattan-style data: updatedBy, updatedOn, entityName, entityId, changedParameter, oldValue, newValue.

- **src/lib/mock-data.ts** - Contains `generateMockAuditTrail()` function that needs to be updated to generate Manhattan-style audit events with realistic entity names and change parameters.

- **src/components/ui/table.tsx** - Existing table component to be used for the redesigned table layout.

- **src/components/ui/select.tsx** - Select component for the Audit Trail dropdown filter.

- **src/components/ui/calendar.tsx** - Calendar component for the Audit Date picker.

- **src/components/ui/input.tsx** - Input component for Order Line ID filter.

- **src/components/ui/button.tsx** - Button component for APPLY button.

- **src/components/ui/popover.tsx** - Popover component for date picker.

- **src/components/ui/card.tsx** - Card component wrapper for the audit trail section.

### New Files
No new files need to be created.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Update Audit Event Interface (src/types/audit.ts)
- Add new `ManhattanAuditEvent` interface with Manhattan-style fields:
  ```typescript
  export interface ManhattanAuditEvent {
    id: string
    orderId: string
    updatedBy: string        // User or system name (e.g., 'apiuser4TMS')
    updatedOn: string        // Timestamp with timezone (e.g., '01/09/2026 16:13 ICT')
    entityName: string       // Entity type (e.g., 'Order', 'QuantityDetail')
    entityId: string         // Entity identifier (can be long)
    changedParameter: string // Change description
    oldValue: string | null  // Previous value
    newValue: string | null  // New value
  }
  ```
- Add `EntityNameCategory` type for filter dropdown: `'All' | 'Order' | 'Fulfillment' | 'Payment' | 'System'`
- Keep existing types for backward compatibility but mark them as deprecated

### 2. Update Mock Data Generator (src/lib/mock-data.ts)
- Create new `generateManhattanAuditTrail()` function that generates Manhattan-style events
- Generate realistic `updatedBy` values: 'apiuser4TMS', 'system', 'warehouse_api', 'pos_sync', user names
- Format `updatedOn` as 'DD/MM/YYYY HH:mm ICT'
- Generate `entityName` values: 'Order', 'QuantityDetail', 'OrderTrackingDetail', 'PaymentDetail', 'ShipmentDetail', 'FulfillmentDetail', 'LineItem'
- Generate realistic `entityId` values like 'RM054260109018627', '407954183530051:82737:8424790100108'
- Generate `changedParameter` formats:
  - 'Inserted {EntityName}'
  - 'Changed {FieldName} from {old} to {new}'
  - 'Deleted {EntityName}'
  - 'Updated {FieldName}'
- Generate appropriate `oldValue` and `newValue` pairs (status values, dates, quantities, IDs)
- Export the new generator and deprecate the old `generateMockAuditTrail()` or update it to use the new format

### 3. Redesign Filter Bar Section (src/components/order-detail/audit-trail-tab.tsx)
- Remove category tabs (All, ORDER, FULFILLMENT, PAYMENT) completely
- Remove search input from header area
- Create Manhattan-style filter bar with single row layout:
  - Left side: 'Order Number: {orderId}' label (read-only text display)
  - 'Audit Trail' dropdown selector (options: All, Order, Fulfillment, Payment, System)
  - 'Audit Date' single date picker (not date range)
  - 'Order Line ID' text input field
  - 'APPLY' button (primary style, triggers filtering)
- Keep Export CSV and Refresh buttons in top-right corner
- Add filter state for pending filters (before APPLY is clicked)
- Add applied filters state (after APPLY is clicked)
- Implement APPLY button handler that copies pending filters to applied filters

### 4. Redesign Table Structure (src/components/order-detail/audit-trail-tab.tsx)
- Replace existing table columns with Manhattan columns:
  - Column 1: 'UPDATED BY' - User/system name (left aligned)
  - Column 2: 'UPDATED ON' - Timestamp with ICT timezone
  - Column 3: 'ENTITY NAME' - Entity type name
  - Column 4: 'ENTITY ID' - Entity identifier (allow text wrapping)
  - Column 5: 'CHANGED PARAMETER' - Change description (allow text wrapping)
  - Column 6: 'OLD VALUE' - Previous value
  - Column 7: 'NEW VALUE' - New value
- Remove these columns/features:
  - Audit Type badge column
  - Audit Action badge column
  - Details expand column
  - Expandable row functionality
- Use ALL CAPS for column headers
- Apply subtle gray background to header row
- Use white background for data rows
- Add subtle border between rows
- Use plain text only - no colored badges
- Allow text wrapping in ENTITY ID and CHANGED PARAMETER columns

### 5. Update Table Styling (src/components/order-detail/audit-trail-tab.tsx)
- Remove all badge components (AuditTypeBadge, ActionBadge, SourceBadge, ActorRoleBadge)
- Remove ActionIcon component
- Apply Manhattan-style CSS:
  - Header: `bg-gray-100` or `bg-muted/50`, uppercase text, `text-xs font-semibold`
  - Cells: Left-aligned text, `text-sm`, allow wrapping for long content
  - Row borders: `border-b border-gray-200`
  - Table container: `rounded-lg border overflow-hidden`
- Use monospace font for IDs and technical values (entityId, timestamps)

### 6. Update Filter Logic (src/components/order-detail/audit-trail-tab.tsx)
- 'Audit Trail' dropdown filters by `entityName` category mapping:
  - 'All': Show all events
  - 'Order': Filter where entityName is 'Order' or 'LineItem'
  - 'Fulfillment': Filter where entityName contains 'Fulfillment', 'Shipment', or 'Tracking'
  - 'Payment': Filter where entityName contains 'Payment'
  - 'System': Filter where entityName is 'QuantityDetail' or other system entities
- 'Audit Date' filters to specific date (compare date portion only)
- 'Order Line ID' filters by entityId containing the input string (case-insensitive)
- Filtering ONLY triggers when APPLY button is clicked (not on input change)
- Clear button resets all filters and immediately re-filters

### 7. Update CSV Export (src/components/order-detail/audit-trail-tab.tsx)
- Update CSV headers to match Manhattan columns:
  ```
  'UPDATED BY', 'UPDATED ON', 'ENTITY NAME', 'ENTITY ID', 'CHANGED PARAMETER', 'OLD VALUE', 'NEW VALUE'
  ```
- Update row mapping to use new field names
- Keep filename format: `audit-trail-{orderId}-{date}.csv`

### 8. Update Mobile View (src/components/order-detail/audit-trail-tab.tsx)
- Convert table to card-based layout on mobile (lg:hidden)
- Each card shows:
  - Header: Updated By and Updated On
  - Body: Entity Name
  - Change info: Changed Parameter
  - Values: Old Value → New Value
- Remove expandable functionality from mobile view
- Keep filter bar responsive (stack vertically on small screens)

### 9. Clean Up Unused Code (src/components/order-detail/audit-trail-tab.tsx)
- Remove unused imports: Badge, ChevronDown, ChevronUp, related icon imports
- Remove unused components: AuditTypeBadge, ActionBadge, SourceBadge, ActorRoleBadge, ActionIcon
- Remove expandedRows state and toggleRowExpansion callback
- Remove Fragment import if no longer needed
- Clean up any unused type imports from audit.ts

### 10. Validate Implementation
- Run `pnpm build` to verify no TypeScript errors
- Run `pnpm lint` to verify no ESLint warnings
- Visually verify:
  - Filter bar matches Manhattan: Order Number display, Audit Trail dropdown, Audit Date picker, Order Line ID input, APPLY button
  - Table columns match: UPDATED BY, UPDATED ON, ENTITY NAME, ENTITY ID, CHANGED PARAMETER, OLD VALUE, NEW VALUE
  - APPLY button triggers filtering
  - All filter combinations work correctly
  - CSV export has correct headers
  - Mobile view displays card format correctly

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm build` - Ensure no TypeScript compilation errors
- `pnpm lint` - Ensure no ESLint warnings or errors
- `pnpm dev` - Start dev server and manually verify:
  - Navigate to Order Detail page and select Audit Trail tab
  - Verify filter bar has: Order Number display, Audit Trail dropdown, Audit Date picker, Order Line ID input, APPLY button
  - Verify table columns are: UPDATED BY, UPDATED ON, ENTITY NAME, ENTITY ID, CHANGED PARAMETER, OLD VALUE, NEW VALUE
  - Verify APPLY button triggers filtering (changing inputs without clicking APPLY should not filter)
  - Test each filter combination
  - Test CSV export has correct headers
  - Test mobile responsive view shows card layout

## Notes
- The current implementation uses category tabs and colored badges which need to be completely removed
- Manhattan OMS uses a more corporate/enterprise styling with plain text and minimal visual flourishes
- The APPLY button pattern is important - users can set multiple filters before applying them all at once
- Entity IDs can be quite long (like '407954183530051:82737:8424790100108') so text wrapping is essential
- ICT timezone format should be 'DD/MM/YYYY HH:mm ICT' matching Bangkok timezone
- The filter bar should remain functional on mobile but stack vertically for better UX
