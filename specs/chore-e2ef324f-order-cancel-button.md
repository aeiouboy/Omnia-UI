# Chore: Implement Order Cancel Button with Fulfillment Status Validation and Cancel Reason Selection

## Metadata
adw_id: `e2ef324f`
prompt: `Implement Order Cancel Button with Fulfillment Status Validation and Cancel Reason Selection`

## Chore Description
Implement a Cancel button in the order detail view header that:
1. Is positioned on the RIGHT SIDE, directly BEFORE the close ('X') button
2. Shows as gray/disabled when the order has AT LEAST 1 item with "fulfilled" status
3. Shows as enabled/clickable when ALL items have status OTHER THAN "fulfilled"
4. Opens a dialog with order number confirmation, cancel reason dropdown, and Confirm/Cancel buttons
5. Changes order status to CANCELLED upon confirmation with success notification

The cancel reasons are sourced from `/Users/naruechon/Downloads/MAO cancel reason_11 Dec 2025.xlsx` which contains two types of reasons:
- Return reasons (prefix RT-)
- Short reasons (prefix SH-)

## Relevant Files

### Existing Files to Modify
- **src/components/order-detail-view.tsx** (lines 257-274)
  - Header section contains the layout with Back button, title, and close button
  - Cancel button needs to be added before the close X button
  - Lines 30-36 show existing icon imports including X which is used for close button

- **src/components/order-management-hub.tsx** (lines 93-145)
  - Defines `ApiOrderItem` interface with `fulfillmentStatus` field (line 112)
  - Status values: 'Picked' | 'Pending' | 'Shipped' | 'Packed'
  - Note: There is no "fulfilled" status in current types - need to verify if this means "Shipped" or add new status

### New Files to Create

#### 1. src/lib/cancel-reasons.ts
Configuration file containing all cancel reasons extracted from Excel file

#### 2. src/components/order-detail/cancel-order-dialog.tsx
New component for the cancel confirmation dialog with:
- Order number display
- Cancel reason dropdown
- Confirm and Cancel buttons

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Create Cancel Reasons Configuration File
- Create `src/lib/cancel-reasons.ts`
- Define `CancelReason` interface with fields: id, type, shortDescription, description
- Export `CANCEL_REASONS` constant array with all reasons from Excel
- Export `getReturnReasons()` function to filter RT- prefixed reasons
- Export `getShortReasons()` function to filter SH- prefixed reasons
- Export `getCancelReasonById(id)` function to find reason by ID

### 2. Create Cancel Order Dialog Component
- Create `src/components/order-detail/cancel-order-dialog.tsx`
- Import Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter from `@/components/ui/dialog`
- Import Select, SelectContent, SelectItem, SelectTrigger, SelectValue from `@/components/ui/select`
- Import Button from `@/components/ui/button`
- Import CANCEL_REASONS from cancel-reasons config
- Create `CancelOrderDialogProps` interface with:
  - `open: boolean`
  - `onOpenChange: (open: boolean) => void`
  - `orderNo: string`
  - `onConfirm: (reasonId: string) => Promise<void>`
  - `loading?: boolean`
- Implement dialog UI with:
  - Title: "Cancel Order"
  - Order number display
  - Cancel reason dropdown (select)
  - Confirm button (disabled when no reason selected)
  - Cancel button
- Add state management for selected reason ID

### 3. Add Cancel Button to Order Detail View Header
- In `src/components/order-detail-view.tsx`:
  - Import `CancelOrderDialog` from `./order-detail/cancel-order-dialog`
  - Import `Ban` or `XCircle` icon from lucide-react
  - Add state variables: `showCancelDialog`, `isCancelling`, `selectedCancelReason`
  - Create `canCancelOrder` computed value:
    ```typescript
    const canCancelOrder = !order?.items?.some(item => item.fulfillmentStatus === 'fulfilled')
    ```
  - Create `handleCancelOrder` async function that:
    - Calls API to update order status to CANCELLED
    - Shows success toast notification
    - Closes dialog
    - Refreshes order data
  - In the header section (around line 271), add Cancel button before the X button:
    ```tsx
    <Button
      variant="destructive"
      size="sm"
      onClick={() => setShowCancelDialog(true)}
      disabled={!canCancelOrder || isCancelling}
      className="mr-2"
    >
      <Ban className="h-4 w-4 mr-2" />
      Cancel
    </Button>
    ```
  - Add `CancelOrderDialog` component at the end of the component

### 4. Implement Order Cancel API Integration
- Create or update API endpoint for order cancellation
- Update `src/lib/orders-api-client.ts` to include `cancelOrder(orderId: string, reasonId: string)` function
- Handle API call in `handleCancelOrder` with proper error handling
- Show error toast if cancellation fails

### 5. Update Order Status Display
- After successful cancellation, update order status to "CANCELLED"
- Ensure OrderStatusBadge component displays CANCELLED status correctly
- Verify the order detail view reflects the cancelled state

### 6. Handle Edge Cases
- Check if order is already CANCELLED - hide or disable Cancel button
- Handle case where order has no items
- Handle case where fulfillment status is undefined
- Show appropriate error messages if cancellation fails

### 7. Test and Validate
- Verify Cancel button appears on right side before close button
- Test cancel button is disabled when order has items with fulfilled status
- Test cancel button is enabled when no items are fulfilled
- Test cancel dialog opens and shows all reasons from Excel
- Test reason selection and confirm button behavior
- Test order cancellation flow with success notification
- Test error handling when API call fails

## Validation Commands
Execute these commands to validate the chore is complete:

```bash
# Check TypeScript compilation
npm run build

# Run linter
npm run lint

# Check for TypeScript errors in specific files
npx tsc --noEmit src/components/order-detail-view.tsx
npx tsc --noEmit src/lib/cancel-reasons.ts
npx tsc --noEmit src/components/order-detail/cancel-order-dialog.tsx

# Verify new files exist
ls -la src/lib/cancel-reasons.ts
ls -la src/components/order-detail/cancel-order-dialog.tsx

# Check that cancel reasons are properly exported
node -e "const cr = require('./src/lib/cancel-reasons.ts'); console.log('Cancel reasons loaded:', cr.CANCEL_REASONS?.length)"
```

## Notes

### Cancel Reasons from Excel
The Excel file contains 100+ cancel reasons in two categories:

**Return Reasons (RT-):**
- RT-AdverseEffects: Product caused allergic reaction
- RT-CustChangeMind: Customer change mind
- RT-ProdDamaged: Product damaged during shipping
- RT-ProdExpired: Product expired
- RT-ProdWrongSize: Wrong size received
- etc.

**Short Reasons (SH-):**
- SH-OOS: Out of stock
- SH-Damaged&Defect: Damaged and defect
- SH-CustChangeMind: Customer's change of mind
- SH-OOSMismatch: Image doesn't match product
- SH-ProdExpired: Product expired
- etc.

### Fulfillment Status Clarification
The current `ApiOrderItem.fulfillmentStatus` type definition includes:
- 'Picked'
- 'Pending'
- 'Shipped'
- 'Packed'

There is no "fulfilled" status. Need to verify:
1. Does "fulfilled" mean any of these existing statuses?
2. Should we add "fulfilled" to the type definition?
3. Does "Shipped" or "Packed" count as fulfilled for cancellation purposes?

**Recommendation**: Confirm with product owner which status(es) should prevent cancellation.

### UI Considerations
- Use destructive (red) styling for Cancel button to indicate irreversible action
- Consider adding a confirmation step before final cancellation
- The Cancel button should only appear when order is NOT already cancelled
- After cancellation, the button should be hidden or disabled

### API Integration
The external API endpoint structure should be verified:
- Check if there's an existing `/api/orders/cancel` endpoint
- Determine the required request payload format
- Verify authentication requirements
- Handle any business logic validation on the backend

### Order Detail Page Structure
The order detail page (`app/orders/[id]/page.tsx`) uses `DashboardShell` wrapper with `OrderDetailView` as a child component. The order is fetched client-side within OrderDetailView, so the cancel functionality should work with the existing data flow.
