# Chore: Order Detail Header Left Section Layout Redesign

## Metadata
adw_id: `197f282e`
prompt: `Update order-detail-view.tsx header left section layout while keeping Omnia-UI styling: (1) Keep the 'Back to Orders' outline button with ArrowLeft icon but use size='icon' on mobile and show text on sm: screens, (2) Restructure title area: 'Order Details' remains as text-lg sm:text-xl md:text-2xl font-semibold text-enterprise-dark, (3) Move order number below title WITHOUT 'Order #' prefix - just show the raw order_no value directly (e.g., 'W1156251121946800' not 'Order #W1156251121946800'), (4) Add copy button inline next to order number using existing copyOrderId function and copied state, style as ghost size='icon' button with Copy/Check icon toggle, (5) Order number should use text-sm text-muted-foreground with flex items-center gap-1 layout for number and copy button`

## Chore Description
This chore updates the left section of the order detail view header to improve the visual hierarchy and mobile responsiveness. The changes include:

1. **Back Button Enhancement**: Make the back button responsive - icon-only on mobile, with text on sm: breakpoint and above
2. **Title Area Restructure**: Keep "Order Details" as the main title with existing typography classes
3. **Order Number Display**: Move order number below the title, displaying only the raw value (e.g., `W1156251121946800`) without the "Order #" prefix
4. **Copy Functionality**: Add an inline copy button next to the order number that uses the existing `copyOrderIdToClipboard` function and `copiedOrderId` state, showing Copy/Check icon toggle
5. **Order Number Styling**: Use `text-sm text-muted-foreground` with `flex items-center gap-1` layout

## Relevant Files
Use these files to complete the chore:

- **`src/components/order-detail-view.tsx`** - Main component file containing the header section (lines 481-548). The header currently shows Back button, Order Details title, and order number with "Order #" prefix. Contains existing `copyOrderIdToClipboard` function (lines 407-426) and `copiedOrderId` state (line 262).

### Existing Code Reference
The current header implementation (lines 481-548):
- Back button at line 485-494
- Title "Order Details" at line 496
- Order number with "Order #" prefix at line 497
- Existing copy function uses `order.id` (not `order.order_no`) - need to verify which field to copy

### Icon Imports Already Available
- `ArrowLeft` - line 12
- `Copy` - line 32
- `Check` - line 33

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Update Back Button for Mobile Responsiveness
- Modify the Back button (lines 485-494) to use `size="icon"` for mobile
- Add responsive classes: show only icon on mobile, show icon + text on sm: screens
- Implementation:
  ```tsx
  <Button
    variant="outline"
    size="icon"
    onClick={() => router.push('/orders')}
    className="h-10 w-10 sm:h-auto sm:w-auto sm:px-3 sm:py-2 min-h-[44px]"
  >
    <ArrowLeft className="h-4 w-4" />
    <span className="hidden sm:inline sm:ml-2">Back to Orders</span>
  </Button>
  ```

### 2. Restructure Title Area Layout
- Modify the title container div (currently line 495-498)
- Keep "Order Details" as `text-lg sm:text-xl md:text-2xl font-semibold text-enterprise-dark`
- Move order number below title in a new line
- Change the layout from inline subtitle to stacked layout

### 3. Update Order Number Display
- Remove "Order #" prefix from the order number display
- Display raw `order?.order_no` value directly (e.g., "W1156251121946800")
- Apply `text-sm text-muted-foreground` styling
- Wrap in a `flex items-center gap-1` container for the copy button

### 4. Add Inline Copy Button Next to Order Number
- Add a ghost icon button after the order number
- Reuse existing `copiedOrderId` state and modify `copyOrderIdToClipboard` to copy `order_no` instead of `order.id`
- Style as `variant="ghost" size="icon"` with small dimensions (`h-6 w-6`)
- Show `Copy` icon normally, `Check` icon (green) when copied

### 5. Update copyOrderIdToClipboard Function
- Modify the function to copy `order.order_no` instead of `order.id`
- Update toast message to reflect the order number being copied

### 6. Final Header Structure
The final header left section should look like:
```tsx
<div className="flex items-center gap-3">
  {/* Back Button - Icon only on mobile, text on sm+ */}
  <Button variant="outline" size="icon" ... >
    <ArrowLeft className="h-4 w-4" />
    <span className="hidden sm:inline sm:ml-2">Back to Orders</span>
  </Button>

  {/* Title Area */}
  <div className="min-w-0 flex-1">
    <h1 className="text-lg sm:text-xl md:text-2xl font-semibold text-enterprise-dark truncate">
      Order Details
    </h1>
    <div className="flex items-center gap-1">
      <span className="text-sm text-muted-foreground font-mono">
        {order?.order_no || 'N/A'}
      </span>
      <Button
        variant="ghost"
        size="icon"
        onClick={copyOrderIdToClipboard}
        className="h-6 w-6"
        title="Copy order number to clipboard"
      >
        {copiedOrderId ? (
          <Check className="h-3 w-3 text-green-600" />
        ) : (
          <Copy className="h-3 w-3" />
        )}
      </Button>
    </div>
  </div>
</div>
```

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm build` - Ensure TypeScript compilation succeeds with no errors
- `pnpm dev` - Start development server and visually verify:
  - Navigate to any order detail page (e.g., `/orders/[orderId]`)
  - Verify back button shows only icon on mobile viewport (< 640px)
  - Verify back button shows "Back to Orders" text on sm+ viewport
  - Verify "Order Details" title displays correctly with proper typography
  - Verify order number appears below title without "Order #" prefix
  - Verify copy button appears inline next to order number
  - Click copy button and verify toast notification shows correct order number
  - Verify copy button icon changes to checkmark after clicking

## Notes
- The `copyOrderIdToClipboard` function currently copies `order.id` - this will be changed to copy `order.order_no` to match the displayed value
- The `copiedOrderId` state name suggests it tracks order ID copy status, but it will now track order number copy status - consider renaming to `copiedOrderNo` for clarity (optional)
- Existing `min-h-[44px]` touch target compliance should be maintained for mobile accessibility
- The current state variable `copiedOrderId` and function `copyOrderIdToClipboard` can be reused with minimal changes
