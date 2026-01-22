# Chore: Fix Tracking Tab Duplicate Key and allocationType Errors

## Metadata
adw_id: `f1f840a4`
prompt: `Fix remaining tracking-tab.tsx issues for order CDS251229874674. Issues: 1) At line 304, change key from shipment.trackingNumber to shipment.relNo to fix duplicate key error (shipments 2 and 3 both use KNJ0312512024403). 2) Search tracking-tab.tsx for ALL occurrences of 'allocationType' and apply the same null-safe pattern: const shipTo = shipment.shipToAddress || shipment.shipToStore; const allocationType = shipTo?.allocationType. Look for CCShipmentDetails component or any other place accessing allocationType directly. Apply fix everywhere it's accessed without null check.`

## Chore Description
This chore fixes two critical issues in the tracking tab for mixed-fulfillment orders like CDS251229874674:

1. **React Duplicate Key Error**: The current implementation uses `shipment.trackingNumber` as the React key at line 304. However, shipments 2 (store pickup with status "PICKED UP") and 3 (store merge with status "DELIVERED") both share the same tracking number `KNJ0312512024403`. This violates React's requirement for unique sibling keys and causes unpredictable rendering behavior.

2. **allocationType TypeError**: The `CCShipmentDetailsSection` component directly accesses `shipment.shipToAddress.allocationType` at line 47 without null checking. When a shipment uses `shipToStore` instead of `shipToAddress` (as is the case for Click & Collect shipments), this causes a runtime TypeError.

## Relevant Files
Use these files to complete the chore:

- **`src/components/order-detail/tracking-tab.tsx`** - Main tracking tab component. Contains the duplicate key issue at line 304 and already has a null-safe pattern at lines 285-286 that should be followed as a reference pattern.
- **`src/components/order-detail/cc-shipment-details-section.tsx`** - Click & Collect shipment details component. Line 47 directly accesses `shipment.shipToAddress.allocationType` without null checking, causing TypeError when shipments use `shipToStore`.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Fix Duplicate Key Error in tracking-tab.tsx
- Navigate to line 304 in `src/components/order-detail/tracking-tab.tsx`
- Change the key prop from `shipment.trackingNumber` to `shipment.relNo`
- The `relNo` property is unique per shipment (e.g., CDS2512298746741, CDS2512298746742, CDS2512298746743) while tracking numbers can be shared across shipments

**Before:**
```tsx
<div key={shipment.trackingNumber} className="space-y-3">
```

**After:**
```tsx
<div key={shipment.relNo} className="space-y-3">
```

### 2. Fix allocationType Access in CCShipmentDetailsSection
- Open `src/components/order-detail/cc-shipment-details-section.tsx`
- At line 47, apply the null-safe pattern by first resolving the shipTo object (either `shipToAddress` or `shipToStore`), then accessing `allocationType` with optional chaining
- Follow the same pattern already used in `tracking-tab.tsx` at lines 285-286

**Before (line 47):**
```tsx
const allocationType = shipment.shipToAddress.allocationType
```

**After:**
```tsx
const shipTo = shipment.shipToAddress || (shipment as any).shipToStore
const allocationType = shipTo?.allocationType || 'Pickup'
```

### 3. Update All Direct Property Accesses in CCShipmentDetailsSection
- Review lines 116, 122, 128, 134, 146 where `shipment.shipToAddress.*` is accessed directly
- Update all these to use the null-safe `shipTo` variable

**Changes required:**
- Line 116: `{shipment.shipToAddress.email}` → `{shipTo?.email || '-'}`
- Line 122: `{shipment.shipToAddress.name}` → `{shipTo?.name || '-'}`
- Line 128: `{shipment.shipToAddress.address}` → `{shipTo?.address || '-'}`
- Line 134: `{shipment.shipToAddress.fullAddress}` → `{shipTo?.fullAddress || '-'}`
- Line 146: `{shipment.shipToAddress.phone}` → `{shipTo?.phone || '-'}`

### 4. Validate the Changes
- Run TypeScript compilation to check for type errors
- Navigate to order CDS251229874674 in the UI and verify the Tracking tab renders all three shipments without errors
- Verify there are no duplicate key warnings in the browser console

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm build` - Verify TypeScript compilation succeeds with no type errors
- `pnpm dev` - Start development server and manually test order CDS251229874674:
  1. Navigate to Order Management
  2. Search for order CDS251229874674
  3. Click on the order to view details
  4. Click on the "Tracking" tab
  5. Verify all 3 shipments display correctly:
     - Shipment 1: Home Delivery (tracking: KNJ0312512024402)
     - Shipment 2: Store Pickup (tracking: KNJ0312512024403, status: PICKED UP)
     - Shipment 3: Store Merge (tracking: KNJ0312512024403, status: DELIVERED)
  6. Open browser DevTools Console and verify no "duplicate key" warnings appear

## Notes
- The pattern `shipment.shipToAddress || (shipment as any).shipToStore` is already established in `tracking-tab.tsx` at line 285, making this a consistent approach across the codebase
- Using `relNo` as the key is appropriate because it's the release number that uniquely identifies each shipment within an order, even when tracking numbers are reused
- The fallback value `'Pickup'` for allocationType is chosen because Click & Collect shipments default to Pickup allocation type when not specified
