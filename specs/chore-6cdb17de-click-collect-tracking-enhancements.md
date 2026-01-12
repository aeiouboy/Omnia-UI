# Chore: Click & Collect Tracking Enhancements

## Metadata
adw_id: `6cdb17de`
prompt: `Enhance the Tracking tab (src/components/order-detail/tracking-tab.tsx) to support Click & Collect delivery method while preserving existing Home Delivery tracking functionality.

  EXISTING HOME DELIVERY TRACKING (KEEP UNCHANGED):
  - Current implementation with carrier tracking (Kerry Express, Thailand Post, etc.)
  - Tracking number, ETA, Shipped on, Ship To Address (customer address)
  - External carrier tracking link
  - Tracking events timeline
  - This is the DEFAULT behavior for HOME_DELIVERY orders

  NEW: CLICK & COLLECT TRACKING SCENARIOS:
  Detect Click & Collect from orderData.deliveryMethods where type === 'CLICK_COLLECT'

  SCENARIO 1 - 'Pick up at store' (Allocation Type: Pickup):
  When the pickup store has the product in stock, show minimal tracking info:
  - Header: 'Pick up at store' (not 'Ship to Store')
  - Left column fields: Status (PICKED UP green), Rel No., Picked from (store name), Subdistrict
  - NO Tracking number, NO ETA, NO Shipped on date (fields hidden)
  - Right column: Customer email, Store name, Store address, Allocation Type: Pickup, Phone
  - NO product card section
  - CRC tracking link section (can be empty)

  SCENARIO 2 - 'Ship to Store' (Allocation Type: Merge):
  When product needs to transfer from another store to pickup store, show full tracking:
  - Header: 'Ship to Store'
  - Left column fields: Status (FULFILLED/PICKED UP green), Tracking number, ETA, Shipped on, Rel No., Shipped from (origin store), Subdistrict
  - Right column: Customer email, Store name (destination), Full store address, Allocation Type: Merge, Phone
  - Product card section showing items being shipped with: Product name, SKU, Shipped Qty, Ordered Qty, UOM (green border)
  - CRC tracking link section with external link

  IMPLEMENTATION REQUIREMENTS:
  1. Preserve existing TrackingTab behavior for Home Delivery orders
  2. Add delivery method detection: isClickCollect from orderData.deliveryMethods
  3. Add 'allocationType' field to determine Pickup vs Merge scenario
  4. Create CCShipmentDetailsSection component for Click & Collect specific layout
  5. Create ProductCard component for Ship to Store scenario items
  6. Update generateTrackingData in mock-data.ts to generate appropriate data based on delivery method
  7. Add TypeScript types: CCTrackingShipment, CCProductItem with allocationType field
  8. For mixed delivery orders, show separate tracking sections for each delivery method`

## Chore Description
This chore enhances the Tracking tab component to support Click & Collect (C&C) delivery methods alongside the existing Home Delivery tracking. The implementation distinguishes between two C&C scenarios:

1. **Pick up at store (Allocation Type: Pickup)**: Direct pickup when the store has stock - shows minimal tracking with no shipment details
2. **Ship to Store (Allocation Type: Merge)**: Inter-store transfer required - shows full shipment tracking with product cards

The existing Home Delivery tracking functionality must remain completely unchanged and continue to work as the default for non-C&C orders. For mixed delivery orders (containing both delivery methods), the tab will display separate sections for each method.

## Relevant Files
Use these files to complete the chore:

- **src/components/order-detail/tracking-tab.tsx** - Main tracking tab component that needs to be enhanced with C&C support. Currently only handles Home Delivery with carrier tracking.

- **src/types/audit.ts** - Contains TrackingShipment, TrackingEvent, ShipToAddress types. Needs extension to support:
  - CCTrackingShipment type with allocationType field
  - CCProductItem type for product cards in Ship to Store scenario
  - Updated ShipToAddress.allocationType to include 'Pickup' and 'Merge' values

- **src/types/delivery.ts** - Contains DeliveryMethod, DeliveryMethodType, ClickCollectDetails types. Reference for delivery method detection and C&C data structure.

- **src/lib/mock-data.ts** (lines 1602-1835) - Contains generateTrackingData function that generates mock tracking shipments. Needs updates to:
  - Detect delivery method from orderData.deliveryMethods
  - Generate C&C tracking data with allocationType
  - Generate product items for Ship to Store scenario
  - Return appropriate data structure based on delivery method

### New Files

- **src/components/order-detail/cc-shipment-details-section.tsx** - New component for Click & Collect shipment details layout
  - Handles both Pickup and Merge allocation types
  - Shows conditional fields based on allocation type
  - Matches Manhattan OMS layout style

- **src/components/order-detail/product-card.tsx** - New component for displaying product items in Ship to Store scenario
  - Shows Product name, SKU, Shipped Qty, Ordered Qty, UOM
  - Green border styling to match design
  - Responsive card layout

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Extend TypeScript Types for Click & Collect
- Add CCProductItem interface to src/types/audit.ts with fields: productName, sku, shippedQty, orderedQty, uom
- Add CCTrackingShipment interface extending TrackingShipment with optional productItems array and allocationType field
- Update ShipToAddress interface to include 'Pickup' and 'Merge' in allocationType type
- Export all new types for use in components and mock data generation

### 2. Update Mock Data Generator for Click & Collect
- Modify generateTrackingData function in src/lib/mock-data.ts to accept orderData parameter
- Add delivery method detection logic: check orderData.deliveryMethods for CLICK_COLLECT type
- For C&C orders, generate allocationType randomly (70% Pickup, 30% Merge)
- For Pickup allocation: generate minimal tracking data (no tracking number, no ETA, no shipped date)
- For Merge allocation: generate full tracking data plus 2-4 product items with realistic data
- For Home Delivery orders: keep existing generation logic unchanged
- Ensure mixed delivery orders generate separate shipments for each method

### 3. Create Product Card Component
- Create new file src/components/order-detail/product-card.tsx
- Build ProductCard component accepting CCProductItem props
- Implement card layout with green border (border-green-500)
- Display fields: Product name, SKU, Shipped Qty, Ordered Qty, UOM
- Use responsive grid layout (grid-cols-2 on mobile, grid-cols-5 on desktop)
- Add proper TypeScript types and exports

### 4. Create Click & Collect Shipment Details Section
- Create new file src/components/order-detail/cc-shipment-details-section.tsx
- Build CCShipmentDetailsSection component accepting CCTrackingShipment props
- Implement two-column layout matching existing ShipmentDetailsSection
- Left column: Conditional rendering based on allocationType
  - Pickup: Status, Rel No., Picked from, Subdistrict
  - Merge: Status, Tracking number, ETA, Shipped on, Rel No., Shipped from, Subdistrict
- Right column: Email, Store name, Store address, Allocation Type, Phone
- Add status color indicator (green for PICKED UP/FULFILLED)
- Import and use ProductCard component for Merge allocation (render productItems if present)

### 5. Enhance Main Tracking Tab Component
- Update TrackingTab component in src/components/order-detail/tracking-tab.tsx
- Add delivery method detection: check if orderData.deliveryMethods includes CLICK_COLLECT
- Add conditional header logic: 'Pick up at store' for Pickup, 'Ship to Store' for Merge, keep 'Tracking Number - {number}' for Home Delivery
- For each shipment, detect if it's C&C (check allocationType field)
- Render CCShipmentDetailsSection for C&C shipments (allocationType is Pickup or Merge)
- Render existing ShipmentDetailsSection for Home Delivery shipments
- Keep CRC tracking link section for all shipment types (may be empty for Pickup)
- Ensure existing Home Delivery rendering logic remains unchanged

### 6. Update Imports and Exports
- Add imports for new components (CCShipmentDetailsSection, ProductCard) in tracking-tab.tsx
- Add imports for new types (CCTrackingShipment, CCProductItem) from types/audit.ts
- Verify all existing imports still work correctly
- Export new components for potential reuse

### 7. Test Mixed Delivery Scenarios
- Verify Home Delivery only orders display correctly (existing behavior)
- Verify Click & Collect Pickup orders show minimal tracking info
- Verify Click & Collect Merge orders show full tracking with product cards
- Verify mixed delivery orders (both methods) display separate sections
- Test responsive layout on mobile, tablet, and desktop
- Verify no TypeScript errors or console warnings

### 8. Validate Component Integration
- Open Order Detail View in browser
- Navigate to Tracking tab
- Verify different delivery method scenarios render correctly
- Check that shipment headers are appropriate for each scenario
- Verify product cards display correctly for Ship to Store
- Confirm status colors and badges display properly
- Test external tracking links work for applicable scenarios

## Validation Commands
Execute these commands to validate the chore is complete:

- `npm run dev` - Start development server and manually test the Tracking tab with different order scenarios
- `npm run build` - Ensure the TypeScript compilation succeeds without errors
- Browser testing steps:
  1. Navigate to Order Management Hub
  2. Click on an order to open Order Detail View
  3. Switch to Tracking tab
  4. Verify Home Delivery tracking displays correctly (existing behavior)
  5. Verify Click & Collect Pickup scenario displays minimal tracking
  6. Verify Click & Collect Merge scenario displays full tracking with product cards
  7. Check for TypeScript errors in browser console
  8. Test responsive layout by resizing browser window

## Notes
- The existing Home Delivery tracking functionality must remain completely unchanged
- All C&C enhancements are additive - they should not break existing functionality
- The allocationType field is the key differentiator between Pickup and Merge scenarios
- Product cards should only appear in Ship to Store (Merge) scenario
- CRC tracking link section appears for all scenarios but may be empty for Pickup
- For mixed delivery orders, each delivery method gets its own shipment section
- Follow existing component patterns and naming conventions from the codebase
- Use consistent styling with existing Manhattan OMS design patterns
- Maintain responsive design principles with mobile-first approach
