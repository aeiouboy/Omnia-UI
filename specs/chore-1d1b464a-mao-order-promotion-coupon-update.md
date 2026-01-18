# Chore: Update MAO Order W1156251121946800 with Promotion and Coupon Details

## Status: ✅ COMPLETED

## Metadata
adw_id: `1d1b464a`
prompt: `Update mock data for MAO order W1156251121946800 in src/lib/mock-data.ts with complete promotion and coupon details extracted from MAO system.`

## Chore Description
Update the existing `maoOrderW1156251121946800` mock data object in `src/lib/mock-data.ts` with complete promotion and coupon details extracted from the MAO (Manhattan Active Omni) system. The update includes:

1. **Line-item level promotions** - Add BOGO promotions to specific line items:
   - Betagro Egg Tofu: BOGO promo ID 5200060159, discount 11.00
   - Tops Frozen Salmon Steak: BOGO promo ID 9400006629, discount 318.00
   - Thammachart Seafood: BOGO promo ID 9400006629, discount 318.00

2. **Line-item level coupons** (via secretCode field in promotions):
   - AUTOAPPLY coupon (170.00 total) applied to: Betagro Egg Tofu, Tops Salmon, N&P Banana
   - 15FRESH coupon (100.00 total) applied to: Tops Salmon, N&P Banana, Thammachart Seafood, Cubic Wheat Loaf

3. **Order-level couponCodes** - Add 2 coupons: AUTOAPPLY (170.00) and 15FRESH (100.00)

4. **Order-level promotions** - Update to reflect 3 BOGO promotions totaling 647.00

## Relevant Files
Use these files to complete the chore:

- **src/lib/mock-data.ts** (lines 4706-5472) - Contains the `maoOrderW1156251121946800` object that needs updating. The line items start at line 4739, promotions at line 5363, and couponCodes at line 5379.

- **src/types/payment.ts** (lines 35-51) - Defines `Promotion` and `CouponCode` interfaces that must be followed:
  - `Promotion`: promotionId, promotionName, promotionType, discountAmount, couponCode?
  - `CouponCode`: code, description, discountAmount, appliedAt

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Update Betagro Egg Tofu Line Items (LINE-W115625-002)
- Update `LINE-W115625-002-0` and `LINE-W115625-002-1` promotions array:
  - Change promotionId from '5200060159' to keep it (correct)
  - Set discountAmount to -5.50 each (split from 11.00 BOGO total)
  - Add AUTOAPPLY coupon via second promotion entry with secretCode: 'AUTOAPPLY'
  - AUTOAPPLY coupon value: 1.73 total split across 2 items (~0.86 each)

### 2. Update Smarter Dental Floss Line Item (LINE-W115625-003)
- This item has no promotions or coupons in the extracted data
- Keep promotions array empty (already correct)

### 3. Update Tops Frozen Salmon Steak Line Items (LINE-W115625-004)
- Update all 4 split items (LINE-W115625-004-0 through LINE-W115625-004-3):
  - Add BOGO promotion with promotionId '9400006629', discountAmount -79.50 each (318/4)
  - Add AUTOAPPLY coupon entry: secretCode 'AUTOAPPLY', ~17.77 each (71.09 total / 4)
  - Add 15FRESH coupon entry: secretCode '15FRESH', ~9.74 each (38.96 total / 4)

### 4. Update N&P Hom Banana Line Item (LINE-W115625-005)
- Add AUTOAPPLY coupon via promotions array with secretCode: 'AUTOAPPLY', discountAmount: -4.40
- Add 15FRESH coupon via promotions array with secretCode: '15FRESH', discountAmount: -3.72

### 5. Update Thammachart Seafood Salmon Line Items (LINE-W115625-006)
- Update all 4 split items (LINE-W115625-006-0 through LINE-W115625-006-3):
  - Add BOGO promotion with promotionId '9400006629', discountAmount -79.50 each (318/4)
  - Add 15FRESH coupon entry: secretCode '15FRESH', ~9.74 each (38.97 total / 4)

### 6. Update Cubic Wheat Loaf Line Items (LINE-W115625-007)
- Update both split items (LINE-W115625-007-0 and LINE-W115625-007-1):
  - Add 15FRESH coupon via promotions array with secretCode: '15FRESH', discountAmount -9.18 each (18.35 total / 2)

### 7. Update Order-Level Promotions Array
- Replace the promotions array at line 5363 with accurate data:
  ```typescript
  promotions: [
    {
      promotionId: '5200060159',
      promotionName: 'BOGO - Betagro Egg Tofu',
      promotionType: 'BOGO',
      discountAmount: -11.00
    },
    {
      promotionId: '9400006629',
      promotionName: 'BOGO - Frozen Salmon',
      promotionType: 'BOGO',
      discountAmount: -318.00
    },
    {
      promotionId: '9400006629',
      promotionName: 'BOGO - Thammachart Seafood',
      promotionType: 'BOGO',
      discountAmount: -318.00
    }
  ],
  ```

### 8. Update Order-Level CouponCodes Array
- Replace the empty couponCodes array at line 5379 with:
  ```typescript
  couponCodes: [
    {
      code: 'AUTOAPPLY',
      description: 'CPN9|AUTOAPPLY',
      discountAmount: -170.00,
      appliedAt: '2025-11-21T10:42:00+07:00'
    },
    {
      code: '15FRESH',
      description: 'CPN2|15FRESH',
      discountAmount: -100.00,
      appliedAt: '2025-11-21T10:42:00+07:00'
    }
  ],
  ```

### 9. Verify Discount Totals Match
- Total BOGO promotions: 11.00 + 318.00 + 318.00 = 647.00
- Total coupons: 170.00 + 100.00 = 270.00
- Combined discounts: 647.00 + 270.00 = 917.00 (matches pricingBreakdown.lineItemDiscount)

### 10. Run Build to Validate
- Run `pnpm build` to ensure no TypeScript errors
- Verify the order total calculation still works correctly

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm build` - Verify no TypeScript compilation errors
- `grep -A 20 "promotions:" src/lib/mock-data.ts | head -50` - Verify promotions structure
- `grep -A 10 "couponCodes:" src/lib/mock-data.ts | head -20` - Verify couponCodes structure

## Notes
- The existing structure uses `secretCode` field within the line-item promotions array to represent coupon codes applied to individual items
- Order-level `couponCodes` array uses the `CouponCode` interface from `src/types/payment.ts`
- Order-level `promotions` array uses the `Promotion` interface from `src/types/payment.ts`
- Discount amounts should be negative numbers to indicate reductions
- Line item split ratios may result in minor rounding differences (±0.01) which is acceptable
- The Bon Aroma Coffee items (LINE-W115625-001) have no promotions or coupons in the MAO data

## Implementation Summary

Completed on 2026-01-16. Changes made:

1. **LINE-W115625-002 (Betagro Egg Tofu)**: Added BOGO (-5.50 each) + AUTOAPPLY coupon (-0.86/-0.87)
2. **LINE-W115625-004 (Tops Frozen Salmon)**: Added BOGO (-79.50 each) + AUTOAPPLY (-17.77/-17.78) + 15FRESH (-9.74)
3. **LINE-W115625-005 (N&P Hom Banana)**: Added AUTOAPPLY (-4.40) + 15FRESH (-3.72)
4. **LINE-W115625-006 (Thammachart Seafood)**: Added BOGO (-79.50 each) + 15FRESH (-9.74/-9.75)
5. **LINE-W115625-007 (Cubic Wheat Loaf)**: Added 15FRESH (-9.18/-9.17)
6. **Order-level promotions**: 3 BOGO promotions totaling -647.00
7. **Order-level couponCodes**: AUTOAPPLY (-170.00) + 15FRESH (-100.00)

Build validated with `pnpm build` - no TypeScript errors.
