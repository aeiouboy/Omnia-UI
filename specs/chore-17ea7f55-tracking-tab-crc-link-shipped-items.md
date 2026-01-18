# Chore: Tracking Tab Add CRC Link and Shipped Items

## Metadata
adw_id: `17ea7f55`
prompt: `TRACKING TAB ADD CRC LINK AND SHIPPED ITEMS: Update the Tracking tab for order W1156251121946800 to match MAO layout. Add two sections after the Ship to Address info: 1) CRC tracking link section showing 'CRC tracking link:' label with URL 'https://share.lalamove.com/?TH100251121123033575110010048622967&lang=en_TH&sign=8cef48844c3b24015cf7750c690d4a' as a clickable link. 2) Shipped items list showing all items from the order with columns: Product Name, SKU/Barcode, Shipped Qty, Ordered Qty, UOM.`

## Chore Description
Update the Tracking tab component for MAO order W1156251121946800 to add two new sections after the Ship to Address information, matching the Manhattan OMS (MAO) layout:

1. **CRC Tracking Link Section**: Display a labeled link "CRC tracking link:" followed by the Lalamove tracking URL as a clickable external link.

2. **Shipped Items Table**: Display all shipped items from the order in a table format with columns:
   - Product Name
   - SKU/Barcode
   - Shipped Qty
   - Ordered Qty
   - UOM

The order W1156251121946800 contains 7 unique products (17 line items due to quantity normalization splits):
- Bon Aroma Gold Freeze Dried Coffee 100g (5904277114444, Qty 3, UOM SBTL)
- Betagro Egg Tofu 120g (8852043003485, Qty 2, UOM STUB)
- Smarter Dental Floss Picks 50pcs (8853474057764, Qty 1, UOM SPAC)
- Tops Frozen Salmon Steak 150g (8853474080366, Qty 4, UOM SPCS)
- N&P Hom Banana Pack 2 (8858738405534, Qty 1, UOM SPAC)
- Thammachart Seafood Frozen Atlantic Salmon Steak (8858781403990, Qty 4, UOM SPCS)
- Cubic Original Wheat Loaf (8858894100014, Qty 2, UOM SPCS)

## Relevant Files
Use these files to complete the chore:

- **src/components/order-detail/tracking-tab.tsx** - Main tracking tab component that needs to be updated to render the new CRC link and shipped items sections. Currently displays shipment details, tracking link, and carrier events.

- **src/lib/mock-data.ts** - Contains the MAO order W1156251121946800 data structure. The `tracking` array within the order object needs to be updated with the `crcTrackingUrl` field and the `shippedItems` array.

- **src/types/audit.ts** - Contains the `TrackingShipment` and `CCTrackingShipment` interfaces. May need to add new optional fields for `crcTrackingUrl` and `shippedItems`.

### New Files
None required - all changes are to existing files.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Update TrackingShipment Type Definition
- Open `src/types/audit.ts`
- Add `crcTrackingUrl?: string` optional field to the `TrackingShipment` interface for the CRC-specific tracking link
- Add `shippedItems?: ShippedItem[]` optional field to the `TrackingShipment` interface
- Define new `ShippedItem` interface with fields: `productName: string`, `sku: string`, `shippedQty: number`, `orderedQty: number`, `uom: string`

### 2. Update Mock Data for Order W1156251121946800
- Open `src/lib/mock-data.ts`
- Locate the `maoOrderW1156251121946800` object (around line 3602)
- Find the `tracking` array within this object (around line 3804)
- Update `trackingUrl` field with the Lalamove URL: `https://share.lalamove.com/?TH100251121123033575110010048622967&lang=en_TH&sign=8cef48844c3b24015cf7750c690d4a`
- Add `shippedItems` array to the tracking shipment with the 7 unique products aggregated from the items array:
  ```typescript
  shippedItems: [
    { productName: 'Bon Aroma Gold Freeze Dried Coffee 100g', sku: '5904277114444', shippedQty: 3, orderedQty: 3, uom: 'SBTL' },
    { productName: 'Betagro Egg Tofu 120g', sku: '8852043003485', shippedQty: 2, orderedQty: 2, uom: 'STUB' },
    { productName: 'Smarter Dental Floss Picks 50pcs', sku: '8853474057764', shippedQty: 1, orderedQty: 1, uom: 'SPAC' },
    { productName: 'Tops Frozen Salmon Steak 150g', sku: '8853474080366', shippedQty: 4, orderedQty: 4, uom: 'SPCS' },
    { productName: 'N&P Hom Banana Pack 2', sku: '8858738405534', shippedQty: 1, orderedQty: 1, uom: 'SPAC' },
    { productName: 'Thammachart Seafood Frozen Atlantic Salmon Steak', sku: '8858781403990', shippedQty: 4, orderedQty: 4, uom: 'SPCS' },
    { productName: 'Cubic Original Wheat Loaf', sku: '8858894100014', shippedQty: 2, orderedQty: 2, uom: 'SPCS' }
  ]
  ```

### 3. Create CRC Tracking Link Section Component
- Open `src/components/order-detail/tracking-tab.tsx`
- Create a new `CRCTrackingLinkSection` component that renders:
  - A label "CRC tracking link:" in muted text
  - The URL as a clickable blue link with external link icon
  - Use similar styling to existing `TrackingLinkSection` but with the "CRC tracking link:" prefix label

### 4. Create Shipped Items Table Component
- In `src/components/order-detail/tracking-tab.tsx`
- Create a new `ShippedItemsSection` component that renders:
  - A section header "Shipped Items" or similar
  - A responsive table with columns: Product Name, SKU/Barcode, Shipped Qty, Ordered Qty, UOM
  - Use consistent table styling with existing tables in the codebase
  - Make the table horizontally scrollable on mobile

### 5. Integrate New Sections into TrackingTab
- In the `TrackingTab` component's render logic
- After the `ShipmentDetailsSection` (around line 261 for home delivery)
- Add the `CRCTrackingLinkSection` component - only render if `shipment.trackingUrl` exists
- Replace or augment existing `TrackingLinkSection` to show "CRC tracking link:" label
- Add the `ShippedItemsSection` component - only render if `shipment.shippedItems` exists and has items

### 6. TypeScript Compilation Check
- Run `pnpm build` to verify no TypeScript errors
- Ensure all imports are correct

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm build` - Verify TypeScript compilation succeeds with no errors
- `pnpm dev` - Start development server and navigate to order W1156251121946800's Tracking tab to visually verify:
  1. CRC tracking link is displayed with "CRC tracking link:" label after ship-to address
  2. Shipped items table shows all 7 products with correct columns
  3. Clicking the CRC link opens the Lalamove tracking page in new tab
  4. Layout is responsive and readable on mobile

## Notes
- The existing `trackingUrl` field on `TrackingShipment` can be reused for the CRC tracking URL, but we want to display it with a "CRC tracking link:" label to match MAO
- The shipped items are aggregated from split line items (17 split lines become 7 unique products by SKU)
- UOM values match the mock data: SBTL (sub-bottle), STUB (sub-tube), SPAC (sub-pack), SPCS (sub-pieces)
- The CRC link format is Lalamove's share URL format for delivery tracking
