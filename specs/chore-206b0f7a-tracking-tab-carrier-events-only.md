# Chore: Tracking Tab Display Like MAO - Carrier Events Only

## Metadata
adw_id: `206b0f7a`
prompt: `TRACKING TAB DISPLAY LIKE MAO: Update the Tracking tab for order W1156251121946800 to display only carrier tracking events like MAO system does. Currently showing 7 events (Order Placed, Picking, Picked, Packed, Ready To Ship, Out for Delivery, Delivered) but should only show 2 carrier events: 1) Out for Delivery - 2025-11-21T11:39:33 at Bang Yai 2) Delivered - 2025-11-21T11:51:14 at Bang Muang, Bang Yai. The fulfillment events (Order Placed, Picking, Picked, Packed, Ready To Ship) should remain in the Fulfillment tab, not in Tracking tab. Update the tracking array in maoOrderW1156251121946800 in src/lib/mock-data.ts to only contain the 2 carrier tracking events. Also display Tracking Number: TRKW1156251121946800 at the top of the Tracking tab section.`

## Chore Description
The Tracking tab for MAO order W1156251121946800 currently displays 7 events that mix fulfillment and carrier tracking events. According to the MAO system design, the Tracking tab should only display carrier-related tracking events (Out for Delivery, Delivered), while fulfillment events (Order Placed, Picking, Picked, Packed, Ready To Ship) should be displayed in the Fulfillment tab.

This chore will:
1. Update the `tracking` array in `maoOrderW1156251121946800` mock data to only include 2 carrier events:
   - Out for Delivery (2025-11-21T11:39:33 at Bang Yai)
   - Delivered (2025-11-21T11:51:14 at Bang Muang, Bang Yai)
2. Ensure the tracking number (TRKW1156251121946800) is prominently displayed at the top of the Tracking tab section

Note: The fulfillment events are already correctly stored in the `fulfillmentTimeline` array (lines 3771-3796 in mock-data.ts) and should remain there for the Fulfillment tab.

## Relevant Files
Use these files to complete the chore:

- **src/lib/mock-data.ts** (lines 3797-3829) - Contains the `tracking` array for `maoOrderW1156251121946800` that needs to be updated to only include carrier events (Out for Delivery, Delivered). Currently has 7 events in the `events` array that need to be reduced to 2.

- **src/components/order-detail/tracking-tab.tsx** - The Tracking tab component that displays tracking information. The tracking number display is already handled in the header section (line 211: `Tracking Number - ${shipment.trackingNumber}`), which is correct. No changes needed here since the component already displays tracking number at the top.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Update Tracking Events Array in Mock Data
- Open `src/lib/mock-data.ts`
- Locate the `tracking` array in `maoOrderW1156251121946800` (around line 3799-3829)
- Replace the current `events` array (7 events) with only 2 carrier tracking events:
  ```typescript
  events: [
    { status: 'Out for Delivery', timestamp: '2025-11-21T11:39:33', location: 'Bang Yai' },
    { status: 'Delivered', timestamp: '2025-11-21T11:51:14', location: 'Bang Muang, Bang Yai' }
  ]
  ```
- Remove the fulfillment events: Order Placed, Picking, Picked, Packed, Ready To Ship

### 2. Verify Tracking Number Display
- Confirm that the tracking-tab.tsx component already displays the tracking number at the top
- The header section (line 241-255) shows `Tracking Number - ${shipment.trackingNumber}` which will display "Tracking Number - TRKW1156251121946800"
- No changes needed in tracking-tab.tsx as it already displays the tracking number correctly

### 3. Verify Fulfillment Events Remain in Fulfillment Timeline
- Confirm that the `fulfillmentTimeline` array (lines 3771-3796) still contains the fulfillment events:
  - Picking (2025-11-21T10:45:30)
  - Picked (2025-11-21T11:06:35)
  - Packed (2025-11-21T11:29:32)
  - Ready To Ship (2025-11-21T11:30:33)
- These events should remain unchanged for the Fulfillment tab

### 4. Validate Build Compiles Successfully
- Run `pnpm build` to ensure TypeScript compilation passes
- Verify no type errors related to tracking data structure

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm build` - Verify TypeScript compilation succeeds with no errors
- `pnpm dev` - Start development server and navigate to order W1156251121946800 to verify:
  1. Tracking tab shows only 2 events (Out for Delivery, Delivered)
  2. Tracking number "TRKW1156251121946800" is displayed at the top
  3. Fulfillment tab still shows the fulfillment events

## Notes
- The MAO system design philosophy separates carrier tracking (external shipping events) from fulfillment tracking (internal warehouse/store events)
- This change only affects the `maoOrderW1156251121946800` order data; other orders will continue to use the `generateTrackingData` function which may generate different event types
- The `fulfillmentTimeline` array already contains the proper fulfillment events for the Fulfillment tab, maintaining data separation
- The tracking-tab.tsx component structure already supports displaying tracking number prominently via the header section with gray background
