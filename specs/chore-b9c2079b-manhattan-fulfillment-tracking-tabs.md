# Chore: Manhattan OMS Fulfillment & Tracking Tabs Redesign

## Metadata
adw_id: `b9c2079b`
prompt: `Redesign the Fulfillment tab and create a new Tracking tab in Order Detail view to match Manhattan OMS design.`

## Chore Description
This chore involves two major enhancements to the Order Detail view:

1. **Fulfillment Tab Redesign**: Replace the current form-based fulfillment details display with a timeline-based "Fulfillment Status" view that shows the progression of fulfillment events (Picking → Packing → Packed → Ready To Ship) in a vertical timeline format with timestamps.

2. **New Tracking Tab**: Add a new "Tracking" tab that displays shipment tracking information grouped by tracking number, showing carrier tracking events like "Shipment pickedup", "Hub / Intransit - destination arrived", "Out for Delivery", and "Delivered".

Both features will follow Manhattan OMS plain text styling without colored badges, using the ISO timestamp format (YYYY-MM-DDTHH:mm:ss).

## Relevant Files
Use these files to complete the chore:

- **src/components/order-detail-view.tsx** - Main file to modify. Contains the Order Detail view with all tabs including the current Fulfillment tab that needs redesign. Will add the new Tracking tab here.
- **src/types/audit.ts** - Reference for existing type patterns. Will add new interfaces for FulfillmentStatusEvent and TrackingEvent here.
- **src/lib/mock-data.ts** - Contains mock data generators like `generateManhattanAuditTrail`. Will add new generators for fulfillment timeline and tracking data.
- **src/components/order-detail/audit-trail-tab.tsx** - Reference for component patterns and Manhattan OMS styling approach (Card layouts, table styling, mobile responsiveness).
- **src/components/ui/card.tsx** - UI component for Card sections
- **src/components/ui/separator.tsx** - UI component for visual separation

### New Files
- **src/components/order-detail/fulfillment-timeline.tsx** - New component for the Fulfillment Status timeline display
- **src/components/order-detail/tracking-tab.tsx** - New component for the Tracking tab with tracking number groupings

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Add TypeScript Interfaces to audit.ts
- Add `FulfillmentStatusEvent` interface with fields:
  - `id: string`
  - `status: 'Picking' | 'Packing' | 'Packed' | 'Ready To Ship'`
  - `timestamp: string` (ISO format)
  - `details?: string` (optional description like "Item SKU-001 picked")
- Add `TrackingEvent` interface with fields:
  - `status: 'Shipment pickedup' | 'Hub / Intransit - destination arrived' | 'Out for Delivery' | 'Delivered'`
  - `timestamp: string`
  - `location?: string` (optional location info)
- Add `TrackingShipment` interface with fields:
  - `trackingNumber: string`
  - `carrier?: string`
  - `events: TrackingEvent[]`

### 2. Add Mock Data Generators to mock-data.ts
- Create `generateFulfillmentTimeline(orderId: string, orderData?: any)` function:
  - Generate realistic progression: Picking → Packing → Packed → Ready To Ship
  - Support multiple picking events (one per item if multiple items)
  - Use timestamps progressing forward in time
  - Return `FulfillmentStatusEvent[]` sorted chronologically
- Create `generateTrackingData(orderId: string, orderData?: any)` function:
  - Generate 1-3 tracking numbers with realistic carrier prefixes (JNT, KNJ, THP, etc.)
  - Each tracking number has events: Shipment pickedup → Hub transit → Out for Delivery → Delivered
  - Use realistic timestamp progression
  - Return `TrackingShipment[]`
- Export both functions from the mock-data module

### 3. Create FulfillmentTimeline Component
- Create new file `src/components/order-detail/fulfillment-timeline.tsx`
- Implement vertical timeline layout:
  - Left side: Status name (plain text, no colored badges)
  - Right side: Timestamp in YYYY-MM-DDTHH:mm:ss format
  - Vertical connecting line between events
  - Circle/dot indicator for each event
- Use Card component for the timeline section
- Make responsive: stack layout on mobile
- Add empty state when no fulfillment events

### 4. Create TrackingTab Component
- Create new file `src/components/order-detail/tracking-tab.tsx`
- Implement grouped tracking display:
  - Section header: "Tracking Number - {trackingNumber}" with subtle gray background
  - List of events under each tracking number with status and timestamp
  - Support multiple tracking numbers per order
- Use Card component for overall container
- Add scrollable content area for long event lists (max-h with overflow-y-auto)
- Make responsive: full width on mobile
- Add empty state when no tracking data

### 5. Update Order Detail View - Tab Structure
- Update `TabsList` grid classes from `lg:grid-cols-7` to `lg:grid-cols-8`
- Add new "Tracking" TabsTrigger between "Delivery" and "Timeline":
  ```tsx
  <TabsTrigger value="tracking" className="text-xs sm:text-sm px-2 py-2 whitespace-nowrap">Tracking</TabsTrigger>
  ```
- Add import for new components at top of file

### 6. Update Order Detail View - Fulfillment Tab Content
- Replace current Fulfillment tab CardContent with the new FulfillmentTimeline component
- Keep the SLA Performance card on the right side (in a grid layout)
- Layout: `grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6`
  - Left: FulfillmentTimeline component
  - Right: SLA Performance card (keep existing)
- Import and use `generateFulfillmentTimeline` from mock-data

### 7. Add Tracking Tab Content
- Add new `TabsContent` for "tracking" value
- Import and use TrackingTab component
- Pass orderId and orderData to the component
- Import and use `generateTrackingData` from mock-data

### 8. Verify Styling Consistency
- Ensure no colored Badge components used for status display (plain text only)
- Verify timestamps use consistent YYYY-MM-DDTHH:mm:ss format
- Check gray background on section headers matches Manhattan OMS style
- Confirm mobile responsive behavior works correctly

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm build` - Ensure the project builds without TypeScript or compilation errors
- `pnpm lint` - Verify no ESLint errors introduced
- `pnpm dev` - Start development server and manually verify:
  1. Navigate to any order detail view
  2. Click "Fulfillment" tab - should show timeline-based status display
  3. Click "Tracking" tab - should show tracking numbers with event history
  4. Verify 8 tabs are displayed on large screens
  5. Test mobile responsiveness by resizing browser
  6. Confirm no colored badges used for status text
  7. Verify timestamps display in YYYY-MM-DDTHH:mm:ss format

## Notes
- The current Fulfillment tab displays mostly "N/A" values since the API doesn't provide fulfillment_info. The new timeline approach will use generated mock data for demonstration purposes.
- Tracking data is also not available from the current API, so mock data generators will provide realistic carrier tracking information.
- The design follows Manhattan OMS plain text styling - avoid using Badge components with colored backgrounds for status displays.
- Consider future integration: when real API provides fulfillment and tracking data, the components should be able to accept real data by updating the data source without changing the UI components.
- The `format` function from `date-fns` is already used in audit-trail-tab.tsx and can be reused for timestamp formatting.
