# Chore: Fix Tracking Tab for MAO Order W1156251121946800

## Metadata
adw_id: `70e49ea8`
prompt: `FIX TRACKING TAB FOR MAO ORDER W1156251121946800: The tracking data fields (trackingNumber, eta, relNo, subdistrict, shippedFrom) exist in maoOrderW1156251121946800 object but the Tracking tab UI uses generateTrackingData() which generates random data. Fix by: 1) Add pre-defined 'tracking' array to maoOrderW1156251121946800 with single shipment containing correct MAO data: trackingNumber='TRKW1156251121946800', carrier='Home Delivery', status='DELIVERED', eta='11/21/2025', relNo='W11562511219468001', shippedFrom='Tops Westgate1', subdistrict='Bang Muang', recipient='WEERAPAT WIRUNTANGTRAKUL', phone='0804411221', address='59/20 หมู่ 11 หมู่บ้านยูเทรียมพลัสวัน ซอยวัดพระเงิน', district='Bang Muang', city='Bang Yai, 11140'. 2) Modify generateTrackingData function in mock-data.ts (line ~1845) to check for pre-defined orderData.tracking array first and return it if exists, similar to how fulfillmentTimeline was handled. Run pnpm build to validate.`

## Chore Description
The Tracking tab for MAO order W1156251121946800 currently displays randomly generated tracking data instead of using the actual tracking information that already exists in the maoOrderW1156251121946800 mock data object. The order object contains tracking-related fields (trackingNumber, eta, relNo, subdistrict, shippedFrom) but the tracking-tab.tsx component calls `generateTrackingData()` which ignores these fields and generates random carrier, tracking numbers, and addresses.

This chore implements a pattern already established for `fulfillmentTimeline` - checking for pre-defined data first before generating random data. The fix involves:
1. Adding a `tracking` array property to maoOrderW1156251121946800 with the correct shipment data
2. Modifying `generateTrackingData()` to return pre-defined tracking data when available

## Relevant Files
Use these files to complete the chore:

- **src/lib/mock-data.ts** (lines 3380-3510) - Contains maoOrderW1156251121946800 definition with existing tracking fields (trackingNumber, shippedFrom, eta, relNo, subdistrict). Also contains `generateTrackingData()` function at line 1845 that needs modification to check for pre-defined tracking array.

- **src/components/order-detail/tracking-tab.tsx** (line 164) - Uses `generateTrackingData(orderId, orderData)` to get tracking shipments. No changes needed here as the fix is in the data layer.

### Reference Pattern
- **src/lib/mock-data.ts** (lines 1700-1708) - Shows existing pattern for `generateFulfillmentTimeline()` that checks for pre-defined data:
  ```typescript
  // If order has pre-defined fulfillmentTimeline, use it
  if (orderData?.fulfillmentTimeline && Array.isArray(orderData.fulfillmentTimeline)) {
    return orderData.fulfillmentTimeline
  }
  ```

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Add tracking array to maoOrderW1156251121946800
- Open src/lib/mock-data.ts
- Locate the maoOrderW1156251121946800 object (around line 3505, after fulfillmentTimeline array)
- Add a `tracking` array property with a single shipment object containing:
  - `id`: 'SHIP-W1156251121946800-001'
  - `trackingNumber`: 'TRKW1156251121946800'
  - `carrier`: 'Home Delivery'
  - `status`: 'DELIVERED'
  - `eta`: '11/21/2025'
  - `relNo`: 'W11562511219468001'
  - `shippedFrom`: 'Tops Westgate1'
  - `subdistrict`: 'Bang Muang'
  - `recipient`: 'WEERAPAT WIRUNTANGTRAKUL'
  - `phone`: '0804411221'
  - `address`: '59/20 หมู่ 11 หมู่บ้านยูเทรียมพลัสวัน ซอยวัดพระเงิน'
  - `district`: 'Bang Muang'
  - `city`: 'Bang Yai, 11140'
  - `items`: Reference to line items or count of 17 items
  - `trackingEvents`: Array with delivery events matching the fulfillmentTimeline

### 2. Update generateTrackingData() to check for pre-defined tracking
- Locate `generateTrackingData()` function at line 1845
- Add check at the beginning of the function (after the signature, before const shipments):
  ```typescript
  // If order has pre-defined tracking, use it
  if (orderData?.tracking && Array.isArray(orderData.tracking)) {
    return orderData.tracking
  }
  ```
- This pattern mirrors the existing fulfillmentTimeline pattern at line 1705-1708

### 3. Run build validation
- Execute `pnpm build` to ensure TypeScript compilation succeeds
- Verify no type errors or build failures

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm build` - Verify TypeScript compiles without errors
- `pnpm lint` - Ensure code follows project linting rules

To manually validate the tracking data is displayed correctly:
- Run `pnpm dev` and navigate to order W1156251121946800
- Open the Tracking tab
- Verify tracking number shows 'TRKW1156251121946800' (not a random J&T/Kerry/etc tracking number)
- Verify carrier shows 'Home Delivery'
- Verify status shows 'DELIVERED'
- Verify shipped from shows 'Tops Westgate1'
- Verify recipient shows 'WEERAPAT WIRUNTANGTRAKUL'

## Notes
- The tracking array structure should match the expected return type of `generateTrackingData()` which returns `any[]` with shipment objects
- The trackingEvents within each shipment should align with the existing fulfillmentTimeline events for consistency
- This fix only affects maoOrderW1156251121946800 - other orders will continue to use generated tracking data
- Similar fix may be needed for maoOrderW1156260115052036 if it also has pre-defined tracking fields
