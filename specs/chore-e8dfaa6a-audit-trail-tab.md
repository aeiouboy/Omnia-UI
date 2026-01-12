# Chore: Implement Audit Trail Tab for Order Detail Page

## Metadata
adw_id: `e8dfaa6a`
prompt: `Design and implement an 'Audit Trail' tab for the Order Detail page (src/components/order-detail-view.tsx)`

## Chore Description
Implement a comprehensive Audit Trail tab for the Order Detail page that displays a complete chronological history of all changes and events for an order. This feature is essential for enterprise OMS (Order Management System) functionality similar to Manhattan Associates OmniFacade. The tab will include:

- A filterable, sortable table of audit events
- Expandable rows showing field-level before/after changes
- Filter bar with date range, action type, source, and search
- Export to CSV and refresh functionality
- Mobile-first responsive design with virtual scrolling for large audit logs
- Color-coded action type badges with appropriate icons

## Relevant Files
Use these files to complete the chore:

### Existing Files to Modify
- **src/components/order-detail-view.tsx** - Main file to add the new Audit Trail tab to TabsList and TabsContent
- **src/lib/mock-data.ts** - Add mock audit trail data generator function

### Reference Files (Patterns to Follow)
- **src/components/stock-config/upload-history-table.tsx** - Table pattern with status badges, loading skeleton, empty state
- **src/components/recent-transactions-table.tsx** - Transaction table with filters, badges, icons, tooltips
- **src/components/virtualized-table.tsx** - Virtual scrolling pattern for large datasets
- **src/lib/utils.ts** - formatGMT7Time function for timezone-aware timestamp display
- **src/components/ui/table.tsx** - Shadcn table components
- **src/components/ui/calendar.tsx** - Calendar component for date picker
- **src/components/ui/select.tsx** - Select dropdown component
- **src/components/ui/popover.tsx** - Popover for date range picker

### New Files to Create
- **src/components/order-detail/audit-trail-tab.tsx** - Main audit trail component
- **src/types/audit.ts** - TypeScript interfaces for audit events

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Create TypeScript Interfaces for Audit Events
- Create new file `src/types/audit.ts`
- Define `AuditActionType` enum with values: `ORDER_CREATED`, `STATUS_CHANGED`, `ITEM_ADDED`, `ITEM_REMOVED`, `ITEM_MODIFIED`, `PAYMENT_UPDATED`, `FULFILLMENT_UPDATE`, `SLA_BREACH`, `ESCALATED`, `NOTE_ADDED`, `SYSTEM_EVENT`
- Define `AuditEventSource` type: `'API' | 'MANUAL' | 'INTEGRATION' | 'WEBHOOK' | 'SYSTEM'`
- Define `AuditEventChange` interface with `field`, `oldValue`, `newValue` properties
- Define `AuditEventActor` interface with `id`, `name`, `type` properties
- Define main `AuditEvent` interface with all required properties
- Export `AUDIT_ACTION_CONFIG` constant mapping action types to colors and icons

### 2. Add Mock Audit Trail Data Generator
- Open `src/lib/mock-data.ts`
- Add function `generateMockAuditTrail(orderId: string): AuditEvent[]`
- Generate realistic audit events from order creation through current status
- Include status transitions (SUBMITTED -> PROCESSING -> READY_FOR_PICKUP, etc.)
- Include item changes, payment updates, fulfillment updates
- Include system events like SLA warnings and escalations
- Events should span from order creation date to now
- Export function from mockData object

### 3. Create Audit Trail Tab Component
- Create new directory `src/components/order-detail/` if it doesn't exist
- Create new file `src/components/order-detail/audit-trail-tab.tsx`
- Import required dependencies:
  - React hooks (useState, useMemo, useCallback)
  - UI components (Card, Table, Badge, Button, Input, Select, Calendar, Popover, Skeleton)
  - Icons from lucide-react (History, Plus, RefreshCw, Edit, CreditCard, Truck, AlertTriangle, AlertCircle, MessageSquare, Settings, ChevronDown, ChevronUp, Download, Search, Filter, Calendar as CalendarIcon)
  - formatGMT7Time from lib/utils
  - Types from types/audit

### 4. Implement Filter Bar Section
- Add date range picker using Calendar + Popover components
- Add action type dropdown filter using Select component with all AuditActionType options
- Add source filter dropdown using Select component
- Add search input for description/user filtering
- Implement filter state management with useState hooks
- Add clear filters button

### 5. Implement Action Buttons Section
- Add Export to CSV button with Download icon
- Implement CSV export logic using audit data
- Add Refresh button with RefreshCw icon
- Style buttons consistently with existing patterns

### 6. Implement Audit Event Table
- Create table header with columns: Timestamp, Action Type, Description, Changed By, Source, Changes (expand toggle)
- Implement row rendering with:
  - Formatted GMT+7 timestamp
  - Action type badge with icon and color from AUDIT_ACTION_CONFIG
  - Description text
  - Actor name or 'System'
  - Source badge
  - Expand/collapse chevron for rows with changes
- Implement expandable row section showing before/after field changes
- Use conditional rendering for changes array

### 7. Implement Loading Skeleton
- Add loading prop to component
- Create skeleton rows matching table structure
- Follow pattern from upload-history-table.tsx

### 8. Implement Empty State
- Add empty state with History icon
- Display "No audit events found" message
- Add clear filters prompt if filters are active

### 9. Add Mobile Responsive Design
- Stack table on mobile using card-based layout
- Use responsive grid classes (grid-cols-1, sm:grid-cols-2, lg:table)
- Ensure minimum 44px touch targets
- Hide less important columns on mobile (Source, Changed By)

### 10. Integrate Tab into Order Detail View
- Open `src/components/order-detail-view.tsx`
- Import History icon from lucide-react
- Import AuditTrailTab component
- Add new TabsTrigger for "Audit Trail" between Timeline and Notes
- Add new TabsContent with AuditTrailTab component
- Pass order data to generate audit events

### 11. Add Virtual Scrolling for Large Logs (Optional Enhancement)
- If audit logs exceed 50 events, use VirtualizedTable pattern
- Set reasonable row height (64px for expandable rows)
- Configure appropriate overscan count

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm build` - Ensure no TypeScript errors in production build
- `pnpm lint` - Run ESLint to check code quality
- `pnpm dev` - Start development server and manually test:
  1. Navigate to any order detail page
  2. Click on "Audit Trail" tab
  3. Verify events display with correct formatting
  4. Test filter bar functionality (date range, action type, source, search)
  5. Test expandable rows with field changes
  6. Test Export to CSV functionality
  7. Test mobile responsive layout at various breakpoints
  8. Test loading skeleton by simulating slow load
  9. Test empty state with filters that return no results

## Notes

### Icon Mapping for Action Types
| Action Type | Icon | Color Class |
|-------------|------|-------------|
| ORDER_CREATED | Plus | bg-green-100 text-green-800 |
| STATUS_CHANGED | RefreshCw | bg-blue-100 text-blue-800 |
| ITEM_ADDED | PackagePlus | bg-green-100 text-green-800 |
| ITEM_REMOVED | PackageMinus | bg-red-100 text-red-800 |
| ITEM_MODIFIED | Edit | bg-yellow-100 text-yellow-800 |
| PAYMENT_UPDATED | CreditCard | bg-purple-100 text-purple-800 |
| FULFILLMENT_UPDATE | Truck | bg-cyan-100 text-cyan-800 |
| SLA_BREACH | AlertTriangle | bg-red-100 text-red-800 |
| ESCALATED | AlertCircle | bg-orange-100 text-orange-800 |
| NOTE_ADDED | MessageSquare | bg-gray-100 text-gray-800 |
| SYSTEM_EVENT | Settings | bg-slate-100 text-slate-800 |

### Component Dependencies
- Ensure all lucide-react icons are available (PackagePlus, PackageMinus may need to be verified)
- Calendar component uses react-day-picker

### Styling Consistency
- Use enterprise-text-light for labels
- Use enterprise-border for borders
- Follow Card/CardHeader/CardContent pattern from upload-history-table.tsx
- Use existing Badge variants where possible

### Performance Considerations
- Memoize filtered audit events with useMemo
- Use useCallback for filter handlers
- Consider lazy loading audit data on tab activation
- Virtual scrolling threshold: 50+ events
