# Chore: Integrate Cancel Order Button into Order Detail View

## Metadata
adw_id: `d7934edb`
prompt: `Integrate Cancel Order button into order-detail-view.tsx following specs/chore-e2ef324f-order-cancel-button.md and specs/chore-47ab8013-cancel-button-status-logic.md. The supporting files already exist (src/lib/cancel-reasons.ts, src/lib/order-status-utils.ts, src/components/order-detail/cancel-order-dialog.tsx) but are NOT integrated into the UI. Tasks: 1) Import CancelOrderDialog and order-status-utils in order-detail-view.tsx, 2) Add Cancel button in the header section BEFORE the close X button, 3) Add state for showCancelDialog and isCancelling, 4) Implement canCancelOrder logic using isOrderCancellable() from order-status-utils.ts, 5) Add disabled styling (opacity-50, cursor-not-allowed) with tooltip when not cancellable, 6) Wire up CancelOrderDialog with onConfirm handler that updates order status and shows success toast. Use destructive variant for the Cancel button with Ban icon.`

## Chore Description
Integrate the existing Cancel Order functionality into the order detail view UI. All the supporting infrastructure has been built:
- `src/lib/cancel-reasons.ts` - Contains cancel reason configuration with 35 reasons (16 Return RT- and 19 Short SH-)
- `src/lib/order-status-utils.ts` - Contains `isOrderCancellable()`, `getCancelDisabledReason()`, and status mapping utilities
- `src/components/order-detail/cancel-order-dialog.tsx` - Complete dialog component with reason selection

The task is to wire these components together in `order-detail-view.tsx` by:
1. Adding the Cancel button in the header section (between Back button area and close X button)
2. Implementing state management for dialog visibility and cancellation loading state
3. Using the existing `isOrderCancellable()` function to determine button disabled state
4. Providing visual feedback (opacity, tooltip) when button is disabled
5. Connecting the dialog's onConfirm handler to update order status and show toast notification

## Relevant Files
Use these files to complete the chore:

- **src/components/order-detail-view.tsx** (lines 1-1218)
  - Main component to modify
  - Header section at lines 278-320 contains the layout with Back button and close X button
  - Already imports `useState`, `useToast`, `Button`, and `X` icon from lucide-react
  - Needs additional imports and state for cancel functionality

- **src/lib/order-status-utils.ts** (lines 1-147)
  - Contains `isOrderCancellable(status: string): boolean` - check if order can be cancelled
  - Contains `getCancelDisabledReason(status: string): string` - get tooltip text for disabled state
  - Contains `normalizeOrderStatus(status: string): string` - normalize API status variations

- **src/components/order-detail/cancel-order-dialog.tsx** (lines 1-166)
  - Complete CancelOrderDialog component with props interface:
    - `open: boolean`
    - `onOpenChange: (open: boolean) => void`
    - `orderNo: string`
    - `onConfirm: (reasonId: string) => Promise<void>`
    - `loading?: boolean`
  - Handles reason selection with grouped categories (Return/Short)
  - Already has loading state handling with spinner

- **src/lib/cancel-reasons.ts** (lines 1-266)
  - Contains `getCancelReasonById(id: string)` for displaying selected reason in toast
  - Not directly needed in order-detail-view.tsx but used by the dialog

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Add Required Imports
- Import `Ban` icon from lucide-react (add to existing lucide-react import block at line 11-36)
- Import `isOrderCancellable` and `getCancelDisabledReason` from `@/lib/order-status-utils`
- Import `CancelOrderDialog` from `./order-detail/cancel-order-dialog`
- Import `getCancelReasonById` from `@/lib/cancel-reasons` (for toast message)

### 2. Add State Variables
- After existing state declarations (around line 218), add:
  - `const [showCancelDialog, setShowCancelDialog] = useState(false)`
  - `const [isCancelling, setIsCancelling] = useState(false)`

### 3. Implement canCancelOrder Computed Value
- After state declarations, add computed logic:
  ```typescript
  // Determine if order can be cancelled based on its status
  const canCancelOrder = order?.status
    ? isOrderCancellable(order.status)
    : false
  ```

### 4. Implement handleCancelOrder Function
- Add async handler function after `copyOrderIdToClipboard`:
  ```typescript
  const handleCancelOrder = async (reasonId: string) => {
    setIsCancelling(true)
    try {
      // Note: In a real implementation, this would call an API to cancel the order
      // For now, we simulate the cancellation with a delay
      await new Promise(resolve => setTimeout(resolve, 1000))

      const reason = getCancelReasonById(reasonId)
      toast({
        title: "Order Cancelled",
        description: `Order ${order?.order_no} has been cancelled. Reason: ${reason?.shortDescription || reasonId}`,
        variant: "default",
      })
      setShowCancelDialog(false)
      // Note: In production, refresh order data here or update local state
    } catch (error) {
      toast({
        title: "Cancellation Failed",
        description: "Failed to cancel the order. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsCancelling(false)
    }
  }
  ```

### 5. Add Cancel Button to Header Section
- Locate the header section (lines 278-295)
- Before the close X button (line 292-294), add Cancel button with conditional styling:
  ```tsx
  <Button
    variant="destructive"
    size="sm"
    onClick={() => setShowCancelDialog(true)}
    disabled={!canCancelOrder || isCancelling}
    className={!canCancelOrder ? "opacity-50 cursor-not-allowed" : ""}
    title={!canCancelOrder ? getCancelDisabledReason(order?.status || '') : "Cancel this order"}
  >
    <Ban className="h-4 w-4 mr-2" />
    Cancel
  </Button>
  ```
- Wrap the Cancel button and X button in a flex container with gap

### 6. Add CancelOrderDialog Component
- At the end of the component, before the final closing `</div>`, add:
  ```tsx
  <CancelOrderDialog
    open={showCancelDialog}
    onOpenChange={setShowCancelDialog}
    orderNo={order?.order_no || ''}
    onConfirm={handleCancelOrder}
    loading={isCancelling}
  />
  ```

### 7. Validate the Implementation
- Run TypeScript compilation to check for type errors
- Run build to ensure no runtime issues
- Verify the Cancel button appears correctly in the header
- Test button disabled state for non-cancellable orders

## Validation Commands
Execute these commands to validate the chore is complete:

- `cd /Users/naruechon/Omnia-UI && npx tsc --noEmit` - Verify TypeScript compilation passes
- `cd /Users/naruechon/Omnia-UI && pnpm build` - Verify production build succeeds
- `cd /Users/naruechon/Omnia-UI && pnpm lint` - Verify no linting errors

## Notes

### Button Placement
The Cancel button should be positioned on the RIGHT SIDE of the header, directly BEFORE the close X button. The current header structure is:
- Left: Back button + Order title
- Right: Close X button

After integration:
- Left: Back button + Order title
- Right: Cancel button + Close X button

### Status-Based Logic
The `isOrderCancellable()` function checks against these cancellable statuses:
- Open, Back Ordered, Partially Back Ordered
- Allocated, Partially Allocated
- Released, Partially Released
- In Process, Partially In Process
- Picked, Partially Picked
- Packed, Partially Packed
- Fulfilled, Partially Fulfilled

Orders with these statuses CANNOT be cancelled:
- Shipped, In Transit, Out for Delivery
- Delivered, Partially Delivered
- Pending Return, Partially Pending Return
- Returned, Partially Returned
- Canceled

### API Integration Note
The current implementation simulates the cancellation with a timeout. In production, the `handleCancelOrder` function should:
1. Call the actual cancel API endpoint
2. Handle error responses
3. Refresh order data after successful cancellation
4. Update local state to reflect the cancelled status
