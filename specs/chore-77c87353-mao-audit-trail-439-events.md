# Chore: MAO Audit Trail 439 Events Integration

## Metadata
adw_id: `77c87353`
prompt: `Update MAO order W1156251121946800 audit trail in Omnia-UI with all 439 events extracted from MAO. The audit trail data is saved at docs/mao-audit-trail-w1156251121946800.json. Tasks: 1) Read the JSON file containing 439 audit trail events with fields: updatedBy, updatedOn, entityName, entityId, changedParameter, oldValue, newValue. 2) Update src/lib/mock-data.ts to replace the generateManhattanAuditTrail function's output for order W1156251121946800 with the actual MAO data. 3) Transform the data to match the ManhattanAuditEvent interface in src/types/audit.ts - map updatedBy to user, updatedOn to timestamp (convert from '11/21/2025 11:51 ICT' format to ISO 8601), entityName to entityType, entityId to entityId, changedParameter to action, oldValue and newValue appropriately. 4) Ensure the Audit Trail tab in Order Detail view displays all 439 events correctly. The 20 entity types are: Order, OrderLine, OrderAttribute, OrderExtension1, OrderMilestone, OrderMilestoneEvent, Allocation, Release, ReleaseLine, FulfillmentDetail, QuantityDetail, Invoice, InvoiceLine, InvoiceLineChargeDetail, InvoiceLineTaxDetail, OrderTrackingDetail, OrderTrackingInfo, OrderAdditional, OrderLineNote, OrderLineTaxDetail.`

## Chore Description
Integrate the actual 439 audit trail events extracted from the MAO (Manhattan Active Omni) system for order W1156251121946800 into the Omnia-UI mock data. Currently, the `generateManhattanAuditTrail` function dynamically generates random audit events for all orders. This chore will:

1. Create a static data constant containing all 439 real MAO audit events
2. Modify the `generateManhattanAuditTrail` function to return the actual MAO data when the order ID is `W1156251121946800`
3. Preserve the existing dynamic generation logic for all other orders
4. Ensure the data format matches the `ManhattanAuditEvent` interface

The MAO data uses the format:
- `updatedBy`: User who made the change (e.g., 'apiuser4TMS', 'system-msg-user@CFR')
- `updatedOn`: Timestamp in 'MM/DD/YYYY HH:mm ICT' format
- `entityName`: One of 20 entity types (Order, OrderLine, QuantityDetail, etc.)
- `entityId`: Entity identifier (varies by entity type)
- `changedParameter`: Description of the change (e.g., 'Inserted Order', 'Changed MaxFulfillmentStatusId from Fulfilled to Delivered')
- `oldValue`: Previous value (may be empty string)
- `newValue`: New value (may be empty string)

## Relevant Files
Use these files to complete the chore:

- **docs/mao-audit-trail-w1156251121946800.json** - Source file containing 439 audit trail events extracted from MAO system. This JSON array contains the actual production data to integrate.

- **src/lib/mock-data.ts** - Main mock data file containing the `generateManhattanAuditTrail` function (lines 1340-1977). This function currently generates random audit events. Needs modification to return actual MAO data for order W1156251121946800.

- **src/types/audit.ts** - TypeScript type definitions including `ManhattanAuditEvent` interface (lines 236-246). The interface defines: id, orderId, updatedBy, updatedOn, entityName, entityId, changedParameter, oldValue, newValue. The actual MAO data structure already matches this interface.

- **src/components/order-detail/audit-trail-tab.tsx** - Audit Trail Tab component that consumes the `generateManhattanAuditTrail` function output. Displays events in a table with filters for entity category, date, and order line ID. No changes required as the component already handles the ManhattanAuditEvent format.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Read and Analyze MAO Audit Trail JSON
- Open `docs/mao-audit-trail-w1156251121946800.json`
- Verify it contains 439 events
- Confirm all 20 entity types are present: Order, OrderLine, OrderAttribute, OrderExtension1, OrderMilestone, OrderMilestoneEvent, Allocation, Release, ReleaseLine, FulfillmentDetail, QuantityDetail, Invoice, InvoiceLine, InvoiceLineChargeDetail, InvoiceLineTaxDetail, OrderTrackingDetail, OrderTrackingInfo, OrderAdditional, OrderLineNote, OrderLineTaxDetail
- Note the data format: updatedBy, updatedOn (MM/DD/YYYY HH:mm ICT), entityName, entityId, changedParameter, oldValue, newValue

### 2. Create Static MAO Audit Trail Data Constant
- In `src/lib/mock-data.ts`, locate the section near the `maoOrderW1156251121946800` definition (around line 3598)
- Create a new constant `maoOrderW1156251121946800AuditTrail` containing all 439 events
- Transform each event to include required `id` and `orderId` fields:
  ```typescript
  const maoOrderW1156251121946800AuditTrail: ManhattanAuditEvent[] = [
    {
      id: 'AUDIT-W1156251121946800-0001',
      orderId: 'W1156251121946800',
      updatedBy: 'apiuser4TMS',
      updatedOn: '11/21/2025 11:51 ICT',
      entityName: 'QuantityDetail',
      entityId: '252256219114609171599:5904277114444',
      changedParameter: 'Inserted QuantityDetail',
      oldValue: '',
      newValue: '252256219114609171599'
    },
    // ... remaining 438 events
  ]
  ```
- Convert empty string values to `null` for oldValue/newValue to match interface expectation

### 3. Modify generateManhattanAuditTrail Function
- Locate the `generateManhattanAuditTrail` function (line 1340)
- Add a check at the start of the function to return static data for MAO order:
  ```typescript
  export function generateManhattanAuditTrail(orderId: string, orderData?: any): any[] {
    // Return actual MAO audit trail data for order W1156251121946800
    if (orderId === 'W1156251121946800') {
      return maoOrderW1156251121946800AuditTrail
    }

    // Existing dynamic generation logic for other orders...
    const events: any[] = []
    // ...rest of function
  }
  ```
- Ensure the return type matches `ManhattanAuditEvent[]`
- Preserve all existing logic for other order IDs

### 4. Verify TypeScript Type Compatibility
- Ensure the `ManhattanAuditEvent` interface in `src/types/audit.ts` accommodates the data:
  - `oldValue: string | null` - matches (MAO data has empty strings, convert to null)
  - `newValue: string | null` - matches (MAO data has empty strings, convert to null)
- Import `ManhattanAuditEvent` type if not already imported in mock-data.ts
- No changes needed to audit.ts as the interface already matches

### 5. Test Build and Type Check
- Run `pnpm build` to ensure no TypeScript errors
- Run `pnpm dev` to start development server
- Navigate to order W1156251121946800 detail page
- Open Audit Trail tab and verify 439 events display correctly
- Test filters: Entity category (Order, Fulfillment, Payment, System), date filter, search
- Verify CSV export contains all 439 events

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm build` - Verify TypeScript compilation succeeds without errors
- `pnpm dev` - Start development server to manually verify UI
- Navigate to `http://localhost:3000/orders/W1156251121946800` and click Audit Trail tab
- Verify the header shows "439 events"
- Filter by "System" category and verify QuantityDetail events appear
- Filter by "Order" category and verify Order, OrderLine, etc. events appear
- Export CSV and verify all 439 rows are present

## Notes
- The MAO audit trail data is in chronological order (newest first based on extraction)
- Empty string values in oldValue/newValue should be converted to null for type safety
- The date format '11/21/2025 11:51 ICT' is already in the expected Manhattan format (MM/DD/YYYY HH:mm ICT)
- No date conversion needed - the `updatedOn` field is displayed as-is in the UI
- The existing `generateManhattanAuditTrail` function generates ~200-300 random events; the actual MAO data has 439 events
- Entity type distribution in actual MAO data may differ from the synthetic generator
- The audit-trail-tab component uses case-insensitive filtering on entityName, so exact casing from MAO is preserved
