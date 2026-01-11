# Chore: Fix Click & Collect Pickup Scenario ETA Field Display

## Metadata
adw_id: `ddde9d55`
prompt: `Fix Click & Collect Pickup scenario to show ETA field.

  **BUG**: ETA field is not displayed for Pickup allocation type, but user requirement shows ETA should be visible.

  **CURRENT BEHAVIOR** (cc-shipment-details-section.tsx):
  ETA field is only shown when allocation type is Merge:
  - Line ~77-83: {isMerge && shipment.eta && (...ETA field...)}

  **EXPECTED BEHAVIOR**:
  ETA field should be shown for BOTH Pickup and Merge allocation types.

  **FIX**:
  In src/components/order-detail/cc-shipment-details-section.tsx:
  Change the ETA condition from:
  {isMerge && shipment.eta && (...)}
  To:
  {shipment.eta && (...)}

  This will show ETA for both Pickup and Merge scenarios while keeping 'Shipped on' only for Merge.`

## Chore Description
Fix the Click & Collect Pickup scenario to properly display the ETA (Estimated Time of Arrival) field in the shipment details section. Currently, the ETA field is incorrectly hidden for Pickup allocation types due to a conditional check that restricts ETA display to only Merge scenarios.

**Current Issue:**
- The component at `src/components/order-detail/cc-shipment-details-section.tsx` has a condition `{isMerge && shipment.eta && (...)}` on line 75-80
- This prevents ETA from showing when `allocationType === 'Pickup'`
- The UI requirement specifies ETA should be visible for BOTH Pickup and Merge scenarios

**Expected Behavior:**
- ETA field should display for any Click & Collect shipment that has ETA data (both Pickup and Merge)
- "Shipped on" field should remain exclusive to Merge allocation type only
- The fix requires changing the condition from `{isMerge && shipment.eta && (...)}` to `{shipment.eta && (...)}`

**Secondary Issue:**
- Mock data generator (`src/lib/mock-data.ts` line 1813) currently sets `eta: ''` (empty string) for Pickup scenarios
- This means even after fixing the UI display logic, Pickup shipments won't show ETA because the data is missing
- Need to generate realistic ETA dates for Pickup scenarios in mock data

## Relevant Files
Use these files to complete the chore:

- **src/components/order-detail/cc-shipment-details-section.tsx** (lines 75-80) - Remove the `isMerge` condition from ETA field display. The ETA field is currently conditional on `{isMerge && shipment.eta && (...)}`, but should be `{shipment.eta && (...)}` to allow display for both Pickup and Merge allocation types.

- **src/lib/mock-data.ts** (line 1813) - Update the Pickup scenario ETA generation from empty string to a realistic future date. Currently sets `eta: ''` which prevents ETA display even when UI logic is fixed. Should generate an ETA date similar to how Merge scenarios generate ETA using `formatDateDDMMYYYY()` helper function.

- **src/types/audit.ts** (lines 320-333) - Reference for `TrackingShipment` interface that defines the `eta` field as a string in DD/MM/YYYY format. Confirms ETA is a standard field for all tracking scenarios.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Fix UI Component ETA Display Logic
- Open `src/components/order-detail/cc-shipment-details-section.tsx`
- Locate the ETA field section (lines 75-80)
- Change the condition from `{isMerge && shipment.eta && (...)}` to `{shipment.eta && (...)}`
- Verify the "Shipped on" field remains with `{isMerge && shipment.shippedOn && (...)}` condition (lines 83-88)
- This ensures ETA displays for both Pickup and Merge when data is present, while "Shipped on" remains Merge-only

### 2. Update Mock Data to Generate ETA for Pickup Scenarios
- Open `src/lib/mock-data.ts`
- Locate the Pickup scenario tracking generation (around lines 1807-1829)
- Find line 1813 which currently has `eta: '', // No ETA for Pickup`
- Generate a realistic future ETA date (1-3 days from now) for Pickup scenarios
- Use the existing `formatDateDDMMYYYY()` helper function (already used for Merge scenarios on line 1893)
- Update the comment to reflect that ETA is now generated for Pickup
- Example implementation:
  ```typescript
  const pickupEtaDate = new Date(now.getTime() + (Math.floor(Math.random() * 3) + 1) * 24 * 60 * 60 * 1000)
  eta: formatDateDDMMYYYY(pickupEtaDate), // Generate ETA for Pickup
  ```

### 3. Verify the Fix with Visual Testing
- Start the development server with `pnpm dev`
- Navigate to an order with Click & Collect Pickup allocation type
- Verify that the ETA field now displays in the shipment details section
- Confirm "Shipped on" field is NOT displayed for Pickup (should only show for Merge)
- Check a Merge allocation type order to ensure ETA and "Shipped on" both still display
- Validate that the ETA format matches DD/MM/YYYY pattern

### 4. Test Multiple Click & Collect Scenarios
- Test Pickup allocation type: Should show ETA, should NOT show "Shipped on"
- Test Merge allocation type: Should show BOTH ETA and "Shipped on"
- Test mixed delivery orders (both Home Delivery and Click & Collect): Verify each section displays correctly
- Confirm no console errors or TypeScript compilation issues

## Validation Commands
Execute these commands to validate the chore is complete:

- `grep -n "isMerge && shipment.eta" src/components/order-detail/cc-shipment-details-section.tsx` - Should return no matches (condition removed)
- `grep -n "shipment.eta &&" src/components/order-detail/cc-shipment-details-section.tsx` - Should return one match showing the updated ETA condition without isMerge check
- `grep -n "eta: ''" src/lib/mock-data.ts` - Should return no matches in the Pickup scenario section (empty string replaced with generated date)
- `grep -n "formatDateDDMMYYYY.*eta" src/lib/mock-data.ts` - Should return matches for both Pickup and Merge scenarios
- `pnpm dev` - Start development server and visually verify ETA displays for Pickup allocation type orders
- `pnpm build` - Ensure no TypeScript or build errors

## Notes
- **CRITICAL**: The UI component fix was already completed in a previous session. Line 75-80 in `cc-shipment-details-section.tsx` currently shows `{shipment.eta && (...)}` without the `isMerge` condition.
- The remaining work is to update the mock data generator to provide ETA values for Pickup scenarios
- The `formatDateDDMMYYYY()` helper function is already available in `mock-data.ts` and used for Merge scenarios
- ETA for Pickup should represent when the customer can collect the order (typically 1-3 days from order creation)
- This fix aligns with user requirements to display ETA for all Click & Collect scenarios, not just Merge
- The "Shipped on" field correctly remains exclusive to Merge allocation type (inter-store transfers)
