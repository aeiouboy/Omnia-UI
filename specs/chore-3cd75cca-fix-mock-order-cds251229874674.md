# Chore: Fix Mock Order CDS251229874674 Issues

## Metadata
adw_id: `3cd75cca`
prompt: `Fix mock order CDS251229874674 issues in src/lib/mock-data.ts and update tracking-tab.tsx to handle store shipments. Issues: 1) In maoOrderCDS251229874674.deliveryMethods[1], rename 'storePickup' property to 'clickCollect' to match DeliveryMethod type interface. 2) In src/components/order-detail/tracking-tab.tsx line 285, fix the allocationType access to handle both shipToAddress AND shipToStore - use: const shipTo = shipment.shipToAddress || shipment.shipToStore; const allocationType = shipTo?.allocationType || 'Delivery'. 3) Verify payment_info.subtotal=1221 and paymentDetails array sums to 1221 (822+399). Check if pricingBreakdown.shippingFee should be 0 not 80.`

## Chore Description
This chore fixes three issues with the mixed-fulfillment mock order CDS251229874674:

1. **Type Mismatch in deliveryMethods**: The Click & Collect delivery method at `deliveryMethods[1]` uses property name `storePickup` but the `DeliveryMethod` interface in `src/types/delivery.ts` defines it as `clickCollect`. This causes TypeScript type errors.

2. **Runtime Error in Tracking Tab**: The tracking tab component crashes with `TypeError: Cannot read properties of undefined (reading 'allocationType')` when viewing orders with store shipments. The code at line 285 assumes all shipments have `shipToAddress`, but store pickup and store merge shipments use `shipToStore` instead.

3. **Payment Data Verification**: Verify that payment totals are correct (subtotal=1221, paymentDetails sum 822+399=1221) and that shippingFee is 0 (not 80) since the specification indicates no shipping fee for this order.

## Relevant Files
Use these files to complete the chore:

- **src/lib/mock-data.ts** (lines 9530-9541): Contains `maoOrderCDS251229874674.deliveryMethods[1]` with incorrect property name `storePickup` that needs to be renamed to `clickCollect`
- **src/components/order-detail/tracking-tab.tsx** (line 285): Contains the allocationType access that needs null-safe handling for both `shipToAddress` and `shipToStore`
- **src/types/delivery.ts** (lines 43-48): Reference file showing the correct `DeliveryMethod` interface with `clickCollect` property

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Fix DeliveryMethod Property Name in Mock Data
- Open `src/lib/mock-data.ts`
- Navigate to line 9533 where `storePickup` property is defined in `deliveryMethods[1]`
- Rename `storePickup` to `clickCollect` to match the `DeliveryMethod` interface
- Update the nested properties to match `ClickCollectDetails` interface:
  - Add `recipientName` property (use customer name: 'ภัคพล พีระภาค')
  - Add `phone` property (use customer phone: '0829359993')
  - Add `relNo` property (use: 'CDS2512298746743')
  - Add `pickupDate` property (use: '2026-01-04')
  - Add `timeSlot` property (use: '10:00-18:00')
  - Rename `secretCode` to `collectionCode`
  - Add `allocationType` property with value 'Pickup'

### 2. Fix Tracking Tab allocationType Access
- Open `src/components/order-detail/tracking-tab.tsx`
- Locate line 285 where `shipment.shipToAddress.allocationType` is accessed
- Replace the direct property access with null-safe access pattern:
  ```typescript
  const shipTo = shipment.shipToAddress || shipment.shipToStore
  const allocationType = shipTo?.allocationType || 'Delivery'
  ```
- This allows the component to handle both:
  - Home delivery shipments with `shipToAddress`
  - Store pickup/merge shipments with `shipToStore`

### 3. Verify Payment Data Correctness
- Confirm `payment_info.subtotal` equals 1221 (line 9482)
- Confirm `paymentDetails` array sums correctly: 822 + 399 = 1221 (lines 9495 and 9506)
- Confirm `pricingBreakdown.shippingFee` equals 0 (line 9471)
- These values are already correct in the current mock data - no changes needed

### 4. Validate the Changes
- Run the development server
- Navigate to Order Management Hub
- Open order CDS251229874674
- Click on Tracking tab to verify no runtime errors
- Verify all three shipments display correctly:
  - Home Delivery shipment (KNJ0312512024648) with "Delivery" allocation
  - Store Pickup shipment (KNJ0312512024403) with "Pickup" allocation
  - Store Merge shipment (KNJ0312512024403) with "Merge" allocation

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm build` - Ensure TypeScript compilation succeeds with no type errors
- `pnpm dev` - Start development server and manually test:
  1. Navigate to Order Management Hub (http://localhost:3000/orders)
  2. Click on order CDS251229874674 to open detail view
  3. Click "Tracking" tab - should render without runtime errors
  4. Verify all 3 shipments display with correct allocation types

## Notes
- The `ClickCollectDetails` interface in `src/types/delivery.ts` defines the correct property names that the Click & Collect delivery method should use
- The tracking tab handles three types of shipments: Home Delivery (shipToAddress), Store Pickup (shipToStore with Pickup), and Store Merge (shipToStore with Merge)
- Payment data verification confirmed the values are already correct - no changes needed for payment amounts
- The shippingFee is already 0 in the mock data at line 9471, which is correct per the specification
