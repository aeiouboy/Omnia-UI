# Chore: Add MAO Tracking Status Events to Order W1156251121946800

## Metadata
adw_id: `08f32d36`
prompt: `ADD MAO TRACKING STATUS EVENTS TO ORDER W1156251121946800: Update the tracking array in maoOrderW1156251121946800 in src/lib/mock-data.ts to add two new tracking events from MAO system - 'Out for Delivery' at 2025-11-21T11:39:33 and 'Delivered' at 2025-11-21T11:51:14.43. The events array currently has events like Order Placed, Picking, Picked, Packed, Ready To Ship. Add the two new events after Ready To Ship: 1) Out for Delivery event with status 'Out for Delivery', timestamp '2025-11-21T11:39:33', location 'Bang Yai' 2) Delivered event with status 'Delivered', timestamp '2025-11-21T11:51:14', location 'Bang Muang, Bang Yai'. The Delivered event should be the final event in the timeline. Verify the tracking events display correctly in the Tracking tab.`

## Chore Description
Update the tracking events array in the MAO order W1156251121946800 mock data to reflect the exact timestamps from the MAO system. The current events array has placeholder timestamps for 'Out for Delivery' (13:15:00) and 'Delivered' (14:45:00) events. These need to be updated to match the actual MAO system timestamps:
- **Out for Delivery**: 2025-11-21T11:39:33 at Bang Yai
- **Delivered**: 2025-11-21T11:51:14 at Bang Muang, Bang Yai

The corrected timestamps show the actual delivery timeline from the MAO system - approximately 9 minutes from leaving the store to delivery completion.

## Relevant Files
Use these files to complete the chore:

- **src/lib/mock-data.ts** - Contains the `maoOrderW1156251121946800` object with the tracking array that needs timestamp updates (lines 3819-3827)
- **src/types/audit.ts** - Contains the `TrackingShipment` and tracking event interface definitions for reference

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Update Tracking Events Timestamps
- Locate the `tracking` array in `maoOrderW1156251121946800` object at line 3819
- Update the 'Out for Delivery' event timestamp from `2025-11-21T13:15:00` to `2025-11-21T11:39:33`
- Update the 'Delivered' event timestamp from `2025-11-21T14:45:00` to `2025-11-21T11:51:14`
- Verify the location values match the requirement:
  - 'Out for Delivery' location: 'Bang Yai'
  - 'Delivered' location: 'Bang Muang, Bang Yai'

### 2. Validate TypeScript Compilation
- Run `pnpm build` to ensure no TypeScript errors
- Verify the tracking data structure remains valid

### 3. Visual Verification
- Start the development server with `pnpm dev`
- Navigate to Order Detail view for order W1156251121946800
- Open the Tracking tab
- Verify all 7 events display in chronological order:
  1. Order Placed - 2025-11-21T10:42:00
  2. Picking - 2025-11-21T10:45:30
  3. Picked - 2025-11-21T11:06:35
  4. Packed - 2025-11-21T11:29:32
  5. Ready To Ship - 2025-11-21T11:30:33
  6. Out for Delivery - 2025-11-21T11:39:33
  7. Delivered - 2025-11-21T11:51:14

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm build` - Verify TypeScript compilation succeeds
- `pnpm dev` - Start development server to visually verify tracking events display

## Notes
- The timestamps represent actual MAO system data extracted from the production system
- The delivery timeline shows ~9 minutes from "Out for Delivery" to "Delivered" status
- This aligns with the actual delivery experience for the 3H (3-hour) home delivery service
