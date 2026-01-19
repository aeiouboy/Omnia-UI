# Chore: Extract Complete MAO Audit Trail Data for Order W1156251121946800

## Metadata
adw_id: `1141cfa7`
prompt: `Extract complete audit trail data for order W1156251121946800 from MAO system at https://crcpp.omni.manh.com/omnifacade/#/order and implement it in Omnia-UI.`

## Chore Description

Extract the complete audit trail for order W1156251121946800 from the Manhattan Active Omni (MAO) system and replace the current sample data (only 5 events) with the complete real audit trail. This task requires using Playwright MCP to navigate to the MAO system while the user is logged in, extract ALL audit events with exact timestamps, users, entities, and values, then update the mock data function in `src/lib/mock-data.ts`.

The order currently exists in mock data with only 5 sample audit events. The UI components already support Manhattan-style audit trail display, so this task focuses purely on data extraction and replacement.

## Relevant Files

### Files to Modify
- `src/lib/mock-data.ts` (around line 3666)
  - Contains `generateMAOOrderW1156251121946800AuditTrail()` function that needs to be updated with complete real audit data
  - Currently has only 5 sample events that need to be replaced with ALL events from MAO

### Files for Reference
- `src/components/order-detail/audit-trail-tab.tsx`
  - Displays audit trail in Manhattan-style format with columns: UPDATED BY, UPDATED ON, ENTITY NAME, ENTITY ID, CHANGED PARAMETER, OLD VALUE, NEW VALUE
  - Already supports the audit trail data structure, no changes needed

- `src/lib/mock-data.ts` (function `generateManhattanAuditTrail` around line 1374)
  - General audit trail generator for non-MAO orders
  - May need to add special handling to return `orderData.auditTrail` for MAO order W1156251121946800

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Verify User is Logged into MAO System
- Use Playwright MCP to navigate to https://crcpp.omni.manh.com/omnifacade/#/order
- Take a screenshot to verify user is logged in
- If not logged in, prompt user to log in first before proceeding

### 2. Navigate to Order W1156251121946800 in MAO
- Use Playwright MCP to search for order number "W1156251121946800"
- Open the order details page
- Take screenshot of order header to confirm correct order

### 3. Open Audit Trail Tab
- Locate and click on the "Audit Trail" tab in the MAO order details page
- Wait for the audit trail data to load completely
- Take screenshot of the audit trail section

### 4. Extract All Audit Trail Events
- Use Playwright MCP to capture the complete audit trail data
- Extract ALL events with exact data:
  - UPDATED BY (user who made the change)
  - UPDATED ON (timestamp in MAO format, typically DD/MM/YYYY HH:mm ICT)
  - ENTITY NAME (e.g., Order, QuantityDetail, OrderTrackingDetail, PaymentDetail, etc.)
  - ENTITY ID (unique identifier for the entity)
  - CHANGED PARAMETER (what field was changed or action taken)
  - OLD VALUE (previous value, or null for insertions)
  - NEW VALUE (new value, or null for deletions)
- Ensure events are captured in the order they appear (typically oldest to newest)
- Take multiple screenshots if the audit trail spans multiple pages/scrolls

### 5. Parse and Format Audit Data
- Convert extracted MAO audit data into the format required by `generateMAOOrderW1156251121946800AuditTrail()`
- Each event should have this structure:
  ```typescript
  {
    id: 'AUDIT-W115625-XXX',
    orderId: 'W1156251121946800',
    updatedBy: 'username from MAO',
    updatedOn: 'DD/MM/YYYY HH:mm ICT',
    entityName: 'EntityName from MAO',
    entityId: 'entity_id_from_mao',
    changedParameter: 'Parameter description',
    oldValue: 'old value or null',
    newValue: 'new value or null'
  }
  ```
- Ensure all events are sorted chronologically (oldest first) as they appear in MAO

### 6. Update generateMAOOrderW1156251121946800AuditTrail() Function
- Open `src/lib/mock-data.ts` and locate the function around line 3666
- Replace the entire function body with the complete audit trail data
- Remove the 5 sample events and replace with ALL events extracted from MAO
- Keep the function signature and return type unchanged
- Ensure events array is returned in chronological order (oldest first)

### 7. Verify generateManhattanAuditTrail Returns Real Data for MAO Order
- Check the `generateManhattanAuditTrail` function (around line 1374)
- Add special case handling if needed to return `orderData.auditTrail` for order W1156251121946800
- The audit trail tab component calls `generateManhattanAuditTrail(orderId, orderData)`
- For MAO orders, it should return `orderData.auditTrail` instead of generating mock data
- Update the function to check if `orderData?.auditTrail` exists and return it directly

### 8. Test Audit Trail Display in Omnia-UI
- Start the development server: `pnpm dev`
- Navigate to http://localhost:3000/orders
- Search for order W1156251121946800
- Click on the order to open order details
- Click on the "Audit Trail" tab
- Verify ALL audit events from MAO are displayed
- Check that the data matches exactly what was extracted from MAO

### 9. Take Validation Screenshots
- Take screenshots of the complete audit trail display in Omnia-UI
- Capture the event count to verify all events are present
- Verify filtering works correctly (Entity Name category, Audit Date, etc.)
- Take screenshots of filtered views to confirm proper functionality

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm dev` - Start development server
- Navigate to `http://localhost:3000/orders`
- Search for `W1156251121946800`
- Click order and verify Audit Trail tab shows all events from MAO
- Count events in UI vs MAO - they should match exactly
- Test filters: Entity Name dropdown, Audit Date picker, APPLY button
- Export CSV and verify all audit events are included

## Notes

**MAO System Access:**
- User must be logged into MAO at https://crcpp.omni.manh.com/omnifacade/#/order before starting
- MAO uses Manhattan Active Omni (OMNI facade) for order management
- Audit trail is typically found in a tab within the order details page

**Data Structure:**
- MAO audit trail follows Manhattan Associates OMS format
- Standard columns: UPDATED BY, UPDATED ON, ENTITY NAME, ENTITY ID, CHANGED PARAMETER, OLD VALUE, NEW VALUE
- Timestamps are in ICT (Indochina Time) timezone, format: DD/MM/YYYY HH:mm ICT

**Important Considerations:**
- Extract ALL events, not just a sample - the current mock has only 5 events but real MAO orders typically have 20-50+ audit events
- Preserve exact values including Thai text, special characters, and formatting
- Maintain chronological order (oldest first) as this is how audit trails are traditionally displayed
- The `generateManhattanAuditTrail` function may need updating to check for `orderData.auditTrail` and return it directly for MAO orders

**Event Types to Expect:**
- Order creation events (Inserted Order)
- Line item events (Inserted LineItem, Inserted QuantityDetail)
- Customer events (Inserted CustomerDetail)
- Payment events (Inserted PaymentDetail, payment status changes)
- Fulfillment events (Inserted FulfillmentDetail, status changes)
- Shipment events (Inserted ShipmentDetail, tracking updates)
- Status changes (SUBMITTED → PROCESSING → READY_FOR_PICKUP → OUT_FOR_DELIVERY → DELIVERED)
- Address changes, modifications, cancellations (if applicable)

**Screenshot Locations:**
- Save validation screenshots to `.playwright-mcp/` directory
- Name screenshots descriptively, e.g., `mao-audit-trail-complete.png`, `omnia-ui-audit-trail-validation.png`
