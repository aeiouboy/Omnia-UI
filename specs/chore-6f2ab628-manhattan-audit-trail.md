# Chore: Enhance Audit Trail Tab with Manhattan OMS Design

## Metadata
adw_id: `6f2ab628`
prompt: `Enhance the Audit Trail tab to match Manhattan Associates OMS audit page design patterns.`

## Chore Description
Redesign the Audit Trail tab component to match Manhattan Associates OMS audit page design patterns. This includes:
- Adding an Audit Type category system for better event classification
- Replacing the dropdown filter with horizontal category tabs showing counts
- Updating table columns to match Manhattan OMS layout (Audit Date, Audit Type, Audit Action, Description, Modified By, Details)
- Updating action type labels to use cleaner Manhattan-style naming
- Styling updates including category badges, outline action badges, and tab bar with underline highlight
- Updating mock data to include auditType field with proper mapping

## Relevant Files
Use these files to complete the chore:

- **src/types/audit.ts** - Contains AuditEvent interface and AUDIT_ACTION_CONFIG. Need to add AuditType enum, update AuditEvent interface with auditType field, and add AUDIT_TYPE_CONFIG.

- **src/components/order-detail/audit-trail-tab.tsx** - Main component file (583 lines). Need to replace Action Type dropdown with category tabs, update table columns, update action badges to use outline style, and adjust styling.

- **src/lib/mock-data.ts** - Contains generateMockAuditTrail function (lines 567-819). Need to add auditType field to each generated event based on actionType mapping.

### New Files
No new files required - all changes are modifications to existing files.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Add Audit Type System to Types
- Add `AuditType` enum with values: `ORDER`, `FULFILLMENT`, `INVENTORY`, `PAYMENT`, `CUSTOMER`, `SYSTEM`
- Add `auditType: AuditType` field to `AuditEvent` interface
- Add `AuditTypeConfig` interface with `label`, `bgColor`, `textColor` fields
- Add `AUDIT_TYPE_CONFIG` constant mapping AuditType to display configuration:
  - ORDER: blue (`bg-blue-100`, `text-blue-800`)
  - FULFILLMENT: cyan (`bg-cyan-100`, `text-cyan-800`)
  - INVENTORY: green (`bg-green-100`, `text-green-800`)
  - PAYMENT: purple (`bg-purple-100`, `text-purple-800`)
  - CUSTOMER: amber (`bg-amber-100`, `text-amber-800`)
  - SYSTEM: gray (`bg-gray-100`, `text-gray-800`)
- Add `ACTION_TYPE_TO_AUDIT_TYPE` mapping to classify each AuditActionType to its AuditType
- Update `AUDIT_ACTION_CONFIG` labels to Manhattan-style:
  - ORDER_CREATED → "Created"
  - STATUS_CHANGED → "Status Changed"
  - ITEM_ADDED → "Line Added"
  - ITEM_REMOVED → "Line Removed"
  - ITEM_MODIFIED → "Line Modified"
  - PAYMENT_UPDATED → "Payment Modified"
  - FULFILLMENT_UPDATE → "Fulfillment Updated"
  - SLA_BREACH → "SLA Breached"
  - ESCALATED → "Escalated"
  - NOTE_ADDED → "Note Added"
  - SYSTEM_EVENT → "System Event"

### 2. Update Mock Data Generator
- In `generateMockAuditTrail` function, add `auditType` field to each event
- Use the ACTION_TYPE_TO_AUDIT_TYPE mapping to determine auditType:
  - ORDER_CREATED, STATUS_CHANGED, ESCALATED, ITEM_ADDED, ITEM_REMOVED, ITEM_MODIFIED, NOTE_ADDED → `ORDER`
  - FULFILLMENT_UPDATE → `FULFILLMENT`
  - PAYMENT_UPDATED → `PAYMENT`
  - SLA_BREACH, SYSTEM_EVENT → `SYSTEM`
- Import the mapping from types/audit.ts

### 3. Replace Filter Bar with Category Tabs
- Remove `actionTypeFilter` state and its dropdown Select component
- Add `auditTypeFilter` state with type `AuditType | "all"` defaulting to `"all"`
- Create tab data array with counts computed from `auditEvents`:
  ```typescript
  const tabCounts = useMemo(() => {
    const counts: Record<string, number> = { all: auditEvents.length }
    Object.values(AuditType).forEach(type => {
      counts[type] = auditEvents.filter(e => e.auditType === type).length
    })
    return counts
  }, [auditEvents])
  ```
- Add horizontal tab bar above the filter row with:
  - "All" tab showing total count
  - One tab per AuditType showing count: "Order (24)"
  - Active tab has border-bottom highlight and background tint
- Move Search input to the right side of the tab bar
- Keep Date Range picker and Source filter as secondary filters below tabs
- Update `filteredEvents` logic to filter by `auditTypeFilter` instead of `actionTypeFilter`

### 4. Update Table Columns Layout
- Column 1: "Audit Date" - Format timestamp as 'Jan 9, 2026 14:30:45' using formatGMT7Time
- Column 2: "Audit Type" - Category badge with AuditType (ORDER, FULFILLMENT, etc.) using AUDIT_TYPE_CONFIG colors
- Column 3: "Audit Action" - Action badge with outline style using AUDIT_ACTION_CONFIG
- Column 4: "Description" - Full description text (keep line-clamp-2)
- Column 5: "Modified By" - Actor name with role type indicator badge
- Column 6: "Details" - Expand chevron (keep existing behavior)
- Update TableHead widths accordingly

### 5. Create Audit Type Badge Component
- Create `AuditTypeBadge` component similar to existing `SourceBadge`
- Use `AUDIT_TYPE_CONFIG` for styling
- Display uppercase type label (ORDER, FULFILLMENT, etc.)

### 6. Update Action Badge Styling
- Change action badges from filled to outline style
- Use `variant="outline"` with border color matching the action type
- Keep icon + label format but use outline styling

### 7. Update Actor Display with Role Indicator
- Show actor name with small role type badge (USER, SYSTEM, API, WEBHOOK)
- Use subtle styling for role indicator

### 8. Apply Styling Updates
- Remove zebra striping (if any) from table
- Add subtle row borders with `border-b` class
- Add hover state: `hover:bg-muted/50`
- Update tab bar styling:
  - Use `border-b-2 border-primary` for active tab
  - Use `bg-muted/50` for active tab background
  - Ensure proper spacing and alignment
- Update expanded row styling to use cleaner card-like appearance

### 9. Update Mobile Card View
- Apply same column order changes to mobile card view
- Add Audit Type badge to card header
- Update action badge to outline style
- Show Modified By with role indicator

### 10. Update clearFilters Function
- Update to reset `auditTypeFilter` to "all" instead of `actionTypeFilter`
- Update `hasActiveFilters` check accordingly

### 11. Update CSV Export
- Update headers to match new column order: "Audit Date", "Audit Type", "Audit Action", "Description", "Modified By", "Source", "Changes"
- Add auditType to exported data

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm build` - Ensure no TypeScript errors and production build succeeds
- `pnpm lint` - Ensure no ESLint errors
- Manual verification:
  - Navigate to an order detail page and click Audit Trail tab
  - Verify category tabs display with accurate counts
  - Verify clicking tabs filters events correctly
  - Verify table columns show: Audit Date, Audit Type, Audit Action, Description, Modified By, Details
  - Verify Audit Type badges show with correct colors (ORDER=blue, FULFILLMENT=cyan, etc.)
  - Verify Action badges use outline style
  - Verify row hover states work
  - Verify expanded row details still show field changes
  - Verify Export CSV includes new columns
  - Test responsive mobile view

## Notes
- The Manhattan OMS design uses clean, professional styling with category-based filtering
- Tab counts should update reactively when data changes
- Keep all existing functionality: expandable rows, export, refresh, empty states, loading skeletons
- The CUSTOMER and INVENTORY audit types are defined for future use but won't have mock data initially
- Date format 'Jan 9, 2026 14:30:45' includes year for clarity in audit trails
