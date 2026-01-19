# Chore: Remove Order-Level Coupon Display from Line Items

## Metadata
adw_id: `8d877d95`
prompt: `FIX: Remove order-level coupon display from line items - only show line-level promotions and coupons`

## Chore Description
The current implementation in `src/components/order-detail-view.tsx` incorrectly displays ORDER-LEVEL coupons (`order?.couponCodes`) on EVERY line item in the expanded details view. This causes three problems:

1. **Double-display**: Items that have line-level coupon data in their `promotions` array (e.g., Betagro Egg Tofu with `promotionType: 'Coupon'`) show both the line-level data AND the full order-level coupon amounts
2. **Incorrect amounts**: Full order-level amounts (฿-170, ฿-100) are shown instead of distributed line-level amounts (฿-0.86, ฿-5.14)
3. **Inconsistent display**: Items without line-level promotions still show the full order-level coupon amounts

The fix is to remove the order-level coupon display block entirely from line item details. Line items should ONLY show their own line-level promotions and coupons from the `item.promotions` array.

## Relevant Files
Use these files to complete the chore:

- **src/components/order-detail-view.tsx** (lines 869-929) - Contains the 'Promotions & Coupons' section in the expanded item details. This file has:
  - Line 873-900: Line-level promotions display (KEEP - correctly shows `item.promotions`)
  - Line 901-928: Order-level coupons display (REMOVE - incorrectly shows `order?.couponCodes`)
  - Line 899: "No promotions applied" message (UPDATE text)

- **src/lib/mock-data.ts** - Contains test data showing:
  - Bon Aroma Coffee items with `promotions: []` (empty array)
  - Betagro Egg Tofu items with line-level promotions including BOGO and Coupon types
  - Order W1156251121946800 with `couponCodes` array at order level

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Remove Order-Level Coupon Display Block
- Open `src/components/order-detail-view.tsx`
- Locate the 'Promotions & Coupons' section starting around line 869
- Remove the entire block from line 901 (`{/* Order-level Coupons */}`) through line 928 (closing `}`)
- This removes the conditional rendering: `{order?.couponCodes && order.couponCodes.length > 0 && (...)}`

### 2. Update "No promotions" Message
- In the same section, locate line 899 with the text: `'No promotions applied'`
- Change the text to: `'No promotions or coupons applied'`
- This provides clearer feedback that both promotions AND coupons are absent

### 3. Verify Line-Level Promotions Display Unchanged
- Confirm lines 873-897 remain unchanged
- The `item.promotions` array display should still show:
  - Discount amount
  - Promo ID
  - Type (includes 'BOGO', 'Coupon', 'Percentage Discount', etc.)
  - Secret Code (when available)

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm build` - Verify no TypeScript compilation errors
- `pnpm dev` - Start development server
- Navigate to Order Management > View order W1156251121946800 > Items tab
- Verify Betagro Egg Tofu items show:
  - BOGO: ฿-5.50, Promo ID: 5200060159, Type: BOGO
  - Coupon: ฿-0.86, Promo ID: CPN-AUTOAPPLY, Type: Coupon
- Verify Bon Aroma Coffee items show: 'No promotions or coupons applied'
- Verify NO order-level coupon amounts (฿-170, ฿-100) appear on any line item

## Notes
- The order-level coupon display should remain visible in the order summary/overview sections (not in line item details)
- This change only affects the expanded line item detail view
- Line-level coupons are already correctly represented in the `item.promotions` array with `promotionType: 'Coupon'`
