# Chore: Fix Promotions & Coupons Display Labels

## Metadata
adw_id: `0fee68da`
prompt: `Fix Promotions & Coupons display logic to differentiate between promotions and coupons. Current implementation in src/components/order-detail-view.tsx lines 948-967 always shows 'Coupon ID' and 'Coupon Name' labels for all items. Fix: 1) When item has couponId field, show 'Coupon ID' label with couponId value, 2) When item does NOT have couponId field, show 'Promo ID' label with promotionId value, 3) When item has couponName field, show 'Coupon Name' label with couponName value, 4) When item does NOT have couponName field, show 'Type' label with promotionType value. Use conditional rendering: {promo.couponId ? 'Coupon ID' : 'Promo ID'} for label and {promo.couponId || promo.promotionId} for value. Same pattern for couponName/promotionType. This ensures promotions display as 'Promo ID: 5200060159, Type: BOGO' while coupons display as 'Coupon ID: AUTOAPPLY, Coupon Name: CPN9|AUTOAPPLY'. Reference MAO order W1156251121946800 Betagro Egg Tofu items which have both promotion (BOGO) and coupon (AUTOAPPLY) entries.`

## Chore Description
The current implementation in order-detail-view.tsx always displays "Coupon ID" and "Coupon Name" labels for all promotional items, regardless of whether they are actual coupons or promotions. This creates confusion because:

- **Promotions** (like BOGO) should display as: "Promo ID: 5200060159, Type: BOGO"
- **Coupons** (like AUTOAPPLY) should display as: "Coupon ID: AUTOAPPLY, Coupon Name: CPN9|AUTOAPPLY"

The fix requires conditional rendering based on the presence of `couponId` and `couponName` fields:
- If `couponId` exists → Show "Coupon ID" label
- If `couponId` is missing → Show "Promo ID" label (fall back to `promotionId`)
- If `couponName` exists → Show "Coupon Name" label
- If `couponName` is missing → Show "Type" label (fall back to `promotionType`)

## Relevant Files
Use these files to complete the chore:

- **src/components/order-detail-view.tsx** (lines 948-967) - The main file containing the bug. This is where the Promotions & Coupons section renders each promotional item with hardcoded "Coupon ID" and "Coupon Name" labels that need conditional rendering.

- **src/components/order-management-hub.tsx** (lines 125-132) - Contains the `promotions` interface definition showing available fields: `promotionId`, `promotionType`, `secretCode`, `couponId` (optional), and `couponName` (optional).

- **src/lib/mock-data.ts** (lines 2820-2834, 2886-2898) - Contains test data for MAO order W1156251121946800 Betagro Egg Tofu items with both promotion entries (BOGO without couponId/couponName) and coupon entries (AUTOAPPLY with couponId/couponName fields).

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Update ID Label Conditional Rendering
- Locate line 955 in `src/components/order-detail-view.tsx`
- Change the hardcoded label from `"Coupon ID"` to conditional: `{promo.couponId ? 'Coupon ID' : 'Promo ID'}`
- The value on line 956 already uses `{promo.couponId || promo.promotionId}` which is correct

### 2. Update Name/Type Label Conditional Rendering
- Locate line 959 in `src/components/order-detail-view.tsx`
- Change the hardcoded label from `"Coupon Name"` to conditional: `{promo.couponName ? 'Coupon Name' : 'Type'}`
- The value on line 960 already uses `{promo.couponName || promo.promotionType}` which is correct

### 3. Validate Build Success
- Run `pnpm build` to ensure no TypeScript or ESLint errors
- Verify the build completes successfully

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm build` - Production build must complete without errors
- `grep -n "Coupon ID\|Promo ID" src/components/order-detail-view.tsx` - Verify conditional label exists
- `grep -n "Coupon Name\|Type" src/components/order-detail-view.tsx` - Verify conditional label exists

## Notes
- The mock data for order W1156251121946800 already contains proper test cases:
  - Betagro Egg Tofu LINE-W115625-002-0 has BOGO promotion (no couponId) AND coupon (with couponId: 'AUTOAPPLY', couponName: 'CPN9|AUTOAPPLY')
  - This allows testing both display patterns in a single order item
- The value fallback logic (`promo.couponId || promo.promotionId` and `promo.couponName || promo.promotionType`) is already correct and does not need changes
- Only the static label strings need to be converted to conditional expressions
