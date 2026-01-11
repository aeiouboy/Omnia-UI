# Chore: Refactor Click & Collect Tracking for Two Distinct Scenarios

## Metadata
adw_id: `e7de2784`
prompt: `Refactor Click & Collect tracking in Tracking tab to handle two distinct scenarios and REMOVE Products Being Shipped section`

## Chore Description
Refactor the Click & Collect tracking functionality in the Tracking tab to properly handle two distinct scenarios based on whether the customer's chosen store has the product in stock:

1. **Scenario 1 - Store Has Product (Pickup only)**: Show a single "Pick up at store" tracking section with minimal fields (no Shipped on, no tracking events timeline).

2. **Scenario 2 - Store Doesn't Have Product (Merge + Pickup)**: Show TWO tracking sections - first a "Ship to Store" section for the Merge allocation (shipping from origin store to destination store), then a "Pick up at store" section for customer pickup.

Additionally, **completely remove the "Products Being Shipped" section** from the Click & Collect shipment details, including removing the ProductCard component import and usage.

## Relevant Files
Use these files to complete the chore:

- **src/components/order-detail/cc-shipment-details-section.tsx** - Main component to modify: remove Products Being Shipped section (lines 154-164), remove ProductCard import, update field display logic for Pickup vs Merge scenarios
- **src/lib/mock-data.ts** - Update `generateTrackingData()` function (lines 1602-1971) to generate TWO shipments for Merge scenario instead of one
- **src/components/order-detail/tracking-tab.tsx** - Verify rendering logic handles multiple C&C shipments correctly for Merge scenario
- **src/types/audit.ts** - Reference for CCTrackingShipment, CCProductItem types (may need to keep productItems optional but unused)

### Files for Reference Only (No Changes)
- **src/components/order-detail/product-card.tsx** - ProductCard component that will no longer be used by cc-shipment-details-section.tsx

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Remove Products Being Shipped Section from CCShipmentDetailsSection
- Open `src/components/order-detail/cc-shipment-details-section.tsx`
- Remove the `ProductCard` import on line 4
- Remove the "Products Being Shipped" section (lines 154-164):
  ```tsx
  {/* Product Cards - Only for Merge allocation */}
  {isMerge && shipment.productItems && shipment.productItems.length > 0 && (
    <div className="space-y-3">
      <div className="text-sm font-medium text-muted-foreground">Products Being Shipped:</div>
      <div className="space-y-2">
        {shipment.productItems.map((product, index) => (
          <ProductCard key={`${product.sku}-${index}`} product={product} />
        ))}
      </div>
    </div>
  )}
  ```

### 2. Update CCShipmentDetailsSection Field Display Logic
- In `cc-shipment-details-section.tsx`, update the left column fields:
  - **For Pickup**: Show Tracking Number, ETA, Rel No., 'Picked from:', Subdistrict (same as current)
  - **For Merge**: Show Tracking Number, ETA, Rel No., 'Shipped from:', Subdistrict (keep 'Shipped on' field for Merge)
- Ensure the right column header shows "Ship to Store" for both scenarios
- Verify Status displays correctly: "PICKED UP" (green) for Pickup, "FULFILLED" (green) for Merge

### 3. Update generateTrackingData() for Two-Shipment Merge Scenario
- Open `src/lib/mock-data.ts`
- Locate the Merge scenario handling in `generateTrackingData()` (around line 1832)
- Modify the Merge scenario to generate TWO shipments:
  - **First shipment (Merge)**:
    - allocationType: 'Merge'
    - shippedFrom: origin store (where product is shipped FROM)
    - shipToAddress.name: destination store name
    - shipToAddress.allocationType: 'Merge'
    - status: 'DELIVERED' (displays as FULFILLED)
    - Include tracking events timeline
  - **Second shipment (Pickup)**:
    - allocationType: 'Pickup'
    - shippedFrom: destination store (displayed as "Picked from")
    - shipToAddress.name: customer recipient name
    - shipToAddress.allocationType: 'Pickup'
    - status: 'PICKED_UP'
    - No tracking events (empty array)
- Remove `productItems` generation for Merge shipments (lines 1961-1965)

### 4. Update Tracking Tab Rendering for Multiple C&C Shipments
- Open `src/components/order-detail/tracking-tab.tsx`
- Verify the existing shipment loop handles multiple C&C shipments correctly
- Ensure headers display properly:
  - "Ship to Store" for Merge allocation
  - "Pick up at store" for Pickup allocation
- Verify tracking events timeline only shows for Merge shipments (which have events)

### 5. Clean Up Unused Code
- In `cc-shipment-details-section.tsx`, remove any unused imports after removing ProductCard
- Verify no TypeScript errors after changes
- Keep the CCProductItem type in audit.ts (other code may reference it)

### 6. Test and Validate the Changes
- Run `pnpm dev` to start the development server
- Navigate to an order with Click & Collect delivery method
- Verify:
  - **Pickup-only scenario**: Shows single "Pick up at store" section with correct fields
  - **Merge scenario**: Shows TWO sections - "Ship to Store" then "Pick up at store"
  - No "Products Being Shipped" section appears in either scenario
  - Status colors are correct (green for both PICKED UP and FULFILLED)
  - CRC tracking links appear where appropriate

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm build` - Ensure production build succeeds without TypeScript errors
- `pnpm lint` - Run ESLint to check for code quality issues
- `pnpm dev` - Start dev server and manually verify:
  1. Open a Click & Collect order detail page
  2. Navigate to Tracking tab
  3. Confirm "Products Being Shipped" section is removed
  4. Confirm Merge scenario shows two tracking sections
  5. Confirm Pickup scenario shows one tracking section

## Notes

### Key Implementation Details

**Scenario Detection Logic**:
- The allocation type is determined by whether the customer's store has the product
- `allocationType === 'Pickup'`: Store has product, customer picks up directly
- `allocationType === 'Merge'`: Store doesn't have product, needs inter-store transfer first

**Field Mappings for Each Scenario**:

| Field | Pickup Scenario | Merge Section | Pickup Section (after Merge) |
|-------|-----------------|---------------|------------------------------|
| Header | "Pick up at store" | "Ship to Store" | "Pick up at store" |
| Status | PICKED UP (green) | FULFILLED (green) | PICKED UP (green) |
| Tracking No | Yes | Yes | Yes |
| ETA | Yes | Yes | Yes |
| Shipped on | No | Yes | No |
| Rel No. | Yes | Yes | Yes |
| Location Label | "Picked from:" | "Shipped from:" | "Picked from:" |
| Location Value | Store name | Origin store | Destination store |
| Allocation Type | Pickup | Merge | Pickup |
| Tracking Events | No | Yes | No |

**CRC Tracking Link**: Should appear for all Click & Collect shipments pointing to `https://crc.central.co.th/tracking`
