# Chore: Fix Tracking Tab for All Delivery Scenarios

## Metadata
adw_id: `1bf39da4`
prompt: `Fix Tracking tab to properly handle all delivery scenarios (src/components/order-detail/tracking-tab.tsx, src/components/order-detail/cc-shipment-details-section.tsx, src/lib/mock-data.ts). ISSUE 1 - Mixed delivery orders showing only C&C tracking. ISSUE 2 - C&C field labels not correct for allocation types. ISSUE 3 - Products Being Shipped section missing for Merge scenario.`

## Chore Description
The Tracking tab has three critical issues that need to be fixed:

1. **Mixed Delivery Orders**: For orders with both Home Delivery and Click & Collect (like ORD-0100), only Click & Collect tracking is shown. The Home Delivery tracking section is missing because `generateTrackingData()` only generates 1 shipment for Click & Collect orders.

2. **Click & Collect Field Labels**: The two C&C allocation types (Pickup vs Merge) have different field label requirements:
   - **Pickup**: Should show "Picked from:" (NOT "Shipped from:")
   - **Merge**: Should show "Shipped from:"
   - Currently `cc-shipment-details-section.tsx` already handles this correctly at line 101-102.

3. **Products Being Shipped Section**: For Merge (Ship to Store) allocation, the product cards section should display but may not be appearing because:
   - `generateTrackingData()` does include `productItems` for Merge allocations (line 1934-1937)
   - `cc-shipment-details-section.tsx` does render `ProductCard` components (lines 154-164)
   - Need to verify the data flow is working correctly

## Relevant Files
Use these files to complete the chore:

- **src/lib/mock-data.ts** (lines 1602-1943) - The `generateTrackingData()` function needs to be updated to return multiple shipments for mixed delivery orders. Currently line 1758 sets `shipmentCount = 1` for C&C orders, ignoring Home Delivery.

- **src/components/order-detail/tracking-tab.tsx** (lines 160-291) - Main tracking tab component needs section headers to distinguish between "Home Delivery Tracking" and "Click & Collect Tracking" for mixed delivery orders. Need Truck icon for Home Delivery and Store icon for C&C.

- **src/components/order-detail/cc-shipment-details-section.tsx** (lines 1-167) - C&C specific shipment details. Already has correct Pickup/Merge label logic at lines 100-105 and Products Being Shipped section at lines 154-164.

- **src/components/order-detail/product-card.tsx** (lines 1-50) - Product card component for Ship to Store products. Already implemented with green border styling.

- **src/types/audit.ts** (lines 335-352) - Type definitions for `CCProductItem` and `CCTrackingShipment`. Already includes `productItems` field.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Update generateTrackingData() to Support Mixed Delivery
- In `src/lib/mock-data.ts`, modify `generateTrackingData()` function
- Check if order has BOTH `HOME_DELIVERY` and `CLICK_COLLECT` delivery methods
- For mixed delivery orders:
  - Generate 1 shipment for Home Delivery (with carrier tracking like Kerry Express, J&T Express)
  - Generate 1 shipment for Click & Collect (with CRC Logistics)
- Update the shipmentCount logic at line 1758:
  ```typescript
  // Check for mixed delivery (both Home Delivery and Click & Collect)
  const hasHomeDelivery = orderData?.deliveryMethods?.some((dm: any) => dm.type === 'HOME_DELIVERY') || false
  const hasBothMethods = hasHomeDelivery && isClickCollect

  // Generate 2 shipments for mixed delivery, 1 for C&C only, 1-3 for home delivery only
  const shipmentCount = hasBothMethods ? 2 : (isClickCollect ? 1 : Math.floor(Math.random() * 3) + 1)
  ```
- When generating shipments for mixed delivery:
  - First shipment (s=0): Home Delivery with `allocationType: 'Delivery'`
  - Second shipment (s=1): Click & Collect with `allocationType: 'Pickup'` or `'Merge'`
- Add `shipmentType` field to distinguish between 'HOME_DELIVERY' and 'CLICK_COLLECT' shipments

### 2. Add Section Headers for Mixed Delivery in TrackingTab
- In `src/components/order-detail/tracking-tab.tsx`, import `Store` icon from lucide-react
- Add logic to detect mixed delivery orders:
  ```typescript
  const hasHomeDelivery = orderData?.deliveryMethods?.some((dm: any) => dm.type === 'HOME_DELIVERY') || false
  const hasClickCollect = orderData?.deliveryMethods?.some((dm: any) => dm.type === 'CLICK_COLLECT') || false
  const isMixedDelivery = hasHomeDelivery && hasClickCollect
  ```
- For mixed delivery orders, add section headers before each shipment group:
  - "Home Delivery Tracking" with Truck icon for `allocationType === 'Delivery'`
  - "Click & Collect Tracking" with Store icon for `allocationType === 'Pickup'` or `'Merge'`
- Modify the shipment header section (lines 217-232) to show appropriate icon and text based on shipment type

### 3. Verify Pickup vs Merge Labels in CCShipmentDetailsSection
- In `src/components/order-detail/cc-shipment-details-section.tsx`, verify the label logic at lines 100-105:
  - `isPickup` should show "Picked from:"
  - `isMerge` should show "Shipped from:"
- Verify status display:
  - Pickup: Shows "PICKED UP" (green)
  - Merge: Shows "FULFILLED" (green) - already handled by `formatStatus()` at lines 32-39

### 4. Verify Products Being Shipped Section for Merge
- In `src/components/order-detail/cc-shipment-details-section.tsx`, verify lines 154-164 render correctly
- Ensure `shipment.productItems` is properly populated from mock data
- Add console logging temporarily to debug if products don't appear:
  ```typescript
  console.log('CC Shipment - isMerge:', isMerge, 'productItems:', shipment.productItems)
  ```

### 5. Update ShipToAddress Type for Shipment Type
- In `src/types/audit.ts`, optionally add `shipmentType` to distinguish Home Delivery vs C&C:
  ```typescript
  export interface TrackingShipment {
    // ... existing fields
    shipmentType?: 'HOME_DELIVERY' | 'CLICK_COLLECT'  // Optional for backwards compatibility
  }
  ```

### 6. Test with ORD-0100 Mixed Delivery Order
- Run the development server: `pnpm dev`
- Navigate to order detail page for ORD-0100 (mixed delivery order)
- Verify Tracking tab shows:
  - "Home Delivery Tracking" section with Truck icon, Kerry/J&T/etc carrier, standard tracking info
  - "Click & Collect Tracking" section with Store icon, CRC Logistics
- For Click & Collect section:
  - If Pickup: "Pick up at store" header, "Picked from:" label, "PICKED UP" status
  - If Merge: "Ship to Store" header, "Shipped from:" label, "FULFILLED" status, Products Being Shipped section

### 7. Test Click & Collect Only Orders
- Test a Click & Collect only order (without Home Delivery)
- Verify only C&C tracking section appears
- Test both Pickup and Merge allocation scenarios

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm dev` - Start development server and manually test ORD-0100 order's Tracking tab
- `pnpm build` - Ensure production build completes without TypeScript errors
- `pnpm lint` - Run ESLint to catch any code style issues

## Notes
- ORD-0100 is specifically configured in mock-data.ts (lines 345-380) to have both HOME_DELIVERY and CLICK_COLLECT delivery methods for testing purposes
- The current implementation correctly handles Pickup vs Merge labels (already working in cc-shipment-details-section.tsx)
- The Products Being Shipped section uses ProductCard component which renders with green border styling
- CRC Logistics is the carrier used for all Click & Collect shipments (Ship to Store)
- Standard carriers (Kerry Express, J&T Express, Thailand Post, etc.) are used for Home Delivery shipments
