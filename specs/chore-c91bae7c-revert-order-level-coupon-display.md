# Chore: Revert Order-Level Coupon Display from Line Items

## Metadata
adw_id: `c91bae7c`
prompt: `REVERT: Remove the order-level coupon display block from src/components/order-detail-view.tsx that was added in chore-f2b32bd2. The order.couponCodes[] should NOT be displayed on every line item because it shows the full order amount (฿170, ฿100) instead of distributed line-item amounts. Each line item already has its distributed coupon amounts in item.promotions[] with promotionType='Coupon'. Remove lines 900-922 (the order-level coupons section). Keep only the item.promotions[] display which correctly shows distributed amounts per line.`

## Chore Description
This chore reverts the order-level coupon display functionality that was added in chore-f2b32bd2. The revert is needed because:

1. **Incorrect Display**: The order-level coupons (`order.couponCodes[]`) display the **full order discount amount** (฿170, ฿100) on **every line item**. This is misleading because it suggests each item received that full discount.

2. **Redundant Data**: Each line item already has its **distributed coupon amounts** in `item.promotions[]` with `promotionType='Coupon'`. This shows the correct per-line allocation of the order-level coupon discount.

3. **Data Accuracy**: The `item.promotions[]` array contains properly distributed amounts (e.g., if a ฿170 coupon is split across 3 items, each item shows ฿56.67). The `order.couponCodes[]` shows the total ฿170 on every item, which is incorrect.

The fix removes lines 899-922 (the order-level coupons section) and updates the empty state condition to only check `item.promotions[]`.

## Relevant Files
Use these files to complete the chore:

### Primary Files to Modify

- **`src/components/order-detail-view.tsx`** (lines 899-926) - Contains the order-level coupon display block that needs to be removed. Lines 899-922 render `order.couponCodes[]` after the item promotions. Line 924 has an empty state condition that references `order?.couponCodes?.length`.

### Reference Files

- **`specs/chore-f2b32bd2-restore-order-coupon-display.md`** - The spec that added this code (being reverted)
- **`specs/chore-8d877d95-remove-order-level-coupon-from-line-items.md`** - The original correct spec that removed this (we are restoring this behavior)

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Remove Order-Level Coupons Display Block
- Navigate to lines 899-922 in `src/components/order-detail-view.tsx`
- Remove the entire block that renders `order.couponCodes[]`:
  - The `{/* Order-level Coupons */}` comment at line 899
  - The conditional `{order?.couponCodes && order.couponCodes.length > 0 && (...)}` block (lines 900-922)
- This section incorrectly shows full order coupon amounts on every line item

### 2. Update Empty State Condition
- Find line 924: `{!(item.promotions?.length || order?.couponCodes?.length) && (`
- Replace with: `{!(item.promotions && item.promotions.length > 0) && (`
- This restores the original condition that only checks item-level promotions
- The empty state "No promotions or coupons applied" should only check for `item.promotions[]`

### 3. Validate TypeScript Compilation
- Run `pnpm build` to ensure no TypeScript errors
- Verify the component compiles correctly after removal
- Confirm no dangling references to `order.couponCodes` in the promotions section

### 4. Visual Testing
- Run `pnpm dev` and navigate to Order Management Hub
- Search for order `W1156251121946800`
- Open the order details and go to the Items tab
- Expand any item (e.g., Betagro Chicken)
- Verify the "Promotions & Coupons" section shows:
  - **Only item-level promotions** from `item.promotions[]` (BOGO promotions, and Coupon-type promotions with distributed amounts)
  - **No order-level coupon cards** (AUTOAPPLY ฿170, 15FRESH ฿100 should NOT appear as separate cards on every line item)

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm build` - Ensure TypeScript compilation succeeds with no errors
- `grep -n "order?.couponCodes" src/components/order-detail-view.tsx` - Should return NO matches in the promotions section (lines 869-940)
- `pnpm dev` - Start development server on http://localhost:3000
- Navigate to Order Management Hub → Search `W1156251121946800` → Click order → Items tab → Expand any item
- Verify "Promotions & Coupons" section displays ONLY item-level promotions (no full-order coupon amounts)

## Notes

### Why This Revert is Correct
The order-level coupons at `order.couponCodes[]` are order-totaling aggregates, not line-item allocations:
- `AUTOAPPLY: ฿170.00` is the **total** discount applied to the entire order
- `15FRESH: ฿100.00` is the **total** discount applied to the entire order

These totals should be shown in the **Payment Info** or **Overview** tabs where they apply to the whole order, not repeated on each line item.

### Correct Data Flow
For per-item coupon visibility, the system uses:
- `item.promotions[]` with `promotionType: 'Coupon'` contains the distributed/allocated coupon discount per line
- This is the correct data source for line-item coupon display

### Related Specifications
- **chore-8d877d95**: Originally (and correctly) removed order-level coupon from line items
- **chore-f2b32bd2**: Incorrectly restored order-level coupons (this revert undoes that)
- **chore-12c12c28**: Related regression fix specification
