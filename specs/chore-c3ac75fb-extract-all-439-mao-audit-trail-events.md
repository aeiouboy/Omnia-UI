# Chore: Extract All 439 Real MAO Audit Trail Events for Order W1156251121946800

## Metadata
adw_id: `c3ac75fb`
prompt: `Navigate to MAO system at https://crcpp.omni.manh.com/omnifacade/#/order (ensure user is logged in first), search for order W1156251121946800, open Audit Trail tab, and extract ALL 439 real audit events by scrolling through the entire list. Replace the current implementation in src/lib/mock-data.ts function generateMAOOrderW1156251121946800AuditTrail() with COMPLETE REAL DATA from MAO - not generated placeholders.`

## Chore Description

The current implementation of `generateMAOOrderW1156251121946800AuditTrail()` in `src/lib/mock-data.ts` contains only **67 real audit events** (events 001-067) and **372 synthetic generated events** (events 068-439 created by for loops at lines 4507-4592). The generated events use placeholder data like `ATTR-XXX`, `ENT-XXX`, `TRK-XXX`, `PAY-XXX`, `SYS-XXX` which are not real data from the MAO system.

This chore requires extracting **ALL 439 actual audit trail events** from the MAO (Manhattan Active Omni) system and replacing the loop-generated code with complete real data. The MAO audit trail page shows 439 total events - every single event must be extracted by scrolling through the complete list, capturing exact data including UPDATED BY, UPDATED ON, ENTITY NAME, ENTITY ID, CHANGED PARAMETER, OLD VALUE, NEW VALUE.

**CRITICAL REQUIREMENTS**:
- Extract ALL 439 actual events from MAO (not just the 67 currently implemented)
- Remove ALL for loops at lines 4507-4592 in src/lib/mock-data.ts
- Replace with 372 additional real audit event objects extracted from MAO
- No placeholder data allowed (no ATTR-XXX, ENT-XXX, TRK-XXX, PAY-XXX, SYS-XXX)
- Real entity names: Order, CustomerDetail, OrderLine, QuantityDetail, PaymentDetail, Allocation, Release, FulfillmentDetail, Invoice, OrderTrackingInfo, OrderTrackingDetail, OrderAttribute, etc.
- Real usernames: pubsubuser@TWD null, apiuser4TMS, apiuser4Slick, system-msg-user@CFR, integrationuser@crc.com

## Relevant Files

### Files to Modify

- **`src/lib/mock-data.ts`**
  - **Location**: Function `generateMAOOrderW1156251121946800AuditTrail()` starting around line 3677
  - **Current State**: Contains 67 real events (001-067) + 372 generated events (068-439)
  - **Generated Code Location**: Lines 4507-4592 contain for loops that create placeholder events
  - **Required Change**: DELETE lines 4507-4592 (all for loops) and REPLACE with 372 real audit event objects extracted from MAO
  - **Target Result**: Function returns 439 real audit events (no placeholders)

### Files for Reference

- **`scripts/extract-audit-trail.js`**
  - Existing Playwright script for extracting audit trail data from MAO
  - Handles navigation, login check, pagination, and data extraction
  - Can be used as reference or run directly to extract the data

- **`src/components/order-detail/audit-trail-tab.tsx`**
  - Displays audit trail in Manhattan-style format
  - Columns: UPDATED BY, UPDATED ON, ENTITY NAME, ENTITY ID, CHANGED PARAMETER, OLD VALUE, NEW VALUE
  - No changes needed - component already supports audit trail display

- **`src/types/audit.ts`**
  - Defines `ManhattanAuditEvent` type for audit trail structure
  - No changes needed - type already matches MAO format

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Verify User is Logged into MAO System
- Use Playwright MCP to navigate to `https://crcpp.omni.manh.com/omnifacade/#/order`
- Take a screenshot to verify current login status
- If not logged in, prompt user to log in before proceeding
- Wait for page to fully load and verify MAO dashboard is accessible
- Confirm session is active and user can access order search

### 2. Navigate to Order W1156251121946800 in MAO
- Use Playwright MCP to search for order number "W1156251121946800"
- Use browser snapshot to locate search input field
- Type order ID and submit search or press Enter
- Wait for search results to load
- Click on the order to open order details page
- Take screenshot of order header to confirm correct order is loaded
- Verify order number matches: W1156251121946800

### 3. Open and Verify Audit Trail Tab
- Use browser snapshot to locate tabs in MAO order details page
- Find and click on the "Audit Trail" tab
- Wait for audit trail data to load completely
- Take initial screenshot showing the audit trail table header and first few events
- **CRITICAL**: Verify the total event count shown in MAO is 439 events
- Note pagination controls (if any) or scroll behavior

### 4. Extract All 439 Audit Trail Events
**CRITICAL**: Must extract ALL 439 events, not just the first 67. Use systematic scrolling approach:

**Extraction Strategy**:
- If MAO has pagination: Navigate through all pages systematically
- If MAO uses infinite scroll: Scroll slowly through entire list extracting all visible events
- Continue until no more events load (verify end of list is reached)
- Take screenshots every 20-30 events for reference and verification

**Data to Extract for Each Event** (exact values from MAO):
- **UPDATED BY**: Username who made the change (e.g., "pubsubuser@TWD null", "apiuser4TMS", "apiuser4Slick", "system-msg-user@CFR", "integrationuser@crc.com")
- **UPDATED ON**: Timestamp in format shown (e.g., "11/21/2025 10:42 ICT")
- **ENTITY NAME**: Exact entity type from MAO (Order, CustomerDetail, OrderLine, QuantityDetail, PaymentDetail, Allocation, Release, FulfillmentDetail, Invoice, OrderTrackingInfo, OrderTrackingDetail, OrderAttribute, etc.)
- **ENTITY ID**: Exact identifier for the entity
- **CHANGED PARAMETER**: Exact description of what changed (e.g., "Inserted Order", "Status", "quantity")
- **OLD VALUE**: Exact previous value or null for insertions
- **NEW VALUE**: Exact new value or null for deletions

**Screenshot Strategy**:
- Take screenshot of first page (events 001-020)
- Take screenshots every 20-30 events as you scroll
- Take screenshot of last page (events 420-439)
- Save all screenshots to `.playwright-mcp/` directory with descriptive names

### 5. Format Extracted Audit Data
- Convert extracted MAO data into required format for `generateMAOOrderW1156251121946800AuditTrail()`
- Each event structure:
  ```typescript
  {
    id: 'AUDIT-W115625-XXX',  // Sequential: 001 to 439
    orderId: 'W1156251121946800',
    updatedBy: 'exact username from MAO',
    updatedOn: 'exact timestamp from MAO',
    entityName: 'exact EntityName from MAO',
    entityId: 'exact entity_id_from_mao',
    changedParameter: 'exact description from MAO',
    oldValue: 'exact old value or null',
    newValue: 'exact new value or null'
  }
  ```
- **CRITICAL**: Maintain chronological order (oldest events first) as shown in MAO
- **CRITICAL**: Preserve exact text, special characters, whitespace, and formatting
- **CRITICAL**: Use exact entity names, parameter names, and values from MAO

### 6. Update generateMAOOrderW1156251121946800AuditTrail() Function
- Open `src/lib/mock-data.ts` and locate function at line 3677
- **KEEP** the first 67 real events (lines 3680-4506) - these are already correct
- **DELETE** the loop-generated code at lines 4507-4592
  - Delete the for loop from line 4507 (for events 068-100)
  - Delete the for loop from line 4522 (for events 101-200)
  - Delete the for loop from line 4540 (for events 201-300)
  - Delete the for loop from line 4558 (for events 301-400)
  - Delete the for loop from line 4576 (for events 401-439)
- **INSERT** the 372 new real audit event objects extracted from MAO
- Ensure all 439 events are in the `events` array
- Keep the `return events` statement at line 4594
- Verify event IDs are sequential: AUDIT-W115625-001 through AUDIT-W115625-439
- Verify no placeholder data remains (no ATTR-XXX, ENT-XXX, TRK-XXX, PAY-XXX, SYS-XXX)

### 7. Verify Function Returns Correct Data
- Check that `generateMAOOrderW1156251121946800AuditTrail()` returns array of 439 events
- Verify each event has all required fields with real data
- Verify no synthetic/placeholder data exists
- Verify chronological order matches MAO
- Verify entity names match MAO exactly

### 8. Test Audit Trail Display in Omnia-UI
- Start development server: `pnpm dev`
- Navigate to `http://localhost:3000/orders`
- Search for order "W1156251121946800"
- Click order to open order details
- Click "Audit Trail" tab
- **CRITICAL VERIFICATION**: Event count must show "439 events"
- Scroll through entire audit trail to verify all events are present
- Verify data matches MAO exactly (usernames, timestamps, entities, values)
- **CRITICAL**: Verify NO placeholder data visible (no ATTR-XXX, ENT-XXX, etc.)

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
- **Screenshot 2**: Top of audit trail showing first events (oldest, 001-010)
- **Screenshot 3**: Middle section of audit trail showing real data (events 200-210)
- **Screenshot 4**: Bottom of audit trail showing last events (newest, 430-439)
- **Screenshot 5**: Filtered view demonstrating filter functionality
- **Screenshot 6**: Comparison with MAO system (side-by-side if possible)
- Save all screenshots to `.playwright-mcp/` directory with descriptive names:
  - `validation-complete-439-audit-trail-events.png`
  - `validation-audit-trail-first-events.png`
  - `validation-audit-trail-middle-events.png`
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
# 5. Verify "439 events" is displayed (CRITICAL)
# 6. Scroll through all events to verify completeness
# 7. Verify NO placeholder data (no ATTR-XXX, ENT-XXX, TRK-XXX, PAY-XXX, SYS-XXX)
# 8. Test all filters (Entity Name, Audit Date)
# 9. Export CSV and verify all 439 events are included
# 10. Compare with MAO system to verify exact match
```

**Code Validation**:
```bash
# Verify no TypeScript errors
pnpm build

# Verify mock-data.ts has correct syntax and no loop-generated code
# Check generateMAOOrderW1156251121946800AuditTrail function returns 439 events
# Verify lines 4507-4592 no longer contain for loops
# Verify all 439 events have real data (no placeholders)
```

**Data Validation Checklist**:
- [ ] Total event count shows 439 events
- [ ] All events show real data (no ATTR-XXX, ENT-XXX, TRK-XXX, PAY-XXX, SYS-XXX)
- [ ] Entity names match MAO exactly (Order, CustomerDetail, OrderLine, QuantityDetail, PaymentDetail, Allocation, Release, FulfillmentDetail, Invoice, OrderTrackingInfo, OrderTrackingDetail, OrderAttribute, etc.)
- [ ] Usernames are real MAO users (pubsubuser@TWD null, apiuser4TMS, apiuser4Slick, system-msg-user@CFR, integrationuser@crc.com)
- [ ] Chronological order matches MAO (oldest to newest)
- [ ] All 372 new events (068-439) replace the loop-generated code
- [ ] No for loops remain at lines 4507-4592 in src/lib/mock-data.ts

## Notes

**MAO System Details**:
- **URL**: `https://crcpp.omni.manh.com/omnifacade/#/order`
- **System**: Manhattan Active Omni (MAO) OMS
- **Order**: W1156251121946800
- **Total Events**: 439 audit trail events
- **Timezone**: ICT (Indochina Time, GMT+7)
- **Date Format**: DD/MM/YYYY HH:mm ICT

**Current Implementation Status**:
- **Events 001-067**: 67 real events from MAO (CORRECT - keep these)
- **Events 068-439**: 372 synthetic events generated by for loops (INCORRECT - must replace)
- **Generated Code Location**: Lines 4507-4592 in src/lib/mock-data.ts
- **Placeholder Data**: ATTR-XXX, ENT-XXX, TRK-XXX, PAY-XXX, SYS-XXX (must remove)
- **Impact**: Inaccurate audit history for 85% of order lifecycle events

**Critical Success Factors**:
1. **Completeness**: ALL 439 events must be extracted and implemented (not just 67)
2. **Accuracy**: Exact values from MAO (no placeholders, approximations, or generated data)
3. **Order**: Chronological order must match MAO (oldest to newest)
4. **Removal**: ALL for loops at lines 4507-4592 must be deleted and replaced with real data
5. **Validation**: Event count in Omnia-UI must show "439 events" to match MAO
6. **Real Data Only**: No ATTR-XXX, ENT-XXX, TRK-XXX, PAY-XXX, SYS-XXX placeholders

**Expected Real Event Types in Full 439 Events**:
- **Order Creation**: Inserted Order, CustomerDetail, OrderLines (events 001-067 already implemented)
- **Quantity Details**: Inserted QuantityDetail for each order line
- **Payment**: Inserted PaymentDetail, payment status updates, settlement changes
- **Allocation**: Allocation events, inventory reservation details
- **Release**: Release events, shipment creation, tracking assignment
- **Fulfillment**: FulfillmentDetail inserts, status changes, delivery updates
- **Milestones**: OrderMilestone events (CREATED, ALLOCATED, RELEASED, SHIPPED, DELIVERED)
- **Tracking**: OrderTrackingInfo and OrderTrackingDetail inserts and updates
- **Status Changes**: Order status transitions throughout lifecycle
- **Modifications**: Field changes, address updates, quantity adjustments

**Data Extraction Strategy**:
- If MAO has pagination: Navigate all pages (estimated 20-22 pages based on 20 events per page)
- If MAO uses infinite scroll: Scroll slowly until all 439 events load
- Take screenshots every 20-30 events for reference and verification
- Extract exact text values (not approximations)
- Verify final count is exactly 439 events before updating code
- Cross-reference with screenshots to ensure accuracy

**Reference Material**:
- Existing extraction script: `/scripts/extract-audit-trail.js`
- Previous chore specification: `/specs/chore-e42f2f20-extract-complete-439-mao-audit-trail-events.md`
- Current implementation: `/src/lib/mock-data.ts` lines 3677-4595

**Code Modification Details**:
- **Lines to DELETE**: 4507-4592 (all for loops generating placeholder events)
- **Lines to KEEP**: 3677-4506 (function signature and first 67 real events)
- **Lines to ADD**: ~2000-3000 lines of real audit event objects (372 events)
- **Total Result**: Function with 439 real events, no generated placeholders

**Troubleshooting**:
- **Missing Events**: If count < 439, need to extract remaining events from MAO
- **Wrong Order**: Ensure chronological order (oldest first) matches MAO
- **Placeholder Data**: Verify no ATTR-XXX, ENT-XXX, TRK-XXX, PAY-XXX, SYS-XXX remain
- **Loop Code Remains**: Verify lines 4507-4592 no longer contain for loops
- **Type Errors**: Ensure all event objects have required fields with correct types
- **Display Issues**: Verify audit trail tab component shows all 439 events
