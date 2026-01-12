# Chore: Add Click & Collect Fulfillment Statuses to Fulfillment Tab

## Metadata
adw_id: `1cfc356d`
prompt: `Add Click & Collect fulfillment statuses to the Fulfillment tab in Order Detail page (src/components/order-detail/fulfillment-tab.tsx or fulfillment-timeline.tsx).`

## Chore Description
Enhance the Fulfillment tab in the Order Detail page to support Click & Collect orders with a specialized fulfillment timeline. The implementation introduces Click & Collect-specific statuses (Pending CC Received, CC Received, Ready to Collect, CC Collected) that appear after the standard fulfillment statuses (Picking, Packing, Packed, Ready To Ship).

The Fulfillment tab will be redesigned with a two-column layout:
- **Left Column**: Fulfillment Status timeline showing order processing events
- **Right Column**: Tracking Status (empty for Click & Collect orders with informational message, populated for Home Delivery orders)

The system must detect the delivery type from `orderData.deliveryMethods` and generate the appropriate fulfillment flow.

## Relevant Files
Use these files to complete the chore:

- **src/types/audit.ts** - Contains `FulfillmentStatusType` type definition that needs to be extended with CC statuses. Also contains `FulfillmentStatusEvent` interface used for timeline events.
- **src/lib/mock-data.ts** - Contains `generateFulfillmentTimeline()` function (line 1426) that generates fulfillment events. Must be updated to detect delivery type and generate CC-specific events.
- **src/components/order-detail/fulfillment-timeline.tsx** - The main Fulfillment tab component that displays the timeline. Must be restructured into a two-column layout.
- **src/types/delivery.ts** - Contains `DeliveryMethodType` enum with 'HOME_DELIVERY' and 'CLICK_COLLECT' values. Used to detect order delivery type.
- **src/components/order-detail-view.tsx** - Parent component that renders `FulfillmentTimeline`. Shows how `orderData.deliveryMethods` is accessed (line 485-490).

### New Files
No new files required.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Update FulfillmentStatusType in src/types/audit.ts
- Locate `FulfillmentStatusType` type definition (line 265)
- Extend the type union to include the 4 new Click & Collect statuses:
  - `'Pending CC Received'` - Store notified, waiting to receive goods from warehouse
  - `'CC Received'` - Store has received the goods
  - `'Ready to Collect'` - Customer notified, goods ready for pickup
  - `'CC Collected'` - Customer has collected the order
- Update type to: `'Picking' | 'Packing' | 'Packed' | 'Ready To Ship' | 'Pending CC Received' | 'CC Received' | 'Ready to Collect' | 'CC Collected'`

### 2. Update generateFulfillmentTimeline in src/lib/mock-data.ts
- Import `DeliveryMethodType` from `@/types/delivery` if not already imported
- Add helper function to detect if order is Click & Collect:
  ```typescript
  const isClickCollect = (orderData?: any): boolean => {
    if (!orderData?.deliveryMethods) return false
    return orderData.deliveryMethods.some((d: any) => d.type === 'CLICK_COLLECT')
  }
  ```
- After the "Ready To Ship" event generation (around line 1485), add conditional logic:
  - If `isClickCollect(orderData)` is true, generate CC-specific events:
    1. `Pending CC Received` - 15-30 mins after Ready To Ship
    2. `CC Received` - 1-3 hours after Pending CC Received (70% chance)
    3. `Ready to Collect` - 10-20 mins after CC Received (if CC Received exists)
    4. `CC Collected` - 2-6 hours after Ready to Collect (50% chance, if Ready to Collect exists)
  - Each event should have appropriate details:
    - `Pending CC Received`: "Store notified for goods transfer"
    - `CC Received`: "Goods received at {storeName}"
    - `Ready to Collect`: "Customer notified - order ready for pickup"
    - `CC Collected`: "Order collected by customer"
- Ensure proper timestamp progression between CC events

### 3. Restructure FulfillmentTimeline component for two-column layout
- Open `src/components/order-detail/fulfillment-timeline.tsx`
- Add import for `Truck` icon from lucide-react (for Tracking Status column)
- Add helper function to detect Click & Collect from orderData:
  ```typescript
  const isClickCollectOrder = (orderData?: any): boolean => {
    if (!orderData?.deliveryMethods) return false
    return orderData.deliveryMethods.some((d: any) => d.type === 'CLICK_COLLECT')
  }
  ```
- Replace the single Card structure with a two-column grid layout:
  ```tsx
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
    {/* Left Column - Fulfillment Status */}
    <Card>...</Card>

    {/* Right Column - Tracking Status */}
    <Card>...</Card>
  </div>
  ```
- **Left Column (Fulfillment Status)**:
  - Keep existing timeline display logic with circle indicators and vertical line
  - Title: "Fulfillment Status" with Package icon
- **Right Column (Tracking Status)**:
  - For Click & Collect orders: Display empty state with message "No tracking for Click & Collect orders"
  - For Home Delivery orders: Display placeholder message "See Tracking tab for carrier updates" (or leave empty as Tracking is in separate tab)
  - Title: "Tracking Status" with Truck icon

### 4. Style the two-column layout for responsiveness
- Use responsive grid: `grid-cols-1 lg:grid-cols-2`
- Ensure both columns have matching height styling
- Both columns should have consistent Card styling with CardHeader and CardContent
- Empty state for Tracking Status should be centered with muted text

### 5. Validate implementation by visual testing
- Run `pnpm dev` to start development server
- Navigate to Order Detail page for an order with Click & Collect delivery method
- Verify:
  - Two-column layout displays correctly on desktop
  - Columns stack on mobile (single column)
  - Fulfillment Status shows CC-specific statuses after Ready To Ship
  - Tracking Status shows "No tracking for Click & Collect orders" message
- Navigate to Order Detail page for a Home Delivery order
- Verify:
  - Standard fulfillment timeline without CC statuses
  - Tracking Status column displays appropriate message

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm build` - Ensure no TypeScript compilation errors
- `pnpm lint` - Verify no ESLint errors introduced

## Notes
- The Click & Collect fulfillment flow represents the store pickup process where goods are transferred from warehouse to pickup store, then collected by customer
- The timestamp format must remain consistent: `YYYY-MM-DDTHH:mm:ss` (ISO format without timezone)
- The existing TrackingTab component in the Tracking tab remains unchanged - it handles carrier tracking for Home Delivery orders
- Store names for CC events can be extracted from `orderData.deliveryMethods[].clickCollect?.storeName` if available, otherwise use a generic message
