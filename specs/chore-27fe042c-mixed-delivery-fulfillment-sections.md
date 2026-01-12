# Chore: Enhance Fulfillment Tab for Mixed Delivery Methods

## Metadata
adw_id: `27fe042c`
prompt: `Enhance the Fulfillment tab (src/components/order-detail/fulfillment-timeline.tsx) to display separate fulfillment status sections for each delivery method when an order has multiple delivery methods (mixed delivery).`

## Chore Description
The current Fulfillment tab displays a single 'Fulfillment Status' timeline for all orders regardless of delivery method. For orders with mixed delivery methods (e.g., Home Delivery + Click & Collect), this chore will enhance the component to display separate fulfillment sections for each delivery type with appropriate icons, headers, and delivery-specific status flows.

**Current Behavior:**
- Single 'Fulfillment Status' card for all orders
- All fulfillment events shown in one timeline
- No distinction between delivery methods

**Target Behavior:**
- Single delivery method orders: Show single 'Fulfillment Status' card (unchanged)
- Mixed delivery orders: Show separate cards per delivery type
  - Home Delivery: Shows Picking → Packing → Packed → Ready To Ship
  - Click & Collect: Shows extended flow with CC-specific statuses (Pending CC Received, CC Received, Ready to Collect, CC Collected)

## Relevant Files
Use these files to complete the chore:

- **`src/components/order-detail/fulfillment-timeline.tsx`** - Main component to enhance. Currently renders single Card with Package icon and timeline.
- **`src/lib/mock-data.ts`** - Contains `generateFulfillmentTimeline()` function (line 1426) that needs to be updated to accept delivery method parameter and return events grouped by delivery type.
- **`src/types/audit.ts`** - Contains `FulfillmentStatusType` and `FulfillmentStatusEvent` type definitions (lines 266-284). Types already support all required statuses including CC-specific ones.
- **`src/types/delivery.ts`** - Contains `DeliveryMethodType`, `DeliveryMethod`, and related interfaces. Used to identify delivery types in orderData.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Update generateFulfillmentTimeline Function in mock-data.ts
- Modify function signature to accept optional `deliveryMethodType` parameter: `generateFulfillmentTimeline(orderId: string, orderData?: any, deliveryMethodType?: 'HOME_DELIVERY' | 'CLICK_COLLECT')`
- When `deliveryMethodType` is not provided, use current behavior (mixed timeline)
- When `deliveryMethodType === 'HOME_DELIVERY'`:
  - Generate only: Picking → Packing → Packed → Ready To Ship events
  - Filter items to only those for home delivery (use itemCount from delivery method)
- When `deliveryMethodType === 'CLICK_COLLECT'`:
  - Generate: Picking → Packing → Packed → Ready To Ship → Pending CC Received → CC Received → Ready to Collect → CC Collected
  - Filter items to only those for click & collect (use itemCount from delivery method)
- Ensure event IDs are unique by including delivery method prefix (e.g., `FUL-HD-{orderId}` or `FUL-CC-{orderId}`)

### 2. Create Helper Functions for Delivery Method Detection
- Add helper function `getDeliveryMethods(orderData)` in fulfillment-timeline.tsx to extract delivery methods from order data
- Add helper function `hasMultipleDeliveryMethods(orderData)` to check if order has mixed delivery
- Return array of delivery method types present: `['HOME_DELIVERY']`, `['CLICK_COLLECT']`, or `['HOME_DELIVERY', 'CLICK_COLLECT']`

### 3. Enhance FulfillmentTimeline Component
- Import `Store` and `Truck` icons from lucide-react
- Add logic to detect if order has multiple delivery methods using `orderData.deliveryMethods`
- For single delivery method orders: Keep existing single Card rendering
- For multiple delivery method orders: Render separate Cards for each delivery type

### 4. Implement Home Delivery Section Card
- Create Card with header: "Fulfillment Status - Home Delivery"
- Use `Truck` icon in header
- Call `generateFulfillmentTimeline(orderId, orderData, 'HOME_DELIVERY')` for events
- Render timeline with existing circle indicator and timestamp styling
- Show item count from delivery method: "(X items)"

### 5. Implement Click & Collect Section Card
- Create Card with header: "Fulfillment Status - Click & Collect"
- Use `Store` icon in header
- Call `generateFulfillmentTimeline(orderId, orderData, 'CLICK_COLLECT')` for events
- Render timeline with existing circle indicator and timestamp styling
- Show item count from delivery method: "(X items)"
- Include store name in header subtitle if available from `orderData.deliveryMethods.clickCollect.storeName`

### 6. Refactor Timeline Rendering into Reusable Sub-component
- Extract timeline rendering logic into a local `TimelineRenderer` component to avoid code duplication
- Props: `events: FulfillmentStatusEvent[]`
- Maintains existing styling: vertical timeline line, circle indicators, status text, timestamps in YYYY-MM-DDTHH:mm:ss format
- Use this component in both single and multi-delivery method rendering

### 7. Handle Empty States for Each Delivery Type
- If a delivery method has no events, show appropriate empty state within that Card
- Message: "No fulfillment events for [Home Delivery/Click & Collect] items yet."
- Use smaller Package icon with muted text

### 8. Validate Implementation
- Run development server and test with orders containing:
  - Home Delivery only - should show single card
  - Click & Collect only - should show single card with CC statuses
  - Mixed delivery (Home Delivery + Click & Collect) - should show two separate cards
- Verify timeline styling is consistent across all cards
- Verify timestamps are in correct YYYY-MM-DDTHH:mm:ss format

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm dev` - Start development server, navigate to order detail page
- `pnpm lint` - Ensure no ESLint errors
- `pnpm build` - Ensure production build succeeds

Manual testing:
1. Open Order Management Hub
2. Click on an order to view details
3. Navigate to Fulfillment tab
4. Verify display based on order's delivery methods:
   - For orders with single delivery method: Single "Fulfillment Status" card
   - For orders with mixed delivery: Two separate cards with appropriate headers and icons

## Notes
- The `generateFulfillmentTimeline` function currently generates Click & Collect events only when `hasReadyToShip && isClickCollect(orderData)` - ensure this logic is preserved when filtering by delivery method
- Existing FulfillmentStatusType in `src/types/audit.ts` already includes all required statuses - no type changes needed
- Mock data generation in `mockApiOrders` already creates mixed delivery orders (25% of orders have both delivery methods) - these can be used for testing
- Consider memoizing delivery method detection to avoid recalculating on each render
