# Chore: Cancel Button Enable/Disable Logic Based on Order Status

## Metadata
adw_id: `47ab8013`
prompt: `Implement Cancel button enable/disable logic based on order status in order-detail-view.tsx. The Cancel button should only be clickable when order status is at or before 'Fulfilled' in the order lifecycle. Create a helper function or constant that defines the cancellable statuses based on this order progression: Open, Back Ordered, Partially Back Ordered, Allocated, Partially Allocated, Released, Partially Released, In Process, Partially In Process, Picked, Partially Picked, Packed, Partially Packed, Fulfilled, Partially Fulfilled. The Cancel button should be DISABLED (greyed out, not clickable) for statuses after Fulfilled: Shipped, In Transit, Out for Delivery, Delivered, Partially Delivered, Pending Return, Partially Pending Return, Returned, Partially Returned, Canceled. Also map common status variations like PROCESSING to 'In Process', READY_FOR_PICKUP to 'Packed', OUT_FOR_DELIVERY to 'Out for Delivery', SUBMITTED to 'Open'. In the Cancel button component (around line 763-765), add a disabled prop that checks if the current order.status is in the non-cancellable list. Show visual feedback when disabled (opacity-50, cursor-not-allowed). Add a tooltip or title attribute explaining why the button is disabled for non-cancellable statuses.`

## Chore Description
Implement Cancel button enable/disable logic in the order detail view based on the order's current status in its lifecycle. The button should only be enabled for orders at or before the "Fulfilled" stage, allowing operators to cancel orders before they are shipped. Once an order is shipped or beyond, the Cancel button should be disabled with visual feedback and a tooltip explanation.

The implementation includes:
1. Creating a utility file with order status constants and helper functions
2. Defining cancellable statuses (Open through Fulfilled/Partially Fulfilled)
3. Defining non-cancellable statuses (Shipped through Canceled)
4. Mapping common API status variations (PROCESSING, SUBMITTED, etc.) to canonical statuses
5. Updating the Cancel button with disabled logic and visual feedback
6. Adding explanatory tooltip for disabled state

## Relevant Files
Use these files to complete the chore:

- **src/components/order-detail-view.tsx** - Main component containing the Cancel button (lines 346-356). Currently uses a simple `canCancelOrder` logic that only checks for item fulfillment status. Needs to be updated with comprehensive status-based logic.

- **src/lib/cancel-reasons.ts** - Existing cancel reasons configuration. Reference for code organization patterns in the lib folder.

- **src/components/order-badges.tsx** - Contains `OrderStatusBadge` component showing existing status handling patterns (FULFILLED, SHIPPED, DELIVERED, PROCESSING, CREATED, CANCELLED). Reference for status string handling.

- **src/components/order-management-hub.tsx** - Contains the `Order` interface definition. Reference for order data structure.

### New Files

- **src/lib/order-status-utils.ts** - New utility file to be created containing:
  - Order status constants (cancellable and non-cancellable lists)
  - Status mapping function (API variations to canonical statuses)
  - `isOrderCancellable(status: string): boolean` helper function
  - `getCancelDisabledReason(status: string): string` helper function

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Create Order Status Utility File
- Create new file `src/lib/order-status-utils.ts`
- Define `CANCELLABLE_STATUSES` array containing:
  - 'Open', 'Back Ordered', 'Partially Back Ordered', 'Allocated', 'Partially Allocated', 'Released', 'Partially Released', 'In Process', 'Partially In Process', 'Picked', 'Partially Picked', 'Packed', 'Partially Packed', 'Fulfilled', 'Partially Fulfilled'
- Define `NON_CANCELLABLE_STATUSES` array containing:
  - 'Shipped', 'In Transit', 'Out for Delivery', 'Delivered', 'Partially Delivered', 'Pending Return', 'Partially Pending Return', 'Returned', 'Partially Returned', 'Canceled'
- Define `STATUS_MAPPINGS` object for API variations:
  - 'PROCESSING' -> 'In Process'
  - 'READY_FOR_PICKUP' -> 'Packed'
  - 'OUT_FOR_DELIVERY' -> 'Out for Delivery'
  - 'SUBMITTED' -> 'Open'
  - 'CREATED' -> 'Open'
  - 'CANCELLED' -> 'Canceled'
- Implement `normalizeOrderStatus(status: string): string` function
- Implement `isOrderCancellable(status: string): boolean` function
- Implement `getCancelDisabledReason(status: string): string` function

### 2. Update Order Detail View Component
- Import the new utility functions at the top of `src/components/order-detail-view.tsx`
- Update the `canCancelOrder` logic (currently at lines 269-273) to use `isOrderCancellable(order?.status || '')`
- Maintain existing checks (empty items, already cancelled status)
- Update the Cancel button (lines 346-356) to:
  - Add `className` with conditional `opacity-50 cursor-not-allowed` when disabled
  - Update the `title` attribute to show `getCancelDisabledReason(order?.status || '')` when disabled
  - Keep existing title "Cancel this order" when enabled

### 3. Validate the Implementation
- Run TypeScript compilation to check for type errors
- Run build to ensure no runtime issues
- Verify the Cancel button logic handles all status edge cases

## Validation Commands
Execute these commands to validate the chore is complete:

- `cd /Users/naruechon/Omnia-UI && npx tsc --noEmit` - Verify TypeScript compilation passes
- `cd /Users/naruechon/Omnia-UI && pnpm build` - Verify production build succeeds
- Manual validation: Open an order with status "Shipped" and verify Cancel button is disabled with tooltip

## Notes

- The existing `canCancelOrder` logic includes a check for items with "Shipped" fulfillment status. This should be preserved as a secondary check alongside the new status-based logic.
- Status comparisons should be case-insensitive to handle API inconsistencies.
- The `normalizeOrderStatus` function handles mapping API variations to canonical status names before checking cancellability.
- Consider that some statuses like "FULFILLED" from the API might need mapping to "Fulfilled" for consistent display.
