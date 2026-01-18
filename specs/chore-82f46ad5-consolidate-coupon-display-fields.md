# Chore: Consolidate Coupon Display Fields

## Metadata
adw_id: `82f46ad5`
prompt: `Consolidate coupon display fields in src/components/order-detail-view.tsx. Currently showing three fields for coupons: 'Coupon ID' (showing promotionId like 'AUTOAPPLY'), 'Type' (showing extracted type like 'CPN9'), and 'Coupon name' (showing secretCode like 'AUTOAPPLY'). Change to show only TWO fields: 1) Keep 'Type' field unchanged showing extracted type code like 'CPN9', 2) Replace both 'Coupon ID' and 'Coupon name' with a single 'Coupon name' field showing combined format 'TYPE | NAME' (e.g., 'CPN9 | AUTOAPPLY'). Use getCouponTypeCode function to get the type, and promo.promotionId for the name. Remove the separate 'Coupon ID' div block entirely. The Coupon name value should be constructed as: getCouponTypeCode(promo.promotionId, order?.couponCodes) + ' | ' + promo.promotionId. Test with order W1156251121946800 AUTOAPPLY coupon.`

## Chore Description
Consolidate the coupon display fields in the order detail view from three fields to two fields. Currently, when a promotion has `promotionType === 'COUPON'`, the UI displays:
- **Coupon ID**: Shows `promo.promotionId` (e.g., 'AUTOAPPLY')
- **Type**: Shows extracted type code from `getCouponTypeCode()` (e.g., 'CPN9')
- **Coupon name**: Shows `promo.secretCode` (e.g., 'AUTOAPPLY')

After this change, the UI should display only two fields:
- **Type**: Keep unchanged - shows extracted type code from `getCouponTypeCode()` (e.g., 'CPN9')
- **Coupon name**: New combined format - `TYPE | NAME` (e.g., 'CPN9 | AUTOAPPLY')
  - Constructed as: `getCouponTypeCode(promo.promotionId, order?.couponCodes) + ' | ' + promo.promotionId`

The separate 'Coupon ID' div block should be removed entirely.

## Relevant Files
Use these files to complete the chore:

- **src/components/order-detail-view.tsx** (lines 969-1001) - Main file containing the promotion/coupon display logic in the Items tab. The Promotions & Coupons section iterates through `item.promotions` and conditionally renders different fields based on `promo.promotionType`.

### Reference Files (read-only)
- **src/types/payment.ts** - Contains `CouponCode` type definition with `code` and `description` fields
- **src/lib/mock-data.ts** - Contains mock order data including order W1156251121946800 with AUTOAPPLY coupon for testing

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Read and Understand Current Implementation
- Examine the current coupon display logic in lines 969-1001 of order-detail-view.tsx
- Note the three current field blocks:
  - Lines 975-980: Coupon ID / Promo ID display
  - Lines 981-988: Type display (uses getCouponTypeCode for COUPONs)
  - Lines 989-994: Coupon name display (shows secretCode)

### 2. Remove the Coupon ID Field Block
- Delete the div block at lines 975-980 that shows 'Coupon ID' when `promo.promotionType === 'COUPON'`
- This block currently displays:
  ```jsx
  <div className="flex justify-between">
    <span className="text-gray-500">
      {promo.promotionType === 'COUPON' ? 'Coupon ID' : 'Promo ID'}
    </span>
    <span className="text-gray-900 font-mono">{promo.promotionId}</span>
  </div>
  ```
- The non-COUPON 'Promo ID' display should be preserved

### 3. Update the Coupon Name Field
- Modify the Coupon name display block (lines 989-994) to show combined format
- Change from showing `promo.secretCode` to showing `getCouponTypeCode(promo.promotionId, order?.couponCodes) + ' | ' + promo.promotionId`
- The new display should look like: `CPN9 | AUTOAPPLY`

### 4. Preserve Non-Coupon Promo ID Display
- Ensure that for non-COUPON promotions, the 'Promo ID' field still displays correctly
- The 'Promo ID' field should remain for promotions where `promo.promotionType !== 'COUPON'`

### 5. Validate with Build and Test
- Run `pnpm build` to ensure no TypeScript errors
- Test with order W1156251121946800 which has AUTOAPPLY coupon
- Verify the display shows only Type and Coupon name fields for COUPONs

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm build` - Ensure no TypeScript compilation errors
- `pnpm dev` - Start dev server and navigate to order W1156251121946800 Items tab to visually verify:
  - COUPON promotions show exactly TWO fields: Type and Coupon name
  - Type field shows extracted code (e.g., 'CPN9')
  - Coupon name field shows combined format (e.g., 'CPN9 | AUTOAPPLY')
  - Non-COUPON promotions still show Promo ID, Type, and Code fields correctly

## Notes
- The `getCouponTypeCode` function is already defined at lines 68-83 of order-detail-view.tsx
- The function extracts the type code from the coupon's description field (format: 'TYPE|NAME')
- Order W1156251121946800 in mock data has the AUTOAPPLY coupon with description 'CPN9|AUTOAPPLY'
- If `getCouponTypeCode` returns 'COUPON' (fallback), the Coupon name will display as 'COUPON | AUTOAPPLY'
