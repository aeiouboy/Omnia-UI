# Chore: Extract Complete 439 MAO Audit Trail Events for Order W1156251121946800

## Metadata
adw_id: `e42f2f20`
prompt: `Extract ALL 439 audit trail events for order W1156251121946800 from MAO system and replace the current incomplete implementation (only 67 events) with the complete audit trail data.`

## Chore Description

The current implementation of `generateMAOOrderW1156251121946800AuditTrail()` in `src/lib/mock-data.ts` contains only **67 audit events**, but the real MAO (Manhattan Active Omni) system has **439 complete audit trail events** for order W1156251121946800. This chore requires extracting ALL 439 events from the MAO system and replacing the incomplete mock data with the complete audit trail.

**CRITICAL REQUIREMENT**: The MAO audit trail has 439 events total. The current implementation must be completely replaced with ALL events from MAO, maintaining exact values, Thai text, special characters, and chronological order.

## Relevant Files

### Files to Modify
- `src/lib/mock-data.ts`
  - **Location**: Function `generateMAOOrderW1156251121946800AuditTrail()` around line 3674
  - **Current State**: Contains only 67 events (AUDIT-W115625-001 through AUDIT-W115625-067)
  - **Required Change**: Replace with ALL 439 events from MAO system
  - **Event IDs**: Currently uses pattern `AUDIT-W115625-XXX`, needs to extend to 439

### Files for Reference
- `src/components/order-detail/audit-trail-tab.tsx`
  - Displays audit trail in Manhattan-style format
  - Columns: UPDATED BY, UPDATED ON, ENTITY NAME, ENTITY ID, CHANGED PARAMETER, OLD VALUE, NEW VALUE
  - No changes needed - component already supports audit trail display

- `src/types/audit.ts`
  - Defines `ManhattanAuditEvent` type for audit trail structure
  - No changes needed - type already matches MAO format

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Verify User is Logged into MAO System
- Use Playwright MCP to navigate to `https://crcpp.omni.manh.com/omnifacade/#/order`
- Take a screenshot to verify current login status
- If not logged in, prompt user to log in before proceeding
- Wait for page to fully load and verify MAO dashboard is accessible

### 2. Navigate to Order W1156251121946800 in MAO
- Use Playwright MCP to search for order number "W1156251121946800"
- Open the order details page
- Take screenshot of order header to confirm correct order is loaded
- Verify order number matches: W1156251121946800

### 3. Open and Verify Audit Trail Tab
- Locate and click on the "Audit Trail" tab in MAO order details page
- Wait for audit trail data to load completely
- Take initial screenshot showing the audit trail table header and first few events
- Verify the total event count shown in MAO is 439 events

### 4. Extract All 439 Audit Trail Events
**CRITICAL**: Must extract ALL events, not just a sample. Use one of these strategies:

**Strategy A - Pagination Approach** (if MAO has pagination):
- Navigate through all pages of the audit trail
- Extract all events from each page
- Combine into single chronological list
- Take screenshots of each page for reference

**Strategy B - Scroll Approach** (if MAO uses infinite scroll):
- Scroll through entire audit trail list slowly
- Extract events as they appear
- Continue until no more events load (verify no "load more" button)
- Take periodic screenshots every 50-100 events

**Strategy C - API Approach** (if MAO exposes audit trail API):
- Check browser network tab for audit trail API endpoints
- Extract data directly from API responses
- Verify API returns all 439 events
- Parse API response into required format

**Data to Extract for Each Event**:
- **UPDATED BY**: Username who made the change (e.g., "pubsubuser@TWD null")
- **UPDATED ON**: Timestamp in DD/MM/YYYY HH:mm ICT format (e.g., "11/21/2025 10:42 ICT")
- **ENTITY NAME**: Type of entity (Order, CustomerDetail, OrderLine, QuantityDetail, PaymentDetail, Allocation, Release, OrderMilestone, FulfillmentDetail, Invoice, OrderTrackingInfo, OrderTrackingDetail, etc.)
- **ENTITY ID**: Unique identifier for the entity
- **CHANGED PARAMETER**: What was changed or action taken (e.g., "Inserted Order", "Status", "quantity")
- **OLD VALUE**: Previous value or null for insertions
- **NEW VALUE**: New value or null for deletions

### 5. Format Audit Data for Mock Data Function
- Convert extracted MAO data into required format for `generateMAOOrderW1156251121946800AuditTrail()`
- Each event structure:
  ```typescript
  {
    id: 'AUDIT-W115625-XXX',  // Sequential: 001 to 439
    orderId: 'W1156251121946800',
    updatedBy: 'exact username from MAO',
    updatedOn: 'DD/MM/YYYY HH:mm ICT',
    entityName: 'EntityName from MAO',
    entityId: 'entity_id_from_mao',
    changedParameter: 'exact description from MAO',
    oldValue: 'old value or null',
    newValue: 'new value or null'
  }
  ```
- **CRITICAL**: Maintain chronological order (oldest events first) as shown in MAO
- **CRITICAL**: Preserve exact Thai text, special characters, whitespace, and formatting
- **CRITICAL**: Use exact entity names, parameter names, and values from MAO

### 6. Update generateMAOOrderW1156251121946800AuditTrail() Function
- Open `src/lib/mock-data.ts` and locate function at line 3674
- **DELETE** entire current implementation (all 67 events)
- **REPLACE** with complete 439 events extracted from MAO
- Keep function signature and return type unchanged:
  ```typescript
  function generateMAOOrderW1156251121946800AuditTrail(): any[]
  ```
- Ensure all 439 events are in the `events` array
- Return `events` array at end of function
- Verify no events are missing (should have AUDIT-W115625-001 through AUDIT-W115625-439)

### 7. Verify generateManhattanAuditTrail Integration
- Check `generateManhattanAuditTrail` function (around line 1374)
- Ensure it properly handles MAO orders with `orderData.auditTrail`
- For order W1156251121946800, it should return `orderData.auditTrail` directly
- No changes typically needed if integration is already correct
- Verify audit trail tab component receives all 439 events

### 8. Test Audit Trail Display in Omnia-UI
- Start development server: `pnpm dev`
- Navigate to `http://localhost:3000/orders`
- Search for order "W1156251121946800"
- Click order to open order details
- Click "Audit Trail" tab
- **CRITICAL VERIFICATION**: Event count must show "439 events"
- Scroll through entire audit trail to verify all events are present
- Verify data matches MAO exactly (usernames, timestamps, entities, values)

### 9. Test Filter Functionality
- Test Entity Name category filter:
  - Select "Order" - should filter to Order-related entities
  - Select "Fulfillment" - should show fulfillment entities
  - Select "Payment" - should show payment entities
  - Select "System" - should show system entities
  - Select "All" - should show all 439 events
- Test Audit Date filter:
  - Select a date from the audit trail
  - Click APPLY
  - Verify filtered results show only events from that date
- Verify event count updates correctly when filters are applied
- Verify "filtered from 439" text appears when filters are active

### 10. Take Validation Screenshots
- **Screenshot 1**: Full audit trail showing "439 events" counter
- **Screenshot 2**: Top of audit trail showing first events (oldest)
- **Screenshot 3**: Bottom of audit trail showing last events (newest)
- **Screenshot 4**: Filtered view demonstrating filter functionality
- **Screenshot 5**: Comparison with MAO system (if visible)
- Save all screenshots to `.playwright-mcp/` directory with descriptive names:
  - `validation-complete-audit-trail-439-events.png`
  - `validation-audit-trail-first-events.png`
  - `validation-audit-trail-last-events.png`
  - `validation-audit-trail-filters.png`

## Validation Commands
Execute these commands to validate the chore is complete:

```bash
# Start development server
pnpm dev

# In browser:
# 1. Navigate to http://localhost:3000/orders
# 2. Search for "W1156251121946800"
# 3. Open order details
# 4. Click Audit Trail tab
# 5. Verify "439 events" is displayed
# 6. Scroll through all events to verify completeness
# 7. Test all filters (Entity Name, Audit Date)
# 8. Export CSV and verify all 439 events are included
# 9. Compare with MAO system to verify exact match
```

**Code Validation**:
```bash
# Verify no TypeScript errors
pnpm build

# Verify mock-data.ts has correct syntax
# Check generateMAOOrderW1156251121946800AuditTrail function returns 439 events
# Run in browser console: generateMAOOrderW1156251121946800AuditTrail().length === 439
```

## Notes

**MAO System Details**:
- **URL**: `https://crcpp.omni.manh.com/omnifacade/#/order`
- **System**: Manhattan Active Omni (MAO) OMS
- **Order**: W1156251121946800
- **Total Events**: 439 audit trail events
- **Timezone**: ICT (Indochina Time, GMT+7)
- **Date Format**: DD/MM/YYYY HH:mm ICT

**Current Implementation Status**:
- **Events**: Only 67 events (AUDIT-W115625-001 through AUDIT-W115625-067)
- **Coverage**: ~15% of complete audit trail
- **Missing**: 372 events (85% of audit trail is missing)
- **Impact**: Incomplete audit history for order lifecycle

**Critical Success Factors**:
1. **Completeness**: ALL 439 events must be extracted, not just a sample
2. **Accuracy**: Exact values from MAO (no approximations or placeholders)
3. **Order**: Chronological order must match MAO (oldest to newest)
4. **Preservation**: Thai text, special characters, whitespace must be preserved exactly
5. **Validation**: Event count in Omnia-UI must show "439 events" to match MAO

**Expected Event Types in Full 439 Events**:
- **Order Creation**: Inserted Order, CustomerDetail, OrderLines
- **Quantity Details**: Inserted QuantityDetail for each order line
- **Payment**: Inserted PaymentDetail, payment status updates
- **Allocation**: Allocation events, inventory reservation
- **Release**: Release events, shipment creation
- **Fulfillment**: FulfillmentDetail inserts, status changes
- **Milestones**: OrderMilestone events (CREATED, ALLOCATED, RELEASED, SHIPPED, DELIVERED)
- **Tracking**: OrderTrackingInfo and OrderTrackingDetail inserts and updates
- **Status Changes**: Order status transitions throughout lifecycle
- **Modifications**: Any field changes, address updates, modifications

**Data Extraction Strategy**:
- If MAO has pagination: Navigate all pages and combine results
- If MAO uses infinite scroll: Scroll slowly until all events load
- If MAO has export: Use export functionality if available
- If MAO has API: Extract directly from API responses
- Take multiple screenshots for reference and verification
- Verify final count is exactly 439 events before updating code

**Reference Material**:
- PDF reference: `/Users/naruechon/Downloads/screencapture-crcpp-omni-manh-omnifacade-2026-01-16-08_28_47 (1).pdf`
- Contains complete MAO audit trail with 439 events
- Use as reference for event structure and data format
- Verify extracted data matches PDF reference exactly

**Troubleshooting**:
- **Missing Events**: If count < 439, need to extract remaining events from MAO
- **Wrong Order**: Ensure chronological order (oldest first) matches MAO
- **Data Corruption**: Verify Thai text and special characters are preserved
- **Type Errors**: Ensure all event objects have required fields with correct types
- **Display Issues**: Verify audit trail tab component shows all events without truncation
