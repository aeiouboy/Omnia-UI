# Chore: Enhance Order Line Item Coupon Detail Display to Match MAO Structure

## Metadata
adw_id: `69df16f1`
prompt: `Enhance order line item coupon detail display to match MAO structure. Current implementation in src/components/order-detail-view.tsx lines 948-961 shows 'Promo ID' and 'Type' labels. Changes needed: 1) Change 'Promo ID' label to 'Coupon ID' and map to new field couponId (sample value: 'AUTOAPPLY'), 2) Change 'Type' label to 'Coupon Name' and map to new field couponName (sample value: 'CPN9|AUTOAPPLY'), 3) Keep 'Discount' field as-is showing negative amount like ฿-0.86. Update the promotions interface in src/components/order-management-hub.tsx lines 125-130 to add optional couponId and couponName fields. Update mock data in src/lib/mock-data.ts to include sample couponId='AUTOAPPLY' and couponName='CPN9|AUTOAPPLY' values for MAO order W1156251121946800 items. Display logic: show couponId if available, fallback to promotionId; show couponName if available, fallback to promotionType. Reference MAO screenshot at .playwright-mcp/mao-order-coupons-dialog.png showing Code: AUTOAPPLY and Coupon name: CPN9|AUTOAPPLY structure.`

## Chore Description
Update the order line item coupon/promotion display in the order detail view to align with the MAO (Manhattan Active Omni) coupons dialog structure. The MAO system displays coupon information as:
- **Code**: AUTOAPPLY (the coupon code/identifier)
- **Coupon name**: CPN9|AUTOAPPLY (coupon type combined with code)

The current Omnia-UI implementation shows generic "Promo ID" and "Type" labels. This chore updates the UI labels and data mappings to:
1. Display "Coupon ID" instead of "Promo ID" - showing the coupon code (e.g., AUTOAPPLY)
2. Display "Coupon Name" instead of "Type" - showing the combined coupon name (e.g., CPN9|AUTOAPPLY)
3. Maintain backward compatibility with fallback to existing fields when new fields unavailable

## Relevant Files
Use these files to complete the chore:

- **src/components/order-management-hub.tsx** (lines 125-130): Contains the `promotions` interface definition that defines the structure of promotion/coupon objects used throughout the application. Needs new optional `couponId` and `couponName` fields.

- **src/components/order-detail-view.tsx** (lines 948-961): Contains the Promotions & Coupons section UI that displays promotion details for each order line item. Current labels "Promo ID" and "Type" need to be changed to "Coupon ID" and "Coupon Name" with updated field mappings.

- **src/lib/mock-data.ts**: Contains the mock order data including the MAO order W1156251121946800. The Betagro Egg Tofu items (lines 2820-2832) already have `secretCode: 'AUTOAPPLY'` and `couponType: 'CPN9'`. These need to be mapped to the new `couponId` and `couponName` fields.

- **.playwright-mcp/mao-order-coupons-dialog.png**: Reference screenshot showing the MAO coupons dialog with "Code: AUTOAPPLY" and "Coupon name: CPN9|AUTOAPPLY" structure.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Update Promotions Interface in order-management-hub.tsx
- Locate the `promotions` interface at lines 125-130
- Add optional `couponId?: string` field (maps to MAO "Code" field)
- Add optional `couponName?: string` field (maps to MAO "Coupon name" field)
- Final interface should be:
  ```typescript
  promotions?: {
    discountAmount: number  // Negative value e.g., -0.50
    promotionId: string
    promotionType: string  // Discount, Product Discount Promotion
    secretCode?: string
    couponId?: string      // NEW: Coupon code e.g., 'AUTOAPPLY'
    couponName?: string    // NEW: Coupon name e.g., 'CPN9|AUTOAPPLY'
  }[]
  ```

### 2. Update Mock Data for MAO Order W1156251121946800
- Locate the Betagro Egg Tofu items in `maoOrderW1156251121946800Items` array
- Find the coupon-related promotions (items with `secretCode: 'AUTOAPPLY'` and `couponType: 'CPN9'`)
- Add `couponId: 'AUTOAPPLY'` field to these promotion objects
- Add `couponName: 'CPN9|AUTOAPPLY'` field to these promotion objects
- Update LINE-W115625-002-0 (lines ~2820-2832) promotions array
- Check for other items in the order that may have coupon promotions and update similarly

### 3. Update Display Logic in order-detail-view.tsx
- Locate the Promotions & Coupons section at lines 948-961
- Change "Promo ID" label to "Coupon ID" (line ~955)
- Update field mapping: display `promo.couponId || promo.promotionId`
- Change "Type" label to "Coupon Name" (line ~959)
- Update field mapping: display `promo.couponName || promo.promotionType`
- Keep "Discount" field unchanged showing `฿{promo.discountAmount.toFixed(2)}`
- Ensure the "Code" field (secretCode) display remains if present

### 4. Validate the Changes
- Run `pnpm build` to ensure no TypeScript errors
- Start dev server with `pnpm dev`
- Navigate to order detail for MAO order W1156251121946800
- Expand the Betagro Egg Tofu line item
- Verify the Promotions & Coupons section shows:
  - Coupon ID: AUTOAPPLY
  - Coupon Name: CPN9|AUTOAPPLY
  - Discount: ฿-0.86 (or actual value)

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm build` - Verify no TypeScript compilation errors with new interface fields
- `pnpm dev` - Start development server for manual verification
- Navigate to: http://localhost:3000/orders/W1156251121946800 → Items tab → Expand Betagro Egg Tofu item → View Promotions & Coupons section

## Notes
- The existing `secretCode` and `couponType` fields in mock data are preserved for backward compatibility
- The new `couponId` and `couponName` fields are explicitly added to match MAO terminology
- Display logic uses fallback pattern (`couponId || promotionId`) to handle both old and new data formats
- The MAO screenshot at `.playwright-mcp/mao-order-coupons-dialog.png` shows the expected UI structure with "Code" and "Coupon name" fields
- Order-level coupon codes at `maoOrderW1156251121946800.couponCodes` already have `code` and `description` fields which align with this naming convention
