# Chore: Fix formatGMT7DateTime utility function bug

## Metadata
adw_id: `61b685db`
prompt: `Fix formatGMT7DateTime utility function bug in src/lib/utils.ts. The function at line 64 currently calls formatGMT7TimeString() WITHOUT passing the date parameter, causing it to always show the current time instead of the time from the input date.`

## Chore Description
The `formatGMT7DateTime` function in `src/lib/utils.ts` has a bug where it correctly formats the date portion using the input date parameter, but always displays the current time instead of the time from the input date. This is because:

1. `formatGMT7TimeString()` at line 9 is defined WITHOUT any date parameter - it always uses `new Date()`
2. `formatGMT7DateTime()` at line 64 calls `formatGMT7TimeString()` without passing the date parameter

This bug affects:
- Booking Slot From/To fields in order line item details (should show 21:00:00, 22:00:00 etc.)
- Order created date/time in Order Management Hub CSV export
- Order delivered time display
- Order date display in Executive Dashboard orders tab

The fix requires:
1. Updating `formatGMT7TimeString()` to accept an optional date parameter
2. Updating `formatGMT7DateTime()` to pass the date parameter to `formatGMT7TimeString()`

## Relevant Files
Use these files to complete the chore:

- **`src/lib/utils.ts`** - Contains the buggy `formatGMT7DateTime` function at line 64 and `formatGMT7TimeString` function at line 9. Both functions need to be modified.

### Affected Components (no changes needed, just context)
- **`src/components/order-detail-view.tsx`** - Uses `formatGMT7DateTime` for booking slot display (lines 950, 956)
- **`src/components/order-management-hub.tsx`** - Uses `formatGMT7DateTime` for created date and delivered time (lines 1117, 1131)
- **`src/components/executive-dashboard/orders-tab.tsx`** - Uses `formatGMT7DateTime` for order date display (line 332)

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Update formatGMT7TimeString to accept optional date parameter
- Modify the function signature at line 9 from `formatGMT7TimeString(): string` to `formatGMT7TimeString(date?: Date | string | number): string`
- Update the function body to use the input date when provided, otherwise fall back to `new Date()`
- Change `new Date().toLocaleString(...)` to use the input date parameter
- The fallback behavior should remain the same when no date is provided (for backward compatibility with `getCurrentTimeString()`)

### 2. Update formatGMT7DateTime to pass date parameter
- Change line 64 from:
  ```typescript
  return `${formatGMT7DateString(date)} ${formatGMT7TimeString()}`
  ```
- To:
  ```typescript
  return `${formatGMT7DateString(date)} ${formatGMT7TimeString(date)}`
  ```

### 3. Validate the changes
- Run `pnpm build` to ensure TypeScript compilation succeeds
- Verify no type errors are introduced

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm build` - Ensure the production build completes without TypeScript errors
- `pnpm lint` - Ensure no ESLint errors are introduced

## Notes
- The `getCurrentTimeString()` function at line 24-26 calls `formatGMT7TimeString()` without parameters, which is the intended behavior (get current time). This will continue to work correctly after the fix since the date parameter is optional.
- All existing usages of `formatGMT7DateTime` will now correctly display the time from the input date instead of the current time.
- Backward compatibility is maintained since the date parameter is optional.
