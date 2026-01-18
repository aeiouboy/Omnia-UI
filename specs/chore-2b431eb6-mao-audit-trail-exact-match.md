# Chore: Match MAO Audit Trail UI and Data Exactly

## Metadata
adw_id: `2b431eb6`
prompt: `Update Audit Trail tab in order detail to match MAO (Manhattan OMS) design exactly. Reference PDF at '/Users/naruechon/Downloads/screencapture-crcpp-omni-manh-omnifacade-2026-01-16-08_28_47 (1).pdf' shows the exact MAO layout.`

## Chore Description
This chore aligns the Audit Trail tab in the order detail page with the exact design and data patterns from Manhattan Associates OMS (MAO). The reference PDF shows the MAO audit trail interface with 439 events for order W1156251121946800. Key requirements include:

1. **Mock Data Enhancement**: Generate 400+ events with MAO-specific entity types, user names, timestamp formats, and changed parameter patterns
2. **UI Alignment**: Match MAO's alternating row colors, column widths, filter bar layout, and total count display
3. **Types Update**: Add all MAO entity name types to support the expanded event vocabulary

## Relevant Files
Use these files to complete the chore:

- **src/lib/mock-data.ts** (lines 1340-1600+): Contains `generateManhattanAuditTrail` function that needs major expansion to generate 400+ events with MAO-specific patterns
- **src/components/order-detail/audit-trail-tab.tsx**: UI component that displays the audit trail table, needs styling updates for alternating rows and total count display
- **src/types/audit.ts** (line 251): Contains `EntityNameCategory` type that needs expansion for MAO entity types

### New Files
None required - all changes are modifications to existing files.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Update EntityNameCategory Type in audit.ts
- Add MAO entity types to the filter dropdown options
- Current: `'All' | 'Order' | 'Fulfillment' | 'Payment' | 'System'`
- Expand to include entity-level filtering or keep category-based but update filter logic in component

### 2. Enhance generateManhattanAuditTrail Function - Users and Entities
- Replace current `updatedByOptions` array with MAO-specific users:
  - `apiuser4TMS`
  - `system-msg-user@CFR`
  - `integrationuser@crc.com`
  - `apiuser4Slick`
  - `pubsubuser@TWD.null`
- Replace current `entityNames` array with ALL MAO entity types:
  - `Order`, `OrderLine` (use numbers 1-7 as IDs)
  - `QuantityDetail` (long alphanumeric IDs like `252256219704097151994277714444`)
  - `OrderTrackingDetail`, `OrderTrackingInfo`
  - `FulfillmentDetail`
  - `OrderMilestone` (with `Order:Milestone:Confirmed` format in changedParameter)
  - `OrderLineNote`
  - `OrderLineTaxDetail`
  - `Invoice`, `InvoiceLine`, `InvoiceLineChargeDetail`, `InvoiceLineTaxDetail`
  - `Allocation`
  - `ReleaseLine`
  - `OrderAdditional`, `OrderAttribute`, `OrderExtension1`

### 3. Enhance generateManhattanAuditTrail Function - Changed Parameters
- Add MAO-style changed parameter patterns:
  - `Inserted QuantityDetail` (for inserts)
  - `Changed MaxFulfillmentStatusId from Fulfilled to Delivered`
  - `Changed MinFulfillmentStatusId from Fulfilled to Delivered`
  - `Changed ArchiveDate from 2026-02-19T04:39:36.769 to 2026-02-19T04:51:14.727484`
  - `Inserted OrderLineNote`
  - `Changed Quantity from 4.0 to 0.0`
  - `Changed ExpectedTime from 2025-11-21T04:30:35.345 to 2025-11-21T04:30:35.345617`
  - `Changed CRCTrackingURL from null to https://share.lalamove.com/...`
  - `Changed PaymentStatus from Authorized to Paid`
  - `Changed FulfilledQuantity from 0.0 to 4.0`
  - `Changed Status from Open to Closed`
  - `Changed TotalInformationalTaxes from 0.00 to 0.00`
  - `Inserted Invoice`, `Inserted InvoiceLine`, `Inserted InvoiceLineChargeDetail`
  - `Deleted OrderLineTaxDetail`
  - `Changed PhysicalOriginId from null to CFR156`
  - `Changed ReturnEligibilityDays from null to 14`
  - `Changed PublishStatus from None to Published`

### 4. Enhance generateManhattanAuditTrail Function - Entity IDs
- Order entity ID: `WT1562511219446800` format
- OrderLine entity IDs: Simple numbers `1`, `2`, `3`, `4`, `5`, `6`, `7`
- QuantityDetail: Long alphanumeric format `252256228351810710483474057764`
- OrderTrackingDetail: `TRKWT156251121946800-5` format
- FulfillmentDetail: Long ID `1673212776369943322188853547408036`
- Invoice: `176369943334937018261`
- Allocation: `47A5034007164059713142`
- Other entities: Long alphanumeric IDs

### 5. Enhance generateManhattanAuditTrail Function - Scale to 400+ Events
- Current function generates ~20-30 events
- Need to generate 400+ events to match MAO's 439 total
- Add event generation loops for:
  - Multiple QuantityDetail inserts per order line (repeated for each line)
  - Multiple status transitions (Open→Allocated→Released→In Process→Picked→Packed→Fulfilled→Delivered)
  - Multiple OrderLineNote inserts
  - Invoice and InvoiceLine related events
  - Allocation events (7+ allocations for 7 order lines)
  - ReleaseLine events (7 release lines)
  - Multiple OrderMilestone events (Confirmed, Shipped, Released, Allocated)
  - Tax detail events (inserts and deletes)

### 6. Update Timestamp Format
- Current format: `DD/MM/YYYY HH:mm ICT`
- MAO format from PDF: `11/21/2025 11:51 ICT` (MM/DD/YYYY HH:mm ICT)
- Update `formatManhattanDate` function to use MM/DD/YYYY format

### 7. Update UI - Alternating Row Colors
- In `audit-trail-tab.tsx`, add alternating row background colors
- Even rows: white background
- Odd rows: light gray background (`bg-gray-50`)
- Update TableRow component to accept index and apply conditional styling

### 8. Update UI - Total Count Display
- Add footer section showing total count like MAO: `439 total`
- Position at bottom left of the table
- Style: Simple text, no special formatting

### 9. Update UI - Filter Bar Layout
- Ensure filter bar matches MAO layout exactly:
  - `Order Number: W1156251121946800` (read-only display)
  - `Audit Trail [dropdown]`
  - `Audit Date: 11/21/2025 ▼` (date dropdown)
  - `Order Line ID: [input]` (enable this field, currently disabled)
  - `APPLY` button
- Remove extra spacing or padding that doesn't match MAO

### 10. Update UI - Column Headers
- Verify uppercase headers: `UPDATED BY`, `UPDATED ON`, `ENTITY NAME`, `ENTITY ID`, `CHANGED PARAMETER`, `OLD VALUE`, `NEW VALUE`
- Ensure proper column widths to match MAO proportions

### 11. Validate Changes
- Run `pnpm build` to ensure no TypeScript errors
- Start dev server and verify UI matches MAO screenshot
- Verify 400+ events are generated
- Check alternating row colors
- Verify total count displays correctly

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm build` - Ensure no TypeScript/build errors
- `pnpm dev` - Start development server
- Navigate to any order detail page and check Audit Trail tab:
  - Verify 400+ events are displayed
  - Verify alternating row colors (white/gray)
  - Verify total count shows at bottom (e.g., "439 total")
  - Verify MAO-style user names appear (apiuser4TMS, system-msg-user@CFR, etc.)
  - Verify MAO entity types appear (OrderLine, QuantityDetail, FulfillmentDetail, etc.)
  - Verify timestamp format is MM/DD/YYYY HH:mm ICT

## Notes

### MAO Entity Types from PDF (Complete List)
1. Order
2. OrderLine
3. QuantityDetail
4. OrderTrackingDetail
5. OrderTrackingInfo
6. FulfillmentDetail
7. OrderMilestone
8. OrderLineNote
9. OrderLineTaxDetail
10. Invoice
11. InvoiceLine
12. InvoiceLineChargeDetail
13. InvoiceLineTaxDetail
14. Allocation
15. ReleaseLine
16. OrderAdditional
17. OrderAttribute
18. OrderExtension1

### MAO Users from PDF
- apiuser4TMS (most common - system integration user)
- system-msg-user@CFR (system messaging)
- integrationuser@crc.com (integration events)
- apiuser4Slick (Slick system integration)
- pubsubuser@TWD.null (pub/sub messaging)

### MAO Changed Parameter Patterns
The PDF shows these specific patterns that should be replicated:
- Insert patterns: `Inserted {EntityName}`
- Change patterns: `Changed {FieldName} from {oldValue} to {newValue}`
- Delete patterns: `Deleted {EntityName}`
- Status transitions: MaxFulfillmentStatusId and MinFulfillmentStatusId track status changes at order and line level

### Event Distribution (Approximate)
Based on PDF analysis:
- QuantityDetail events: ~200 (bulk of events, 7 lines × multiple inserts)
- OrderLine events: ~70 (7 lines × multiple status changes)
- Order events: ~30 (order-level status changes)
- FulfillmentDetail events: ~20
- OrderMilestone events: ~20
- Invoice/InvoiceLine events: ~30
- Allocation events: ~20
- ReleaseLine events: ~10
- OrderLineNote events: ~10
- Tax detail events: ~20
- Other: ~10

Total: ~440 events
